(function (factory) {
  const rules = typeof module === 'object' && module.exports ? require('../scripts/compatibility-evidence.cjs') : globalThis.PCP_BUILD_RULES;
  const api = factory(rules);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.PCP_BUILD_PROGRAM = api;
})(function (rules) {
  'use strict';
  const STORAGE_KEY = 'pcp-build-revisions-v1', LAB_KEY = 'pcp-budget-lab-v1', MAX_REVISIONS = 25, MAX_IMPORT_BYTES = 4 * 1024 * 1024;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  function parseCollection(raw, catalog, aliases = {}) {
    if(typeof raw==='string'&&new TextEncoder().encode(raw).length>MAX_IMPORT_BYTES)throw new Error('The revision file must be at most 4 MB.');
    const source = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(source) && (source?.schema !== 1 || !Array.isArray(source.revisions))) throw new Error('Use a PC Part Performance revision export.');
    const rows = Array.isArray(source) ? source : source.revisions;
    if (rows.length > MAX_REVISIONS) throw new Error('At most 25 revisions can be imported.');
    const issues = [], ids = new Set();
    const revisions = rows.map((row, index) => {
      if (!row || typeof row !== 'object') throw new Error('A revision record is invalid.');
      const normalized = rules.normalizeRevision(row, catalog, aliases);
      issues.push(...normalized.issues);
      let id = typeof row.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(row.id) ? row.id : 'import-' + index;
      if (ids.has(id)) { issues.push({ id, reason: 'Duplicate revision identifier reassigned; selections are preserved.' }); id = 'import-' + index; while (ids.has(id)) id += '-copy'; }
      ids.add(id);
      return { ...normalized.revision, id };
    });
    return { schema: 1, revisions, issues };
  }
  function loadCollection(storage, catalog, aliases = {}) {
    try { const text = storage.getItem(STORAGE_KEY); return text ? { ...parseCollection(text, catalog, aliases), available: true } : { schema: 1, revisions: [], issues: [], available: true }; }
    catch (error) { return { schema: 1, revisions: [], issues: [], available: false, error: error.message }; }
  }
  function saveCollection(storage, revisions) {
    if (!Array.isArray(revisions) || revisions.length > MAX_REVISIONS) return { ok: false, error: 'Delete a revision before saving another.' };
    try { storage.setItem(STORAGE_KEY, JSON.stringify({ schema: 1, revisions })); return { ok: true }; }
    catch { return { ok: false, error: 'Browser storage is unavailable or full. Export your revision instead.' }; }
  }
  function revisionDifference(previous, current) {
    const diff = [];
    for (const slot of rules.SLOTS) {
      const a = previous.parts?.[slot] || [], b = current.parts?.[slot] || [];
      if (a.join('|') !== b.join('|')) diff.push({ slot, previous: a, current: b });
    }
    const flags = ['owned', 'locked'].filter(key => [...(previous[key] || [])].sort().join('|') !== [...(current[key] || [])].sort().join('|'));
    return { parts: diff, flags, regionChanged: previous.region !== current.region, budgetChanged: previous.budget !== current.budget };
  }
  function quotedRows(values, side) { return Object.keys(values).filter(key => key.startsWith(side + '-') && !key.endsWith('-owned')).map(key => ({ id: key.slice(2), amount: values[key], owned: values[key + '-owned'] === true, quantity: 1 })); }
  function mount() {
    if (!rules || typeof document === 'undefined') return;
    const $ = selector => document.querySelector(selector);
    const money = (value, region) => new Intl.NumberFormat(region === 'US' ? 'en-US' : 'en-CA', { style: 'currency', currency: region === 'US' ? 'USD' : 'CAD', currencyDisplay: 'code' }).format(value);
    function download(name, content, type = 'application/json') {
      const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement('a');
      link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    document.querySelectorAll('[data-program-print]').forEach(button => button.addEventListener('click', () => window.print()));
    if (!$('#build-plan') || !window.PCP_BUILD) return;
    const bridge = window.PCP_BUILD, catalog = bridge.catalog(), aliases = window.PCP_PRODUCT_ALIASES || {}, byId = new Map(catalog.map(part => [part.id, part]));
    let storage; try { storage = window.localStorage; } catch { storage = { getItem() { throw new Error('Browser storage unavailable'); }, setItem() { throw new Error('Browser storage unavailable'); } }; }
    const collection = loadCollection(storage, catalog, aliases);
    let revisions = collection.revisions, offers = [], offerIdentities = new Map(), previousBuildKey = '', report, spending;
    const params = new URL(location.href).searchParams, rawPlan = (params.get('plan') || '').split('~');
    let storedRegion; try { storedRegion = storage.getItem('pcp-region'); } catch {}
    const loaded = rules.normalizeRevision({ ...bridge.snapshot(), owned: (params.get('owned') || '').split('~'), locked: (params.get('locked') || '').split('~'), region: params.get('region') || document.documentElement.dataset.region || storedRegion || 'CA', requirements: { workload: rawPlan[0], display: rawPlan[1], size: rawPlan[2], noise: rawPlan[3], network: rawPlan[4] } }, catalog, aliases);
    const restoreId=params.get('restore'),localRestore=restoreId?collection.revisions.find(row=>row.id===restoreId):null;
    let state = localRestore ? rules.normalizeRevision({...localRestore,...bridge.snapshot(),owned:params.has('owned')?loaded.revision.owned:localRestore.owned,locked:params.has('locked')?loaded.revision.locked:localRestore.locked,region:params.get('region')||localRestore.region},catalog,aliases).revision : loaded.revision;
    bridge.setLocks(state.locked);
    const status = message => { $('#program-status').textContent = message; };
    function current(name = $('#program-save-form input').value || state.name) {
      return rules.normalizeRevision({ ...state, ...bridge.snapshot(), name, savedAt: new Date().toISOString() }, catalog, aliases).revision;
    }
    window.PCP_BUILD_SESSION={current,report:()=>report,spending:()=>spending,setManualItems(items){const parsed=rules.normalizeManualItems(items,state.region);if(parsed.issues.length)return {ok:false,error:parsed.issues[0].reason};state.manualItems=parsed.items;renderSpending();document.dispatchEvent(new CustomEvent('pcp:purchase-plan'));return {ok:true};}};
    function syncForm() {
      const form = $('#guided-build-form');
      form.elements.region.value = state.region; form.elements.budget.value = state.budget ?? '';
      for (const [key, value] of Object.entries(state.requirements)) if (form.elements[key]) form.elements[key].value = value;
    }
    function renderPlan() {
      const requirements = state.requirements;
      const statements = [requirements.workload === 'creator' || requirements.workload === 'mixed' ? 'Record the exact application and workload before choosing CPU, GPU and memory. Use application-specific tests.' : requirements.workload === 'gaming' ? 'Use original tests for your games and settings. A display target alone does not establish the FPS you will receive.' : 'Start with your software requirements, capacity needs and available display outputs.', requirements.size === 'compact' ? 'Compact preference: check board format, cooler, PSU and exact graphics-card clearances together.' : 'Case size is flexible; exact clearances still need checking.', requirements.noise === 'quiet' ? 'Low-noise preference: compare acoustic tests at similar loads. Fan count and power ratings alone do not prove noise.' : '', requirements.network === 'wifi' ? 'Wi-Fi is required: confirm the exact board or adapter, antennas, OS support and drivers.' : 'Confirm the connection and any networking hardware you will reuse.'].filter(Boolean);
      $('#guided-plan-result').innerHTML = `<h3>Your planning priorities</h3><ul>${statements.map(text => `<li>${esc(text)}</li>`).join('')}</ul><p>${state.budget !== null ? `New spending target: <strong>${money(state.budget, state.region)}</strong>. ` : ''}No automated budget recommendation is made until exact purchase prices and the full bill of materials are available.</p><p><a href="/tools/budget-build-lab/">Compare complete quotes</a> · <a href="/tools/platform-upgrade-cost/">Check platform-change costs</a> · <a href="#builder-parts">Choose your next part</a></p>`;
    }
    function selectedItems() {
      const grouped = new Map();
      for (const ids of Object.values(bridge.snapshot().parts)) for (const id of ids) grouped.set(id, (grouped.get(id) || 0) + 1);
      return [...grouped].map(([id, quantity]) => ({ id, quantity, owned: state.owned.includes(id) }));
    }
    function renderSpending() {
      const safeOffers = window.PCP_OFFER_RULES ? [...offerIdentities.values()].flatMap(product => window.PCP_OFFER_RULES.currentOffers(offers, {product,region:state.region}).offers.map(o=>({...o,id:o.productId,store:o.merchant,expiresAt:o.validUntil}))) : [];
      const items=selectedItems(), publicOffers=items.flatMap(item=>window.PCP_PUBLIC_PRICES?.offersFor(item.id,state.region)||[]);
      const totals = rules.purchaseTotals({ items, offers: [...safeOffers,...publicOffers], region: state.region, maxAgeMs:86400000 });
      const manual=rules.manualItemTotal(state.manualItems,state.region),manualCount=(state.manualItems||[]).length;
      spending={checkedParts:totals,manualQuotes:manual,region:state.region,completePurchaseCost:false,exclusions:['missing required components','unquoted purchases','tax','shipping']};
      const quoted = totals.priced ? money(totals.subtotal, state.region) : totals.owned&&!totals.missing?'No new component purchases':'No current verified purchase subtotal';
      $('#program-spending').innerHTML = `<div><h3>${totals.complete ? 'Checked selected-parts subtotal' : 'Partial selected-parts subtotal'}</h3><strong class="program-total">${quoted}</strong><p>${totals.priced} priced · ${totals.missing} need a price · ${totals.owned} already owned</p>${manualCount?`<p><strong>Your additional quotes: ${money(manual.subtotal,state.region)}</strong> · ${manual.missing} unknown · ${manual.owned} owned. Kept separate from checked offers.</p>`:''}</div><div><span>${state.region === 'US' ? 'United States · USD' : 'Canada · CAD'}</span><p>Exact, in-stock observations within their expiry qualify. Morning observations expire after 24 hours; prices can change. Tax, shipping and unlisted purchases are extra.</p>${state.budget !== null ? '<p>Target: '+money(state.budget,state.region)+'. Budget fit still requires every missing component, price and extra cost.</p>' : ''}<a href="/tools/budget-build-lab/">Compare full purchase quotes</a></div>`;
      if(report&&selectedItems().length)$('#program-print-summary').textContent=rules.revisionText(current(),catalog)+'\n\nBuild Readiness Report\n'+report.checks.map(check=>check.title+': '+check.state+'\n'+check.reason+'\n'+(check.next||'')+'\n'+check.sources.map(s=>s.url).join('\n')).join('\n\n')+'\n\nChecked selected-parts subtotal: '+(totals.priced?money(totals.subtotal,state.region):'Unknown')+'; '+totals.missing+' prices missing. Tax, shipping and unlisted purchases are extra.\nPrivate manual purchase quotes:\n'+(state.manualItems||[]).map(row=>row.quantity+' × '+row.name+': '+(row.owned?'owned':row.amount===null?'unknown':money(row.amount,row.region))+(row.region!==state.region?' (different currency; excluded)':'')).join('\n');
    }
    function renderOwnership() {
      for (const row of document.querySelectorAll('.builder-row[data-builder-row]')) {
        const slot = row.dataset.builderRow, ids = bridge.snapshot().parts[slot] || [], unique = [...new Set(ids)], locked = ids.some(id => state.locked.includes(id));
        row.querySelector('.program-part-flags')?.remove();
        if (!ids.length) continue;
        const panel = document.createElement('div'); panel.className = 'program-part-flags';
        panel.innerHTML = unique.map(id => `<fieldset><legend>${esc(byId.get(id)?.name || id)}${ids.filter(value => value === id).length > 1 ? ' · ' + ids.filter(value => value === id).length + ' selected' : ''}</legend><label class="program-checkbox"><input type="checkbox" data-program-owned="${esc(id)}" ${state.owned.includes(id) ? 'checked' : ''}> Already owned</label><label class="program-checkbox"><input type="checkbox" data-program-locked="${esc(id)}" ${state.locked.includes(id) ? 'checked' : ''}> Lock this selection</label></fieldset>`).join('') + (ids.length > 1 ? '<p class="program-help">A lock holds this whole component row steady. Unlock it to add, remove or replace items in the row.</p>' : '');
        row.append(panel);
        for (const select of row.querySelectorAll('select[data-build-primary],select[data-build-add],select[data-build-slot]')) { select.disabled = locked; const trigger = select.closest('.modern-select')?.querySelector('.select-trigger'); if (trigger) trigger.disabled = locked; }
        for (const button of row.querySelectorAll('button[data-build-remove-instance]')) button.disabled = locked;
        row.classList.toggle('program-locked-row', locked);
      }
    }
    const stateNames = { passed: 'Documented narrow matches', failed: 'Documented conflicts', 'needs-verification': 'Needs verification', 'not-checked': 'Not yet checked', unperformed: 'Outside automated scope' };
    function renderReadiness() {
      const snapshot = bridge.snapshot(), parts = Object.fromEntries(rules.SLOTS.map(slot => [slot, (snapshot.parts[slot] || []).map(id => byId.get(id)).filter(Boolean)]));
      report = rules.createReadiness({ parts, requirements: state.requirements });
      if(report.status==='not-started'){
        $('#program-readiness').innerHTML='<div class="passport-empty"><h3>Your build starts here</h3><p>Choose a processor, or load the starter parts. We’ll check each connection when the parts it needs are selected.</p><div class="program-actions"><a class="button primary" href="#builder-choose">Choose your first part</a><a class="button secondary" href="/build-school/">New to building a PC?</a></div></div>';
        const verdict=$('#build-verdict');if(verdict)verdict.innerHTML='<p>No build selected yet.</p>';
        const checks=$('#build-checks');if(checks)checks.textContent='Checks have not started.';
        $('#program-print-summary').textContent='Choose components to generate a Build Readiness Report.';
        return;
      }
      const groups = ['failed', 'passed', 'needs-verification', 'not-checked', 'unperformed'].filter(group => report.counts[group]);
      $('#program-readiness').innerHTML = `<p class="readiness-summary ${report.counts.failed ? 'has-conflicts' : ''}"><strong>${esc(report.summary)}</strong></p>${report.missing.length ? `<p class="program-missing"><strong>Missing from the selected system:</strong> ${report.missing.map(slot => esc(({ cpu: 'processor', board: 'motherboard', ram: 'memory', psu: 'power supply', case: 'case', storage: 'storage drive', cooler: 'CPU cooler' })[slot] || slot)).join(', ')}.</p>` : ''}<div class="readiness-counts">${groups.map(group => `<a href="#readiness-${group}">${report.counts[group]} ${esc(stateNames[group].toLowerCase())}</a>`).join('')}</div>${groups.map(group => `<details id="readiness-${group}" class="readiness-group" ${group === 'failed' ? 'open' : ''}><summary>${esc(stateNames[group])} <span>${report.counts[group]}</span></summary><ul>${report.checks.filter(check => check.state === group).map(check => `<li><h3>${esc(check.title)}</h3><p>${esc(check.reason)}</p>${check.next ? `<p class="readiness-next"><strong>Next check:</strong> ${esc(check.next)}</p>` : ''}${check.sources.length ? `<ul class="readiness-sources">${check.sources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}${source.model ? ' — ' + esc(source.model) : ''}</a>${source.checked ? ` · checked ${esc(source.checked)}` : ' · inherited source; field unverified'}</li>`).join('')}</ul>` : ''}${group === 'needs-verification' ? `<label class="program-checkbox"><input type="checkbox" data-program-ack="${esc(check.id)}" ${state.acknowledged.includes(check.id) ? 'checked' : ''}> I have recorded this unresolved check</label>` : ''}</li>`).join('')}</ul></details>`).join('')}<p class="program-help">An acknowledgement is a reminder, not evidence of compatibility. A part change clears acknowledgements so the new configuration is reviewed again.</p><p><a href="/tools/b650-tomahawk-lane-check/">B650 TOMAHAWK slot-sharing checker</a> · <a href="/methodology/#compatibility">Methods and limits</a></p>`;
      const verdict = $('#build-verdict');
      if (verdict) verdict.innerHTML = `<span class="verdict-code">Build status</span><div class="verdict-line"><span class="status-dot ${report.counts.failed ? 'fail' : 'unknown'}"></span><strong>${report.counts.failed ? 'Documented conflict found' : 'Verification still required'}</strong></div><p>${esc(report.summary)}</p><a href="#readiness-report">Open the Build Readiness Report</a>`;
      const checks = $('#build-checks'); if (checks) checks.innerHTML = `<p>${report.counts.passed} documented checks passed; ${report.counts.failed} conflicts; ${report.counts['needs-verification']} unresolved checks.</p><a href="#readiness-report">Read reasons, sources and next steps</a>`;
      const outlook = $('#build-performance'); if (outlook) outlook.innerHTML = '<p>No calibrated hardware score, universal resolution target or measured FPS is available for this selected system. Use matching game/application tests before deciding whether to upgrade.</p><p><a href="/performance/evidence/">Check benchmark coverage</a> · <a href="/tools/display-goal/">Compare a display goal</a></p>';
      const filterStatus = $('#builder-filter-status'); if (filterStatus) filterStatus.textContent = snapshot.incompatible ? 'All choices · review documented conflicts' : 'Documented conflicts filtered · unknown fit stays visible';
      $('#program-print-summary').textContent = rules.revisionText(current(), catalog) + '\n\nReadiness report\n' + report.checks.map(check => check.title + ': ' + check.state + '\n' + check.reason + '\n' + check.next + '\n' + check.sources.map(source => source.url).join('\n')).join('\n\n');
    }
    function renderRevisions() {
      $('#program-revisions').innerHTML = revisions.length ? `<ul class="program-revision-list">${revisions.map(revision => `<li><div><h3>${esc(revision.name)}</h3><p>${esc(revision.currency)} · ${Object.values(revision.parts).flat().length} selected parts${revision.savedAt ? ' · saved ' + esc(new Date(revision.savedAt).toLocaleDateString()) : ''}</p>${revision.unresolved?.length ? `<p><strong>Repair needed:</strong> ${revision.unresolved.map(item => esc(item.slot + ': ' + item.id)).join('; ')}. These references remain in your export and are not installed.</p>` : ''}</div><div class="program-actions"><button type="button" class="button secondary" data-revision-load="${esc(revision.id)}">Load revision</button><button type="button" class="button secondary" data-revision-compare="${esc(revision.id)}">Compare with current</button><button type="button" class="text-button" data-revision-delete="${esc(revision.id)}">Delete</button></div></li>`).join('')}</ul>` : '<p>No revisions saved yet. Save a named build to return to it later.</p>';
    }
    function render() {
      const snapshot = bridge.snapshot(), key = JSON.stringify(snapshot.parts) + JSON.stringify(snapshot.fans);
      if (previousBuildKey && previousBuildKey !== key) state.acknowledged = [];
      previousBuildKey = key;
      const normalized = current(); state.owned = normalized.owned; state.locked = normalized.locked; bridge.setLocks(state.locked);
      renderOwnership(); renderReadiness(); renderSpending(); renderPlan(); renderRevisions();
      const address=new URL(location.href);for(const key of ['owned','locked']){if(normalized[key].length)address.searchParams.set(key,normalized[key].join('~'));else address.searchParams.delete(key)}history.replaceState(null,'',address);
    }
    function copy(text,kind) {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => {status('Copied.');window.PCP_EVENTS?.track('build_shared',{page_type:'builder',action:kind+'_clipboard',region:state.region})}).catch(() => fallback(text,kind)); else fallback(text,kind);
    }
    function fallback(text,kind) { const box = $('#program-copy-fallback'); box.hidden = false; box.querySelector('textarea').value = text; box.querySelector('textarea').focus(); box.querySelector('textarea').select(); status('Clipboard access is unavailable. Copy the selected text.');window.PCP_EVENTS?.track('build_shared',{page_type:'builder',action:kind+'_fallback',region:state.region}); }
    function store(next) { const saved = saveCollection(storage, next); if (!saved.ok) { status(saved.error); return false; } revisions = next; renderRevisions(); return true; }
    $('#guided-build-form').addEventListener('submit', event => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
      state = rules.normalizeRevision({ ...current(), region: values.region, budget: values.budget, requirements: values }, catalog, aliases).revision;
      const switchButton = document.querySelector(`[data-region="${state.region}"]`); if (switchButton) switchButton.click(); else { document.documentElement.dataset.region = state.region; try { storage.setItem('pcp-region', state.region); } catch {} }
      render(); status('Plan updated. No purchase recommendation or FPS target has been inferred from it.');window.PCP_EVENTS?.track('guided_plan_updated',{page_type:'builder',region:state.region});
    });
    document.addEventListener('pcp:build-state', render);
    document.addEventListener('click', event => {
      const button = event.target.closest('button'); if (!button) return;
      if (button.dataset.region) setTimeout(() => { state.region = button.dataset.region; state.currency = state.region === 'US' ? 'USD' : 'CAD'; syncForm(); renderSpending(); }, 0);
      if (button.hasAttribute('data-program-example')) { bridge.load(bridge.starter(), { preserveLocked: true }); status('The established example is loaded. Locked selections are kept. Check missing prices, cooler and BIOS before purchase.'); }
      if (button.dataset.programCopy) { const revision = current(); copy(button.dataset.programCopy === 'link' ? rules.buildURL(revision, location.origin) : rules.revisionText(revision, catalog, button.dataset.programCopy === 'markdown'),button.dataset.programCopy); }
      if (button.hasAttribute('data-program-export')) download('pcpartperformance-build-revisions.json', JSON.stringify({ schema: 1, revisions: revisions.length ? revisions : [{ ...current(), id: 'export-current' }] }, null, 2));
      const revision = revisions.find(row => row.id === (button.dataset.revisionLoad || button.dataset.revisionCompare || button.dataset.revisionDelete));
      if (!revision) return;
      if (button.dataset.revisionLoad) { state = { ...revision, owned: [...revision.owned], locked: [...revision.locked], acknowledged: [...revision.acknowledged], requirements: { ...revision.requirements } }; bridge.setLocks(state.locked); previousBuildKey = ''; bridge.load(revision); syncForm(); $('#program-save-form input').value=state.name; render(); document.dispatchEvent(new CustomEvent('pcp:purchase-plan')); status('Saved revision loaded. Prices are rechecked independently; unresolved checks remain unresolved.'); }
      if (button.dataset.revisionDelete) if (store(revisions.filter(row => row.id !== revision.id))) status('Revision deleted from this device.');
      if (button.dataset.revisionCompare) {
        const difference = revisionDifference(revision, current());
        const names = ids => ids.length ? ids.map(id => byId.get(id)?.name || id).join(' + ') : 'None selected';
        $('#program-revision-diff').innerHTML = `<h3>Changes from ${esc(revision.name)}</h3>${difference.parts.length ? `<div class="program-table-scroll"><table><caption>Exact component selections</caption><thead><tr><th scope="col">Component</th><th scope="col">Saved revision</th><th scope="col">Current build</th></tr></thead><tbody>${difference.parts.map(row => `<tr><th scope="row">${esc(row.slot)}</th><td>${esc(names(row.previous))}</td><td>${esc(names(row.current))}</td></tr>`).join('')}</tbody></table></div>` : '<p>Exact part selections are unchanged.</p>'}<p>${difference.flags.length ? esc(difference.flags.join(' and ')) + ' choices changed. ' : ''}${difference.regionChanged ? 'Country changed. ' : ''}${difference.budgetChanged ? 'Manual budget changed. ' : ''}Historical prices are not inferred from this revision.</p>`;
      }
    });
    document.addEventListener('change', event => {
      const input = event.target, flag = input.dataset.programOwned !== undefined ? 'owned' : input.dataset.programLocked !== undefined ? 'locked' : null, id = input.dataset.programOwned || input.dataset.programLocked;
      if (flag && byId.has(id)) { state[flag] = input.checked ? [...new Set([...state[flag], id])] : state[flag].filter(value => value !== id); bridge.setLocks(state.locked); render(); }
      if (input.dataset.programAck !== undefined) { const id = input.dataset.programAck; state.acknowledged = input.checked ? [...new Set([...state.acknowledged, id])] : state.acknowledged.filter(value => value !== id); }
    });
    $('#program-save-form').addEventListener('submit', event => { event.preventDefault(); if (!selectedItems().length) return status('Select a component before saving a revision.'); const revision = { ...current(), id: globalThis.crypto?.randomUUID?.() || 'build-' + Date.now() }; if (store([...revisions, revision])) {status('Revision saved on this device.');window.PCP_EVENTS?.track('build_revision_saved',{page_type:'builder',region:state.region})} });
    $('#program-import-file').addEventListener('change', async event => {
      const file = event.target.files?.[0]; if (!file) return;
      try { if (file.size > MAX_IMPORT_BYTES) throw new Error('The revision file must be at most 4 MB.'); const parsed = parseCollection(await file.text(), catalog, aliases); const ids = new Set(revisions.map(row => row.id)); const next = [...revisions, ...parsed.revisions.filter(row => !ids.has(row.id))]; if (store(next)) status(parsed.issues.length ? `Imported with ${parsed.issues.length} unknown or invalid component references requiring repair. They remain in exports and are not installed.` : 'Revisions imported to this device. Existing IDs were not duplicated.'); } catch (error) { status(error.message); }
      event.target.value = '';
    });
    function candidateStatus(slot, candidate) {
      const snapshot = bridge.snapshot(), parts = Object.fromEntries(rules.SLOTS.map(key => [key, (snapshot.parts[key] || []).map(id => byId.get(id)).filter(Boolean)]));
      parts[slot] = [candidate, ...(slot === 'ram' || slot === 'ssd' || slot === 'gpu' || slot === 'cpu' ? parts[slot].slice(1) : [])];
      const candidateReport = rules.createReadiness({ parts, requirements: state.requirements });
      const related = { cpu: ['cpu-socket', 'bios'], board: ['cpu-socket', 'ram-generation', 'board-case'], gpu: ['gpu-length-0', 'gpu-clearance-0', 'psu-recommendation-0'], ram: ['ram-generation', 'ram-capacity', 'ram-slots'], ssd: ['nvme-count', 'drive-interface', 'lane-sharing'], psu: ['psu-form', 'psu-length', 'psu-recommendation-0'], case: ['board-case', 'gpu-length-0', 'psu-form'], cooler: ['cooler-socket','cooler-kit','cooler-height','radiator-layout','cooler-ram'] };
      const checks = candidateReport.checks.filter(check => (related[slot] || []).includes(check.id));
      const exact = Object.keys(rules.FACTS[candidate.id] || {}).length > 0 || Object.values(candidate.evidence?.fields || {}).some(rules.verified);
      return { checks, exact, failed: checks.filter(check => check.state === 'failed') };
    }
    $('#program-alternative-form').addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget, slot = form.elements.slot.value, query = form.elements.query.value.trim().toLowerCase(), documented = form.elements.documented.checked;
      const candidates = catalog.filter(part => part.cat === slot && `${part.brand} ${part.name} ${part.summary}`.toLowerCase().includes(query)).map(part => ({ part, ...candidateStatus(slot, part) })).filter(item => !documented || item.exact).sort((a, b) => a.failed.length - b.failed.length || Number(b.exact) - Number(a.exact) || a.part.name.localeCompare(b.part.name));
      const results = $('#program-alternative-results');
      results.innerHTML = `<p>${candidates.length} matching records. Showing up to 24; verified facts and absence of a documented conflict come first, then model name.</p>${candidates.slice(0, 24).map(item => `<article class="program-alternative"><div><h3><a href="/learn/${encodeURIComponent(item.part.id)}.html">${esc(item.part.brand + ' ' + item.part.name)}</a></h3><p>${esc(item.part.summary)}</p><p>${item.failed.length ? 'Documented conflict in the proposed selection.' : item.exact ? 'Exact verified fields are available; unresolved checks still apply.' : 'Exact platform/fit fields are unverified.'}</p><details><summary>Why this option needs review</summary><ul>${item.checks.map(check => `<li><strong>${esc(check.title)}:</strong> ${esc(check.reason)} ${check.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Source</a>`).join(' ')}</li>`).join('')}</ul></details></div><div class="program-actions"><button type="button" class="button secondary" data-candidate-id="${esc(item.part.id)}" data-candidate-slot="${esc(slot)}">Select and recheck</button><a href="/compare/?mode=interactive&amp;parts=${encodeURIComponent([...(bridge.snapshot().parts[slot] || []).slice(0, 1), item.part.id].filter((id, index, values) => values.indexOf(id) === index).join(','))}">Compare specifications</a></div></article>`).join('')}`;
      results.querySelectorAll('[data-candidate-id]').forEach(button => button.addEventListener('click', () => { const response = bridge.select(button.dataset.candidateSlot, button.dataset.candidateId); status(response.ok ? 'Alternative selected. Readiness recalculated; review the new source and clearance checks.' : response.reason); }));
    });
    if(localRestore)$('#program-save-form input').value=state.name;
    syncForm(); render();
    if(restoreId&&!localRestore)status('This saved revision is not available in this browser. The public part selections are still open; private quotes and notes were not transferred.');
    if (!collection.available) status('Saved revisions could not be read. Current planning and exports still work; existing local data was not overwritten.');
    else if (collection.issues.length) status('Some saved component IDs no longer match the catalog. Review affected revisions before use.');
    Promise.all(['/data/offer-observations.json','/data/offer-identities.json'].map(url=>fetch(url,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()}))).then(async([feed,identities])=>{if(!Array.isArray(feed.observations)||feed.observations.length>5000||!Array.isArray(identities.products)||identities.products.length>5000)throw Error();offers=feed.observations;offerIdentities=new Map(identities.products.map(p=>[p.id,p]));if(offerIdentities.size&&!window.PCP_OFFER_RULES)await import('/program-offers.js');renderSpending()}).catch(()=>{offers=[];offerIdentities.clear();renderSpending()});
    setInterval(()=>{if(offers.length&&!document.hidden)renderSpending()},60000);
    document.addEventListener('pcp:prices',renderSpending);

  }
  function mountLabPage() {
    if (typeof document === 'undefined' || !document.querySelector('[data-budget-lab]')) return;
    const form = document.querySelector('#budget-build-form'), result = document.querySelector('#budget-result'), status = document.querySelector('#budget-status');
    const money = (value, region) => new Intl.NumberFormat(region === 'US' ? 'en-US' : 'en-CA', { style: 'currency', currency: region === 'US' ? 'USD' : 'CAD', currencyDisplay: 'code' }).format(value);
    function collect() { const values = Object.fromEntries(new FormData(form)); for (const input of form.querySelectorAll('[data-quote-owned]')) values[input.dataset.quoteOwned + '-owned'] = input.checked; return values; }
    function restore(values) { for (const element of form.elements) if (element.name && values[element.name] !== undefined) element.value = String(values[element.name]).slice(0, 80); for (const input of form.querySelectorAll('[data-quote-owned]')) input.checked = values[input.dataset.quoteOwned + '-owned'] === true; }
    function render() {
      const values = collect(), comparison = rules.compareQuotes(quotedRows(values, 'a'), quotedRows(values, 'b')), budget = rules.validAmount(values.budget), region = values.region === 'US' ? 'US' : 'CA';
      result.innerHTML = `<div class="budget-summary">${['a', 'b'].map(side => { const total = comparison[side], name = values[side === 'a' ? 'nameA' : 'nameB'] || ('Plan ' + side.toUpperCase()); return `<section><h3>${esc(name)}</h3><strong class="program-total">${total.purchaseItems === total.missing && total.missing > 0 ? 'No purchase quotes yet' : money(total.subtotal, region)}</strong><p>${total.complete ? 'All purchase fields supplied.' : total.missing + ' purchase fields still need a quote.'} ${total.owned} fields marked owned or not needed.</p>${budget === null ? '' : `<p>${total.complete ? money(budget - total.subtotal, region) + ' versus your entered budget.' : 'Budget fit is unresolved.'}</p>`}</section>`; }).join('')}</div><p><strong>${comparison.difference === null ? 'A complete cost difference cannot be calculated until both purchase plans have every required quote.' : 'Plan B minus Plan A: ' + money(comparison.difference, region) + '.'}</strong></p><p>These are your entered quotes, not live retailer offers. Review whether owned/not-needed choices are valid; verify compatibility before purchasing.</p>`;
    }
    form.addEventListener('submit', event => { event.preventDefault(); render(); });
    document.querySelector('[data-budget-save]').addEventListener('click', () => { try { localStorage.setItem(LAB_KEY, JSON.stringify({ schema: 1, values: collect() })); status.textContent = 'Worksheet saved on this device.'; } catch { status.textContent = 'Local storage is unavailable. Export or print the worksheet.'; } });
    document.querySelector('[data-budget-export]').addEventListener('click', () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ schema: 1, values: collect() }, null, 2)], { type: 'application/json' })), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pcpartperformance-budget-worksheet.json'; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
    document.querySelector('[data-budget-reset]').addEventListener('click', () => { form.reset(); try { localStorage.removeItem(LAB_KEY); } catch {} render(); status.textContent = 'Worksheet reset. Local saved inputs removed.'; });
    try { const stored = JSON.parse(localStorage.getItem(LAB_KEY) || 'null'); if (stored?.schema === 1 && stored.values && typeof stored.values === 'object') restore(stored.values); } catch { status.textContent = 'Saved worksheet could not be read. Enter new quotes or export them.'; }
    render();
  }
  if (typeof document !== 'undefined') {
    const ready = () => { mount(); mountLabPage(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true }); else ready();
  }
  return { STORAGE_KEY, LAB_KEY, MAX_REVISIONS, MAX_IMPORT_BYTES, parseCollection, loadCollection, saveCollection, revisionDifference, quotedRows };
});
