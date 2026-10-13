# Final source review — October 13, 2026

Read-only review of `growth-site.cjs`, `growth-ui.js`, `growth-search.js`, `growth-search-core.cjs`, `growth-tools.cjs`, `growth-tools.js`, `css-compact.cjs`, the compatibility-rule interfaces they call, and the runtime news-sitemap adapter/Worker integration. No source edits, commit, central build, deployment or browser QA were performed by this reviewer.

## Findings requiring attention

### R1 — Compatibility form uses required controls hidden by the modern selector (P2)

**Files:** `scripts/growth-site.cjs` compatibility form; `scripts/growth-ui.js` load/submit handlers; existing `dist/select-ui.js` enhancement.

The new processor and motherboard `<select>` controls are `required` and start with blank options. The existing modern-selector enhancement sets the native controls `hidden = true`. Browser constraint validation occurs before the submit handler; an empty hidden required select can therefore prevent the custom “Choose both exact models” message from running while the invalid control cannot receive normal focus. The loading handler also calls `form.elements.cpu.focus()` after hiding the load button, although that native select is hidden by the enhancement.

**Recommendation:** use explicit validation (`novalidate` plus the existing exact-selection checks), announce the error and focus the corresponding visible picker button. After loading, focus the visible `.select-trigger`, not the hidden native select. Preserve the valid-selection path and rule-engine checks.

The conflicting attributes and focus target are confirmed in source. The main team's browser pass should verify empty submission and keyboard focus before release; this reviewer did not claim a browser reproduction.

### R2 — Very small timing differences produce “0 ns shorter/longer” (P3)

**File:** `scripts/growth-tools.js`, memory result presentation.

An executed arithmetic probe with Kit A 6000 MT/s CL30 and Kit B 6001 MT/s CL30 gives `casDifferenceNs = -0.0016663889351775651`. Display formatting rounds that difference to `0`, but the direction test still chooses “shorter.” The output can consequently say the interval is “0 ns shorter,” contradicting its displayed precision.

**Recommendation:** classify equality at the displayed precision, or show enough precision with a clear “less than 0.01 ns” phrase. This is a presentation issue, not an incorrect underlying formula or a fabricated benchmark.

### R3 — Saved diagnostic validation accepts inherited object keys (P3)

**File:** `scripts/growth-tools.js`, `createSession`, `validateSession` and `nodeHTML`.

Executed probes show `createSession('constructor')`, `createSession('__proto__')` and `createSession('toString')` are accepted, and `validateSession` returns true for them. These names resolve through `tree`'s object prototype rather than being actual diagnostic steps. Normal query selection uses a fixed mapping, so ordinary users do not encounter these starts. A malformed saved payload can nevertheless pass the stated replay validation.

**Recommendation:** use `Object.hasOwn(tree, id)` for starting/current/history nodes and targets. Reject malformed non-node states before rendering. No executable import, remote fetch, server-side exposure or script execution was found in this path.

## Nonblocking maintainability observations

- `growth-search.js`'s loaded-row filter reads `row.title` without first checking `row`. A future null entry would make the whole index load fail; a `row && ...` guard would match the safer search-core filter. Current generated data contain no demonstrated null entries.
- The performance coverage template displays the computed approved-record count but also contains fixed prose saying none exist. The current checked dataset has **0 approved PC records**, so today's wording is truthful. Make those sentences conditional before adding approved benchmark data.
- The runtime news renderer intentionally consumes a small generated news-only registry, but duplicates some publication eligibility rules from `news-policy.cjs`. The generated registry contains four approved, deployment-confirmed news rows. A shared generated predicate or parity checks for malformed type/title cases would reduce future drift; no current draft leakage was observed.

## Checks that passed in this review

- The current normal generated route manifest contains **zero `/growth-review/` entries**. New editorial candidates remain review-pending; their preview generator does not add public search/feed/sitemap records.
- Search result titles and links are escaped; results are constrained to local absolute paths and protocol-relative destinations are rejected.
- Compatibility output text is escaped, and documentary links go through the shared `safeURL` handling. Socket support is kept separate from unresolved BIOS support.
- Tool numeric inputs reject missing, non-finite, negative/out-of-range and unsupported-unit values where applicable. Optional timings remain unknown, not zero. Bit/byte and decimal/binary conversions are explicit.
- Diagnostic notes are bounded, stored only after local consent, and exported as text. No notes/free-form text is included in analytics event parameters. The data-bearing-drive branch stops before initialization or formatting.
- CSS compaction preserves quoted strings, comment token boundaries, descendant-selector spacing and `calc()` operator spacing in the tested cases.
- Runtime news XML is escaped, publication/deployment gates are checked, future/aged entries are excluded, and the result is capped at 1,000 entries. The Worker responds separately to GET/HEAD, rejects POST and applies no-store/noindex to query-state requests.

## Tests actually run

| Command | Result |
| --- | --- |
| `node scripts/test-growth-search.cjs` | 12 checks passed |
| `node scripts/test-css-compact.cjs` | 12 checks passed |
| `node scripts/test-news-sitemap-response.mjs` | 9 checks passed |
| `node scripts/check-growth-worker.mjs` | 9 checks passed |
| `node scripts/test-growth-evidence.cjs` | 14 checks passed |
| `node scripts/test-growth-tools.cjs` | 16 checks passed |

Total: **72 existing targeted checks passed**, plus the explicit rounding and inherited-node probes above. These tests did not cover the native hidden-required-select browser behavior. Passing tests do not remove R1's source-confirmed integration concern.

## Release conclusion

No remote-input execution issue, misleading current price/FPS claim or current draft-index leakage was found in the reviewed paths. Address **R1** and verify it in the browser before declaring the compatibility checker’s keyboard and empty-state QA complete. R2/R3 are bounded fixes worth making now; the remaining observations are future-data hardening. Production deployment and visual verification remain the main team's responsibility.

## Central integration resolution

R1 was fixed with explicit visible validation on a novalidate custom-picker form. Actual browser testing confirmed initial focus on the visible select trigger, the empty-choice alert, and aria-invalid on that trigger. R2 now describes equality at the displayed precision, verified for 6000 CL30 versus 6001 CL30 in the browser. R3 now requires own diagnostic-node keys; new tests reject constructor, __proto__ and toString. Focused tool checks increased from16 to18 and passed.
