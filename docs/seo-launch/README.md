# PC Part Performance SEO launch — 2026-10-03

Local implementation on branch codex/seo-launch-2026-10-03. The live website has not received this release. Review deployment blockers in 15-status-and-blockers.md.

## Deliverables

1. [Executive audit](01-executive-audit.md)
2. [Technical backlog](02-technical-backlog.csv)
3. [Keyword opportunities](03-keyword-opportunities.csv)
4. [Information architecture](04-information-architecture.md) and [internal links](04-internal-link-map.csv)
5. [Implementation map](05-implementation/change-map.md)
6. [Page templates](06-page-templates.md)
7. [24-page launch backlog](07-launch-backlog.csv)
8. [Ten complete content drafts](08-content/) — also integrated into the static build
9. [90-day editorial calendar](09-editorial-calendar.csv)
10. [Structured-data rules](10-structured-data/README.md) and generated schema examples
11. [Analytics plan](11-analytics-plan.md) and [event specification](11-event-spec.csv)
12. [Distribution plan](12-distribution-plan.md)
13. [QA report](13-qa-report.md), [live HTTP evidence](live-audit.json), [launch checks](launch-validation.json)
14. [Source register](14-source-register.csv)
15. [Status and blockers](15-status-and-blockers.md)

## Reproduce

From the repository, run node scripts/build-pages.cjs, node scripts/check-seo.cjs, node scripts/check-seo-launch.cjs, node scripts/check-blog-models.cjs and node scripts/check-cooling.cjs. Regenerate these documents with node scripts/document-seo-launch.cjs after validation. The preview command is node scripts/serve-seo-preview.cjs. All new editorial pages are plain HTML before JavaScript runs.

Do not infer traffic growth, rich-result eligibility, verified fit, live prices or a successful deployment from passing local checks.

## Verification artifacts

[Desktop screenshot](comparison-desktop.jpg), [mobile screenshot](comparison-mobile.jpg), [browser checks](browser-qa.json), [script-size budget](performance-budget.json), and [image identity inventory](image-identity-summary.json).

Initial catalog JavaScript is 467,389 bytes versus 768,829 before this release, about 39% fewer uncompressed bytes. This is a file-size comparison, not a measured field-speed improvement.
