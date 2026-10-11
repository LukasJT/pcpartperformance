# Product identities and first evidence-supported cohort

Prepared 2026-10-09. Implementation is on the staging branch. This record does not report a production release, editorial approval, traffic measurement or hardware test.

## Checklist and dependencies

| ID | Task | Dependency | Files | Status and evidence |
| --- | --- | --- | --- | --- |
| PRD-01 | Inspect identity handling and historical B850 records | Actual catalog and source pipeline | `dist/core.js`, `scripts/expand-retail.cjs`, `scripts/seo-pass.cjs` | Confirmed: lowercased manufacturer/name matching previously discarded records or chose canonicals without exact variant identity. Parent removed the source-pipeline name matching. |
| PRD-02 | Preserve stable IDs and gate aliases on exact evidence | PRD-01 | `scripts/product-identities.cjs`, `product-alias-decisions.json`, identity section of `scripts/seo-pass.cjs` | Implemented and unit tested. Name agreement creates review candidates. It never activates an alias. |
| PRD-03 | Inspect 20 priority products in original manufacturer documents | PRD-01 | `scripts/program-products.cjs`, generated `product-evidence.json` | Evidence checked by the agent. Priorities are provisional; no Search Console demand or keyword-volume data was available to this workstream. |
| PRD-04 | Add planning, reuse, sources and exact builder actions to existing product routes | PRD-02, PRD-03; parent build hook | `scripts/program-products.cjs`, generated product HTML and `program-products.css` | Implemented for `PROGRAM_PREVIEW=1`; tests render 20 panels. Human editorial review is still required. No additional product URL is created. |
| PRD-05 | Test variant isolation, reversible migration, unknowns, idempotency and staging gates | PRD-02, PRD-04 | `scripts/check-product-program.cjs` | Nine meaningful automated checks passed. No browser claim is made in this workstream's unit-test result. |
| PRD-06 | Integrate and inspect representative generated pages on mobile and desktop | Parent build and browser QA | Product routes, canonical/robots output | Parent owns the integrated build and browser release gates. |
| PRD-07 | Review potential aliases and product editorial panels | Exact legacy SKU/revision evidence and human editorial review | `product-alias-decisions.json`, product evidence/register | Pending. There are zero approved aliases and zero human-reviewed/publishable new panels. |

## Verified issue register

| Finding | Classification | Evidence and treatment |
| --- | --- | --- |
| Product ingestion used lowercased display names to discard or overwrite distinct records. | Confirmed; implementation addressed by parent | The original `core.js` universe/component filtering and retail expansion matched names. They now preserve explicit IDs. Partner cards, revisions and base GPU records remain available. |
| SEO selected a preferred product page from lowercased name/brand groups using specification-count scoring. | Confirmed; implementation addressed | `seo-pass.cjs` now uses the reviewed identity resolver. More fields or a model illustration cannot establish identity equivalence. |
| B850 TOMAHAWK historical IDs have similar names. | Confirmed candidate; exact equivalence unverified | Original MSI named-model specifications and store page were inspected. The generic legacy record lacks a regional SKU/revision and cites a manufacturer-family source. Both IDs remain self-canonical. A contextual staging link connects them without a migration. |
| B650 TOMAHAWK historical IDs have similar names. | Confirmed candidate; exact equivalence unverified | The same identity caveat applies. No permanent alias or HTTP redirect is activated. |
| RM850x (2021) catalog fan size was 135 mm. | Confirmed incorrect field | The CORSAIR 2021 manual introduction specifies 140 mm. The new sourced panel and staging legacy table show 140 mm; parent corrects the central catalog field. This is separate from later RM850x revisions. |
| BarraCuda 2 TB could be an unresolved family record. | Already addressed in existing data; earlier hypothesis rejected | Actual catalog architecture explicitly identifies ST2000DM008. Original Seagate datasheet page 3 confirms its 7200 RPM/256 MB fields. The profile preserves that model; no invented identity defect or exclusion is introduced. |
| An RTX 5060 Ti 8 GB base record is absent from the current catalog. | Improvement opportunity; not simulated | NVIDIA documents both memory configurations, but the existing 16 GB record remains 16 GB. No fake 8 GB identity or borrowed 16 GB specification is created. |
| Some original AMD product URLs could not be verified through the research fetch. | Research-tool limitation, not a confirmed public-site failure | Official Ryzen 5 5600 and Ryzen 7 5700X3D support pages retain model specifications and were inspected. Public HTTP behavior is handled by the independent parent audit. |
| Retail prices, stock, image accuracy and physical 3D model geometry for this cohort | Unverified by this workstream | These panels add no prices, stock booleans, performance uplift, newly downloaded photographs or verified mounting geometry. Those independent systems keep their own evidence gates. |

The generated `product-integrity-audit.json` reports the current catalog and all same-name candidates. It is an audit list, not a list of confirmed duplicates. The first actual test loaded 1,215 explicit product IDs and held 24 name-match groups for review; later builds can change those counts without changing the policy.

## First cohort and intended decision

Every item below has a complete existing-route panel containing a useful answer, a model-scoped source-linked specification table, a decision process, unresolved checks, reuse guidance, meaningful alternatives and ordinary links to the builder and related guides. All 20 are evidence checked and await human review.

| Stable ID | Model/source scope | Useful decision |
| --- | --- | --- |
| `rtx5070` | NVIDIA RTX 5070 base design, 12 GB | Choose the exact partner card before a physical fit or connector decision. |
| `rtx5060ti16` | NVIDIA RTX 5060 Ti 16 GB configuration | Avoid mixing 8 GB offers or interpreting capacity alone as measured FPS. |
| `rtx30506` | NVIDIA RTX 3050 6 GB design | Distinguish the 70 W, 96-bit design from the 8 GB version and verify OEM constraints. |
| `rtx3060` | NVIDIA RTX 3060 12 GB design | Record the installed board before comparing an upgrade or a used purchase. |
| `rx9070` | AMD Radeon RX 9070 base design | Compare workload features, exact offers and partner geometry without a synthetic universal winner. |
| `retail-msi-geforce-rtx-5070-12g-ventus-3x-oc` | MSI G5070-12V3C, 12G VENTUS 3X OC | Use the documented body and 16-pin input for a card-specific plan. |
| `retail-msi-geforce-rtx-3060-ventus-2x-12g-oc` | MSI VENTUS 2X 12G OC | Keep 8G/non-OC versions separate and inspect the exact 8-pin/cooler arrangement. |
| `9800x3d` | AMD Ryzen 7 9800X3D; boxed/tray IDs separate | Compare a supported AM5 swap with full AM4-to-AM5 platform spending. |
| `7800x3d` | AMD Ryzen 7 7800X3D | Consider retaining a capable existing CPU before changing an otherwise useful platform. |
| `5600` | AMD Ryzen 5 5600 support specifications | Reuse supported AM4/DDR4 components and account for discrete graphics. |
| `5700x3d` | AMD Ryzen 7 5700X3D support specifications | Compare a documented AM4 CPU change with complete new-platform costs. |
| `b650` | MSI MAG B650 TOMAHAWK WIFI | Plan occupied M.2/PCIe positions with the CPU-specific documented sharing rules. |
| `b850tomahawk` | MSI MAG B850 TOMAHAWK MAX WIFI | Use this model's different M2_3/PCI_E3 conditions rather than borrowing B650 rules. |
| `ddr4` | CORSAIR CMK32GX4M2E3200C16, 2 × 16 GB | Match generation/module population and treat 3200 MT/s as the rated XMP profile. |
| `ddr5` | CORSAIR CMK32GX5M2B6000C30, 2 × 16 GB | Preserve the Intel XMP SKU rather than silently treating it as a different EXPO kit. |
| `990pro` | Samsung MZ-V9P1T0BW, 1 TB non-heatsink source SKU | Match a suitable PCIe M.2 position and distinguish peak transfers from game results. |
| `samsung870evo` | Samsung 870 EVO 1 TB; US example SKU, local region unknown | Plan a 2.5-inch SATA mount/cables without inventing a catalog regional code. |
| `rm850x` | CORSAIR RM850x 2021 RPS0124/base CP-9020200 | Verify exact modular cables, condition and connector requirements when reusing a PSU. |
| `retail-corsair-4000d-black` | CORSAIR CC-9011198-WW original solid-front 4000D | Separate Airflow/FRAME designs and verify radiators/cables beyond outer-case dimensions. |
| `barracuda2` | Seagate ST2000DM008 | Match the exact drive model and assess useful capacity/health before replacing bulk storage. |

Source records include URL, original publisher, document section, scope, inspection date and paraphrase/redistribution limits. Fact records retain units and `manufacturer_specified`/`unknown` status. A null value displays “Needs verification”; it is never converted to zero.

## Integration and review states

The parent build invokes `require('./program-products.cjs')({root, records, esc})` after the existing publication generator and before the SEO pass. It preserves the site's content system, routes and navigation.

`PROGRAM_PREVIEW=1` adds the 20 substantive panels and the legacy B850 explanatory link. The new content is marked for staging noindex and parent staging controls. A normal build removes those panels and their program-owned markers. It does not declare them published merely because source inspection or automated tests passed. The source evidence JSON also records the mode and human-review status.

Generated outputs:

- `docs/program-2026-10-09/product-evidence.json`: full source register and editorial profiles.
- `product-integrity-audit.json`: current explicit ID count, named candidates, active aliases and deployment/review state.
- `product-redirect-map.json`: approved redirects and proposals that remain blocked.
- `product-template-result.json`: number of rendered staging panels and truthful reviewed/publishable counts.
- `dist/data/product-identities.json`: the minimal alias/version registry for tools.
- `dist/data/product-evidence.json`: scoped fact provenance and review metadata for consumers.
- Existing `/learn/<id>.html` routes and the optional `dist/program-products.css`.

The current implementation deliberately activates no article/product publication approval path. The next executable release step is to inspect the integrated staging pages and obtain the required human source/text review, then implement the reviewed publication record in a small tested batch. Source dates must change only after a new document inspection.

## Reviewed alias migration and rollback

There is no live migration to run today because there are no approved aliases. Keep current IDs and saved references intact.

When an exact duplicate is proven, update `product-alias-decisions.json` with the two stable IDs, `scope: exact_identity`, HTTPS evidence, `decision: confirmed_duplicate`, and a truthful named human approval/date. A machine source-check status is not approval. Confirm category, manufacturer, SKU, revision, capacity/module count and region before enabling it. Missing information needs source confirmation rather than name inference.

Use `createIdentityResolver(records)` against the complete current catalog. Before changing saved data, preserve its original export and generate a migration plan with `resolver.migrateReferences(savedData)`. That API does not write a database or browser storage; it returns the proposed copy, a path/from/to journal and registry version. Review the journal before applying it to the existing storage implementation.

The migration preserves slot order, repeated components, quantities, empty slots and unresolved IDs. It changes reference fields, not titles, notes or arbitrary matching text. Running it again produces the same result and an empty journal. Approved aliases can chain to a final identity, but cycles, duplicate sources, missing endpoints and known conflicting variants fail.

`resolver.redirects()` supplies three ordinary product-route forms per approved alias, a 301 target and query preservation. Parent routing must install the manifest deliberately; the helper itself does not change hosting/DNS. Update internal links and saved-reference readers from the same registry, then verify canonical, sitemap, HTTP and selection behavior.

To reverse a migration, first disable the erroneous alias and rebuild the route manifest. Restore the saved-data backup, or call `rollbackReferences(current, journal)` when applying the original change journal remains safe. Rollback refuses to overwrite a later edit at an affected path. Test this on a copy before any production storage change. Keep backups and journals outside public `dist` output.

## Tests actually run

`node scripts/check-product-program.cjs` passed nine grouped behavior checks:

1. Explicit IDs, held real aliases, distinct base/partner and memory/case variants, unknown IDs.
2. Equal names and machine-only review cannot activate aliases.
3. Reversible reference migration preserving quantities, order, unknowns, notes and ownership.
4. Alias-chain idempotency and cycle rejection.
5. SKU/revision/region/manufacturer/category/memory conflict rejection, unsafe data keys and evidence URLs.
6. Twenty scoped profiles, original source records, proper units and truthful editorial state.
7. Escaped presentation text, accessible tables and correct exact nine-slot builder actions.
8. Twenty staging panels, noindex/review metadata, corrected fan-size table and repeat-build idempotency.
9. Normal-mode publication exclusion and explicit missing-ID failure.

`node --check scripts/program-products.cjs` passed. The test creates temporary files in this task's documentation directory and removes only the resolved exact test directory. It does not change the actual catalog or product output.

Automated checks do not certify every hardware claim, visual rendering, human editorial review, public deployment or search indexing. The parent release report must list the additional checks actually run.
