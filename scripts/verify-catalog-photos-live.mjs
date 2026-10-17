import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import registry from './component-photo-catalog.cjs';
const expected=process.argv[2],origin='https://www.pcpartperformance.com',checks=[],context={window:{}};
assert.match(expected||'',/^[a-f0-9]{40}$/);vm.runInNewContext(fs.readFileSync('dist/builder-catalog.js','utf8'),context);
const repairs=registry.load(context.window.PCP_BUILDER_CATALOG),images=JSON.parse(fs.readFileSync('dist/images.json','utf8'));
async function get(route){const r=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});assert.equal(r.status,200,route);return{response:r,bytes:Buffer.from(await r.arrayBuffer())};}
const release=JSON.parse((await get('/data/release.json')).bytes.toString());assert.equal(release.commit,expected);assert.equal(release.staging,false);
for(const route of ['/builder-images.js','/image-catalog-lite.js','/image-catalog.js']){const {bytes}=await get(route);assert.equal(bytes.toString().replace(/\r\n/g,'\n'),fs.readFileSync('dist'+route,'utf8').replace(/\r\n/g,'\n'));checks.push({route,matchesBuild:true});}
const assets=[...new Set(Object.values(repairs).flatMap(i=>[i.src,i.thumbnailSrc]))];
for(let k=0;k<assets.length;k+=4){const results=await Promise.allSettled(assets.slice(k,k+4).map(async route=>{const {response,bytes}=await get(route);assert.match(response.headers.get('Content-Type'),/image\/webp/);const sha256=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,crypto.createHash('sha256').update(fs.readFileSync('dist'+route)).digest('hex'),route);return{route,bytes:bytes.length,sha256};}));for(const r of results){if(r.status==='rejected')throw r.reason;checks.push(r.value);}}
const sampled=new Set(['retail-zotac-geforce-rtx-3060-twin-edge','retail-gigabyte-geforce-rtx-4090-aero-oc-24g','9950x3d','990pro'].filter(id=>repairs[id]));for(const category of registry.categories)for(const id of Object.keys(repairs).filter(id=>context.window.PCP_BUILDER_CATALOG.find(p=>p.id===id)?.cat===category).slice(0,2))sampled.add(id);
for(const id of sampled){const route='/learn/'+id+'.html',{bytes}=await get(route);assert(bytes.toString().includes('src="'+images[id].src+'"'),id+' product photo');assert(bytes.toString().includes('Image source'),id+' provenance disclosure');checks.push({route,correctProductImage:true});}
const report={checkedAt:new Date().toISOString(),commit:expected,release,passed:true,reviewedRepairs:Object.keys(repairs).length,checks,scope:'Public HTTPS marker, both delivered image indexes, every new full/thumbnail byte hash, and two sampled product pages per component category. Browser decoding is recorded separately.'};
fs.writeFileSync('docs/component-photos-catalog-oct17/qa/live-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,commit:expected,reviewedRepairs:Object.keys(repairs).length,checks:checks.length}));
