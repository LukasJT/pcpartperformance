# Public search samples and implementation decisions

October 19, 2026. Qualitative public web-search samples, not a logged-in Google Search Console export, a fixed-location Google ranking study, or keyword-volume data. Results can vary by location, device and date. No rank improvement is inferred.

| Intent cluster | Observed page patterns / examples | Implemented response | Still needed |
| --- | --- | --- | --- |
| PC builder / parts list / alternative | Interactive builders with searchable components and persistent part lists; [PCBuilder](https://pcbuilder.net/), [pcbuilder.io](https://pcbuilder.io/). | Prioritize working Build, Upgrade and Compare paths; compact selection, save/restore and exact-source review. | Measure actual visitor completion and Search Console queries. Do not invent compatibility guarantees. |
| CPU/motherboard compatibility | Socket/chipset/firmware explanations plus tools; [CompatPC](https://compatpc.com/). | Preserve documented-match, conflict and unknown logic. Exact professional platform records stay outside unsupported consumer-builder assumptions. | More exact board/CPU BIOS evidence, not a larger unsourced pass matrix. |
| GPU clearance / will it fit | Dimension-entry calculators and fit checkers, including [Gamers Connected](https://gamersconnected.com/tools/will-it-fit), [SpecsCalc](https://specscalc.com/sff-gpu-clearance-checker), [Benchmark Setups](https://benchmarksetups.com/gpu-length-clearance-checker) and [Custom PC Gaming](https://custompcgaming.com/tools/will-my-gpu-fit-my-case). | Add exact named AIB dimensions and original dimension envelopes, with source links and unknown clearance explicitly retained. | Exact case configurations, radiator/fan/cable constraints and manufacturer diagrams. An outer box alone cannot certify fit. |
| Exact product / variant | Specification tables, product listings and comparisons. Model suffixes, capacity, revision and board partner matter. | Twenty exact partner GPU records; exact prebuilt MPNs in page titles, chooser and search; no sibling-photo substitution. | Broader historical/region/revision coverage and licensed images. |
| Gaming performance | Calculators often mix estimates with benchmark language. | Separate platform release evidence from exact measured performance; remove synthetic legacy calculations from normal decisions. | Licensed/reproducible measured records with settings, versions and provenance. |
| Upgrade / purchase planning | Tool plus guide intent; visitors need retained parts, real spending and a next action. | Preserve local saved builds and upgrade transfer, compact workspace cards, source-correct prebuilt checklist and regional price restoration. | Real offer coverage and user research; no cost claim from missing prices. |

The search samples also surfaced pages from RigAtlasPC and GCC Gaming PC. Their appearance in a sample is not a quality endorsement or a measured competitor position. The site's own pages appeared in some samples; this is not a before/after ranking result.

## Technical guidance applied

- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): retain crawlable generated content, descriptive metadata and real links. Idle-loaded browser metadata does not replace static catalog HTML.
- [Pagination and incremental loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading): each paginated game/catalog page has its own URL, links and coherent metadata; do not depend on a button click for discovery.
- [Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization): preserve deliberate canonical/indexing rules rather than duplicating filter/search URLs in sitemaps.
- [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): connect sources, tools, diagrams and decisions. Do not publish dozens of unchecked drafts simply to increase page counts.

## Measurement handoff

The owner must authorize the actual Search Console and GA4 properties. Export equal date windows, retain device/country/search-type filters, separate branded/nonbranded intent and respect overlapping report definitions. Then prioritize existing impression-bearing pages and real completion problems. No traffic, CTR, position, AI impressions or premium-market sessions are estimated here.
