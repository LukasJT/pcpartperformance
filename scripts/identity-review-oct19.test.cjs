'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const review=require('./identity-review-oct19.cjs');
const clone=value=>JSON.parse(JSON.stringify(value));
const fixture=()=>review.packet().records.map(row=>clone(row.original));

test('seven researched ambiguities have primary-source scopes without invented photos or replacements',()=>{
 const packet=review.packet();assert.equal(packet.records.length,7);assert.equal(Object.keys(packet.sources).length,11);assert.equal(review.validatePacket(packet),true);
 for(const row of packet.records){assert.equal(row.replacementId,null);assert.equal(row.verifiedExactPhoto,false);assert.match(row.warning,/unverified|needs|does not identify/);}
 assert.equal(packet.sources['crucial-c40-product'].status,'access-unavailable');assert.match(packet.sources['seagate-ironwolf-support'].scope,/18TB/);assert.match(packet.sources['coolermaster-masterplus'].scope,/V650/);
 assert.match(packet.records[1].finding,/CTCED596G6000HC30DDC01/,'Exact part-number characters must not be reformatted');
});

test('quarantine retains IDs and labels but removes unsupported specs from active compatibility evidence',()=>{
 const records=fixture(),names=records.map(row=>row.name),ids=records.map(row=>row.id),result=review.applyCatalog(records);
 assert.equal(result.reviewed,7);assert.deepEqual(records.map(row=>row.id),ids);assert.deepEqual(records.map(row=>row.name),names);assert.equal(result.automaticSubstitutions,0);assert.equal(result.photoBindingsAdded,0);
 records.forEach((row,index)=>{assert.equal(row.builderEligible,false);assert.equal(row.indexable,false);assert.equal(row.identityStatus,'needs-exact-identity');assert.equal(row.sourceStatus,'unverified');assert.deepEqual(row.fields,{});assert.deepEqual(row.evidence.fields,{});assert.equal(row.physical,null);assert.ok(Object.values(row.specs).every(value=>typeof value!=='number'));assert.deepEqual(row.identityReview.original.specs,review.packet().records[index].original.specs);assert.equal(row.identity.manufacturerPartNumber,null);});
 const before=clone(records);review.applyCatalog(records);assert.deepEqual(records,before,'Repeated catalog preparation must be idempotent');
});

test('unsupported previously synthesized fields are retained only in the audit snapshot',()=>{
 const rows=fixture();rows[0].fields={capacity:{value:64,status:'manufacturer-specified'}};rows[0].evidence={fields:{capacity:{value:64,exact:true}}};review.applyCatalog(rows);
 assert.deepEqual(rows[0].fields,{});assert.deepEqual(rows[0].evidence.fields,{});assert.equal(rows[0].identityReview.original.fields.capacity.value,64);assert.equal(rows[0].identityReview.original.evidence.fields.capacity.exact,true);
});

test('unrelated products, verified identities and original source data are not silently modified',()=>{
 const rows=fixture(),control={id:'documented-real-model',cat:'ram',name:'Verified kit',specs:{Memory:64},sku:'REAL-64'},before=clone(control);rows.push(control);review.applyCatalog(rows);assert.deepEqual(control,before);
 const changed=fixture();changed[6].sku='ST24000NT002';const untouched=clone(changed);assert.throws(()=>review.applyCatalog(changed),/identity changed/);assert.deepEqual(changed,untouched);
 const renamed=fixture();renamed[6].name='Seagate IronWolf Pro 24TB';assert.throws(()=>review.applyCatalog(renamed),/identity changed/);
 assert.throws(()=>review.applyCatalog(fixture().slice(1)),/Missing retained identity/);assert.throws(()=>review.applyCatalog([...fixture(),fixture()[0]]),/Duplicate/);
});

test('saved and imported values survive review exactly, including repeated IDs and private metadata',()=>{
 const ids=review.IDS,selection={parts:{ram:[ids[0],ids[1]],psu:[ids[2],ids[4]],case:[ids[3]],ssd:[ids[5],ids[5]],hdd:[ids[6]],gpu:['unrelated-saved-id']},name:'My old build',privateNotes:'Private ownership note',owned:[ids[0]],costs:{[ids[5]]:419.99},locked:[ids[1]],fans:[{position:'rear',flow:'exhaust'}]},before=clone(selection);
 const result=review.inspectSavedSelection(selection);assert.equal(result.selection,selection);assert.deepEqual(selection,before);assert.equal(result.changed,false);assert.deepEqual(result.droppedIds,[]);assert.deepEqual(result.substitutions,[]);assert.equal(result.warnings.length,8);assert.equal(result.blocksVerifiedReadiness,true);assert.ok(result.warnings.every(warning=>warning.state==='unknown'&&warning.retain&&warning.replacementId===null));
 const instances={ram:[{id:ids[0],instance:'memory-1'},{id:ids[0],instance:'memory-2'}]};assert.equal(review.inspectSavedSelection(instances).warnings.length,2);assert.equal(review.inspectSavedSelection({parts:{gpu:['normal-id']}}).blocksVerifiedReadiness,false);
});

test('restoration references keep saved IDs loadable while eligibility excludes new choices',()=>{
 const records=fixture();review.applyCatalog(records);const references=review.restorationReferences(records);assert.equal(references.length,7);assert.equal(references.filter(row=>row.builderEligible!==false).length,0);
 // Use the real builder's published membership behavior, rather than pretending
 // a hidden picker item can be removed from the restore lookup safely.
 const source=fs.readFileSync(require('node:path').join(__dirname,'builder-v2.js'),'utf8'),membership=source.match(/const ids=\(Array\.isArray\(snapshot\?\.parts\?\.\[slot.id\]\)[\s\S]*?\.slice\(0,99\);/);
 assert.ok(membership,'Actual builder restore membership check must remain recognizable');
 const context={catalog:references,snapshot:{parts:{ram:[review.IDS[0],review.IDS[1]],psu:[review.IDS[2]]}},slot:{id:'ram'}};vm.createContext(context);vm.runInContext(membership[0]+'globalThis.retained=ids;',context);assert.deepEqual(Array.from(context.retained),[review.IDS[0],review.IDS[1]]);
 assert.equal(review.selectionPolicy(review.IDS[0]).allowNewSelection,false);assert.equal(review.selectionPolicy(review.IDS[0]).retainSavedSelection,true);assert.equal(review.selectionPolicy('unrelated').allowNewSelection,true);
 assert.ok(references.every(row=>row.identityWarning&&!row.identityReview),'Small public restore records must not carry the old claims as active specs');
});

test('unsafe or mismatched packets cannot redirect evidence or publish substitutes',()=>{
 const bad=review.packet();bad.records[0].replacementId='a-different-product';assert.throws(()=>review.validatePacket(bad),/Invalid review identity/);
 const url=review.packet();url.sources['teamgroup-expert-matrix'].url='http://127.0.0.1/private';assert.throws(()=>review.validatePacket(url),/Invalid identity source/);
 const claim=review.packet();claim.records[0].verifiedExactPhoto=true;assert.throws(()=>review.validatePacket(claim),/Invalid review identity/);
 const pollution=JSON.parse(JSON.stringify(review.packet()).replace('"schema":1','"schema":1,"__proto__":{"polluted":true}'));assert.throws(()=>review.validatePacket(pollution),/Unsafe key/);assert.equal({}.polluted,undefined);
});
