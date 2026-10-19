'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('./total-catalog.cjs'),photos=require('./component-photo-catalog.cjs');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'data/catalog-intake/2026-10-19-hardware-next'),bundle=catalog.loadPackets(directory),images=require('./component-photo-total-hardware-next-oct19.json');
const facts=name=>{const row=bundle.records.find(r=>r.name===name);return bundle.sources[row.sourceId].models[name].facts;};
test('12 distinct exact coolers stage against the actual complete existing catalog without duplicate identity',()=>{
 const base=catalog.loadExisting(),older=catalog.stage(base,catalog.loadPackets(path.join(root,'data/catalog-intake/2026-10-19')));assert.equal(older.valid,true);
 const existing=base.concat(older.additions),stage=catalog.stage(existing,bundle);assert.equal(stage.valid,true,JSON.stringify(stage.errors));assert.equal(stage.additions.length+stage.unchanged.length,12);assert.equal(new Set(bundle.records.map(catalog.identityKey)).size,12);
 const applied=existing.concat(stage.additions),again=catalog.stage(applied,bundle);assert.equal(again.valid,true);assert.equal(again.additions.length,0);assert.equal(again.unchanged.length,12);
});
test('published socket lists stay model-specific and preserve real plus-sign socket names',()=>{
 for(const name of['MPG CORELIQUID K240','MPG CORELIQUID K360']){const sockets=facts(name).coolerSockets.value;assert(!sockets.includes('LGA1700'));assert(!sockets.includes('LGA1851'));assert(sockets.includes('AM3+'));assert(sockets.includes('FM2+'));}
 assert(!facts('MAG CORELIQUID E240').coolerSockets.value.includes('TR4'));assert(facts('MAG CORELIQUID E360').coolerSockets.value.includes('TR4'));
 assert(!facts('MAG CORELIQUID P240').coolerSockets.value.includes('SP3'));assert(facts('MAG CORELIQUID P360').coolerSockets.value.includes('SP3'));
 assert(facts('MAG CORELIQUID I360').coolerSockets.value.includes('LGA1851'));
});
test('lighting connectors, unknown nominal classes and radiator dimensions are not invented into fit guarantees',()=>{
 assert.equal(facts('MAG CORELIQUID I360').fanConnector.value,null);
 for(const name of['MAG CORELIQUID P240','MAG CORELIQUID P360','MAG CORELIQUID C240','MAG CORELIQUID C280','MAG CORELIQUID C360'])assert.equal(facts(name).radiatorSizeMm.value,null);
 assert.equal(facts('MAG CORELIQUID C280').fanSizeMm.value,140);assert.equal(facts('MAG CORELIQUID C280').radiatorLengthMm.value,316);
 assert.equal(facts('MEG CORELIQUID S360').fanThicknessMm.value,27.5);
 assert.equal(facts('MAG CORELIQUID E360').radiatorWidthMm.value,119.2);assert.equal(facts('MAG CORELIQUID I360').radiatorWidthMm.value,120);
 for(const row of bundle.records){assert.equal(row.identity.manufacturerPartNumber,null);assert.equal(row.identity.revision,null);assert.match(row.note,/required bracket is included/);assert.match(row.note,/installed stack/);assert.equal(row.price,undefined);assert.equal(row.model3d,undefined);}
 const row=bundle.records.find(r=>r.name==='MAG CORELIQUID C280'),converted=catalog.toCatalog(row,catalog.validateRecord(row,bundle.sources));assert.equal(converted.fields.coolingType.value,'aio');assert(Array.isArray(converted.fields.supportedSockets.value));assert.equal(converted.fields.radiatorSize.value,null);assert.equal(converted.fields.radiatorSize.status,'unknown');assert.equal(converted.fields.radiatorLength.value,316);
});
test('every photo has the exact named source, reviewed color object, correct bytes and compact derivatives',()=>{
 assert.deepEqual(photos.validate(bundle.records,images),[]);assert.equal(Object.keys(images).length,12);
 for(const row of bundle.records){const image=images[row.id],source=bundle.sources[row.sourceId];assert.equal(image.catalogName,row.name);assert.equal(image.imageUrl,source.url);assert.equal(image.sourceSha256,source.sourceSha256);assert.equal(image.kind,'exact');assert.equal(image.sourceImageObject,'I4.png');assert.equal(image.visualReviewed,true);assert.equal(image.rightsStatus,'published-product-media-no-open-license-recorded');assert(!/creative commons|\bcc-by\b/i.test(image.license));assert(image.width<=800&&image.height<=800);assert(image.thumbnailWidth<=320&&image.thumbnailHeight<=320);assert(image.thumbnailBytes<=40000);assert(fs.existsSync(path.join(root,image.visualReviewSheet)));
  const bytes=fs.readFileSync(path.join(root,'dist',image.src));assert.equal(bytes.length,image.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),image.sha256);
 }
});
test('the real compatibility engine consumes all12 AIOs without granting installed fit or mounting certainty',()=>{
 const engine=require('./compatibility-evidence.cjs'),parts=catalog.stage([],bundle).additions;
 for(const cooler of parts){
  const cpu={id:'9800x3d',cat:'cpu',name:'Ryzen 7 9800X3D'},report=engine.createReadiness({parts:{cpu:[cpu],cooler:[cooler]}}),check=id=>report.checks.find(row=>row.id===id);
  assert.equal(engine.field(cooler,'coolingType').value,'aio');assert.equal(check('cooler-socket').state,'passed',cooler.name);
  for(const id of['radiator-layout','cooler-kit','cooler-ram'])assert.equal(check(id).state,'needs-verification',cooler.name+' '+id);
  assert.equal(check('cooling-behavior').state,'unperformed');assert.notEqual(report.status,'compatible');
  const uncertain=engine.createReadiness({parts:{cpu:[{id:'undocumented-cpu',cat:'cpu',name:'AM5 example',architecture:'AM5'}],cooler:[cooler]}});
  assert.equal(uncertain.checks.find(row=>row.id==='cooler-socket').state,'needs-verification');
 }
 const oldK=parts.find(p=>p.name==='MPG CORELIQUID K240'),modernIntel={id:'i714700k',cat:'cpu',name:'Core i7-14700K'};
 // No undocumented newer-socket pass is introduced by this intake. The engine
 // retains its existing mismatch semantics; package-bracket review is separate.
 assert.notEqual(engine.createReadiness({parts:{cpu:[modernIntel],cooler:[oldK]}}).checks.find(row=>row.id==='cooler-socket').state,'passed');
});
