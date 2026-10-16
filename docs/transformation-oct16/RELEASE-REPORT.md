# PC Part Performance — October 16 transformation

## Release state

Implemented, tested and deployed to **https://www.pcpartperformance.com/** through the existing Cloudflare Git integration. Production serves commit `ecb2d0845c81e5d992e32af8d4365a15da4379cd`, independently checked through its release marker, 26 public HTTP/API checks and real rendered browser output. See [live receipt](LIVE-RECEIPT.md).

## Working changes

- PC-first homepage: **Build smarter. Upgrade with confidence.** Three direct actions, a clearly illustrative readiness example, existing real hardware comparison, and secondary phone/prebuilt/game tools.
- Shared navigation: Build, Upgrade, Compare, Hardware, Learn and My PC. Secondary destinations remain in Tools and the footer. Fixed the observed tablet-width navigation overflow.
- Guided and Expert presentations use the same existing picker, selected identities, quantities, locks and compatibility engine. Optional preferences follow selection. Guided controls are delivered in the HTML to avoid moving large panels after first paint.
- Twelve exact CPU coolers: seven air coolers and five AIOs, backed by eighteen manufacturer sources. The tenth URL slot is appended after the original nine. Old eight/nine-slot links retain their meaning.
- Calm empty build and prerequisite-aware **not yet checked** statuses. Cooler checks separate socket support, mounting hardware, installed height, RAM interference, radiator layout and thermal evidence. No readiness percentage or overall guarantee.
- **Build Readiness Report**: source-linked checks, print/PDF through the browser, JSON download with the current selected parts, checked-price basis and private manual quotes. The former “Passport” button name was simplified after the owner's question.
- Manual OS/network/accessory/mounting purchases: quantity, owned status, unknown or explicit quote, and currency scope. Manual quotes stay separate from checked retailer subtotals and out of public parts links.
- `/my-pc/`: original saved revisions, safe duplication, quantity-aware revision comparison, private notes/journal, manual quotes, watchlist and changes from actually observed supported retailer data. Local by default; no fictional account sync or email alerts.
- Saved PC → upgrade inventory → shared readiness checks → builder handoff preserves cooler, fans and multiple component instances. Imports are validated and phases rechecked. A mixed owned/new quantity of one SKU is treated conservatively because builder ownership remains SKU-wide.
- Exact SKU aliases, supported plain-language questions, distinct comparison search results, keyboard result navigation and retry recovery. No numeric SKU fuzzy matching or semantic-AI claim.
- Existing 3D models remain intact. Missing coolers can be inspected without borrowing another mesh. Unsupported categories and identity/path mismatches do not reach placement/loading. Failed updates and page disposal have recovery guards.
- Photo index downloads when the visitor uses the picker or selects parts; an empty builder does not need it. Three.js and meshes remain optional. No new third-party runtime dependency.
- Product templates show unknown specifications explicitly, format array values legibly, add cooler dimension units and link supported components into the builder. Exact cooler pages include source scope and a fit-guide connection.
- Checked daily prices are used consistently in the build report. All-owned inventories no longer look like empty builds. Price-expiry wording distinguishes morning observations from shorter-lived feeds.

## Content delivered

One new complete guide and two substantial revisions, with 3,216 words across the batch, twelve primary sources and three original 1200 × 675 diagrams:

| Work | Route | Reader / practical contribution |
|---|---|---|
| New | `/blog/how-to-choose-a-cpu-cooler-that-fits/` | Buyers checking mounting, installed fan height, RAM and full radiator/fan space; includes a clearly hypothetical worked example |
| Revised | `/blog/build-vs-buy-pc-complete-cost/` | Buyers comparing complete DIY/prebuilt costs with owned, included, quoted and unknown items separated |
| Revised | `/blog/will-a-graphics-card-fit-my-case/` | Buyers checking exact partner-card dimensions, cooling layout and a real documented source conflict |

Original publication dates and canonical URLs survive the revisions. Source fingerprints, editorial state and update records are maintained. Author: PC Part Performance. No invented individual reviewer or firsthand hardware testing.

## SEO and discovery

- Current official Google guidance and qualitative question research are recorded in [SEO research](SEO-RESEARCH.md) and the [intent map](QUERY-MAP.csv).
- Updated homepage, builder, upgrade, compatibility and Build School titles/descriptions; retained crawlable HTML and meaningful anchors.
- New cooler category, product records, workspace landing page and guide are connected to navigation/search/content. Existing redirects and genuine variants remain intact.
- Existing schema, canonical host, sitemap, query-state noindex, error-code and draft-leakage checks remain release gates. Revised Article dates/images match visible content. No fake offers, ratings or measured FPS.
- Public baseline HTTP checks succeeded independently of the research tool. Search Console, analytics and ranking/traffic outcomes were not available and are not inferred.

## Browser journeys exercised

- Select a CPU without opening a search keyboard; advance Guided; switch Expert; load a starter including cooler and two fans.
- Add a manual quote; save; copy a quote-free public link; download a report; open My PC; save notes/journal; restore the exact quote locally.
- Switch CAD/USD: a CAD manual quote remains CAD and is excluded in US totals.
- Open the 3D scene; inspect the GPU and missing cooler; retain the selected cooler in the build; no logged rendering error in the exercised scene.
- Open saved PC in Upgrade, confirm inventory, create reuse plan, return all eleven instances to Builder as owned.
- Search “my gpu won't fit”; focus its relevant guide with ArrowDown; Escape returns to the query.
- Mobile guide diagram/readability and homepage light/dark views. Responsive checks and final screenshots are recorded in `qa/`.

## Objective limits

| Dimension | Assessment |
|---|---|
| Core decision workflow | Connected selection, report, local save/restore and upgrade handoff passed targeted automated and browser journeys |
| Evidence and unknown handling | Narrow source-backed conclusions; unknown price/fit/performance never becomes a fabricated pass or zero |
| Accessibility | Keyboard picker/search and readable statuses exercised; no claim of a complete independent WCAG certification |
| Speed | Existing seven route payload ceilings retained; no eager 3D. Local lab observations are not field Core Web Vitals |
| Retention | Local builds, notebook, revision comparisons and observed price changes work; no cross-device sync or background alert service |
| Price coverage | Existing daily supported listing cohort only. Blocked/unconfigured stores are not invented or bypassed |
| 3D | 852 builder parts accounted for: 105 downloaded-model mappings, 735 simplified previews, 12 without an asset; zero clearance-certified meshes |
| PC gaming evidence | Zero approved matching measured PC records in this release; unsupported FPS remains withheld |
| SEO outcomes | Technical/discovery checks can pass; indexing, rankings, traffic, revenue and Google News placement are not guaranteed or measured here |
| Full master ambition | Not an unsupported 10/10 or universal data-coverage claim. See [program coverage](PROGRAM-COVERAGE.md) for remaining scope |

## Maintenance, dependencies and rollback

Current operational plan: [90 days](MAINTENANCE-90-DAYS.md), assuming eight total maintenance/editorial hours a week. Historical plans are retained as history, not substituted for current receipts.

Keep daily snapshots on the production branch. Do not reset or force-push away scheduled observations. Deploy through the existing Cloudflare Git integration; verify `/data/release.json`, representative HTML, APIs and browser output. No DNS move or new hosting account is needed.

Rollback a release with a normal reviewed `git revert` of its implementation commit, leaving later price observations intact, then use the same deployment and verification workflow. Export local work before manual storage cleanup. This release does not destructively migrate the original revision collection.

### Final validation and deployment receipt

Local normal generation completed: 1,576 HTML routes, 1,074 indexable canonical URLs. All 57 master command groups passed, as did changed-source ESLint and the existing two-module strict TypeScript check. See `qa/final-test-commands.json`.

Seven existing route payload ceilings passed without raising them. Homepage JS remains 6,042 gzip bytes; builder JS is 121,458 gzip bytes with expanded functionality (baseline 119,290), and its photo index is deferred. Builder CSS is 223,913 uncompressed bytes against the existing 224,000 ceiling. These are payload checks, not PageSpeed scores.

Four comparable warm-cache local browser samples: mobile LCP 1,528/1,988 ms, desktop 1,232/1,652 ms; CLS 0 on mobile and 0.00287 on desktop; zero initial Three.js/GLB requests. These are unthrottled local lab observations, not field Core Web Vitals or a claimed before/after field improvement.

Larger valid revision exports now round-trip beyond the former 64 KB limit, with a 4 MB UTF-8 cap and 25-revision bound.

Production is verified at `ecb2d0845c81e5d992e32af8d4365a15da4379cd`. The existing production branch was fast-forwarded without losing daily price snapshots. Cloudflare's Workers build completed successfully. Public verification checked 26 conditions, including 14 feature routes, preferred-host redirects, sitemap discovery, missing-page status, tool-state exclusions, model coverage and exact-listing price responses. Three current CA offers were returned for the queried cohort; this is not all-retailer coverage.

Live browser checks confirmed the empty Guided builder, starter with cooler and two fans, enabled renamed download control, partial price total, My PC landing page and mobile light-mode report. Evidence: `qa/live-*.png`, `qa/live-browser.json` and `qa/live-verification.json`. One browser-native ViewTransition cancellation was logged during viewport/theme testing; the navigation and controls continued to work. No field performance result or universal browser certification is inferred.

### Quality assessment from receipts

| Criterion | Result | Practical limit |
|---|---|---|
| Primary task and navigation clarity | Pass in exercised desktop/mobile routes | No claim of a statistically measured conversion improvement |
| Builder, saved revision and upgrade continuity | Pass in targeted tests and complete local browser journey | SKU-wide ownership cannot separately mark identical units as owned/new; mixed cases remain conservative |
| Price and compatibility integrity | Pass in automated fixtures and live supported cohort | Six pinned retailer targets, unknown prices and manual checks remain explicit |
| Retention and privacy | Pass for local notes, quotes, revision restore, imports and share exclusion | No account synchronization, background alerts or notification service |
| 3D reliability | Pass in tested existing scene, missing-model and recovery cases | 105 downloaded-model mappings; no new assets or fit certification |
| Technical SEO | Pass in generated gates and live HTTP checks | Search indexing, ranking, News placement and traffic impact are unmeasured |
| Accessibility | Partial: keyboard flows, contrast and responsive checks passed | Not a complete independent WCAG 2.2 AA audit |
| Speed and security | Partial: existing payload budgets, local lab samples and targeted input/security checks passed | No new field CWV, complete penetration test or all-device performance claim |
| Deployment | Pass: exact commit, Cloudflare success and actual live UI | Future retailer, source and browser changes still require maintenance |

Next executable maintenance step: review the remaining catalog/source gaps in `PROGRAM-COVERAGE.md`; configure an authorized retailer feed if broader automatic prices are required. The runnable daily supported-price workflow remains in place. No outside integration or outreach was silently activated.
