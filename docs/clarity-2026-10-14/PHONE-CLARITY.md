# Phone clarity pass — October 14, 2026

## Confirmed problem

The live iPhone 16 / Pixel 9 design comparison was inspected in a separate connected-browser tab. At the desktop viewport, the Pixel 9 image was 507.25 px tall inside a 390 px figure. The image extended behind the 3D button and creator-credit area. The iPhone image stayed within its frame. This was a layout issue, not a reason to replace the verified image or map another model to Pixel 9.

## Implementation

- A dedicated phone stylesheet reserves equal image and 3D frames. Wide, square and portrait artwork use `object-fit: contain` inside definite bounds. Buttons and credits remain in the normal document flow.
- Phone comparisons have icon-led Size, 3D and Specs views. View buttons and keyboard arrows work before the specification request finishes. Opening a view never focuses an input or opens a mobile keyboard.
- Individual phone pages expose size, 3D and specification comparisons with the exact selected phone preserved. Unmapped catalog phones open the phone tools without pretending that another phone is their model.
- The hub keeps one clear entry area. Exact registered models receive a direct 3D link. Phones without an approved photograph retain a body-outline fallback based on known dimensions; no cross-model photograph is introduced.
- The Android Authority review block and the separate “Sources and how size is compared” disclosure are removed from the comparison workspace.
- Individual-page buying notes and specification sources are collapsed. The same-scale tool retains the concise screen-scale limitation.
- Creator attribution and licensing remain accessible in collapsed card credits and in the complete registry at `/builder/model-credits/#phone-<exact-id>`. The registry retains modifications and geometry limitations.
- Transitions are restricted to controls, phone artwork hover and view entry. Reduced-motion preferences disable them. Heavy 3D libraries and meshes remain opt-in.

## Integration

After the phone hub and optional review writers, before the final SEO pass:

```js
require('./phone-pages.cjs').decorate({ root, records, esc });
```

The main phone-pages generator copies the dedicated stylesheet. The final decoration is repeatable. It covers `/phones/`, `/phones/size-compare/`, individual phone pages, source/support pages, editorial phone comparisons and catalog phone detail pages when `records` is supplied.

## Verification

`node scripts/test-phone-clarity.cjs` passed 11 tests. The actual comparison controller ran in a minimal DOM/event VM: pre-request view switching, arrow-key focus, selected-phone sharing, loaded numerical differences, retained mode selection and request failure recovery were exercised. Generator tests cover cleanup, exact identity, idempotency, 3D-link eligibility and retained attribution. An additional test runs the actual phone-pages, continuation-site and final decoration generators in order to verify all three views, linked rotation and sharing survive integration. Syntax checks passed for the modified controller and generator files. The existing `check-phone-previews.cjs` identity, attribution and lightweight-loading check passed against the integrated output.

These tests do not establish browser layout, live 3D availability or deployment. Integrated desktop/mobile browser verification follows the complete build.

The first integrated HTTP check confirmed the hub and Pixel 9 detail page returned 200 with the requested cleanup. It found a build-order regression that omitted the Specs button: the base template had changed the exact marker used by the continuation writer. The accessibility helper class was moved to the final decoration, preserving the marker. The real-generator test verifies the correction; the full preview must be rebuilt before browser verification. The subagent browser context exposed no connected browsers, so post-change rendered bounds and live 3D controls were left to the parent QA browser. No global viewport or parent tab was changed.

## Sources and identity

No hardware fact, source verification date, phone specification or model mapping was changed. Pixel 9 Pro still has no approved photograph/model mapping in the current cohort. No measured camera, battery-life or fit claim was added.
