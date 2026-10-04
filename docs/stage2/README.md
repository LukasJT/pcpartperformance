# README

Prepared October 4, 2026. Local release; deployment confirmation is not recorded.

## Preserve Stage 1
All deliverables 1–15 remain in ../seo-launch/. No prior code/guide was discarded.

## Stage 2 index
- [16-newsroom-architecture.md](16-newsroom-architecture.md)
- [17-news-source-registry.csv](17-news-source-registry.csv)
- [18-news-publishing-workflow.md](18-news-publishing-workflow.md)
- [19-news-sitemap-implementation](19-news-sitemap-implementation)
- [20-discover-implementation.md](20-discover-implementation.md)
- [21-ad-revenue-plan.md](21-ad-revenue-plan.md)
- [22-ad-experiment-backlog.csv](22-ad-experiment-backlog.csv)
- [23-phone-vertical-plan.md](23-phone-vertical-plan.md)
- [24-phone-data-schema.md](24-phone-data-schema.md)
- [25-phone-comparison-template.md](25-phone-comparison-template.md)
- [26-video-youtube-system.md](26-video-youtube-system.md)
- [27-content-opportunities-200plus.csv](27-content-opportunities-200plus.csv)
- [28-tier1-publishing-queue.csv](28-tier1-publishing-queue.csv)
- [29-original-tools-roadmap.csv](29-original-tools-roadmap.csv)
- [30-original-data-reports.csv](30-original-data-reports.csv)
- [31-retention-strategy.md](31-retention-strategy.md)
- [32-revenue-dashboard-spec.md](32-revenue-dashboard-spec.md)
- [33-content-freshness-system.md](33-content-freshness-system.md)
- [34-source-confidence-system.md](34-source-confidence-system.md)
- [35-data-changelog-system.md](35-data-changelog-system.md)
- [36-public-dataset-plan.md](36-public-dataset-plan.md)
- [37-api-plan.md](37-api-plan.md)
- [38-release-calendar-plan.md](38-release-calendar-plan.md)
- [39-memory-market-watch.md](39-memory-market-watch.md)
- [40-additional-original-ideas.csv](40-additional-original-ideas.csv)
- [41-additional-article-ideas.csv](41-additional-article-ideas.csv)
- [42-completed-stage2-content](42-completed-stage2-content)
- [43-stage2-code-changes](43-stage2-code-changes)
- [44-stage2-qa-report.md](44-stage2-qa-report.md)
- [45-stage2-status-and-blockers.md](45-stage2-status-and-blockers.md)

## Reproduce
PowerShell: scripts/generate-publication-images.ps1
Node: scripts/build-pages.cjs; scripts/check-seo.cjs; scripts/check-seo-launch.cjs; scripts/check-stage2.cjs; scripts/write-stage2-docs.cjs; scripts/audit-publication-freshness.cjs.
Source intake: node --use-system-ca scripts/monitor-news.cjs (manual run only).

The opportunities are scoped against primary documentation. Per-query demand, search volume and ranking difficulty remain unmeasured. Data tables and plans are not traffic or revenue results.
