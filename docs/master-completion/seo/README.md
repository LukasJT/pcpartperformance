# Static SEO and product-scope cleanup

Prepared from the October 16, 2026 Toronto research session. The baseline all-route audit was recorded at `2026-10-17T00:59:14.800Z`. This document describes a tested decorator; it does not establish production deployment or a ranking change.

## Confirmed findings and implementation

- **11 duplicate title clusters:** nine named motherboard groups and two phone groups. Their matching display names concealed different record scopes: manufacturer-category entries, documented model/revision references, build-listing entries, phone timelines and phone dimensions. The cleanup derives useful distinct metadata and one concise visible scope paragraph from actual records. It replaces vague catalog subtitles instead of adding another heading or alert box.
- **Documented revision:** GIGABYTE's current specification page explicitly identifies the B650 AORUS ELITE AX as **revision 1.2**. The generic category record has no revision. Only the documented record receives that revision in its title/scope; an arbitrary `rev-12` URL is not treated as a revision parser.
- **Two regional description clusters:** the same iBUYPOWER model appears in Canadian and US catalogs. Every current prebuilt description now uses its actual country, recorded currency, configuration and merchant. No exchange-rate conversion, stock inference or new offer claim occurs.
- **Five game-directory descriptions:** the old common description did not tell readers which part of the directory they opened. The decorator reads the actual server-rendered cards and produces ranges and first/last examples: **1–24, 25–48, 49–72, 73–96 and 97–107** at this checkpoint. Counts are derived rather than hardcoded into the function. The initial visible count agrees with the static page. Pagination links and each page's self canonical remain intact.
- **One stale Skytech generated slug:** the older `us-null-…` entry embeds a missing-brand record that otherwise matches the current branded entry's exact model, Best Buy SKU, URL, US/USD context and configuration. The current retailer source confirms model **ST-KING95-2062-W-BU**, SKU **6633460**. This is handled by one guarded legacy redirect and an exported ID resolver, not a catalog-wide name-matching migration.

Current prepared coverage is 16 product pages, 84 regional prebuilt descriptions and five game-directory pages, plus the one stale-slug redirect. These are local generated-site counts, not visitor, search-index or ranking measurements. The immutable [baseline clusters](BASELINE-CLUSTERS.json) support regression tests even after the main audit is refreshed.

## Product identity safeguards

`scripts/product-identities.cjs` and [the existing alias decision registry](../../program-2026-10-09/product-alias-decisions.json) were read and remain unchanged. Proposed motherboard aliases still need the registry's truthful human review before activation. Generic name matches do not authorize redirects, saved-build changes or canonical consolidation. The documented GIGABYTE revision, unresolved phone storage/SIM regions, exact partner cards and different memory capacities remain distinct.

Presentation grouping only identifies pages whose scope should be clearer. Catalog IDs, specification values, user storage, product references and variant fields are not mutated. All product-page canonicals and robots directives remain as they were. Product JSON-LD keeps the same URL and specification properties, receives a nonduplicated manufacturer/model name and reflects the visible scope. No SKU, revision, review, rating, price, stock or offer is invented.

The Skytech decision is deliberately separate. [SKYTECH-SLUG-DECISION.json](SKYTECH-SLUG-DECISION.json) records exact evidence, an agent source review, the old snapshot and expected brand-field correction. It makes **no human-approval claim** and records the root release review as pending. The parent explicitly authorized preparing this narrow fix for review. It does not activate the dormant product alias registry or rewrite stored shortlists.

## Integration order

```js
// AFTER seo-pass.cjs, which otherwise overwrites product titles/descriptions:
const seoCleanup = require('./completion-seo.cjs')(
  { root, records },
  { reportDirectory: 'docs/master-completion/seo' }
);
// THEN build routing and run the all-route HTML audit.
```

The decorator changes the title, meta description and corresponding Open Graph/Twitter fields together. It adds no CSS, browser dependency, network request or runtime metadata work.

### Preserve all forms of the old Skytech URL

`program-routing.cjs` already recognizes `data-legacy-redirect` and prepares a 301 for the trailing-slash page. Its current parser does not automatically create bare and `index.html` forms for prebuilt redirects. Before routing files are written, the root build should merge **only** the returned `seoCleanup.routeRedirects` into the routing manifest:

```js
Object.assign(manifest.redirects, seoCleanup.routeRedirects);
```

Add an optional `extraRedirects` parameter to the manifest builder or perform the merge inside the parent's write sequence. Mutating the returned object after the manifest files have already been serialized is insufficient. The targeted tests exercise all three forms through the actual pure routing policy and verify that query context survives a 301.

The redirect is emitted only when current data matches the bounded reviewed snapshot and a real target page exists. A changed SKU, URL, region or configuration blocks that alias for renewed source review. The persisted proof also lets a clean build recreate the redirect when the old generated file is absent. The old URL is retained through the permanent redirect; no other missing URL is sent to the homepage.

### Recover an old shortlist without rewriting user storage

`completion-seo.cjs` exports:

```js
PREBUILT_ALIASES
resolvePrebuiltId(id)
resolvePrebuiltIds(ids)
```

The mapping contains exactly one old ID. Unknown IDs are retained, arrays are not mutated and the result deduplicates an old/current pair. Current `prebuilt-ui.js` restores local selected IDs and later filters against the current dataset; it does not use a comparison-pair query parameter. The parent can resolve selected IDs in memory before that membership check so an old saved shortlist is still useful. No storage migration is required by this decorator.

## Source checks

- [Google's title guidance](https://developers.google.com/search/docs/appearance/title-link) recommends descriptive concise titles that reflect page content and avoid repeated boilerplate. Google still selects its own result titles; changing the tag does not guarantee its display or a ranking increase.
- [Google's snippet guidance](https://developers.google.com/search/docs/appearance/snippet) supports page-specific descriptions. A meta description is a summary choice, not a keyword-density formula or a guaranteed snippet.
- [Google's current pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) supports separate crawlable pages and appropriate canonicals. A shorter legacy documentation URL returned 404; the current official guide was inspected instead. No pagination canonical was moved to page one.
- [GIGABYTE B650 AORUS ELITE AX rev. 1.2](https://www.gigabyte.com/Motherboard/B650-AORUS-ELITE-AX-rev-12/sp#sp) was inspected for revision identity. This task does not revalidate every inherited catalog field.
- [The exact Best Buy US Skytech listing](https://www.bestbuy.com/product/skytech-gaming-king95-gaming-desktop-pc-amd-ryzen-7-9700x-2024-16gb-memory-nvidia-geforce-rtx-5060-ti-16gb-1tb-nvme-storage-white/J3GW8HKX4Z/sku/6633460) was inspected for model/SKU/listing identity. Retailer AI review summaries, marketing FPS, the displayed price and stock were not imported. Additional disclosed storage/OS details should be handled as a separately versioned catalog refresh.

## Validation and release boundary

Commands run:

```text
node --test scripts/completion-seo.test.cjs
node tools/quality/node_modules/eslint/bin/eslint.js --config tools/quality/eslint.config.cjs scripts/completion-seo.cjs scripts/completion-seo.test.cjs
```

Tests use temporary copies of real generated pages and the immutable baseline, plus meaningful incorrect-identity fixtures. They cover the 11 title clusters and four description clusters, honest variant scope, preserved canonicals/robots/specification properties, synchronized social fields, actual game ranges, country/currency mismatches, the exact stale-slug proof, HTTP redirect/query behavior, non-destructive shortlist resolution, clean-build retention and idempotence.

No full build, production deployment, browser pass, commit, paid integration or catalog migration was performed by this task. The parent must integrate the decorator, complete routing aliases and shortlist recovery, rerun the global audits and review the actual release before claiming it is live.
