# Publisher readiness — October 19, 2026

Status: technical preparation implemented; account setup, audience eligibility, editorial review, provider approval and launch are **not verified**.

## What the repository establishes

The read-only baseline in `publisher-baseline.json` found 58 public blog/news articles, no dedicated Journey content landmarks and no static Google tag in the generated HTML. It found the existing Adsterra client and its consent/GPC controls. These are source observations, not a network audit or proof that a private GA4 property does not exist elsewhere.

The implementation adds:

- One semantic `.journey-content` class directly to the existing body of an eligible article. No wrapper, ad unit, sidebar or network script is invented.
- A noindex, normally linked owner resource at `/resources/publisher-readiness/`.
- A generated aggregate audit at `/data/publisher-readiness.json`.
- A fail-closed GA4 configuration validator. Configuration validation does not install a runtime adapter or authorize collection.
- A runnable article-landmark and integration audit, plus 14 focused regression checks.

The pure-function rehearsal handled all 58 baseline articles with no landmark ambiguity. Run the integrated build and audit again after all new article generation. Counts describe files, not editorial approval, ad delivery, licensing clearance or traffic.

## Verified provider dependencies

Journey currently lists 1,000 premium-market sessions in 30 days and a connected GA4 account. Its review also considers original content, engagement and traffic quality. The named Tier-1 examples include the US, Canada, UK and Australia. There is no verified audience report in this workspace; eligibility stays unknown. Sources: [minimum requirements](https://journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements), [current requirements](https://www.mediavine.com/application-requirements/).

The owner applies through the common [publisher portal](https://publishers.mediavine.com/join). Current onboarding includes the agreement, site details, issued script and ads.txt, Stripe identity verification and an owner launch decision. Journey does not require a separate Google MCM approval under the current [launch documentation](https://journeymv.zendesk.com/hc/en-us/articles/23745987278363-Journey-From-Application-to-Launch). No application, legal acceptance or identity submission has been performed here.

**Adsterra transition:** Journey requires exclusivity for programmatic inventory. Existing Adsterra must therefore be removed during an owner-approved transition before a Journey launch. It is preserved in this release. Do not install both providers and assume compatibility. Review existing contractual obligations with the owner; do not infer them from repository code. [Official transition guidance](https://journeymv.zendesk.com/hc/en-us/articles/24209919201563-How-To-Remove-Your-Existing-Ads-From-A-Previous-Network).

## Build integration contract

Module: `scripts/evolution-publisher.cjs`.

```js
const publisher = require('./evolution-publisher.cjs');

// After all long-form article creation, before SEO/route manifest generation:
publisher.prepare({ root, shell, write, esc });

// Safe after any later HTML layout decoration; idempotent:
publisher.polish({ root });

// Or, for an existing all-page pass:
html = publisher.polishHTML(html, canonicalPath);
```

`prepare` applies the conservative landmark pass first, then writes the resource and aggregate report. `polish` returns an audit but does not regenerate the owner resource. If new articles are added afterward, call `prepare` again so its displayed count is current. `polishHTML` is pure.

Qualification requires all of:

1. A real `/blog/<slug>/` or `/news/<slug>/` route.
2. Article/BlogPosting/NewsArticle JSON-LD, including supported graph/type-array forms.
3. No draft, redirect or noindex state.
4. Exactly one recognizable existing editorial article body.

Ambiguous existing landmarks are reported, never silently replaced. Product reference pages, tools, the homepage, policy pages and listing-card collections do not become article targets. Existing `<article>` attributes and classes remain intact. This pass performs no editorial rewriting.

The owner resource carries `data-stage2-noindex` plus an explicit robots noindex directive. The existing SEO/route generation must retain that exclusion. A noindex resource is public, not private; its report deliberately contains no account IDs, session exports, private notes or credentials.

## Ad-safe article layout contract

The content selector is `.journey-content`, exactly once on an article body. It must not also identify the header, related-article grid, tool form, footer or sidebar. This follows [Journey's semantic-landmark guidance for custom layouts](https://journeymv.zendesk.com/hc/en-us/articles/54691462571419-Why-SPAs-flexbox-grid-layouts-and-utility-class-frameworks-can-cause-ad-targeting-issues).

No sidebar is asserted. Before adding one for ads, verify actual rendered content width, visibility and static positioning at the provider's required desktop sizes. Do not label a floating TOC as an approved ad sidebar.

Keep article and future slot containers out of transforms, continuous movement, overflow clipping and controls. Decorative liquid effects belong on independent non-interactive layers. No animation should move an ad or bring a product button beneath it. Reserve dimensions only for actual approved units; do not leave fictional ad gaps throughout articles.

Placement selectors are preparation, not an instruction to enter arbitrary dashboard overrides. Leave provider defaults until a real targeting failure is demonstrated. After authorized installation, use the official `?test=placeholders` procedure and inspect content/footer behavior. [Selector documentation](https://journeymv.zendesk.com/hc/en-us/articles/55300174276763-How-to-Use-Ad-Placement-Selectors-to-Retarget-Your-Ads).

## Exact owner steps for GA4

1. Sign into the intended owner-controlled Analytics account. Select or create the GA4 property for this site; only the owner accepts its terms.
2. In Admin → Data streams, confirm the Web stream for `https://www.pcpartperformance.com/`. Record the actual measurement ID and correct reporting timezone/currency. The ID is configuration, not an API secret. Never send passwords or account tokens in chat.
3. Choose the applicable privacy/consent setup and owner-specific disclosure. Existing **ad** consent is not an analytics opt-in. Consent mode does not itself obtain or persist permission. [Google setup](https://support.google.com/analytics/answer/14183469?hl=en), [consent implementation](https://developers.google.com/tag-platform/security/guides/consent).
4. Implement one consent-controlled analytics adapter for the existing `PCP_EVENTS` gate. Prefer basic mode here: no analytics tag request before affirmative consent; no replay of previously blocked events. Handle withdrawal, GPC policy, storage failure and unavailable services without breaking tools.
5. Send one pageview for an actual page navigation. Inspect any enhanced-measurement/history configuration before adding manual pageviews. Strip tool queries, fragments, private build state, free-text queries and notes; avoid personal information in page titles or events. The current site uses ordinary page loads for its primary navigation.
6. Use Realtime/DebugView and an isolated browser network check to verify one permitted pageview, zero denied requests and correct withdrawal. Validate across a hard reload and navigation, not only a synthetic event fixture.
7. Review data retention, staff/developer filtering and traffic integrity. Establish real collection before claiming a 30-day audience. Do not infer sessions from visitors or pageviews.
8. Connect that property through the publisher portal's authorization flow. A configured tag and a provider-connected account are different states.

`validateAnalyticsConfig` validates a disabled preparation object and rejects malformed IDs/activation requests lacking owner, privacy and consent review. Its `activationAllowed` is always false: no runtime adapter has been implemented or activated in this bounded publisher-readiness task. A valid-looking example ID is not a connected property.

## Exact provider transition points

Current ad generator/client and Worker integration are separate from this preparation:

- `scripts/ads-injection.mjs`: Worker HTML placement injection.
- `scripts/build-ad-assets.cjs`: account-specific existing ad assets, client consent controls and privacy text.
- `scripts/worker.mjs`: isolated ad-origin delivery and HTML response integration.
- `scripts/completion-security.mjs`: current main-site and isolated-ad security policy.
- `dist/ads.js`, `dist/ads.css`, `dist/ads/*.html`: generated provider artifacts.

At an approved transition: back up the exact current release; disable the former injector and generated client path; remove former provider placements and scripts; update policy and issued ads.txt; install only the exact account-issued Journey wrapper; review its actual script/network requirements against CSP with provider guidance. Clear deployment caches and test fresh browser contexts. Do not broadly weaken CSP based on guessed hostnames. Do not modify DNS as a generic advertising step.

No previous provider code is removed here. No Journey wrapper, seller ID or ads.txt content is invented. Affiliate relationships, sponsorship disclosure and provider agreements remain owner-controlled business decisions.

## Quality checks and limits

Run:

```powershell
node scripts/evolution-publisher.test.cjs
node scripts/evolution-publisher.cjs
```

The audit command writes `docs/evolution-oct18/publisher-audit.json` and exits nonzero for missing/ambiguous editorial landmarks. The focused tests use temporary fixtures only. The initial rehearsal does not modify `dist`.

Release gates still required: actual integrated build; noindex/sitemap verification; rendered article/mobile/theme checks; current ad consent regression; existing resource audit; complete build/test suite. Provider placeholders, GA4 network behavior, field Core Web Vitals, legal review, image reuse permission, human editorial assessment, revenue and approval are **not** established by these tests.

## Owner decisions still needed

- Correct GA4 property and consent/privacy setup.
- Actual 30-day qualifying-session evidence and provider review.
- Human review of complete article text, sources and originality; no automated test is a substitute.
- Image rights review where metadata records a public publication but not a reusable license.
- Owner-specific privacy/contact/legal details.
- Existing provider obligations and an authorized transition date.
- Journey account-issued script, ads.txt and verification/launch approval.

This is a prepared integration boundary, not a monetization acceptance claim.
