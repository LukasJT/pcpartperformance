# PC Part Performance

A static hardware comparison site with dedicated comparison, catalog/category, PC builder, learning guides, and part pages. Supports persistent light/dark themes, fluid navigation, page transitions, theme reveal, comparison animations, and reduced-motion preferences. Static pages load a small shared UI bundle; catalog data is downloaded only by interactive comparison, hardware, and builder routes.

## Build and host

Run `node scripts/expand-retail.cjs`, `node scripts/build-model-library.cjs`, `node scripts/generate-models.mjs`, then `node scripts/build-pages.cjs` to regenerate the static site. Serve the `dist` directory. Generated individual hardware record pages are excluded from Git and recreated by the build command.

The production build lives in `dist` and is published through Sites. The `CNAME` file retains the live custom domain.

## Data and assets

The 1,104-record catalog and compatibility engine were recovered from the existing public pcpartperformance.com website on September 15, 2026. Source URLs and model notes remain available in comparisons and reference pages. No new game FPS measurements were invented.

The image manifest records the product pictured for each catalog entry. Some images show a related variant; the part page identifies the pictured model and links to its source. Exact manufacturer photos have been added for selected GPUs, fans, keyboards, and mice. The same image manifest serves part pages, comparisons, catalog rows, search results, and selected builder components.

`dist/images.json` is the canonical image manifest. `dist/image-catalog.js` supplies it to the browser, and `dist/assets/hardware/credits.json` retains asset sources and available attribution/licensing metadata. The catalog includes 69 official manufacturer mappings, including 59 exact-model photos from AMD, NVIDIA partners, Apple, Samsung, Google, PlayStation, Xbox, Nintendo, Corsair, Logitech, Razer, Shure, HyperX, ASUS, Western Digital, Cooler Master, and other makers. Wikimedia attribution and licence links are displayed with each image's source details. Manufacturer/retailer photography is not asserted to have an open licence. The 254 unique reusable image files are stored locally.

The shared mark is in `dist/assets/logo.svg`. Search-friendly raster versions are `dist/assets/favicon.png`, `dist/assets/apple-touch-icon.png`, and `dist/assets/logo.png`; the home page references the organization logo in structured data.

The 3D builder model manifest and peripheral viewer credits are documented in `docs/sketchfab-asset-audit.md`. A downloadable file is not published solely because its title resembles a catalog product; licensing, identity, and in-browser appearance are checked first.

## Validation

Run `node scripts/check-blog-models.cjs`, `node scripts/check-seo.cjs`, and `node scripts/check-cooling.cjs` after building. The latest build produced 1,196 pages, and local browser checks covered the 3D product viewers and builder scene. The static SEO audit resolves internal page, script, stylesheet, and image references.
