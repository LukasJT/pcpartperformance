# Search Console and indexing corrections — October 23, 2026

## Release result

Published source commit `635829ae4aceabdc290fd300251cd2556891c86c` through the existing production workflow. Hosting and CI both succeeded. All 112 local regression command groups and TypeScript passed. The public receipt verifies 37 HTTP responses, the correct sole owner token, reference metadata, the comparison redirect, and retained private-state exclusions.

Google confirmed zero unused ownership tokens and that the former token can no longer grant access. Its October 23 live test of the RTX 5070 reference now says **URL is available to Google**, **Page can be indexed**, and **1 valid breadcrumb item**. No invalid Product item is detected in the live result. Google accepted indexing requests for the RTX 5070 reference and the previously unknown phone comparison. The comparison is not claimed indexed. The older RTX indexed snapshot awaits recrawling.

The release corrects 805 catalog reference pages and 43 phone reference pages; it does not create product offers or reviews. All 1,451 sitemap pages have incoming static links from another sitemap page, with zero orphan URLs and zero repeated manufacturer prefixes in the audited reference metadata. Google lists the sitemap as Success with 1,451 discovered pages; discovered is not the indexed count.

Receipts: `release.json`, `ci-after.json`, `public-after.json`, and `local-discovery-after.json`. Private Google screenshots remain outside the repository.

## Scope and evidence

Owner-authorized review of `https://www.pcpartperformance.com/`, followed by source fixes and production verification. This is a URL-prefix property, not a domain-wide verification. Private account identifiers and Google screenshots stay outside the public repository.

Google's individual URL Inspection results before this release:

- Homepage: indexed; user and Google canonical agree; crawl and indexing allowed; fetch successful.
- Builder: indexed; valid breadcrumbs.
- RTX 5070 reference: indexed, with invalid Product enhancements. The indexed September 25 snapshot showed two invalid items. The October 23 live test showed one invalid item, missing `offers`, `review`, or `aggregateRating`.
- Manual actions and Security issues: no issues detected.
- robots.txt: valid.
- Aggregate Performance and Page indexing reports: processing. Clicks, impressions, query positions, and indexed totals are unavailable. No traffic or ranking gain is claimed.

An enhancement error does not establish an indexing block. These specification references have no qualifying offers or reviews; their metadata should describe the reference page accurately.

## Issue register

| ID | Evidence and cause | Implemented correction | Verification |
| --- | --- | --- | --- |
| GSC-01 | Property originally added to a different signed-in account | Verified the owner's intended account, removed the old user's access, and removed its homepage token in source | Correct account verified; former access removed; public token absent; Google confirms zero unused tokens and successful revocation |
| SEO-01 | Google live test rejects incomplete Product rich-result markup; catalog generator emits Product for specification-only records | Use WebPage metadata for catalog references; remove redundant Product markup from phone reference pages, which already have WebPage metadata | Structured-data regressions, unchanged visible specification tables and citations; Google live retest passed after deployment |
| SEO-02 | 212 duplicate manufacturer prefixes in indexable reference metadata | Deduplicate the brand prefix while preserving exact model names | `local-discovery-before.json`, `local-discovery-after.json`, exact-name unit tests |
| SEO-03 | `/phones/compare/iphone-16-vs-pixel-9/` has no incoming link from another sitemap page | Add a relevant static link in the phone hub's existing related-guides section | Every sitemap URL has an incoming link from another sitemap page; eight responsive states pass; before/after screenshots reviewed |
| SEO-04 | Curated comparison alias redirects to an indexable canonical but carries a noindex header | Clear noindex only for recognized indexable destinations after resolved comparison state is removed | Source policy and actual Worker response tests; private state, unknown query, preview and withheld-route exclusions retained |
| SEO-05 | Generated audit text incorrectly equates lack of API credentials with lack of owner browser access | Distinguish browser inspections from an unconfigured automated API connector | Generated report wording reviewed |

## Files and tests

- `scripts/reference-page-schema.cjs`: factual reference-page metadata, exact-image gate, HTTP(S) citation validation, safe JSON serialization.
- `scripts/seo-pass.cjs`, `scripts/publication.cjs`, `scripts/completion-seo.cjs`: reference metadata generation and cleanup.
- `scripts/phone-pages.cjs`: crawlable related comparison link.
- `scripts/program-routing.cjs`, generated `scripts/worker-policy.mjs`: consistent redirect signals.
- `scripts/build-pages.cjs`: correct owner's sole verification tag.
- `scripts/search-console-seo.test.cjs`: dedicated regressions included in the master suite.
- `scripts/completion-seo.test.cjs`: verifies metadata correction without altering any visible specification table, image, or citation.

Test receipts: `../master-completion/qa/test-commands.json`, `mobile-link-qa.json`, `../seo-validation.json`, and `../total-refinement/seo/after.json`.

The responsive check uses isolated Edge at 320, 390 and 1440 px in light/dark, plus enlarged text at 320/390 px. It is not a physical iOS Safari test. This release changes one visible related link and metadata/routing; it does not claim a full visual redesign audit.

## Ownership and remaining Google processing

The intended owner was verified before removing old access. The old account's public token must also disappear from production to prevent re-verification. The public removal and Google token-revocation confirmation are recorded in `release.json` and `../search-console-oct23/connection.json`.

Cached enhancement reports may continue to show older crawls after a successful live test. Indexing requests and sitemap processing do not guarantee inclusion or ranking. Aggregate reports must finish before a real search-performance baseline can be recorded.

## Official guidance applied

- [Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Canonical signals and redirects](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Managing owners and verification tokens](https://support.google.com/webmasters/answer/7687615?hl=en)

No prices, ratings, reviews, dates, benchmarks, or field performance measurements were invented. Existing catalog identities, user storage, published URLs, and legitimate query-state exclusions are preserved.
