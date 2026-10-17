(function (factory) {
  const retention = typeof module === 'object' && module.exports ? require('./completion-retention.js') : globalThis.PCP_RETENTION;
  const api = factory(retention);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { globalThis.PCP_COMPARE_RETENTION = api; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => api.mount()); else api.mount(); }
})(function (retention) {
  'use strict';
  function mount(options = {}) {
    const doc = options.document || globalThis.document, host = doc?.querySelector('[data-completion-compare-save]'); if (!host || !retention) return null;
    host.innerHTML = '<div class="program-actions"><button type="button" class="button secondary" data-save-current-comparison>Save comparison</button><a href="/my-pc/#workspace-saved-comparisons">Saved comparisons</a></div><p data-comparison-save-status role="status" aria-live="polite"></p>';
    const button = host.querySelector('[data-save-current-comparison]'), status = host.querySelector('[data-comparison-save-status]');
    const snapshot = () => options.getSnapshot ? options.getSnapshot() : globalThis.PCP_COMPARE_HISTORY?.snapshot?.();
    let storage; try { storage = options.storage || globalThis.localStorage; } catch { storage = null; }
    function refresh() {
      const current = snapshot(); button.disabled = !current || !Array.isArray(current.parts) || current.parts.length < 2 || current.parts.length > 4; button.textContent = 'Save comparison';
      try { if (typeof current?.onlyDifferences === 'boolean' && globalThis.location?.href && globalThis.history?.replaceState) { const url = new URL(globalThis.location.href); if (current.onlyDifferences) url.searchParams.set('differences', '1'); else url.searchParams.delete('differences'); globalThis.history.replaceState(null, '', url); } } catch {}
    }
    function save() {
      if (!storage) { status.textContent = 'Local storage is unavailable. Copy the comparison link or export its CSV instead.'; return { ok: false }; }
      const result = retention.saveComparison(storage, snapshot());
      if (result.ok) { button.textContent = 'Comparison saved'; status.textContent = (result.updated ? 'Saved comparison updated' : 'Comparison saved') + ' on this browser. Column order and a dated specification snapshot are kept in My PC.'; globalThis.PCP_EVENTS?.track('comparison_saved', { page_type: 'compare', action: result.updated ? 'updated' : 'created' }); }
      else status.textContent = result.error;
      return result;
    }
    button.addEventListener('click', save);
    doc.addEventListener('pcp:render', event => { if (event.detail?.scope === 'comparison') { refresh(); status.textContent = ''; } });
    // This is an ordinary display preference, not a private local record identifier.
    try { const url = new URL(options.href || globalThis.location.href), toggle = doc.querySelector('#differences-only'); if (url.searchParams.get('differences') === '1' && toggle && !toggle.checked) { toggle.checked = true; toggle.dispatchEvent(new Event('change', { bubbles: true })); } } catch {}
    refresh();
    return { refresh, save };
  }
  return { mount };
});
