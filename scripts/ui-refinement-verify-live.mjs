import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const expected=process.argv[2],origin='https://www.pcpartperformance.com';
assert.match(expected||'',/^[a-f0-9]{40}$/,'Pass the expected production commit.');
const checks=[];
async function read(route){const response=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,route);return{response,body:await response.text()};}
const release=JSON.parse((await read('/data/release.json')).body);assert.equal(release.commit,expected);assert.equal(release.staging,false);
for(const route of ['/','/builder/','/upgrade/','/compare/','/blog/','/my-pc/','/compatibility/','/phones/','/phones/size-compare/','/shop/','/performance/','/learn/rtx5070.html','/about/']){
 const {body}=await read(route);assert(body.includes('data-ui-refined'),route);assert.equal((body.match(/id="site-menu"/g)||[]).length,1,route);
 const header=body.match(/<header class="site-header[^>]*>[\s\S]*?<\/header>/)?.[0]||'';
 for(const region of ['CA','US'])assert.equal((header.match(new RegExp('data-region="'+region+'"','g'))||[]).length,1,route);
 assert(!/fonts\.(?:googleapis|gstatic)\.com/.test(body),route+' external font request');assert(body.includes('/assets/fonts/dm-sans-latin-v17.woff2'),route);
 assert(!body.includes('/__completion/')&&!body.includes('/qa-metrics.js'),route+' leaked QA');
 const styles=[...body.matchAll(/<link rel="stylesheet" href="(\/assets\/css\/[^"?]+)"/g)].map(m=>m[1]);
 const local=fs.readFileSync('dist'+(route==='/'?'/index.html':route.endsWith('/')?route+'index.html':route),'utf8');
 assert.deepEqual(styles,[...local.matchAll(/<link rel="stylesheet" href="(\/assets\/css\/[^"?]+)"/g)].map(m=>m[1]),route+' stale stylesheet');
 for(const asset of styles){const {body:css}=await read(asset);assert.equal(crypto.createHash('sha256').update(css).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync('dist'+asset)).digest('hex'),asset);}
 checks.push({route,header:'single responsive tree',styles});
}
for(const asset of ['/continuation-ui.js','/builder-selectors.js','/select-ui.js']){const {body}=await read(asset);assert.equal(body.replace(/\r\n/g,'\n'),fs.readFileSync('dist'+asset,'utf8').replace(/\r\n/g,'\n'));checks.push({asset,runtimeMatches:true});}
for(const name of ['dm-sans-latin-v17.woff2','space-grotesk-latin-v22.woff2']){
 const response=await fetch(origin+'/assets/fonts/'+name,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200);assert.match(response.headers.get('Content-Type'),/font\/woff2/);assert.equal(response.headers.get('Cache-Control'),'public, max-age=31536000, immutable');
 const bytes=Buffer.from(await response.arrayBuffer()),sha=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(sha,crypto.createHash('sha256').update(fs.readFileSync('dist/assets/fonts/'+name)).digest('hex'));checks.push({font:name,bytes:bytes.length,sha256:sha,immutable:true});
}
const report={checkedAt:new Date().toISOString(),commit:expected,release,checks,passed:true,scope:'Actual public HTTPS HTML, stylesheet/controller bytes and versioned font delivery. Browser behavior and field performance are separate evidence.'};
fs.writeFileSync('docs/ui-refinement-oct17/live-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,commit:expected,checks:checks.length}));
