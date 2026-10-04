# Code changes

Build integration: publication.cjs, publication-content.cjs, phone-data.cjs, planning-tools.cjs, publication-sources.cjs; planning-math.js/publication-ui.js/publication.css; source-monitor/news-policy, public-data-api and ad-policy. seo-pass includes new metadata, RSS and draft exclusions. Tests: check-stage2.cjs plus preserved Stage 1 checks.

Native Sites publishing is blocked; the static build and optional backend adapters are distinct.

implementation.patch uses zero context to preserve clean artifact whitespace. Review/apply only against Stage 1 base 3d54e42 with git apply --check --unidiff-zero before applying. The repository branch already contains these changes.
