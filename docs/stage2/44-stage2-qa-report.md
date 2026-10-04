# Stage 2 QA report

Verified locally October 4, 2026. Native hosting deployment remains unverified.

## Automated results

- 1,363 HTML pages checked: unique titles, H1s, descriptions, canonical/indexing policy, parseable schema and 72,798 valid local references.
- 738 canonical indexable URLs; 605 excluded pages; 20 canonical product aliases.
- Preserved ten Stage 1 priority pages and crawlable discovery of all 1,186 product IDs.
- Stage 2: 36 new pages, eight sourced guides, seven calculators, five phone records.
- Actual arithmetic tests cover unit conversion, blank-versus-zero inputs, negative/out-of-range inputs, platform differences, recording allowance, AI overhead and phone dimensions.
- MSI rule checks verify x4 M2_3 alone, x2/x2 sharing, PCI_E2 always up to x2, and the Ryzen 8500/8300 M2_2 restriction.
- News tests cover approval/deployment gates, future dates, two-day expiry, escaped XML and deduplicated URLs. No draft receives NewsArticle markup or a publication timestamp.
- Optional Node API checks cover GET, HEAD, ETag/304, 404, 405, 429 and rate-window expiry. The adapter is not deployed.
- Ad gating tests cover default off, consent, GPC and excluded interactive pages. No ad scripts were installed.
- All seventeen original publication images are 1200 × 675 PNGs.
- New math/UI scripts total approximately 4 KB gzipped. This is an asset-size result, not a field speed score.

## Browser verification

Every new route was inspected at 1440 × 900 and 390 × 844: 72 route/viewport observations, no document-level horizontal overflow, no failed loaded images. The sweep used light mode; tools and phone layouts also received dark-mode visual inspection. Unloaded lazy images were not treated as failures.

Controls tested: electricity calculation (43.80 CAD per year for 200 W × 4 hours/day at 0.15/kWh), phone selectors/overlay, MSI slot checkboxes/CPU restriction, local search, saved-item addition and removal, and theme switching. Saved test items were removed afterward.

See `browser-qa.json`, `validation.json`, `../seo-validation.json` and `../seo-launch/launch-validation.json` for evidence and scope. Local browser results do not establish mobile physical-device performance, deployed HTTP behavior, field Core Web Vitals or ranking improvement.

## Failures and repairs

- The old preview server had stopped. Restarted the local server; a fresh browser tab loaded it successfully.
- Exact Playwright label matching failed for one select despite a correct accessible combobox name; retested successfully with its role/name.
- Overwriting generated PNGs initially failed with a Windows access error. The generator now compares hashes and safely handles checked asset paths; its idempotent rerun passed. No broken images remained.
- Source intake initially failed using Node’s default certificate store. Running with `--use-system-ca` fetched ten official release entries; an immediate repeat used the 15-minute cache. No certificate validation was disabled.
- Preferred Sources eligibility page could not be accessed through the web tool. Eligibility remains unverified; no button or account claim was added.
- Native Sites source/save/deploy/status capabilities are absent. No live deployment was attempted through a substitute credential route and no live success is claimed.
