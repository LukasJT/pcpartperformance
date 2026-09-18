# Builder, editorial and search update — 2026-09-18

## Shipped scope

- Restored fan rendering, fitted camera views to scene bounds, improved mobile space and added a recovery path for restored browser pages.
- Expanded catalog by 43 researched retail records: 28 case-fan variants, seven RTX 3060 partner cards, five Lian Li cases and three MSI motherboards. Sources and dimensions are attached to records. The pre-existing catalog still includes aliases for some products; search canonicals consolidate 20 duplicate entries.
- Individual fan quantities, documented case mounting zones, intake/exhaust choices, reverse blades and unsupported/mixed-size mounting states. Placement and airflow persist in shared build URLs. Missing mount information stays unresolved.
- Redesigned parts cards, 3D workspace, compatibility and pricing sections. Multi-brand selector checkboxes do not focus the search field when opened.
- Four new sourced explainers, original diagrams, comparison tables and a verified NVIDIA YouTube companion link. All article claims distinguish company forecasts, specifications and interpretation.
- Descriptive page metadata, canonical consolidation, Article/Product/Breadcrumb/Organization data, social previews, RSS and an indexing policy that omits thin product pages. CSS is bundled by page type.

## Verification

- 1,176 generated pages; 36,157 local links checked. 640 canonical indexable URLs. 516 noindex pages including the error page; 20 product aliases point to their preferred canonical.
- 51 GLBs validated with the Khronos glTF validator: no errors. Largest asset 193,072 bytes; all 51 total 3,472,932 bytes.
- Local desktop builder: 402 ms DOM ready; 0 Three.js/GLB requests before activating preview. A cached/local starter scene loaded in 60 ms. These are local observations, not production Core Web Vitals.
- Desktop and 390-pixel mobile viewport checked, both themes. No horizontal overflow in sampled builder/article layouts. Multi-brand filters, product replacement, fan placement persistence, reset, camera rotation/zoom and exploded view checked.
- Forced model HTTP 503 failures show a retry control and preserve the parts list.
- Cooling checks cover mount capacities, mixed fan sizes, unsupported rear sizes and missing case data.

## Remaining limits

- Models are original simplified illustrations. 0 manufacturer-verified exact meshes, 51 approximate meshes and 726 catalog entries without meshes. Outer dimensions do not establish internal mounting coordinates, cable or radiator clearance. This is not an exact visual/engineering replica for every component.
- Only researched case mounting layouts can place fans. Actual fan header counts, controllers, cables, cooler/radiator collisions and cooling performance are not certified.
- Legacy guide redirects on the static host currently use canonical URLs and client redirects. Previous deployments did not apply the supplied `_redirects` rules as HTTP 301s; actual live status is checked after publishing.
- No Search Console or production field-performance access. No traffic, ranking, Google News or Discover placement is promised. These are explainers, so they use Article rather than NewsArticle and no news sitemap is generated. Publisher contact information needs an owner-provided public channel before claiming full news-publication transparency.

## Search documentation reviewed

- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/special-tags
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/google-discover
- https://support.google.com/news/publisher-center/answer/6204050
- https://support.google.com/news/publisher-center/answer/9607104
