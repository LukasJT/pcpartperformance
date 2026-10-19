# Reproducible verification tools

Install with Node24 and pnpm10.34.7:

```sh
pnpm --dir tools/quality install --frozen-lockfile --ignore-scripts
node scripts/run-master-checks.cjs
node scripts/check-component-photo-files.cjs
```

Run these from the repository root. The normal website build does not require these dependencies; CI builds before installing them to verify that separation.

Image verification uses the locked Sharp package in this directory. `PCP_SHARP_PATH` can select a deliberately configured alternate local runtime. GLB verification imports `model-validation.mjs`, which resolves the declared glTF Transform, Meshopt and Khronos validator packages here. No sibling checkout, personal Windows path or ignored download cache is required.

Delivery checks decode the shipped pixels and validate dimensions, byte lengths, hashes, exact catalog joins and frozen provenance. Preparing replacement images separately requires the original source bytes and their prior review hashes. A CI pass does not acquire image redistribution rights or certify physical hardware fit.

Sharp0.35.5 fixes the high-severity upstream librsvg issue described in [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w). The dated dependency-audit receipt is in `docs/total-refinement/qa/linux-validation/`; it is a current advisory check, not a security guarantee.
