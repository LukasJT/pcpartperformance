# Daily operations: implementation and release contract

Evidence date: October 19, 2026. This is an operational increment, not a claim that the complete site directive is finished.

## What now runs

`node --use-system-ca scripts/total-operations.mjs --online --collect-prices`

The command collects the **existing 12 exact listings for nine products**, validates freshness and historical observations, audits the generated shopping catalog's identities/local image paths, and reads seven fixed official source indexes. It writes `last-run.json`, `source-state.json`, `review-queue.json`, `operations-status.json`, a summary, and price artifacts to this directory. It never writes an article, review approval, article date, executable import or deployed asset.

Without flags, the command performs an offline audit with zero source requests. `--ci-output` uses `.operations-run/`. No arbitrary URL, output path, executable plugin or visitor-provided fetch argument is accepted by the CLI.

The source registry covers AMD/NVIDIA announcements, Intel/ASUS security indexes, Nintendo news and Google documentation/learning guidance. It is a small inspected maintenance cohort, **not a comprehensive hardware, game-release or news feed**. Initial snapshots may discover older material; a discovery timestamp is not a publication date. Changed markup can produce a false change signal.

## Workflow and permissions

The existing `daily-public-prices.yml` keeps its 07:17 America/Toronto schedule. GitHub can delay a scheduled start. The revised workflow separates:

1. **Read-only collection:** checkout without persisted credentials, validate, collect, retain a 30-day report artifact and write a native job summary.
2. **Fixed data publication:** a separate job with `contents: write`, downloads only this same run's artifact, revalidates and normalizes its JSON, then commits only five explicit data files. No remote document is executed. No article or source-code file can enter the staged set.

The publisher keeps a concurrent newer exact offer and merges existing real history before writing. Conflicting observations fail validation. Expired offers are removed from current prices, not erased from legitimate history. A failed source produces a degraded report and a failing final workflow step after any valid freshness update is preserved. A catalog/data-integrity failure prevents publication.

Every external action is pinned to a verified full SHA. The new artifact actions' commit pages were inspected. This does not replace continuing supply-chain review or repository branch protection.

## Fixed publication files

- `data/public-price-snapshot.json`
- `data/public-price-history.json`
- `data/operations-source-state.json`
- `data/operations-review-queue.json`
- `data/operations-status.json`

These source leads are unpublished review data. They are not added to blog/news routes, feeds, Article markup, news sitemaps or editorial approvals. The normal site's price service reads its existing snapshot/history assets; no new public write API was added.

## Actual execution evidence

- Latest actual online run completed **October 19, 2026, at 20:12:49 UTC**: **1,299 catalog identities**, with zero identity/local-image-path issues. This is an operational integrity check, not specification or exhaustive-SKU certification. The initial offline baseline contained 1,236 identities.
- The latest run refreshed **10 of 12 registered retail listings**: ten current valid observations, six new/in-stock, zero expired or invalid observations, and **86 actual historical observations** after preserving concurrent production history. These are checked snapshots, not continuously live prices; tax and shipping are excluded.
- **All seven official source indexes were read successfully**, with zero index failures. The review queue contains 39 unpublished leads, zero new leads in this repeat run and zero published articles or catalog records. Article dates were not changed.
- **Two retailer reads remain unavailable**, so the actual status is deliberately **degraded**: Canada Computers B650 returned `offer_identity_invalid` (the inspected structured offer lacked its required URL), and Newegg US 9800X3D returned `source_access_restricted`. No price was fabricated, access challenge bypassed or matching rule relaxed to hide these failures. See `last-run.json` and `b650-source-diagnostic.json`.
- The first monitor run read six of seven indexes. Google's official RSS endpoint returned `Content-Type: None`. A source-specific fallback now accepts only an actual RSS 2.0 document from that exact registered feed; arbitrary HTML with missing content type still fails. See final `last-run.json` for the retest.
- `node --test scripts/total-operations.test.mjs`: 20 tests passed at this checkpoint, including unsafe redirects/DNS, entity and size limits, price identity, artifact validation, concurrent observations, and synthetic backup/restore/rollback.
- Existing `completion-security.test.mjs`: seven checks passed.
- Existing `oct16-workspace.test.cjs`: 32 checks passed, including privacy, failed writes, imports, revisions and private backups.
- Public read-only GitHub API confirmed the **old** deployed workflow active with the five latest runs successful. Latest inspected scheduled run: [39294379893](https://github.com/LukasJT/pcpartperformance/actions/runs/39294379893), October 19, 2026. This does not verify this new workflow has executed remotely. The connector itself was unavailable; the successful check used the public API without a token.

## Release steps

1. Fetch and preserve newer production price/history commits before release. The existing daily job can advance the branch while development is underway.
2. Run the operations tests and existing price parser/snapshot/history tests.
3. Inspect the actual online report and unavailable source codes; do not relabel them as successful.
4. Release the tested source/data to `codex/stage2-publication-2026-10-04` through the existing authorized deployment flow.
5. Only then use the existing **file-only** `completion-publish-price-workflow.cjs` helper to update the default-branch workflow. Do not merge this website over unrelated default-branch content. Its production-file equality guard remains required.
6. Inspect the first actual revised workflow run, its artifact, fixed-file commit and resulting domain. A local run is not a scheduled-run receipt. Re-run the public status command after release.

## Owner-controlled blockers

Amazon Creators API, Best Buy and other unconnected publisher feeds require approved accounts, appropriate rights and server-side credentials. None are configured or simulated. Missing prices remain unknown, with existing retailer search links. No secret should be pasted into a public build or committed.

Search Console and GA4 access are absent from this increment. No query volume, ranking, traffic, premium sessions or Journey eligibility was inferred. The existing owner-ready publisher checklist remains the application path. No account-specific ad script, ads.txt record, agreement acceptance, custom email delivery or alert backend was invented.

## Rollback and continued operation

Revert the workflow file through the existing file-only helper to restore its previous collector. Data history is source-controlled; preserve a copy before any manual repair. Revert source code in the production branch by normal commit, never a destructive force push. JSON normalization is idempotent; restoring an old snapshot does **not** make its expired prices current.

Saved visitor work remains in the visitor's browser. The existing My PC export contains private notes/acquisition records; builder revisions export separately. The tests use synthetic in-memory fixtures, not any person's browser storage. No central backup can recover a browser that was cleared before export. Store exported private backups securely and test import on a separate browser profile before deleting originals.

## Next commands

```text
node --test scripts/total-operations.test.mjs
node scripts/completion-security.test.mjs
node scripts/oct16-workspace.test.cjs
node --use-system-ca scripts/total-operations.mjs --online --collect-prices
node --use-system-ca scripts/total-operations-remote.mjs
```

No deployment is performed by these commands. The CI-only publisher command requires the fixed same-run `.operations-artifact/` directory.
