# Master continuation release

October 16, 2026, Toronto. This report supersedes the earlier October 16 checkpoint for the features listed here. It does not turn every long-term aspiration into a completed feature.

**Release state: implemented and live at https://www.pcpartperformance.com/.** Public release marker and 58 HTTP/HTML/API checks confirm commit `33f252e9a9f5a04d8a5e073d0418d300ada123ed`. The daily price workflow completed successfully. Cloudflare's GitHub build check still reports failure; the served release is verified independently, but the remote build/status discrepancy remains unresolved.

## Implemented

- **Saved decisions:** `/my-pc/` now preserves exact saved comparisons, their dated specification snapshot/differences, planned versus acquired quantities, manual purchase prices, optional warranty dates and local revisit notes. Existing builder revisions remain intact. No account, email delivery or background notification is implied.
- **Safe parts-list import:** `/upgrade/` reviews every pasted line, requires an exact selection or explicit exclusion, shows quantities and confirms the replacement inventory before applying it. Unknown names and pasted URLs are not installed or fetched automatically. Cooling, repeated parts, old backups, cancellation and private notes are preserved.
- **Real models and pictures:** ten additional downloaded GLBs, eight source-supported catalog records, five exact manufacturer images and three credited renders of actual models. Every acquired asset has a reachable product viewer; practical builder items have a standalone inspector that can return to the assembly layout. Controls include rotation, zoom and camera presets. Loading is explicit, texture errors are recoverable and licenses remain visible.
- **Pricing:** the existing morning pipeline now supports 12 exact listings, including CORSAIR in both countries and more Canada Computers records. The ordinary check at 01:51 UTC October 17 refreshed ten records, rejected two, and retained 26 actual historical observations. The independently verified GitHub job then refreshed ten again and preserved 36 historical records. Multiple merchants are preserved; minima exclude sold-out/unknown-condition records. Region changes use independent CAD/USD observations. History is opt-in, sparse and separate from current totals.
- **SEO/layout:** resolved 11 duplicate-title and four duplicate-description clusters without merging unverified variants. Clarified 16 product scopes, 84 regional prebuilt descriptions and five game pagination titles. Preserved the exact old Skytech configuration through one-step redirects and old saved-list ID recovery. Added concise topic breadcrumbs for the new material.
- **Accessibility:** fixed selected-button voice labels, keyboard-scrolling comparison tables and calculator heading order. The workspace uses the existing modern picker, with list focus rather than automatic search-keyboard focus. Mobile and desktop light/dark checks are recorded below.
- **Delivery and protection:** reduced repeated initial catalog data while preserving compatibility evidence and full model metadata. Added a tested, resource-compatible CSP and normal security headers. Optional analytics hooks are implemented but disabled, with no new default script request, tracking destination or page view.

## Editorial release

Twelve complete items: **nine new canonical guides and three material revisions**, with PC Part Performance authorship, source records, version pins and truthful dates. No personal human review or site-owned hardware testing is invented.

| Item | Public route | Change |
|---|---|---|
| CPU and BIOS support | `/blog/check-cpu-bios-support/` | Material revision |
| Phased PC upgrades | `/blog/phased-pc-upgrade-plan/` | Material revision |
| Selecting a power supply | `/blog/choose-a-pc-power-supply/` | Material revision |
| Reading benchmark test conditions | `/blog/read-hardware-benchmarks-test-conditions/` | New guide |
| 32 GB versus 64 GB RAM | `/blog/32gb-vs-64gb-ram-workloads/` | New guide |
| Reusing components | `/blog/reuse-pc-components-new-build/` | New guide |
| Gaming and streaming planning | `/blog/gaming-streaming-pc-planning/` | New guide |
| Video-editing workload checklist | `/blog/video-editing-pc-workload-checklist/` | New guide |
| Compact PC/noise planning | `/blog/compact-quiet-pc-fit-cooling/` | New guide |
| Buying used parts | `/blog/buying-used-pc-parts-checklist/` | New guide |
| 7800X3D/North air versus AIO decisions | `/blog/ryzen-7800x3d-north-air-vs-aio/` | New documentation comparison |
| Keep or upgrade an RTX 3060 | `/blog/rtx-3060-upgrade-or-keep/` | New decision guide |

The two content batches contain 11,543 words including tables/checklists, a reporting count rather than a quality or ranking target. [First-batch sources](content/SOURCES.json), [additional sources](content-extra/SOURCES.json), [72-intent map](content/GAP-MAP.json) and [gap reconciliation](content-extra/GAP-OVERLAY.json) distinguish existing coverage, completed writing and data-dependent recommendations. P02–P05, P14 and P39 still lack complete supported offers or comparable permitted test evidence. No false budget basket or tested winner was published to meet a quota.

## Validation actually performed

- Production generator completed: **1,236 catalog records, 1,592 route entries and 1,088 indexable canonical URLs**.
- **73 regression command groups passed.** After final label polish and prepared-runtime regeneration, 25 pricing/integration tests, 32 editorial tests and the original payload gate passed again. Full-suite details: [test receipt](qa/test-commands.json). A tracked-only full build reproduced and resolved the stale-runtime issue without removing its integrity guard: [reproduction](qa/tracked-only-build.json).
- All-route HTML audit: **85,891 internal anchor occurrences, 5,996 images, zero reported broken internal links, duplicate titles, duplicate descriptions or structural audit issues**. This is an HTML audit, not a claim that every external source or visual state was exercised.
- Resource audit: no inline executable scripts/handlers, unexpected external scripts or frames in 1,632 raw HTML files. This broader count includes retained non-route artifacts/redirect files; it is not the indexable page count.
- **44 distinct route/viewport/theme accessibility checks**, with zero unresolved automated violations in their final retests. Actual phone, builder, model, import, history and keyboard journeys are in [the browser receipt](qa/BROWSER-RECEIPT.json). Incomplete automated rules and a broader WCAG review are not represented as certification.
- Source lint, syntax checks and the repository's scoped TypeScript check passed. The full website is not claimed to have been converted to TypeScript.
- All **seven original route payload budgets passed**. Home initial script gzip: 6,140 bytes; builder: 120,575 bytes at the full-suite checkpoint. Final label-only changes were checked again. Budgets were not raised to hide regressions. [Before/current payload evidence](qa/PAYLOAD-COMPARISON.json).
- Eight warm-cache, unthrottled local rendering samples at 1440×900 and 390×844. Home LCP 1,120–2,088 ms; builder 1,436–1,820 ms; recorded CLS 0–0.00151. Each explicitly opened no initial 3D asset. **These are background in-app-browser diagnostics using a screenshot paint trigger, not Lighthouse, field CWV, a real mobile CPU/network profile or a traffic result.** Their protocol/limitations are retained in [desktop](qa/lab-desktop.json) and [mobile](qa/lab-mobile.json) records.
- Live public checks: **58 passed**, plus **38 script/style assets** with correct responses and all **ten new GLBs** with matching SHA256 hashes (8,477,164 bytes). [Public release](qa/live-verification.json), [asset receipt](qa/live-assets.json).
- Actual live browser interactions verified separate CAD/USD offers, restored the original Canadian preference, loaded the textured TITAN RTX model, changed its camera and removed its canvas on close. The new RAM guide and styled homepage were inspected. [Browser record](qa/live-browser.json), [model screenshot](qa/live-model-viewer.png), [homepage screenshot](qa/live-homepage.png).

## Current boundaries

| Area | Verified implementation | Remaining dependency |
|---|---|---|
| 3D | 860 library records: 115 downloaded mappings, 733 approximate previews, 12 missing; ten source models are standalone-only | An exact downloadable/licensed model and verified installed placement are not available for every part. Zero meshes certify physical fit. |
| Prices | Bounded ordinary public reads, exact SKU/seller/region, 15-minute per-listing cache, 24-hour expiry, dated history | This is not all stores or a complete price-ranked market. B650 failed offer identity; Newegg US was restricted. Other connections need reproducible supported sources. |
| FPS | Honest matching/evidence states and retained console/requirements information | Zero approved measured PC benchmark records; no fabricated FPS, 1% lows or bottleneck percentage. |
| Content | Complete original source-led guides, static HTML, author/date/source records and useful tool links | Current regional budget builds and tested same-budget winners remain data-limited. Private query volumes/rankings are unavailable. |
| Retention | Account-free local revisions, purchase notebook, comparisons and backups | No cloud sync, email alerts or configured newsletter delivery. Local reminder dates appear only when the workspace is reopened. |
| Measurement | Tested, explicit consent-gated action definitions with failure isolation | No authorized active analytics destination, Search Console export, field CWV or measured traffic/revenue improvement. |

The existing homepage, guided/expert builder, cooler selection, shared compatibility engine, Build School, manual cost tools, 84 regional prebuilts and 42 laptops are retained and integrated. They are not counted as newly created by this continuation. Search, News/Discover inclusion, rankings and revenue are outcomes to measure, not release guarantees.

## Release and maintenance

The tracked-file build reproduction rejected a stale prepared shopping runtime after a final label edit. The runtime was regenerated, a source-fingerprint regression test was added, and the full reproduction plus an official Wrangler dry-run passed. Corrected production commit: `33f252e9a9f5a04d8a5e073d0418d300ada123ed`.

The default-branch workflow update changed only the existing daily-price workflow and preserved the unrelated project on that branch. [Actual GitHub run 38994335999](https://github.com/LukasJT/pcpartperformance/actions/runs/38994335999) completed successfully, refreshed ten of twelve targets, and published 36 genuine history observations. Its price commit was preserved in the final production ancestry. The declared next automatic run is 07:17 America/Toronto; GitHub scheduling can be delayed.

**Open deployment observability issue:** the [Cloudflare GitHub check](qa/cloudflare-release.json) reports failure for the same commit whose public marker, new HTML, current controller assets and model hashes passed independent checks. The dashboard session was unavailable, so its remote log and failure reason were not verified. Do not report the hosted CI pipeline as green or the local runtime finding as proven to be the only remote failure. Next executable maintenance step: inspect that exact build's logs in an authorized Cloudflare session, then correct its build/status integration without changing the verified live release or disabling integrity checks.

Use the existing Cloudflare Git flow; do not alter DNS or replace hosting. [Operations](OPERATIONS.md) explains the production branch, separate default-branch workflow update, rollback and current disabled dependencies. The [90-day plan](../transformation-oct16/MAINTENANCE-90-DAYS.md) and [prepared distribution drafts](../growth/distribution-drafts.md) remain drafts/operating guidance, not active outreach or jobs.

Quality assessment: core changed journeys, bounded data integrity, HTML discovery, payload budgets and recorded browser checks pass within their evidence scope. Universal exact-model coverage, all-retailer prices, measured FPS, active private analytics and complete accessibility/security/field-performance certification remain partial or blocked. No unsupported 10/10 score is assigned.
