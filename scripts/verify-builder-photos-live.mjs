import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const expected=process.argv[2],origin='https://www.pcpartperformance.com',checks=[];
assert.match(expected||'',/^[a-f0-9]{40}$/);
async function get(route){const response=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,route);return{response,bytes:Buffer.from(await response.arrayBuffer())};}
const release=JSON.parse((await get('/data/release.json')).bytes.toString());assert.equal(release.commit,expected);assert.equal(release.staging,false);
const index=await get('/builder-images.js');assert.equal(index.bytes.toString().replace(/\r\n/g,'\n'),fs.readFileSync('dist/builder-images.js','utf8').replace(/\r\n/g,'\n'));checks.push({route:'/builder-images.js',matchesBuild:true});
const repairs=JSON.parse(fs.readFileSync('scripts/builder-photo-repairs.json','utf8'));
for(const[id,image]of Object.entries(repairs)){
 for(const route of [image.src,image.thumbnailSrc]){const{response,bytes}=await get(route);assert.match(response.headers.get('Content-Type'),/image\/webp/);const sha256=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,crypto.createHash('sha256').update(fs.readFileSync('dist'+route)).digest('hex'),route);checks.push({route,bytes:bytes.length,sha256});}
 const{bytes}=await get('/learn/'+id+'.html');assert(bytes.toString().includes('src="'+image.src+'"'),id+' stale product photo');checks.push({route:'/learn/'+id+'.html',correctProductImage:true});
}
const report={checkedAt:new Date().toISOString(),commit:expected,release,passed:true,checks,scope:'Public HTTPS release marker, exact builder index, six product pages and twelve full/thumbnail image byte hashes. Browser decoding is recorded separately.'};fs.writeFileSync('docs/component-photos-oct17/live-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,commit:expected,checks:checks.length}));
