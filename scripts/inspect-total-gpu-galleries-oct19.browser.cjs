'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const playwright=require('C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {galleries}=require('./prepare-total-gpu-photos-oct19.cjs'),sources=require('../data/catalog-intake/2026-10-19/sources.json'),parts=require('../data/catalog-intake/2026-10-19/batch-gpu.json').records;
async function main(){
 const file=path.resolve('docs/total-refinement/photos/gpu/intake.json'),intake=JSON.parse(fs.readFileSync(file,'utf8')),observations=[];
 const browser=await playwright.chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{const context=await browser.newContext();for(const part of parts.filter(p=>p.brand==='ASRock').sort((a,b)=>Number(a.id.includes('a310'))-Number(b.id.includes('a310')))){
  const page=await context.newPage(),sourceUrl=sources[part.sourceId].url,imageUrl=galleries[part.id].imageUrl;await page.goto(sourceUrl,{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});await page.waitForTimeout(3000);
  const response=await context.request.get(imageUrl,{timeout:20000}),bytes=await response.body(),type=response.headers()['content-type']||'',observation={id:part.id,sourceUrl,pageTitle:await page.title(),imageUrl,status:response.status(),type,bytes:bytes.length,checkedAt:new Date().toISOString()};
  if(response.ok()&&type.startsWith('image/')){const local=path.resolve('tmp/total-gpu-photos-oct19',part.id+'.media');fs.writeFileSync(local,bytes);const row=intake.rows.find(r=>r.id===part.id);Object.assign(row,{file:path.relative(process.cwd(),local).replace(/\\/g,'/'),sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),checkedAt:observation.checkedAt,retrieval:'Ordinary isolated browser session; no challenge solving, credentials or altered automation behavior.'});delete row.error;observation.accepted=true;}else observation.accepted=false;
  observations.push(observation);console.log(JSON.stringify(observation));await page.close();}
 }finally{await browser.close();}
 fs.writeFileSync(file,JSON.stringify(intake,null,2)+'\n');fs.writeFileSync('docs/total-refinement/photos/gpu/gallery-browser.json',JSON.stringify(observations,null,2)+'\n');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
