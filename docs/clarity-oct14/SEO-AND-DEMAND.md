# Clarity, search intent and discovery — October 14, 2026

## What was actually researched

Current official Google Search/News documentation, Shopify API documentation, exact manufacturer hardware pages and representative public searches were inspected. These searches provide **qualitative intent**, not this site's traffic, keyword volume, a Google ranking baseline or a prediction of revenue. Search Console and analytics access were not supplied to this subtask. The previous 147-query research register remains useful; this batch adds focused laptop, prebuilt and phone questions without fabricating quantitative demand.

The dated query map in `query-map.csv` records 11 directly issued research queries and the existing or new destination answering each. A public research search is not proof of Google's exact order, autocomplete suggestions or “People also ask” wording. No such report is invented. User language informs concise titles and search aliases; deliberate typo repetition and keyword density are not optimization methods.

## Current official guidance and concrete application

| Inspected original source | Finding | Application to this release |
| --- | --- | --- |
| [Helpful, reliable content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), updated October 5, 2026 | Useful original work, clear purpose and accurate authorship matter. More pages or artificially fresh dates do not by themselves improve ranking. | Four new guides solve distinct laptop/game questions and lead to working tools. Preserve existing matching URLs and researched context; reduce repeated interface copy instead of deleting consequential evidence. Move process detail to an accessible editorial-policy link if it clutters the reading flow; do not invent personal reviewers or tested devices. |
| [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), updated September 8, 2026 | Organization authors are supported; markup must match actual article identity and dates. A concise headline is recommended. | Use the owner's established PC Part Performance author, truthful release dates, concise headlines, one canonical per intent, and source-backed visible content. No fabricated person, rating or video schema. |
| [Discover guidance](https://developers.google.com/search/docs/appearance/google-discover), updated March 9, 2026 | Indexing and policy compliance make content eligible without a special application or tag; appearance is not guaranteed. Representative large images, clear headlines and a good experience help. | Use page-specific representative images, at least 1200 px wide where practical, large-image preview permission and accurate alt text. Avoid a site logo or text-heavy generic “SEO card” as every lead image. Treat Discover as supplemental; no ranking promise. |
| [Google News discovery](https://support.google.com/news/publisher-center/answer/9607025) | Eligible news can be found through normal crawling and considered automatically. Eligibility does not guarantee News ranking. | Keep genuine timely reporting distinct from evergreen guides. Retain truthful original dates and the working 48-hour News sitemap. Do not mark this laptop checklist as breaking news or change old dates to simulate a newsroom update. |
| [Current Google SEO learning paths](https://developers.google.com/search/blog/2026/10/seo-learning-paths), October 6, 2026 | Official video playlists organize beginner Search and technical SEO topics. | Continue from official documentation and focused examples. The implementation does not require pretending thousands of videos were watched. |
| [Shopify Ajax Product API](https://shopify.dev/docs/api/ajax/reference/product) | Public product JSON contains product/variant information; monetary values use presentment currency. | The NZXT price candidate stays unresolved until an explicit regional currency can be verified. A dollar sign alone never becomes USD or CAD. |

## Video research: exact completion state

Two original Google Search Central videos were reopened through the public research tool:

- [SEO for vibe-coded websites](https://www.youtube.com/watch?v=12yWkqxrYsM), published April 16, 2026: original title, channel and date accessible; this fetch returned no description.
- [Analyzing performance on Google Search](https://www.youtube.com/watch?v=5LF6SwB5jZ0), published December 4, 2025: original title, verified publisher, date and description accessible. The description concerns Search Console performance reporting across Search, Discover and News.

**Videos watched in this batch: 0. Transcripts read in this batch: 0.** Previous documented normal transcript attempts also returned no transcript. Descriptions helped choose topics; current written documentation supplies implementation requirements. No third-party transcript, bypass or downloaded video is represented as watched research.

## Clear labels that match the task

Use prominent ordinary links for **PC Builder**, **Phone Comparison**, **Game FPS**, **Prebuilt PCs**, **Gaming Laptops**, **Hardware** and **Guides**. “Explore” can remain a secondary grouping control only if its destinations are visible and understandable. It should not be the only way to find major features.

| Visitor question | Label or answer-first title | Primary next action |
| --- | --- | --- |
| Will this phone fit my hand or pocket? | Compare phone sizes | Select two models, see common scale, then rotate supported models |
| Can this PC run my game? | Game FPS | Choose the game and platform; inspect measured evidence or clearly marked estimates |
| What is this prebuilt actually made of? | Prebuilt PCs | Compare exact configuration and missing internals, then inspect the seller's current listing |
| Is a laptop 5070 the same as desktop? | RTX 5070 laptop vs desktop | Inspect exact laptop GPU, power conditions and whole-system cost |
| Can I add RAM to this laptop? | Can you upgrade a gaming laptop's RAM and SSD? | Open the exact service documentation before buying |

Important product facts, creator credits and sources remain accessible through restrained disclosure controls near the relevant media or decision. Breadcrumbs can use short category labels, such as `Home / Guides / SSD transfer time`, instead of repeating an entire long article heading. Their last item and schema must still identify the page accurately. Moving a breadcrumb is a layout decision, not a secret SEO mechanism.

## High-value next content, after evidence review

1. Materially improve the existing Canadian prebuilt shortlist with the actual expanded exact-model registry; show unknown internals and region-specific support, not a fabricated top-50 ranking.
2. A same-budget laptop shortlist after exact regional quotes and original matching tests become available; avoid publishing “best” based only on family names.
3. A graphics-power comparison tool that presents documented base/boost conditions, display path and unknowns; do not convert watts into an FPS score.
4. A laptop RAM/storage support index anchored to exact service manuals and validated part forms, with unsupported configurations explicitly unresolved.
5. Selected game-specific requirement guides linked to the existing FPS tool, beginning with the completed Baldur's Gate 3 guide. Add titles when their relevant requirements and test coverage have been inspected, not a game-by-component page matrix.

These are implementation priorities based on observable task gaps and qualitative intent. They are not measured search-volume or profitability rankings.

## Release checks

- Important destinations have ordinary anchor links and remain accessible on mobile.
- New guides have source context, one main heading, truthful organization authorship and actual dates.
- Drafts and arbitrary tool/filter states stay out of sitemaps and the default search index.
- No new price or FPS schema advertises data the visible page cannot support.
- Link and overflow checks run after the entire generator finishes; intermediate HTML is not the release.
- Compare Search Console country/device/landing-page data only after authorized access is available. Record tool completion separately from pageviews and outbound retail clicks.
