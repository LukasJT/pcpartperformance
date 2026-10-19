'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const ui = require('./evolution-builder.cjs');
const runtime = require('./evolution-builder.js');
const picker = require('./builder-selectors.js');

test('builder transformation preserves exact anchors, native inputs and evidence, and is idempotent', () => {
  const html = '<html><head></head><body><section id="builder"><nav id="builder-workflow" class="builder-workflow" aria-label="Build your PC in three steps"><a href="#builder-choose"><strong>Parts</strong></a><a href="#build-preview"><strong>3D preview</strong></a><a href="#readiness-report"><strong>Review</strong></a></nav><select data-build-primary="gpu"><option value="sku-exact">Exact GPU</option></select><section id="readiness-report">Unknown price. Needs verification.</section><form id="program-save-form"></form></section></body></html>';
  const result = ui.polish(html, '/builder/');
  assert.equal(ui.polish(result, '/builder/'), result);
  for (const value of ['data-evolution-builder', 'href="#build-preview"', 'href="#readiness-report"', 'value="sku-exact"', 'Unknown price. Needs verification.', 'id="program-save-form"']) assert(result.includes(value), value);
  assert(result.includes('<strong>Choose parts</strong>'));
  assert(result.includes('<strong>Explore build</strong>'));
  assert(result.includes('<strong>Review &amp; save</strong>'));
  assert.equal((result.match(/src="\/evolution-builder.js"/g) || []).length, 1);
  assert.equal(ui.polish(html, '/privacy/'), html);
});

test('preparation copies only scoped assets and does not overwrite existing data', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-evolution-builder-'));
  const existing = path.join(root, 'saved-data.json'); fs.writeFileSync(existing, '{"existing":true}');
  const result = ui.prepare({ root });
  assert.equal(result.assets.length, 5);
  assert.equal(fs.readFileSync(existing, 'utf8'), '{"existing":true}');
  for (const asset of result.assets) assert.equal(fs.readFileSync(path.join(root, asset), 'utf8'), fs.readFileSync(path.join(__dirname, asset.endsWith('.js') ? 'prepared-evolution' : '', asset), 'utf8'));
});

test('prepared controllers have valid fingerprints and preserve their exported behavior', () => {
  const manifest = require('./prepared-evolution/builder-manifest.json');
  for (const name of Object.keys(manifest.files)) {
    const source = fs.readFileSync(path.join(__dirname, name), 'utf8'), output = fs.readFileSync(path.join(__dirname, 'prepared-evolution', name), 'utf8');
    assert.equal(ui.validateRuntime(name, source, output, manifest.files[name]), output);
    assert.throws(() => ui.validateRuntime(name, source + '\n// changed', output, manifest.files[name]), /Stale prepared/);
    assert.throws(() => ui.validateRuntime(name, source, output + 'broken', manifest.files[name]), /Stale prepared/);
  }
  assert.equal(require('./prepared-evolution/evolution-builder.js').stageForHash('#build-revisions'), 'review');
  assert.deepEqual(require('./prepared-evolution/oct16-builder-journey.js').STEPS, require('./oct16-builder-journey.js').STEPS);
  assert.deepEqual(require('./prepared-evolution/builder-workspace.js').selectionSummary({ parts: {} }, []), require('./builder-workspace.js').selectionSummary({ parts: {} }, []));
});

test('deep links select the matching stage, without invalidating original tool anchors', () => {
  for (const hash of ['', '#builder-choose', '#parts-core', '#parts-housing']) assert.equal(runtime.stageForHash(hash), 'parts');
  for (const hash of ['#build-preview', '#scene-open', '#pc-visual']) assert.equal(runtime.stageForHash(hash), 'preview');
  for (const hash of ['#readiness-report', '#readiness-missing', '#build-revisions', '#program-spending', '#program-save-form']) assert.equal(runtime.stageForHash(hash), 'review');
});

test('progress counts selected categories and quantity, never a compatibility percentage', () => {
  assert.deepEqual(runtime.selectionProgress(), { selected: 0, total: 10, count: 0 });
  assert.deepEqual(runtime.selectionProgress({ cpu: ['exact-cpu'], ssd: ['drive-1', 'drive-2'], fan: ['a', 'a', 'a'], unknown: ['bad'], gpu: null }), { selected: 3, total: 10, count: 6 });
  assert.equal(runtime.selectionProgress({ cpu: 'wrong-shape' }).count, 0);
});

test('Skip is outside the product option cursor and preferences preserve an empty native value', () => {
  const rows = [{ id: '', name: 'None' }, { id: 'sku-a', name: 'A' }, { id: 'sku-b', name: 'B' }];
  assert.deepEqual(picker.visibleOptions(rows, true).map(row => row.id), ['sku-a', 'sku-b']);
  assert.deepEqual(picker.visibleOptions(rows, false).map(row => row.id), ['', 'sku-a', 'sku-b']);
  assert.deepEqual(picker.visibleOptions(picker.filterOptions(rows, { selected: 'sku-b' }), true).map(row => row.id), ['sku-b', 'sku-a']);
});

test('every builder category has a distinct non-photographic vector fallback', () => {
  const icons = picker.CATEGORIES.map(([category]) => picker.icon(category));
  assert.equal(new Set(icons).size, picker.CATEGORIES.length);
  for (const icon of icons) { assert(icon.includes('aria-hidden="true"')); assert(!/<image|<script/.test(icon)); }
});

function builderFixture(hash = '') {
  const events = {}, windowEvents = {}, attributes = () => ({ values: {}, setAttribute(name, value) { this.values[name] = value; }, removeAttribute(name) { delete this.values[name]; } });
  const title = { focusCount: 0, focus() { this.focusCount++; } };
  const panel = () => ({ hidden: false, dataset: {}, querySelector() { return title; } });
  const links = ['#builder-choose', '#build-preview', '#readiness-report'].map(hash => ({ ...attributes(), hash }));
  const workflow = { querySelectorAll: () => links, contains: link => links.includes(link) };
  const label = { textContent: '' }, bar = { ...attributes(), value: 0 };
  const progress = { querySelector: selector => selector === 'progress' ? bar : label };
  const panels = { '.builder-parts': panel(), '#build-plan': panel(), '#build-preview': panel(), '#readiness-report': panel(), '#build-status': panel(), '#build-revisions': panel(), '.builder-rail': panel(), '#builder-parts': panel() };
  const nodes = { ...panels, '#builder-workflow': workflow, '.evolution-selection-progress': progress, '#builder-guidance h2': title };
  const builder = { dataset: {}, querySelector: selector => nodes[selector] || null, addEventListener: (name, fn) => { events[name] = fn; } };
  let state = { parts: {} };
  const context = {
    window: { PCP_BUILD: { snapshot: () => state }, addEventListener: (name, fn) => { windowEvents[name] = fn; } },
    document: { readyState: 'complete', querySelector: selector => selector === '[data-evolution-builder]' ? builder : null, addEventListener: (name, fn) => { events[name] = fn; } },
    location: { hash, href: 'https://www.pcpartperformance.com/builder/' + hash, origin: 'https://www.pcpartperformance.com', pathname: '/builder/' },
    history: { pushState() {} }, URL, MutationObserver: class { observe() {} }, queueMicrotask
  };
  vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(__dirname, 'evolution-builder.js'), 'utf8'), context);
  return { builder, panels, links, label, bar, events, windowEvents, context, setState(value) { state = value; } };
}

test('empty builder opens only parts; deep-linked review exposes save controls and back navigation restores parts', () => {
  const empty = builderFixture();
  assert.equal(empty.builder.dataset.evolutionStage, 'parts');
  assert.equal(empty.panels['.builder-parts'].hidden, false);
  assert.equal(empty.panels['.builder-rail'].hidden, true);
  assert.equal(empty.panels['#build-revisions'].hidden, true);
  assert.equal(empty.links[0].values['aria-current'], 'step');
  const review = builderFixture('#build-revisions');
  assert.equal(review.panels['#build-revisions'].hidden, false);
  assert.equal(review.panels['#readiness-report'].hidden, false);
  assert.equal(review.panels['.builder-parts'].hidden, true);
  assert.equal(review.panels['#build-preview'].hidden, true);
  review.context.location.hash = '#builder-choose'; review.windowEvents.popstate();
  assert.equal(review.panels['.builder-parts'].hidden, false);
  assert.equal(review.panels['#build-revisions'].hidden, true);
  review.setState({ parts: { gpu: ['gpu-exact'], ssd: ['a', 'b'] } }); review.events['pcp:build']();
  assert.equal(review.label.textContent, '3 parts selected');
  assert.equal(review.bar.value, 2);
  assert(review.bar.values['aria-valuetext'].includes('not a compatibility score'));
});

function catalogFixture(query = '') {
  const elements = {}, handlers = {}, rows = [
    { id: 'cpu', cat: 'cpu', name: 'Desktop CPU', brand: 'Brand', summary: 'CPU', year: 2025 },
    { id: 'gpu', cat: 'gpu', name: 'Desktop GPU', brand: 'Brand', summary: 'GPU', year: 2026 },
    { id: 'phone', cat: 'phone', name: 'Phone model', brand: 'Brand', summary: 'Phone', year: 2026 },
    { id: 'mouse', cat: 'mouse', name: 'Mouse model', brand: 'Brand', summary: 'Mouse', year: 2026 }
  ];
  function element(id) { return elements[id] ||= { value: id === '#catalog-era' ? 'all' : id === '#catalog-sort' ? 'new' : '', innerHTML: '', addEventListener: (name, fn) => { handlers[id + ':' + name] = fn; } }; }
  const location = { href: 'https://www.pcpartperformance.com/hardware/' + query };
  const context = { catalog: rows, categories: [['cpu', 'Processors'], ['gpu', 'GPUs'], ['phone', 'Phones'], ['mouse', 'Mice']],
    params: new URL(location.href).searchParams, sessionStorage: { getItem: () => null }, selected: [], validIDs: ids => ids, $: element,
    document: { body: { dataset: {} }, addEventListener() {}, querySelectorAll: () => [] }, location, history: { replaceState(_, __, url) { location.href = String(url); } },
    photos: {}, photo: () => '', escapeHTML: value => String(value ?? ''), renderEvent() {}, announce() {}, URL
  };
  const source = fs.readFileSync(path.join(__dirname, '../dist/interface.js'), 'utf8');
  const code = source.slice(source.indexOf("if(page==='hardware'){") + "if(page==='hardware'){".length, source.indexOf('\nfunction enhanceBuilderPhotos()')).replace(/\}\s*$/, '');
  vm.createContext(context); vm.runInContext(code, context);
  return { elements, handlers, context };
}

test('catalog starts with PC components and preserves explicit device, peripheral and all-hardware discovery', () => {
  const pc = catalogFixture();
  assert(pc.elements['#hardware-rows'].innerHTML.includes('Desktop CPU'));
  assert(pc.elements['#hardware-rows'].innerHTML.includes('Desktop GPU'));
  assert(!pc.elements['#hardware-rows'].innerHTML.includes('Phone model'));
  assert(!pc.elements['#hardware-rows'].innerHTML.includes('Mouse model'));
  assert(!new URL(pc.context.location.href).searchParams.has('category'));
  pc.elements['#catalog-category'].value = 'devices'; pc.handlers['#catalog-category:change']();
  assert(pc.elements['#hardware-rows'].innerHTML.includes('Phone model'));
  assert(!pc.elements['#hardware-rows'].innerHTML.includes('Desktop GPU'));
  pc.elements['#catalog-category'].value = 'peripherals'; pc.handlers['#catalog-category:change']();
  assert(pc.elements['#hardware-rows'].innerHTML.includes('Mouse model'));
  assert(!pc.elements['#hardware-rows'].innerHTML.includes('Phone model'));
  const explicit = catalogFixture('?category=all');
  assert(explicit.elements['#hardware-rows'].innerHTML.includes('Phone model'));
  assert(explicit.elements['#hardware-rows'].innerHTML.includes('Desktop GPU'));
  const phone = catalogFixture('?category=phone');
  assert(phone.elements['#hardware-rows'].innerHTML.includes('Phone model'));
  assert.equal(phone.elements['#catalog-category'].value, 'phone');
});

test('style safeguards include touch, virtual keyboard, reduced motion and print behavior', () => {
  const css = fs.readFileSync(path.join(__dirname, 'evolution-builder.css'), 'utf8');
  for (const text of ['--picker-viewport-height', '@media(pointer:coarse)', '@media(prefers-reduced-motion:reduce)', '@media print', '[data-evolution-stage-panel][hidden]', 'env(safe-area-inset-bottom']) assert(css.includes(text));
  const source = fs.readFileSync(path.join(__dirname, 'builder-selectors.js'), 'utf8');
  assert(source.includes('results.focus({ preventScroll: true })'));
  assert(source.includes("window.visualViewport?.addEventListener('resize', updateViewport)"));
  assert(!source.includes('dialog.showModal(); search.focus'));
});
