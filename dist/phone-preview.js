/* Small comparison controller. Three.js and meshes load only after a click. */
(()=>{
 'use strict';
 let registry,engine;const views=new Map();
 const models=()=>registry||(registry=fetch('/data/phone-models.json?v=20261004d').then(r=>{if(!r.ok)throw Error('Model list unavailable');return r.json()}).catch(e=>{registry=null;throw e}));
 const library=()=>engine||(engine=import('/phone-scene.js?v=20261004d').catch(e=>{engine=null;throw e}));
 const disposeRemoved=()=>{for(const [el,v]of views)if(!el.isConnected){v.close();views.delete(el)}};
 async function mount(){
  disposeRemoved();const targets=[...document.querySelectorAll('[data-phone-preview]:not([data-preview-ready])')];if(!targets.length)return;
  let data;try{data=await models()}catch{return}
  if(!window.PCP_PHONE_MODEL_IDS){window.PCP_PHONE_MODEL_IDS=new Set(data.flatMap(m=>m.ids));document.dispatchEvent(new Event('pcp:phone-models-ready'))}
  for(const host of targets){
   if(!host.isConnected||host.dataset.previewReady)continue;
   const model=data.find(m=>m.ids.includes(host.dataset.phonePreview));if(!model)continue;
   host.dataset.previewReady='true';host.classList.add('phone-interactive');
   const image=host.querySelector('figure')||host.firstElementChild,open=document.createElement('button');open.type='button';open.className='phone-open';open.textContent='View in 3D';open.setAttribute('aria-label','View '+model.name+' in 3D');
   const stage=document.createElement('div');stage.className='phone-stage';stage.hidden=true;
   const bar=document.createElement('div');bar.className='phone-view-controls';bar.hidden=true;bar.setAttribute('role','group');bar.setAttribute('aria-label',model.name+' viewing angles');
   const help=document.createElement('p');help.className='phone-view-help';help.hidden=true;help.textContent='Drag to rotate · Pinch to zoom';
   const status=document.createElement('p');status.className='phone-view-status';status.setAttribute('role','status');
   const credit=document.createElement('details');credit.className='phone-model-credit';credit.hidden=true;const summary=document.createElement('summary');summary.textContent='Model credits';const link=document.createElement('a');link.href=model.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent=model.title+' by '+model.creator;const license=document.createElement('a');license.href='https://creativecommons.org/licenses/by/4.0/';license.target='_blank';license.rel='noopener noreferrer';license.textContent=model.license;credit.append(summary,link,document.createTextNode(' · '),license,document.createTextNode('. Optimized for the web; appearance does not certify fit. '+(model.note||'')));
   let scene=null,generation=0;
   const close=()=>{generation++;scene?.dispose();scene=null;stage.replaceChildren();stage.hidden=bar.hidden=help.hidden=credit.hidden=true;if(image)image.hidden=false;open.hidden=false;open.disabled=false;open.textContent='View in 3D';status.textContent='';host.removeAttribute('aria-busy')};
   views.set(host,{close});
   for(const angle of ['Front','Back','Side','Reset','Photo']){const b=document.createElement('button');b.type='button';b.textContent=angle;b.setAttribute('aria-label',angle==='Photo'?'Return to '+model.name+' photo':angle+' view of '+model.name);b.addEventListener('click',()=>{if(angle==='Photo'){close();open.focus()}else{scene?.pose(angle.toLowerCase());for(const x of bar.children)x.setAttribute('aria-pressed',String(x===b))}});bar.append(b)}
   host.append(open,stage,bar,help,status,credit);
   open.addEventListener('click',async()=>{
    const run=++generation;open.disabled=true;open.textContent='Loading 3D…';host.setAttribute('aria-busy','true');status.textContent='Loading '+model.name+' model.';
    try{
     const lib=await library();if(run!==generation||!host.isConnected)return;
     if(image)image.hidden=true;stage.hidden=false;
     const loaded=await lib.createPhoneScene(stage,model,()=>{close();status.textContent='3D is unavailable on this device. The photo and specifications are still available.'});
     if(run!==generation||!host.isConnected){loaded.dispose();return}
     scene=loaded;bar.hidden=help.hidden=credit.hidden=false;open.hidden=true;host.removeAttribute('aria-busy');status.textContent='';for(const [i,b]of [...bar.children].entries())b.setAttribute('aria-pressed',String(i===3));stage.querySelector('canvas').focus({preventScroll:true});
    }catch{if(run===generation){close();status.textContent='Could not load 3D. Try again or use the product photo.'}}
   });
  }
 }
 document.addEventListener('pcp:render',mount);document.addEventListener('pcp:phone-selection',mount);
 new MutationObserver(disposeRemoved).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('pagehide',()=>{for(const v of views.values())v.close()});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
