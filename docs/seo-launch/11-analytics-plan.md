# Analytics and baseline plan

No analytics property, Search Console data or logs were connected. No tracker was installed and no visitor statistics were invented. The event specification is implementation-ready; an owner must choose/connect the property and consent policy before transmission is enabled.

## Baseline export

Search Console: preceding 28 and 90 days, country, device, page and query; impressions, clicks, CTR and average position. Classify brand variants including PC Part Performance and domain spellings, then report non-branded queries separately. Preserve aggregation/privacy limitations. Record sitemap status, indexed/excluded URLs and representative URL inspection results.

Analytics: new active users, returning active users, engaged sessions, source/medium, country/device, tool starts and successful actions. “Unique” users are a measurement estimate, not a count of known distinct people. Compare date-aligned periods and distinguish release traffic from ordinary usage. Do not use fingerprinting, persistent cross-site identifiers or raw search/build URLs.

Logs: aggregate status codes, user-agent bot signatures and abusive request rates. Do not identify humans solely by IP or send private logs to a third party. Apply consent and privacy requirements for the chosen analytics setup. Filter development/preview hosts and staff testing.

## Event adapter contract

Accept only the event names and enumerated fields in 11-event-spec.csv after consent. Use canonical_path without query/hash. Keep country CA/US, known category/store enums and catalog part IDs; reject free-text fields. Queue only in memory if the destination is unavailable; discard on consent withdrawal. No analytics call may block a picker, calculator or navigation. Do not infer conversions from render events or default comparisons.

Validate with real interactions and a debug property: one event per semantic action; no duplicate event after redraw; no network before consent; no payload PII; no event on bot/test traffic. Build_ready is a selected-list milestone, not fit certification. Retailer clicks do not establish a purchase.

## 30/60/90-day decisions

Day 30: verify indexing/discovery and event accuracy; compare non-branded engaged users and comparison/builder starts against a valid prior baseline. Day 60: inspect query→page→tool paths and repeat use; improve resources with evidence of unmet intent. Day 90: compare returning-user cohorts, qualified tool completions and legitimate referrals; discontinue pages that lack utility. Set numerical targets only after the baseline and tracking reliability are known.

## Performance monitoring

Use field Core Web Vitals at the 75th percentile by mobile/desktop where sufficient data exists: LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1. Keep lab runs, connection/device settings and field data separate. A fast local result does not prove field performance.
