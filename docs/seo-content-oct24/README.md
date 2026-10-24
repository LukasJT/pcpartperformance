# Search landing pages and upgrade guidance — October 24, 2026

## Release result

Published `c753f52250e6c90171d15a8c209e736871b18302` through the existing production workflow. CI and Cloudflare hosting both succeeded. All 113 regression command groups, 101 isolated browser states, TypeScript and unchanged performance budgets passed. Four additional public browser checks passed after deployment. Public checks verify all five edited pages, 11 contextual link targets, six delivered stylesheets, the unchanged sitemap count, private-state exclusions and the intended ownership token.

Google’s live test of the revised AM5 guide says **URL is available to Google**, **Page can be indexed** and **1 valid breadcrumb item**. The guide was already indexed in the earlier snapshot; this is not a claim that its new revision has been recrawled into the index. The manual recrawl request was not accepted because Google reported its daily quota was exceeded. A later appropriate retry is recorded in `release.json`; normal crawling remains available.

Private Google evidence is saved outside the public repository. Search impressions, clicks and ranking effects remain unmeasured for this release.

## Purpose

Improve existing search destinations while Google processes the recently verified property. The available private Search Console sample is insufficient for query-level CTR conclusions. This work addresses concrete content gaps and intent clarity; it does not claim more impressions, clicks or rankings have already resulted.

The existing tools largely explained themselves inside interactive controls. Added initial-HTML guidance explains how to make a useful plan, distinguish variants and preserve unresolved checks. It appears after the tools, keeping the working controls first. Existing blue/white and dark themes are retained. No new indexable routes, decorative JavaScript or dependencies were added.

## Implementation register

| ID | Existing destination | Change | Verification |
| --- | --- | --- | --- |
| SC-01 | `/builder/` | Three-step parts-list guidance, owned-parts and preview limits, links into learning and upgrade tools | HTML invariants, browser picker flow, responsive and JavaScript-disabled checks |
| SC-02 | `/upgrade/` | Diagnose the goal before spending; case, PSU and storage reuse audit; link to the existing full-platform cost calculator | Internal target resolution, primary cable/processor guidance, responsive checks |
| SC-03 | `/compatibility/` | Exact board → CPU support entry → installed firmware/update path; memory support and unknown-result explanations | Primary-source review, unchanged checker form, keyboard disclosure checks |
| SC-04 | `/compare/` | Exact-variant comparison guidance, limits of specification comparisons, contextual links to researched comparisons | Links resolve to indexable canonical pages; comparison controls retained |
| SC-05 | `/blog/am5-upgrade-checklist/` | Original five-field verification worksheet and clearer firmware evidence procedure | Original publication/source dates preserved; only real Article modification date updated to October 24 |
| SC-06 | Four tool destinations above | Distinct search titles and descriptions aligned with their actual capabilities | Existing metadata/social/schema consistency regressions |
| SC-07 | Shared content styling | Reused existing typography and responsive layout; 510 bytes of compacted shared CSS, plus 141 bytes only on comparison | Existing performance ceilings retained; initial budget failure fixed by reducing CSS, not increasing limits |

The enlarged-text browser test also exposed existing comparison navigation/header overflow. `search-comparison.css` lets the grid adapt to text size and wraps the section heading; no page-wide overflow hiding is used.

## Editorial review

The additions were written for these specific workflows. No copied manufacturer prose, benchmark figures, compatibility passes, prices, personal testing claims or made-up review credentials were added. The AM5 worksheet asks readers to record evidence; it is not a support database or a compatibility certificate.

Technical assertions about CPU support, firmware and modular cables were checked against these primary sources on October 24:

- [MSI: CPU compatibility and BIOS requirements](https://www.msi.com/support/technical_details/MB_CPU_Upgrade_Installation)
- [ASUS: CPU and memory support-list lookup](https://www.asus.com/us/support/faq/1043883/)
- [Intel: desktop processor upgrade requirements](https://www.intel.com/content/www/us/en/support/articles/000005682/processors.html)
- [CORSAIR: modular cable compatibility](https://www.corsair.com/us/cs/explorer/diy-builder/power-supply-units/are-psu-cable-universal/)

The original guide's other inspection dates remain unchanged. The October 24 modification date identifies the substantive worksheet/workflow revision, not a routine automated check.

Intent research used qualitative search-result patterns for PC upgrades and CPU/motherboard compatibility, plus the existing product functionality. No keyword volume, competitor rank, measured traffic gain or universal hardware recommendation is inferred. [Google's SEO guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) prioritizes helpful original information, descriptive links and accurate search presentation.

## Tests and evidence

- `scripts/search-landing-content.test.cjs`: form/output/canonical preservation, idempotence, article dates, source retention and link targets.
- `scripts/search-landing.browser.cjs`: nine viewport widths in light/dark, enlarged text, keyboard disclosures, no-JavaScript content, real CPU search/selection and PSU dismissal.
- `before.json`, `browser-results.json`, `qa/before/`, `qa/after/`: actual rendered receipts and screenshots. Isolated Edge is not a physical iOS test.
- `../master-completion/qa/test-commands.json`: complete regression result.
- `../program-2026-10-09/performance-budget-results.json`: unchanged static resource budgets; field Core Web Vitals are not measured here.

Publication and public response checks are recorded in `release.json`, `public-after.json` and `public-browser.json`. Private Google account/report screenshots remain outside the repository.
