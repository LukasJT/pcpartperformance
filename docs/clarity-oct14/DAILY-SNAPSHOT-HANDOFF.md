# Daily public price snapshot

## Source and export contract

`scripts/public-price-snapshot.mjs` is pure and Worker-compatible. It exports:

- `PUBLIC_SNAPSHOT_TARGETS`: the five fixed Canada Computers mappings and one fixed US Newegg mapping.
- `validatePublicPriceObservation(raw, {now})`: exact identity, retailer scope, currency, variants, price, condition, stock, excluded charges and timestamps. Returns `{valid, issues, observation}`; invalid input never returns a usable observation.
- `validatePublicPriceSnapshot(raw, {now})`: checks the envelope, removes unknown/invalid/expired/duplicate observations, and returns `{valid, envelopeValid, errors, observations, rejected, generatedAt}`. `valid` is false if any row was rejected; an otherwise valid envelope can still retain unrelated valid rows.
- `publicPriceSnapshotPayload(raw, {ids, region, now})`: bounded API payload with validated offers, per-ID states and eligible minima. It does not fetch a retailer. A bad envelope fails closed. CA and US never share currency. Unknown US condition stays outside a verified-new minimum.

The format is `{schema:1, policy:"daily-checked-snapshot", generatedAt, observations, runs, collection}`. Only the observation's original `checkedAt`, `availabilityCheckedAt` and `expiresAt` establish price freshness. `generatedAt` is when the snapshot file was assembled; it must never be relabeled as a successful retailer check.

## Node collection command

`node --use-system-ca scripts/public-price-daily.mjs` requests all six fixed public listings normally, with two concurrent GETs and the existing 10-second/1 MiB bounds. It does not use proxies, cookies, account credentials, CAPTCHA tooling or IP rotation. The imported public readers do not follow redirects. Restrictions are recorded rather than bypassed.

The command writes `data/public-price-snapshot.json` using an exclusive temporary file in the destination directory, file sync, and rename. Invalid data cannot overwrite an existing snapshot. A fetch failure may retain a **still-valid genuine prior observation without altering its check/expiry timestamps**. Stale, future or mismatched prior records are removed. At least one successful new observation is required for a successful CLI exit. `--dry-run` performs the same read-only source checks but does not write the file.

Exports `collectDailyPublicPrices` and `writePublicPriceSnapshotAtomic` allow testing without actual requests. The workflow, build copy, Cloudflare cache and Worker route are owned by the parent integration. Merely adding this command does not activate a daily schedule.

## Actual initial collection, October 14

Normal local Node requests accepted four genuine CA records, with checks between **19:13:47Z and 19:13:51Z**:

| Product | Price | Online stock | Condition |
| --- | --- | --- | --- |
| Ryzen 7 9800X3D | CAD 619.99 | Available | New |
| CORSAIR VENGEANCE CMK32GX5M2B6000C30 | CAD 739.99 | Available | New |
| Samsung 990 PRO MZ-V9P1T0B/AM | CAD 439.99 | Sold out | New |
| MSI RTX 5070 12G VENTUS 3X OC | CAD 1329.99 | Sold out | New |

The B650 TOMAHAWK mapping correctly failed `offer_identity_invalid` because the source lacked the required offer identity/condition evidence. The US Newegg request returned `source_access_restricted` (403) during this run. It was not retried through an alternate identity or proxy. This first snapshot therefore contains four fresh CA observations. The previously documented US observation at 16:53Z remains an independent genuine receipt with unknown condition; it was not falsely refreshed by this failed check.

A previous sandbox-without-network attempt failed before collection and wrote an empty snapshot with `source_network_error`; after ordinary network permission was granted, the successful run above replaced it. Those transport failures are not represented as retailer 403s or successful source checks.

## Tests actually run

`node scripts/public-price-snapshot.test.mjs`: **19 checks passed**, using explicitly synthetic observations and injected request transports. Checks cover exact identity, currency, seller, variants, sources, condition/stock, 24-hour/future/expiry boundaries, duplicate poisoning, source failure retention, preservation of old timestamps, successful replacement and atomic-write failure protection. This is distinct from the actual collection above.
