/* A progressive view of the same build. No part, price or compatibility state is
 * copied into this controller, and the full HTML remains useful without it. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    window.PCP_EVOLUTION_BUILDER = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mount, { once: true });
    else api.mount();
  }
})(function () {
  'use strict';
  const SLOTS = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan', 'cooler'];
  function stageForHash(hash = '') {
    if (/^#(?:build-preview|pc-visual|scene(?:-|$))/.test(hash)) return 'preview';
    if (/^#(?:readiness(?:-|$)|build-(?:revisions|status|shopping)|program-(?:readiness|spending|revision|save|status|print))/.test(hash)) return 'review';
    return 'parts';
  }
  function selectionProgress(parts = {}) {
    const selected = SLOTS.filter(slot => Array.isArray(parts[slot]) && parts[slot].length > 0).length;
    const count = SLOTS.reduce((total, slot) => total + (Array.isArray(parts[slot]) ? parts[slot].length : 0), 0);
    return { selected, total: SLOTS.length, count };
  }
  function mount() {
    const builder = document.querySelector('[data-evolution-builder]');
    if (!builder || builder.dataset.evolutionReady) return;
    const workflow = builder.querySelector('#builder-workflow');
    if (!workflow) return;
    const links = [...workflow.querySelectorAll('a[href^="#"]')];
    const panels = {
      parts: [builder.querySelector('.builder-parts'), builder.querySelector('#build-plan')],
      preview: [builder.querySelector('#build-preview')],
      review: [builder.querySelector('#readiness-report'), builder.querySelector('#build-status'), builder.querySelector('#build-revisions')]
    };
    // Stable links and no-JS content remain anchors; this is intentionally not a
    // second tab router or another source of persisted builder state.
    for (const [stage, list] of Object.entries(panels)) for (const panel of list) if (panel) panel.dataset.evolutionStagePanel = stage;
    let stage = stageForHash(location.hash);
    const heading = builder.querySelector('#builder-guidance');
    let progress = builder.querySelector('.evolution-selection-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'evolution-selection-progress';
      progress.innerHTML = '<span data-evolution-selection-count>Choose your first part</span><progress max="10" value="0" aria-label="Component categories selected"></progress>';
      if (heading) heading.after(progress);
      else builder.querySelector('#builder-parts')?.before(progress);
    }
    function show(next, focus = false) {
      stage = next;
      builder.dataset.evolutionStage = stage;
      links.forEach(link => {
        const current = stageForHash(link.hash) === stage;
        if (current) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
      // hidden supplies correct accessibility semantics, rather than just making
      // off-stage controls transparent or moving them outside the viewport.
      for (const [name, list] of Object.entries(panels)) for (const panel of list) if (panel) panel.hidden = name !== stage;
      const rail = builder.querySelector('.builder-rail');
      if (rail) rail.hidden = stage === 'parts';
      if (focus) {
        const target = stage === 'parts' ? builder.querySelector('#builder-guidance h2') || builder.querySelector('.builder-workspace-head h2') : panels[stage][0]?.querySelector('h2,h3');
        if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
      }
    }
    function sync() {
      const current = window.PCP_BUILD?.snapshot?.();
      const state = selectionProgress(current?.parts);
      const label = progress.querySelector('[data-evolution-selection-count]');
      const copy = state.count ? state.count + (state.count === 1 ? ' part selected' : ' parts selected') : 'Choose your first part';
      if (label.textContent !== copy) label.textContent = copy;
      const bar = progress.querySelector('progress');
      bar.value = state.selected;
      bar.setAttribute('aria-valuetext', state.selected + ' of ' + state.total + ' categories selected; optional categories may be empty. This is not a compatibility score.');
      const stepList = builder.querySelector('.oct16-step-list');
      const summary = stepList?.querySelector('summary');
      if (summary && summary.textContent !== 'Your components') summary.textContent = 'Your components';
      const next = builder.querySelector('[data-guided-next]');
      if (next && next.textContent === 'Next component') next.textContent = 'Continue';
      const previous = builder.querySelector('[data-guided-previous]');
      if (previous && previous.textContent !== 'Back') previous.textContent = 'Back';
    }
    builder.addEventListener('click', event => {
      const link = event.target.closest('a[href*="#"]');
      if (link) {
        const target = new URL(link.href, location.href);
        if (target.origin === location.origin && target.pathname === location.pathname && target.hash) {
          const next = stageForHash(target.hash);
          if (next !== stage || workflow.contains(link)) show(next, workflow.contains(link));
        }
      }
      const next = event.target.closest('[data-guided-next]');
      if (next?.textContent === 'Open build review') {
        show('review', true);
        const url = new URL(location.href); url.hash = 'readiness-report';
        history.pushState(null, '', url);
      }
    });
    builder.addEventListener('change', event => {
      const slot = event.target.dataset?.buildPrimary || event.target.dataset?.buildSlot || event.target.dataset?.buildAdd;
      if (!SLOTS.includes(slot) || builder.dataset.oct16Mode !== 'guided') return;
      // Changing category inside the picker must reveal that category after
      // selection. Wait for the original native-change/state handlers first.
      queueMicrotask(() => {
        const row = builder.querySelector('[data-builder-row="' + slot + '"]');
        if (row?.hidden) builder.querySelector('[data-guided-step-id="' + slot + '"]')?.click();
      });
    });
    window.addEventListener('hashchange', () => show(stageForHash(location.hash)));
    window.addEventListener('popstate', () => show(stageForHash(location.hash)));
    document.addEventListener('pcp:build', sync);
    document.addEventListener('pcp:build-state', sync);
    let queued = false;
    new MutationObserver(() => {
      if (!queued) { queued = true; queueMicrotask(() => { queued = false; sync(); }); }
    }).observe(builder.querySelector('#builder-parts') || builder, { childList: true, subtree: true });
    builder.dataset.evolutionReady = 'true';
    show(stage); sync();
  }
  return { SLOTS, stageForHash, selectionProgress, mount };
});
