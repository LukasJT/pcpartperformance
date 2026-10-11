# Integration state and measurement definitions

## Verified absent or unconfigured

- No authorized Search Console, GA4 or server-log export is available to this task. Traffic, country/device differences, rankings and field Core Web Vitals are unmeasured.
- Existing retailer snapshots are dated September 16, 2026; they do not become live prices by changing their date. Exact current offers, stock and source rights remain required. No paid feed/API was purchased or scraping activation performed.
- No price-alert/newsletter service, consent records, unsubscribe endpoint or verified job exists. Flags stay disabled and no email form is added.
- No moderation, authentication or correction backend is available. Existing policy/correction contact links are preserved; no simulated forum or submission queue is launched.
- IndexNow and Search Console submissions are not sent. Prepare only after owner authorization, ownership verification and a reviewed release. Google’s restricted Indexing API is not used.

## Event adapter

/program-events.js defaults off. An existing provider can set PCP_ANALYTICS={enabled:true,consentGranted:true,send(name,params)} after consent is resolved. No provider is installed. The allowlist admits only page_type, category, region, action and merchant, not a query, email, notes, exact private build state or token. Identical immediate events are deduplicated.

| Event | Completion definition |
| --- | --- |
| guide_builder_open | successful navigation from a guide action; a click is only an intent signal if navigation cannot be confirmed |
| comparison_completed | at least two validated same-category IDs rendered with their evidence; not merely opening Compare |
| upgrade_result_generated | inventory confirmed and an explicit reuse result rendered |
| build_revision_saved | storage write succeeded; export fallback is a separate outcome |
| build_shared | clipboard write succeeded or share text was presented; distinguish fallback in action |
| compatibility_check_completed | valid manual dimensions evaluated; result is not overall certification |
| diagnostic_result_generated | a valid symptom produced its safe next checks |
| retailer_outbound | outbound click to a named merchant, not a completed purchase |

Report acquisition separately from utility: non-branded search clicks/impressions; landing-page task completion; referral visits; repeat usage; outbound clicks. Segment by country, device and content cluster where the real tools support it. Use comparable periods, seasonality and release annotations. Do not equate impressions with visits or sum overlapping reports.

At low traffic, use observed task completion and usability sessions before claiming experiment significance. Proposed experiments: homepage three-action labels; guide-to-builder action placement; comparison summary before/after tables. Run only with actual consented measurement and a predeclared completion definition.

## Final integration verification, October 9

Actual consumer wiring now uses `/data/offer-observations.json` plus reviewed exact identities, not inherited `prices.json`. Default durable source files are empty. Thirteen source preparation, fourteen pure policy and four shopping consumer tests pass with synthetic fixtures only. A local sixty-second visible-page recalculation expires offers without new scraping requests. No alert, live feed, history chart or fair-deal shopping UI is operational. See `offer-source-integration.md`.

`program-events.js` loads before its dependent scripts. Current call sites: guide-to-builder destination load with same-site guide referrer; guided plan update; successful local revision save; comparison rendering with two valid same-category parts; comparison/build clipboard success or presented fallback; generated reuse result; reuse/checklist exports; valid manual fit and diagnostic results; named merchant outbound clicks. Comparison sharing has its own `comparison_shared` event. Events remain off without a configured consented adapter. No total-build-completed event is emitted from unresolved readiness, and outbound clicks are not purchases.

The adapter provides no analytics account, daily report, GA4 page-view integration or experimentation service. Do not install it alongside a provider that duplicates events/page views. GA4 identity is limited by consent, browser/device identity, reporting thresholds and attribution rules. Summing daily users does not count unique humans. Search Console impressions, clicks where available and Google generative-search visibility must be reported with their real definitions; overlapping totals are not additive. External AI referral visits are a separate source, with referrer loss limitations.

No provider, Search Console submission, IndexNow notification, newsletter or external message was activated. Proposed experiments need a preregistered success action, comparable observation periods and sufficient sample; this task supplies usability evidence, not statistical uplift claims.
