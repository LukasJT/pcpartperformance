import { PUBLIC_PRICE_POLICY } from './oct14-price-sources.mjs';
import { PUBLIC_SNAPSHOT_TARGETS as PUBLIC_PRICE_TARGETS, publicPriceSnapshotPayload, lowestEligiblePublicPrices } from './public-price-snapshot.mjs';
import { createFixedPublicPriceCollector } from './public-price-fetch.mjs';
import {createPriceHistoryAssetProvider,priceHistoryPayload} from './completion-price-history.mjs';

const prefix='/api/v1/public-prices', ttl=900, daily=86400;
const collector=createFixedPublicPriceCollector();
const json=(body,status=200,cache='no-store')=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':cache,'X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff'}});
const key=(region,id)=>new Request('https://www.pcpartperformance.com/__price_cache/v4/'+region+'/'+id);
const current=(offer,now)=>offer&&Number.isFinite(Date.parse(offer.checkedAt))&&Date.parse(offer.checkedAt)<=now&&now<Date.parse(offer.expiresAt)&&Date.parse(offer.expiresAt)>Date.parse(offer.checkedAt)&&Date.parse(offer.expiresAt)-Date.parse(offer.checkedAt)<=86400000;
export function createPublicPriceService({reader=collector,cache=null,clock=Date.now,snapshotProvider=null,historyProvider=null}={}){
 const pending=new Map();
 async function upstream(id,region){const idKey=region+':'+id;if(!pending.has(idKey))pending.set(idKey,Promise.resolve().then(()=>reader.collect([id],{region})));try{return await pending.get(idKey);}finally{pending.delete(idKey);}}
 async function read(ids,region){
  if(!Array.isArray(ids)||!ids.length||ids.length>20||ids.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{1,120}$/.test(id))||!['CA','US'].includes(region))throw new TypeError('invalid_price_request');
  ids=[...new Set(ids)];
  if(snapshotProvider)return publicPriceSnapshotPayload(await snapshotProvider(),{ids,region,now:clock()});
  const now=clock(),offers=[],results=[];
  for(const id of ids){
   const stored=cache?await cache.match(key(region,id)):null;
   const previous=stored?await stored.json().catch(()=>null):null;
   const cached=Array.isArray(previous?.offers)?previous.offers:[];
   if(previous?.state==='checked'&&previous.at<=now&&now-previous.at<ttl*1000&&cached.length&&cached.every(row=>current(row,now))){offers.push(...cached);results.push({...previous.result,cache:'fresh'});continue;}
   if(previous?.state==='unavailable'&&previous.at<=now&&now-previous.at<PUBLIC_PRICE_POLICY.negativeCacheMs){results.push(previous.result);continue;}
   const reply=await upstream(id,region),observedNow=clock(),result=reply.results.find(row=>row.productId===id)||{productId:id,state:'unavailable',error:'source_read_failed'};
   const observed=reply.offers.filter(row=>row.productId===id&&row.region===region&&row.currency===(region==='CA'?'CAD':'USD')&&current(row,observedNow));
   const refreshed=new Set(observed.map(row=>row.merchantId));
   const retained=cached.filter(row=>!refreshed.has(row.merchantId)&&current(row,observedNow)).map(row=>({...row,refreshState:'unavailable'}));
   const combined=[...observed,...retained];
   if(combined.length){
    const outcome=observed.length?{...result,cache:'upstream'}:{productId:id,state:'recent_observation',refreshError:result.error||result.state,cache:'daily-snapshot'};
    offers.push(...combined);results.push(outcome);
    if(cache)await cache.put(key(region,id),json({state:'checked',offers:combined,at:observedNow,result:outcome},200,'public, max-age='+daily));
   }else{
    results.push(result);if(cache&&result.state==='unavailable')await cache.put(key(region,id),json({state:'unavailable',at:observedNow,result},200,'public, max-age=300'));
   }
  }
  return {schema:1,region,currency:region==='CA'?'CAD':'USD',policy:'timestamped-retailer-observation',status:offers.length?'checked':'no_current_observation',checkedAt:new Date(now).toISOString(),offers,lowestByProduct:lowestEligiblePublicPrices(offers),results,coverage:{targets:PUBLIC_PRICE_TARGETS.filter(t=>t.region===region).length,merchants:new Set(PUBLIC_PRICE_TARGETS.filter(t=>t.region===region).map(t=>t.merchantId)).size,basis:'included-exact-listings-only'},charges:{tax:'excluded',shipping:'excluded'}};
 }
 return {read,async handle(request){
  const url=new URL(request.url);if(!url.pathname.startsWith(prefix))return null;
  if(!['GET','HEAD'].includes(request.method))return json({error:'method_not_allowed'},405);
  if(url.pathname===prefix+'/status')return json({schema:1,policy:PUBLIC_PRICE_POLICY,sourceMode:snapshotProvider?'daily-published-public-snapshot':'on-demand-public-listing',history:historyProvider?'recorded-observations-only':'not-configured',schedule:snapshotProvider?{time:'07:17',timezone:'America/Toronto',basis:'GitHub scheduled collection; start may be delayed'}:null,targets:PUBLIC_PRICE_TARGETS.map(({adapter:_,...t})=>t),scope:'Exact included listings only. Other stores remain unconnected.'},200,'public, max-age=900');
  if(url.pathname===prefix+'/history'){
   const id=url.searchParams.get('id'),region=url.searchParams.get('region')||'CA';
   if(url.search.length>500||[...url.searchParams.keys()].some(k=>!['id','region'].includes(k))||url.searchParams.getAll('id').length!==1||url.searchParams.getAll('region').length>1||!id||!/^[A-Za-z0-9_-]{1,120}$/.test(id)||!['CA','US'].includes(region))return json({error:'invalid_request'},400);
   if(!historyProvider)return json({error:'history_not_configured'},503);
   if(request.method==='HEAD')return new Response(null,{headers:{'X-Robots-Tag':'noindex, follow','Cache-Control':'no-store'}});
   try{return json(priceHistoryPayload(await historyProvider(),{id,region,now:clock()}),200,'public, max-age=900, must-revalidate');}catch{return json({error:'history_unavailable'},503);}
  }
  if(url.pathname!==prefix+'/offers')return json({error:'route_not_found'},404);
  const ids=(url.searchParams.get('ids')||'').split(','),region=url.searchParams.get('region')||'CA';
  if(url.search.length>3000||[...url.searchParams.keys()].some(k=>!['ids','region'].includes(k))||url.searchParams.getAll('ids').length!==1||url.searchParams.getAll('region').length>1||!['CA','US'].includes(region)||!ids.length||ids.length>20||ids.some(id=>!/^[A-Za-z0-9_-]{1,120}$/.test(id)))return json({error:'invalid_request'},400);
  if(request.method==='HEAD')return new Response(null,{headers:{'X-Robots-Tag':'noindex, follow','Cache-Control':'no-store'}});
  try{return json(await read([...new Set(ids)],region));}catch{return json({error:'price_source_unavailable'},503);}
 }};
}
export function createAssetSnapshotProvider(assets,{clock=Date.now}={}){
 let stored=null,until=0,pending=null;
 return async()=>{
  if(stored&&clock()<until)return stored;
  if(!pending)pending=(async()=>{
   const response=await assets.fetch(new Request('https://www.pcpartperformance.com/data/public-price-snapshot.json'));
   if(response.status!==200||!(response.headers.get('Content-Type')||'').includes('application/json')||Number(response.headers.get('Content-Length'))>65536||!response.body?.getReader)throw Error('snapshot_unavailable');
   const reader=response.body.getReader(),chunks=[];let length=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>65536){await reader.cancel();throw Error('snapshot_oversize');}chunks.push(value);}}finally{reader.releaseLock();}
   const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   const raw=JSON.parse(new TextDecoder().decode(bytes));stored=raw;until=clock()+ttl*1000;return raw;
  })();
  try{return await pending;}finally{pending=null;}
 };
}
let service;const assetServices=new WeakMap();
const runtime=env=>{
 if(env?.ASSETS){let snapshotService=assetServices.get(env.ASSETS);if(!snapshotService){snapshotService=createPublicPriceService({snapshotProvider:createAssetSnapshotProvider(env.ASSETS),historyProvider:createPriceHistoryAssetProvider(env.ASSETS)});assetServices.set(env.ASSETS,snapshotService);}return snapshotService;}
 return service||(service=createPublicPriceService({cache:globalThis.caches?.default||null}));
};
export const handlePublicPriceRequest=(request,env)=>runtime(env).handle(request);
export async function scheduledPublicPrices(controller,env){
 if(env?.ASSETS)return {status:'collection_managed_by_git_workflow'};
 const now=controller.scheduledTime||Date.now(),local=new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',hour:'2-digit',hourCycle:'h23'}).format(new Date(now));
 if(local!=='07')return {status:'outside_morning_window'};
 const results=[];for(const region of ['CA','US']){const ids=[...new Set(PUBLIC_PRICE_TARGETS.filter(t=>t.region===region).map(t=>t.productId))];if(ids.length)results.push(await runtime().read(ids,region));}
 return {status:'completed',results};
}
