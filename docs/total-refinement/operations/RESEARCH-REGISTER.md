# Official research and implementation decisions

Inspected October 19, 2026. Links are evidence, not instructions to auto-publish their content. No traffic/ranking measurement is available here.

## Retail data and revenue

| Source | Confirmed useful point | Implementation decision |
| --- | --- | --- |
| [Amazon PA-API 5 deprecation notice](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation) | Creators API is the supported successor; old PA-API calls are documented as returning access denied. | Do not build a new PA-API integration or treat access denial as something to bypass. |
| [Creators API introduction](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction) | Publisher product operations require marketplace enrollment, API registration and credentials; the page states a qualifying-sales access condition. | Owner must confirm eligibility and current account terms. No placeholder credentials or unsupported global feed. |
| [Amazon program policies](https://affiliate-program.amazon.com/help/operating/policies/) | Program content and data-feed access have license and use conditions. | Cache/history/image rights must be reviewed for the approved integration; existing daily history rules cannot be applied blindly to Amazon. |
| [Best Buy US developer portal](https://developer.bestbuy.com/) | Product/store/category APIs exist with API-key onboarding. | Missing key and terms are explicit blockers. US API documentation is not evidence of Canada coverage. |
| [Best Buy Canada affiliate program](https://www.bestbuy.ca/en-ca/about/affiliate-program/blt82df225e80ec75e9) | Publisher application uses Impact. | Application/approval and any feed rights are owner work; affiliate membership alone is not proof a catalog API is authorized. |
| [Newegg publisher affiliate program](https://www.newegg.com/promotions/affiliate_program/affiliate.html) | Program applications are reviewed through Rakuten; deep-link tools are offered. | No membership, commission, feed or image-license claim is added without actual approval. Existing fixed public observations remain separate. |
| [Walmart affiliate benefits](https://affiliates.walmart.com/page/benefits), [terms](https://affiliates.walmart.com/terms) | Publisher materials/feeds are program-specific and constrained. | Do not use supplier item-management APIs as a universal public shopping feed; owner-approved publisher access is required. |
| [B&H affiliate program](https://www.bhphotovideo.com/c/find/shared/affiliates.jsp) | A publisher application exists. | Feed scope, region, image/history rights and approval remain unverified. No application submitted. |

No suitable public publisher API agreement was verified for Memory Express, Micro Center or Canada Computers in this increment. This is not a claim such agreements cannot exist. Do not install an evasion/proxy scraper to fill the gap. Retailer search links remain useful without pretending they establish stock or a price.

## Search and news

| Source | Finding | Site decision |
| --- | --- | --- |
| [Current Search Central updates](https://developers.google.com/search/updates) | Official documentation changes have a maintained index/RSS. | Daily monitor creates review leads; it does not change metadata or article dates automatically. |
| [October 6 learning paths](https://developers.google.com/search/blog/2026/10/seo-learning-paths) | Two curated paths cover search fundamentals and technical SEO, alongside existing Search Console Training and Search Off the Record. | Prioritize crawlable content, index/canonical controls, actual reporting and page weight. The source article was read; individual videos were not falsely recorded as watched when playlist fetches failed. |
| [September 24 multimodal reporting](https://developers.google.com/search/blog/2026/09/web-multimodal-in-sc) | A multimodal search-type filter is documented for Search results and Generative AI performance reporting. | Use the owner's actual available reports; do not invent those metrics or add overlapping totals. |
| [Generative AI report help](https://support.google.com/webmasters/answer/16984139) | The appropriate report must be inspected in the actual property. | Authorized private access is still absent. Visibility is not assumed to equal referral visits. |
| [Google News publication transition](https://support.google.com/news/publisher-center/answer/15898024) | Publication pages are automatic; Publisher Center RSS/web-location submissions no longer configure them. | No fake submission or guaranteed Google News inclusion. Existing source-linked news routes, favicon/site name and review gates remain relevant. |
| [News sitemap rules](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap) | News metadata only covers eligible articles created in the last two days; an intentionally empty feed is possible. | Preserve the existing reviewed/published/deployed 48-hour news gate. Never add discovery leads or stale articles to manufacture news freshness. |
| [Indexing API use](https://developers.google.com/search/apis/indexing-api/v3/using-api) | Restricted to eligible job and livestream content. | No API submission of ordinary hardware articles/products. Use supported sitemap/Search Console workflows. |

### Qualitative demand sample

Public search samples for “GPU clearance checker”, “CPU motherboard compatibility” and “PC upgrade planner” surfaced task-first compatibility/checker pages, upgrade tools and discussion questions. Competitor pages describe socket, memory, power and physical checks. This is a qualitative query sample, not a localized Google rank, volume or search-feature measurement.

The useful response for this site is an exact-model tool that shows what its checks prove, plus a short source-backed explanation and a direct builder/upgrade action. Repeating the same keywords across new thin pages would not add utility. Current routes `/builder/`, `/compatibility/`, `/upgrade/`, `/tools/` and related source-backed guides should own these intents before another generic landing-page cluster is created.

## Journey

[Current minimum requirements](https://journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements) require a connected GA4 account, at least 1,000 premium sessions in 30 days, original brand-safe content and an engaged audience; excessive AI use is listed as a disqualifier. The actual private analytics/property and provider decision are unavailable. The existing publisher checklist remains prepared, not submitted/approved. No ad script or ads.txt values were invented.
