/* Progressively enhance native selects; their values and change events remain canonical. */
(() => {
  const registry = new WeakMap();
  let serial = 0, active = null, rows = [], cursor = 0;const selectedBrands=new Set();
  const dialog = document.createElement('dialog');
  dialog.className = 'select-dialog';
  dialog.setAttribute('aria-labelledby', 'select-dialog-title');
  dialog.innerHTML = '<div class="select-dialog-head"><strong id="select-dialog-title">Choose an option</strong><button type="button" class="select-close" aria-label="Close options">×</button></div><div class="select-search-wrap"><input type="search" class="select-search" aria-label="Search options" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="select-options" placeholder="Type to filter…" autocomplete="off"></div><div class="select-brand-filters" aria-label="Filter by brand"></div><div class="select-results" id="select-options" role="listbox"></div><p class="select-hint" aria-live="polite"></p>';
  document.body.append(dialog);
  const search = dialog.querySelector('input'), results = dialog.querySelector('.select-results'), hint = dialog.querySelector('.select-hint');
  function label(select) { return (select.getAttribute('aria-label') || select.labels?.[0]?.textContent?.trim() || 'Choose an option').replace('Choose primary ', 'Choose ').replace('Case fans', 'case fan'); }
  function sync(select) {
    const item = registry.get(select); if (!item) return;
    const value = select.selectedOptions[0]?.textContent?.trim() || 'Choose an option';
    if (item.text.textContent !== value) item.text.textContent = value;
    item.button.setAttribute('aria-label', label(select) + ': ' + value);
    item.button.disabled = select.disabled;
    item.button.classList.toggle('has-value', !!select.value);
  }
  function restoreFocus(select) {
    requestAnimationFrame(() => {
      const replacement = select.isConnected ? select : [...document.querySelectorAll('select')].find(s => s.id && s.id === select.id || s.dataset.buildSlot && s.dataset.buildSlot === select.dataset.buildSlot);
      registry.get(replacement)?.button.focus();
    });
  }
  function close(focus = true) {
    const previous = active; active = null;
    if (dialog.open) dialog.close();
    if (previous) { registry.get(previous)?.button.setAttribute('aria-expanded', 'false'); if (focus) restoreFocus(previous); }
  }
  function activate(index) {
    cursor = Math.max(0, Math.min(index, rows.length - 1));
    results.querySelectorAll('[role=option]').forEach((el, i) => el.classList.toggle('is-focused', i === cursor));
    const el = results.children[cursor];
    if (rows.length && el) { search.setAttribute('aria-activedescendant', el.id); results.setAttribute('aria-activedescendant',el.id); el.scrollIntoView({block:'nearest'}); }
    else search.removeAttribute('aria-activedescendant');
  }
  function choose(index) {
    const select = active, option = rows[index]; if (!select || !option) return;
    select.value = option.value; close(false); sync(select);
    select.dispatchEvent(new Event('change', {bubbles:true}));
    restoreFocus(select);
  }
  function render() {
    if (!active) return;
    const query = search.value.toLocaleLowerCase().trim();
    rows = [...active.options].filter(option => !option.disabled && !option.hidden && (!selectedBrands.size||!option.value||selectedBrands.has((typeof catalog!=='undefined'?catalog.find(p=>p.id===option.value):null)?.brand)) && (!query || option.textContent.toLocaleLowerCase().includes(query)));
    results.replaceChildren();
    rows.forEach((option, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'select-option'; button.id = 'select-option-' + i;
      button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(option.value === active.value)); button.tabIndex = -1;
      const asset = typeof photos !== 'undefined' ? photos[option.value] : null;
      if (asset) { const img = document.createElement('img'); img.src = asset.src; img.alt = ''; img.width = 52; img.height = 42; img.loading = 'lazy'; button.append(img); }
      const text = document.createElement('span'); text.textContent = option.textContent;const part=typeof catalog!=='undefined'?catalog.find(p=>p.id===option.value):null;if(part){const details=document.createElement('small');details.textContent=part.brand+' · '+part.summary;text.append(details)}button.append(text);
      const mark = document.createElement('span'); mark.className = 'select-check'; mark.setAttribute('aria-hidden','true'); mark.textContent = option.value === active.value ? '✓' : ''; button.append(mark);
      button.addEventListener('click', () => choose(i)); results.append(button);
    });
    if (!rows.length) { const p = document.createElement('p'); p.className = 'select-empty'; p.textContent = 'No matches. Try a shorter model name.'; results.append(p); }
    hint.textContent = rows.length + (rows.length === 1 ? ' option' : ' options') + ' · ↑ ↓ to navigate · Enter to select';
    activate(Math.max(0, rows.findIndex(option => option.value === active.value)));
  }
  function open(select) {
    active = select; const button = registry.get(select).button;
    dialog.querySelector('strong').textContent = label(select); search.value = '';selectedBrands.clear();const filters=dialog.querySelector('.select-brand-filters');filters.replaceChildren();const brands=[...new Set([...select.options].map(o=>typeof catalog!=='undefined'?catalog.find(p=>p.id===o.value)?.brand:null).filter(Boolean))].sort();for(const brand of brands){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.addEventListener('change',()=>{input.checked?selectedBrands.add(brand):selectedBrands.delete(brand);render()});label.append(input,document.createTextNode(brand));filters.append(label)}
    const rect = button.getBoundingClientRect(), width = Math.min(Math.max(rect.width, 460), innerWidth - 24), maxHeight = Math.min(660, innerHeight - 32);
    dialog.style.width = width + 'px'; dialog.style.maxHeight = maxHeight + 'px';
    dialog.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
    dialog.style.top = Math.max(16, Math.min(rect.bottom + 8, innerHeight - maxHeight - 16)) + 'px';
    dialog.showModal(); button.setAttribute('aria-expanded', 'true'); render(); results.tabIndex=0; results.focus({preventScroll:true});
  }
  function enhance() {
    if (!document?.querySelector('main')) return;
    document.querySelectorAll('select:not(.sr-only)').forEach(select => {
      if (!registry.has(select)) {
        const wrapper = document.createElement('span'); wrapper.className = 'modern-select';
        const button = document.createElement('button'); button.type = 'button'; button.className = 'select-trigger'; button.id = 'select-trigger-' + (++serial);
        button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'select-dialog');
        const text = document.createElement('span'); text.className = 'select-trigger-text'; button.append(text);
        const chevron = document.createElement('span'); chevron.className = 'select-chevron'; chevron.setAttribute('aria-hidden','true'); chevron.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m6 8 4 4 4-4"/></svg>'; button.append(chevron);
        select.before(wrapper); wrapper.append(select,button); select.hidden = true;
        registry.set(select,{button,text}); button.addEventListener('click',()=>open(select));
        select.addEventListener('change',()=>sync(select));
      }
      sync(select);
    });
  }
  dialog.id = 'select-dialog';
  search.addEventListener('input',render);
  dialog.addEventListener('keydown',event=>{
    if(event.target!==search&&event.target!==results)return;
    if (['ArrowDown','ArrowUp','Home','End','Enter'].includes(event.key)) {
      event.preventDefault();
      if(event.key==='Enter')choose(cursor);else activate(event.key==='Home'?0:event.key==='End'?rows.length-1:cursor+(event.key==='ArrowDown'?1:-1));
    }
  });
  dialog.querySelector('.select-close').addEventListener('click',()=>close());
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
  let queued=false;
  new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;enhance();});}}).observe(document.querySelector('main'),{childList:true,subtree:true});
  window.addEventListener('resize',()=>{if(active)close();});
  enhance();
})();
