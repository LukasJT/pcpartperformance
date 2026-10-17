/* Loaded only on products with recorded history; records load when expanded. */
export function validatedHistory(data,{id,region,targets,now=Date.now()}={}){
 if(!data||data.schema!==1||data.policy!=='historical-observations-not-current-offers'||data.productId!==id||data.region!==region||data.currency!==(region==='CA'?'CAD':'USD')||!Array.isArray(data.observations)||data.observations.length>1000||!Array.isArray(targets)||targets.length>100)throw Error('invalid_history');
 const result=[];for(const row of data.observations){const target=targets.find(t=>t.productId===id&&t.region===region&&t.merchantId===row.merchantId);if(!target||row.productId!==id||row.region!==region||row.currency!==data.currency||row.sku!==target.sku||row.merchant!==target.merchant||row.seller!==target.seller||row.url!==target.listingUrl||!(target.merchantId==='newegg-us'?['new','unknown']:['new']).includes(row.condition)||![true,false,null].includes(row.inStock)||!Number.isFinite(row.price)||row.price<=0||row.price>1000000||Math.abs(row.price*100-Math.round(row.price*100))>0.000001||!Number.isFinite(Date.parse(row.checkedAt))||Date.parse(row.checkedAt)>now)throw Error('invalid_history_row');result.push({...row});}
 return result.sort((a,b)=>Date.parse(b.checkedAt)-Date.parse(a.checkedAt));
}
if(typeof document!=='undefined'){
 const cache=new Map();let targetPromise;
 const region=()=>document.documentElement.dataset.region==='US'?'US':'CA';
 const node=(tag,text)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;};
 async function targets(){if(!targetPromise)targetPromise=fetch('/api/v1/public-prices/status').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(data.schema!==1||!Array.isArray(data.targets))throw Error();return data.targets;}).catch(error=>{targetPromise=null;throw error;});return targetPromise;}
 for(const details of document.querySelectorAll('[data-price-history]')){
  const content=details.querySelector('[data-history-content]'),id=details.dataset.productId;let revision=0;
  async function render(){if(!details.open)return;const version=++revision,selectedRegion=region();content.replaceChildren(node('p','Loading recorded prices…'));
   try{const key=selectedRegion+':'+id;let data=cache.get(key);const registry=await targets();if(!data||Date.now()-data.loadedAt>=900000){const response=await fetch('/api/v1/public-prices/history?id='+encodeURIComponent(id)+'&region='+selectedRegion);if(!response.ok)throw Error();data={rows:validatedHistory(await response.json(),{id,region:selectedRegion,targets:registry}),loadedAt:Date.now()};cache.set(key,data);}if(version!==revision||selectedRegion!==region())return;
    if(!data.rows.length){content.replaceChildren(node('p','No recorded prices for this product in '+(selectedRegion==='CA'?'Canada.':'the United States.')));return;}
    const currency=selectedRegion==='CA'?'CAD':'USD',locale=selectedRegion==='CA'?'en-CA':'en-US',money=value=>new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'code'}).format(value),dates=new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}),table=node('table'),caption=node('caption',data.rows.length+' retailer observation'+(data.rows.length===1?'':'s')+' · '+currency),head=node('thead'),headRow=node('tr'),body=node('tbody');
    for(const title of ['Checked','Price','Store','Stock']){const th=node('th',title);th.scope='col';headRow.append(th);}head.append(headRow);
    for(const row of data.rows){const tr=node('tr'),time=node('time',dates.format(new Date(row.checkedAt)));time.dateTime=row.checkedAt;const dateCell=node('td');dateCell.append(time);const store=node('a',row.merchant);store.href=row.url;store.target='_blank';store.rel='noopener noreferrer';const storeCell=node('td');storeCell.append(store);tr.append(dateCell,node('td',money(row.price)),storeCell,node('td',row.inStock===true?'Available when checked':row.inStock===false?'Sold out when checked':'Not confirmed'));body.append(tr);}
    table.append(caption,head,body);const scroll=node('div');scroll.className='table-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Recorded price observations');scroll.append(table);const explanation=node('p','Recorded prices, not current offers. Missing dates are omitted.');explanation.className='muted';content.replaceChildren(explanation);
    if(data.rows.length>1){
     const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 480 150');svg.setAttribute('class','price-history-chart');svg.setAttribute('role','img');svg.setAttribute('aria-label','Recorded price points. No values are interpolated between checks. The table gives every exact observation.');
     const times=data.rows.map(r=>Date.parse(r.checkedAt)),prices=data.rows.map(r=>r.price),first=Math.min(...times),last=Math.max(...times),min=Math.min(...prices),max=Math.max(...prices),shortDates=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'});
     const label=(text,x,y,anchor='start')=>{const item=document.createElementNS(svg.namespaceURI,'text');item.textContent=text;item.setAttribute('x',String(x));item.setAttribute('y',String(y));item.setAttribute('font-size','14');item.setAttribute('fill','var(--muted)');item.setAttribute('text-anchor',anchor);svg.append(item);};
     label(money(max),24,20);label(shortDates.format(new Date(first)),24,140);label(shortDates.format(new Date(last)),456,140,'end');if(min!==max)label(money(min),456,20,'end');
     const axis=document.createElementNS(svg.namespaceURI,'path');axis.setAttribute('d','M24 118H456');axis.setAttribute('stroke','var(--line)');svg.append(axis);
     for(const row of data.rows){const circle=document.createElementNS(svg.namespaceURI,'circle');circle.setAttribute('cx',String(24+(last===first?0.5:(Date.parse(row.checkedAt)-first)/(last-first))*432));circle.setAttribute('cy',String(max===min?70:100-(row.price-min)/(max-min)*60));circle.setAttribute('r','5');circle.setAttribute('fill','var(--accent-ink)');const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=dates.format(new Date(row.checkedAt))+' · '+money(row.price)+' · '+row.merchant;circle.append(title);svg.append(circle);}content.append(svg);
    }
    content.append(scroll);
   }catch{if(version!==revision)return;const retry=node('button','Retry price history');retry.type='button';retry.className='button secondary';retry.addEventListener('click',render,{once:true});content.replaceChildren(node('p','Price history could not load.'),retry);}
  }
  details.addEventListener('toggle',()=>{if(details.open)render();else revision++;});new MutationObserver(()=>{if(details.open)render();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-region']});
  if(location.hash==='#price-history')details.open=true;
 }
}
