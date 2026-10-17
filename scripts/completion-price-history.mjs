import {PUBLIC_SNAPSHOT_TARGETS,validatePublicPriceObservation} from './public-price-snapshot.mjs';
export const HISTORY_SCHEMA=1,MAX_HISTORY_ROWS=10000,MAX_PER_LISTING=366;
const group=row=>[row.region,row.merchantId,row.productId].join(':'),key=row=>group(row)+':'+row.checkedAt;
function historicalRow(raw,now){
 const checked=Date.parse(raw?.checkedAt);if(!Number.isFinite(checked)||checked>now)return null;
 // Validate the original evidence at its observation time. An expired observation
 // is legitimate history, but can never enter a current purchase subtotal.
 const result=validatePublicPriceObservation(raw,{now:checked});return result.valid?result.observation:null;
}
export function validatePriceHistory(raw,{now=Date.now()}={}){
 if(!raw||raw.schema!==HISTORY_SCHEMA||raw.policy!=='recorded-exact-listing-observations'||!Number.isFinite(now)||!Number.isFinite(Date.parse(raw.updatedAt))||Date.parse(raw.updatedAt)>now||!Array.isArray(raw.observations)||raw.observations.length>MAX_HISTORY_ROWS)return{valid:false,observations:[],rejected:1};
 const rows=new Map(),conflicts=new Set();let rejected=0;
 for(const input of raw.observations){const row=historicalRow(input,now);if(!row||Date.parse(row.checkedAt)>Date.parse(raw.updatedAt)){rejected++;continue;}const id=key(row),before=rows.get(id);if(before&&(before.price!==row.price||before.inStock!==row.inStock||before.condition!==row.condition)){conflicts.add(id);rejected++;}else rows.set(id,row);}
 for(const id of conflicts)rows.delete(id);
 const observations=[...rows.values()].sort((a,b)=>Date.parse(a.checkedAt)-Date.parse(b.checkedAt)||key(a).localeCompare(key(b)));
 return{valid:rejected===0,observations,rejected};
}
export function appendPriceHistory(previous,snapshot,{now=Date.now()}={}){
 const existing=previous?validatePriceHistory(previous,{now}):{valid:true,observations:[]};if(!existing.valid)throw new TypeError('invalid_existing_price_history');
 if(!snapshot||snapshot.schema!==1||snapshot.policy!=='daily-checked-snapshot'||!Array.isArray(snapshot.observations)||snapshot.observations.length>PUBLIC_SNAPSHOT_TARGETS.length||!Number.isFinite(Date.parse(snapshot.generatedAt))||Date.parse(snapshot.generatedAt)>now)throw new TypeError('invalid_history_snapshot');
 const rows=new Map(existing.observations.map(row=>[key(row),row]));
 for(const input of snapshot.observations){const row=historicalRow(input,now);if(!row||Date.parse(row.checkedAt)>Date.parse(snapshot.generatedAt))throw new TypeError('invalid_history_observation');const before=rows.get(key(row));if(before&&(before.price!==row.price||before.inStock!==row.inStock||before.condition!==row.condition))throw new TypeError('conflicting_history_observation');rows.set(key(row),row);}
 const groups=new Map();for(const row of rows.values()){const id=group(row);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(row);}
 const observations=[...groups.values()].flatMap(list=>list.sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt)).slice(0,MAX_PER_LISTING)).sort((a,b)=>Date.parse(a.checkedAt)-Date.parse(b.checkedAt)||key(a).localeCompare(key(b)));
 return{schema:HISTORY_SCHEMA,policy:'recorded-exact-listing-observations',updatedAt:new Date(now).toISOString(),maxObservationsPerListing:MAX_PER_LISTING,observations};
}
export function priceHistoryPayload(raw,{id,region='CA',now=Date.now()}={}){
 if(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,120}$/.test(id)||!['CA','US'].includes(region))throw new TypeError('invalid_history_request');
 const data=validatePriceHistory(raw,{now}),observations=data.observations.filter(row=>row.productId===id&&row.region===region).map(row=>({productId:row.productId,sku:row.sku,merchant:row.merchant,merchantId:row.merchantId,seller:row.seller,region:row.region,currency:row.currency,price:row.price,condition:row.condition,inStock:row.inStock,checkedAt:row.checkedAt,url:row.url}));
 return{schema:1,policy:'historical-observations-not-current-offers',region,currency:region==='CA'?'CAD':'USD',productId:id,status:observations.length?'recorded':'no_recorded_observations',observations,coverage:{count:observations.length,firstAt:observations[0]?.checkedAt||null,lastAt:observations.at(-1)?.checkedAt||null,interpolated:false,allRetailers:false},rejected:data.rejected};
}
export function createPriceHistoryAssetProvider(assets,{clock=Date.now}={}){
 let stored=null,until=0,pending=null;
 return async()=>{if(stored&&clock()<until)return stored;if(!pending)pending=(async()=>{
  const response=await assets.fetch(new Request('https://www.pcpartperformance.com/data/public-price-history.json'));
  if(response.status!==200||!(response.headers.get('Content-Type')||'').includes('application/json')||Number(response.headers.get('Content-Length'))>4*1024*1024||!response.body?.getReader)throw Error('history_unavailable');
  const reader=response.body.getReader(),chunks=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>4*1024*1024){await reader.cancel();throw Error('history_oversize');}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}const parsed=JSON.parse(new TextDecoder().decode(bytes));
  if(!validatePriceHistory(parsed,{now:clock()}).valid)throw Error('history_invalid');stored=parsed;until=clock()+900000;return stored;
 })();try{return await pending;}finally{pending=null;}};
}
