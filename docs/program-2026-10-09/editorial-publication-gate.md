# Editorial publication eligibility gate

## Current state

`scripts/program-editorial-review-decisions.json` contains an empty `decisions` array. No current article has a human-review record or publication approval. All 40 remain withheld; the 13 existing-intent originals must remain intact. The other 27 draft destinations must not be added to normal navigation, search, feeds or sitemaps.

The gate checks consistency of owner-entered declarations and evidence records. Software cannot prove that a named person exists, personally read an article or verified a hardware fact. The owner must enter truthful decisions after actual human review. Passing tests does not fulfill editorial review.

## State distinctions

1. **Research draft:** source checks and complete writing, with human approval absent.
2. **Publication eligible:** an applicable owner-entered human decision passes the version/hash, byline, date and evidence gates.
3. **Approved revision:** an explicitly requested review copy can be rendered for inspection, still undated, unindexed and not published.
4. **Published revision:** a separate publication adapter/release records the actual publication event and integrates the approved revision into the public content system.
5. **Deployed:** the authorized release reaches the host and its routes/HTML/metadata are independently verified.

Neither the resolver nor the CLI advances states 4 or 5. `publishable: true` is eligibility, not publication. `published`, `indexable`, `datePublished` and `dateModified` remain false/null in eligible copies.

## Files and read-only commands

```powershell
node scripts/program-editorial-review.cjs list
node scripts/program-editorial-review.cjs list --id 30 --json
node scripts/program-editorial-review.cjs template --id 30
node scripts/program-editorial-review.cjs check
node scripts/program-editorial-review.cjs check --file path-to-owner-decisions.json
node scripts/program-editorial-review.cjs self-test
```

`list` reports current fingerprints, status and actionable dependencies. `template` prints an incomplete record to stdout: its decision/date/name are unset, personal-review flag is false and attestations are empty. It cannot approve anything. `check` validates the supplied file and reports publishable/withheld counts without writing it. Invalid recorded decisions or an ambiguous registry return a nonzero exit code. An empty valid registry is the expected default and returns zero.

The CLI never writes approvals, fetches evidence, publishes, deploys or contacts another service. `--as-of` accepts a real ISO calendar date or UTC timestamp for reproducible tests. A release must use its actual current clock, not a hypothetical future test date.

## Pure integration contract

```javascript
const editorial = require('./program-editorial.cjs');
const review = require('./program-editorial-review.cjs');
const registry = review.readDecisionFile();
const context = {
  asOf: new Date().toISOString(),
  sources: editorial.sources
};
const report = review.resolveReviews(editorial.articles, registry, context);
```

The resolver is pure: no clock read, network request, filesystem write or source mutation occurs. `asOf` is explicit. `report.eligibleArticles` contains validated copies; the original `editorial.articles` array remains unchanged. `report.items` includes per-item issues and unresolved blockers. `report.registryIssues` identifies malformed, duplicate or unknown-identity decisions. A structurally ambiguous registry fails closed.

`report.preserveExistingRoutes` identifies withheld target routes. It does **not** prove an original exists at every target: preserve the existing original only where the normal-build inventory confirms one, and omit an absent new draft. Never replace an original with a draft, delete it because review is missing or redirect an unrelated missing article to the homepage.

`contentFingerprint(article, sources)` returns deterministic SHA-256 plus `contentVersion`. It binds all substantive article fields, per-item blockers/BOM/offers and the applicable source records. Workflow flags and publication dates are excluded; they cannot approve or invalidate prose by themselves. A prose, identity, source-scope or offer change requires review of the new hash. Object key order does not change it.

`eligibleCopy(article, decision, context)` revalidates the raw decision; a forged `{ publishable: true }` object is not an approval input.

## Required owner decision

A schema-1 registry has one current decision per article. Each decision identifies:

- Exact `articleId`, current `contentVersion` and `contentHash` from the read-only list.
- `decision`: `approve`, `needs_revision` or `reject`.
- `origin: human_entered`; automated or unknown-origin decisions cannot approve.
- A real nonfuture `reviewedAt` date, no earlier than the applicable inspected evidence.
- `reviewer.kind: human`, the actual human's name, `personallyReviewed: true` and the exact exported `HUMAN_ATTESTATION` after that work occurred.
- For approval, a truthful `byline` with type `person`, `organization` or `research_workflow`, name, public attribution and the exact `BYLINE_ATTESTATION` confirmed by that human. An organization/workflow byline must not masquerade as a named staff member, credential or first-party test.
- Evidence-backed `resolvedBlockers`, one resolution for each required data dependency. An empty list is valid only for an article with no data blockers.

Use public reviewer/attribution information; do not place credentials, private contact information or secrets in the record. Exact attestation strings are exported by the review module and shown by its documentation source. They are declarations to be made truthfully, not checkboxes a script may fill on behalf of a human.

`HUMAN_ATTESTATION`:

> I personally reviewed the complete article, its applicable sources and recommendation conditions. This is a human editorial decision.

`BYLINE_ATTESTATION`:

> I confirm that this byline and attribution accurately describe the authorship and research assistance.

Invalid/stale decisions keep the item a draft. `needs_revision` and `reject` can record a genuine human decision but never authorize publication. No reviewer or byline is populated for any current item by this implementation.

## Data blockers cannot be waived with a boolean

Every resolution needs inspected HTTPS-source or `repo:` evidence, a description, nonfuture inspection date and explicit human confirmation. Repository references cannot traverse parents. The validator does not fetch or execute evidence references.

Price/BOM dependencies for ED-02–ED-05, the same-budget premise for ED-14 and the finished application recommendation for ED-39 are pinned. Deleting a blocker from the article's flag list does not bypass them.

- **Verified BOM:** exact named revision, compatibility evidence, positive quantities, stable product IDs, model/part numbers, owned/required flags and documented roles. CPU, board, RAM, storage, case, PSU, cooling and graphics roles must be covered, including an evidenced included/integrated role when applicable.
- **Regional offers:** positive observed price; exact BOM product/part number; named seller and real product URL; CA/CAD or US/USD; condition and excluded charges; observation and unexpired expiry; exact availability evidence; every required new item covered. A search link, wrong variant, unknown stock, expired snapshot or partial subtotal does not pass.
- **Same-budget comparison:** two distinct exact observed offers, declared price-difference condition and explained basis. Historical review price commentary cannot supply it.
- **Application evidence:** original measured application/version/workload/test-context records with a documented citation-only rights basis. Requirements or game scores are not substituted for application measurements.

These checks make missing evidence explicit. They cannot establish the truth of a declared source or substitute for the human's factual review. The current empty budget arrays continue to fail even if someone enters bare `resolved` flags.

## Explicit rendering contract

`editorial.renderArticle()` remains **draft-only**, including when passed an eligible copy. It never changes mode because an approval flag exists.

For a validated review copy, explicitly call:

```javascript
const revision = editorial.renderApprovedRevision(
  rawArticle,
  ownerDecision,
  context,
  { availableRoutes: actualNormalBuildRouteInventory }
);
```

This revalidates the raw decision. Invalid decisions return `html: null`. An actual route inventory containing `/blog/` is mandatory. The copy displays the chosen truthful attribution and human review date, plus an **awaiting release** notice. It adds no Article schema, publication date, feed entry or sitemap entry.

The route inventory must include existing originals and separately eligible/released destinations, not all preview drafts. Related withheld new destinations are omitted. Existing originals remain linkable. Unavailable tool/product links are omitted, an unavailable next action falls back to `/blog/`, and an empty related-reading list offers the existing blog. Essential link intent still needs visual/editorial inspection.

## Next owner step for actual publication

1. Review and revise the complete selected article and sources. For priced/application recommendations, supply the missing real data and update prose accordingly; planning text is not a final shopping recommendation.
2. Recompute the exact hash **after** final content/data changes, then personally enter the matching decision and truthful byline. Run `check` and inspect the explicit reviewed revision on desktop/mobile.
3. In a separate publication integration, store the reviewed source revision in the existing maintained content system. Preserve the previous published revision for rollback; do not make an ephemeral eligible copy the only archive.
4. Record the actual first-publication date only when that publication occurs. For a substantive replacement of an existing article, preserve its documented original publication date and assign an accurate modification date for the released changes. Do not copy `reviewedAt` or the research date into either field automatically, and do not invent an unknown historical date.
5. Add visible authorship/review information and accurate eligible Article/Breadcrumb markup through the existing template. Do not invent credentials, offers or ratings. The actual canonical, heading and visible content must agree.
6. Add only the genuinely published canonical revision to ordinary navigation/search/RSS/sitemaps, with a truthful substantive last-modified date. Continue excluding arbitrary tool states, preview copies and withheld drafts. Keep related links pointed to available originals or approved destinations.
7. Run normal-build leakage, metadata/schema, canonical, links, feed/sitemap and browser checks. Verify rollback assets and obtain any separately required production-deployment authorization before activating the release.
8. Verify the deployed page, status, indexing directives and dates. If a later draft or decision becomes stale, preserve the last published revision; do not silently restore a much older original or delete the current public article. Refresh expired offers honestly rather than pretending they are current.

This next publication adapter/release step is deliberately not enabled here. No current item has moved past the research-draft state.

## Tests actually run

Twenty synthetic-only tests pass via `node scripts/program-editorial-review.cjs self-test`: matching human fixture; immutability; missing decision/reviewer/byline; edited body/source and stale version; automated declarations; future/impossible/before-evidence dates; explicit clock; pinned and unresolved BOM blockers; valid synthetic BOM/offers; expiry/currency/variant/stock failures; reject/revision states; ambiguous registries; stable ordering; forged eligibility; explicit undated rendering and withheld-link fallback; and zero real approvals in the default registry.

The normal 40-item editorial validator also passes after renderer refactoring. CLI `check`, `list --id 30` and `template --id 30` were exercised. Fixtures are isolated to the test module and never written into the default source decision file. No real article is approved by a test.
