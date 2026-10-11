# Builder legacy CSS dependencies

Checked October 11, 2026 against `scripts/builder-workspace.css`, the current builder HTML, inherited styles, `builder-cooling.js`, and `assembly-3d.js`. Both legacy stylesheet links remain required. No generator or stylesheet changes were made during this review.

The generated files currently contain 4,480 bytes (`builder-reading.css`) and 10,900 bytes (`builder-studio.css`) before compression or bundling. Those sizes are not the marginal size of the final compressed page bundle.

## Rules to preserve before removing builder-studio.css

| Selectors | Required behavior or presentation |
| --- | --- |
| `.fan-layouts`, its `fieldset`, `legend`, `label`, `p`, and `small` | Fan mounting-position and airflow controls span the complete component row, fit within the row, and collapse to one column on small screens. `builder-cooling.js` still creates these controls. |
| `.fan-fit.pass`, `.fan-fit.fail`, `.fan-fit.unknown`, and dark-theme overrides | Distinguish documented fan fit, conflicts, and unknown fit with readable status colors. |
| `.scene-stage.is-empty:after` | Displays the model-loading/coverage fallback message assigned by `assembly-3d.js`. |
| `#pc-visual:has(.scene-intro:not([hidden])) :is(.scene-components,.scene-inspector)` | Hides secondary inspection controls while the unopened preview introduction is visible. |
| `.scene-advanced`, its `summary`, and `[open] summary` | Keeps the expandable rotate, zoom, retry, exploded-view, side-panel and detail controls discoverable. |
| `.scene-toggles`, `.scene-components`, `.scene-components button`, `.scene-inspector`, `.scene-notes` | Preserves control layouts, mobile stacking, inspector spacing, and coverage-note spacing. The workspace stylesheet does not replace these rules. |
| `.builder-jump-nav`, its anchors and hover state | Supplies the category-navigation container's flex layout, wrapping, borders and link presentation. Workspace CSS adjusts spacing and individual links but still depends on that container layout. |
| `.builder-column-head` | Hides the inherited duplicate column heading beneath the new workspace heading. |
| `.builder-option-note` | Keeps the native picker note readable instead of falling back to the legacy 9px style. |
| `.build-price-card summary`, `.build-price-card small` | Preserves presentation of the existing current-offer controls. |

Most studio rules for the main shell, component cards, preview heading and rail have workspace replacements. Removing the complete file would also remove the dependencies above.

## Rules to preserve before removing builder-reading.css

| Selectors | Required presentation |
| --- | --- |
| `.build-spec`, `.build-spec :is(span,strong)` | Sets spacing and readable specification text. The active System specifications panel otherwise inherits 10px/11px child text from `builder-legacy.css`. |
| `.performance-note`, `.performance-lead span`, `.performance-lead strong`, `.profile-score span`, `.profile-score small`, `.profile-bars>div` | Raises text sizes and normalizes letter spacing in the active Hardware outlook panel. Workspace CSS currently styles its summary, not these generated rows. |
| `.shopping-summary-label`, `.eyebrow` | Keeps existing current-offer labels readable and removes inherited uppercase tracking. |
| `.builder-heading .eyebrow` | Hides the superseded heading label. |
| `.builder-index` | Clears the legacy index border and full-height treatment. Workspace CSS does not explicitly reset those two properties. |
| `.pc-visual-status`, `.assembly-legend`, `.assembly-legend button`, `.assembly-toolbar>span`, `.assembly-view-switch button`, `.assembly-product` text and `.assembly-empty span` | Preserves inherited assembly-control and fallback typography. These scene-related rules have no complete replacement in workspace CSS. |

## Safe future removal

Transfer the retained rules and their mobile/dark variants into the dedicated workspace stylesheet, then remove the two links in `program-builder.cjs` before the final CSS bundling step. Check selected fan controls, expanded specifications/outlook, current-offer labels, and the unopened, empty, loaded and failed 3D states during the central visual review.

Keep `build-scene.css`, `builder-refresh.css`, `builder-legacy.css`, and `builder-program.css`; this review did not establish that their functional foundations can be removed.
