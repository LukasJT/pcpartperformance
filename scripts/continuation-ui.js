(()=>{'use strict';
 const menu=document.querySelector('.explore-menu');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus()}});
 document.addEventListener('pointerdown',e=>{if(menu?.open&&!menu.contains(e.target))menu.open=false});
 const catalog=document.querySelector('[data-device-catalog]');
 if(catalog){const query=document.querySelector('[data-device-search]'),model=document.querySelector('[data-device-model-filter]'),cards=[...catalog.querySelectorAll('[data-device-card]')],status=document.querySelector('[data-device-count]');const draw=()=>{const q=query.value.trim().toLowerCase();let count=0;for(const card of cards){card.hidden=!card.dataset.name.includes(q)||(model.checked&&card.dataset.hasModel!=='true');if(!card.hidden)count++}status.textContent=count+' phones';document.querySelector('[data-device-empty]').hidden=count>0};query.addEventListener('input',draw);model.addEventListener('change',draw);draw()}
})();

(()=>{let loaded=false;for(const panel of document.querySelectorAll("[data-morning-prices]"))panel.addEventListener("toggle",()=>{if(panel.open&&!loaded){loaded=true;import("/morning-prices-ui.js").catch(()=>{panel.querySelector("[data-morning-status]").textContent="Other price connections could not load.";});}});})();

(()=>{let region="CA";try{region=new URLSearchParams(location.search).get("region")||localStorage.getItem("pcp-region")||"CA";}catch{}if(!["CA","US"].includes(region))region="CA";const buttons=document.querySelectorAll(".country-switch [data-region]");const paint=()=>{document.documentElement.dataset.region=region;buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.region===region)));};buttons.forEach(b=>b.addEventListener("click",()=>{region=b.dataset.region;try{localStorage.setItem("pcp-region",region);}catch{}paint();}));paint();})();

(()=>{const box=document.querySelector("[data-product-buy]");if(!box)return;let loading=false;const load=()=>{if(loading)return;loading=true;import("/shopping.js").catch(()=>{box.textContent="Buying options could not load. Follow the product source to check the exact model.";});};if(typeof IntersectionObserver==="function"){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:"240px"});observer.observe(box);}else load();box.addEventListener("focusin",load,{once:true});})();
