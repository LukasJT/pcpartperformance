# Remaining 192 component pictures — continuation

## Result

185 additional component identities have reviewed photographs: 96 CPUs, 17 graphics cards, two motherboards, four memory records, 43 SSDs and 23 hard drives. This brings the builder catalog to **850 of 857 components with accepted pictures**. All 165 CPUs, 165 graphics cards and 120 motherboards are covered. Fans and CPU coolers retain complete coverage.

Seven records need product-identity clarification. This is incomplete exact-photo coverage, not evidence that their photos cannot exist. No product was deleted, silently renamed or substituted to improve the coverage count.

| Task | Dependency | Status | Evidence / files |
| --- | --- | --- | --- |
| IMGR-1: research all 192 outstanding records | Initial rollout | Complete research pass; 185 resolved, seven identity gaps | `remaining-*-audit.json`; `final-coverage.json` |
| IMGR-2: inspect actual pictures and retain provenance | IMGR-1 | 185 reviewed bindings, 370 WebP assets | Eight `scripts/component-photo-remaining-*-oct17.json` registries; source and delivery contact sheets |
| IMGR-3: integrate across existing presentations | IMGR-2 | Implemented | Central registry; builder, catalog, shop, comparisons and generated product pages |
| IMGR-4: keep delivery compact | IMGR-3 | Implemented | `program-image-delivery.cjs`: shared directory/filename prefixes; exact list names use catalog alternatives; generic GPU variants retain their pictured identity |
| IMGR-5: verify data and browser behavior | IMGR-4 | Receipts in `qa/`; rerun after production-branch integration | Full build, repository checks, file decoding, HTML checks, mobile and desktop browser checks |
| IMGR-6: publish and verify production | IMGR-5 | Pending live release verification | Existing Git deployment; exact production marker, public asset hashes and rendered checks |

## Seven outstanding identities

| Catalog entry | Finding | Required resolution |
| --- | --- | --- |
| Crucial Pro Overclocking 64GB DDR5-6000 CL36 | Accessible exact 64GB product records identify a C40 SKU and CL40 specification, despite inconsistent CL36 listing titles. | Establish the intended manufacturer's SKU and timing. Do not use the 32GB CL36 kit or silently replace the selected kit with CL40. |
| TEAMGROUP T-Create Expert 96GB DDR5-6000 CL34 | Manufacturer matrix establishes 96GB 6000 CL30 / 6400 CL32, and 64GB 6000 CL34. | Establish an exact SKU supporting the catalog's capacity, speed and timing, or explicitly correct its identity. |
| Cooler Master V Gold i Multi 1050 | Manufacturer V Gold i material establishes 750W/850W; MWE Gold 1050 V2 is a separate model. | Establish the intended V-series model/SKU. Do not bind an MWE photo or change wattage silently. |
| Supermicro 4U Workstation Chassis | A category name is not one chassis SKU. Closest SC745/SC747 candidates have different expansion-slot counts. | Establish the exact CSE/SC part number and matching bay/slot layout. |
| Supermicro 1600W Redundant Power Supply | Multiple PWS models meet the broad label and have different connectors, input conditions and chassis support. | Establish the exact PWS part number. A photo of a different 1600W module would not identify the selected supply. |
| Seagate FireCuda 540 4TB | Reviewed manufacturer support and datasheets establish 1TB/2TB SKUs. A contemporary review describes a planned 4TB version. | Establish a released exact 4TB SKU and its photo. Do not use a 530/530R or 2TB picture. |
| Seagate IronWolf 24TB, non-Pro | Reviewed sources establish the Pro 24TB SKU, not an exact non-Pro SKU matching this record. | Establish the non-Pro model or explicitly correct the record. Do not use the IronWolf Pro picture as non-Pro. |

Detailed source URLs and rejected candidates are in `remaining-special-audit.json` and `remaining-storage-audit.json`.

## Identity and delivery details

- The IBM VGA numeric memory value was corrected from 0.256 GB to 0.000256 GB in the catalog's decimal convention. IBM's VGA technical reference specifies 256 KB. The stable product ID and saved-build references remain unchanged.
- The IBM VGA photo depicts a documented implementation of the same VGA chip with matching memory, not the integrated system board itself; its pictured implementation is preserved in metadata and comparisons.
- Both missing GIGABYTE revisions use original owner photographs, with source-supported revision evidence. Revision digits not readable in a resized photo are not claimed to have been read.
- Generic historical RAM records use actual specimens matching their capacity, pin count and memory standard, preserving the photographed specimen's identity. The records do not claim a unique retail SKU.
- Exact SKU galleries can provide a label-free front when the selected Product/model explicitly assigns that photo and no visible label contradicts it. An accessible product title alone does not validate every recommendation image on its page.
- Publicly published manufacturer, supplier, museum and review photographs retain their source credits and truthful rights status. Public availability is not described as an open license or permission grant. Commons images retain the applicable creator and license.
- New images have full and thumbnail hashes, source-byte hashes, review records and local proportional WebP delivery. Full images stay within 800px; thumbnails within 320px/40KB. Small originals remain native-sized.
- This increment changes product photography and one documented unit error. It does not add 3D geometry, performance measurements or price observations.

## Release workflow and rollback

Preserve newer production commits by a normal merge, rebuild and rerun affected checks. Publish through `codex/stage2-publication-2026-10-04` and the existing `pcpartperformance-live` Worker. Verify the exact commit in `/data/release.json`, image-index content, all reviewed asset byte hashes and rendered mobile/desktop pictures. A Git push alone is not proof of a completed deployment.

For rollback, use a reviewed revert commit through the same build/deployment workflow. Preserve the newer production changes, existing stable IDs, saved builds and source records. Do not reset or force-push deployment history.
