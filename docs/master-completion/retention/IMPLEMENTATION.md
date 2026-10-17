# Saved comparisons and acquisition journal

## Implemented experience

The comparison tool now supports an explicit **Save comparison** action. It keeps two to four exact product IDs, chosen column order, the differences-only preference and a dated catalog-specification snapshot. `/my-pc/` exposes these records with:

- Reopen the current comparison in the saved column order.
- Read meaningful saved differences, with units and unknown fields preserved.
- Open the product/source or start a build with a specific supported component.
- Rename or remove a saved comparison.

The save identity is the unordered set of exact product IDs. Saving B versus A after A versus B updates that one saved set and preserves the newly chosen order; it does not create two near-identical history entries. Rename does not change the specification snapshot date. No comparison is saved merely because somebody visits a page.

The existing Build Notebook now has **Planned vs acquired**. Acquisitions are separate records attached to an existing revision and planned component. Users can record multiple batches or variants, newly purchased quantities, already-owned quantities, a manual unit price, region, optional seller, purchase date, warranty date/reference, revisit date and private notes.

The original saved revision is never rewritten by an acquisition. A different actual model triggers a compatibility-review reminder rather than silently replacing the plan. Extra quantities remain visible. Unknown purchase prices remain unknown. Owned hardware is counted separately from new spending, and CAD/USD records never combine into a converted total.

Manual revisit dates are displayed on the workspace when it opens. Users can mark the task complete or reopen it. There is no email, push notification, calendar service, background monitor or scheduled job. Warranty dates are manual notes, not verified entitlement or coverage.

## Source and integration files

New files:

- `scripts/completion-retention.js` — validation, local collection operations, comparison snapshots/differences, acquisition totals, quantity reconciliation and revisit-date state.
- `scripts/completion-retention-compare.js` — small comparison-page controller, using the existing styles and actual comparison bridge.
- `scripts/completion-retention.cjs` — copies those two assets, inserts the comparison save hook once and exports the workspace section markup.
- `scripts/completion-retention.test.cjs` — state, storage, privacy, hook and generator tests.

Updated files: the four `scripts/oct16-workspace.*` source, style, generator and test files. No shared CSS, upgrade controller, engine, deployment configuration or unrelated storage migration is part of this increment.

Parent integration:

1. Expose `window.PCP_COMPARE_HISTORY.snapshot()` on the existing comparison page, returning `{parts: parts(), units, onlyDifferences: !!document.querySelector('#differences-only')?.checked}`. These are the existing exact catalog records and selected view.
2. Run `require('./completion-retention.cjs')({root})` after the generated comparison page exists and before final SEO/routing processing.
3. Keep `completion-retention.js` before `completion-retention-compare.js` and `oct16-workspace.js`. The workspace generator already supplies its own required script.

The hook listens to the existing `pcp:render` event with scope `comparison`. Rendering updates the save button but never writes history. The explicit button saves the current bridge snapshot. Restoring `differences=1` uses the existing differences toggle and its change event. Later toggle changes keep that ordinary address-bar preference in sync without saving history.

## Storage and compatibility

New key: `pcp-completion-retention-v1`, schema `pcp-completion-retention-v1`, version `1`.

Limits: **256 KiB UTF-8**, 20 comparisons, 100 acquisition records. Comparisons hold at most four products and 24 prioritized specification fields per product. Quantities are integers from 0–99, with at most 99 new-plus-owned units per acquisition record. Unit prices accept a real amount, including explicit zero, or null for unknown. IDs, text, dates, source URLs, units and values are bounded and validated. Calendar dates must actually exist.

The existing notebook key `pcp-my-pc-workspace-v1`, builder revisions and saved-product key remain unchanged. Loading or saving a comparison/acquisition does not migrate them. An old cached notebook controller cannot drop the new records because they use a separate key.

Backup export uses a compact `pcp-my-pc-backup-v2` envelope containing the existing notebook collection and the new retention collection. The importer also accepts old `pcp-my-pc-workspace-v1` exports, including a UTF-8 BOM. Importing an old export leaves the new retention key untouched. Imports retain current records when IDs or saved comparison sets overlap; no existing record is silently overwritten.

Both collection writes are validated before a combined import. If the second write fails, the original local strings are restored. Confirmed clear similarly restores both collections if one deletion fails. A failed rollback receives an explicit recovery warning; the interface never claims the data is intact without confirmation.

Corrupt collections are retained and their write path is disabled. The original notebook remains usable if only the new retention collection is unreadable. Export can produce a clearly identified raw recovery file when normal parsing fails; this contains private source strings and requires repair before ordinary import. It is not represented as a successfully validated restorable backup.

## Privacy and evidence boundaries

Public links contain exact product IDs, ordinary display preferences and, when applicable, a model-wide owned flag. They never contain comparison names, acquisition notes, receipts, warranty references, seller names or reminder text. The modules make no network requests and send no analytics. Backups explicitly contain private data and are labeled accordingly.

A comparison snapshot records what was saved, not when a specification was independently verified. It does not infer a winner, FPS, compatibility or a current price. Specification sources remain normal HTTPS links; absent fields remain unknown and differing units require context.

Acquisition quantities are user declarations. The builder's current ownership model applies to an entire model group. A record mixing newly bought and already-owned copies therefore opens with a manual ownership-review warning; it does not silently mark new copies owned. Starting a new build from a recorded item uses only the known exact model and quantity, never warranty/private fields.

## Verification

Executed source checks:

- `node scripts/completion-retention.test.cjs` — 27 behavior tests passed.
- `node scripts/oct16-workspace.test.cjs` — 32 behavior tests passed, including eight new mounted workspace journeys.
- Node syntax checks for all new/updated JavaScript generators/controllers/tests.

Tests exercise actual controllers with minimal DOM/storage fixtures, not copied implementations. Coverage includes reversed comparison ordering, unknown versus zero, units, corrupt/quota storage, capacity limits, exact owned/new quantities, different actual variants, manual calendar dates, private-link exclusion, old exports, combined backups, rollback, explicit save behavior, generator idempotency and retained original build bytes.

These are local synthetic fixtures. Parent release QA owns the full build, desktop/mobile visual inspection, keyboard interaction and production verification. No browser inspection or deployment is claimed by this handoff.

## Maintenance and rollback

Preserve the two versioned collection formats or provide a reversible migration. Do not count a save date as a source-verification date. Do not import acquisition entries into checked retailer prices or benchmark evidence. Do not add notification claims without a working consent and delivery system.

Code rollback can remove the hook and new workspace sections while retaining the new storage key for a later compatible release. Do not delete private local records as part of a deployment rollback.
