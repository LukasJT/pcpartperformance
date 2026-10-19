# Exact-model catalog intake — 2026-10-19

## Implemented and tested

The additive intake is implemented in `scripts/total-catalog.cjs`; the authoritative bounded research packets are in `data/catalog-intake/2026-10-19/`. It reuses the existing catalog, product HTML, comparison and builder delivery. It does not replace the architecture or consolidate existing IDs.

The actual packet adds **63** independently identified records: **20 AIB GPUs, 17 CPUs, 21 individual memory modules and 5 enterprise SSD capacities**. The inherited baseline has **1,236 records**; the merged array has **1,299**. GPU counts change **165 → 185**, CPU **167 → 184**, memory **66 → 87**, SSD **78 → 83**. All other inherited counts remain unchanged. Existing records were counted, not all reverified.

There are **49 inspected primary-source entries**, **30 explicit manufacturing/model part numbers**, **33 unknown exact ordering MPNs** and **63 unknown hardware revisions**. MSI's complete commercial model names remain distinct without inventing regional retail order codes. A manufacturer document revision is not asserted to be a hardware revision.

The AIB batch covers MSI's GTX 950–1660 Ti/SUPER families, one exact Gigabyte GTX 750 Ti and three named ASRock Arc boards. The source differences matter: the MSI GTX 960 GAMING 2G and 4G have different recorded thicknesses; GTX 1060 3G and 6G have different shader counts. These records are not collapsed into the existing base GPU identities.

Nine Xeon E5 v4 and eight Threadripper 7000/PRO records are references, not consumer-builder choices. The same applies to seven RDIMMs, two SO-DIMMs and five enterprise SSDs. **32** additions are eligible for the existing consumer builder (20 GPUs and 12 UDIMMs). System-level ECC is not inferred from DDR5 on-die ECC. A single-module part number is not a matched memory kit.

## Publication contract

1. Before images/product pages are generated in `build-pages.cjs`, call:

   `require('./total-catalog.cjs').prepare({root, records})`

2. In `build-model-library.cjs`, after the existing completion catalog is applied and before coverage is calculated, call:

   `require('./total-catalog.cjs').prepareCatalog(c.records)`

3. In the HTML pass before bundling, call:

   `h = require('./total-catalog.cjs').polishHTML(h, route, records)`

4. Include `scripts/total-catalog.test.cjs` in checks.

This writes `dist/total-catalog-data.js` for ordinary interactive compare pages and `dist/data/total-catalog-provenance.json` for complete evidence. All `/hardware/` routes, including category landing pages, get `total-catalog-loader.js` plus `data/total-catalog-display.json`. Crawlable static catalog HTML is preserved. Additional display records load on idle or immediately when search/filter controls change; the existing renderer updates without clearing query/category. Loading/error status and a retry action are provided. Compare links receive complete records before `interface.js` initializes so selected new IDs are preserved. Builder and performance pages retain their existing dedicated narrowed delivery. Product pages gain an optional compact exact-identity/source disclosure. Existing search/page generation consumes the merged array.

The complete standalone display payload measured **5,889 gzip bytes**. The deferred hardware loader measured **924 gzip bytes**, keeping full specification data out of its synchronous script cost. The 32 builder additions measured about **7,993 gzip bytes** separately before the parent delivery projection/minification pass. Full-page budget tests must be rerun; these numbers are not a browser performance or Core Web Vitals result.

## Repeatable pipeline

1. Discover an actual product from an original manufacturer's page or document.
2. Record the precise source URL, inspected date, publisher, bounded scope and exact named models in `sources.json`.
3. Bind each intake row to that exact source observation and preserve unknown MPN/revision explicitly as `null`.
4. Normalize only supported conversions: MHz to GHz; cm to mm; decimal storage TB to GB; legacy graphics MiB to marketed GB. DDR data rates remain MT/s, not MHz.
5. Run `node scripts/total-catalog.cjs` for an offline intake/coverage report.
6. Run `node scripts/total-catalog.test.cjs`.
7. Run the normal complete build and regression checks after integration.
8. Review actual product and catalog rendering before release.

`total-catalog-authoring.cjs` reproducibly writes this bounded packet from the inspected observations; it is not a retail API, a discovery scraper or a claim of continuous verification. New batches can use the same JSON schema with `loadPackets(directory)`. Imported JSON is never executed. No arbitrary URL is fetched by this module.

The lane rejects wrong product/model scope, duplicate exact MPNs, stable-ID changes, conflicts against an existing identity, malformed units, unsupported fields, non-manufacturer source classes, spoofed publisher domains, false/future inspection dates, mixed memory capacity/generation, wrong storage interface, professional platforms exposed as consumer-compatible, and free-form price/FPS/media/compatibility injection. The complete batch validates before any shared-array mutation.

The source-observation hash includes facts and source metadata. A changed source or hand-edited record creates a review conflict; it cannot silently overwrite or freeze an existing record. No automated merge is used.

## Tests actually run

**23 catalog checks passed** on 2026-10-19, including actual packet import, idempotency, source changes, identity/capacity separation, unit rejection/conversion, reference-only platform protection, browser payload VM execution, generated output/provenance, XSS-shaped input, atomic rejection, rollback planning and lazy-loader failure/retry/filter preservation. Real rendered browser QA is owned by the parent release; this report does not claim it ran.

## Gaps and excluded candidates

- Four unresolved candidates are excluded and individually recorded in `candidates.json`.
- EVGA GTX 750 Ti historical original PDFs are search-discoverable but redirect to the homepage when opened. Search snippets were not promoted into published records.
- Two ECC UDIMM candidates need corroborated module-class/platform scope before intake.
- The 4 GB ValueRAM datasheet timed out. The live family table supports identity/capacity/rank/class but not a transcribed timing/voltage record; those facts are withheld for that model.
- **0 new exact photographs, 0 downloaded 3D models and 0 retail offers** were acquired in this workstream. No existing photo/model was remapped to imply a match. All 63 new exact-media gaps remain explicit in `coverage.json`.
- No entire vendor lineup, historical generation, regional market or whole catalog is claimed complete. No denominator supports a completeness percentage.
- This does not meet the full prompt's exhaustive GPU/CPU/case/HDD/PSU/cooler scope. Additional inspected packets are required.

## Rollback and saved data

Before release, retain the prior Git commit and generated artifact as the normal deployment rollback. Source intake is additive; prior IDs and saved builds are untouched. `planRollback(records, ids)` produces a reviewed withdrawal plan and refuses unknown or edited records; it never deletes user storage or routes. If an addition must be withdrawn after public use, keep its historical identity/URL stub and explicitly flag affected references instead of silently substituting another product. No destructive migration is required for this batch.
