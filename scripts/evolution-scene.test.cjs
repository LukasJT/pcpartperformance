'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const sceneUI = require('./evolution-scene.js');
const build = require('./evolution-scene.cjs');
const motionSource = fs.readFileSync(path.join(__dirname, 'evolution-scene-motion.js'), 'utf8').replace('export function createCameraMotion', 'function createCameraMotion');
const context = vm.createContext({}); vm.runInContext(motionSource, context);
const createCameraMotion = context.createCameraMotion;
const copy = value => JSON.parse(JSON.stringify(value));

function motionFixture() {
  let value = { position: [0, 0, 0], target: [0, 0, 0] }, time = 0, reduced = false, scheduled = 0;
  const motion = createCameraMotion({ read: () => copy(value), apply: next => { value = copy(next); }, invalidate: () => { scheduled++; }, now: () => time, reduced: () => reduced });
  return { motion, value: () => value, setTime: next => { time = next; }, reduce: () => { reduced = true; }, scheduled: () => scheduled };
}
test('camera movement interpolates both position and target, then stops at the exact requested view', () => {
  const h = motionFixture(), to = { position: [10, 5, -2], target: [1, 2, 3] };
  assert.equal(h.motion.move(to), true); assert.deepEqual(h.value().position, [0, 0, 0]);
  assert.equal(h.motion.step(140), true);
  assert.deepEqual(h.value(), { position: [8.75, 4.375, -1.75], target: [.875, 1.75, 2.625] });
  assert.equal(h.motion.step(280), false); assert.deepEqual(h.value(), to); assert.equal(h.motion.active(), false);
});
test('reduced motion applies a camera change immediately without a running interpolation', () => {
  const h = motionFixture(); h.reduce(); h.motion.move({ position: [1, 2, 3], target: [4, 5, 6] });
  assert.deepEqual(h.value(), { position: [1, 2, 3], target: [4, 5, 6] }); assert.equal(h.motion.active(), false);
});
test('cancel leaves the visitor camera where it is and finish commits only a valid destination', () => {
  const h = motionFixture(); h.motion.move({ position: [8, 0, 0], target: [0, 0, 0] }); h.motion.step(140); h.motion.cancel();
  const previous = copy(h.value()); assert.equal(h.motion.step(280), false); assert.deepEqual(h.value(), previous);
  h.motion.move({ position: [1, 1, 1], target: [0, 1, 0] }); h.motion.finish(); assert.deepEqual(h.value(), { position: [1, 1, 1], target: [0, 1, 0] });
  assert.equal(h.motion.move({ position: [NaN, 1, 1], target: [0, 0, 0] }), false);
});
test('camera destinations are copied and negative clock differences cannot extrapolate', () => {
  const h = motionFixture(), value = { position: [1, 2, 3], target: [0, 0, 0] }; h.motion.move(value); value.position[0] = 999;
  h.motion.step(-20); assert.deepEqual(h.value().position, [0, 0, 0]); h.motion.step(280); assert.equal(h.value().position[0], 1);
});
test('turning on reduced motion during a transition ends it on the next step', () => {
  const h = motionFixture(); h.motion.move({ position: [1, 2, 3], target: [0, 0, 0] }); h.reduce();
  assert.equal(h.motion.step(20), false); assert.deepEqual(h.value().position, [1, 2, 3]);
});
test('preview controls never imply loaded, focusable or orbiting graphics without real state', () => {
  const closed = sceneUI.presentation({ phase: 'closed' }); assert.equal(closed.canFocus, false); assert.equal(closed.canOrbit, false); assert.equal(closed.show, false);
  const loading = sceneUI.presentation({ phase: 'loading', busy: true }); assert.equal(loading.canClose, true); assert.equal(loading.canRetry, false); assert.equal(loading.canOrbit, false);
  const error = sceneUI.presentation({ phase: 'error' }); assert.equal(error.canRetry, true); assert.equal(error.canClose, false);
  const ready = sceneUI.presentation({ phase: 'ready', open: true, focusAvailable: true }); assert.equal(ready.canFocus, true); assert.equal(ready.canOrbit, true);
});
test('reduced motion, partial loads and unavailable selections have explicit control semantics', () => {
  const reduced = sceneUI.presentation({ phase: 'ready', open: true, focusAvailable: true, orbit: true, reducedMotion: true }); assert.equal(reduced.canFocus, true); assert.equal(reduced.canOrbit, false); assert.equal(reduced.orbit, false);
  const partial = sceneUI.presentation({ phase: 'partial', open: true }); assert.equal(partial.canRetry, true); assert.equal(partial.canFocus, false);
  const missing = sceneUI.presentation({ phase: 'unavailable' }); assert.equal(missing.canOrbit, false); assert.equal(missing.canFocus, false);
});
test('the builder enhancement is idempotent and keeps renderer downloads behind the existing action', () => {
  const html = '<html><head></head><body><div id="pc-visual"></div></body></html>';
  const once = build.polishHTML(html, '/builder/'); assert.equal(build.polishHTML(once, '/builder/'), once);
  assert(once.includes('/evolution-scene.css')); assert(!once.includes('src="/evolution-scene.js')); assert(!once.includes('build-scene.js')); assert(!once.includes('.glb')); assert(!once.includes('vendor/three'));
  assert(!build.polishHTML(html.replace('</head>', '<script src="/evolution-scene.js" defer></script></head>'), '/builder/').includes('src="/evolution-scene.js'));
  assert.equal(build.polishHTML(html, '/'), html);
});
test('preparation copies only its lightweight adapter, style and lazily imported camera helper', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-evolution-scene-'));
  try {
    fs.mkdirSync(path.join(root, 'builder')); fs.writeFileSync(path.join(root, 'builder/index.html'), '<html><head></head><body><div id="pc-visual"></div></body></html>');
    const result = build.prepare({ root }); assert.equal(result.eager3DEngine, false);
    for (const file of result.assets) assert(fs.existsSync(path.join(root, file)));
    assert(!fs.existsSync(path.join(root, 'vendor')));
  } finally { assert(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep)); fs.rmSync(root, { recursive: true, force: true }); }
});

test('the mounted controls move the existing live status, follow actual bridge state and restore focus on close', () => {
  const nodes = new Map(), listeners = {}, calls = [];
  class Element {
    constructor(id = '') { this.id = id; this.children = []; this.dataset = {}; this.attrs = {}; this.listeners = {}; this.textContent = ''; this.hidden = false; }
    append(...children) { for (const child of children) { if (child.parentElement) child.parentElement.children.splice(child.parentElement.children.indexOf(child), 1); this.children.push(child); child.parentElement = this; } }
    insertBefore(child, before) { if (!before) return this.append(child); const index = this.children.indexOf(before); this.children.splice(index, 0, child); child.parentElement = this; }
    get nextSibling() { const list = this.parentElement?.children || []; return list[list.indexOf(this) + 1] || null; }
    setAttribute(name, value) { this.attrs[name] = value; }
    addEventListener(name, action) { this.listeners[name] = action; }
    querySelector(selector) { return selector === '.scene-intro p' ? intro : null; }
    querySelectorAll() { return []; }
    focus() { calls.push('focus-open'); }
  }
  const visual = new Element('pc-visual'), stage = new Element('scene-stage'), status = new Element('scene-status'), intro = new Element();
  visual.append(stage, status); for (const node of [visual, stage, status, new Element('scene-open')]) nodes.set(node.id, node);
  const document = { getElementById: id => nodes.get(id), createElement: () => new Element(), addEventListener: (name, action) => { listeners[name] = action; } };
  let state = { phase: 'closed' };
  const window = { PCP_SCENE: {
    state: () => state, focus() { calls.push('focus'); }, retry() { calls.push('retry'); },
    orbit(value) { calls.push(['orbit', value]); state.orbit = value; },
    close() { calls.push('close'); state = { phase: 'closed' }; }
  } };
  const mounted = sceneUI.mount({ document, window }); assert.equal(sceneUI.mount({ document, window }), mounted);
  const toolbar = visual.children.find(node => node.className === 'lab-scene-toolbar');
  assert.equal(toolbar.hidden, true); assert.equal(status.parentElement.className, 'lab-scene-feedback');
  const controls = Object.fromEntries(toolbar.children.map(node => [node.dataset.sceneAction, node]));
  state = { phase: 'ready', open: true, focusAvailable: true, view: 'front' }; listeners['pcp:scene-state']();
  assert.equal(controls.focus.disabled, false); assert.equal(controls.orbit.disabled, false);
  controls.focus.listeners.click(); controls.orbit.listeners.click();
  assert.deepEqual(calls.slice(0, 2), ['focus', ['orbit', true]]); assert.equal(controls.orbit.attrs['aria-pressed'], 'true');
  state.reducedMotion = true; listeners['pcp:scene-state'](); assert.equal(controls.orbit.disabled, true); assert.equal(controls.orbit.attrs['aria-pressed'], 'false');
  controls.close.listeners.click(); assert.equal(toolbar.hidden, true); assert.deepEqual(calls.slice(-2), ['close', 'focus-open']);
});

const three = import(pathToFileURL(path.resolve(__dirname, '../dist/vendor/three/build/three.module.min.js')).href);
async function renderer() {
  const Real = await three, state = { clock: 0, frames: new Map(), nextFrame: 0, renders: 0, events: [], pixelRatio: null, documentListeners: {}, observers: [], controls: null };
  const media = { matches: false, addEventListener(name, listener) { this.listener = listener; }, removeEventListener() {} };
  const doc = { hidden: false, documentElement: { dataset: {} }, addEventListener(name, listener) { state.documentListeners[name] = listener; }, removeEventListener() {} };
  class Canvas { constructor() { this.dataset = {}; } addEventListener() {} setAttribute() {} remove() {} }
  class Renderer { constructor() { this.domElement = new Canvas(); this.info = { render: { triangles: 4 } }; } setPixelRatio(value) { state.pixelRatio = value; } setSize() {} render() { state.renders++; } dispose() {} }
  class Controls {
    constructor(camera) { this.camera = camera; this.target = new Real.Vector3(); this.listeners = {}; state.controls = this; }
    listenToKeyEvents() {} addEventListener(name, listener) { this.listeners[name] = listener; }
    update() { this.camera.lookAt(this.target); this.camera.updateMatrixWorld(true); } dispose() {}
  }
  class Loader {
    setMeshoptDecoder() { return this; }
    async loadAsync() { const scene = new Real.Group(); scene.add(new Real.Mesh(new Real.BoxGeometry(.3, .06, .12), new Real.MeshStandardMaterial())); return { scene }; }
  }
  class Resize { observe() {} disconnect() {} }
  class Intersection { constructor(callback) { state.observers.push(callback); } observe() {} disconnect() {} }
  const host = { clientWidth: 640, clientHeight: 440, append(canvas) { state.canvas = canvas; }, dispatchEvent(event) { state.events.push(event); } };
  const context = {
    T: { ...Real, WebGLRenderer: Renderer, PMREMGenerator: class { fromScene() { return { texture: {}, dispose() {} }; } dispose() {} } },
    OrbitControls: Controls, GLTFLoader: Loader, MeshoptDecoder: {}, cloneWithSkeleton: object => object.clone(true),
    performance: { now: () => state.clock }, devicePixelRatio: 2, document: doc, matchMedia: () => media,
    addEventListener(name, listener) { (state.windowListeners ||= {})[name] = listener; }, removeEventListener(name) { delete state.windowListeners[name]; },
    requestAnimationFrame(callback) { const id = ++state.nextFrame; state.frames.set(id, callback); return id; }, cancelAnimationFrame(id) { state.frames.delete(id); },
    ResizeObserver: Resize, IntersectionObserver: Intersection, CustomEvent: class { constructor(type, properties) { this.type = type; this.detail = properties?.detail; } }, host, onSelect() {}
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../dist/build-scene.js'), 'utf8').replace(/^import .*;\r?\n/gm, '').replace('export function createBuildScene', 'function createBuildScene');
  vm.createContext(context); vm.runInContext(motionSource + '\n' + source + '\nglobalThis.api=createBuildScene(host,onSelect);', context);
  const entry = { id: 'exact-gpu', name: 'Exact GPU', slot: 'gpu', index: 0, record: { id: 'exact-gpu', category: 'gpu', model: '/assets/models/exact-gpu.glb', status: 'approximate' } };
  const frame = time => { state.clock = time; const callbacks = [...state.frames.values()]; state.frames.clear(); callbacks.forEach(callback => callback(time)); };
  return { state, api: context.api, doc, media, entry, frame };
}
test('actual renderer focus uses selected part bounds and rejects an absent component', async () => {
  const h = await renderer(); await h.api.update([h.entry]); assert.equal(h.api.canFocus('gpu'), true); assert.equal(h.api.canFocus('cpu'), false);
  assert.equal(h.api.focus('gpu'), true); h.frame(300); assert(Number(h.state.canvas.dataset.cameraDistance) > 0);
  assert.equal(h.api.focus('cpu'), false); h.frame(600); assert.equal(h.state.canvas.dataset.modelCount, '1'); h.api.dispose();
});
test('orbit is opt-in, uses the real controls flag and stops offscreen without resuming itself', async () => {
  const h = await renderer(); assert.equal(h.api.orbit(true), false); await h.api.update([h.entry]); h.frame(0);
  assert.equal(h.api.state().orbit, false); assert.equal(h.api.orbit(true), true); assert.equal(h.state.controls.autoRotate, true);
  h.frame(16); assert(h.state.frames.size > 0);
  h.state.observers[0]([{ isIntersecting: false }]); assert.equal(h.api.state().orbit, false); assert.equal(h.state.frames.size, 0);
  h.state.observers[0]([{ isIntersecting: true }]); h.frame(100); assert.equal(h.api.state().orbit, false); assert.equal(h.state.frames.size, 0); h.api.dispose();
});
test('visibility, reduced motion, pointer interaction and disposal stop optional continuous rendering', async () => {
  const h = await renderer(); await h.api.update([h.entry]); h.frame(0); h.api.orbit(true);
  h.doc.hidden = true; h.state.documentListeners.visibilitychange(); assert.equal(h.state.frames.size, 0); assert.equal(h.api.state().orbit, false);
  h.doc.hidden = false; h.state.documentListeners.visibilitychange(); h.frame(10); h.api.orbit(true);
  h.media.matches = true; h.media.listener(); h.frame(20); assert.equal(h.api.state().orbit, false); assert.equal(h.api.orbit(true), false);
  h.media.matches = false; h.api.orbit(true); h.state.controls.listeners.start(); h.frame(30); assert.equal(h.api.state().orbit, false);
  h.api.orbit(true); h.api.dispose(); assert.equal(h.state.frames.size, 0); assert.equal(h.api.orbit(true), false);
});
test('quality controls change actual renderer resolution, not an invented mesh-quality setting', async () => {
  const h = await renderer(); assert.equal(h.state.pixelRatio, 1.5); h.api.quality(true); assert.equal(h.state.pixelRatio, 1); assert.equal(h.state.canvas.dataset.quality, 'lower-resolution');
  h.api.quality(false); assert.equal(h.state.pixelRatio, 1.5); h.api.dispose();
});
test('manual reduced motion from appearance stops orbit and camera motion, updates state and releases its listener', async () => {
  const h = await renderer(); await h.api.update([h.entry]); h.frame(0); h.api.orbit(true); assert.equal(h.api.state().orbit, true);
  h.doc.documentElement.dataset.motion = 'reduced'; h.state.windowListeners['pcp:appearance'](); h.frame(20);
  assert.equal(h.api.state().orbit, false); assert.equal(h.api.state().reducedMotion, true); assert.equal(h.api.orbit(true), false);
  assert(h.state.events.some(event => event.type === 'scene-preference-state'));
  h.api.view('front'); assert.equal(h.state.canvas.dataset.cameraPosition.split(',')[0] > 0, true);
  h.doc.documentElement.dataset.motion = 'standard'; h.state.windowListeners['pcp:appearance'](); assert.equal(h.api.state().reducedMotion, false); assert.equal(h.api.state().orbit, false);
  h.api.dispose(); assert.equal(h.state.windowListeners['pcp:appearance'], undefined);
});
