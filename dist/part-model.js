/* Load the renderer and model only after the visitor asks for a 3D view. */
let rendererModule = null;
const viewers = new Set();
const localModelPath = value => typeof value === 'string' && /^\/assets\/models\/(?:completion\/)?[a-zA-Z0-9_.-]+\.glb$/.test(value);
async function engine() {
  if (!rendererModule) rendererModule = import('/build-scene.js?v=20261016c').catch(error => { rendererModule = null;throw error; });
  return rendererModule;
}

for (const button of document.querySelectorAll('.part-model-open')) {
  const section = button.closest('.part-model'), stage = section?.querySelector('.part-model-stage');
  if (!section || !stage) continue;
  const status = document.createElement('p');status.className = 'part-model-status';status.setAttribute('role', 'status');status.setAttribute('aria-live', 'polite');
  const controls = document.createElement('div');controls.className = 'part-model-controls';controls.hidden = true;controls.setAttribute('role', 'group');controls.setAttribute('aria-label', '3D model controls');
  section.append(controls, status);
  let scene = null, revision = 0, busy = false;
  const actions = [];
  function action(text, run, label = text) {
    const control = document.createElement('button');control.type = 'button';control.className = 'button secondary';control.textContent = text;control.setAttribute('aria-label', label);control.addEventListener('click', run);controls.append(control);actions.push(control);return control;
  }
  function close(focus = false) {
    revision++;busy = false;scene?.dispose();scene = null;stage.replaceChildren();stage.hidden = true;stage.setAttribute('aria-busy', 'false');controls.hidden = true;
    button.hidden = false;button.disabled = false;button.textContent = 'Open 3D view';status.textContent = '3D view closed. Product specifications remain available.';
    if (focus) button.focus({ preventScroll: true });
  }
  function fail(message) {
    scene?.dispose();scene = null;stage.replaceChildren();stage.hidden = true;stage.setAttribute('aria-busy', 'false');controls.hidden = true;
    button.hidden = false;button.disabled = false;button.textContent = 'Try 3D view again';status.textContent = message;
  }
  const closeButton = action('Close 3D view', () => close(true));
  action('Reset', () => scene?.view('angled'), 'Reset the 3D camera');
  action('Front', () => scene?.view('front'), 'View model from the front');
  action('Side', () => scene?.view('side'), 'View model from the side');
  action('Rotate left', () => scene?.rotate(-1));action('Rotate right', () => scene?.rotate(1));
  action('Zoom in', () => scene?.zoom(.85));action('Zoom out', () => scene?.zoom(1.15));
  stage.addEventListener('scene-failed', () => { revision++;busy = false;fail('The graphics connection was lost. Retry the 3D view; the product information is preserved.'); });
  button.addEventListener('click', async () => {
    if (busy || scene) return;
    if (!localModelPath(button.dataset.model)) { fail('This 3D asset is unavailable. Product specifications and source links remain available.');return; }
    const attempt = ++revision;busy = true;button.disabled = true;button.textContent = 'Loading 3D view…';status.textContent = 'Loading the model. You can close this view at any time.';
    controls.hidden = false;for (const control of actions) control.disabled = control !== closeButton;
    stage.hidden = false;stage.setAttribute('aria-busy', 'true');
    try {
      const module = await engine();if (attempt !== revision) return;
      scene = module.createBuildScene(stage, () => {});
      const id = button.dataset.modelId || button.dataset.model, name = button.dataset.modelName || section.querySelector('h2')?.textContent || 'Product', category = button.dataset.modelCategory || 'product';
      const record = { id, category, model: button.dataset.model, status: 'community', standaloneOnly: true, scaleMode: 'uniform-autoframe', dimensionsMm: null };
      const result = await scene.inspect({ id, name, slot: category, index: 0, record });
      if (attempt !== revision || result.stale) return;
      if (!result.rendered || result.failed.length) throw Error('Selected model could not be rendered.');
      const focused = document.activeElement === button;button.hidden = true;stage.setAttribute('aria-busy', 'false');for (const control of actions) control.disabled = false;
      status.textContent = 'Drag to rotate, pinch or scroll to zoom, or use the view controls. Model appearance does not certify physical fit.';
      if (focused) stage.querySelector('canvas')?.focus({ preventScroll: true });
    } catch (error) {
      if (attempt !== revision) return;
      console.error('Product model:', error);fail('3D view could not load. Retry below; the product specifications and source links remain available.');
    } finally { if (attempt === revision) { busy = false;button.disabled = false; } }
  });
  viewers.add(close);
}
window.addEventListener('pagehide', () => { for (const close of viewers) close(); });
