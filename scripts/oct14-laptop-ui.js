(function (root) {
  'use strict';
  function normalize(value) { return String(value || '').toLowerCase().replace(/rtx\s*(\d)/g, 'rtx $1').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function matches(laptop, filters) {
    if (laptop.region !== filters.region) return false;
    if (filters.brands.length && !filters.brands.includes(laptop.brand)) return false;
    const series = (laptop.gpu || '').match(/RTX\s*(\d)\d{3}/i)?.[1];
    if (filters.series.length && !filters.series.includes('RTX ' + series + '0')) return false;
    const size = laptop.screenInches == null ? 'unknown' : laptop.screenInches <= 14 ? 'compact' : laptop.screenInches < 17 ? 'standard' : 'large';
    if (filters.screens.length && !filters.screens.includes(size)) return false;
    const haystack = normalize([laptop.name, laptop.model, laptop.sku, laptop.brand, laptop.cpu, laptop.gpu].join(' '));
    return normalize(filters.query).split(' ').filter(Boolean).every(token => haystack.includes(token));
  }
  function validSelection(ids, laptops, region) {
    return [...new Set(Array.isArray(ids) ? ids : [])].filter(id => laptops.some(laptop => laptop.id === id && laptop.region === region)).slice(0, 3);
  }
  function valueFor(laptop, key) {
    const value = laptop[key];
    if (value == null || value === '') return 'Not disclosed';
    const units = { gpuPowerW: ' W', screenInches: ' in', refreshHz: ' Hz', weightKg: ' kg', batteryLifeHours: ' hours' };
    return String(value) + (units[key] || '');
  }
  const api = { normalize, matches, validSelection, valueFor };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  if (!root.document.querySelector('[data-laptop-card]')) return;
  const document = root.document;
  const cards = [...document.querySelectorAll('[data-laptop-card]')];
  const search = document.querySelector('[data-laptop-search]');
  const status = document.querySelector('[data-laptop-status]');
  const compare = document.querySelector('[data-laptop-compare]');
  const comparison = document.querySelector('[data-laptop-comparison]');
  const tableHost = document.querySelector('[data-laptop-table]');
  const params = new URLSearchParams(location.search);
  let region = ['CA', 'US'].includes(params.get('region')) ? params.get('region') : 'CA';
  if (!params.has('region')) try { const saved = localStorage.getItem('pcp-region'); if (['CA', 'US'].includes(saved)) region = saved; } catch { /* Country remains usable without storage. */ }
  let laptops = [];
  let selected = new Set();
  const checked = name => [...document.querySelectorAll('[data-laptop-' + name + ']:checked')].map(input => input.getAttribute('data-laptop-' + name));
  function filters() { return { region, query: search.value, brands: checked('brand'), series: checked('series'), screens: checked('screen') }; }
  function render() {
    const choices = filters();
    let count = 0;
    for (const card of cards) {
      const laptop = laptops.find(item => item.id === card.dataset.laptopCard);
      card.hidden = laptop ? !matches(laptop, choices) : card.dataset.region !== region;
      if (!card.hidden) count++;
      card.querySelector('[data-laptop-select]').checked = selected.has(card.dataset.laptopCard);
    }
    document.querySelector('[data-laptop-count]').textContent = count + ' configurations · ' + (region === 'CA' ? 'Canada' : 'United States');
    document.querySelector('[data-laptop-empty]').hidden = count > 0;
    compare.disabled = selected.size < 2 || !laptops.length;
    compare.textContent = selected.size ? 'Compare ' + selected.size + ' selected' : 'Compare selected';
    const filterCount = choices.brands.length + choices.series.length + choices.screens.length;
    document.querySelector('[data-laptop-filter-count]').textContent = filterCount ? '(' + filterCount + ')' : '';
  }
  function reset() {
    search.value = '';
    document.querySelectorAll('[data-laptop-brand],[data-laptop-series],[data-laptop-screen]').forEach(input => { input.checked = false; });
    document.querySelector('.laptop-filters').open = false;
    render();
  }
  function cell(parent, value, tag) {
    const element = document.createElement(tag || 'td');
    element.textContent = value;
    parent.append(element);
    return element;
  }
  function showComparison(scroll) {
    const choices = laptops.filter(laptop => selected.has(laptop.id));
    if (choices.length < 2) return;
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.className = 'sr-only'; caption.textContent = 'Exact gaming laptop configuration comparison'; table.append(caption);
    const head = document.createElement('thead'), row = document.createElement('tr');
    cell(row, 'Specification', 'th').scope = 'col';
    for (const laptop of choices) {
      const th = document.createElement('th'); th.scope = 'col';
      if (laptop.imageSource) { const img = document.createElement('img'); img.src = laptop.imageSource; img.alt = ''; img.width = 120; img.height = 90; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; th.append(img); }
      const name = document.createElement('span'); name.textContent = laptop.name; th.append(name);
      const model = document.createElement('div'); model.className = 'laptop-model'; model.textContent = laptop.model || laptop.sku; th.append(model); row.append(th);
    }
    head.append(row); table.append(head);
    const body = document.createElement('tbody');
    const rows = [['cpu','Processor'],['gpu','Laptop graphics'],['gpuPowerW','GPU power limit'],['vram','Video memory'],['ram','Memory'],['storage','Storage'],['screenInches','Screen size'],['refreshHz','Refresh rate'],['panel','Panel'],['resolution','Resolution'],['upgradeableRam','Memory upgrades'],['weightKg','Weight'],['batteryLifeHours','Measured battery life']];
    for (const [key,label] of rows) { const tr = document.createElement('tr'); cell(tr,label,'th').scope = 'row'; choices.forEach(laptop => cell(tr,valueFor(laptop,key))); body.append(tr); }
    const sourceRow = document.createElement('tr'); cell(sourceRow,'Exact configuration','th').scope = 'row';
    for (const laptop of choices) { const td = document.createElement('td'), anchor = document.createElement('a'); anchor.href = laptop.url; anchor.textContent = 'View at ' + laptop.merchant; anchor.target = '_blank'; anchor.rel = 'noopener'; td.append(anchor); sourceRow.append(td); }
    body.append(sourceRow); table.append(body); tableHost.replaceChildren(table); comparison.hidden = false;
    document.querySelector('[data-laptop-share-status]').textContent = '';
    if (scroll) comparison.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  search.addEventListener('input', render);
  document.querySelectorAll('[data-laptop-brand],[data-laptop-series],[data-laptop-screen]').forEach(input => input.addEventListener('change', render));
  document.querySelectorAll('[data-laptop-reset],[data-laptop-clear]').forEach(button => button.addEventListener('click', reset));
  document.querySelectorAll('[data-laptop-select]').forEach(input => input.addEventListener('change', () => {
    if (input.checked && selected.size >= 3) { input.checked = false; status.textContent = 'Compare up to three laptops at a time.'; return; }
    input.checked ? selected.add(input.dataset.laptopSelect) : selected.delete(input.dataset.laptopSelect);
    status.textContent = ''; comparison.hidden = true; render();
  }));
  compare.addEventListener('click', () => showComparison(true));
  document.querySelector('[data-laptop-close]').addEventListener('click', () => { comparison.hidden = true; compare.focus(); });
  document.querySelector('[data-laptop-share]').addEventListener('click', async () => {
    const url = new URL('/laptops/', location.origin); url.searchParams.set('region', region); url.searchParams.set('compare', [...selected].join(','));
    const output = document.querySelector('[data-laptop-share-status]');
    try { await navigator.clipboard.writeText(url.href); output.textContent = 'Comparison link copied.'; } catch { output.textContent = 'Copy this comparison link: ' + url.href; }
  });
  document.querySelectorAll('.country-switch [data-region]').forEach(button => button.addEventListener('click', () => {
    if (!['CA','US'].includes(button.dataset.region) || button.dataset.region === region) return;
    region = button.dataset.region; selected.clear(); comparison.hidden = true; status.textContent = ''; render();
  }));
  document.querySelectorAll('.laptop-photo img').forEach(image => image.addEventListener('error', () => { image.hidden = true; const label = document.createElement('span'); label.className = 'laptop-no-photo'; label.textContent = 'Open the retailer listing for product photos.'; image.parentElement.append(label); }, { once: true }));
  render();
  fetch('/data/gaming-laptops.json').then(response => { if (!response.ok) throw Error('Unavailable'); return response.json(); }).then(data => {
    laptops = Array.isArray(data.laptops) ? data.laptops : [];
    selected = new Set(validSelection((params.get('compare') || '').split(','), laptops, region)); render(); if (selected.size >= 2) showComparison(false);
  }).catch(() => { status.textContent = 'Comparison is temporarily unavailable. The exact product listings remain usable.'; });
})(typeof window === 'undefined' ? globalThis : window);
