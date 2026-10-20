# Clean Studio redesign

Published on October 20, 2026: [PC Part Performance](https://www.pcpartperformance.com/), production commit `849fb96d3030712dd990cbf68928dd7cef033f8d`. Both Cloudflare production and [Linux validation](https://github.com/LukasJT/pcpartperformance/actions/runs/39513224142) succeeded. Final after screenshots were captured from the public deployment.

## Implemented scope

The three supplied references inform one shared system: forest accents and photographic editorial layouts, strong rounded choices, and a soft dashboard built from real local records. Reference filenames were reordered in the attachment; interpretation follows their visual contents.

| Area | Implementation | Evidence |
| --- | --- | --- |
| Shared system | Warm white / forest / mint light palette; coordinated ink / mint dark palette; all six saved palette IDs retained. Locally served fonts, common spacing, pill controls, visible focus and reduced-motion fallbacks. | Theme contrast tests; automated accessibility report. |
| Homepage | Actual component photography, three primary paths, explicitly illustrative readiness preview, featured comparison, reuse/replace example, editorial guide spread, compact categories and workspace introduction. Removed repeated tool sections. | Before/after screenshot set. |
| Builder | Parts / Preview / Review, aligned stage pills, distinct Guided / Expert selection, compact rows and source-preserving photographs. Existing selection, compatibility, pricing, ownership and save engines retained. | Browser selection and journey tests. |
| Picker | Compact searchable sheet, consistent thumbnails, high-contrast selected states, checkmarks, single-line Add labels, concise verified-price or missing-price text. Existing filters, keyboard navigation, focus return, expansion and skip retained. | CPU/PSU and reduced-height tests. |
| My PC | Compact dashboard with actual saved-build, watched-part and comparison counts; latest-build continuation; four task shortcuts; original notebooks, records and backups preserved. No synthetic compatibility score. | Populated local fixture plus existing workspace regression suite. |
| Learning / research | Photographic Learn hero and featured guide, smaller learning-path pills, supporting editorial entries, refined product/compare/catalog/article/Build School presentation. | Screenshot set and responsive matrix. |
| Delivery | Page-family styles; catalog selectors separated from unused builder/assembly CSS. Build-local bundle cache and byte-identical linear CSS compaction. No new browser dependency or decorative JavaScript. | Existing transfer budgets; compactor parity and generated-output checks. |

## Screenshot comparisons

The baseline is the public production site before this work, captured in isolated Edge. Final after images are the verified redesign. Phone widths emulate a viewport; screenshots do not claim physical iOS testing.

| Page | Before | After |
| --- | --- | --- |
| Home, phone | [Before](screenshots/before/home-390.png) | [After](screenshots/after/home-390.png) |
| Home, desktop | [Before](screenshots/before/home-1440.png) | [After](screenshots/after/home-1440.png) |
| Whole homepage | [Before](screenshots/before/home-full-1440.png) | [After](screenshots/after/home-full-1440.png) |
| Builder, phone | [Before](screenshots/before/builder-390.png) | [After](screenshots/after/builder-390.png) |
| CPU picker | [Before](screenshots/before/picker-390.png) | [After](screenshots/after/picker-390.png) |
| My PC | [Before](screenshots/before/workspace-390.png) | [After](screenshots/after/workspace-390.png) |
| Learn | [Before](screenshots/before/learn-1440.png) | [After](screenshots/after/learn-1440.png) |

The same directory includes upgrade, comparison, hardware catalog, exact product, article and Build School screenshots at 390px and 1440px.

[Populated workspace example](screenshots/after/workspace-populated-390.png) uses explicitly synthetic local saved records in an isolated browser; no personal browser data was accessed.

## Verification

Final release results and commit are recorded in `RELEASE.json`. Reproducible commands:

| Check | Result | Receipt |
| --- | --- | --- |
| Source / data / security / SEO regression commands | 111/111, locally and successful Linux CI | `../master-completion/qa/test-commands.json`, `qa/linux-ci.json` |
| Nine-width light/dark browser matrix | 285 states, zero failures | `qa/local-browser-report.json` |
| Public 320 / 390 / 1440px browser verification | 107 states, zero failures | `qa/live-browser-report.json` |
| Automated six-palette accessibility | 146 cases, zero violations | `../total-refinement/qa/accessibility/report.json` |
| Real interaction journeys | 9/9, including save, restore, share, download, print and 3D recovery | `../total-refinement/qa/interactions/report.json` |
| Photograph decoding and integrity | 1,586 files decoded; accepted source/hash joins retained | `../component-photos-catalog-oct17/qa/image-decode.json` |
| Public release / style parity | 26 release checks, 10 canonical pages, 10 exact CSS hash matches | `qa/live-verification.json`, `../program-2026-10-11/live-release-verification.json` |
| TypeScript / scoped ESLint / original delivery budgets | Passed | CLI verification and `../program-2026-10-09/performance-budget-results.json` |

Nine cold mobile lab samples used 4× CPU slowdown, 150ms latency and 1.6Mbps download. Median LCP was 1,160ms on home, 1,332ms in the builder and 1,064ms on Game Performance. All nine recorded CLS values were zero; no initial 3D payload loaded. The largest captured interaction event duration was 184ms. These are bounded local lab samples, not field p75 INP or a guarantee of all-device performance.

```powershell
node scripts/build-pages.cjs
node scripts/run-master-checks.cjs
node tools/quality/node_modules/typescript/bin/tsc -p tools/quality/tsconfig.json
node scripts/check-component-photo-files.cjs
$env:PROGRAM_PORT='4212'
node scripts/serve-completion-preview.cjs
# In a separate terminal, with the same process permission context:
$env:PCP_STUDIO_ORIGIN='http://127.0.0.1:4212'
node --use-system-ca scripts/studio-browser-qa.cjs
$env:PCP_TOTAL_ORIGIN='http://127.0.0.1:4212'
$env:PCP_PLAYWRIGHT_MODULE='C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
node scripts/total-journeys.cjs
node scripts/total-accessibility-qa.cjs
node scripts/total-performance-qa.cjs
```

The performance runner should execute alone. Its throttled browser samples are laboratory results, not field p75 Core Web Vitals or an INP guarantee.

## Remaining review

- Physical iPhone Safari, VoiceOver, actual software keyboard and device text settings need owner/device review. Reduced-height and emulated touch tests provide narrower evidence.
- Existing photographs retain their recorded source and license limitations; this redesign obtains no additional redistribution permissions. Seven ambiguous historical identities remain qualified recovery records.
- The reference-inspired design does not add measured FPS, retail API contracts, exact CAD, editorial approvals, GA4/Search Console access or Journey acceptance.
- Real-user performance and conversion changes require production measurements over time. No 10/10 score or growth claim is inferred from these changes.

## Implementation board

| ID | Pages | Problem / solution | Files | Validation |
| --- | --- | --- | --- | --- |
| ST-01 | Global | Establish one palette and component system while preserving appearance preferences. | `evolution-themes.cjs`, `evolution-theme.js`, `evolution-system.css`, `clean-studio.css` | Six-palette contrast and accessibility. |
| ST-02 | Home / Learn | Replace repeated equal-weight sections with photography and editorial hierarchy. | `clean-studio.cjs`, `seo-pass.cjs` | Screenshots, links, one H1, crawlable HTML. |
| ST-03 | Builder / picker | Improve density, selected states, aligned labels and missing-price presentation. | `clean-studio.css`, `builder-selectors.js` and prepared runtime | Search, selection, focus, skip, filter, short viewport. |
| ST-04 | My PC | Show real saved-work counts and continuation without exposing private fields. | `oct16-workspace.js`, `clean-studio.cjs` | Workspace unit suite, populated fixture, actual journeys. |
| ST-05 | Menu | Prevent word collisions and oversized-text overflow with adaptive columns. | `clean-studio.css` | 320–1920px matrix, 150% text, close/focus controls. |
| ST-06 | Delivery | Remove irrelevant catalog CSS and repeated build work without changing output semantics. | `clean-studio.cjs`, `css-compact.cjs`, `seo-pass.cjs` | Original budgets, byte-parity tests and CI. |
| ST-07 | Publication | Preserve latest daily price update; publish through the existing production branch. | Existing Git/Cloudflare workflow | Exact release marker, public pages, public browser checks, Linux CI. |

No owner account or provider integration was needed for this visual redesign. The current release status is determined by the release receipt, not by the presence of this board.
