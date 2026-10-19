'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),raw=path.join(root,'tmp/total-gpu-photos-oct19'),docs=path.join(root,'docs/total-refinement/photos/gpu');
const rows=require('../data/catalog-intake/2026-10-19/batch-gpu.json').records,sources=require('../data/catalog-intake/2026-10-19/sources.json');
const galleries={
 'total-gpu-gigabyte-gv-n75toc-2gi':{sourceUrl:'https://www.gigabyte.com/Graphics-Card/GV-N75TOC-2GI',imageUrl:'https://static.gigabyte.com/StaticFile/Image/Global/ba1a598ab20ec669de8a14759c0af4f4/ProductRemoveBg/11284'},
 'total-gpu-asrock-a310-lp-4g':{imageUrl:'https://www.asrock.com/Graphics-Card/photo/Intel%20Arc%20A310%20Low%20Profile%204GB%28M1%29.png'},
 'total-gpu-asrock-a380-cli-6go':{imageUrl:'https://www.asrock.com/Graphics-Card/photo/Intel%20Arc%20A380%20Challenger%20ITX%206GB%20OC%28M1%29.png'},
 'total-gpu-asrock-a750-cld-8go':{imageUrl:'https://www.asrock.com/Graphics-Card/photo/Intel%20Arc%20A750%20Challenger%20D%208GB%20OC%28M1%29.png'}
};
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function intake(part){
 const source=sources[part.sourceId],g=galleries[part.id],slug=new URL(source.url).pathname.split('/')[2];
 const candidates=g?[g.imageUrl]:['https://storage-asset.msi.com/datasheet/vga/global/'+slug+'.pdf','https://storage-asset.msi.com/datasheet/vga/id/'+slug+'.pdf'];
 const attempts=[];for(const url of candidates){try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});attempts.push({url,status:response.status});if(!response.ok)continue;const bytes=Buffer.from(await response.arrayBuffer()),pdf=bytes.subarray(0,4).toString()==='%PDF';if(!g&&!pdf)continue;
 if(g&&!/^image\//.test(response.headers.get('content-type')||''))throw Error('Manufacturer returned non-image content');
 const file=path.join(raw,part.id+(pdf?'.pdf':'.media'));fs.writeFileSync(file,bytes);return{id:part.id,name:part.name,brand:part.brand,sourceUrl:g?.sourceUrl||source.url,imageUrl:url,sourceType:pdf?'official-datasheet':'official-product-gallery',file:path.relative(root,file).replace(/\\/g,'/'),sourceSha256:sha(bytes),checkedAt:new Date().toISOString(),attempts};
 }catch(error){attempts.push({url,error:error.message});}}
 return{id:part.id,name:part.name,error:'No exact source bytes acquired',attempts};
}
async function main(){fs.mkdirSync(raw,{recursive:true});fs.mkdirSync(docs,{recursive:true});const out=[];for(let i=0;i<rows.length;i+=4){const batch=await Promise.all(rows.slice(i,i+4).map(intake));out.push(...batch);console.log(batch.map(r=>r.id+': '+(r.error||r.sourceType)).join('\n'));}fs.writeFileSync(path.join(docs,'intake.json'),JSON.stringify({checkedAt:new Date().toISOString(),rows:out},null,2)+'\n');if(out.some(r=>r.error))process.exitCode=1;}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={galleries,rows};
