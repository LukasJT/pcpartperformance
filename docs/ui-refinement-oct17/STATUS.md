# October 17 UI refinement

Scope: improve the existing product and preserve its routes, exact hardware identities, source evidence, compatibility engine, price rules and local saved data. No framework, account system or data feed replacement.

## Confirmed baseline

- The live mobile header is 148 px tall at 390 px and exposes six crowded primary links; desktop header is 84 px. All 26 initial route/viewport samples returned 200 without horizontal document overflow. Lack of overflow does not establish a comfortable layout.
- The owner screenshots show a visually dominant empty-choice row, repeated picker instructions and crowded controls. The existing picker puts the keyboard instructions in a full footer paragraph.
- The guides index has useful search/filtering and 54 articles, but its introduction gives no visual entry point to a learning path. Saved-work features have the same discoverability problem.
- The builder ships multiple inherited layout layers, including a 31 KB legacy stylesheet. The refinement replaces obsolete layers where the current destination layout is self-contained rather than raising the existing transfer budgets.

| ID | Work | Evidence / files | State |
|---|---|---|---|
| UI-01 | Compact responsive navigation; grouped destinations and utilities; keyboard dismissal/focus | `continuation-ui.js`, `ui-system.css`, `ui-refinement.cjs` | Implemented and tested |
| UI-02 | Spacious part picker; visible search without input autofocus; compact empty choice; short count; category-specific icons | `builder-selectors.js`, `builder-picker.css`, `builder-workspace.css` | Implemented and tested |
| UI-03 | Task illustrations and clearer Build/Upgrade/Compare/Learn/My PC/Compatibility entry points | `ui-refinement.cjs`, `ui-destinations.css` | Implemented and tested |
| UI-04 | Typography, forms, cards, product imagery, reading rhythm, mobile stacking | Shared styles; retained templates | Implemented and visually reviewed |
| UI-05 | Both themes, mobile/tablet/desktop, filters, imports, saving, focus and reduced motion | Isolated browser QA and regression checks | Tested; production verification pending |
| UI-06 | Existing payload budgets, route/metadata integrity and production verification | Existing build, audits and Git release | Pending |

Before screenshots and the actual browser report are stored here. After reports must describe current tests, not reuse the previous release's results as proof of this layout.

## Final implementation checkpoint

UI-01–UI-05 are implemented and tested. UI-06 passes local generation, unchanged payload budgets and HTML integrity gates; clean tracked-file build and actual live verification follow the release commit. See RELEASE.md and the linked raw receipts.
