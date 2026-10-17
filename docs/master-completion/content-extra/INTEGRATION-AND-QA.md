# Extra editorial integration and QA

## Scope and ownership

New files only:

- `scripts/completion-editorial-extra-data.cjs`: four complete guides, 23 sources, five-row gap overlay and source/text fingerprints.
- `scripts/completion-editorial-extra.cjs`: independently pinned publishing integration and private review packet generator.
- `scripts/completion-editorial-extra.test.cjs`: 16 targeted tests, including full-chain history regression.
- `scripts/completion-editorial-history.cjs`: shared, corroborated ownership/date recovery after upstream metadata regeneration. The first-eight module now uses the same safeguard.
- `docs/master-completion/content-extra/`: complete Markdown, source records, hashes, scope reconciliation and this release packet.

The first eight completion articles, their pins, the global generator, public release files, existing author/review policies, model assets and shared CSS were not changed by this task. No global build, deployment or commit was run.

## Integration API

```js
const extra = require('./completion-editorial-extra.cjs');

// Caller supplies the actual owner instruction and real recording/release times.
const authorization = extra.authorizationFor({
  statement: actualOwnerInstruction,
  recordedAt: actualRecordingInstant,
  releaseDate: actualTorontoReleaseDay
});

extra({ root, shell, write, esc }, { authorization });
```

The optional `ids` array restricts a release to an exact subset. Its independent record kind is `completion_editorial_extra_owner_release`. It cannot be substituted for the first-eight release kind. Store the source authorization separately, for example in `data/completion-editorial-extra-authorization.json`. The generated `dist/data/completion-editorial-extra-release.json` is a release manifest, **not** an authorization input.

Call after the existing editorials and first-eight completion module, before guide-directory, clarity and final SEO. The existing SEO pass must receive the merged `master-publication-metadata.json` and produce normal self-canonicals, crawlable directory links, sitemaps, RSS and social metadata as appropriate. This module does not independently rewrite routing or the sitemap.

Without an authorization record the integration returns `prepared_awaiting_exact_version_owner_release` and writes no public files. `PROGRAM_PREVIEW=1` or `{preview:true}` produces marked private drafts with an explicit `noindex,follow`, no Article publication schema and no search-index entries. Staging still needs the existing access-control policy; noindex is not authentication.

Run `node scripts/completion-editorial-extra.cjs` to regenerate only the private documentation packet. It does not build or release the site.

## Invariants

- Article and referenced source records are hashed together.
- Organization attribution is truthful; no personal human review is asserted.
- Future or backdated release days and future recording instants are rejected.
- New content cannot silently replace an already published canonical.
- Existing first-publication dates are preserved for a declared material revision; identical rebuilds retain their prior dates.
- If the upstream publisher resets its metadata file, an article can recover its own history only from its owned release record with exact ID/route/content-and-source hash, truthful past dates, and matching retained HTML ownership and Article schema. Foreign HTML, a wrong module marker, corrupt records and mismatched dates do not establish ownership.
- A missing next-action destination or canonical collision fails the batch before public page writes.
- Existing search entries and publication metadata are merged; original first-eight release data is untouched.
- The generated release manifest says `confirmedDeployment:false`; successful generation is not proof of production deployment.

## Executed checks

| Check | Actual result |
| --- | --- |
| `node scripts/completion-editorial-extra.cjs` | Valid: 4 articles, 3,826 words, 23 used sources; documentation prepared |
| Initial `node --test scripts/completion-editorial-extra.test.cjs` | 14 passed, 0 failed |
| Final extra suite including full-chain metadata-reset regression | 16 passed, 0 failed |
| Final combined first-eight and extra editorial regression run | 32 passed, 0 failed |
| Scoped ESLint on the content modules, shared history helper and changed test suites | Passed |
| Read-only preflight against current `dist` | All four canonicals available for a new article; no published collision; all next-action page files exist |
| Private document relative-link audit | 6 Markdown files checked; 0 broken relative links |
| Global build / final SEO / browser visual review / live deployment | Parent release tasks; not run or claimed by this bounded task |

Tests exercise the documented Terra shared-setting failure; North side-bracket conflict and conditional AIO fit; RTX memory-variant/chart-method scope; used warranty/diagnostic limits; source validation; exact pin changes; no-public-write default; private preview exclusion; stable dates; collision/missing-link preflight; subset releases; search/metadata preservation and the six continuing hard blockers.

The parent’s second full build exposed a gap that the initial module-only idempotency test did not cover: the upstream publisher resets `master-publication-metadata.json` while the new guide HTML remains. Both suites now simulate that reset between passes and confirm preserved dates through their separate owned release records. Additional cases reject a changed hash, ID/route, date, ownership marker, other article HTML, duplicate record or invented human-review claim. A read-only check on the actual failed-build output recovered the five surviving new first-eight pages; the three upstream-regenerated canonical revisions appropriately retained ordinary revision handling.

The read-only `dist` check found no existing public article at any of the four target routes and no missing recommended next-action file. It does not prove that the final integrated pages have already rendered correctly or been deployed.

## Research findings and access limits

All consequential statements use primary manufacturer documentation or an original test publisher. Full inspected sources, version notes and limits are in `SOURCES.json`; the articles link them at the relevant sections.

- The original North PDF specification table was inspected as extracted text; a later research-tool screenshot attempt did not resolve as a PDF. No photograph, drawing or screenshot was imported into the site, and that screenshot failure is not evidence of a broken public PDF.
- Noctua’s exact 7800X3D table lists NH-U12A with compatible mounting and the manufacturer’s suitability category. That category is not converted into a measured temperature or an overclock guarantee.
- TechSpot’s original candidate and PCIe/capacity studies were inspected. No benchmark table is copied or added to the site’s measured dataset.
- TechPowerUp retrieval was blocked by robots in the research tool. It was not bypassed and supplied no article fact.
- Current exact retailer offers and matching full-system acoustic/thermal/3060-upgrade measurements were not established. Recommendations remain conditional accordingly.

## Remaining release work

1. Parent reviews the full packet and records the existing authorized owner instruction against these exact versions without a fake human-review attestation.
2. Integrate at the documented point; run the existing global release/SEO/routing checks.
3. Inspect the four rendered guides, mobile tables, source links, bylines, dates, search and guide-directory discovery.
4. Verify production deployment through the already authorized workflow and report the actual result separately.

This is a working source-backed content implementation. It is not a claim that every original priced/tested editorial brief or every broader master-program feature is complete.
