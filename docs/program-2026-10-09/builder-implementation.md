# Guided builder, readiness and saved revisions

Prepared October 9, 2026 on `codex/product-program-2026-10-09`. This work changes the repository and local staging. It is not a production deployment record or a human editorial sign-off.

## Working increment

- `/builder/` keeps the established expert picker, compatibility filtering, fan placement and deferred 3D preview. The guided plan adds country/currency, manual spending target, workload, display, size, noise and networking preferences. Those choices produce an explicit planning checklist, not an unexplained recommendation score.
- Each selected component can be marked owned or locked. A lock holds its component row unchanged, including adding/removing entries from a multi-item row. The normal clear and example actions preserve locked rows. An explicit saved-revision load restores the exact saved configuration.
- The Build Readiness Report groups narrow documented passes, conflicts, unresolved evidence and checks that software cannot perform. Sources, exact scope and a next action accompany consequential checks. Acknowledging an unresolved item never changes it into a pass. Changing parts or fan layout clears acknowledgements.
- Exact offers must have a verified variant match, explicit in-stock evidence, matching region/currency and a valid timestamp/expiry before contributing to purchase totals. Owned parts are excluded from new spending. Missing prices remain missing. Cooler, operating system, accessories, tax and shipping remain outside the selected-parts subtotal.
- Local revisions preserve exact catalog IDs and repeated selections, ownership, locks, plan preferences, fan layout and unresolved acknowledgements. They support named saves, load, difference view, deletion, JSON export/import, plain-text/Markdown export, a share link and printing. Imports are data-only JSON capped at 64 KB and 25 revisions. Unknown/wrong-category references survive as repair records in exports and are not silently installed.
- `/tools/budget-build-lab/` is a complete-purchase quote worksheet with two configurations. It includes processor, board, memory, cooler, graphics, storage, PSU, case/fans, OS, accessories, shipping and tax. Empty values are unknown; owned/not-needed choices are explicit. Cost difference is withheld until both purchase plans have complete inputs. The existing platform-upgrade-cost tool is linked rather than duplicated.

## Evidence and claims

`scripts/compatibility-evidence.cjs` is the pure shared engine, copied unchanged to `/compatibility-evidence.js` during static generation. Its initial source register is in `builder-evidence.json` after a build. Exact-model source inspection covered MSI B650 TOMAHAWK WIFI, AMD 9800X3D, Corsair CMK32GX5M2B6000C30, MSI RTX3060 GAMING X TRIO 12G, Lian Li O11 Air Mini and Samsung MZ-V9P1T0BW. The CORSAIR cable compatibility chart supports the practical PSU-cable verification step.

An inherited catalog number or a family specification URL is not sufficient to mark a field verified. The engine accepts registered exact facts or records with per-field source, check date, applicable model, evidence status and exact scope. Unknowns never become zero. Socket match remains a separate check from exact CPU/BIOS support. Nominal GPU length remains separate from thickness, cable and radiator clearance. A 3D file provides no fit certification.

The Lian Li source contains inconsistent drive-bay counts, so the readiness registry does not certify bay counts. The current picker also has no CPU-cooler selection, exact BIOS minimum-version dataset or connector inventory. Those gaps remain visible. First-party thermal, acoustic, electrical and stability tests have not been performed.

The builder's arbitrary composite `/100` scores and memory-bandwidth-derived resolution labels were removed from the Hardware outlook display. That area now links to game evidence and FPS methodology while explicitly identifying the unvalidated PC model.

## Shared interfaces

```js
const rules = require('./scripts/compatibility-evidence.cjs');
const report = rules.createReadiness({
  parts: { cpu: [cpuRecord], board: [boardRecord], ram: [memoryRecord] },
  requirements: { workload: 'gaming', display: '1440p', size: 'flexible', noise: 'flexible', network: 'wifi' }
});
// report.checks[].state: passed | failed | needs-verification | unperformed
```

Other pure APIs: `field`, `verified`, `normalizeRevision(raw, catalog, reviewedAliases)`, `purchaseTotals`, `quoteTotal`, `compareQuotes`, `buildURL`, and `revisionText`. `normalizeRevision` is idempotent. It only applies aliases supplied by the reviewed identity registry; names never trigger merging.

The browser bridge is `window.PCP_BUILD`, exposing `snapshot()`, `catalog()`, `starter()`, `setLocks(ids)`, `load(snapshot, {preserveLocked})`, and `select(slot, id, mode)`. Native updates preserve the existing `pcp:build` event and additionally emit `pcp:build-state` with stable IDs and fan choices. No personal data is included.

Saved revision storage key: `pcp-build-revisions-v1`. Quote worksheet storage key: `pcp-budget-lab-v1`. Saves remain local to the browser. Unavailable/full storage produces an explicit error and leaves export/print usable. No account, email collector, delivery service, remote persistence or price alerts are activated.

Share URLs are unlisted, not private. They include `build`, `fans`, `region`, `owned`, `locked` and `plan`. They exclude the user-entered revision name and budget. The routing/index policy must keep arbitrary builder query states out of the index. They give the recipient component choices without any edit capability to the sender's browser storage.

## Integration

Call `require('./program-builder.cjs')({root, records, shell, write, esc})` after the established builder/shopping route generation and before the final SEO pass. The generator is idempotent for its injected sections and assets. It does not modify production hosting settings or push the automatic deployment branch.

Owned files: `scripts/program-builder.cjs`, `scripts/compatibility-evidence.cjs`, `scripts/check-builder-program.cjs`, `dist/builder-program.js`, `dist/builder-program.css`, generated `dist/compatibility-evidence.js`, and these builder documentation files. `dist/builder-v2.js` receives only the stable bridge, lock guards, update event and unsupported outlook-display correction.

## Validation receipt

Actually run: `node scripts/check-builder-program.cjs` — 16 behavior cases passed. They exercise empty and unknown evidence, sourced socket checks versus exact BIOS gaps, real documented mismatch, nominal versus complete fit, memory/socket quantities, explicit quote arithmetic, regional stock/expiry rules, reviewed alias idempotency and preserved partner variants, share fields, storage failure, saved-state differences, duplicate imported revision IDs, browser-global loading and native bridge behavior. Syntax checks passed for the generator, shared engine, client script and amended builder.

Browser QA remains a separate staging gate and will be recorded in the program release report after integration. No field Core Web Vitals or live traffic outcome is claimed.

## Blocked dependencies

An authorized maintained retailer feed, a complete exact BIOS/CPU-support dataset, cooler/connector inventory, human editorial review and production-release authorization remain unavailable. The implementation does not replace them with generated prices, universal compatibility, a live optimizer or fabricated benchmark evidence. Delivery, accounts and outreach remain inactive.
