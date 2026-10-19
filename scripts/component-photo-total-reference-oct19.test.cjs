'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const moduleUnderTest=require('./prepare-total-reference-photos-oct19.cjs'),registry=require('./component-photo-total-reference-oct19.json'),rows=require('../data/photo-intake/2026-10-19/total-reference.json'),c=require('./total-catalog.cjs'),parts=c.prepareCatalog(c.loadExisting());
test('three exact rendered-only entries receive reviewed original product photographs',async()=>{
 assert.equal(moduleUnderTest.validateRows(rows,parts),true);assert.deepEqual(await moduleUnderTest.validate(),{records:3,actualPhotographs:3,modelRenderReplacements:3,modelFilesChanged:0});
 for(const row of rows){const p=registry[row.id];assert.equal(p.catalogName,parts.find(p=>p.id===row.id).name);assert.equal(p.kind,'exact');assert.equal(p.visualReviewed,true);assert(fs.existsSync(path.resolve(__dirname,'..',p.visualReviewSheet)));assert.equal(p.sourceSha256,row.sourceSha256);}
});
test('photos remain distinct from sibling models and uncertain SKU or compatibility claims',()=>{
 assert.match(registry['retail-asus-z170-p'].identityEvidence,/no Z170-P D3/);assert.match(registry['retail-cooler-master-masterbox-lite-5'].identityEvidence,/RGB, TG and PSU-bundle siblings excluded/);assert.match(registry['retail-cooler-master-masterbox-lite-5'].identityEvidence,/does not establish/);assert.match(registry['completion-cpu-intel-core-i5-661'].picturedModel,/SLBNE/);
 for(const p of Object.values(registry)){assert.equal(p.rightsStatus,'published-product-media-no-open-license-recorded');assert.match(p.license,/no open license/);assert.equal(p.licenseUrl,p.sourceUrl);assert.match(p.modifications,/without enlargement/);assert(p.thumbnailBytes<=40000);for(const field of ['price','socket','physical','verifiedFit','manufacturerSku'])assert.equal(p[field],undefined);}
});
test('wrong identities, unsafe sources, unreviewed inputs and changed prepared pixels are rejected',()=>{
 for(const mutate of [r=>r[0].catalogName='Z170-P D3',r=>r[1].id=rows[0].id,r=>r[0].visualReviewed=false,r=>r[0].cacheFile='../../secret',r=>r[0].sourceUrl='http://example.com/model']){const changed=JSON.parse(JSON.stringify(rows));mutate(changed);assert.throws(()=>moduleUnderTest.validateRows(changed,parts));}
 const validator=require('./component-photo-catalog.cjs'),id=rows[0].id;for(const patch of [{catalogName:'Z170-P D3'},{visualReviewed:false},{sha256:'0'.repeat(64)},{thumbnailSha256:'0'.repeat(64)}])assert(validator.validate(parts,{[id]:{...registry[id],...patch}}).length>0);
});
