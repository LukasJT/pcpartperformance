# Information architecture and index policy

Home → Hardware / Comparisons / Builder / FPS / Blog / Shop. Planning calculators are linked from the homepage, relevant guides and the footer. Do not add a navigation item for every content subtype.

## Stable searchable resources

/hardware/ and 18 category paths have initial HTML tables. /learn/{product-id}.html retains existing product URLs; changing every slug would create migration risk. Three /compare/{specific-pair}/ paths have unique titles, specifications, decisions and sources. /blog/ contains four expanded pillars and existing explainers. /tools/ links two calculators. /editorial-policy/ and /about/ document accountability.

## Tool states

Arbitrary /compare/?parts=, /hardware/?q=, category/era/sort combinations and /builder/?build= are user tool states, not automatically approved landing pages. Client metadata marks state requests noindex/follow and maps known pairs to their permanent canonical. The request-layer adapter in scripts/seo-http-policy.cjs supplies actual headers, redirects and invalid-ID 404s; it is not installed on the live static host. Do not call the client fallback complete server-side control.

Pagination has normal anchor links and self-canonicals; pages 2+ are noindex/follow and omitted from the sitemap. Products remain linked even without JavaScript. Thin products retain the existing noindex quality gate. Duplicate identities canonicalize to the most complete record. Canonical does not prove that Google has accepted the preferred URL.

## Locale

CA/US is a user-selected preference on the same URL, stored locally. Do not make currency-only pages or hreflang variants. Separate Canadian/US complete-build pages are in the backlog only when verified retailer lists and purchase context make them substantially different.

## Navigation and links

Homepage → featured researched comparison and calculators. Pillar → exact category, comparison/checklist and builder. Comparison → product specifications, relevant pillar, manual checks and a builder prefilled with only that CPU/GPU. Product → stable category, buying section and interactive comparison. Blog → pillars, upgrade checklist and calculators. All new pages link the correction policy.

## Quality gate

Require a distinct question, exact identity, source access date, useful answer/checklist or formula, honest missing-data notes, conversion path, valid metadata and a rendering/link check. Do not publish pair permutations, unsupported budget totals or template-only game hubs. Planned rows in the launch backlog have no generated URLs and are not in the sitemap.
