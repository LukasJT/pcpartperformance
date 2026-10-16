'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('./growth-search-core.cjs');
const results = [];
const test = (name, run) => { run(); results.push(name); console.log('PASS ' + name); };
const gpu = { title: 'GeForce RTX 5070', url: '/learn/rtx5070.html', kind: 'Hardware', aliases: ['NVIDIA Blackwell'] };
const phone = { title: 'iPhone 16 vs iPhone 16 Pro', url: '/phones/compare/iphone-16-vs-iphone-16-pro/', kind: 'Phone comparison' };
const ti8 = { title: 'GeForce RTX 5060 Ti 8 GB', url: '/learn/rtx5060ti8.html', kind: 'Hardware' };
const ti16 = { title: 'GeForce RTX 5060 Ti 16 GB', url: '/learn/rtx5060ti16.html', kind: 'Hardware' };
const rows = [gpu, phone, ti8, ti16, { title: 'RAM latency calculator', url: '/tools/ram-latency/', kind: 'Calculator', aliases: ['CAS latency MT/s nanoseconds'] }];

test('compact model numbers, approved brand shorthand and token order still work', () => {
  assert.equal(core.search(rows, 'RTX5070')[0].row, gpu);
  assert.equal(core.search(rows, 'nvda rtx 5070')[0].row, gpu);
  assert.equal(core.search(rows, '5070 GeForce')[0].row, gpu);
  assert.equal(core.search(rows, 'nanoseconds', 'tools').length, 1);
});
test('model numbers are whole numeric tokens, never arbitrary substrings or fuzzy edits', () => {
  assert.equal(core.search(rows, 'RTX 5071').length, 0);
  assert.equal(core.search(rows, 'RTX 507').length, 0);
  assert.equal(core.search(rows, 'RTX 5060 Ti 16GB', 'hardware')[0].row, ti16);
  assert.equal(core.search(rows, 'RTX 5060 Ti 16GB', 'hardware').length, 1);
  assert.equal(core.search(rows, 'RTX 5060 Ti 8G', 'hardware')[0].row, ti8);
});
test('comparisons are a distinct type instead of disappearing into guides', () => {
  assert.equal(core.group(phone), 'comparisons');
  assert.equal(core.search(rows, 'iphone', 'comparisons').length, 1);
  assert.equal(core.search(rows, 'iphone', 'guides').length, 0);
  assert.equal(core.search(rows, 'iphone', 'hardware').length, 0);
  assert.equal(core.group({ url: '/compare/rx-9070-vs-rx-9070-xt/', kind: 'Sourced guide' }), 'comparisons');
});
test('one-letter spelling help is bounded and leaves all numeric requirements intact', () => {
  assert.equal(core.search(rows, 'geforcr 5070')[0].row, gpu);
  assert.equal(core.search(rows, 'geforcr 5070')[0].match, 'letter_typo');
  assert.equal(core.search(rows, 'geforcr 5071').length, 0);
  assert.equal(core.oneLetterEdit('motherboard', 'mothrboard'), true);
  assert.equal(core.oneLetterEdit('corsiar', 'corsair'), true);
  assert.equal(core.oneLetterEdit('5070', '5071'), false);
  assert.equal(core.oneLetterEdit('rtx', 'gtx'), false);
  assert.equal(core.oneLetterEdit('motherboard', 'board'), false);
});
test('explicit SKU enrichment uses exact record IDs and declared identities only', () => {
  const records = [{ id: 'ventus3', sku: 'G5070-12V3C' }, { id: 'ventus2', sku: 'G5070-12V2C' }];
  const profile = [{ id: '9800x3d', identity: { boxedPartNumber: '100-100001084WOF', trayPartNumber: '100-000001084' } }];
  const input = [
    { title: 'MSI RTX 5070 VENTUS 3X OC', url: '/learn/ventus3.html', kind: 'Hardware' },
    { title: 'MSI RTX 5070 VENTUS 2X OC', url: '/learn/ventus2.html', kind: 'Hardware' },
    { title: 'AMD Ryzen 7 9800X3D', url: '/learn/9800x3d.html', kind: 'Hardware' }
  ];
  const enriched = core.enrichIndex(input, records, profile);
  assert.equal(input[0].identifiers, undefined);
  assert.equal(core.search(enriched, 'G5070-12V3C')[0].row.url, '/learn/ventus3.html');
  assert.equal(core.search(enriched, 'g507012v3c').length, 1);
  assert.equal(core.search(enriched, 'G5070-12V4C').length, 0);
  assert.equal(core.search(enriched, 'G5070-12V3D').length, 0);
  assert.equal(core.search(enriched, '100-100001084WOF')[0].row.url, '/learn/9800x3d.html');
  assert.equal(core.search(enriched, '100-100001085WOF').length, 0);
});
test('long RAM part numbers do not match a nearby capacity or timing variant', () => {
  const kits = [
    { title: 'Corsair VENGEANCE DDR5-6000 CL30', url: '/learn/ddr5.html', identifiers: ['CMK32GX5M2B6000C30'] },
    { title: 'Corsair VENGEANCE DDR5-6000 CL36', url: '/learn/other.html', identifiers: ['CMK32GX5M2B6000C36'] }
  ];
  assert.equal(core.search(kits, 'CMK32GX5M2B6000C30').length, 1);
  assert.equal(core.search(kits, 'CMK32GX5M2B6000C30')[0].match, 'identifier');
  assert.equal(core.search(kits, 'CMK32GX5M2B6000C31').length, 0);
});
test('the real indexed CPU, memory kit and exact Ventus model resolve their verified part numbers', () => {
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/data/search-index.json')));
  const enriched = core.enrichIndex(index, [], require('./program-products.cjs').profiles);
  for (const [partNumber, id] of [['100-100001084WOF', '9800x3d'], ['CMK32GX5M2B6000C30', 'ddr5'], ['G5070-12V3C', 'retail-msi-geforce-rtx-5070-12g-ventus-3x-oc']]) {
    const found = core.search(enriched, partNumber);
    assert.equal(found.length, 1, partNumber); assert.equal(found[0].row.url, '/learn/' + id + '.html');
    assert.equal(found[0].match, 'identifier');
  }
});
test('unsafe links, null records, aliases of the wrong type and duplicate routes are handled', () => {
  for (const url of ['//evil.example/x', '/a//evil', '/../evil', '/a/../evil', '/./evil', 'javascript:alert(1)', '/a%2f..']) {
    assert.equal(core.search([...rows, { title: 'bad', url }], 'bad').length, 0, url);
  }
  assert.equal(core.search([null, ...rows], 'unrelated').length, 0);
  assert.equal(core.search([gpu, { ...gpu }], '5070').length, 1);
  assert.equal(core.rank({ ...gpu, aliases: null }, '5070'), 80);
});
test('plain-language questions reach real relevant guides before broad catalogs', () => {
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/data/search-index.json')));
  for (const [query, route] of [
    ["my GPU won't fit", '/blog/will-a-graphics-card-fit-my-case/'],
    ['graphics card too long for my case', '/blog/will-a-graphics-card-fit-my-case/'],
    ['does my motherboard support my CPU', '/blog/check-cpu-bios-support/'],
    ['CPU BIOS update support', '/blog/check-cpu-bios-support/'],
    ['new PC turns on but no display', '/blog/new-pc-no-display-safe-checks/'],
    ['what should I upgrade first', '/blog/cpu-or-gpu-upgrade-for-gaming/'],
    ['CPU or GPU upgrade first', '/blog/cpu-or-gpu-upgrade-for-gaming/']
  ]) {
    const result = core.search(index, query); assert.equal(result[0]?.row.url, route, query);
    assert.equal(result[0].match, 'intent'); assert.ok(fs.existsSync(path.join(__dirname, '../dist', route, 'index.html')));
  }
});
test('intent routing respects the selected type and does not invent an absent destination', () => {
  const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/data/search-index.json')));
  assert.equal(core.search(index, "GPU won't fit", 'tools')[0].row.url, '/compatibility/');
  assert.equal(core.search([], "GPU won't fit").length, 0);
  assert.equal(core.search(index, 'iPhone black screen').filter(row => row.match === 'intent').length, 0);
});
test('display naming keeps exact partner and revision names intact', () => {
  assert.equal(core.displayTitle('AMD AMD Ryzen 7 7800X3D'), 'AMD Ryzen 7 7800X3D');
  assert.equal(core.displayTitle('MSI MAG B850 TOMAHAWK MAX WIFI'), 'MSI MAG B850 TOMAHAWK MAX WIFI');
});
console.log(JSON.stringify({ passed: results.length, scope: 'actual core, index fixtures, exact identity and deterministic routing' }));
