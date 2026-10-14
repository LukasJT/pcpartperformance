const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const evidenceDate = '2026-10-14';
const source = (publisher, title, url, scope, limitations) => ({ publisher, title, url, checked: evidenceDate, scope, limitations });
const sources = {
  laptopGPU: source('NVIDIA', 'GeForce RTX 50 Series laptop specifications', 'https://www.nvidia.com/en-us/geforce/laptops/50-series/', 'Separate Laptop GPU product names, memory configurations and manufacturer GPU subsystem-power ranges.', 'Not a measured laptop benchmark. The current page includes multiple RTX 5070 Laptop memory configurations; verify the exact system.'),
  desktopGPU: source('NVIDIA', 'GeForce RTX 5070 desktop specifications', 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/', 'Desktop RTX 5070 standard memory configuration, separate from the Laptop GPU family.', 'Base design specifications do not certify every partner card or infer a performance gap.'),
  g16: source('ASUS ROG', 'ROG Strix G16 (2025) G615 US specifications', 'https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2025/spec/', 'Explicit G615JPR-AS96 configuration column; RTX 5070 Laptop 8 GB and 100 W plus 15 W Dynamic Boost.', 'A family page contains many columns. This example must not be copied to a different suffix, region, year or GPU.'),
  zephyrusUpgrade: source('ASUS ROG', 'Zephyrus G14/G16 RAM and SSD upgrade guide', 'https://rog.asus.com/ca-en/articles/guides/how-to-upgrade-the-ram-and-ssd-of-your-rog-zephyrus-g14-laptop/', 'Model-year-dependent onboard RAM and SSD replacement; 2024-and-newer CNC-chassis models discussed have soldered RAM.', 'Not a universal laptop disassembly method. Exact service documentation governs battery connectors, screws, SSD thickness and supported capacity.'),
  serviceManuals: source('ASUS', 'ASUS Service Manuals', 'https://www.asus.com/us/support/article/1294/', 'Official model-specific customer self-repair documentation and available service-manual links.', 'A linked manual is not evidence that every model is repairable or that a particular upgrade is supported.'),
  advancedOptimus: source('NVIDIA', 'Advanced Optimus explanation', 'https://www.nvidia.com/en-us/geforce/news/rtx-laptops-advanced-optimus/', 'Hybrid internal-display routing and dynamic hardware display switching on supported laptop configurations.', 'The 2022 marketing benchmark percentages are not applied to current laptops or presented as site-owned tests.'),
  rogMux: source('ASUS ROG', 'ROG MUX Switch and Advanced Optimus guide', 'https://rog.asus.com/us/articles/rog-gaming-laptops/maximize-your-rog-laptops-performance-with-a-mux-switch/', 'Model-specific distinction between direct GPU mode, hybrid mode and automatic switching.', 'Older interface examples are not guaranteed to match current software or unsupported models; no universal FPS gain is inferred.'),
  armoury: source('ASUS', 'Armoury Crate introduction, version 6', 'https://www.asus.com/support/faq/1043747/', 'Current official control overview, supported devices and conditional GPU/power controls.', 'Model and software support must be checked. No instruction to flash firmware, change voltage or override thermal limits.'),
  bg3Steam: source('Larian Studios / Steam', 'Baldur’s Gate 3 publisher system requirements', 'https://store.steampowered.com/app/1086940/Baldurs_Gate_3/', 'Publisher-listed Windows/macOS requirements, SSD requirement and free storage.', 'Requirement categories are not exact FPS targets; installed game/OS versions and publisher changes need rechecking.'),
  bg3Support: source('Larian Studios', 'Baldur’s Gate 3 system requirements', 'https://larian.com/support/faqs/system-requirements_47', 'Windows recommended hardware, SSD storage, and qualified macOS minimum/recommended conditions.', 'Do not flatten Windows and macOS into one comparison or interpret a CPU naming number as a supported equivalence.'),
  bg3Graphics: source('Larian Studios', 'Baldur’s Gate 3 graphical issues', 'https://larian.com/support/faqs/graphical-issues_83', 'Applicable DirectX/Vulkan choice, lower settings, correct graphics adapter and official support escalation.', 'Only reversible in-game checks are used here; older generic security-disabling, administrator and destructive-data suggestions are not reproduced.')
};
const section = (title, paragraphs, sourceIds = [], extra = {}) => ({ title, paragraphs, sourceIds, ...extra });
const table = (caption, headers, rows) => ({ caption, headers, rows });
const article = (id, slug, title, summary, intent, sections, tools, imageConcept, extra = {}) => ({
  id, route: '/blog/' + slug + '/', canonicalRoute: '/blog/' + slug + '/', type: 'guide', title, description: summary, summary, intent,
  audience: 'PC and laptop buyers who want a clear, supported buying or setup decision', existingIntent: null,
  evidenceDate, contentVersion: '2026-10-14.clarity1', status: 'complete_source_checked', reviewStatus: 'AI_source_checked_owner_release_pending',
  humanReview: null, humanReviewClaimed: false, ownerPublicationAuthorization: null, published: false, publishable: false, indexable: false,
  datePublished: null, dateModified: null, proposedAuthor: { type: 'Organization', name: 'PC Part Performance' },
  attribution: 'Prepared with AI assistance; no hands-on testing or personal human review is claimed.',
  evidenceType: 'Research-based practical guide using official documentation; no measured FPS or current-price recommendation',
  sections, sourceIds: [...new Set(sections.flatMap(s => s.sourceIds))], tools,
  imagePlan: { kind: 'original_editorial_diagram', width: 1200, height: 675, concept: imageConcept, alt: imageConcept, generated: false },
  limitations: ['Exact-system documentation and matching game tests are required before making a performance guarantee.'],
  ...extra
});
const articles = [
  article('O01', 'laptop-gpu-vs-desktop-rtx-5070', 'RTX 5070 laptop vs desktop: why the name is not the whole comparison',
    'Compare the complete laptop with the complete desktop. The RTX 5070 Laptop GPU and a desktop RTX 5070 are separate products; the laptop’s exact configuration, graphics power and display matter as much as the short GPU name.',
    'Understand a same-number laptop/desktop GPU purchase without importing desktop FPS into a laptop result', [
      section('Start with the full GPU name', [
        'Keep “Laptop GPU” in every comparison. NVIDIA publishes separate desktop and notebook specification tables. A desktop RTX 5070 lists 12 GB GDDR7; the US ROG Strix G16 G615JPR-AS96 example lists an RTX 5070 Laptop GPU with 8 GB. Other notebook configurations must be checked individually rather than inheriting that example.',
        'That difference tells you the names are insufficient. It does not tell you the FPS gap. Memory capacity, GPU design and the rest of the machine need their own evidence. Do not compare a laptop listing to a desktop benchmark simply because both contain “5070”.'
      ], ['laptopGPU', 'desktopGPU', 'g16']),
      section('Read the power specification carefully', [
        'TGP is commonly used as shorthand for a laptop graphics-power limit. Record the manufacturer’s actual wording, including whether a quoted total includes Dynamic Boost. ASUS lists the example G615JPR-AS96 at 115 W as 100 W plus 15 W Dynamic Boost. A bare “115 W” retailer label loses that distinction.',
        'A stated maximum is not a promise of constant draw in every game. Write down the supported power mode, supplied charger and whether the evidence concerns a plugged-in system. Keep those conditions alongside any test result. More watts cannot be translated into a fixed percentage of extra FPS, and a charger’s rating is not the GPU’s power specification.'
      ], ['g16']),
      section('Build a useful two-system shortlist', [
        'Give each candidate one row containing the exact model suffix, CPU, GPU memory, installed RAM, storage, display resolution, refresh rate, graphics-power wording and price region. Add a second row for the information you still need. A short list of verified differences is easier to use than a page of unrelated specification numbers.',
        'Keep included equipment visible. A laptop includes a display, keyboard and battery; a desktop quote may exclude a monitor, peripherals or operating system. Compare the purchases you would actually make. Use CAD with CAD or USD with USD, and include necessary extras before deciding which fits the budget. No current sale price is asserted here.'
      ]),
      section('Find tests of the laptop you would buy', [
        'Prefer a review identifying the same chassis and configuration. Check its game version, resolution, quality, ray tracing, upscaling, frame generation, power mode and whether the internal or external display was used. A matching GPU name in a different thin or large laptop is a lead to investigate, not an interchangeable test result.',
        'Separate rendered frames from generated frames when reading charts. Also look for observations relevant to your daily use: keyboard, screen, travel weight with charger, ports and noise under a stated workload. A laptop can be the right purchase because you need portability even when a stationary system would satisfy different priorities.'
      ]),
      section('Choose around your actual routine', [
        'If the computer moves between school, work and home, write down how often and what you carry. If it stays on one desk, price a comparable complete desktop setup as an alternative. Include the monitor you already own instead of buying it twice in the worksheet.',
        'Before ordering, resolve the missing items most likely to change the decision: exact GPU variant, graphics-power conditions, display and support terms. Keep the current computer if neither candidate solves a real problem within budget. The useful answer is a supported whole-system choice, not a universal winner for every “5070”.'
      ])
    ], [{ href: '/performance/', label: 'Check game-performance evidence' }, { href: '/prebuilts/', label: 'Compare complete desktop configurations' }, { href: '/builder/', label: 'Plan the desktop alternative' }],
    'A laptop and desktop silhouette with distinct GPU identity labels and a shared whole-system checklist; no fabricated FPS graph', { category: 'Gaming laptops', keywords: ['rtx 5070 laptop vs desktop', 'laptop gpu vs desktop', 'gaming laptop TGP'] }),

  article('O02', 'gaming-laptop-ram-ssd-upgrade-checklist', 'Can you upgrade a gaming laptop’s RAM and SSD?',
    'Find the exact laptop model and service manual before buying parts. Some systems have replaceable memory; others have soldered RAM. An SSD upgrade also needs the correct slot, interface, thickness and a plan for your existing files.',
    'Determine exact laptop RAM and storage upgrade options before purchasing or opening the machine', [
      section('Identify the model, not just the family', [
        'Record the full manufacturer model, year and configuration suffix. “Zephyrus G14” or “Legion” is not enough to select memory. Look at the original invoice and the manufacturer’s support page; share a model name rather than a serial number when asking for general compatibility help.',
        'The ASUS Zephyrus upgrade guide is a useful example of why this matters. It distinguishes earlier designs with an upgradeable memory slot from the CNC-chassis 2024-and-newer models it discusses, whose RAM is soldered. That statement applies to the guide’s scope. It does not establish the upgrade options of every laptop sold in those years.'
      ], ['zephyrusUpgrade']),
      section('Make a memory inventory', [
        'Write down the installed capacity, onboard capacity, number of physical memory slots and how many are occupied. Keep an unconfirmed slot count blank. A software report is useful for the installed configuration, but the exact product documentation determines which replacement parts are supported.',
        'For a replaceable module, confirm the documented memory generation, form factor, capacity limit and supported operating conditions. Desktop DIMMs should not be selected simply because their DDR number matches a laptop listing. If the RAM is entirely soldered, an ordinary module purchase cannot increase it. Choose adequate fixed memory when buying that system rather than planning an unsupported upgrade.'
      ], ['serviceManuals']),
      section('An SSD slot has several requirements', [
        'Confirm the drive interface, supported module length and physical clearance. Also distinguish adding a drive to an empty supported position from replacing the only installed drive. A slot count that includes occupied slots does not prove a second drive can be added.',
        'ASUS specifically calls out drive thickness for the newer Zephyrus example and discusses replacement rather than assuming an empty second slot. Use that as a question to ask about your own model. Check the service manual for the actual mounting screw, bracket or thermal arrangement; do not assume accessories from another machine will fit.'
      ], ['zephyrusUpgrade']),
      section('Protect the working computer first', [
        'Back up important files and confirm you can recover them before storage changes. Decide whether you will reinstall the operating system or use a supported migration method. Keep access to legitimate recovery information private; do not paste keys or personal diagnostic files into a public build link.',
        'Use the exact manufacturer procedure for opening the chassis, shutting down, disconnecting power and handling the battery. Screw positions and battery connectors vary. Stop if the manual is missing, a connector does not move as documented or you are not comfortable with the operation. A supported service centre is a reasonable alternative to improvising a disassembly guide.'
      ], ['serviceManuals']),
      section('Buy the change you actually need', [
        'A capacity shortage and a speed complaint are different problems. List the files you need to retain, or the applications that run together, before selecting a larger part. More storage space is useful even when no loading-time gain has been demonstrated.',
        'Your final shortlist should contain the exact replacement part, applicable support document, installation route and complete cost. After a supported installation, verify the recognized capacity and restore a normal workload before changing anything else. This checklist does not guarantee a game-performance increase, bypass soldered memory or replace the model’s service instructions.'
      ])
    ], [{ href: '/tools/storage-capacity-planner/', label: 'Plan how much storage you need' }, { href: '/hardware/memory/', label: 'Explore exact memory models' }, { href: '/blog/ssd-transfer-time-advertised-speed/', label: 'Understand SSD speed claims' }],
    'A laptop service checklist showing soldered memory, replaceable memory and an SSD slot as separate possible configurations', { category: 'Gaming laptops', keywords: ['can I upgrade laptop RAM', 'gaming laptop SSD upgrade', 'soldered RAM'] }),

  article('O03', 'mux-switch-advanced-optimus-gaming-laptop', 'MUX switch vs Advanced Optimus: which laptop setting should you use?',
    'These features concern the route between the graphics processor and the internal screen. Check what your exact laptop supports, start with its normal recommended mode, and compare one documented change at a time. There is no universal FPS gain.',
    'Understand and safely test documented laptop graphics display modes without confusing rendering GPU and screen connection', [
      section('Rendering and displaying are different jobs', [
        'A game can be rendered by a dedicated GPU while the integrated GPU still drives the internal screen. NVIDIA describes this as the traditional Optimus path. A hardware display switch can instead connect a supported screen directly to dedicated graphics. The presence of two GPUs in Device Manager alone does not tell you which route the screen uses.',
        'Advanced Optimus adds automatic hardware display switching on supported configurations. It is not the name of a downloadable upgrade that gives every laptop a physical switch. The exact laptop and display configuration need manufacturer confirmation.'
      ], ['advancedOptimus']),
      section('Use the controls made for your model', [
        'Find the manufacturer’s graphics-mode documentation and record your current selection. A manual dedicated-GPU mode and automatic switching are different controls; a change may require a restart. Names such as Hybrid, Ultimate or Eco are vendor interface choices, not universal standards.',
        'The ROG guide shows direct and hybrid paths on supported ASUS systems, while the current Armoury Crate documentation describes controls whose availability depends on the device. Follow the instructions that apply to your model and software. Do not use another laptop’s BIOS procedure or flash modified firmware to obtain a missing setting.'
      ], ['rogMux', 'armoury']),
      section('Choose the mode for the session', [
        'For travel or everyday battery use, begin with the manufacturer’s normal automatic or hybrid recommendation. For plugged-in gaming, a supported dedicated or automatic mode can be worth comparing. Keep the supplied power setup and the same graphics preset throughout the comparison.',
        'An external monitor introduces another route. Verify which GPU drives the specific port and whether a dock is involved rather than assuming every HDMI or USB-C connection bypasses integrated graphics. An internal-screen test and an external-screen test should be recorded separately.'
      ]),
      section('Make the test understandable', [
        'Save your game, record the baseline mode, resolution and settings, and choose a repeatable section of play. Then make one supported mode change and repeat that section. Note any restart, display change or power-state change. Keep both observations even if the newer one disappoints.',
        'Do not apply a percentage from a different laptop, an older manufacturer demonstration or a single game to your full library. The relevant result is whether the change helps your actual session enough to justify its tradeoffs. This article contains no site-owned benchmark and no claimed battery-life multiplier.'
      ]),
      section('If the option is missing or causes trouble', [
        'Check the exact model’s support documentation first. Some configurations do not support automatic switching, and control labels can change with software. Keep the last working configuration available so you can restore it through the documented control.',
        'If a change causes display trouble, return to the recorded baseline and use official support. Do not disable security software, alter voltages or install unofficial firmware as a generic fix. A clear report containing the model, supported software version and observed symptom is more useful than calling the whole laptop defective.'
      ])
    ], [{ href: '/performance/', label: 'Explore game results and their conditions' }, { href: '/troubleshooting/', label: 'Work through a performance problem' }, { href: '/blog/laptop-gpu-vs-desktop-rtx-5070/', label: 'Read the laptop GPU buying guide' }],
    'Two simple labeled signal paths: dedicated GPU through integrated graphics to screen, and a supported direct display switch; no invented benchmark bars', { category: 'Gaming laptops', keywords: ['MUX switch vs Advanced Optimus', 'laptop hybrid mode', 'dedicated GPU mode'] }),

  article('O04', 'can-my-pc-run-baldurs-gate-3', 'Can my PC run Baldur’s Gate 3? Check the requirements before guessing FPS',
    'Start with the publisher’s requirements for your operating system, including its SSD requirement. Then check exact hardware and relevant game tests. Meeting a requirement does not promise 60 FPS, a particular resolution or the same result throughout the game.',
    'Help a prospective Baldur’s Gate 3 player inspect publisher requirements and a current PC without treating requirements as a benchmark', [
      section('Use the requirements for your platform', [
        'The publisher lists separate Windows and macOS requirements. For Windows, the recommended list includes an Intel i7-8700K or Ryzen 5 3600, 16 GB RAM, an RTX 2060 Super or RX 5700 XT, and 150 GB available storage with an SSD required. Those are reference configurations, not a performance chart.',
        'The Steam listing includes additional current graphics options and its own macOS entries. Open the publisher’s live requirements when checking a less common GPU or operating system. Do not flatten an Apple integrated-graphics configuration into a Windows desktop comparison or assume a larger model number proves equivalence.'
      ], ['bg3Steam', 'bg3Support']),
      section('Write down what is actually installed', [
        'Record the CPU, full GPU name and memory capacity, total system RAM, operating system and drive used for the installation. Distinguish dedicated GPU memory from system RAM. On a laptop, preserve “Laptop GPU” in the name; a similarly named desktop card is not automatically the same product.',
        'If the system contains integrated and dedicated graphics, check the adapter selected in the game’s video options. Larian’s graphical-issues guidance explicitly raises this check. Do not replace the laptop or buy a desktop card before confirming that the game is using the intended supported hardware.'
      ], ['bg3Graphics']),
      section('Storage means free space on the right drive', [
        'The stated 150 GB is available space, not the label capacity of the drive. Check the intended installation destination, the files already on it and the publisher’s SSD requirement. Leave room for the work your installation and updates actually need without inventing a universal extra-space percentage.',
        'Use a storage plan to decide what you will retain elsewhere and back up important files before moving anything. Buying a larger drive may solve a space shortage; it does not establish a specific FPS increase. Check the motherboard or laptop documentation before purchasing an internal replacement.'
      ], ['bg3Support']),
      section('Treat FPS as a separate evidence question', [
        'A useful test identifies game version, exact hardware, resolution, preset, upscaling and test scene. Check whether a reported number was measured or estimated. Compare matching conditions; a result from another scene or an older game build may answer a different question.',
        'The performance tool should keep missing evidence visible. If it has no suitable measured record for your configuration, that absence is not solved by turning the recommended requirements into a made-up average. Use the requirements to identify what needs checking, then look for a clearly documented test or evaluate the copy you already own.'
      ]),
      section('Try safe settings changes before buying parts', [
        'Keep a record of the current preset, resolution and observed problem. Larian suggests applicable DirectX 11/Vulkan choices and lower graphics settings as things to investigate. Try one reversible in-game change at a time, repeat the same section and restore the baseline when it does not help.',
        'Stop short of broad security-disabling advice or deleting saves to chase performance. If the game still has graphical problems, use the official support route and preserve the details of what changed. Consider an upgrade only after you can state the unresolved requirement or supported constraint it will address.'
      ], ['bg3Graphics'])
    ], [{ href: '/performance/', label: 'Check Baldur’s Gate 3 performance coverage' }, { href: '/tools/storage-capacity-planner/', label: 'Plan installation space' }, { href: '/upgrade/', label: 'Compare keeping or upgrading your PC' }],
    'A game-readiness checklist with operating system, exact graphics, memory and SSD as separate checks, followed by a separate measured-FPS question', { category: 'Gaming performance', keywords: ['can my PC run Baldurs Gate 3', 'Baldurs Gate 3 system requirements', 'BG3 laptop requirements'], limitations: ['Publisher requirements are not FPS targets. No exact-PC benchmark, site-owned game test or current retail quote is supplied.'] })
];
const wordCount = article => [article.title, article.summary, ...article.sections.flatMap(s => [s.title, ...s.paragraphs])].join(' ').split(/\s+/).length;
const fingerprint = article => crypto.createHash('sha256').update(JSON.stringify({ article, sources: Object.fromEntries(article.sourceIds.map(id => [id, sources[id]])) })).digest('hex');
function validate() {
  const errors = [], routes = new Set();
  for (const a of articles) {
    if (routes.has(a.route)) errors.push('Duplicate route ' + a.id); routes.add(a.route);
    if (!a.intent || a.sections.length < 4 || wordCount(a) < 400 || !a.tools.length) errors.push('Incomplete article ' + a.id);
    for (const id of a.sourceIds) if (!sources[id]) errors.push('Unknown source ' + id);
    if (a.humanReview !== null || a.humanReviewClaimed !== false || a.published || a.publishable || a.indexable || a.datePublished !== null || a.dateModified !== null) errors.push('Untrue release state ' + a.id);
    for (const t of a.tools) if (!/^\/[a-z0-9/-]+\/$/.test(t.href)) errors.push('Invalid action ' + a.id);
  }
  return { valid: !errors.length, errors, articles: articles.length, words: articles.reduce((sum, a) => sum + wordCount(a), 0), humanReviewClaimed: false, published: 0 };
}
function prepare(directory = path.resolve(__dirname, '../docs/clarity-oct14/editorial')) {
  const result = validate(); if (!result.valid) throw Error(result.errors.join('; ')); fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'source-records.json'), JSON.stringify(sources, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify({ schema: 1, evidenceDate, ...result, items: articles.map(a => ({ id: a.id, route: a.route, title: a.title, words: wordCount(a), fingerprint: fingerprint(a), sourceIds: a.sourceIds, keywords: a.keywords, intent: a.intent })) }, null, 2) + '\n');
  const lines = ['# October 14 researched guide batch', '', 'Four distinct new intents. Research-based guides, proposed organization author PC Part Performance. No personal human review or hands-on testing is claimed. Owner release authorization and actual publication dates are handled by the parent integration.', ''];
  for (const a of articles) { lines.push('## ' + a.id + ' — ' + a.title, '', '**Proposed route:** ' + a.route, '**Intent:** ' + a.intent, '**Content/evidence SHA-256:** ' + fingerprint(a), '', a.summary, ''); for (const s of a.sections) { lines.push('### ' + s.title, '', ...s.paragraphs.flatMap(p => [p, ''])); if (s.sourceIds.length) lines.push('Sources: ' + s.sourceIds.map(id => '[' + sources[id].publisher + '](' + sources[id].url + ')').join('; '), ''); } lines.push('### Next actions', '', ...a.tools.map(t => '- [' + t.label + '](https://www.pcpartperformance.com' + t.href + ')'), '', '### Original diagram', '', a.imagePlan.concept, '', '### Limits', '', ...a.limitations.map(limit => '- ' + limit), ''); }
  fs.writeFileSync(path.join(directory, 'REVIEW-PACKET.md'), lines.join('\n') + '\n'); return result;
}
module.exports = { evidenceDate, sources, articles, section, table, wordCount, fingerprint, validate, prepare };
if (require.main === module) { const result = process.argv[2] === 'prepare' ? prepare() : validate(); console.log(JSON.stringify(result, null, 2)); if (!result.valid) process.exitCode = 1; }
