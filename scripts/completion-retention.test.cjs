'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const retention = require('./completion-retention.js');
const hook = require('./completion-retention-compare.js');
const workspace = require('./oct16-workspace.js');
const now = '2026-10-16T15:00:00Z';
const parts = [{ id: 'gpu-a', cat: 'gpu', name: 'Exact GPU A', brand: 'NVIDIA', source: 'https://example.com/exact-gpu-a', specs: { Memory: 12, 'Board power': 250 } }, { id: 'gpu-b', cat: 'gpu', name: 'Exact GPU B', brand: 'AMD', source: 'https://example.com/exact-gpu-b', specs: { Memory: 16, 'Board power': 0 } }];
const snapshot = (overrides = {}) => ({ parts, units: { Memory: 'GB', 'Board power': 'W' }, onlyDifferences: false, ...overrides });
const memory = initial => { const values = new Map(Object.entries(initial || {})); return { values, getItem(key) { return values.get(key) ?? null; }, setItem(key, value) { values.set(key, value); }, removeItem(key) { values.delete(key); } }; };
const purchase = (overrides = {}) => ({ id: 'purchase-a', revisionId: 'build-a', plannedId: 'gpu-a', plannedName: 'Exact GPU A', plannedQuantity: 2, actualId: 'gpu-a', actualName: 'Exact GPU A', purchasedQuantity: 1, ownedQuantity: 1, unitAmount: null, region: 'CA', merchant: '', purchasedOn: null, warrantyUntil: null, warrantyReference: '', remindOn: null, reminderNote: '', reminderDone: false, note: '', createdAt: now, updatedAt: now, ...overrides });
let tests = 0;
async function test(name, run) { await run(); tests++; console.log('PASS ' + name); }

function hookFixture(storage, initial = snapshot()) {
  let current = initial; const events = new Map(), button = { disabled: false, textContent: '', addEventListener(type, action) { this[type] = action; } }, status = { textContent: '' }, host = { innerHTML: '', querySelector(selector) { return selector === '[data-save-current-comparison]' ? button : status; } };
  const document = { querySelector(selector) { return selector === '[data-completion-compare-save]' ? host : null; }, addEventListener(type, action) { events.set(type, action); } };
  const controller = hook.mount({ document, storage, href: 'https://www.pcpartperformance.com/compare/', getSnapshot: () => current });
  return { controller, button, status, change(value) { current = value; events.get('pcp:render')?.({ detail: { scope: 'comparison' } }); } };
}

(async () => {
  await test('comparison saves are explicit and retain column order and meaningful specifications', () => {
    const storage = memory(), result = retention.saveComparison(storage, snapshot(), now); assert(result.ok); const record = retention.read(storage).state.comparisons[0]; assert.deepEqual(record.parts.map(part => part.id), ['gpu-a', 'gpu-b']); assert.equal(record.savedAt, now); const difference = retention.differences(record).find(row => row.key === 'Memory'); assert.deepEqual(difference.cells.map(cell => cell.value), [12, 16]); assert.equal(difference.cells[0].unit, 'GB'); assert.equal(record.basis, 'saved-catalog-specifications'); assert.equal(record.winner, undefined);
  });
  await test('reversed comparisons update one saved set while preserving the latest chosen order', () => {
    const storage = memory(); const first = retention.saveComparison(storage, snapshot(), now).comparison; const second = retention.saveComparison(storage, snapshot({ parts: [...parts].reverse(), onlyDifferences: true }), '2026-10-17T15:00:00Z').comparison; assert.equal(first.id, second.id); assert.equal(second.savedAt, first.savedAt); assert.deepEqual(second.parts.map(part => part.id), ['gpu-b', 'gpu-a']); assert.equal(second.onlyDifferences, true); assert.equal(retention.read(storage).state.comparisons.length, 1); const url = new URL(retention.comparisonURL(second)); assert.equal(url.searchParams.get('parts'), 'gpu-b,gpu-a'); assert.equal(url.searchParams.get('differences'), '1');
  });
  await test('unknown values remain unknown while a real numeric zero stays zero', () => {
    const comparison = retention.makeComparison(snapshot({ parts: [parts[0], { ...parts[1], specs: { 'Board power': 0 } }] }), now); const memoryRow = retention.differences(comparison).find(row => row.key === 'Memory'), power = retention.differences(comparison).find(row => row.key === 'Board power'); assert.equal(memoryRow.cells[1].value, null); assert.equal(memoryRow.missing, true); assert.equal(power.cells[1].value, 0); assert.equal(power.missing, false);
  });
  await test('different units are shown as a context mismatch without a numeric winner', () => {
    const comparison = retention.makeComparison(snapshot(), now); comparison.parts[1].specs.find(spec => spec.key === 'Memory').unit = 'GiB'; const row = retention.differences(comparison).find(row => row.key === 'Memory'); assert.equal(row.unitsDiffer, true); assert.equal(row.winner, undefined);
  });
  await test('corrupt storage is retained and prevents a false successful comparison save', () => {
    const storage = memory({ [retention.KEY]: 'corrupt original data', [workspace.KEY]: 'private original notes' }); const result = retention.saveComparison(storage, snapshot(), now); assert.equal(result.ok, false); assert.equal(storage.getItem(retention.KEY), 'corrupt original data'); assert.equal(storage.getItem(workspace.KEY), 'private original notes');
  });
  await test('a quota failure preserves the prior valid comparison collection', () => {
    const storage = memory(); assert(retention.saveComparison(storage, snapshot(), now).ok); const original = storage.getItem(retention.KEY); storage.setItem = () => { throw Error('Quota full'); }; const result = retention.saveComparison(storage, snapshot({ name: 'Changed private label' }), '2026-10-17T15:00:00Z'); assert.equal(result.ok, false); assert.equal(storage.getItem(retention.KEY), original);
  });
  await test('the comparison limit never silently evicts older saved work', () => {
    const comparisons = Array.from({ length: retention.MAX_COMPARISONS }, (_, index) => retention.makeComparison(snapshot({ parts: parts.map(part => ({ ...part, id: part.id + '-' + index })) }), now, 'comparison-' + index)); const state = { ...retention.blank(), comparisons }, storage = memory({ [retention.KEY]: JSON.stringify(state) }); assert.equal(retention.saveComparison(storage, snapshot(), now).ok, false); assert.equal(retention.read(storage).state.comparisons.length, retention.MAX_COMPARISONS);
  });
  await test('UTF-8 bounds, duplicate comparison identities and unsafe sources fail validation', () => {
    assert.throws(() => retention.parse('💻'.repeat(70000)), /smaller/); const comparison = retention.makeComparison(snapshot(), now); assert.throws(() => retention.parse({ ...retention.blank(), comparisons: [comparison, { ...comparison, id: 'comparison-copy', parts: [...comparison.parts].reverse() }] }), /duplicate/); comparison.parts[0].source = 'javascript:alert(1)'; assert.throws(() => retention.parse({ ...retention.blank(), comparisons: [comparison] }), /invalid/);
  });
  await test('newly purchased and already-owned quantities never share a fabricated price', () => {
    const rows = [purchase({ unitAmount: 100, purchasedQuantity: 1, ownedQuantity: 2 }), purchase({ id: 'purchase-b', unitAmount: null, purchasedQuantity: 1, ownedQuantity: 0 }), purchase({ id: 'purchase-us', unitAmount: 900, region: 'US', ownedQuantity: 0 })]; const total = retention.purchaseTotals(rows, 'CA'); assert.equal(total.subtotal, 100); assert.equal(total.missing, 1); assert.equal(total.owned, 2); assert.equal(total.purchased, 2); assert.equal(total.complete, false); assert.equal(retention.purchaseTotals(rows, 'US').subtotal, 900);
  });
  await test('recording only owned hardware is distinct from a zero-priced new purchase', () => {
    const owned = retention.purchaseTotals([purchase({ purchasedQuantity: 0, ownedQuantity: 2 })], 'CA'), free = retention.purchaseTotals([purchase({ purchasedQuantity: 1, ownedQuantity: 0, unitAmount: 0 })], 'CA'); assert.equal(owned.purchased, 0); assert.equal(owned.subtotal, 0); assert.equal(free.purchased, 1); assert.equal(free.missing, 0); assert.equal(free.subtotal, 0);
  });
  await test('planned versus acquired counts preserve separate batches and identify a different exact variant', () => {
    const revision = { id: 'build-a', parts: { gpu: ['gpu-a', 'gpu-a'] }, owned: ['gpu-a'] }, original = JSON.stringify(revision); const rows = [purchase({ purchasedQuantity: 0, ownedQuantity: 1 }), purchase({ id: 'purchase-b', actualId: 'gpu-b', actualName: 'Exact GPU B', purchasedQuantity: 1, ownedQuantity: 0 })]; const summary = retention.plannedSummary(revision, rows)[0]; assert.equal(summary.quantity, 2); assert.equal(summary.acquired, 2); assert.equal(summary.remaining, 0); assert.equal(summary.differentModels, true); assert.equal(summary.ownedInPlan, true); assert.equal(JSON.stringify(revision), original);
  });
  await test('excess acquired units are explicit rather than clamped to the plan', () => {
    const summary = retention.plannedSummary({ id: 'build-a', parts: { gpu: ['gpu-a'] } }, [purchase({ purchasedQuantity: 2, ownedQuantity: 1 })])[0]; assert.equal(summary.acquired, 3); assert.equal(summary.extra, 2); assert.equal(summary.remaining, 0);
  });
  await test('manual dates validate actual calendar dates and remind only on the open page', () => {
    assert.equal(retention.dateOnly('2028-02-29'), true); for (const date of ['2027-02-29', '2026-99-99', '2026-02-30', 'tomorrow']) assert.equal(retention.dateOnly(date), false); const row = purchase({ remindOn: '2026-10-16', warrantyUntil: '2028-10-16', warrantyReference: 'PRIVATE-RECEIPT-123' }); assert.equal(retention.reminderState(row, '2026-10-16'), 'today'); assert.equal(retention.reminderState(row, '2026-10-17'), 'overdue'); assert.equal(retention.reminderState({ ...row, reminderDone: true }, '2026-10-17'), 'done'); assert.equal(retention.reminderState({ ...row, remindOn: null }), 'not-set');
  });
  await test('private warranty and journal fields never enter public comparison or builder links', () => {
    const comparison = retention.makeComparison(snapshot({ name: 'Private decision note' }), now), row = purchase({ note: 'Private journal', warrantyReference: 'PRIVATE-123', merchant: 'Private order seller' }); const compare = retention.comparisonURL(comparison), build = retention.buildURL({ ...row, id: row.actualId, cat: 'gpu' }, 2, false); for (const url of [compare, build]) { assert(!url.includes('PRIVATE')); assert(!url.includes('Private')); assert(!url.includes('warranty')); assert(!url.includes('note')); } assert.equal(new URL(build).searchParams.get('build').split(',')[2], 'gpu-a~gpu-a');
  });
  await test('purchase edits retain creation time and reject unknown or negative quantities', () => {
    const state = retention.putPurchase(retention.blank(), purchase(), now); const updated = retention.putPurchase(state, { ...state.purchases[0], note: 'Private edit', purchasedQuantity: 2 }, '2026-10-17T15:00:00Z'); assert.equal(updated.purchases[0].createdAt, now); assert.equal(updated.purchases[0].updatedAt, '2026-10-17T15:00:00Z'); assert.throws(() => retention.putPurchase(state, purchase({ ownedQuantity: -1 }), now), /invalid/); assert.throws(() => retention.putPurchase(state, purchase({ purchasedQuantity: 99, ownedQuantity: 1 }), now), /invalid/); assert.throws(() => retention.putPurchase(state, purchase({ unitAmount: .001 }), now), /invalid/);
  });
  await test('backup merge retains existing record IDs and comparison ordering choices', () => {
    const comparison = retention.makeComparison(snapshot(), now), left = { ...retention.blank(), comparisons: [comparison], purchases: [purchase({ note: 'Keep original' })] }, right = { ...retention.blank(), comparisons: [{ ...comparison, id: 'new-comparison-id', parts: [...comparison.parts].reverse() }], purchases: [purchase({ note: 'Do not overwrite' }), purchase({ id: 'purchase-b' })] }; const merged = retention.merge(left, right); assert.equal(merged.comparisons.length, 1); assert.deepEqual(merged.comparisons[0].parts.map(part => part.id), ['gpu-a', 'gpu-b']); assert.equal(merged.purchases[0].note, 'Keep original'); assert.equal(merged.purchases.length, 2);
  });
  await test('legacy notebook exports remain readable and cannot erase new retention data', () => {
    const legacy = workspace.blank(), parsed = workspace.parseBackup(JSON.stringify(legacy)); assert.equal(parsed.includesRetention, false); const storage = memory({ [retention.KEY]: JSON.stringify({ ...retention.blank(), purchases: [purchase()] }) }), before = storage.getItem(retention.KEY); assert(workspace.commitStores(storage, legacy, null).ok); assert.equal(storage.getItem(retention.KEY), before);
  });
  await test('old and current backups accept a UTF-8 BOM without weakening their schema validation', () => {
    assert.equal(workspace.parseBackup('\uFEFF' + JSON.stringify(workspace.blank())).includesRetention, false); assert.deepEqual(retention.parse('\uFEFF' + JSON.stringify(retention.blank())), retention.blank()); assert.throws(() => workspace.parseBackup('\uFEFF{"schema":"future-private-export"}'), /backup/);
  });
  await test('combined backups preserve private records while original build revisions stay separate', () => {
    const records = { ...retention.blank(), comparisons: [retention.makeComparison(snapshot(), now)], purchases: [purchase({ warrantyReference: 'Private reference' })] }, backup = workspace.backupEnvelope(workspace.blank(), records, now), parsed = workspace.parseBackup(JSON.stringify(backup)); assert.equal(parsed.includesRetention, true); assert.equal(parsed.retention.purchases[0].warrantyReference, 'Private reference'); assert.equal(backup.revisions, undefined); assert.equal(backup.schema, 'pcp-my-pc-backup-v2');
  });
  await test('a second-key quota failure rolls both backup collections back byte for byte', () => {
    const storage = memory({ [workspace.KEY]: JSON.stringify(workspace.blank()), [retention.KEY]: JSON.stringify(retention.blank()) }), old = new Map(storage.values), write = storage.setItem; let failed = false; storage.setItem = (key, value) => { if (key === retention.KEY && !failed) { failed = true; throw Error('quota'); } write(key, value); }; const result = workspace.commitStores(storage, { ...workspace.blank(), watchlist: ['gpu-a'] }, { ...retention.blank(), purchases: [purchase()] }); assert.equal(result.ok, false); assert(result.error.includes('restored')); for (const [key, value] of old) assert.equal(storage.getItem(key), value);
  });
  await test('a failed clear restores both collections and never clears builder revisions', () => {
    const storage = memory({ [workspace.KEY]: JSON.stringify(workspace.blank()), [retention.KEY]: JSON.stringify({ ...retention.blank(), purchases: [purchase()] }), 'pcp-build-revisions-v1': 'original builds' }), old = new Map(storage.values), remove = storage.removeItem; let failed = false; storage.removeItem = key => { if (key === retention.KEY && !failed) { failed = true; throw Error('blocked'); } remove(key); }; assert.equal(workspace.commitStores(storage, workspace.blank(), retention.blank(), true).ok, false); for (const [key, value] of old) assert.equal(storage.getItem(key), value);
  });
  await test('an unsuccessful rollback produces a recovery warning instead of claiming data was restored', () => {
    const storage = memory({ [workspace.KEY]: JSON.stringify(workspace.blank()), [retention.KEY]: JSON.stringify(retention.blank()), 'pcp-build-revisions-v1': 'original builds' }), originalSet = storage.setItem; let blocked = false; storage.setItem = (key, value) => { if (key === retention.KEY || blocked) { blocked = true; throw Error('Storage blocked'); } originalSet(key, value); }; const result = workspace.commitStores(storage, { ...workspace.blank(), watchlist: ['gpu-a'] }, { ...retention.blank(), purchases: [purchase()] }); assert.equal(result.ok, false); assert(result.error.includes('could not fully restore')); assert(result.error.includes('recovery backup')); assert.equal(storage.getItem('pcp-build-revisions-v1'), 'original builds');
  });
  await test('actual compare hook saves only on click and updates its current selection', () => {
    const storage = memory(), view = hookFixture(storage); assert.equal(storage.getItem(retention.KEY), null); assert.equal(view.button.disabled, false); view.change(snapshot({ parts: [...parts].reverse() })); assert.equal(storage.getItem(retention.KEY), null); assert(view.controller.save().ok); assert.deepEqual(retention.read(storage).state.comparisons[0].parts.map(part => part.id), ['gpu-b', 'gpu-a']); assert(view.status.textContent.includes('this browser')); view.change(snapshot({ parts: [parts[0]] })); assert.equal(view.button.disabled, true);
  });
  await test('actual compare hook reports blocked storage without pretending it saved', () => {
    const storage = memory(); storage.setItem = () => { throw Error('Quota blocked'); }; const view = hookFixture(storage); assert.equal(view.controller.save().ok, false); assert(view.status.textContent.includes('Quota blocked')); assert.equal(storage.getItem(retention.KEY), null);
  });
  await test('restoring a differences-only view operates the existing toggle without saving history', () => {
    const storage = memory(), button = { addEventListener() {} }, status = {}, toggle = { checked: false, dispatchEvent(event) { this.changed = event.type; } }, host = { innerHTML: '', querySelector(selector) { return selector === '[data-save-current-comparison]' ? button : status; } }, document = { querySelector(selector) { return selector === '[data-completion-compare-save]' ? host : selector === '#differences-only' ? toggle : null; }, addEventListener() {} }; hook.mount({ document, storage, href: 'https://www.pcpartperformance.com/compare/?parts=gpu-a,gpu-b&differences=1', getSnapshot: () => snapshot({ onlyDifferences: toggle.checked }) }); assert.equal(toggle.checked, true); assert.equal(toggle.changed, 'change'); assert.equal(storage.getItem(retention.KEY), null);
  });
  await test('compare hook generator copies assets and decorates the retained controls once', () => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-retention-')), root = path.join(temporary, 'dist'); fs.mkdirSync(path.join(root, 'compare'), { recursive: true }); fs.writeFileSync(path.join(root, 'compare/index.html'), '<html><head></head><body><section id="comparison-cards"></section><div class="compare-options">Original controls</div></body></html>');
    try { const prepare = require('./completion-retention.cjs'); assert(prepare({ root }).decorated); const first = fs.readFileSync(path.join(root, 'compare/index.html'), 'utf8'); prepare({ root }); assert.equal(fs.readFileSync(path.join(root, 'compare/index.html'), 'utf8'), first); assert(first.includes('Original controls')); assert.equal((first.match(/data-completion-compare-save/g) || []).length, 1); assert(fs.existsSync(path.join(root, 'completion-retention.js'))); }
    finally { const absolute = path.resolve(temporary); assert(absolute.startsWith(path.resolve(os.tmpdir()) + path.sep)); fs.rmSync(absolute, { recursive: true, force: true }); }
  });
  await test('retention modules introduce no network request, notification backend or private analytics', () => {
    for (const file of ['completion-retention.js', 'completion-retention-compare.js']) { const source = fs.readFileSync(path.join(__dirname, file), 'utf8'); assert(!/\bfetch\s*\(|XMLHttpRequest|Notification\.requestPermission|setInterval\s*\(|sendBeacon/.test(source)); }
    assert(!fs.readFileSync(path.join(__dirname, 'completion-retention.js'), 'utf8').includes('PCP_EVENTS'));
  });
  await test('the optional save event follows actual storage success and contains no comparison content', () => {
    const before = globalThis.PCP_EVENTS, events = [];
    globalThis.PCP_EVENTS = { track: (name, params) => events.push({ name, params }) };
    try {
      const storage = memory(), view = hookFixture(storage); assert.equal(events.length, 0);
      assert(view.controller.save().ok); assert.deepEqual(events, [{ name: 'comparison_saved', params: { page_type: 'compare', action: 'created' } }]);
      storage.setItem = () => { throw Error('quota'); }; assert.equal(view.controller.save().ok, false); assert.equal(events.length, 1);
    } finally { if (before === undefined) delete globalThis.PCP_EVENTS; else globalThis.PCP_EVENTS = before; }
  });
  console.log(tests + ' completion-retention behavior tests passed. Local synthetic fixtures only.');
})().catch(error => { console.error(error); process.exitCode = 1; });
