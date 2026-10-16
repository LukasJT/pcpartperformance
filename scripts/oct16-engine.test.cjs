'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const rules = require('./compatibility-evidence.cjs');
const program = require('./builder-program.js');
const { COOLERS, getCooler } = require('./oct16-cooling-data.cjs');
const legacySlots = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan'];
const part = (id, cat, name = id) => ({ id, cat, name, brand: 'Fixture', architecture: '', summary: '', specs: {} });
const cpu = part('9800x3d', 'cpu', 'Ryzen 7 9800X3D');
const board = part('b650', 'board', 'MAG B650 TOMAHAWK WIFI');
const airMini = part('retail-lian-li-o11-air-mini-black', 'case', 'O11 Air Mini Black');
const evo = part('retail-lian-li-o11-dynamic-evo-white', 'case', 'O11 Dynamic EVO White');
const ram = part('ddr5', 'ram', 'CMK32GX5M2B6000C30');
const coolingParts = cooler => ({ cpu: [cpu], board: [board], case: [airMini], ram: [ram], cooler: [cooler] });
const check = (report, id) => { const result = report.checks.find(row => row.id === id); assert.ok(result, `Missing ${id} check`); return result; };
const manual = (changes = {}) => ({ id: 'manual-os', name: 'Operating-system quote', kind: 'os', quantity: 1, amount: null, region: 'CA', owned: false, ...changes });

test('empty build starts calmly with zero checks, zero conflicts and no fabricated match', () => {
  const result = rules.createReadiness();
  assert.equal(result.status, 'not-started');
  assert.deepEqual(result.checks, []);
  assert.equal(result.counts.failed, 0);
  assert.equal(result.counts.passed, 0);
  assert.equal(result.counts['needs-verification'], 0);
  assert.ok(result.missing.includes('cpu'));
  assert.ok(result.missing.includes('storage'));
  assert.match(result.summary, /first component/i);
});

test('missing prerequisites are not-checked rather than alleged compatibility failures', () => {
  const cpuOnly = rules.createReadiness({ parts: { cpu: [cpu] } });
  for (const id of ['cpu-socket', 'bios', 'ram-generation', 'board-case', 'psu-form', 'psu-length', 'cables']) {
    assert.equal(check(cpuOnly, id).state, 'not-checked', id);
    assert.equal(check(cpuOnly, id).basis, 'not-yet-selected', id);
  }
  assert.equal(cpuOnly.counts.failed, 0);
  const coolerOnly = rules.createReadiness({ parts: { cooler: [getCooler('cooler-noctua-nh-l9a-am5')] } });
  for (const id of ['cooler', 'cooler-socket', 'cooler-kit', 'cooler-height']) assert.equal(check(coolerOnly, id).state, 'not-checked', id);
});

test('real Noctua records can pass only documented nominal air-cooler height', () => {
  const named = COOLERS.filter(row => row.brand === 'Noctua');
  assert.equal(named.length, 4);
  for (const cooler of named) {
    const report = rules.createReadiness({ parts: coolingParts(cooler) });
    assert.equal(check(report, 'cooler-socket').state, 'passed', cooler.name);
    assert.equal(check(report, 'cooler-height').state, 'passed', cooler.name);
    assert.match(check(report, 'cooler-height').title, /nominal/i);
    assert.equal(check(report, 'cooler-ram').state, 'needs-verification', cooler.name);
    assert.equal(check(report, 'cooling-behavior').state, 'unperformed', cooler.name);
    assert.notEqual(report.status, 'compatible');
  }
});

test('a documented 168 mm cooler conflicts with the exact 167 mm case limit', () => {
  const cooler = getCooler('cooler-noctua-nh-d15-g2');
  const report = rules.createReadiness({ parts: { ...coolingParts(cooler), case: [evo] } });
  assert.equal(check(report, 'cooler-height').state, 'failed');
  assert.equal(report.status, 'conflicts-found');
  assert.ok(check(report, 'cooler-height').sources.some(source => source.url.includes('noctua.at')));
  assert.ok(check(report, 'cooler-height').sources.some(source => source.url.includes('lian-li.com')));
});

test('a passing nominal height never certifies a fan raised for tall RAM', () => {
  const report = rules.createReadiness({ parts: coolingParts(getCooler('cooler-noctua-nh-d15-g2')) });
  assert.equal(check(report, 'cooler-height').state, 'passed');
  assert.match(check(report, 'cooler-height').reason, /raising a fan/i);
  assert.equal(check(report, 'cooler-ram').state, 'needs-verification');
  assert.match(check(report, 'cooler-ram').reason, /RAM\/fan clearance/);
  assert.equal(check(report, 'physical-inspection').state, 'unperformed');
});

test('heatsink-only Thermalright heights remain unknown in the installed-fit check', () => {
  for (const cooler of COOLERS.filter(row => row.brand === 'Thermalright')) {
    const report = rules.createReadiness({ parts: coolingParts(cooler) });
    assert.ok(rules.field(cooler, 'heatsinkHeight').value > 0);
    assert.equal(rules.field(cooler, 'installedHeight').value, null);
    assert.equal(check(report, 'cooler-height').state, 'needs-verification', cooler.name);
    assert.equal(check(report, 'cooler-kit').state, 'needs-verification', cooler.name);
  }
});

test('an AM5-only cooler has a documented conflict with an LGA1700 CPU', () => {
  const report = rules.createReadiness({ parts: { cpu: [part('i714700k', 'cpu')], cooler: [getCooler('cooler-noctua-nh-l9a-am5')], case: [airMini] } });
  assert.equal(check(report, 'cooler-socket').state, 'failed');
  assert.equal(check(report, 'cooler-kit').state, 'failed');
});

test('AIO socket and kit matches do not certify radiator, pump or motherboard layout', () => {
  for (const cooler of COOLERS.filter(row => row.cooler.type === 'aio')) {
    const report = rules.createReadiness({ parts: coolingParts(cooler) });
    assert.equal(check(report, 'cooler-socket').state, 'passed', cooler.name);
    assert.equal(check(report, 'radiator-layout').state, 'needs-verification', cooler.name);
    assert.equal(report.checks.some(row => row.id === 'cooler-height'), false);
    assert.equal(check(report, 'cooler-ram').state, 'needs-verification');
    assert.equal(check(report, 'cooling-behavior').state, 'unperformed');
  }
});

test('a known CPU without boxed cooling requires a cooler; an unknown package is not assumed to include one', () => {
  const known = rules.createReadiness({ parts: { cpu: [cpu], board: [board] } });
  assert.ok(known.missing.includes('cooler'));
  assert.equal(check(known, 'cooler').state, 'needs-verification');
  const unknown = part('uncataloged-boxed-cpu', 'cpu', 'Unverified boxed CPU');
  unknown.architecture = 'AM5';
  const missingPackage = rules.createReadiness({ parts: { cpu: [unknown], board: [board] } });
  assert.equal(rules.field(unknown, 'includedCooler').value, null);
  assert.equal(check(missingPackage, 'cooler').state, 'needs-verification');
  assert.match(check(missingPackage, 'cooler').reason, /tray and used/i);
  assert.notEqual(check(missingPackage, 'cooler').state, 'passed');
});

test('selecting a sourced cooler resolves only the missing selection, never BIOS evidence', () => {
  const report = rules.createReadiness({ parts: coolingParts(getCooler('cooler-corsair-nautilus-240-rs-black')) });
  assert.equal(report.missing.includes('cooler'), false);
  assert.equal(check(report, 'cpu-socket').state, 'passed');
  assert.equal(check(report, 'bios').state, 'needs-verification');
  assert.equal(check(report, 'cooler-kit').state, 'passed');
  assert.equal(check(report, 'cooler').state, 'needs-verification');
});

const legacyCatalog = legacySlots.map((slot, index) => part(`legacy-${index}-${slot}`, slot));
const catalog = [...legacyCatalog, ...COOLERS];
function bridgeFor(url) {
  const nodes = new Map(['#picker-query', '#close-picker', '#part-picker', '#enable-incompatible'].map(key => [key, { addEventListener() {} }]));
  const context = { URL, console, location: { href: url, hash: '', search: new URL(url).search },
    history: { replaceState() {} }, document: { body: { dataset: { page: 'builder' } }, querySelector: selector => nodes.get(selector) || null, querySelectorAll: () => [], addEventListener() {}, dispatchEvent() {}, activeElement: { tagName: 'BODY' } },
    window: { PCP_BUILDER_CATALOG: JSON.parse(JSON.stringify(catalog)), PCP_BUILD_RULES: rules }, CustomEvent: function () {}, matchMedia: () => ({ matches: true }), setTimeout() {}, clearTimeout() {} };
  vm.createContext(context);
  for (const file of ['core.js', 'interface.js', 'builder-v2.js']) vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../dist', file), 'utf8'), context, { filename: file });
  return context.window.PCP_BUILD;
}

test('the cooler slot is appended after the original nine URL positions', () => {
  assert.deepEqual(rules.SLOTS.slice(0, 9), legacySlots);
  assert.equal(rules.SLOTS[9], 'cooler');
  const parts = Object.fromEntries(legacyCatalog.map(row => [row.cat, [row.id]]));
  parts.cooler = [COOLERS[0].id];
  const normalized = rules.normalizeRevision({ schema: 1, parts, region: 'CA' }, catalog).revision;
  const url = new URL(rules.buildURL(normalized));
  const ids = url.searchParams.get('build').split(',');
  assert.deepEqual(ids.slice(0, 9), legacyCatalog.map(row => row.id));
  assert.equal(ids[9], COOLERS[0].id);
  const actual = bridgeFor(url.href).snapshot();
  for (const [slot, selected] of Object.entries(parts)) assert.deepEqual(Array.from(actual.parts[slot]), selected, slot);
});

test('a legacy nine-slot URL still loads exact selections without becoming a cooler selection', () => {
  const legacy = new URL('https://www.pcpartperformance.com/builder/');
  legacy.searchParams.set('build', legacyCatalog.map(row => row.id).join(','));
  const actual = bridgeFor(legacy.href).snapshot();
  for (const row of legacyCatalog) assert.deepEqual(Array.from(actual.parts[row.cat]), [row.id], row.cat);
  assert.deepEqual(Array.from(actual.parts.cooler), []);
});

test('schema-one saved collections retain IDs, repeated items, ownership, locks and timestamps', () => {
  const savedAt = '2026-10-13T20:00:00.000Z';
  const old = { schema: 1, revisions: [{ schema: 1, version: '2026-10-13.2', id: 'my-original-pc', name: 'My original PC', parts: { cpu: [legacyCatalog[0].id], ssd: [legacyCatalog[4].id, legacyCatalog[4].id], fan: [legacyCatalog[8].id, legacyCatalog[8].id] }, region: 'US', currency: 'USD', savedAt, owned: [legacyCatalog[0].id], locked: [legacyCatalog[0].id] }] };
  const text = JSON.stringify(old);
  const parsed = program.parseCollection(text, catalog);
  assert.equal(JSON.stringify(old), text);
  assert.equal(parsed.issues.length, 0);
  const row = parsed.revisions[0];
  assert.equal(row.id, 'my-original-pc');
  assert.equal(row.savedAt, savedAt);
  assert.deepEqual(row.parts.ssd, [legacyCatalog[4].id, legacyCatalog[4].id]);
  assert.deepEqual(row.parts.fan, [legacyCatalog[8].id, legacyCatalog[8].id]);
  assert.deepEqual(row.parts.cooler, []);
  assert.deepEqual(row.owned, [legacyCatalog[0].id]);
  assert.deepEqual(row.locked, [legacyCatalog[0].id]);
  assert.equal(row.currency, 'USD');
  assert.deepEqual(row.manualItems, []);
  assert.deepEqual(program.parseCollection({ schema: 1, revisions: [row] }, catalog).revisions[0], row);
});

test('manual purchasing inventory preserves quantities and unknown prices instead of making a complete zero-cost plan', () => {
  const items = [manual({ quantity: 2, amount: null }), manual({ id: 'adapter', kind: 'accessory', quantity: 3, amount: 12.5 }), manual({ id: 'owned-network', kind: 'network', quantity: 1, amount: null, owned: true })];
  const result = rules.manualItemTotal(items, 'CA');
  assert.equal(result.subtotal, 37.5);
  assert.equal(result.missing, 2);
  assert.equal(result.purchaseItems, 5);
  assert.equal(result.owned, 1);
  assert.equal(result.complete, false);
  assert.equal(rules.normalizeManualItems(items, 'CA').items[0].amount, null);
});

test('manual quotes remain scoped to their region without silent currency conversion', () => {
  const rows = [manual({ id: 'cad', amount: 100, region: 'CA' }), manual({ id: 'usd', amount: 80, region: 'US', quantity: 2 })];
  const ca = rules.manualItemTotal(rows, 'CA'), us = rules.manualItemTotal(rows, 'US');
  assert.equal(ca.subtotal, 100);
  assert.equal(ca.missing, 2);
  assert.equal(us.subtotal, 160);
  assert.equal(us.missing, 1);
  assert.equal(ca.complete, false);
  assert.equal(us.complete, false);
  const normalized = rules.normalizeRevision({ parts: {}, region: 'US', manualItems: rows }, catalog).revision;
  assert.deepEqual(normalized.manualItems.map(row => [row.amount, row.region]), [[100, 'CA'], [80, 'US']]);
});

test('manual import limits reject oversized, duplicate, malformed and impossible purchase entries', () => {
  assert.equal(rules.normalizeManualItems(Array.from({ length: 31 }, (_, index) => manual({ id: `row-${index}` }))).items.length, 0);
  assert.equal(rules.normalizeManualItems(Array.from({ length: 30 }, (_, index) => manual({ id: `row-${index}` }))).items.length, 30);
  for (const mutation of [{ quantity: 0 }, { quantity: 100 }, { quantity: 1.5 }, { amount: -1 }, { amount: Infinity }, { amount: 10000001 }, { region: 'GB' }, { id: '<script>' }, { name: ' ' }, { name: 'a'.repeat(101) }, { name: 'bad\u0001name' }]) {
    const result = rules.normalizeManualItems([manual(mutation)]);
    assert.equal(result.items.length, 0, JSON.stringify(mutation));
    assert.ok(result.issues.length > 0);
  }
  const duplicate = rules.normalizeManualItems([manual(), manual()]);
  assert.equal(duplicate.items.length, 1);
  assert.equal(duplicate.issues.length, 1);
});

test('manual purchase notes and quotes are local revision data, absent from public share URLs', () => {
  const normalized = rules.normalizeRevision({ name: 'Private journal title', notes: 'Secret purchase note', budget: 1937.42, parts: { cpu: [legacyCatalog[0].id], cooler: [COOLERS[0].id] }, region: 'CA', manualItems: [manual({ name: 'Private serial and quote', amount: 123.45 })] }, catalog).revision;
  assert.equal(normalized.manualItems[0].name, 'Private serial and quote');
  const url = new URL(rules.buildURL(normalized));
  assert.equal(url.searchParams.get('build').split(',')[9], COOLERS[0].id);
  for (const key of ['notes', 'name', 'budget', 'manualItems', 'extras', 'quote']) assert.equal(url.searchParams.has(key), false, key);
  for (const text of ['Private', 'serial', '123.45', '1937.42', 'Secret']) assert.equal(decodeURIComponent(url.href).includes(text), false, text);
});
test('a complete larger revision export round-trips with all manual items and bounded UTF-8 input',()=>{
 const revisions=Array.from({length:program.MAX_REVISIONS},(_,i)=>({...rules.normalizeRevision({name:'PC '+i,region:'CA',parts:{cpu:[legacyCatalog[0].id]},manualItems:Array.from({length:30},(_,j)=>manual({id:'quote-'+j,name:'A'.repeat(100),amount:j===0?null:125.50,quantity:2}))},catalog).revision,id:'revision-'+i}));
 const text=JSON.stringify({schema:1,revisions});assert(Buffer.byteLength(text)>65536,'new valid quote data can exceed the old 64KB cap');assert(Buffer.byteLength(text)<program.MAX_IMPORT_BYTES);const imported=program.parseCollection(text,catalog);assert.equal(imported.issues.length,0);assert.deepEqual(imported.revisions,revisions);
 assert.throws(()=>program.parseCollection(' '.repeat(program.MAX_IMPORT_BYTES+1),catalog),/4 MB/);
 assert.throws(()=>program.parseCollection('€'.repeat(Math.floor(program.MAX_IMPORT_BYTES/3)+1),catalog),/4 MB/,'use UTF-8 bytes rather than a character-count loophole');
});
