# Hardware research publication

The owner approved all 150 articles from review commit `a655ade07a09edc2f5b636ca12398184e3bb9dae` and selected PC Part Performance as the organization byline on November 19, 2026. The release authorization pins the complete source-backed dataset and retains every reviewed HTML hash. The approval records the direct instruction without inferring a separate personal-review attestation.

The normal site build publishes the guides under `/blog/` and adds `/hardware-guides/` as their topic directory. The Blog and four relevant existing guides link to the directory. Each approved guide keeps its approved copy, citations and visual, and joins the normal site search, RSS feed, sitemap, and Worker routing. Publication uses the release date. Source check dates remain separate.

The isolated release check compares the new sitemap with the 1,451 existing entries and expects 150 article URLs and one directory URL to be added.

```powershell
node scripts/build-pages.cjs
node scripts/run-master-checks.cjs
node tools/quality/node_modules/typescript/bin/tsc -p tools/quality/tsconfig.json
node scripts/check-component-photo-files.cjs
node scripts/verify-search-dominance-browser.cjs
node --use-system-ca scripts/verify-search-dominance-live.cjs <deployed-commit> <public-receipt-path>
```

The local browser script requires Playwright and Chromium. `EDITORIAL_PLAYWRIGHT` and `EDITORIAL_BROWSER` select existing local installations. It serves the built site on loopback and blocks browser requests outside that origin. The live verifier checks the commit marker, public HTML, sitemap, robots and discovery links.
