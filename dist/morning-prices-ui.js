/* Daily observations are separate from the catalog's current-offer policy. */
(()=>{'use strict';
 const host=document.querySelector('[data-morning-prices]');if(!host)return;
 const status=host.querySelector('[data-morning-status]'),results=host.querySelector('[data-morning-results]');
 let generation=0,timer,expiryTimer,controller;const disabledUntil=new Map();
 const element=(tag,value)=>{const el=document.createElement(tag);if(value!==undefined)el.textContent=value;return el};
 const hasText=value=>typeof value==='string'&&value.length>0&&value.length<=200&&value===value.trim()&&!/[\u0000-\u001f\u007f]/.test(value);
 function selections(){
  const ids=host.dataset.morningIds;
  if(ids)return ids.split(',').map(id=>({id,quantity:1,owned:false}));
  const snapshot=window.PCP_BUILD?.snapshot();if(!snapshot)return[];
  const owned=new Set([...document.querySelectorAll('[data-program-owned]:checked')].map(e=>e.dataset.programOwned));
  const count=new Map();for(const values of Object.values(snapshot.parts))for(const id of values)count.set(id,(count.get(id)||0)+1);
  return [...count].map(([id,quantity])=>({id,quantity,owned:owned.has(id)}));
 }
 function render(data,items,region){
  clearTimeout(expiryTimer);results.replaceChildren();
  if(['disabled','not_configured'].includes(data.status)){disabledUntil.set(region,Date.now()+900000);status.textContent='Morning prices are not available yet. Use the store links to check the exact product.';return}
  if(!items.length){status.textContent='Choose parts to see available morning price checks.';return}
  const currency=region==='CA'?'CAD':'USD',now=Date.now(),requested=new Set(items.map(p=>p.id)),valid=[];
  for(const offer of Array.isArray(data.offers)?data.offers:[]){
   let link,logo;try{link=new URL(offer.url);logo=offer.source?.logoUrl?new URL(offer.source.logoUrl,location.origin):null}catch{continue}
   const sku=offer.retailerSku,exactLink=typeof sku==='string'&&/^\d{7}$/.test(sku)&&link.protocol==='https:'&&!link.port&&!link.username&&!link.password&&!link.hash&&['bestbuy.com','www.bestbuy.com','api.bestbuy.com'].includes(link.hostname)&&![...link.searchParams.keys()].some(key=>/key|token|secret|password|signature/i.test(key))&&(link.hostname==='api.bestbuy.com'?new RegExp('^/click/(?:-|[a-zA-Z0-9_-]{1,160})/'+sku+'/pdp$').test(link.pathname):link.searchParams.getAll('skuId').length<=1&&(!link.searchParams.has('skuId')||link.searchParams.get('skuId')===sku)&&(link.searchParams.get('skuId')===sku||link.pathname.endsWith('/'+sku+'.p')));
   const approvedLogo=logo&&(offer.source.logoUrl==='https://developer.bestbuy.com/images/bestbuy-logo.png'||/^\/assets\/retailers\/[A-Za-z0-9_-]+\.(?:png|svg|webp)$/.test(offer.source.logoUrl));
   if(offer.schema!==1||!requested.has(offer.productId)||!hasText(offer.name)||!hasText(offer.modelNumber)||offer.seller!=='Best Buy'||offer.merchant!=='Best Buy'||offer.merchantId!=='bestbuy-us'||offer.source?.kind!=='authorized-retailer-api'||offer.source.publisher!=='Best Buy'||offer.source.attribution!=='Best Buy'||offer.source.url!==offer.url||offer.availability!=='in-stock'||offer.stale!==false||offer.region!==region||offer.currency!==currency||offer.exactVariant!==true||offer.policy!=='daily-checked-snapshot'||offer.eligible!==true||offer.inStock!==true||offer.condition!=='new'||typeof offer.price!=='number'||!Number.isFinite(offer.price)||!(offer.price>0&&offer.price<1000000)||!Number.isFinite(Date.parse(offer.expiresAt))||Date.parse(offer.expiresAt)<=now||!Number.isFinite(Date.parse(offer.checkedAt))||Date.parse(offer.checkedAt)>now||Date.parse(offer.expiresAt)<=Date.parse(offer.checkedAt)||Date.parse(offer.expiresAt)-Date.parse(offer.checkedAt)>86400000||!exactLink||!approvedLogo)continue;
   valid.push(offer);
  }
  const lowest=new Map();for(const offer of valid)if(!lowest.has(offer.productId)||lowest.get(offer.productId).price>offer.price)lowest.set(offer.productId,offer);
  const money=value=>new Intl.NumberFormat(region==='CA'?'en-CA':'en-US',{style:'currency',currency,currencyDisplay:'code'}).format(value);
  const purchases=items.filter(p=>!p.owned),priced=purchases.filter(p=>lowest.has(p.id)),quantity=p=>p.reduce((sum,item)=>sum+item.quantity,0);
  const subtotal=priced.reduce((sum,p)=>sum+lowest.get(p.id).price*p.quantity,0);
  status.textContent=priced.length?(priced.length===purchases.length?'Morning-checked purchase subtotal: ':'Partial morning-checked subtotal: ')+money(subtotal)+'. '+quantity(priced)+' of '+quantity(purchases)+' new items priced.':'No eligible morning price for the selected products.';
  const list=element('ul');for(const p of purchases){const offer=lowest.get(p.id);if(!offer)continue;const row=element('li'),a=element('a',offer.name+' · '+money(offer.price)+(p.quantity>1?' × '+p.quantity:''));a.href=offer.url;a.target='_blank';a.rel='noopener';a.dataset.merchant=offer.merchant;const brand=element('img');brand.src=offer.source.logoUrl;brand.alt=offer.source.attribution||offer.merchant;brand.width=70;brand.height=32;brand.loading='lazy';row.append(brand,a,element('p',offer.seller+' · New · Available online · Checked '+new Date(offer.checkedAt).toLocaleString(region==='CA'?'en-CA':'en-US')+'. Tax and shipping excluded.'));list.append(row)}results.append(list);
  if(valid.length)results.append(element('p','Lowest among the checked stores for this exact variant. This is a daily snapshot, not a checkout quote.'));
  if(valid.length)expiryTimer=setTimeout(refresh,Math.max(100,Math.min(900000,...valid.map(offer=>Date.parse(offer.expiresAt)-now+20))));
 }
 async function refresh(){
  const run=++generation,items=selections();
  let region='CA';try{region=new URLSearchParams(location.search).get('region')||localStorage.getItem('pcp-region')||'CA'}catch{}if(!['CA','US'].includes(region))region='CA';
  if(Date.now()<(disabledUntil.get(region)||0)){render({status:'not_configured'},items,region);return}
  clearTimeout(expiryTimer);results.replaceChildren();status.textContent='Checking available prices…';
  controller?.abort();const active=new AbortController();controller=active;const abort=setTimeout(()=>active.abort(),8000);
  try{const ids=[...new Set(items.map(p=>p.id))].slice(0,50),url=ids.length?'/api/v1/morning-prices?'+new URLSearchParams({region,ids:ids.join(',')}):'/api/v1/morning-prices/status';const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Price check unavailable');const data=await response.json();if(run===generation)render(data,items,region)}catch{if(run===generation){status.textContent='Morning price checks are unavailable. Your parts and store links still work.';results.replaceChildren()}}finally{clearTimeout(abort)}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(refresh,150)}
 document.addEventListener('pcp:build-state',schedule);document.addEventListener('change',event=>{if(event.target.matches('[data-program-owned]'))schedule()});
 document.querySelectorAll('.country-switch [data-region]').forEach(button=>button.addEventListener('click',schedule));
  host.querySelector('[data-morning-refresh]').addEventListener('click',()=>{disabledUntil.clear();refresh()});refresh();
})();
