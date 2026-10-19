# Ad-container accessibility regression

Actual rendered diagnosis and verification: October 19, 2026.

## Cause and source correction

The original full axe audit covered 146 scenarios and reported 60 failures. Every failure was `aria-prohibited-attr` on `.pcp-ad-slot`. The illustrations were not the cause.

`scripts/ads-injection.mjs:7` put `aria-label="Advertisement"` on a generic `div`, whose implicit role does not support an accessible name. The shared source now explicitly uses `role="group"`, retaining the existing name, class, data attribute, placement, scripts and consent controls. A group supports the name without adding a separate page landmark for each advertising placeholder.

Ad placeholders are injected by the actual Worker response pipeline, not stored in the generated HTML. A running preview retains its imported module until restarted. The old preview at port 4200 therefore continued to show the defect after the source fix. A separate loopback-only instance of the existing actual Worker adapter at port 4203 first verified the corrected source without interrupting the other preview. After the fourth central build and the parent's restart, the final check was repeated successfully against **port 4200**; the after report records that final origin.

## Evidence

- [Before](before.json): the original actual full audit's 60 same-target failures, retained before its report is replaced.
- [After](report.json): **24 of 24 rendered cases passed** the exact original axe rule. Eleven affected destinations were tested at 390px and 1440px, together with the builder's two no-ad controls.
- `node --test scripts/total-ads-semantics.test.mjs`: **3 passed** after first reproducing the invalid container as a failing regression. The tests also preserve the eligible placement types, stylesheet/script identity, Ad choices action and exclusion of builder/performance/workspace workflows.
- Both new test/QA modules pass scoped ESLint.

This focused after check does not replace the full six-theme axe matrix, screen-reader review or physical-device testing. Production requires release of the corrected Worker source; a passing local test is not deployment evidence.

## Repeat the rendered check

Use the existing local actual Worker preview with the current source, set `PCP_TOTAL_ORIGIN` to that loopback origin and `PCP_PLAYWRIGHT_MODULE` to the available local Playwright installation, then run:

```text
node scripts/total-ads-semantics-qa.cjs
```

The runner uses disposable headless Edge contexts and declines advertising consent. It does not use the owner's browser profile or request live advertisements.
