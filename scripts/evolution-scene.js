(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.PCP_SCENE_UI = api; api.mount({ document: root.document, window: root }); }
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const mounted = new WeakMap();
  function presentation(state = {}) {
    const usable = state.open === true && state.busy !== true && ['ready', 'partial'].includes(state.phase);
    return {
      busy: state.busy === true,
      state: ['closed', 'loading', 'updating', 'ready', 'partial', 'error', 'unavailable'].includes(state.phase) ? state.phase : 'closed',
      show: state.open === true || state.busy === true || ['error', 'partial'].includes(state.phase),
      canFocus: usable && state.focusAvailable === true,
      canOrbit: usable && state.reducedMotion !== true,
      orbit: usable && state.orbit === true && state.reducedMotion !== true,
      canClose: state.open === true || state.busy === true,
      canRetry: state.busy !== true && ['error', 'partial'].includes(state.phase)
    };
  }
  function mount({ document: doc = globalThis.document, window: win = globalThis } = {}) {
    if (!doc?.addEventListener || mounted.has(doc)) return mounted.get(doc) || null;
    const visual = doc.getElementById('pc-visual'), stage = doc.getElementById('scene-stage'), status = doc.getElementById('scene-status');
    if (!visual || !stage || !status || !win.PCP_SCENE) return null;
    const feedback = doc.createElement('div'); feedback.className = 'lab-scene-feedback';
    const indicator = doc.createElement('span'); indicator.className = 'lab-scene-indicator'; indicator.setAttribute('aria-hidden', 'true');
    feedback.append(indicator, status); visual.insertBefore(feedback, stage);
    const toolbar = doc.createElement('div'); toolbar.className = 'lab-scene-toolbar'; toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', 'Preview actions');
    const buttons = {};
    for (const [key, label] of [['focus', 'Focus selected part'], ['orbit', 'Auto rotate'], ['retry', 'Retry models'], ['close', 'Close preview']]) {
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'button secondary'; button.textContent = label; button.dataset.sceneAction = key;
      if (key === 'orbit') button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        const bridge = win.PCP_SCENE;
        if (!bridge || button.disabled) return;
        if (key === 'orbit') bridge.orbit(!presentation(bridge.state()).orbit);
        else if (key === 'retry') { const result = bridge.retry(); result?.catch?.(() => {}); }
        else bridge[key]();
        render();
        if (key === 'close') doc.getElementById('scene-open')?.focus?.();
      });
      toolbar.append(button); buttons[key] = button;
    }
    visual.insertBefore(toolbar, stage.nextSibling);
    const help = doc.createElement('p'); help.className = 'lab-scene-gestures'; help.textContent = 'Drag to rotate. Pinch to zoom. Use the view buttons for a fixed angle.';
    visual.insertBefore(help, toolbar.nextSibling);
    const intro = visual.querySelector('.scene-intro p');
    if (intro) intro.textContent = 'Explore your selected parts. Models show appearance, not verified fit.';
    const quality = doc.getElementById('scene-low');
    if (quality?.parentElement) quality.parentElement.lastChild.textContent = ' Lower render resolution';
    function render() {
      const state = win.PCP_SCENE.state(), value = presentation(state);
      feedback.dataset.state = value.state; toolbar.hidden = !value.show; help.hidden = !value.canClose;
      buttons.focus.disabled = !value.canFocus; buttons.orbit.disabled = !value.canOrbit;
      buttons.orbit.setAttribute('aria-pressed', String(value.orbit));
      buttons.orbit.title = value.canOrbit ? 'Rotate slowly until you interact, close, leave the viewport or hide this tab.' : 'Available after a model loads, with reduced motion turned off.';
      buttons.retry.hidden = !value.canRetry; buttons.close.disabled = !value.canClose;
      visual.querySelectorAll('[data-camera]').forEach(button => {
        if (button.textContent.trim() !== 'Reset') button.setAttribute('aria-pressed', String(button.dataset.camera === state.view));
      });
      visual.dataset.scenePhase = value.state;
    }
    const state = { render }; mounted.set(doc, state);
    doc.addEventListener('pcp:scene-state', render); render(); return state;
  }
  return { presentation, mount };
});
