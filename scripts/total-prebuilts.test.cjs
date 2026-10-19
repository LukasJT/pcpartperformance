'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const api=require('./total-prebuilts.cjs'),baseline=require('./oct14-prebuilt-data.cjs'),packet=api.readPackets(),clone=value=>JSON.parse(JSON.stringify(value));
let passed=0;function test(name,action){action();passed++;console.log('PASS '+name);}
function modified(update){const p=clone(packet);update(p);return api.stage([],p);}
test('actual primary-source fixed SKUs import while preserving all 84 regional records',()=>{
  const original=clone(baseline),merged=api.systems();assert.equal(merged.length,339);assert.deepEqual(merged.slice(0,84),original);assert.equal(api.stage(baseline).additions.length,255);assert.deepEqual(api.measure(merged.slice(84)).brands,{MSI:36,CORSAIR:9,Lenovo:210});
});
test('fixed SKU identities are counted separately from duplicate core configurations',()=>{
  const report=api.coverage();assert.equal(report.added.manufacturerPartNumbers,255);assert.equal(report.added.coreConfigurationSignatures,157);assert.equal(report.after.coreConfigurationSignatures,209);assert.equal(report.before.uniqueModelIdentifiers,76);assert.equal(report.target.met,true);assert.equal(report.after.regionalEntries,339);assert.equal(report.after.uniqueConfigurationIdentities,331);assert.equal(report.sourceRegisterEntries,255);assert.equal(report.inspectedPrimarySourceDocuments,53);
  const earlier={...packet,records:packet.records.slice(0,135)};assert.equal(api.coverage(baseline,earlier).after.coreConfigurationSignatures,142);assert.equal(api.coverage(baseline,earlier).target.met,false);
});
test('same batch is idempotent and cannot silently overwrite current records or source changes',()=>{
  const first=api.systems(),second=api.systems(first);assert.deepEqual(second,first);assert.equal(api.stage(first).unchanged.length,255);const p=clone(packet);p.sources[p.records[0].sourceId].facts.ramGB=64;assert(!api.stage(first,p).ok);
  first[84].cpu='Changed locally';assert(!api.stage(first).ok);
});
test('one invalid row rejects the entire batch before any shared mutation',()=>{
  const original=clone(baseline),p=clone(packet);p.records[3].configurationKind='configurable-family';const result=api.stage(baseline,p);assert.equal(result.ok,false);assert.equal(result.additions.length,0);assert.throws(()=>api.systems(baseline,p),/rejected/);assert.deepEqual(clone(baseline),original);
});
test('duplicate exact manufacturer part number cannot inflate counts under a second ID',()=>{
  const p=clone(packet),row=clone(p.records[0]);row.id+='-duplicate';p.records.push(row);assert(api.stage([],p).errors.some(e=>/duplicate exact/.test(e)));
  const existing=api.systems().slice(84,85);existing[0].id='older-stable-id';assert(api.stage(existing).errors.some(e=>/already exists/.test(e)));
});
test('selected source must bind exact model, part number and allowed manufacturer host',()=>{
  assert(!modified(p=>{p.records[0].manufacturerPartNumber='OTHER-123';}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].url='https://storage-asset.msi.com.evil.example/file.pdf';}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].identity.model='Different model';}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].url=p.sources[p.records[1].sourceId].url;}).ok);
});
test('facts cannot introduce invented prices, borrowed images or FPS as verified measurements',()=>{
  for(const key of ['price','imageSource','fps','stock'])assert(!modified(p=>{p.sources[p.records[0].sourceId].facts[key]=1;}).ok);
  assert(!modified(p=>{p.records[0].price=0;}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].offers=[];}).ok);
  for(const p of api.systems().slice(84)){assert.equal(p.price,null);assert.equal(p.stock,null);assert.equal(p.imageSource,null);assert.equal(p.imageKind,'category-illustration');assert.equal(p.seller,null);assert.equal(p.retailerUrl,null);assert.equal(p.sourceKind,'manufacturer-specification');}
});
test('unknown RAM module layout, exact PSU/board and N/A warranties remain unknown',()=>{
  const added=api.systems().slice(84),msi=added.filter(p=>p.brand==='MSI');assert(msi.every(p=>p.ramLayout===null));assert(msi.every(p=>p.psu.includes('exact PSU model not disclosed')));
  assert.equal(msi.find(p=>p.model.endsWith('A14NUD5-213US')).warranty,null);
  assert.equal(msi.find(p=>p.model.endsWith('B14NUC5-212US')).warranty,null);
  assert.equal(msi.find(p=>p.model.endsWith('C14NUC7-215US')).board,'MSI PRO B760-VC WIFI');
  assert.equal(added.find(p=>p.sku==='CS-9050131-NA').board,null);
});
test('DDR5 module counts and aggregate storage capacity are validated without inferred interfaces',()=>{
  assert(!modified(p=>{p.sources[p.records.find(r=>r.brand==='CORSAIR').sourceId].facts.ramModules=4;}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].facts.storageLayout='2 × 2 TB NVMe SSD';}).ok);
  const added=api.systems().slice(84),legacy=added.find(p=>p.model.endsWith('A12TA-219US'));assert.match(legacy.storage,/protocol not disclosed/);assert.equal(legacy.normalized.storageInterface,null);
  assert.equal(added.find(p=>p.sku==='CS-9060028-NA').storage,'2 × 2 TB NVMe SSD');
});
test('bad dates, units, currency, EANs and malicious data fail closed',()=>{
  for(const date of ['2026-02-31','2099-01-01','not a date'])assert(!modified(p=>{p.sources[p.records[0].sourceId].inspectedAt=date;}).ok);
  assert(!modified(p=>{p.records[0].currency='CAD';}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].facts.psuW=-750;}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].facts.ean='0000000000001';}).ok);
  assert(!modified(p=>{p.records[0].model='<script>alert(1)</script>';}).ok);
  assert(!modified(p=>{p.sources[p.records[0].sourceId].facts=null;}).ok);
  assert(!modified(p=>{p.records[0]=null;}).ok);
});
test('ambiguous title/part-code records and unavailable PDFs are excluded',()=>{
  assert.equal(packet.candidates.length,8);const names=api.systems().map(s=>s.model);for(const candidate of packet.candidates)assert(!names.includes(candidate.model));assert(packet.candidates.some(c=>/B14NVN7-440/.test(c.model)));assert.equal(api.systems().filter(p=>p.model==='90Y6006HCF').length,1);assert(!api.systems().slice(84).some(p=>p.sku==='90Y6006HCF'));
});
test('actual Lenovo fixed columns keep country, withdrawn status and mixed-drive identities',()=>{
  const records=api.systems().filter(p=>p.provenance&&p.brand==='Lenovo');assert.equal(records.length,210);assert.equal(records.filter(p=>p.region==='CA').length,27);
  const hybrid=records.find(p=>p.sku==='90UX000HFZ');assert.equal(hybrid.storage,'512 GB NVMe SSD + 1000 GB HDD');assert.equal(hybrid.normalized.storageGB,1512);assert.equal(hybrid.normalized.storageInterface,null);assert.equal(hybrid.currency,'CAD');assert.match(hybrid.status,/Withdrawn/);assert(!hybrid.psu.includes('80 PLUS'));assert.equal(hybrid.ramLayout,'2 × 16 GB');assert.equal(hybrid.board,null);
  assert(!modified(p=>{const record=p.records.find(r=>r.brand==='Lenovo');p.sources[record.sourceId].url='https://psref.lenovo.com/Detail/Legion_T5_26ARA8?M=OTHER';}).ok);
  const fourModules=records.find(p=>p.sku==='90V6000EUT');assert.equal(fourModules.ramLayout,'4 × 16 GB');assert.equal(fourModules.ram,'64 GB DDR5-4800');const pair=records.find(p=>p.sku==='90V6000TUS');assert.equal(pair.storage,'2 × 1 TB NVMe SSD');assert.equal(pair.normalized.storageGB,2000);
});
test('current-generation suffixes, CUDIMM and explicitly omitted GPU/OS survive intake',()=>{
 const added=api.systems().slice(84),newCPU=added.find(p=>p.sku==='90Y50000US');assert.equal(newCPU.cpu,'Core Ultra 7 270K Plus');assert.equal(newCPU.ram,'32 GB DDR5-6400 CUDIMM');assert.equal(newCPU.storage,'2 × 1 TB NVMe SSD');
 const bare=added.find(p=>p.sku==='90Y6000YUS');assert.equal(bare.gpu,'No discrete graphics supplied');assert.equal(bare.vram,null);assert.equal(bare.os,'No operating system supplied');assert.match(bare.warranty,/1 year base; listed upgrade: 3Y/);assert(!/Withdrawn/.test(bare.status));
 assert(!modified(p=>{const row=p.records.find(r=>r.manufacturerPartNumber==='90Y6000YUS');p.sources[row.sourceId].facts.vramGB=32;}).ok);
});
test('prepare writes real provenance, count report and original licensed-category fallback',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-prebuilts-')),docs=path.join(root,'docs'),result=api.prepare({root,reportDirectory:docs});
  assert.equal(result.systems.length,339);const source=JSON.parse(fs.readFileSync(path.join(root,'data/total-prebuilts-provenance.json'),'utf8'));assert.equal(source.addedIds.length,255);assert.equal(Object.keys(source.sources).length,255);assert(fs.readFileSync(path.join(root,'assets/illustrations/total-prebuilt-tower.svg'),'utf8').includes('not a photograph'));
  assert.equal(JSON.parse(fs.readFileSync(path.join(docs,'coverage.json'),'utf8')).after.regionalEntries,339);
});
test('reviewed manufacturer exports add 67 genuinely different core configurations, not 120 SKU aliases',()=>{
 const prior=api.systems(baseline,{...packet,records:packet.records.slice(0,135)}),current=api.systems(),cohort=current.slice(prior.length),priorSignatures=new Set(prior.map(api.coreSignature).filter(Boolean));
 assert.equal(cohort.length,120);assert.equal(new Set(cohort.map(api.coreSignature).filter(key=>!priorSignatures.has(key))).size,67);
 assert(cohort.every(p=>/Withdrawn/.test(p.status)&&p.sourceKind==='manufacturer-specification'&&p.price===null&&p.stock===null));
 const mixed=cohort.find(p=>p.sku==='90UT001UUS');assert.equal(mixed.storage,'1000 GB NVMe SSD + 1000 GB HDD');assert.equal(mixed.normalized.storageGB,2000);assert.equal(mixed.normalized.storageInterface,null);
 const legacy=cohort.find(p=>p.sku==='90RB002SUS');assert.equal(legacy.cpu,'Ryzen 7 5800');assert.equal(legacy.ram,'16 GB DDR4-3200 UDIMM');assert.equal(legacy.gpu,'GeForce RTX 3060');assert.equal(legacy.ramLayout,'2 × 8 GB');assert.equal(legacy.board,null);assert(!legacy.psu.includes('80 PLUS'));
});
test('every reviewed export row retains its exact region, module count and source identity',()=>{
 const importer=require('./total-prebuilts-psref-import.cjs'),added=api.systems().slice(219);
 for(const cohort of importer.reviewed){const rows=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/prebuilt-intake/2026-10-19/observations',cohort.file+'.rows.json'),'utf8'));for(const row of rows){const part=added.find(p=>p.sku===row.Model);assert(part,row.Model);assert.equal(part.region,row['Country/Region']==='USA'?'US':'CA');assert.deepEqual(packet.sources[part.provenance.sourceId].facts,importer.factsFor(row,cohort));}}
 const regenerated=clone(packet);assert(require('./total-prebuilts-psref-import.cjs').augment(regenerated).every(r=>r.added===0));assert.deepEqual(regenerated,packet);
});
test('unreviewed export changes, country substitutions and unknown storage formats fail closed',()=>{
 const importer=require('./total-prebuilts-psref-import.cjs'),cohort=importer.reviewed[0],row=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/prebuilt-intake/2026-10-19/observations',cohort.file+'.rows.json'),'utf8'))[0];
 assert.throws(()=>importer.factsFor({...row,Product:'Different family'},cohort),/Wrong product family/);
 assert.throws(()=>importer.factsFor({...row,'Country/Region':'UK Group'},cohort),/Unreviewed region/);
 assert.throws(()=>importer.factsFor({...row,Memory:'Up to 64GB DDR5'},cohort),/Unreviewed module layout/);
 assert.throws(()=>importer.factsFor({...row,Storage:'Up to five drives'},cohort),/Unreviewed storage/);
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-reviewed-export-'));fs.mkdirSync(path.join(temporary,'observations'));for(const suffix of ['xlsx','rows.json'])fs.copyFileSync(path.join(__dirname,'../data/prebuilt-intake/2026-10-19/observations',cohort.file+'.'+suffix),path.join(temporary,'observations',cohort.file+'.'+suffix));
 fs.appendFileSync(path.join(temporary,'observations',cohort.file+'.rows.json'),' ');assert.throws(()=>importer.augment({records:[],sources:{}},{directory:temporary}),/Reviewed export evidence changed/);
});
console.log(passed+' prebuilt intake checks passed.');
