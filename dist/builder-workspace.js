/* Present the existing builder state; this module never selects or restores parts. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    window.PCP_BUILDER_WORKSPACE = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mount, { once: true }); else api.mount();
  }
})(function () {
  'use strict';
  const REQUIRED = ['cpu', 'board', 'ram', 'storage', 'psu', 'case'];
  const LABELS = { cpu: 'processor', board: 'motherboard', ram: 'memory', storage: 'storage', psu: 'power supply', case: 'case' };
  function selectionSummary(snapshot = {}, records = [], rules) {
    const index = new Map(records.map(part => [part.id, part]));
    const parts = Object.fromEntries(Object.entries(snapshot.parts || {}).map(([slot, ids]) => [slot, (Array.isArray(ids) ? ids : []).map(id => index.get(id)).filter(part => part?.cat === slot)]));
    const count = Object.values(parts).reduce((total, values) => total + values.length, 0);
    const report = rules?.createReadiness({ parts });
    const missing = report?.missing || REQUIRED.filter(slot => slot === 'storage' ? !(parts.ssd?.length || parts.hdd?.length) : !parts[slot]?.length);
    return { count, missing, conflicts: report?.counts.failed || 0, documented: report?.counts.passed || 0, unresolved: (report?.counts['needs-verification'] || 0) + (report?.counts.unperformed || 0) };
  }
  function mount() {
    const builder = document.querySelector('body[data-build-workspace] #builder');
    const bridge = window.PCP_BUILD, rail = builder?.querySelector('.builder-rail');
    if (!builder || !rail || !bridge) return;
    const selectors = window.PCP_BUILDER_SELECTORS, records = bridge.catalog(), index = new Map(records.map(part => [part.id, part]));
    const parts = builder.querySelector('.builder-parts'), report = builder.querySelector('#readiness-report');
    const oldNav = builder.querySelector('.builder-jump-nav');
    if (oldNav) { oldNav.classList.add('builder-category-nav'); const heading=parts?.querySelector('.builder-workspace-head'); if(heading&&heading.nextElementSibling!==oldNav)heading.after(oldNav); }
    if (oldNav) oldNav.querySelectorAll('a[href="#build-preview"],a[href="#build-status"]').forEach(link => link.remove());
    // Preview, readiness and secondary specifications are placed by program-builder.cjs.
    const priceSummary = builder.querySelector('#build-shopping-summary'); if (priceSummary && report) priceSummary.hidden = true;
    function render() {
      const snapshot = bridge.snapshot(), summary = selectionSummary(snapshot, records, window.PCP_BUILD_RULES);
      const completion = builder.querySelector('[data-builder-completion]');
      const completionText = !summary.count ? 'Start with a processor or load the starter build.' : summary.count + (summary.count === 1 ? ' part selected' : ' parts selected') + (summary.missing.length ? ' · ' + summary.missing.length + ' required categories still missing' : ' · required categories selected');
      if (completion && completion.textContent !== completionText) completion.textContent = completionText;
      for (const row of builder.querySelectorAll('.builder-row[data-builder-row]')) {
        const ids = snapshot.parts[row.dataset.builderRow] || [], part = index.get(ids[0]);
        row.dataset.selectedCount = String(ids.length);
        const state = row.querySelector('.builder-row-state'), stateText = ids.length ? ids.length + ' selected' : 'Not selected';
        if (state && state.textContent !== stateText) state.textContent = stateText;
        // A category thumbnail occupies the same space before and after selection.
        let frame = row.querySelector('.builder-workspace-thumbnail');
        if (!frame) { frame = document.createElement('a'); frame.className = 'builder-workspace-thumbnail'; row.querySelector('.builder-type')?.after(frame); }
        if (part) { frame.href = '/learn/' + encodeURIComponent(part.id) + '.html'; frame.setAttribute('aria-label', 'View ' + part.name); frame.removeAttribute('aria-hidden'); }
        else { frame.removeAttribute('href'); frame.setAttribute('aria-hidden', 'true'); frame.removeAttribute('aria-label'); }
        const asset = part && selectors?.imageFor(part, window.PCP_IMAGES || {}), key = part?.id + ':' + (asset?.src || 'icon');
        if (frame.dataset.assetKey !== key) {
          frame.dataset.assetKey = key; frame.replaceChildren();
          if (asset) { const image = document.createElement('img'); image.src = asset.src; image.alt = ''; image.width = 88; image.height = 76; image.loading = 'lazy'; image.decoding = 'async'; frame.append(image); }
          else if (row.querySelector('.builder-type svg')) frame.append(row.querySelector('.builder-type svg').cloneNode(true));
        }
        // Full identity/provenance remains on the product page; the framed image is decorative.
        row.querySelector('.builder-photo')?.remove();
      }
      const reviewLink = builder.querySelector('[data-builder-review-status]');
      if (reviewLink) {
        const text = summary.conflicts ? summary.conflicts + (summary.conflicts === 1 ? ' documented conflict' : ' documented conflicts') : summary.missing.length ? 'Review missing items' : 'Review compatibility';
        if (reviewLink.textContent !== text) reviewLink.textContent = text;
      }
      const shopping = builder.querySelector('#build-shopping-summary'); if (shopping && report) shopping.hidden = true;
    }
    document.addEventListener('pcp:build-state', render);
    document.addEventListener('pcp:build', render);
    let queued = false;
    new MutationObserver(() => { if (!queued) { queued = true; queueMicrotask(() => { queued = false; render(); }); } }).observe(builder.querySelector('#builder-parts'), { childList: true, subtree: true });
    render();
  }
  return { selectionSummary, mount };
});
