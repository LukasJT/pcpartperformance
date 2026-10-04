# ad revenue plan

Prepared October 4, 2026. Local release; deployment confirmation is not recorded.

## Default-off implementation
Ad configuration lives in scripts/ad-policy.cjs. enabled=false, publisherApproved=false, no publisher ID and cmpVerified=false. No ad scripts or empty ad boxes are rendered. A gate also requires consent and respects GPC; it excludes builder, comparison, FPS, phone-size and search interactions. This gate is not a complete CMP or legal-compliance claim.

## Prerequisites
Verified AdSense publisher account and site approval; Google-certified CMP where required; a region-aware consent policy; actual privacy/contact/controller details; current ads.txt values supplied by the account. Do not invent an ads.txt authorization. Audit existing Google Fonts requests and remote 3D dependencies before making any no-third-party-request statement.

## Placements
Start with article-end context. Consider a single reserved mid-article placement only after evidence of stable layout and engagement. No overlays, sticky ads near pickers, mislabeled buttons or ad-driven form delays. Disclose sponsorship/affiliate relationships next to their content and use appropriate paid-link attributes.

## Privacy review
Canadian behavioural-advertising guidance treats tracking as generally involving personal information and describes consent conditions. California rules apply to covered businesses and include GPC obligations. Determine actual applicability with the owner’s business facts and counsel; no universal compliance guarantee is made.

Sources: https://support.google.com/adsense/answer/1346295?hl=en; https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/gl_ba_1112/; https://oag.ca.gov/privacy/ccpa
