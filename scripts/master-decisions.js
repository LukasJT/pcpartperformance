(function (factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./compatibility-evidence.cjs') : globalThis.PCP_BUILD_RULES);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.PCP_MASTER_DECISIONS = api;
})(function (rules) {
  'use strict';
  const KEY = 'pcp-decision-handoff-v1', TTL = 2 * 60 * 60 * 1000;
  const SLOTS = rules?.SLOTS || ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan', 'cooler'];
  const NAMES = { cpu: 'Processor', board: 'Motherboard', gpu: 'Graphics card', ram: 'Memory', ssd: 'SSD', hdd: 'Hard drive', psu: 'Power supply', case: 'Case', fan: 'Case fans', cooler: 'CPU cooler' };
  const QUOTE_ITEMS = ['cpu', 'board', 'ram', 'cooler', 'gpu', 'storage', 'psu', 'case', 'os', 'accessories', 'shipping', 'tax'];
  const PART_COSTS = ['cpu', 'board', 'ram', 'cooler', 'gpu', 'storage', 'psu', 'case', 'accessories'];
  const idOK = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value);
  const text = (value, limit = 160) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit) : '';
  const regionOK = region => region === 'CA' || region === 'US';
  const selectedIDs = row => Array.isArray(row?.ids) ? row.ids : row?.id ? [row.id] : [];
  const originIDs = row => Array.isArray(row?.originIds) ? row.originIds : row?.originId ? [row.originId] : [];
  const unchanged = row => selectedIDs(row).length > 0 && [...selectedIDs(row)].sort().join('|') === [...originIDs(row)].sort().join('|');
  function amount(value) {
    if (!['string', 'number'].includes(typeof value) || typeof value === 'string' && !value.trim()) return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 1000000 ? Math.round((n + Number.EPSILON) * 100) / 100 : null;
  }
  function sanitizeContext(raw, now = Date.now()) {
    if (typeof raw === 'string') { if (raw.length > 12000) return null; try { raw = JSON.parse(raw); } catch { return null; } }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schema !== 1 || !regionOK(raw.region) || !Number.isFinite(raw.createdAt) || raw.createdAt > now + 60000 || now - raw.createdAt > TTL) return null;
    const context = { schema: 1, kind: raw.kind, createdAt: raw.createdAt, region: raw.region, currency: raw.region === 'US' ? 'USD' : 'CAD', budget: amount(raw.budget) };
    if (raw.kind === 'upgrade') {
      if (!Array.isArray(raw.parts) || raw.parts.length < 8 || raw.parts.length > SLOTS.length || raw.parts.some(p => !p || !SLOTS.includes(p.slot)) || new Set(raw.parts.map(p => p.slot)).size !== raw.parts.length || SLOTS.slice(0, 8).some(slot => !raw.parts.some(p => p.slot === slot))) return null;
      context.parts = [];
      for (const slot of SLOTS) {
        const p = raw.parts.find(row => row?.slot === slot) || { slot, id: '', originId: '', name: '', decision: 'verify' };
        if (!['keep', 'replace', 'verify'].includes(p.decision) || p.id && !idOK(p.id) || p.originId && !idOK(p.originId) || p.ids !== undefined && (!Array.isArray(p.ids) || p.ids.length > 99 || p.ids.some(id => !idOK(id))) || p.originIds !== undefined && (!Array.isArray(p.originIds) || p.originIds.length > 99 || p.originIds.some(id => !idOK(id)))) return null;
        const ids = selectedIDs(p), origins = originIDs(p);
        if (p.id && ids[0] !== p.id || p.originId && origins[0] !== p.originId) return null;
        context.parts.push({ slot, id: ids[0] || '', originId: origins[0] || '', ids: [...ids], originIds: [...origins], name: text(p.name), decision: unchanged(p) ? p.decision : p.decision === 'keep' ? 'verify' : p.decision });
      }
      if (context.parts.reduce((sum, p) => sum + p.ids.length, 0) > 99 || context.parts.reduce((sum, p) => sum + p.originIds.length, 0) > 99) return null;
      context.goal = ['diagnose', 'gaming', 'capacity', 'creator'].includes(raw.goal) ? raw.goal : 'diagnose';
      context.symptom = ['none', 'low-fps', 'stutter', 'memory', 'storage', 'driver'].includes(raw.symptom) ? raw.symptom : 'none';
      context.scenario = ['custom', 'diagnose', 'single', 'platform'].includes(raw.scenario) ? raw.scenario : 'custom';
      if (JSON.stringify(context).length > 12000) return null;
      return context;
    }
    if (raw.kind === 'prebuilt') { if (!idOK(raw.systemId)) return null; context.systemId = raw.systemId; return context; }
    if (raw.kind === 'diy-quote') {
      if (!raw.quote || ['parts', 'os', 'delivery'].some(key => amount(raw.quote[key]) === null)) return null;
      context.name = text(raw.name, 60) || 'DIY quote';
      context.quote = Object.fromEntries(['parts', 'os', 'delivery'].map(key => [key, amount(raw.quote[key])]));
      if (idOK(raw.systemId)) context.systemId = raw.systemId;
      return context;
    }
    return null;
  }
  function ownedForWorksheet(parts) {
    // Combined storage and case/fans categories cannot be certified by one inventory entry.
    return Object.fromEntries(['cpu', 'board', 'gpu', 'ram', 'psu'].map(slot => {
      const p = parts.find(row => row.slot === slot);
      return [slot, Boolean(unchanged(p) && p.decision === 'keep')];
    }));
  }
  function scenarioParts(parts, scenario, selectedSlot = 'cpu') {
    return parts.map(p => ({ ...p, decision: !selectedIDs(p).length ? 'verify' : !unchanged(p) ? 'replace' : scenario === 'platform' && ['cpu', 'board', 'ram'].includes(p.slot) || scenario === 'single' && p.slot === selectedSlot ? 'replace' : 'keep' }));
  }
  function decisionAdvice({ goal, symptom, budget }, notes = '') {
    const advice = {
      diagnose: ['Start with the current PC', 'Record a repeatable symptom and try a supported configuration check before deciding to buy.'],
      gaming: ['Define the game experience you want', 'Compare the same game version, scene, resolution and settings. A component selection alone cannot establish a target FPS or an upgrade gain.'],
      capacity: ['Confirm which capacity is running out', 'Record application memory use or free drive space. More capacity answers a capacity problem; it does not establish a universal speed improvement.'],
      creator: ['Use the application’s actual workload', 'Check the exact application/version requirements and a representative project before choosing a CPU, GPU or memory change.']
    }[goal] || ['Record the workload', 'Use exact requirements and comparable observations before purchasing.'];
    return { title: advice[0], next: advice[1], symptom: symptom !== 'none' ? symptom : null, budget: amount(budget), workload: text(notes, 200) };
  }
  function quoteForTransfer(values, side) {
    if (!['a', 'b'].includes(side) || !values || !regionOK(values.region)) return { ok: false, missing: QUOTE_ITEMS, reason: 'Choose one country and currency for the worksheet.' };
    const costs = {}, missing = [];
    for (const item of QUOTE_ITEMS) {
      const owned = values[side + '-' + item + '-owned'] === true;
      const n = owned ? 0 : amount(values[side + '-' + item]);
      if (n === null) missing.push(item); else costs[item] = Math.round(n * 100);
    }
    if (missing.length) return { ok: false, missing, reason: missing.length + ' required costs remain unknown. Enter a quote or explicitly mark owned / not needed.' };
    const quote = { parts: PART_COSTS.reduce((sum, key) => sum + costs[key], 0) / 100, os: costs.os / 100, delivery: (costs.shipping + costs.tax) / 100 };
    if (Object.values(quote).some(value => amount(value) === null)) return { ok: false, missing: [], reason: 'A subtotal exceeds the Build vs Buy worksheet’s supported limit of 1,000,000. Keep this detailed worksheet instead.' };
    return { ok: true, missing: [], quote, total: Math.round(Object.values(quote).reduce((sum, value) => sum + Math.round(value * 100), 0)) / 100 };
  }
  function disclosures(system) {
    const labels = { board: 'Motherboard', psu: 'Power supply', ramLayout: 'Memory layout', cooling: 'Cooling', warranty: 'Warranty', returns: 'Returns', seller: 'Seller' };
    const listed = [], unresolved = [];
    for (const [key, label] of Object.entries(labels)) {
      const value = text(system?.[key], 300);
      if (!value) unresolved.push({ label, value: 'Not disclosed in the researched record.' });
      else if (/not verified|may vary|not disclosed|check (?:policy|exclusions)|chipset;/i.test(value)) unresolved.push({ label, value });
      else listed.push({ label, value });
    }
    return { listed, unresolved };
  }
  const money = (value, region) => new Intl.NumberFormat(region === 'US' ? 'en-US' : 'en-CA', { style: 'currency', currency: region === 'US' ? 'USD' : 'CAD', currencyDisplay: 'code' }).format(value);

  function mount(doc = globalThis.document) {
    if (!doc?.querySelector('[data-master-decisions-page]') || doc.documentElement.dataset.masterDecisionsMounted) return;
    doc.documentElement.dataset.masterDecisionsMounted = 'true';
    const $ = selector => doc.querySelector(selector), all = (selector, scope = doc) => [...scope.querySelectorAll(selector)];
    const el = (tag, value, attrs = {}) => { const node = doc.createElement(tag); if (value !== undefined) node.textContent = value; for (const [key, val] of Object.entries(attrs)) node.setAttribute(key, String(val)); return node; };
    const say = (selector, value) => { const target = $(selector); if (target) target.textContent = value; };
    const session = () => globalThis.sessionStorage;
    const read = () => { try { return sanitizeContext(session().getItem(KEY)); } catch { return null; } };
    const clear = () => { try { session().removeItem(KEY); } catch {} };
    function save(context, status) {
      const validated = sanitizeContext(context);
      if (!validated) { say(status, 'This context could not be carried. Continue with a new manual worksheet.'); return false; }
      try { session().setItem(KEY, JSON.stringify(validated)); return true; }
      catch { say(status, 'Tab storage is unavailable. The destination still works; enter your choices there manually.'); return false; }
    }
    const setRegion = region => { const button = $(`button[data-region="${region}"]`); if (button) button.click(); };
    function contextSummary(target, context) {
      target.replaceChildren();
      const title = context.kind === 'upgrade' ? 'Your reuse choices' : context.kind === 'prebuilt' ? 'A specific prebuilt configuration' : context.name;
      target.append(el('p', title));
      const list = el('ul', undefined, { class: 'md-context-summary' });
      list.append(el('li', context.region === 'CA' ? 'Canada · CAD' : 'United States · USD'));
      if (context.budget !== null) list.append(el('li', 'New spending limit: ' + money(context.budget, context.region)));
      if (context.kind === 'upgrade') {
        for (const choice of ['keep', 'replace', 'verify']) list.append(el('li', context.parts.filter(p => p.decision === choice).length + ' component categories: ' + choice));
        target.append(list, el('p', 'Inventory and choices are carried through this browser tab. Private workload notes are not transferred.'));
        const parts = el('ul');
        for (const p of context.parts) parts.append(el('li', NAMES[p.slot] + ': ' + (p.name || 'unknown / not selected') + ' · ' + p.decision + (p.originId && p.id !== p.originId ? ' (new phase; original owned ID: ' + p.originId + ')' : '')));
        target.append(parts);
      } else { target.append(list); }
    }

    const upgrade = $('[data-master-upgrade]'), upgradeForm = $('[data-upgrade-form]');
    if (upgrade && upgradeForm) {
      let state = null, dirty = false;
      const selected = slot => {
        const control = upgradeForm.elements[slot], snapshot = window.PCP_UPGRADE?.snapshot?.(), catalog = window.PCP_UPGRADE?.catalog?.() || [];
        const ids = snapshot?.parts?.[slot] || (idOK(control?.value) ? [control.value] : []), origins = snapshot?.baseline?.[slot] || [...ids];
        const names = ids.map(id => { const part = catalog.find(row => row.id === id); return part ? text(part.name.toLowerCase().startsWith(String(part.brand || '').toLowerCase() + ' ') ? part.name : [part.brand, part.name].filter(Boolean).join(' ')) : text(control?.selectedOptions?.[0]?.textContent || id); });
        return { id: ids[0] || '', originId: origins[0] || '', ids: [...ids], originIds: [...origins], name: text(names.join(' + '), 160) };
      };
      function renderParts() {
        const box = $('[data-master-part-decisions]'); box.replaceChildren();
        for (const p of state.parts) {
          const fieldset = el('fieldset', undefined, { class: 'md-part-row' });
          fieldset.append(el('legend', NAMES[p.slot]), el('p', p.id ? p.name : 'Unknown / not selected', { class: 'md-part-name' }));
          const choices = el('div', undefined, { class: 'md-row-choices' });
          for (const choice of ['keep', 'replace', 'verify']) {
            const label = el('label'), input = el('input', undefined, { type: 'radio', name: 'decision-' + p.slot, value: choice });
            input.checked = p.decision === choice;
            input.disabled = choice === 'keep' && !unchanged(p);
            input.addEventListener('change', () => { p.decision = choice; state.scenario = 'custom'; renderScenario(); say('[data-master-upgrade-status]', 'Reuse choices updated. Compatibility must still be checked for the exact replacement.'); });
            label.append(input, el('span', choice === 'keep' ? 'Keep' : choice === 'replace' ? 'Replace' : 'Verify'));
            choices.append(label);
          }
          fieldset.append(choices); box.append(fieldset);
        }
      }
      function renderScenario() { all('[data-master-scenario]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.masterScenario === state?.scenario))); }
      function renderGoal() {
        const advice = decisionAdvice(state, upgradeForm.elements.notes?.value), box = $('[data-master-goal]');
        box.replaceChildren(el('strong', advice.title), el('p', advice.next));
        if (advice.workload) box.append(el('p', 'Your workload: ' + advice.workload));
        box.append(el('p', advice.budget === null ? 'Set a spending limit if you want the quote worksheet to check it.' : 'Compare complete new spending with ' + money(advice.budget, state.region) + '. No retailer price is inferred.'));
        if (advice.symptom) box.append(el('a', 'Start with safe symptom checks', { href: '/troubleshooting/?symptom=' + advice.symptom }));
      }
      const context = () => ({ ...state, createdAt: Date.now() });
      function captureUpgrade() {
        // The existing controller runs first and owns catalog validation/readiness.
        if (window.PCP_UPGRADE && !window.PCP_UPGRADE.snapshot()?.ready || SLOTS.some(slot => upgradeForm.elements[slot]?.disabled) || !$('[data-upgrade-readiness]')) { state = null; upgrade.hidden = true; return; }
        state = { schema: 1, kind: 'upgrade', region: upgradeForm.elements.region.value === 'US' ? 'US' : 'CA', budget: amount(upgradeForm.elements.budget.value), goal: upgradeForm.elements.goal.value, symptom: upgradeForm.elements.symptom.value, scenario: 'custom', parts: SLOTS.map(slot => ({ slot, ...selected(slot), decision: 'verify' })) };
        dirty = false; upgrade.hidden = false; renderGoal(); renderParts(); renderScenario();
        say('[data-master-upgrade-status]', 'Choose reuse decisions, or use a starting scenario. Unknown parts cannot be marked owned.');
      }
      upgradeForm.addEventListener('submit', captureUpgrade);
      doc.addEventListener('pcp:upgrade-plan', captureUpgrade);
      for (const type of ['input', 'change']) upgradeForm.addEventListener(type, () => { if (!state) return; dirty = true; upgrade.hidden = true; say('[data-upgrade-status]', 'Planning inputs changed. Create the reuse plan again before carrying choices into a worksheet.'); });
      $('[data-master-reuse]').addEventListener('submit', event => event.preventDefault());
      all('[data-master-scenario]').forEach(button => button.addEventListener('click', () => {
        if (!state || dirty) return;
        state.scenario = button.dataset.masterScenario;
        state.parts = scenarioParts(state.parts, state.scenario, $('[data-upgrade-change]')?.elements.slot?.value);
        renderParts(); renderScenario();
        say('[data-master-upgrade-status]', state.scenario === 'single' ? 'A known part selected in “Component to change” is marked replace; unresolved selections still need verification. Pick its exact replacement and recheck it; this scenario does not install a new part.' : state.scenario === 'platform' ? 'Known CPU, board and memory selections are marked replace; unresolved selections still need verification. Review cooling, cables, operating system and other dependencies; this is a purchase scenario, not a recommendation.' : 'Known owned parts are marked keep. Investigate the symptom first; doing nothing can be a valid outcome.');
      }));
      const phase = $('[data-upgrade-phase]');
      if (phase) phase.addEventListener('click', () => {
        const before = $('[data-upgrade-phases]')?.childElementCount || 0, change = $('[data-upgrade-change]'), slot = change.elements.slot.value, option = change.elements.replacement;
        const id = option.value, name = text(option.selectedOptions?.[0]?.textContent);
        Promise.resolve().then(() => {
          if (!state || dirty || !SLOTS.includes(slot) || !idOK(id) || ($('[data-upgrade-phases]')?.childElementCount || 0) <= before) return;
          const carried = selected(slot);
          state.parts = state.parts.map(p => p.slot === slot ? { ...p, ...carried, name: carried.name || name, decision: 'replace' } : p);
          state.scenario = 'custom'; renderParts(); renderScenario();
          say('[data-master-upgrade-status]', 'Applied phase carried into the purchase scenario. The replacement is a new purchase, not an owned part.');
        });
      }, { capture: true });
      for (const [selector, status] of [['[data-master-upgrade-cost]', '[data-master-upgrade-status]'], ['[data-master-upgrade-prebuilt]', '[data-master-upgrade-status]']]) {
        $(selector).addEventListener('click', event => { if (!state || dirty) { event.preventDefault(); say(status, 'Create the reuse plan again first.'); return; } if (!save(context(), status)) event.preventDefault(); });
      }
      doc.addEventListener('click', event => {
        const button = event.target.closest?.('button[data-region]');
        if (button && regionOK(button.dataset.region) && upgradeForm.elements.region.value !== button.dataset.region) { upgradeForm.elements.region.value = button.dataset.region; upgradeForm.elements.region.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }

    const lab = $('[data-master-lab-context]'), labForm = $('#budget-build-form');
    if (lab && labForm) {
      let incoming = read();
      if (incoming && ['upgrade', 'prebuilt'].includes(incoming.kind)) { lab.hidden = false; contextSummary($('[data-master-lab-summary]'), incoming); }
      $('[data-master-lab-apply]').addEventListener('click', () => {
        if (!incoming) return;
        setRegion(incoming.region);
        labForm.elements.region.value = incoming.region;
        labForm.elements.budget.value = incoming.budget === null ? '' : String(incoming.budget);
        for (const side of ['a', 'b']) {
          for (const item of QUOTE_ITEMS) { labForm.elements[side + '-' + item].value = ''; const owned = labForm.querySelector(`[data-quote-owned="${side}-${item}"]`); if (owned) owned.checked = false; }
        }
        if (incoming.kind === 'upgrade') {
          const kept = ownedForWorksheet(incoming.parts);
          labForm.elements.nameA.value = 'Keep current PC';
          labForm.elements.nameB.value = incoming.scenario === 'platform' ? 'Change platform' : incoming.scenario === 'single' ? 'Change selected part' : 'My upgrade scenario';
          for (const side of ['a', 'b']) for (const slot of Object.keys(kept)) {
            const part = incoming.parts.find(p => p.slot === slot), owned = labForm.querySelector(`[data-quote-owned="${side}-${slot}"]`);
            if (owned) owned.checked = side === 'a' ? Boolean(part?.originId) : kept[slot];
          }
        } else { labForm.elements.nameA.value = 'DIY alternative'; labForm.elements.nameB.value = 'Another DIY option'; }
        labForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        clear(); say('[data-master-lab-status]', 'New comparison started in ' + incoming.currency + '. Old quotes cleared. Confirm combined storage, case/fans, cooling and all required extras before comparing complete costs.');
      });
      all('[data-master-quote-side]').forEach(link => link.addEventListener('click', event => {
        const values = { region: labForm.elements.region.value };
        for (const side of ['a', 'b']) for (const item of QUOTE_ITEMS) { values[side + '-' + item] = labForm.elements[side + '-' + item].value; values[side + '-' + item + '-owned'] = labForm.querySelector(`[data-quote-owned="${side}-${item}"]`)?.checked === true; }
        const result = quoteForTransfer(values, link.dataset.masterQuoteSide);
        if (!result.ok) { event.preventDefault(); say('[data-master-transfer-status]', result.reason); return; }
        const context = { schema: 1, kind: 'diy-quote', createdAt: Date.now(), region: values.region, budget: labForm.elements.budget.value, name: labForm.elements[link.dataset.masterQuoteSide === 'a' ? 'nameA' : 'nameB'].value, quote: result.quote, systemId: incoming?.kind === 'prebuilt' ? incoming.systemId : undefined };
        if (!save(context, '[data-master-transfer-status]')) event.preventDefault();
      }));
    }

    let systems = [], chosen = null, pending = read(), buyApplied = false;
    const prebuilt = $('[data-master-prebuilt]'), buyContext = $('[data-master-buy-context]'), buyForm = $('[data-buy-worksheet]');
    if (prebuilt) {
      try { const raw = JSON.parse($('[data-master-system-data]').textContent); if (raw.schema === 1 && Array.isArray(raw.systems) && raw.systems.length <= 100) systems = raw.systems.filter(p => idOK(p?.id) && regionOK(p.region) && typeof p.name === 'string'); } catch {}
      const picker = $('[data-master-system]');
      const pick = id => systems.find(p => p.id === id) || null;
      chosen = pick(prebuilt.dataset.masterSystemId || (pending?.systemId ?? ''));
      if (picker && chosen) picker.value = chosen.id;
      function renderSystem() {
        const target = $('[data-master-system-evidence]'); target.replaceChildren();
        if (!chosen) { target.append(el('p', 'Choose an exact configuration to inspect its disclosures.')); return; }
        const overview = el('div', undefined, { class: 'md-system-overview' });
        overview.append(el('h3', chosen.name + ' · ' + (chosen.model || chosen.sku)), el('p', (chosen.region === 'CA' ? 'Canada · CAD' : 'United States · USD') + ' · ' + text(chosen.merchant) + ' · retailer SKU ' + text(chosen.sku)));
        const facts = el('dl');
        for (const [key, label] of [['cpu', 'Processor'], ['gpu', 'Graphics card'], ['ram', 'Memory'], ['storage', 'Storage']]) { const row = el('div'); row.append(el('dt', label), el('dd', text(chosen[key], 240) || 'Not disclosed')); facts.append(row); }
        overview.append(facts); target.append(overview);
        const columns = el('div', undefined, { class: 'md-disclosure-list' }), evidence = disclosures(chosen);
        for (const [key, title] of [['listed', 'Listed in the researched record'], ['unresolved', 'Details to confirm with the seller']]) {
          const section = el('section'); section.append(el('h3', title)); const list = el('ul');
          for (const row of evidence[key]) list.append(el('li', row.label + ': ' + row.value));
          if (!evidence[key].length) list.append(el('li', key === 'listed' ? 'None of these additional details is established by this record.' : 'Reconfirm the shipped components and current terms before ordering.'));
          section.append(list); columns.append(section);
        }
        target.append(columns, el('p', 'Listing summary researched ' + text(chosen.checkedAt, 30) + '. Current price, stock and shipped components still require confirmation.'));
        try { const url = new URL(chosen.url); if (url.protocol === 'https:') target.append(el('a', 'Open the exact retailer listing', { href: url.href, target: '_blank', rel: 'noopener' })); } catch {}
      }
      const resetChecks = () => { all('[data-master-prebuilt-check]').forEach(input => { input.checked = false; }); say('[data-master-check-status]', 'No checks marked. This records your confirmations, not an automated certification.'); };
      if (picker) picker.addEventListener('change', () => { chosen = pick(picker.value); resetChecks(); if (chosen) setRegion(chosen.region); renderSystem(); });
      all('[data-master-prebuilt-check]').forEach(input => input.addEventListener('change', () => { const count = all('[data-master-prebuilt-check]').filter(item => item.checked).length; say('[data-master-check-status]', count + ' of 7 checks marked by you. This is not a compatibility score or automatic verification.'); }));
      $('[data-master-use-system]').addEventListener('click', event => {
        if (!chosen) { event.preventDefault(); say('[data-master-prebuilt-status]', 'Choose the exact system first.'); return; }
        const context = { schema: 1, kind: 'prebuilt', createdAt: Date.now(), region: chosen.region, systemId: chosen.id, budget: pending?.budget };
        if (buyForm) { event.preventDefault(); pending = sanitizeContext(context); buyApplied = false; renderBuyContext(); $('#build-vs-buy')?.scrollIntoView({ block: 'start' }); }
        else if (!save(context, '[data-master-prebuilt-status]')) event.preventDefault();
      });
      $('[data-master-prebuilt-cost]').addEventListener('click', event => { if (!chosen) { event.preventDefault(); say('[data-master-prebuilt-status]', 'Choose the exact system first.'); return; } if (!save({ schema: 1, kind: 'prebuilt', createdAt: Date.now(), region: chosen.region, systemId: chosen.id, budget: pending?.budget }, '[data-master-prebuilt-status]')) event.preventDefault(); });
      if (picker) doc.addEventListener('click', event => { const button = event.target.closest?.('button[data-region]'); if (!button || !regionOK(button.dataset.region) || !chosen || chosen.region === button.dataset.region) return; chosen = systems.find(p => p.region === button.dataset.region) || null; picker.value = chosen?.id || ''; resetChecks(); renderSystem(); });
      renderSystem();
    }
    function renderBuyContext() {
      if (!buyContext || !pending || !['prebuilt', 'diy-quote', 'upgrade'].includes(pending.kind)) return;
      buyContext.hidden = false; const target = $('[data-master-buy-summary]'); contextSummary(target, pending);
      const system = systems.find(p => p.id === pending.systemId);
      if (system) target.append(el('p', system.name + ' · ' + (system.model || system.sku) + ' · ' + system.merchant));
      if (pending.kind === 'diy-quote') target.append(el('p', 'Your manual DIY quote: parts ' + money(pending.quote.parts, pending.region) + ', OS ' + money(pending.quote.os, pending.region) + ', tax/shipping ' + money(pending.quote.delivery, pending.region) + '. Assembly/support is still unknown. Applying clears any previous prebuilt quote and assembly/support cost.'));
      else if (pending.kind === 'prebuilt') target.append(el('p', 'Applying switches the worksheet to this country, then clears its previous prebuilt price and delivery quote. Enter a current exact-system quote; no price is copied from a listing.'));
      else target.append(el('p', 'First price your reuse scenario in the detailed worksheet. No complete cost has been carried from the upgrade planner.'));
      $('[data-master-buy-apply]').disabled = pending.kind === 'upgrade';
      if (pending.kind === 'upgrade') target.append(el('a', 'Price the complete upgrade scenario', { href: '/tools/budget-build-lab/' }));
    }
    if (buyForm && buyContext) {
      renderBuyContext();
      buyForm.addEventListener('submit', event => {
        if (pending && ['prebuilt', 'diy-quote'].includes(pending.kind) && !buyApplied) { event.preventDefault(); say('[data-buy-result]', 'Apply the selected comparison first so previous quotes are cleared for the exact system and currency.'); }
      });
      $('[data-master-buy-apply]').addEventListener('click', () => {
        if (!pending || !['prebuilt', 'diy-quote'].includes(pending.kind)) return;
        const system = systems.find(p => p.id === pending.systemId);
        if (pending.kind === 'prebuilt' && (!system || system.region !== pending.region)) { say('[data-master-buy-status]', 'That exact configuration no longer matches this country. Choose the system again.'); return; }
        setRegion(pending.region);
        for (const name of ['prebuilt', 'prebuiltDelivery']) buyForm.elements[name].value = '';
        if (pending.kind === 'diy-quote') { for (const name of ['parts', 'os', 'delivery']) buyForm.elements[name].value = String(pending.quote[name]); buyForm.elements.support.value = ''; }
        if (system) { chosen = system; const picker = $('[data-master-system]'); if (picker) { picker.value = system.id; picker.dispatchEvent(new Event('change', { bubbles: true })); } }
        buyForm.elements.prebuilt.setAttribute('aria-describedby', 'md-buy-context-title');
        say('[data-buy-result]', 'Selected comparison updated. Enter the exact prebuilt price, delivery and any remaining required costs, then compare totals.');
        buyApplied = true;
        say('[data-master-buy-status]', 'Applied in ' + pending.currency + '. Previous prebuilt quotes cleared; currencies were not converted.'); clear();
      });
    }
    all('[data-master-context-dismiss]').forEach(button => button.addEventListener('click', () => { clear(); const panel = button.closest('[data-master-lab-context], [data-master-buy-context]'); if (panel) panel.hidden = true; pending = null; }));
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(), { once: true });
    else mount();
  }
  return { KEY, TTL, SLOTS, QUOTE_ITEMS, amount, sanitizeContext, ownedForWorksheet, scenarioParts, decisionAdvice, quoteForTransfer, disclosures, mount };
});
