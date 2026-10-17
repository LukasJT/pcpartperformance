'use strict';
// Controller and renderer boundaries run in a VM. GPU rendering is mocked;
// camera/bounds/vector operations use the repository's real Three.js module.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { COOLERS } = require('./oct16-cooling-data.cjs');
const library = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../dist/model-library.json'), 'utf8'));
const graphics = library.items.find(record => record.id === 'rtx4080s');
const selectedGpu = { id: graphics.id, name: graphics.name, cat: 'gpu', specs: {} };
const copy = value => JSON.parse(JSON.stringify(value));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));

function controller(selected, options = {}) {
  const nodes = new Map(), listeners = {}, documentListeners = {}, state = { fetches: 0, imports: 0, selected, updates: [], inspections: [], selections: [], disposed: 0, errors: [] };
  class Element {
    constructor(id = '') { this.id = id; this.hidden = false; this.disabled = false; this.checked = false; this.dataset = {}; this.textContent = ''; this.listeners = {}; this.attrs = {}; this.classList = { toggle() {} }; this.html = ''; this.buttons = null; }
    set innerHTML(html) {
      this.html = html; this.buttons = null;
      if (this.id === 'pc-visual') {
        for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) { const node = new Element(match[1]); node.hidden = /\shidden(?:\s|>)/.test(match[0]); nodes.set(match[1], node); }
        nodes.set('scene-intro', new Element('scene-intro'));
      }
    }
    get innerHTML() { return this.html; }
    addEventListener(name, listener) { this.listeners[name] = listener; }
    setAttribute(name, value) { this.attrs[name] = value; }
    querySelector(selector) { return selector === '.scene-intro' ? nodes.get('scene-intro') : null; }
    querySelectorAll(selector) {
      if (!this.buttons) this.buttons = [...this.html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(match => {
        const id = match[1].match(/\bid="([^"]+)"/)?.[1], node = id ? nodes.get(id) || new Element(id) : new Element();
        for (const data of match[1].matchAll(/data-([a-z-]+)="([^"]+)"/g)) node.dataset[data[1].replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = data[2];
        return node;
      });
      if (selector === 'button') return this.buttons;
      const attribute = selector.match(/^\[data-([a-z-]+)\]$/)?.[1]?.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      return attribute ? this.buttons.filter(button => button.dataset[attribute] !== undefined) : [];
    }
  }
  for (const id of ['pc-visual', 'pc-visual-count', 'pc-visual-status']) nodes.set(id, new Element(id));
  const defaultScene = { async update(entries) { state.updates.push(entries); return { rendered: entries.filter(entry => entry.record?.model && !entry.record.standaloneOnly && entry.slot !== 'cooler').length, failed: [], loadMs: 1 }; }, async inspect(entry) { state.inspections.push(entry);return { rendered: 1, isolated: true, failed: [], loadMs: 1 }; }, select(slot) { state.selections.push(slot); }, dispose() { state.disposed++; }, explode() {}, sidePanel() {}, quality() {}, view() {}, rotate() {}, zoom() {} };
  const currentScene = options.scene || defaultScene;
  const context = { console: { error: (...args) => state.errors.push(args) }, performance: { getEntriesByType: () => [] },
    document: { body: { dataset: {} }, getElementById: id => nodes.get(id) || null, querySelector: selector => selector === '.scene-intro' ? nodes.get('scene-intro') : null, querySelectorAll: () => [], addEventListener: (name, listener) => { documentListeners[name] = listener; } },
    window: { addEventListener: (name, listener) => { listeners[name] = listener; } },
    escapeHTML: value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])),
    buildSlotDefs: ['gpu', 'cpu', 'board', 'case', 'cooler'].map(id => ({ id })), buildInstances: slot => state.selected.filter(part => part.cat === slot).map(part => ({ part })), partPlacement: () => ({ fit: true }), fanPlacement() {}, analyzeBuild: () => ({}), renderPCVisual() {}, pendingVisualAction: null,
    fetch: async () => { state.fetches++; return options.fetch ? options.fetch(state.fetches) : { ok: true, json: async () => ({ items: options.items || [] }) }; },
    fixtureImport: async () => { state.imports++; return { createBuildScene: () => currentScene }; } };
  let source = fs.readFileSync(path.resolve(__dirname, '../dist/assembly-3d.js'), 'utf8');
  assert.equal((source.match(/await import\('\/build-scene\.js\?[^']+'\)/g) || []).length, 1);
  // Replace only the dynamic module boundary. The real controller logic runs.
  source = source.replace(/await import\('\/build-scene\.js\?[^']+'\)/, 'await fixtureImport()');
  vm.createContext(context); vm.runInContext(source, context);
  return { nodes, state, context, listeners, documentListeners, scene: currentScene };
}

test('a selected no-model cooler is inspectable before loading, with no automatic renderer download', () => {
  const h = controller([COOLERS[0]]);
  assert.match(h.nodes.get('scene-components').innerHTML, /data-scene-slot="cooler"/);
  assert.match(h.nodes.get('scene-inspector').innerHTML, /No 3D model or placement is available/);
  assert.match(h.nodes.get('scene-inspector').innerHTML, /NH-D15 G2/);
  assert.equal(h.nodes.get('pc-visual-count').textContent, '1 part selected');
  assert.equal(h.state.fetches, 0);
  assert.equal(h.state.imports, 0);
});

test('opening only unavailable coolers checks coverage without importing Three or a replacement GPU', async () => {
  const h = controller([COOLERS[0]], { items: [{ id: COOLERS[0].id, category: 'cooler', status: 'missing', model: null }] });
  await h.nodes.get('scene-open').onclick();
  assert.equal(h.state.fetches, 1);
  assert.equal(h.state.imports, 0);
  assert.match(h.nodes.get('scene-status').textContent, /No 3D model is available/);
  assert.equal(h.nodes.get('scene-stage').hidden, true);
  assert.equal(h.nodes.get('scene-controls').hidden, true);
  assert.equal(h.nodes.get('scene-open').disabled, false);
  assert.equal(h.state.selected[0].id, COOLERS[0].id);
});

test('a same-ID record from the wrong category is never borrowed for a cooler', async () => {
  const h = controller([COOLERS[0]], { items: [{ ...graphics, id: COOLERS[0].id }] });
  await h.nodes.get('scene-open').onclick();
  assert.equal(h.state.imports, 0);
  assert.match(h.nodes.get('scene-inspector').innerHTML, /No 3D model or placement/);
  assert.doesNotMatch(h.nodes.get('scene-inspector').innerHTML, /3D creator credits/);
});

test('valid existing graphics remain available alongside a no-model cooler and its inspector', async () => {
  const h = controller([selectedGpu, COOLERS[0]], { items: [graphics] });
  await h.nodes.get('scene-open').onclick();
  assert.equal(h.state.imports, 1);
  assert.equal(h.nodes.get('scene-stage').hidden, false);
  assert.match(h.nodes.get('scene-status').textContent, /1 object shown · 1 selected part has no 3D view/);
  assert.match(h.nodes.get('scene-inspector').innerHTML, /Related-variant appearance/);
  const button = h.nodes.get('scene-components').querySelectorAll('button').find(row => row.dataset.sceneSlot === 'cooler');
  button.onclick();
  assert.match(h.nodes.get('scene-inspector').innerHTML, /No 3D model or placement/);
  assert.equal(h.state.selected.length, 2);
});

test('model-catalog failure is recoverable and does not clear component selections', async () => {
  const h = controller([selectedGpu], { fetch: async count => count === 1 ? { ok: false } : { ok: true, json: async () => ({ items: [graphics] }) } });
  await h.nodes.get('scene-open').onclick();
  assert.match(h.nodes.get('scene-status').textContent, /could not start/);
  assert.equal(h.nodes.get('scene-open').disabled, false);
  await h.nodes.get('scene-open').onclick();
  assert.equal(h.state.fetches, 2);
  assert.equal(h.state.imports, 1);
  assert.equal(h.state.selected[0].id, selectedGpu.id);
});

test('invalid or duplicate model catalogs cannot initialize a misleading renderer', async () => {
  for (const items of [[{ id: 'bad', category: 'gpu', model: 'https://unreviewed.invalid/other.glb' }], [graphics, copy(graphics)]]) {
    const h = controller([selectedGpu], { items });
    await h.nodes.get('scene-open').onclick();
    assert.equal(h.state.imports, 0);
    assert.match(h.nodes.get('scene-status').textContent, /could not start/);
    assert.equal(h.nodes.get('scene-open').disabled, false);
  }
});

test('leaving while coverage downloads cancels the pending graphics initialization', async () => {
  const pending = deferred(), h = controller([selectedGpu], { fetch: () => pending.promise });
  const opening = h.nodes.get('scene-open').onclick();
  h.listeners.pagehide();
  pending.resolve({ ok: true, json: async () => ({ items: [graphics] }) });
  await opening;
  assert.equal(h.state.imports, 0);
  assert.equal(h.nodes.get('scene-stage').hidden, true);
  assert.equal(h.nodes.get('scene-open').disabled, false);
  assert.match(h.nodes.get('scene-status').textContent, /Reopen/);
});

test('an update rejection shows recovery controls instead of an unhandled rejection', async () => {
  const scene = { update: async () => { throw Error('fixture GPU update failed'); }, select() {}, dispose() {}, explode() {}, sidePanel() {}, quality() {} };
  const h = controller([selectedGpu], { items: [graphics], scene });
  await h.nodes.get('scene-open').onclick();
  assert.match(h.nodes.get('scene-status').textContent, /could not update/);
  assert.equal(h.nodes.get('scene-retry-assets').hidden, false);
  assert.equal(h.state.errors.length, 1);
  h.context.renderPCVisual({});
  await tick();
  assert.equal(h.state.errors.length, 2);
  assert.equal(h.state.selected.length, 1);
});

test('a disposed scene is not selected after its asynchronous update finishes', async () => {
  const pending = deferred(); let disposed = 0, selectedAfterDispose = 0;
  const scene = { update: () => pending.promise, select() { if (disposed) selectedAfterDispose++; }, dispose() { disposed++; }, explode() {}, sidePanel() {}, quality() {} };
  const h = controller([selectedGpu], { items: [graphics], scene });
  const opening = h.nodes.get('scene-open').onclick();
  await tick();
  h.listeners.pagehide();pending.resolve({ rendered: 1, failed: [], loadMs: 1 });await opening;
  assert.equal(disposed, 1);
  assert.equal(selectedAfterDispose, 0);
  assert.equal(h.nodes.get('scene-stage').hidden, true);
});

const three = import(pathToFileURL(path.resolve(__dirname, '../dist/vendor/three/build/three.module.min.js')).href);
async function rendererHarness(options = {}) {
  const Real = await three, state = { loads: [], renders: [], clones: [], removed: false };
  class Canvas {
    constructor() { this.dataset = {}; this.listeners = {}; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    setAttribute() {}
    remove() { state.removed = true; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 342, height: 330 }; }
  }
  class Renderer {
    constructor() { this.domElement = new Canvas(); this.info = { render: { triangles: 0 } }; }
    setPixelRatio() {}
    setSize() {}
    render(scene, camera) { state.renders.push({ scene, camera }); }
    dispose() {}
  }
  class Controls {
    constructor(camera) { this.camera = camera; this.target = new Real.Vector3();state.camera = camera; }
    listenToKeyEvents() {}
    addEventListener() {}
    update() { this.camera.lookAt(this.target); this.camera.updateMatrixWorld(true); }
    dispose() {}
  }
  function template() { const group = new Real.Group(); group.add(new Real.Mesh(new Real.BoxGeometry(.3, .06, .12), new Real.MeshStandardMaterial())); return { scene: group }; }
  class Loader {
    constructor(manager) { this.manager = manager; }
    setMeshoptDecoder() { return this; }
    async loadAsync(url) { state.loads.push(url); return options.load ? options.load(url, template, this.manager) : template(); }
  }
  class Observer { observe() {} disconnect() {} }
  const host = { clientWidth: options.width || 342, clientHeight: options.height || 330, append(canvas) { state.canvas = canvas; }, dispatchEvent() {} };
  const T = { ...Real, WebGLRenderer: Renderer, PMREMGenerator: class { fromScene() { return { texture: {}, dispose() {} }; } dispose() {} } };
  const context = { T, OrbitControls: Controls, GLTFLoader: Loader, MeshoptDecoder: {}, cloneWithSkeleton: object => { const clone = object.clone(true);state.clones.push(clone);return clone; },
    devicePixelRatio: 2, document: { hidden: false, addEventListener() {}, removeEventListener() {} }, performance: { now: () => Date.now() }, ResizeObserver: Observer, IntersectionObserver: Observer, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, CustomEvent: class {}, host, onSelect() {} };
  let source = fs.readFileSync(path.resolve(__dirname, '../dist/build-scene.js'), 'utf8').replace(/^import .*;\r?\n/gm, '').replace('export function createBuildScene', 'function createBuildScene');
  vm.createContext(context);vm.runInContext(source + '\nglobalThis.sceneAPI=createBuildScene(host,onSelect);', context);
  return { state, api: context.sceneAPI };
}
const entry = record => ({ id: record.id, name: record.name || record.id, slot: record.category, index: 0, record });

test('all twelve cooler selections stay unloaded without a substitute model', async () => {
  const h = await rendererHarness();
  const result = await h.api.update(COOLERS.map(part => ({ id: part.id, name: part.name, slot: 'cooler', index: 0, record: { id: part.id, category: 'cooler', model: null } })));
  assert.equal(result.rendered, 0);
  assert.equal(result.failed.length, 0);
  assert.equal(h.state.loads.length, 0);
  h.api.dispose();
});

test('an unsupported category with an attached model is reported unplaced before loading', async () => {
  const h = await rendererHarness(), record = { id: COOLERS[0].id, name: COOLERS[0].name, category: 'cooler', model: graphics.model };
  const result = await h.api.update([entry(record)]);
  assert.equal(result.rendered, 0);
  assert.equal(result.unplaced[0].id, record.id);
  assert.match(result.unplaced[0].reason, /No 3D placement/);
  assert.equal(h.state.loads.length, 0);
  h.api.dispose();
});

test('renderer independently rejects wrong identities, categories and external model paths', async () => {
  const h = await rendererHarness();
  for (const mutation of [{ id: 'different-card' }, { category: 'cpu' }, { model: 'https://unreviewed.invalid/other.glb' }]) {
    const selection = entry(graphics);selection.record = { ...graphics, ...mutation };
    const result = await h.api.update([selection]);
    assert.equal(result.rendered, 0);
    assert.equal(result.unplaced.length, 1);
  }
  assert.equal(h.state.loads.length, 0);
  h.api.dispose();
});

test('existing GPU geometry still loads alongside a missing cooler and remains finite', async () => {
  const h = await rendererHarness();
  const result = await h.api.update([entry(graphics), { id: COOLERS[0].id, name: COOLERS[0].name, slot: 'cooler', index: 0 }]);
  assert.equal(result.rendered, 1);
  assert.equal(result.failed.length, 0);
  assert.equal(h.state.loads[0], graphics.model);
  assert.equal(h.state.canvas.dataset.modelCount, '1');
  assert.ok(Number.isFinite(Number(h.state.canvas.dataset.cameraDistance)));
  assert.ok(h.state.canvas.dataset.boundsSize.split(',').every(value => Number.isFinite(Number(value))));
  h.api.view('front');h.api.view('side');h.api.rotate(1);h.api.zoom(.85);h.api.quality(true);h.api.explode(true);h.api.sidePanel(true);
  h.api.dispose();assert.equal(h.state.removed, true);
});

test('failed asset cache entries retry without clearing the selected identity', async () => {
  let tries = 0;
  const h = await rendererHarness({ load: async (url, template) => { if (++tries === 1) throw Error('fixture failed GLB'); return template(); } });
  const selection = entry(graphics), first = await h.api.update([selection]);
  assert.equal(first.rendered, 0);assert.equal(first.failed[0], graphics.name);
  const retry = await h.api.update([selection]);
  assert.equal(retry.rendered, 1);assert.equal(retry.failed.length, 0);
  assert.equal(selection.id, graphics.id);assert.equal(tries, 2);
  h.api.dispose();
});

test('model completion after disposal cannot reinstall objects in a closed preview', async () => {
  const pending = deferred();let makeTemplate;
  const h = await rendererHarness({ load: (url, template) => { makeTemplate = template; return pending.promise; } });
  const updating = h.api.update([entry(graphics)]);
  h.api.dispose();pending.resolve(makeTemplate());
  const result = await updating;
  assert.equal(result.stale, true);
  assert.equal(h.state.removed, true);
});

test('all existing downloaded mappings retain their model path and creator license records', () => {
  const original = require('./sketchfab-models.json');
  assert.equal(original.length, 105);
  for (const source of original) {
    const record = library.items.find(item => item.id === source.id);
    assert.equal(record.status, 'community');
    assert.equal(record.model, '/assets/models/' + source.asset);
    assert.deepEqual(record.attribution, source);
    assert.ok(record.attribution?.creator, record.id);
    assert.ok(record.attribution?.license, record.id);
    assert.match(record.model, /^\/assets\/models\/[a-zA-Z0-9_.-]+\.glb$/);
  }
});

const completion = require('./completion-models-data.cjs');
const completionRecord = id => {
  const model = completion.MODEL_ADDITIONS.find(item => item.id === id);
  return { id, name: id, category: model.category, model: '/assets/models/' + model.asset, status: 'community', identity: model.identity, dimensionsMm: null, standaloneOnly: true, scaleMode: 'uniform-autoframe', appearance: model.appearance, caveats: model.caveats, attribution: model };
};

test('the downloaded cooler opens explicitly in an individual inspector and returns to the build layout', async () => {
  const part = completion.CATALOG_ADDITIONS.find(item => item.id === 'cooler-amd-wraith-stealth'), record = completionRecord(part.id);
  const h = controller([part], { items: [record] });
  assert.equal(h.state.fetches, 0);assert.equal(h.state.imports, 0);
  assert.match(h.nodes.get('scene-inspector').innerHTML, /View part in 3D/);
  await h.nodes.get('scene-open').onclick();
  assert.equal(h.state.imports, 1);assert.equal(h.state.inspections.length, 1);assert.equal(h.state.updates.length, 0);
  assert.equal(h.state.inspections[0].id, part.id);assert.equal(h.nodes.get('scene-build-view').hidden, false);
  assert.equal(h.nodes.get('scene-explode').disabled, true);assert.equal(h.nodes.get('scene-panel').disabled, true);
  assert.match(h.nodes.get('scene-status').textContent, /AMD Wraith Stealth/);
  assert.match(h.nodes.get('scene-inspector').innerHTML, /not positioned inside the assembled PC/);
  h.nodes.get('scene-build-view').onclick();await tick();
  assert.equal(h.state.updates.length, 1);assert.equal(h.nodes.get('scene-build-view').hidden, true);
  assert.equal(h.state.selected[0].id, part.id);
});

test('selected GPU, CPU, board and case have a working individual-view button before any asset download', async () => {
  for (const id of ['titanrtx', 'completion-cpu-intel-core-i5-661', 'retail-msi-meg-z590-ace-gold-edition', 'retail-corsair-carbide-200r-black']) {
    const record = completionRecord(id), part = { id, name: id, cat: record.category, specs: {} }, h = controller([part], { items: [record] });
    assert.equal(h.state.fetches, 0);assert.equal(h.state.imports, 0);
    const button = h.nodes.get('scene-inspector').querySelectorAll('[data-scene-part]')[0];assert.ok(button, id);
    await button.onclick();assert.equal(h.state.inspections[0].id, id);assert.equal(h.state.imports, 1);
    assert.match(h.nodes.get('scene-inspector').innerHTML, /3D creator credits/);
  }
});

test('the completion subfolder is allowed while external, traversal and deeper model paths remain blocked', async () => {
  const valid = completionRecord('titanrtx'), part = { id: valid.id, name: valid.id, cat: 'gpu', specs: {} };
  for (const model of ['/assets/models/completion/../../other.glb', '/assets/models/completion/extra/file.glb', '/assets/models/other/file.glb', '/assets/models/completion/file.glb?other=1', 'https://external.invalid/file.glb']) {
    const h = controller([part], { items: [{ ...valid, model }] });await h.nodes.get('scene-open').onclick();assert.equal(h.state.imports, 0);assert.match(h.nodes.get('scene-status').textContent, /could not start/);
  }
});

test('new source scenes cannot be put into the assembled layout or loaded as a different selection', async () => {
  const h = await rendererHarness(), record = completionRecord('retail-gigabyte-trx40-aorus-xtreme-rev-1-0');
  const layout = await h.api.update([entry(record)]);assert.equal(layout.rendered, 0);assert.match(layout.unplaced[0].reason, /opens individually/);assert.equal(h.state.loads.length, 0);
  const wrong = entry(record);wrong.id = 'different-board';const rejected = await h.api.inspect(wrong);assert.equal(rejected.rendered, 0);assert.equal(h.state.loads.length, 0);
  h.api.dispose();
});

test('individual model framing preserves authored XYZ proportions instead of the GPU fallback envelope', async () => {
  const h = await rendererHarness(), record = completionRecord('cooler-amd-wraith-stealth');
  const result = await h.api.inspect(entry(record));assert.equal(result.rendered, 1);assert.equal(result.isolated, true);
  const size = h.state.canvas.dataset.boundsSize.split(',').map(Number);
  assert.equal(size[0], .32);assert.equal(size[1], .064);assert.equal(size[2], .128);
  assert.equal(size[0] / size[1], 5);assert.equal(size[2] / size[1], 2);
  assert.equal(h.state.canvas.dataset.mode, 'part');assert.equal(h.state.canvas.dataset.modelId, record.id);
  for (const view of ['front', 'side', 'angled']) { h.api.view(view);assert.ok(Number(h.state.canvas.dataset.cameraDistance) > 0); }
  h.api.explode(true);h.api.sidePanel(false);h.api.rotate(1);h.api.zoom(.85);h.api.quality(true);
  assert.equal(h.state.canvas.dataset.boundsSize, '0.320000,0.064000,0.128000');
  h.api.dispose();
});

test('a failed standalone asset clears the former part and retries without removing the selected item', async () => {
  let fail = true;
  const first = completionRecord('titanrtx'), second = completionRecord('cooler-amd-wraith-stealth');
  const h = await rendererHarness({ load: async (url, template) => { if (url === second.model && fail) { fail = false;throw Error('model request failed'); }return template(); } });
  await h.api.inspect(entry(first));assert.equal(h.state.canvas.dataset.modelId, first.id);
  const failed = await h.api.inspect(entry(second));assert.equal(failed.rendered, 0);assert.equal(failed.failed[0], second.id);
  assert.equal(h.state.canvas.dataset.modelCount, '0');assert.equal(h.state.canvas.dataset.modelId, undefined);
  const retry = await h.api.inspect(entry(second));assert.equal(retry.rendered, 1);assert.equal(h.state.canvas.dataset.modelId, second.id);
  assert.equal(h.state.loads.filter(url => url === second.model).length, 2);h.api.dispose();
});

test('a pending individual-view load cannot reopen a disposed scene', async () => {
  const pending = deferred();let makeTemplate;
  const h = await rendererHarness({ load: (url, template) => { makeTemplate = template;return pending.promise; } });
  const opening = h.api.inspect(entry(completionRecord('titanrtx')));h.api.dispose();pending.resolve(makeTemplate());
  const result = await opening;assert.equal(result.stale, true);assert.equal(h.state.removed, true);assert.equal(h.state.canvas.dataset.modelCount, '0');
});

test('silently dropped image resources reject an incomplete model and are retryable', async () => {
  let tries = 0;
  const h = await rendererHarness({ load: async (url, template, manager) => { if (++tries === 1) manager.itemError('blob:fixture-texture-blocked');return template(); } });
  const selected = entry(completionRecord('titanrtx')), failed = await h.api.inspect(selected);
  assert.equal(failed.rendered, 0);assert.equal(failed.failed[0], selected.name);assert.equal(h.state.canvas.dataset.modelCount, '0');assert.equal(h.state.canvas.dataset.boundTextureCount, '0');
  const retried = await h.api.inspect(selected);assert.equal(retried.rendered, 1);assert.equal(tries, 2);h.api.dispose();
});

test('standalone appearances keep authored material emission and expose actually bound textures', async () => {
  const Real = await three;
  const h = await rendererHarness({ load: async (url, template) => { const source = template();source.scene.children[0].material.emissive.setHex(0x452100);source.scene.children[0].material.emissiveIntensity = .07;source.scene.children[0].material.map = new Real.Texture();return source; } });
  await h.api.inspect(entry(completionRecord('titanrtx')));
  const materials = [];h.state.clones[0].traverse(mesh => { if (mesh.isMesh) materials.push(mesh.material); });
  assert.ok(materials.length);for (const material of materials) { assert.equal(material.emissive.getHex(), 0x452100);assert.equal(material.emissiveIntensity, .07); }
  assert.equal(h.state.canvas.dataset.boundTextureCount, '1');h.api.select('gpu');
  for (const material of materials) assert.equal(material.emissive.getHex(), 0x452100);
  h.api.dispose();
});

test('all ten actual source bounding envelopes fit the standalone camera with padding, including flat i5-661', async () => {
  const Real = await three, validation = require('../docs/master-completion/models/validation.json');
  let checked = 0;
  for (const asset of validation.assets) for (const [width, height] of [[1084, 438], [342, 300], [640, 440]]) {
    const sourceMin = new Real.Vector3(...asset.bounds.min), sourceMax = new Real.Vector3(...asset.bounds.max), sourceSize = sourceMax.clone().sub(sourceMin), sourceCenter = sourceMax.clone().add(sourceMin).multiplyScalar(.5);
    const h = await rendererHarness({ width, height, load: async () => { const group = new Real.Group(), mesh = new Real.Mesh(new Real.BoxGeometry(...sourceSize.toArray()), new Real.MeshStandardMaterial());mesh.position.copy(sourceCenter);group.add(mesh);return { scene: group }; } });
    const result = await h.api.inspect(entry(completionRecord(asset.id)));assert.equal(result.rendered, 1);
    for (const view of ['angled', 'front', 'side']) {
      h.api.view(view);const size = h.state.canvas.dataset.boundsSize.split(',').map(Number), center = h.state.canvas.dataset.boundsCenter.split(',').map(Number);
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
        const projected = new Real.Vector3(center[0] + x * size[0] / 2, center[1] + y * size[1] / 2, center[2] + z * size[2] / 2).project(h.state.camera);
        assert.ok(Math.abs(projected.x) < .85 && Math.abs(projected.y) < .85 && projected.z > -1 && projected.z < 1, JSON.stringify({ id: asset.id, width, height, view, projected: projected.toArray() }));
      }
      checked++;
    }
    h.api.dispose();
  }
  assert.equal(checked, 90);
});
