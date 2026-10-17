# Continued storage photo repair — 17 October 2026

Reviewed all 68 delegated storage records: 44 SSDs and 24 HDDs.

- Installed 66 bindings: 43 SSDs and 23 HDDs.
- Produced 132 WebP files: full images within 800 pixels and thumbnails within 320 pixels. Largest thumbnail: 11,168 bytes.
- Strict component-photo validation passes with no errors.
- Every accepted source image and its delivered full/thumbnail pair was visually inspected. Contact sheets and their hashes are recorded in the audit.
- 64 bindings use an exact SKU product/gallery assignment with no contradictory label. Two historical photos identify the exact model.

## Delivery

- Registry: `scripts/component-photo-remaining-storage-oct17.json`
- Images: `dist/assets/hardware/catalog-remaining-storage-oct17/`
- Per-ID attempts and results: `remaining-storage-audit.json`
- Source, full-image, thumbnail and review proof: `remaining-storage-asset-proofs.json`
- Public response observations: `remaining-storage-fetch-observations.json`
- Bounded public search index: `remaining-storage-search-archive.json`

Exact older revisions recovered include WD120EFBX 12TB 256MB, HDWR51CXZSTA X300 12TB 512MB, HDWR62CXZSTB X300 Pro 22TB 512MB, HDWG62CXZSTB N300 Pro 22TB 512MB, HDWG51JXZSTA N300 18TB 512MB, HDWT31AUZSVA S300 Pro 10TB 256MB, and MG10AFA22TE SATA 22TB 512MB. Newer cache revisions and SAS alternatives were excluded.

The FireCuda 530R 4TB supplier photograph is natively 270 × 270 pixels. It is marked `lowResolution: true` and was not enlarged. The IBM 350 photograph shows its disk-stack and read/write mechanism, taken from the cover of ASME's historical monograph. The ST-412 photograph comes from a museum page explicitly identifying that model.

The final dedicated image search recovered X300 18TB HDWR51JXZSTA from Sigma Tiendas. The exact product gallery and specification table agree on 18TB, 7200RPM and 512MB, and the selected native 600 × 600 image visibly reads X300 and 18TB. The previous 65 entries were verified unchanged when this binding was added.

## Two unresolved records

| ID | Result |
| --- | --- |
| `c-ssd-seagate-firecuda-540-4tb` | No exact 4TB SKU established. The checked primary FireCuda 540 sheet lists 1TB and 2TB models. Other-capacity images were excluded. |
| `c-hdd-seagate-ironwolf-24tb` | No exact non-Pro 24TB SKU established. Identified 24TB products are IronWolf Pro. Pro photographs were excluded from this separate non-Pro record. |

## Access and provenance

Recorded 222 public reads/downloads: 169 HTTP 200, 38 HTTP 403, five HTTP 503, six network errors, two HTTP 410 and two HTTP 404. Altstore's 86,400-second Retry-After was honoured. Access failures are recorded as failures, not as evidence that a photo does not exist.

Ordinary public sources were used without cookies, browser profiles, paid services or access-control bypass. Images were resized and encoded; model labels, capacity labels, watermarks and geometry were preserved. Supplier and publisher rights are attributed truthfully, with no open license claimed where none was recorded.
