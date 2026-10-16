# Verified baseline and implementation decisions

Inspected October 16, 2026. Existing static generation + browser controllers + Cloudflare Worker is viable. No framework, CMS, authentication or hosting replacement is justified.

## Baseline

- Production home and builder inspected at 1440 × 900; empty builder inspected at 390 × 844. Screenshots: `qa/before-*`.
- Existing master check runner: **49/49 command groups passed** before source changes. Receipt: `qa/baseline-test-commands.json`. This is a regression baseline, not a claim of exhaustive accessibility or security certification.
- Production commit marker at inspection: `d0fc4a7`. Git also contains subsequent Oct15/16 scheduled price observations; those were merged, not overwritten.
- Important routes already exist: `/builder/`, `/upgrade/`, `/compare/`, `/compatibility/`, `/build-school/`, `/hardware/`, `/performance/`, `/performance/evidence/`, `/blog/`, `/news/`, `/prebuilts/`, `/laptops/`, `/phones/`, `/phones/size-compare/`, `/tools/`, `/saved/`, `/methodology/`, `/resources/`. Individual products use stable `/learn/<id>.html` routes. Preserve these.
- Existing capabilities include local saved revisions, reusable compatibility rules, manual fit/cost tools, guided preferences, fan placement, lazy 3D, source-linked console modes, search, print/export and editorial publication gates. Improve these rather than duplicating them.

## Confirmed issues and responses

| Priority | Finding | Response |
|---|---|---|
| P1 | No CPU-cooler selection in the actual builder/source slot list | Add 12 exact air/AIO records and append a cooler slot without shifting old share-link positions |
| P1 | Empty builder immediately showed ten unresolved checks and one outside-scope item | Use not-started and prerequisite-aware not-yet-checked states; no manufactured pass |
| P1 | Guided preferences existed, but the actual component picker still exposed all rows at once | Offer Guided / Expert over the same real picker and state |
| P1 | Existing saved builds and other saved items had separate destinations without a coherent workspace | Add `/my-pc/`, preserve original storage, expose notes, journal, differences and observed changes |
| P1 | Upgrade selection and positional links were narrower than builder slots | Use shared slot identities, keep legacy eight/nine-slot inputs, preserve extra instances |
| P1 | Readiness's spending worksheet did not include the same public daily observations as shopping | Consume the validated public-price interface, keep checked/manual amounts separate and unknowns visible |
| P1 | Homepage put phone/prebuilt/FPS promotions directly after the introduction, before showing the PC decision workflow | Keep clear PC actions and demonstrate narrow matches versus outstanding checks; secondary tools remain linked |
| P1 | Search mainly matched literal titles and omitted some exact SKUs | Add explicit aliases, bounded supported-question routing and separate comparison results |
| P1 | Adding a no-model category exposes hidden renderer assumptions | Make missing assets inspectable and guard unsupported layouts/load failures without fabricating meshes |

## Already addressed / retained

- Public content is generated into HTML; no blanket client-only rewrite is needed.
- Host/canonical policy, query-state exclusions, XML discovery, duplicate-identity review, structured-data restraint and release tests already exist. Revalidate their actual output.
- Daily exact-listing price checks already run through GitHub Actions and feed the existing Worker. Automatic does not mean comprehensive, instant or cheapest across every retailer.
- Current PC FPS defaults to insufficient measured evidence. Preserve this correction.
- Current 3D coverage before cooler addition is 840 parts: 105 downloaded-model mappings and 735 simplified previews. These are mappings, not necessarily 105 distinct assets, and none is clearance-certified. Recount after build.
- Existing catalogs include 84 regional prebuilt records and 42 regional laptop records. They are disclosed configuration directories, not an exhaustive live ranking.

## Unverified / externally blocked

- Private organic traffic, indexed-page counts, conversion rates, Core Web Vitals field metrics and revenue: unavailable without authorized data. Do not infer from public search results.
- Product-name duplicate groups require exact identity evidence; similar names are not approval to merge or redirect partner cards/revisions.
- New all-retailer feeds, background alerts and account synchronization require configured dependencies. No collection form should pretend they operate.
- Browser source fetch failures are not proof of an HTTP defect; use response/status checks and rendered inspection independently.

## Evidence boundaries

See `cooling-evidence.json`, `SEO-RESEARCH.md`, `QUERY-MAP.csv` and the editorial source data. Manufacturer socket support is not BIOS certification, socket compatibility is not mounting-kit availability, and a heatsink-body height is not automatically installed fan height. A 3D appearance is never a clearance result.

## Quality rubric

Assess with tests and screenshots: task clarity, builder/upgrade continuity, preserved storage, evidence semantics, honest totals, 3D failure recovery, mobile/keyboard operation, crawlable accurate metadata, bounded payloads and verified deployment. Record pass/partial/blocked in the release report; do not assign an unsupported 10/10 score.
