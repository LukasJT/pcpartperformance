# Durable offer sources and build integration

Prepared October 9, 2026. The two canonical source files are empty. No source permission, retailer integration, real price record, collector, alert job, purchase, or production deployment was created by this change.

## Files and ownership

| File | Role | Rewritten by preparation? |
| --- | --- | --- |
| `data/program-offer-identities.json` | Owner-maintained exact catalog identities, evidence and approval records | No |
| `data/program-offer-observations.json` | Owner-maintained source authorizations and observed price/stock records | No |
| `scripts/prepare-program-offers.cjs` | Bounded validation, public preparation and local CLI | No |
| `scripts/program-offers.cjs` | Existing common normalization, expiry, regional comparison and history rules | No |
| `dist/data/offer-identities.json` | Generated public identities with private review records omitted | Yes |
| `dist/data/offer-observations.json` | Generated recorded observations and actual coverage, including expired history | Yes |
| `dist/data/offer-current.json` | Generated subset eligible when prepared, with original observation times | Yes |

Do not enter data directly into the three generated copies. A rebuild can replace those copies. Commit or back up the canonical sources before changing them. Generated dates describe preparation time; they do not extend price freshness or prove a new observation.

## Build contract

Call this after the catalog has been assembled, before shopping/builder data are consumed:

```js
const {prepareOfferData, writeOfferData} = require('./prepare-program-offers.cjs');
const prepared = prepareOfferData({records, repo: repositoryRoot});
writeOfferData({prepared, outDir: path.join(distRoot, 'data')});
```

`records` is the actual trusted catalog array, preserving explicit IDs. `repo` is the repository root, not the generated `dist` directory. `now` can be supplied as a finite timestamp for repeatable tests; ordinary preparation uses the actual clock. `identitiesFile` and `observationsFile` can select alternative JSON inputs for local tests. Neither input is fetched or rewritten.

The returned object contains `identities`, `observations`, `current` and `report`. Validation fails before writing if a source is malformed, contradictory, unknown, outside a reviewed permission scope, or missing required approval records. The writer checks that outputs cannot replace its known canonical sources or explicitly supplied input paths; each generated file is replaced from a temporary file in its output directory. It does not provide a database transaction across all output files. A build failure must block release rather than expose a partly generated site.

The existing builder already reads `/data/offer-identities.json`; its products are `{id, identity}`. The history/retention implementation can consume `prepared.observations.observations`. Wire shopping/current pricing to `prepared.current.offers`, or use `/data/offer-current.json` directly. Do not combine inherited `/prices.json` snapshots with this reviewed current payload or promote them into history.

Consumer obligations remain important:

- Re-run `PCP_OFFER_RULES.currentOffers` with the current clock and selected region, condition, and tax/shipping basis. A prepared static file becomes stale after preparation; a build is not a live-price service.
- The current file may contain separate CAD/CA and USD/US observations and separate product conditions. Compare only like currency, region, condition and charge basis. Default comparison uses new goods with tax and shipping excluded.
- Price zero remains an observed zero in history, never a current ranked price. Unknown stock and unknown charges remain unknown; they cannot establish a purchasable current offer.
- Show incomplete totals, coverage and missing prices. No output claims the cheapest delivered order across every retailer.
- `currentFeedStatus` remains `not_configured`, including when reviewed manual observations exist. This preparer activates no feed, recurring job or external request.

## Canonical identity schema

Top level: `{ "schema": 1, "products": [] }`. Each nonempty product entry requires:

- `id`: exact existing catalog ID. The resolver never guesses from a product name, alias or matching photograph.
- `identity`: all five fields `exact: true`, explicit `sku`, `variant`, `memoryVariant` and `revision`. Use `null` only for a genuinely unspecified variant/revision; never substitute an empty string. A generic GPU model name is not an exact retail SKU.
- `evidence`: 1–20 records containing public HTTPS `url`, `publisher`, UTC ISO `checkedAt` and `scope: "exact_sku_variant"`.
- `review`: `status: "approved"`, `kind: "human"`, actual `reviewer`, and UTC ISO `checkedAt`. Approval cannot precede its evidence checks. Do not invent a reviewer or mechanically set approval.

Known catalog SKU, variant, revision and memory identity must agree exactly. GPU, RAM, SSD and HDD entries require an explicit memory/storage capacity variant. Where the catalog already holds numeric capacity, the identity begins with matching decimal `GB` or `TB`, optionally followed by further variant details: for example, `16 GB GDDR7`, `32 GB (2 × 16 GB)`, or `1 TB`. Storage TB converts to 1,000 decimal GB. An identity conflict requires reviewing the catalog and source documents, not silently changing which part an offer represents. This preparation does not change saved builds or aliases.

## Authorization and observation schema

Top level: `{ "schema": 1, "authorizations": [], "observations": [] }`.

Each authorization has:

- Unique `id`; `kind` from the existing policy's `verified-manual`, `authorized-retailer-api`, or `authorized-retailer-feed` values; and the exact public `publisher`.
- `origins`: explicit HTTPS source/store origins, such as `https://example.com`, with no path, query, fragment or credentials. Include all legitimate API and storefront origins needed by that permission scope.
- `merchantIds`: bounded exact merchant IDs to which this authorization applies.
- `permission`: explicit `access: true` and `redistribution: true`, grounded in actual permission or applicable terms.
- `evidence`: 1–20 public HTTPS records with `publisher`, UTC ISO `checkedAt`, and `scope: "access_and_redistribution"`.
- The same truthful human approval record as above.

Checking that these fields exist does not establish legal permission. An owner must inspect the actual permission and its scope. Do not fabricate a permission document, assume that public access alone permits redistribution, or copy protected feed credentials into these files. Confidential permission evidence belongs in an appropriately protected owner record; this v1 schema only accepts public evidence URLs and strips them from public output. Sources with only private documentation need an explicitly designed private integration before activation.

Each observed offer requires the existing policy fields:

`productId`, `sku`, `variant`, `memoryVariant`, `revision`, `exactVariant: true`, `merchantId`, `merchant`, public `url`, `region` (`CA`/`US`), matching `currency` (`CAD`/`USD`), numeric `price`, `condition`, `availability`, UTC ISO `checkedAt`, `availabilityCheckedAt`, explicit `charges`, and `source`.

`availability` is `in-stock`, `out-of-stock`, `preorder`, `backorder`, or `unknown`. Optional `inStock` must agree with it. Optional `expiresAt` must be a valid time after observation. Availability checked after a price observation is rejected; obtain a new complete observation instead of mixing snapshots. Tax/shipping are each `included`, `excluded`, or `unknown`.

`source` requires `authorizationId`, authorized `kind` and `publisher`, authorized public `url`, a unique `recordId`, and `redistributionAllowed: true`. Store and source origins and merchant must fall within that authorization. Each observation also has a truthful human approval `review`, dated after its observed price and availability evidence. An API/feed collector is not implemented here; do not fake those reviews or claim automated ingestion is configured. A future ingestion workflow needs an explicitly reviewed integration design instead of bypassing this source contract.

Review identities, reviewer names, authorization records and permission evidence are retained only in canonical source files. Public outputs carry necessary product, merchant, offer-source, observation-time and coverage facts; private review metadata is omitted.

Those source files are repository files, not a secret store. If the repository is public, committed source metadata is public too. Use a truthful non-sensitive review identifier, and keep credentials, personal contact details and confidential permission documents out of them.

## Bounds, conflicts and retention

- JSON inputs are limited to 16 MiB each; products/observations to the existing 5,000 record maximum; source authorizations to 500.
- Text, IDs, URLs, evidence lists, merchants and source origins are bounded. Unsupported fields, unsafe object keys, embedded credentials, common credential URL parameters, invalid calendar dates, nonnumeric prices and future observations fail validation.
- Exact duplicate records deduplicate deterministically. Conflicting records for the same source record or same merchant/product/variant/time fail closed. No record is silently chosen because it happens to be cheaper.
- The existing shared policy limits a current offer to at most 15 minutes, respecting earlier explicit expiry and stock-evidence time. A later unavailable observation supersedes an earlier offer from that seller.
- Expired approved records remain historical observations with original timestamps. History reports actual first/last observation, recorded gaps, and no interpolation or continuous coverage. No synthetic historical curve or "lowest ever" assertion is generated.

The source files are the durable archive. Preparation never deletes expired rows. To grow beyond these bounded limits, design archival partitions and an explicit history read contract before increasing the limits; do not discard old source observations to make a validation error disappear.

## CLI and tests

Read-only check of the actual empty defaults:

```sh
node scripts/prepare-program-offers.cjs validate
```

Prepare public local copies after validation:

```sh
node scripts/prepare-program-offers.cjs prepare --out-dir dist/data
```

Optional flags: `--identities <JSON>`, `--observations <JSON>`, `--catalog <JSON>`, `--now <UTC ISO>`, `--out-dir <directory>` (prepare only). A supplied catalog must be JSON; no downloaded script is executed. The default catalog loader runs only the existing trusted local catalog modules in a bounded VM. Neither command fetches a source, makes a purchase, deploys, sends messages or modifies canonical input files.

Verification command:

```sh
node scripts/check-program-offer-sources.cjs
```

Thirteen behavior groups pass: empty defaults; truthful public/private separation; exact stable IDs; SKU/capacity/revision/variant isolation; permission scope; schema/credentials/limits; dates/currency/stock; expired history; superseding availability; deterministic conflicts; legacy snapshot rejection; CLI write/read behavior and idempotency; and input byte/flag limits. All priced/permission fixtures use `example.com`, artificial catalog IDs and explicitly synthetic reviewers, and are removed after tests. They do not become real source records.

## Current status and next action

| Task | Dependencies | Files/evidence | Test/status |
| --- | --- | --- | --- |
| OFF-S1 durable canonical sources | Stable catalog IDs | Two root `data/program-offer-*.json` files | Implemented; both empty |
| OFF-S2 strict source preparation | Existing `program-offers` policy and identity resolver | `prepare-program-offers.cjs` | 13 grouped fixture/CLI tests pass |
| OFF-S3 build wiring | Parent build integration | Replace empty-generation writes in `extend-program.cjs`; connect current/history consumers | Parent integration required |
| OFF-S4 real reviewed price data | Exact product evidence and authorized source rights | Owner-maintained identity/authorization/observation records | Blocked: no actual authorized records supplied |
| OFF-S5 live refresh | Reviewed feed/API integration, runtime, monitoring and explicit activation authorization | Not implemented or configured by local preparation | Blocked; no live-price claim |

The immediate next step is integrating this preparer into the build and re-running the combined suite. Actual offers remain absent until accurate reviewed source records are supplied. No production release is authorized by this module.

## Picker identity inspection

The existing `dist/select-ui.js` already marks same-name options with separate catalog IDs and an identity-review note, and preserves native select values and change events. That is consistent with unresolved product identity isolation. No picker labels, product IDs, catalog entries or alias decisions were merged by this task.
