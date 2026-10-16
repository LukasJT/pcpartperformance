'use strict';
const assert = require('node:assert/strict');
const master = require('./master-decisions.js');
const rules = require('./compatibility-evidence.cjs');
const now = Date.now();
const row = (slot, ids = [slot + '-owned'], extra = {}) => ({ slot, id: ids[0] || '', originId: ids[0] || '', ids, originIds: [...ids], name: 'Exact ' + slot, decision: ids.length ? 'keep' : 'verify', ...extra });
const context = parts => ({ schema: 1, kind: 'upgrade', createdAt: now, region: 'CA', budget: 1500, goal: 'gaming', symptom: 'none', parts });
let tests = 0;
function test(name, action) { action(); tests++; console.log('PASS ' + name); }
test('upgrade decision slots follow the shared compatibility engine and preserve original positional order', () => { assert.deepEqual(master.SLOTS, rules.SLOTS); assert.deepEqual(master.SLOTS.slice(0, 8), ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case']); assert.equal(master.SLOTS[8], 'fan'); assert.equal(master.SLOTS[9], 'cooler'); });
test('an eight-category legacy handoff receives unknown optional fan and cooler rows', () => {
  const legacy = master.SLOTS.slice(0, 8).map(slot => ({ slot, id: slot + '-old', originId: slot + '-old', name: slot, decision: 'keep' })); const normalized = master.sanitizeContext(context(legacy), now); assert(normalized); assert.equal(normalized.parts.length, rules.SLOTS.length); assert.deepEqual(normalized.parts.find(part => part.slot === 'cooler').ids, []); assert.equal(normalized.parts.find(part => part.slot === 'fan').decision, 'verify'); assert.equal(normalized.parts.find(part => part.slot === 'cpu').id, 'cpu-old');
});
test('a nine-category legacy handoff keeps selected fan identities and leaves cooling unverified', () => {
  const legacy = master.SLOTS.slice(0, 9).map(slot => row(slot)); const normalized = master.sanitizeContext(context(legacy), now); assert.equal(normalized.parts.find(part => part.slot === 'fan').ids[0], 'fan-owned'); assert.equal(normalized.parts.find(part => part.slot === 'cooler').decision, 'verify');
});
test('multi-instance memory, storage and fan identities remain exact through a handoff round trip', () => {
  const parts = master.SLOTS.map(slot => row(slot)); parts.find(part => part.slot === 'ram').ids.push('second-kit'); parts.find(part => part.slot === 'ram').originIds.push('second-kit'); parts.find(part => part.slot === 'ssd').ids.push('ssd-owned'); parts.find(part => part.slot === 'ssd').originIds.push('ssd-owned'); parts.find(part => part.slot === 'fan').ids.push('another-fan'); parts.find(part => part.slot === 'fan').originIds.push('another-fan'); const first = master.sanitizeContext(context(parts), now), second = master.sanitizeContext(JSON.stringify(first), now); assert.deepEqual(second, first); assert.deepEqual(second.parts.find(part => part.slot === 'ssd').ids, ['ssd-owned', 'ssd-owned']); assert.deepEqual(second.parts.find(part => part.slot === 'ram').ids, ['ram-owned', 'second-kit']);
});
test('matching the first item is insufficient to mark extra newly purchased units owned', () => {
  const parts = master.SLOTS.map(slot => row(slot)); const memory = parts.find(part => part.slot === 'ram'); memory.ids.push('ram-owned'); const normalized = master.sanitizeContext(context(parts), now), selected = normalized.parts.find(part => part.slot === 'ram'); assert.equal(selected.id, selected.originId); assert.equal(selected.decision, 'verify'); assert.equal(master.ownedForWorksheet(normalized.parts).ram, false); assert.equal(master.scenarioParts(normalized.parts, 'diagnose').find(part => part.slot === 'ram').decision, 'replace');
});
test('partner variants never merge merely because they occupy the same category', () => {
  const parts = master.SLOTS.map(slot => row(slot)), graphics = parts.find(part => part.slot === 'gpu'); Object.assign(graphics, { id: 'msi-rtx5070-ventus', ids: ['msi-rtx5070-ventus', 'zotac-rtx5070-solid'], originId: 'msi-rtx5070-ventus', originIds: ['msi-rtx5070-ventus'], decision: 'keep' }); const normalized = master.sanitizeContext(context(parts), now); assert.deepEqual(normalized.parts.find(part => part.slot === 'gpu').ids, graphics.ids); assert.equal(normalized.parts.find(part => part.slot === 'gpu').decision, 'verify');
});
test('malformed arrays, contradictory legacy IDs and missing required legacy categories fail closed', () => {
  const valid = master.SLOTS.map(slot => row(slot)); assert.equal(master.sanitizeContext(context(valid.map(part => part.slot === 'fan' ? { ...part, ids: ['<script>'] } : part)), now), null); assert.equal(master.sanitizeContext(context(valid.map(part => part.slot === 'fan' ? { ...part, id: 'different-first-id' } : part)), now), null); assert.equal(master.sanitizeContext(context(valid.filter(part => part.slot !== 'cpu')), now), null); assert.equal(master.sanitizeContext(context(valid.map(part => part.slot === 'fan' ? { ...part, ids: Array(100).fill('fan-owned') } : part)), now), null);
});
test('private notes and obsolete declared compatibility remain outside the cost handoff', () => {
  const source = { ...context(master.SLOTS.map(slot => row(slot))), notes: 'Private workload', journal: ['Private entry'], compatibility: '100% compatible', manualItems: [{ name: 'Private invoice' }] }; const normalized = master.sanitizeContext(source, now); assert.equal(normalized.notes, undefined); assert.equal(normalized.journal, undefined); assert.equal(normalized.compatibility, undefined); assert.equal(normalized.manualItems, undefined);
});
console.log(tests + ' upgrade slot/context regression tests passed. Synthetic state fixtures only.');
