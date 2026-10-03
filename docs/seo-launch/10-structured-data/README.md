# Structured-data policy

Generated HTML is the source of truth; examples below are extracted from the tested build. Article/WebPage + BreadcrumbList for researched resources, ItemList for the products visibly listed on each catalog page, Product once for canonical product records, Organization + WebSite on home. Existing articles retain their actual legacy dates established by repository commit history (September 18, 2026); new drafts use the release date and expanded pillars omit an unknown first-publication date.

Product identity and visible content must match. This release adds no Offers, AggregateRating or Review. A bare Product with specifications need not qualify for a Google product rich result; do not fabricate required commercial data to gain eligibility. Strict identity matching excludes unrelated partner images from generic Product schema. Schema image rights are a separate editorial check.

No FAQPage, NewsArticle, HowTo or VideoObject was added solely for visibility. A YouTube link is not evidence that the site owns or embeds a video. JSON parsing and semantic invariants pass locally; Google Rich Results Test and Search Console enhancement checks remain post-deployment tasks. Passing JSON validation is not equivalent to Google eligibility.

Official guidance: https://developers.google.com/search/docs/appearance/structured-data/article, https://developers.google.com/search/docs/appearance/structured-data/product and https://developers.google.com/search/docs/appearance/structured-data/breadcrumb (checked 2026-10-03).
