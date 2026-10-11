(()=>{'use strict';
 const menu=document.querySelector('.explore-menu');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus()}});
 document.addEventListener('pointerdown',e=>{if(menu?.open&&!menu.contains(e.target))menu.open=false});
 const catalog=document.querySelector('[data-device-catalog]');
 if(catalog){const query=document.querySelector('[data-device-search]'),model=document.querySelector('[data-device-model-filter]'),cards=[...catalog.querySelectorAll('[data-device-card]')],status=document.querySelector('[data-device-count]');const draw=()=>{const q=query.value.trim().toLowerCase();let count=0;for(const card of cards){card.hidden=!card.dataset.name.includes(q)||(model.checked&&card.dataset.hasModel!=='true');if(!card.hidden)count++}status.textContent=count+' phones';document.querySelector('[data-device-empty]').hidden=count>0};query.addEventListener('input',draw);model.addEventListener('change',draw);draw()}
})();
