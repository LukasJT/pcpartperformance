'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const workspace = require('./oct16-workspace.js');
const rules = require('./compatibility-evidence.cjs');
const program = require('./builder-program.js');
const retention = require('./completion-retention.js');
const catalog = [{ id: 'cpu-a', name: 'CPU A', brand: 'AMD', cat: 'cpu' }, { id: 'gpu-a', name: 'GPU A', brand: 'NVIDIA', cat: 'gpu' }, { id: 'gpu-b', name: 'GPU B', brand: 'NVIDIA', cat: 'gpu' }, { id: 'drive-a', name: 'SSD A', brand: 'Samsung', cat: 'ssd' }, { id: 'cooler-a', name: 'Cooler A', brand: 'Noctua', cat: 'cooler' }];
const revision = (id, parts, extra = {}) => ({ ...rules.normalizeRevision({ name: id, parts, ...extra }, catalog).revision, id, ...extra });
const memory = initial => { const values = new Map(Object.entries(initial || {})); return { values, getItem(key) { return values.get(key) || null; }, setItem(key, value) { values.set(key, value); }, removeItem(key) { values.delete(key); } }; };
const profile = (id, extra = {}) => ({ revisionId: id, note: '', journal: [], quotes: [], ...extra });
const observation = (extra = {}) => ({ id: 'cpu-a', region: 'CA', merchantId: 'retailer', merchant: 'Retailer', price: 500, condition: 'new', inStock: true, checkedAt: '2026-10-16T11:00:00Z', expiresAt: '2026-10-17T11:00:00Z', ...extra });
let passed = 0;
async function test(name, run) { await run(); passed++; console.log('PASS ' + name); }

function controllerHarness({ storage = memory(), initialRevisions = [revision('build-a', { cpu: ['cpu-a'], gpu: ['gpu-a'] }), revision('build-b', { cpu: ['cpu-a'], gpu: ['gpu-b'] }, { owned: ['cpu-a'] })], priceClient } = {}) {
  if (initialRevisions && !storage.getItem(program.STORAGE_KEY)) storage.setItem(program.STORAGE_KEY, JSON.stringify({ schema: 1, revisions: initialRevisions }));
  const nodes = new Map(), fields = () => Object.create(null);
  function node(key) {
    if (nodes.has(key)) return nodes.get(key);
    const value = { value: '', checked: false, hidden: false, disabled: false, textContent: '', innerHTML: '', dataset: {}, elements: fields(), listeners: new Map(), files: null, addEventListener(type, handler, options) { const handlers = this.listeners.get(type) || []; handlers.push({ handler, once: options?.once }); this.listeners.set(type, handlers); }, async fire(type, target = this) { for (const entry of [...(this.listeners.get(type) || [])]) { if (entry.once) this.listeners.set(type, this.listeners.get(type).filter(item => item !== entry)); await entry.handler({ preventDefault() {}, currentTarget: this, target }); } }, focus() { value.focused = true; }, reset() { value.wasReset = true; }, hasAttribute(name) { return value.attributes?.has(name) || false; } };
    nodes.set(key, value); return value;
  }
  const selectors = ['[data-workspace-status]', '[data-workspace-storage]', '[data-workspace-builds]', '[data-workspace-comparison]', '[data-workspace-notebook]', '[data-workspace-notebook-empty]', '[data-workspace-active]', '[data-workspace-notes]', '[data-workspace-journal]', '[data-workspace-quote]', '[data-workspace-compare]', '[data-workspace-watch]', '[data-workspace-journal-list]', '[data-workspace-quotes]', '[data-workspace-watchlist]', '[data-workspace-changes]', '[data-workspace-check-status]', '[data-workspace-watch-results]', '[data-workspace-difference]', '[data-workspace-import]', '[data-workspace-dialog]', '[data-workspace-dialog-title]', '[data-workspace-dialog-copy]', '[data-workspace-dialog-confirm]'];
  selectors.forEach(node);
  for (const [form, names] of [['notes', ['note']], ['journal', ['entry']], ['quote', ['label', 'amount', 'quantity', 'owned', 'region']], ['compare', ['before', 'after']], ['watch', ['query']]]) for (const name of names) { const field = node(`[data-workspace-${form}] [name="${name}"]`); node(`[data-workspace-${form}]`).elements[name] = field; }
  for (const name of ['recordId', 'plannedId', 'actualId', 'actualName', 'purchasedQuantity', 'ownedQuantity', 'unitAmount', 'region', 'merchant', 'purchasedOn', 'warrantyUntil', 'warrantyReference', 'remindOn', 'reminderNote', 'reminderDone', 'note']) node('[data-retention-purchase-form]').elements[name] = node(`[data-retention-purchase-form] [name="${name}"]`);
  node('[data-retention-purchase-form]').elements.purchasedQuantity.value = '1'; node('[data-retention-purchase-form]').elements.ownedQuantity.value = '0';
  nodes.set('[data-workspace-notes] textarea', node('[data-workspace-notes] [name="note"]'));
  const dialog = node('[data-workspace-dialog]'); dialog.showModal = () => { dialog.opened = true; }; dialog.close = async value => { dialog.returnValue = value; await dialog.fire('close'); };
  const host = node('host'); host.querySelector = selector => node(selector); host.querySelectorAll = selector => selector === '[data-workspace-compare] select' ? [node('[data-workspace-compare] [name="before"]'), node('[data-workspace-compare] [name="after"]')] : [];
  const document = { activeElement: node('previous-focus'), querySelector(selector) { if (selector === '[data-my-pc]') return host; if (selector === '#workspace-catalog') return { textContent: JSON.stringify({ schema: 1, catalog, aliases: {} }) }; return null; }, addEventListener() {}, body: { append() {} } };
  const controller = workspace.mount({ document, storage, priceClient });
  const button = (data = {}, attribute) => ({ dataset: data, disabled: false, closest() { return this; }, hasAttribute(name) { return name === attribute; } });
  return { storage, nodes, host, document, controller, node, click: (data, attribute) => host.fire('click', button(data, attribute)) };
}

async function main() {
  await test('a workspace round trip retains private text and touches only its own key', () => {
    const storage = memory({ [program.STORAGE_KEY]: 'original-build-data', 'pcp-saved-v1': '["product_gpu-a"]' });
    const state = { ...workspace.blank(), profiles: [profile('build-a', { note: '<img src=x onerror=alert(1)> My private notes', journal: [{ id: 'entry-a', at: '2026-10-16T12:00:00Z', text: 'Purchased the board.' }] })] };
    assert.equal(workspace.saveState(storage, state).ok, true); assert.deepEqual(workspace.loadState(storage).state, state); assert.equal(storage.getItem(program.STORAGE_KEY), 'original-build-data'); assert.equal(storage.getItem('pcp-saved-v1'), '["product_gpu-a"]');
  });
  await test('malformed and future schema data is retained rather than silently reset', () => {
    for (const raw of ['not json', '{"schema":"unknown","version":2}']) { const storage = memory({ [workspace.KEY]: raw }); const loaded = workspace.loadState(storage); assert.equal(loaded.available, false); assert.equal(storage.getItem(workspace.KEY), raw); }
  });
  await test('bounded imports reject oversized UTF-8 payloads and invalid IDs', () => {
    assert.throws(() => workspace.parseState('💻'.repeat(40000)), /too large/);
    assert.throws(() => workspace.parseState({ ...workspace.blank(), watchlist: ['<script>'] }), /invalid/);
    assert.throws(() => workspace.parseState({ ...workspace.blank(), profiles: Array.from({ length: 26 }, (_, index) => profile('build-' + index)) }), /too many/);
    assert.throws(() => workspace.parseState({ ...workspace.blank(), profiles: [profile('build-a', { note: 'x'.repeat(2001) })] }), /invalid/);
  });
  await test('import merges new notebooks without overwriting current notes or importing price claims', () => {
    const current = { ...workspace.blank(), profiles: [profile('build-a', { note: 'Keep this' })], watchlist: ['gpu-a'] };
    const incoming = { ...workspace.blank(), profiles: [profile('build-a', { note: 'Overwrite attempt' }), profile('build-b', { note: 'Imported private note' })], watchlist: ['gpu-b', 'gpu-a'], observations: [observation()] };
    const merged = workspace.mergeState(current, incoming); assert.equal(merged.profiles[0].note, 'Keep this'); assert.equal(merged.profiles[1].note, 'Imported private note'); assert.deepEqual(merged.watchlist, ['gpu-a', 'gpu-b']); assert.deepEqual(merged.observations, []); assert.deepEqual(merged.changes, []);
  });
  await test('duplication preserves exact component quantities, unknown references and future fields', () => {
    const original = { ...revision('build-a', { gpu: ['gpu-a', 'gpu-a'], ssd: ['drive-a'] }), futureOwnedAccessory: { id: 'mount-kit' }, unresolved: [{ slot: 'gpu', id: 'retired-card', reason: 'Needs repair' }] };
    const source = { schema: 1, revisions: [original], futureMetadata: { retained: true } }, storage = memory({ [program.STORAGE_KEY]: JSON.stringify(source) });
    const result = workspace.duplicateRevision(storage, 'build-a', catalog, {}, () => 'copy-a', '2026-10-16T12:00:00Z'); assert.equal(result.ok, true); const saved = JSON.parse(storage.getItem(program.STORAGE_KEY)); assert.deepEqual(saved.revisions[0], original); assert.deepEqual(saved.futureMetadata, { retained: true }); assert.deepEqual(saved.revisions[1].parts.gpu, ['gpu-a', 'gpu-a']); assert.deepEqual(saved.revisions[1].unresolved, original.unresolved); assert.equal(saved.revisions[1].id, 'copy-a'); assert.deepEqual(saved.revisions[1].futureOwnedAccessory, { id: 'mount-kit' });
  });
  await test('duplicate refuses full, unreadable and ID-collision collections without writes', () => {
    const full = JSON.stringify({ schema: 1, revisions: Array.from({ length: 25 }, (_, index) => revision('build-' + index, { gpu: ['gpu-a'] })) }), storage = memory({ [program.STORAGE_KEY]: full }); assert.equal(workspace.duplicateRevision(storage, 'build-0', catalog).ok, false); assert.equal(storage.getItem(program.STORAGE_KEY), full);
    storage.setItem(program.STORAGE_KEY, 'broken'); assert.equal(workspace.duplicateRevision(storage, 'x', catalog).ok, false); assert.equal(storage.getItem(program.STORAGE_KEY), 'broken');
    const raw = JSON.stringify({ schema: 1, revisions: [revision('build-a', { cpu: ['cpu-a'] })] }); storage.setItem(program.STORAGE_KEY, raw); assert.equal(workspace.duplicateRevision(storage, 'build-a', catalog, {}, () => 'build-a').ok, false); assert.equal(storage.getItem(program.STORAGE_KEY), raw);
  });
  await test('a failed duplicate write reports failure without claiming a saved copy', () => {
    const storage = memory({ [program.STORAGE_KEY]: JSON.stringify({ schema: 1, revisions: [revision('build-a', { cpu: ['cpu-a'] })] }) }), original = storage.getItem(program.STORAGE_KEY); storage.setItem = () => { throw Error('quota'); }; assert.equal(workspace.duplicateRevision(storage, 'build-a', catalog, {}, () => 'copy-a').ok, false); assert.equal(storage.getItem(program.STORAGE_KEY), original);
  });
  await test('revision differences account for quantities and ownership separately', () => {
    const before = revision('build-a', { gpu: ['gpu-a', 'gpu-a'], ssd: ['drive-a'] }, { owned: ['gpu-a'] }), after = revision('build-b', { gpu: ['gpu-a', 'gpu-b'], ssd: ['drive-a'] }, { region: 'US', owned: ['drive-a'] }); const result = workspace.diffRevisions(before, after); assert.equal(result.rows.length, 2); assert.deepEqual(result.rows.find(row => row.id === 'gpu-a'), { slot: 'gpu', id: 'gpu-a', before: 2, after: 1 }); assert(result.owned.some(row => row.id === 'gpu-a' && row.after === false)); assert(result.regionChanged); assert.equal(result.unresolvedBefore, 0);
  });
  await test('quote totals keep unknown, owned and regional amounts distinct', () => {
    const quotes = [{ region: 'CA', amount: 20, quantity: 2, owned: false }, { region: 'CA', amount: null, quantity: 1, owned: false }, { region: 'CA', amount: null, quantity: 1, owned: true }, { region: 'US', amount: 100, quantity: 1, owned: false }]; const total = workspace.manualSummary(quotes, 'CA'); assert.equal(total.subtotal, 40); assert.equal(total.missing, 1); assert.equal(total.complete, false); assert.equal(total.owned, 1); assert.equal(workspace.manualSummary(quotes, 'US').subtotal, 100);
  });
  await test('first observed price creates a baseline without fake change events', () => {
    const result = workspace.applyObservations(workspace.blank(), [observation()], Date.parse('2026-10-16T12:00:00Z')); assert.equal(result.captured, 1); assert.equal(result.state.observations.length, 1); assert.equal(result.state.changes.length, 0);
  });
  await test('only newer actual observations record price, stock and condition changes', () => {
    const baseline = workspace.applyObservations(workspace.blank(), [observation()], Date.parse('2026-10-16T12:00:00Z')).state;
    const next = observation({ price: 450, inStock: false, condition: 'unknown', checkedAt: '2026-10-17T11:00:00Z', expiresAt: '2026-10-18T11:00:00Z' }); const result = workspace.applyObservations(baseline, [next], Date.parse('2026-10-17T12:00:00Z')); assert.equal(result.state.changes.length, 3); assert(result.state.changes.some(row => row.kind === 'price' && row.before === '500' && row.after === '450')); assert.equal(workspace.applyObservations(result.state, [next], Date.parse('2026-10-17T12:00:00Z')).captured, 0);
  });
  await test('missing, expired and future observations never fabricate availability or history', () => {
    const now = Date.parse('2026-10-16T12:00:00Z'), state = workspace.blank(); const result = workspace.applyObservations(state, [observation({ expiresAt: '2026-10-16T11:30:00Z' }), observation({ checkedAt: '2026-10-16T13:00:00Z' }), observation({ price: 0 }), observation({ currency: 'wrong', region: 'XX' })], now); assert.equal(result.captured, 0); assert.deepEqual(workspace.applyObservations(state, [], now).state, state);
  });
  await test('hostile imported change values and invalid manual quotes fail validation', () => {
    assert.throws(() => workspace.parseState({ ...workspace.blank(), changes: [{ id: 'gpu-a', kind: 'price', region: 'CA', merchantId: 'retailer', merchant: 'Retailer', beforeAt: '2026-10-16T11:00:00Z', afterAt: '2026-10-16T12:00:00Z', before: '<img>', after: '50' }] }), /invalid/);
    assert.throws(() => workspace.parseState({ ...workspace.blank(), profiles: [profile('build-a', { quotes: [{ id: 'quote-a', label: 'PSU', region: 'CA', amount: -50, quantity: 1, owned: false }] })] }), /invalid/);
  });
  await test('real controller restores existing builds and escapes private notebook rendering', async () => {
    const storage = memory({ [workspace.KEY]: JSON.stringify({ ...workspace.blank(), profiles: [profile('build-a', { note: 'Keep this note', journal: [{ id: 'entry-a', at: '2026-10-16T11:00:00Z', text: '<script>alert(1)</script>' }] })] }) }), h = controllerHarness({ storage });
    assert(h.node('[data-workspace-builds]').innerHTML.includes('build-a')); assert.equal(h.node('[data-workspace-notes] [name="note"]').value, 'Keep this note'); assert(h.node('[data-workspace-journal-list]').innerHTML.includes('&lt;script&gt;')); assert(!h.node('[data-workspace-journal-list]').innerHTML.includes('<script>'));
    const links = h.node('[data-workspace-builds]').innerHTML; assert(links.includes('Open build')); assert(!links.includes('Keep this note'));
    h.node('[data-workspace-notes]').elements.note.value = 'Changed private note'; await h.node('[data-workspace-notes]').fire('submit'); assert.equal(workspace.loadState(storage).state.profiles[0].note, 'Changed private note');
  });
  await test('real controller saves a journal entry, manual unknown price and restores after refresh', async () => {
    const h = controllerHarness(); h.node('[data-workspace-journal]').elements.entry.value = 'Kept my existing SSD.'; await h.node('[data-workspace-journal]').fire('submit');
    const form = h.node('[data-workspace-quote]'); form.elements.label.value = 'Operating system'; form.elements.amount.value = ''; form.elements.quantity.value = '1'; form.elements.region.value = 'CA'; await form.fire('submit');
    const stored = workspace.loadState(h.storage).state; assert.equal(stored.profiles[0].journal[0].text, 'Kept my existing SSD.'); assert.equal(stored.profiles[0].quotes[0].amount, null); const refreshed = controllerHarness({ storage: h.storage }); assert(refreshed.node('[data-workspace-quotes]').innerHTML.includes('Price unknown')); assert(refreshed.node('[data-workspace-journal-list]').innerHTML.includes('Kept my existing SSD.'));
  });
  await test('real controller duplicates a build through the visible operation', async () => { const h = controllerHarness(), original = JSON.parse(h.storage.getItem(program.STORAGE_KEY)).revisions[0]; await h.click({ workspaceDuplicate: 'build-a' }); const saved = JSON.parse(h.storage.getItem(program.STORAGE_KEY)); assert.equal(saved.revisions.length, 3); assert.deepEqual(saved.revisions[0], original); assert(h.node('[data-workspace-status]').textContent.includes('duplicated')); });
  await test('clear confirmation can be cancelled and cannot erase existing builder or saved-product keys', async () => {
    const storage = memory({ [workspace.KEY]: JSON.stringify({ ...workspace.blank(), watchlist: ['gpu-a'] }), 'pcp-saved-v1': '["product_cpu-a"]' }), h = controllerHarness({ storage }); const before = storage.getItem(program.STORAGE_KEY);
    let click = h.click({}, 'data-workspace-clear'); assert(h.node('[data-workspace-dialog]').opened); await h.node('[data-workspace-dialog]').close('cancel'); await click; assert(storage.getItem(workspace.KEY));
    click = h.click({}, 'data-workspace-clear'); await h.node('[data-workspace-dialog]').close('confirm'); await click; assert.equal(storage.getItem(workspace.KEY), null); assert.equal(storage.getItem(program.STORAGE_KEY), before); assert.equal(storage.getItem('pcp-saved-v1'), '["product_cpu-a"]'); assert(h.document.activeElement.focused);
  });
  await test('real controller leaves journal text available when local writes fail', async () => {
    const h = controllerHarness(); h.storage.setItem = () => { throw Error('Storage full'); }; const input = h.node('[data-workspace-journal]').elements.entry; input.value = 'Unsaved private note'; await h.node('[data-workspace-journal]').fire('submit'); assert.equal(input.value, 'Unsaved private note'); assert(h.node('[data-workspace-status]').textContent.includes('Storage full'));
  });
  await test('real import control requires confirmation and preserves the builder collection', async () => {
    const h = controllerHarness(), original = h.storage.getItem(program.STORAGE_KEY), input = h.node('[data-workspace-import]');
    const file = JSON.stringify({ ...workspace.blank(), profiles: [profile('build-a', { note: 'Restored private note' })], observations: [observation()] }); input.files = [{ size: Buffer.byteLength(file), text: async () => file }];
    const pending = input.fire('change'); await new Promise(resolve => setImmediate(resolve)); assert(h.node('[data-workspace-dialog]').opened); assert.equal(h.storage.getItem(workspace.KEY), null); await h.node('[data-workspace-dialog]').close('confirm'); await pending;
    assert.equal(workspace.loadState(h.storage).state.profiles[0].note, 'Restored private note'); assert.equal(workspace.loadState(h.storage).state.observations.length, 0); assert.equal(h.storage.getItem(program.STORAGE_KEY), original);
  });
  await test('real controller records no fake change when the price service fails', async () => {
    const h = controllerHarness({ priceClient: { async refresh() { throw Error('Network blocked'); } } }); await h.click({}, 'data-workspace-check'); assert(h.node('[data-workspace-check-status]').textContent.includes('no new change')); assert.equal(h.controller.getState().changes.length, 0);
  });
  await test('real price control captures an actual supplied observation and creates no first-check change', async () => {
    const now = Date.now(), valid = observation({ productId: 'cpu-a', checkedAt: new Date(now - 1000).toISOString(), expiresAt: new Date(now + 3600000).toISOString() });
    const h = controllerHarness({ priceClient: { async refresh() {}, observationsFor(id, region) { return id === 'cpu-a' && region === 'CA' ? [valid] : []; } } }); await h.click({}, 'data-workspace-check'); assert.equal(h.controller.getState().observations.length, 1); assert.equal(h.controller.getState().changes.length, 0); assert(h.node('[data-workspace-changes]').innerHTML.includes('Recorded')); assert(h.node('[data-workspace-check-status]').textContent.includes('1 current observation'));
  });
  await test('real comparison control shows quantities and keeps manual quotes separate', async () => {
    const h = controllerHarness(), form = h.node('[data-workspace-compare]'); form.elements.before.value = 'build-a'; form.elements.after.value = 'build-b'; await form.fire('submit'); const output = h.node('[data-workspace-difference]').innerHTML; assert(output.includes('Exact component quantity changes')); assert(output.includes('GPU A')); assert(output.includes('manual quotes')); assert(output.includes('No manual quote recorded; cost unknown.')); assert(output.includes('current retailer offers and historical prices are not inferred'));
  });
  await test('cooler and builder manual extras restore locally without leaking their private names into links', async () => {
    const item = { id: 'manual-os', name: 'Private OS purchase quote', kind: 'os', quantity: 1, amount: null, region: 'CA', owned: false };
    const h = controllerHarness({ initialRevisions: [revision('build-a', { cpu: ['cpu-a'], cooler: ['cooler-a'] }, { manualItems: [item], budget: 2500 })] });
    assert(h.node('[data-workspace-builds]').innerHTML.includes('2 components + 1 manual item')); assert(h.node('[data-workspace-quotes]').innerHTML.includes('Private OS purchase quote')); assert(h.node('[data-workspace-quotes]').innerHTML.includes('Price unknown'));
    const link = h.node('[data-workspace-builds]').innerHTML.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&'), url = new URL(link);
    assert.equal(url.searchParams.get('restore'), 'build-a'); assert.equal(url.searchParams.get('build').split(',')[rules.SLOTS.indexOf('cooler')], 'cooler-a'); assert(!link.includes('Private')); assert(!link.includes('2500'));
    await h.click({ workspaceDuplicate: 'build-a' }); assert.deepEqual(JSON.parse(h.storage.getItem(program.STORAGE_KEY)).revisions.at(-1).manualItems, [item]);
  });
  await test('actual acquisition form records a different purchased variant and private dates without altering the plan', async () => {
    const h = controllerHarness(), original = h.storage.getItem(program.STORAGE_KEY), form = h.node('[data-retention-purchase-form]'); form.elements.plannedId.value = 'gpu-a'; await form.elements.plannedId.fire('change'); form.elements.actualId.value = 'gpu-b'; form.elements.purchasedQuantity.value = '1'; form.elements.ownedQuantity.value = '0'; form.elements.unitAmount.value = '350'; form.elements.region.value = 'CA'; form.elements.purchasedOn.value = '2026-10-16'; form.elements.warrantyUntil.value = '2028-10-16'; form.elements.warrantyReference.value = 'PRIVATE-WARRANTY-123'; form.elements.remindOn.value = '2026-10-20'; form.elements.reminderNote.value = 'Inspect return window'; form.elements.note.value = 'Private purchase note'; await form.fire('submit');
    const stored = retention.read(h.storage).state.purchases[0]; assert.equal(stored.actualId, 'gpu-b'); assert.equal(stored.plannedId, 'gpu-a'); assert.equal(stored.warrantyReference, 'PRIVATE-WARRANTY-123'); assert.equal(h.storage.getItem(program.STORAGE_KEY), original); assert(h.node('[data-retention-purchase-plan]').innerHTML.includes('Different model recorded')); const links = h.node('[data-retention-purchase-records]').innerHTML.match(/href="[^"]+"/g) || []; assert(!links.join(' ').includes('PRIVATE')); assert(!links.join(' ').includes('Private')); assert(h.node('[data-retention-reminders]').innerHTML.includes('Inspect return window'));
  });
  await test('owned and new acquisition batches show exact quantities and unknown new spending', async () => {
    const h = controllerHarness({ initialRevisions: [revision('build-a', { gpu: ['gpu-a', 'gpu-a'] }, { owned: ['gpu-a'] })] }), form = h.node('[data-retention-purchase-form]'); form.elements.purchasedQuantity.value = '1'; form.elements.ownedQuantity.value = '1'; form.elements.unitAmount.value = ''; form.elements.region.value = 'CA'; await form.fire('submit');
    assert.equal(retention.read(h.storage).state.purchases[0].ownedQuantity, 1); assert(h.node('[data-retention-purchase-plan]').innerHTML.includes('1 newly bought · 1 already owned')); assert(h.node('[data-retention-purchase-records]').innerHTML.includes('partial subtotal: unknown')); assert(h.node('[data-retention-purchase-records]').innerHTML.includes('ownership review'));
  });
  await test('acquisition quota failures preserve entered private notes and existing records', async () => {
    const h = controllerHarness(), original = h.storage.getItem(program.STORAGE_KEY), form = h.node('[data-retention-purchase-form]'); form.elements.note.value = 'Unsaved private warranty note'; h.storage.setItem = () => { throw Error('Quota full'); }; await form.fire('submit'); assert.equal(form.elements.note.value, 'Unsaved private warranty note'); assert.equal(h.storage.getItem(retention.KEY), null); assert.equal(h.storage.getItem(program.STORAGE_KEY), original); assert(h.node('[data-retention-status]').textContent.includes('Quota full'));
  });
  await test('corrupt retention storage does not prevent editing the original notebook or overwrite bad records', async () => {
    const h = controllerHarness({ storage: memory({ [retention.KEY]: 'original corrupt retention' }) }); h.node('[data-workspace-notes]').elements.note.value = 'Working original notebook'; await h.node('[data-workspace-notes]').fire('submit'); assert.equal(h.controller.getState().profiles[0].note, 'Working original notebook'); await h.node('[data-retention-purchase-form]').fire('submit'); assert.equal(h.storage.getItem(retention.KEY), 'original corrupt retention'); assert(h.node('[data-retention-status]').textContent.includes('unavailable'));
  });
  await test('saved comparison UI restores snapshots safely and only sends product IDs to public URLs', () => {
    const comparison = retention.makeComparison({ parts: [{ ...catalog[1], specs: { Memory: 12 } }, { ...catalog[2], specs: { Memory: 16 } }], name: '<img src=x onerror=alert(1)> Private comparison name', units: { Memory: 'GB' } }); const h = controllerHarness({ storage: memory({ [retention.KEY]: JSON.stringify({ ...retention.blank(), comparisons: [comparison] }) }) }); const html = h.node('[data-retention-comparisons]').innerHTML; assert(html.includes('&lt;img')); assert(!html.includes('<img src=x')); assert(html.includes('Saved differences (1)')); const links = html.match(/href="[^"]+"/g) || []; assert(!links.join(' ').includes('Private')); assert(links.some(value => value.includes('parts=gpu-a%2Cgpu-b')));
  });
  await test('the actual legacy import control leaves acquisition records untouched', async () => {
    const record = retention.putPurchase(retention.blank(), { revisionId: 'build-a', plannedId: 'gpu-a', plannedName: 'GPU A', plannedQuantity: 1, actualId: 'gpu-a', actualName: 'GPU A', purchasedQuantity: 1, ownedQuantity: 0, unitAmount: null, region: 'CA', merchant: '', purchasedOn: null, warrantyUntil: null, warrantyReference: '', remindOn: null, reminderNote: '', reminderDone: false, note: '' }); const storage = memory({ [retention.KEY]: JSON.stringify(record) }), h = controllerHarness({ storage }), original = storage.getItem(retention.KEY), input = h.node('[data-workspace-import]'), file = JSON.stringify(workspace.blank()); input.files = [{ size: file.length, text: async () => file }]; const pending = input.fire('change'); await new Promise(resolve => setImmediate(resolve)); await h.node('[data-workspace-dialog]').close('confirm'); await pending; assert.equal(storage.getItem(retention.KEY), original);
  });
  await test('acquisition editing keeps its identity and restores all private form fields', async () => {
    const h = controllerHarness(), form = h.node('[data-retention-purchase-form]'); form.elements.unitAmount.value = '100'; form.elements.note.value = 'Private acquisition note'; form.elements.warrantyReference.value = 'PRIVATE-REF'; await form.fire('submit'); const row = retention.read(h.storage).state.purchases[0]; await h.click({ retentionPurchaseEdit: row.id }); assert.equal(form.elements.note.value, 'Private acquisition note'); assert.equal(form.elements.warrantyReference.value, 'PRIVATE-REF'); assert.equal(form.elements.recordId.value, row.id); form.elements.unitAmount.value = '125'; await form.fire('submit'); const records = retention.read(h.storage).state.purchases; assert.equal(records.length, 1); assert.equal(records[0].id, row.id); assert.equal(records[0].createdAt, row.createdAt); assert.equal(records[0].unitAmount, 125);
  });
  await test('records whose build is missing remain visible and individually removable', async () => {
    const data = retention.putPurchase(retention.blank(), { revisionId: 'removed-build', plannedId: 'gpu-a', plannedName: 'GPU A', plannedQuantity: 1, actualId: 'gpu-b', actualName: 'GPU B', purchasedQuantity: 1, ownedQuantity: 0, unitAmount: null, region: 'CA', merchant: '', purchasedOn: null, warrantyUntil: null, warrantyReference: '', remindOn: null, reminderNote: '', reminderDone: false, note: '' }), h = controllerHarness({ storage: memory({ [retention.KEY]: JSON.stringify(data) }), initialRevisions: [] }); assert(h.node('[data-retention-comparisons]').innerHTML.includes('Acquisitions waiting for a saved build (1)')); await h.click({ retentionPurchaseRemove: data.purchases[0].id }); assert.equal(retention.read(h.storage).state.purchases.length, 0); assert(!h.node('[data-retention-comparisons]').innerHTML.includes('waiting for a saved build'));
  });
  await test('generator writes crawlable task links, scoped data and a single accessible main heading', () => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-workspace-check-')), root = path.join(temporary, 'dist'); fs.mkdirSync(root, { recursive: true });
    try { let html; const report = require('./oct16-workspace.cjs')({ root, records: [...catalog, { id: 'phone-a', cat: 'phone', name: '</script><script>alert(1)</script>' }], shell: (title, route, body, options) => `<!doctype html><html><head><title>${title}</title><meta name="description" content="${options.description}"></head><body><main>${body}</main></body></html>`, write(route, value) { assert.equal(route, 'my-pc'); html = value; }, esc: value => String(value) }); assert.equal(report.catalogItems, 5); assert.equal((html.match(/<h1[\s>]/g) || []).length, 1); assert(html.includes('href="/builder/"')); assert(html.includes('href="/upgrade/"')); assert(html.includes('aria-labelledby="workspace-dialog-title"')); assert(!html.includes('phone-a')); assert(fs.existsSync(path.join(root, 'oct16-workspace.js'))); const payload = JSON.parse(html.match(/id="workspace-catalog">([\s\S]+?)<\/script>/)[1]); assert.equal(payload.catalog.length, 5); }
    finally { const resolved = path.resolve(temporary); assert(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep)); fs.rmSync(resolved, { recursive: true, force: true }); }
  });
  console.log(passed + ' My PC workspace behavior tests passed. Local synthetic fixtures; no manufacturer testing or price-feed coverage is implied.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
