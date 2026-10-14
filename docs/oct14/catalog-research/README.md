# Exact computer catalog expansion — October14,2026

## Delivered data

- `scripts/oct14-prebuilt-data.cjs`:84 regional desktop records —43 Canada and41 United States. The original9 configurations keep their original IDs, specifications and inspection dates.71 extra exact regional retailer listings and4 fixed NZXT manufacturer configurations were inspected.
- `scripts/oct14-laptop-data.cjs`:42 exact regional laptop configurations —21 Canada and21 United States. Includes ASUS, Lenovo, Acer, MSI, Alienware, HP, Gigabyte and Razer. Laptop graphics are explicitly identified as Laptop GPUs.
- `scripts/oct14-laptop-pages.cjs`:a useful `/laptops/` destination and `/data/gaming-laptops.json`, plus a dedicated responsive stylesheet/controller. Multi-brand, graphics-series and screen-size filters; up-to3 exact comparisons; regional share links; source-linked product buttons.
- `prebuilt-source-records.json` and `laptop-source-records.json`:exact source pages, regional listing identities and inspected facts. Selected Razer SKU specifications and NZXT fixed configurations are preserved in their respective data modules.
- `product-image-sources.json`:58 extra desktop and33 laptop photo sources. Photos are linked from exact retailer or manufacturer product pages; no open redistribution licence or first-party photography ownership is claimed. Razer's two black Blade16 configurations share their manufacturer chassis image.

## Evidence boundaries

There is no price feed in these data files. All new prices and stock states are null. A public listing read by a research tool is not treated as an automatic live inventory observation. Best Buy's direct server request returned403; this expansion does not bypass that response. Exact listing pages were accessible through ordinary web research.

Unknown motherboard, PSU, memory-module layout, warranty and connector details remain unknown. The Canadian MSI CodexR2 listing19396815 has contradictory memory/storage copy:these two fields remain null with a source-conflict record. iBUYPOWER listing20012906 has conflicting VRAM copy:video-memory capacity remains null.

The4 NZXT records use explicitly named configuration signatures, not invented factory part numbers. Their source scopes preserve the fixed CPU/GPU/RAM/storage combination and acknowledge unfixed colour/component brands. They are not claimed as4 extra shipping SKUs.

The laptop catalog does not infer GPU power limits, measured FPS, battery life, weight or upgradable memory from a model-family name. A missing exact CPU number is shown as an undisclosed model. Retailer product IDs remain useful identities when a manufacturer model number is not supplied.

Unavailable product photographs remain absent. The page offers the exact retailer's photo link instead of substituting a different product or unrelated family photograph. Some Best Buy US media URLs resolve small thumbnail transformations; use the same verified media object with a larger documented CDN transformation before local optimization. Publication image ingestion remains a separate integration step.

## Validation actually run

`node scripts/oct14-catalog.test.cjs`:13 checks passed. Coverage includes original-record preservation, identities, region/currency, source dates, absent price/stock, source conflicts, NZXT identity kind, laptop-versus-desktop graphics, multi-brand filtering, compactGPU spelling, screen groups, unknown values, validated share selections, generated labels/links/data, contain geometry and reduced motion.

ESLint passed the5 new JavaScript catalog/generator/controller/test files with the repository's existing configuration. JavaScript syntax checks passed for the laptop controller and generator. Full-site build, SEO, visual QA and deployment are handled centrally; this agent did not deploy. Independent desktop browser QA verified multi-brand filtering, exact2-laptop comparison, preserved unknown GPU power, country switching with cleared selections, compact RTX5080 search and no horizontal overflow; global viewport settings were not changed. Browser QA found malformed image URLs from tool-error suffixes and several retailer-logo entries. The source register was corrected and a regression check added; the centrally rebuilt pages must be checked again for final photo loading.

## Build hooks

The desktop module exports an Array plus `fieldsFromTitle` and `newSources` properties. The laptop module exports an Array plus `fieldsFromTitle`.

Call the laptop generator with `{root,shell,write,esc}` after the shared shell is available and before the final SEO/routing pass. Link `/laptops/` from ordinary navigation. Query-based comparison states must remain outside the search index; the stable hub can be indexed. Existing prebuilt pages/controllers must consume the expanded desktop Array rather than duplicate configurations.
