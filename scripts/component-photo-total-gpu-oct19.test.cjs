'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.PCP_SHARP_PATH||'../tools/quality/node_modules/sharp');
const root=path.resolve(__dirname,'..'),parts=require('../data/catalog-intake/2026-10-19/batch-gpu.json').records,photos=require('./component-photo-total-gpu-oct19.json'),validator=require('./component-photo-catalog.cjs');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
test('twenty exact partner GPU photos match their catalog names and retain truthful rights status',()=>{
 assert.equal(parts.length,20);assert.equal(Object.keys(photos).length,20);assert.deepEqual(validator.validate(parts,photos),[]);
 for(const p of parts){const r=photos[p.id];assert.equal(r.catalogName,p.name);assert.equal(r.kind,'exact');assert.equal(r.memoryGB,Number(p.summary.match(/^(\d+) GB/)[1]));assert.equal(r.rightsStatus,'published-product-media-no-open-license-recorded');assert(!/CC-BY|public domain|permission granted/i.test(r.license));assert.equal(r.visualReviewed,true);assert(fs.existsSync(path.join(root,r.visualReviewSheet)));}
});
test('every full photo and thumbnail decodes, meets size limits and matches its reviewed hash',async()=>{
 for(const r of Object.values(photos)){for(const [field,max,hash,bytes]of[['src',800,r.sha256,r.bytes],['thumbnailSrc',320,r.thumbnailSha256,r.thumbnailBytes]]){const buffer=fs.readFileSync(path.join(root,'dist',r[field])),meta=await sharp(buffer).metadata();assert.equal(meta.format,'webp');assert(meta.width>0&&meta.height>0&&Math.max(meta.width,meta.height)<=max);assert.equal(buffer.length,bytes);assert.equal(sha(buffer),hash);if(field==='thumbnailSrc')assert(buffer.length<=40000);const stats=await sharp(buffer).stats();assert(stats.channels.some(c=>c.stdev>20),'blank/mask-like prepared photo: '+r.catalogName);}}
});
test('variant-name drift and changed photo bytes are rejected before parent integration',()=>{
 const id=parts[0].id,r=photos[id];assert(validator.validate(parts,{[id]:{...r,catalogName:'GeForce GTX 960 GAMING 4G'}}).some(e=>e.includes('identity')));assert(validator.validate(parts,{[id]:{...r,sha256:'0'.repeat(64)}}).some(e=>e.includes('changed after review')));
 // Delivery CI checks the frozen source/review/registry hash joins and actual
 // shipped pixels above. Source preparation separately requires native cached
 // bytes to match the review before creating any derivative; ignored download
 // caches are deliberately not CI fixtures or redistributed source assets.
 const extracted=require('../docs/total-refinement/photos/gpu/extraction.json').rows,reviewed=require('../docs/total-refinement/photos/gpu/reviewed-selection.json').rows;for(const record of extracted){const review=reviewed.find(x=>x.id===record.id),image=photos[record.id];assert.equal(record.extractedSha256,review.extractedSha256);assert.equal(image.extractedSha256,review.extractedSha256);assert.equal(image.sourceSha256,record.sourceSha256);assert.equal(image.sourceSha256,review.sourceSha256);if(record.brand==='MSI'){assert.equal(record.exactModelTextVerified,true);assert(['I6.png','I8.png'].includes(record.sourceImageObject));}}
});
