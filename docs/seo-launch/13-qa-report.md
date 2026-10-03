# QA report

Local static build validation: 1327 HTML pages, 705 canonical indexable pages and 59175 local references checked at the time this document was generated. Refresh docs/seo-validation.json after the final build for authoritative counts.

## Automated checks

check-seo.cjs checks one H1/title/description/canonical/robots/social title, unique indexable titles, local references, JSON parsing and sitemap alignment. check-seo-launch.cjs verifies ten substantive resources, all 1,186 products discoverable in HTML, initial catalog/shop content, one Product declaration, actual calculator arithmetic (including equal CAS intervals and storage over-budget), and undeployed request-adapter behavior. check-blog-models.cjs validates existing blog sources/links and GLBs. check-cooling.cjs checks supported, unsupported, mixed and unknown fan configurations.

## Browser inspection

Inspection is recorded in browser-qa.json and the final handoff. Tests cover desktop/mobile layouts, light/dark modes, actual calculator forms, catalog search/pagination, shop facets/country choice and conversion links. Screenshots are visual evidence; raw HTML discovery tests supply the no-JavaScript evidence. No screen-reader assistive-technology session was performed; semantic names, labels and keyboard-operable native forms were reviewed.

## Performance limits

New calculators use local arithmetic and no third-party dependency. Research pages avoid the full interactive catalog script stack. Existing builder/3D and FPS dependencies were preserved. Styles remain content-addressed. Page/script sizes are in performance-budget.json. No field CWV, Lighthouse score or global speed guarantee is claimed. Network/font/image and production caching measurements remain necessary.

## Production limitations

Live query exclusion headers and old-guide HTTP redirect behavior require hosting verification. The adapter tests do not establish production behavior. Google Rich Results Test was not run and JSON/schema invariants do not guarantee rich-result eligibility. No live deployment was completed. Compare live-audit.json with the release after deployment to confirm actual initial HTML and status changes.

## Final verification

All ten launch routes were inspected at 390 × 844 and 1440 × 1000. Each had one H1, no broken completed images, and no horizontal page overflow after the mobile RX 9070 table repair. Calculator results, shop multiselect/reset/country selection, pagination and builder prefill were checked in the browser. FPS controls loaded after the image metadata reduction; the visible result disclaimer now explicitly identifies the model as unvalidated and game-card figures are prefixed “Est.”.

The final build and SEO/launch checks passed. Existing model and cooling checks also passed earlier in this release. A whitespace check with core.autocrlf disabled initially reported CRLF lines; the repository's normal Git normalization produced a clean check. Desktop/mobile screenshots and browser-qa.json record the final visual evidence. No live-domain verification of these changes is possible before publishing.
