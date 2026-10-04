# revenue dashboard spec

Prepared October 4, 2026. Local release; deployment confirmation is not recorded.

## No baseline connected
No AdSense, affiliate, analytics or Search Console account data is available. All revenue/traffic fields are null, not zero.

## Metrics
By canonical page group, country, device and date: estimated new/returning active users, engaged sessions, tool success, article engagement, qualified retailer clicks, actual ad impressions, viewability, revenue, page RPM, affiliate confirmed conversions, field CLS/INP/LCP. Page RPM = revenue / page views × 1000; session RPM uses sessions, with an explicit denominator. Never treat a click as a sale.

## Joins and consent
Join aggregate canonical-path/day/country/device data rather than identities. Strip queries/build lists. No raw search terms, emails, IPs or cross-site identifiers in events. Respect consent withdrawal and GPC where applicable. Exclude preview/staff traffic.

## Decision rule
Compare date-aligned periods and confidence/sample size. Do not extrapolate an RPM from another publisher. A placement ships only after revenue and engagement are measured with stable field performance. Property credentials/export permissions are the blocker, not a missing chart.
