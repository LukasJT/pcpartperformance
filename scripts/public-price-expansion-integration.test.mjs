import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { PUBLIC_SNAPSHOT_TARGETS, validatePublicPriceSnapshot, validatePublicPriceObservation, publicPriceSnapshotPayload } from './public-price-snapshot.mjs';
import { createPublicPriceService } from './public-price-service.mjs';
import { createFixedPublicPriceCollector } from './public-price-fetch.mjs';
import { appendPriceHistory, validatePriceHistory, priceHistoryPayload } from './completion-price-history.mjs';
const require=createRequire(import.meta.url),{injectPriceHistory}=require('./completion-pricing.cjs');
const actual=JSON.parse(await fs.readFile(new URL('../data/completion-price-expansion-observations.json',import.meta.url),'utf8'));
const now=Date.parse(actual.generatedAt),snapshot={schema:1,policy:'daily-checked-snapshot',generatedAt:actual.generatedAt,observations:actual.observations};
const ca=actual.observations.filter(row=>row.productId==='ddr4'&&row.region==='CA'),us=actual.observations.find(row=>row.productId==='ddr4'&&row.region==='US');
const envelope=rows=>({...snapshot,observations:rows});
const memoryCache=()=>{const values=new Map();return{async match(request){return values.get(request.url)?.clone()||null;},async put(request,response){values.set(request.url,response.clone());}};};

test('shared registry accepts all actual expansion observations without losing existing targets',()=>{
  assert.equal(PUBLIC_SNAPSHOT_TARGETS.length,12);
  assert(PUBLIC_SNAPSHOT_TARGETS.some(row=>row.productId==='9800x3d'&&row.merchantId==='newegg-us'));
  const validated=validatePublicPriceSnapshot(snapshot,{now});
  assert.equal(validated.valid,true);
  assert.equal(validated.observations.length,6);
  assert.equal(validated.observations.filter(row=>row.source.kind==='public-manufacturer-structured-data').length,2);
});
test('snapshot payload retains both CA stores and picks the true lowest independent of order',()=>{
  const lower={...ca[0],price:299.99},higher={...ca[1],price:359.99};
  for(const offers of [[lower,higher],[higher,lower]]){
    const result=publicPriceSnapshotPayload(envelope(offers),{ids:['ddr4'],region:'CA',now});
    assert.equal(result.offers.length,2);
    assert.equal(result.lowestByProduct.ddr4.price,299.99);
    assert.equal(result.coverage.merchants,2);
  }
});
test('US CORSAIR explicit new condition is eligible while unknown condition is rejected',()=>{
  const result=publicPriceSnapshotPayload(snapshot,{ids:['ddr4'],region:'US',now});
  assert.equal(result.offers.length,1);
  assert.equal(result.lowestByProduct.ddr4.currency,'USD');
  assert.equal(result.lowestByProduct.ddr4.price,259.99);
  assert.equal(validatePublicPriceObservation({...us,condition:'unknown'},{now}).valid,false);
  assert.equal(validatePublicPriceObservation({...ca[1],source:{...ca[1].source,kind:'public-retailer-structured-data'}},{now}).valid,false);
});
test('mixed current and historical manufacturer evidence validates without rewriting old rows',async()=>{
  const prior=JSON.parse(await fs.readFile(new URL('../data/public-price-history.json',import.meta.url),'utf8'));
  const cutoff=Math.max(now,Date.parse(prior.updatedAt));
  assert.equal(validatePriceHistory(prior,{now:cutoff}).valid,true);
  const originalTimes=prior.observations.map(row=>row.checkedAt),merged=appendPriceHistory(prior,snapshot,{now:cutoff});
  assert.equal(validatePriceHistory(merged,{now:cutoff}).valid,true);
  assert(merged.observations.some(row=>row.merchantId==='corsair'&&row.region==='CA'));
  assert(merged.observations.some(row=>row.merchantId==='corsair'&&row.region==='US'));
  assert(originalTimes.every(time=>merged.observations.some(row=>row.checkedAt===time)));
  assert.equal(priceHistoryPayload(merged,{id:'ddr4',region:'CA',now:cutoff}).coverage.interpolated,false);
  assert.equal(priceHistoryPayload(merged,{id:'ddr4',region:'US',now:cutoff}).currency,'USD');
});
test('on-demand service caches both merchants and does not overwrite the lowest',async()=>{
  let calls=0,time=now;
  const api=createPublicPriceService({cache:memoryCache(),clock:()=>time,reader:{async collect(){calls++;return{offers:[{...ca[0],price:299.99},{...ca[1],price:359.99}],results:[{productId:'ddr4',state:'checked'}]};}}});
  const first=await api.read(['ddr4'],'CA'),second=await api.read(['ddr4'],'CA');
  assert.equal(calls,1);assert.equal(first.offers.length,2);assert.equal(second.offers.length,2);assert.equal(second.lowestByProduct.ddr4.price,299.99);
  time+=900001;await api.read(['ddr4'],'CA');assert.equal(calls,2);
});
test('partial merchant refresh replaces explicit sold-out result and preserves other original dated observation',async()=>{
  let calls=0,time=now;
  const api=createPublicPriceService({cache:memoryCache(),clock:()=>time,reader:{async collect(){calls++;return{offers:calls===1?ca:[{...ca[0],inStock:false,availability:'out-of-stock',checkedAt:new Date(time).toISOString(),expiresAt:new Date(time+86400000).toISOString()}],results:[{productId:'ddr4',state:'checked'}]};}}});
  await api.read(['ddr4'],'CA');time+=900001;const result=await api.read(['ddr4'],'CA');
  assert.equal(result.offers.length,2);
  assert.equal(result.offers.find(row=>row.merchantId==='canada-computers').inStock,false);
  const retained=result.offers.find(row=>row.merchantId==='corsair');assert.equal(retained.checkedAt,ca[1].checkedAt);assert.equal(retained.refreshState,'unavailable');
  assert.equal(result.lowestByProduct.ddr4.merchantId,'corsair');
  await api.read(['ddr4'],'CA');assert.equal(calls,2,'cached partial result must not retry on each page interaction');
});
test('simultaneous identical service requests coalesce injected upstream reads',async()=>{
  let calls=0;
  const api=createPublicPriceService({clock:()=>now,reader:{async collect(){calls++;await new Promise(resolve=>setTimeout(resolve,2));return{offers:ca,results:[{productId:'ddr4',state:'checked'}]};}}});
  const results=await Promise.all([api.read(['ddr4'],'CA'),api.read(['ddr4'],'CA')]);
  assert.equal(calls,1);assert(results.every(row=>row.offers.length===2));
});
test('fixed collector coalesces by exact listing and performs one read per store in fifteen minutes',async()=>{
  let calls=0,time=now;
  const directory=new URL('./fixtures/completion-price-expansion/',import.meta.url),fixtures=await Promise.all((await fs.readdir(directory)).map(async file=>JSON.parse(await fs.readFile(new URL(file,directory),'utf8'))));
  const collector=createFixedPublicPriceCollector({clock:()=>time,fetchImpl:async(url,init)=>{
    calls++;assert.equal(init.redirect,'manual');const fragment=fixtures.find(row=>row.sourceUrl===url);assert(fragment);
    await new Promise(resolve=>setTimeout(resolve,2));return new Response('<script type="application/ld+json">'+JSON.stringify(fragment.products)+'</script>',{headers:{'Content-Type':'text/html'}});
  }});
  const results=await Promise.all([collector.collect(['ddr4','ddr4'],{region:'CA'}),collector.collect(['ddr4'],{region:'CA'})]);
  assert.equal(calls,2);assert(results.every(row=>row.offers.length===2));
  await collector.collect(['ddr4'],{region:'CA'});assert.equal(calls,2);time+=900001;await collector.collect(['ddr4'],{region:'CA'});assert.equal(calls,4);
});
test('browser refresh groups merchants once per product and preserves two CA offers plus independent US price',async()=>{
  const originalFetch=globalThis.fetch,originalNow=Date.now;let reads=0;
  try{
    Date.now=()=>now;
    globalThis.fetch=async raw=>{
      const url=new URL(raw,'https://www.pcpartperformance.com');
      if(url.pathname.endsWith('/status'))return Response.json({schema:1,targets:PUBLIC_SNAPSHOT_TARGETS});
      reads++;assert.equal(url.searchParams.get('ids'),'ddr4');const region=url.searchParams.get('region');
      return Response.json(publicPriceSnapshotPayload(snapshot,{ids:['ddr4'],region,now}));
    };
    const source=await fs.readFile(new URL('./public-price-client.js',import.meta.url),'utf8'),api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
    await api.refresh(['ddr4'],'CA');assert.equal(api.offersFor('ddr4','CA').length,2);
    await api.refresh(['ddr4'],'US');assert.equal(api.offersFor('ddr4','US').length,1);assert.equal(api.offersFor('ddr4','US')[0].currency,'USD');
    await api.refresh(['ddr4'],'CA');assert.equal(reads,2);
    assert.equal(api.validateObservation({...us,source:{...us.source,publisher:'Unknown'}},PUBLIC_SNAPSHOT_TARGETS.find(row=>row.merchantId==='corsair'&&row.region==='US'),now),false);
  }finally{globalThis.fetch=originalFetch;Date.now=originalNow;}
});
test('history generator has a stable buying-section fallback and cannot silently omit controls',()=>{
  for(const content of ['<p class="buy-note">Notes</p>','<p class="muted buy-note compact">Notes</p>','<div data-product-buy></div>']){
    const html='<html><head></head><body><section id="buy">'+content+'</section></body></html>',result=injectPriceHistory(html,'ddr4');
    assert(result.includes('data-price-history data-product-id="ddr4"'));assert(result.includes('src="/completion-price-history.js"'));assert.equal(injectPriceHistory(result,'ddr4'),result);
  }
  assert.throws(()=>injectPriceHistory('<html><head></head><body>No buying section</body></html>','ddr4'),/section missing/);
});
