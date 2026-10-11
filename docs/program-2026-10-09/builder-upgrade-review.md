# Builder and upgrade integration review

Reviewed 2026-10-09 against the shared `compatibility-evidence.cjs` engine. No production action performed.

## Confirmed and fixed in upgrade-program.js

- Builder links use the shared normalizer and URL serializer, preserving all nine category slots, exact IDs, reused-owned flags, region and planning workload. The budget and free-form notes are not placed in shared URLs.
- Changing installed inventory, region, budget or goal invalidates the existing plan until the visitor recreates it. Confirming a pasted model has the same behavior. Comparison, opening and export cannot silently use the stale inventory.
- Adding a phase recalculates both its evidence and the current readiness panel. The original inventory table is labeled as the starting inventory.
- Part choices require bounded, valid and unique IDs. Import problems leave selection unavailable instead of constructing a partially matched inventory. No pasted URL is fetched.
- Phases are bounded to 25. The UI retains conflicts and unresolved checks instead of implying that saving a phase certifies compatibility.
- Export preserves actual selected IDs and phases; budget is numeric or null. Free-form notes are not exported or sent as event parameters. The current inventory form supports one exact entry per component category, which is disclosed in export limitations.

## Generator integration findings sent to the parent

- `program-site.cjs` invokes `program-builder.cjs` before the final SEO pass. The builder generator expects the established `/builder/` HTML and augments it without creating a second authoritative state.
- The compact `program-parts.json` selection data currently omit per-record `evidence` and `fields`. The known-ID registry still functions, but future provenance attached only to those properties must be retained by the generator before it can influence the rule engine. This omission was reported; this workstream did not alter the parent-owned generator.
- The legacy `shopping.js` filter currently uses region, price and age but lacks the exact match, explicit stock, source rights and known charge-basis gates implemented in the pure `program-offers.cjs` module. The inherited records were stale at inspection, so no current offer is manufactured. A future feed must not be connected to that legacy filter without replacing its eligibility policy. This was reported; no shopping frontend edit was made under this subtask.

## Actual tests and browser status

`node scripts/check-builder-program.cjs`: 16 behavior tests passed.

`node scripts/check-program-offers.cjs`: 14 behavior tests passed.

`node scripts/check-upgrade-program.cjs`: 8 tests execute the actual upgrade source in a minimal DOM stub. They cover validated choices, malformed catalogs, nonmutating comparison, phased readiness/URL ownership, stale-plan blocking, explicit pasted confirmation, exact export and phase bounds. These are source-behavior tests, not browser or visual QA.

Syntax checks passed for `program-offers.cjs` and `upgrade-program.js`.

This subagent's browser inventory returned no apps or browsers; creating an in-app staging tab returned “Browser is not available: iab.” The parent is covering real browser/viewport QA against local staging at `http://127.0.0.1:4185/`. This document does not assert that those browser tests passed. The parent should rebuild and reload after source changes before recording the UI outcome.

## Parent integration checkpoint — October 9, 2026

The parent completed actual desktop/mobile browser journeys and corrected consumer wiring, source labels, shared-rule candidate filtering and stale-state handoffs. Final builder checks now total eighteen; offer policy fourteen and upgrade eight remain passed. Actual shopping consumes durable reviewed observations and recalculates expiration locally. These statements supersede the earlier subtask-only integration gaps; see `qa-and-performance.md`, `final-test-receipts.json` and `FINAL-REPORT.md`. No real current offers, human publication approvals or production deployment were added.
