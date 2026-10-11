'use strict';
// Offline evidence-impact queue. Does not fetch sources, scrape shops, send messages
// or change publication/review dates. A human resolves each substantive change.
const fs=require('fs'),editorial=require('./program-editorial.cjs');
function queue({offers=[],changes={},now=Date.now()}={}){
 if(!Array.isArray(offers)||offers.length>5000)throw Error('Offer input exceeds the bounded record limit');
 for(const key of ['productIds','sourceIds','ruleIds'])if(changes[key]!==undefined&&(!Array.isArray(changes[key])||changes[key].length>100||changes[key].some(v=>typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,120}$/.test(v))))throw Error('Invalid change identities');
 const affected=editorial.articles.filter(a=>a.sourceIds.some(id=>(changes.sourceIds||[]).includes(id))||a.relatedEntities.some(id=>(changes.productIds||[]).includes(id)));
 const items=affected.map(a=>({kind:'editorial-impact',id:a.id,route:a.route,status:'needs_source_and_editorial_review',reason:'A declared source or product change touches this draft. Recheck applicable claims; do not merely change its date.'}));
 for(const id of [...new Set(offers.filter(o=>!o.exactVariant||o.inStock!==true||!Number.isFinite(Date.parse(o.checkedAt))||now-Date.parse(o.checkedAt)>=900000||Date.parse(o.checkedAt)>now).map(o=>o.id||o.productId).filter(id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(id)))])items.push({kind:'offer-evidence',id,route:'/learn/'+id+'.html',status:'unavailable_until_verified',reason:'Inherited or expired offer lacks current exact-variant price/stock evidence. Re-import only from an authorized source.'});
 if(changes.ruleIds?.length)items.push({kind:'compatibility-impact',ids:changes.ruleIds,status:'recheck_affected_builds',reason:'Run the shared readiness engine for affected saved revisions. A local browser revision cannot receive a background warning until the visitor opens it.'});
 return{generatedAt:new Date(now).toISOString(),mode:'offline_review_queue',items,sourceLinksChecked:false,activeJob:false,publicationDatesChanged:false,limitations:['Queue generation is not factual verification.','No price refresh, email alert, source monitoring job or Search Console submission is active.']};
}
if(require.main===module){let changes={};const file=process.argv.find(v=>v.startsWith('--changes='))?.slice(10);if(file){const raw=fs.readFileSync(file);if(raw.length>16384)throw Error('Change file exceeds 16 KiB');changes=JSON.parse(raw)}const feed=JSON.parse(fs.readFileSync('dist/prices.json','utf8'));const report=queue({offers:feed.offers||[],changes});fs.writeFileSync('docs/program-2026-10-09/refresh-queue.json',JSON.stringify(report,null,2));console.log(report.items.length+' review items queued offline. No job or delivery service activated.');}
module.exports={queue};
