'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const prepare=require('./prepare-total-cpu-photos-oct19.cjs'),photos=require('./component-photo-total-cpu-oct19.json'),rows=require('../data/photo-intake/2026-10-19/total-cpu.json'),review=require('../data/photo-intake/2026-10-19/total-cpu-review.json');
const c=require('./total-catalog.cjs'),parts=c.prepareCatalog(c.loadExisting()),root=path.resolve(__dirname,'..'),clone=v=>JSON.parse(JSON.stringify(v));
test('18 exact visible-model CPU photographs cover all17 new reference records and historical4004',async()=>{
 assert.equal(prepare.validateIntake(rows,parts),true);const result=await prepare.validatePrepared(photos,parts);assert.equal(result.records,18);assert.equal(result.generatedOrSubstitutedPhotos,0);assert.equal(result.newReferenceCpus,17);
 for(const row of rows){const image=photos[row.id],part=parts.find(p=>p.id===row.id);assert.equal(image.catalogName,part.name);assert.equal(image.visualReviewed,true);assert.equal(image.modelLabelVerified,true);assert.equal(image.kind,'exact');assert.match(image.identityEvidence,/actual processor/);assert(fs.existsSync(path.join(root,image.visualReviewSheet)));assert.equal(image.sourceSha256,review.entries[row.id].sourceSha256);}
});
test('wrong CPU variants, family-only labels, duplicate IDs and invalid source protocols are rejected',()=>{
 for(const mutate of [r=>r[0].expectedLabel='Xeon E5-1620 v3',r=>r[0].expectedLabel='Xeon',r=>r[0].expectedLabel='',r=>r[0].id=rows[1].id,r=>r[0].imageUrl='http://example.com/cpu.jpg',r=>r[0].sourceUrl='https://user:secret@example.com/product']){const changed=clone(rows);mutate(changed);assert.throws(()=>prepare.validateIntake(changed,parts));}
});
test('review binds the exact downloaded bytes, source gallery and visible model before any preparation',()=>{
 fs.mkdirSync(path.join(root,'tmp'),{recursive:true});const cache=fs.mkdtempSync(path.join(root,'tmp/cpu-review-test-'));try{for(const row of rows)fs.writeFileSync(path.join(cache,row.id+'.source'),'review fixture '+row.id);const packet=clone(review);for(const row of rows)packet.entries[row.id].sourceSha256=prepare.sha(fs.readFileSync(path.join(cache,row.id+'.source')));assert.equal(prepare.validateReview(rows,packet,cache),true);
  for(const mutate of [p=>p.entries[rows[0].id].visualReviewed=false,p=>p.entries[rows[0].id].modelLabelVerified=false,p=>p.entries[rows[0].id].sourceSha256='0'.repeat(64),p=>p.entries[rows[0].id].sourceUrl='https://example.com/another-model']){const changed=clone(packet);mutate(changed);assert.throws(()=>prepare.validateReview(rows,changed,cache));}
  fs.writeFileSync(path.join(cache,rows[0].id+'.source'),'changed pixels');assert.throws(()=>prepare.validateReview(rows,packet,cache),/changed after visual review/);
 }finally{for(const file of fs.readdirSync(cache))fs.unlinkSync(path.join(cache,file));fs.rmdirSync(cache);}
});
test('historical photograph keeps native resolution, actual creator, license and modification notice',()=>{
 const p=photos.intel4004;assert.equal(p.sourceWidth,300);assert.equal(p.sourceHeight,289);assert.equal(p.width,300);assert.equal(p.height,289);assert.equal(p.thumbnailWidth,300);assert.equal(p.license,'CC BY-SA 3.0');assert.equal(p.licenseUrl,'https://creativecommons.org/licenses/by-sa/3.0/');assert.match(p.attribution,/LucaDetomi/);assert.match(p.licenseNote,/same CC BY-SA 3.0/);assert.match(p.modifications,/without enlargement/);
});
test('supplier photographs do not fabricate reuse licenses, live offers or CPU compatibility',()=>{
 for(const[id,p]of Object.entries(photos)){if(id==='intel4004')continue;assert.equal(p.rightsStatus,'published-product-media-no-open-license-recorded');assert.match(p.license,/no open license/);assert.equal(p.licenseUrl,p.sourceUrl);assert.equal(p.official,false);for(const key of ['price','offer','benchmarks','measuredFps','socket','manufacturerSku'])assert.equal(p[key],undefined);}
 assert.match(photos['total-cpu-amd-ryzen-threadripper-pro-7985wx'].identityEvidence,/Dell-locked/);assert.match(photos['total-cpu-intel-xeon-e5-2620-v4'].identityEvidence,/erroneously saysV2/);
});
test('changed prepared images and wrong catalog names cannot enter existing shared photo delivery',()=>{
 const validator=require('./component-photo-catalog.cjs'),id=rows[0].id;assert.deepEqual(validator.validate(parts,photos),[]);
 for(const patch of [{catalogName:'Xeon E5-1620 v3'},{visualReviewed:false},{sha256:'0'.repeat(64)},{thumbnailSha256:'0'.repeat(64)}])assert(validator.validate(parts,{[id]:{...photos[id],...patch}}).length>0);
});
