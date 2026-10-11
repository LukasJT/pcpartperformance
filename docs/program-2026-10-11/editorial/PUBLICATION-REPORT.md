# Twelve-article publication — October 11, 2026

## Authorization and current state

The owner instructed: “okay publish all 12 articles and use PC Part Performance as the author”. The exact C01–C12 article/source fingerprints are recorded in `scripts/continuation-editorial-owner-authorization.json`. This supersedes the personal-review prerequisite for this batch only; no claim that the owner personally read every source or that a named expert reviewed it is recorded.

All twelve complete articles were verified live on **https://www.pcpartperformance.com/** in production commit `e20732e00cd262fa54b1c0507b30f2d6f20585f6`, first inspected at 22:03 UTC. Their author is **PC Part Performance**, with the visible AI assistance disclosure and sources preserved. Eight guides appear in the Blog and four reports in the Newsroom; all twelve appear in Blog navigation, site search and the canonical sitemap.

The final timestamp/feed release **`77dda2411e04bb24ce457ba0d4930a445df2ee6f` is deployed and independently verified**. All twelve article/discovery checks passed at 22:08:21 UTC in [the final publication receipt](publication-live-final.json), and 26 site smoke checks passed at 22:08:56 UTC in [the general release receipt](../live-release-verification.json). Publication instants come from actual exact-page inspections in [the initial receipt](publication-live-initial.json), not a source announcement, preparation date or invented review date. `dateModified` remains empty because article substance has not changed. RSS publication dates and the four news-sitemap entries are enabled only after that actual confirmation.

## Implemented

- Shared organization byline, readable date and assistance disclosure; full existing article text and 25 source records retained.
- Twelve original representative images, correct social previews, article/breadcrumb structured data and coherent canonicals.
- Public guide/report cards, normal crawlable article links, search entries and canonical sitemap inclusion.
- Blog RSS adds eight guides to the existing archive; Newsroom RSS and the news sitemap contain four actually confirmed reports. Sitemap generation includes only the last 48 hours of publications at build time, while RSS retains the articles. No scheduled sitemap rebuild is configured; a later build removes aged entries.
- Exact owner authorization distinct from the personal-review registry. Remaining program drafts stay withheld.
- Historical thin-draft indexing exclusion is superseded only for the newly authorized complete C09 version; no blanket exclusion removal.

## Validation

The normal build generated 1,463 HTML pages with 960 intended indexable URLs and 503 exclusions. Seven editorial fixture checks, eight owner-publication checks, nine continuation integration checks and the stage2 checks pass. The SEO check validates canonical metadata, structured JSON, sitemap policy and local references. Twelve preexisting unresolved product identity pairs remain documented.

Actual public checks verify all twelve HTTP 200 pages, complete final sections, organization author, AI disclosure, source links, article markup, social images, site search, Blog/Newsroom links and sitemap/feeds. SEO validation checked 102,145 local references. [Browser QA](publication-browser-qa.json) covers representative desktop/mobile articles and Blog cards, light/dark modes and source disclosure. The final live desktop author/date is captured in [the screenshot](publication-desktop-live.png). It is not a field Core Web Vitals measurement, physical Safari test or human editorial attestation.

## Deployment and maintenance

Use the existing Cloudflare Git deployment branch `codex/stage2-publication-2026-10-04` and `node scripts/build-pages.cjs`. Verify the exact production commit with `node --use-system-ca scripts/verify-live-editorial.cjs <commit> final` and `node --use-system-ca scripts/verify-live-release.cjs <commit>`. A successful push alone is not deployment proof.

The preceding feature deployment `be022a75641b34fbc6acdad70a9e9fa3a69f1561` remains the recovery point. Rollback uses the matching previous Cloudflare deployment or a reviewed revert through the same branch, including assets and Worker configuration. No database or DNS changes were made.

For future material article edits, recheck source records and obtain authorization for the new fingerprint; record an actual substantive modification date after release. Rebuilding alone must not refresh publication dates. No Google News submission, acceptance, ranking or traffic outcome is claimed.
