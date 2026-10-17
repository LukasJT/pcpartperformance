# Remaining CPU exact photograph increment — 17 October 2026

## Reviewed result

The registry `scripts/component-photo-remaining-cpu-oct17.json` adds **61 exact CPU photographs** from the 96 CPU IDs that lacked correct photos at this pass's start. It contains 122 local WebP files in `dist/assets/hardware/catalog-remaining-cpu-oct17/`: full images within 800 × 800 and thumbnails within 320 × 320, each thumbnail under 40,000 bytes.

All 61 accepted photographs were visually inspected in their source contact sheets and again in the six `remaining-cpu-final-contact-*.png` sheets. `remaining-cpu-validation.json` reports zero errors for full-image hashes, thumbnail hashes, raw source-byte hashes, image decoding, dimensions, recorded sizes and catalog identity. The registry and assets are stable for integration. Shared loaders, source specifications, older registries, build output outside this asset directory, Git and deployment were not modified by this pass.

Sources are 31 original publisher review photographs, 16 retailer product photographs, 11 museum collection photographs, and three Wikimedia Commons photographs with explicit CC licenses. Public availability is not represented as an open license: all publisher, retailer and museum media record the absence of an established reuse license. Existing photographer credits and watermarks are preserved. The Commons credits are Santeri Viinamäki (CC BY 3.0) and Thomas Nguyen (CC BY-SA 4.0).

Every registry entry records its exact source page, actual downloaded image URL, original/provider URL where distinct, raw downloaded source hash, derived full and thumbnail hashes, visible identity evidence and review flags. For the three Commons files, the actual downloaded provider previews are the hashed source, with the full-resolution original separately identified. Images were only proportionally resized and encoded as WebP; labels, components, colors, watermarks and framing were not edited.

## Research scope and exclusions

`remaining-cpu-audit.json` documents attempts for all 96 IDs and visual decisions for 141 candidate pictures. Each ID received fresh public Bytestock and TechPowerUp review searches, followed by applicable retailer, historical museum, alternate review-index, publisher or exact-file Commons research. Research helpers and page/image request records are retained under this document prefix and in `tmp/remaining-cpu-oct17/` for reproducibility.

Exact suffixes, capacities and historical variants were preserved. Rejected examples include Intel Confidential engineering samples; i9-12XXX/i3-13XXX placeholders; unlabelled stock chips; Core family logos; a K5 PR100ABQ in place of PR100ABR; K6-233ANR in place of ALR; and K6-2/300AFR-66 in place of plain AFR. The Pentium 4 photograph is the Socket 423 SL4SH, and the Celeron 266's actual 266/66 SL2SY label is visible. A photo of the opposite unlabelled side was not used as identity evidence.

Transport blocks are separate from missing media. Actual HTTP 403 responses were observed at CPU-World, Micro Center, PCNation's media host, ReparacaoMobile, ShopAbunda, TechSpot and eBay. CIT Store returned an actual HTTP 429; no retry followed. Later requests skipped due to a previous host block are marked `notRequested: true` with a null HTTP status in the audit. AnandTech returned a public browser challenge despite HTTP 200; it was not bypassed. Evergreen product pages successfully loaded but their images were family logos; Star Micro galleries successfully loaded but showed generic family media or XX model placeholders. These successful pages do not establish an exact usable photograph.

## Unresolved in this increment

The remaining **35 IDs** have been handed to the parent's parallel CPU researchers. Their unresolved status means that this increment did not find a verifiable exact photo; it does not establish that no photograph exists.

```
3950x, 5700x3d, 3800x, i711700k, 5500, 3200g, 2990wx,
i911900, i511600, i510600, i79700, i59600k, i77700, i56600k,
4700g, 4600g, 4500, 4100, 5995wx, 3970x, 1700x, fx9590, fx6300,
i914900, i714700, i514600, i514400f, i313100f, i912900, i712700,
i910980xe, i76950x, phenom9500, phenomii965, c-cpu-amd-epyc-9734
```

The catalog names and source specifications were retained even when a supplier heading contained a clock typo or a source gallery pictured another revision. No model was renamed to make a photograph fit.
