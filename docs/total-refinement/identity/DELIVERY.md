# October 19: lossless browser delivery

The build keeps the existing public object contracts. No catalog fact, selected ID, unknown status, source URL, image entry, or category is removed by this delivery pass.

- `program-site.cjs` writes `builder-catalog.js` through a reversible field-metadata/key dictionary. It synchronously restores the complete `window.PCP_BUILDER_CATALOG` before the builder runs. The already-sanitized builder catalog makes a second legacy identity patch unnecessary.
- The final `build-pages.cjs` hook emits `data-compact.js` from the complete canonical `data.js` payload, and emits source-bound compact core/interface/assembly siblings. HTML references those siblings; the original JS remains unchanged for source maintenance and inspection.
- Terser preserves top-level symbols and does not remove unused declarations. Prepared artifact source/output SHA-256 hashes are checked on each build. A stale output stops the build.
- There is no new network dependency, asynchronous catalog stage, evaluation of downloaded code, or delayed image index. The existing explicit-intent 3D loading behavior is unchanged.

## Maintenance

After changing `dist/core.js`, `dist/interface.js`, or `dist/assembly-3d.js`, regenerate committed artifacts:

```powershell
node scripts/oct19-delivery-packing.cjs --prepare
node --test scripts/oct19-delivery-packing.test.cjs scripts/identity-integration-oct19.test.cjs
```

Then run the normal full build and performance budgets. The helper has no production minifier dependency.

## Evidence before the final rebuild

Seven transport/VM tests pass, together with seven identity integration tests. They cover exact real-data round trips; null/false/arrays/prototype-like keys; original-input immutability; idempotent finalization; stale artifact rejection; real core/interface outputs and event registration; assembly lifecycle without asset loading; and seven historical IDs restored and saved through the actual builder engine.

Measured against the previous built output:

| Payload | Original gzip bytes | New gzip bytes |
| --- | ---: | ---: |
| Complete legacy data | 20,608 | 18,220 |
| Complete builder catalog | 43,810 | 40,692 |

The compact core/interface/assembly artifacts additionally save 622/440/600 gzip bytes. Removing the redundant builder identity patch saves 1,185 bytes. Predicted initial route totals before late compatibility enrichment: hardware 96,412 (budget 98,000), builder 119,951 (budget 122,000). These are offline measurements, not a substitute for the final build budget checks or rendered browser QA.

Rollback: remove the final delivery hook and the builder transport call, restore its direct JSON assignment, then rebuild. Canonical sources and all IDs remain available; saved user data is unaffected.
