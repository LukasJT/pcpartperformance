const state=new Map(),requests=new Map();let registry;
const loadTargets=()=>registry||(registry=fetch('/api/v1/public-prices/status').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(data.schema!==1||!Array.isArray(data.targets)||data.targets.length>100)throw Error();return data.targets;}).catch(error=>{registry=null;throw error;}));
function expectedSource(target){
 if(target.merchantId==='canada-computers'&&target.merchant==='Canada Computers'&&target.seller==='Canada Computers & Electronics'&&target.region==='CA'&&/^https:\/\/www\.canadacomputers\.com\/en\/[a-z0-9-]+\/\d{5,8}\/[a-z0-9-]+\.html$/.test(target.listingUrl))return'public-retailer-structured-data';
 if(target.merchantId==='newegg-us'&&target.merchant==='Newegg'&&target.seller==='Newegg'&&target.region==='US'&&/^https:\/\/www\.newegg\.com\/[a-z0-9-]+\/p\/N82E168\d{8}$/.test(target.listingUrl))return'public-retailer-original-state';
 if(target.merchantId==='corsair'&&target.merchant==='CORSAIR'&&target.seller==='CORSAIR'&&['CA','US'].includes(target.region)&&target.listingUrl.startsWith('https://www.corsair.com/'+target.region.toLowerCase()+'/en/p/')&&!/[?#]/.test(target.listingUrl))return'public-manufacturer-structured-data';
 return null;
}
export function validateObservation(offer,target,now=Date.now()){
 if(!offer||!target||!expectedSource(target)||offer.productId!==target.productId||offer.sku!==target.sku||offer.retailerMpn!==(target.retailerMpn||target.sku)||target.retailerSku!==null&&offer.retailerSku!==target.retailerSku||offer.exactVariant!==true||offer.region!==target.region||offer.currency!==target.currency||offer.currency!==(offer.region==='CA'?'CAD':'USD')||offer.merchantId!==target.merchantId||offer.merchant!==target.merchant||offer.url!==target.listingUrl||offer.seller!==target.seller||offer.variant!==target.variant||offer.memoryVariant!==target.memoryVariant||offer.revision!==target.revision||offer.charges?.tax!=='excluded'||offer.charges?.shipping!=='excluded'||!(target.merchantId==='newegg-us'?['new','unknown']:['new']).includes(offer.condition)||typeof offer.price!=='number'||!Number.isFinite(offer.price)||offer.price<=0||offer.price>1000000||Math.abs(offer.price*100-Math.round(offer.price*100))>0.000001||![true,false,null].includes(offer.inStock))return false;
 const checked=Date.parse(offer.checkedAt),until=Date.parse(offer.expiresAt);
 return Number.isFinite(checked)&&Number.isFinite(until)&&checked<=now&&now<until&&until>checked&&until-checked<=86400000&&offer.source?.url===target.listingUrl&&offer.source?.publisher===target.merchant&&offer.source?.kind===expectedSource(target);
}
export function observationsFor(id,region,now=Date.now()){return(state.get(region+':'+id)?.offers||[]).filter(o=>now<Date.parse(o.expiresAt));}
export function offersFor(id,region){return observationsFor(id,region).filter(o=>o.condition==='new'&&o.inStock===true).map(o=>({...o,id:o.productId,store:o.merchant,model:o.sku,validUntil:o.expiresAt}));}
export async function refresh(ids,region){
 if(!Array.isArray(ids)||ids.length>20||ids.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{1,120}$/.test(id))||!['CA','US'].includes(region))throw Error('invalid_price_request');
 const targets=await loadTargets(),wanted=targets.filter(t=>t.region===region&&ids.includes(t.productId)),now=Date.now();
 const pending=[...new Set(wanted.filter(t=>now-(state.get(region+':'+t.productId)?.loadedAt||0)>=900000).map(t=>t.productId))];
 if(!pending.length)return;
 const cacheKey=region+':'+pending.slice().sort().join(',');if(requests.has(cacheKey))return requests.get(cacheKey);
 const request=(async()=>{const response=await fetch('/api/v1/public-prices/offers?region='+region+'&ids='+encodeURIComponent(pending.join(',')),{cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();if(data.schema!==1||data.region!==region||data.currency!==(region==='CA'?'CAD':'USD')||!Array.isArray(data.offers)||data.offers.length>100)throw Error();for(const id of pending){const matching=wanted.filter(t=>t.productId===id);state.set(region+':'+id,{loadedAt:Date.now(),offers:data.offers.filter(o=>o.productId===id&&matching.some(target=>validateObservation(o,target)))});}if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('pcp:prices'));})();
 requests.set(cacheKey,request);try{await request;}finally{requests.delete(cacheKey);}
}
globalThis.PCP_PUBLIC_PRICES={offersFor,observationsFor,refresh};
