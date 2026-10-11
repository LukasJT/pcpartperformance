# Console evidence integration

Evidence checked October 9, 2026. This is a researched source register; the owner still needs to review publication. No first-party benchmarks, source licenses, live performance checks or deployment are claimed.

## Loading

Copy `scripts/program-console-evidence.cjs` to a browser asset, loaded before the console-card renderer. It exposes `window.PCP_CONSOLE_EVIDENCE`; Node uses `require()` on the source file. It performs no network requests and does not depend on the legacy dataset.

Use `lookup(record.gameId, record.system)` with the **exact existing system string**. All 45 current rows are covered. Unknown keys produce an unverified record with an empty `modes` array. Never fall back to `record.modes` or inherit a nearby console's data. A new console/game row remains unverified until this register is expanded.

## Rendering

- Render the returned `edition`, `status`, and limitations; source check date means when documentation was inspected, not a current-game measurement.
- Render each `mode.name`, `mode.resolution || "Resolution not verified"` and `formatFps(mode)`. A `null` FPS stays unknown even when a refresh mode states `120 Hz`.
- Use `mode.sourceUrl` and `mode.publisher` beside claims. `getSource(id)` adds the publication date/revision, findings and inspection method. A separate `resolutionSourceId` identifies resolution supported by another source.
- Show `mode.conditions` and `mode.limitations` where relevant. These contain player-count, display, patch, edition and uncertainty details.
- `measurementStatus` distinguishes `manufacturer-target`, `original-measured`, `original-observation`, and `unknown`. A reported mode or cap is not an average, 1% low, guarantee or estimated PC FPS.
- `appliesTo` limits compound console groups. For a specific submodel view, call `modesForSystem(gameId, record.system, exactSubmodel)`. No docked or untested Switch observation is assigned to Switch Lite; no original Xbox One observation is assigned to One S; grouped PS5 labels do not pretend to be independent Slim measurements.
- Render unverified rows as a useful source/evidence gap, with no FPS number. Do not remove the game or copy a different edition's art/performance to fill the gap.

The registry has 19 supported, 16 partial and 10 unverified records. “Supported” means the stated historical mode/target has supporting evidence, not that every frame meets it today. Partial records retain only supported claims and explain omitted claims or limited model coverage.

## Important corrections

PS4 Pro Ragnarök performance is unlocked from a 30 FPS base. Its old 60 FPS statement is unsupported. Series S Forza Horizon 5 quality is documented at 1080p/30; the inspected announcement leaves performance-mode pixels unspecified. Sea of Thieves' Series X patch describes 120 Hz output; this is not promoted to an FPS measurement, and no Series S 120 claim is inherited. Mario Kart 8 Deluxe separates solo/two-player and three/four-player split-screen observations. Galaxy's original Wii developer statements remain separate from the 2025 remasters. Minecraft's PC Deluxe listing cannot validate console FPS, and an announced native Switch 2 release cannot validate backward-compatible performance.

## Tests and review

Run `node scripts/check-console-evidence.cjs`. The 19 checks use the actual console dataset and exercise full coverage, exact keys, no extrapolation, unknown values, corrected modes, output refresh versus FPS, edition scope, browser UMD loading, and persisted audit consistency. They verify implementation policy; they do not replace editorial source review or console hardware testing. The accompanying JSON preserves original claim strings solely as audit evidence and must not be loaded into public cards.

Research fetch failures are recorded as evidence gaps, not public-site outages. The register stores linked paraphrases and small claim facts; it does not redistribute benchmark tables, videos, images or raw measurement datasets. Browser QA and the central integration remain the parent implementation's responsibility.
