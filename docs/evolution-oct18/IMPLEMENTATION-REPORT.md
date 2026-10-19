# Liquid Hardware Lab: implementation and release checkpoint

**Initial checkpoint, October 19, 2026.** Browser approval subsequently recovered: 348 responsive states and seven real interaction flows now pass, including actual 3D rendering/retry. This document preserves the earlier implementation checkpoint; [the release record](DEPLOYMENT.md) supersedes its browser/Git/deployment status. Human editorial review and owner/provider integration gates remain. No 10/10 score is awarded.

Branch: `codex/liquid-evolution-2026-10-18`. Starting repository commit: `6b272bdbcfba56096a797c2d3df1816baba34293`. Prior verified production: `e8c321b90d75e4dca9f0e96ded6b39dd71b83fd4`. No production Git push, DNS change, provider application or advertising transition was performed during this increment. Inspect `git status` and the latest branch commit before continuing; preserve any newer deployment-branch changes through an ordinary reviewed merge.

**Git checkpoint status:** a final `git -c core.autocrlf=false add -A` request was also not executed: automatic approval review reported selected-model capacity. No staging, checkpoint commit or push followed. All implementation files remain saved in the local working tree on this branch. Do not mistake a named branch for a committed backup. See `qa/approval-blockers.json`.

## What is implemented

### Shared design, themes and motion

- Six coordinated palettes: Midnight Circuit, Arctic Glass, Solar Flare, Aurora, Neon Laboratory and Paper & Precision. One underlying layout and semantic token system.
- Synchronous head theme selection, migration of existing light/dark preferences, system following, blocked-storage recovery, named palette previews, higher contrast and locally saved motion preferences.
- Existing quick light/dark switch preserved. Appearance uses a native dialog with focus return and mobile-menu handoff.
- Shared spacing, typography, controls, focus, cards and transitions; owned destination CSS split into 15 route-family bundles. Superseded finishing styles and unused font preconnects are removed from pages.
- Small native motion layer, deferred until interaction: visible content remains available without it. Includes restrained entry, card/button responses, comparison/details transitions, article reading progress and ambient suspension when offscreen/hidden. OS/manual reduced motion and ambient pause are respected. No animation framework added.
- Existing compact mobile header preserved rather than falsely re-audited as the old two-row header. Menu/consent stacking and late-added consent inertness fixed; no attempt to modify native browser controls.

Sources: `scripts/evolution-{themes.cjs,theme.js,system.css,motion.js,site.cjs,destinations.css,style-scope.cjs}` and `scripts/continuation-ui.js`. Fingerprinted prepared runtime is checked before copying into output.

### Builder, picker, catalog and 3D

- Three real presentation stages: Choose parts, Explore build, Review & save. Original selections, readiness logic, native inputs, local revisions, prices, expert capabilities and stable anchors remain shared.
- Beginner guidance and count of selected categories; no compatibility percentage. Advanced functions appear where relevant instead of all competing initially.
- Full-height mobile picker, unfocused search on opening, progressive filters, readable product rows, compact secondary Skip action outside the listbox and touch-hidden keyboard hints. Ten distinct hardware fallback vectors preserve actual existing photos.
- Initial hardware listing filters actual PC categories, with explicit devices/peripherals/all choices. Server category routes remain reachable.
- Actual 3D renderer integration: lazy enhancement controls, loading/error/retry/close feedback, bounds-based camera focus, smooth camera movement, lower render resolution and opt-in orbit. Orbit stops on interaction, offscreen/hidden page, close and reduced motion. No new model downloads or clearance certification are claimed.

Sources: `scripts/evolution-builder.*`, `scripts/builder-selectors.js`, `scripts/evolution-catalog.css`, `dist/interface.js`, `scripts/evolution-scene*`, authoritative `dist/assembly-3d.js` and `dist/build-scene.js`. Details: [builder](BUILDER.md), [3D](SCENE.md).

### Major page families and original visual assets

- Homepage: original layered studio SVG, three primary tasks, supporting search, retained readiness example and a real middle grid column for the GPU “VS”.
- Upgrade and compatibility: original connected-hardware pathway visuals and clearer sections.
- My PC: saved computers precede optional management; one compact shortcut row; notes/purchases and change records use disclosures with original IDs and hash recovery.
- Hardware/products/shop/comparisons/FPS: coordinated family styles, imagery hierarchy, form/table spacing and evidence-preserving states. No fabricated offers, FPS or specification differences.
- Phones/prebuilts/laptops: shared device artwork and layout polish; no claim that every image/model or market configuration is newly covered.
- Build School/tools: 13 original reusable hardware SVGs, lesson/tool illustrations and a new functional `/build-school/hardware-diagrams/` destination.
- Eight interactive diagrams: airflow direction, documented memory slots, exact-board lane sharing, PWM/DC, manual GPU-length worksheet, distinct power leads, same-scale M.2 sizes and conditional radiator placement. Inputs change explanatory output. No measured thermal/fit simulation is asserted.
- Blog/news/articles: comfortable reading measure, more consistent heading spacing, safe unique TOC anchors, reading progress, source presentation and preserved schema/bylines/publication history.

Sources: `scripts/evolution-art.cjs`, `scripts/evolution-diagrams.*`, shared page transformations above. Original generated hardware assets: `dist/assets/studio/`. [Diagram evidence and limits](DIAGRAMS.md).

### Editorial and SEO

- Audited 75 existing editorial routes, including 54 public blog articles, for intent overlap.
- Created **36 complete new research drafts**, 42 inspected primary sources and 36 original topic-specific SVGs. Recorded 10,944 words of direct-answer/body prose in addition to tables/checklists; this is a scope count, not a quality score.
- All 36 have local complete HTML reading previews under `editorial/previews/`. Six received an additional AI evidence check against reopened original documents. None received a human editorial review.
- **Published: 0. Publishable: 0. Human reviewed: 0.** No earlier approval for the previous 12 articles was applied to these new items. The prior organizational byline instruction can be retained after substantive review; a new invented reviewer is unnecessary.
- Drafts stay outside `dist`, public search, feeds and sitemaps. Existing articles remain intact. The diagram page has crawlable HTML and metadata; the owner readiness resource stays noindex. Existing canonical/indexing controls remain in use.

[Review packet](editorial/REVIEW-PACKET.md), [complete reading previews](editorial/previews/index.html), [intent map](editorial/query-intent-map.json), [source register](editorial/source-register.json), [AI peer check](EDITORIAL-PEER-CHECK.json), [current official SEO register](SEO-SOURCE-REGISTER.md).

### Journey and growth readiness

- Official requirements/onboarding/custom-layout/analytics guidance inspected; owner checklist at `/resources/publisher-readiness/`, with noindex and a non-sensitive preparation report.
- 58 existing public editorial bodies receive one semantic `.journey-content` landmark each. Tools and product catalogs are not falsely designated article ad bodies.
- Disabled analytics configuration validation does not activate a runtime adapter. No GA4 ID, Journey wrapper, ads.txt seller record, owner identity, audience count or acceptance is invented.
- Existing advertising is preserved. Any Journey launch needs an authorized provider transition, actual issued artifacts, identity/legal steps and real audience evidence.
- Prepared a conditional 90-day maintenance/editorial/distribution schedule and official-source evaluation of affiliate options; nothing was applied for, sent, purchased or scheduled.

[Publisher preparation](PUBLISHER-READINESS.md), [growth/revenue schedule](GROWTH-AND-REVENUE.md).

## Verification actually completed

| Check | Actual result | Receipt / scope |
| --- | --- | --- |
| Normal build | Pass; 1,594 HTML pages, 1,089 intended indexable, 505 excluded | `node scripts/build-pages.cjs`; this is generated output, not deployment. |
| Repository regression groups | **86/86 pass** after the menu/consent fix | `docs/master-completion/qa/test-commands.json`. Groups contain multiple individual cases; do not call them 86 browser journeys. |
| Existing payload ceilings | **7/7 pass**, no raised limit | [before/after](qa/performance-before-after.json). Static linked JS gzip and CSS bytes only; optional imports, Worker-injected ads and timing separate. |
| HTML audit | Zero issues, duplicate titles or descriptions | 1,594 pages, 116,333 links, 6,960 image elements; `docs/master-completion/qa/all-route-html.json`. Not a remote source-availability or browser rendering proof. |
| Resource audit | Zero inline executable handlers/scripts or unexpected external code in audited page scope | `docs/master-completion/qa/resource-audit.json`; existing isolated advertising follows its separate policy. |
| Scoped TypeScript | Pass | `node tools/quality/node_modules/typescript/bin/tsc -p tools/quality/tsconfig.json`. |
| Changed-source ESLint | Pass | All `evolution-*.cjs/js`, picker/menu sources and changed integration fixtures. |
| Declared theme contrast/runtime | 20 tests pass | Six palette declarations plus focus/control/button contrast, persistence/failure/system behavior and menu integration; composited browser contrast still pending. |
| 3D geometry/regression | New and retained tests pass; 60 framing configurations | [scene evidence](SCENE.md). Actual WebGL rendering, load/retry gestures and low-end device behavior still pending. |
| Artwork decoding | 13 hardware SVGs +6 hero palette renders pass; updated six-palette contact sheet visually inspected | `qa/artwork/decode.json` and `qa/artwork/studio-palettes.png`; source-art inspection, not browser screenshots. |
| Editorial artwork | 36 SVGs decoded, nine contact sheets inspected | `editorial/qa/`; human article review and browser text bounds not performed. |

The homepage static initial JS is smaller than the verified prior release. The builder stays within its original ceiling. Use the exact receipts for final byte values. No lab LCP/INP/CLS, real-user Core Web Vitals, traffic increase, ranking change, revenue or ad eligibility was measured.

## Why rendered QA and release are incomplete

Automatic approval review repeatedly could not authorize the isolated headless Edge launch because its selected model was at capacity. One attempt timed out; its permitted retry also failed at capacity. The requested browser action was **not executed**. This was a review-service failure, not a determination that the action was unsafe. No alternate tool, profile or agent was used to bypass it.

Consequently there are no new before/after browser screenshots, nine-width visual passes, actual new-flow keyboard/save/restore results, physical mobile keyboard results or rendered six-theme approvals. Historical release screenshots are labeled historical. Source checks and raster artwork are not substitutes. Production release is withheld at the user's required browser gate.

## Next executable steps

1. Resolve the approval-service issue or obtain owner guidance for the blocked isolated-browser action. Do not silently switch to a different launch route to bypass that decision.
2. In a fresh authorized terminal, run the existing preview: `node scripts/serve-completion-preview.cjs` (port 4198). Use the installed Playwright package through `PCP_PLAYWRIGHT_MODULE`; no personal Chrome profile is needed.
3. For public baseline only, set `PCP_EVOLUTION_ORIGIN=https://www.pcpartperformance.com` and run `node scripts/evolution-visual-qa.cjs --before`. Unset the variable for local after captures. Default plan: 342 page/theme/width captures +4 picker +2 menu states. Planned counts are not completion counts.
4. Run `node scripts/evolution-interactions.cjs` against local preview. It is prepared, syntax/lint checked and **not executed**. It uses isolated test storage, explicitly marks its synthetic late-consent element, and covers the new stages/palettes/picker/local revision/diagrams/no-JavaScript behavior. Inspect actual screenshots; fix failures without deleting assertions. The older October 17 interaction runner describes the older UI and has stale empty-row/stage expectations; do not mislabel its historical receipt as this release.
5. Add manual/theme/zoom/slow-load/real3D failure-recovery checks from [the issue register](ISSUE-REGISTER.md). Exercise 200% text, all six palettes on representative pages and a real mobile software keyboard. Inspect article diagrams and menu layering.
6. After substantive fixes, regenerate prepared runtime if its sources changed, then normal build, relevant checks, full runner, types/lint, HTML/resource audit and `node scripts/evolution-release-receipt.cjs`.
7. Review the concrete branch diff, stage/commit without force, fetch the actual deployment branch and retain newer changes through a reviewed merge. Existing authorized production workflow: `codex/stage2-publication-2026-10-04` → Cloudflare Worker `pcpartperformance-live`. Do not push unrelated `main`, change DNS or migrate hosts.
8. Verify the exact public commit marker, canonical/HTTP/robots/sitemap behavior, main tasks and browser layout after deployment. Use `node scripts/verify-live-release.cjs <40-character-commit>` plus actual rendered checks. A pushed commit alone is not a verified live release.
9. Separately obtain article-specific human review of complete drafts, applicable sources and illustrations. Record truthful decisions/fingerprints, revise failures and publish only approved items. Account, consent, identity/legal and provider-issued Journey artifacts remain separate owner steps.

### Backups and rollback

The current branch preserves the starting revision and existing assets. No user-storage migration or database change is introduced. Keep prior production `e8c321b90d75e4dca9f0e96ded6b39dd71b83fd4` as historical reference, but verify the actual latest production revision before a later release. Do not reset/force-push a shared branch. Roll back through the existing host's prior deployment or a reviewed revert of the specific candidate commit, preserving subsequent unrelated work; then repeat public marker/route/control checks. Never delete `dist`: it contains authoritative runtime and licensed assets as well as generated pages.

## Evidence-based quality rubric

| Area | Current assessment | Remaining evidence |
| --- | --- | --- |
| Architecture/data preservation | Source and regression checks pass | Real saved-work/browser journey on generated candidate |
| Design/theme system | Implemented, declared contrast/runtime checks pass | Actual six-theme composition/contrast, all widths, zoom |
| Navigation/picker | Structural fixes and VM tests pass | Touch/keyboard/short-height/physical keyboard, visible alignment |
| Motion/3D | Native deferred implementation and regressions pass | Actual smoothness, WebGL/error recovery and low-powered devices |
| Educational visuals | Eight functioning diagram modules and original source assets | Rendered controls/text bounds and reader usability |
| Editorial | 36 complete researched drafts with original visuals | Genuine human review, substantive revision and approved release |
| Technical SEO | Generated HTML/canonical/discovery checks pass | Deployed HTTP verification and authorized Search Console evidence |
| Performance/accessibility | Existing payload ceilings/types/checks pass | Comparable browser lab runs, axe/manual keyboard, field data |
| Publisher readiness | Honest preparation and semantic boundaries implemented | GA4/consent/runtime evidence, owner/provider acceptance and ad QA |
| Growth/revenue | Source-backed options and conditional schedule prepared | Authorized measurement, real engagement and revenue evidence |

This is a substantial integrated candidate. It is not every requested gate completed, a deployed redesign or a monetization approval.
