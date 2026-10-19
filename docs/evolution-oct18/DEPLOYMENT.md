# October 19 release

## Current release state

**Verified locally; production publication in progress.** The owner explicitly requested an iPhone-accessible preview or a live-domain push. Browser approval is now functioning. This record supersedes the initial blocked checkpoint's browser/Git status. Do not infer completed production deployment from this preparation; the final public commit-marker receipt establishes it.

## Release verification

- Normal build: 1,594 HTML pages; 1,089 intended indexable and 505 excluded.
- All 86 repository check groups pass after preserving current production's newer price observations (`cf9f7a0`). Seven original payload ceilings pass; no limits were raised.
- HTML and resource audits pass; scoped types and lint pass.
- Initial visual run: 348 captures across 19 destinations, nine widths (320 through 1920) and light/dark. It identified six cases of the same product-table overflow at 320/360/375px.
- Corrected the product grid's minimum sizing and constrained its scrollable table wrapper. All 18 product-page width/theme cases then pass. Other destination styles were unchanged. The combined [acceptance receipt](qa/acceptance.json) records 348 accepted states from 366 captures with zero remaining detected overflow, broken/pending visible images or browser errors.
- Seven actual isolated Edge flows pass: compact menu/focus/consent behavior at 320px; six palette persistence and motion preferences; builder stages/CPU and PSU pickers/filter/search/selection; local save/restore; all eight diagrams; no-JavaScript content; actual 3D loading/retry/resolution/close with preserved parts.
- The 3D recovery case deliberately aborts the first model-catalog request, then permits retry. At least one real model renders in the actual WebGL canvas. Reduced motion disables auto rotation; closing returns focus and keeps the selected build.
- Inspected actual mobile homepage, PSU picker, light-mode builder, desktop homepage, product correction and 3D controls. Captures are emulated Edge, not physical Safari screenshots. Actual iPhone testing remains a practical follow-up.

The first product recheck used a stale preview Worker manifest and therefore could not serve the new hashed product stylesheet. Restarting the owned preview after rebuilding resolves that local-preview issue. The runner now explicitly records failed CSS/JS responses and bounds image waits to visible images. No missing-style result is treated as a visual pass.

## Production path

Existing Git integration only: push the reviewed branch HEAD to `refs/heads/codex/stage2-publication-2026-10-04`, which Cloudflare builds for `pcpartperformance-live`. No force push, unrelated `main` modification, DNS migration or new host. The newer production price observations were merged normally with automatic stashing disabled; saved local changes were retained.

After pushing, verify the exact `/data/release.json` commit, HTTP/HTML/API/asset smoke checks and representative rendered mobile/desktop pages. Keep source-complete, pushed and verified-live states separate. Public endpoint: `https://www.pcpartperformance.com/`.

## Still deliberately separate

The 36 new articles remain complete **unpublished drafts** requiring actual human editorial review. Existing approved content stays public. Journey, GA4 activation, provider-issued assets, qualifying audience evidence and legal/identity actions remain owner/provider dependencies. No analytics or ad acceptance, performance uplift, rankings, revenue or new model coverage is invented.

Prior verified production reference: `e8c321b90d75e4dca9f0e96ded6b39dd71b83fd4`; production price update retained: `cf9f7a0`. Roll back through the prior host deployment or a reviewed specific revert, preserving unrelated subsequent changes. Do not reset or force-push shared history.
