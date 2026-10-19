/* The 3D engine and GLB files are loaded only after an explicit user action. */
(()=>{
 window.addEventListener('load',()=>{const n=performance.getEntriesByType('navigation')[0];document.body.dataset.domReadyMs=String(Math.round(n?.domContentLoadedEventEnd||0));document.body.dataset.initial3dRequests=String(performance.getEntriesByType('resource').filter(r=>/vendor\/three|\.glb/.test(r.name)).length)});
 let scene=null,library=null,entries=[],active='gpu',references=false,loading=false,openRevision=0,isolated=null;
 let previewState={phase:'closed',rendered:0,failed:0};
 let enhancementPromise=null;
 function enhancePreview(){if(!enhancementPromise)enhancementPromise=import('/evolution-scene.js?v=20261019a').then(()=>window.PCP_SCENE_UI?.mount({document,window})).catch(()=>{enhancementPromise=null;return null;});return enhancementPromise;}
 const names={board:'Motherboard',cpu:'Processor',ram:'Memory',gpu:'Graphics card',ssd:'SSD',hdd:'Hard drive',psu:'Power supply',case:'Case',fan:'Case fans',cooler:'CPU cooler'};
 const renderableSlots=new Set(['board','cpu','ram','gpu','ssd','hdd','psu','case','fan']);
 const el=id=>document.getElementById(id),safe=escapeHTML;
 const modelFor=entry=>library?.items.find(record=>record.id===entry.id&&record.category===entry.slot);
 const hasModel=entry=>!!entry.record?.model&&(renderableSlots.has(entry.slot)||entry.record.standaloneOnly===true);
 const canPlace=entry=>hasModel(entry)&&entry.record.standaloneOnly!==true&&renderableSlots.has(entry.slot);
 const keyFor=entry=>`${entry.slot}:${entry.index}:${entry.id}`;
 const localModelPath=value=>typeof value==='string'&&/^\/assets\/models\/(?:completion\/)?[a-zA-Z0-9_.-]+\.glb$/.test(value);
 const appearance=record=>record.identity==='category-silhouette'?'Category illustration':['family-or-chip','chip-family','related-variant'].includes(record.identity)?'Related-variant appearance':record.identity==='model-needs-verification'?'Artist appearance; exact revision unverified':record.status==='approximate'?'Approximate model':'Named-model appearance';
 function snapshot(){const engine=scene?.state?.()||{};return{...previewState,open:!!scene,busy:loading||previewState.phase==='updating',active,view:engine.view||'angled',focusAvailable:scene?.canFocus?.(active)===true,orbit:engine.orbit===true,reducedMotion:engine.reducedMotion===true,quality:el('scene-low')?.checked?'lower-resolution':'balanced'};}
 function publish(phase=previewState.phase,values={}){previewState={...previewState,...values,phase};el('scene-stage')?.setAttribute('aria-busy',String(phase==='loading'||phase==='updating'));const value=snapshot();if(typeof CustomEvent==='function')document.dispatchEvent?.(new CustomEvent('pcp:scene-state',{detail:value}));return value;}
 async function catalogModels(){
  if(!library){
   const response=await fetch('/model-library.json');if(!response.ok)throw Error('Model catalog unavailable');
   const candidate=await response.json();
   if(!candidate||!Array.isArray(candidate.items)||new Set(candidate.items.map(record=>record?.id)).size!==candidate.items.length||candidate.items.some(record=>!record||typeof record.id!=='string'||typeof record.category!=='string'||record.model!==null&&record.model!==undefined&&!localModelPath(record.model)))throw Error('Invalid model catalog');
   library=candidate;
  }
  return library;
 }
 function inspect(slot){
  if(!entries.some(entry=>entry.slot===slot))slot=entries[0]?.slot||'';
  active=slot;scene?.select(slot);
  document.querySelectorAll('.builder-row').forEach(row=>row.classList.toggle('is-linked',row.dataset.builderRow===slot));
  el('scene-components')?.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sceneSlot===slot)));
  const chosen=entries.filter(entry=>entry.slot===slot),inspector=el('scene-inspector');if(!inspector)return;
  inspector.innerHTML=chosen.length?chosen.map(entry=>{
   const available=hasModel(entry),message=available?appearance(entry.record)+'. Check exact clearances and connectors before buying.':entry.slot==='cooler'?'No 3D model or placement is available for this cooler. It remains in your parts list.':library?'No 3D view is available for this part yet.':'Open the preview to check 3D availability.';
   const standalone=available&&entry.record.standaloneOnly,notes=standalone?(entry.record.caveats||[]).map(note=>`<li>${safe(note)}</li>`).join(''):'';
   return `<div class="scene-inspected"><strong>${safe(entry.name)}</strong><p>${standalone?'Explore this part on its own. Its model is not positioned inside the assembled PC.':message}${entry.unplaced?' Placement unresolved: '+safe(entry.unplaced):''}</p>${available||!library?`<button class="button secondary" type="button" data-scene-part="${safe(keyFor(entry))}">View part in 3D</button>`:''}<a href="/learn/${encodeURIComponent(entry.id)}.html">Product specifications</a>${available&&entry.record?.attribution?'<a href="/builder/model-credits/">3D creator credits</a>':''}${/^https?:\/\//.test(entry.record?.source||'')?`<a href="${safe(entry.record.source)}" target="_blank" rel="noopener noreferrer">Product source</a>`:''}${notes?`<details><summary>Model details</summary><p>${safe(entry.record.appearance||appearance(entry.record))}</p><ul>${notes}</ul></details>`:''}</div>`;
  }).join(''):`<strong>${safe(names[slot]||'Your build')}</strong><p>No part selected.</p>`;
  inspector.querySelectorAll('[data-scene-part]').forEach(button=>button.onclick=()=>startPreview(button.dataset.scenePart));publish();
 }
 function refreshList(){
  if(!entries.some(entry=>entry.slot===active))active=entries[0]?.slot||'';
  const components=el('scene-components'),inspector=el('scene-inspector');if(!components||!inspector)return;
  components.hidden=!entries.length;inspector.hidden=!entries.length;
  components.innerHTML=Object.entries(names).filter(([slot])=>entries.some(entry=>entry.slot===slot)).map(([slot,name])=>`<button type="button" data-scene-slot="${slot}" aria-pressed="${active===slot}">${name}<span>${entries.filter(entry=>entry.slot===slot).length||'—'}</span></button>`).join('');
  components.querySelectorAll('button').forEach(button=>button.onclick=()=>inspect(button.dataset.sceneSlot));inspect(active);
 }
 function unavailableMessage(){return entries.length?'No 3D model is available for these selections. Your parts list and compatibility checks still work.':'Choose components, then open the preview.';}
 async function refreshScene(){
  const current=scene;if(!current)return;
  publish('updating');
  try{
   const chosen=isolated?entries.find(entry=>keyFor(entry)===isolated):null;if(isolated&&!chosen)isolated=null;
   const result=chosen?await current.inspect(chosen):await current.update(entries,{references});if(result.stale||scene!==current)return;
   const missing=entries.filter(entry=>!hasModel(entry)).length,unplaced=result.unplaced||[];
   el('scene-status').textContent=chosen?result.rendered?`${chosen.name}. Rotate or zoom to explore the model. This view does not establish physical fit.`:`${chosen.name} could not load. Your part remains selected; retry below.`:`${result.rendered} ${result.rendered===1?'object':'objects'} shown${missing?' · '+missing+' selected '+(missing===1?'part has':'parts have')+' no 3D view':''}${unplaced.length?' · '+unplaced.length+' model placements unavailable':''}${result.failed.length?' · Model loading failed: '+result.failed.join(', '):''}. Preview placement is illustrative; check physical fit before buying.`;
   el('scene-build-view').hidden=!chosen;el('scene-explode').disabled=!!chosen;el('scene-panel').disabled=!!chosen;
   current.select(active);el('scene-status').dataset.loadMs=result.loadMs;el('scene-retry-assets').hidden=!result.failed.length;
   el('scene-stage').classList.toggle('is-empty',!result.rendered);
   el('scene-stage').dataset.emptyMessage=result.failed.length?'Models could not download. Retry below; your parts list is preserved.':entries.length?'No model can be placed for these selections. Your parts remain in the build.':'Choose components to see your build here.';
   publish(result.failed.length?(result.rendered?'partial':'error'):result.rendered?'ready':'unavailable',{rendered:result.rendered,failed:result.failed.length});
  }catch(error){
   if(scene!==current)return;
   console.error('3D preview update:',error);el('scene-status').textContent='The preview could not update. Your parts list and compatibility checks still work. Retry model downloads below.';el('scene-retry-assets').hidden=false;publish('error',{failed:1});
  }
 }
 function suspend(message){
  openRevision++;scene?.dispose();scene=null;loading=false;
  if(!el('scene-stage'))return;
  el('scene-stage').hidden=true;el('scene-controls').hidden=true;document.querySelector('.scene-intro').hidden=false;
  el('scene-open').disabled=false;el('scene-open').textContent='Open 3D preview';el('scene-status').textContent=message;publish('closed',{rendered:0,failed:0});
 }
 async function startPreview(partKey=''){
  if(loading)return;
  if(!entries.length){el('scene-status').textContent=unavailableMessage();return;}
  const revision=++openRevision;loading=true;el('scene-open').disabled=true;el('scene-open').textContent='Loading preview…';publish('loading');enhancePreview();
  try{
   el('scene-status').textContent='Checking available component models…';await catalogModels();if(revision!==openRevision)return;
   entries.forEach(entry=>entry.record=modelFor(entry));refreshList();
   const requested=partKey?entries.find(entry=>keyFor(entry)===partKey):null;
   if(partKey&&(!requested||!hasModel(requested))){el('scene-status').textContent='No 3D model is available for this part. Its specifications and compatibility checks remain available.';el('scene-open').textContent='Open 3D preview';publish('unavailable',{rendered:0});return;}
   if(!entries.some(hasModel)){el('scene-status').textContent=unavailableMessage();el('scene-open').textContent='Check 3D availability';publish('unavailable',{rendered:0});return;}
   isolated=requested?keyFor(requested):!entries.some(canPlace)?keyFor(entries.find(hasModel)):null;
   if(!scene){const mod=await import('/build-scene.js?v=20261019a');if(revision!==openRevision)return;scene=mod.createBuildScene(el('scene-stage'),inspect);}
   el('scene-stage').hidden=false;el('scene-controls').hidden=false;el('pc-visual').querySelector('.scene-intro').hidden=true;
   scene.explode(el('scene-explode').checked);scene.sidePanel(el('scene-panel').checked);scene.quality(el('scene-low').checked);refreshList();await refreshScene();
  }catch(error){
   if(revision!==openRevision)return;
   console.error('3D preview:',error);scene?.dispose();scene=null;el('scene-stage').hidden=true;el('scene-controls').hidden=true;el('pc-visual').querySelector('.scene-intro').hidden=false;el('scene-status').textContent='3D preview could not start. Your parts list and compatibility checks still work. You can retry below.';el('scene-open').textContent='Retry 3D preview';publish('error',{rendered:0,failed:1});
  }finally{if(revision===openRevision){loading=false;el('scene-open').disabled=false;publish();}}
 }
 function shell(){
  const visual=el('pc-visual');if(!visual||el('scene-stage'))return;
  visual.innerHTML=`<div class="scene-intro"><p>Explore available 3D models for your selected parts. Preview positions do not establish physical fit.</p><button class="button primary" id="scene-open" type="button">Open 3D preview</button></div><div id="scene-stage" class="scene-stage" hidden></div><div class="scene-controls" id="scene-controls" hidden><button class="button secondary" id="scene-build-view" type="button" hidden>Show build layout</button><div class="scene-views" role="group" aria-label="Camera view"><button type="button" data-camera="angled">Angled</button><button type="button" data-camera="side">Side</button><button type="button" data-camera="front">Front</button><button type="button" data-camera="angled">Reset</button></div><details class="scene-advanced"><summary>More preview controls</summary><div class="scene-views" role="group" aria-label="Camera controls"><button type="button" data-rotate="-1" aria-label="Rotate left">Rotate left</button><button type="button" data-rotate="1" aria-label="Rotate right">Rotate right</button><button type="button" data-zoom="0.85" aria-label="Zoom in">+</button><button type="button" data-zoom="1.15" aria-label="Zoom out">−</button></div><button type="button" id="scene-retry-assets" hidden>Retry model downloads</button><div class="scene-toggles"><label><input type="checkbox" id="scene-explode"> Exploded view</label><label><input type="checkbox" id="scene-panel"> Show side panel</label><label><input type="checkbox" id="scene-low"> Lower graphics detail</label></div><p class="scene-help">Drag to rotate. Scroll or pinch to zoom. Right-drag, two-finger drag, or arrow keys to pan.</p></details></div><p id="scene-status" role="status">Choose parts, then open the preview.</p><div id="scene-components" class="scene-components" role="group" aria-label="Inspect a component"></div><div id="scene-inspector" class="scene-inspector" aria-live="polite"></div><details class="scene-notes"><summary>Accuracy and model coverage</summary><p>Models use approximate mounting positions; category silhouettes use assumed sizes. Some downloaded models open individually and are not placed in the assembled layout. Coolers without a model stay in the parts list. Radiators and cables are not added. The preview cannot guarantee clearance or thermal performance.</p><a href="/builder/model-coverage/">View component coverage and sources</a></details>`;
  el('scene-stage').addEventListener('scene-failed',()=>{suspend('The graphics connection was lost. Your parts list is preserved.');el('scene-open').textContent='Retry 3D preview';});
  el('scene-stage').addEventListener('scene-orbit-state',()=>publish());
  el('scene-stage').addEventListener('scene-preference-state',()=>publish());
  el('scene-open').onclick=()=>startPreview();
  el('scene-build-view').onclick=()=>{isolated=null;refreshScene();};
  visual.querySelectorAll('[data-camera]').forEach(button=>button.onclick=()=>{scene?.view(button.dataset.camera);publish();});
  visual.querySelectorAll('[data-rotate]').forEach(button=>button.onclick=()=>scene?.rotate(Number(button.dataset.rotate)));
  visual.querySelectorAll('[data-zoom]').forEach(button=>button.onclick=()=>scene?.zoom(Number(button.dataset.zoom)));
  el('scene-retry-assets').onclick=()=>refreshScene();el('scene-explode').onchange=event=>scene?.explode(event.target.checked);el('scene-panel').onchange=event=>scene?.sidePanel(event.target.checked);el('scene-low').onchange=event=>{scene?.quality(event.target.checked);publish();};
 }
 renderPCVisual=function(analysis){
  shell();entries=buildSlotDefs.flatMap(slot=>buildInstances(slot.id).map((item,index)=>{const placement=partPlacement(slot.id,index,item.part,analysis);const entry={id:item.part.id,name:item.part.name,slot:slot.id,index,placement:slot.id==='fan'?fanPlacement(index,item.part):null,modules:item.part.specs.Modules||1,unplaced:placement.fit?'':placement.reason};entry.record=modelFor(entry);return entry;}));
  el('pc-visual-count').textContent=entries.length+' '+(entries.length===1?'part':'parts')+' selected';el('pc-visual-status').textContent='Check physical clearances with the exact component manuals before buying.';refreshList();refreshScene();pendingVisualAction=null;
 };
 document.addEventListener('click',event=>{const row=event.target.closest('.builder-row');if(row)inspect(row.dataset.builderRow)});
 document.addEventListener('focusin',event=>{const row=event.target.closest('.builder-row');if(row)inspect(row.dataset.builderRow)});
 window.addEventListener('pagehide',()=>suspend('Reopen the preview to explore your saved parts.'));
 window.PCP_SCENE={state:snapshot,retry:()=>scene?refreshScene():startPreview(),close:()=>suspend('Preview closed. Your parts list is preserved.'),focus(){if(!scene||loading)return false;const focused=scene.focus?.(active)===true;if(!focused){if(isolated){isolated=null;refreshScene();}el('scene-status').textContent='No positioned model is available for this component. Showing the available build layout instead.';}publish();return focused;},orbit(value){const enabled=scene?.orbit?.(value===true)===true;publish();return enabled;},quality(value){if(!scene)return false;el('scene-low').checked=value===true;scene.quality(value===true);publish();return true;}};
 renderPCVisual(analyzeBuild());
})();
