# retention strategy

Prepared October 4, 2026. Local release; deployment confirmation is not recorded.

Implemented local saved list for products/new guides/tools/phones, capped at 100 IDs. No account, email, cross-device sync, price tracking or alerts. Safe text rendering and canonical result URLs; storage errors produce a message. Local search fetches a small index on demand and normalizes model aliases; no raw query is transmitted to analytics.

Two existing subscriptions: Blog RSS (evergreen articles) and News RSS (currently empty because no approved news). Do not mix evergreen preparation dates into fresh news.

Newsletter, email alerts and cloud watchlists remain disabled until the owner selects a service, sender identity, consent/unsubscribe process and privacy policy. No form pretends to subscribe someone. Saved-list export is a next step, with import validation and explicit merge rules. Measure returning use only after a consented analytics property exists.
