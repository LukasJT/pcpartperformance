# Hardware guides 151–300

The owner approved guides 151–300 and requested the PC Part Performance byline on November 21, 2026. The source approval binds the reviewed tracker, the transformed article bodies and the citation recheck by SHA-256. It records the owner's approval without inferring a claim that the owner personally reviewed every citation.

The release includes 100 new guides and 50 previously unpublished hardware backlog guides. It retains the approved text, figures, tables and original source review dates. Review navigation is removed, related draft links become canonical public URLs, and the normal site template supplies byline, article metadata and discovery. The Dell WD22TB4 citation now points to the equivalent US product specification. Public web retrieval recovered readable content for the other 61 flagged URLs. [Citation checks](citation-release-recheck.json)

The hardware guide directory contains both cohorts. The sitemap has 1,752 distinct URLs, an increase of exactly 150 with no removals. The release retains crawlable directory links, article breadcrumbs, feed items and site search entries.

The generated site passed 1,812 isolated browser scenarios across the 150 new guides and directory, including dark mode and enlarged text. The browser run also followed links from the blog into both guide cohorts. [Browser results](browser.json) · [Sitemap comparison](sitemap-diff.json)

Reproduce with the normal production build, master regression suite, TypeScript check and component-photo validation. After the production workflow succeeds, run `node --use-system-ca scripts/verify-search-dominance-live.cjs <deployed-commit> <public-receipt-path>` to verify both cohorts and the exact sitemap against the deployed revision.
