import fs from 'node:fs';
import assert from 'node:assert/strict';
const commit=process.argv[2],origin='https://www.pcpartperformance.com',report={observedAt:new Date().toISOString(),expectedCommit:commit,routes:[],prices:null};
assert(/^[a-f0-9]{40}$/.test(commit||''),'Expected release SHA required');
async function read(path){const response=await fetch(origin+path,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(45000)});return{status:response.status,headers:response.headers,body:await response.text()};}
const marker=await read('/data/release.json');assert.equal(marker.status,200);report.release=JSON.parse(marker.body);assert.equal(report.release.commit,commit,'Production release marker has not updated');
for(const [route,needle]of [['/','class="liquid-nav clarity-nav"'],['/builder/','More save options'],['/phones/pixel-9/','Compare specs'],['/phones/size-compare/','data-phone-mode="specs"'],['/prebuilts/','data-prebuilt-brand'],['/laptops/','data-laptop-compare'],['/performance/','Explore games'],['/performance/games/','data-game-discovery-search'],['/blog/','data-guide-query'],['/blog/can-my-pc-run-baldurs-gate-3/','data-master-article="O04"']]){
 const result=await read(route);assert.equal(result.status,200,route);const expected=route==='/prebuilts/'?'id="prebuilt-brand"':needle;assert(result.body.includes(expected),route+' current feature missing');assert(!result.body.includes('src="/qa-metrics.js"'));assert(!result.body.includes('class="master-assistance"'));assert(result.body.includes('rel="canonical" href="'+origin+route+'"'));report.routes.push({route,status:result.status});
}
const p=await read('/data/prebuilts.json'),desktops=JSON.parse(p.body).systems;assert.equal(desktops.length,84);assert.equal(desktops.filter(p=>p.region==='CA').length,43);assert.equal(desktops.filter(p=>p.region==='US').length,41);
const l=await read('/data/gaming-laptops.json');assert.equal(JSON.parse(l.body).laptops.length,42);
const status=await read('/api/v1/public-prices/status');assert.equal(status.status,200);assert.equal(JSON.parse(status.body).targets.length,6);
const prices=await read('/api/v1/public-prices/offers?region=CA&ids=9800x3d,ddr5');assert.equal(prices.status,200);report.prices=JSON.parse(prices.body);assert.equal(report.prices.currency,'CAD');assert.equal(report.prices.region,'CA');
for(const o of report.prices.offers){assert(o.price>0&&o.currency==='CAD'&&o.exactVariant===true);assert(Date.parse(o.checkedAt)<=Date.now());assert(Date.parse(o.expiresAt)>Date.now());}
const us=await read('/api/v1/public-prices/offers?region=US&ids=9800x3d');assert.equal(us.status,200);report.usPrices=JSON.parse(us.body);assert.equal(report.usPrices.currency,'USD');
for(const o of report.usPrices.offers)if(o.condition!=='new')assert(!report.usPrices.lowestByProduct[o.productId]);
const invalid=await read('/api/v1/public-prices/offers?ids=http://127.0.0.1');assert.equal(invalid.status,400);
fs.writeFileSync('docs/clarity-oct14/qa/live-verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({commit,routes:report.routes.length,prebuilts:84,laptops:42,currentCanadianObservations:report.prices.offers.length,usObservations:report.usPrices.offers.length,quoteStates:report.prices.results,scope:'Live HTTP, assets, source responses and revision identity; browser checks are recorded separately.'},null,2));
