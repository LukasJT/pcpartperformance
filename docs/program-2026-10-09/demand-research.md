# Demand research and query-to-page decisions

Research performed 2026-10-09. Scope: 18 distinct representative English queries and 20 search requests, including two repeated queries to obtain clearer source coverage. The exact queries, sources, page ownership, audience, regional relevance, required evidence, action and next step are in `query-to-page-map.json`.

## What this research establishes

Public results expose useful answer formats: complete parts lists, upgrade decisions, exact support checks, symptom-led diagnostics and version-specific game requirements. This is qualitative evidence of questions and competing formats. It does not establish keyword volume, difficulty, this site's positions, traffic potential, conversion rate or an exact index count.

No authorized Search Console, analytics or server-log dataset was available to this workstream. Searches were not a controlled personalized Google Canada/US ranking experiment. CAD/USD terms help identify a regional task; they do not make a result's displayed historical price a verified regional quote.

The priority labels below represent usefulness and consequence. They are hypotheses about where a coherent experience would help visitors, not a forecast of which page will acquire the most traffic. Related questions were inferred from visible question-shaped titles and inspected headings. No complete People Also Ask or autocomplete inventory was captured.

## Findings that should shape the implementation

### 1. Complete costs are a stronger answer than a budget headline

Budget results commonly lead to a parts list, retailer links and a reason for each component. The inspected original build guide links model choices to component sections and review evidence. Its promotions and historic subtotal are its own time-specific shopping context; they are not today's PC Part Performance offers. [GamersNexus build guide](https://gamersnexus.net/pc-builds/1491-mid-range-gaming-pc-build-guide-february-2026)

For PC Part Performance, retain the four bounded CAD/USD budget articles and connect them to `/tools/budget-build-lab/`. The current draft budget recommendations need exact bills of materials and available regional offers. Until then, publish no complete price claim. A usable quote worksheet is a separate tool; its existence does not remove the shopping dependency. Avoid dozens of overlapping price-point URLs.

### 2. A purchase comparison and an owner's upgrade are different intents

The inspected CPU comparison presents a price-conditioned buying question, specific games and graphics presets, rather than only a core-count table. That format helps a reader select evidence relevant to their own games. It does not let this site infer one uplift for every existing PC. [TechSpot original CPU comparison](https://www.techspot.com/review/3036-7800x3d-vs-9800x3d/)

Give the curated CPU comparison separate paths for a new buyer and an existing owner. Carry exact selected parts into `/upgrade/`, preserve owned components and compare whole-platform costs. The AM4 article, general platform-cost article and phased plan must answer distinct decisions. Consolidate paragraphs or briefs if editorial review finds them duplicating the same answer.

### 3. Exact variants and test conditions belong beside the recommendation

The inspected GPU-capacity comparison distinguishes settings and workload types when discussing the two variants. Its retail-price and verdict context belongs to that publication and date. Do not import its charts, composite result or current-stock assumption. [Tom's Hardware original capacity comparison](https://www.tomshardware.com/pc-components/gpus/geforce-rtx-5060-ti-8gb-vs-rtx-5060-ti-16gb-gpu-face-off)

The matching existing 8 GB/16 GB article deserves improvement rather than another near-identical page. Keep memory capacity and exact partner design in the shared identity and offer record. Link a specification comparison to `/performance/evidence/` when a performance claim requires game/preset evidence. The product workstream confirmed that the base RTX 5060 Ti 8 GB identity is not currently present; never fill that gap by borrowing the 16 GB card's record.

### 4. Compatibility questions are actionable when the unresolved step is explicit

MSI's official CPU-installation support directs readers to the board's CPU Support list and BIOS requirements. The named B650 support page was accessible to the research tool, but its extracted text did not contain the exact 9800X3D/minimum-BIOS row. That row remains a data dependency, not a reason to claim the pair is incompatible or fully verified. [MSI CPU-support procedure](https://www.msi.com/support/technical_details/MB_CPU_Upgrade_Installation), [exact B650 support destination](https://www.msi.com/Motherboard/MAG-B650-TOMAHAWK-WIFI/support)

Case-fit search titles focus on radiator occupancy, thickness and what a length figure includes. The original-case/Airflow manual surfaced as a source lead; a failed research fetch in this pass is not proof of a broken public manual. Keep the existing dimensions article, source-linked model pages and `/compatibility/` connected. Specific fit verdicts need exact variant/layout evidence or explicit manual measurements. A model preview is not that evidence.

The manufacturer cable page directly serves a reuse question and preserves cable-family distinctions. Feed that next check into the readiness report instead of presenting a universal PSU-wattage verdict. [CORSAIR cable compatibility](https://www.corsair.com/uk/en/s/psu-cable-compatibility)

### 5. Troubleshooting should lead to an observation before a purchase

Searches expose both symptom-specific diagnostics and broad universal-fix promises. The site's chosen answer should preserve a baseline, separate low average FPS from inconsistent delivery or a no-display boot, change one supported variable at a time and retain rollback steps. The official no-display page begins with the display/connection path and recent changes; model-specific firmware/CMOS actions still require the exact manual. [MSI no-display support](https://us.msi.com/support/technical_details/DT_Boot_No_Display)

Route these readers into `/troubleshooting/` and the matching complete article. A resolved setting issue may justify no purchase. Link to `/upgrade/` only when observations support examining a hardware constraint. Do not use a universal bottleneck percentage or security-disabling tweak script as the answer.

### 6. A game requirements hub needs versions, modes and honest coverage

The official Cyberpunk page separates the Update 2.0/Phantom Liberty requirements from older requirements and states a frame-generation condition for one mode. Epic's Fortnite page separates minimum, recommended and Epic Quality sections. Those are useful source-supported distinctions; neither establishes this site's independently measured FPS for an arbitrary selected PC. [CD PROJEKT RED requirements](https://support.cdprojektred.com/en/cyberpunk%20/pc/sp-technical/issue/1556/cyberpunk-2077-system-requirements), [Epic Games requirements](https://www.epicgames.com/help/c-34254770/c-80/a16548002?lang=en-US)

Use `/performance/evidence/`, the existing performance library and one thoroughly researched game article as the initial connection. Require permitted, comparable tests before exposing exact component-specific performance. Do not index the game × CPU × GPU × resolution matrix. A useful display-goal tool defines the goal and the evidence gap; it does not supply missing benchmarks.

### 7. Capacity decisions need actual workloads, not another generic definition page

The original application-capacity research distinguishes projects and application behavior instead of making one gaming/editor rule. The official beginner guide organizes preparation, component roles, assembly and setup. These are useful formats to connect to the site's exact kit selection, storage-capacity tools and Build School checklist. [Puget Systems workload research](https://www.pugetsystems.com/labs/articles/when-does-ram-capacity-impact-performance/), [Intel beginner guide](https://www.intel.com/content/www/us/en/gaming/resources/how-to-build-a-gaming-pc.html)

Improve the existing RAM-capacity and NVMe/SATA articles. Use contextual links to established primers rather than duplicating definitions across new URLs. Do not generalize one editing project into every creator workload or translate maximum sequential transfer rates into game FPS.

## Three relevant competitor pages compared

These are original publication pages, inspected through extracted HTML/text. This was an editorial/task comparison, not a visual browser audit or a scorecard of their entire sites. No competitor table, article prose, benchmark dataset or build list was copied.

| Original page | Useful observable format | Adaptation for this site | Evidence boundary |
| --- | --- | --- | --- |
| [GamersNexus budget build](https://gamersnexus.net/pc-builds/1491-mid-range-gaming-pc-build-guide-february-2026) | Parts table, per-component rationale, linked reviews, alternative choices and affiliate disclosure. | Exact checked revisions, explicit budget scope and a builder next step; allow a visitor to compare their own complete quotes. | Do not reuse the historical offers, promotions or broad performance phrasing as current local purchase evidence. |
| [TechSpot CPU decision](https://www.techspot.com/review/3036-7800x3d-vs-9800x3d/) | Direct buying question, game-specific sections, documented settings and price-dependent conclusion. | Separate new-buyer and existing-owner paths, with exact BIOS/cooler checks and complete replacement cost. | Do not convert a review suite into universal uplift or redistribute the measurements. |
| [Tom's Hardware capacity decision](https://www.tomshardware.com/pc-components/gpus/geforce-rtx-5060-ti-8gb-vs-rtx-5060-ti-16gb-gpu-face-off) | A specific memory-variant question, workload/setting context and readable tradeoffs. | Keep the exact capacity in shared identities and show the evidence needed for the visitor's own settings. | No copied chart, point-based winner, live offer claim or assumption that a related card is identical. |

Logical Increments was opened as another potentially relevant reference, but the research tool returned no extracted content. It is excluded from the three-page comparison. This says nothing about its public functionality. A Steam-support page also yielded limited extracted content; no detailed procedure was inferred from the snippet.

## Page ownership and next executable steps

1. Review the first-boot/build master and central upgrade/compatibility/troubleshooting drafts. Test the complete route to a readiness result and local save. These are P0 journey tasks, not a claim of higher search volume.
2. Add approved contextual links on category/product/article templates to the exact next tool. The blog remains the article home; `/build-school/` is the learning path, and the other hubs organize distinct tasks.
3. Obtain an exact current CAD and USD offer/BOM set before releasing a priced build revision. If that integration remains unavailable, leave the recommendation blocked and the worksheet clearly user-entered.
4. Review two curated GPU/CPU decisions and the matching RAM/storage articles. Keep only one main answer per intent and use the same stable entities as the builder. Never publish reversed duplicate comparison pairs.
5. Obtain authorized analytics/Search Console exports. Compare meaningful recent and preceding periods, with an appropriate same-period prior-year comparison where available; segment country, device, cluster and landing page. Populate measured metrics only from those actual exports.
6. Replace provisional priority with measured query/page evidence after release and adequate observation. Evaluate search acquisition separately from completed tool use, saved decisions and referrals. Annotate the release; do not attribute every subsequent change to it.

## Status and validation

The JSON map is a maintainable implementation artifact, not a publication approval. Existing routes were read from the actual generated site and `scripts/program-editorial.cjs`; draft/hub targets are labeled separately. Final validation matched every query target and related article ID to the six hub destinations and final 40-item editorial manifest. It also checked all source IDs and confirmed 18 distinct queries. A snapshot of all 40 editorial intents records which have a related researched query and which remain a usefulness hypothesis without a dedicated query in this pass.

The first game-specific editorial item is Fortnite. Cyberpunk maps to the evidence hub and official source; a separate Cyberpunk article remains a later hypothesis, not an article claimed complete by this map.

No outreach was sent, analytics installed, production deployment performed or traffic result claimed by this workstream. Human editorial review, actual offer coverage, exact BIOS data and permitted comparable benchmarks remain separate release gates.
