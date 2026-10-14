# Public price source implementation — October 14

## Working code and actual observation

`scripts/oct14-price-sources.mjs` exposes a bounded Canada Computers public product JSON-LD reader and five exact catalog mappings. `node --use-system-ca scripts/oct14-price-sources-stage.mjs` performs read-only requests and writes the timestamped research result to `public-price-observations.json`. It does not edit the production offer database, enable a cron, purchase anything or claim deployment.

The actual first stage run checked five mappings and accepted four observations at **2026-10-14T16:35:43.645Z**:

| Exact catalog product | Manufacturer / listing identity | Item price | Availability evidence |
| --- | --- | --- | --- |
| Ryzen 7 9800X3D | 100-100001084WOF | CAD 619.99 | Structured offer InStock |
| CORSAIR VENGEANCE 32 GB | CMK32GX5M2B6000C30 | CAD 739.99 | Structured offer InStock |
| Samsung 990 PRO 1 TB | MZ-V9P1T0B/AM | CAD 439.99 | Structured offer SoldOut |
| MSI RTX 5070 VENTUS 3X OC | G5070-12V3C / retailer MPN RTX 5070 12G VENTUS 3X OC / VCMSI00484 | CAD 1329.99 | Structured offer SoldOut |

These are observations, not current guarantees. Their 24-hour validity expires automatically. Sold-out and unknown-stock records never count in a purchasable subtotal. Store pickup inventory is not inferred from the online offer.

The B650 TOMAHAWK source was reachable and its exact MPN matched, but its embedded offer had an empty URL and no NewCondition. It was correctly rejected as `offer_identity_invalid`, not silently converted into a new in-stock offer. The exact MSI manufacturer stock code differs from the retailer's longer product MPN; both are explicitly pinned instead of fuzzy matching a Ti or other partner edition.

## Factory integration

Exports: `PUBLIC_PRICE_TARGETS`, `PUBLIC_PRICE_POLICY`, `validatePublicTarget`, `parseProductJSONLD`, `parseCanadaComputers`, `fetchPublicTarget`, `createPublicPriceCollector`.

```js
const collector = createPublicPriceCollector();
const payload = await collector.collect(['9800x3d', '990pro'], { region: 'CA' });
```

The payload provides exact item name, price, CAD currency, merchant link, true/false/null stock, checked/expiry times, region and excluded charges. `lowestByProduct` means the included eligible listing; this is **one merchant**, not a claim to find the entire market's cheapest price.

The factory has a 15-minute per-isolate read cache, duplicate-request coalescing, five-minute failure cache, two concurrent requests, a 1 MiB response cap and 10-second timeout. Requests are GET-only, use a descriptive user agent and reject redirects, private URLs, arbitrary URL input, marketplace sellers, wrong currency, open-box condition, mismatched MPN/SKU and ambiguous structured records. No retry follows an access restriction. Parent integration can layer the existing Cloudflare Cache API and a scheduled daily refresh over these exports; per-isolate memory alone is not a globally unique daily job. A schedule is not active merely because this collector exists.

US requests through the Canada Computers factory are explicitly not covered. The separate US reader below retains its own region and uncertainty. Do not convert CAD to USD. Endpoint integration should accept only bounded existing IDs/region and return noindex JSON; no public API caller may submit an arbitrary source URL.

### Separate genuine US observation

`scripts/oct14-price-sources-newegg.mjs` exports `NEWEGG_PUBLIC_TARGET`, `parseNeweggOriginalState` and `fetchNeweggPublicTarget`. It reads one pinned US first-party 9800X3D listing's original embedded product JSON without evaluating scripts. It checks the exact manufacturer model, original retailer item `19-113-877`, retailer ID `N82E16819113877`, country USA, explicit first-party seller marker, unrestricted visible price and boolean/unknown online stock. [Newegg's current policy](https://kb.newegg.com/knowledge-base/policy-agreement) says pricing follows the selected country currency; the original product state's USA scope supplies the regional evidence. A conflicting currency field is rejected.

The actual `node --use-system-ca scripts/oct14-price-sources-stage.mjs --us-only` run obtained **USD 444.00**, `inStock:true`, at **2026-10-14T16:53:23.143Z**. The original source omitted a new/used condition field and contained no explicit NewCondition marker. Therefore the reader truthfully returns **`condition:"unknown"`**, **`eligibleForNewPurchaseMinimum:false`**, and `condition_requires_verification`; it does not quietly make a verified-new build subtotal. The real US observation is in `public-price-observations-us.json`. A documented explicit New condition is supported if the source later provides it; a synthetic fixture is not evidence it did so today.

The US Samsung 990 PRO URL selected marketplace seller MobileMonster with item `9SIC0X3KK06706`, despite the same Samsung MPN. That observation is rejected for the intended first-party scope. This guards against a subtle seller replacement on a familiar product URL.

The Newegg reader shares the same 1 MiB/10-second/GET/no-redirect bounds and has no retry after 403/429. Parent integration supplies Cache API, coalescing and schedule controls; this standalone fetch export does not itself assert a globally unique daily run. The [public robots file](https://www.newegg.com/robots.txt) permits ordinary product routes while disallowing private/cart and several API endpoints. Those disallowed endpoints were not accessed. Provider terms remain recorded, not transformed into a fabricated commercial licence.

## Source policies and further coverage

Canada Computers' current [robots file](https://www.canadacomputers.com/robots.txt) permits the selected public product paths. Its [terms](https://www.canadacomputers.com/en/content/15/terms-conditions) state CAD prices exclude tax/shipping and may change; they also contain an expressed-permission requirement for external links. Robots permission is not a redistribution licence. The owner previously explicitly instructed public copying and stated confirmation was obtained. This implementation records that owner instruction separately from retailer-issued rights and does not fabricate a provider licence, partnership or approval document. Keep provider activation under its actual source policy.

Memory Express normal requests produced **both 403 and 200** during bounded investigation; the 200 HTML exposed an exact MZ-V9P1T0B/AM listing and a CAD-style item total but no Product JSON-LD. No CAPTCHA, login, proxy, changing browser identity, cart submission or challenge bypass was used. It is not included in the collector because this batch does not establish stable structured currency/stock evidence.

NZXT's documented Shopify `/products/player-one.js` endpoint returned a real PB1-1BAS102-BL variant, integer price and availability. However [Shopify's documentation](https://shopify.dev/docs/api/ajax/reference/product) says monetary values use the customer's presentment currency. The product JSON itself omitted currency; normal HTML redirected this request to the international store. The localized US product attempt also redirected. No USD/CAD assumption, blocked cart endpoint call or geolocation bypass was used. Therefore no NZXT price is presented as a verified regional offer yet. Use an unambiguous official regional currency source before activating that adapter.

## Tests run

`node scripts/oct14-price-sources.test.mjs`: 24 checks passed, using explicitly synthetic fixtures for failure, cache, identity and currency behavior. The stage run above is a separate real-source observation. These tests do not establish retailer permission, all-product coverage or a deployed daily schedule.

`node scripts/oct14-price-sources-newegg.test.mjs`: 10 checks passed for US identity, marketplace substitution, country/currency, unknown condition/stock, restricted-price behavior, non-executable JSON and GET/no-redirect behavior. The actual US unknown condition remains ineligible; no test changes that recorded fact.
