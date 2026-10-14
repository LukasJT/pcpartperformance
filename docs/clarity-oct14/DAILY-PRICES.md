# Daily price observations

The site uses a bounded daily collection, not a checkout-time guarantee or an all-store lowest-price search.

## Data path

1. `.github/workflows/daily-public-prices.yml` runs from the repository's default `main` branch at 07:17 America/Toronto, or by manual dispatch. GitHub may delay a scheduled start.
2. It checks out the existing `codex/stage2-publication-2026-10-04` deployment branch. The pure parser and snapshot tests must pass.
3. `scripts/public-price-daily.mjs` makes ordinary public GET requests to six pinned listings, at most two at a time. It does not follow redirects or use accounts, cookies, proxies, or challenge workarounds.
4. Successful observations retain exact variant, merchant, seller, currency, stock evidence and actual check time. Failed refreshes retain an existing observation only until its original expiration; no check time is advanced.
5. Only `data/public-price-snapshot.json` is committed. A non-fast-forward push fails rather than overwriting another release. The existing Cloudflare Git build publishes the data with the site.
6. The Worker reads the bounded JSON from its own asset binding. It caches the asset for 15 minutes and validates every observation on every response. It makes no retailer requests in production. Records expire within 24 hours; unavailable/unknown stock or condition cannot enter the verified new-purchase subtotal.

## Current scope

- Canada Computers: Ryzen 7 9800X3D; exact MAG B650 TOMAHAWK WIFI; Corsair CMK32GX5M2B6000C30; Samsung MZ-V9P1T0B/AM; MSI G5070-12V3C.
- Newegg US: exact Ryzen 7 9800X3D listing N82E16819113877. Unknown condition stays outside a verified-new minimum.
- Other components and retailers remain unconnected. Accessible search links do not establish a price or stock.

Actual initial normal Node collection on October 14 returned four Canadian observations: two available/new and two sold out. The motherboard lacked sufficient exact offer evidence; Newegg rejected that request. No access restriction was bypassed. Production Cloudflare requests were rejected, so on-demand collection there was removed.

## Operation and recovery

Run `node --use-system-ca scripts/public-price-daily.mjs --dry-run` to inspect without changing data. Run without `--dry-run` to atomically write the supported observations. Automated collection requires a successful verified GitHub run and a successful existing Cloudflare build; prepared code alone is not proof that either is active.

If all requests fail, expired records are removed and the workflow reports failure after publishing the safe data state. No price is invented. A missing or oversized deployed snapshot returns a service-unavailable response; an expired observation is unavailable. Partial subtotals remain partial and exclude tax/shipping.

Disable the GitHub workflow to stop collection. Removing the Worker snapshot reader requires reverting the coordinated release, not reverting only the JSON. Preserve source timestamps in any rollback. A scheduled workflow in a public repository can be disabled after 60 days of repository inactivity; inspect Actions before claiming continued daily operation.

Official scheduling and authentication references checked October 14:

- [GitHub schedule/default-branch/timezone rules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [Workflow token permissions](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
- [Workflow triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)

Deployment/run receipts are recorded separately after execution. The collector does not guarantee coverage, uninterrupted access, or current checkout prices.
