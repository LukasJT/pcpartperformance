'use strict';
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{test}=require('node:test');
const delivery=require('./builder-photo-delivery.cjs'),selectors=require('./builder-selectors.js'),root=require('node:path').resolve('dist');
const images=JSON.parse(fs.readFileSync('dist/images.json','utf8')),context={window:{}};vm.runInNewContext(fs.readFileSync('dist/builder-catalog.js','utf8'),context);
const parts=context.window.PCP_BUILDER_CATALOG,part=id=>parts.find(p=>p.id===id);
test('exact SSD caption with a SKU survives the compact payload and client matcher',()=>{
 const image=delivery.entry(part('990pro'),images['990pro'],root);
 assert.equal(image.productId,'990pro');assert.equal(selectors.imageFor(part('990pro'),{'990pro':image}),image);
});
test('a changed capacity or caption cannot reuse a reviewed alias',()=>{
 const alias={src:'/assets/samsung.webp',kind:'exact',picturedModel:'Samsung 990 PRO 1TB MZ-V9P1T0BW'};
 assert(delivery.entry(part('990pro'),alias,root));
 assert.equal(delivery.entry(part('990pro'),{...alias,picturedModel:'Samsung 990 PRO 2TB MZ-V9P2T0BW'},root),null);
 assert.equal(delivery.entry({...part('990pro'),name:'990 PRO 2 TB'},alias,root),null);
});
test('a different partner card and a nearby PSU remain rejected',()=>{
 assert.equal(delivery.entry({id:'test',name:'GeForce RTX 5070 12G VENTUS 3X OC',brand:'MSI',cat:'gpu'},{src:'/assets/asus.webp',picturedModel:'ASUS Prime GeForce RTX 5070 OC'},root),null);
 assert.equal(delivery.entry(part('rm850x'),{src:'/assets/cx600.webp',picturedModel:'Corsair CX600M',kind:'reference'},root),null);
});
test('catalog identity is retained for reviewed exact images and licensed model renders',()=>{
 const p={id:'a',name:'NH-U12A',brand:'Noctua'},image={src:'/assets/test.webp',picturedModel:'Noctua NH-U12A',catalogName:'NH-U12A',kind:'exact'};
 assert.equal(delivery.entry(p,image,root).productId,'a');
 assert.equal(delivery.entry(p,{...image,kind:'model-render',picturedModel:'Noctua NH-U12A — 3D model render'},root).productId,'a');
 assert.equal(delivery.entry(p,{...image,src:'javascript:alert(1)'},root),null);
});
test('the starter CPU, motherboard, GPU, RAM, SSD, PSU, case, fan and cooler have usable images',()=>{
 const index=delivery.index(parts,images,root);
 for(const id of ['9800x3d','b650','retail-msi-geforce-rtx-3060-gaming-x-trio-12g','ddr5','990pro','rm850x','retail-lian-li-o11-air-mini-black','retail-lian-li-uni-fan-tl-120-wireless-black','cooler-noctua-nh-u12a']){
  assert(selectors.imageFor(part(id),index),id);assert(fs.existsSync(root+index[id].src),id+' file');
 }
});
test('all six official replacements retain reviewed identity, source, hashes and small thumbnails',()=>{
 const repairs=require('./builder-photo-repairs.json');assert.equal(Object.keys(repairs).length,6);
 for(const[id,image]of Object.entries(repairs)){
  assert.equal(image.catalogName,part(id).name,id);assert.equal(image.kind,'exact');assert.equal(image.visualReviewed,true);assert(image.identityEvidence);assert(image.sourceUrl.startsWith('https://'));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root+image.src)).digest('hex'),image.sha256);
  assert(fs.statSync(root+image.thumbnailSrc).size<16000,id+' thumbnail budget');
 }
});
test('generated builder index includes corrected identities and no invalid local assets',()=>{
 const delivered={window:{}};vm.runInNewContext(fs.readFileSync('dist/builder-images.js','utf8'),delivered);
 assert(delivered.window.PCP_IMAGES['990pro'].productId);assert(delivered.window.PCP_IMAGES['rm850x'].productId);
 for(const[id,image]of Object.entries(delivered.window.PCP_IMAGES)){
  assert(selectors.imageFor(part(id),{[id]:image}),id);if(image.src.startsWith('/'))assert(fs.existsSync(root+image.src),id);
 }
});
