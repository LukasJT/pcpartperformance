/* A single responsive navigation tree; no cloned region controls or theme state. */
(()=>{'use strict';
 const header=document.querySelector('[data-ui-header]');if(!header)return;
 const trigger=header.querySelector('[data-menu-toggle]'),panel=header.querySelector('#site-menu'),scrim=header.querySelector('[data-menu-dismiss]'),closer=header.querySelector('[data-menu-close]');
 if(!trigger||!panel||!scrim||!closer)return;
 const compact=matchMedia('(max-width:1100px)'),roots=[...document.querySelectorAll('main,.site-footer'),...header.children].filter(root=>root!==panel&&root!==scrim);
 let opened=false,previousOverflow='',inertStates=[];
 function close(restore=true){if(!opened)return;opened=false;delete header.dataset.menuOpen;trigger.setAttribute('aria-expanded','false');scrim.hidden=true;panel.removeAttribute('role');panel.removeAttribute('aria-modal');panel.removeAttribute('aria-labelledby');document.body.style.overflow=previousOverflow;roots.forEach((root,i)=>{root.inert=inertStates[i];});if(restore)trigger.focus({preventScroll:true});}
 function open(){if(!compact.matches||opened)return;opened=true;previousOverflow=document.body.style.overflow;inertStates=roots.map(root=>root.inert);roots.forEach(root=>{root.inert=true;});document.body.style.overflow='hidden';header.dataset.menuOpen='';trigger.setAttribute('aria-expanded','true');scrim.hidden=false;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','site-menu-title');closer.focus({preventScroll:true});}
 trigger.hidden=false;header.dataset.uiReady='';trigger.addEventListener('click',()=>opened?close():open());closer.addEventListener('click',()=>close());scrim.addEventListener('click',()=>close());panel.addEventListener('click',e=>{if(opened&&e.target.closest('a[href]'))close(false);});
 document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key!=='Tab')return;const focusable=[...panel.querySelectorAll('a[href],button,summary,input,select,textarea,[tabindex="0"]')].filter(node=>!node.disabled&&node.getClientRects().length&&!node.closest('[hidden]'));const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}});
 compact.addEventListener('change',()=>{if(!compact.matches)close(false);});
})();
(()=>{'use strict';
 for(const menu of document.querySelectorAll('.explore-menu,.ui-toolbar-more')){
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus()}});
  document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
 }
 const catalog=document.querySelector('[data-device-catalog]');
 if(catalog){const query=document.querySelector('[data-device-search]'),model=document.querySelector('[data-device-model-filter]'),cards=[...catalog.querySelectorAll('[data-device-card]')],status=document.querySelector('[data-device-count]');const draw=()=>{const q=query.value.trim().toLowerCase();let count=0;for(const card of cards){card.hidden=!card.dataset.name.includes(q)||(model.checked&&card.dataset.hasModel!=='true');if(!card.hidden)count++}status.textContent=count+' phones';document.querySelector('[data-device-empty]').hidden=count>0};query.addEventListener('input',draw);model.addEventListener('change',draw);draw()}
})();

(()=>{let loaded=false;for(const panel of document.querySelectorAll("[data-morning-prices]"))panel.addEventListener("toggle",()=>{if(panel.open&&!loaded){loaded=true;import("/morning-prices-ui.js").catch(()=>{panel.querySelector("[data-morning-status]").textContent="Other price connections could not load.";});}});})();

(()=>{let region="CA";try{region=new URLSearchParams(location.search).get("region")||localStorage.getItem("pcp-region")||"CA";}catch{}if(!["CA","US"].includes(region))region="CA";const buttons=document.querySelectorAll(".country-switch [data-region]");const paint=()=>{document.documentElement.dataset.region=region;buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.region===region)));};buttons.forEach(b=>b.addEventListener("click",()=>{region=b.dataset.region;try{localStorage.setItem("pcp-region",region);}catch{}paint();}));paint();})();

(()=>{const box=document.querySelector("[data-product-buy]");if(!box)return;let loading=false;const load=()=>{if(loading)return;loading=true;import("/shopping.js").catch(()=>{box.textContent="Buying options could not load. Follow the product source to check the exact model.";});};if(typeof IntersectionObserver==="function"){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:"240px"});observer.observe(box);}else load();box.addEventListener("focusin",load,{once:true});})();
