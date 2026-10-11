# Editorial checkpoint — October 9, 2026

## Delivered scope

The staging content module contains 40 complete research drafts and 23,713 original words, excluding descriptions, source lists and rendering boilerplate. Individual item counts are 549–674 words; the range is a report, not an enforced editorial word target. Each item has a distinct intent, intended reader, answer summary, complete body, source references, practical next action and related reading.

Thirteen targets materially improve an existing route. Twenty-seven are new draft intents. The existing article inventory was inspected in `feature-articles.cjs`, `blog-additions.cjs`, `publication-content.cjs` and `seo-launch-content.cjs`; its existing useful topics were retained rather than counted as absent. A short article was not classified as defective solely because of length.

All 40 records are `evidence_checked` and `needs_human_review`. None is publishable, published or approved for indexing. No human reviewer, staff biography, first-party test, publication date or substantive modification date has been invented. The module renders a visible staging note and produces no Article schema, RSS entry or sitemap entry.

## Files and API

- `scripts/program-editorial.cjs`: article content, escaped HTML renderer, intent-based internal connections, validator and documentation writer.
- `scripts/program-editorial-sources.cjs`: 42 inspected source records, model/version scope, consequential claims, evidence date, rights limitation and refresh target.
- `editorial-status.json`: task IDs ED-01–ED-40, dependencies, routes, source IDs, gates and limitations.
- `editorial-query-map.json`: query hypotheses, readers, existing matching routes, proposed actions and next steps. These are provisional qualitative intents; no keyword volume, ranking or traffic is claimed.
- `editorial-source-register.json`: portable source registry.

Exports: `articles`, `sources`, `renderArticle(articleOrId, options)`, `renderApprovedRevision(article, decision, context, options)`, `validateEditorial()`, `wordCount(article)`, `evidenceDate`, `writeDocumentation()`.

`renderArticle` accepts an article object, a two-digit task ID or its target route. Pass `{ includeHeading: false }` only when a surrounding template supplies the article's main heading. Product references use existing stable `/learn/<id>.html` destinations. The module does not perform a build, publish files, fetch retailers or enable an integration on import.

The parent staging integration must enforce the release gate and noindex headers/meta directives. Source-side draft flags alone are not an access-control mechanism. Production must not import or render the draft dataset, alter existing published pages with it, or link newly absent draft routes until the appropriate publication decision exists.

The maintainable owner-decision gate is now implemented in `scripts/program-editorial-review.cjs` with a default-empty source registry. Its pure resolver checks exact content/source hash and version, an actual owner-entered human declaration/byline decision, dates and evidence dependencies. It never approves on behalf of a human or publishes. The 20 synthetic-only tests pass; current real approval count remains zero. See [the publication eligibility and rendering contract](editorial-publication-gate.md) for CLI commands and the separate owner release step needed for byline/schema/date/feed/sitemap integration and withheld-route fallback.

## Confirmed findings and scope

| Finding | Classification | Treatment |
| --- | --- | --- |
| Existing upgrade, memory, storage, fit and comparison resources exist | Already addressed foundation | Materially improve staged copies at established URLs |
| Exact MSI lane-sharing rule is documented | Confirmed | Explain M2_3/PCI_E2 using the actual manual and current specification |
| A current regional offer set/final priced BOM is not available to this workstream | Confirmed dependency | Keep budget shopping recommendations blocked |
| Exact same-budget RTX 5060 Ti/RX 9060 XT offers are not established | Confirmed dependency | Publish no same-price or current best-value claim |
| No independent human editorial approval exists for these drafts | Confirmed dependency | All publication/indexing gates remain closed |
| Query priorities and traffic demand lack authorized Search Console data | Unverified demand | Keep the intent map provisional; do not fabricate metrics |
| No site-owned hardware measurements were performed | Confirmed limitation | Distinguish requirements/specifications from tests and estimates |

## Special evidence records

**ED-30: MSI MAG B650 TOMAHAWK WIFI.** The official 453-page multilingual PDF was downloaded and its English printed pages 16–17, 29 and 34 inspected (PDF pages 18–19, 31 and 36). The PDF remains outside the repository. The article correctly describes M2_3 at up to PCIe 4.0 x4 alone, PCI_E2 at up to PCIe 4.0 x2, and both at x2 when both positions are populated. It separately preserves the current specification's CPU-dependent PCI_E1 and M2_2 conditions. A link width is not converted into a workload slowdown percentage.

**ED-17: motherboard comparison.** MAG B650 TOMAHAWK WIFI is distinct from B850/MAX. B650 AORUS ELITE AX rev. 1.0/1.1 is distinct from rev. 1.2, V2 and ICE. The article separates front and rear USB and records the GIGABYTE revision-dependent wireless implementation. It does not assign an FPS or thermal ranking to a specification table.

**ED-18: cooling example.** The CPU is Ryzen 7 7800X3D, the case is the original North, and cooler examples are the original NH-D15 and H100i RGB PRO XT CW-9060043-WW. Manufacturer geometry informs installation questions. Comparable thermal/acoustic performance is unavailable; no winner, temperature or noise figure is asserted.

**Original game/CPU measurements.** Original TechSpot and GamersNexus tests are cited with historical conditions and version limitations. No chart, entire benchmark table or dataset was copied. Historical prices are not current offers, and outside results are not relabeled as this site's testing.

## Blocked recommendations

| Task | Text completed | Additional evidence needed |
| --- | --- | --- |
| ED-02: $1,000 CAD | Budget scope, whole-cost worksheet, matching and offer-record process | Exact compatible BOM/revision and complete current CAD offers |
| ED-03: $1,500 CAD | Requirements, two-route platform/graphics planning and complete costs | Exact compatible BOM/revision and complete current CAD offers |
| ED-04: $1,000 USD | Workload choices, supported essentials and full US purchase record | Exact compatible BOM/revision and complete current USD offers |
| ED-05: $1,500 USD | Additional-budget benefit, platform and streaming decisions | Exact compatible BOM/revision and complete current USD offers |
| ED-14: 5060 Ti/9060 XT | Conditional product/features/test comparison | Observed current same-budget offers before making that premise |
| ED-39: Premiere | Complete application-specific planning and support process | Comparable application evidence, final exact workstation BOM and current offers before a finished recommendation |

The budget titles clearly describe planning targets. Their bodies and summaries explicitly state that a full priced buying recommendation is blocked. Their `bom` and `offers` arrays are empty rather than simulated. Completing useful planning text does not count as delivering a checked shopping list.

## Independent human review for every item

1. Read the complete article, not just its metadata or automated validation output.
2. Check the answer and intended reader; confirm it contributes a distinct useful decision or process.
3. Inspect consequential source claims with exact product/revision/version context. Verify source applicability and any material change since inspection.
4. Check all numerical claims, units, calculated examples, regional currency and any recommendation conditions. No measured FPS, low-percentile figure, noise result or uplift can be inferred from specifications.
5. Verify safety instructions against exact applicable manuals. Never normalize opening a PSU, mixing unidentified cables, unofficial firmware, protection bypasses or random optimization scripts.
6. Check natural language, table headings, mobile reading flow, source labels and internal destinations. Related articles are intent links, not redundant filler.
7. Resolve the item-specific blockers. A missing offer is unknown, a partial subtotal is incomplete and a requirements check is not a game-FPS result.
8. Record the actual human reviewer, decision, evidence date and substantive changes. Automated checks do not fulfill this step.
9. Release only the approved item through the parent publication gate; assign truthful dates, metadata and eligible schema then. Confirm staging exclusions cannot propagate to production.

## Tests actually run

`node scripts/program-editorial.cjs` passed for the original full 40-item dataset. The expanded `validateEditorial()` also passed after related-tool/product/article integration and documentation generation.

Checks include unique IDs/routes, all 40 expected task IDs, complete body structure, registered section sources, sources present in each item's register, no publication dates or human approval, human-review dependency, safe next-action/tool links, valid table column counts, related-article identities, one rendered main heading, visible draft notice and no scripts/publication-schema injection.

These checks establish structural correctness. They do not prove every hardware claim true, simulate a human editor or verify rendered mobile appearance. The parent QA workstream owns browser inspection and the production build-leakage checks.

## Refresh and rollback

Use `node scripts/program-editorial.cjs --write-docs` to regenerate the checkpoint only after validation passes. The inspection date describes source checking; it must not be recycled as a publication freshness claim. Source records identify shorter refresh targets for changing product, game, software and feature documentation.

For a rollback, remove the staged import/preview gate and its generated draft routes through the parent build procedure. No data migration, destructive cleanup, production deployment or external communication was performed by this workstream. Existing published content remains the production basis until human approval and a separate authorized release.

## Next executable step

Inspect the 40 staging drafts on desktop and mobile, then perform and record independent human editorial decisions in small batches. Resolve budget/application/offer dependencies individually; continue reviewing well-supported guides without lowering the gate to reach a publication count.
