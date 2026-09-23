# Sketchfab asset audit

Updated September 23, 2026. The builder has 794 components. Four builder components currently use downloaded, attributed Sketchfab meshes; the other 790 use simplified geometry. Product pages also display four downloaded, attributed peripheral meshes. These are visual previews, not dimension-certified CAD models.

| Site item | Sketchfab model | Creator | Result |
| --- | --- | --- | --- |
| MSI GeForce RTX 5070 12G VENTUS 3X OC | [MSI RTX 5070 Ventus 3X OC](https://sketchfab.com/3d-models/msi-geforce-rtx-5070-ventus-3x-oc-732fd2bb31404894a220904526d13c03) | Darky Vip 3D | In builder |
| AMD Ryzen 7 9800X3D | [9800x3D CPU](https://sketchfab.com/3d-models/9800x3d-cpu-low-poly-8b15903087b5432db9cfc789b2cf4d6a) | PolyDavid | In builder |
| Corsair VENGEANCE RGB DDR5 96 GB kit | [VENGEANCE RGB DDR5](https://sketchfab.com/3d-models/corsair-vengeance-rgb-ddr5-ram-low-poly-5352b17857ea4036ab61980c4c57f265) | PolyDavid | In builder; mesh shows the product line, not kit capacity |
| Corsair VENGEANCE RGB Pro DDR4 32 GB kit | [VENGEANCE DDR4 RGB Pro](https://sketchfab.com/3d-models/ram-corsair-vengeance-ddr4-rgb-pro-ee5c6e6b2e524d63a7043365e73a2420) | lime.ball.animations | In builder; mesh shows the product line, not kit capacity |
| Logitech G915 | [G915 scan](https://sketchfab.com/3d-models/logitech-g915-scan-d6976a965ed54808aaeff3b609189f01) | o-oualid | On product page |
| Razer Viper Mini | [Viper Mini](https://sketchfab.com/3d-models/razer-viper-mini-85e1735704c645e5aaead0278a1038fe) | kimberly.h | On product page |
| Logitech PRO X SUPERLIGHT | [Computer mouse](https://sketchfab.com/3d-models/computer-mouse-6e7940d9e2144efeae3468a906f27e07) | zhe_kan | On product page; creator says it was modeled after this product |
| Logitech G502 X LIGHTSPEED | [G502 X LIGHTSPEED](https://sketchfab.com/3d-models/logitech-g502-x-lightspeed-cda7107cc1444b4788d747f0361f7d40) | Okopchi | On product page |

These eight assets use CC BY 4.0; credits and source links appear on their pages and at `/builder/model-credits/`. Product photos for the peripherals come from their manufacturers. The G502 X LIGHTSPEED was added to the catalog because the downloaded mesh names that specific variant, and its specifications and photo were checked against Logitech.

## Inspected downloads not published as product models

- The [ASUS ROG Strix RTX 3090 White](https://sketchfab.com/3d-models/rtx-3090-asus-rog-strix-white-edition-videocard-506b1c68d24f4a9088ea0eaef41f7dd9) source was converted but rendered as a narrow strip in the browser. Its product record and official ASUS photo remain in the catalog; the broken mesh was excluded.
- The [Lian Li UNI FAN SL120 Black](https://sketchfab.com/3d-models/lian-li-uni-fan-sl120-rgb-black-5abd0d8e89ea4241b7216f4b6d5a2ca4) and [White](https://sketchfab.com/3d-models/lian-li-uni-fan-sl120-rgb-white-151c28bb1bc9483a92728815cb0628ea) files were converted but rendered as featureless slabs in the builder. Both exact fan records and official Lian Li photos remain in the catalog; the meshes were excluded.
- The [NZXT H500](https://sketchfab.com/3d-models/nzxt-h500-pc-case-e0e3dbab28014eb19a123c1be69d42b3) FBX converted to a blank-looking white shell. Its record remains but the imported mesh was excluded.
- The downloaded `nvidia-geforce-rtx-5070-msi-gaming-x-trio.zip` depicts a retail package, not the GPU. It was not assigned to the card.
- The downloaded `nvidia-geforce-rtx-3090.zip` has a noncommercial license and was not included in the commercial site.
- The AMD Wraith Stealth cooler, Corsair fan, Corsair H150i cooler, and Corsair Dominator RGB files do not establish exact catalog SKU matches. `lian-li.zip` did not convert from its source DAE. None were assigned to a different item.

Peripheral coverage is currently 23 keyboards, 25 mice, and zero mousepads in the site catalog. Four peripherals have the downloaded 3D views above. Finding 50 accurately named, manufacturer-photographed items in **each** peripheral category with separate commercially usable 3D assets remains outstanding. A generic or mismatched mesh should not be presented as an exact item.
