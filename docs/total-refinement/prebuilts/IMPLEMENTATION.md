# Fixed-configuration prebuilt intake

## Completed implementation

`scripts/total-prebuilts.cjs` adds reviewed fixed manufacturer SKUs to the existing `oct14-prebuilt-data.cjs` array. It does not replace the inherited 84 regional records or their saved IDs. The JSON intake is data only; it is not executable code, a general scraper or a price feed.

The current exact counts are generated in [coverage.json](coverage.json). This batch adds **135 exact manufacturer SKUs**: **36 MSI, 9 CORSAIR, 90 Lenovo**, taking **84 → 219 regional rows**. There are **211 distinct configuration identities** after deduplicating model/MPN identity across countries, **208 model-family identifiers**, and **142 coarse CPU/GPU/RAM/storage signatures**. The new batch contributes 90 such signatures, some shared with the inherited cohort. **135 source-register entries** are supported by **51 inspected primary documents**: 45 individual MSI/CORSAIR documents, 3 rendered Lenovo model tables, and 3 corroborating detail pages.

Regional rows, model-family identifiers, exact manufacturer part numbers, and CPU/GPU/RAM/storage signatures are different counts. Shared configurations are reported once in the signature count. A different operating system, service package, country or manufacturer part number does not create a new core hardware signature. Undisclosed board or PSU differences remain unknown.

The requested target of 200 distinct verified configurations has **not** been established. This cohort is bounded to inspected MSI, CORSAIR and Lenovo configurations. It is not an exhaustive system-integrator catalog.

## Evidence and exclusions

Source observations live in `data/prebuilt-intake/2026-10-19/sources.json`. Each source binds an exact model and manufacturer part number. MSI facts come from individual SKU PDFs; CORSAIR facts come from the selected product's specification table, not alternative configuration cards. Lenovo facts come from exact SKU columns in the rendered PSREF Models comparison table, filtered to USA/Canada. Selected model hyperlinks were transposed by column; family options were never combined. Two Lenovo detail pages independently corroborated their corresponding columns.

Every source records inspection date, scope and review accountability. This was AI-assisted source transcription and consistency review; it is not first-party hardware testing or an independent human editorial sign-off. Manufacturer statements can change. Current source retrieval and ambiguous corrections require a new review packet rather than silently changing a published ID.

Seven unavailable or internally ambiguous MSI/CORSAIR records remain in `candidates.json`, excluded from publication counts. One additional Lenovo candidate, `90Y6006HCF`, is already in the inherited cohort and was excluded from the additions. Its manufacturer column was inspected without creating a duplicate. Their exact problem and follow-up source are preserved. No source snippets are promoted into completed records.

## Honest unknowns

- Price, stock, seller and retailer URL stay null for these specification records. The manufacturer source is not proof of a current retail offer.
- A chipset alone never becomes an exact motherboard model.
- Wattage and an efficiency label never become an exact PSU model or a quality/upgrade certification.
- Lenovo's published 85%/90% values are not converted into an invented 80 PLUS certification.
- RAM capacity does not imply a module count. MSI module layout stays unknown; CORSAIR/Lenovo layouts are explicitly documented.
- N/A warranty values stay null. Published durations are not a substitute for applicable warranty terms.
- Withdrawn Lenovo configurations are labeled historical; they are not presented as currently in stock.
- Mixed NVMe SSD/HDD capacities retain both drive types, rather than labeling the entire capacity as NVMe storage.
- Current-generation CUDIMM is distinguished from UDIMM. The complete `Core Ultra 7 270K Plus` suffix is preserved.
- Three manufacturer records explicitly omit a discrete graphics card and operating system. They retain those omissions; no desktop GPU equivalent, VRAM capacity or FPS result is inferred.
- No exact product photographs, 3D models or benchmark records are assigned by this intake.

## Integration contract

In `prebuilt-pages.cjs`, obtain the existing-compatible array within the renderer:

```js
const {systems, report} = require('./total-prebuilts.cjs').prepare({root});
```

Use the returned `systems` array for catalog rendering, detail pages and `data/prebuilts.json`. Use each record's `checkedAt`; a single older global timestamp must not make newer observations appear checked on October 14. The adapter's `sourceKind: 'manufacturer-specification'` and nullable `retailerUrl` distinguish sources from offers. Use a “View manufacturer specifications” action for this kind. Optional `chipset` and `case` fields can be shown separately from exact board identities.

`prepare` also writes the source register to `dist/data/total-prebuilts-provenance.json`, an original category SVG, and a count report. New records have `imageSource: null`, `illustrationSource` and `illustrationAlt`. The artwork is explicitly generic and must not be labeled a product photograph. Existing product images are preserved.

## Repeatable authoring and verification

```powershell
node scripts/total-prebuilts-authoring.cjs
node scripts/total-prebuilts.test.cjs
node scripts/total-prebuilts.cjs
```

Authoring deterministically creates the bounded intake packet from the checked facts in its source file. It does not fetch new data. The adapter validates every row before any addition is accepted; one invalid row rejects the entire batch. It checks exact-source binding, duplicate IDs/MPNs, allowed manufacturer hosts, truthful dates, currency, numeric units, module arithmetic, storage layout, EAN check digits, and forbidden offer/media/FPS fields. Changed source facts or locally edited published records require review. Reapplying the unchanged packet is idempotent.

**14 prebuilt intake checks passed** on 2026-10-19. Tests exercise real valid records, failures and actual generated output, including mixed drives, omitted GPU/OS, CUDIMM, processor suffixes and separately stated service upgrades. The parent build still needs to verify rendered search, filters, detail pages and image fallback at mobile and desktop widths.

## Rollback and continuation

The intake does not write to browser storage or saved shortlists. To roll back before release, revert the prebuilt renderer's additive adapter integration and rebuild. Preserve the source packet and generated provenance for audit. After release, retain routes for published IDs or add appropriate redirects; do not silently remove saved configuration references. No automatic destructive cleanup is provided.

Continue by reviewing additional exact Lenovo, HP, Dell and independent system-integrator SKUs. Manufacturer family pages with several CPU/GPU options are discovery sources, not completed configurations. Record hardware conflicts and unavailable source pages as excluded candidates. Image redistribution rights and authorized retailer data-feed access remain separate workstreams.
