/* Builder-only select enhancement. Native values/change events remain the build engine's input. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { window.PCP_BUILDER_SELECTORS = api; api.mount(); }
})(function () {
  'use strict';
  const CATEGORIES = [['cpu', 'Processor'], ['board', 'Motherboard'], ['gpu', 'Graphics card'], ['ram', 'Memory kit'], ['ssd', 'Solid-state drive'], ['hdd', 'Hard drive'], ['psu', 'Power supply'], ['case', 'PC case'], ['fan', 'Case fans'], ['cooler','CPU cooler']];
  const normalize = value => String(value ?? '').toLocaleLowerCase().replace(/[®™]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const category = select => select?.dataset?.buildPrimary || select?.dataset?.buildAdd || select?.dataset?.buildSlot || '';
  function facet(part = {}) {
    if (part.series) return String(part.series);
    const text = [part.name, part.architecture, part.summary].filter(Boolean).join(' '), cat = part.cat;
    let match;
    if (cat === 'cpu') {
      if ((match = text.match(/Ryzen\s+([3579])/i))) return 'Ryzen ' + match[1];
      if ((match = text.match(/Core\s+Ultra\s+([579])/i))) return 'Core Ultra ' + match[1];
      if ((match = text.match(/Core\s+i([3579])/i))) return 'Core i' + match[1];
      if ((match = text.match(/Threadripper|EPYC|Xeon|Pentium|Celeron|Athlon/i))) return match[0];
    }
    if (cat === 'gpu') {
      if ((match = text.match(/RTX\s+([2345])\d{3}/i))) return 'GeForce RTX ' + match[1] + '0 series';
      if ((match = text.match(/GTX\s+(16|10|9|7|6)\d{2}/i))) return 'GeForce GTX ' + match[1] + (match[1].length === 2 ? ' series' : '00 series');
      if ((match = text.match(/RX\s+([5679])\d{3}/i))) return 'Radeon RX ' + match[1] + '000 series';
      if ((match = text.match(/RX\s+([456])\d{2}\b/i))) return 'Radeon RX ' + match[1] + '00 series';
      if ((match = text.match(/Arc\s+([AB])\d{3}/i))) return 'Intel Arc ' + match[1].toUpperCase() + ' series';
    }
    if (cat === 'board' && (match = text.match(/\b([ABHXZ]\d{3}[EM]?)\b/i))) return match[1].toUpperCase();
    if (cat === 'ram' && (match = text.match(/DDR\s*([345])/i))) return 'DDR' + match[1];
    if (cat === 'ssd') {
      if ((match = text.match(/PCIe\s*([345])(?:\.0)?/i))) return 'PCIe ' + match[1] + '.0';
      if (/SATA/i.test(text)) return 'SATA';
      if (/NVMe/i.test(text)) return 'NVMe · generation unspecified';
    }
    if (cat === 'hdd' && (match = text.match(/\b(2\.5|3\.5)[-\s]*(?:inch|in|″)/i))) return match[1] + '-inch';
    if (cat === 'psu' && (match = text.match(/\b(SFX-L|SFX|ATX|TFX|Flex\s+ATX)\b/i))) return match[1].toUpperCase();
    if (cat === 'case') {
      if ((match = text.match(/\b(O11|North|Torrent|Define|Pop|Obsidian|MasterBox|Meshify|H[5679]\d{2}|[34567]000D)\b/i))) return match[1];
    }
    if (cat === 'fan') {
      const size = Number(part.specs?.['Fan size']);
      if (Number.isFinite(size) && size > 0) return size + ' mm';
      if ((match = text.match(/\b(80|92|120|140|180|200)\s*mm\b/i))) return match[1] + ' mm';
    }
    return '';
  }
  function facetLabel(cat) {
    return ({ board: 'Chipset', ram: 'Memory generation', ssd: 'Interface', hdd: 'Drive format', psu: 'Power supply format', fan: 'Fan size' })[cat] || 'Series';
  }
  function imageFor(part, images = {}) {
    const image = images[part?.id];
    if (!image?.src || !/^(?:\/[^/]|https:\/\/)/.test(image.src)) return null;
    if (image.exactVariant === true || image.productId === part.id) return image;
    // A family/capacity mismatch gets a category icon. Do not turn a nearby SKU into an exact photo.
    const pictured = normalize(String(image.picturedModel || '').replace(/\s*[—–]\s*(?:simplified )?illustration.*$/i, ''));
    const name = normalize(part.name), brandedName = normalize([part.brand, part.name].filter(Boolean).join(' '));
    return pictured && (pictured === name || pictured === brandedName) ? image : null;
  }
  function optionRecords(select, index, models = new Set()) {
    return [...select.options].map(option => {
      const part = index.get(option.value), text = part ? [part.name, part.brand, part.architecture, part.summary, part.sku, part.revision, part.variant, ...Object.values(part.specs || {})].filter(value => value != null).join(' ') : option.textContent;
      return { option, part, id: option.value, name: part?.name || option.textContent.trim(), brand: part?.brand || option.dataset?.brand || '', series: facet(part), hasModel: models.has(option.value), text: normalize(text) };
    }).filter(row => !row.option.disabled && !row.option.hidden);
  }
  function filterOptions(rows, { query = '', brands = new Set(), series = '', modelsOnly = false, selected = '', sort = 'recommended' } = {}) {
    const tokens = normalize(query).split(' ').filter(Boolean), chosenBrands = brands instanceof Set ? brands : new Set(brands);
    return rows.filter(row => {
      if (!row.id) return !tokens.length && !chosenBrands.size && !series && !modelsOnly;
      return (!chosenBrands.size || chosenBrands.has(row.brand)) && (!series || row.series === series) && (!modelsOnly || row.hasModel) && tokens.every(token => row.text.includes(token));
    }).sort((a, b) => Number(b.id === selected && !!b.id) - Number(a.id === selected && !!a.id) || Number(!b.id) - Number(!a.id) || (sort === 'name' ? a.name.localeCompare(b.name, undefined, {numeric:true}) : sort === 'brand' ? a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name,undefined,{numeric:true}) : Number(b.hasModel) - Number(a.hasModel)));
  }
  // Skip is a separate action, never an option competing with actual products.
  // Keeping this projection separate also preserves row/cursor index identity.
  function visibleOptions(rows, isPart) { return rows.filter(row => !isPart || row.id !== ''); }
  const icon = (name = 'component') => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + ({
    close: '<path d="m6 6 12 12M18 6 6 18"/>', chevron: '<path d="m7 10 5 5 5-5"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>', check: '<path d="m5 12 4 4 10-10"/>', psu:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="10" cy="12" r="4"/><path d="m8 9 4 6m-5-4 6 2m-6 0 6-2m-5 4 4-6M17 9v3m0 3h1"/>', case:'<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6M9 5h6"/>', gpu:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><path d="M5 18v3m3-3v3m3-3v3M2 6V3"/>', ram:'<rect x="2" y="7" width="20" height="9" rx="1"/><path d="M5 10h3v3H5zm5 0h3v3h-3zm5 0h3v3h-3zM4 16v3m4-3v3m4-3v3m4-3v3m4-3v3"/>', fan:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="6"/><path d="m9 7 6 10m-8-7 10 4m-10 0 10-4m-8 7 6-10"/>', cpu:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M8 8h8v8H8zM8 2v3m4-3v3m4-3v3M8 19v3m4-3v3m4-3v3M2 8h3m-3 4h3m-3 4h3m14-8h3m-3 4h3m-3 4h3"/>', board:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M7 6h6v6H7zM16 5v9m2-9v9M7 16h10M7 19h10M2 5h2m-2 4h2"/>', ssd:'<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M7 10h4v4H7zm6 0h4v4h-4zM3 10h1m-1 4h1m15-4h2m-2 4h2"/>', hdd:'<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="10" r="5"/><circle cx="12" cy="10" r="1"/><path d="m12 10 5 7M8 19h5"/>', cooler:'<path d="M5 5h14v14H5zM7 3h10M7 21h10M3 7h2m-2 5h2m-2 5h2m14-10h2m-2 5h2m-2 5h2"/><circle cx="12" cy="12" r="5"/><path d="m9 8 6 8m-8-6 10 4m-10 0 10-4"/>', component: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>'
  }[name] || '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>') + '</svg>';
  function mount() {
    if (!document.querySelector('body[data-page="builder"] main') || document.querySelector('[data-builder-picker]')) return;
    const registry = new WeakMap(), main = document.querySelector('main');
    const parts = () => window.PCP_BUILD?.catalog() || (typeof catalog !== 'undefined' ? catalog : []);
    const partIndex = new Map(parts().map(part => [part.id, part]));
    const modelIds = new Set(window.downloadedModelIds || []);
    let images = window.PCP_IMAGES || {};
    const dialog = document.createElement('dialog');
    dialog.className = 'select-dialog builder-picker'; dialog.dataset.builderPicker = ''; dialog.id = 'builder-picker';
    dialog.setAttribute('aria-labelledby', 'builder-picker-title');
    dialog.innerHTML = '<div class="select-dialog-head"><div><span class="builder-picker-kicker" hidden>Choose an exact model</span><strong id="builder-picker-title">Component choices</strong><span class="builder-picker-count" aria-live="polite"></span></div><div class="builder-picker-window"><button type="button" class="builder-picker-expand" aria-label="Expand choices" aria-expanded="false">↕</button><button type="button" class="select-close" aria-label="Close choices">' + icon('close') + '</button></div></div>' +
      '<p class="builder-picker-current" hidden></p><div class="select-search-wrap">' + icon('search') + '<label class="sr-only" for="builder-picker-search">Search exact model, capacity or SKU</label><input type="search" id="builder-picker-search" class="select-search" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="builder-picker-options" placeholder="Search model or brand" autocomplete="off"></div>' +
      '<div class="builder-picker-tools"><details class="builder-picker-filters"><summary>Filters <span class="builder-picker-filter-count"></span></summary><div class="builder-picker-filter-content"><div class="builder-picker-facets"><label>Category<select data-picker-category></select></label><label><span data-picker-series-label>Series</span><select data-picker-series><option value="">All series</option></select></label></div><fieldset class="builder-picker-brands"><legend>Brands</legend><div class="select-brand-filters"></div></fieldset><label class="builder-picker-models"><input type="checkbox"> 3D models only</label></div></details><label class="builder-picker-sort"><span class="sr-only">Sort models</span><select aria-label="Sort models"><option value="recommended">Default order</option><option value="name">Model name</option><option value="brand">Brand</option></select></label><button type="button" class="builder-picker-reset" hidden>Reset</button></div>' +
      '<div class="builder-picker-scroll"><div class="select-results" id="builder-picker-options" role="listbox" aria-label="Available choices" tabindex="0" autofocus></div><button type="button" class="builder-picker-more" hidden>Show more choices</button></div><div class="builder-picker-footer"><button type="button" class="builder-picker-skip" hidden aria-describedby="builder-picker-skip-help">Skip for now</button><span class="sr-only" id="builder-picker-skip-help">This category remains unselected. The build review will show any required components still missing.</span><p class="select-hint">Arrow keys to browse · Enter to select</p></div>';
    document.body.append(dialog);
    const results = dialog.querySelector('.select-results'), search = dialog.querySelector('.select-search');
    results.setAttribute('aria-description','Use Arrow keys to browse, Enter to select, or / to search. Escape closes the picker.');
    const modelCheck = dialog.querySelector('.builder-picker-models input'), categorySelect = dialog.querySelector('[data-picker-category]'), seriesSelect = dialog.querySelector('[data-picker-series]');
    const reset = dialog.querySelector('.builder-picker-reset'), more = dialog.querySelector('.builder-picker-more'), filters = dialog.querySelector('.builder-picker-filters'), skip = dialog.querySelector('.builder-picker-skip');
    const sort = dialog.querySelector('.builder-picker-sort select'), expand = dialog.querySelector('.builder-picker-expand');
    let active = null, rows = [], cursor = 0, limit = 80, serial = 0, sourceRows = [];
    document.addEventListener('pcp:images',()=>{images=window.PCP_IMAGES||{};if(active)render();});
    const brands = new Set();
    function selectLabel(select) {
      const visible = select.labels?.[0] ? [...select.labels[0].childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join(' ').trim() : '';
      return (select.getAttribute('aria-label') || visible || 'Choose an option').replace('Choose primary ', 'Choose ');
    }
    function sync(select) {
      const item = registry.get(select); if (!item) return;
      const part = partIndex.get(select.value), selected = select.selectedOptions[0];
      const text = part?.name || selected?.textContent.trim() || 'Choose an option';
      if (item.text.textContent !== text) item.text.textContent = text;
      item.button.setAttribute('aria-label', selectLabel(select) + ': ' + text);
      item.button.disabled = select.disabled;
      item.button.classList.toggle('has-value', !!select.value);
    }
    function focusTrigger(select) {
      requestAnimationFrame(() => {
        const slot = category(select), addition = !!select.dataset.buildAdd;
        const replacement = select.isConnected ? select : [...main.querySelectorAll('select')].find(value => select.id ? value.id === select.id : slot && category(value) === slot && !!value.dataset.buildAdd === addition);
        registry.get(replacement)?.button.focus({ preventScroll: true });
      });
    }
    function close(restore = true) {
      const previous = active; active = null;
      if (dialog.open) dialog.close();
      if (previous) { registry.get(previous)?.button.setAttribute('aria-expanded', 'false'); if (restore) focusTrigger(previous); }
    }
    function activate(index) {
      const elements = results.querySelectorAll('[role="option"]');
      cursor = Math.max(0, Math.min(index, elements.length - 1));
      elements.forEach((element, position) => element.classList.toggle('is-focused', position === cursor));
      const focused = elements[cursor];
      for (const element of [results, search]) focused ? element.setAttribute('aria-activedescendant', focused.id) : element.removeAttribute('aria-activedescendant');
      focused?.scrollIntoView({ block: 'nearest' });
    }
    function choose(index) {
      const select = active, row = rows[index];
      if (!select || select.disabled || !row) return;
      select.value = row.id; close(false); sync(select);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      focusTrigger(select);
    }
    function clearSelection() {
      const select = active;
      if (!select || select.disabled || !sourceRows.some(row => row.id === '')) return;
      select.value = ''; close(false); sync(select);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      focusTrigger(select);
    }
    function currentSelection() {
      const part = partIndex.get(active.value);
      const current=dialog.querySelector('.builder-picker-current');
      current.hidden=!active.value;
      current.textContent = active.value ? 'Selected: ' + (part?.name || active.selectedOptions[0]?.textContent.trim() || active.value) : '';
    }
    function render() {
      if (!active) return;
      rows = visibleOptions(filterOptions(sourceRows, { query: search.value, brands, series: seriesSelect.value, modelsOnly: modelCheck.checked, selected: active.value, sort:sort.value }), !!category(active));
      results.replaceChildren();
      const identities = new Map();
      for (const row of sourceRows) { const name = normalize(row.name); if (!identities.has(name)) identities.set(name, new Set()); identities.get(name).add(row.id); }
      rows.slice(0, limit).forEach((row, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'select-option'+(row.id?'':' picker-empty-option'); button.id = 'builder-picker-option-' + index;
        button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(row.id === active.value)); button.tabIndex = -1;
        const frame = document.createElement('span'); frame.className = 'builder-picker-photo'; frame.setAttribute('aria-hidden', 'true');
        const asset = imageFor(row.part, images);
        if (asset) { const image = document.createElement('img'); image.src = asset.src; image.alt = ''; image.title = asset.picturedModel || row.name; image.width = 64; image.height = 56; image.loading = 'lazy'; frame.append(image); }
        else frame.innerHTML = icon(row.part?.cat);
        const text = document.createElement('span'); text.className = 'builder-picker-option-name'; text.textContent = row.id ? row.name : active.value ? 'Remove selection' : 'Leave unselected';
        if (row.part) {
          const details = document.createElement('small'); details.textContent = [row.brand, row.part.summary].filter(Boolean).join(' · '); text.append(details);
          if(row.part.sku)button.title=row.part.sku;
          if(row.hasModel){const badge=document.createElement('span');badge.className='builder-picker-model-badge';badge.textContent='3D';badge.setAttribute('aria-label','3D model available');details.append(' ',badge);}
          if ((identities.get(normalize(row.name))?.size || 0) > 1) { const identity = document.createElement('small'); identity.textContent = 'Catalog ID: ' + row.id + ' · identity review pending'; text.append(identity); }
        }
        const mark = document.createElement('span'); mark.className = 'select-check'; mark.setAttribute('aria-hidden', 'true'); mark.innerHTML = row.id === active.value ? icon('check') : '<span>Add</span>';
        const region=window.PCP_BUILD_SESSION?.current()?.region||document.documentElement.dataset.region||'CA',offer=window.PCP_PUBLIC_PRICES?.offersFor(row.id,region)?.[0];
        if(offer){const price=document.createElement('small');price.className='builder-picker-price';price.textContent=new Intl.NumberFormat(region==='US'?'en-US':'en-CA',{style:'currency',currency:region==='US'?'USD':'CAD',currencyDisplay:'code'}).format(offer.price);price.title='Checked '+new Date(offer.checkedAt).toLocaleString()+' · '+(offer.store||offer.merchant);text.append(price);}
        button.append(frame, text, mark); button.addEventListener('click', () => choose(index)); results.append(button);
      });
      if (!rows.length) { const empty = document.createElement('p'); empty.className = 'select-empty'; empty.textContent = 'No matches. Try another name or reset the filters.'; results.append(empty); }
      const count = rows.filter(row => row.id).length;
      dialog.querySelector('.builder-picker-count').textContent = category(active) ? count + (count === 1 ? ' model available' : ' models available') : rows.length + ' choices';
      const filterCount = brands.size + Number(!!seriesSelect.value) + Number(modelCheck.checked) + Number(!!search.value.trim());
      reset.disabled = filterCount === 0;
      reset.hidden = filterCount === 0;
      dialog.querySelector('.builder-picker-filter-count').textContent = filterCount ? filterCount + ' active' : '';
      more.hidden = rows.length <= limit; more.textContent = 'Show ' + Math.min(80, rows.length - limit) + ' more choices';
      activate(Math.max(0, rows.findIndex(row => row.id === active.value)));
    }
    function resetFilters() {
      brands.clear(); modelCheck.checked = false; seriesSelect.value = ''; search.value = ''; limit = 80;
      dialog.querySelectorAll('.select-brand-filters input').forEach(input => { input.checked = false; });
      render();
    }
    function configure(select) {
      if (active && active !== select) registry.get(active)?.button.setAttribute('aria-expanded', 'false');
      active = select; limit = 80; brands.clear(); search.value = ''; modelCheck.checked = false; sort.value='recommended';
      dialog.dataset.expanded='false';expand.setAttribute('aria-expanded','false');expand.setAttribute('aria-label','Expand choices');
      const isPart = !!category(select);
      dialog.querySelector('.builder-picker-kicker').textContent = isPart ? 'Choose an exact model' : 'Build preferences';
      dialog.querySelector('#builder-picker-title').textContent = ({cpu:'Choose a processor',board:'Choose a motherboard',gpu:'Choose a graphics card',ram:'Choose memory',ssd:'Choose an SSD',hdd:'Choose a hard drive',psu:'Choose a power supply',case:'Choose a case',fan:'Choose case fans',cooler:'Choose a CPU cooler'})[category(select)] || selectLabel(select);
      sourceRows = optionRecords(select, partIndex, modelIds);
      skip.hidden = !isPart || !sourceRows.some(row => row.id === '');
      skip.textContent = select.value ? 'Remove this component' : 'Skip for now';
      filters.hidden = !isPart; dialog.querySelector('.builder-picker-models').hidden = !isPart;
      modelCheck.disabled = !sourceRows.some(row => row.hasModel);
      const brandWrap = dialog.querySelector('.select-brand-filters'); brandWrap.replaceChildren();
      for (const brand of [...new Set(sourceRows.map(row => row.brand).filter(Boolean))].sort()) {
        const label = document.createElement('label'), checkbox = document.createElement('input'); checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => { checkbox.checked ? brands.add(brand) : brands.delete(brand); limit = 80; render(); });
        label.append(checkbox, document.createTextNode(brand)); brandWrap.append(label);
      }
      const label = facetLabel(category(select)); dialog.querySelector('[data-picker-series-label]').textContent = label;
      seriesSelect.replaceChildren();
      for (const value of ['', ...new Set(sourceRows.map(row => row.series).filter(Boolean))].sort()) {
        const option = document.createElement('option'); option.value = value; option.textContent = value || 'All ' + label.toLocaleLowerCase(); seriesSelect.append(option);
      }
      seriesSelect.disabled = seriesSelect.options.length < 2;
      categorySelect.replaceChildren();
      for (const [slot, title] of CATEGORIES) {
        const target = main.querySelector('select[data-build-primary="' + slot + '"],select[data-build-slot="' + slot + '"]'); if (!target) continue;
        const option = document.createElement('option'); option.value = slot; option.textContent = title + (target.disabled ? ' · locked' : ''); option.disabled = target.disabled; categorySelect.append(option);
      }
      categorySelect.value = category(select); currentSelection();
      registry.get(select)?.button.setAttribute('aria-expanded', 'true');
      render();
    }
    function open(select) {
      if (select.disabled) return;
      configure(select); filters.open = false;
      // The list receives focus. A visible search field never opens the mobile keyboard by itself.
      dialog.showModal(); results.focus({ preventScroll: true }); activate(cursor);
      updateViewport();
    }
    function updateViewport() {
      if (!dialog.open || !window.visualViewport) return;
      dialog.style.setProperty('--picker-viewport-height', Math.round(window.visualViewport.height) + 'px');
      dialog.style.setProperty('--picker-viewport-top', Math.round(window.visualViewport.offsetTop) + 'px');
      dialog.style.setProperty('--picker-viewport-bottom', Math.max(0,Math.round(innerHeight-window.visualViewport.height-window.visualViewport.offsetTop)) + 'px');
    }
    function enhance() {
      for (const select of main.querySelectorAll('select:not(.sr-only)')) {
        if (!registry.has(select)) {
          const wrapper = document.createElement('span'); wrapper.className = 'modern-select';
          const button = document.createElement('button'); button.type = 'button'; button.className = 'select-trigger'; button.id = 'builder-select-trigger-' + (++serial);
          button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', dialog.id);
          const text = document.createElement('span'); text.className = 'select-trigger-text';
          const chevron = document.createElement('span'); chevron.className = 'select-chevron'; chevron.setAttribute('aria-hidden', 'true'); chevron.innerHTML = icon('chevron');
          button.append(text, chevron); select.before(wrapper); wrapper.append(select, button); select.hidden = true;
          registry.set(select, { button, text }); button.addEventListener('click', () => open(select)); select.addEventListener('change', () => sync(select));
        }
        sync(select);
      }
    }
    function startSearch() {
      search.focus({ preventScroll: true });
    }
    dialog.querySelector('.select-close').addEventListener('click', () => close()); reset.addEventListener('click', resetFilters); skip.addEventListener('click', clearSelection);
    expand.addEventListener('click',()=>{const enlarged=dialog.dataset.expanded!=='true';dialog.dataset.expanded=String(enlarged);expand.setAttribute('aria-expanded',String(enlarged));expand.setAttribute('aria-label',enlarged?'Compact choices':'Expand choices');});
    sort.addEventListener('change',()=>{limit=80;render();});
    search.addEventListener('input', () => { limit = 80; render(); }); modelCheck.addEventListener('change', () => { limit = 80; render(); });
    search.addEventListener('focus', () => { filters.open = false; });
    seriesSelect.addEventListener('change', () => { limit = 80; render(); });
    categorySelect.addEventListener('change', () => {
      const select = main.querySelector('select[data-build-primary="' + categorySelect.value + '"],select[data-build-slot="' + categorySelect.value + '"]');
      if (select && !select.disabled) configure(select);
    });
    more.addEventListener('click', () => { const next = limit; limit += 80; render(); results.focus({ preventScroll: true }); activate(next); });
    dialog.addEventListener('keydown', event => {
      if (event.key === '/' && event.target === results) { event.preventDefault(); startSearch(); return; }
      if (event.target !== results && event.target !== search) return;
      if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'Enter') choose(cursor);
        else activate(event.key === 'Home' ? 0 : event.key === 'End' ? Math.min(rows.length, limit) - 1 : cursor + (event.key === 'ArrowDown' ? 1 : -1));
      }
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
    let queued = false;
    new MutationObserver(() => { if (!queued) { queued = true; queueMicrotask(() => { queued = false; enhance(); }); } }).observe(main, { childList: true, subtree: true });
    document.addEventListener('pcp:build-state', () => { if (active && !active.isConnected) close(); });
    let viewportWidth=innerWidth;
    window.addEventListener('resize', () => { if(viewportWidth!==innerWidth){viewportWidth=innerWidth;if(active)close();} });
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    enhance();
  }
  return { CATEGORIES, normalize, facet, facetLabel, imageFor, optionRecords, filterOptions, visibleOptions, icon, mount };
});
