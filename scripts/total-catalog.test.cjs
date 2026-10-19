'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const api = require('./total-catalog.cjs');
const clone = value => JSON.parse(JSON.stringify(value));
const bundle = api.loadPackets(), baseline = api.loadExisting();
const row = bundle.records.find(p => p.name === 'GeForce GTX 1060 GAMING X 3G');
let passed = 0;
function test(name, action) { action(); passed++; console.log('PASS ' + name); }
function modified(update) { const packet = clone(bundle); update(packet); return api.stage([], packet); }
test('actual inspected batch validates and imports into the shared catalog with stable legacy IDs', () => {
  const original = clone(baseline), merged = clone(baseline); api.prepareCatalog(merged);
  assert.equal(merged.length, baseline.length + bundle.records.length); assert.deepEqual(merged.slice(0, baseline.length), original);
  const counts = api.counts(merged.slice(baseline.length)); assert.deepEqual(counts.byCategory, { cpu:17, gpu:20, ram:21, ssd:5, cooler:12 }); assert.equal(counts.withExplicitMPN, 30);
});
test('reapplying the same packet is idempotent and does not change selected IDs or create aliases', () => {
  const records = clone(baseline); api.prepareCatalog(records); const first = clone(records); api.prepareCatalog(records); assert.deepEqual(records, first); assert.equal(api.stage(records).unchanged.length, bundle.records.length);
});
test('a bad record rejects the entire intake before mutating existing data', () => {
  const records = clone(baseline), original = clone(records), packet = clone(bundle); packet.records[0].status = 'candidate';
  assert.throws(() => api.prepareCatalog(records, { bundle:packet }), /rejected before mutation/); assert.deepEqual(records, original);
});
test('duplicate exact MPNs reject instead of silently merging a new ID', () => {
  const packet = clone(bundle), duplicate = clone(packet.records.find(p => p.identity.manufacturerPartNumber)); duplicate.id += '-second'; packet.records.push(duplicate);
  const result = api.stage([], packet); assert.equal(result.valid, false); assert(result.conflicts.some(c => c.kind === 'duplicate-identity'));
});
test('source changes and locally modified facts require review instead of silently freezing or overwriting them',()=>{
  const records=api.stage([],bundle).additions,packet=clone(bundle);packet.sources[row.sourceId].models[row.name].facts.boostGHz.value=1785;
  assert(api.stage(records,packet).conflicts.some(c=>c.id===row.id&&c.kind==='stable-id-conflict'));
  const current=records.find(p=>p.id===row.id);current.specs['Card length']=999;
  assert(api.stage(records,bundle).conflicts.some(c=>c.id===row.id));assert.equal(api.planRollback(records,[row.id]).removable.length,0);
});
test('board memory variants remain separate, including 3GB versus 6GB GTX 1060 cards', () => {
  const records = api.stage([], bundle).additions, three = records.find(p => p.name === row.name), six = records.find(p => p.name === 'GeForce GTX 1060 GAMING X 6G');
  assert.notEqual(three.id, six.id); assert.equal(three.specs.Memory, 3); assert.equal(six.specs.Memory, 6); assert.equal(three.specs['Shader units'],1152); assert.equal(six.specs['Shader units'],1280);
  assert.notEqual(api.identityKey(three),api.identityKey(six));
});
test('variant source mismatches are rejected even when similar GPU names exist', () => {
  const result = modified(packet => { const target = packet.records.find(p => p.id === row.id); target.name = 'GeForce GTX 1060 GAMING X 6G'; target.identity.commercialModel = target.name; });
  assert(!result.valid); assert(result.errors.some(e => e.includes('different product variant')));
});
test('unsourced compatibility fields cannot be injected into intake', () => {
  const packet = clone(bundle); packet.sources[row.sourceId].models[row.name].facts.clearanceCertified = { value:true,unit:'' };
  const result = api.stage([],packet); assert(!result.valid); assert(result.errors.some(e => e.includes('Unsupported field')));
});
test('contradictory source extraction cannot mix memory capacity, DDR generation or storage interface',()=>{
  assert(!modified(p=>{p.sources[row.sourceId].models[row.name].facts.memoryGB.value=6;}).valid);
  assert(!modified(p=>{const r=p.records.find(x=>x.cat==='ram');p.sources[r.sourceId].models[r.name].facts.capacityGB.value=999;}).valid);
  assert(!modified(p=>{const r=p.records.find(x=>x.cat==='ram');p.sources[r.sourceId].models[r.name].facts.generation.value='DDR3';}).valid);
  assert(!modified(p=>{const r=p.records.find(x=>x.cat==='ssd');p.sources[r.sourceId].models[r.name].facts.storageInterface.value='SAS';}).valid);
  assert(!modified(p=>{p.records[0].fields={socket:{value:'AM5'}};}).valid);
});
test('retailer and unknown source classes do not auto-promote to manufacturer evidence', () => {
  for (const confidence of ['retail-listing','manual-entry','unverified','historical-archive']) {
    const result = modified(packet => { packet.sources[row.sourceId].confidence=confidence; }); assert(!result.valid);
  }
});
test('manufacturer URL host and truthful evidence date are enforced', () => {
  assert(!modified(p => { p.sources[row.sourceId].url='https://msi.com.example.org/fake'; }).valid);
  assert(!modified(p => { p.sources[row.sourceId].inspectedAt='2999-01-01'; }).valid);
  assert(!modified(p => { p.sources[row.sourceId].inspectedAt='2026-02-30'; }).valid);
});
test('unsupported raw units reject; supported conversions are explicit', () => {
  assert.throws(() => api.normalizeUnit('lengthMm',{value:10,unit:'in'}),/Wrong unit/);
  assert.throws(() => api.normalizeUnit('transferMTs',{value:3200,unit:'MHz'}),/Wrong unit/);
  assert.equal(api.normalizeUnit('boostGHz',{value:1771,unit:'MHz'}).value,1.771);
  assert.equal(api.normalizeUnit('storageGB',{value:1.92,unit:'TB'}).value,1920);
  assert.equal(api.normalizeUnit('memoryGB',{value:2048,unit:'MiB'}).value,2);
  assert.equal(api.normalizeUnit('lengthMm',{value:null,unit:'mm'}).value,null);
  assert.throws(() => api.normalizeUnit('cores',{value:4.5,unit:''}),/integer/);
});
test('module, matched kit, RDIMM, SO-DIMM and on-die ECC distinctions survive actual import', () => {
  const records=api.stage([],bundle).additions, ram=records.filter(p=>p.cat==='ram'); assert.equal(ram.length,21);
  assert(ram.every(p=>p.identity.packageType==='module'&&p.specs.Modules===1));
  const rdimm=ram.filter(p=>p.segment==='server'); assert.equal(rdimm.length,7); assert(rdimm.every(p=>p.builderEligible===false&&p.specs['Registered memory']==='Yes'&&p.specs['System ECC']==='Yes'));
  assert.equal(ram.filter(p=>p.segment==='laptop'&&p.builderEligible===false).length,2);
  assert(ram.filter(p=>p.architecture.startsWith('DDR5')).every(p=>p.specs['System ECC']==='No'));
  assert(!modified(p=>{ const r=p.records.find(x=>x.cat==='ram');r.identity.packageType='kit'; }).valid);
  assert(!modified(p=>{ const r=p.records.find(x=>x.segment==='server'&&x.cat==='ram');r.segment='consumer';r.builderEligible=true; }).valid);
});
test('Xeon and Threadripper records cannot appear in the consumer builder',()=>{
  const cpus=api.stage([],bundle).additions.filter(p=>p.cat==='cpu'); assert.equal(cpus.length,17); assert(cpus.every(p=>!p.builderEligible&&['server','workstation'].includes(p.segment)));
  const tr=cpus.find(p=>p.name==='Ryzen Threadripper 7960X'); assert.equal(tr.specs['Total cache (L2 + L3)'],152); assert.equal(tr.specs['L3 cache'],undefined);
  assert(!modified(p=>{p.records.find(x=>x.segment==='workstation').builderEligible=true;}).valid);
});
test('DC600M capacities retain write speed, endurance and non-encrypted identity',()=>{
  const drives=api.stage([],bundle).additions.filter(p=>p.cat==='ssd');assert.equal(drives.length,5);
  const small=drives.find(p=>p.sku==='SEDC600M/480G'),large=drives.find(p=>p.sku==='SEDC600M/7680G');
  assert.equal(small.specs['Sequential write'],470);assert.equal(large.specs['Sequential write'],530);assert.equal(large.specs.Endurance,14016);
  assert.equal(large.identity.encryptionVariant,'Non-encrypted');assert(!/NVMe|SAS/.test(large.architecture));
});
test('no price, FPS, copied product photography or fabricated downloaded mesh enters this lane',()=>{
  for(const key of ['price','fps','image','photo','model3d','physical'])assert(!modified(p=>{p.records[0][key]={value:1};}).valid);
  const records=api.stage([],bundle).additions;assert(records.every(p=>!p.physical&&!p.photo&&!p.image&&!p.price&&!p.fps));
  assert.equal(bundle.candidates.length,4);assert(!records.some(p=>/EVGA/.test(p.brand)));
});
test('public catalog payload is additive, escaped and excludes bulky private intake',()=>{
  const records=clone(baseline);api.prepareCatalog(records);const context={window:{}};vm.createContext(context);vm.runInContext('const catalog=[{id:"saved-part"}];',context);vm.runInContext(api.browserSource(records),context);vm.runInContext(api.browserSource(records),context);
  assert.equal(vm.runInContext('catalog.length',context),bundle.records.length+1);assert.equal(vm.runInContext('catalog[0].id',context),'saved-part');
  const payload=context.window.PCP_TOTAL_CATALOG;assert(payload.every(p=>!p.provenance&&!p.fields));
});
test('prepare writes a real public record/provenance snapshot and truthful incremental report',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-total-catalog-')),docs=path.join(root,'review');
  const report=api.prepare({root,records:clone(baseline),docsRoot:docs});assert.equal(report.added.total,bundle.records.length);assert.equal(report.after.total,baseline.length+bundle.records.length);
  assert(fs.existsSync(path.join(root,'total-catalog-data.js')));assert.equal(JSON.parse(fs.readFileSync(path.join(root,'data/total-catalog-provenance.json'),'utf8')).records.length,bundle.records.length);
  assert.equal(report.newDownloaded3DModels,0);assert.equal(report.newRetailOffers,0);
});
test('HTML integration adds the real catalog payload once and preserves specialized builder delivery',()=>{
  const initial='<head><script src="/interface.js?v=1" defer></script></head>',once=api.polishHTML(initial,'/hardware/');assert(once.includes('src="/total-catalog-loader.js"'));assert.equal(api.polishHTML(once,'/hardware/'),once);assert(api.polishHTML(initial,'/hardware/graphics-cards/').includes('src="/total-catalog-loader.js"'));assert(api.polishHTML(initial,'/hardware/processors/').includes('src="/total-catalog-loader.js"'));assert(api.polishHTML(initial,'/compare/').includes('src="/total-catalog-data.js"'));assert.equal(api.polishHTML(initial,'/builder/'),initial);assert.equal(api.polishHTML(initial,'/performance/'),initial);
  const records=api.stage([],bundle).additions,part=records.find(p=>p.sku),product=api.polishHTML('<h2>Model notes</h2>','/learn/'+part.id+'.html',records);assert(product.includes('data-total-product-identity'));assert(product.includes(part.sku));assert.equal(api.polishHTML(product,'/learn/'+part.id+'.html',records),product);
});
test('rollback is a reviewed plan and refuses changed or unrelated records',()=>{
  const records=clone(baseline);api.prepareCatalog(records);const addition=records.find(p=>p.id===row.id);const plan=api.planRollback(records,[addition.id,'9800x3d']);assert.deepEqual(plan.removable,[addition.id]);assert.equal(plan.conflicts.length,1);assert.equal(plan.dataLoss,false);
  addition.provenance.recordHash='changed';assert.equal(api.planRollback(records,[addition.id]).removable.length,0);
});
test('identity punctuation, revision and case normalization preserve exact SKU boundaries',()=>{
  assert.equal(api.canonicalBrand(' msi '),'MSI');assert.equal(api.exactPartNumber(' KVR32N22S8/16 '),'kvr32n22s8/16');assert.notEqual(api.exactPartNumber('KVR32N22S8/16'),api.exactPartNumber('KVR32N22S8-16'));
  assert.notEqual(api.identityKey({brand:'MSI',name:'Card',identity:{revision:'1.0'}}),api.identityKey({brand:'MSI',name:'Card',identity:{revision:'2.0'}}));
});
test('malicious data and impossible source names cannot become executable catalog content',()=>{
  const malicious=JSON.parse(JSON.stringify(row).slice(0,-1)+',"__proto__":{"polluted":true}}');assert.equal(api.validateRecord(malicious,bundle.sources).valid,false);
  assert(!modified(p=>{p.records[0].name='<script>alert(1)</script>';}).valid);assert.equal({}.polluted,undefined);
});
async function checkLoader(){
  const rows=api.stage([],bundle).additions.map(api.publicPart),listeners={},status={className:'',textContent:'',dataset:{},setAttribute(){},append(button){this.button=button;}},search={value:'1060',dispatchEvent(){this.renders=(this.renders||0)+1;}},category={value:'gpu'},document={readyState:'complete',querySelector(selector){return ({'[data-total-catalog-status]':status,'#catalog-search':search,'#catalog-category':category})[selector]||null;},addEventListener(name,handler){listeners[name]=handler;},dispatchEvent(){},createElement(){return {dataset:{},setAttribute(){},addEventListener(){},append(){}};}};
  let idle,fetches=0,fail=true;
  const context={document,window:{requestIdleCallback(callback){idle=callback;}},Event:class{},CustomEvent:class{},fetch:async()=>{fetches++;return {ok:!fail,json:async()=>rows};},console};vm.createContext(context);vm.runInContext('const catalog=[{id:"existing"}]',context);vm.runInContext(api.loaderSource(),context);
  await idle();assert.equal(vm.runInContext('catalog.length',context),1);assert.equal(status.className,'empty-message');assert.match(status.textContent,/could not load/);
  fail=false;await idle();assert.equal(vm.runInContext('catalog.length',context),bundle.records.length+1);assert.equal(search.renders,1);assert.equal(search.value,'1060');assert.equal(category.value,'gpu');assert.equal(status.className,'sr-only');await idle();assert.equal(fetches,2);assert.equal(vm.runInContext('catalog.length',context),bundle.records.length+1);passed++;console.log('PASS lazy catalog retries failures, preserves filters and applies once after rendering');
}
checkLoader().then(()=>console.log(passed+' catalog intake checks passed.')).catch(error=>{console.error(error);process.exitCode=1;});
