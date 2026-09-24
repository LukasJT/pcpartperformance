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

2026-09-23: Downloaded Corsair 4000D Airflow by kirigami318, CC BY 4.0. GLB button produced no file; official glTF download succeeded (1038670-byte zip). Packed scene.bin and embedded PNG via scripts/pack-gltf.cjs into 4263116-byte GLB. Bound only x-case-corsair-4000d-airflow, not FRAME variant. Browser confirmed upright detailed case; original black materials render very dark and need lighting follow-up. Installed coverage 20/796.

2026-09-23: Corsair 4000D source uses zero RGB factors on opaque surfaces; repaired to dark charcoal, preserved geometry, textures, glass opacity. Versioned model file v2 and browser verified readable frame and mesh detail. RTX3070 Founders Edition by exela (7ca66948de7d4f7daeb93abb7a685e67) inspected: CC BY-NC 4.0, not integrated into commercial site.

2026-09-23: Downloaded RTX3080 Founders Edition by Arthur_mf (8d807843f7d84d9088c36143e58ce148), CC BY4.0, official glTF archive 1555134 bytes. Packed GLB 4911740 bytes; bound generic RTX3080 10GB only, identity family-or-chip. Corrected source axes X +90 degrees and browser inspected horizontal shape. Credits included. Coverage 21/796.

2026-09-23: Downloaded cityon360 Motherboard MSI Z790 Low Poly, 7ac2ed91599a4239aba96770a00874ce, CC BY4.0. Official glTF ZIP 2539590 bytes; packed GLB 3034640 bytes at dist/assets/models/sketchfab-msi-z790-edge.glb. Texture Motherboard_Metall_baseColor.png visibly labels MPG/EDGE and matches silver MSI Z790 EDGE series; DDR5 texture present. No existing Z790 EDGE catalog entry. Pending exact DDR5 variant confirmation, official specification/photo entry and browser integration. Source https://sketchfab.com/3d-models/motherboard-msi-z790-low-poly-7ac2ed91599a4239aba96770a00874ce; manufacturer https://www.msi.com/Motherboard/MPG-Z790-EDGE-WIFI. Not counted in installed coverage.

## MSI Z790 integration and preview cleanup — 2026-09-23
- Integrated cityon360's CC BY 4.0 MSI Z790 model as MPG Z790 EDGE WIFI after inspecting EDGE/DDR5 texture markings and MSI's official specification sheet.
- Added the exact motherboard catalog record with LGA1700, DDR5, ATX, five M.2 and seven SATA ports. PCB dimensions are manufacturer sourced; component height is approximate.
- Corrected orientation to [0,0,0] after browser verification. Textured board renders in the desktop and 390px mobile previews.
- Inspector now lists selected component categories only and selects an available component automatically. Secondary camera controls are collapsed by default.
- Coverage: 22 downloaded models among 797 builder records; 775 remain simplified. No clearance-certified models.
- Passed model/blog inventory, SEO/link checks, fan-placement checks, and mobile overflow inspection. Publication remains blocked by unavailable authenticated deployment access.

## Storage models and next GPU pack — 2026-09-23
- Downloaded PolyDavid's Samsung 990 EVO SSD glTF (197,409-byte ZIP). Texture identifies **990 EVO Plus 1TB**, despite source title. Added exact 1TB retail record with Samsung datasheet dimensions/performance and official Samsung 1TB image.
- Source: https://sketchfab.com/3d-models/samsung-990-evo-ssd-e3fc37002c9240e8ac0516dfec08940a (CC BY 4.0). Packed GLB: 219,172 bytes.
- Downloaded PolyDavid's WD SN7100 glTF (497,395-byte ZIP). Label explicitly says 1TB, so added that capacity rather than substituting for the catalog's 2TB version. Packed GLB: 512,704 bytes. Thumbnail uses the credited texture supplied with that model.
- Source: https://sketchfab.com/3d-models/ssd-wd-sn7100-8287dfa4fd644cb4a044d4dce57968ae (CC BY 4.0).
- Both SSDs browser-verified with [pi/2,pi/2,0] orientation; selected models load and labels are readable. Coverage is 24 downloaded models / 799 records; 775 remain simplified. Model and SEO checks pass.
- Fixed retail-parts.json generation order so newly appended records are included in the source inventory.
- Downloaded GPU Kit (RTX 5090, ARC B580, Gigabyte AERO), PolyDavid, CC BY 4.0: https://sketchfab.com/3d-models/gpu-kit-rtx-5090-arc-b580-gigabyte-aero-535139095991416bacce7ac852fdf492 . ZIP in Downloads is 8,667,385 bytes; extracted to ../polydavid-gpu-kit. Integration pending exact node/variant identification. Top-level model roots are Sketchfab_model_15, Sketchfab_model.001_36, Sketchfab_model.002_121. Do not count this pack as integrated yet.
- More candidates: https://sketchfab.com/PolyDavid/collections/free-pc-parts-e602264b03604b7191754dbdbf9e2e8f includes Ryzen7600X,5600X,Intel12100f,7900XTX NITRO+,Teamgroup RAM. Check each license and exact identity before mapping.

## Three-card GPU pack integrated — 2026-09-23
- Extracted and browser-inspected all three card roots from PolyDavid's GPU pack (CC BY 4.0), preserving transforms/materials and compacting geometry and textures.
- Sketchfab_model_15: Intel Arc B580 Limited Edition appearance -> arcb580, 4,834,968 bytes, Intel envelope 272 x 44 x 115mm (builder axes).
- Sketchfab_model.001_36: Gigabyte RTX4090 AERO -> new exact AERO OC24G record, 8,223,740 bytes, manufacturer envelope342 x75 x150mm. Source identity also supported by creator's separately named GIGABYTE AERO RTX4090 listing.
- Sketchfab_model.002_121: RTX5090 Founders Edition -> rtx5090, 5,192,900 bytes, NVIDIA length304 and width137mm; visual two-slot thickness40.6mm estimated. Manufacturer61mm required clearance separately documented, not conflated with geometry thickness.
- RTX5090 and ArcB580 remain family-or-chip mappings because existing catalog entries do not select a board partner. They do not represent all variants.
- All use [pi/2,0,0] orientation and render in the builder. Temporary inspection page removed. Coverage27/800 downloaded;773 simplified. No clearance-certified models. Inventory and SEO checks pass. Authenticated publication remains unavailable.

## Ryzen 5 7600X integrated — 2026-09-24
- Downloaded AMD Ryzen5 7600X by PolyDavid, CC BY4.0: https://sketchfab.com/3d-models/amd-ryzen-5-7600x-964e3c2ed57e40c38712d3b67b3be5d2 . ZIP13,816,099 bytes in Downloads; extracted ../ryzen7600x.
- Source includes creator-noted unwanted plane. Object_6 has x bounds[-3.6346,-0.0658], extending past the CPU centered near0; removed that node. Preserved substrate and contact geometry.
- Set Matte_Metallic metallic=.35,roughness=.55 so heat spreader renders under the site's direct lighting; source metal looked black without an environment map.
- Added scripts/prepare-ryzen7600x.cjs and reusable optimize-static-glb.cjs. Uses @gltf-transform/core,functions,extensions4.5.0 installed outside repo in ../model-tools. Static meshes flattened/joined, no triangle simplification.2,089 meshes reduced to7 draw primitives.
- Integrated7600x, orientation[pi/2,0,0]. Browser screenshots verify the processor marking, no stray plane, correct orientation in builder. Coverage28/800 downloaded,772 simplified. Model/SEO checks pass. No clearance certification or live publication claimed.

## Ryzen 5 5600X integrated — 2026-09-24
- Downloaded PolyDavid AMD Ryzen5 5600X Processor, CC BY4.0: https://sketchfab.com/3d-models/amd-ryzen-5-5600x-processor-1649601de2014dbeab4f201010a7c366 . Extracted ../ryzen5600x, packed original79,218,744 bytes.
- Consolidated30 meshes into6 drawing primitives; welded duplicates. Added prepare-ryzen5600x.cjs using meshoptimizer1.2.0 (runtime ../model-tools) for simplification target .25/error .001 and14-bit position quantization. Output37,400,660 bytes; still heavy, lazy-loaded only after preview action. Further delivery compression desirable.
- Adjusted Plastic_Silver/Sweet_Plastic/Metal.002 reflectivity to .35/.55 for direct-light rendering. Browser verified engraving, substrate, pins and builder orientation[pi/2,0,0].
- Coverage29/800 downloaded,771 simplified. Model inventory and SEO checks pass.
- Also downloaded Intel12100f by PolyDavid (CC BY4.0) from https://sketchfab.com/3d-models/intel12100f-0a8d100f3cc2480381abe7256bc7f986 via glTF download. Archive intel12100f.zip in Downloads; not integrated or counted yet. Next action: extract, inspect label, optimize, integrate i312100f.
