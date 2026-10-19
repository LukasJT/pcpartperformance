# PC Part Performance

A static hardware comparison site with dedicated comparison, catalog/category, PC builder, learning guides, and part pages. Supports persistent light/dark themes, fluid navigation, page transitions, theme reveal, comparison animations, and reduced-motion preferences. Static pages load a small shared UI bundle; catalog data is downloaded only by interactive comparison, hardware, and builder routes.

## Build and host

**October 19 redesign:** the Liquid Hardware Lab work is on `codex/liquid-evolution-2026-10-18`. It adds six coordinated palettes, a three-stage builder, refined pickers and page-family layouts, original SVGs, eight interactive hardware diagrams and Journey preparation. All 36 new editorial items remain local research drafts. Source/unit/build checks pass; browser approval recovered and 348 accepted responsive states plus seven real interaction flows now pass. See [the release record](docs/evolution-oct18/DEPLOYMENT.md) for exact publication status and [the initial checkpoint](docs/evolution-oct18/IMPLEMENTATION-REPORT.md) for implementation scope.

Run `node scripts/build-pages.cjs` with `PROGRAM_PREVIEW` unset to generate normal production output. Licensed model files and prepared image derivatives are retained; do not regenerate the entire model library as part of an ordinary release. Generated individual hardware record pages are excluded from Git and recreated by this build command.

The production build lives in `dist`. The existing Cloudflare Workers Git integration deploys `codex/stage2-publication-2026-10-04` to pcpartperformance.com using `wrangler.jsonc`. The Worker handles canonical URLs, query indexing controls, assets and the optional price API. The `CNAME` file is historical and does not configure Cloudflare DNS.

See [the October 16 product release report](docs/transformation-oct16/RELEASE-REPORT.md) and [deployment checklist](docs/program-2026-10-09/deployment-checklist.md). A successful push must be followed by public release-marker, route, API and browser verification. `node scripts/verify-live-release.cjs <40-character-commit>` runs bounded read-only HTTP smoke checks. `node scripts/release-preflight.cjs` checks production flags, changed JavaScript syntax, asset sizes and recognizable credential leakage.

For local draft review, use `PROGRAM_PREVIEW=1` only on a private review build. Human article review and publication are separate from automated validation. New drafts remain withheld until truthful review and publication records exist.

## October 16 product workflow

The builder supports a shared Guided/Expert picker, twelve source-linked CPU coolers, a printable/downloadable build report and private manual purchase quotes. `/my-pc/` preserves the original revision collection and adds a local notebook, journal, revision comparison, watchlist and saved-PC upgrade handoff. Local data is not cloud-synchronized.

The current generated catalog has 1,228 records, including 852 builder parts. 3D coverage is 105 downloaded-model mappings, 735 simplified previews and 12 parts with no asset; none is clearance-certified. Daily prices cover a small fixed supported retailer cohort, with exact identity and expiry checks. Unsupported PC FPS remains insufficient measured evidence.

Run `node scripts/run-master-checks.cjs` after generation. Additional changed-source lint and the existing scoped TypeScript check use the bundled `tools/quality` runtime. See the release report for browser evidence and actual deployment status.

## Data and assets

The 1,104-record catalog and compatibility engine were recovered from the existing public pcpartperformance.com website on September 15, 2026. Source URLs and model notes remain available in comparisons and reference pages. No new game FPS measurements were invented.

The image manifest records the product pictured for each catalog entry. Some images show a related variant; the part page identifies the pictured model and links to its source. Exact manufacturer photos have been added for selected GPUs, fans, keyboards, and mice. The same image manifest serves part pages, comparisons, catalog rows, search results, and selected builder components.

`dist/images.json` is the canonical image manifest. `dist/image-catalog.js` supplies it to the browser, and `dist/assets/hardware/credits.json` retains asset sources and available attribution/licensing metadata. The catalog includes 69 official manufacturer mappings, including 59 exact-model photos from AMD, NVIDIA partners, Apple, Samsung, Google, PlayStation, Xbox, Nintendo, Corsair, Logitech, Razer, Shure, HyperX, ASUS, Western Digital, Cooler Master, and other makers. Wikimedia attribution and licence links are displayed with each image's source details. Manufacturer/retailer photography is not asserted to have an open licence. The 254 unique reusable image files are stored locally.

The shared mark is in `dist/assets/logo.svg`. Search-friendly raster versions are `dist/assets/favicon.png`, `dist/assets/apple-touch-icon.png`, and `dist/assets/logo.png`; the home page references the organization logo in structured data.

The 3D builder model manifest and peripheral viewer credits are documented in `docs/sketchfab-asset-audit.md`. A downloadable file is not published solely because its title resembles a catalog product; licensing, identity, and in-browser appearance are checked first.

## Validation

Run the `check:program` and `check:continuation` commands defined in `package.json`, plus `node scripts/check-phone-previews.cjs`, `node scripts/check-program-performance.cjs`, `node scripts/check-stage2.cjs` and `node scripts/check-seo.cjs`. The final normal October 11 build has 1,451 HTML pages, with 948 intended indexable canonical pages. Browser QA and model validation records distinguish actual interactions, synthetic fixtures, lab timings and unknown physical clearances.

The morning-price service is implemented but inactive: there is no source account, approved target registry, D1 binding or cron. It returns `not_configured` and empty offers. See [source-access dependencies](docs/program-2026-10-11/morning-price-source-access.md) before activating any collector. No visitors' requests scrape retailers.
