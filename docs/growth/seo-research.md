# Official SEO research and implementation decisions

Research checked **October 13, 2026**, using current official Google documentation. This report is a research handoff, not a claim that a change is deployed or that Google has indexed it. The machine-readable evidence is in [source-register.json](source-register.json); video access limitations are in [video-seo-research.md](video-seo-research.md).

## What changed in current guidance

- The [October 6 announcement](https://developers.google.com/search/blog/2026/10/seo-learning-paths) really does announce two curated learning paths: Search fundamentals and Technical SEO. It does not say every included video was newly recorded. The linked playlist pages were not retrievable in this research session, so membership of the selected videos is unverified.
- The [documentation change log](https://developers.google.com/search/updates) says FAQ rich results stopped appearing on May 7, 2026. Useful question-and-answer sections may remain; adding FAQ schema is not a current rich-result strategy.
- The current [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) explicitly discusses original effort and truthful authorship, including AI assistance. Credit to sources does not substitute for useful original work.
- The [generative AI performance report](https://support.google.com/webmasters/answer/16984139) reports **impressions**, not a unique-visitor count. Its documentation states worldwide rollout by August 31, 2026. No account data were accessed here, and report availability for this site is unverified.

## Findings tied to the actual repository

These are source-code observations at inspection time; the main team's baseline and browser checks establish actual runtime behavior.

| Finding | Status | Concrete application |
| --- | --- | --- |
| `scripts/seo-launch.cjs` injects 24 hardware rows, category links and numbered `<a href>` pagination in generated HTML. | Already addressed in source | Preserve this behavior. Test it after navigation or catalog changes instead of assuming the historical empty catalog remains broken. |
| `scripts/seo-pass.cjs` generates self canonicals for ordinary pages and metadata, breadcrumbs, Product data, and homepage WebSite/Organization nodes. | Already addressed in source | Extend the shared pass rather than creating separate metadata systems. Validate duplicate nodes, visible-content parity, exact product identity and final HTTP behavior. |
| `scripts/worker-policy.mjs` redirects toward HTTPS/www and puts `X-Robots-Tag: noindex, follow` on tool/filter state parameters and unknown parameters. | Already addressed in source | Test production responses. Keep UTM tracking handling separate from content state. A header is not a crawl block. |
| `dist/robots.txt` allows crawling generally and declares the preferred-host sitemap. | Confirmed source state | Do not add broad robots blocks while relying on the same URLs to expose noindex. Consider targeted crawl prevention only after evidence of unwanted crawling or existing index state. |
| Basic Product nodes lack `offers`, `review` and `aggregateRating`. | Truthful but not Product-snippet eligible | Do not fill the gap with invented prices or scores. Describe them as product information markup until a visible, eligible exact-product offer or real review exists. |
| `scripts/seo-launch.cjs` stores a common research-date value as dateModified for its older content batch. | Improvement opportunity | Trace each date to a real substantive review/revision. Do not refresh dates on every rebuild. This observation does not establish that every old date is false. |
| The shared SEO pass adds resources, news, phones, data and saved links to the footer. | Discoverability improvement opportunity | Important tasks need visible navigation and focused landing pages, not only footer links. Avoid placing every destination in one oversized menu. |

## Rendering and crawlable discovery

[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) supports testing both initial and rendered HTML. Essential article text, specifications and links should be available without typing, clicking or launching 3D. An initial noindex can prevent rendering, so do not expect client code to remove it successfully. Keep a single consistent canonical.

For this static generator, a framework rewrite is unnecessary. Add regressions asserting: catalog rows are present in raw HTML; product links resolve; generated article content appears; optional interactive controls enhance the same visible facts. Reserve product-image dimensions and retain useful fallback HTML if scripts or models fail.

[Ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure) and [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) support the journey category → exact product → relevant comparison/guide → tool. A search box cannot be the only discovery mechanism. Use descriptive normal anchors for navigation and buttons for actions. Model aliases must never merge different GPU memory variants or motherboard revisions solely by display name.

## Pagination, filters and URL policy

The current [pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) recommends distinct URLs and self canonicals for paginated pages. Google does not click load-more buttons to expose products; numbered or next-page anchors are necessary. Google no longer uses rel-next/prev to establish pagination. Preserve current `/hardware/.../page/2/` URLs and test page two's distinct rows and canonical.

The [faceted-navigation guidance](https://developers.google.com/crawling/docs/faceted-navigation) separates avoiding crawling from avoiding indexing. Noindex must be crawled to be read. Canonical hints may reduce duplicate crawling over time but are not a dependable crawl barrier. Our practical policy:

1. Keep useful category/pagination and curated comparison URLs crawlable and indexable when they pass the content gate.
2. Keep arbitrary searches, sort/filter combinations, build states and dynamic comparison states out of the sitemap and noindex in the actual response.
3. Avoid generating indexable links for every filter combination. Preserve browser back/share behavior for visitors.
4. Add narrower robots rules only with an explicit inventory of affected parameters, already indexed URLs and an independent route to every intended product page.
5. Return 404 for a nonexistent pagination page or impossible combination rather than redirecting it to the homepage.

[Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization) is a preference Google may override; duplicates are not automatically a spam violation. [Canonical implementation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) supports keeping redirects, internal links and sitemaps aligned. Reversed curated comparisons can consolidate; real product variants and distinct article intents must remain separate.

## Structured-data eligibility and validation

| Type | Current official guidance | PC Part Performance application |
| --- | --- | --- |
| [Article / NewsArticle / BlogPosting](https://developers.google.com/search/docs/appearance/structured-data/article) | No required properties; supply applicable recommended properties. Organization is an allowed author type. Use representative accessible images and truthful dates. | Keep PC Part Performance as the visible organization author where authorized. Match the author URL, title, publication/revision dates and image to the page. NewsArticle describes real reporting; it does not grant News acceptance. |
| [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) | Requires name plus at least one of offers, review or aggregateRating. Focus on one product or legitimate variants; category lists are not one Product. Currency-specific offers need distinct URLs. | Basic specification pages may remain semantically described without claiming a rich result. Add offer markup only from current, visible, exact-variant records and explicit currency/region. No inferred stock or synthetic ratings. |
| [Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) | This is a different shopping experience from product snippets, intended for pages where the customer can purchase. | A comparison site linking to retailers is not automatically the selling merchant. Do not invent merchant policies, checkout or seller status. |
| [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization) | No universally required properties; include relevant truthful organization details. | Use the actual brand name, homepage/about URL and real crawlable logo. Do not invent an address, phone, staff or credentials. |
| [WebSite / site name](https://developers.google.com/search/docs/appearance/site-names) | Required name and canonical homepage URL; one homepage node. Site names are not supported for subdirectories. Site-name testing is not supported in Rich Results Test. | Preserve a single `#website` identity. Use a schema validator plus actual homepage inspection; do not create a second WebSite node for the Blog. |
| [General guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | Structured data must represent visible, current content. Technical validity does not guarantee appearance. | Separate JSON syntax checks, visible-data assertions, supported Google-feature checks and actual search observations in QA reports. |

The [current supported-feature gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) and change log resolve conflicts with older videos. A passing validator is a release check, not a ranking or rich-result promise.

## Wording, content and regional usefulness

[Titles](https://developers.google.com/search/docs/appearance/title-link) and [snippets](https://developers.google.com/search/docs/appearance/snippet) should accurately describe the page; Google may choose other title/snippet text. Use human task language such as “will this GPU fit?” where the page genuinely answers it. Do not stuff every spelling variation or append the year automatically.

[Helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) and [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) support original useful work rather than volume for its own sake. The strongest applications here are exact-source compatibility explanations, complete platform-cost worksheets, interpretable calculator results, safe diagnostic flows and clear benchmark limitations. A parameter combination or template heading does not deserve an article just because it can be generated.

[Localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions) requires corresponding reciprocal annotations when genuine regional equivalents exist. Keep Canada/CAD and US/USD explicit. A client-side country selector alone is not a separately indexable regional page, and two identical copies do not gain usefulness by changing the flag. Do not create a new URL for every location without a distinct supported reader need.

## Images, video and AI discovery

The [Discover guidance](https://developers.google.com/search/docs/appearance/google-discover) recommends relevant large images at least 1200 pixels wide and high resolution, with large-image previews enabled. Eligibility is not a promise of inclusion. Keep schematics labeled as illustrations rather than evidence of hardware we tested.

The [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search) addresses the small search icon; it is distinct from an Organization logo or social-preview image. Verify the homepage favicon link, crawlability, square dimensions and stable URL. Do not claim we control when Google changes its chosen icon.

[Video SEO](https://developers.google.com/search/docs/appearance/video) distinguishes a real watch page from an article with a supplementary link. Do not attach VideoObject to a text article merely because it links to someone else's YouTube review. Keep credit and context; embed or create a watch page only where it provides a real reader benefit and meets current requirements.

[Google's AI guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says Google does not require llms.txt, special AI schema, tiny content chunks or special prose for generative Search. Clear definitions and source-linked evidence help readers; they are not a formula that guarantees AI citations. Continue normal technical SEO and original utility.

## Performance targets and honest measurement

[Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) still covers LCP, INP and CLS. [Web Vitals](https://web.dev/articles/vitals) specifies assessment at the 75th percentile, separately by device class. Target good boundaries: LCP at most 2.5 seconds, INP at most 200 ms and CLS at most 0.1. These are real-user metrics, not the same as generated HTML bytes or a lab total-blocking-time result.

In this repository, prioritize deferred 3D loading, route-specific data loading, reserved image space, restrained effects and fast input/filter handling. Reuse the existing byte-budget script as a regression measure while labeling it accurately. Field success requires sufficient real-user data or authorized Search Console/CrUX evidence; none was accessed for this report.

## Research and measurement controls

[Search Console performance documentation](https://support.google.com/webmasters/answer/7576553?hl=en) distinguishes clicks, impressions, CTR and average position, with country/device/query/page dimensions and aggregation differences. [URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en) distinguishes an indexed snapshot from a live test; a live test does not predict Google's selected canonical.

[Google Trends data](https://support.google.com/trends/answer/4365533?hl=en) is sampled and normalized relative interest, not monthly keyword volume. Record country, date range, category, search type and whether a comparison uses topics or terms. Do not convert 0–100 indexes into fabricated search counts.

Use [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) for intended canonical discoverable pages, with lastmod only when substantive change evidence exists. Submission is not guaranteed indexing. Keep Search Console/account actions in the authorized owner workflow.

## Priorities for the implementation team

1. **Protect existing crawlability:** raw HTML catalog rows, numbered links, exact product routes, static editorial content and self canonicals; verify worker HTTP statuses and noindex headers.
2. **Make the task hierarchy visible:** Build, Compare, Compatibility, Upgrade and Learn, with Hardware/Performance/Prebuilts/Phones in concise contextual navigation. Link original guides to working tools.
3. **Repair claims before expanding output:** separate measured performance from estimates; preserve unknown prices, incomplete totals and compatibility limits.
4. **Ship evidence-backed utility:** improve existing matching pages, calculators and diagnostics instead of proliferating overlapping URLs.
5. **Keep schema truthful:** reuse shared templates; no invented offers, stock, scores, authors or review dates. Test actual markup against visible content.
6. **Measure the actual bottleneck:** compare repeatable byte/runtime tests and retain field-data limitations. Add effects without making filters, inputs or reading unstable.

These priorities are implementation recommendations derived from repository inspection and primary guidance. The central release report must identify which were actually completed, tested and deployed.
