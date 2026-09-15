# PC Part Performance

A static hardware comparison site with dedicated comparison, hardware catalog, PC builder, and reference pages. Supports persistent light and dark themes.

## Build and host

Run `node scripts/build-pages.cjs` with Node.js to regenerate the pages, then serve the `dist` directory. There are no build dependencies. Generated individual hardware reference pages are excluded from Git and recreated by the build command.

The original domain's existing hosting configuration is retained in `CNAME`. The Sites manifest points to a separate private redesign preview; it does not change the domain's DNS or existing hosting.

## Data and assets

The 1,104-record catalog and compatibility engine were recovered from the existing public pcpartperformance.com website on September 15, 2026. Source URLs and model notes remain available in comparisons and reference pages. No new game FPS measurements were invented.

GPU photos are official ASUS product marketing images, with model-specific attribution in `dist/interface.js`. No open image licence is asserted. Only matching cards use these photos; other records explicitly indicate that their product photo is unavailable.

## Validation

Comparison selection/replacement/removal, invalid IDs, theme persistence, catalog filtering, PC builder clear/starter behavior, and local references across 1,110 pages were checked using a temporary DOM harness. No browser visual testing was performed.
