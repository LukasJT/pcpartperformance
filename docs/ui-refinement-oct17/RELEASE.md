# UI refinement release — October 17, 2026

Status: deployed and verified at https://www.pcpartperformance.com/. Production commit: 01563ca9aa3d6787c220b37661eafb8ebc8c3442.

## What changed

- One responsive navigation tree replaces the crowded mobile header. Search and Menu stay visible; primary navigation, Phones/Game FPS/Prebuilts/Laptops, guides/tools, country and theme have clear groups. The menu supports keyboard dismissal, focus containment, background inertness and restored focus. With JavaScript unavailable, the primary links remain visible.
- Builder selection now has a visible search field, compact optional-selection row, separate filters and spacious exact-model rows. Opening a picker focuses its list instead of automatically opening a mobile keyboard. Multi-brand filters, exact SKU matching, optional 3D filtering, reset and keyboard selection remain functional.
- Removed an artificial 240px minimum that stretched a guided part row. Its measured height is now 168px at 390px. Number, title and thumbnail share a center; menu icon/label offsets measured below 0.01px in the tested state.
- Seven original, decorative SVG task illustrations support Build, Upgrade, Learn, Compare, Compatibility and My PC. Introductory copy is shorter. Existing evidence, unknown prices, source disclosures, article content and local storage keys are preserved.
- Comparison product images have a consistent frame, readable headings, aligned action rows and an organized category menu. CSV/copy/print remain available under Export & share. On phones, comparison cards stack at a readable width.
- Home, Upgrade, Learn, My PC and Compatibility have clearer task entry points. Guide search/filtering and local revision restore remain intact. Secondary shortcuts are compact so they do not bury the actual tool.
- Menus, pickers, hover states, chevrons and technical illustrations have restrained transform/color transitions. Critical headings stay fully visible from the first render; reduced-motion preferences disable effects. Keyboard scrolling inside pickers remains immediate.
- The existing DM Sans and Space Grotesk families are served locally as versioned WOFF2 files with their SIL OFL notices. Google font stylesheet imports are removed. CSS for pickers is loaded only where used; production builds copy source-fingerprinted prepared controllers and require no local minifier installation.

## Verification

- 74 regression command groups passed, including the new UI tests. After the final CSS correction, all 9 UI unit tests, 7 original payload gates and the HTML/resource audits passed again. Scoped source lint and TypeScript checks passed.
- 20 route families were checked in isolated headless Edge at 360, 390, 768 and 1440px in dark mode (80 views), and 390/1440px in light mode (40 views). The final header correction also received 14 dark-mode retests. Reports record no horizontal document overflow, JavaScript page errors or unresolved automated accessibility violations. These counts are tested states, not every possible interaction.
- Nine actual interaction journeys passed: navigation/focus, region/theme, picker layout/focus/height resize, multi-brand/reset/search/keyboard selection, save/restore, guide filters, comparison picker, category/export/aligned actions, and reduced-motion/no-JavaScript fallback. Open menu and picker states also had no automated violations.
- HTML audit: 1,592 pages, 1,088 indexable URLs, 98,627 internal anchor occurrences and 5,996 images; zero reported broken internal links, duplicate titles/descriptions or structural issues. Resource audit: 1,632 raw HTML files; no inline executable handlers/scripts or unexpected external scripts/frames. These are separate audit scopes.
- All original payload budgets remain unchanged. Home CSS: 141,320 → 128,487 bytes. Builder CSS: 223,913 → 187,446 bytes; builder initial script gzip: 120,609 → 120,081 bytes. Product CSS increased by 451 bytes within its existing ceiling. First-load local Latin fonts are additional 36,932/22,288 byte assets; baseline external font transfer was not measured. Optional 3D remains deferred.

Receipts: [dark views](after-browser.json), [light views](after-light-browser.json), [header retests](after-header-browser.json), [interactions](interactions.json), [payload comparison](payload-comparison.json), [font provenance](font-sources.json), [full regression commands](../master-completion/qa/test-commands.json).

## Visual evidence

- [Original mobile header](before/builder-390.png) → [updated builder](after/builder-390.png).
- [Original mobile picker](before/picker-390.png) → [updated picker](after/picker-mobile-dark.png).
- [Grouped mobile menu](after/menu-mobile-dark.png), [desktop comparison](after/compare-1440.png), [light-mode guides](after/learn-1440-light.png), [workspace](after/workspace-390.png), [home](after/home-1440.png).

## Release / recovery

Use the existing Cloudflare Git production branch, codex/stage2-publication-2026-10-04. Preserve the merged morning-price commit 47277f3. Do not modify DNS, the default branch or saved-browser storage. Verify the expected commit at /data/release.json and inspect actual public HTML, controllers, fonts and browser interactions before describing the work as deployed. A Git push or hosted status badge alone is insufficient.

This release’s final Cloudflare check completed successfully at 2026-10-17T17:16:01Z. An earlier failure status was superseded by successful completion; its temporary cause was not diagnosed. No DNS or dashboard settings were changed. Roll back a display regression with a normal tested revert commit; retain newer legitimate price observations and all existing local storage keys.

## Remaining scope and visual debt

This is a UI refinement of the existing features. It does not create new measured FPS records, universal exact 3D models, additional live retailer coverage, cloud sync or private analytics access. Edge viewport/touch emulation is not a physical iPhone/Safari or screen-reader certification. Lab payload counts are not field Core Web Vitals or measured traffic/rank improvements. Real-device Safari, zoom/assistive-technology review and field measurements remain useful follow-up validation. Long or unusual product names can wrap naturally rather than being clipped to force equal text height.

## Implementation map

Shared generation: scripts/ui-refinement.cjs, scripts/seo-pass.cjs, scripts/build-pages.cjs. Shared styles: scripts/ui-system.css, scripts/ui-destinations.css, scripts/ui-selectors.css, scripts/builder-picker.css. Interaction source: scripts/continuation-ui.js, scripts/builder-selectors.js, scripts/select-ui.js. Portable prepared outputs: scripts/prepare-ui-runtime.cjs, scripts/prepared-ui/. Versioned font caching: scripts/worker.mjs. Generated pages/styles/controllers/fonts live under dist/.

Research used for the implementation: [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Google crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), and the original font licenses recorded in font-sources.json. These guide behavior and evidence; they are not ranking or conformance guarantees.

## Verified live delivery

- Production marker identifies **01563ca9aa3d6787c220b37661eafb8ebc8c3442** on the standard live URL, with staging disabled. The previous morning-price commit remains an ancestor.
- [Existing release checks](../master-completion/qa/live-verification.json): **58 passed**, covering canonical routes, published article/model availability, real 404/host redirects, source/privacy boundaries and regional price APIs.
- [UI delivery checks](live-verification.json): **18 passed**, including exact stylesheet fingerprints/bytes across 13 pages, all three UI controller files and the two main font hashes, MIME types and immutable caching. No local QA instrumentation was published.
- [Actual live browser](live-browser.json): **9 journeys passed** against https://www.pcpartperformance.com/ in an isolated browser. Local saved revisions were test-only and no user profile was touched. The live site does not include the local axe runner; open-state automated accessibility evidence remains in the separate local receipt.
- [Hosting status](cloudflare-release.json): final completed **success**, matching the independently verified live code release.
- [Clean tracked build](clean-build.json): full generation plus nine UI unit tests and all seven payload gates passed without ignored development dependencies; **43 stylesheet bundle fingerprints matched**. The temporary copy was removed after verification.

This receipt update changes documentation only. Production remains on the verified code commit.
