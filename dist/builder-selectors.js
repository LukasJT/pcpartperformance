/* Builder-only select enhancement. Native values/change events remain the build engine's input. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { window.PCP_BUILDER_SELECTORS = api; api.mount(); }
})(function () {
  'use strict';
  const CATEGORIES = [['cpu', 'Processor'], ['board', 'Motherboard'], ['gpu', 'Graphics card'], ['ram', 'Memory kit'], ['ssd', 'Solid-state drive'], ['hdd', 'Hard drive'], ['psu', 'Power supply'], ['case', 'PC case'], ['fan', 'Case fans']];
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
  function filterOptions(rows, { query = '', brands = new Set(), series = '', modelsOnly = false, selected = '' } = {}) {
    const tokens = normalize(query).split(' ').filter(Boolean), chosenBrands = brands instanceof Set ? brands : new Set(brands);
    return rows.filter(row => {
      if (!row.id) return !tokens.length && !chosenBrands.size && !series && !modelsOnly;
      return (!chosenBrands.size || chosenBrands.has(row.brand)) && (!series || row.series === series) && (!modelsOnly || row.hasModel) && tokens.every(token => row.text.includes(token));
    }).sort((a, b) => Number(b.id === selected && !!b.id) - Number(a.id === selected && !!a.id) || Number(!b.id) - Number(!a.id) || Number(b.hasModel) - Number(a.hasModel));
  }
  const icon = (name = 'component') => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + ({
    close: '<path d="m6 6 12 12M18 6 6 18"/>', chevron: '<path d="m7 10 5 5 5-5"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>', check: '<path d="m5 12 4 4 10-10"/>', component: '<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>'
  })[name] + '</svg>';
  function mount() {
    if (!document.querySelector('body[data-page="builder"] main') || document.querySelector('[data-builder-picker]')) return;
    const registry = new WeakMap(), main = document.querySelector('main');
    const parts = () => window.PCP_BUILD?.catalog() || (typeof catalog !== 'undefined' ? catalog : []);
    const partIndex = new Map(parts().map(part => [part.id, part]));
    const modelIds = new Set(window.downloadedModelIds || []);
    const images = window.PCP_IMAGES || {};
    const dialog = document.createElement('dialog');
    dialog.className = 'select-dialog builder-picker'; dialog.dataset.builderPicker = ''; dialog.id = 'builder-picker';
    dialog.setAttribute('aria-labelledby', 'builder-picker-title');
    dialog.innerHTML = '<div class="select-dialog-head"><div><span class="builder-picker-kicker">Choose an exact model</span><strong id="builder-picker-title">Component choices</strong></div><button type="button" class="select-close" aria-label="Close choices">' + icon('close') + '</button></div>' +
      '<p class="builder-picker-current"></p><div class="builder-picker-tools"><button type="button" class="builder-picker-search-button">' + icon('search') + '<span>Search models</span></button><label class="builder-picker-models"><input type="checkbox"> 3D model available</label><button type="button" class="builder-picker-reset">Reset filters</button></div>' +
      '<div class="select-search-wrap" hidden><label class="sr-only" for="builder-picker-search">Search exact model, capacity or SKU</label><input type="search" id="builder-picker-search" class="select-search" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="builder-picker-options" placeholder="Model, capacity or SKU" autocomplete="off"></div>' +
      '<details class="builder-picker-filters"><summary>Category, brands and series <span class="builder-picker-filter-count"></span></summary><div class="builder-picker-filter-content"><div class="builder-picker-facets"><label>Category<select data-picker-category></select></label><label><span data-picker-series-label>Series</span><select data-picker-series><option value="">All series</option></select></label></div><fieldset class="builder-picker-brands"><legend>Brands · choose any</legend><div class="select-brand-filters"></div></fieldset></div></details>' +
      '<div class="select-results" id="builder-picker-options" role="listbox" aria-label="Available choices" tabindex="0" autofocus></div><button type="button" class="builder-picker-more" hidden>Show more choices</button><p class="select-hint" aria-live="polite"></p>';
    document.body.append(dialog);
    const results = dialog.querySelector('.select-results'), search = dialog.querySelector('.select-search'), hint = dialog.querySelector('.select-hint');
    const modelCheck = dialog.querySelector('.builder-picker-models input'), categorySelect = dialog.querySelector('[data-picker-category]'), seriesSelect = dialog.querySelector('[data-picker-series]');
    const reset = dialog.querySelector('.builder-picker-reset'), more = dialog.querySelector('.builder-picker-more'), filters = dialog.querySelector('.builder-picker-filters');
    let active = null, rows = [], cursor = 0, limit = 80, serial = 0, sourceRows = [];
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
    function currentSelection() {
      const part = partIndex.get(active.value);
      dialog.querySelector('.builder-picker-current').textContent = active.value ? 'Selected: ' + (part?.name || active.selectedOptions[0]?.textContent.trim() || active.value) : 'No part selected in this category.';
    }
    function render() {
      if (!active) return;
      rows = filterOptions(sourceRows, { query: search.value, brands, series: seriesSelect.value, modelsOnly: modelCheck.checked, selected: active.value });
      results.replaceChildren();
      const identities = new Map();
      for (const row of sourceRows) { const name = normalize(row.name); if (!identities.has(name)) identities.set(name, new Set()); identities.get(name).add(row.id); }
      rows.slice(0, limit).forEach((row, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'select-option'; button.id = 'builder-picker-option-' + index;
        button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(row.id === active.value)); button.tabIndex = -1;
        const frame = document.createElement('span'); frame.className = 'builder-picker-photo'; frame.setAttribute('aria-hidden', 'true');
        const asset = imageFor(row.part, images);
        if (asset) { const image = document.createElement('img'); image.src = asset.src; image.alt = ''; image.width = 64; image.height = 56; image.loading = 'lazy'; frame.append(image); }
        else frame.innerHTML = icon();
        const text = document.createElement('span'); text.className = 'builder-picker-option-name'; text.textContent = row.id ? row.name : active.value ? 'Remove this selection' : 'Keep this category empty';
        if (row.part) {
          const details = document.createElement('small'); details.textContent = [row.brand, row.part.summary, row.part.sku ? 'SKU ' + row.part.sku : '', row.hasModel ? '3D available' : ''].filter(Boolean).join(' · '); text.append(details);
          if ((identities.get(normalize(row.name))?.size || 0) > 1) { const identity = document.createElement('small'); identity.textContent = 'Catalog ID: ' + row.id + ' · identity review pending'; text.append(identity); }
        }
        const mark = document.createElement('span'); mark.className = 'select-check'; mark.setAttribute('aria-hidden', 'true'); if (row.id === active.value) mark.innerHTML = icon('check');
        button.append(frame, text, mark); button.addEventListener('click', () => choose(index)); results.append(button);
      });
      if (!rows.length) { const empty = document.createElement('p'); empty.className = 'select-empty'; empty.textContent = 'No matching choices. Reset filters or try a shorter model name. Parts with unknown fit remain available unless they introduce a documented conflict.'; results.append(empty); }
      const count = rows.filter(row => row.id).length;
      hint.textContent = category(active) ? count + (count === 1 ? ' model' : ' models') + ' · Arrow keys browse · Enter selects · / opens search' : rows.length + ' choices · Arrow keys browse · Enter selects';
      const filterCount = brands.size + Number(!!seriesSelect.value) + Number(modelCheck.checked) + Number(!!search.value.trim());
      reset.disabled = filterCount === 0;
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
      active = select; limit = 80; brands.clear(); search.value = ''; modelCheck.checked = false;
      const isPart = !!category(select);
      dialog.querySelector('.builder-picker-kicker').textContent = isPart ? 'Choose an exact model' : 'Build preferences';
      dialog.querySelector('#builder-picker-title').textContent = selectLabel(select);
      sourceRows = optionRecords(select, partIndex, modelIds);
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
      configure(select); filters.open = false; dialog.querySelector('.select-search-wrap').hidden = true;
      dialog.querySelector('.builder-picker-search-button').setAttribute('aria-expanded', 'false');
      const width = Math.min(720, innerWidth - 32), height = Math.min(820, innerHeight - 32);
      dialog.style.width = width + 'px'; dialog.style.maxHeight = height + 'px';
      dialog.style.left = Math.max(16, (innerWidth - width) / 2) + 'px'; dialog.style.top = Math.max(16, Math.min(64, (innerHeight - height) / 2)) + 'px';
      // Search is hidden when the modal opens, so opening a picker cannot summon a mobile keyboard.
      dialog.showModal(); results.focus({ preventScroll: true }); activate(cursor);
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
      dialog.querySelector('.select-search-wrap').hidden = false;
      dialog.querySelector('.builder-picker-search-button').setAttribute('aria-expanded', 'true');
      search.focus({ preventScroll: true });
    }
    dialog.querySelector('.builder-picker-search-button').setAttribute('aria-controls', 'builder-picker-search');
    dialog.querySelector('.builder-picker-search-button').addEventListener('click', startSearch);
    dialog.querySelector('.select-close').addEventListener('click', () => close()); reset.addEventListener('click', resetFilters);
    search.addEventListener('input', () => { limit = 80; render(); }); modelCheck.addEventListener('change', () => { limit = 80; render(); });
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
    window.addEventListener('resize', () => { if (active) close(); });
    enhance();
  }
  return { CATEGORIES, normalize, facet, facetLabel, imageFor, optionRecords, filterOptions, mount };
});
