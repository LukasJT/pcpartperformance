'use strict';
// Bounded, read-only production smoke checks. No retailer or account requests.
const fs=require('node:fs'),assert=require('node:assert/strict');
const expected=process.argv[2];if(!/^[a-f0-9]{40}$/.test(expected||''))throw Error('Pass the expected 40-character release commit.');
const origin='https://www.pcpartperformance.com';
async function read(route,{method='GET',base=origin}={}){const start=performance.now();const response=await fetch(base+route,{method,redirect:'manual',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});return {route,status:response.status,location:response.headers.get('location'),cacheControl:response.headers.get('cache-control'),robots:response.headers.get('x-robots-tag'),type:response.headers.get('content-type'),durationMs:Math.round(performance.now()-start),body:method==='HEAD'?'':await response.text()};}
async function main(){
 const marker=await read('/data/release.json');let release;try{release=JSON.parse(marker.body)}catch{}
 if(marker.status!==200||release?.commit!==expected){console.log(JSON.stringify({state:'waiting_for_expected_deployment',expected,status:marker.status,observedCommit:release?.commit||null},null,2));process.exitCode=2;return;}
 assert.equal(release.staging,false);assert.equal(release.program,'2026-10-11-continuation');
 const report={checkedAt:new Date().toISOString(),expectedCommit:expected,release,scope:'Bounded public HTTP/HTML/API/assets smoke checks; browser behavior and field performance are separate.',checks:[]};
 const record=(name,r)=>report.checks.push({name,...Object.fromEntries(Object.entries(r).filter(([key])=>key!=='body'))});
 record('actual production marker',marker);
 for(const route of ['/','/builder/','/phones/','/phones/size-compare/','/phones/iphone-17-pro/','/prebuilts/','/prebuilts/asus-gm700-ca/','/builder/model-credits/','/blog/','/build-school/','/upgrade/']){
  const r=await read(route);assert.equal(r.status,200,route);assert(r.body.includes('rel="canonical" href="'+origin+route+'"'),route+' canonical');assert(!r.robots?.includes('noindex'),route+' production indexing');assert(!/<meta name="robots" content="[^\"]*noindex/.test(r.body),route+' HTML indexing');assert.equal((r.body.match(/<h1\b/g)||[]).length,1,route+' primary heading');assert(r.body.includes('href="/phones/"')&&r.body.includes('href="/prebuilts/"'),route+' shared destinations');record('canonical live page',r);
 }
 const query=await read('/builder/?build=%2C%2Cretail-msi-geforce-rtx-5070-12g-gaming-trio-oc%2C%2C%2C%2C%2C');assert.equal(query.status,200);assert(query.robots?.includes('noindex'));record('shared build is usable and excluded from indexing',query);
 const sitemap=await read('/sitemap.xml');assert.equal(sitemap.status,200);const items=require('./continuation-editorial-content.cjs').articles,authorized=new Set(require('./continuation-publication.cjs').resolve().map(a=>'/'+a.route+'/'));for(const a of items)assert.equal(sitemap.body.includes(a.route),authorized.has(a.route),'Publication sitemap state '+a.id);record('sitemap follows exact owner publication authorization',sitemap);
 for(const route of [...items.filter(a=>!authorized.has(a.route)).map(a=>a.route),'/editorial-review/oct11/','/__release-missing-page-20261011/']){const r=await read(route);assert.equal(r.status,404,route);assert(r.robots?.includes('noindex'));record('draft or missing route is a real error',r);}
 const apex=await read('/phones/',{base:'https://pcpartperformance.com'});assert.equal(apex.status,301);assert.equal(apex.location,origin+'/phones/');record('preferred host uses one redirect and valid TLS',apex);
 for(const region of ['CA','US']){const r=await read('/api/v1/morning-prices?ids=rtx5070&region='+region);assert.equal(r.status,200);const payload=JSON.parse(r.body);assert.equal(payload.status,'not_configured');assert.equal(payload.region,region);assert.equal(payload.currency,region==='CA'?'CAD':'USD');assert.deepEqual(payload.offers,[]);assert(r.robots?.includes('noindex'));record('truthful inactive regional price API',r);}
 const health=await read('/api/v1/morning-prices/status');assert.equal(health.status,200);assert.equal(JSON.parse(health.body).status,'not_configured');record('price source health is explicit',health);
 for(const route of ['/continuation-common.css','/builder-workspace.js','/phone-comparison.js']){const r=await read(route);assert.equal(r.status,200);assert(r.cacheControl?.includes('must-revalidate'));record('updated unhashed code revalidates',r);}
 const menu=await read('/continuation-common.css');assert(menu.body.includes('z-index:100')&&menu.body.includes('position:fixed;top:60px;left:16px;right:16px'),'Final mobile menu patch is live');
 for(const route of ['/assets/models/sketchfab-iphone-17-pro.glb','/assets/models/sketchfab-msi-rtx-5070-gaming-trio-oc.glb','/assets/hardware/exact-msi-rtx-5070-gaming-trio-oc.webp']){const r=await read(route,{method:'HEAD'});assert.equal(r.status,200);record('new exact model/image asset is deployed',r);}
 report.passed=true;fs.writeFileSync('docs/program-2026-10-11/live-release-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({state:'verified_live',commit:expected,checks:report.checks.length,checkedAt:report.checkedAt},null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
