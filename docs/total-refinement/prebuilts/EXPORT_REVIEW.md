# Lenovo fixed-SKU continuation — 2026-10-19

## Result

The continuation adds 120 exact manufacturer SKUs: 56 Legion T5 26IRB8 and 64 Lenovo Legion T5 26AMR5 configurations. All are withdrawn models. Existing IDs and the earlier 219 regional records are retained.

| Measure | Before continuation | After continuation |
|---|---:|---:|
| Regional catalog entries | 219 | 339 |
| Distinct configuration identities | 211 | 331 |
| CPU/GPU/RAM/storage signatures | 142 | 209 |
| Explicit manufacturer part numbers in additive intake | 135 | 255 |
| Inspected primary documents across the intake | 51 | 53 |

The 120 SKU additions contribute **67 new core signatures**. Duplicate core configurations, regional copies, Windows editions and warranty differences do not increase that signature count. The inherited cohort has not been re-verified by this continuation. Three inherited incomplete/conflicted entries remain excluded from core-signature totals.

## Primary source acquisition

- [Legion T5 26IRB8 manufacturer Models table](https://psref.lenovo.com/Product/Legion/Legion_T5_26IRB8?tab=model).
- [Lenovo Legion T5 26AMR5 manufacturer Models table](https://psref.lenovo.com/Product/Legion/Lenovo_Legion_T5_26AMR5?tab=model).

A disposable browser opened each public product page, selected Models, chose USA and Canada using the manufacturer country filter, and used its Excel export. The on-screen table initially loads only 30 worldwide columns; counting those columns would miss most North American SKUs. The manufacturer export contained all 56/64 selected-country rows. Every imported row explicitly states USA or Canada and the exact model; suffixes were not used to guess market eligibility.

The original downloaded workbooks and their decoded row snapshots are in `data/prebuilt-intake/2026-10-19/observations/`. Download filenames reported by Lenovo were `Legion_T5_26IRB8 multi model 202610191755.xlsx` and `Lenovo_Legion_T5_26AMR5 multi model 202610191756.xlsx`. Capture happened during this run; the vendor-generated filename is not treated as a publication or price-check timestamp.

Frozen original-workbook SHA-256 hashes:

```text
legion-t5-26irb8.xlsx  9e7ba3f0e444cd72c6e958a4f957bbd5f359071d403051713feebe7ba6507c76
legion-t5-26amr5.xlsx  0868bd71aad079fecca012dcaf5a81e284629cb013084b123012514ba11fd065
```

The importer also checks the row-snapshot hashes. It rejects changed evidence until a reviewer deliberately updates the reviewed cohort. The workbook decoder uses Python's standard ZIP/XML libraries, does not execute formulas, rejects formula cells and limits decompressed input size.

## Identity and uncertainty review

- Intel CPU suffixes, AMD model numbers, GPU suffixes/VRAM and RAM module counts come from individual exported rows.
- DDR4 and DDR5 remain distinct. UDIMM and exact module quantities remain explicit.
- SSD-only records preserve documented NVMe/PCIe generations. Hybrid SSD/HDD records retain both capacities and are not labeled entirely NVMe.
- PSU efficiency percentages remain manufacturer-reported percentages. They are not converted into certification levels or PSU quality conclusions.
- Chipset is not an exact motherboard identity. Exact motherboard, PSU and GPU board-partner models remain unknown.
- Nominal memory module rates are not claimed as guaranteed operating rates.
- These are historical manufacturer specifications. Price, stock, seller, retailer URL, photographs, image rights and FPS are not inferred.
- No independent hardware testing or human editorial sign-off is claimed. Review was AI-assisted primary-source extraction, exact-row inspection and automated consistency validation.

## Reproduce and verify

```powershell
node scripts/total-prebuilts-psref.cjs decode data/prebuilt-intake/2026-10-19/observations/legion-t5-26irb8.xlsx
node scripts/total-prebuilts-psref.cjs decode data/prebuilt-intake/2026-10-19/observations/legion-t5-26amr5.xlsx
node scripts/total-prebuilts-authoring.cjs
node scripts/total-prebuilts.test.cjs
```

The first two commands verify that workbook contents reproduce existing JSON snapshots. Authoring reproduces the complete 255-row additive packet; it does not browse or publish. All 17 intake tests passed. The two decoder checks separately passed with 56 and 64 rows. The parent still owns generated output, rendered QA and deployment.

For a new research revision, use `total-prebuilts-psref.cjs <public-product-url> <new-evidence-name>.json export`. It downloads the country-filtered export and decodes it. Existing workbook files cannot be overwritten. Set `PCP_PLAYWRIGHT_MODULE`, `PCP_BROWSER_EXE` and `PCP_PYTHON` when the bundled local runtime paths differ. Add a new cohort only after inspecting the export, validating every new format and freezing its hashes. Acquisition is not automatic publication.

## Remaining gaps and rollback

Current stock, authorized pricing feeds and photography licences remain separate work. This threshold is bounded catalog coverage; it is not an exhaustive prebuilt market inventory. Additional OEM/system-integrator coverage would improve diversity more than adding more regional SKU copies.

Before publication, the continuation can be reverted by removing its two reviewed cohorts and 120 exact source/record pairs, retaining the earlier 135-row manufacturer packet. After publication, preserve the new model routes and saved IDs as historical reference stubs rather than deleting user references. No browser storage or user data is modified by this intake.
