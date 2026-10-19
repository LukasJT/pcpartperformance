# SEO and publisher source register

Inspected October 19, 2026. Primary documents only. A document's own revision date is recorded when exposed; the inspection date does not imply that a hardware fact, live price, traffic count or article was reverified.

## Material checks against the supplied baseline

- The Journey threshold and GA4 dependency remain in its current official requirements. Eligibility still needs a real account and audience report.
- Custom-site targeting has explicit guidance for semantic `journey-content` / `journey-sidebar` landmarks. The new code adds only an article-body landmark; it does not certify provider compatibility.
- The current onboarding describes Stripe identity verification and does not require separate MCM approval for Journey. Old Grow-era instructions must not be blindly substituted for the dashboard's current issued wrapper.
- Existing programmatic providers must be removed for Journey launch. Adsterra stays intact pending an authorized transition.
- Google consent-mode documentation shows a revision dated October 13, 2026, after the October 9 research baseline. Validate default/update ordering and withdrawal against the current page; a consent signal is not a consent UI.
- Search Central's update log shows an October 16 Indexing API quota-document change. This does not authorize using the restricted API for ordinary hardware articles.
- FAQ rich results stopped appearing May 7, 2026; their documentation was removed in June. The later master prompt's reference to merely restricted availability is outdated. FAQs may still serve readers, but must not be sold as a rich-result traffic opportunity.
- Google's generative-AI guidance still rejects special wording/file/schema shortcuts. No new `llms.txt` or artificial keyword-variation program is warranted for Google ranking.

## Search guidance

| ID | Primary document | Revision shown | Application to this release |
| --- | --- | --- | --- |
| SEO-01 | [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | 2025-12-10 | Clear useful pages, links and names. No invented duplicate-content penalty or keyword density. |
| SEO-02 | [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | 2026-10-05 | Editorial value and accurate authorship; source checking is separate from human review. |
| SEO-03 | [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | Inspected current page | Reject scaled ranking-first filler, deceptive claims and artificial promotion. |
| SEO-04 | [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Inspected current page | Preserve existing generated HTML. No framework migration or JS-only editorial replacement. |
| SEO-05 | [Titles](https://developers.google.com/search/docs/appearance/title-link) | 2025-12-10 | Page-specific visible titles; no forced current year or character-count ranking claim. |
| SEO-06 | [Snippets and meta descriptions](https://developers.google.com/search/docs/appearance/snippet) | Inspected current page | Describe the actual answer/tool; no generic repeated slogans. |
| SEO-07 | [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | Inspected current page | Canonical public resources only; substantive dates. The owner setup page stays noindex. |
| SEO-08 | [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) | 2026-09-08 | Visible exact-model information; never invented offers/reviews for rich-result eligibility. |
| SEO-09 | [Image SEO](https://developers.google.com/search/docs/appearance/google-images) | Inspected current page | Stable image URLs, genuine identities, useful alt text and nearby explanation. |
| SEO-10 | [Core Web Vitals and Search](https://developers.google.com/search/docs/appearance/core-web-vitals) | 2025-12-10 | Measure loading, interaction and layout stability; no ranking or lab-to-field guarantee. |
| SEO-11 | [Web Vitals measurement](https://web.dev/articles/vitals) | 2024-10-31 | Good thresholds remain LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile. |
| SEO-12 | [Generative-AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) | 2026-07-10 | Valuable tools/original explanations. No special Google AI schema or phrase formula. |
| SEO-13 | [Search documentation updates](https://developers.google.com/search/updates) | 2026-10-16 | Checked for changes since baseline; confirmed FAQ retirement and current update context. |

These are implementation references, not evidence of ranking improvement. Search Console, analytics, query volumes and revenue reports were not accessed. Qualitative topic research does not establish keyword difficulty, traffic potential or position.

## Publisher and analytics guidance

| ID | Primary document | Scope |
| --- | --- | --- |
| PUB-01 | [Journey minimum requirements](https://journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements) | Threshold, connected GA4, original content and provider evaluation. |
| PUB-02 | [Mediavine requirements](https://www.mediavine.com/application-requirements/) | Premium-market examples; distinguish Journey from full Mediavine requirements. |
| PUB-03 | [Application to launch](https://journeymv.zendesk.com/hc/en-us/articles/23745987278363-Journey-From-Application-to-Launch) | Owner account, agreement, issued artifacts, identity and launch gates. |
| PUB-04 | [Custom-site script wrapper](https://journeymv.zendesk.com/hc/en-us/articles/55037817279771-Installing-the-Journey-Script-Wrapper-on-a-Custom-Built-Site) | Account-issued wrapper; no fabricated tag or publisher ID. Page updated 2026-08-27. |
| PUB-05 | [Custom layout targeting](https://journeymv.zendesk.com/hc/en-us/articles/54691462571419-Why-SPAs-flexbox-grid-layouts-and-utility-class-frameworks-can-cause-ad-targeting-issues) | Semantic body/sidebar landmarks, not a framework rewrite. |
| PUB-06 | [Placement selectors](https://journeymv.zendesk.com/hc/en-us/articles/55300174276763-How-to-Use-Ad-Placement-Selectors-to-Retarget-Your-Ads) | Defaults first; explicit targeting only after inspection; placeholder testing. |
| PUB-07 | [Locating selectors](https://journeymv.zendesk.com/hc/en-us/articles/55299975719707-How-to-Locate-a-Selector) | Unique selectors, static/sidebar size constraints, homepage restriction. Dated 2026-09-02. |
| PUB-08 | [Removing former network ads](https://journeymv.zendesk.com/hc/en-us/articles/24209919201563-How-To-Remove-Your-Existing-Ads-From-A-Previous-Network) | Programmatic exclusivity; authorize a transition, preserve current network until then. |
| PUB-09 | [Custom-site ads.txt](https://journeymv.zendesk.com/hc/en-us/articles/24703689013403-How-To-Install-Ads-txt-For-Custom-Sites-Not-On-Wordpress-Squarespace-Shopify-or-Blogger) | Use actual dashboard-provided content; no invented seller entries. |
| ANA-01 | [GA4 property/web-stream setup](https://support.google.com/analytics/answer/14183469?hl=en) | Owner account, web stream, installation and actual verification. |
| ANA-02 | [Consent-mode implementation](https://developers.google.com/tag-platform/security/guides/consent) | Current default/update/withdrawal behavior. Updated 2026-10-13. |

## Repository observations and action

| Finding | Evidence | Action/status |
| --- | --- | --- |
| Main HTML lacks a static GA4 tag | `publisher-baseline.json`; generated HTML script inspection | No account conclusion inferred; no active analytics added. |
| Existing programmatic advertising present | `build-ad-assets.cjs`, `ads-injection.mjs`, generated consent client | Preserved; Journey transition remains owner-controlled. |
| 58 public article bodies lack a dedicated provider landmark | Baseline audit | Pure transformation rehearsal handles all 58 without wrapping layout regions. |
| About, editorial and operational privacy resources exist | Generated file inspection | Presence passes; adequacy, contact identity and legal review remain unverified. |
| Build suppresses analytics by default | `build-pages.cjs` calls `completion-measurement.cjs` with `enabled:false`; `PCP_EVENTS` requires an explicit enabled/consented adapter | Retain gate. Disabled config validation does not claim collection is working. |
| Search/filter/user-state routes already have policy infrastructure | `program-routing.cjs` recognized state keys and manifest noindex handling | Reuse route policy; do not add a duplicate indexing subsystem. |

## Recheck procedure

Reopen relevant primary sources before a provider transition or a substantive SEO/template change. Record an actual material change; do not automatically bump article dates. Keep provider dashboard decisions, official requirements, source-code observations and measured browser results separate. Save before/after audit artifacts and test exact production responses after an authorized deployment.
