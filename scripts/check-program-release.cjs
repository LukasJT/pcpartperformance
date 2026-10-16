'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),editorial=require('./program-editorial.cjs');
const manifest=JSON.parse(fs.readFileSync('dist/route-policy.json','utf8')),drafts=JSON.parse(fs.readFileSync('dist/program-draft-routes.json','utf8'));let retained=0,withheld=0;
if(manifest.staging){assert.equal(drafts.length,40);assert.equal(Object.values(manifest.routes).filter(r=>r.draft).length,40);assert(!fs.readFileSync('dist/sitemap.xml','utf8').includes('<loc>'));console.log('PASS all 40 preview drafts are noindex and absent from sitemap');}
else{
 assert.equal(drafts.length,0);assert(!Object.values(manifest.routes).some(r=>r.draft));assert(fs.readFileSync('dist/sitemap.xml','utf8').includes('<loc>'));
 for(const a of editorial.articles){const file=path.join('dist',a.route,'index.html');if(fs.existsSync(file)){assert(!fs.readFileSync(file,'utf8').includes('data-program-draft'));retained++}else withheld++}
 const originalIds=new Set(['11','12','13','16','17','19','22','24','27','29','30','33','34']);
 const newlyAuthorized=new Set(require('./master-publication.cjs').resolve(require('./master-release-authorization.json')).articles.map(a=>a.canonicalRoute));
 const expected=editorial.articles.filter(a=>originalIds.has(a.id)||newlyAuthorized.has(a.route)).length;
 assert.equal(retained,expected);assert.equal(withheld,40-expected);assert(!manifest.routes['/program-review/']);
 for(const route of ['/','/builder/','/build-school/','/upgrade/']){const h=fs.readFileSync(path.join('dist',route,'index.html'),'utf8');assert(!h.includes('data-program-staging'));assert(!h.includes('content="noindex,follow"'),route)}
 console.log('PASS normal generation restores 13 existing pages, withholds 27 new draft routes and removes staging exclusions');
}
for(const route of ['/builder/','/performance/']){const h=fs.readFileSync(path.join('dist',route,'index.html'),'utf8');assert(!h.includes('/phone-catalog.js'));assert(!h.includes('/history-data.js'));}
const builder=fs.readFileSync('dist/builder/index.html','utf8');assert(builder.includes('/builder-catalog.js'));assert(builder.includes('/oct16-builder-images.js'));assert(!builder.includes('src="/builder-images.js"'));assert(builder.indexOf('/builder-catalog.js')<builder.indexOf('/core.js'));
const vm=require('vm'),ctx={window:{},URL,URLSearchParams,location:{href:'https://www.pcpartperformance.com/builder/'},document:{querySelector:()=>null}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/builder-catalog.js','utf8'),ctx);vm.runInContext(fs.readFileSync('dist/core.js','utf8'),ctx);assert.equal(vm.runInContext('catalog.length',ctx),840+require('./oct16-cooling-data.cjs').COOLERS.length);assert.equal(vm.runInContext('buildSlotDefs.length',ctx),10);assert(vm.runInContext('catalog.some(p=>p.id==="9800x3d")&&multiBuildSlots.has("fan")&&buildSlotDefs.at(-1).id==="cooler"',ctx));
const product=fs.readFileSync('dist/learn/rtx5070.html','utf8');assert(!product.includes('"@type":"Offer"'));assert(!product.includes('aggregateRating'));
const identities=JSON.parse(fs.readFileSync('dist/data/offer-identities.json','utf8'));assert.equal(identities.products.length,0);assert(fs.readFileSync('dist/shopping.js','utf8').includes('PCP_OFFER_RULES.currentOffers'));
const report={date:'2026-10-09',mode:manifest.staging?'staging':'production-generation',retainedExistingPages:retained,withheldNewDrafts:withheld,drafts: drafts.length,checks:['human review/draft gate','staging meta leakage','existing pages retained','PC-only initial catalog','no fabricated Product offers or ratings','strict shared shopping offer gate'],deployed:false};fs.writeFileSync('docs/program-2026-10-09/release-gates-'+report.mode+'.json',JSON.stringify(report,null,2));console.log(report);
