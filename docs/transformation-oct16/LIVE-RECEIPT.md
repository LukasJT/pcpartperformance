# October 16 production release receipt

- Site: https://www.pcpartperformance.com/
- Production branch: `codex/stage2-publication-2026-10-04`.
- Deployed commit: `ecb2d0845c81e5d992e32af8d4365a15da4379cd`.
- Main implementation: `32ed472ab40a2a0e40e572c0daf72afa8d21c098`; final formatting cleanup: `ecb2d08`.
- Release marker generated: October 16, 2026, 23:41:30 UTC; exact-commit HTTP verification: 23:43:45 UTC.
- Cloudflare Workers build: **success**, recorded in `qa/cloudflare-build.json`.
- Repository connectivity: `git fsck --connectivity-only --no-dangling` exit 0. No reset, force push or permission change was used.

## Verified outcome

All 57 local command groups passed. The live verifier passed 26 public HTTP/API checks, including 14 feature routes, normal canonicals, discovery, real 404s, shared-state exclusions, model coverage and current exact-listing prices. Production has no local QA injection or staging flag.

The actual live browser showed the revised homepage/navigation, calm empty Guided builder, starter build with 11 component instances, enabled **Download build report**, partial priced subtotal, My PC workspace and a readable mobile light-mode report. The JSON report uses the internal versioned schema `pcp-readiness-passport-v1`; visible labels and the download filename use **build report**. Printing uses the browser's print/PDF facility.

Private manual quotes and notes are not carried in public parts links. Downloads/backups can contain the visitor's private quotes, as the interface explains.

## Evidence

- [Full release report](RELEASE-REPORT.md)
- [Live HTTP/API receipt](qa/live-verification.json)
- [Live browser receipt](qa/live-browser.json)
- [Local command results](qa/final-test-commands.json)
- [Final local performance samples](qa/builder-lab-final.json)
- [Payload comparison](qa/payload-before-after.json)
- [Live desktop report](qa/live-build-report.png)
- [Live mobile report](qa/live-build-report-mobile.png)
- [Live homepage](qa/live-home-desktop.png)

One browser-native ViewTransition cancellation occurred during viewport/theme checks and did not block the exercised workflow. Local lab LCP/CLS are not field Core Web Vitals, and no field INP or traffic result is claimed.

## Scope still limited

This release does not create all-store prices, missing licensed 3D assets, unprovided measured PC FPS data, Search Console access, account sync or delivery services. Existing supported morning checks continue; the live queried CA cohort returned three offers. Content delivered here is one new guide plus two material revisions, with primary sources and original diagrams. The remaining master-program ambitions are tracked in `PROGRAM-COVERAGE.md`, not counted as completed.

## Rollback

Use a normal reviewed revert of the final formatting cleanup and main implementation commits, in that order, on a current production-based branch. Preserve later scheduled price commits; never reset or force-push production. Run the release checks, push through the existing integration and verify the resulting live marker and routes again. No destructive local-storage migration was performed.

These post-deployment receipts can be committed to the implementation branch without another production deployment; the deployed code commit above remains the reference.
