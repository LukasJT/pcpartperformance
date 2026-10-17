# Optional action measurement

## Release state

No analytics adapter, tracking backend, new page-view call or consent bypass was added. The existing `PCP_EVENTS` adapter/consent gate remains authoritative. The optional controller is **disabled in generated pages by default**, so it introduces no default script request or startup work.

```js
require('./completion-measurement.cjs')({ root, enabled: false });
```

The generator copies the optional source asset but does not reference it in page HTML while disabled. It also removes an earlier reference when switching back to disabled. The reader workflows keep working through the existing controllers and report-export fallback.

Only enable with `{ enabled: true }` after a real permitted analytics adapter and the site's consent mechanism are configured and tested. Even in that mode, every event still requires `PCP_ANALYTICS.enabled === true`, `consentGranted === true` and a callable `send`. No pre-consent events are queued or replayed. A denied, missing or throwing adapter does not break user actions.

When enabled, the generator scopes the module to `/`, `/builder/`, `/search/` and `/my-pc/`. On the builder it must load **before `builder-v2.js`** because that retained controller stops propagation of picker change events. This ordering is tested.

## Implemented definitions

All parameters are selected from finite definitions. Only `page_type`, `action`, permitted `category` and `CA`/`US` `region` can reach the existing event adapter. Search text, result URLs, product IDs, revision names/IDs, part lists, purchase amounts, private notes and warranty data are never passed.

| Event | Actual trigger | Meaning and limits |
| --- | --- | --- |
| `homepage_primary_action` | A tagged Build, Upgrade or Compare hero action is activated. | Intent, not a completed tool session. |
| `builder_first_selection` | The first observed explicit picker/alternative action on this open page commits a changed exact selection. | Page-local first action only. Startup, saved-list restoration, starter loading, rejected changes, identical choices and removals do not count. No persistent visitor identity is created. |
| `build_report_opened` | An explicit report anchor, opened report section, or integrated guided-review action with an available report. | Navigation/section interaction, not a page view, dwell measurement, completed build or compatibility guarantee. |
| `build_report_download_requested` | An explicit call from the report-download button. | Request only, even if later preparation fails. |
| `build_report_export_created` | JSON serialization, local Blob URL creation and the browser download-link dispatch succeed. | The browser received a prepared export. JavaScript cannot establish that a file was saved to disk. |
| `build_report_export_failed` | Report validation, serialization, Blob/URL creation or download dispatch fails. | Failed preparation; no private error message is sent and the selected build is unchanged. |
| `build_revision_restored` | A known local revision is applied through the restore link or Load revision control and rendering succeeds. | Saved context restored; URL part selections remain authoritative for local restore links. Missing IDs and ordinary initial loads do not count. |
| `saved_work_interaction` | Existing build/upgrade/comparison links are activated, or an existing notebook is opened/selected or successfully saved. | Action on local saved work. It is not a unique returning-person count. Failed quota writes and invalid selections do not count as saves. |
| `search_result_selected` | A currently rendered result anchor is activated, including a middle click. | Result-type category only. Typing, query restoration, result counts, empty results and unrelated links do not emit it. |

`action` values are declared in `completion-measurement.js`; only the corresponding event's values are accepted. Result categories are hardware, comparisons, guides, tools, reports, data or other. First-selection categories use the shared ten PC component slots. The existing adapter retains its short duplicate-suppression behavior; counts are events subject to consent and browser limitations, not a perfect census.

## Integration hooks

Minimal existing-controller edits:

- `builder-program.js`: emit only after applying a known saved revision. Regenerate its prepared browser output with the established `prepare-master-runtime.cjs` flow before building.
- `growth-search.js`: look up the type of the currently rendered selected result locally, then pass only that category and activation kind.
- `oct16-workspace.js`: tag links to real saved records and emit after successful notes/journal saves and valid notebook selection. Rendering, refresh and storage events emit nothing automatically.

The existing report-export callback keeps its fallback and begins with:

```js
if (window.PCP_MEASUREMENT) {
  window.PCP_MEASUREMENT.downloadReport({ session, document, window });
  return;
}
```

For an existing guided-review control that successfully opens the report, the optional helper is `PCP_MEASUREMENT.reportOpened('guided_review', { window, document })`. It refuses empty/unavailable reports. Do not use it on startup or a generic preferences action.

The parent owns allowlisting these nine names in the existing `dist/program-events.js`, connecting the generator, and the report-handler guard. No price/model/interface/root-runner files were changed by this task.

## Verification

- `node scripts/completion-measurement.test.cjs`: **20 passed** using the actual consent gate, actual builder/search/workspace controllers, and synthetic DOM/storage/export fixtures.
- `node scripts/oct16-workspace.test.cjs`: **32 passed**.
- `node scripts/test-growth-search-client.cjs`: **7 passed**.
- `node scripts/check-builder-program.cjs`: **18 passed**.
- `node scripts/check-program.cjs`: **13 passed**.
- Six changed JS/CJS files passed the repository ESLint rules with **0 errors and 0 warnings**.

The tests cover disabled/denied consent, finite safe fields, duplicate suppression, throwing adapters, first real selection versus restores/rejections, successful/failed file preparation, private payload exclusion, successful local restoration, quota failures, search navigation and default-disabled generator behavior.

The optional unminified module is approximately **2.9 KiB gzip** and is not loaded by default. This is an asset measurement, not a page performance or field Core Web Vitals claim. The parent retains browser/release QA. This task did not run a full build, activate analytics, commit or deploy.
