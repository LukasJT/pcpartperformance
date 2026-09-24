/* Keep component sections stable when the compatibility engine rerenders. */
(()=>{
 const groups=[['cpu','core','Core components','Processor, motherboard, graphics and memory'],['ssd','storage','Storage','Solid-state and hard drives'],['psu','housing','Case & cooling','Power, enclosure and airflow']];
 function organize(){
  const wrap=document.querySelector('#builder-parts');if(!wrap)return;
  for(const [slot,id,title,description] of groups){const row=wrap.querySelector(`[data-builder-row="${slot}"]`);if(!row||wrap.querySelector('#parts-'+id))continue;const heading=document.createElement('div');heading.className='builder-group';heading.id='parts-'+id;const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=description;heading.append(h,p);row.before(heading);}
  const preview=document.querySelector('.assembly-panel'),status=document.querySelector('.builder-analysis');if(preview)preview.id='build-preview';if(status)status.id='build-status';
  if(!document.querySelector('.builder-jump-nav')){const nav=document.createElement('nav');nav.className='builder-jump-nav';nav.setAttribute('aria-label','Builder sections');for(const [href,label] of [['parts-core','Core parts'],['parts-storage','Storage'],['parts-housing','Case & cooling'],['build-preview','3D preview'],['build-status','Build status']]){const a=document.createElement('a');a.href='#'+href;a.textContent=label;nav.append(a);}document.querySelector('.builder-toolbar')?.before(nav);}
 }
 document.addEventListener('pcp:build',organize);document.addEventListener('DOMContentLoaded',organize);
})();
