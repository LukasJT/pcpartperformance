'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {parseGallery,fetchBytes}=require('./photos-kingston-oct19.cjs'),store=require('./photos-kingston-store-oct19.cjs');
const expected={sku:'KVR32N22S6/8',retailerSku:'6202469'};
const html=(mpn='KVR32N22S6/8',sku='6202469',image='https://webobjects2.cdw.com/is/image/CDW/6202469?$product-detail$')=>`<link rel="canonical" href="https://www.cdw.com/product/ram/6202469"><span itemprop="mpn">${mpn}</span><span itemprop="sku">${sku}</span><img itemprop="image" src="${image}">`;
test('selected MPN and retailer gallery must agree, never a nearby recommendation or other variant',()=>{
 assert.equal(parseGallery(html(),expected).manufacturerPartNumber,expected.sku);
 for(const invalid of [html('KVR32N22S8/8'),html(undefined,'5794538'),html(undefined,undefined,'https://webobjects2.cdw.com/is/image/CDW/5794538?$product-detail$'),html().replace('www.cdw.com','www.cdw.com.example.org')])assert.throws(()=>parseGallery(invalid,expected));
});
test('photo downloads reject external redirect targets, oversized bodies and failed responses',async()=>{
 await assert.rejects(fetchBytes('https://www.cdw.com/product/ram',100,async()=>new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}})),/Unapproved/);
 await assert.rejects(fetchBytes('https://www.cdw.com/product/ram',2,async()=>new Response('large')),/size limit/);
 await assert.rejects(fetchBytes('https://www.cdw.com/product/ram',100,async()=>new Response('x',{status:403})),/HTTP 403/);
 const result=await fetchBytes('https://www.cdw.com/product/ram',100,async()=>new Response('bytes'));assert.equal(result.bytes.toString(),'bytes');
});
test('the manufacturer store must assign its original gallery to exactly the selected SKU',()=>{
 const row={sku:'KVR32N22S6/4',variants:['KVR32N22S6/4'],sourceUrl:'https://www.kingstonstore.com.br/products/kvr32n22s6-4',images:[{src:'https://cdn.shopify.com/s/files/1/0134/2924/4004/products/ram.jpg',width:2400,height:1500}]};
 assert.equal(store.gallery(row).sourceUrl,row.sourceUrl);
 for(const changed of [{...row,variants:['KVR32N22S6/8']},{...row,variants:[row.sku,'another']},{...row,sourceUrl:row.sourceUrl+'-other'},{...row,images:[{...row.images[0],src:'https://cdn.shopify.com/s/files/another-shop/ram.jpg'}]}])assert.throws(()=>store.gallery(changed));
});
test('all26 Kingston images are individually reviewed, with correct native source sizes and no placeholders',()=>{
 const registry=require('./component-photo-total-kingston-oct19.json');assert.equal(Object.keys(registry).length,26);
 for(const image of Object.values(registry)){assert.equal(image.visualReviewed,true);assert.ok(image.sourceWidth>=500&&image.sourceHeight>=100);assert.ok(image.width<=image.sourceWidth&&image.height<=image.sourceHeight);assert.ok(image.thumbnailBytes<=40000);assert.match(image.identityEvidence,/Visually reviewed/);assert.equal(image.kind,'exact');}
});
test('repeat collection preserves only identical already-reviewed source pixels and exact gallery identity',()=>{
 const row={sku:'KVR32N22S6/4'},source={sourceUrl:'https://www.kingstonstore.com.br/products/kvr32n22s6-4',imageUrl:'https://cdn.shopify.com/s/files/1/0134/2924/4004/products/ram.jpg'},previous={visualReviewed:true,manufacturerSku:row.sku,...source,sourceSha256:'original-hash'};
 assert.equal(store.unchangedReview(previous,row,source,'original-hash'),true);
 for(const changed of [{...previous,visualReviewed:false},{...previous,manufacturerSku:'KVR32N22S6/8'},{...previous,sourceUrl:source.sourceUrl+'-other'},{...previous,sourceSha256:'changed-pixels'}])assert.equal(store.unchangedReview(changed,row,source,'original-hash'),false);
});
