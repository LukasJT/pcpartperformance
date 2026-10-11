# Release, backups and rollback

**Historical checklist.** Deployment has since been authorized. The current release uses normal production output; see the [October 11 release report](../program-2026-10-11/FINAL-REPORT.md). Do not interpret this checkpoint's staging state as the final release state.

**Prepared, not executed.** The current `dist` is a noindex review build and must never be uploaded to production. Current automatic production branch: `codex/stage2-publication-2026-10-04`. Do not push this program branch there without a later explicit release authorization.

## Before an authorized release

1. Review the actual diff, evidence/reviewer records, disabled integrations and remaining unknowns. Do not treat passing validation as human editorial review. Publish only an accepted small content batch; approved renderer currently creates staging copies, not a normal publication activation.
2. Preserve local uncommitted work in a recoverable Git commit/bundle or protected archive. Git commit/push was not performed in this task. Capture exact release SHA, current deployed SHA, Cloudflare version ID, Worker config and DNS/custom-domain state. Remote configuration backup requires account access and authorization; no remote backup was made here.
3. Keep canonical authorizations/review decisions and offer observations in `data/`/`scripts/`, outside generated `dist`. Back up those private source records with suitable access controls. Export only stripped public offer records. Local browser builds/watchlists belong to visitors and cannot be centrally backed up; provide exports.
4. Generate normal output: `node scripts/build-pages.cjs`. Ensure `PROGRAM_PREVIEW` is unset. Run `node scripts/check-program-release.cjs`, `node scripts/check-seo.cjs`, all package `check:program` commands and existing stage-two/model/cooling/phone checks. `npm` was not on this machine's PATH; direct Node CLIs were used.
5. Verify normal sitemap contains intended canonical URLs, draft list is empty, `/program-review/` is absent, no staging notice/global noindex leaks, and robots permits intended production crawling. Do not remove deliberate noindex from query/saved/search states.
6. Verify canonical www host, HTTPS, direct HTML assets, one-step extension redirects, curated reversed pairs, explicit editable comparisons, invalid route 404 and GET/HEAD/405 behavior on a protected non-production host. No public staging without access control; robots is not authentication.
7. Confirm build/upgrade/save/share and CAD/USD/partial totals on actual desktop/mobile browsers. Re-run the documented lab protocol if assets or behavior changed. No alerts or live feeds until real permissions, provider, consent/unsubscribe and jobs are tested.
8. Obtain explicit authorization for the concrete tested release. Deploy through the existing Cloudflare flow only then. No new framework or paid host is needed for this increment.

## After an authorized release

Verify apex→www redirect, www TLS, canonical route status, JS/CSS/images, errors, sitemap, indexing headers, disabled features and the complete visitor journeys directly on the live host. The current Node Worker tests mock assets; they do not replace this edge check. Annotate the actual release time/SHA in the consented analytics system if configured. Search Console/IndexNow submissions require ownership/access and authorization; neither guarantees indexing.

## Rollback

Restore the captured previous Cloudflare deployment/version and matching Worker/static assets/config together. Do not revert DNS by guessing. Retain new source observations, reviewer decisions and identity migration backups; schema/alias changes are idempotent and reviewed, not destructive deletion. Re-run live route/status, canonical, save/import and pricing-unknown checks against the restored version. Record the reason and exact reverted version. No production rollback was attempted here.

## Local checkpoint

Current review server: `http://127.0.0.1:4185/`, bound only to loopback and injected with preview-only lab instrumentation. Start using `node scripts/serve-program-preview.cjs` after `node -e "process.env.PROGRAM_PREVIEW='1';require('./scripts/build-pages.cjs')"`. It cannot be opened from a phone using that address. The baseline comparison server on 4186 is disposable reconstruction, not a live copy or alternate host.
