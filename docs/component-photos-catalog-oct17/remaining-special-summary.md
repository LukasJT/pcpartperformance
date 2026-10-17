# Difficult component identities — 2026-10-17

Six records rechecked: **one reviewed repair and five unresolved identities**. No product or specification was silently changed.

## Reviewed repair

`b650aorus`: GIGABYTE B650 AORUS ELITE AX revision 1.2, photographed by its owner. The original [owner listing](https://www.reddit.com/r/hardwareswap/comments/1vto878/usaoh_h_am5_motherboards_x870ee_x870_b650_x870e/) explicitly names revision 1.2 and links this board's [photo album](https://imgur.com/a/gigabyte-aorus-b650-elite-ax-functionality-proof-O4VIaWq).

The actual board marking confirms the model. The album's test photo shows Realtek 8852CE Wi-Fi and CPU-Z model B650 AORUS ELITE AX / BIOS FB3g. The [manufacturer manual](https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1203_e.pdf), printed page 8, maps RTL8852CE to revision 1.2; revisions 1.0 and 1.1 use AMD RZ616 and Intel AX210 respectively. The [manufacturer revision 1.2 specification](https://www.gigabyte.com/eu/Motherboard/B650-AORUS-ELITE-AX-rev-12/sp) independently confirms RTL8852CE.

The last physical PCB revision digit is hidden by a connector. It was not claimed legible. The primary owner's explicit identification and coherent actual-board test evidence distinguish this from a retailer stock image. The original background and handwritten owner timestamp remain visible.

- Manifest: `scripts/component-photo-remaining-special-oct17.json`
- Assets: `dist/assets/hardware/catalog-remaining-special-oct17/` — two WebPs, 116,302 bytes.
- Full image: 600 × 800. Thumbnail: 240 × 320, 16,492 bytes.
- Original source, full-image and thumbnail SHA-256 recorded.
- Actual final contact-sheet and original close-up review completed.
- Central component-photo validator passes.

## Unresolved identities

| Record | Finding | Evidence needed |
|---|---|---|
| Crucial Pro Overclocking 64GB DDR5-6000 CL36 | Apparent CL36 retail hits identify CP2K32G60C40U5W/B. CCL's actual specification panel and timing table say CL40 / 40-40-40-80 despite its CL36 search title. ASBIS and Newegg also identify the 64GB C40 kit. | A real 64GB 6000 CL36 SKU, or correction to the intended documented kit. |
| T-Create Expert 96GB DDR5-6000 CL34 | Official matrix lists 96GB 6000 CL30 and 96GB 6400 CL32. The 6000 CL34 product is 64GB. Combined family selectors do not establish the requested combination. | Exact manufacturer SKU, or correction to the intended kit. |
| Cooler Master V Gold i Multi 1050 | Official/distributor series records identify V750 and V850. The manufacturer lists MWE Gold V2 1050 and GX Gold 1050 as different series. | Exact V Gold i 1050 model/part number, or correction to the intended PSU. |
| Supermicro 1600W Redundant Power Supply | Official sources identify several matching wattage/redundancy products, including PWS-1K63A-1R, PWS-1K69P-1R, PWS-1K60D-1R and PWS-1K68A-1R, with different electrical and mechanical designs. | PWS part number or matching host system/chassis. |
| Supermicro 4U Workstation Chassis | No exact CSE/SC SKU. Catalog says eight expansion slots; plausible SC745 has seven and SC747 has eleven, despite both offering eight hot-swap drive bays. | Exact chassis part number and configuration, or a documented catalog correction. |

These combinations are unverified; the research does not assert that no such product could ever exist. Per-ID primary source URLs, rejected evidence and access limitations are recorded in `remaining-special-audit.json`.

## Rights and scope

The accepted original owner photograph is attributed to u/Dkrisky79. Copyright remains with its photographer; no open reuse license or permission grant was established. Public album metadata and its ordinary documented embed view were read without an account, token or access-control bypass. Protected pages were not retried. Shared runtime, existing manifests, full builds, Git and deployment were not modified.
