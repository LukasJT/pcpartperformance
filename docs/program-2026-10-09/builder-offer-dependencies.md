# Offers, recorded history and delivery dependencies

Status: pure policy module implemented and tested on 2026-10-09; no frontend integration, price feed, background job, alert delivery or production activation is claimed here.

## What exists

`scripts/program-offers.cjs` is a bounded UMD module without network, filesystem, storage or delivery side effects. It can be imported with `require` or distributed as `PCP_OFFER_RULES`. It separates a recorded observation from a current eligible offer. Validation checks the supplied assertions; it does not prove a retailer claim true or grant redistribution rights.

Current minimum prices require an exact reviewed product identity and SKU, exact matching offer identity, explicit condition, matching CA/CAD or US/USD, a source record with permitted redistribution, explicit available stock, safe merchant link and a valid nonfuture timestamp. Missing price and stock remain null. Different partner cards, memory capacities, revisions and conditions remain distinct. Prices are numbers; numeric-looking strings and booleans are rejected rather than coerced.

Default and maximum current-price lifetime is 15 minutes. A shorter configured lifetime, explicit expiry or older stock observation can shorten it. Price and stock observations must share the recorded sequence: stock evidence cannot be newer than the price snapshot. A newer unavailable observation supersedes the earlier available one from that merchant; conflicting duplicate observations cannot resurrect an earlier cheap snapshot. No retries, challenge bypass or arbitrary URL fetching occur in this module.

The minimum is among included eligible offers with the same explicit tax/shipping basis, not every retailer or the lowest delivered cost. Default basis excludes tax and shipping. Unknown charge bases are not compared. No USD/CAD conversion occurs. Explicitly included charges can be compared only under a requested matching basis.

History consists solely of preserved observations. Expired records can appear as historical points, with their original availability, exact identity, source and charge basis. It includes observed date boundaries and per-merchant time gaps; it never interpolates a curve, invents a prior price, claims continuous coverage or calls a recorded minimum “lowest ever.” Available observed minima exclude unknown stock and unknown/different charge bases. Plot consumers should use points or visibly break series across gaps, never label these observations a live continuous history.

Saved-build changes use explicitly supplied historical observations, not the build's save date. Owned parts are excluded; repeated quantities are respected. Missing historical/current evidence leaves the complete delta null. A partial known-subset delta stays separate. A user quote is compared only after exact identity, currency, condition and charge-basis confirmation; there is no generated bargain rating.

## API contract

```js
const rules = require('../../scripts/program-offers.cjs');
const product = {
  id: 'exact-reviewed-catalog-id',
  identity: { exact: true, sku: 'MANUFACTURER-PART-NUMBER',
    variant: 'optional-exact-variant', memoryVariant: 'optional-capacity',
    revision: 'optional-hardware-revision' }
};
const observation = {
  productId: product.id, sku: product.identity.sku,
  variant: product.identity.variant, memoryVariant: product.identity.memoryVariant,
  revision: product.identity.revision, exactVariant: true,
  merchantId: 'stable-retailer-id', merchant: 'Retailer name',
  url: 'https://retailer.example/exact-product',
  region: 'CA', currency: 'CAD', condition: 'new', price: 500,
  inStock: true, checkedAt: '2026-10-09T11:59:00Z',
  charges: { tax: 'excluded', shipping: 'excluded' },
  source: { kind: 'verified-manual', publisher: 'Retailer name',
    url: 'https://retailer.example/exact-product', recordId: 'preserved-record-id',
    redistributionAllowed: true }
};
const policy = { product, region: 'CA', now: Date.parse('2026-10-09T12:00:00Z') };
rules.normalizeOffer(observation, policy); // { offer, issues }
rules.currentOffers([observation], policy); // eligible offers, exclusions, coverage, minimum
rules.priceHistory([observation], policy); // only preserved points and gaps
rules.fairDealComparison({ quote: observation, records: [observation], ...policy });
rules.retainedBuildChanges({
  items: [{ productId: product.id, quantity: 1, owned: false }],
  products: [product], savedOffers: [], currentRecords: [observation],
  region: 'CA', now: policy.now
}); // no historical snapshot means no complete price-change claim
```

Supported source kinds: `verified-manual`, `authorized-retailer-api`, `authorized-retailer-feed`. These names represent verified prerequisites supplied by an adapter, not a claim that any retailer integration exists. Maximum input: 5,000 observations and 100 selected item groups; excess throws explicitly. URLs are sanitized for display, but service adapters still require approved hostname/redirect rules and private-network protection if they fetch anything.

## Confirmed repository limits

Inspection found `dist/prices.json` with ten records checked on 2026-09-16, limited to Memory Express and Newegg. They lack explicit stock state, condition, charge basis, permitted source records and reviewed exact-variant flags. Some generic GPU IDs point to different partner card SKUs. These historical inputs are not promoted into current eligible prices by this module. They are not asserted to be a complete, permitted historical dataset either.

The program has local saved-build revisions and a local manual quote worksheet. Local saves are not cross-device accounts, server watchlists, scheduled refreshes or notifications. No authorized maintained retailer feed, persisted observation database or verified polling schedule was provided to this workstream. A retailer search link does not establish inventory or a price.

## Activation gates

| Capability | Dependency | Current state |
| --- | --- | --- |
| Current retailer offers | Authorized exact-item source, adapter, credentials where needed, verified stock and charge basis, approved request limits, deployment and failure monitoring | Blocked; policy code can consume supplied records |
| Maintained observation history | Permitted record retention, actual observation store, deduplication, importer and tested schedule | Blocked; no synthetic chart generated |
| Cross-device watchlists | Real identity/permissions and private persistence or a deliberately unlisted design, revocation and access tests | Not activated; local revisions remain browser-local |
| Price alerts | Real consent with proof, delivery service, unsubscribe/suppression, deduplication, bounded rate limits, expiry recheck, tested background jobs | Blocked; no email collection form |
| Newsletter | Truthful purpose and consent, configured sender, unsubscribe and suppression, tested delivery | Blocked; drafts may be prepared without sending |
| Public delivery/feed activation | Owner authorization and tested staging release with rollback | Not authorized by the current program request |

Before activation, verify exact-SKU mapping with a small sample; test expiration and source outages; preserve last observations as historical evidence without presenting them as current; show missing prices; monitor request/error budgets; and recheck every alert immediately before delivery. Keep credentials and personal recipient data out of frontend bundles, shared URLs, public caches and analytics. Follow retailer agreements and source rights; this module provides no legal authorization or Cloudflare circumvention.

## Actual verification

Run `node scripts/check-program-offers.cjs` for null preservation, exact variants, region/currency, stock uncertainty, expiry, superseded observations, conflicting duplicates, charge basis, real-only historical points/gaps, partial saved-build totals, bounds and UMD loading. The fixture merchant/product URLs in tests and this API example are intentional synthetic test inputs, never public price data.
