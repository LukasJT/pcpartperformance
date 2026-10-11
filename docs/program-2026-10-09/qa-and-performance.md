# Browser QA and measured performance

## Test environment

October 9, 2026, connected Codex in-app browser, Windows. Desktop 1440 × 900 and mobile viewport 390 × 844; additional 375px control/overflow checks. These are desktop browser viewports, not physical-phone Safari tests. Baseline Git `dc8200c` reconstructed locally; 398 tracked files, zero missing requested baseline files. Product HTML was absent from the tracked baseline and receives after-only observations.

Matching gzip/no-store loopback servers on 4186 (baseline) and 4185 (review), light theme, no CPU/network throttle. Metrics read after a 2.5-second settling window following the DOM snapshot. Font caching is not controlled. Resource transfer excludes navigation HTML; that is recorded by the static payload audit. Preview instrumentation is served from `scripts/program-qa-metrics.js` and injected only by the localhost server; it does not publish telemetry.

Seventy observations retained in `browser-lab-raw.json`, plus four invalid pilots excluded. Latest three comparable homepage/builder/FPS runs per viewport are selected; other routes use a latest single observation. Earlier intermediate runs remain in raw evidence and are excluded in `browser-lab-summary.json`. Recompute with `node scripts/program-lab-report.cjs`.

These are lab LCP and windowed sums of layout shifts. No field p75, field INP, PageSpeed score, simulated low-end mobile result or real-host improvement is claimed. No observed long tasks or initial Three.js/GLB requests in the measured runs does not guarantee that every interaction will stay under 200ms on other devices.

## Observed visitor journeys

| Journey | Actual result |
| --- | --- |
| Draft first-build answer → Build School → checklist | Check 1/12, reload persists, reset returns 0/12, builder action loads. Export/print controls present; print stylesheet inspected, physical printed output not checked. |
| Builder empty → example → part swap | Empty starts without false compatibility. Example preserves quantities/fans. 9800X3D documented socket check passes narrowly; changing to an uncovered CPU produces verification-needed evidence instead of a fabricated pass. |
| Builder ownership/locks → local revision → share | Owned CPU separates spending; locked row disabled. Successful save persists named exact-ID revision. Share copies part/ownership/lock selection; copied URL excludes name/notes/manual budget by design. |
| Modern picker keyboard | Enter opens; focus goes to listbox, not search textbox. Arrow/Enter option path and Escape dismissal tested. Unknown fit remains selectable; no automatic mobile keyboard. |
| Existing PC → upgrade phase → builder | Exact CPU/board inventory, ambiguous match confirmation, Keep/Verify, explicit swap, regenerated checks, phase and owned-parts handoff work. Editing inputs invalidates earlier plan/export. |
| Budget worksheet | CPU-only quotes leave eleven fields missing. Marking legitimate owned/not-needed rows separates new spending; complete manual difference and local save/reset work in one currency. |
| Manual fit / troubleshooting | Length 330mm versus space 300mm fails; absent dimensions stay unknown. Safe symptom answer provides measurements/manual/support next actions instead of compulsory hardware replacement. |
| Draft comparison → interactive tool → builder | Editable-mode URL retains exact RTX/Radeon IDs, differences hides equal rows, copy/reload keeps selection, selected GPU opens builder with the chosen region. |
| Search / watchlist | NVIDIA typo/model search and browser Back state work. Product save uses existing store; saved page shows exact product and Remove returns empty. |
| PC FPS / console cards | Optional Fortnite arithmetic is marked unvalidated. GTA VI PC stays unavailable. Unsupported Minecraft console modes withheld; supported-mode filter gives zero rather than inventing FPS. Galaxy editions/images fit mobile cards with exact console/edition scope. |
| Themes/layout | Light and dark routes inspected; mobile scroll width matches document width. Wide tables use their bounded scroll container. No broken images in recorded observations. |

Actual screenshots are stored alongside this report. Representative browser console inspection returned no application errors/warnings. A Node module-type warning in the model-framing command was recorded; all sixty configurations still passed.

## Payloads and regression budget

`performance-before.json` is the deployed tracked-script baseline. `performance-production-generation.json` is the tested normal build; `performance-after.json` is the final review build. Gzip totals are per source script, not host/route transfer measurements. CSS byte totals are uncompressed bundle sizes.

| Route class | Baseline JS gzip | Normal JS gzip | Regression ceiling for next increment |
| --- | ---: | ---: | ---: |
| Homepage | 7,691 B | 8,940 B | 9,400 B |
| GPU category | 88,511 B | 93,030 B | 98,000 B |
| Product | baseline unavailable | 12,412 B | 13,100 B |
| Curated comparison | 8,337 B | 9,586 B | 10,100 B |
| Builder | 104,044 B | 111,319 B | 117,000 B |
| FPS | 98,926 B | 37,894 B | 40,000 B |
| Existing article | 8,337 B | 9,586 B | 10,100 B |

Ceilings are rounded approximately five percent above this implemented baseline, not speed rankings. Check with `node scripts/check-program-performance.cjs` and investigate before accepting a new exception. The builder grew 7.0% in static gzip / 7.7% in measured resource transfer for evidence, guided planning and retention; this exception is explicit. Article resource transfer grew 8.8% for connected features; do not claim every route became lighter. Catalog initial JS remains substantial and is a future splitting opportunity.

Image derivatives preserve existing identities and originals: 657 product mappings / 290 unique 320px WebP thumbnails; aggregate originals 44,872,416 B versus derivative files 2,897,186 B. This is a file inventory comparison, not what every visitor downloads. No new image provenance or physical model accuracy is inferred from resizing.

Future same-condition runs should preserve zero initial optional 3D downloads, no broken images/overflow, and investigate a windowed layout-shift sum above 0.1. Do not equate this lab threshold with Google's real-user p75 standard. Actual field targets remain LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 when real data become available.

## Accessibility scope

Keyboard listbox focus/dismissal, visible focus rules, labeled form controls, error/status announcements, heading/table structure, mobile touch spacing and theme visuals inspected. Source-level reduced-motion media queries and `motion.js` preference checks are retained. Browser does not expose OS reduced-motion emulation here; no screen-reader/physical-touch certification is claimed. Test those modes before a production accessibility sign-off.
