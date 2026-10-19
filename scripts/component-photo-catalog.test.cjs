'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const registry=require('./component-photo-catalog.cjs'),delivery=require('./builder-photo-delivery.cjs'),thumbnails=require('./program-image-delivery.cjs');
const root=path.resolve('dist'),total=require('./total-catalog.cjs');
const parts=total.prepareCatalog(total.loadExisting()),images=registry.load(parts),part=id=>parts.find(p=>p.id===id);
test('every catalog repair has a reviewed identity, unchanged full image and thumbnail, and a source record',()=>{assert(Object.keys(images).length>=348);assert.deepEqual(registry.validate(parts,images),[]);});
test('a generic GPU must match both the selected chip and its memory capacity',()=>{
 const [id,image]=Object.entries(images).find(([,i])=>i.kind==='same-chip-variant');assert(id);
 assert.equal(delivery.entry(part(id),image,root).productId,id);
 for(const changed of [{...image,memoryGB:image.memoryGB+4},{...image,gpuModel:'Another GPU'},{...image,visualReviewed:false}]){assert(registry.validate(parts,{[id]:changed}).length);assert.equal(delivery.entry(part(id),changed,root),null);}
});
test('a named partner SKU cannot inherit a different partner card through the generic-chip path',()=>{
 const [,generic]=Object.entries(images).find(([,i])=>i.kind==='same-chip-variant'),p=parts.find(p=>p.id.startsWith('retail-')&&p.cat==='gpu');
 const wrong={...generic,catalogName:p.name,gpuModel:p.name,memoryGB:Number(p.specs.Memory)};
 assert(registry.validate(parts,{[p.id]:wrong}).length);assert.equal(delivery.entry(p,wrong,root),null);
});
test('wrong catalog identities, unreviewed media and unsafe paths cannot enter the registry',()=>{
 const [id,image]=Object.entries(images)[0];
 for(const changed of [{...image,catalogName:'Different model'},{...image,visualReviewed:false},{...image,src:'/assets/hardware/catalog-other/../../secret.webp'},{...image,sourceUrl:'http://example.com/product'},{...image,sha256:'0'.repeat(64)},{...image,thumbnailSha256:'0'.repeat(64)}])assert(registry.validate(parts,{[id]:changed}).length,id);
});
test('new catalog list delivery uses the reviewed small local thumbnail while keeping the full image available',()=>{
 for(const[id,image]of Object.entries(images)){
  const thumb=thumbnails.thumbnail(id,image,root);assert.equal(thumb.src,image.thumbnailSrc,id);assert(thumb.width<=320&&thumb.height<=320);assert.equal(thumbnails.source(id,image,root),image.thumbnailSrc);
  const html=thumbnails.catalogHTML('<img src="'+image.src+'" width="800" height="800" alt="product">',{[id]:image},root);assert(html.includes('src="'+image.thumbnailSrc+'"'));assert(fs.existsSync(root+image.src));
 }
});
test('catalog payloads preserve pictured GPU variants and comparison credits without transferring research-only data',()=>{
 for(const[id,image]of Object.entries(images)){
  const p=part(id),list=thumbnails.catalogEntry(p,image,root),compare=thumbnails.comparisonEntry(id,image,root);
  assert.equal(list.src,image.thumbnailSrc);if(image.kind!=='exact')assert.equal(list.picturedModel,image.picturedModel);else assert.equal(list.picturedModel,undefined);
  assert.equal(compare.src,image.src);assert.equal(compare.thumbnailSrc,image.thumbnailSrc);
  for(const key of ['attribution','license','licenseUrl','sourceUrl','picturedModel'])assert.equal(compare[key],image[key]);
  for(const key of ['sourceSha256','sha256','identityEvidence','visualReviewed','reviewedAt'])assert.equal(compare[key],undefined);
 }
});
test('compact catalog delivery restores every image and pictured identity without a second request',()=>{
 const entries=Object.fromEntries(Object.entries(images).map(([id,image])=>[id,thumbnails.catalogEntry(part(id),image,root)]));
 const context={window:{}};vm.runInNewContext(thumbnails.catalogScript(entries),context);
 assert.deepEqual(JSON.parse(JSON.stringify(context.window.PCP_IMAGES)),entries);
 assert(!thumbnails.catalogScript(entries).includes('fetch('));
 const mixed={one:{src:'/a/one-hash.webp'},two:{src:'/a/other.webp',picturedModel:'Actual pictured variant <sample>'},three:{src:'/b/three.webp'}};
 vm.runInNewContext(thumbnails.catalogScript(mixed),context);
 assert.deepEqual(JSON.parse(JSON.stringify(context.window.PCP_IMAGES)),mixed);
 vm.runInNewContext(fs.readFileSync('dist/image-catalog-lite.js','utf8'),context);
 assert(Object.keys(context.window.PCP_IMAGES).length>=Object.keys(images).length);
});
test('the repaired GPU photo cohort remains covered; new intake without licensed photos stays explicitly illustrated',()=>{
 assert.equal(part('ibm-vga').specs.Memory,0.000256);
 assert.equal(images['ibm-vga'].memoryKB,256);
 const generated=JSON.parse(fs.readFileSync('dist/images.json','utf8'));
 const newIds=new Set(require('./total-catalog.cjs').loadPackets().records.map(p=>p.id)),coverage=require('../docs/total-refinement/catalog/coverage.json');
 for(const p of parts.filter(p=>p.cat==='gpu')){
  if(newIds.has(p.id)&&!generated[p.id]){assert(coverage.gaps.newExactImagesMissing.includes(p.id),p.id+' missing photo must remain in the coverage report');assert(require('./builder-selectors.js').icon('gpu').includes('<circle'));continue;}
  assert(delivery.entry(p,generated[p.id],root),p.id+' previously covered graphics-card photo is missing');
 }
});
test('the generated image map is consistent with all reviewed corrections and never substitutes an unmatched component',()=>{
 const generated=JSON.parse(fs.readFileSync('dist/images.json','utf8'));
 for(const[id,image]of Object.entries(images))assert.equal(generated[id]?.src,image.src,id);
 for(const p of parts.filter(part=>registry.categories.has(part.cat)))if(generated[p.id])assert(delivery.entry(p,generated[p.id],root),p.id+' has an unmatched component image');
});
test('every repaired product page delivers its own full picture and keeps the source disclosure',()=>{
 for(const[id,image]of Object.entries(images)){
  const html=fs.readFileSync(path.join(root,'learn',id+'.html'),'utf8');
  assert(html.includes('src="'+image.src+'"'),id+' product page is using a stale photo');
  assert(html.includes('Image source'),id+' source disclosure missing');
  if(image.modifications)assert(html.includes('Image changes:'),id+' derivative change notice missing');
 }
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/image-catalog.js','utf8'),ctx);
 for(const[id,image]of Object.entries(images)){assert.equal(ctx.window.PCP_IMAGES[id].src,image.src);assert.equal(ctx.window.PCP_IMAGES[id].sha256,undefined);assert.equal(ctx.window.PCP_IMAGES[id].licenseUrl,image.licenseUrl);}
});
