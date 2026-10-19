# Operation Total Refinement — implementation board

October 19, 2026. Branch `codex/total-refinement-2026-10-19`. Initial tree was clean; later dated production price/history commits were merged, not replaced. [Issue register](ISSUE-REGISTER.md) · [Assessment and remaining work](README.md).

Statuses describe this implemented checkpoint, not exhaustive completion of the long-term specification. Source, schema, rendered tests and coverage reports are the evidence.

| ID | Priority / affected pages | Problem and implementation / principal files | Data dependency | Status and evidence |
| --- | --- | --- | --- | --- |
| VR-01 | P0 `/` | Colliding feature text; reusable rows and restored CSS scope: `total-refinement.cjs`, `evolution-style-scope.cjs`, `evolution-destinations.css` | Existing destinations | Verified: actual text rectangles separate; before/after screenshots. |
| VR-02 | P0 mobile menu | Preferences collision/order; explicit adaptive grid and reset inherited row: `evolution-system.css` | Existing region/theme preferences | Verified: heading/controls, enlarged text, keyboard/focus. |
| VR-03 | P1 `/` | Oversized editorial/category blocks; concise illustrated guide rows and compact photo cards | Existing photos and guides | Verified: before/after height measurements and screenshots. |
| VR-04 | P1 `/performance/` | Giant forms and synthetic demo; compact visual controls, concise real evidence: `total-fps*`, `dist/performance.js` | Actual benchmark records or explicit unknown | Verified:18 FPS browser cases, filter-rectangle checks. |
| VR-05 | P0 mobile menu | Mid-word labels; adaptive columns and normal wrapping | Existing navigation | Verified: nine widths,150% phone text, no clipped label. |
| VR-06 | P1 builder review | Action sprawl; primary save plus secondary report/copy toolbar, disclosures: `total-refinement.cjs`, `evolution-builder.css` | Existing revision/report modules | Verified: save, restore, report download, print and clipboard privacy. |
| VR-07 | P0 builder picker | Intrusive sparse modal and listbox pagination; compact expandable sheet, dense rows, sort/search/filter: `builder-selectors.js`, `evolution-builder.css` | Exact catalog IDs and existing matched photos | Verified: short viewport, keyboard, expansion, selection and80→160 pagination. |
| VR-08 | P1 builder preferences | Excessive nested spacing/copy; compact advanced controls | Existing settings/state | Verified: guided/expert controls remain reachable; screenshots. |
| UX-01 | P1 builder | Task hierarchy and delivery; keep three stages, project needed data, compile established engine with parity: `completion-catalog-delivery.cjs`, `prepare-total-runtime.cjs` | Existing builder engine | Verified increment: real CPU/PSU flow, source/compiled parity, original budgets. |
| UX-02 | P1 `/my-pc/` | Form-heavy saved work; useful summary cards and nested notes reveal: `oct16-workspace.js` | Existing private local records | Verified:32 workspace tests and real save/restore; synthetic fixture screenshots. |
| UX-03 | P1 monitor tool | Generic diagram; true-aspect SVG, presets, errors: `total-display*` | Existing display formula | Verified: three unit tests and actual geometry/error recovery. |
| DATA-01 | P2 catalog | Structured intake/provenance and publication: `total-catalog*`, `data/catalog-intake/2026-10-19` |49 reviewed source entries | Verified:63 actual additions; duplicate/unit/platform/identity checks and rollback. |
| DATA-02 | P3 hardware | Bounded historical/AIB/professional expansion | Exact sources, critical fields | Implemented partial:1,299 total records; exhaustive coverage remains open. |
| DATA-03 | P3 prebuilts | Exact manufacturer configurations and source labels: `total-prebuilts*`, `prebuilt-pages.cjs`, `master-decisions*` |51 inspected manufacturer documents | Implemented partial:219 regional rows,211 identities,142 core signatures. Strict200 distinct core target unmet; photo rights absent. |
| PRICE-01 | P4 shopping/builder | Fresh exact regional observations/history and restored-session currency |12 registered listings; approved provider access | Verified small cohort:10 observations,86 history rows; two unavailable reads. Broader feeds blocked by accounts/rights. |
| GAME-01 | P5 game library | Actual platform/edition records and source-valid no-loss importers: `total-fps-games*`, `total-fps-platforms.cjs`, `total-fps-xbox-wire.cjs` | Official store/announcement facts | Verified bounded targets:618 additions; zero new measuredFPS. Announcements visibly qualified. |
| GAME-02 | P5 consoles/retro | Separate original diagrams and scoped hardware references: `total-console-hardware*` | Manufacturer specifications/history | Verified partial:6 modern references,16 historical landmarks;36 browser cases. Retro game archive not exhaustive. |
| VIS-01 | P6 models | Correct original dimension envelopes: `total-models*` |20 manufacturer dimension records | Verified partial:26 tests,23 renderer scenarios. Approximate, no new downloaded appearance model or clearance certification. |
| SEO-01 | P7 major routes/catalog | Intent metadata, exactSKU titles, unique pagination descriptions, source-tool links: `total-seo*`, `game-discovery.cjs` | Actual generated content and publication ledger | Verified:1,868HTML/1,323 sitemapURLs, zero reported issues or duplicate titles/descriptions. PrivateGSC unavailable. |
| EDIT-01 | P7 articles/news | Preserve36 researched drafts, correct stale GPU-guide tool claim | Accountable human editorial review | Blocked for publication. No fake news, approval or date refresh. |
| OPS-01 | P8 recurring maintenance | Bounded monitor and fixed-file least-privilege publisher: `total-operations*`, daily workflow | Registered source indexes and retail listings | Local verified:7/7 indexes,39 unpublished leads; remote activation/run receipt pending release. |
| SEC-01 | P8 site/jobs/share | Transport, artifact, source-code isolation, privacy, backup/restore and ad semantics | Existing security rules and fixed input contracts | Verified targeted controls; security review documents residual third-party/dependency/device risks. |
| REV-01 | P8 publisher readiness | Semantic article containers and existing owner checklist | GA4/GSC, actual audience, account-specific provider artifacts, owner agreements | Blocked for account/provider activation. No Journey installation or eligibility claim. |
| QA-01 | P0…8 all major routes | Real layout, interactions, catalog and accessibility runners | Isolated browser and final generated assets | Verified automated checkpoint:97 test groups,212 targeted layout states,366 broad captures,146 axe cases. PhysicaliOS/VoiceOver/keyboard checks open. |
| REL-01 | release | Normal tested commit/push and exact domain marker, then file-only workflow activation | Existing Git/Cloudflare authorization | Testing: local final gates; actual live deployment and first new remote run receipt pending. |

## Evidence and continuation

Eight owner iPhone photos under attachment `A0450924-B861-493B-9EFC-D98DE56078D8` are concrete bug reports. Reviewed comparison pairs are in `screenshots/`; full reproducible matrices stay locally in `qa/` with versioned JSON receipts. Edge emulation does not establish physicalSafari or software-keyboard behavior.

Do not force-push, delete `dist` wholesale, overwrite newer observations, publish unreviewed technical claims, substitute sibling-SKU photos, or label missing prices/compatibility/FPS as known. Continue with the precise open items and commands in the per-lane reports.
