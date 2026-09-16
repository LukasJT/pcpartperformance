# PC Part Performance

A static hardware comparison site with dedicated comparison, catalog/category, PC builder, learning guides, and part pages. Supports persistent light/dark themes, fluid navigation, page transitions, theme reveal, comparison animations, and reduced-motion preferences.

## Build and host

Run `node scripts/build-pages.cjs` with Node.js to regenerate the pages, then serve the `dist` directory. There are no build dependencies. Generated individual hardware reference pages are excluded from Git and recreated by the build command.

The production build lives in `dist` and is published through Sites. The `CNAME` file retains the live custom domain.

## Data and assets

The 1,104-record catalog and compatibility engine were recovered from the existing public pcpartperformance.com website on September 15, 2026. Source URLs and model notes remain available in comparisons and reference pages. No new game FPS measurements were invented.

All 1,104 entries across the 17 hardware and device categories have photographs: 155 exact-model, 301 product-family, and 648 reference mappings. The actual pictured model and mapping type are identified; family/reference images do not assert the selected variant's exact appearance. The same images appear on part pages, comparisons, catalog rows, search results, and selected builder components.

`dist/images.json` is the canonical image manifest. `dist/image-catalog.js` supplies it to the browser, and `dist/assets/hardware/credits.json` retains asset sources and available attribution/licensing metadata. The catalog includes 69 official manufacturer mappings, including 59 exact-model photos from AMD, NVIDIA partners, Apple, Samsung, Google, PlayStation, Xbox, Nintendo, Corsair, Logitech, Razer, Shure, HyperX, ASUS, Western Digital, Cooler Master, and other makers. Wikimedia attribution and licence links are displayed with each image's source details. Manufacturer/retailer photography is not asserted to have an open licence. The 254 unique reusable image files are stored locally.

The shared vector mark is in `dist/assets/logo.svg`; `scripts/build-pages.cjs` generates its favicon and applies the shared header, footer, copy and layout to every route.

## Validation

Comparison selection/replacement/removal, invalid IDs, the visual category menu, component-category comparison routes, theme persistence, catalog filtering, category pages, guide navigation, builder clear/starter behavior and builder photos passed DOM checks. A structural audit checked 1,119 pages, 31,314 internal link/asset references, one main heading per page, image alternative text, and complete photo coverage for all 1,104 catalog records. No browser visual testing was performed.
