# Component picture corrections — 17 October 2026

## Scope and status

Audited all 857 builder-eligible component identities. The integrated release has 529 reviewed corrections or explicit reviewed bindings, and 665 available component images. **192 identities still need a verified picture. This is not a claim that every catalog photograph is finished or that missing photographs do not exist.**

| Task | Dependency | Status | Evidence / affected files |
| --- | --- | --- | --- |
| IMG-1: inventory every builder component | Existing catalog | Complete | `catalog-audit.json`; `scripts/audit-component-photos.cjs` |
| IMG-2: source and visually inspect replacements | IMG-1 | 529 reviewed bindings; 192 unresolved identities | Ten `scripts/component-photo-*-oct17.json` registries; category source audits and contact sheets; `final-coverage.json` |
| IMG-3: reject wrong variants across presentations | IMG-2 | Implemented | `scripts/apply-verified-photos.cjs`, `builder-photo-delivery.cjs`, `component-photo-catalog.cjs`; builder, product, shop and comparison data |
| IMG-4: efficient pictures and readable rows | IMG-3 | Implemented | Local proportional WebPs and thumbnails; `program-image-delivery.cjs`, `build-pages.cjs`, `dist/interface.js`, `scripts/ui-destinations.css` |
| IMG-5: verify files, controls, HTML and layout | IMG-4 | Check receipts in `qa/` and master QA directory | `component-photo-catalog.test.cjs`, `check-component-photo-files.cjs`, `check-catalog-photos-browser.cjs`; full repository checks |
| IMG-6: publish through existing Git deployment | IMG-5 | Release verification recorded separately after deployment | `qa/live-verification.json`, `qa/live-browser.json`; production marker |

The generic GPU catalog can show a named partner card only with matching chip and memory capacity. A named retail card cannot inherit another partner's picture. New images must retain exact catalog identity, evidence, review status, source/credit information, file hashes and thumbnail hashes. Changed or unreviewed files fail the build.

Manufacturer or supplier publication is not represented as an open license. Commons photographs retain their named creators and licenses. Nine CPU supplement inputs use already cached published previews: their actual intake URL and hash scope are explicit; full-resolution originals were not downloaded after rate limiting. Some sources legitimately assign an identical exterior image to multiple exact SKUs. No differences are fabricated. Image evidence does not establish clearance, price, stock, condition or a certified 3D model.

## Result by category

| Category | Available | Catalog |
| --- | ---: | ---: |
| Graphics cards | 148 | 165 |
| Processors | 69 | 165 |
| Motherboards | 118 | 120 |
| Memory | 60 | 66 |
| SSDs | 34 | 78 |
| Hard drives | 21 | 45 |
| Power supplies | 68 | 70 |
| Cases | 84 | 85 |
| Fans | 50 | 50 |
| CPU coolers | 13 | 13 |

`final-coverage.json` lists every ID and distinguishes newly reviewed bindings from retained images. Retained GPU pictures were inspected by the GPU task; all retained CPUs and motherboards were inspected on the five sheets recorded in `qa/retained-review.json`. Existing source/rights records remain unchanged where no new manufacturer verification occurred.

## Delivery and layout

- Full new images are bounded by 800px; picker/list thumbnails by 320px. Native small sources are never enlarged. The GIGABYTE AERO supplier picture is 200px and the IronWolf source is 110px; both explicitly carry a low-resolution record.
- Hardware lists no longer transfer redundant exact-model captions. Their accessible alternative uses the exact catalog name. Pictured GPU variants remain explicit.
- Comparisons transfer only image URLs and the credit fields they actually use. Research notes, intake hashes and review records remain in the source registry and product disclosures.
- Comparison pickers use small thumbnails; large comparison cards retain full images.
- Default figure margins were squeezing mobile picker names. Scoped zero margins fix the picker and catalog frames; a rendered check enforces adequate text width.
- CSS generation avoids rewriting an identical content-addressed bundle for every page, preventing a repeated Windows file-write failure encountered during QA.

## Validation and release

Run the existing build, then `node scripts/run-master-checks.cjs`. Additional file decoding uses `node scripts/check-component-photo-files.cjs` with the bundled Sharp path in `PCP_SHARP_PATH`. Browser checks use isolated Playwright/Edge with `PCP_PLAYWRIGHT_MODULE`; no Chrome profile is required.

Receipts cover all new full/thumbnail files, all 529 repaired product pages, malformed identities, changed capacity and partner models, hashes, URL safety, small payloads, rendered pictures, 360px/390px/1440px layouts, keyboard controls, saved builds, source disclosures and unchanged SEO route policy. Static size budgets are lab regression checks, not field Core Web Vitals.

Use the existing `codex/stage2-publication-2026-10-04` deployment branch and `pcpartperformance-live` Worker. Verify the production commit marker, public image indexes, all new asset hashes and sampled product pages using `verify-catalog-photos-live.mjs`, followed by rendered live checks. No DNS or Chrome-session change is needed.

For rollback, create a normal revert commit, rebuild and run the same release checks, then push through the existing deployment branch. Preserve the previous release (`bd7981151dfc82080af228853fdc4ea45e0e9741`) and do not reset or force-push deployment history.

## Remaining work / exact checkpoint

Continue from the 192 `needs-correct-photo` rows in `final-coverage.json`, using the per-ID primary and supplement audits. Missing includes blocked downloads, insufficient exact model evidence, capacity/timing conflicts, explicit motherboard revision mismatches and generic records without a unique SKU. These reasons are distinct; a failed request does not mean no picture exists.

Known identity questions include the generic Supermicro case and redundant PSU, historical generic RAM modules, and two RAM configurations whose accessible search results establish different capacity/timing combinations. The two withheld GIGABYTE boards require the specified PCB revision. CPU research encountered explicit 600-second upload and 1000-second category backoff responses; no bypass or immediate retry was used. Future work must respect the actual current backoff state and source permissions.

Existing photos and all 3D geometry remain separate systems. No new 3D assets, benchmark results, prices, analytics claims or articles were added in this correction release.
