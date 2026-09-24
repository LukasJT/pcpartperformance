# Sketchfab asset audit

Updated September 23, 2026. The builder has 794 components. Fifteen builder components currently use downloaded, attributed Sketchfab meshes; the other 779 use simplified geometry. Product pages also display four downloaded, attributed peripheral meshes. These are visual previews, not dimension-certified CAD models.

| Site item | Sketchfab model | Creator | Result |
| --- | --- | --- | --- |
| MSI GeForce RTX 5070 12G VENTUS 3X OC | [MSI RTX 5070 Ventus 3X OC](https://sketchfab.com/3d-models/msi-geforce-rtx-5070-ventus-3x-oc-732fd2bb31404894a220904526d13c03) | Darky Vip 3D | In builder |
| AMD Ryzen 7 9800X3D | [9800x3D CPU](https://sketchfab.com/3d-models/9800x3d-cpu-low-poly-8b15903087b5432db9cfc789b2cf4d6a) | PolyDavid | In builder |
| Corsair VENGEANCE RGB DDR5 96 GB kit | [VENGEANCE RGB DDR5](https://sketchfab.com/3d-models/corsair-vengeance-rgb-ddr5-ram-low-poly-5352b17857ea4036ab61980c4c57f265) | PolyDavid | In builder; mesh shows the product line, not kit capacity |
| Corsair VENGEANCE RGB Pro DDR4 32 GB kit | [VENGEANCE DDR4 RGB Pro](https://sketchfab.com/3d-models/ram-corsair-vengeance-ddr4-rgb-pro-ee5c6e6b2e524d63a7043365e73a2420) | lime.ball.animations | In builder; mesh shows the product line, not kit capacity |
| AMD Ryzen 7 7800X3D | [Ryzen 7 7800X3D](https://sketchfab.com/3d-models/amd-ryzen-7-7800x3d-209c4aada00e4b1790d8d274bac98779) | gioguarino12 | In builder; creator does not verify package height |
| AMD Ryzen 5 9600X | [9600X CPU](https://sketchfab.com/3d-models/amd-9600x-cpu-low-poly-b433826fb4b1432dbc18a90b89dede71) | PolyDavid | In builder; low-poly appearance |
| Samsung 990 PRO 1 TB | [990 PRO 1 TB](https://sketchfab.com/3d-models/m2-nvme-ssd-samsung-990-pro-1tb-3d-model-41b7bfda7eab40f8b13330913fd66fc2) | lime.ball.animations | In builder |
| Samsung 980 PRO 1 TB | [980 PRO 1 TB](https://sketchfab.com/3d-models/samsung-980-pro-nvme-1tb-1f386c8d782d4b208717bc64474b98b3) | BlenderFace | In builder |
| GeForce RTX 3060 Ti | [RTX 3060 Ti low poly](https://sketchfab.com/3d-models/rtx-3060-ti-low-poly-b65c5c0807be4ece9a95090d1a1794bb) | Up1x | In builder; generic interpretation, not a specific board-partner SKU |
| Lian Li UNI FAN SL120 RGB Black | [SL120 Black](https://sketchfab.com/3d-models/lian-li-uni-fan-sl120-rgb-black-5abd0d8e89ea4241b7216f4b6d5a2ca4) | DIEKO | In builder; converted GLB has visible fan geometry |
| Lian Li UNI FAN SL120 RGB White | [SL120 White](https://sketchfab.com/3d-models/lian-li-uni-fan-sl120-rgb-white-151c28bb1bc9483a92728815cb0628ea) | DIEKO | In builder |
| ASUS ROG Strix RTX 3090 White OC | [RTX 3090 White](https://sketchfab.com/3d-models/rtx-3090-asus-rog-strix-white-edition-videocard-506b1c68d24f4a9088ea0eaef41f7dd9) | Marcseus | In builder; stray detached object removed |
| NZXT H500 | [H500 case](https://sketchfab.com/3d-models/nzxt-h500-pc-case-e0e3dbab28014eb19a123c1be69d42b3) | max.boylen | In builder; low-poly, tinted for black variant |
| Intel Core i7-9700K | [Dream Computer Setup](https://sketchfab.com/3d-models/dream-computer-setup-82f78bbaf2d34f01af854a52151dbf49) | Daniel Cardona | CPU node extracted; creator names the processor |
| NVIDIA GeForce RTX 2080 Ti | [Dream Computer Setup](https://sketchfab.com/3d-models/dream-computer-setup-82f78bbaf2d34f01af854a52151dbf49) | Daniel Cardona | RTX2080ti node extracted; generic catalog card |
| Logitech G915 | [G915 scan](https://sketchfab.com/3d-models/logitech-g915-scan-d6976a965ed54808aaeff3b609189f01) | o-oualid | On product page |
| Razer Viper Mini | [Viper Mini](https://sketchfab.com/3d-models/razer-viper-mini-85e1735704c645e5aaead0278a1038fe) | kimberly.h | On product page |
| Logitech PRO X SUPERLIGHT | [Computer mouse](https://sketchfab.com/3d-models/computer-mouse-6e7940d9e2144efeae3468a906f27e07) | zhe_kan | On product page; creator says it was modeled after this product |
| Logitech G502 X LIGHTSPEED | [G502 X LIGHTSPEED](https://sketchfab.com/3d-models/logitech-g502-x-lightspeed-cda7107cc1444b4788d747f0361f7d40) | Okopchi | On product page |

These nineteen component assets use CC BY 4.0; credits and source links appear at `/builder/model-credits/`. Product photos for the peripherals come from their manufacturers. The G502 X LIGHTSPEED was added to the catalog because the downloaded mesh names that specific variant, and its specifications and photo were checked against Logitech.

## Inspected downloads not published as product models

- The ASUS ROG Strix RTX 3090 White now renders in the builder. The source contained a detached Cube.281 far outside the card, which distorted normalization. The preparation script removes only that detached object; the creator’s card geometry and materials remain. Browser inspection confirmed the full card.
- Earlier local conversions of the Lian Li UNI FAN SL120 files rendered as featureless slabs. Fresh converted GLBs downloaded from the creators' Sketchfab pages were tested in the builder and replaced those attempts.
- The NZXT H500 now uses the converted Sketchfab GLB with its texture intact. The material is tinted charcoal for the black catalog variant. Browser inspection confirmed the open chassis, PSU shroud and cable bar. It is a 304-triangle model and omits fine chassis details.
- The downloaded `nvidia-geforce-rtx-5070-msi-gaming-x-trio.zip` depicts a retail package, not the GPU. It was not assigned to the card.
- The downloaded `nvidia-geforce-rtx-3090.zip` has a noncommercial license and was not included in the commercial site.
- The AMD Wraith Stealth cooler, Corsair fan, Corsair H150i cooler, and Corsair Dominator RGB files do not establish exact catalog SKU matches. `lian-li.zip` did not convert from its source DAE. None were assigned to a different item.

Peripheral coverage is currently 23 keyboards, 25 mice, and zero mousepads in the site catalog. Four peripherals have the downloaded 3D views above. Finding 50 accurately named, manufacturer-photographed items in **each** peripheral category with separate commercially usable 3D assets remains outstanding. A generic or mismatched mesh should not be presented as an exact item.

## Full-scene extraction follow-up

dream_computer_setup.glb was downloaded from Daniel Cardona under CC BY 4.0. scripts/extract-static-glb.cjs extracts named static nodes while preserving ancestor transforms and only the referenced geometry/material/texture byte ranges. CPU and RTX2080ti are integrated and visually tested. MotherBoard (node 4, creator identifies ASUS Z370-E Gaming) and Case (node 1391, creator identifies Thermaltake Core P5) remain to be extracted, matched to newly researched catalog entries and tested. RAM and other parts need exact identity checks before assignment. The original file is in the user Downloads directory.

2026-09-23: Inspected Daniel Cardona Computer Parts (Built PC), bd6fb0ed93f3475b890a099fedecf351. Current public page exposes no download button and refers free users to Dream Computer Setup. Not downloaded. Builder now groups core/storage/case sections and filters actual downloaded model IDs separately from simplified previews. Desktop selection and 390px mobile layout verified.

2026-09-23: Extracted MotherBoard and Case subtrees from Daniel Cardona Dream Computer Setup. ASUS ROG STRIX Z370-E GAMING added using official ASUS specifications and photo; 7.35 MB mesh renders upright with intact textures and no browser errors. Core P5 3.10 MB mesh extracted, pending catalog integration and inspection; not counted in coverage.

2026-09-23: Core P5 Case subtree now integrated as retail-thermaltake-core-p5. Browser render verified upright and textured with no console errors; external custom glass nodes omitted. Model coverage 17 of 796. Manufacturer manual provides envelope, GPU and PSU limits. New research lead: Noctua official 3D CAD library may cover existing fans.

2026-09-23: Downloaded manufacturer STEP CAD archives NF-A12x25_G2_Public-CAD.zip (968486 bytes) and NF-A14x25_G2_Public-CAD.zip (1012945 bytes) through Noctua product download UI. Extracted to sibling workspace noctua-cad. README permits visualization/integration, excludes manufacturing/reproducing products; impeller geometry modified by manufacturer. Both match existing retail fan entries. Pending STEP tessellation and GLB integration; not counted as installed models. Conversion candidate: npm occt-import-js (OpenCascade WASM), https://github.com/kovacsv/occt-import-js, documented ReadStepFile API. No OCP/cadquery/trimesh installed in bundled Python.

2026-09-23: Official NF-A12x25 G2 and NF-A14x25 G2 STEP files converted via integrity-verified npm occt-import-js 0.0.23. scripts/step-to-glb.cjs preserves face colors and groups primitives by material. Both integrated into existing fan IDs, browser-rendered with intact color and geometry, no console errors. CAD runtime remains outside dist. Manufacturer visualization terms linked in credits. Installed coverage 19/796.
