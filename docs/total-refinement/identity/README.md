# Seven inherited identities: evidence and safe retention

Reviewed October 19, 2026. This is an identity-quality correction, **not seven newly photographed products**. No exact intended SKU was established for any of these seven inherited entries. Their existing source records point to broad manufacturer categories and contain no exact part number or revision. A nearby real product is not an automatic replacement.

## Findings

| Existing record | Current evidence | Implemented policy |
| --- | --- | --- |
| Crucial Pro Overclocking 64GB DDR5-6000 CL36 | No exact manufacturer part number in the inherited record. The current manufacturer endpoint for the nearby C40 kit returned Request Rejected; this is not a 404 and was not bypassed. Older retailer conflicts are documented in the October 17 audit, but are not promoted to current manufacturer verification. | Retain the original ID/name for saved work; require an exact capacity/timing SKU before new selection or a photo binding. |
| T-CREATE EXPERT 96GB DDR5-6000 CL34 | [Manufacturer matrix](https://www.teamgroupinc.com/en/product-detail/memory/T-CREATE/expert-u-dimm-ddr5-black/expert-u-dimm-ddr5-black-CTCED532G6000HC34CDC01/) documents 96GB 6000 CL30, 96GB 6400 CL32 and 64GB 6000 CL34 as distinct part numbers. No inspected row establishes the inherited combination. | No CL30/CL32/64GB substitution. |
| V Gold i multi 1050 | [Wattage guide](https://legacy.coolermaster.com/ja-jp/power-wattage-guide/) separates V Gold i 750/850 from GX/MWE 1050. The [software compatibility list](https://legacy.coolermaster.com/en-au/masterplus/) also names V650. The earlier broad “only 750/850” assertion should not be repeated worldwide. | Require exact MPZ/MPY product evidence; do not bind an MWE/GX image. |
| Supermicro 4U Workstation Chassis | [CSE-745BAC-R1K23B-SQ](https://www.supermicro.com/en/products/chassis/4u/745/sc745bac-r1k23b-sq) has seven expansion slots; [CSE-747BTQ-R2K04B](https://www.supermicro.com/en/products/chassis/4U/747/SC747BTQ-R2K04B?mlg=0) has eleven. The generic eight-slot entry identifies neither. | Require exact CSE/SC and backplane/power configuration. |
| Supermicro 1600W Redundant Power Supply | [PWS-1K69P-1R](https://store.supermicro.com/us_en/1600w-1u-pws-1k69p-1r.html) has input-dependent AC output; [PWS-1K60D-1R](https://store.supermicro.com/us_en/1600w-1u-pws-1k60d-1r.html) requires negative DC input. Same wattage does not establish the module or its host compatibility. | Require PWS number, input conditions and host/backplane. |
| FireCuda 540 4TB | [DS2120.2-2304](https://www.seagate.com/content/dam/seagate/en/content-fragments/products/datasheets/firecuda-540-ssd/firecuda-540-ssd-DS2120-2-2304-en_US.pdf) lists retail 1TB/2TB SKUs. An older table without 4TB is not proof that no later/regional model exists. Its retail/standard-model strings also differ; no guessed reconciliation is applied. | Require an exact released 4TB SKU; no 530/530R/2TB photo substitution. |
| IronWolf 24TB, non-Pro | [Non-Pro support](https://www.seagate.com/support/internal-hard-drives/nas-drives/ironwolf/) includes 18TB and smaller models in the inspected table. [Pro support](https://www.seagate.com/support/internal-hard-drives/nas-drives/ironwolf-pro/) separately identifies 24TB variants. | Preserve the non-Pro saved label; do not convert it into the already separate Pro record. |

Source observations are bounded findings, not exhaustive manufacturer inventories or proof that a product never existed. All URLs, review dates, access results, original records and required evidence are in `data/identity-review-oct19.json`. No manufacturer photograph, downloadable asset or redistribution right was claimed by this workstream.

## Integration contract

After constructing the **complete catalog**, before public delivery and per-product metadata:

```js
const identityReview = require('./identity-review-oct19.cjs');
identityReview.applyCatalog(records);
```

This keeps all seven IDs and original names, with:

- `builderEligible: false`: excluded from new-choice lists.
- `indexable: false`: retained deep links can explain the unresolved identity without presenting unsupported specifications as an indexed exact product.
- `identityStatus: 'needs-exact-identity'` and a concise `identityWarning`.
- Original claims retained in `identityReview.original` for audit; active numeric `specs`, synthesized `fields`, and compatibility evidence are replaced with unknown identity state. Source data is not upgraded into a verified match.
- No automatic alias, replacement ID, photo binding or storage write.

**Keep restoration lookup separate from fresh-choice eligibility.** The actual builder restores only IDs present in its delivered catalog. `restorationReferences(records)` produces seven small reference stubs to include in that lookup. They must remain excluded from fresh choices while still visible if already selected or imported. `inspectSavedSelection(snapshot)` annotates the same original snapshot with unknown-state warnings; it never removes an ID, changes a quantity, rewrites costs, replaces notes or selects a different product.

For selected references, display the original label with the warning and an explicit action to choose a documented product. An identity warning must prevent a fully verified readiness claim. Retained IDs must not count as newly available, verified, or photographed components.

The module refuses conflicting IDs, missing expected records, changed original specifications, new exact MPNs, unsafe source URLs and substitute/photo claims before mutating any catalog row. A future documented correction needs a separate explicit review, rather than being silently overwritten by this old packet. Repeated application is idempotent.

## Verification

```text
node --test scripts/identity-review-oct19.test.cjs
```

**Seven tests pass**, including the real builder's restore membership expression, duplicate memory/storage IDs, private metadata retention, no compatibility facts from unsupported specs, preservation of unrelated records, atomic conflict rejection, unsafe input rejection and idempotence. Both new modules pass scoped ESLint.

No shared build/catalog engine, existing photo registry, generated site, saved browser data, commit or deployment was changed by this workstream. Parent integration and rendered saved-build QA are required before claiming the production behavior complete.
