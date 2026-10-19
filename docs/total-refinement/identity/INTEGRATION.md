# Identity quarantine integration — October 19

Seven unresolved exact identities remain available as saved-reference stubs. Their stable IDs are not renamed, aliased, replaced or removed. Original speculative fields remain only in the build-time audit record supplied by `identity-review-oct19.cjs`.

## Delivery and saved work

- `build-pages.cjs` applies identity review after completion preparation and before image/catalog delivery.
- `build-model-library.cjs` writes the source bootstrap completion payload before reviewing its in-memory model records. The explicit `identity-review-catalog.js` patch clears the seven bootstrap records before the legacy interface runs. This preserves the original-source preflight on subsequent builds while preventing stale facts from reaching active comparison controls.
- The builder catalog retains all seven stubs. Its lookup and `PCP_BUILD.load` preserve saved IDs, including repeated memory/storage IDs. Fresh dropdowns omit them; the currently selected recovery reference remains visible. Add-another lists and `PCP_BUILD.select` reject a new quarantined selection.
- My PC retains stubs in its normalization lookup. Existing notes/revisions are not mutated. Acquisition and watch search choices exclude new quarantined selections; saved references remain readable.
- Upgrade data retains the recovery references, including imported/owned inventory. New inventory/replacement choices exclude them. Restored inventory explicitly adds its retained option for display.
- Builder delivery omits the audit's `identityReview.original` packet. It includes the compact identity warning and eligibility flags.

## Readiness, discovery and SEO

`compatibility-evidence.cjs` returns unknown evidence for quarantined identities even if a later caller supplies a purported verified field. Each selected unresolved identity adds a `needs-verification` check containing its specific warning. No automatic replacement, positive compatibility assertion or new photograph is inferred.

Fresh static catalogs, legacy interactive catalog/picker lists, shopping data and search indexing exclude these records. Direct product URLs remain accessible. Final SEO cleanup adds `noindex,follow`, displays the warning, removes Product structured-data assertions and excludes those URLs from sitemaps. Source links and saved build links remain usable.

The cooler-socket check separately handles bounded source lists: explicit documented membership can establish a narrow match, but absent membership with `exhaustive:false` becomes `needs-verification`. Existing explicit complete-list negative behavior remains unchanged.

## Verification

```powershell
node --test scripts/identity-review-oct19.test.cjs scripts/identity-integration-oct19.test.cjs
node scripts/prepare-master-runtime.cjs
node scripts/prepare-total-runtime.cjs
node scripts/identity-integration-oct19.browser.cjs
```

Fourteen source/unit integration tests passed. They exercise actual builder-engine save/load restoration of all seven IDs, API new-selection rejection, My PC storage preservation, readiness evidence, compact legacy delivery, old-URL noindex/sitemap/schema behavior, current-catalog preflight and bounded cooler-list semantics. Prepared compatibility and builder artifacts were regenerated. The browser runner requires the parent's fresh build/preview; an unexecuted browser runner is not a passing journey result.

The browser runner uses a disposable profile and clearly labeled local test builds, prints JSON, and performs no production writes. `PCP_TOTAL_ORIGIN`, `PCP_PLAYWRIGHT_MODULE` and `PCP_BROWSER_EXE` can override its defaults. The URL fixture includes the full public part snapshot and local restore ID, following the workspace contract.

No full build, deployment, shared photo registry edit or Git operation was performed by this integration lane. Transfer budgets remain unchanged.
