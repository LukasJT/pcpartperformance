/* Curated console evidence, checked 2026-10-09. No network or frame-rate estimation.
 * Exact game + system keys are intentional. Targets, caps and narrative observations
 * are different from measured averages. Do not fall back to legacy mode strings. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.PCP_CONSOLE_EVIDENCE = api;
})(function () {
  'use strict';
  const VERSION = '2026-10-09.1', CHECKED_AT = '2026-10-09';
  const SOURCES = Object.create(null), RECORDS = Object.create(null);
  function source(id, publisher, title, url, publishedAt, kind, findings, options = {}) {
    SOURCES[id] = { id, publisher, title, url, publishedAt, kind, checkedAt: CHECKED_AT,
      inspection: 'original-publication-inspected', findings,
      // Reading public source material does not establish dataset redistribution rights.
      redistributionRights: 'not-established; linked paraphrase only', ...options };
    return id;
  }
  source('epic-2020', 'Epic Games', 'Fortnite next-generation console modes, v15.10 update',
    'https://www.fortnite.com/news/day-1-ready-fortnite-arrives-next-week-on-xbox-series-x-s-and-ps5', null,
    'manufacturer', 'PS5 and Series X: 4K/60; 120 mode at maximum 1440p. Series S: maximum 1200p/60, or 1080p/120. This December 2020 update does not mention PS5 Pro.', { revision: 'v15.10, December 2020' });
  source('epic-switch-2021', 'Epic Games', 'Fortnite Switch resolution update',
    'https://www.fortnite.com/news/gpu-performance-and-resolution-boost-for-fortnite-on-nintendo-switch', '2021-03-30',
    'manufacturer', 'Documents expected dynamic resolution of 1560 × 880 docked and 1170 × 660 handheld, but no numerical frame rate.');
  source('epic-switch2', 'Epic Games', 'Fortnite comes to Nintendo Switch 2',
    'https://www.fortnite.com/news/fortnite-comes-to-nintendo-switch-2', '2025-06-04',
    'manufacturer', 'Switch 2 publication specifies 60 FPS, 2176 × 1224 docked and 1600 × 900 handheld.');
  source('gowr-gdc', 'Santa Monica Studio / Stephen McAuley', 'Rendering God of War Ragnarök, GDC 2023',
    'https://media.gdcvault.com/gdc2023/Slides/Rendering_God_Of_McAuley_Stephen.pdf', null,
    'manufacturer', 'Graphics-mode chart on PDF page 70 distinguishes PS4, PS4 Pro and PS5 targets. PS4 Pro performance is unlocked from a 30 FPS base, not a 60 FPS target.',
    { revision: 'GDC 2023, page 70', authorshipUrl: 'https://www.gdcvault.com/play/1029298/Rendering-God-of-War-Ragnarok', inspection: 'original-PDF-chart-visually-inspected' });
  source('gowr-pro', 'Santa Monica Studio', 'God of War Ragnarök patch notes v06.00',
    'https://support.sms.playstation.com/hc/en-us/articles/31642737345293-Patch-Notes-v-06-00', '2024-11-05',
    'manufacturer', 'PS5 Pro Enhanced uses favour-quality features at 60 FPS. HFR unlocks with VRR; PSSR is optional. Exact pixel dimensions and measured averages are not supplied.', { revision: 'v06.00' });
  source('insomniac-remaster', 'Insomniac Games', 'Spider-Man Remastered graphics modes',
    'https://support.insomniac.games/hc/en-us/articles/46670280641299-What-Accessibility-options-does-Marvel-s-Spider-Man-Remastered-have', '2025-11-24',
    'manufacturer', 'PS5 fidelity targets 30 FPS; performance targets 60 FPS. Describes temporal 4K from different base resolutions.', { dateMeaning: 'support-page update' });
  source('insomniac-miles', 'Insomniac Games', 'Miles Morales PS5 graphics modes',
    'https://support.insomniac.games/hc/en-us/articles/46670895263635-What-Accessibility-options-does-Marvel-s-Spider-Man-Miles-Morales-feature', '2025-11-19',
    'manufacturer', 'Explicit PS5 section gives fidelity 30 FPS and performance 60 FPS, with temporal 4K from different base resolutions.', { dateMeaning: 'support-page update' });
  source('insomniac-vrr', 'Insomniac Games', 'VRR support',
    'https://support.insomniac.games/hc/en-us/articles/46679539272851-What-is-VRR-support', '2025-11-19',
    'manufacturer', 'Compatible 120 Hz displays, VRR and game updates can unlock frame rates. This does not establish a fixed higher average.', { dateMeaning: 'support-page update' });
  source('nxg-spiderman2', 'Michael Thompson / Binary Dinosaur (NXG)', 'Spider-Man 2 technical performance review',
    'https://binarydinosaur.co.uk/spider-man-2-technical-performance-review', '2023-10-22',
    'original-analysis', 'Original technical analysis documents fidelity 30, performance 60, and fidelity 40 on 120 Hz displays. Reported modes are caps/targets, not a cross-scene average or 1% low.');
  source('riot-console', 'Riot Games', 'VALORANT console guide',
    'https://support.riotgames.com/en-us/valorant/gameplay/valorant-console-guide', '2026-06-02',
    'manufacturer', 'Confirms console platforms; inspected guide does not establish numerical FPS or internal resolution.', { dateMeaning: 'support-page update' });
  source('gta5-2022', 'Rockstar Games / Take-Two Interactive', 'Grand Theft Auto V available on PS5 and Xbox Series X|S',
    'https://ir.take2games.com/node/28526/pdf', '2022-03-15',
    'manufacturer', 'Native PS5/Series X edition: fidelity native 4K with ray tracing targets 30; performance upscaled 4K targets 60; performance RT upscaled 4K with ray tracing targets 60.');
  source('rgt-gta5', 'Paul RGT / RedGamingTech', 'GTA V Xbox One versus PlayStation 4 graphics comparison',
    'https://redgamingtech.com/grand-theft-auto-5-xbox-one-vs-playstation-4-graphics-comparison/', '2014-11-26',
    'original-observation', 'Original launch-build analysis reports native 1080p and a 30 FPS target with busy-scene drops. It does not test the later Xbox One S.');
  source('capcom-wilds', 'Capcom / PlayStation Blog', 'Monster Hunter Wilds ready for the hunt on February 28',
    'https://blog.playstation.com/2025/02/27/monster-hunter-wilds-ready-for-the-hunt-on-feb-28/', '2025-02-27',
    'manufacturer', 'Separate PS5 and PS5 Pro modes target 30, 40 or 60 FPS; balanced requires a 120 Hz display. Pro modes use PSSR. Exact internal pixel counts are absent.');
  source('forza-2021', 'Playground Games / Forza', 'Welcome to Forza Horizon 5',
    'https://forza.net/news/welcome-to-forza-horizon-5', null,
    'manufacturer', 'Series X quality is 4K/30, Series S quality is 1080p/30. Both have a 60 FPS performance option; this source does not give its exact resolution or old-console numerical targets.', { revision: '2021 announcement' });
  source('rare-nextgen', 'Rare / Joe Neate', 'Sea of Thieves on Xbox Series X and S',
    'https://www.seaofthieves.com/pt-br/news/xbox-series-x-and-s', '2020-11-04',
    'manufacturer', 'Developer announcement specifies Series X 4K/60 and Series S 1080p/60.', { canonicalUrl: 'https://www.seaofthieves.com/news/xbox-series-x-and-s', accessNote: 'Equivalent official locale publication inspected; English URL returned access failure in research tool.' });
  source('rare-2-0-21', 'Rare', 'Sea of Thieves release notes 2.0.21',
    'https://www.seaofthieves.com/pt-br/release-notes/2.0.21', null,
    'manufacturer', 'Documents a Series X 120 Hz performance mode at 1080p and display/HDR conditions. Hz is an output refresh mode; this registry does not convert it into measured or targeted FPS.', { revision: '2.0.21', canonicalUrl: 'https://www.seaofthieves.com/release-notes/2.0.21' });
  source('xbox-fps-boost', 'Xbox Wire / Microsoft', 'Five Bethesda titles get FPS Boost',
    'https://news.xbox.com/en-us/2021/03/15/five-legendary-bethesda-titles-get-fps-boost/', '2021-03-15',
    'manufacturer', 'Skyrim Special Edition backward-compatible FPS Boost is described as nearly 60 FPS on Series X|S. No exact per-system resolution is given; this is distinct from the later native edition.');
  source('gaijin-faq', 'Gaijin Entertainment', 'War Thunder FAQ',
    'https://warthunder.com/en/game/faq', null,
    'manufacturer', 'FAQ specifies optimized Series X at 4K/60 FPS and Series S at 1440p/60 FPS. These are publisher claims, not site measurements.');
  source('botw-switch2', 'Nintendo', 'Breath of the Wild Nintendo Switch 2 Edition',
    'https://www.nintendo.com/us/store/products/the-legend-of-zelda-breath-of-the-wild-nintendo-switch-2-edition-switch-2/', null,
    'manufacturer', 'Product page describes higher resolution, HDR and improved frame rate, but the inspected text does not establish a numerical FPS target.');
  source('botw-switch', 'Nintendo', 'Breath of the Wild Nintendo Switch edition',
    'https://www.nintendo.com/us/store/products/the-legend-of-zelda-breath-of-the-wild-switch/', null,
    'manufacturer', 'Product page identifies the Switch edition without supporting the old numerical resolution/FPS table.');
  source('mk-world', 'Nintendo / programming director Sato', 'Ask the Developer volume 18: Mario Kart World, chapter 1',
    'https://www.nintendo.com/en-gb/News/2025/May/Ask-the-Developer-Vol-18-Mario-Kart-World-Chapter-1-2832687.html', null,
    'manufacturer', 'Programming director discusses maintaining the series 60 FPS goal in this Switch 2 project. This does not establish split-screen performance or exact resolutions.', { revision: 'May 2025 interview' });
  source('nl-mk8-deluxe', 'Thomas Whitehead / Nintendo Life', 'Mario Kart 8 Deluxe review',
    'https://www.nintendolife.com/reviews/nintendo-switch/mario_kart_8_deluxe', '2017-04-20',
    'original-observation', 'Launch review reports Switch TV 1080p and handheld 720p; solo/two-player 60 and three/four-player split-screen 30. Review predates Switch Lite.');
  source('nl-mk8-director', 'Nintendo director Kosuke Yabuki / interview by Nintendo Life', 'Mario Kart 8 developer interview',
    'https://www.nintendolife.com/news/2014/05/interview_mario_kart_8_director_kosuke_yabuki_on_key_features_of_the_wii_us_blockbuster_release', '2014-05-27',
    'manufacturer-interview', 'Original interview identifies 60 FPS as the Wii U single/two-player design goal. It is not an instrumented measurement, or evidence for all split-screen counts.');
  source('galaxy-2025', 'Nintendo', 'Super Mario Galaxy + Super Mario Galaxy 2',
    'https://www.nintendo.com/us/store/products/super-mario-galaxy-plus-super-mario-galaxy-2-switch/', null,
    'manufacturer', '2025 remaster listing describes 1080p on Switch and up to 4K TV output on Switch 2 with the free update. No numerical frame rate is supplied.', { revision: '2025 remaster bundle' });
  source('xtg-galaxy', 'Patrick / XTgamer', 'Technical check: Super Mario Galaxy 1+2',
    'https://www.xtgamer.net/2025/10/09/tech-check-super-mario-galaxy-12-rune-factory-goa-kirby/', '2025-10-09',
    'original-observation', 'Author reports both 2025 remasters at 60 FPS on Switch and Switch 2, docked/handheld, with occasional transition stutters. No instrumented dataset, patch or sample count is supplied; Switch Lite is not independently tested.');
  source('galaxy-wii', 'Nintendo / programmer Aoyagi', 'Iwata Asks: Super Mario Galaxy, developers chapter 5',
    'https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-Super-Mario-Galaxy/Volume-2-The-Developers/5-Easy-for-Beginners-Tough-for-Pros/5-Easy-for-Beginners-Tough-for-Pros-222714.html', null,
    'manufacturer', 'Programmer describes the original Wii game running at 60 FPS. This is a developer claim for the Wii edition, not evidence from the later remaster.');
  source('galaxy2-wii', 'Nintendo / programmer Hayakawa', 'Iwata Asks: Super Mario Galaxy 2, chapter 6',
    'https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-Super-Mario-Galaxy-2/Volume-2-Koizumi-Motokura-Hayakawa-and-Hayashida/6-This-Time-It-s-Really-Fun/6-This-Time-It-s-Really-Fun-238224.html', null,
    'manufacturer', 'Programmer explicitly describes the original Wii game at 60 FPS. No pixel resolution or independent test average is supplied.');
  source('lite-playmode', 'Nintendo', 'Nintendo Switch play modes',
    'https://www.nintendo.com/sg/support/switch/playmode/index.html', null,
    'manufacturer', 'Switch Lite has no TV mode. Docked observations cannot be presented as Switch Lite measurements.');
  source('minecraft-switch2', 'Nintendo Australia', 'Minecraft for Nintendo Switch 2 preorder announcement',
    'https://www.nintendo.com/au/news-and-articles/pre-order-minecraft-for-nintendo-switch-2-today/', '2026-10-08',
    'manufacturer', 'Regional announcement describes an upcoming native Switch 2 release; it does not verify FPS for either that release or backward compatibility.');

  const HISTORICAL = 'Published configuration at the source revision; current patches, scenes and display settings can differ. A target is not a measured average.';
  const OBSERVATION = 'Original author observation of that edition and test period. Patch, sample count and raw data are not established; no site-owned testing is claimed.';
  const SLIM = 'Source concerns the PS5 game edition. The grouped Slim label has no independent Slim measurement in this record.';
  const LITE = 'Measurements cover Nintendo Switch, not an independently tested Switch Lite. Switch Lite has no TV mode.';
  const M = (name, resolution, fps, sourceId, options = {}) => {
    const s = SOURCES[sourceId];
    if (!s) throw new Error('Unknown console source: ' + sourceId);
    return { name, resolution, fps, metric: fps === null ? 'unknown' : 'target',
      measurementStatus: fps === null ? 'unknown' : 'manufacturer-target',
      sourceId, sourceUrl: s.url, publisher: s.publisher, sourceDate: s.publishedAt,
      sourceRevision: s.revision || null, checkedAt: CHECKED_AT,
      appliesTo: [], conditions: [], limitations: [HISTORICAL], ...options };
  };
  function row(gameId, system, edition, modes, options = {}) {
    const key = gameId + '|' + system;
    if (RECORDS[key]) throw new Error('Duplicate console evidence key: ' + key);
    const sourceIds = [...new Set(modes.map(m => m.sourceId).concat(options.sourceIds || []))];
    const value = { key, gameId, system, edition, status: modes.some(m => m.fps !== null) ? 'supported' : 'unverified',
      checkedAt: CHECKED_AT, evidenceReview: 'source-checked; owner editorial review pending', modes,
      sourceIds, limitations: [], ...options };
    value.sourceIds = sourceIds;
    for (const m of modes) if (!m.appliesTo.length) m.appliesTo = [system];
    RECORDS[key] = value;
  }
  const ps5 = 'PlayStation 5 / PS5 Slim', ps5Pro = 'PlayStation 5 Pro', x = 'Xbox Series X', s = 'Xbox Series S', sw = 'Nintendo Switch', sw2 = 'Nintendo Switch 2', swLite = 'Nintendo Switch / Switch Lite';
  for (const system of [ps5, x]) row('fortnite', system, 'v15.10 console edition (2020)', [
    M('Quality', '4K', 60, 'epic-2020', { appliesTo: [system === ps5 ? 'PlayStation 5' : x] }),
    M('120 FPS mode', '1440p maximum', 120, 'epic-2020', { appliesTo: [system === ps5 ? 'PlayStation 5' : x], conditions: ['Battle Royale or Creative', 'Enable 120 FPS mode and use a compatible 120 Hz display'] })
  ], system === ps5 ? { status: 'partial', limitations: [SLIM] } : {});
  row('fortnite', ps5Pro, 'PS5 Pro edition', [], { limitations: ['The legacy 2020 PS5 source predates PS5 Pro. No inspected exact-Pro FPS source establishes these modes.'] });
  row('fortnite', s, 'v15.10 console edition (2020)', [
    M('Quality', '1200p maximum', 60, 'epic-2020'), M('120 FPS mode', '1080p maximum', 120, 'epic-2020', { conditions: ['Battle Royale or Creative', 'Enable 120 FPS mode; compatible 120 Hz display; reduced visual settings'] })
  ]);
  row('fortnite', sw2, 'Native Nintendo Switch 2 edition (2025 launch)', [M('Docked', '2176 × 1224', 60, 'epic-switch2'), M('Handheld', '1600 × 900', 60, 'epic-switch2')]);
  row('fortnite', sw, 'Nintendo Switch renderer update (2021)', [
    M('Docked', 'Expected dynamic 1560 × 880', null, 'epic-switch-2021'), M('Handheld', 'Expected dynamic 1170 × 660', null, 'epic-switch-2021')
  ], { status: 'partial', limitations: ['The inspected official resolution update contains no numerical FPS target.'] });

  row('gowr', ps5, 'PS5 edition, GDC 2023 configuration', [
    M('Favour performance', '1440p–2160p dynamic', 60, 'gowr-gdc', { appliesTo: ['PlayStation 5'] }),
    M('Favour quality', '2160p native', 30, 'gowr-gdc', { appliesTo: ['PlayStation 5'], conditions: ['Compatible 4K display for 2160p output'] }),
    M('Performance + high frame rate', '1440p', 60, 'gowr-gdc', { metric: 'unlocked-base', appliesTo: ['PlayStation 5'], conditions: ['Compatible high-refresh display and HDMI 2.1'] }),
    M('Quality + high frame rate', '1800p–2160p dynamic', 40, 'gowr-gdc', { appliesTo: ['PlayStation 5'], conditions: ['Compatible high-refresh display and HDMI 2.1'] }),
    M('Performance + high frame rate + VRR', '1440p', 60, 'gowr-gdc', { metric: 'unlocked-base', appliesTo: ['PlayStation 5'], conditions: ['Compatible high-refresh VRR display and HDMI 2.1'] }),
    M('Quality + high frame rate + VRR', '1800p–2160p dynamic', 40, 'gowr-gdc', { metric: 'unlocked-base', appliesTo: ['PlayStation 5'], conditions: ['Compatible high-refresh VRR display and HDMI 2.1'] })
  ], { status: 'partial', limitations: [SLIM, 'An unlocked base is not a sustained result or a numerical upper bound.'] });
  row('gowr', ps5Pro, 'PS5 Pro Enhanced, patch 06.00', [M('Enhanced quality', null, 60, 'gowr-pro', { conditions: ['Patch 06.00 or its supported replacement', 'PSSR optional'], limitations: [HISTORICAL, 'Exact internal resolution is not specified. VRR/HFR can unlock this mode; no fixed upper FPS is documented.'] })]);
  row('gowr', 'PlayStation 4', 'Original PS4 edition', [M('Standard', '1080p', 30, 'gowr-gdc')]);
  row('gowr', 'PlayStation 4 Pro', 'Original PS4 Pro edition', [
    M('Favour quality', '1440p–1656p dynamic', 30, 'gowr-gdc'), M('Favour performance', '1080p–1656p dynamic', 30, 'gowr-gdc', { metric: 'unlocked-base', limitations: [HISTORICAL, 'Developer chart says unlocked from a 30 FPS base. It does not establish a 60 FPS target or upper bound.'] })
  ]);
  for (const [gameId, edition, id] of [['spiderman', 'Spider-Man Remastered PS5 edition', 'insomniac-remaster'], ['miles', 'Miles Morales PS5 edition', 'insomniac-miles']]) row(gameId, ps5, edition, [
    M('Fidelity', 'Temporal 4K from a 4K base', 30, id, { appliesTo: ['PlayStation 5'], conditions: ['Ray tracing enabled'] }),
    M('Performance', 'Temporal 4K from a lower-resolution base', 60, id, { appliesTo: ['PlayStation 5'] })
  ], { status: 'partial', sourceIds: ['insomniac-vrr'], limitations: [SLIM, 'Compatible VRR/120 Hz settings may unlock FPS; normal targets do not describe every mode.'] });
  row('spiderman2', ps5, 'Spider-Man 2 PS5 launch edition (October 2023 analysis)', [
    M('Fidelity', '1800p–2160p internal, reconstructed output', 30, 'nxg-spiderman2', { metric: 'observed-cap', measurementStatus: 'original-measured', appliesTo: ['PlayStation 5'], limitations: ['Original technical analysis describes a 30 FPS mode with scene-dependent resolution, not a measured overall average.'] }),
    M('Performance', '1080p–1440p internal, reconstructed output', 60, 'nxg-spiderman2', { metric: 'observed-cap', measurementStatus: 'original-measured', appliesTo: ['PlayStation 5'], limitations: ['Original technical analysis describes a largely 60 FPS mode with occasional dips; no site test or average is claimed.'] }),
    M('Fidelity on a 120 Hz display', 'Dynamic internal resolution', 40, 'nxg-spiderman2', { metric: 'observed-cap', measurementStatus: 'original-measured', appliesTo: ['PlayStation 5'], conditions: ['Enable 120 Hz display mode', 'Compatible display', 'VRR off for this fixed-mode description'], limitations: ['Original launch analysis; VRR-unlocked configurations differ.'] })
  ], { status: 'partial', limitations: [SLIM, 'Do not apply these 2023 PS5 results to PS5 Pro or a later PC edition.'] });
  for (const system of [ps5, 'Xbox Series X / Series S']) row('valorant', system, 'VALORANT console edition', [], { sourceIds: ['riot-console'], limitations: ['The inspected Riot console sources establish platforms, but not a numerical FPS target or exact internal resolution.'] });
  for (const system of [ps5, x]) row('gta5', system, 'Native PS5 / Xbox Series edition, March 2022 launch', [
    M('Fidelity', 'Native 4K', 30, 'gta5-2022', { appliesTo: [system === ps5 ? 'PlayStation 5' : x], conditions: ['Ray tracing enabled'] }),
    M('Performance', 'Upscaled 4K', 60, 'gta5-2022', { appliesTo: [system === ps5 ? 'PlayStation 5' : x] }),
    M('Performance RT', 'Upscaled 4K', 60, 'gta5-2022', { appliesTo: [system === ps5 ? 'PlayStation 5' : x], conditions: ['Ray tracing enabled'] })
  ], system === ps5 ? { status: 'partial', limitations: [SLIM] } : {});
  for (const system of ['PlayStation 4', 'Xbox One / One S']) row('gta5', system, 'Original PS4 / Xbox One edition, November 2014', [
    M('Standard', 'Native 1080p', 30, 'rgt-gta5', { metric: 'reported-target', measurementStatus: 'original-observation', appliesTo: [system === 'PlayStation 4' ? system : 'Xbox One'], limitations: [OBSERVATION, 'Author reports a 30 FPS target with busy-scene drops; this is not a guaranteed result.'] })
  ], system === 'Xbox One / One S' ? { status: 'partial', limitations: ['2014 original-console observation predates Xbox One S; no independent One S result is established.'] } : {});
  for (const system of [ps5, ps5Pro]) row('monster-hunter-wilds', system, 'Monster Hunter Wilds launch modes, February 2025', [
    M(system === ps5Pro ? 'Resolution + ray tracing' : 'Resolution', null, 30, 'capcom-wilds', { appliesTo: [system === ps5 ? 'PlayStation 5' : ps5Pro], conditions: system === ps5Pro ? ['PSSR'] : [] }),
    M(system === ps5Pro ? 'Balanced + ray tracing' : 'Balanced', null, 40, 'capcom-wilds', { appliesTo: [system === ps5 ? 'PlayStation 5' : ps5Pro], conditions: ['Compatible 120 Hz display', ...(system === ps5Pro ? ['PSSR'] : [])] }),
    M('Framerate', null, 60, 'capcom-wilds', { appliesTo: [system === ps5 ? 'PlayStation 5' : ps5Pro], conditions: system === ps5Pro ? ['PSSR'] : [] })
  ], { ...(system === ps5 ? { status: 'partial' } : {}), limitations: [...(system === ps5 ? [SLIM] : []), 'Exact pixel dimensions are not given; 40 FPS requires the documented display mode. Later updates need separate verification.'] });
  for (const system of [x, s]) row('forza5', system, 'Forza Horizon 5, 2021 Series edition announcement', [M('Quality', system === x ? '4K' : '1080p', 30, 'forza-2021'), M('Performance', null, 60, 'forza-2021')], { limitations: ['Performance-mode pixel dimensions are not established by this source.'] });
  for (const system of ['Xbox One / One S', 'Xbox One X']) row('forza5', system, 'Forza Horizon 5 Xbox One edition', [], { sourceIds: ['forza-2021'], limitations: ['The inspected official numerical mode description covers Series X/S. Old-console FPS/resolution need an exact source; Series claims are not transferred.'] });
  row('sea-thieves', x, 'Series edition, launch and release notes 2.0.21', [
    M('Quality', '4K', 60, 'rare-nextgen'), M('120 Hz output mode', '1080p', null, 'rare-2-0-21', { conditions: ['Compatible 120 Hz display', 'Display capabilities may limit HDR'], limitations: ['The inspected release notes state a 120 Hz output mode. That alone is not a measured or numerical FPS result.'] })
  ], { status: 'partial', limitations: ['Mode evidence concerns historical releases; exact current-edition behaviour needs retesting.'] });
  row('sea-thieves', s, 'Series S launch edition', [M('Quality', '1080p', 60, 'rare-nextgen')], { status: 'partial', limitations: ['The inspected sources do not establish a Series S 120 FPS mode. A Series X mode is not copied across.'] });
  row('skyrim-se', 'Xbox Series X / Series S', 'Backward-compatible Skyrim Special Edition with FPS Boost (March 2021)', [
    M('FPS Boost', null, 60, 'xbox-fps-boost', { metric: 'approximate-target', appliesTo: [x, s], conditions: ['Backward-compatible Special Edition', 'FPS Boost enabled where supported'], limitations: [HISTORICAL, 'Publisher says nearly 60 FPS. This is not a 60+ FPS cap, current native-edition test, or exact per-model resolution.'] })
  ], { status: 'partial', limitations: ['Later native / Anniversary editions and mods need separate evidence; no shared up-to-4K claim is applied.'] });
  row('war-thunder', x, 'Optimized Xbox Series X edition', [M('Optimized', '4K', 60, 'gaijin-faq')]);
  row('war-thunder', s, 'Optimized Xbox Series S edition', [M('Optimized', '1440p', 60, 'gaijin-faq')]);
  row('zelda-botw', sw2, 'Nintendo Switch 2 Edition', [], { status: 'partial', sourceIds: ['botw-switch2'], limitations: ['Higher resolution, HDR and improved frame rate are official features. The inspected page does not supply a numerical FPS target.'] });
  row('zelda-botw', sw, 'Original Nintendo Switch edition', [], { sourceIds: ['botw-switch'], limitations: ['The official product page does not verify the previous numerical resolution and FPS strings.'] });
  row('zelda-botw', 'Wii U', 'Original Wii U edition', [], { limitations: ['Legacy Wii U source could not be verified in the research fetch. That is an evidence gap, not proof the public page is broken.'] });
  row('mario-kart-world', sw2, 'Mario Kart World, May 2025 developer interview', [
    M('Developer racing goal', null, 60, 'mk-world', { conditions: ['Publisher design target; player count and output mode not specified'], limitations: ['Developer target, not a measured all-modes guarantee. Split-screen and exact resolutions require separate evidence.'] })
  ]);
  row('mario-kart-8', swLite, 'Mario Kart 8 Deluxe, original Switch launch review', [
    M('TV: solo or two players', '1080p', 60, 'nl-mk8-deluxe', { metric: 'reported-mode', measurementStatus: 'original-observation', appliesTo: [sw], conditions: ['One or two players'], limitations: [OBSERVATION] }),
    M('Handheld: solo or two players', '720p', 60, 'nl-mk8-deluxe', { metric: 'reported-mode', measurementStatus: 'original-observation', appliesTo: [sw], conditions: ['One or two players'], limitations: [OBSERVATION] }),
    M('Three or four players, split screen', null, 30, 'nl-mk8-deluxe', { metric: 'reported-mode', measurementStatus: 'original-observation', appliesTo: [sw], conditions: ['Three or four players'], limitations: [OBSERVATION] })
  ], { status: 'partial', sourceIds: ['lite-playmode'], limitations: [LITE] });
  row('mario-kart-8', 'Wii U', 'Mario Kart 8 original Wii U edition', [M('Single or two players', null, 60, 'nl-mk8-director', { conditions: ['One or two players'], limitations: [HISTORICAL, 'Developer goal, not an instrumented average. Other multiplayer counts and pixel resolution are not established by this interview.'] })]);
  row('mario-kart-wii', 'Wii', 'Mario Kart Wii', [], { limitations: ['Inspected official game listing does not establish an exact frame rate or output resolution. Do not copy another Mario Kart edition.'] });
  for (const gameId of ['mario-galaxy', 'mario-galaxy-2']) {
    for (const system of [sw2, swLite]) row(gameId, system, '2025 Super Mario Galaxy + Super Mario Galaxy 2 remaster bundle', [
      M('TV mode', system === sw2 ? 'Up to 4K with the free Switch 2 update' : '1080p output', 60, 'xtg-galaxy', { metric: 'reported-mode', measurementStatus: 'original-observation', appliesTo: [system === swLite ? sw : sw2], resolutionSourceId: 'galaxy-2025', conditions: system === sw2 ? ['Free Switch 2 update', 'Compatible 4K display for 4K output'] : [], limitations: [OBSERVATION, 'Author notes occasional scene-transition stutters; this is not a measured average.'] }),
      M('Handheld', null, 60, 'xtg-galaxy', { metric: 'reported-mode', measurementStatus: 'original-observation', appliesTo: [system === swLite ? sw : sw2], limitations: [OBSERVATION, 'Exact portable pixel dimensions are not established by the inspected review.'] })
    ], { ...(system === swLite ? { status: 'partial' } : {}), sourceIds: ['galaxy-2025', ...(system === swLite ? ['lite-playmode'] : [])], limitations: system === swLite ? [LITE] : ['Scope is the 2025 remaster with the update, not the Wii game or 2020 3D All-Stars edition.'] });
    row(gameId, 'Wii', gameId === 'mario-galaxy' ? 'Super Mario Galaxy original Wii edition' : 'Super Mario Galaxy 2 original Wii edition', [
      M('Original Wii edition', null, 60, gameId === 'mario-galaxy' ? 'galaxy-wii' : 'galaxy2-wii', { limitations: [HISTORICAL, 'Developer-published FPS statement; no independent measured average or exact pixel resolution is established.'] })
    ]);
  }
  row('minecraft-bedrock', swLite, 'Minecraft Bedrock Nintendo Switch edition', [], { limitations: ['Legacy source is a PC Deluxe product listing and cannot establish console FPS or resolution. An exact console source is required.'] });
  row('minecraft-bedrock', sw2, 'Switch edition in backward compatibility / upcoming native Switch 2 edition', [], { sourceIds: ['minecraft-switch2'], limitations: ['October 8, 2026 regional announcement describes an upcoming native release without a numerical FPS target. Native and backward-compatible editions must not be conflated. The PC Deluxe page verifies neither.'] });

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function keyFor(gameId, system) {
    if (typeof gameId !== 'string' || typeof system !== 'string' || gameId.length > 100 || system.length > 100 || gameId.includes('|') || system.includes('|')) return null;
    return gameId + '|' + system; // Deliberately no aliases, family fallback or case folding.
  }
  function lookup(gameId, system) {
    const key = keyFor(gameId, system);
    if (key && Object.hasOwn(RECORDS, key)) return clone(RECORDS[key]);
    return { key, gameId: typeof gameId === 'string' ? gameId.slice(0, 100) : null,
      system: typeof system === 'string' ? system.slice(0, 100) : null, edition: null,
      status: 'unverified', checkedAt: null, evidenceReview: 'not-checked', modes: [], sourceIds: [],
      limitations: ['No inspected evidence for this exact game and system key. No performance is inferred from another console.'] };
  }
  function getSource(id) { return typeof id === 'string' && Object.hasOwn(SOURCES, id) ? clone(SOURCES[id]) : null; }
  function numericMode(mode) {
    if (!mode || !SOURCES[mode.sourceId] || !Number.isFinite(mode.fps) || mode.fps <= 0 || mode.fps > 1000) return false;
    if (!['target', 'cap', 'unlocked-base', 'approximate-target', 'observed-cap', 'reported-mode', 'reported-target'].includes(mode.metric)) return false;
    return ['manufacturer-target', 'manufacturer-cap', 'original-measured', 'original-observation'].includes(mode.measurementStatus);
  }
  function formatFps(mode) {
    if (!numericMode(mode)) return 'FPS not verified';
    if (mode.metric === 'unlocked-base') return 'Unlocked (' + mode.fps + ' FPS base)';
    if (mode.metric === 'approximate-target') return 'Nearly ' + mode.fps + ' FPS (publisher statement)';
    if (mode.metric === 'observed-cap') return mode.fps + ' FPS mode (original analysis)';
    if (mode.metric === 'reported-mode' || mode.metric === 'reported-target') return mode.fps + ' FPS mode (author report)';
    return mode.fps + ' FPS ' + (mode.metric === 'cap' ? 'published cap' : 'target');
  }
  function modesForSystem(gameId, recordSystem, exactSystem) {
    const record = lookup(gameId, recordSystem);
    // A compound catalog label is not an assertion that all submodels were tested.
    return record.modes.filter(mode => mode.appliesTo.includes(exactSystem));
  }
  const listKeys = () => Object.keys(RECORDS);
  const audit = () => clone({ version: VERSION, checkedAt: CHECKED_AT, sources: SOURCES, records: RECORDS });
  return Object.freeze({ VERSION, CHECKED_AT, lookup, getSource, listKeys, audit, formatFps, modesForSystem });
});
