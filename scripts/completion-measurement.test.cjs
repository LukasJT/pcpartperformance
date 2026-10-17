'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const measurement = require('./completion-measurement.js');
const prepare = require('./completion-measurement.cjs');
const rules = require('./compatibility-evidence.cjs');
const program = require('./builder-program.js');
const workspace = require('./oct16-workspace.js');
const core = require('./growth-search-core.cjs');
const catalog = [{ id: 'cpu-private-a', cat: 'cpu', brand: 'Maker', name: 'CPU A' }, { id: 'gpu-private-a', cat: 'gpu', brand: 'Maker', name: 'GPU A' }];
const parts = (selected = {}) => Object.fromEntries(measurement.firstSelectionTracker ? rules.SLOTS.map(slot => [slot, [...(selected[slot] || [])]]) : []);
const copy = value => JSON.parse(JSON.stringify(value));
const revision = (id, selected = { cpu: [catalog[0].id] }) => ({ ...rules.normalizeRevision({ parts: selected, name: 'Private saved name', region: 'CA', manualItems: [{ id: 'manual-private', name: 'Private invoice', kind: 'other', quantity: 1, amount: 20, region: 'CA', owned: false }] }, catalog).revision, id });
const tick = () => new Promise(resolve => setImmediate(resolve));
let passed = 0;
async function test(name, run) { await run(); passed++; console.log('PASS ' + name); }
function analytics(options = {}) {
  const events = [], win = {}, context = { window: win, Date };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/program-events.js'), 'utf8'), context);
  if (options.adapter !== false) win.PCP_ANALYTICS = { enabled: options.enabled ?? true, consentGranted: options.consent ?? true, send(name, params) { if (options.throwing) throw Error('Synthetic adapter failure'); events.push({ name, params: copy(params) }); } };
  return { win, events };
}
function eventDoc() {
  const listeners = new Map(), nodes = new Map(), doc = { documentElement: { dataset: { region: 'CA' } }, body: { append() {} }, nodes, listeners,
    addEventListener(type, action, capture) { const values = listeners.get(type) || []; values.push({ action, capture }); listeners.set(type, values); },
    dispatchEvent(event) { for (const entry of listeners.get(event.type) || []) entry.action(event); }, querySelector(selector) { return nodes.get(selector) || null; }, querySelectorAll() { return []; } };
  return doc;
}
const clickTarget = matches => ({ closest(selector) { return matches[selector] || null; } });
function fields() { return new Proxy({}, { get(target, name) { if (!Object.hasOwn(target, name)) target[name] = stubNode(); return target[name]; } }); }
function stubNode() { return { value: '', textContent: '', innerHTML: '', hidden: false, disabled: false, dataset: {}, elements: fields(), listeners: {},
  addEventListener(type, action) { (this.listeners[type] ||= []).push(action); }, async fire(type, target = this) { for (const action of this.listeners[type] || []) await action({ type, target, currentTarget: this, preventDefault() {} }); }, querySelector() { return stubNode(); }, querySelectorAll() { return []; }, append() {}, reset() {}, focus() { this.focused = true; }, hasAttribute() { return false; } }; }
function memory(initial = {}) { const values = new Map(Object.entries(initial)); return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; }
async function builderFixture({ restored = 'saved-private', throwing = false } = {}) {
  const a = analytics(), doc = eventDoc(), store = memory({ [program.STORAGE_KEY]: JSON.stringify({ schema: 1, revisions: [revision('saved-private')] }) });
  doc.readyState = 'complete'; doc.activeElement = null;
  doc.querySelector = selector => { if (selector === '[data-budget-lab]') return null; if (!doc.nodes.has(selector)) doc.nodes.set(selector, stubNode()); return doc.nodes.get(selector); };
  let selected = parts({ cpu: [catalog[0].id] });
  const bridge = { catalog: () => catalog, snapshot: () => ({ parts: copy(selected), fans: [] }), setLocks() {}, load(value) { selected = parts(value.parts); doc.dispatchEvent({ type: 'pcp:build-state', detail: this.snapshot() }); return this.snapshot(); } };
  a.win.PCP_BUILD = bridge; a.win.localStorage = store; a.win.PCP_MEASUREMENT = { event(name, params) { if (throwing) throw Error('Synthetic hook failure'); return measurement.event(name, params, a.win); } };
  const location = { href: 'https://example.test/builder/' + (restored ? '?restore=' + restored : ''), origin: 'https://example.test' };
  const context = { window: a.win, document: doc, PCP_BUILD_RULES: rules, location, URL, TextEncoder, Intl, console, history: { replaceState(state, unused, value) { location.href = String(value); } }, CustomEvent: class { constructor(type, properties) { this.type = type; Object.assign(this, properties); } }, fetch: async () => ({ ok: false }), setTimeout() {}, setInterval() {}, navigator: {}, FormData: class {}, Blob };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'builder-program.js'), 'utf8'), context); await tick();
  return { ...a, doc, store, bridge, location, context };
}
function workspaceFixture({ failWrite = false, throwing = false } = {}) {
  const a = analytics(), nodes = new Map(), get = key => { if (!nodes.has(key)) nodes.set(key, stubNode()); return nodes.get(key); }, host = get('host');
  const store = memory({ [program.STORAGE_KEY]: JSON.stringify({ schema: 1, revisions: [revision('saved-a'), revision('saved-b')] }) });
  host.querySelector = get; host.querySelectorAll = () => [];
  for (const name of ['note']) get('[data-workspace-notes]').elements[name] = get('[data-workspace-notes] [name="' + name + '"]');
  for (const name of ['region']) get('[data-workspace-quote]').elements[name] = get('[data-workspace-quote] [name="' + name + '"]');
  const doc = { querySelector(selector) { if (selector === '[data-my-pc]') return host; if (selector === '#workspace-catalog') return { textContent: JSON.stringify({ schema: 1, catalog, aliases: {} }) }; return null; }, addEventListener() {}, activeElement: null };
  const adapter = { event(name, params) { if (throwing) throw Error('Synthetic optional hook failure'); return measurement.event(name, params, a.win); } };
  const controller = workspace.mount({ document: doc, storage: store, measurement: adapter }); if (failWrite) store.setItem = () => { throw Error('Synthetic storage quota'); };
  return { ...a, get, host, store, controller };
}
function searchFixture() {
  const a = analytics(), doc = { activeElement: null }, output = stubNode(), form = stubNode(), query = stubNode(), status = stubNode();
  form.elements = { q: query }; query.setAttribute = () => {}; output.setAttribute = () => {}; status.setAttribute = () => {};
  let html = '', links = []; Object.defineProperty(output, 'innerHTML', { get: () => html, set(value) { html = value; links = [...value.matchAll(/<a data-search-result-link href="([^"]+)">/g)].map(match => ({ href: match[1], getAttribute: name => name === 'href' ? match[1] : null, closest() { return this; }, focus() { doc.activeElement = this; } })); } });
  output.querySelectorAll = () => links; doc.querySelector = selector => ({ '.growth-site-search': form, '[data-growth-search-results]': output, '[data-growth-search-status]': status })[selector] || null; doc.querySelectorAll = () => [];
  a.win.addEventListener = () => {}; a.win.PCP_MEASUREMENT = { event: (name, params) => measurement.event(name, params, a.win) };
  const location = { href: 'https://example.test/search/?q=RTX5070', search: '?q=RTX5070' }, context = { window: a.win, document: doc, location, URL, URLSearchParams, PCP_SEARCH_CORE: core, history: { replaceState() {} }, setTimeout() {}, clearTimeout() {}, fetch: async () => ({ ok: true, json: async () => [{ title: 'NVIDIA GeForce RTX 5070', url: '/learn/private-product-id.html', kind: 'Hardware specifications' }] }) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'growth-search.js'), 'utf8'), context);
  return { ...a, doc, form, query, output, links: () => links, context };
}
function reportFixture(options = {}) {
  const a = analytics(options), doc = eventDoc(), clicks = [], revoked = [], blobs = [], status = stubNode(), selected = revision('private-build');
  doc.nodes.set('#program-status', status); doc.nodes.set('#readiness-report', {});
  doc.createElement = () => ({ click() { if (options.clickFailure) throw Error('Synthetic click failure'); clicks.push(true); }, remove() {} });
  a.win.Blob = class { constructor(content) { blobs.push(content[0]); if (options.blobFailure) throw Error('Synthetic Blob failure'); } }; a.win.URL = { createObjectURL() { if (options.urlFailure) throw Error('Synthetic URL failure'); return 'blob:local-private'; }, revokeObjectURL: url => revoked.push(url) }; a.win.setTimeout = callback => callback();
  const session = { current: () => selected, report: () => ({ status: 'verification-needed', checks: [], summary: 'Private selected configuration' }), spending: () => ({ manualQuotes: { privateValue: 20 } }) }; a.win.PCP_BUILD_SESSION = session;
  return { ...a, doc, clicks, revoked, blobs, selected, session, status };
}

(async () => {
  await test('no adapter, disabled integration and absent consent emit nothing or queue nothing', () => {
    for (const config of [{ adapter: false }, { enabled: false }, { consent: false }]) { const h = analytics(config); assert.equal(measurement.event('homepage_primary_action', { action: 'build', region: 'CA' }, h.win), false); assert.deepEqual(h.events, []); }
  });
  await test('the existing consented adapter accepts only finite new labels and no private fields', () => {
    const h = analytics(); assert.equal(measurement.event('search_result_selected', { action: 'open', category: 'hardware', region: 'US', query: 'Private query', id: 'private-product-id', url: '/secret', note: 'Private notes', page_type: 'private name' }, h.win), true);
    assert.deepEqual(h.events, [{ name: 'search_result_selected', params: { page_type: 'search', action: 'open', category: 'hardware', region: 'US' } }]);
    for (const [name, params] of [['page_view', { action: 'build' }], ['homepage_primary_action', { action: 'Private name' }], ['builder_first_selection', { action: 'selected', category: 'private-id' }], ['search_result_selected', { action: 'open', category: 'Private query' }]]) assert.equal(measurement.event(name, params, h.win), false);
  });
  await test('duplicate suppression and later consent stay controlled by the existing event gate', () => {
    const h = analytics({ consent: false }); measurement.event('homepage_primary_action', { action: 'build' }, h.win); h.win.PCP_ANALYTICS.consentGranted = true; assert.equal(h.events.length, 0); assert.equal(measurement.event('homepage_primary_action', { action: 'build' }, h.win), true); assert.equal(measurement.event('homepage_primary_action', { action: 'build' }, h.win), false); assert.equal(h.events.length, 1);
  });
  await test('missing and throwing analytics hooks are isolated from reader actions', () => { const h = analytics({ throwing: true }); assert.equal(measurement.event('homepage_primary_action', { action: 'build' }, h.win), false); assert.deepEqual(h.events, []); assert.equal(measurement.event('homepage_primary_action', { action: 'build' }, { PCP_EVENTS: { track() { throw Error('bad hook'); } } }), false); });
  await test('first-selection tracker ignores startup/restores/identical changes/removals and emits once after a real selection', () => {
    const events = [], tracker = measurement.firstSelectionTracker(slot => events.push(slot)), initial = parts({ cpu: ['old-cpu'] }); tracker.observe(initial); tracker.observe(parts({ cpu: ['restored-cpu'] })); assert.deepEqual(events, []);
    tracker.arm('cpu', 'old-cpu', initial); tracker.observe(initial); tracker.arm('cpu', 'old-cpu', initial); tracker.observe(parts()); assert.deepEqual(events, []);
    tracker.arm('cpu', catalog[0].id, initial); assert.equal(tracker.observe(parts({ cpu: [catalog[0].id] })), true); tracker.arm('gpu', catalog[1].id, initial); tracker.observe(parts({ gpu: [catalog[1].id] })); assert.deepEqual(events, ['cpu']);
  });
  await test('an expired/rejected selection cannot be confused with a later restored list', () => { const events = [], tracker = measurement.firstSelectionTracker(slot => events.push(slot)), token = tracker.arm('gpu', 'new-gpu', parts()); tracker.expire(token); tracker.observe(parts({ gpu: ['new-gpu'] })); assert.deepEqual(events, []); assert.equal(tracker.used(), false); });
  await test('module capture observes a committed picker change but not a rejected change or initial event', () => {
    const h = analytics(), doc = eventDoc(), pending = []; let current = parts(); h.win.PCP_BUILD = { snapshot: () => ({ parts: current }) }; h.win.queueMicrotask = callback => pending.push(callback); measurement.mount({ document: doc, window: h.win });
    doc.dispatchEvent({ type: 'pcp:build-state', detail: { parts: current } }); const input = { dataset: { buildPrimary: 'cpu' }, value: catalog[0].id }; doc.dispatchEvent({ type: 'change', target: input }); doc.dispatchEvent({ type: 'pcp:build-state', detail: { parts: current } }); assert.equal(h.events.length, 0);
    doc.dispatchEvent({ type: 'change', target: input }); current = parts({ cpu: [catalog[0].id] }); doc.dispatchEvent({ type: 'pcp:build-state', detail: { parts: current } }); for (const callback of pending) callback(); assert.deepEqual(h.events, [{ name: 'builder_first_selection', params: { page_type: 'builder', action: 'selected', category: 'cpu', region: 'CA' } }]);
  });
  await test('home clicks use the tagged primary intent and never count a page load', () => {
    const h = analytics(), doc = eventDoc(); measurement.mount({ document: doc, window: h.win }); measurement.mount({ document: doc, window: h.win }); assert.equal(h.events.length, 0); const anchor = { dataset: { measureHomeAction: 'upgrade' } }; doc.dispatchEvent({ type: 'click', target: clickTarget({ '[data-measure-home-action]': anchor }), button: 0 }); assert.equal(h.events[0].name, 'homepage_primary_action'); assert.deepEqual(h.events[0].params, { page_type: 'home', action: 'upgrade', region: 'CA' }); assert.equal(doc.listeners.get('click').length, 1);
  });
  await test('explicit report navigation requires an available report; startup and empty reports are excluded', () => {
    const h = reportFixture(); assert.equal(measurement.reportOpened('anchor', { window: h.win, document: h.doc }), true); assert.equal(h.events[0].name, 'build_report_opened'); h.session.report = () => ({ status: 'not-started' }); assert.equal(measurement.reportOpened('section', { window: h.win, document: h.doc }), false); assert.equal(h.events.length, 1);
  });
  await test('download requests and prepared exports are distinct and never claim an on-disk save', () => {
    const h = reportFixture(), before = JSON.stringify(h.selected); assert.deepEqual(measurement.downloadReport({ session: h.session, document: h.doc, window: h.win }), { ok: true }); assert.deepEqual(h.events.map(event => event.name), ['build_report_download_requested', 'build_report_export_created']); assert.equal(h.clicks.length, 1); assert.deepEqual(h.revoked, ['blob:local-private']); assert(h.blobs[0].includes('Private invoice')); assert(!JSON.stringify(h.events).includes('Private')); assert.equal(JSON.stringify(h.selected), before); assert.match(h.status.textContent, /browser handles saving/);
  });
  await test('export failures emit requested and failed, retain the build and clean up URLs', () => {
    for (const option of ['blobFailure', 'urlFailure', 'clickFailure']) { const h = reportFixture({ [option]: true }), before = JSON.stringify(h.selected); assert.deepEqual(measurement.downloadReport({ session: h.session, document: h.doc, window: h.win }), { ok: false }); assert.deepEqual(h.events.map(event => event.name), ['build_report_download_requested', 'build_report_export_failed']); assert.equal(JSON.stringify(h.selected), before); assert.match(h.status.textContent, /unchanged/); if (option === 'clickFailure') assert.equal(h.revoked.length, 1); }
  });
  await test('a missing consent/adapter or throwing adapter never prevents an actual report export', () => {
    for (const config of [{ adapter: false }, { consent: false }, { throwing: true }]) { const h = reportFixture(config); assert.equal(measurement.downloadReport({ session: h.session, document: h.doc, window: h.win }).ok, true); assert.equal(h.clicks.length, 1); assert.deepEqual(h.events, []); }
  });
  await test('real builder restore succeeds before emitting; absent IDs and ordinary initial loads do not', async () => {
    const h = await builderFixture(); assert.deepEqual(h.events.filter(event => event.name === 'build_revision_restored'), [{ name: 'build_revision_restored', params: { page_type: 'builder', action: 'local_link', region: 'CA' } }]); assert.equal(h.win.PCP_BUILD_SESSION.current().manualItems[0].name, 'Private invoice'); assert(!JSON.stringify(h.events).includes('saved-private')); assert(!JSON.stringify(h.events).includes('Private'));
    const absent = await builderFixture({ restored: 'not-on-this-browser' }); assert.equal(absent.events.length, 0); const initial = await builderFixture({ restored: null }); assert.equal(initial.events.length, 0);
  });
  await test('actual Load revision action emits only after applying a known saved record', async () => {
    const h = await builderFixture({ restored: null }), button = { dataset: { revisionLoad: 'saved-private' }, closest() { return this; }, hasAttribute() { return false; } }; h.doc.dispatchEvent({ type: 'click', target: button }); assert.equal(h.events[0].name, 'build_revision_restored'); assert.equal(h.events[0].params.action, 'load_revision'); const unknown = { ...button, dataset: { revisionLoad: 'unknown' } }; h.doc.dispatchEvent({ type: 'click', target: unknown }); assert.equal(h.events.length, 1);
  });
  await test('throwing optional measurement cannot break restoration of a saved revision', async () => { const h = await builderFixture({ throwing: true }); assert.equal(h.win.PCP_BUILD_SESSION.current().manualItems[0].name, 'Private invoice'); assert.equal(h.events.length, 0); });
  await test('actual workspace saves measure successful existing-work actions without note text or IDs', async () => {
    const h = workspaceFixture(); assert.equal(h.events.length, 0); h.get('[data-workspace-notes]').elements.note.value = 'Very private warranty invoice'; await h.get('[data-workspace-notes]').fire('submit'); assert.equal(h.events[0].name, 'saved_work_interaction'); assert.equal(h.events[0].params.action, 'save_notes'); assert(!JSON.stringify(h.events).includes('Very private')); assert(!JSON.stringify(h.events).includes('saved-a')); assert.equal(workspace.loadState(h.store).state.profiles[0].note, 'Very private warranty invoice');
    h.get('[data-workspace-active]').value = 'saved-b'; await h.get('[data-workspace-active]').fire('change'); assert.equal(h.events.at(-1).params.action, 'select_build');
  });
  await test('workspace quota errors, unknown selections and throwing hooks cannot fabricate successful saves', async () => {
    const h = workspaceFixture({ failWrite: true }); h.get('[data-workspace-notes]').elements.note.value = 'Keep unsaved text'; await h.get('[data-workspace-notes]').fire('submit'); assert.equal(h.events.length, 0); assert.equal(h.get('[data-workspace-notes]').elements.note.value, 'Keep unsaved text');
    const unknown = workspaceFixture(); unknown.get('[data-workspace-active]').value = 'not-saved'; await unknown.get('[data-workspace-active]').fire('change'); assert.equal(unknown.events.length, 0);
    const throwing = workspaceFixture({ throwing: true }); throwing.get('[data-workspace-notes]').elements.note.value = 'Saved despite analytics'; await throwing.get('[data-workspace-notes]').fire('submit'); assert.equal(workspace.loadState(throwing.store).state.profiles[0].note, 'Saved despite analytics');
  });
  await test('actual search measures a selected rendered result, never typing, result counts, query text or URL', async () => {
    const h = searchFixture(); await tick(); assert.equal(h.events.length, 0); assert.equal(h.links().length, 1); await h.output.fire('click', h.links()[0]); assert.deepEqual(h.events, [{ name: 'search_result_selected', params: { page_type: 'search', action: 'open', category: 'hardware' } }]); assert(!JSON.stringify(h.events).includes('RTX5070')); assert(!JSON.stringify(h.events).includes('private-product-id'));
    await h.output.fire('click', { closest: () => ({ href: '/not-a-current-result' }) }); assert.equal(h.events.length, 1);
  });
  await test('search navigation remains usable with absent or throwing optional measurement', async () => {
    const h = searchFixture(); await tick(); h.win.PCP_MEASUREMENT = undefined; await h.output.fire('click', h.links()[0]); h.win.PCP_MEASUREMENT = { event() { throw Error('Synthetic optional failure'); } }; await h.output.fire('click', h.links()[0]); assert.equal(h.links()[0].href, '/learn/private-product-id.html'); assert.equal(h.events.length, 0);
  });
  await test('default generator adds zero measurement scripts; explicit opt-in preserves ordering and is reversible', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-measurement-'));
    try {
      const originals = { '': '<head></head><section class="tech-intro"><a href="/builder/">Build</a><a href="/upgrade/">Upgrade</a><a href="/compare/">Compare</a></section>', builder: '<head><script src="/builder-v2.js?v=1" defer></script><script src="/builder-program.js" defer></script></head>', search: '<head><script src="/growth-search.js" defer></script></head>', 'my-pc': '<head><script src="/oct16-workspace.js" defer></script></head>' };
      for (const [route, html] of Object.entries(originals)) { fs.mkdirSync(path.join(root, route), { recursive: true }); fs.writeFileSync(path.join(root, route, 'index.html'), html); }
      assert.equal(prepare({ root }).enabled, false); for (const [route, html] of Object.entries(originals)) assert.equal(fs.readFileSync(path.join(root, route, 'index.html'), 'utf8'), html);
      prepare({ root, enabled: true }); const builder = fs.readFileSync(path.join(root, 'builder/index.html'), 'utf8'), home = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); assert(builder.indexOf('/completion-measurement.js') < builder.indexOf('/builder-v2.js')); assert.equal((home.match(/data-measure-home-action=/g) || []).length, 3); prepare({ root, enabled: true }); assert.equal(fs.readFileSync(path.join(root, 'builder/index.html'), 'utf8'), builder); prepare({ root, enabled: false }); for (const [route, html] of Object.entries(originals)) assert.equal(fs.readFileSync(path.join(root, route, 'index.html'), 'utf8'), html);
    } finally { const resolved = fs.realpathSync(root); assert(resolved.startsWith(fs.realpathSync(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('pcp-measurement-')); fs.rmSync(resolved, { recursive: true }); }
  });
  console.log(passed + ' optional measurement behavior tests passed. Existing consent gate, actual controllers and synthetic DOM fixtures; no active analytics, browser or deployment.');
})().catch(error => { console.error(error); process.exitCode = 1; });
