# Remaining GPU photos — 2026-10-17

All 17 remaining generic GPU records have reviewed photos with matching chips and memory capacities. Each record explicitly identifies the pictured partner or reference board.

- Registry: `scripts/component-photo-remaining-gpu-oct17.json`
- Assets: `dist/assets/hardware/catalog-remaining-gpu-oct17/` — 34 WebP files, 1,683,000 bytes.
- Per-ID outcomes, hashes and dimensions: `remaining-gpu-audit.json`.
- Actual visual review: all 17 cells of `remaining-gpu-contact-1.jpg`, plus the IBM original close-up.
- Strict central validation passes with IBM's numeric memory corrected to `0.000256` GB. Largest thumbnail: 24,172 bytes.

## IBM capacity correction at integration

IBM VGA has 256 KB. Its numeric catalog value of `0.256` GB is a unit error; the written catalog description already says 256 KB. The manifest records the true decimal capacity, `0.000256` GB. Parent integration owns the catalog correction.

The museum photograph shows its owned IBM 75X9017 ISA adapter, with the same 72X8287 controller used by integrated PS/2 VGA. The adapter variant is explicit in the metadata. IBM's [Hardware Interface Technical Reference, VGA Function, October 1990](https://www.ardent-tool.com/docs/pdf/ibm_hitrc10.pdf), printed page 21 (PDF page index 28), documents 256 KB in four 64 KB maps. Printed page 64 separately confirms 256 KB installed on the system board. Source details are preserved in `remaining-gpu-ibm-evidence.json`.

## Matching and source notes

The original NV4 TNT and 128-bit NV5 TNT2 are distinguished from Vanta, M64, Pro and Ultra. The DDR GeForce 256, original GeForce3, Voodoo2 12 MB, original Radeon 8500 64 MB, X800 XT AGP and X1900 XTX configurations are documented. Retail publications identify the PowerColor R9 380X 4 GB and SAPPHIRE Vapor-X HD 5870 1 GB by exact SKU. The ASUS guide's 69-pixel photo was rejected for insufficient resolution. No diagram or logo is used.

Access failures, rejected variants and source alternatives are recorded in the audit. Protected galleries were not fetched, and no challenge or access restriction was bypassed.

## Rights and validation

Public publication does not establish an open reuse license. Original copyright is retained, no reuse permission grant is asserted, and each record identifies its publication and attribution. Leo (Lord Quake) is explicitly credited for the Monster 3D photo.

Resizing preserved proportions. Full images are at most 800 pixels; thumbnails are at most 320 pixels and 40 KB. Original-source, full-image and thumbnail SHA-256 values are recorded. No photo was generated or recolored. Shared runtime files, full builds, commits and deployment remain parent-owned.
