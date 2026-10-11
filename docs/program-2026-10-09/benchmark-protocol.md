# Benchmark integrity and reproducible testing

Status: protocol implemented, collection not performed. Dataset 2026-10-09.1 contains zero site-owned or redistribution-permitted measured PC runs. No calibration, independent holdout test, error distribution, confidence interval, or measured 1% low is available.

The previous UI used synthetic-score/VRAM factors, assumed game baselines and CPU-core/clock caps, then multiplied the output to make ranges and 1% lows. Those multipliers are not game measurements or statistical uncertainty. The default UI now reports insufficient evidence; an opt-in experimental calculation exposes only its assumed point estimate and its limitations. It must not be used as a benchmark or purchasing guarantee.

## First-party collection procedure

1. Record the exact game/build, GPU partner SKU and firmware, CPU, board/BIOS, DIMM count/capacity/speed/timings, OS, driver and patch versions. Document clocks/power settings rather than silently overclocking.
2. Fix resolution, quality, RT, upscaler version/mode, frame-generation mode, test scene, capture duration and traversal. Keep generated-frame counts separate from base rendering performance and latency observations.
3. Use the publisher's reproducible built-in test where suitable or publish a repeatable traversal. Warm up separately; capture several runs under the same conditions. Preserve each run, temperature and relevant background-task observations.
4. Preserve frame-time data where permitted. Declare how average FPS and low-percentile metrics are computed (percentiles and averages of slowest frames are different definitions). Do not derive low FPS metrics from average FPS.
5. Record run IDs, source links, measurement date, measurement status and redistribution rights. Use separate configuration/game sets for calibration and evaluation if a prediction model is later introduced; publish coverage and measured errors.
6. Human-check imported records and rights. Only eligible validated records can be displayed as measured. Do not mix scenes/patches/settings into a universal average.

The machine-readable contract is `scripts/benchmark-evidence.cjs`. Tests reject incomplete records, incompatible settings and unknown redistribution rights. The import/export format is data-only JSON; no executable imports or arbitrary server-side URL requests.

Console entries currently describe source-linked mode targets. They do not establish sustained FPS for every scene, patch or console revision. Their existing source links are retained; a full row-by-row original-source review is still needed before certifying the whole console library.
