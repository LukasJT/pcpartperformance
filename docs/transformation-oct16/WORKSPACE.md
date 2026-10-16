# My PC workspace — implementation record

## Purpose and integration

`/my-pc/` brings the existing named builder revisions together with a private, local notebook. It does not add accounts, a database, notifications, cloud synchronization or analytics containing private notes.

The generator is `scripts/oct16-workspace.cjs` and accepts the existing `{root, records, shell, write, aliases}` build context. Run it after the builder assets are prepared and before the final SEO/routing pass. It produces one page and copies the scoped controller and stylesheet. The page uses only a compact PC-component catalog; this data is not added to unrelated routes.

The parent release supplies the navigation link, `/saved/` cross-link, canonical/indexing policy, full build, browser inspection and deployment.

## Genuine implemented operations

- Read the existing `pcp-build-revisions-v1` collection through its existing normalization and alias logic. Show exact normalized component counts, region, save date and unresolved references.
- Open the public component selection in the builder with `restore=<local revision ID>`. The builder resolves the full revision locally, restoring budget, manual items and plan preferences. Notes and journal text are never placed in this URL. The builder's ordinary public-share action strips the local restore reference.
- Duplicate a revision with a new ID and copy name. The existing raw records, quantities, unknown references, future row fields and collection metadata are retained. Nothing is migrated on page load.
- Compare two real saved revisions: quantities by exact part ID, ownership, region and entered budget. Manual quote subtotals are displayed separately from retailer observations and never converted across currencies.
- Save a per-build note and a dated build journal. Save additional manual purchase quotes, including explicit unknown amounts and owned items. The builder's saved manual extras are shown read-only and included in the manual subtotals.
- Read existing saved-product IDs in addition to the workspace's own watched IDs. Search the actual PC catalog to follow an exact component. Removing an existing saved product requires the visitor's explicit Remove action and uses `PCP_SAVED.write`; loading the workspace does not migrate or rewrite it.
- Export/import the workspace notebook and watched IDs. Imports merge new notebook IDs and retain existing notebooks on ID conflicts. File-based price observations and change records are not imported as evidence. Existing builder revisions are exported independently from the builder.
- Clear only the workspace key after an explicit native dialog confirmation. Escape/cancel leaves data unchanged. Builder revisions, saved products, region and other site storage are retained.
- Check current supported listings through the existing validated `public-price-client.js`. A first successful observation establishes a baseline. Only a newer actual observation can record a price, stock-state or condition change. Expired/future/malformed observations and failed requests create no change events. There is no synthesized price chart or claim of continuous history.
- Show dated captured observations behind an optional disclosure. Stale records are labeled expired and never counted as a current purchasing subtotal.

## Storage and privacy

New key: **`pcp-my-pc-workspace-v1`**, schema `pcp-my-pc-workspace-v1`, version `1`.

Limits: 128 KiB UTF-8 JSON; 25 notebooks; 2,000 characters per note; 20 journal entries of at most 500 characters per notebook; 30 manual quote rows per notebook; 100 watched IDs; 100 recent observations; 40 actual change events. Entries are validated and rendered with escaped text. Quantities, amounts, region, IDs and timestamps are bounded.

Corrupt or unreadable workspace data is not overwritten. A failed write preserves entered journal/quote text and does not claim a successful save. Clearing browser/site data removes local records. Exports explicitly contain private notes and should be kept private.

No notes, journal text, manual purchase rows or warranty-like text enter public share URLs, remote requests or analytics. Price requests contain only selected product IDs and region. No pasted arbitrary URL is fetched.

## Accessibility and layout

One main heading; task sections and ordinary anchor navigation; named form controls; status announcements; visible focus; native confirmation dialog with focus return and Escape support; expandable optional data controls; scrollable, captioned semantic comparison table; 44-pixel controls; mobile single-column notebook and forms; light/dark tokens; reduced-motion styling; print rules. These are implementation characteristics, not a WCAG certification. Central browser QA must verify the rendered release.

## Evidence and limits

`node scripts/oct16-workspace.test.cjs` passed **24 behavior tests** on October 16, 2026. It executes pure state/storage behavior and the actual mounted controller with a minimal DOM/storage fixture. It covers corruption, UTF-8 limits, private-note rendering, duplication, unknown quantities and costs, import merging, real observation baselines, failed requests, form submissions, restore-after-refresh, confirmation cancellation and isolation of existing storage keys. `node --check` also passed for the controller, generator and test file.

The fixture tests do not establish hardware compatibility, additional retailer coverage, a real price observation, browser visual quality or production deployment. No manufacturer tests were performed for this workspace.

There is no hardware autodetection, automatic recommendation engine, server-side synchronization, account recovery, email alert service, full market-price coverage or completeness claim. A saved build is a planning record and must be rechecked before purchase.

## Maintenance and rollback

The new key is versioned and isolated. Keep its parser backward compatible if the schema changes. Never clear the builder or saved-product key as part of a workspace reset. Preserve raw revision fields when duplicating so future builder extensions survive. Do not make imported files into price provenance.

Rollback can remove the `/my-pc/` route, navigation link and its two assets without changing existing builder or saved-product data. The isolated workspace key may remain for a future compatible release; do not delete users' notebooks during a code rollback.
