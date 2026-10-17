# Exact public price coverage: October 16, 2026

## Implemented and actually fetched

`scripts/completion-price-expansion.mjs` exports six fixed targets for existing catalog products, a strict public CORSAIR JSON-LD adapter, and a dispatcher. Shared snapshot, collector, service, frontend, and history integration is now implemented. The parent owns the final build, browser QA, workflow test-runner additions, and deployment; none of those were claimed as completed by this subtask.

The normal Node collector completed six HTTP 200 product reads without cookies, login, proxies, redirect following, or access-control bypass. These are observations made at **2026-10-17 01:44 UTC / October 16 at 9:44 p.m. Toronto**, not current search-result snippets.

| Existing product | Exact manufacturer code | Region / merchant | Observed price | Online stock |
| --- | --- | --- | --- | --- |
| `ddr4` | CMK32GX4M2E3200C16 | CA / Canada Computers | CAD 359.99 | In stock |
| `ddr4` | CMK32GX4M2E3200C16 | CA / CORSAIR | CAD 359.99 | In stock |
| `ddr4` | CMK32GX4M2E3200C16 | US / CORSAIR | USD 259.99 | In stock |
| `5600` | 100-100000927BOX | CA / Canada Computers | CAD 279.00 | Sold out |
| `5500` | 100-100000457BOX | CA / Canada Computers | CAD 124.99 | Sold out |
| `retail-samsung-990-evo-plus-1-tb` | MZ-V9S1T0B/AM | CA / Canada Computers | CAD 394.99 | Sold out |

Every accepted source explicitly identifies the exact SKU/MPN, regional currency, offer URL, seller, new condition, price, and availability. A sold-out price remains a historical/current listing observation; it is not an available purchase option. Tax and shipping are excluded. Observations expire after at most 24 hours, sooner if the source offer expires. Prices may change before checkout.

`data/completion-price-expansion-observations.json` contains the real observations and source timestamps. It is a research handoff, not the production asset. Six selected original factual Product/Offer fragments, response sizes, source URLs, collection times, and HTML SHA-256 hashes are persisted under `scripts/fixtures/completion-price-expansion/`. Marketing prose and full retailer pages are not copied into fixtures.

## Integration API

```js
import {
  COMPLETION_PRICE_TARGETS,
  validateCompletionPriceTarget,
  parseCorsairProductJSONLD,
  fetchCorsairPublicTarget,
  fetchCompletionPriceTarget
} from './completion-price-expansion.mjs';
```

The target array contains four Canada Computers listings and the same exact RAM kit at two independently checked CORSAIR country stores. Canadian CORSAIR was discovered through the official US page's reciprocal `en-ca` link; the adapter requires explicit CAD and never converts USD.

CORSAIR contract: adapter `corsair-product-jsonld`; merchant ID `corsair`; display merchant/seller `CORSAIR`; original JSON-LD seller must be the literal `Corsair`; source kind `public-manufacturer-structured-data`; publisher `CORSAIR`. The observation shape matches the existing public pricing records. Target validation pins all identity fields and the complete fixed URL before networking. Only the new adapter accepts its own fixed registered targets.

Completed shared integration:

1. The snapshot registry includes all six existing targets plus these six new exact listings. `public-price-fetch.mjs` pins and dispatches all three adapters, with one 15-minute cache and in-flight request per exact merchant listing. The daily collector uses that same dispatcher.
2. Source kind, condition acceptance, and availability basis are validated by adapter. US no longer means Newegg, and CA no longer means Canada Computers. Unknown condition is accepted only as a nonpurchasable Newegg observation.
3. Frontend and historical validation recognize CORSAIR explicitly. The browser stores all matching merchants once per product rather than overwriting an earlier merchant. CAD and USD remain independently sourced.
4. Shared snapshot and on-demand service use a real finite-price minimum reducer. Two CA DDR4 merchants survive both server and browser caches in either order. A failed merchant refresh can retain only its original, still-fresh dated record; an explicit new sold-out record replaces the older available one.
5. The ordinary non-dry daily command ran once at **2026-10-17 01:51 UTC**: **12 requested, 10 refreshed, 0 retained, 2 failed**. It atomically wrote `data/public-price-snapshot.json` and appended original observations to `data/public-price-history.json` (26 records after this run). Both files validated. B650 failed `offer_identity_invalid`; US Newegg 9800X3D failed `source_access_restricted`. No failed record acquired a new source-check date.
6. The price-history generator now handles a styled `buy-note` selector and a stable buying-section fallback, avoids duplicate controls, and fails visibly if there is nowhere to put a required history section. Core data remains usable without charts.

The 01:51 collection also refreshed existing CA observations: 9800X3D CAD 619.99 available; 990 PRO 1 TB CAD 439.99 **available in this new check**; DDR5 CMK32GX5M2B6000C30 CAD 769.99 available; MSI RTX 5070 VENTUS 3X CAD 1329.99 sold out. Previous dates or stock states were not carried forward as new evidence.

Parent release steps: add `node --test scripts/completion-price-expansion.test.mjs scripts/public-price-expansion-integration.test.mjs` to the existing check/workflow runner, perform the final ordinary site build, visually check the two-store CA RAM and separate US offer, and verify the deployed API/history. No second daily collector or source-account requirement was introduced.

Read-only research capture can be repeated manually with:

```text
node --use-system-ca scripts/completion-price-expansion-capture.mjs
```

That command writes only the separate research observations and factual fixtures. It is not installed as another scheduled job and does not publish anything. The existing scheduled public-price path should remain the single production refresh system.

## Budget build publication gate remains closed

This bounded source cohort does **not** establish a complete, available, compatible new-purchase PC around CAD 1,000/1,500 or USD 1,000/1,500. It is not evidence that such a PC cannot exist. It means those claims are unsupported by this exact checked basket today.

For a prospective AM4 basket, the checked boxed Ryzen 5500 and 5600 are sold out online. Exact Q300L case and Pure Power 12 M 850W BN505 listings were also sold out. A live-priced MSI B550M PRO-VDH WIFI, ASUS DUAL RTX 5060 OC, and Kingston NV3 1 TB exist, but are not exact records in the current catalog and are candidates only. The board's exact BIOS support, selected case geometry and included cooling, PSU regional package/cables, and complete purchase costs still require a cohesive reviewed build. A basic platform match is not proof of all compatibility.

The USD cohort supplies one verified available RAM purchase. The Samsung US 990 EVO Plus 1 TB page explicitly reports new condition and USD but is out of stock and has no named seller in its JSON-LD. It is not added to the live adapter. There is no complete verified USD basket in this research.

Do not publish a complete-cost total, budget recommendation, or “cheapest everywhere” label from these partial observations. Keep a case, PSU, storage device, CPU, board, RAM, GPU or explicitly supported integrated graphics, and any required separate cooler in the required-purchase inventory. Explain OS, monitor, peripherals, tax, and shipping scope. Unknown prices are not zero.

AMD's current official support/specification pages confirm that the boxed `100-100000457BOX` and `100-100000927BOX` packages use the Wraith Stealth thermal solution. This supports an included-cooler record for those exact boxed listings, not tray CPUs or other boxed models:

- [Ryzen 5 5500 specifications](https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5500.html)
- [Ryzen 5 5600 specifications](https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html)

## Additional candidates and actual blockers

The probe records retain the exact product URL and factual structured fields for every successful candidate, and the actual outcome for failed reads:

- `completion-price-expansion-probes.json`: seven Canada Computers product pages, Best Buy public robots/product attempts, and two Newegg attempts.
- `completion-price-expansion-additional-probes.json`: four more Canada Computers products, CORSAIR and Samsung public robots and exact product pages.

Candidates in `data/completion-price-expansion-candidates.json` are **not** live targets and have not been attached to a generic or different existing item. In particular, an ASUS partner RTX 5060 is not the generic NVIDIA card, a B550M PRO-VDH WIFI is not a B550M MORTAR, 1 TB NV3 is not the catalog's 2 TB NV3, and a Q300L is not a Q300L V2. BN505 is an exact regional PSU package; it should not silently inherit another regional cable package's evidence.

Observed failures are specific rather than universal account requirements:

- Canada Computers Ryzen 7600: HTTP 200, correct MPN, but `offers.url` is empty and explicit item condition is absent; strict adapter rejected offer identity. Displayed CAD 298.88 / SoldOut was not accepted as a production offer.
- Best Buy Canada exact DDR4 listing: HTTP 403 on a normal read. No retry with disguised identity or alternate private API.
- Best Buy US Ryzen 5600 and RM650x pages: normal requests timed out at 15 seconds. Web research also returned the country-selection page for the PSU. No reliable product offer captured.
- Newegg US Ryzen 5600: HTTP 200 but familiar first-party URL selected item `9SIC6E1M4H6072`, seller `Infinite Energypmax Co., Limited`, not pinned first-party item `19-113-736`. Rejected rather than relabeled as Newegg inventory.
- Newegg US RM650x: HTTP 403. No bypass attempted.
- Older public snippets materially differed from current reads (for example ASUS RTX 5060 snippet CAD 519.99 versus actual CAD 669.99). Search snippets are discovery leads, not live pricing.
- No complete new supported Memory Express, Vuugo, or Amazon adapter was established in this bounded expansion. Existing direct-access and variant-matching limitations remain; this is not a claim that every public page needs an account.

## Tests actually run

`node --test scripts/completion-price-expansion.test.mjs` — **28 passed, 0 failed**. `public-price-expansion-integration.test.mjs` adds **10 passing integration checks** for shared registry, two-store minima and caching, US condition, historical preservation, coalesced transports, browser aggregation, and history placement.

After the actual collection, all ten applicable test files passed together: the two original adapters, expansion adapter, snapshot, service, assets, public-price client, historical server/client, and expansion integration. The Node test runner reported 46 passing top-level cases/file wrappers and no failures; existing standalone suites additionally print their internal check counts. These are repository tests, not a claim of completed browser QA or deployment.

Coverage includes six actual source fragments; separate USD/CAD prices; SKU/MPN/merchant/condition/currency/URL checks; duplicate Product ambiguity; malformed/expired prices; sold-out and unknown availability; refused arbitrary URLs; bounded response size; fixed GET with no auth/cookies; HTTP 403 without retry; and redirects not followed. These tests do not claim that stock is reserved or that a full build has been priced.
