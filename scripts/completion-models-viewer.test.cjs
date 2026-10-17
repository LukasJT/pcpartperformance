'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const defer = () => { let resolve, reject;const promise = new Promise((yes, no) => { resolve = yes;reject = no; });return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));

function viewer(options = {}) {
  const state = { imports: 0, created: 0, disposed: 0, inspections: [], actions: [], errors: [], focuses: 0 }, windowListeners = {};
  let document;
  class Element {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase();this.dataset = {};this.children = [];this.listeners = {};this.attrs = {};this.hidden = false;this.disabled = false;this.textContent = ''; }
    append(...children) { for (const child of children) { this.children.push(child);child.parent = this; } }
    replaceChildren() { this.children = []; }
    setAttribute(key, value) { this.attrs[key] = value; }
    addEventListener(key, value) { this.listeners[key] = value; }
    closest() { return section; }
    querySelector(selector) { return selector === '.part-model-stage' ? stage : selector === 'h2' ? heading : selector === 'canvas' ? this.children.find(child => child.tagName === 'CANVAS') || null : null; }
    focus() { document.activeElement = this;state.focuses++; }
  }
  const section = new Element('section'), button = new Element('button'), stage = new Element('div'), heading = new Element('h2');stage.hidden = true;heading.textContent = 'See TITAN RTX in 3D';
  button.dataset = { model: options.path || '/assets/models/completion/nvidia-titan-rtx.glb', modelId: 'titanrtx', modelCategory: 'gpu', modelName: 'TITAN RTX' };
  if (options.legacy) { delete button.dataset.modelId;delete button.dataset.modelCategory;delete button.dataset.modelName; }
  section.append(button, stage, heading);
  document = { activeElement: options.focused === false ? null : button, querySelectorAll: selector => selector === '.part-model-open' ? [button] : [], createElement: tag => new Element(tag) };
  const module = { createBuildScene(host) {
    state.created++;if (options.create) return options.create(host);
    host.append(new Element('canvas'));
    return { async inspect(entry) { state.inspections.push(entry);return options.inspect ? options.inspect(entry, state.inspections.length) : { rendered: 1, failed: [], isolated: true }; }, dispose() { state.disposed++;host.replaceChildren(); }, view(value) { state.actions.push(['view', value]); }, rotate(value) { state.actions.push(['rotate', value]); }, zoom(value) { state.actions.push(['zoom', value]); } };
  } };
  let source = fs.readFileSync(path.resolve(__dirname, '../dist/part-model.js'), 'utf8');
  assert.doesNotMatch(source, /^import\s.*from\s/m);assert.equal((source.match(/import\('\/build-scene\.js\?[^']+'\)/g) || []).length, 1);
  source = source.replace(/import\('\/build-scene\.js\?[^']+'\)/, 'fixtureImport()');
  const context = { document, window: { addEventListener: (key, value) => { windowListeners[key] = value; } }, console: { error: (...values) => state.errors.push(values) }, fixtureImport: () => { state.imports++;return options.importer ? options.importer(module, state.imports) : Promise.resolve(module); } };
  vm.createContext(context);vm.runInContext(source, context);
  const controls = section.children.find(child => child.className === 'part-model-controls'), status = section.children.find(child => child.className === 'part-model-status');
  return { state, button, stage, controls, status, document, windowListeners, control: label => controls.children.find(child => child.textContent === label) };
}

test('product pages keep the renderer and model unloaded until the explicit 3D action', async () => {
  const h = viewer();assert.equal(h.state.imports, 0);assert.equal(h.state.created, 0);assert.equal(h.stage.hidden, true);assert.equal(h.controls.hidden, true);
  await h.button.listeners.click();assert.equal(h.state.imports, 1);assert.equal(h.state.created, 1);
  assert.equal(h.button.hidden, true);assert.equal(h.stage.hidden, false);assert.equal(h.stage.attrs['aria-busy'], 'false');
  assert.equal(h.state.inspections[0].id, 'titanrtx');assert.equal(h.state.inspections[0].record.scaleMode, 'uniform-autoframe');assert.equal(h.state.inspections[0].record.dimensionsMm, null);
  assert.equal(h.status.attrs.role, 'status');assert.match(h.status.textContent, /does not certify physical fit/);assert.equal(h.document.activeElement.tagName, 'CANVAS');
});

test('view, rotate and zoom controls work without mouse dragging, and closing restores focus', async () => {
  const h = viewer();await h.button.listeners.click();
  for (const label of ['Reset', 'Front', 'Side', 'Rotate left', 'Rotate right', 'Zoom in', 'Zoom out']) { assert.equal(h.control(label).disabled, false);h.control(label).listeners.click(); }
  assert.deepEqual(h.state.actions, [['view', 'angled'], ['view', 'front'], ['view', 'side'], ['rotate', -1], ['rotate', 1], ['zoom', .85], ['zoom', 1.15]]);
  h.control('Close 3D view').listeners.click();assert.equal(h.state.disposed, 1);assert.equal(h.stage.hidden, true);assert.equal(h.button.hidden, false);assert.equal(h.document.activeElement, h.button);
  await h.button.listeners.click();assert.equal(h.state.imports, 1);assert.equal(h.state.created, 2);
});

test('closing during a module download prevents a late canvas from reopening', async () => {
  const pending = defer();let loaded;
  const h = viewer({ importer: module => { loaded = module;return pending.promise; } });const opening = h.button.listeners.click();
  assert.equal(h.controls.hidden, false);assert.equal(h.control('Close 3D view').disabled, false);assert.equal(h.control('Rotate left').disabled, true);
  h.control('Close 3D view').listeners.click();pending.resolve(loaded);await opening;
  assert.equal(h.state.created, 0);assert.equal(h.stage.hidden, true);assert.equal(h.button.hidden, false);assert.equal(h.button.disabled, false);
});

test('a failed module download can be retried and does not disable the product page', async () => {
  const h = viewer({ importer: (module, count) => count === 1 ? Promise.reject(Error('module unavailable')) : Promise.resolve(module) });
  await h.button.listeners.click();assert.match(h.status.textContent, /could not load/);assert.equal(h.button.disabled, false);assert.equal(h.stage.hidden, true);
  await h.button.listeners.click();assert.equal(h.state.imports, 2);assert.equal(h.state.created, 1);assert.equal(h.button.hidden, true);
});

test('model-file failures dispose the failed graphics context and allow a real retry', async () => {
  const h = viewer({ inspect: (entry, count) => count === 1 ? { rendered: 0, failed: ['TITAN RTX'] } : { rendered: 1, failed: [] } });
  await h.button.listeners.click();assert.equal(h.state.disposed, 1);assert.equal(h.stage.hidden, true);assert.equal(h.button.hidden, false);
  await h.button.listeners.click();assert.equal(h.state.created, 2);assert.equal(h.state.inspections.length, 2);assert.equal(h.button.hidden, true);
});

test('external, traversal and unexpected nested model URLs are rejected before importing the renderer', async () => {
  for (const path of ['https://untrusted.invalid/model.glb', '/assets/models/completion/../../private.glb', '/assets/models/a/b.glb', '/assets/models/completion/a/b.glb', '/assets/models/part.glb?token=secret']) {
    const h = viewer({ path });await h.button.listeners.click();assert.equal(h.state.imports, 0);assert.equal(h.state.created, 0);assert.match(h.status.textContent, /unavailable/);assert.equal(h.button.disabled, false);
  }
});

test('old peripheral markup continues to work with the same local asset path', async () => {
  const h = viewer({ legacy: true, path: '/assets/models/existing-mouse.glb' });await h.button.listeners.click();
  assert.equal(h.state.inspections[0].record.model, '/assets/models/existing-mouse.glb');assert.equal(h.state.inspections[0].record.standaloneOnly, true);assert.equal(h.button.hidden, true);
});

test('page leave and graphics-context loss both release resources without losing product information', async () => {
  const h = viewer();await h.button.listeners.click();h.stage.listeners['scene-failed']();assert.equal(h.state.disposed, 1);assert.match(h.status.textContent, /connection was lost/);
  await h.button.listeners.click();h.windowListeners.pagehide();assert.equal(h.state.disposed, 2);assert.equal(h.stage.hidden, true);assert.equal(h.button.disabled, false);
});

test('loading completion does not steal focus after a visitor moved to another control', async () => {
  const pending = defer(), h = viewer({ inspect: () => pending.promise });const opening = h.button.listeners.click();await tick();
  const other = {};h.document.activeElement = other;pending.resolve({ rendered: 1, failed: [] });await opening;
  assert.equal(h.document.activeElement, other);assert.equal(h.state.focuses, 0);
});
