import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import registry from './component-photo-catalog.cjs';
const commit=process.argv[2],origin='https://www.pcpartperformance.com',checks=[];
assert.match(commit||'',/^[a-f0-9]{40}$/);
const entries=Object.assign({},...registry.files.filter(name=>name.startsWith('component-photo-total-')&&fs.existsSync(path.join('scripts',name))).map(name=>JSON.parse(fs.readFileSync(path.join('scripts',name)))));
async function get(route){const response=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});assert.equal(response.status,200,route);return{response,bytes:Buffer.from(await response.arrayBuffer())};}
const marker=JSON.parse((await get('/data/release.json')).bytes.toString());assert.equal(marker.commit,commit);assert.equal(marker.staging,false);
const assets=[...new Set(Object.values(entries).flatMap(image=>[image.src,image.thumbnailSrc]))];
for(let index=0;index<assets.length;index+=4){
 const result=await Promise.allSettled(assets.slice(index,index+4).map(async route=>{const {response,bytes}=await get(route);assert.match(response.headers.get('content-type'),/image\/webp/);const sha256=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha256,crypto.createHash('sha256').update(fs.readFileSync('dist'+route)).digest('hex'),route);return{route,sha256,bytes:bytes.length};}));
 for(const item of result){if(item.status==='rejected')throw item.reason;checks.push(item.value);}
}
for(const route of ['/builder-images.js','/image-catalog-lite.js','/data/total-catalog-provenance.json','/data/total-prebuilts-provenance.json']){
 const {bytes}=await get(route);assert.equal(bytes.toString().replace(/\r\n/g,'\n'),fs.readFileSync('dist'+route,'utf8').replace(/\r\n/g,'\n'),route+' differs from tested build');checks.push({route,matchesBuild:true});
}
for(const[id,image]of Object.entries(entries)){
 const route='/learn/'+id+'.html',html=(await get(route)).bytes.toString();assert(html.includes('src="'+image.src+'"'),id);assert(html.includes('Image source'),id);checks.push({route,correctPhoto:true});
}
const directory='docs/total-refinement/qa/photos-oct19-live';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'verification.json'),JSON.stringify({checkedAt:new Date().toISOString(),commit,passed:true,newPhotoBindings:Object.keys(entries).length,checks},null,2)+'\n');
console.log(JSON.stringify({passed:true,commit,newPhotoBindings:Object.keys(entries).length,checks:checks.length}));
