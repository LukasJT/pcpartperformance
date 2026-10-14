import { PUBLIC_PRICE_TARGETS as CA_TARGETS, PUBLIC_PRICE_POLICY, createPublicPriceCollector } from './oct14-price-sources.mjs';
import { NEWEGG_PUBLIC_TARGET, fetchNeweggPublicTarget } from './oct14-price-sources-newegg.mjs';
const PUBLIC_PRICE_TARGETS=[...CA_TARGETS,{...NEWEGG_PUBLIC_TARGET,retailerMpn:NEWEGG_PUBLIC_TARGET.sku}];

const prefix='/api/v1/public-prices', ttl=900, daily=86400;
const canada=createPublicPriceCollector(),usCache=new Map(),usFlight=new Map();
const collector={async collect(ids,{region}){
 if(region==='CA')return canada.collect(ids,{region});
 const offers=[],results=[];
 for(const id of ids){if(id!==NEWEGG_PUBLIC_TARGET.productId){results.push({productId:id,state:'not_covered'});continue;}
  let result=usCache.get(id);if(!result||Date.now()>=result.until){let pending=usFlight.get(id);if(!pending){pending=fetchNeweggPublicTarget().then(offer=>({productId:id,state:'checked',offer})).catch(error=>({productId:id,state:'unavailable',error:error.code||'source_network_error',...(error.diagnostic?{diagnostic:error.diagnostic}:{}),offer:null}));usFlight.set(id,pending);}try{result={result:await pending};result.until=Date.now()+(result.result.offer?PUBLIC_PRICE_POLICY.cacheMs:PUBLIC_PRICE_POLICY.negativeCacheMs);usCache.set(id,result);}finally{usFlight.delete(id);}}
  if(result.result.offer)offers.push(result.result.offer);const {offer:_,...row}=result.result;results.push(row);
 }
 return {offers,results};
}};
const json=(body,status=200,cache='no-store')=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':cache,'X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff'}});
const key=(region,id)=>new Request('https://www.pcpartperformance.com/__price_cache/v3/'+region+'/'+id);
const current=(offer,now)=>offer&&Number.isFinite(Date.parse(offer.checkedAt))&&Date.parse(offer.checkedAt)<=now&&now<Date.parse(offer.expiresAt);
export function createPublicPriceService({reader=collector,cache=null,clock=Date.now}={}){
 async function read(ids,region){
  const now=clock(),offers=[],results=[];
  for(const id of ids){
   const stored=cache?await cache.match(key(region,id)):null;
   const previous=stored?await stored.json().catch(()=>null):null;
   if(previous?.state==='checked'&&current(previous.offer,now)&&now-Date.parse(previous.offer.checkedAt)<ttl*1000){offers.push(previous.offer);results.push({productId:id,state:'checked',cache:'fresh'});continue;}
   if(previous?.state==='unavailable'&&now-previous.at<PUBLIC_PRICE_POLICY.negativeCacheMs){results.push(previous.result);continue;}
   const reply=await reader.collect([id],{region}),offer=reply.offers[0],result=reply.results[0],observedNow=clock();
   if(offer&&current(offer,observedNow)){
    offers.push(offer);results.push({...result,cache:'upstream'});
    if(cache)await cache.put(key(region,id),json({state:'checked',offer},200,'public, max-age='+daily));
   }else if(current(previous?.offer,observedNow)){
    offers.push({...previous.offer,refreshState:'unavailable'});results.push({productId:id,state:'recent_observation',refreshError:result.error||result.state,cache:'daily-snapshot'});
   }else{
    results.push(result);if(cache&&result.state==='unavailable')await cache.put(key(region,id),json({state:'unavailable',at:now,result},200,'public, max-age=300'));
   }
  }
  const purchasable=offers.filter(o=>o.condition==='new'&&o.inStock===true);
  return {schema:1,region,currency:region==='CA'?'CAD':'USD',policy:'timestamped-retailer-observation',status:offers.length?'checked':'no_current_observation',checkedAt:new Date(now).toISOString(),offers,lowestByProduct:Object.fromEntries(purchasable.map(o=>[o.productId,o])),results,coverage:{targets:PUBLIC_PRICE_TARGETS.filter(t=>t.region===region).length,merchants:[...new Set(PUBLIC_PRICE_TARGETS.filter(t=>t.region===region).map(t=>t.merchant))],basis:'included-exact-listings-only'},charges:{tax:'excluded',shipping:'excluded'}};
 }
 return {read,async handle(request){
  const url=new URL(request.url);if(!url.pathname.startsWith(prefix))return null;
  if(!['GET','HEAD'].includes(request.method))return json({error:'method_not_allowed'},405);
  if(url.pathname===prefix+'/status')return json({schema:1,policy:PUBLIC_PRICE_POLICY,targets:PUBLIC_PRICE_TARGETS.map(({adapter:_,...t})=>t),scope:'Exact included listings only. Other stores remain unconnected.'},200,'public, max-age=900');
  if(url.pathname!==prefix+'/offers')return json({error:'route_not_found'},404);
  const ids=(url.searchParams.get('ids')||'').split(','),region=url.searchParams.get('region')||'CA';
  if(url.search.length>3000||[...url.searchParams.keys()].some(k=>!['ids','region'].includes(k))||url.searchParams.getAll('ids').length!==1||url.searchParams.getAll('region').length>1||!['CA','US'].includes(region)||!ids.length||ids.length>20||ids.some(id=>!/^[A-Za-z0-9_-]{1,120}$/.test(id)))return json({error:'invalid_request'},400);
  if(request.method==='HEAD')return new Response(null,{headers:{'X-Robots-Tag':'noindex, follow','Cache-Control':'no-store'}});
  try{return json(await read([...new Set(ids)],region));}catch{return json({error:'price_source_unavailable'},503);}
 }};
}
let service;
const runtime=()=>service||(service=createPublicPriceService({cache:globalThis.caches?.default||null}));
export const handlePublicPriceRequest=request=>runtime().handle(request);
export async function scheduledPublicPrices(controller){
 const now=controller.scheduledTime||Date.now(),local=new Intl.DateTimeFormat('en-US',{timeZone:'America/Toronto',hour:'2-digit',hourCycle:'h23'}).format(new Date(now));
 if(local!=='07')return {status:'outside_morning_window'};
 const results=[];for(const region of ['CA','US']){const ids=PUBLIC_PRICE_TARGETS.filter(t=>t.region===region).map(t=>t.productId);if(ids.length)results.push(await runtime().read(ids,region));}
 return {status:'completed',results};
}
