# Search presentation and publisher evidence

Research and generated-file inspection: October 19, 2026. No authorized Search Console or GA4 connector/account was available; no private traffic, query, CTR, ranking, eligible-session or revenue figures are claimed.

## Confirmed finding and correction

The stable first central build had 1,708 HTML pages and 1,163 intended indexable URLs. Its final performance landing metadata already used benchmark-evidence wording. An earlier intermediate shell contained obsolete estimate marketing, but that was **not** filed as a live defect after the final pass was inspected.

One actual public-guide inconsistency remained: `/blog/how-to-choose-a-graphics-card/` described the FPS tool as a model estimate. The current normal workflow reports evidence and missing evidence. `total-seo.cjs` replaces only that exact obsolete sentence and adds a direct, crawlable Game FPS link. It does not generate performance numbers, edit source citations, change authorship or invent publication/modification dates. Record the factual correction in the release notes; a local edit is not evidence of an already published revision.

The monitor PPI tool also had no contextual next step into game-performance research. One inline “Check game performance” link is added beside its existing planning/corrections links, without another card, menu or large explanation.

## Existing-page intent map

These are reasoned improvements supported by the actual tool behavior and qualitative public search wording. They are not measured high-volume keywords or a promise of higher CTR.

| Existing route | Intent | Search presentation |
| --- | --- | --- |
| `/performance/` | Find evidence for a game/platform/setup. | Game FPS & Console Performance: Benchmark Evidence. No universal calculator or prediction promise. |
| `/phones/size-compare/` | Compare physical phone dimensions and available appearance models. | Phone Size Comparison: Height, Width & 3D Models. No claim all phone geometry is manufacturer CAD. |
| `/tools/monitor-pixel-density/` | Calculate PPI and rectangular width/height. | Monitor PPI Calculator: Screen Size, Width & Height. Does not imply a best PPI or guaranteed FPS. |
| `/blog/` | Browse PC building, compatibility and upgrade learning. | PC Building Guides, Compatibility & Upgrade Advice. Matches its visible guide hub instead of emphasizing old AI-market article topics. |
| `/prebuilts/` | Investigate exact regional systems and delivered purchase costs. | Compare Prebuilt Gaming PCs in Canada & the US. Does not invent best-system rankings, prices or availability. |

No routes were renamed, removed or added. The module aligns description, Open Graph, Twitter and matching WebPage schema text when present. It preserves canonical/indexing policy, Article/NewsArticle facts, date fields, product offers and useful existing text.

## Integration contract

In the existing SEO page loop, call:

```js
h = require('./total-seo.cjs').polish(h, route);
```

Place it **after** existing route-map/product title overrides and **before** final title/description extraction and social metadata generation. It is pure and idempotent. No prepare step, CSS, runtime JavaScript, network call or package installation is required.

Checks:

```text
node --test scripts/total-seo.test.cjs
node scripts/total-seo-audit.cjs --intents-applied
```

The first command passes 15 tests. Before integration, the final-output audit correctly failed on the one obsolete article-tool sentence. After parent integration, the final-output audit passed with **zero issues across 1,868 HTML files and 1,323 intended indexable sitemap URLs**. The HTML count includes retained redirect/support files; it is not a claim of that many unique editorial articles. See [after.json](after.json). The initial before receipt was overwritten by a subsequent current-output audit without the intent flag; that later receipt is honestly named [current-without-intent-assertion.json](current-without-intent-assertion.json), not presented as a baseline. Production-before screenshots remain separately retained. This is local generated-output validation, not evidence of a completed deployment or Google indexing.

## Verified search/publisher controls

- Four real published news records exist; all were older than 48 hours at inspection. The news sitemap correctly contained zero entries. Nothing was re-dated to manufacture freshness.
- The final-output audit checks genuine UTC publication timestamps, exact ledger dates, review/deployment state, duplicates, stale entries and unmatched NewsArticle schema. Thirty-nine new source-index leads from the operations pipeline are not news publications.
- All 58 qualifying article bodies had one semantic publisher content landmark. This is targeting preparation, not proof Journey ads are installed or correctly placed.
- The analytics preparation remains disabled with no connected GA4 evidence. Journey script installation and eligibility remain unverified; existing advertising is preserved.
- All 47 unique local social images inspected had encoded dimensions matching their Open Graph declarations. This was a metadata inspection, not rendered visual QA or a new license clearance.
- The source-side canonical, robots and social metadata systems were already working in the stable build. They were retained instead of replaced to manufacture more changes.

## Official guidance applied

The [October 6 Search Central learning paths](https://developers.google.com/search/blog/2026/10/seo-learning-paths) organize search fundamentals and technical SEO around crawlability, indexing, reporting and rendering. Their documentation was inspected; playlist fetch failures were not reported as completed video viewing.

[Google's title guidance](https://developers.google.com/search/docs/appearance/title-link) supports descriptive, useful page titles. The five changes describe working destinations and preserve a coherent visible purpose. [Helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) favors reader value; no scaled thin landing-page matrix or keyword list was added.

[Multimodal reporting](https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc) and the [Generative AI report](https://support.google.com/webmasters/answer/16984139) require the actual available property data. Reports were not fabricated or overlapping totals combined.

The current Generative AI help describes **impressions**, including AI Overviews/AI Mode and text/multimodal filtering. It does not justify a made-up AI-click or visit count. Its data overlaps the Web search-type performance report, so adding those impression totals together would double count. Page/country/device/date grouping and preliminary data also need to be respected when comparing periods.

[Google News now uses automatically generated publication pages](https://support.google.com/news/publisher-center/answer/15898024). No manual submission or guaranteed inclusion was claimed. The [news sitemap's two-day policy](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap) remains enforced. The restricted [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/using-api) was not used for hardware content.

[Journey's current requirements](https://journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements) include a connected GA4 account, 1,000 premium sessions in 30 days, original brand-safe content and engagement. Meeting a file-level checklist is not proof of acceptance. The owner must connect analytics, verify actual audience/ownership, review agreements and use provider-issued script/ads.txt values after approval. No application or legal acceptance was performed.

See the [operations research register](../operations/RESEARCH-REGISTER.md) for current retailer/API decisions and additional evidence. Search outcomes must be measured after a real release using consistent periods; no ranking change can be inferred from these edits.
