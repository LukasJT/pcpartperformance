# Morning price service: source access and integration

Prepared 2026-10-11. Source implementation is ready for review; live collection is **not configured**. No retailer account, source permission, exact production target, D1 database, secret or schedule was confirmed. `data/morning-price-targets.json` therefore contains empty source and target lists. Synthetic tests do not confer approval. No deployment or migration was performed.

## API and Worker integration

Import before the existing asset route policy; API responses own their status and headers:

```js
import { handleMorningPriceRequest, scheduledMorningPrices } from './morning-price-service.mjs';

// At the start of the existing fetch handler:
const morning = await handleMorningPriceRequest(request, env);
if (morning) return morning;

// Additional Worker handler; no cron is configured by this change:
scheduled(controller, env, ctx) {
  ctx.waitUntil(scheduledMorningPrices(controller, env));
}
```

The endpoints are `GET /api/v1/morning-prices?ids=MODEL_ID,MODEL_ID&region=CA|US` and `GET /api/v1/morning-prices/status`. HEAD is supported. IDs allow 1–120 ASCII letters, numbers, underscores and hyphens, with at most 50 requested IDs. Region defaults to CA. Repeated/unknown parameters, invalid regions and arbitrary URLs return 400; mutations return 405. Missing configuration returns JSON with `status: "not_configured"` and empty offers. Complete configuration with a missing/false enable flag returns `status: "disabled"` and empty offers. An unavailable datastore returns 503 with `not_configured`. A configured US source does not supply Canadian offers.

Responses identify the `daily-checked-snapshot` policy, region, currency, exact variant, seller, checked time, expiry, source and excluded tax/shipping. `lowestByProduct` includes only unexpired new offers with a positive item price and confirmed online availability, among checked stores. Unknown/out-of-stock/stale observations remain ineligible. `availabilityBasis` states that online purchase availability does not establish store inventory; UI should say **Available online**, rather than promise local stock. Failure does not advance `lastSuccessfulAt`. Daily snapshots never extend the existing 15-minute current-offer policy.

Before any approved activation, bind an explicitly selected D1 database as `MORNING_PRICES_DB` and apply `migrations/0001_morning_prices.sql` to that database. Set the private `BESTBUY_API_KEY` secret and the exact string `MORNING_PRICES_ENABLED=true` only after access and frontend attribution review. Do not commit keys, add them to generated assets or log upstream URLs. The module exposes no collector mutation endpoint.

## Source review contract

The only implemented adapter is `bestbuy-us-products`, pinned to `https://api.bestbuy.com/v1/products`. Official documentation provides seven-digit SKU/model, price, condition, online availability and update fields, plus SKU-list queries. Returned Best Buy product-detail links are preserved; only exact-SKU BestBuy.com links or the documented API `/click/.../SKU/pdp` links are accepted. The server never follows those links during collection. This is US coverage, with no Canadian adapter inferred. [Official API documentation](https://bestbuyapis.github.io/api-documentation/)

Each reviewed source needs `id`, `adapter`, `region: US`, `currency: USD`, `merchantId: bestbuy-us`, `publisher: Best Buy`, `seller: Best Buy`, `snapshotTtlHours` (1–24), and a human `review` containing `status: approved`, `kind: human`, `reviewer`, ISO `checkedAt` and private `authorizationRef`. Its `permission` must confirm `apiAccess`, `display`, `temporaryStorage`, `firstPartyOnlyConfirmed`, and integer `retentionHours` (48–8760). The review must cover this site's intended display/storage purpose and seller scope, not just possession of a key.

**D1 access blocker:** Time Travel backups are always on and retain restorable versions for 7 days on Free or 30 days on Paid. Deleting a price row does not erase these copies. Consequently ordinary 72-hour permission alone cannot activate this D1 design. Require `permission.datastoreBackupStorageConfirmed: true` plus private `datastoreBackupAuthorizationRef`, backed by specific reviewed permission covering backup copies and the actual account's recovery window (conservatively 30 days after row deletion). With 48-hour table retention, that can retain a copy roughly 32 days after checking. These are distinct from permission for publicly readable extended history. No such permission is confirmed. [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)

An approved `brandLogoUrl` and private `brandAssetAuthorization` reference are mandatory. Allowed assets are exactly `https://developer.bestbuy.com/images/bestbuy-logo.png` or a reviewed repository file matching `/assets/retailers/NAME.png|svg|webp`. Other hosts, paths, queries and embedded images reject the source. Offers expose only `source.logoUrl`; the frontend must show it beside attribution and the provided product link. Repository asset existence and authorization must be verified in the source review.

Each target needs the same human review, an existing `sourceId`, catalog `productId`, exact seven-digit `retailerSku`, exact `modelNumber`, `name`, Best Buy `listingUrl`, `exactVariant: true`, US/USD, `condition: new`, `seller: Best Buy`, and explicit `variant`, `memoryVariant`, `revision` strings or null. Adjacent capacities, partner cards and revisions need their own confirmed identities. Unknown condition, conflicting SKU/model/seller/currency, restricted price, malformed stock or future/malformed timestamps reject the observation. Missing stock remains unknown.

Current ordinary Best Buy terms require account credentials to stay private, clear attribution, unaltered provided links, the approved logo where API data appears, and temporary storage for at most 72 hours. That limit does **not** establish indefinite history rights or approval of this site's intended use. Any greater retention requires `extendedHistory: true` and a separate `extendedHistoryAuthorizationRef` backed by reviewed permission. [Best Buy terms and branding policy](https://developer.bestbuy.com/legal)

Canada Computers, Memory Express, Vuugo, Best Buy Canada, Newegg Canada/US, Amazon Canada/US and PCPartPicker are explicitly unconfigured. There are no scraper, login, CAPTCHA, access-control bypass or invented-source fallbacks.

## Runs, retention and cost bounds

After account and release approval, the candidate cron times are UTC 11:00 and 12:00 daily. The collector checks the actual and scheduled Toronto-local date/hour and runs only at local hour 07, covering DST. **Neither schedule is activated here.** Successful date/source runs are idempotent. An atomic D1 lease admits one runner, expires after five minutes and fences observation/health writes. Partial failures may retry after source backoff; at most three leases are admitted for a date/source. Responses cache for at most 15 minutes per isolate, deduplicate in-flight reads and stop caching at snapshot or retention expiry.

Provider content in active tables is retained for `retentionHours − 24`, leaving one day of cleanup headroom. With reviewed 72-hour table permission, the readable history limit is 48 hours. Snapshot validity is still at most 24 hours. Scheduled cleanup runs before the feature/access gates, including the otherwise skipped DST candidate. Once real content exists, keep cleanup scheduled when collection is disabled, monitor failures and remove content before revoking the database or schedule. A prolonged scheduler outage requires operator cleanup; no D1 automatic TTL is assumed. Backup copies require the separate permission above. Run/health metadata contains no provider price payload.

There is one supported source, at most 100 exact targets and batches of 25. Each batch has an 8-second timeout, at most one transient retry, a 512 KiB response cap and no redirects. One successful daily check uses at most four provider requests; retrying every batch uses eight. Three failed/recovery run attempts bound the initial design to 24 requests per date/source. No account-specific quota, paid tier or cloud cost was confirmed; review those before activation. Public GET requests read the datastore and never call a retailer.

## Local validation

Run `node scripts/check-morning-prices.mjs` for 22 behavior checks. It uses a D1-compatible test double executing the real migration/queries in local SQLite, plus clearly labeled synthetic provider fixtures. It checks leases, reruns, fencing, transaction rollback, approved logos, failures, bounds, DST, API/cache isolation and retention. D1's documented batch transaction rollback underpins the write contract. [Cloudflare D1 batch documentation](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) This is not a live retailer or Cloudflare deployment test.

Run `node scripts/check-morning-prices.mjs --dry-run` to inspect the empty production registry without network, secrets, writes or activation.
