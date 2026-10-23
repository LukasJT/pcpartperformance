# Search Console and indexing corrections — October 23, 2026

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
| GSC-01 | Property originally added to a different signed-in account | Verified the owner's intended account, removed the old user's access, and removed its homepage token in source | Correct account verified and old access removal confirmed in Google's UI; final public-token receipt recorded after deployment |
| SEO-01 | Google live test rejects incomplete Product rich-result markup; catalog generator emits Product for specification-only records | Use WebPage metadata for catalog references; remove redundant Product markup from phone reference pages, which already have WebPage metadata | Structured-data regressions, unchanged visible specification tables and citations; Google live retest after deployment |
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

The intended owner was verified before removing old access. The old account's public token must also disappear from production to prevent re-verification. The deployment receipt and final Google checks are recorded separately after publication.

Cached enhancement reports may continue to show older crawls after a successful live test. Indexing requests and sitemap processing do not guarantee inclusion or ranking. Aggregate reports must finish before a real search-performance baseline can be recorded.

## Official guidance applied

- [Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Canonical signals and redirects](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Managing owners and verification tokens](https://support.google.com/webmasters/answer/7687615?hl=en)

No prices, ratings, reviews, dates, benchmarks, or field performance measurements were invented. Existing catalog identities, user storage, published URLs, and legitimate query-state exclusions are preserved.
