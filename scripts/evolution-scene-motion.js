// Loaded with the 3D engine after the visitor explicitly opens a preview.
// Pure camera interpolation; no renderer, assets, timers or network access.
export function createCameraMotion({ read, apply, invalidate, reduced = () => false, now = () => performance.now(), duration = 280 }) {
  let transition = null;
  const copy = state => ({ position: state.position.slice(), target: state.target.slice() });
  const valid = state => state && ['position', 'target'].every(key => Array.isArray(state[key]) && state[key].length === 3 && state[key].every(Number.isFinite));
  function move(state, { smooth = true } = {}) {
    if (!valid(state)) return false;
    const to = copy(state), from = read();
    if (!smooth || reduced() || !valid(from)) { transition = null; apply(to); invalidate(); return true; }
    transition = { from: copy(from), to, started: now() };
    invalidate(); return true;
  }
  function step(time = now()) {
    if (!transition) return false;
    const t = reduced() ? 1 : Math.min(1, Math.max(0, (time - transition.started) / duration));
    const mix = 1 - (1 - t) ** 3;
    const value = {};
    for (const key of ['position', 'target']) value[key] = transition.from[key].map((v, i) => v + (transition.to[key][i] - v) * mix);
    apply(value);
    if (t === 1) transition = null;
    return transition !== null;
  }
  return { move, step, cancel() { transition = null; }, finish() { if (transition) { const value = transition.to; transition = null; apply(copy(value)); } }, active: () => transition !== null };
}
