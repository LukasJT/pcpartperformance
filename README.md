# PC Part Performance

A static hardware comparison site with dedicated comparison, catalog/category, PC builder, learning guides, and part pages. Supports persistent light/dark themes, fluid navigation, page transitions, theme reveal, comparison animations, and reduced-motion preferences.

## Build and host

Run `node scripts/build-pages.cjs` with Node.js to regenerate the pages, then serve the `dist` directory. There are no build dependencies. Generated individual hardware reference pages are excluded from Git and recreated by the build command.

The original domain's existing hosting configuration is retained in `CNAME`. The Sites manifest points to a separate private redesign preview; it does not change the domain's DNS or existing hosting.

## Data and assets

The 1,104-record catalog and compatibility engine were recovered from the existing public pcpartperformance.com website on September 15, 2026. Source URLs and model notes remain available in comparisons and reference pages. No new game FPS measurements were invented.

All 443 CPU, GPU, RAM and SSD entries have photographs: 53 exact-model, 223 product-family, and 167 reference mappings. The actual pictured model and mapping type are identified; family/reference images do not assert the selected variant's exact appearance. The same images appear on part pages, comparisons, catalog rows, search results, and selected builder components.

`dist/images.json` is the canonical image manifest. `dist/image-catalog.js` supplies it to the browser, and `dist/assets/hardware/credits.json` retains asset sources and available attribution/licensing metadata. Wikimedia attribution and licence links are displayed with each image's source details. Manufacturer/retailer photography is not asserted to have an open licence. The 103 reusable images are stored locally.

The shared vector mark is in `dist/assets/logo.svg`; `scripts/build-pages.cjs` generates its favicon and applies the shared header, footer, copy and layout to every route.

## Validation

Comparison selection/replacement/removal, invalid IDs, all four component-category comparison routes, theme persistence, catalog filtering, category pages, guide navigation, builder clear/starter behavior and builder photos passed DOM checks. A structural audit checked 1,119 pages, 30,648 internal link/asset references, one main heading per page, image alternative text, and complete coverage of all 443 requested component images. No browser visual testing was performed.
