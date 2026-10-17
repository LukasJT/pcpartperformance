# Release and operating notes

## Existing deployment

- Production host: `https://www.pcpartperformance.com/`; Cloudflare Worker `pcpartperformance-live`.
- Production Git branch: `codex/stage2-publication-2026-10-04`.
- This work branch: `codex/product-transformation-2026-10-16`.
- Pre-continuation repository checkpoint: `392b938`; existing deployed implementation ancestor: `ecb2d0845c81e5d992e32af8d4365a15da4379cd`.
- Preserve newer production price commits. Fetch before pushing. Use normal reviewed commits and fast-forward pushes; never reset/force-push another branch or replace the default branch's unrelated work.

## Reproduce and release

1. Regenerate the compact retained runtime with `node scripts/prepare-master-runtime.cjs` after changing its source controllers.
2. Build using `node scripts/build-pages.cjs`. The build checks article version pins and creator/image identities. No new framework, secret or external account is needed to generate the site.
3. Run `node scripts/run-master-checks.cjs`, source lint/scoped type checks, `node scripts/completion-html-audit.cjs`, `node scripts/completion-resource-audit.cjs` and the changed browser journey. Do not count a stale preview manifest or missing fingerprinted stylesheet as a valid styled audit; restart the local Worker adapter after a full build.
4. Inspect/stage source, actual permitted assets and generated output. Commit, push the work branch and the existing production branch, and wait for the existing Cloudflare Git deployment.
5. Run `node --use-system-ca scripts/completion-verify-live.mjs <full-production-commit>` and inspect the actual public browser result. `/data/release.json` must identify the expected commit; a successful push alone is not deployment proof.
6. After the tested workflow is present on the production branch, `node scripts/completion-publish-price-workflow.cjs` inspects the default-branch update; `--push` performs the authorized file-only change. It preserves the default branch's other projects. Verify the actual GitHub job and following production release separately.

The retained workflow checks the fixed sources, runs one ordinary daily collector and commits both `data/public-price-snapshot.json` and `data/public-price-history.json`. Its declared schedule is 07:17 America/Toronto; GitHub may start it later. The public status API describes the schedule and exact included targets. Do not add a duplicate automation, promise continuous polling or rotate identities to evade a source restriction.

## Data, privacy and recovery

- Unknown price is not zero. Sold-out, expired and unknown-condition observations do not enter purchase minima. A historical row is validated at its original check time and never becomes a current offer.
- The source parser accepts only fixed registered URLs/identities. Arbitrary pasted URLs, regions, merchant names and query fields do not become upstream requests.
- Existing browser revision keys are preserved. The new retention record is separate and bounded; backups accept supported older formats and reject conflicting/oversize content. Import review/cancel, storage quota errors and corrupt data do not silently erase existing records.
- No private note, warranty reference, search string or parts-list payload is sent by optional analytics. Measurement is disabled in generated pages; explicit activation requires a real configured adapter and consent QA. Notification/email/account-sync systems remain inactive.
- Model image/GLB replacements require source identity, license/credit, hash, decoded textures, actual framing and browser verification. A source scan's original material/condition is not evidence of a pristine retail item or installed clearance.

## Rollback

The Git history and source snapshots are the release backup. For a code regression, create a normal revert commit of the offending change on a release branch, run the relevant build/tests and deploy through the same Git flow. Do not force-push the production branch or remove later valid price observations. Reverting display/controller code must preserve existing browser storage keys and old-link handling.

For an incorrect retailer observation, disable/reject the exact target, correct its fixture and publish a truthful new snapshot. Preserve the historical record and explanation; do not overwrite an old source timestamp to make it appear freshly checked. If a snapshot is expired during a failure, the interface should remain unknown.

For a broken image/model, retain the source and license record, hold the invalid mapping and show the recoverable unavailable state. Restore a previous compatible asset only when it represents the selected identity; do not substitute a different partner variant.

## Continuing work

The [90-day operating plan](../transformation-oct16/MAINTENANCE-90-DAYS.md) supplies capacity, weekly sequencing and evidence-driven refresh triggers. [Distribution drafts](../growth/distribution-drafts.md) are preparation only; no creator/community message, newsletter or post has been sent. Prior reports describing prices as entirely inactive are historical and must not override the current fixed-listing pipeline, timestamps or verified workflow receipt.
