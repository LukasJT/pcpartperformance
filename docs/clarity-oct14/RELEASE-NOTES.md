# Clarity and discovery release

## Implemented

- Shared navigation exposes PC Builder, Prebuilt PCs, Phones, Game FPS, Hardware and Guides. Secondary tools are grouped by task.
- Homepage GPU image frames and VS centers align. Duplicate entry sections and repeated labels are reduced.
- Phone Size / 3D / Specs controls are explicit; Pixel 9 imagery stays within its frame. Creator/license records remain accessible.
- Builder planning and secondary sharing controls are quieter. Purchase pricing excludes owned parts and keeps unknown totals explicit.
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
