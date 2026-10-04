# Downloaded model research — 4 October 2026

## Current coverage

- 816 builder catalog components.
- 80 part mappings use downloaded Sketchfab or manufacturer models; 736 still need one.
- 22 mappings added in this batch, using 19 distinct files. Shared RAM-kit exteriors and generic GPU-chip entries are recorded explicitly; these counts are not exact-SKU certification.
- No model is clearance certified. Preview placement, connector coordinates and assembly fit remain approximate.

## Search performed

- 757 exact catalog-name public metadata searches, 138 with results, 0 errors; 4 queries still have further pages.
- 32 broader brand/category queries, including fans, memory, cases, storage, boards and power supplies.
- Results were checked selectively. Spam, unrelated complete scenes and a zero-result query do not establish product availability or absence. The candidate queue is still partly unreviewed.
- Public ARCTIC reference STEP files were downloaded and converted for P12 Pro and P14 Pro. Creator credit and manufacturer source links are retained.

## Identity findings

- i5-12400F listing texture says i5-12400; its mapping records a family exterior, not an exact F-marked package.
- The i9-11900K listing has an Intel-logo exterior without the model number. It is marked as needing identity verification.
- RTX 4060 source is a hollow exterior with no internal fan geometry.
- The ASUS RTX 4090 scene was extracted into a dedicated White OC catalog product with its official product photo; the detached PCB display object was excluded.
- Corsair LPX and Trident Z Neo source DIMMs are reused only as recorded kit-family exteriors; speed/capacity markings are not claimed exact.
- A newly downloaded Samsung 990 EVO Plus 1 TB candidate duplicates an already integrated 1 TB model and was retained for review outside the deployed bundle. It was not relabeled as 2 TB.
- A generic complete PC inspired by Corsair Crystal does not identify an exact power supply and was not assigned to one.

## Verification

- Every new distinct integrated asset was inspected in the builder browser, including desktop and mobile framing.
- Official Khronos GLB validation, local scene/buffer audit, cooling and SEO checks are recorded beside this file.
- Camera regression tests project all bounding corners for 60 part/view/aspect combinations, including tilted fans and exploded builds.
- Compression is decoded locally and loaded only when opening 3D. Authored materials are retained; legacy zero-specular Ryzen material was converted to supported PBR.
- Browser load timings are localhost/cached measurements, not mobile network benchmarks.

## Files

- [Component status CSV](component-status.csv): every builder item, coverage, identity, source and research status.
- [Exact-name searches](sketchfab-searches.json) and [broader searches](broad-searches.json): public evidence.
- [Candidate review queue](candidate-review-queue.json): unverified results awaiting review.
- [Asset validation](asset-validation.json), [Khronos validation](khronos-validation.json), [browser validation](browser-validation.json).
- Production credits and coverage are at /builder/model-credits/ and /builder/model-coverage/.

Catalog-wide downloaded exact-model coverage remains unfinished. Search depth and unreviewed candidates are recorded instead of claiming every part has an exact asset.
