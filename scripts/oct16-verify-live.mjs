import fs from 'node:fs';
import assert from 'node:assert/strict';
const expected=process.argv[2];assert.match(expected||'',/^[a-f0-9]{40}$/,'Pass the expected release commit.');
const origin='https://www.pcpartperformance.com',checks=[];
async function read(route,{base=origin,method='GET'}={}){const response=await fetch(base+route,{method,redirect:'manual',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)}),body=method==='HEAD'?'':await response.text();return{route,status:response.status,location:response.headers.get('location'),robots:response.headers.get('x-robots-tag'),cache:response.headers.get('cache-control'),body};}
function record(name,r){checks.push({name,route:r.route,status:r.status,robots:r.robots,cache:r.cache});}
async function main(){
 const marker=await read('/data/release.json');let release;try{release=JSON.parse(marker.body);}catch{}
 if(marker.status!==200||release?.commit!==expected){console.log(JSON.stringify({state:'waiting_for_deployment',expected,observed:release?.commit||null,status:marker.status}));process.exitCode=2;return;}
 assert.equal(release.staging,false);record('exact production commit',marker);
 const routes={
  '/':['Build smarter.','Upgrade with confidence.','href="/my-pc/"'],
  '/builder/':['Build Readiness Report','Download build report','oct16-builder-images.js','builder-guidance'],
  '/my-pc/':['My PC workspace','oct16-workspace.js','data-workspace-journal'],
  '/upgrade/':['data-upgrade-extra-parts','name="instance"','name="mode"','CPU cooler'],
  '/hardware/cpu-coolers/':['CPU coolers','NH-U12A'],
  '/learn/cooler-noctua-nh-d15-g2.html':['168 mm','Not documented','Use in PC builder','Support and fit evidence'],
  '/blog/how-to-choose-a-cpu-cooler-that-fits/':['How to choose a CPU cooler that fits your case and RAM','editorial-oct16/T16-C01.png'],
  '/blog/build-vs-buy-pc-complete-cost/':['Build vs buy a gaming PC: compare the complete purchase cost','editorial-oct16/T16-C02.png'],
  '/blog/will-a-graphics-card-fit-my-case/':['Will a graphics card fit your case? Check the card and cooling layout','editorial-oct16/T16-C03.png'],
  '/phones/':['Compare phones'], '/performance/':['Game performance'], '/prebuilts/':['Compare prebuilt PCs'], '/laptops/':['Find a gaming laptop.'], '/compare/':['Compare hardware']
 };
 for(const [route,content]of Object.entries(routes)){const r=await read(route);assert.equal(r.status,200,route);for(const text of content)assert(r.body.includes(text),route+' missing '+text);assert(r.body.includes('href="'+origin+route+'"'),route+' canonical');assert(!r.body.includes('/qa-metrics.js'));assert(!r.body.includes('data-program-staging'));if(route==='/builder/')assert(!r.body.includes('src="/builder-images.js"'));record('canonical feature HTML',r);}
 const sitemap=await read('/sitemap.xml');assert.equal(sitemap.status,200);for(const route of ['/my-pc/','/hardware/cpu-coolers/','/blog/how-to-choose-a-cpu-cooler-that-fits/'])assert(sitemap.body.includes(origin+route));record('new canonical discovery',sitemap);
 const robots=await read('/robots.txt');assert.equal(robots.status,200);assert(!/^Disallow:\s*\/\s*$/m.test(robots.body));record('production crawling enabled',robots);
 const unknown=await read('/oct16-nonexistent-release-route/');assert.equal(unknown.status,404);assert.match(unknown.robots,/noindex/);record('real missing-page error',unknown);
 const state=await read('/builder/?build=9800x3d');assert.equal(state.status,200);assert.match(state.robots,/noindex/);assert.equal(state.cache,'no-store');record('shared state remains excluded',state);
 const apex=await read('/builder/',{base:'https://pcpartperformance.com'});assert.equal(apex.status,301);assert.equal(apex.location,origin+'/builder/');record('preferred host redirect',apex);
 const library=await read('/model-library.json');assert.equal(library.status,200);const models=JSON.parse(library.body);assert.equal(models.total,852);assert.equal(models.community,105);assert.equal(models.categories.cooler.missing,12);record('honest current model coverage',library);
 const status=await read('/api/v1/public-prices/status');assert.equal(status.status,200);const targets=JSON.parse(status.body).targets;assert(Array.isArray(targets)&&targets.length===6);record('scoped retailer source status',status);
 const prices=await read('/api/v1/public-prices/offers?region=CA&ids=9800x3d,990pro,ddr5');assert.equal(prices.status,200);const data=JSON.parse(prices.body);assert.equal(data.region,'CA');assert(Array.isArray(data.offers));for(const offer of data.offers){assert(targets.some(t=>t.productId===offer.productId&&t.sku===offer.sku&&t.listingUrl===offer.url));assert(offer.exactVariant===true&&Date.now()<Date.parse(offer.expiresAt));}record('current exact-listing API or explicit empty coverage',prices);
 for(const [route,text]of [['/oct16-builder-journey.js','pcpartperformance-build-report.json'],['/builder-program.js','4 MB'],['/oct16-workspace.js','Plan upgrade']]){const r=await read(route);assert.equal(r.status,200);assert(r.body.includes(text));assert(r.cache.includes('must-revalidate'));record('current executable feature asset',r);}
 const report={checkedAt:new Date().toISOString(),state:'verified_live',commit:expected,release,checks,priceObservationCount:data.offers.length,scope:'Read-only public HTTP, HTML, API and source checks. Browser interaction and field metrics are separate.'};fs.mkdirSync('docs/transformation-oct16/qa',{recursive:true});fs.writeFileSync('docs/transformation-oct16/qa/live-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({state:report.state,commit:expected,checks:checks.length,priceObservationCount:data.offers.length}));
}
main().catch(error=>{console.error(error.stack||error.message);process.exitCode=1;});
