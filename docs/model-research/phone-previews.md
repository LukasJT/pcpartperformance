# Phone comparison previews

Four independently identified downloadable CC BY 4.0 Sketchfab models are registered in `scripts/phone-models.json`: iPhone 16, iPhone 16 Pro, Pixel 9 and Galaxy S25. They are used on the general hardware comparison page, the phone size tool, researched comparison pages and the corresponding phone pages. A Pixel 9 Pro is not assigned a Pixel 9 model, and a Pro Max is not assigned a Pro model.

The model controller and registry are small. Three.js, its loader and the actual GLB load only after clicking **View in 3D**. The preview supports orbit dragging, pinch/wheel zoom, front/back/side/reset controls, keyboard arrow rotation and plus/minus zoom. Returning to Photo or replacing a comparison disposes the WebGL context, controls, textures and geometry. Rendering occurs on interaction or resize rather than continuously. A failed load leaves an accessible retry and the photo/specifications available.

Meshes were deduplicated, pruned and Meshopt compressed; textures remain embedded. One Galaxy S25 instance was extracted from its author's front/back two-instance display scene. It was oriented upright for the comparison controls. Published phone dimensions remain in the separate same-scale outline tool: these appearance meshes do not certify dimensions, cases or camera clearances. The Pixel 9 author explicitly describes their model as low polygon.

Creator/source/license links and modifications are published at `/builder/model-credits/#phone-models`. An initial converted white iPhone Pro model had material artifacts; the registered model was replaced with tranminhluan's complete iPhone 16 Pro mesh after visual inspection. The appearance previews are not claimed as official manufacturer CAD.

## Verification

Browser checks covered all four front/back orientations, side/reset controls, keyboard rotation and zoom, Photo/reopen, changing size-tool selections after opening 3D, and availability badges in the comparison picker. Desktop (1440 × 1050) and mobile (390 × 844) layouts were reviewed in both themes. The mobile page had no horizontal overflow. Phone meshes passed the Khronos validator with zero errors and warnings; all 152 unique model assets passed the repository's structural and scene-volume audit. SEO and publication checks passed after the build, including 1,364 generated pages and 71,565 local links. Screenshots are saved in the parent workspace's `qa/phone-preview-desktop.png` and `qa/phone-preview-mobile.png`.
