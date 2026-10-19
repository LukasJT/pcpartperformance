# Builder, picker and hardware browsing

## Integration

`scripts/evolution-builder.cjs` exports `prepare({root})` and `polish(html, route)`.

Call prepare once before final HTML processing. Call polish after `ui-refinement.polish`, before CSS bundling. It preserves established builder IDs, source/evidence text, original selectors, local saves and model loading. `/builder/` gets the scoped stylesheet/runtime; hardware routes get only the small `evolution-catalog.css`, with **no new catalog JavaScript request**.

The precise authoritative catalog source change is in `dist/interface.js`: its existing `renderLibrary` now recognizes PC, device, peripheral and all scopes. No catalog records, photo bindings or other interface logic were replaced. The root defaults to PC components; explicit `?category=all`, devices, peripherals and exact category IDs remain supported. Counts and pagination use the filtered dataset rather than hiding rows after rendering.

`scripts/builder-selectors.js` changed. Run the existing central `node scripts/prepare-ui-runtime.cjs` after source integration. This workstream did not regenerate or edit any prepared manifest entries, avoiding a race with the parent integration.

Run `node scripts/prepare-evolution-builder-runtime.cjs` when the stage controller, retained workspace controller or retained guided journey source changes. It minifies these three scripts into `scripts/prepared-evolution/` with a separate `builder-manifest.json`, leaving the global theme/motion manifest independent. `prepare({root})` validates both source and output hashes before delivering these scripts. Their public URLs and source semantics remain unchanged. The three delivery files total **1,610 fewer gzip bytes** than their readable sources in this checkpoint (673 + 617 + 320 bytes). This is a static delivery measurement, not a field Core Web Vitals claim.

## Behavior

- The three original anchor destinations now control one visible stage: choose parts, explore build, review and save. Back/forward and direct report/save links restore the right stage.
- `data-evolution-ready` only appears once the controller mounts. Without JavaScript, existing sections and links stay visible.
- Guided mode retains its original next/back logic and exact native selects. Direct component jumps remain in the collapsed **Your components** control; expert mode retains all rows and quantities.
- Progress counts selected categories and selected item quantities. It explicitly does not express a compatibility percentage or imply that optional categories are required.
- Review retains original compatibility, unknown-price, quote, ownership, source and save behavior. Print exposes every stage.
- Picker skip/removal is a secondary button outside the product list. Empty choices cannot displace the first real product or corrupt arrow-key cursor indices. Preference selects retain empty native values where appropriate.
- Search remains visible without automatically receiving focus. The results list receives focus when opening. Search focus closes expanded filters, and `visualViewport` sizing keeps the full-height mobile sheet aligned when a software keyboard changes the visible viewport.
- All ten categories now have distinct original vector fallback icons. Accepted existing photos remain unchanged; another SKU is not substituted.
- Filter groups start collapsed. The optional 3D checkbox is inside Filters; model count is beneath the title. Touch layouts omit keyboard hints.

## Selectors and test changes

- `[data-evolution-builder]` and `[data-evolution-ready]` scope the controller.
- `[data-evolution-stage="parts|preview|review"]` tracks presentation only.
- `[data-evolution-stage-panel]` and native `hidden` supply both visual and accessibility state.
- Original workflow IDs `builder-workflow`, `builder-choose`, `build-preview`, `readiness-report`, `build-revisions` remain.
- `.builder-picker-skip` replaces `.picker-empty-option` for actual component empty choices. Existing tests should click this button, rather than a listbox row.
- `.builder-picker-count` contains result count. `.select-hint` now contains desktop keyboard help, with no mobile instructional footer.
- `.builder-picker-models input` is now inside closed `.builder-picker-filters`; open Filters before checking it in interaction tests.
- `.evolution-catalog-scopes` contains three ordinary links. `renderLibrary` maintains `aria-current` from its actual category selection.

## Verification and remaining checks

Executed: `node --test scripts/evolution-builder.test.cjs` — ten checks passed, covering idempotent transformation, scoped preparation, prepared source/output fingerprints and retained API behavior, deep links, state-preserving stage visibility/back navigation, quantity progress, skip cursor projection, all ten category vectors, real catalog source filtering and motion/keyboard safeguards. The combined builder/diagram/completion-integration run passed **34 tests**. The existing builder workspace check passed all **11 checks**. The completion catalog VM test now executes the actual scope declaration prelude; selected/unselected visible-label assertions were preserved unchanged.

Browser screenshots and full regression testing remain the parent release gate. An automatic approval service capacity error prevented the parent browser launch at this checkpoint. No alternate browser path was used. In particular verify 320px, open PSU/CPU picker, software-keyboard emulation, all themes, expert mode, final guided Next to review, 3D load, local save/restore, print, reduced motion, and layout overflow.

No compatibility rules, prices, benchmark claims, stored-data schemas, product identity, asset licensing, advertisements, article publication or production deployment changed in this workstream.
