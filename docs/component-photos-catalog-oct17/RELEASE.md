# Verified production release

- Production: https://www.pcpartperformance.com/
- Released code: `f704e335c46f2fdb7f0a18f81e65bdd7eb03d892`
- Git branch: `codex/stage2-publication-2026-10-04`
- Cloudflare: `pcpartperformance-live`; Workers Build completed successfully.
- Public production marker reports that exact commit with `staging: false`.

## Delivered

529 reviewed component-image corrections/bindings; 665 of 857 builder components now have accepted images. 192 remain unresolved and use an honest fallback. See `final-coverage.json` for every ID, category and audit reference. This release does not claim all images are finished.

The corrected pictures are shared across builder choices, selected-part thumbnails, catalog/shop listings, comparisons and product pages. Exact partner GPU variants, memory capacity, kit configuration, PSU wattage, case colour and motherboard revisions are kept distinct. ZOTAC RTX 3060 Twin Edge and GIGABYTE RTX 4090 AERO OC have their own exact supplier images; the latter retains the small native 200px source.

List and picker thumbnails stay within 320px. Large comparison cards and product pages retain their full pictures. Comparison image data excludes research-only fields while preserving credits. The mobile comparison picker no longer inherits 40px figure margins that squeezed names into narrow columns. Unchanged content-addressed CSS bundles are no longer repeatedly rewritten during generation.

## Verification actually completed

- Full normal build passed.
- 76/76 repository check groups passed; type check and scoped lint passed.
- All 1,058 full/thumbnail references decoded and passed dimensions, hashes and budgets. Aliases resolve to 1,026 distinct new public files; every new public asset is referenced.
- All 529 repaired product pages contain the intended full picture and source disclosure.
- 1,592 generated route-policy pages passed structural HTML/metadata/link checks, with zero issues or duplicate indexable titles/descriptions.
- All seven existing route-size/optional-3D budgets passed without increasing their limits.
- Nine mobile interaction/accessibility journeys passed, including filters, keyboard selection, saved-build restoration, themes, comparisons and reduced motion.
- 21 local and 21 live photo/layout checks passed at 360px, 390px and 1440px. Every run ended without page errors. Mobile uses touch emulation.
- **1,053 public HTTPS photo-release checks passed:** all 1,026 new asset byte hashes, three image indexes and 24 sampled product pages.
- The other live verifiers passed 58 production checks, 18 UI checks and 19 starter-photo checks.
- Git object connectivity check passed before publication.

Detailed receipts and screenshots are in `qa/`. `delivery-before-after.json` reports actual asset bytes/gzip versus the prior production commit. More correct pictures increase the lazy builder image index; no field Core Web Vitals improvement is claimed. The existing startup budgets still pass.

## Remaining limits

The 192 missing matches are recorded individually. They include unresolved exact identity/revision/specification, blocked sources and insufficient photo evidence. CPU research respected explicit source backoff responses. No missing value was replaced with another capacity, partner SKU or CPU label, and a failed request was not treated as proof that a photograph does not exist.

Source and creator credits remain truthful. Manufacturer/supplier product media are not claimed to be open-license. Photos do not certify geometry, compatibility, stock, price or new-product condition. No 3D geometry, articles, pricing observations or DNS settings changed in this release.

Browser QA used isolated headless Edge contexts. This work did not require the user's Chrome profile. The earlier connected-Chrome request was for visual inspection and was unnecessary for these checks.

## Next executable step

Continue research from the unresolved rows and their primary/supplement audit records. Resolve ambiguous model/SKU records before adding an example picture. Add reviewed replacements to the appropriate registry, run the build and gates, and publish another normal Git release. Use `verify-catalog-photos-live.mjs` against its actual deployed commit. A rollback should use a tested revert commit through the same deployment branch, preserving history.
