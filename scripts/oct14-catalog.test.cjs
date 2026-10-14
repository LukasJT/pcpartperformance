'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const desktop = require('./oct14-prebuilt-data.cjs');
const baseline = require('./prebuilt-data.cjs');
const laptops = require('./oct14-laptop-data.cjs');
const ui = require('./oct14-laptop-ui.js');
const generate = require('./oct14-laptop-pages.cjs');
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('PASS ' + name); };
test('Desktop cohort contains at least40 real researched configurations per country', () => {
  assert.ok(desktop.filter(item => item.region === 'CA').length >= 40);
  assert.ok(desktop.filter(item => item.region === 'US').length >= 40);
  assert.equal(new Set(desktop.map(item => item.id)).size, desktop.length);
});
test('Original nine desktop records retain identities, facts and source dates', () => {
  for (const original of baseline) { const retained = desktop.find(item => item.id === original.id); for (const key of Object.keys(original)) assert.deepEqual(retained[key], original[key]); }
});
test('New catalog records carry exact regional source identities without invented offers', () => {
  for (const item of [...desktop.slice(baseline.length), ...laptops]) {
    assert.ok(item.sku); assert.ok(item.url.startsWith('https://')); assert.equal(item.currency, item.region === 'CA' ? 'CAD' : 'USD');
    assert.equal(item.price, null); assert.equal(item.stock, null); assert.equal(item.source.inspectedAt, '2026-10-14');
    assert.equal(item.source.url, item.url); assert.ok(item.source.scope.length > 20);
  }
});
test('Contradictory MSI listing preserves unknown memory/storage and source conflict', () => {
  const item = desktop.find(system => system.sku === '19396815'); assert.equal(item.ram, null); assert.equal(item.storage, null); assert.equal(item.sourceConflicts.length, 1);
});
test('Conflicting iBUYPOWER video memory is not inferred from a GPU name', () => {
  const item = desktop.find(system => system.sku === '20012906'); assert.equal(item.vram, null); assert.ok(item.sourceConflicts.length);
});
test('NZXT signatures are explicitly distinguished from factory SKUs', () => {
  const nzxt = desktop.filter(item => item.brand === 'NZXT'); assert.equal(nzxt.length, 4); assert.ok(nzxt.every(item => item.skuKind.includes('factory part number not disclosed')));
});
test('Image sources are valid photo URLs without tool error text', () => {
  for (const item of [...desktop, ...laptops]) if (item.imageSource) { assert.ok(!/\s/.test(item.imageSource)); assert.ok(!item.imageSource.includes('Cache miss')); assert.ok(!item.imageSource.includes('bestbuy_logo')); assert.equal(new URL(item.imageSource).protocol, 'https:'); }
});
test('Laptop catalog keeps42 distinct identities and separate laptop GPU names', () => {
  assert.equal(laptops.length, 42); assert.equal(new Set(laptops.map(item => item.id)).size, laptops.length);
  assert.equal(laptops.filter(item=>item.region==='CA').length, 21); assert.equal(laptops.filter(item=>item.region==='US').length, 21);
  for (const item of laptops) { assert.ok(item.gpu.endsWith('Laptop GPU')); assert.equal(item.gpuPowerW, null); assert.equal(item.measuredFps, null); assert.equal(item.batteryLifeHours, null); }
});
test('Filters support multiple brands, compact query spelling and a region boundary', () => {
  const item = laptops.find(laptop=>laptop.brand==='ASUS'&&laptop.region==='CA'&&laptop.gpu.includes('5060'));
  assert.ok(ui.matches(item,{region:'CA',query:'rtx5060',brands:['ASUS','MSI'],series:['RTX 50'],screens:[]}));
  assert.equal(ui.matches(item,{region:'US',query:'',brands:[],series:[],screens:[]}),false);
  assert.equal(ui.matches(item,{region:'CA',query:'',brands:['Razer'],series:[],screens:[]}),false);
});
test('Screen-size filters and unknown values remain honest', () => {
  const item = {region:'CA',brand:'ASUS',gpu:'GeForce RTX 5060 Laptop GPU',screenInches:14,name:'G14'};
  assert.ok(ui.matches(item,{region:'CA',query:'',brands:[],series:[],screens:['compact']}));
  assert.equal(ui.matches({...item,screenInches:null},{region:'CA',query:'',brands:[],series:[],screens:['compact']}),false);
  assert.equal(ui.valueFor({gpuPowerW:null},'gpuPowerW'),'Not disclosed'); assert.equal(ui.valueFor({refreshHz:240},'refreshHz'),'240 Hz');
});
test('Share selections reject duplicates, other-country IDs and arbitrary input', () => {
  const ca=laptops.filter(item=>item.region==='CA').slice(0,4), us=laptops.find(item=>item.region==='US');
  assert.deepEqual(ui.validSelection([ca[0].id,ca[0].id,us.id,'constructor',...ca.map(item=>item.id)],laptops,'CA'),ca.slice(0,3).map(item=>item.id));
});
test('Generated laptop route exposes real source links, labels, retained actions and no fake FPS', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-oct14-laptops-')); fs.mkdirSync(path.join(root,'data'));
  const esc = value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  let html=''; const result=generate({root,esc,shell:(title,type,body)=>`<html><head><title>${title}</title></head><body>${body}</body></html>`,write:(route,value)=>{assert.equal(route,'laptops');html=value;}});
  assert.equal(result.laptops,42); assert.equal((html.match(/data-laptop-card=/g)||[]).length,42);
  assert.ok(html.includes('data-laptop-brand=')); assert.ok(html.includes('data-laptop-search')); assert.ok(html.includes('data-laptop-compare'));
  assert.ok(html.includes('/tools/monitor-pixel-density/')); assert.ok(!html.includes('/tools/monitor-size/'));
  assert.ok(html.includes('no desktop FPS estimate')); assert.ok(!html.includes('data-laptop-fps'));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,'data/gaming-laptops.json'),'utf8')).laptops.length,42);
});
test('Animations respect reduced motion and images use contain geometry', () => {
  const css=fs.readFileSync(path.join(__dirname,'oct14-laptop.css'),'utf8'); assert.ok(css.includes('prefers-reduced-motion:reduce')); assert.ok(css.includes('object-fit:contain')); assert.ok(css.includes('minmax(0,1fr)'));
});
console.log(`${passed} catalog and laptop controls checks passed.`);
