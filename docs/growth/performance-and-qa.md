# Performance and QA evidence

Baseline and after snapshots use the same static measurement command and actual referenced files. JS is gzip bytes; CSS is source bytes. These are payload measurements, not observed download times or field Core Web Vitals.

| Route | JS before | JS after | CSS before | CSS after |
| --- | ---: | ---: | ---: | ---: |
| / | 9411 | 9420 | 139448 | 140202 |
| /builder/ | 119729 | 121826 | 222130 | 219345 |
| /hardware/ | 95092 | 95101 | 134568 | 133223 |
| /learn/rtx5070.html | 12883 | 12892 | 127714 | 126461 |
| /compare/ | 117843 | 117852 | 148886 | 146866 |
| /compare/rtx-5070-vs-rx-9070/ | 10057 | 10066 | 121529 | 119835 |
| /performance/ | 38365 | 38374 | 164896 | 163558 |
| /compatibility/ | 15156 | 32305 | 121529 | 145119 |
| /upgrade/ | 30972 | 33069 | 140235 | 138288 |
| /prebuilts/ | 18018 | 18018 | 136903 | 134951 |
| /tools/ | 10057 | 10066 | 127714 | 134918 |
| /build-school/ | 15156 | 15165 | 121529 | 119835 |
| /troubleshooting/ | 15156 | 24258 | 121529 | 128736 |
| /search/ | 15202 | 10899 | 127714 | 113259 |
| /news/ | 9225 | 9225 | 117344 | 115631 |
| /blog/ | 9411 | 9420 | 131284 | 129564 |
| /resources/ | 13662 | 13671 | 127714 | 132848 |

Shared CSS was conservatively compacted, with quoted strings and selector boundaries preserved. New homepage content slightly increases its CSS; the standalone compatibility picker and diagnostics add scoped assets. Seven existing route budgets passed without raising limits. Search removes the old controller: initial JS falls by28%; optional 3D code remains absent from initial route scripts.

35 actual mobile/light and desktop/dark viewport/main-heading observations are recorded in qa/layout-checks.json, with no page-level horizontal overflow. Screenshots cover the mobile header/menu, homepage, builder and transfer results. This is a targeted QA pass, not a complete WCAG certification.

Controls exercised: native Explore Enter/Escape, theme switching, compact GPU search and no-result state, Guides filter and browser Back restoration, documented CPU/socket pass and conflict, empty-picker validation/focus, calculator results, diagnostic outcome/back/reset and opt-in save/restore. Browser export download was declined and not retried. Pure export serialization tests passed; browser download remains unverified. Existing full builder/upgrade/offer/publication tests passed.

Local DOM instrumentation is only served by the local preview helper; it is absent from production assets. Lab samples in qa/lab-samples.json must be interpreted with their environment and sampling window. No field INP or real-user p75 result is claimed, and no before/after browser timing baseline was collected in this increment.

Actual lab observations: two homepage LCP values of2432 and2112 ms, one builder value of2596 ms; CLS approximately0.001 in each. No initial 3D requests occurred. These three unthrottled local observations are not field p75 results and have different sampling windows. The builder observation slightly exceeds the2.5-second LCP target; obtain representative field/mobile-throttled evidence before asserting site-wide Core Web Vitals compliance.
