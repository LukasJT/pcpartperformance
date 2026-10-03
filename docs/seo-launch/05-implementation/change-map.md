# Implementation map

- scripts/seo-launch-content.cjs: ten complete editorial/tool page definitions and source registry.
- scripts/seo-launch.cjs: static category tables, pagination, articles, comparisons, tools, policy and internal links.
- scripts/build-pages.cjs: deterministic build hook, navigation override, lightweight calculator script and shared styles.
- scripts/shopping-pages.cjs: 24 initial shop cards, source-aware product buying sections; duplicate Product declaration removed; expiry wording corrected.
- scripts/seo-pass.cjs: pagination noindex policy, stable category links, one Product declaration, strict image identity check, visible ItemList schema and RSS additions.
- dist/interface.js: empty-result text inserted only when the filtered catalog is actually empty.
- dist/shopping.js: an early price response cannot erase the initial catalog while the shopping catalog is loading.
- dist/builder-v2.js: “No conflict found in indexed checks” replaces the broader compatibility verdict.
- dist/research-tools.js: local arithmetic with no dependency or network request.
- dist/indexing-policy.js: client fallback for parameterized tool states.
- scripts/seo-http-policy.cjs: tested but undeployed HTTP adapter.
- .github/ISSUE_TEMPLATE/data-correction.yml: correction intake without a fabricated email address.
- scripts/check-seo-launch.cjs: content, discovery, schema, actual calculator behavior and adapter checks.

## Build and rollback

The branch began at 04ce692, with a clean working tree. Generated files are reproducible through scripts/build-pages.cjs. Product HTML is intentionally ignored by Git and regenerated during a build. Retain the prior production deployment for rollback when the hosting connector is available. Do not overwrite production with an untested deployment or delete prior versions.

## Validation commands

node scripts/build-pages.cjs
node scripts/check-seo.cjs
node scripts/check-seo-launch.cjs
node scripts/check-blog-models.cjs
node scripts/check-cooling.cjs

These checks do not replace production HTTP verification or Google Rich Results Test.
