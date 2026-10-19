# Release verification

## Public website

Final production marker: `fc71a500d83cc74b3345c044c0a109d524cf1886`, verified October19 at20:44:18UTC with all26 production checks. This is the automated data commit on top of the tested UI and CI-handoff correction. The live price-history endpoint separately returned all96 recorded rows. [Final marker receipt](qa/live/current-release.json) · [Public history receipt](qa/live/price-history.json).

- UI/data release: `dfda28db6f87a97231e04d55a63b649384a95fac`.
- Domain: https://www.pcpartperformance.com/
- Exact marker and26 production HTTP/canonical/privacy/asset checks passed at2026-10-19T20:35:42Z.
-70 actual public browser states passed at320/390/1440px in light/dark: homepage rows, menu,150% phone text, picker/expansion/short viewport, save toolbar, preferences andFPS.
- Nine further public checks confirmed1,299 hardware records,219 prebuilt rows,110 newPC/508 newconsole records and source-correct new destinations.
- Local final97 test-command groups and212 layout states passed;146 axe cases found no automated violations. All results remain bounded by the documented emulation/testing limits.

[Exact UI marker receipt](qa/live/ui-release.json) · [Live rendered report](qa/live/report.json) · [Live new data](qa/live/new-data.json).

## Daily workflow

Activated only `.github/workflows/daily-public-prices.yml` on the unrelated default branch; normal fast-forward, no website merge or history rewrite.

The first real run [39320708217](https://github.com/LukasJT/pcpartperformance/actions/runs/39320708217) collected successfully but did not upload its hidden `.operations-run/` folder. The publisher correctly stopped without modifying production data. GitHub's actual warnings and job outcomes are retained in `operations/first-run-annotations.json` and `operations/first-remote-run.json`.

Correction `ea4a6e0b` explicitly includes the fixed hidden report folder and fails collection when it is missing. The20 operations tests pass with a regression assertion. No secret or arbitrary workspace path is uploaded.

Corrected default-branch workflow commit: `5b8589e4bc7785cc2eff0c557cab9651fb1e60f1`. Definition equality was confirmed via the public GitHub API.

Real verification run [39321102310](https://github.com/LukasJT/pcpartperformance/actions/runs/39321102310) completed collection, uploaded a15,093-byte artifact, downloaded it, revalidated its data and published commit `fc71a500d83cc74b3345c044c0a109d524cf1886`. All publication steps passed. The final source-health step deliberately failed because two registered retailer reads remained unavailable; the run is **degraded, not an all-green success**.

Actual published status:1,299 catalog identities,10 updated/current observations,96 retained historical observations,7/7 source indexes read,39 unpublished leads,zero invalid records andtwo retailer failures. No news article or unreviewed hardware proposal was auto-published. [Job/artifact/commit receipt](operations/corrected-remote-run.json) · [Source data status](../../data/operations-status.json).

The workflow remains active at07:17 America/Toronto daily, subject to GitHub scheduling delays. The next future scheduled run has not been observed. Provider-source limitations remain open; they have not been hidden to obtain a green badge.

Cloudflare automatically built that bot-authored data commit; no manual trigger or extra website commit was needed. Its exact public marker and the resulting price-history asset were then verified. This establishes the tested publication-to-deployment path for this run, not a guarantee that every future run or retailer will succeed.

## Remaining scope

This is a tested implementation checkpoint. Exhaustive hardware/photo/3D coverage, the stricter200 distinct core prebuilt configurations, licensed measured benchmarks, human review of36 drafts, physicaliOS/VoiceOver checks and owner-account retailer/GA4/GSC/Journey dependencies remain open. See the evidence-based [assessment](README.md) and [board](TASKS.md).
