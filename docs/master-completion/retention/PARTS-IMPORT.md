# Reviewed parts-list import

## Implemented journey

The existing `/upgrade/` paste form now stages a complete review instead of immediately changing one inventory row at a time.

1. Paste one component per line and choose **Review pasted parts**.
2. Select an exact catalog model for every included line. Suggested candidates have no preselected default, even when only one candidate exists.
3. Correct catalog-item quantities. A memory kit can contain multiple modules; `2 x 16 GB` is not automatically treated as two memory kits.
4. Search the catalog manually when a line is unknown, or explicitly exclude that line. Excluded text never becomes an installed hardware record.
5. Review the complete replacement, the current/replacement instance counts, removed components and excluded lines.
6. Check the confirmation box and choose **Replace entered inventory**.
7. Create the reuse plan again to run current compatibility checks.

No inventory changes occur while searching, selecting candidates or reviewing the summary. Cancel preserves the entered inventory, open plan and upgrade phases. The confirmation checks that the inventory has not changed elsewhere since review began. A later edit requires another review.

## Integration

The parent build calls:

```js
require('./completion-parts-import.cjs')({ root });
```

Run after the retained upgrade page exists and before SEO/release processing. The generator copies `completion-parts-import.js` and scoped `completion-parts-import.css`, loads the module before `upgrade-program.js`, and decorates the existing form button. It is idempotent and throws when expected retained form/script markup is missing. No new route is introduced.

The compact `/data/program-parts.json` catalog should preserve existing documented `model`, `sku`, `mpn`, `partNumber` and `manufacturerPartNumber` fields when available, as well as name, brand, category and aliases. The parser also supports those identity fields inside `identity`. It never manufactures a part number from a URL or name.

The retained upgrade controller exposes:

```js
PCP_UPGRADE.catalog();             // Existing validated catalog records
PCP_UPGRADE.inventory();           // Exact entered ID arrays, or null before load
PCP_UPGRADE.applyConfirmedInventory(parts, expectedFingerprint);
```

`inventory()` describes the current form, including additional instances. It is separate from the existing `snapshot()` of the last generated plan. `applyConfirmedInventory` validates exact IDs/categories, quantities, slot limits and the unchanged fingerprint before applying anything. It invalidates the old generated report and blocks stale share/export until the user creates the reuse plan again. Existing budget, goal, symptoms and private notes stay unchanged. Existing saved builder revisions are not read, rewritten or deleted by this operation.

The slot order remains the original eight slots, fan ninth, cooler tenth. The existing JSON import/export and legacy eight/nine-slot links remain available. Repeated GPUs, memory kits, SSDs, HDDs and fans stay separate instances; a single processor, motherboard, PSU, case and CPU cooler are supported in this inventory.

## Matching and limits

- Text is limited to 32 KiB UTF-8, 50 total lines including blanks, and 1,200 characters per line.
- Maximum 99 selected component instances. Invalid or excessive counts fail rather than being truncated.
- Category labels, bullets, recorded aliases, exact catalog IDs and documented full SKUs/MPNs are supported.
- Common leading `3 x` and explicit trailing `qty 3` forms are supported. Conflicting quantity declarations fail.
- SKU/MPN matching preserves every digit and punctuation character, allowing case differences only. An explicit `SKU:` query never falls back to a name guess.
- Name suggestions require literal complete search terms; there is no edit-distance/numeric SKU guessing, benchmark inference or automatic selection of a partner variant.
- Candidate lists are limited to 40. Broader searches ask the visitor to narrow the model.
- Unknown/manual descriptions cannot participate in compatibility checks. Visitors must choose a real exact catalog model or explicitly exclude the line. Excluded text remains visible after applying for reference.
- Pasted URLs are not opened. Markdown/retailer tables and unrecognized formats can be resolved through the manual catalog search; this is not an unrestricted parts-list scraper.

## Privacy and failure behavior

Pasted text and pending decisions exist only in the open page. This feature sends no pasted text, URLs, IDs, quantities, invoices, warranty data or private notes to an endpoint or analytics. It never attempts installed-hardware detection. It does not introduce storage keys, cloud sync, file uploads or background requests. The upgrade page retains its existing single catalog request.

After a successful confirmed inventory replacement, the optional existing analytics adapter receives only:

```js
track('parts_list_imported', { page_type: 'upgrade', action: 'confirmed' });
```

Parsing, candidate selection, preview, cancellation and rejected applications do not emit this event. Analytics failure cannot convert an already applied inventory into a failed import.

The review uses DOM text nodes for pasted/model content. No pasted markup is assigned to `innerHTML`. If the module fails to load, paste review explains that it is unavailable and the existing exact-model inventory controls remain usable. It does not fall back to immediate per-row mutations.

## Verification

Actual targeted commands:

```text
node scripts/completion-parts-import.test.cjs     28 passed
node scripts/check-upgrade-program.cjs           16 passed
node scripts/oct16-upgrade.test.cjs                8 passed
node scripts/check-master-decisions.cjs          16 passed
```

The new tests execute both the staged UI with minimal DOM fixtures and the actual retained upgrade controller. They cover ambiguity, numeric variants, strict SKUs, module/kit counts, repeated instances, unknown/URL exclusions, safe text rendering, confirmation, cancellation after an actual upgrade phase, edited-inventory protection, missing dependencies, legacy JSON layouts, private-note preservation and success-only analytics.

Five affected JS/CJS files also passed the project ESLint rules with zero errors or warnings. Dist/controller and the legacy test were added to that run's lint globs in memory; the shared config was not edited by this task.

This evidence is source/fixture verification. The parent owns generated-page inspection, keyboard/mobile browser QA, the complete build and deployment. No browser, global build, production changes or commits were performed by this task.
