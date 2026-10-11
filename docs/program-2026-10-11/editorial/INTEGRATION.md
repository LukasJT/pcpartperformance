# October 11 editorial integration

## Generator contract

```js
const editorial = require('./continuation-editorial.cjs');
const report = editorial({ root, records, images, shell, write, esc });
```

Call after `continuation-site.cjs` (which creates `/prebuilts/` and the Build vs Buy worksheet) and before `extend-program.cjs`. Run the shared navigation pass after this generator so the new review routes receive the same navigation. The generator does not edit the shared build source, worker, model registries or navigation definitions.

`PROGRAM_PREVIEW=1` writes 12 complete noindex article drafts and `/editorial-review/oct11/`, then includes them in the preview search index and merged `program-draft-routes.json`. Normal generation emits no unreviewed article routes and removes only matching identified draft output, including the existing Micron placeholder. It retains unrelated normal pages.

The returned `report` includes `draftRoutes`, `withheldRoutes` and `metadata`. `continuation-editorial-metadata.json` persists the same page metadata. Integrate that metadata into the common SEO pass without overriding draft noindex/date states. Exclude withheld routes from normal navigation/search/regular sitemap. Preview review URLs also remain noindex after later shared passes.

Both builds reuse `/news/`, `/news/feed.xml` and `/news-sitemap.xml`; the latter two contain no drafts. The current publication registry is empty. This module is the news artifact producer for this batch; future unrelated published news should join a common validated publication registry rather than be silently lost from an aggregate feed.

## Content and evidence

- `continuation-editorial-content.cjs`: eight guides and four reports; clear audiences and query intent; 9,685 article words including headings, tables and checklists.
- `continuation-editorial-sources.json`: 16 directly inspected primary/manufacturer/support/original-test sources. The content module adds nine exact retailer configuration evidence records from the inspected allowlist and shared `prebuilt-data.cjs`.
- `data/editorial-oct11/assets/`: 12 original PNG/SVG pairs. No manufacturer imagery or third-party geometry imported.
- `REVIEW-PACKET.md`: all 12 full articles, source links, limitations and current per-item SHA-256 hashes.
- `manifest.json`, `source-evidence.json`, `review-checklist.json`: machine-readable identities, word counts, evidence and human requirements.
- `QUERY-MAP.md`: existing URL overlap and search-intent decisions.

The prebuilt articles use exact catalog examples without price, stock, reliability or value rankings. C09 expands `/news/micron-ai-demand-memory-evidence/` in place. The phone-size guide rejects the old Pixel Store link after its redirect to newer content and uses Google's model-specific help table. Videos are optional external original-review links; source/video identity and retrieval limits are visible.

## Human review and release

`continuation-editorial-review-decisions.json` uses the existing schema-1 human review gate and starts empty. Do not write approvals on a person's behalf. C01–C12 currently need actual full-content/source review and a truthful byline decision; there are no added inferred data blockers because these are conditional methods and sourced reports, not verified deals or measured performance recommendations.

`node scripts/continuation-editorial.cjs review` reports current review resolution. `node scripts/continuation-editorial.cjs prepare` refreshes the complete packet and fingerprints after content/source changes. No command marks an article reviewed or publishes it.

`continuation-editorial-publications.json` starts with `schemaVersion: 1` and an empty `publications` array. It is a separate record of already released news, not an approval shortcut. A confirmed entry needs the exact article ID/current hash, `status: "published"`, real UTC `datePublished`, optional material `dateModified`, `confirmedDeployment: true`, and `deploymentEvidence` naming the exact hosted article URL, inspected access and actual `checkedAt` timestamp. The current human byline comes from the matching genuine review decision.

The publication resolver rejects stale/absent reviews, backdating before review, future dates, wrong deployed URLs and duplicate records. It can regenerate confirmed news and produce matching NewsArticle/RSS/news-sitemap metadata. A separate authorized release adapter is still responsible for the first actual release and hosting inspection. Source announcement dates never substitute for that work. For future approved evergreen publication, use the common Article adapter with the same truthful byline/date discipline; this module keeps the unreviewed guide sources as drafts.

## Scoped validation

```text
node scripts/continuation-editorial.cjs check
node scripts/test-continuation-editorial.cjs
node scripts/test-continuation-news-intake.cjs
node scripts/continuation-news-intake.cjs --offline
```

Seven scoped generation/publication cases cover complete content/assets, preview metadata and internal links, normal draft removal, stale-review invalidation, deployment/publication evidence, RSS archive versus 48-hour/1,000-item news sitemap and reproducible packet hashes. Ten intake cases cover offline non-networking, deduplication, content fingerprints, safe discovery URLs, redirect/content-type/size limits, cache and source revisions. Synthetic reviewer/network fixtures never become production decisions.

The online intake command was attempted but local Node DNS resolution failed. Its failure record is retained; no successful live snapshot is claimed. Tests used synthetic Response objects, and original-page research used the web reader. Full build, commit and deployment remain the parent task's responsibility.
