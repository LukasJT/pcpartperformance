# News, Discover and publication readiness

Prepared October 11, 2026. This is a concrete implementation/readiness record, not evidence that Google has accepted, indexed or shown the publication.

## Implemented

- Reuses `/news/` for a clear source-led newsroom, with separate reporting standards and existing published background reading.
- Preview presents four complete reports with their actual source-announcement dates and research-draft state.
- Normal output withholds the 12 articles because the genuine human review registry is empty. It removes the short old Micron draft at its existing route.
- `/news/feed.xml` contains only current-reviewed, actually published and confirmed-deployed news. RSS can retain older legitimate reports; drafts are absent.
- `/news-sitemap.xml` reuses `news-policy.cjs`: eligible news first published within the past 48 hours, never future timestamps, at most 1,000 entries. An empty news sitemap is intentional while nothing qualifies.
- NewsArticle markup is emitted only when a current human decision and exact confirmed deployed-page record establish an already published report. Its visible byline, first publication date, optional material revision and original schematic image match the record. No Article, NewsArticle or VideoObject markup appears on draft pages.
- Twelve original 1200-pixel-wide, 16:9 PNGs (810,000 pixels each) and editable SVGs have article-specific context and alt text. Drafts remain noindex; a confirmed published report permits `max-image-preview:large` and supplies the image through Open Graph and schema.
- Drafts disclose the AI research/writing workflow. The owner must confirm truthful visible authorship through the existing human gate. No invented staff profile, credentials or automated human approval is provided.
- Existing editorial standards, About and the real GitHub correction route remain linked. No fictitious email, publisher network or contact response promise is created.

## Operational follow-up

Human review is the repository's existing publication gate. It is not inferred from a successful build or from checking source links. Genuine owner-entered review decisions are still needed for C01–C12. After approval, a separate explicit release adapter must record actual first publication and confirm hosting; this generator does not assign that date from the source or review date.

Google News transparency guidance calls for dates/bylines and information about authors, publication, publisher/company/network and contact. The site identifies PC Part Performance and has an existing public correction route. The owner should ensure that the About and policy pages accurately explain the actual publisher identity and any relevant company/network, plus the genuine contact method. Missing owner-specific facts must remain unclaimed. This is an operational readiness item, not an extra fabricated approval requirement.

No Search Console ownership, indexing submission, Publisher Center acceptance or Discover appearance was verified. No rank, traffic or eligibility outcome is promised. Paid placements/affiliate relationships, if actually introduced, need the corresponding visible disclosure and link treatment; this work creates no such relationship.

## Current primary guidance inspected

- [Google News sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap): retain news metadata for only the last two days and limit each news sitemap to 1,000 news entries. An empty sitemap is allowed when no article qualifies.
- [Google Discover guidance](https://developers.google.com/search/docs/appearance/google-discover): indexing/policy compliance allows consideration without a special application; large relevant images and accurate titles matter. Appearance and traffic remain uncertain.
- [Automatically generated Google News publication pages](https://support.google.com/news/publisher-center/answer/15898024): the late-March-2025 change means publication pages are generated automatically; Publisher Center RSS/web-location submissions do not establish inclusion.
- [Google News content policies](https://support.google.com/news/publisher-center/answer/6204050): clear dates/bylines, publisher/contact transparency and disclosure of actual sponsored interests.
- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): original useful analysis and truthful authorship; do not fabricate expertise or change dates simply to appear fresh.
- [Article structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/article): structured metadata should describe the actual article and its visible publication information.

## Scope of the source job

`node scripts/continuation-news-intake.cjs` performs bounded, allowlisted HTTPS reads of four original announcements and Google's inspected Pixel bulletin index. It records change signals and discovered original bulletin candidates in a private review queue. The first discovery run can include historical bulletins; URL dates are not automatically treated as publication dates. Navigation changes may produce a false signal and require source reinspection.

`--offline` seeds the four already inspected source reports without networking. It does not claim to have discovered new events. Neither mode writes article routes, human decisions, publication dates, feeds or schema. The separate existing `monitor-news.cjs` remains available for its own official GitHub source.

Actual local online attempt: failed to resolve the official hosts through Node (`ENOTFOUND` observed for source.android.com). No current snapshot or new online lead is claimed. Original sources were inspected through the web reader; the offline command and synthetic bounded-network/cache tests passed. Run the live command on a host with working DNS/HTTPS before describing it as an operational monitor. No recurring automation was scheduled.
