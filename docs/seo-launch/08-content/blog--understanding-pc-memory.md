# How to choose PC memory: capacity, DDR generation and timings

URL: /blog/understanding-pc-memory/
Meta description: Understand RAM capacity, DDR4 and DDR5 compatibility, kit configuration, transfer rates and CAS latency before choosing a memory upgrade.
By PC Part Performance. Materially revised October 3, 2026. Original publication date not recorded.

Match the memory generation and physical module type first. Choose capacity for your workload, then compare supported kits and timings. A lower CL number only has meaning alongside its transfer rate.

## Identify the platform before the kit

Check the motherboard manual and processor specification for the memory generation and supported configuration. DDR4 and DDR5 are different standards, not interchangeable upgrades. Desktop DIMMs and laptop SODIMMs are different physical formats.

Write down the kit’s complete part number, module count and capacity per module. A 32 GB kit can contain two 16 GB modules; a listing for one 32 GB module describes a different configuration. Compare what is actually included in the box.

## Use workload evidence to choose capacity

Look at memory usage during the tasks that feel slow, including the browser, game and background applications you normally run together. An application’s recommended system requirements are a useful starting point, but they do not account for your entire multitasking session.

Distinguish insufficient capacity from other limits. Adding RAM does not automatically fix a graphics-card limit, a slow network or a frame cap. Leave room in your plan for larger projects, while avoiding an expensive capacity increase that has no identified use.

## Compare transfer rate and latency together

A transfer rate in MT/s and CAS latency in cycles describe different things. The first-word CAS estimate is CL × 2,000 ÷ MT/s, in nanoseconds. DDR5-6000 CL30 therefore gives 10 ns; DDR5-6000 CL36 gives 12 ns.

These are calculated timing examples, not total system latency or measured game performance. Other timings and the platform matter. Use our calculator to compare the arithmetic, and application tests to judge whether the difference matters to your workload.

## Check the installation and supported profile

Read the board’s recommended slots for a two-module kit. A physically empty slot is not necessarily the preferred first slot. Consult the memory compatibility list and notes about module count, processor generation and firmware.

A rated profile is not a guarantee that every combination will operate at that setting. Record the intended profile, voltage and firmware instructions; verify stability after applying it. Troubleshooting is easier when you know which settings changed.

## Keep a matched kit and a useful checklist

When comparing upgrade routes, distinguish adding modules from replacing the kit. Two packages with similar branding are not automatically validated as one combined kit. Ask the vendor about the exact combination if you plan to mix existing and new modules.

Before ordering, confirm generation, form factor, total capacity, module count, kit number and platform support. Then compare the complete local price. Our catalog helps identify models; a memory timing calculation does not certify stability or assign an FPS gain.

## Sources

Checked 2026-10-03.

- [Kingston: CAS latency and RAM timings](https://www.kingston.com/en/blog/gaming/cas-latency-cl-ram-timing-explained)
- [MSI MAG B650 TOMAHAWK WIFI manual](https://download.msi.com/archive/mnu_exe/mb/MAGB650TOMAHAWKWIFI.pdf)
- [AMD Ryzen 7 9800X3D specifications](https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html)

## Related resources

- /hardware/memory/
- /tools/ram-latency-calculator/
- /blog/how-to-choose-gaming-ram/
- /builder/

Corrections: /editorial-policy/#corrections. Interactive calculators and their visible examples are implemented in scripts/seo-launch.cjs and dist/research-tools.js.
