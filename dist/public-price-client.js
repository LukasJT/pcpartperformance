const state=new Map(),requests=new Map();let registry;
const loadTargets=()=>registry||(registry=fetch('/api/v1/public-prices/status').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(data.schema!==1||!Array.isArray(data.targets)||data.targets.length>100)throw Error();return data.targets;}).catch(error=>{registry=null;throw error;}));
export function validateObservation(offer,target,now=Date.now()){
 if(!offer||!target||offer.productId!==target.productId||offer.sku!==target.sku||offer.retailerMpn!==target.retailerMpn||offer.exactVariant!==true||offer.region!==target.region||offer.currency!==target.currency||offer.merchantId!==target.merchantId||offer.merchant!==target.merchant||offer.url!==target.listingUrl||offer.seller!==target.seller||offer.variant!==target.variant||offer.memoryVariant!==target.memoryVariant||offer.revision!==target.revision||offer.charges?.tax!=='excluded'||offer.charges?.shipping!=='excluded'||!['new','unknown'].includes(offer.condition)||typeof offer.price!=='number'||!Number.isFinite(offer.price)||offer.price<=0||offer.price>1000000||Math.abs(offer.price*100-Math.round(offer.price*100))>0.000001||![true,false,null].includes(offer.inStock))return false;
 const checked=Date.parse(offer.checkedAt),until=Date.parse(offer.expiresAt);
 return Number.isFinite(checked)&&Number.isFinite(until)&&checked<=now&&now<until&&until-checked<=86400000&&offer.source?.url===target.listingUrl&&['public-retailer-structured-data','public-retailer-original-state'].includes(offer.source?.kind);
}
export function observationsFor(id,region,now=Date.now()){return(state.get(region+':'+id)?.offers||[]).filter(o=>now<Date.parse(o.expiresAt));}
export function offersFor(id,region){return observationsFor(id,region).filter(o=>o.condition==='new'&&o.inStock===true).map(o=>({...o,id:o.productId,store:o.merchant,model:o.sku,validUntil:o.expiresAt}));}
export async function refresh(ids,region){
 const targets=await loadTargets(),wanted=targets.filter(t=>t.region===region&&ids.includes(t.productId)),now=Date.now();
 const pending=wanted.filter(t=>now-(state.get(region+':'+t.productId)?.loadedAt||0)>=900000);
 if(!pending.length)return;
 const cacheKey=region+':'+pending.map(t=>t.productId).sort().join(',');if(requests.has(cacheKey))return requests.get(cacheKey);
 const request=(async()=>{const response=await fetch('/api/v1/public-prices/offers?region='+region+'&ids='+encodeURIComponent(pending.map(t=>t.productId).join(',')),{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();if(data.schema!==1||data.region!==region||!Array.isArray(data.offers)||data.offers.length>100)throw Error();for(const target of pending)state.set(region+':'+target.productId,{loadedAt:Date.now(),offers:data.offers.filter(o=>validateObservation(o,target)&&o.productId===target.productId)});document.dispatchEvent(new CustomEvent('pcp:prices'));})();
 requests.set(cacheKey,request);try{await request;}finally{requests.delete(cacheKey);}
}
globalThis.PCP_PUBLIC_PRICES={offersFor,observationsFor,refresh};
