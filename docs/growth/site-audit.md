# PC Part Performance — October 13 confirmed audit

## Stack and baseline

No applicable AGENTS.md was found in this checkout or its ancestor directories. The working tree was clean at `9b2dad3`; work uses `codex/growth-expansion-2026-10-13`. Existing source modules generate static HTML and browser assets, with a Cloudflare Worker controlling canonical URLs, responses and the disabled morning-price API. No framework, CMS, paid API or authentication replacement was introduced.

The live baseline returned HTTP 200 for all 17 sampled destinations; the apex hardware URL redirects to the canonical www HTTPS host in one step. The live hardware HTML already contains 24 product rows and ordinary pagination links. The browser also rendered those rows and working category controls. **The historical empty-catalog claim is already addressed**, not a confirmed current failure.

The catalog contains **1,216 stable records across 18 categories**. Baseline inventory has 1,501 HTML files, including redirect documents; 960 are intended indexable pages. This file count differs from the SEO generator's 1,463 non-redirect pages. Counts come from the actual checkout, not the older marketing total.

## Confirmed defects

- The earlier larger catalog left `/hardware/page/52/` and `/hardware/phones/page/9/` outside the current pagination ranges. They still served older rows and unusually accumulated stylesheet payloads. Replace only those generated remnants with related permanent redirects to current last pages; preserve every ordinary product URL.
- Newsroom cards exposed ISO instants directly instead of readable dates. Preserve their actual publication instants and render readable `<time>` labels.
- The static news sitemap cannot age its own entries between builds. Serve recent confirmed records through the existing Worker with a 48-hour response-time filter, preserving original publication dates and RSS archives.
- The raw i714700k record referenced an unsuccessful Intel SKU236789 URL. The inspected exact Core i7-14700K source uses SKU236783. Correct that exact source reference without changing product identity or numerical specifications.
- CPU memory capacity and motherboard memory capacity need separate checks. A board supporting256GB does not establish a CPU supporting that amount. The researched7800X3D example documents128GB.
- A documented no-integrated-graphics processor with no discrete GPU should produce a narrow display-path conflict rather than an unspecified capability message.

## Improvement opportunities implemented in this increment

Compatibility and upgrade tasks were buried under Explore; make them primary navigation items. Retain dedicated Phones and Prebuilt destinations in a clearly labeled supporting menu and homepage. Connect product information to the relevant compatibility, upgrade, timing and capacity tools.

Add exact CPU/board evidence selection, source coverage counts and a benchmark-coverage view. Preserve unknown BIOS, profile stability, physical layout and measured FPS. The existing performance default already withholds measured FPS and invented1%lows; retain that behavior and collapse the unvalidated legacy demonstration.

Extend the existing diagnostic route with a real24-node observable tree. Add two genuinely distinct explicit-unit calculators, preserving all current calculators and saved builder/upgrade features. Improve model-name search, aliases, result-type grouping and browser URL restoration.

## Unverified or externally blocked

Search Console, GA4, keyword-tool metrics and real-user Core Web Vitals were not supplied. The research distinguishes individually inspected queries from inferred candidates. No traffic, ranking, CTR or revenue defect or improvement is claimed from unavailable measurements.

Retailer source accounts, exact approved targets, durable storage and cron remain unconfigured. There are no live price or stock claims. No BIOS version table was added without inspection, no product identity was merged by a fuzzy name, and no creator mesh became clearance-certified geometry.

New editorial candidates remain distinguishable from the twelve already authorized published articles. Human editorial approval is not inferred from unit tests. Browser QA, final tests and deployment are recorded separately in the release report.
