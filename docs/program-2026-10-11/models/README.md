# Licensed exact-model batch — 2026-10-11

## Result

21 additional exact mappings were integrated: 20 phones and the MSI GeForce RTX 5070 12G GAMING TRIO OC. They use **21 distinct downloaded GLBs**, totaling **14,991,684 bytes** after the iPhone 17 Pro texture budget correction. Alias IDs do not increase either count. The component registry now has 104 mappings to 96 unique assets; the phone registry has 42 mappings to 42 unique assets. There are no clearance-certified additions.

The 20 new canonical phones also have full records in `scripts/phone-model-expansion-2026-10-11.cjs`, appended once by `phone-data.cjs`. Every field has value/source/check-date/confidence metadata; unresearched fields and software commitments remain null. Official bare-device body dimensions and the inspected mass/display/storage/processor facts are separate from artist geometry. Regional cohorts are stated individually. The former Samsung S20 support URL now redirects; the record uses the inspected Samsung Canada launch specification table instead.

20 front-view WebP renders for the new models total 159,582 bytes. `scripts/phone-model-render-overrides-2026-10-11.json` explicitly labels them `kind: model-render` with model-render alt text, attribution and captions. They are not photographs. The source generator must merge this manifest and preserve the label/credit in cards, phone hub/detail/compare, and the general image-credit page. The full site build is owned by the parent task.

### Additional renders from existing models

Twelve previously registered phones with no image now have front-view WebP renders: iPhone 13; Pixel 5, 6, 6 Pro and 6a; Galaxy S21, S21 Ultra, S23 Ultra, Z Flip3, A23 5G and S III; and OnePlus 7 Pro. These **12 additional renders total 118,600 bytes** and add **zero new GLBs or model mappings**. The merged manifest contains 32 distinct render assets totaling 278,182 bytes, with canonical/alias entries counted separately.

All twelve source GLBs have matching embedded source UID/CC BY 4.0 attribution and registered exact identities. Creator profiles come from the source credits. The Galaxy S III source's original name Resinnnn is retained alongside the registry name Res1n. Every render is labelled as an independent model visualization, not a photograph. Existing source appearances, including unlit screens, are retained. Pixel 9 Pro stays unknown and has no borrowed artwork.

`scripts/render-existing-phones-2026-10-11.cjs` has prepare/register/check modes. Its plan snapshots all 42 phone GLBs, registered rotations, phone records, existing render metadata and ten exact-photo mappings. Twelve actual-renderer front views loaded successfully, and the final WebP contact sheet was reviewed. All protected hashes/records remain unchanged. See `existing-phone-renders-plan.json`, `existing-phone-render-review.json`, `existing-phone-renders.json` and `existing-phone-renders-contact.png`. Both selective and full licensed-batch registration retain these extra manifest entries; the model-batch totals still count only its original 20 renders.

## Acquisition and licensing

- Inspected the unused user-downloaded Sketchfab archives in Downloads and existing model extraction folders first. The MSI 5070 Gaming Trio OC archive supplies the accepted GPU. Already registered Noctua fan models were not counted again.
- Searched 24 current-product queries and 26 older-phone/component queries using public Sketchfab search/metadata. An authenticated Sketchfab download endpoint returning 401 is an availability result, not an integration. Unrelated search noise is identified as such in the attempt log.
- Downloaded 17 accepted phone GLBs from the official [AllenAI Objaverse dataset](https://huggingface.co/datasets/allenai/objaverse). The database is ODC-By; individual object rights remain the creator's Creative Commons licence. Each accepted object has matching current Sketchfab metadata with `license.slug: by`, an embedded CC-BY-4.0 statement and the same source UID. Objaverse's public indexed GLB download path was used without a Sketchfab session, token or viewer extraction. Objaverse/AllenAI are credited here for the database distribution; the individual authors are credited for their objects.
- Downloaded three phone GLBs from the public [phone-mockup-studio source directory](https://github.com/quentin-pla/phone-mockup-studio/tree/main/source). Its [asset credits](https://github.com/quentin-pla/phone-mockup-studio/blob/main/CREDITS.md) explicitly distinguish third-party CC BY 4.0 assets from MIT application code. The iPhone 15 Pro Max credit in that repository points to a different iPhone 15 Pro; the GLB's embedded polyman/UID credit was checked against the actual current Sketchfab model and used instead. The uncredited Samsung file was withheld.
- All 21 accepted assets retain **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** attribution, creator profile, model source URL and recorded changes. Source/public distribution URLs, exact hashes, byte counts and per-model modifications are in `integrated-model-batch.json`.
- Official manufacturer product pages are dimensional references, not a redistribution grant for unlicensed CAD. No manufacturer CAD without an inspected redistribution licence was published.

## Preparation and limitations

The phone assets have front-facing orientation baked into the GLB, an origin-centered pivot and an overall height normalized to the published body height in millimeters. Their authored width/depth ratios and camera protrusions are retained; these are appearance assets, not manufacturing geometry. Mesh simplification/compression can change the numerical envelope slightly. The separate geometry check accepts height normalization within 0.05 mm and pivot centering within 0.025 mm solely as a pipeline check, never a physical-fit tolerance.

Textures were resized to at most 1024 pixels and encoded as WebP at quality 90, except the iPhone 17 Pro's per-model 864-pixel limit described below. Static transforms/resources were flattened/joined/deduplicated/pruned and Meshopt compression applied. Legacy specular/glossiness materials on the iPhone 11 Pro and Galaxy S8 were converted to the renderer's supported metal/roughness workflow. The iPhone 8 source presentation blocks/rotation animations and Galaxy S22 Ultra's external S Pen were removed explicitly. The iPhone XR/Galaxy S10 blank luminous display materials were changed to a black screen-off appearance; no body or camera geometry was replaced.

### iPhone 17 Pro download budget correction

The initial 3,052,576-byte GLB exceeded the existing 2,500,000-byte phone budget. Embedded textures accounted for 2,638,700 bytes. Texture-only estimates at several size/quality settings are recorded in `iphone-17-pro-optimization.json`; they are estimates, not separately integrated models. The selected command was `node scripts/prepare-licensed-phones-2026-10-11.mjs iphone-17-pro`, with only that manifest entry set to 864 pixels and the existing WebP quality 90. The actual result is **2,434,552 bytes**, saving **618,024 bytes** with **65,448 bytes** of budget headroom.

Every decoded geometry accessor is identical to the earlier GLB, retaining all 51,223 triangles, pivot, orientation and scale. Ranguel's embedded source/CC BY 4.0 credit is unchanged. The other 20 new GLBs and 19 other batch renders remain hash-identical. Front/back/side and a 390 × 844 mobile front view loaded successfully; the before/after contact sheet shows retained appearance. See `iphone-17-pro-optimization-review.json` and `iphone-17-pro-optimization-comparison.png`. The optimized GLB has zero Khronos errors or warnings; the unchanged global budget check now passes. Registration uses the selective command `node scripts/register-licensed-model-batch-2026-10-11.cjs iphone-17-pro`, retaining all other entries.

The MSI source title says Gaming X Trio; its own description links the exact manufacturer GAMING TRIO OC product, and the shroud/fan/backplate images and retail SKU G5070-12GTC were checked. It is a low-detail exterior with photo-textured fans. The registered envelope is 338 × 50 × 140 mm (builder X/Y/Z); the installed fan orientation faces downward. A vertically inverted source UV island for the MSI side mark was corrected at its five reviewed vertices and recorded in credits. Do not use it for ports, clearances or fan-blade measurements.

Galaxy S8 and S22 Ultra are low-detail sources; the former uses camera/fingerprint outlines. The iPhone 11 Pro rear camera detail is simplified. The Galaxy S22 retains about 676,656 triangles because conservative border-locked simplification cannot remove most seams; it remains click-to-load. Source detail limitations are also attached to each registry entry.

## Validation

- 21 GLBs: zero Khronos structural errors. Phone GLBs have zero warnings; GPU has one generated tangent-space warning. The validator does not inspect `EXT_meshopt_compression` internals, so glTF-Transform separately decoded every asset and checked all accessor values for finiteness and all bounds for valid extents. See `validation.json`.
- 60 accepted phone front/back/side views loaded through the actual `dist/phone-scene.js` and bundled glTF loader. Original review, corrected orientation/material review and display correction reports are preserved separately; the corrected screenshot for each accepted view is the current `batch-<id>-<view>.png`.
- Five accepted phones loaded at an emulated 390 × 844 mobile viewport; three final GPU views loaded through `dist/build-scene.js`. These use an isolated headless Edge profile, localhost and software WebGL. They are layout/loader checks, not physical-device, cellular-network or production performance measurements. The final corrected GPU views are in `gpu-final-review.json`; mobile views are in `final-renderer-review.json`.
- All 42 registered phone canonical IDs join to 43 phone-data records. The 20 new records pass explicit provenance/null checks and have corresponding assets and labelled renders. The parent task must run the source generators/full build and verify generated hub/detail/compare routes and published credits.
- No full build, commit, deployment, shared-browser operation or external write was performed by this model subtask.

The reusable renderer harness is in `scripts/model-review-2026-10-11/`, served on localhost by `scripts/serve-model-review-2026-10-11.cjs`. `scripts/qa-model-batch-2026-10-11.cjs` accepts `accepted-phone-review-scenarios.json`, `iphone-17-pro-optimization-scenarios.json` or `existing-phone-render-scenarios.json`; the numerical/registry checks run with `scripts/check-licensed-model-batch-2026-10-11.mjs`. The temporary network-sandbox listener could not be reached by the host review browser; the successful bounded rerun used the same localhost-only server outside that sandbox and an isolated InPrivate Edge profile. Source registries and accepted release assets are stable for the parent final build. The review server is stopped; its isolated Edge profiles and the two unaccepted release GLBs were removed. Raw source download caches are temporary evidence and should not be staged.

## Unavailable or rejected candidates

Individual identities, URLs and reasons are in `rejected-and-unavailable.json`; search counts and raw endpoint outcomes are in `research.json` and `public-distribution-research.json`. In particular, an original asset titled iPhone 11 had three rear cameras and was replaced with a separately downloaded dual-camera iPhone 11. The bright blue iPhone 6s finish and opaque/unusable OnePlus 6 export were excluded. The local Ryzen 9, Lian Li, Corsair fan and H150i family assets were not silently assigned to an unverified retail SKU. The Noctua endpoint returned a Vercel checkpoint and was not circumvented.

## Accepted assets

<!-- accepted-assets-table -->

| Exact mapping | Creator / source | GLB bytes | Triangles |
|---|---|---:|---:|
| iphone-13-pro | [DatSketch](https://sketchfab.com/3d-models/iphone-13-pro-0c34a039d50e42f4b46738ec26929c15) | 224,072 | 27,615 |
| iphone-13-pro-max | [DatSketch](https://sketchfab.com/3d-models/apple-iphone-13-pro-max-4328dea00e47497dbeac73c556121bc9) | 232,508 | 28,063 |
| galaxy-s22 | [highdefinitionsound](https://sketchfab.com/3d-models/samsung-galaxy-s22-e825ff74413142afa9ba64c17890ae05) | 2,490,712 | 676,656 |
| galaxy-s22-ultra | [3Ddotcom](https://sketchfab.com/3d-models/samsung-galaxy-s22-ultra-free-2a0bbcfad6d744cb8fa443bdf209d6a9) | 198,396 | 17,532 |
| galaxy-s20-ultra | [Juanpa Velazquez](https://sketchfab.com/3d-models/samsung-galaxy-s20-ultra-8abacf30422f4c48842b8ffef5611e0f) | 674,640 | 137,389 |
| galaxy-s21-fe | [Evan.Blass](https://sketchfab.com/3d-models/samsung-galaxy-s21-fe-in-white-d67f3d9318c041c7a9a9b67c84c97423) | 389,336 | 37,529 |
| iphone-11 | [atomle](https://sketchfab.com/3d-models/iphone-11-558b8e99bbd4483b9bb2182d8dc72de2) | 785,840 | 53,018 |
| iphone-11-pro | [matthewgromov199](https://sketchfab.com/3d-models/iphone-11-pro-c0cfaae9289343b5ba5b0c5ba0a3ced6) | 53,084 | 5,207 |
| iphone-11-pro-max | [Alien7878](https://sketchfab.com/3d-models/iphone-11-pro-max-free-download-a6c98228fe3e4a309dc87481c6970e70) | 716,468 | 124,812 |
| iphone-6 | [Dylan.TYL](https://sketchfab.com/3d-models/iphone-6-gold-9f0523f668e24e42ab440a2679d3c5d5) | 1,542,856 | 138,160 |
| iphone-8 | [felixhumphrys0209](https://sketchfab.com/3d-models/realistic-iphone-8-black-143bd31fd48b4d88a31d05c7ea0770b0) | 103,584 | 14,042 |
| iphone-8-plus | [RT3905T](https://sketchfab.com/3d-models/iphone-8-plus-8c5c176cf83e42d6a12cdf6e84b6bccd) | 982,440 | 181,738 |
| iphone-12-mini | [tswier](https://sketchfab.com/3d-models/iphone-12-mini-74c4167debed4390871af8527d369de6) | 783,292 | 82,898 |
| iphone-xr | [Sasha](https://sketchfab.com/3d-models/iphone-xr-58494f7d40f14310b4696e7951629960) | 318,812 | 58,974 |
| iphone-xs | [Carlos.Maciel](https://sketchfab.com/3d-models/iphone-xs-3a0d9762a20849c0b3e8e08b947d2114) | 501,088 | 63,522 |
| galaxy-s10 | [mxuntain](https://sketchfab.com/3d-models/samsung-galaxy-s10-e0ce9427df07429aba2ccbd01b52dd11) | 415,604 | 105,222 |
| galaxy-s8 | [koeki1234](https://sketchfab.com/3d-models/galaxy-s8-silver-v2-433b6f95a0204546a723524c271f34d3) | 104,504 | 20,852 |
| iphone-15-pro-max | [polyman](https://sketchfab.com/3d-models/apple-iphone-15-pro-max-black-df17520841214c1792fb8a44c6783ee7) | 1,682,088 | 64,229 |
| iphone-17-pro | [Ranguel](https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec) | 2,434,552 | 51,223 |
| iphone-17-pro-max | [MajdyModels](https://sketchfab.com/3d-models/iphone-17-pro-max-87fc1df741384124a8ce0226d2b2058d) | 252,052 | 29,544 |
| retail-msi-geforce-rtx-5070-12g-gaming-trio-oc | [Darky Vip 3D](https://sketchfab.com/3d-models/nvidia-geforce-rtx-5070-msi-gaming-x-trio-26fbe59aa2ab4a749ef71583aefdadd5) | 105,756 | 883 |
