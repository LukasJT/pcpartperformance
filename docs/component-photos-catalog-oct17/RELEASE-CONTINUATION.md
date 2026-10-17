# Component-photo continuation — verified live

- Production: https://www.pcpartperformance.com/builder/
- Deployed commit: `e8c321b90d75e4dca9f0e96ded6b39dd71b83fd4`
- Deployment branch: `codex/stage2-publication-2026-10-04`
- Cloudflare Worker: `pcpartperformance-live`; build completed successfully.
- Public `/data/release.json` reports the same commit and `staging: false`.

## Delivered

185 additional reviewed component-photo bindings and 370 proportional WebP files: 96 CPUs, 17 GPUs, two motherboards, four memory records, 43 SSDs and 23 hard drives. The catalog now has accepted images for 850 of 857 builder components, including every CPU, GPU, motherboard, fan and CPU cooler. The shared delivery system applies the pictures to builder choices, selected parts, product pages, shop/catalog listings and comparisons.

Seven records remain unresolved because exact model identities conflict with available documentation or lack a unique SKU. They retain honest fallbacks. [The continuation checklist](REMAINING-192.md) lists each record, findings and the evidence needed. This is not complete 192-of-192 coverage, nor proof that no photographs exist.

The IBM VGA memory unit was corrected to 256 KB using IBM documentation. Its stable ID remains unchanged. Compact directory/filename encoding keeps the image indexes within the existing route budgets; no startup budget was increased. The lazy builder image index grew from 22,800 to 29,340 gzip bytes as coverage expanded. This is a file-size measurement, not a field Core Web Vitals result.

## Production integration

Preserved the four newer production advertising commits through `2158ac8`. Fixed an integration defect that let internal ad documents enter the SEO page pipeline: all five remain noindex assets outside the public sitemap. Added a regression test. The browser interaction journey explicitly declines optional ads and verifies the region and theme controls work without loading ad frames.

## Verification actually completed

- Full normal build passed after the production merge.
- All 77 repository check groups passed; type check and scoped lint passed.
- All 1,428 reviewed full/thumbnail references decoded and passed hash, format, dimensions and delivery budgets. Aliases resolve to 1,396 distinct public files.
- All 714 reviewed product bindings passed generated-page checks.
- Structural HTML audit: 1,592 pages, 1,088 indexable, 98,627 internal links and 6,956 images; zero recorded issues or duplicate indexable titles/descriptions.
- Resource audit passed. All seven existing route budgets passed without raising their limits.
- Nine isolated Edge interaction journeys passed, including keyboard controls, saved-build restoration, region, theme, filters, comparisons and reduced motion.
- 30 local and 30 live photo/layout cases passed at 360px, 390px and 1440px, with zero recorded page errors. Mobile checks use touch emulation.
- 1,423 public photo-release checks passed: 1,396 asset byte hashes, three image indexes and 24 sampled product pages.
- Other live verifiers passed 58 feature checks, 18 UI checks and 19 starter-photo checks.
- All five isolated ad assets were verified absent from the live sitemap, delivered from their separate origin, and marked noindex. No advertising script was executed by that HTTP verification.
- Git object connectivity check passed before publication.

Receipts and rendered screenshots are in `qa/`. `continuation-cloudflare-build.json` records the successful provider check and public marker. `continuation-delivery.json` records actual before/after coverage, asset bytes and gzip measurements. The final documentation receipt is committed locally after deployment to avoid triggering a redundant production build.

## Limits and next executable step

Resolve the exact SKU or correct the catalog identity for the seven records before attaching another product's picture. Preserve saved-build IDs, sources, pictured variants, credits and previous records. Public manufacturer or supplier publication is not claimed to be an open license. A product photograph does not certify dimensions, fit, thermal behavior, stock or price.

No new 3D geometry, prices, articles or DNS configuration were added in this increment. Browser QA used isolated Edge profiles and did not require the user's Google Chrome profile.

Rollback uses a reviewed revert commit through the same build and deployment checks, preserving the newer production changes. Never reset or force-push deployment history.
