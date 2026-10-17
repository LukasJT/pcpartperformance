# Component photo repair — October 17, 2026

## Confirmed cause

The live builder's exact-name check rejects valid images whose captions include a SKU, packaging description or extra model wording. The compact image payload discarded the catalog identity already held in the full source record. Browser reproduction confirmed the selected starter GPU, RAM, SSD, PSU and cooler showed icons, although some other component pictures still worked.

Some inherited mappings really are incorrect: for example, RM850x pointed to a Corsair CX600M, and the 2 TB BarraCuda pointed to a 500 GB drive. These must not be accepted just to fill a space.

## Changes

- Bind valid catalog identities and twelve explicit caption aliases when generating the builder image index. Keep exact partner, capacity and revision boundaries. A caption change invalidates an alias instead of silently accepting a different item.
- Add six official product images for the MSI RTX 3060 Gaming X Trio 12G, Corsair DDR5 kit, 2021 RM850x, Noctua NH-U12A, black Lian Li O11 Air Mini and black standard-blade TL 120 Wireless fan.
- Read the exact MSI datasheet and extract its embedded card image, rather than selecting shared graphics from the marketing-page template. Visually inspect the card, box and backplate to corroborate the product identity.
- Record source URLs, identity evidence, dates, asset hashes and visual inspection in `scripts/builder-photo-repairs.json`. Build from committed images; no manufacturer fetch runs during production builds.
- Use local 320 px thumbnails (each below 16 KB). Keep the image index lazy loaded and preserve all existing part selections, saves, compatibility checks and 3D assets.
- Keep pictured model names in hover titles, without adding photo-type captions.

## Verification checklist

| ID | Check | Status |
| --- | --- | --- |
| PHOTO-1 | Reproduce on live mobile and desktop | Complete — `before-browser.json` |
| PHOTO-2 | Restore valid identity bindings and six reviewed images | Complete |
| PHOTO-3 | Full build, image regression tests and existing picker tests | Passed — 25 automated tests, 11 existing workspace checks, seven route payload budgets, type check, lint and release preflight |
| PHOTO-4 | Inspect loaded row/picker pictures at 390 and 1440 px | Passed — eight photo checks and nine existing browser workflows; `browser.json`, before/after screenshots |
| PHOTO-5 | Publish with existing Git deployment and verify public assets | Complete — Cloudflare success; 19 HTTPS checks and eight live mobile/desktop photo checks |

This is a targeted image repair. It does not claim every catalog item now has an exact photo, nor replace the existing 3D models. The optional 2 TB HDD still needs its own accurate picture; the unrelated 500 GB image stays rejected.

All-route HTML verification also passed: 1,592 pages, 98,627 links, zero reported structural/metadata issues, no duplicate titles or descriptions. The resource audit reported no inline executable scripts, event handlers, external scripts or frames. These are automated checks, not a claim of complete manual accessibility or security certification.

## Verified live release

Production commit: `bd7981151dfc82080af228853fdc4ea45e0e9741`. Cloudflare reported success at 2026-10-17 18:31:54 UTC. The standard public release marker matches this commit. `live-verification.json` confirms the generated builder image index, six product pages and all twelve image/thumbnail hashes. `live-browser.json` confirms image decoding in both selected rows and four category pickers at 390 and 1440 px on https://www.pcpartperformance.com/builder/.

The additional eight existing model-image integrity tests and the phone-preview identity check passed. No model assets or saved-build storage formats were changed.
