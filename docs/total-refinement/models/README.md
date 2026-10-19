# Original GPU dimension envelopes

Evidence and implementation: October 19, 2026.

## What changed

Twenty exact named GPU variants previously inherited a shared 240 × 42 × 115 mm category illustration. They now have original, self-contained GLB outer-dimension envelopes using their own manufacturer-published length, thickness and height. The geometry deliberately contains no guessed fans, ports, PCB, bracket, connectors or mounting points.

These are **approximate measurement illustrations**, not product photographs, exact appearance models, manufacturer CAD or clearance certification. Downloaded-model coverage and clearance-verified counts do not increase. Existing licensed/community models and other authored, non-estimated models are preserved.

The GLBs total **119,148 bytes**, with 252 triangles and no images or external resources per file. The existing viewer and lazy model-library load are reused; no initial catalog or builder script gains a model payload.

## Rights and provenance

All geometry was authored in this repository for PC Part Performance from factual dimensional measurements. No manufacturer photograph, trademark artwork, texture or downloaded mesh was copied. No external redistribution license is asserted for the owner's original work. Manufacturer names and exact product names identify the specification being illustrated.

All 20 manufacturer pages were independently reopened on October 19, 2026. The existing reviewed intake packet is retained as the fact source. Millimeters, source URL, source ID, review date, evidence hash, exact named variant and any known MPN are recorded in the manifest and GLB extras. Unknown manufacturing part numbers and revisions remain unknown. Gigabyte's published H=27 / L=191 / W=129 dimensions were normalized to length/thickness/height = 191/27/129; the source labels use a different axis convention.

| Named card | Length × thickness × height (mm) | Primary specification |
| --- | --- | --- |
| GeForce GTX 950 GAMING 2G | 270 × 37 × 137 | [MSI](https://www.msi.com/Graphics-Card/GTX-950-GAMING-2G/Specification) |
| GeForce GTX 960 GAMING 2G | 267 × 36 × 139 | [MSI](https://www.msi.com/Graphics-Card/GTX-960-GAMING-2G/Specification) |
| GeForce GTX 960 GAMING 4G | 267 × 40 × 139 | [MSI](https://www.msi.com/Graphics-Card/GTX-960-GAMING-4G/Specification) |
| GeForce GTX 970 GAMING 4G | 277 × 35 × 140 | [MSI](https://www.msi.com/Graphics-Card/GTX-970-GAMING-4G/Specification) |
| GeForce GTX 980 GAMING 4G | 279 × 36 × 140 | [MSI](https://www.msi.com/Graphics-Card/GTX-980-GAMING-4G/Specification) |
| GeForce GTX 980 Ti GAMING 6G | 277 × 40 × 140 | [MSI](https://www.msi.com/Graphics-Card/GTX-980-Ti-GAMING-6G/Specification) |
| GeForce GTX 1050 GAMING X 2G | 229 × 39 × 131 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1050-GAMING-X-2G/Specification) |
| GeForce GTX 1050 Ti GAMING X 4G | 229 × 39 × 131 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1050-Ti-GAMING-X-4G/Specification) |
| GeForce GTX 1060 GAMING X 3G | 277 × 39 × 140 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1060-GAMING-X-3G/Specification) |
| GeForce GTX 1060 GAMING X 6G | 277 × 39 × 140 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1060-GAMING-X-6G/Specification) |
| GeForce GTX 1070 GAMING X 8G | 279 × 42 × 140 | [MSI](https://www.msi.com/Graphics-Card/GEFORCE-GTX-1070-GAMING-X-8G/Specification) |
| GeForce GTX 1070 Ti GAMING 8G | 279 × 42 × 140 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1070-Ti-GAMING-8G/Specification) |
| GeForce GTX 1080 GAMING X 8G | 279 × 42 × 140 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1080-GAMING-X-8G/Specification) |
| GeForce GTX 1080 Ti GAMING X 11G | 290 × 51 × 140 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1080-Ti-GAMING-X-11G/Specification) |
| GeForce GTX 1660 SUPER GAMING X | 247 × 46 × 127 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1660-SUPER-GAMING-X/Specification) |
| GeForce GTX 1660 Ti GAMING X 6G | 247 × 46 × 127 | [MSI](https://www.msi.com/Graphics-Card/GeForce-GTX-1660-Ti-GAMING-X-6G/Specification) |
| GeForce GTX 750 Ti OC 2GB (GV-N75TOC-2GI) | 191 × 27 × 129 | [Gigabyte](https://www.gigabyte.com/vn/Graphics-Card/GV-N75TOC-2GI/sp) |
| Intel Arc A310 Low Profile 4GB | 169 × 39 × 69 | [ASRock](https://www.asrock.com/Graphics-Card/Intel/Intel%20Arc%20A310%20Low%20Profile%204GB/index.asp) |
| Intel Arc A380 Challenger ITX 6GB OC | 190 × 39 × 124 | [ASRock](https://www.asrock.com/Graphics-Card/Intel/Intel%20Arc%20A380%20Challenger%20ITX%206GB%20OC/index.asp) |
| Intel Arc A750 Challenger D 8GB OC | 271 × 48 × 132 | [ASRock](https://www.asrock.com/Graphics-Card/Intel/Intel%20Arc%20A750%20Challenger%20D%208GB%20OC/index.asp) |

## Validation evidence

- 26 automated tests pass: exact identity/source mapping, reproducible hashes, self-contained GLB2 chunks, actual transformed geometry bounds (within 0.001 mm), dimensions, no invented physical detail, no textures, integration idempotence, preservation of licensed assets, duplicate/identity failure before mutation, safe asset copying and defensive evidence copies.
- Four new model modules pass scoped ESLint with zero errors or warnings.
- Actual generated build-scene.js and its bundled glTF loader rendered **23 scenarios**: all 20 GPU files at 1024px, plus 320px, 390px dark and 768px cases. No failed or unplaced model, no page overflow and no external tab resource requests were recorded. Software WebGL is not physical-device performance testing.
- Final 320px light and 390px dark screenshots were visually inspected. The first pass washed out dimension guides under the viewer's bright studio environment; standard glTF unlit materials corrected that before the final run.
- The current dist copies were hash-checked against all 20 final manifest entries. Parent central-build/release tests remain separate.

[Geometry receipt](geometry-validation.json) · [Actual renderer receipt](rendered-validation.json) · [320px low-profile card](total-gpu-asrock-a310-lp-4g-320.png) · [390px dark large card](total-gpu-msi-geforce-gtx-1080-ti-gaming-x-11g-390-dark.png)

## Build integration

After existing community mappings, before counts and model-library.json are written, in scripts/build-model-library.cjs:

```js
const totalModels = require('./total-models.cjs');
totalModels.prepareAssets();
console.log('Dimension envelopes:', totalModels.applyLibrary(items));
```

No shared scene/controller change is required. Asset filenames use the existing allowlisted flat /assets/models/ path. The record status remains approximate. The model library contains manufacturer dimensions and explicit missing surface/mounting/connector/cable geometry.

## Repeatable commands

```text
node scripts/total-models-authoring.mjs
node --test scripts/total-models.test.mjs
node scripts/total-models-render.cjs
```

The first command intentionally regenerates source assets from the fixed reviewed packet; normal production builds only copy and verify committed assets. The rendered test uses a disposable InPrivate headless Edge profile, loopback-only local server and the generated viewer. A local sandbox may require permission to connect to its own loopback debugger. It never opens or reads the user's Chrome/Edge profile.

## Remaining limitations

Exact surface/appearance coverage remains unfinished. These envelopes do not establish PCIe/bracket placement, cable bend allowance, case/riser/radiator interference or installation fit. Source dimensions are published specifications, not measurements performed by PC Part Performance. More licensed exact appearance assets require exact identity and rights review; a downloaded model is not automatically engineering CAD.
