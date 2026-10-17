(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PCP_PARTS_IMPORT = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const MAX_BYTES = 32768, MAX_LINES = 50, MAX_LINE = 1200, MAX_INSTANCES = 99;
  const SLOTS = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan', 'cooler'];
  const MULTIPLE = new Set(['gpu', 'ram', 'ssd', 'hdd', 'fan']);
  const LABELS = { cpu: 'Processor', board: 'Motherboard', gpu: 'Graphics card', ram: 'Memory kit', ssd: 'SSD', hdd: 'Hard drive', psu: 'Power supply', case: 'Case', fan: 'Case fan', cooler: 'CPU cooler' };
  const PREFIXES = [
    ['cpu\\s+cooler|processor\\s+cooler|cooler|cooling', 'cooler'],
    ['case\\s+fans?|fans?', 'fan'], ['graphics\\s+cards?|video\\s+cards?|gpu', 'gpu'],
    ['motherboard|mainboard|board', 'board'], ['processor|cpu', 'cpu'],
    ['memory(?:\\s+kit)?|ram', 'ram'], ['solid[ -]state(?:\\s+drive)?|ssd|nvme', 'ssd'],
    ['hard\\s+(?:drive|disk)|hdd', 'hdd'], ['power\\s+supply|psu', 'psu'], ['pc\\s+case|case|chassis', 'case']
  ];
  const idOK = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value);
  const bytes = text => new TextEncoder().encode(text).byteLength;
  const clean = value => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, '').trim() : '';
  // Names may vary in typography. Numeric model tokens are never edited or guessed.
  const nameKey = value => clean(value).normalize('NFKC').toLowerCase().replace(/[™®]/g, '').replace(/(\d)\s+(gb|tb|mb|mhz|ghz)\b/g, '$1$2').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  // An MPN/SKU must match its complete punctuation and digits, apart from case.
  const skuKey = value => clean(value).normalize('NFKC').toUpperCase();
  const fullName = part => nameKey(part.name).startsWith(nameKey(part.brand) + ' ') ? part.name : [part.brand, part.name].filter(Boolean).join(' ');
  function strings(value) { return (Array.isArray(value) ? value : [value]).filter(item => typeof item === 'string' && item.trim() && item.length <= 240).slice(0, 16); }
  function catalogIndex(catalog) {
    if (!Array.isArray(catalog) || catalog.length > 5000) throw Error('Part choices are unavailable. Retry the page before importing.');
    const seen = new Set();
    return catalog.map(part => {
      if (!part || !idOK(part.id) || seen.has(part.id) || !SLOTS.includes(part.cat) || typeof part.name !== 'string' || !clean(part.name) || part.name.length > 300 || typeof part.brand !== 'string' || part.brand.length > 120) throw Error('Part choices have an invalid or duplicate identity. Retry the page.');
      seen.add(part.id);
      const identity = part.identity && typeof part.identity === 'object' && !Array.isArray(part.identity) ? part.identity : {};
      const skus = [...new Set(['sku', 'mpn', 'partNumber', 'manufacturerPartNumber'].flatMap(key => [...strings(part[key]), ...strings(identity[key])]).map(skuKey))];
      const names = [...new Set([part.name, fullName(part), ...strings(part.model), ...strings(part.aliases)].map(nameKey).filter(Boolean))];
      const searchable = [...names, nameKey([fullName(part), clean(part.summary)].join(' '))].map(text => new Set(text.split(' ')));
      return { part, skus, names, searchable };
    });
  }
  function candidate(entry, match) { return { id: entry.part.id, name: clean(entry.part.name), brand: clean(entry.part.brand), cat: entry.part.cat, sku: entry.skus[0] || null, match }; }
  function find(index, query, category = null, kind = null) {
    if (typeof query !== 'string' || query.length > MAX_LINE) throw Error('Use a model search shorter than 1,200 characters.');
    if (category !== null && !SLOTS.includes(category)) throw Error('Choose a supported component category.');
    const input = clean(query), key = nameKey(input), pool = category ? index.filter(entry => entry.part.cat === category) : index;
    if (!key || /(?:https?:\/\/|www\.)/i.test(input)) return { candidates: [], total: 0, reason: 'URLs are never opened. Type a model name, catalog ID or exact manufacturer part number.' };
    let exact = kind === 'sku' ? [] : pool.filter(entry => entry.part.id.toLowerCase() === input.toLowerCase()).map(entry => candidate(entry, 'catalog ID'));
    if (!exact.length && kind !== 'id') exact = pool.filter(entry => entry.skus.includes(skuKey(input))).map(entry => candidate(entry, 'exact SKU / part number'));
    if (!exact.length && !kind) exact = pool.filter(entry => entry.names.includes(key)).map(entry => candidate(entry, 'exact name / recorded alias'));
    let matches = exact;
    if (!matches.length && !kind && key.length >= 5) {
      const tokens = key.split(' ');
      matches = pool.filter(entry => entry.searchable.some(words => tokens.every(token => words.has(token)))).map(entry => candidate(entry, 'name contains all search terms'));
    }
    matches.sort((a, b) => fullName(a).localeCompare(fullName(b), 'en') || a.id.localeCompare(b.id));
    return { candidates: matches.slice(0, 40), total: matches.length, reason: matches.length > 40 ? 'More than 40 possible models. Add a brand, memory variant or exact SKU to narrow the list.' : matches.length ? 'Choose the exact model. A suggested match is not a confirmed installed part.' : kind ? 'That complete ID or SKU is not recorded. Check every character or select the exact model by name.' : 'No reliable match. Search the catalog manually or explicitly exclude this line.' };
  }
  function consumeQuantity(value) {
    let query = value.trim(), quantity = null;
    const start = query.match(/^(\d{1,4})\s*[x×]\s+(.+)$/i);
    // “2 x 16 GB” describes a memory layout, not two catalog memory kits.
    if (start && !/^\d+(?:\.\d+)?\s*(?:gb|tb|mb)\b/i.test(start[2])) { quantity = Number(start[1]); query = start[2].trim(); }
    const end = query.match(/^(.*?)\s+(?:\(\s*(?:qty|quantity)\s*[:=]?\s*(\d{1,4})\s*\)|(?:qty|quantity)\s*[:=]?\s*(\d{1,4})|[x×]\s+(\d{1,4}))$/i);
    if (end) {
      const trailing = Number(end[2] || end[3] || end[4]);
      if (quantity !== null && quantity !== trailing) throw Error('Conflicting quantities appear on the same line. Edit the pasted list.');
      quantity = trailing; query = end[1].trim();
    }
    if (quantity !== null && (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_INSTANCES)) throw Error('A line quantity must be from 1 to 99 catalog items.');
    return { query, quantity };
  }
  function parseText(text, catalog) {
    if (typeof text !== 'string' || bytes(text) > MAX_BYTES) throw Error('Paste a parts list no larger than 32 KiB.');
    if (/\u0000/.test(text)) throw Error('Paste plain text without null characters.');
    const raw = text.replace(/^\uFEFF/, '').split(/\r\n?|\n/);
    if (raw.length > MAX_LINES) throw Error('Use at most 50 lines, including blank lines.');
    const index = catalogIndex(catalog), rows = [];
    raw.forEach((original, number) => {
      if (!original.trim()) return;
      if (original.length > MAX_LINE) throw Error('Line ' + (number + 1) + ' exceeds 1,200 characters.');
      let query = clean(original).replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, ''), quantity = null, requested = null;
      const leading = consumeQuantity(query); query = leading.query; quantity = leading.quantity;
      for (const [prefix, slot] of PREFIXES) {
        const match = query.match(new RegExp('^(?:\\[\\s*(?:' + prefix + ')\\s*\\]\\s*:?|(?:' + prefix + ')\\s*[:|]\\s*|(?:' + prefix + ')\\s+-\\s+)', 'i'));
        if (match) { requested = slot; query = query.slice(match[0].length).trim(); break; }
      }
      const inner = consumeQuantity(query); query = inner.query;
      if (quantity !== null && inner.quantity !== null && quantity !== inner.quantity) throw Error('Line ' + (number + 1) + ' has conflicting quantities.');
      quantity = inner.quantity ?? quantity ?? 1;
      const qualifier = query.match(/^(sku|mpn|manufacturer\s+part\s+number|part\s+number|id|catalog\s+id)\s*[:=]\s*(.*)$/i);
      const kind = qualifier ? /id$/i.test(qualifier[1]) ? 'id' : 'sku' : null;
      if (qualifier) query = qualifier[2].trim();
      const result = find(index, query, requested, kind);
      rows.push({ key: 'line-' + (number + 1), line: number + 1, original: clean(original), query, requested, quantity, kind, ...result, status: result.total === 1 ? 'needs_confirmation' : result.total ? 'ambiguous' : 'unresolved' });
    });
    return rows;
  }
  function search(catalog, query, category = null) {
    const qualifier = clean(query).match(/^(sku|mpn|manufacturer\s+part\s+number|part\s+number|id|catalog\s+id)\s*[:=]\s*(.*)$/i);
    return find(catalogIndex(catalog), qualifier ? qualifier[2] : query, category, qualifier ? /id$/i.test(qualifier[1]) ? 'id' : 'sku' : null);
  }
  function inventoryFingerprint(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).some(slot => !SLOTS.includes(slot))) throw Error('Current inventory is unavailable.');
    let count = 0;
    const rows = SLOTS.map(slot => { const values = raw[slot] ?? []; if (!Array.isArray(values) || values.some(id => !idOK(id)) || values.length > MAX_INSTANCES) throw Error('Current inventory is invalid.'); count += values.length; return [slot, [...values]]; });
    if (count > MAX_INSTANCES) throw Error('Current inventory exceeds 99 component instances.');
    return JSON.stringify(Object.fromEntries(rows));
  }
  function inventoryChanges(before, after) {
    inventoryFingerprint(before); inventoryFingerprint(after);
    const added = [], removed = [];
    for (const slot of SLOTS) {
      const quantities = values => values.reduce((map, id) => map.set(id, (map.get(id) || 0) + 1), new Map());
      const old = quantities(before[slot] || []), next = quantities(after[slot] || []);
      for (const id of new Set([...old.keys(), ...next.keys()])) {
        const difference = (next.get(id) || 0) - (old.get(id) || 0);
        if (difference) (difference > 0 ? added : removed).push({ cat: slot, id, quantity: Math.abs(difference) });
      }
    }
    return { added, removed };
  }
  function review(rows, decisions, catalog) {
    if (!Array.isArray(rows) || !rows.length || rows.length > MAX_LINES || !Array.isArray(decisions) || decisions.length !== rows.length) throw Error('Review every pasted line before replacing the inventory.');
    const byId = new Map(catalogIndex(catalog).map(entry => [entry.part.id, entry.part])), parts = Object.fromEntries(SLOTS.map(slot => [slot, []])), excluded = [], selected = [];
    let total = 0;
    rows.forEach((row, index) => {
      const choice = decisions[index];
      if (!choice || choice.key !== row.key || !['model', 'exclude'].includes(choice.action)) throw Error('Line ' + row.line + ': choose an exact model or explicitly exclude this line.');
      if (choice.action === 'exclude') { excluded.push({ line: row.line, original: row.original }); return; }
      const part = byId.get(choice.id), quantity = typeof choice.quantity === 'number' || typeof choice.quantity === 'string' && /^\d{1,2}$/.test(choice.quantity) ? Number(choice.quantity) : NaN;
      if (!part) throw Error('Line ' + row.line + ': choose a currently available exact catalog model.');
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_INSTANCES) throw Error('Line ' + row.line + ': enter a whole quantity from 1 to 99.');
      if (!MULTIPLE.has(part.cat) && parts[part.cat].length + quantity > 1) throw Error('Line ' + row.line + ': this inventory supports one ' + LABELS[part.cat].toLowerCase() + '. Resolve the duplicate or change the quantity.');
      total += quantity;
      if (total > MAX_INSTANCES) throw Error('Use no more than 99 component instances in one inventory.');
      parts[part.cat].push(...Array(quantity).fill(part.id));
      selected.push({ line: row.line, id: part.id, cat: part.cat, name: fullName(part), quantity });
    });
    if (!total) throw Error('Choose at least one exact model. An entirely excluded list cannot clear your existing inventory.');
    return { parts, selected, excluded, total };
  }
  function attach({ form, target, upgrade, document: doc = globalThis.document, status = () => {} }) {
    if (!form || !target || !doc || !upgrade) return null;
    let staged = null;
    const node = (tag, text, attributes = {}) => {
      const result = doc.createElement(tag); if (text !== null && text !== undefined) result.textContent = text;
      for (const [name, value] of Object.entries(attributes)) if (name === 'class') result.className = value; else result.setAttribute(name, String(value));
      return result;
    };
    const message = text => { target.querySelector('[data-parts-import-status]')?.replaceChildren(doc.createTextNode ? doc.createTextNode(text) : node('span', text)); status(text); };
    const options = (select, matches, previous = '') => {
      select.replaceChildren(node('option', 'Choose an exact model or exclude this line', { value: '' }));
      for (const item of matches) select.append(node('option', [fullName(item), LABELS[item.cat], item.sku ? 'SKU ' + item.sku : 'ID ' + item.id].join(' · '), { value: item.id }));
      select.append(node('option', 'Exclude this line from installed inventory', { value: '@exclude' }));
      select.value = matches.some(item => item.id === previous) || previous === '@exclude' ? previous : '';
    };
    function cancel() { staged = null; target.replaceChildren(); status('Pasted-list review cancelled. Your entered inventory and open plan were not changed.'); form.elements.parts?.focus?.(); }
    function renderPreview() {
      try {
        if (!staged) throw Error('Paste a list to begin.');
        const current = upgrade.inventory();
        if (inventoryFingerprint(current) !== staged.expected) throw Error('Your inventory changed during this review. Find model matches again before replacing it.');
        const proposal = review(staged.rows, staged.controls.map(({ row, choice, quantity }) => ({ key: row.key, action: choice.value === '@exclude' ? 'exclude' : choice.value ? 'model' : '', id: choice.value, quantity: quantity.value })), upgrade.catalog());
        staged.proposal = proposal;
        const preview = staged.preview; preview.replaceChildren(); preview.hidden = false;
        const title = node('h3', 'Replace your entered inventory?', { tabindex: '-1' });
        preview.append(title, node('p', 'This replaces all entered part categories with the exact models below. Your budget, goals and private notes stay as they are. Create the reuse plan afterwards to run compatibility checks.'));
        const table = node('table', null, { class: 'program-table' }), caption = node('caption', 'Confirmed replacement: ' + proposal.total + ' component instances'), head = node('thead'), header = node('tr'), body = node('tbody');
        for (const text of ['Category', 'Exact model', 'Quantity']) header.append(node('th', text, { scope: 'col' }));
        head.append(header);
        for (const item of proposal.selected) { const row = node('tr'); row.append(node('th', LABELS[item.cat], { scope: 'row' }), node('td', item.name), node('td', String(item.quantity))); body.append(row); }
        table.append(caption, head, body); const scroll = node('div', null, { class: 'table-scroll' }); scroll.append(table); preview.append(scroll);
        const beforeCount = SLOTS.reduce((sum, slot) => sum + (current[slot]?.length || 0), 0);
        preview.append(node('p', beforeCount + ' currently entered → ' + proposal.total + ' after replacement. ' + proposal.excluded.length + ' pasted lines excluded.'));
        const changes = inventoryChanges(current, proposal.parts);
        if (changes.removed.length) {
          const names = new Map(upgrade.catalog().map(part => [part.id, fullName(part)])), removed = node('ul'), details = node('details');
          details.append(node('summary', 'Parts removed from the entered inventory'));
          for (const item of changes.removed) removed.append(node('li', item.quantity + ' × ' + (names.get(item.id) || item.id) + ' · ' + LABELS[item.cat]));
          details.append(removed); preview.append(details);
        }
        if (proposal.excluded.length) { const details = node('details'), list = node('ul'); details.append(node('summary', 'Excluded lines — not installed hardware')); for (const item of proposal.excluded) list.append(node('li', 'Line ' + item.line + ': ' + item.original)); details.append(list); preview.append(details); }
        const label = node('label', null, { class: 'cpi-confirm' }), confirmed = node('input', null, { type: 'checkbox' }); label.append(confirmed, node('span', 'I checked these exact models and quantities. Replace my entered inventory.')); preview.append(label);
        const actions = node('div', null, { class: 'program-actions' }), apply = node('button', 'Replace entered inventory', { type: 'button', class: 'button primary' }), back = node('button', 'Back to model choices', { type: 'button', class: 'button secondary' }); apply.disabled = true;
        confirmed.addEventListener('change', () => { apply.disabled = !confirmed.checked; });
        back.addEventListener('click', () => { preview.replaceChildren(); preview.hidden = true; staged.proposal = null; staged.controls[0]?.choice.focus?.(); });
        apply.addEventListener('click', () => {
          if (!confirmed.checked || !staged || staged.proposal !== proposal) return;
          try {
            const fresh = review(staged.rows, staged.controls.map(({ row, choice, quantity }) => ({ key: row.key, action: choice.value === '@exclude' ? 'exclude' : choice.value ? 'model' : '', id: choice.value, quantity: quantity.value })), upgrade.catalog());
            if (JSON.stringify(fresh.parts) !== JSON.stringify(proposal.parts)) throw Error('Your choices changed. Review the replacement again.');
            upgrade.applyConfirmedInventory(fresh.parts, staged.expected); staged = null; target.replaceChildren();
            const text = 'Entered inventory replaced with ' + fresh.total + ' confirmed component instances. ' + fresh.excluded.length + ' lines excluded. Create the reuse plan to check compatibility.';
            target.append(node('p', text, { role: 'status' }));
            if (fresh.excluded.length) { const details = node('details'), list = node('ul'); details.append(node('summary', 'Excluded lines — absent from the inventory and checks')); for (const item of fresh.excluded) list.append(node('li', 'Line ' + item.line + ': ' + item.original)); details.append(list); target.append(details); }
            status(text); doc.querySelector('[data-upgrade-form]')?.querySelector('button[type="submit"]')?.focus?.();
          } catch (error) { message(error.message); }
        });
        actions.append(apply, back); preview.append(actions); title.focus?.(); message('Check the replacement summary, then confirm to apply it.');
      } catch (error) { message(error.message); }
    }
    function begin(event) {
      event.preventDefault();
      try {
        const current = upgrade.inventory();
        if (!current) throw Error('Wait for part choices to load before reviewing a list.');
        const catalog = upgrade.catalog(), rows = parseText(form.elements.parts?.value || '', catalog);
        if (!rows.length) throw Error('Paste one component per line to begin.');
        const expected = inventoryFingerprint(current); target.replaceChildren();
        target.append(node('h3', 'Review every pasted line'), node('p', 'Nothing has changed yet. Choose an exact model for each line, or exclude it. Quantities count catalog items: one memory kit can contain several modules.'));
        const statusNode = node('p', '', { role: 'status', 'data-parts-import-status': '' }); target.append(statusNode);
        const controls = [];
        const preview = node('section', null, { class: 'program-match cpi-preview', 'aria-label': 'Inventory replacement confirmation' }); preview.hidden = true;
        staged = { rows, controls, expected, preview, proposal: null };
        for (const row of rows) {
          const group = node('fieldset', null, { class: 'program-match cpi-line' }); group.append(node('legend', 'Line ' + row.line + (row.requested ? ' · ' + LABELS[row.requested] : '')), node('p', row.original, { class: 'cpi-original' }), node('p', row.reason));
          const fields = node('div', null, { class: 'program-form' }), modelLabel = node('label', 'Inventory decision', { class: 'program-full' }), choice = node('select', null, { 'aria-label': 'Exact model or exclude line ' + row.line }), quantityLabel = node('label', 'Catalog-item quantity'), quantity = node('input', null, { type: 'number', min: '1', max: '99', step: '1', 'aria-label': 'Catalog-item quantity for line ' + row.line }); quantity.value = String(row.quantity); options(choice, row.candidates); modelLabel.append(choice); quantityLabel.append(quantity); fields.append(modelLabel, quantityLabel); group.append(fields);
          const details = node('details'), searchForm = node('div', null, { class: 'program-form' }), categoryLabel = node('label', 'Search category'), category = node('select'), inputLabel = node('label', 'Model name, catalog ID or exact SKU'), input = node('input', null, { type: 'search', maxlength: String(MAX_LINE), autocomplete: 'off', 'aria-label': 'Search catalog for line ' + row.line }), searchButton = node('button', 'Find exact model choices', { type: 'button', class: 'button secondary' }), feedback = node('p', '', { role: 'status' });
          category.append(node('option', 'All component categories', { value: '' })); for (const slot of SLOTS) category.append(node('option', LABELS[slot], { value: slot })); category.value = row.requested || ''; input.value = row.query;
          categoryLabel.append(category); inputLabel.append(input); searchForm.append(categoryLabel, inputLabel, searchButton); details.append(node('summary', 'Search the catalog or choose a different model'), searchForm, feedback); group.append(details);
          const stale = () => { if (!staged) return; staged.proposal = null; preview.replaceChildren(); preview.hidden = true; };
          choice.addEventListener('change', () => { quantity.disabled = choice.value === '@exclude'; stale(); }); quantity.addEventListener('input', stale);
          const runSearch = () => { try { const found = search(upgrade.catalog(), input.value, category.value || null); options(choice, found.candidates, choice.value); quantity.disabled = choice.value === '@exclude'; feedback.textContent = found.total + ' candidate models. ' + found.reason; stale(); choice.focus?.(); } catch (error) { feedback.textContent = error.message; } };
          searchButton.addEventListener('click', runSearch); input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); runSearch(); } });
          controls.push({ row, choice, quantity }); target.append(group);
        }
        const actions = node('div', null, { class: 'program-actions' }), check = node('button', 'Review replacement inventory', { type: 'button', class: 'button primary' }), stop = node('button', 'Cancel review', { type: 'button', class: 'button secondary' }); check.addEventListener('click', renderPreview); stop.addEventListener('click', cancel); actions.append(check, stop); target.append(actions, preview); status('Pasted list is ready for review. No inventory was changed.');
      } catch (error) { staged = null; target.replaceChildren(node('p', error.message, { role: 'status' })); status(error.message); }
    }
    form.addEventListener('submit', begin);
    return { cancel, preview: renderPreview, pending: () => staged ? { rows: staged.rows.length, expected: staged.expected, confirmed: false } : null };
  }
  return { MAX_BYTES, MAX_LINES, MAX_INSTANCES, SLOTS, LABELS, nameKey, skuKey, parseText, search, review, inventoryFingerprint, inventoryChanges, attach };
});
