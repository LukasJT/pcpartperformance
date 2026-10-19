# Exact reference CPU photographs — 19 October 2026

## Implemented and verified locally

The new registry contains **18 actual processor photographs**: all 17 newly indexed reference-only CPUs plus the existing Intel 4004. These images do not make workstation/server CPUs available in the consumer builder, change product identifiers, infer vendor-unlock status, or import retailer specifications and prices.

- Nine Intel Xeon E5 v4 models: 1620, 1630, 1650, 1660, 1680, 2620, 2630, 2650 and 2680.
- AMD Ryzen Threadripper 7960X, 7970X and 7980X.
- AMD Ryzen Threadripper PRO 7945WX, 7955WX, 7965WX, 7975WX and 7985WX.
- Intel 4004, photographed as a marked D4004 package.

Actual source pixels were inspected with `view_image`, including larger individual views where markings were faint. The final [Intel review sheet](intel-review.webp) and [AMD review sheet](amd-review.webp) were also inspected. Search-image descriptions alone were not accepted as model evidence.

## Files and integration

- Registry: `scripts/component-photo-total-cpu-oct19.json`.
- Fixed source intake: `data/photo-intake/2026-10-19/total-cpu.json`.
- SHA-256-bound visual review: `data/photo-intake/2026-10-19/total-cpu-review.json`.
- Preparation/validation: `scripts/prepare-total-cpu-photos-oct19.cjs`.
- Tests: `scripts/component-photo-total-cpu-oct19.test.cjs`.
- Delivered images: `dist/assets/hardware/catalog-total-cpu-oct19/`.

The parent already added this registry filename to `component-photo-catalog.cjs`. Validate it against the **full component catalog**, including reference-only records. Image delivery must preserve the exact catalog ID/name binding; never alias nearby models to these photographs.

```powershell
node scripts/prepare-total-cpu-photos-oct19.cjs
node --test scripts/component-photo-total-cpu-oct19.test.cjs scripts/identity-review-oct19.test.cjs
```

`prepare` can recreate the optimized derivatives from the separately downloaded source bytes in `tmp/total-cpu-photos-oct19/`. It refuses a source hash, model label or source URL that differs from the recorded visual review. Default mode validates already delivered files without network requests. The development module is not a runtime or recurring fetcher.

## Evidence and budgets

All 18 exact visible-model bindings pass the existing shared component-photo validator. All **13 scoped regressions pass**: six photo tests plus seven retained-identity tests. Four new/owned JavaScript modules pass scoped ESLint.

The 36 WebP derivatives contain 931,938 bytes of full images and 150,830 bytes of thumbnails. The largest thumbnail is 14,472 bytes. Full images fit within 800 px, thumbnails within 320 px, and neither is enlarged beyond the original. No photo is generated, recolored, cropped, relabeled or substituted.

Intel 4004 keeps its native **300 × 289** source and thumbnail dimensions. It is not presented as a high-resolution photograph.

Full per-file hashes, dimensions, byte counts and rights statuses are in [validation.json](validation.json). Parent-owned browser QA, generated product-page rendering, release and deployment follow this handoff; they are not claimed by this local receipt.

## Rights and attribution

The [Intel 4004 photograph](https://commons.wikimedia.org/wiki/File:Intel_4004.jpg) credits **LucaDetomi**, is published under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), and has an explicit resize/WebP change notice. Local derivatives retain that same license. Product-page delivery must retain the registry attribution and license link. The reviewed source file is the 22,714-byte original, not an upscaled search thumbnail.

The other 17 are publicly published retailer/supplier product photographs. Their creators retain copyright. **No open license, separate permission or commercial redistribution grant has been established for those 17 images.** The registry records this limitation explicitly; a public product gallery is not a reuse license. Do not describe this set as universally licensed or rights-cleared. Any publisher permission process must use the actual credited owner and recorded source, without silently replacing the image with generated artwork.

Five normal local source-page requests returned HTTP 403. Those exact public product galleries were independently inspected through the web research tool, and their downloaded processor markings were checked directly. This is distinguished from direct locally captured HTML in each review record. No challenge bypass, proxy, cookie or login was used. Product-image requests themselves succeeded normally.

## Incorrect candidates rejected

- Puget's E5-1620 v4 part record served an Intel Xeon logo instead of a processor photograph.
- Previously indexed PC Server & Parts E5-1650 v4 and E5-2650 v4 gallery URLs returned 404; current exact supplier galleries replaced them.
- An old ITinStock E5-2630 v4 product-page URL returned 404; a current exact Serverworlds gallery replaced it.
- A Techbuyer E5-2620 v4 page returned an interstitial and the photograph showed too little useful product detail; a current exact supplier gallery replaced it.
- Two HP-specific Serverworlds candidate pages used a generic PSU image despite CPU titles; neither was accepted.
- An Ibertronica 7970X image was a stylized retail render; a real exact-marked processor photograph replaced it.
- An angled 7965WX picture obscured its model marking; the same exact gallery's straight-on photograph replaced it.

## Important source limitations retained

The selected E5-2620 v4 page has a mistaken `V2` HTML title, while its H1, product gallery and visible **E5-2620V4 / SR2R6** marking identify v4. That title and all retailer technical claims are excluded from the hardware catalog.

The E5-1660 v4 image visibly shows its model and 3.20 GHz marking; an unseen S-spec/stepping is not inferred. The 7945WX source is a Lenovo spare gallery, and the 7985WX source describes a Dell-locked unit. These photographs establish model appearance, not vendor-unlock state or motherboard compatibility.

The seven ambiguous inherited identities remain under the separate identity-review quarantine. None receives a near-match photograph or a silently substituted product.
