# api plan

Prepared October 4, 2026. Local release; deployment confirmation is not recorded.

Static public /api/v1/catalog-coverage.json and /api/v1/phones.json are usable fetch endpoints today in the local build. They return snapshots, not prices.

Optional scripts/public-data-api.cjs exposes extensionless GET/HEAD paths, hardcoded datasets, ETag/304 handling, 15-minute file cache, 60/minute per direct address, bounded in-memory client state and nosniff. Unknown routes=404; unsupported methods=405; limit=429 with Retry-After; unavailable file=503. No arbitrary path/URL fetching.

This adapter is tested but not attached to the static Sites host. Production requires a compatible server runtime and proxy-aware trusted-client policy, shared rate limits across instances, access logs with privacy retention rules and monitoring. Static endpoints do not enforce the Node limit. No API key is needed for public nonpersonal snapshots; private data is outside the contract.
