# 3D preview usability refinement

Implementation date: October 19, 2026. Status: source and unit/integration checks completed; rendered browser verification remains pending. No new models, licensing permissions, fit certification or performance measurements are claimed.

## Implemented

- A live state bridge reports closed/loading/updating/ready/partial/error/unavailable. It reads real renderer outcomes rather than inferring success from a canvas existing.
- Existing status text is moved above the canvas, with an unobtrusive loading/state indicator. The same live-region element remains the controller's source of status information.
- Visible actions support **Focus selected part**, **Auto rotate**, **Retry models** when needed, and **Close preview**. Closing during an in-flight open cancels the open revision and prevents late graphics initialization. Closing returns keyboard focus to the original opener and preserves selected parts.
- Focus uses the actual loaded object's bounding box. If the selected component has no positioned model, the engine falls back to the whole layout and the controller states that limitation.
- Camera presets interpolate position and look target over 280 ms using an ease-out curve. Asset installation and initial framing remain immediate. User interaction cancels interpolation. Both OS and manual appearance reduced-motion settings apply the final view immediately, stop an active orbit, and update the controls without resuming rotation later.
- Auto rotation uses the existing OrbitControls API. It is off by default, unavailable without a loaded object, and disabled by reduced motion. Offscreen visibility, a hidden tab, user interaction, another camera preset and closing stop it. It does not resume without another explicit opt-in.
- The existing quality control changes actual renderer pixel ratio from a capped 1.5 to 1. Its label now says **Lower render resolution**; this does not claim lower-poly meshes or smaller model downloads.
- Touch hints are visible without opening advanced controls. Existing keyboard rotate/zoom controls, exploded layout, side-panel controls, model limits and creator credits remain available.
- Camera preset selection exposes pressed state. New toolbar controls have 44 px minimum touch height and a two-column mobile layout.

## Integration

```js
const scene = require('./evolution-scene.cjs');
scene.prepare({ root }); // before stylesheet compaction / SEO / route manifest
// Available to an existing all-page pass if needed:
html = scene.polishHTML(html, canonicalPath);
```

The module copies:

- `evolution-scene.js`: lightweight state/control adapter, imported only after an explicit preview action.
- `evolution-scene.css`: builder-only feedback/control styling.
- `evolution-scene-motion.js`: camera interpolation, imported by the 3D engine only when a preview is explicitly opened.

It decorates `/builder/` only and updates that route's assembly controller query version. There is no new library, renderer, model request, analytics event or account dependency. The builder dynamically imports the control adapter, Three and GLBs after the existing explicit preview action. The adapter reads the bridge's current state on arrival, so loading/ready/error state is not lost if an event occurred before the module finished loading. Its download is non-blocking; failure leaves the native controls working and permits another enhancement attempt on the next open.

Authoritative retained source edits:

- `dist/assembly-3d.js`: real state publication, safe control bridge, busy states and cancellation.
- `dist/build-scene.js`: focus, camera tween, opt-in rotation, visibility/reduced-motion cleanup and resolution reporting.

Those files are intentionally retained source in the current architecture. Do not delete `dist` as a generic clean step. The build module handles only the new helper assets; it does not recreate those retained engine/controller sources.

## State bridge

`window.PCP_SCENE` exposes:

- `state()`: current actual phase, rendered count, error count, open/busy state, active category, focus availability, camera view, orbit/reduced-motion state and selected resolution mode.
- `retry()`: retries the actual current scene or an unopened failed preview.
- `close()`: disposes the graphics context and cancels a pending open.
- `focus()`: focuses the active positioned component and returns whether one was found.
- `orbit(boolean)`: requests optional rotation and returns whether it was enabled.
- `quality(boolean)`: changes the actual renderer resolution only after a scene exists.

`pcp:scene-state` publishes these states for the lightweight interface. The bridge does not expose private notes, add components, substitute model identities, or certify geometry. It does not load graphics merely because the adapter subscribes.

## Tests actually run

| Command | Outcome |
| --- | --- |
| `node scripts/evolution-scene.test.cjs` | 15 passed: interpolation/cancel/reduced motion, UI mounting/state semantics, lazy integration, actual engine focus, orbit visibility/disposal, manual appearance integration and pixel ratio. |
| `node scripts/oct16-scene.test.cjs` | 31 passed: retained identity/loading/failure/framing checks plus state/cancel/retry and lazy-enhancement failure/late-load checks. |
| `node scripts/check-model-framing.cjs` | 60 projected camera/part configurations passed with padding. |
| `node scripts/completion-models-viewer.test.cjs` | 9 passed: product preview lazy load, controls, failure recovery, identity/path safety and focus. |
| `node --check dist/assembly-3d.js` | Passed. |
| `node --check dist/build-scene.js` | Passed. |
| `node --check scripts/evolution-scene.js` | Passed. |

The retained renderer harness now injects the real new camera helper and uses reduced motion for its geometry assertions. The standalone framing test evaluates the final camera geometry, while the new timing tests separately exercise interpolation. No original clipping assertions were removed.

Node emits the existing module-type warning when importing the retained vendored Three ES module from the CommonJS test project; tests pass. A package-wide module-mode migration would be unrelated and is not included.

## Browser acceptance still required

The parent task reported browser approval-service capacity failures. No launch workaround or bypass was attempted in this workstream. Before release, use an approved session to inspect:

1. Mobile/desktop open, load, focus, presets, optional rotation and close.
2. Model-catalog failure, GLB failure and context-loss recovery.
3. A missing cooler/standalone-only part alongside a positioned GPU.
4. Reduced motion and offscreen/tab-hide rotation stop.
5. Screen-reader status, keyboard order and close-focus return.
6. No initial Three/GLB request, and no idle continuous rendering.
7. Theme contrast, toolbar wrapping at 320/360/390 px, and visible last controls.
8. Actual GPU/render memory and frame behavior on a real mobile browser.

The source checks are not a substitute for these rendered inspections. No browser FPS, field Core Web Vitals or device battery improvement is claimed.

## Scope limits

This refinement improves an existing appearance preview. It does not add exact CAD, cable simulation, verified mounting coordinates, thermal analysis or new asset coverage. The existing illustrative placement and source-credit distinctions remain intact. Exploded views continue to be conceptual. Orbit is deliberately opt-in; it is not an ambient animation added to every page.
