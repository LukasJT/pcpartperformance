# Upgrade and prebuilt decision integration

Implementation record: October 13, 2026. This module extends the retained planners; it supplies no new price observations, benchmark records or compatibility facts.

## Source and integration

- `scripts/master-decisions.cjs`: idempotent route decorator and asset copier.
- `scripts/master-decisions.js`: bounded browser-tab context, explicit reuse choices, checklist and quote handoffs. Pure helpers are exported for tests.
- `scripts/master-decisions.css`: scoped layout, readable controls, theme tokens, focus states, phone layout and reduced-motion handling.
- `scripts/check-master-decisions.cjs`: pure checks, temporary generator fixtures and actual retained-controller DOM fixtures.

Hook after the existing route generators and continuation modules, before release-wide HTML/asset finalization:

```js
require('./master-decisions.cjs')({ root, records, images, shell, write, esc });
```

Affected retained routes: `/upgrade/`, `/prebuilts/`, `/tools/budget-build-lab/` and the nine existing `/prebuilts/{id}/` exact-system pages. No new route, framework, duplicate calculator, account, delivery job or production side effect is created. The decorator throws if a retained route signature no longer provides the required integration point.

## Visitor workflows

### Upgrade → complete purchase worksheet

1. Select installed exact models and enter the actual goal, symptom, workload and new spending limit in the existing upgrade form.
2. The existing controller creates its inventory and compatibility/readiness report. Only then are the new choices available.
3. Choose Keep / Replace / Verify for each category. Scenario buttons are editable purchase scenarios, not recommended hardware or proof of an improvement. Unknown parts cannot be marked owned; applied phases keep the exact new model ID and remain new purchases.
4. Carry the choices to the existing Budget Build Lab. The destination shows the inventory, region, budget and choices before the user explicitly starts a new worksheet. This action clears previous quotes rather than relabeling cached amounts.
5. The existing calculator handles required purchase costs, partial totals, complete differences and budget fit. Known CPU, board, GPU, RAM and PSU reuse maps to matching owned fields. Combined storage, case/fans, cooling, operating system, accessories, tax and shipping stay unresolved until the user supplies a quote or explicitly confirms owned / not needed.

Changed inventory, budget, goal, symptom or workload notes require recreating the reuse plan before another handoff. The retained exact-model replacement, phase, builder-open and export controls remain in place.

### Exact prebuilt → buying checklist → Build vs Buy

1. Choose an exact researched configuration, including retailer SKU/model and country.
2. Read the listed parts separately from undisclosed or partially documented internals. The existing researched date and exact retailer link remain visible. Neither the current price nor online stock is inferred.
3. Mark personal checks for exact identity/seller/condition, board/PSU/connectors, memory/storage, cooling/fit, software/ports, warranty/returns and delivered quote. The count says what the visitor marked, not a readiness score. Checks reset when the selected configuration changes and are not saved as verified evidence.
4. Apply that system to the existing Build vs Buy worksheet. Applying switches to its documented country, clears the previous prebuilt price/delivery quote and requires new exact quotes. A pending context cannot calculate against old quotes before it is applied.

### Detailed DIY quote → prebuilt cost comparison

Only a complete column in the existing Budget Build Lab can be handed off. The transfer carries actual manual parts/accessories, OS and tax/shipping amounts into the existing Build vs Buy inputs. Assembly/support and the current exact prebuilt quote remain unknown. Numbers are never converted between CAD and USD. Very large category totals beyond the receiving form's existing limit cannot transfer and receive a useful error.

## Data, privacy and evidence limits

- Context uses `sessionStorage` in the current browser tab, with a two-hour expiry and explicit apply/dismiss controls. A disabled-storage failure is announced; the original manual tools remain usable.
- Stable bounded component IDs are kept distinct. No partner variant is collapsed by name.
- Notes, pasted parts-list text, email, arbitrary URLs and analytics parameters are not transferred. Workload notes are displayed locally through text nodes. They are not included in the new context.
- The module makes no network request. It uses installed exact choices and the existing nine researched prebuilt records. It does not download models, collect offers, scrape retailers, invent benchmark improvements or rank a system as the best deal.
- Handoff amounts are user-entered quotes, not live observations or a warranty of current availability. A kept part is a user reuse choice, not proof it supports a changed system.
- The cost worksheet is not an optimizer. Scenarios do not prove that buying is better than keeping the current PC.

The existing prebuilt source cohort was researched October 11, 2026. This implementation did not re-research those listings, add fresh prices or mark its records newly verified.

## Validation actually run

`node --check` passed for the generator and browser module. `node scripts/check-master-decisions.cjs` passed **16 checks** covering:

- unknown/zero/currency/cent handling;
- context size, TTL, schema, duplicate categories and exact ID validation;
- owned-versus-new phase identity;
- private note exclusion and safe text rendering;
- complete manual quote transfer, including missing tax and unknown support;
- prebuilt disclosure states;
- 12-route generator preservation and idempotency;
- retained `upgrade-program.js`, `builder-program.js` and `prebuilt-ui.js` working with the module in DOM fixtures;
- stale planning input and old exact-prebuilt quote handling;
- personal checklist reset;
- unavailable storage recovery;
- absence of network, analytics and 3D payload work in the new module.

Current retained route copies also accept a repeated hook without modifying their HTML. No full-site build, browser visual test, production deployment or account change was performed by this subtask. Parent integration owns those release gates.

Unminified source assets measured locally before release finalization: JavaScript about 28 KB / 8.5 KB gzip; CSS about 6.4 KB / 1.8 KB gzip. These are file payload measurements, not Core Web Vitals or field performance results.

## Parent QA and release checks

Exercise these browser journeys at phone and desktop widths in both themes:

1. Create an upgrade plan, choose one-part/platform/reuse, apply an exact phase, open the full quote worksheet, confirm the new context and complete its missing fields.
2. Change a planning input and confirm that the old handoff is unavailable until regeneration.
3. Select a Canada and a US prebuilt, inspect exact identity/disclosures, mark/reset checks and apply its quote context. Verify old price fields clear and current currency is explicit.
4. Transfer a complete DIY column into Build vs Buy; verify OS/tax/shipping are carried, support/prebuilt remain unknown and the original calculator produces a result only after completion.
5. Check keyboard radio/checkbox/select/button controls, visible focus, layout at 320 px and long model names, and reduced motion.

Rollback: remove the generator hook and rebuild from the preceding source revision. The retained controllers and saved worksheet schemas are not migrated or replaced. Remove `pcp-decision-handoff-v1` from the tab only if clearing a pending context is desired.
