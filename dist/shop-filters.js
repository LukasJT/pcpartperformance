/* Multi-select facets: OR within a group, AND between groups. */
(()=>{'use strict';
const state={category:new Set(),brand:new Set(),series:new Set()};
const names={gpu:'Graphics cards',cpu:'Processors',ram:'Memory',ssd:'SSDs',board:'Motherboards',psu:'Power supplies',case:'Cases',hdd:'Hard drives',monitor:'Monitors',mouse:'Mice',keyboard:'Keyboards',headset:'Headsets',microphone:'Microphones',controller:'Controllers',console:'Consoles',handheld:'Handhelds',phone:'Phones'};
const picks=['rtx5070','rtx5060ti16','9800x3d','7800x3d','990pro','ddr5','b650','rx9070xt','rx9070','rtx5080','rtx4070s','rtx4060','rx7800xt','7600','9700x','sn850x','ddr4'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function series(p){if(p.cat!=='gpu')return '';const n=p.name.toUpperCase();if(p.brand==='NVIDIA'){const r=n.match(/RTX\s*(20|30|40|50)\d{2}/);if(r)return 'NVIDIA RTX '+r[1]+' series';const g=n.match(/GTX\s*(10|16)\d{2}/);if(g)return 'NVIDIA GTX '+g[1]+' series'}if(p.brand==='AMD'){const r=n.match(/RX\s*(5|6|7|9)\d{3}/);if(r)return 'AMD RX '+r[1]+'000 series'}if(p.brand==='Intel'){const r=n.match(/ARC\s*([AB])\d{3}/);if(r)return 'Intel Arc '+r[1]+' series'}return 'Other graphics cards'}
function matches(p,skip){return(skip==='category'||!state.category.size||state.category.has(p.cat))&&(skip==='brand'||!state.brand.size||state.brand.has(p.brand))&&(skip==='series'||!state.series.size||state.series.has(series(p)))}
function rank(p){const preferred=picks.indexOf(p.id);if(preferred>=0)return 10000-preferred;const specialist=/Quadro|Tesla|FirePro|Xeon|EPYC|Opteron|Threadripper|Radeon Pro|RTX [A-Z]\d/i.test(p.name);return(specialist?-2000:0)+(p.year||1990)+(p.year>=2020?500:0)}
let parts=[];
function options(group,values){const box=document.getElementById('filter-'+group);box.innerHTML=values.map(([value,label,count])=>`<label class="filter-choice"><input type="checkbox" data-facet="${group}" value="${esc(value)}"${state[group].has(value)?' checked':''}><span>${esc(label)}</span><small>${count}</small></label>`).join('')}
function render(){
 const cats=Object.entries(names).map(([id,label])=>[id,label,parts.filter(p=>p.cat===id).length]).filter(v=>v[2]);options('category',cats);
 const eligible=parts.filter(p=>!state.category.size||state.category.has(p.cat));const brands=[...new Set(eligible.map(p=>p.brand))].sort((a,b)=>a.localeCompare(b));options('brand',brands.map(b=>[b,b,eligible.filter(p=>p.brand===b).length]));
 const gpu=eligible.filter(p=>p.cat==='gpu'&&(!state.brand.size||state.brand.has(p.brand))),values=[...new Set(gpu.map(series))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 const show=state.category.has('gpu');document.getElementById('series-fieldset').hidden=!show;options('series',show?values.map(s=>[s,s,gpu.filter(p=>series(p)===s).length]):[]);
 const count=Object.values(state).reduce((n,s)=>n+s.size,0);document.getElementById('filter-count').textContent=count?String(count):'';document.getElementById('filter-clear').hidden=!count;
 const chips=document.getElementById('filter-chips');chips.innerHTML=Object.entries(state).flatMap(([g,values])=>[...values].map(v=>`<button type="button" data-remove-facet="${g}" data-value="${esc(v)}" aria-label="Remove ${esc(names[v]||v)} filter">${esc(names[v]||v)} <span aria-hidden="true">×</span></button>`)).join('');chips.hidden=!count;
}
function changed(){render();document.dispatchEvent(new CustomEvent('pcp:filters'))}
document.addEventListener('change',e=>{const group=e.target.dataset?.facet;if(!group)return;const set=state[group];if(e.target.checked)set.add(e.target.value);else set.delete(e.target.value);if(group==='category'){const valid=new Set(parts.filter(p=>!state.category.size||state.category.has(p.cat)).map(p=>p.brand));for(const b of state.brand)if(!valid.has(b))state.brand.delete(b);state.series.clear()}if(group==='brand')state.series.clear();changed()});
document.addEventListener('click',e=>{const chip=e.target.closest('[data-remove-facet]');if(chip){const group=chip.dataset.removeFacet;state[group].delete(chip.dataset.value);if(group!=='series')state.series.clear();if(group==='category'){const valid=new Set(parts.filter(p=>!state.category.size||state.category.has(p.cat)).map(p=>p.brand));for(const b of state.brand)if(!valid.has(b))state.brand.delete(b)}changed()}});
document.getElementById('filter-clear')?.addEventListener('click',()=>{Object.values(state).forEach(s=>s.clear());changed()});
window.PCPShopFilters={init(data){parts=data;render()},matches,sort:(a,b)=>rank(b)-rank(a)||a.name.localeCompare(b.name),series};
})();
