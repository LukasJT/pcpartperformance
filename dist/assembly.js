/* Interactive schematic: illustrative geometry, with real product photos in the inspector. */
let assemblyView = 'angled', assemblySlot = 'gpu';
renderPCVisual = function(analysis) {
  const visual = document.querySelector('#pc-visual'); if (!visual) return;
  const names = {board:'Motherboard',cpu:'Processor',ram:'Memory',gpu:'Graphics card',ssd:'SSD',hdd:'Hard drive',psu:'Power supply',case:'Case'};
  const slots = ['board','cpu','ram','gpu','ssd','hdd','psu'];
  const entries = buildSlotDefs.flatMap(slot => buildInstances(slot.id).map((item,index)=>({slot:slot.id,item,index,placement:partPlacement(slot.id,index,item.part,analysis)})));
  const placed = entries.filter(e=>e.placement.fit), unplaced=entries.filter(e=>!e.placement.fit);
  const slotsMarkup = slots.map(slot=>{
    const parts = placed.filter(e=>e.slot===slot), chosen=parts.length>0;
    return `<button type="button" class="assembly-part assembly-${slot}${chosen?' populated':' ghost'}${assemblySlot===slot?' selected':''}" data-assembly-slot="${slot}" aria-label="${escapeHTML(names[slot]+': '+(chosen?parts.map(e=>e.item.part.name).join(', '):'Not selected'))}" aria-pressed="${assemblySlot===slot}"><span class="assembly-component-icon" aria-hidden="true">${icon(slot)}</span><span class="assembly-component-label">${names[slot]}${parts.length>1?' ×'+parts.length:''}</span></button>`;
  }).join('');
  visual.innerHTML=`<div class="assembly-toolbar"><div class="assembly-view-switch" role="group" aria-label="Assembly view"><button type="button" data-assembly-view="angled" aria-pressed="${assemblyView==='angled'}">Angled</button><button type="button" data-assembly-view="front" aria-pressed="${assemblyView==='front'}">Front</button></div><span>${placed.length} part${placed.length===1?'':'s'} selected</span></div><div class="assembly-scene" data-view="${assemblyView}"><div class="assembly-case"><div class="assembly-case-edge" aria-hidden="true"></div><div class="assembly-case-inside">${slotsMarkup}</div><span class="assembly-case-foot first" aria-hidden="true"></span><span class="assembly-case-foot second" aria-hidden="true"></span></div></div><div class="assembly-legend"><span><i class="legend-installed"></i>Selected</span><span><i class="legend-empty"></i>Empty slot</span><button type="button" data-assembly-slot="case">Case details</button></div><div class="assembly-inspector" id="assembly-inspector" aria-live="polite"></div>${unplaced.length?`<div class="assembly-unplaced"><strong>Placement needs checking</strong>${unplaced.map(e=>`<button type="button" data-assembly-slot="${e.slot}"><span>${escapeHTML(e.item.part.name)}</span><small>${escapeHTML(e.placement.reason)}</small></button>`).join('')}</div>`:''}`;
  document.querySelector('#pc-visual-count').textContent='Interactive layout';
  document.querySelector('#pc-visual-status').textContent='Illustrative layout, not a dimensionally accurate model. Select a component to inspect it.';
  function inspect(slot) {
    assemblySlot=slot;
    visual.querySelectorAll('.assembly-part').forEach(el=>{el.classList.toggle('selected',el.dataset.assemblySlot===slot);el.setAttribute('aria-pressed',String(el.dataset.assemblySlot===slot));});
    const parts=entries.filter(e=>e.slot===slot);
    document.querySelector('#assembly-inspector').innerHTML=parts.length?parts.map(({item,placement})=>`<a class="assembly-product" href="/learn/${encodeURIComponent(item.part.id)}.html">${photos[item.part.id]?`<img src="${escapeHTML(photos[item.part.id].src)}" alt="${escapeHTML(photos[item.part.id].picturedModel)}" width="72" height="56">`:''}<span><small>${names[slot]}</small><strong>${escapeHTML(item.part.name)}</strong><span>${placement.fit?'View specifications →':escapeHTML(placement.reason)}</span></span></a>`).join(''):`<div class="assembly-empty"><strong>${names[slot]} not selected</strong><span>Choose a component from the parts list to add it to your build.</span></div>`;
    document.querySelectorAll('.builder-row').forEach(el=>el.classList.toggle('is-linked',el.dataset.builderRow===slot));
  }
  visual.querySelectorAll('[data-assembly-slot]').forEach(el=>el.addEventListener('click',()=>inspect(el.dataset.assemblySlot)));
  visual.querySelectorAll('[data-assembly-view]').forEach(el=>el.addEventListener('click',()=>{assemblyView=el.dataset.assemblyView;visual.querySelector('.assembly-scene').dataset.view=assemblyView;visual.querySelectorAll('[data-assembly-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));}));
  inspect(assemblySlot); pendingVisualAction=null;
};
renderPCVisual(analyzeBuild());
