(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.PCP_MEASUREMENT = api; api.mount({ document: root.document, window: root }); }
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const SLOTS = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan', 'cooler'];
  const TYPES = ['hardware', 'comparisons', 'guides', 'tools', 'reports', 'data', 'other'];
  const DEFINITIONS = {
    homepage_primary_action: { page: 'home', actions: ['build', 'upgrade', 'compare'] },
    builder_first_selection: { page: 'builder', actions: ['selected'], categories: SLOTS },
    build_report_opened: { page: 'builder', actions: ['anchor', 'section', 'guided_review'] },
    build_report_download_requested: { page: 'builder', actions: ['requested'] },
    build_report_export_created: { page: 'builder', actions: ['download_dispatch'] },
    build_report_export_failed: { page: 'builder', actions: ['failed'] },
    build_revision_restored: { page: 'builder', actions: ['local_link', 'load_revision'] },
    saved_work_interaction: { page: 'my_pc', actions: ['open_build', 'plan_upgrade', 'open_comparison', 'open_notes', 'select_build', 'save_notes', 'save_journal'] },
    search_result_selected: { page: 'search', actions: ['open', 'middle_click'], categories: TYPES }
  };
  const mounted = new WeakMap();
  function event(name, params = {}, win = globalThis.window || globalThis) {
    const definition = DEFINITIONS[name];
    if (!definition || !params || !definition.actions.includes(params.action) || definition.categories && !definition.categories.includes(params.category)) return false;
    const safe = { page_type: definition.page, action: params.action };
    if (definition.categories) safe.category = params.category;
    if (params.region === 'CA' || params.region === 'US') safe.region = params.region;
    try { return win.PCP_EVENTS?.track(name, safe) === true; } catch { return false; }
  }
  function validParts(parts) {
    if (!parts || typeof parts !== 'object' || Array.isArray(parts)) return null;
    const result = {};
    let total = 0;
    for (const slot of SLOTS) {
      const ids = parts[slot] ?? [];
      if (!Array.isArray(ids) || ids.length > 99 || ids.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(id))) return null;
      result[slot] = [...ids]; total += ids.length;
    }
    return total <= 99 ? result : null;
  }
  function firstSelectionTracker(onSelection) {
    let pending = null, used = false;
    return {
      arm(slot, id, parts) {
        const before = validParts(parts);
        if (used || !SLOTS.includes(slot) || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(id) || !before) { pending = null; return null; }
        const token = {}; pending = { slot, id, before, token }; return token;
      },
      observe(parts) {
        const next = validParts(parts), choice = pending; pending = null;
        if (used || !choice || !next || !next[choice.slot].includes(choice.id) || JSON.stringify(next[choice.slot]) === JSON.stringify(choice.before[choice.slot])) return false;
        used = true; try { onSelection(choice.slot); } catch {} return true;
      },
      expire(token) { if (pending?.token === token) pending = null; },
      used: () => used
    };
  }
  function region(win, doc) {
    try { const value = win.PCP_BUILD_SESSION?.current?.()?.region || doc?.documentElement?.dataset?.region; return ['CA', 'US'].includes(value) ? value : undefined; } catch { return undefined; }
  }
  function reportOpened(action, { window: win = globalThis.window || globalThis, document: doc = globalThis.document } = {}) {
    try {
      const report = win.PCP_BUILD_SESSION?.report?.();
      if (!report || report.status === 'not-started' || !doc?.querySelector('#readiness-report')) return false;
      return event('build_report_opened', { action, region: region(win, doc) }, win);
    } catch { return false; }
  }
  function downloadReport({ session, document: doc = globalThis.document, window: win = globalThis.window || globalThis }) {
    const selectedRegion = region(win, doc);
    event('build_report_download_requested', { action: 'requested', region: selectedRegion }, win);
    let url = null, anchor = null, urls = null;
    try {
      const revision = session?.current?.(), report = session?.report?.(), parts = validParts(revision?.parts);
      if (!parts || !Object.values(parts).some(ids => ids.length) || !report || report.status === 'not-started' || !doc?.createElement) throw Error('Select components before exporting a report.');
      const payload = { schema: 'pcp-readiness-passport-v1', generatedAt: new Date().toISOString(), revision, report, spending: session.spending(), priceBasis: 'Exact checked offers are rechecked separately; manual items are user-entered quotes.', limits: 'No overall fit, thermal, electrical or performance certification. This export can contain private purchase quotes.' };
      const BlobType = win.Blob || globalThis.Blob; urls = win.URL || globalThis.URL;
      url = urls.createObjectURL(new BlobType([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      anchor = doc.createElement('a'); anchor.href = url; anchor.download = 'pcpartperformance-build-report.json'; doc.body?.append(anchor); anchor.click();
      event('build_report_export_created', { action: 'download_dispatch', region: selectedRegion }, win);
      const status = doc.querySelector?.('#program-status'); if (status) status.textContent = 'Build report prepared. Your browser handles saving the file.';
      return { ok: true };
    } catch {
      event('build_report_export_failed', { action: 'failed', region: selectedRegion }, win);
      const status = doc?.querySelector?.('#program-status'); if (status) status.textContent = 'The build report could not be prepared. Your selected parts are unchanged. Try printing the report.';
      return { ok: false };
    } finally {
      try { anchor?.remove?.(); } catch {}
      if (url) try { (win.setTimeout || globalThis.setTimeout)(() => { try { urls.revokeObjectURL(url); } catch {} }, 1000); } catch { try { urls.revokeObjectURL(url); } catch {} }
    }
  }
  function mount({ document: doc = globalThis.document, window: win = globalThis.window || globalThis } = {}) {
    if (!doc?.addEventListener) return null;
    if (mounted.has(doc)) return mounted.get(doc);
    const tracker = firstSelectionTracker(slot => event('builder_first_selection', { action: 'selected', category: slot, region: region(win, doc) }, win));
    const arm = (slot, id) => {
      try {
        const token = tracker.arm(slot, id, win.PCP_BUILD?.snapshot?.()?.parts);
        if (token) (win.queueMicrotask || globalThis.queueMicrotask)(() => tracker.expire(token));
      } catch {}
    };
    // Loaded before builder-v2: its capture listener stops immediate propagation.
    doc.addEventListener('change', change => {
      const target = change.target, slot = target?.dataset?.buildAdd || target?.dataset?.buildPrimary || target?.dataset?.buildSlot;
      if (slot && target.value) arm(slot, target.value);
    }, true);
    doc.addEventListener('pcp:build-state', state => { try { tracker.observe(state.detail?.parts || win.PCP_BUILD?.snapshot?.()?.parts); } catch {} });
    doc.addEventListener('click', click => {
      if (click.defaultPrevented || click.button !== undefined && click.button !== 0) return;
      const target = click.target;
      const candidate = target?.closest?.('[data-candidate-id][data-candidate-slot]');
      if (candidate && !candidate.disabled) arm(candidate.dataset.candidateSlot, candidate.dataset.candidateId);
      const home = target?.closest?.('[data-measure-home-action]');
      if (home) event('homepage_primary_action', { action: home.dataset.measureHomeAction, region: region(win, doc) }, win);
      const saved = target?.closest?.('[data-measure-saved-action]');
      if (saved) event('saved_work_interaction', { action: saved.dataset.measureSavedAction }, win);
      if (target?.closest?.('a[href="#readiness-report"]')) reportOpened('anchor', { window: win, document: doc });
      const summary = target?.closest?.('#readiness-report summary'), details = summary?.closest?.('details');
      if (details) (win.setTimeout || globalThis.setTimeout)(() => { if (details.open && details.isConnected !== false) reportOpened('section', { window: win, document: doc }); }, 0);
    }, true);
    const state = { firstSelectionUsed: tracker.used }; mounted.set(doc, state); return state;
  }
  return { DEFINITIONS, event, firstSelectionTracker, reportOpened, downloadReport, mount };
});
