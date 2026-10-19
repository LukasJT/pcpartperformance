# Three remaining render-only references — 19 October 2026

Implemented three exact 2D product-photo bindings while preserving every existing 3D model, catalog identifier, source specification and eligibility policy.

| Catalog ID | Reviewed photographed identity | Evidence |
| --- | --- | --- |
| `retail-asus-z170-p` | ASUS Z170-P, original DDR4 motherboard | Exact x-kom252945 gallery; Z170-P marking on PCB and original black/gold layout inspected. D3 and Z170-A siblings excluded. |
| `retail-cooler-master-masterbox-lite-5` | Original MasterBox Lite5, non-RGB acrylic-panel MCW-L5S3-KANN-01 | ASK distributor page names that original SKU and binds the selected photograph. RGB, TG and bundled-PSU variants excluded. |
| `completion-cpu-intel-core-i5-661` | Intel Core i5-661, pictured SLBNE sample | Exact PC4SAVE/eBay product gallery and visible i5-661/SLBNE markings. Original watermark retained. |

The case remains a reference-only record without an indexed exact installed SKU. Its photograph identifies the depicted original variant, not every member of the wider family or an unknown user's case. No product specifications, prices, revision history or physical-fit claims are inferred from photography.

## Sources

- [ASUS Z170-P DDR4 exact x-kom gallery](https://www.x-kom.pl/p/252945-plyta-glowna-socket-1151-asus-z170-p-2xpci-e-ddr4.html).
- [MasterBox Lite5 original product/distributor gallery](https://www.ask-corp.jp/products/cooler-master/middle-pccase/masterbox-lite-5.html).
- [Intel Core i5-661 exact seller gallery](https://www.ebay.com/itm/354219188150).

The ASUS manufacturer support page served a generic missing-image placeholder, which was visually rejected. An old Overclockers product URL returned404. The selected x-kom page returned403 to a normal local request but its exact public gallery was independently inspected with the web research tool. The selected images downloaded normally; no access restriction was bypassed.

An alternate ITAD i5-661 image was not selected because its product page returned429 and was unavailable through web research. The selected current eBay gallery independently names the exact model and pictured stepping. No seller technical specifications or current offer are imported.

## Integration and verification

Registry: `scripts/component-photo-total-reference-oct19.json`.

Fixed reviewed source packet: `data/photo-intake/2026-10-19/total-reference.json`.

Delivered files: six WebPs in `dist/assets/hardware/catalog-total-reference-oct19/`. Proportions, original backgrounds and watermarks remain intact. Full images fit800px and thumbnails320px, without enlargement. Every thumbnail stays below40KB.

```powershell
node scripts/prepare-total-reference-photos-oct19.cjs
node --test scripts/component-photo-total-reference-oct19.test.cjs
```

All **three tests pass**. Both owned JavaScript modules pass scoped ESLint. Tests reject wrong catalog names, duplicate identities, unreviewed sources, unsafe protocols/paths and changed prepared image hashes. The existing shared full-catalog photo validator accepts all three bindings.

The optional `prepare` command requires downloaded bytes to match the source SHA-256 recorded after visual review. Default mode validates delivered files without network access. All three original source images and the [final review sheet](review.webp) were actually inspected. Per-file hashes, dimensions, byte counts and source details are recorded in [validation.json](validation.json).

Parent integration must add this registry filename to the shared photo registry before building. Parent owns final rendered browser QA, commits and release. No shared registry/build file or 3D model was edited by this workstream.

## Rights limitation

These are publicly published supplier/distributor photographs. Original copyright is retained; **no open license or separate commercial redistribution permission has been established**. The registry records this explicitly and does not mistake a product-gallery URL for a reuse grant. Do not claim this set is rights-cleared. Publisher permission review remains separate from exact product identity and visual-quality verification.
