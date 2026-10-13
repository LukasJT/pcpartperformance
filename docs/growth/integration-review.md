# Growth integration review

Reviewed October 13, 2026. Scope: scripts/growth-site.cjs, growth-ui.js, growth-search.js, growth-search-core.cjs, css-compact.cjs, growth-tools.cjs/js/css and compatibility-evidence.cjs. Read-only application review, pure fixtures and existing unit suites. No full build, browser inspection, production deployment or article publication was performed by this reviewer.

## Confirmed findings and current status

| ID | Severity | Finding and reproduction | Status after parent integration |
|---|---|---|---|
| IR-01 | P1 | growth-site.cjs initially linked /tools/ram-latency/ and /tools/ssd-capacity/ from home/category/product actions. Neither was a declared route nor redirect. Existing canonical destinations are /tools/ram-latency-calculator/ and /tools/storage-capacity-planner/. | **Fixed in current source.** Rechecked all literal occurrences in the generator. Parent still owns generated-link verification. |
| IR-02 | P2 | growth-search.js initially classified /phones/compare/* as Hardware while PC comparisons were Guides. A VM DOM fixture searching “iPhone 16” gave zero Guides results but included both existing phone comparisons under Hardware. | **Fixed.** New search core puts comparisons in Guides. Current fixture confirms Guides includes them and Hardware excludes them; search10 tests pass. |
| IR-03 | P2 | css-compact.cjs initially transformed .a/**/.b{color:red} into .a .b{color:red}, changing compound selection to descendants. Existing nine fixtures omitted comments between selector tokens. | **Fixed.** Comment boundaries are now preserved with /**/ and the expanded CSS12 checks pass. |
| IR-04 | P2 | growth-ui.js labels board.source “Open recorded board documentation.” Current c-board B850 MAX, X870E CARBON and Z790 records use a generic MSI store-category source, while their verified socket fact has an exact specification/datasheet URL. This action does not reliably lead to board documentation. | **Open at review snapshot.** Prefer the verified socket/support source where available; otherwise accurately label a generic catalog source. Do not imply BIOS support has been checked. |

The initial three confirmed defects were reported immediately and corrected by the parent during review. This reviewer made no application-file changes. IR-04 is a navigation/source-labeling issue, not evidence that the documented socket facts are wrong.

## Evidence-backed checks that passed

- Exact current catalog reconstruction from the same seven static data scripts used by the build produced **1,216 rows and 1,216 distinct stable IDs across 18 categories**. The current coverage prose’s one-count-per-ID statement holds for this input. Coverage code counts catalog rows/source-link presence and shared-engine accepted fields; it does not claim full-product or market coverage.
- All current catalog source strings with content used HTTP/HTTPS. Dynamic source/reason/name text in the reviewed renderers is escaped. Search links are restricted to internal paths and protocol-relative links are rejected. No confirmed injection was found in these reviewed data paths; this is not a whole-site security certification.
- The exact BIOS result remains needs-verification even when the socket passes. Memory profiles, conditional slots, cable inventory, cooling and physical inspection remain separate unresolved checks. Intel/AMD capacity limits and model-specific variants have dedicated tests.
- The current PC benchmark register is empty. Its “0 approved measured PC records” claim agrees with that input. Console audit data contains **45 contexts, 41 with source IDs**, with no missing referenced source. Mode targets are expressly separated from sustained measured FPS.
- Coverage dates distinguish the build snapshot from original source inspection. New model facts retain their own dates, and prior facts keep their October 9 dates.
- The search form has a label and result status; result cards use H2 beneath the page H1. A current VM DOM fixture reproduced URL restoration for q=RAM&type=tools, restoring the input, filter and calculator results on popstate.
- The search generator marks the route data-stage2-noindex; seo-pass.cjs consumes that flag for robots exclusion and sitemap handling. This source inspection is not a fresh generated-output or production HTTP check.
- Diagnostic notes stay in local textarea/storage or a plaintext export. Saving requires the explicit local-save checkbox. Restored paths are graph-replay validated; ambiguous/data-bearing storage takes the preservation branch. No tool-side server fetch was observed by the existing fixture.
- Calculator results expose explicit units, unknown optional timings, manual throughput/allowance and their limited interpretation. The current fixtures verify bit/byte factors, decimal/binary units and timing formulas.

## Commands actually run

All passed:

| Command | Result |
|---|---|
| node --check scripts/growth-site.cjs | Pass |
| node --check scripts/growth-ui.js | Pass |
| node --check scripts/growth-search.js | Pass |
| node --check scripts/growth-search-core.cjs | Pass |
| node --check scripts/css-compact.cjs | Pass |
| node --check scripts/growth-tools.cjs | Pass |
| node --check scripts/growth-tools.js | Pass |
| node --check scripts/compatibility-evidence.cjs | Pass |
| node scripts/test-growth-tools.cjs | 16 tests |
| node scripts/test-growth-evidence.cjs | 14 tests |
| node scripts/test-growth-search.cjs | 10 tests |
| node scripts/test-css-compact.cjs | 12 checks after correction |

**52 current suite checks passed**, plus the read-only catalog-count and VM search/restoration fixtures. The initial CSS suite had nine checks and passed before the uncovered defect; the expanded current suite is the one counted above.

## Remaining release verification owned by parent

Resolve or accurately relabel IR-04. Then use the actual full build/link/indexing checks and browser desktop/mobile/theme/keyboard QA already assigned to the parent. This read-only review does not approve production deployment, human editorial status of six drafts, current price collection, search ranking outcomes or full WCAG conformance.
