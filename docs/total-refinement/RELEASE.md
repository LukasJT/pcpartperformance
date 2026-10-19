# Release verification

## Current production release

Published commit: `4d48bb72e9b0e7aa0dddb86212a2e94aea9347bc` on [PC Part Performance](https://www.pcpartperformance.com/). Cloudflare and the complete Linux validation succeeded. The exact public marker and 26 release checks passed at **2026-10-19 23:12:37 UTC**.

### Catalog, photographs and compatibility

- **79 additional reviewed photo assignments.** All 894 builder-eligible parts have accepted named-product or pictured-variant image bindings. Seven ambiguous inherited identities remain nonselectable recovery references. No neighboring SKU is substituted to fill those gaps.
- **1,311 hardware reference records**, including 935 PC components and 25 CPU coolers. The bounded intake adds 75 models: 20 partner GPUs, 17 processors, 21 memory modules, five SSDs and 12 coolers. Exact MPN and revision coverage remains incomplete.
- **120 additional exact prebuilt SKUs**, bringing the directory to 339 regional rows and 209 distinct CPU/GPU/RAM/storage signatures. The added Lenovo systems are historical/withdrawn; no current price or availability is inferred.
- **34 manufacturer-backed observations** across five cases and five PSUs. Five conflicting dimensions remain unknown. Saved references, original URLs and private local records remain recoverable.

Sources, gallery limitations and permissions are recorded in the [catalog/photo report](CATALOG-PHOTOS-OCT19.md). Supplier photography does not acquire an open license through this work.

### Tests and production evidence

| Check | Executed result |
| --- | --- |
| Full source/data/security/SEO suite | **109/109 command groups pass**, locally and in Ubuntu 24.04 / Node.js 24 |
| Delivered component images | **1,586 derivatives decode and match reviewed metadata/hashes** |
| Final public image/data verification | **241 checks pass**, including every new full/thumbnail hash, all 79 product-page images and delivered provenance/index data |
| Actual live photo and selection interactions | **214 checks pass** across 320, 390 and 1440 px |
| Responsive layouts | **212 local states and 70 public states pass**, including enlarged phone text, menus and pickers |
| Real user journeys | **Nine public journeys pass**, including save/restore, sharing, downloads, print and 3D failure recovery |
| Older saved identities | **All seven restore/save cases and My PC cards pass**; fresh selection and public search exclude them |
| Automated accessibility | **146 cases, zero reported violations**, across six palettes; this is not full WCAG certification |
| Generated SEO | **1,961 HTML pages / 1,451 indexable URLs** pass the generated contracts |
| Delivery and source checks | Original seven transfer budgets, TypeScript and scoped ESLint pass |

[Production marker](qa/photos-oct19-live/release.json) · [Image/hash verification](qa/photos-oct19-live/verification.json) · [Live photo interactions](qa/photos-oct19-live/report.json) · [Public layout](qa/catalog-live-layout/report.json) · [Public counts](qa/catalog-live-data/report.json) · [Saved recovery](qa/identity-final/report.json) · [Reviewed before/after screenshots](screenshots/README.md).

### Performance evidence and limits

Three cold Edge mobile lab samples per route used 4× CPU throttling, 150 ms latency and 1.6 Mbps downstream. Median LCP was 1,172 ms for the homepage, 1,268 ms for the builder and 1,028 ms for Game FPS. All nine samples made zero initial 3D requests.

The builder startup shift was reproduced at CLS 0.10298. Applying static layout geometry before deferred initialization reduced the final builder median to **0**, with a maximum of **0.03293**. Intermittent first-menu presentation delays remain open (280 ms homepage and 520 ms FPS outliers in the final run). These are local observations, not physical iPhone results or field p75 Core Web Vitals.

[Final lab measurements](qa/performance/report.json) · [Before the geometry fix](qa/catalog-performance-before/report.json) · [Controlled menu investigation](qa/menu-paint-oct19/report.json).

### Deployment and reproducible CI

The first managed build, 3270732a, failed. Its private log was unavailable through the broken browser-control connection. The application deployed successfully on the next managed build, 6ceeba45, and then on the final release above. No provider-failure cause is inferred.

The new read-only Linux workflow initially exposed an incorrect npm bootstrap, followed by image/GLB dependencies and temporary files outside the repository. The correction uses the existing frozen pnpm lockfile, declared repository-owned tools and portable fixtures. Bounded, encoded public failure annotations provide diagnostic context without retrieving stored credentials. The normal site builds before development dependencies are installed.

Sharp **0.35.5** fixes the [reviewed high-severity upstream advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w). The dated final dependency audit reports **zero known vulnerabilities**; this is not a guarantee against future advisories. These tools do not enter the public browser bundles.

[Successful Linux run](https://github.com/LukasJT/pcpartperformance/actions/runs/39339825603) · [Actual job and artifact receipt](qa/linux-validation/passed.json) · [Dependency audit](qa/linux-validation/dependency-audit.json) · [Tracked-source reproduction](qa/clean-source-oct19/report.json).

### Remaining scope

The entire master specification is not complete. Exhaustive catalog coverage, seven unresolved exact identities, supplier-photo permission records, licensed appearance models, measured benchmark coverage, human review of 36 article drafts, physical iOS/VoiceOver testing, further page refinement and broader authorized retailer feeds remain open. GA4/GSC evidence and Journey activation require the owner's accounts and provider steps. No unverified content, prices, FPS, acceptance or 10/10 score is claimed.

See the [quality rubric](README.md), [implementation board](TASKS.md) and [catalog/photo limitations](CATALOG-PHOTOS-OCT19.md).

## Previous release — website and daily workflow

Previous production marker: `fc71a500d83cc74b3345c044c0a109d524cf1886`, verified October19 at20:44:18UTC with all26 production checks. This is the automated data commit on top of the tested UI and CI-handoff correction. The live price-history endpoint separately returned all96 recorded rows. [Final marker receipt](qa/live/current-release.json) · [Public history receipt](qa/live/price-history.json).

- UI/data release: `dfda28db6f87a97231e04d55a63b649384a95fac`.
- Domain: https://www.pcpartperformance.com/
- Exact marker and26 production HTTP/canonical/privacy/asset checks passed at2026-10-19T20:35:42Z.
- 70 actual public browser states passed at320/390/1440px in light/dark: homepage rows, menu,150% phone text, picker/expansion/short viewport, save toolbar, preferences andFPS.
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

The current continuation meets the stricter200 distinct core prebuilt target at209. Exhaustive hardware/photo/3D coverage, licensed measured benchmarks, human review of36 drafts, physicaliOS/VoiceOver checks and owner-account retailer/GA4/GSC/Journey dependencies remain open. See the evidence-based [assessment](README.md) and [board](TASKS.md).
