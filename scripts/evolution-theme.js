(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.PCP_THEME=api;api.start(root);}})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const ids=['midnight','arctic','solar','aurora','neon','paper'],light=['arctic','paper'];
 function resolve(value,dark){return ids.includes(value)?value:dark?'midnight':'arctic';}
 function start(win){
  const doc=win.document;if(!doc)return;const root=doc.documentElement,system=win.matchMedia('(prefers-color-scheme: dark)'),reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
  const read=key=>{try{return win.localStorage.getItem(key);}catch{return null;}},save=(key,value)=>{try{win.localStorage.setItem(key,value);return true;}catch{return false;}};
  const legacy=read('pcp-theme');let choice=read('pcp-theme-palette')||(legacy==='dark'?'midnight':legacy==='light'?'arctic':'system'),contrast=read('pcp-high-contrast')==='true',less=read('pcp-reduce-motion')==='true',ambient=read('pcp-ambient')!=='false';
  if(!ids.includes(choice)&&choice!=='system')choice='system';
  function apply(){const palette=resolve(choice,system.matches),mode=light.includes(palette)?'light':'dark';root.dataset.palette=palette;root.dataset.theme=mode;root.dataset.contrast=contrast?'high':'standard';root.dataset.motion=reduced.matches||less?'reduced':'standard';root.dataset.ambient=ambient?'on':'off';
   doc.querySelector('meta[name="theme-color"]')?.setAttribute('content',{midnight:'#0c1220',arctic:'#f5f7fc',solar:'#171213',aurora:'#081c20',neon:'#0e1515',paper:'#f5f1e8'}[palette]);
   for(const b of doc.querySelectorAll('.theme-toggle')){const name='Switch to '+(mode==='dark'?'light':'dark')+' mode';b.setAttribute('aria-label',name);b.title=name;const label=b.querySelector('.theme-label');if(label)label.textContent=mode==='dark'?'Light mode':'Dark mode';}
   for(const b of doc.querySelectorAll('[data-palette-choice]'))b.setAttribute('aria-pressed',String(b.dataset.paletteChoice===choice));
   for(const [selector,value]of [['contrast',contrast],['reduce',less],['ambient',ambient]]){const control=doc.querySelector('[data-lab-'+selector+']');if(control)control.checked=value;}
   for(const b of doc.querySelectorAll('[data-motion-pause]')){b.setAttribute('aria-pressed',String(!ambient));b.textContent=ambient?'Pause ambient motion':'Resume ambient motion';}
   win.dispatchEvent(new win.CustomEvent('pcp:appearance',{detail:{palette,mode,reduced:reduced.matches||less,ambient}}));
  }
  function select(value){if(!ids.includes(value)&&value!=='system')return false;choice=value;const ok=save('pcp-theme-palette',choice);save('pcp-theme',light.includes(resolve(choice,system.matches))?'light':'dark');apply();const status=doc.querySelector('[data-theme-status]');if(status)status.textContent=ok?'Appearance saved.':'Appearance changed for this page. Browser storage is unavailable.';return true;}
  apply();system.addEventListener('change',()=>{if(choice==='system')apply();});reduced.addEventListener('change',apply);
  win.addEventListener('storage',event=>{if(event.key==='pcp-theme-palette'){choice=ids.includes(event.newValue)||event.newValue==='system'?event.newValue:'system';apply();}});
  function mount(){
   for(const button of doc.querySelectorAll('[data-appearance-open]'))button.hidden=false;
   let motionRequested=false;const events=['pointerdown','keydown','scroll'];const loadMotion=()=>{if(motionRequested)return;motionRequested=true;for(const name of events)win.removeEventListener(name,loadMotion);import('/evolution-motion.js').catch(()=>{motionRequested=false;for(const name of events)win.addEventListener(name,loadMotion,{passive:true});});};for(const name of events)win.addEventListener(name,loadMotion,{passive:true});
   const dialog=doc.querySelector('#lab-appearance');let previous=null;
   doc.addEventListener('click',event=>{
    const opener=event.target.closest('[data-appearance-open]');if(opener&&dialog){const menu=doc.querySelector('[data-menu-open]');previous=menu?doc.querySelector('[data-menu-toggle]'):opener;if(menu)menu.querySelector('[data-menu-close]')?.click();dialog.showModal();dialog.querySelector('[data-appearance-close]')?.focus();}
    if(event.target.closest('[data-appearance-close]'))dialog?.close();
    const palette=event.target.closest('[data-palette-choice]');if(palette)select(palette.dataset.paletteChoice);
    if(event.target.closest('.theme-toggle'))select(root.dataset.theme==='dark'?'arctic':'midnight');
    if(event.target.closest('[data-motion-pause]')){ambient=!ambient;save('pcp-ambient',String(ambient));apply();}
   });
   dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
   dialog?.addEventListener('close',()=>{if(previous?.isConnected)previous.focus({preventScroll:true});});
   for(const [name,key,update]of [['contrast','pcp-high-contrast',v=>contrast=v],['reduce','pcp-reduce-motion',v=>less=v],['ambient','pcp-ambient',v=>ambient=v]])doc.querySelector('[data-lab-'+name+']')?.addEventListener('change',event=>{update(event.target.checked);save(key,String(event.target.checked));apply();});
   apply();
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  return{select,current:()=>({choice,palette:root.dataset.palette,mode:root.dataset.theme}),apply};
 }
 return{ids,light,resolve,start};
});
