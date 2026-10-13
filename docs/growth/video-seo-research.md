# Official SEO video research

Checked **October 13, 2026**. Thirteen relevant videos were identified and their titles, Google Search Central publisher identity, original publication dates and descriptions were inspected from public YouTube metadata. **No video was watched and no transcript text was successfully retrieved or read.** This is description-and-documentation research, not a transcript review.

## Learning paths and access evidence

Google's [October 6, 2026 announcement](https://developers.google.com/search/blog/2026/10/seo-learning-paths) confirms Search fundamentals for beginners and Technical SEO fundamentals playlists. The announcement links:

- [Search fundamentals for beginners](https://www.youtube.com/playlist?list=PLbrFcZbKqjoI)
- [Technical SEO fundamentals](https://www.youtube.com/playlist?list=PLeMjPeaUGn9U)

The announcement HTML was inspected to recover those exact links. The linked playlist pages were not retrievable by the research browser, so this report does **not** assert that the selected videos are current members of either playlist. They were selected from Google's current documentation embeds, official announcements and the verified Google Search Central channel metadata.

For every video below, YouTube's public player metadata advertised an English caption track. A bounded request to that track's signed `https://www.youtube.com/api/timedtext` URL returned **HTTP 200 with an empty body**. An advertised track is not evidence that its transcript was read. No login, private account, bypass mechanism, downloaded media or third-party transcript service was used. Expiring caption signatures are intentionally not preserved in the source register.

The publication dates below come from the original public video metadata, not Google's later documentation-embed date. Current written documentation governs implementation when an older tutorial may be stale.

## Focused records

| ID | Official video and original publication date | Material actually inspected | Description finding and site application |
| --- | --- | --- | --- |
| V01 | [Introducing How Search Works](https://www.youtube.com/watch?v=5MIAugQ17ks) — 2024-02-15 | Title, publisher, date, description and chapter names. Caption metadata present; text empty. | The description introduces crawling, indexing and serving as separate stages. **Application:** keep discovery, indexability checks and actual search appearance separate in release reports. A sitemap or 200 response does not establish ranking. |
| V02 | [URL Inspection Tool — Google Search Console Training](https://www.youtube.com/watch?v=Pe_-TkdbXN0) — 2020-01-23 | Public metadata and description. Caption metadata present; text empty. | The description covers indexed status, live testing, recrawl requests and loaded resources. **Application:** after an authorized owner connection, sample catalog, product, curated comparison and article routes; retain indexed-versus-live distinctions from the [current tool documentation](https://support.google.com/webmasters/answer/9012289?hl=en). |
| V03 | [Analyzing performance on Google Search](https://www.youtube.com/watch?v=5LF6SwB5jZ0) — 2025-12-04 | Public metadata and description; embedded in current Search Console help. Caption metadata present; text empty. | The description concerns analysis across Search, Discover and News. **Application:** build a country/device/landing-page measurement plan rather than claiming traffic from public search snippets. Compare actual Search Console metrics with appropriate periods. |
| V04 | [How to perform a technical SEO audit](https://www.youtube.com/watch?v=aLWQqlpwHK8) — 2025-11-06 | Public metadata and description. Caption metadata present; text empty. | The description emphasizes understanding site technology, using tools and prioritizing findings. **Application:** audit this Node static generator and Cloudflare worker as implemented; do not prescribe a CMS/framework rewrite or call every tool warning a defect. |
| V05 | [SEO for vibe-coded websites](https://www.youtube.com/watch?v=12yWkqxrYsM) — 2026-04-16 | Public metadata and description. Caption metadata present; text empty. | The description lists original value, complete canonical URLs, JavaScript testing and Search Console setup. **Application:** preserve absolute preferred-host canonicals and accessible HTML while adding genuinely useful decisions/calculators. A visual redesign alone is not content value. |
| V06 | [Trending Now: Stay on Top of Google Search Trends](https://www.youtube.com/watch?v=O-9G9k6ogdw) — 2024-09-11 | Public metadata, description and chapter names; independently linked by Google's Trends-series announcement. Caption metadata present; text empty. | The description suggests beginning with rising terms and narrowing to relevant topics. **Application:** discover hardware questions worth investigating, then require original source evidence and reader relevance before adding news. Do not chase unrelated trends. |
| V07 | [Google Trends Advanced Tips](https://www.youtube.com/watch?v=Kkd2PkbCdSc) — 2024-08-28 | Public metadata, description and chapter names; independently embedded in Google's Trends-series announcement. Caption metadata present; text empty. | The description covers punctuation, detailed comparisons and export/share features. **Application:** record terms versus topics, locale, period and search type for each comparison. The [current Trends data help](https://support.google.com/trends/answer/4365533?hl=en) resolves interpretation: interest indexes are not monthly search volumes. |
| V08 | [Essential JavaScript SEO tips — JavaScript SEO](https://www.youtube.com/watch?v=nwGY-9lwTF4) — 2019-03-13 | Public metadata and description; embedded in current JavaScript SEO documentation. Caption metadata present; text empty. | The description concerns discoverable JavaScript content and titles. **Application:** keep real anchors, core content and canonical/indexing controls in generated HTML; test rendered controls separately. Use [current JS guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) for detailed behavior rather than assuming a 2019 video is current in every respect. |
| V09 | [How Robots.txt Works](https://www.youtube.com/watch?v=IXNEVt9rZG8) — 2024-12-04 | Public metadata, description and chapters; embedded in Google's robots introduction. Caption metadata present; text empty. | The description distinguishes robots.txt, meta robots and headers, including noindex versus disallow. **Application:** retain crawlable noindex responses for dynamic states where needed; never assert a robots block is authentication or that Google can read noindex through a disallow. |
| V10 | [Monitoring Rich Results in Search Console — Google Search Console Training](https://www.youtube.com/watch?v=Vmfvf8nG09k) — 2020-02-05 | Public metadata and description; embedded in current Product-snippet documentation. Caption metadata present; text empty. | The description concerns enhancement errors, appearance and validation. **Application:** test current supported markup and visible data. The [current feature gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) supersedes old enhancement examples; do not restore retired FAQ features or manufacture offers to silence a validator. |
| V11 | [Sitemaps in Search Console — Google Search Console Training](https://www.youtube.com/watch?v=JlamLfyFjTA) — 2020-03-04 | Public metadata and description; embedded in Google's sitemap overview. Caption metadata present; text empty. | The description covers deciding whether a sitemap is needed, submission and status. **Application:** generate intended canonical URLs, keep drafts/tool states out, and record real substantive lastmod only when known. Submission and discovery are different from indexing. |
| V12 | [SEO for ecommerce — Google Search Console Training (from home)](https://www.youtube.com/watch?v=lB-E6060se0) — 2020-10-20 | Public metadata and description. Caption metadata present; text empty. | The description introduces ecommerce SEO, monitoring errors and product structured data. **Application:** adopt useful category/product navigation and exact-variant detail pages while recognizing that PC Part Performance is a reference/comparison site, not automatically the retail merchant. Verify current Product requirements. |
| V13 | [Canonical URLs: How Does Google Pick the One?](https://www.youtube.com/watch?v=8j_hxBw5B4E) — 2019-09-04 | Public metadata and description. Caption metadata present; text empty. | The description addresses canonical selection for similar or duplicate pages. **Application:** maintain one preferred identity per genuine duplicate, align internal links/sitemaps/redirects and preserve distinct variants. The [current canonical docs](https://developers.google.com/search/docs/crawling-indexing/canonicalization) explain that the declared preference is a hint, not a guarantee. |

## Implementation handoff

The descriptions helped choose implementation topics; they are not evidence for undocumented technical details. The linked current written documentation supplied the actual requirements. See [seo-research.md](seo-research.md) for the repository-specific handoff:

1. Preserve static category rows and anchor pagination, then test them after modifications.
2. Verify canonical redirects, query-state noindex and real 404 responses in the worker.
3. Improve navigation and contextual links to exact models, compatibility, upgrades and useful guides.
4. Keep product markup truthful and distinguish generic schema validity from Google's rich-result eligibility.
5. Improve task value and measurement, rather than generating more thin parameter pages.

## Completion and limitation record

- Official learning-path announcement inspected: **yes**.
- Exact linked playlist URLs recovered: **yes**.
- Playlist listings or membership verified: **no**.
- Focused official videos with verified metadata/descriptions: **13**.
- Videos watched: **0**.
- English caption tracks advertised in metadata: **13**.
- Caption-text requests returning a non-empty transcript: **0**.
- Transcripts read: **0**.
- Current written primary guidance inspected and applied to the handoff: **yes**.

If the owner later wants transcript review, use YouTube's normal accessible transcript/caption interface or an authorized export and record the actual text accessed. That work remains incomplete; it is not represented as finished here. Website implementation does not depend on pretending these transcripts were available.

## Completion-pass browser check

On October 13, normal connected-browser transcript export was attempted for V05 and V01. Both returned “No transcript is available for this YouTube video”. No transcript text was read and no watched-video claim is added. Current written guidance remains the implementation authority.
