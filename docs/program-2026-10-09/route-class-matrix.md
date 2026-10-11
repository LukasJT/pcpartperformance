# Route and indexing policy

Staging is localhost-only, noindex in HTML and responses, and disallowed in its preview robots.txt. It is not a public staging deployment. Production changes are not deployed.

| Route class | Response | Canonical | Robots | Sitemap | Discovery |
| --- | --- | --- | --- | --- | --- |
| Homepage, reviewed article/tool/category | 200 | preferred HTTPS www URL | index/follow unless explicit retained decision | Yes | Ordinary anchors |
| Catalog pagination | 200 | each page itself | index/follow unless an individual decision exists | Yes | Numbered links |
| Exact product variant | 200 | exact stable ID | existing exclusion decisions retained pending individual review | If indexable | Category/product links |
| Confirmed reviewed duplicate | 301 | final exact entity | target policy | Final URL only | Updated internal links |
| Curated reversed query comparison | 301 | curated equivalent | target policy | Curated page if reviewed | Descriptive links |
| Arbitrary builder/comparison/FPS/filter state | 200 | base tool | noindex/follow response | No state URLs | User-created links, bounded parsing |
| Internal search/saved items | 200 | base route | noindex/follow | No | Navigation |
| Draft article/product addition | local preview 200 | eventual stable route | noindex/follow | No | Explicit staging review queue |
| Invalid IDs, mixed-category pairs, missing routes | 404 | error URL | noindex/follow | No | Helpful recovery |
| Malformed/oversized path or URL | 400 | none | noindex/follow | No | Rejected |

Tracking parameters alone do not create editorial content. Unknown arbitrary parameters receive noindex. Robots is not authentication; private staging binds only to loopback. The future Worker adapter enforces host/format/status/query policy before static HTML. It is not yet live. No hreflang is emitted for the same article with only a currency switch.
