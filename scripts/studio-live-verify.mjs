import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const expected=process.argv[2],origin='https://www.pcpartperformance.com';
assert.match(expected||'',/^[a-f0-9]{40}$/,'Pass the expected release commit');
const read=async route=>{const response=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});assert.equal(response.status,200,route);return response;};
const marker=await (await read('/data/release.json')).json();
if(marker.commit!==expected){console.log(JSON.stringify({state:'waiting',expected,observed:marker.commit}));process.exitCode=2;}
else{
 const routes=['/','/builder/','/my-pc/','/upgrade/','/compare/','/hardware/','/blog/','/blog/understanding-pc-memory/','/learn/9800x3d.html','/build-school/'];
 const checks=[],styles=new Set();
 const pages=await Promise.all(routes.map(async route=>({route,html:await (await read(route)).text()})));
 for(const {route,html} of pages){assert(html.includes('data-clean-studio'),route);assert(!html.includes('/qa-metrics.js'),route);assert.equal((html.match(/<h1\b/g)||[]).length,1,route);assert(html.includes('rel="canonical" href="'+origin+route+'"'),route);for(const m of html.matchAll(/<link rel="stylesheet" href="(\/assets\/css\/site-[a-f0-9]+\.css)">/g))styles.add(m[1]);checks.push({route,renderedStudioHTML:true});}
 const home=pages.find(p=>p.route==='/').html;for(const name of ['studio-hero','studio-evidence-preview','studio-learning-layout','studio-workspace-promo'])assert(home.includes(name),name);
 const styleChecks=await Promise.all([...styles].map(async url=>{const bytes=Buffer.from(await (await read(url)).arrayBuffer()),local=fs.readFileSync(path.join('dist',url)),hash=value=>crypto.createHash('sha256').update(value).digest('hex');assert.equal(hash(bytes),hash(local),'Published stylesheet differs: '+url);return {url,bytes:bytes.length,sha256:hash(bytes),matchesLocalBuild:true};}));
 const report={checkedAt:new Date().toISOString(),commit:expected,passed:true,scope:'Actual public HTML and exact CSS byte comparisons. Browser journeys, field metrics and physical-device behavior are separate evidence.',checks,styleChecks};
 fs.mkdirSync('docs/clean-studio/qa',{recursive:true});fs.writeFileSync('docs/clean-studio/qa/live-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({state:'verified_live',commit:expected,pages:checks.length,styles:styleChecks.length}));
}
