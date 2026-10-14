# Clarity and discovery release

## Implemented

- Shared navigation exposes PC Builder, Prebuilt PCs, Phones, Game FPS, Hardware and Guides. Secondary tools are grouped by task.
- Homepage GPU image frames and VS centers align. Duplicate entry sections and repeated labels are reduced.
- Phone Size / 3D / Specs controls are explicit; Pixel 9 imagery stays within its frame. Creator/license records remain accessible.
- Builder planning and secondary sharing controls are quieter. Purchase pricing excludes owned parts and keeps unknown totals explicit.
- The checked purchase subtotal now appears in Review and save. The former workspace script and stylesheet hiding it were corrected; mobile and desktop display were checked in the live browser.
- 84 exact researched prebuilt configurations: 43 Canada and 41 US. Brand/GPU/search filters, pagination, shortlist and exact comparison remain working.
- 42 exact gaming-laptop configurations: 21 per country, with multi-brand filters, comparison, sharing and source links. Laptop GPU identities remain distinct from desktop counterparts.
- 44 guides are organized into eight topics with search. Four complete new guides use 11 primary source records. The game library has 107 existing game profiles in a searchable, paginated destination.
- Public price API, fixed-source validation, 15-minute asset caching, expiry and regional handling support six exact listings. A daily Git collector is scheduled for 07:17 America/Toronto. Production reads dated deployed observations rather than making blocked retailer requests from Cloudflare. Retailer failures do not invent an offer or stock; workflow activation and deployment are verified separately.
- Reader-facing AI-assistance banners are removed as requested. Organizational authorship and internal provenance remain truthful.
- Shared motion, icons and responsive layout preserve reduced-motion and keyboard behavior. Shopping resources are deferred from ordinary pages and product prices load as their section approaches the viewport.

## Verification

49 suite commands passed after the daily-snapshot integration, including parser, expiry, ownership, regional handling, atomic writing and Worker asset-response checks. ESLint and the existing release-policy TypeScript check passed. Twenty final browser layouts had one main heading and no horizontal page overflow, at 390 and 1280 px. Controls were exercised in light and dark modes; actual phone/build models and real Canadian quote responses were inspected. The initial normal collection produced four Canadian observations, with two available/new listings eligible for a partial purchase subtotal.

Seven measured initial payload budgets passed. Homepage script gzip decreased from 9,420 to 6,042 bytes; builder from 121,406 to 119,274 bytes. These are static payload measurements, not field Core Web Vitals or a traffic experiment. Before/after records are in `qa/`.

## Dependencies and limits

Memory Express, Vuugo, Amazon and Best Buy automatic offers remain unconnected. The six public source targets do not establish cheapest prices across all stores or offer coverage for the whole catalog. The latest Newegg request was restricted; no fresh US quote was collected. The Canadian targets include sold-out and incomplete listings; these are excluded where applicable. Every actual observation expires within 24 hours, and a failed refresh cannot advance its check time.

No new measured PC benchmark dataset, certified 3D-fit geometry, ranking guarantee, traffic measurement or personal hardware review is claimed. External retailer artwork can fail independently of this site; original listing recovery links remain available. Twelve prior unresolved product/title identities remain in the existing review register.

## Publication and rollback

Publish the verified branch to the existing `codex/stage2-publication-2026-10-04` deployment branch. Cloudflare builds the same source and stamps its commit in `/data/release.json`. Run `verify-live-clarity.mjs` and the retained live-release checks against that SHA, then record the actual response and browser proof.

Rollback is a reviewed Git revert of the release commit on the deployment branch, followed by the same CI and live-marker verification. The previous verified production commit is `4e5bee5c2072fba3e115c4b7d436c22f9fc29f83`. No database migration, DNS change, purchase or credential change is included.

The next executable pricing expansion is to obtain supported retailer/feed access, add exact pinned identities and source adapters, and validate condition, availability, region and expiration before admitting an offer.

## Verified live receipt

The final live revision is `d0fc4a79128e390035eada4cc3163049c5bee0e4`, verified October 14, 2026. The existing Cloudflare build completed successfully. Live checks confirmed 10 principal routes, 13 retained editorial resources, 20 researched product panels, decision tools, and the retained licensed creator asset. The source regression suite ran 49 commands successfully after the visibility correction; the builder workspace suite includes 11 behavior checks.

The [initial daily collector run](https://github.com/LukasJT/pcpartperformance/actions/runs/38623037282) completed successfully and committed four genuine Canadian observations in `adf9c49`. Cloudflare deployed that bot commit, proving that the existing Git flow accepts automated updates. The scheduled 07:17 Toronto execution is configured; this first observed run was triggered by publishing the workflow, not by a future morning event.

Four listings have actual observations: CPU and RAM available when checked, SSD and GPU sold out. The motherboard lacks required offer identity and the US listing rejected the request. No claim of all-store coverage, live checkout stock or a complete build total is made. Expired observations are excluded. Other retailer access still requires a working permitted source.

Screenshots and machine-readable receipts are in `qa/`, including `live-homepage-desktop.png` and `live-builder-price-mobile.png`. The earlier before/after payload report predates the final 16-byte builder-script increase; the final seven-route budget report records 6,042 homepage script gzip bytes and 119,290 builder script gzip bytes, against the original 9,420 and 121,406 byte baselines. These are lab payload measurements; search traffic and field Core Web Vitals were not measured.

No new certified geometry or new Sketchfab downloads are claimed in this clarity release. Existing creator models, licensing, deferred rendering and model-coverage evidence remain available. For rollback, disable the daily workflow before a coordinated code/data revert; preserve real observation timestamps and repeat the live revision checks.
