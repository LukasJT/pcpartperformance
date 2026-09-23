# Sketchfab asset audit

Updated September 23, 2026. The builder catalog has 789 components: 157 graphics cards, 166 processors, 106 motherboards, 80 cases, 74 SSDs, 69 power supplies, 65 memory kits, 44 hard drives, and 28 fans. Exactly one record currently uses a downloaded Sketchfab mesh: MSI GeForce RTX 5070 12G VENTUS 3X OC. Its author, source, CC BY 4.0 license, and modifications are recorded in `scripts/sketchfab-models.json` and shown on `/builder/model-credits/`.

The other 788 records use locally generated illustrative geometry. They are **not** downloaded Sketchfab models, even where an exact product name and manufacturer dimensions are known. The builder and coverage page identify them accordingly.

Examples checked using Sketchfab's own search with the **Downloadable** filter:

- [MSI GeForce RTX 5070 Ti VENTUS 3X OC](https://sketchfab.com/search?features=downloadable&q=MSI+GeForce+RTX+5070+Ti+VENTUS+3X+OC&type=models): no results. A broader `5070 Ti Ventus` search also returned no results.
- [Supermicro H13DSH](https://sketchfab.com/search?features=downloadable&q=Supermicro+H13DSH&type=models): no results.
- [Ryzen 7 9800X3D low-poly model](https://sketchfab.com/3d-models/9800x3d-cpu-low-poly-8b15903087b5432db9cfc789b2cf4d6a): listed as downloadable under CC BY 4.0, but both original and converted GLB download buttons returned HTTP 403 in the connected signed-in browser. No asset was obtained.
- [GfK Etilize Ryzen 7 9800X3D model](https://sketchfab.com/3d-models/amd-ryzen-7-9800x3d-8-core-processor-21bb781454214e98bb3dd26b6c50dbb3): an exact-named model exists, but its page has no download option, so it cannot be bundled into the builder from Sketchfab.

These examples do not establish availability for every other catalog record. Exact model matching must compare manufacturer, full model number, board edition, and visible geometry. A model for one GPU chipset is not automatically a match for a different board partner or cooler. The catalog should not assign a near-match to an exact SKU.

[Sketchfab's Download API](https://sketchfab.com/developers/download-api/downloading-models) requires authenticated authorization to request model archives, and its [integration guidelines](https://sketchfab.com/developers/download-api/guidelines) require creator and source attribution. No API key or OAuth credential is stored in this repository.
