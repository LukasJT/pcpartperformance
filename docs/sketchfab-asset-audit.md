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

## Intel Core i3-12100F integrated — 2026-09-24
- Downloaded Intel12100f by PolyDavid, CC BY 4.0: https://sketchfab.com/3d-models/intel12100f-0a8d100f3cc2480381abe7256bc7f986 . Extracted ../intel12100f; original packed GLB27,959,956 bytes.
- Consolidated2,137 meshes into12 drawing primitives and welded vertices without triangle simplification. Final23,864,400 bytes; lazy-loaded on preview request.
- Engraving confirms i3-12100F. Intel package dimensions45x37.5mm override old square placeholder;5mm visual thickness remains approximate. Orientation[pi/2,0,0] verified in builder screenshot.
- Coverage30/800 downloaded,770 simplified. Model inventory, SEO and fan-placement checks pass. No clearance certification or live deployment claimed.

## Sapphire NITRO+ RX 7900 XTX integrated — 2026-09-24
- Downloaded AMD Sapphire NITRO+ Radeon RX7900XTX by PolyDavid, CC BY4.0: https://sketchfab.com/3d-models/amd-sapphire-nitro-radeon-rx-7900-xtx-34ae089114524c61880235e96b48f7f6 . ZIP4,211,395 bytes; extracted ../sapphire7900xtx; packed13,475,644 bytes.
- Creator noted a floating HDMI port. Node Plane.005_Brushed nickel_0 alone extends below y=-1 (bounds y=-3.252..-2.870), isolated from card. Removed it using prepare-sapphire7900xtx.cjs. Consolidated1,188 meshes into32 drawing primitives; welded vertices without triangle simplification. Final GLB8,027,952 bytes.
- New exact retail entry retail-sapphire-nitro-radeon-rx-7900-xtx-vapor-x-24gb; manufacturer dimensions320x71.6x135.75 in builder axes. Official page https://www.sapphiretech.com/en/consumer/nitro-radeon-rx-7900-xtx-vaporx-24g-gddr6 . Added official800x500 product image from that page; inspected visually. nation subdomain TLS mismatch, used valid www official site instead without disabling TLS.
- Orientation[0,pi/2,0] verified in builder screenshot; no isolated port. Creator credited. Coverage31/801 downloaded,770 simplified; no clearance-certified geometry. Model inventory/SEO checks pass. Publication remains unavailable.

## Black TEAMGROUP DELTA DDR5 integrated — 2026-09-24
- Downloaded DDR5 RAM - Teamgroup T-Force Black by PolyDavid, CC BY4.0: https://sketchfab.com/3d-models/ddr5-ram-teamgroup-t-force-black-268614943df3411bb6487a9601adc03f . ZIP16,096,761 bytes; extracted ../tforceblack; packed20,236,352 bytes.
- Consolidated20 meshes to11 drawing primitives and welded vertices without triangle simplification. Compared visible heat-spreader branding and contour with existing official TEAMGROUP product photograph; matching black DELTA RGB DDR5 design.
- Assigned same visual asset to tforcedelta6000 and tforce7600 with identity family-or-chip. Does not certify capacity, transfer rate, timings or mounting detail. Manufacturer DDR5 envelope46.1x144.2x7mm from https://images.teamgroupinc.com/products/memory/u-dimm/ddr5/delta-rgb/edm/delta-rgb-en.pdf . Builder axes[7,144.2,46.1], orientation[0,pi/2,pi/2].
- Browser verified two-module preview. Coverage33 component mappings/801 (one new asset shared across two kits),768 simplified. Model inventory and SEO checks pass. Publication remains blocked by unavailable authentication; no live claim.

## GTX1080Ti Founders Edition integrated — 2026-09-24
- Downloaded Nvidia GeForce GTX1080 ti FE - Rev2 by MUSHROOM_BUILDS, CC BY4.0: https://sketchfab.com/3d-models/nvidia-geforce-gtx-1080-ti-fe-rev2-43561a3309854d94858c293e1ba454d4 . ZIP4,474,438 bytes; extracted ../gtx1080tife; packed8,323,152 bytes.
- Added prepare-gtx1080ti.cjs to adapt highly metallic surfaces for direct lighting, preserving textures. Consolidated24 meshes to17 drawing primitives, welded vertices without triangle simplification.
- Mapped gtx1080ti with family-or-chip identity: catalog generic chip does not identify a board partner. FE visual dimensions266.7x40.6x111.15mm, two-slot thickness approximate. NVIDIA official10series page and PNY official1080Ti reference specification support10.5x4.376inch card envelope. Not clearance-certified.
- Browser checked both cooler and backplate, corrected upside-down orientation to[-pi/2,0,pi/2]. Builder displays backplate up. Model inventory/SEO checks pass. Coverage34/801 downloaded mappings,767 simplified.
- Rechecked existing MSI5070GamingXTrio archive audit: retail box geometry, not card. No incorrect mapping added. Publishing authentication remains unavailable.

## Seasonic M12II EVO enclosure added — 2026-09-24
- Downloaded Seasonic M12II Evo by mistz-ik, CC BY4.0: https://sketchfab.com/3d-models/seasonic-m12ii-evo-c1a6f7445f1a4895a944c709162450c1 . ZIP6,006 bytes; extracted ../seasonicm12ii. Packed GLB26,972 bytes. Original source STL; retained converted untextured enclosure geometry.
- Source bounds87x163x150mm; oriented[0,0,pi/2] and normalized to manufacturer620W envelope[160,86,150]. Official https://seasonic.com/product/m12ii-evo/ specifies160x150x86 for520/620,170x150x86 for750/850. Do not conflate variants.
- Added620W catalog entry with family-or-chip identity and explicit credits limitation: this is enclosure-only geometry, no fan/grille/cables/labels and no wattage identification or clearance certification. Browser verifies shape and orientation. Added enclosure illustration as thumbnail; official photo not obtained (direct manufacturer request blocked), not misrepresented as photo.
- Other PSU search findings: TrentPierce119c79e is DC electronics bench supply, unsuitable for PC; MuhammadKholis28df0f2 is unnamed educational PC PSU, no exact match established. Neither substituted for named catalog units.
- Inventory/SEO checks pass. Coverage35/802 downloaded mappings,767 simplified. No live publication; authentication unavailable.

## Yolala custom-PC pack downloaded and inspected — 2026-09-24
- Source https://sketchfab.com/3d-models/custom-gaming-pc-fbx-file-00bb790319c045058290dfbb4873f3ac ; Yolala3D | Y3D (https://sketchfab.com/Yolala3d), CC BY4.0 verified in download modal. Creator lists i7-10700K, ASUS ROG Maximus XIII Z590 HERO, G.Skill TridentZ RGB, GALAX RTX2060, DeepCool Castle240 AIO and MATREXX55V3 case.
- Download archive C:/Users/slowf/Downloads/custom_gaming_pc_fbx_file.zip26,035,148 bytes; extracted ../yolala-pc; packed.glb70,231,048 bytes.
- RootNode has377 child objects, mostly generic Blender names. Cube.101 is self-contained GPU (34 mesh children), extracted cube101.glb4,268,516 bytes. Browser confirms bare back PCB and dual-fan cooler. Fan faces currently render as solid disks (material/geometry investigation needed); exact GALAX variant not established. Do not invent variant or count as integrated yet.
- Plane.004 (17children) is a perforated case panel, NOT motherboard; extracted plane004.glb41,355,388 bytes only for inspection. Plane.003 likely related panel. Full pack retains all source parts; need grouping investigation for board, CPU, RAM and chassis.
- Temporary inspection HTML/assets removed from dist. Downloaded source remains outside deploy tree. Current integration count unchanged35/802.
- Other focused source leads: ASUS B550-F original (not WiFiII) https://sketchfab.com/3d-models/asus-strix-b-550-f-gaming-motherboard-realistic-3eba5f45bed74fbeb2647de38047000f ; ASUS PrimeH510M-K https://sketchfab.com/3d-models/pc-motherboard-asus-prime-h510m-k-f9a6af88120f4a0f81cd4107ce533e3e (description incorrectly calls LGA1151, verify actual markings and official LGA1200 specs).

## Extracted GALAX-style RTX2060 integrated — 2026-09-24
- Used previously downloaded Yolala3D PC pack Cube.101 subtree, source/CCBY4 attribution preserved. Consolidated34 meshes to32 drawing primitives, welded vertices. Final3,785,612bytes.
- Fan disk geometry is source Material.093 mesh (248tri), not alpha/texture loading failure. Preserved source rather than inventing blades. Creator identifies GALAX RTX2060 but exact retail variant not established; mapped existing generic rtx2060 with family-or-chip identity.
- Approximate dimensions236.18x36x140.03 derived from source mesh proportions/assumed scale, NOT manufacturer dimensions. Added explicit estimated:true support in community manifest and validator; prevents asserting researched dimensions solely because model was downloaded.
- Orientation[0,pi/2,0] browser verified back PCB upward, bracket left, side marking readable. Model inventory and SEO checks pass after correcting validator assumption. Coverage36/802 downloaded mappings,766 simplified. Other pack parts still need grouping; no live deploy claim.

## ASUS ROG STRIX B550-F GAMING integrated — 2026-09-24
- Downloaded standalone Asus Strix b-550-f Gaming Motherboard Realistic by MUSHROOM_BUILDS, CC BY4.0: https://sketchfab.com/3d-models/asus-strix-b-550-f-gaming-motherboard-realistic-3eba5f45bed74fbeb2647de38047000f . Chose1K GLB53,944,576bytes at C:/Users/slowf/Downloads/asus_strix_b-550-f_gaming_motherboard_realistic.glb; copied ../asus-b550f/source.glb. Download tool timed out but file/header complete; did not redownload.
- Consolidated164 meshes to54 drawing primitives, welded; intermediate46,117,740bytes. Added reusable simplify-static-glb.cjs: static-only, meshoptimizer ratio.3/error.001,14-bit positions/10-bit normals/12-bit UVs where within0..1. Final25,574,976bytes. No runtime simplifier dependency.
- Browser inspection verified board components and original B550-F appearance. Creator notes mixed-up back texture; retained/disclosed. Added retail-asus-rog-strix-b550-f-gaming separately, not mapped to existing WIFI II. Official specs https://rog.asus.com/us/motherboards/rog-strix/rog-strix-b550-f-gaming-model/spec/ and manual support AM4,DDR4,4DIMM128GB,2M2,6SATA,305x244mm. M2_2 disables SATA5/6 noted. Height50mm approximate.
- Orientation[pi/2,0,0] verified upright, I/O left, RAM right. Thumbnail still original illustration; official product photo remains to obtain. Coverage37/803 downloaded mappings,766 simplified. Inventory and SEO checks pass. Local only; no authenticated publication.

## Samsung SM883 SATA SSD — 2026-09-24

Downloaded PolyDavid’s CC BY 4.0 SM883 GLB (4,405,840 bytes) through the Sketchfab download modal. Added the SM883 960GB as a separate SATA product; source textures show an enclosure without capacity labeling, so its identity remains family-level. Retained the low-poly geometry, pruned unused attributes and oriented the textured face outward. Verified the model renders in the local builder. Creator and source are linked in the credits. Samsung lists the product as discontinued. Specifications and envelope were cross-checked against the Samsung-authored SM883 Rev. 1.0 datasheet mirrored at https://device.report/m/ca1a531a06082cbc425f1367a47fea4e9e87eda0548037a3d4087a69077c8a47 . Mounting positions remain approximate.

## ASUS PRIME H510M-K — 2026-09-24

Downloaded zhigulinsky / vladikzhil’s CC BY 4.0 glTF archive (5,866,157 bytes) from Sketchfab. Packed GLB was 26,914,200 bytes; static mesh consolidation and bounded simplification reduced it to 20,346,904 bytes and 13 draw primitives. Verified the board name in its texture and upright rendering with rear I/O on the left and DIMM slots on the right in the local builder. Added the original PRIME H510M-K as a separate board record, with two DIMM slots, one M.2 slot and four SATA ports. The creator description says LGA1151 incorrectly; official ASUS documentation confirms LGA1200. Dimensions 226 × 203 mm, with approximate 40 mm preview height. Source: https://sketchfab.com/3d-models/pc-motherboard-asus-prime-h510m-k-f9a6af88120f4a0f81cd4107ce533e3e . Manufacturer specifications: https://www.asus.com/motherboards-components/motherboards/prime/prime-h510m-k/techspec/ . M.2 SATA shares SATA6G_2; exact clearances remain unverified.

## WD Caviar SE WD800JD 80 GB — 2026-09-24

Downloaded Hard Drive-SF by Giannis Galatsis / johnrock under CC BY 4.0. Archive: hard_drive-sf.zip, 15,340,912 bytes. TextureUp_baseColor.jpeg identifies WD Caviar SE, WD800JD and 80 GB. Added a separate legacy entry rather than mapping the enclosure to modern WD Blue/Red/Black drives. Western Digital-authored documentation mirrored at https://www.manualsonline.com/manuals/mfg/western_digital/wd800jd.html confirms SATA 1.5 Gb/s, 7200 RPM and 8 MB cache. Approximate 147 × 101.6 × 26.1 mm 3.5-inch envelope remains unverified for the exact suffix. Static optimization reduced packed GLB from 19,333,484 to 17,955,620 bytes; original geometry and textures preserved. Local builder screenshot confirms a horizontal drive with its label facing upward. Source: https://sketchfab.com/3d-models/hard-drive-sf-e03abb1edf7a42d69f99ae5aa7a852c0 .

Other HDD candidate inspected: Jamoues Hard Drive, https://sketchfab.com/3d-models/hard-drive-946666a390b44c90901e7dd07fb509a5 , describes an old WD drive and uses CC BY-SA 4.0. No exact modern catalog match was established during this pass; not downloaded or assigned.

## Lian Li case candidates — 2026-09-24

Downloaded lurgrod8039’s CC BY 4.0 Lian Li model from https://sketchfab.com/3d-models/lian-li-04e5d962c897434fb8e2294e6bb13366 . Archive lian_li.zip is 569,750 bytes; extracted source is kept in ../lianli-case. Standalone chassis has glass panels and a dual-chamber layout, but no exact model name is supplied and source proportions do not conclusively match the original O11 Dynamic. Do not assign an exact retail ID until identification is supported. Optimized source is ../lianli-case/optimized.glb.

Named scene located: Gaming computer by Marcseus, https://sketchfab.com/3d-models/gaming-computer-7cf383ddfe9047f89435b4fc2a6e1053 , CC BY 4.0. Creator explicitly lists O11 Dynamic EVO, ASUS ROG MAXIMUS Z690 FORMULA, CORSAIR DOMINATOR PLATINUM RGB 64GB DDR5 WHITE, RTX3090 ASUS STRIX WHITE OC and Kraken X73 RGB WHITE. Individual subtrees must be identified and extracted before assignment.

Marcseus archive download completed: gaming_computer.zip, 171,341,250 bytes. Extracted to ../marcseus-pc; scene.bin is 802,122,348 bytes, matching its glTF declaration. The scene has 2,204 nodes and 902 top-level groups. Generated component-inventory.json identifies the RAM-specific material groups (20–28) for extraction. No part from this scene has been assigned yet.

## Corsair DOMINATOR PLATINUM RGB DDR5 White — 2026-09-24

Extracted the first complete DIMM from Marcseus's Gaming Computer scene, including PCB, contacts, heatspreader and text. The reproducible 25-node selection is scripts/model-extractions/marcseus-dominator-white.json. Motherboard socket parts and the three other DIMMs were excluded. Extended extract-static-glb.cjs to support external single-buffer glTF and a named-node list; added inspect-gltf-groups.cjs to calculate transformed group bounds without loading the large binary. Existing GLB single-node extraction was regression-checked using Cube.101 from the Yolala scene.

Consolidated 25 meshes into 12 draw primitives; final GLB 1,543,808 bytes. Browser verified four complete modules displayed upright in the builder. Added a separate white 64GB (4x16GB) DDR5-5200 CL38 product, SKU CMT64GX5M4B5200C38W, and the official Corsair white photo. Exact timings/capacity are not visible in the mesh, so its asset mapping is family-or-chip. Module dimensions 135 × 8 × 56 mm come from Corsair's memory module dimensions article; mounting clearance remains unverified. CC BY 4.0 creator attribution included. 41 community mappings across 807 builder records; 766 simplified previews remain. Model inventory, SEO and fan-placement checks pass. Local changes only; publication is not confirmed.

## Marcseus motherboard and case extracted — 2026-09-24

Added ASUS ROG MAXIMUS Z690 FORMULA (retail-asus-rog-maximus-z690-formula) and Lian Li O11 Dynamic EVO White (retail-lian-li-o11-dynamic-evo-white) from the already downloaded Gaming Computer scene by Marcseus, CC BY 4.0. Reproducible node selections are in scripts/model-extractions/marcseus-z690-formula.json and marcseus-o11-evo-white.json. The board uses scene groups 26–801 and excludes the separate RAM, GPU and cooler. Static consolidation reduced 424 meshes to 20 draw primitives, around 7.1 MB. High-metalness materials adapted using prepare-gtx1080ti.cjs for direct lighting.

Case extraction includes the base chassis, feet, motherboard tray and vent panels, with installed hardware removed. Original extracted GLB was 738,493,184 bytes; the top vent alone had approximately 15.7 million triangles. Ran simplify-static-glb.cjs with ratio 0.02/error 0.002, then optimize-static-glb.cjs and prepare-marcseus-case.cjs. Final 22,292,516-byte GLB has two draw primitives. The simplified open-chassis preview excludes glass panels; source surface detail and dimensions are approximate.

Verified both models individually and together with the Corsair four-DIMM kit in the browser. White finish, upright orientation, rear expansion slots and motherboard placement are visible. These are visual assembly checks, not exact clearances. Official photos from ASUS and Lian Li added. ASUS specs: LGA1700 DDR5 ATX, four DIMMs/192 GB, three onboard M.2 slots and six SATA ports; two expansion-card M.2 slots not counted as onboard. Lian Li specs: 465 × 459 × 285 mm, top/side/bottom 3×120 or 2×140, rear 1×120, ATX PSU max 220 mm. Sources: https://rog.asus.com/us/motherboards/rog-maximus/rog-maximus-z690-formula-model/spec/ and https://lian-li.com/product/o11-dynamic-evo/ . Coverage now 43 downloaded mappings, 766 simplified, 809 total. Local only; no publication verified.

## PC For 3D Rendering scene and Intel i7-8700 — 2026-09-24

Downloaded PC For 3D Rendering by piksidiksi47, CC BY 4.0, from https://sketchfab.com/3d-models/pc-for-3d-rendering-1c45e1c52d4a4c23b9649ec8a6200c81 . Archive C:/Users/slowf/Downloads/pc_for_3d_rendering.zip is 28,890,757 bytes; extracted ../piksi-pc. Scene has 361 nodes, 215 meshes, two fan animations. CPU_79 is static and its rendered text clearly reads i7-8700 / 3.20GHz. Extracted and consolidated to 4,218,124 bytes / ten draw primitives, mapped only to i78700. Intel package size 37.5 × 37.5 mm verified at https://www.intel.com/content/www/us/en/products/sku/126686/intel-core-i78700-processor-12m-cache-up-to-4-60-ghz/specifications.html . Fixed the old malformed source URL in catalog. Thickness 3.1 mm remains approximate. Browser checked front markings and upright orientation. Creator credit added.

Extraction tool now permits a static component in a scene with unrelated animations, but rejects animation targeting the selected subtree or its ancestors. Regression checked successful CPU extraction and expected rejection of FAN_Blade_222. Skin rejection remains unchanged.

Other scene evidence: MSI MEG Z390 GODLIKE_0 is a flat textured board, approximately zero depth (7e-7 scene units), not an actual volumetric board. Not assigned as a completed 3D model. Description incorrectly calls GPUs RTX3060; mesh/material names identify RTX_3060Ti_FE and resemble exela's NC-licensed design, so no new GPU mapping made. RAM texture says Corsair Vengeance RGB Pro; this family already has a model. PSU textures say Smart Zero Fan / RGB Lighting, likely Thermaltake, but exact retail variant remains unidentified. Keep source for further identification; do not map unknown PSU to an arbitrary 850W product. Coverage 44 downloaded mappings, 765 simplified previews, 809 total. Publication not verified.
