# Sketchfab asset audit

Updated September 23, 2026. The builder catalog has 791 components: 159 graphics cards, 166 processors, 106 motherboards, 80 cases, 74 SSDs, 69 power supplies, 65 memory kits, 44 hard drives, and 28 fans.

Four records currently use downloaded, credited Sketchfab meshes:

| Builder part | Creator | Match | Source |
| --- | --- | --- | --- |
| MSI GeForce RTX 5070 12G VENTUS 3X OC | Darky Vip 3D | Exact named card | [Sketchfab model](https://sketchfab.com/3d-models/msi-geforce-rtx-5070-ventus-3x-oc-732fd2bb31404894a220904526d13c03) |
| Ryzen 7 9800X3D | PolyDavid | Exact named processor, low-poly appearance | [Sketchfab model](https://sketchfab.com/3d-models/9800x3d-cpu-low-poly-8b15903087b5432db9cfc789b2cf4d6a) |
| Corsair VENGEANCE RGB DDR5 96 GB kit | PolyDavid | Family-level appearance; mesh does not identify capacity, speed, or timings | [Sketchfab model](https://sketchfab.com/3d-models/corsair-vengeance-rgb-ddr5-ram-low-poly-5352b17857ea4036ab61980c4c57f265) |
| Corsair VENGEANCE RGB Pro DDR4 32 GB kit | lime.ball.animations | Family-level appearance; OBJ and texture converted to GLB, kit specifications not depicted | [Sketchfab model](https://sketchfab.com/3d-models/ram-corsair-vengeance-ddr4-rgb-pro-ee5c6e6b2e524d63a7043365e73a2420) |

All four are credited under CC BY 4.0 in `scripts/sketchfab-models.json` and `/builder/model-credits/`. Each imported GLB was rendered in the browser. The other 787 builder records use generated illustrative geometry and are identified as such in model metadata. A 3D preview is not a dimension-certified fit check.

Two exact GPU product records were also added to the catalog after finding their names and manufacturer specifications: MSI GeForce RTX 5070 12G GAMING TRIO OC and ASUS ROG Strix GeForce RTX 3090 White OC Edition 24GB. Downloaded Sketchfab files for those names failed the builder's visual check: the first rendered as a retail box and the second as a thin strip even after malformed outlying meshes were removed. Their builder previews therefore remain illustrative geometry; those downloaded meshes were not published.

Other downloaded Sketchfab archives were inspected. [Lian Li UNI FAN SL120 RGB Black](https://sketchfab.com/3d-models/lian-li-uni-fan-sl120-rgb-black-5abd0d8e89ea4241b7216f4b6d5a2ca4) and [White](https://sketchfab.com/3d-models/lian-li-uni-fan-sl120-rgb-white-151c28bb1bc9483a92728815cb0628ea) are exact named models, but the downloaded source archives contain Blender files only, while the builder requires a web-ready GLB. The connected browser did not deliver Sketchfab's converted GLB when requested. The downloaded [NZXT H500](https://sketchfab.com/3d-models/nzxt-h500-pc-case-e0e3dbab28014eb19a123c1be69d42b3) archive contains FBX only. Other archives contained a generic model without an exact part identity, or a noncommercial license. None of those has been silently assigned to a different product.

Sketchfab has many component models. Availability for all 791 exact catalog records has not been established. Matching an individual GPU or board requires the full manufacturer model and visible design, not only its chipset. [Sketchfab's Download API](https://sketchfab.com/developers/download-api/downloading-models) uses authenticated access; its [integration guidelines](https://sketchfab.com/developers/download-api/guidelines) require creator and source attribution. No API credential is stored in this repository.
