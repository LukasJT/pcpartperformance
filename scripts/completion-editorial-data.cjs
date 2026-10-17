'use strict';

const crypto = require('node:crypto');
const previous = require('./master-editorial-content.cjs');
const evidenceDate = '2026-10-16';
const source = (publisher, title, url, scope, limitations, extra = {}) => ({
  publisher, title, url, scope, limitations, inspected: evidenceDate,
  access: 'Public primary-source page text inspected',
  rights: 'Original analysis with source links; no copied photographs, benchmark tables or datasets.',
  ...extra
});
const sources = {
  ...Object.fromEntries(['cpuList', 'biosMSI', 'biosASUS', 'bitlocker', 'cpu5700', 'cpu7600', 'cables', 'cableChart', 'north', 'rx9070', 'rx9070xt'].map(id => [id, previous.sources[id]])),
  cpuList: source('ASUS', 'How to query CPU and memory support lists', 'https://www.asus.com/us/support/faq/1043883/', 'Locate the support resources for the exact motherboard, then read the applicable CPU entry.', 'A lookup procedure is not proof that an unspecified board ships with a suitable BIOS.'),
  biosMSI: source('MSI', 'How to update BIOS', 'https://www.msi.com/support/technical_details/MB_BIOS_Update', 'Official M-FLASH route, exact-model download and interruption precautions.', 'Entering M-FLASH and using the separate Flash BIOS Button feature have different prerequisites.'),
  biosASUS: source('ASUS', 'How to use USB BIOS FlashBack', 'https://www.asus.com/support/faq/1038568/', 'Feature availability and model-specific filename, USB-port and power instructions.', 'Do not apply FlashBack instructions to a board without documented support.'),
  cableChart: source('CORSAIR', 'PSU cable compatibility chart', 'https://www.corsair.com/us/en/s/psu-cable-compatibility', 'CORSAIR modular cable types, including the Type 3/4 versus Type 5 warning.', 'These manufacturer family names are not a cross-brand wiring standard.'),
  flashButton: source('MSI', 'How to refresh BIOS via Flash BIOS Button', 'https://www.msi.com/support/technical_details/MB_Flash_BIOS_Button', 'On supported boards this is a CPU/RAM-independent feature with a specific file, labeled port, power connections and completion indication.', 'Only supported models; the board manual and exact-model download govern the operation. No universal duration or recovery guarantee.'),
  activation: source('Microsoft', 'Reactivating Windows after a hardware change', 'https://support.microsoft.com/en-us/windows/activation/reactivating-windows-after-a-hardware-change', 'Preparation, edition matching and legitimate digital-license/product-key reactivation after hardware changes.', 'A linked account is not a promise that every license transfers to a different computer.'),
  seasonicCables: source('Seasonic', 'Which cables are compatible with my power supply?', 'https://knowledge.seasonic.com/article/68-cable-compatibility', 'Use the supplied DC cables and obtain exact manufacturer compatibility evidence; even models within one brand can differ.', 'The linked compatibility chart did not return readable content in this research environment; no individual cable pair was certified.'),
  nzxtCables: source('NZXT', 'Never reuse PSU cables: why modular cables are not interchangeable', 'https://nzxt.com/en-intl/blogs/news/psu-cable-compatibility', 'The August 17, 2026 article distinguishes Gold Core from previous C-series generations despite physically mating connectors.', 'This warning does not establish a generic adapter solution, a whole-system power budget or cross-brand cable compatibility.'),
  memoryAssess: source('Kingston', 'How much memory do you need to run Windows, macOS, or Linux apps?', 'https://www.kingston.com/en/blog/pc-performance/memory-assessor', 'Observe current memory use through the operating system; Windows Task Manager exposes capacity and usage.', 'A usage observation is not a controlled benchmark or an exact prediction of an untested project.'),
  mixedKits: source('Kingston', 'Non-binary memory FAQs', 'https://www.kingston.com/en/blog/system-builder/24gbit-memory-faq', 'Capacity configurations and firmware context; Kingston explicitly does not support mixing overclockable FURY modules or kits.', 'Product-family and platform scope matters. Do not generalize the historical platform table into universal current support.'),
  premiere: source('Adobe', 'Adobe Premiere technical requirements', 'https://helpx.adobe.com/premiere/desktop/get-started/technical-requirements/adobe-premiere-pro-technical-requirements.html', 'Version-scoped requirements current on inspection: the Windows recommendation lists 16 GB RAM for HD and 32 GB or more for 4K and higher; GPU and storage fields are distinct.', 'Manufacturer requirements are not application benchmark results or a guarantee for every project. macOS/unified-memory requirements differ.', { version: '26.0, 26.2, 26.3, 26.3.2, 26.5, 26.5.1 and 26.5.2; source updated 2026-10-07' }),
  proxies: source('Adobe', 'Create proxies in Premiere', 'https://helpx.adobe.com/premiere/desktop/organize-media/ingest-proxy-workflow/create-proxies.html', 'Low-resolution editing copies, qualifying video clips and an explicit source-media relationship.', 'Proxies are a supported workflow option, not backup copies or a measured equivalent of buying faster hardware.'),
  premiereRecommendations: source('Adobe', 'Processor, memory, and GPU recommendations', 'https://helpx.adobe.com/premiere/desktop/get-started/technical-requirements/processor-memory-and-gpu-recommendations.html', 'Application-specific processor/media-engine context; this recommendations page was last updated January 7, 2026.', 'Some wording and VRAM figures differ from the October version-scoped requirements. This guide does not repeat its efficiency percentages or use its older broad figures to override current version requirements.'),
  presentMon: source('Intel / PresentMon maintainers', 'PresentMon console application documentation', 'https://github.com/GameTechDev/PresentMon/blob/main/README-ConsoleApplication.md', 'Capture schemas distinguish CPU/GPU/present/display timing and offer version-specific metric modes.', 'A field is not necessarily available in every capture. This documentation is not measured performance of a named PC; main-branch content can change.'),
  frameView: source('NVIDIA', 'FrameView 1.7 user guide', 'https://images.nvidia.com/content/geforce/technologies/frameview/frameview-1-7-user-guide-web-version.pdf', 'Historical version-specific definitions distinguish average FPS, the slowest-frame aggregate, percentile boundaries and PC latency.', 'Version 1.7 definitions must not silently be assumed to describe all later software. No example game results from the manual are republished.'),
  frameViewChange: source('NVIDIA', 'FrameView 2.0 release notes', 'https://www.nvidia.com/en-us/geforce/technologies/frameview/release-notes/', 'FPS reporting changed how dropped and zero-display presents are counted; capture-tool versions can change reported metrics.', 'Release notes demonstrate a method change, not a performance improvement of a graphics card.'),
  gnMethod: source('GamersNexus', 'Testing methodology: 1% and 0.1% lows, delta T over ambient', 'https://gamersnexus.net/site-news/2513-testing-methodology-explained-1percent-lows-and-delta-t', 'Original publisher explains why averages alone can miss uneven frame delivery and why thermal context matters.', 'Historical methodology explanation, not a current GPU ranking; no benchmark table or video content is reproduced.'),
  obsHardware: source('OBS Project', 'Hardware encoding', 'https://obsproject.com/kb/hardware-encoding', 'Hardware encoding can move encoding work from the CPU to a supported media engine.', 'Encoder generation, codec, operating system and application support still matter; the older page is not an exhaustive current GPU matrix.'),
  obsPerformance: source('OBS Project', 'Encoding performance troubleshooting', 'https://obsproject.com/kb/encoding-performance-troubleshooting', 'OBS scene rendering also consumes GPU resources; inspect output settings, game load and scene complexity.', 'Selected safe diagnostics only. This guide does not reproduce older OS-specific security or administrative suggestions as universal fixes.'),
  obsNetwork: source('OBS Project', 'Stream connection troubleshooting', 'https://obsproject.com/kb/stream-connection-troubleshooting', 'OBS dropped network frames concern the path to the ingest server and configured bitrate.', 'A network-drop count is distinct from game FPS and rendering/encoding lag. No ISP or platform performance guarantee.'),
  obsStart: source('OBS Project', 'Quick start guide', 'https://obsproject.com/kb/quick-start-guide', 'The Auto-Configuration Wizard starts from hardware resources, intended task and network conditions; test the actual recording/stream.', 'An initial configuration is not proof that every scene, codec or streaming service is suitable.')
};
Object.assign(sources, {
  storageInterface: source('Kingston', 'Two types of M.2 SSDs: SATA and NVMe', 'https://www.kingston.com/en/blog/pc-performance/two-types-m2-vs-ssd', 'M.2 is a form factor; SATA/NVMe connection support and shared host connections need separate checks.', 'Only interface distinctions are used. Historical speed, capacity and PCIe-generation marketing in the 2023 article is not used as a current hardware limit.'),
  coolerSupport: source('Noctua', 'Compatibility database', 'https://www.noctua.at/en/compatibility', 'Manufacturer-maintained CPU, motherboard, case and RAM compatibility resources for its coolers.', 'Scope is the exact listed Noctua cooler and configuration. Does not certify other brands or an illustrative 3D scene.'),
  windowsBackup: source('Microsoft', 'Back up and restore with Windows Backup', 'https://support.microsoft.com/en-us/windows/experience/backup-recovery/back-up-and-restore-with-windows-backup', 'Windows Backup describes selected folders, settings and account-based restoration.', 'Do not describe selected cloud-backed items as a complete restorable image of every drive or application; verify what the chosen backup actually contains.'),
  premiereStorage: source('Adobe', 'Storage recommendations for video editing', 'https://helpx.adobe.com/premiere/desktop/get-started/technical-requirements/storage-recommendations.html', 'Application, media and cache storage have different roles in the documented editing workflow.', 'A storage recommendation is not a measured workload result or a guarantee based on a drive’s headline sequential throughput.')
});
const section = (title, paragraphs, sourceIds = [], extra = {}) => ({ title, paragraphs, sourceIds, ...extra });
const table = (caption, headers, rows) => ({ caption, headers, rows });
const common = {
  evidenceDate, author: 'PC Part Performance', contentVersion: 'completion-2026-10-16.1',
  lifecycle: { state: 'complete_source_checked', sourceCheck: 'AI-assisted primary-source inspection', humanEditorialReview: null, humanReviewClaimed: false, publication: 'requires_exact_version_owner_release' },
  attribution: 'Research and original writing prepared with AI assistance for PC Part Performance. No personal human review or site-owned hardware testing is claimed.',
  evidenceType: 'Research-based decision guidance; no measured product review, live price comparison or performance prediction.',
  datePublished: null, dateModified: null
};
function article(id, route, title, summary, intent, sections, tools, extra = {}) {
  return { ...common, id, route, canonicalRoute: route, title, description: summary, summary, intent, change: 'new',
    sections, tools, sourceIds: [...new Set(sections.flatMap(s => s.sourceIds))],
    keywords: [], claims: [], limitations: [], ...extra };
}
function revision(id, previousId, additions, tools = []) {
  const prior = previous.articles.find(a => a.id === previousId);
  if (!prior) throw Error('Missing existing article ' + previousId);
  const sections = [...prior.sections, ...additions];
  return { ...prior, ...common, id, priorEditorialId: previousId, change: 'material_revision', sections,
    sourceIds: [...new Set(sections.flatMap(s => s.sourceIds))], tools: [...prior.tools, ...tools],
    keywords: [], claims: [], limitations: prior.limitations || [],
    revisionSummary: additions.map(s => s.title).join('; ') };
}
const articles = [
  revision('MC01', 'M06', [
    section('Choose the update path before removing the working CPU', [
      'A support-list entry and a usable installation procedure are two different pieces of evidence. If the current CPU reaches firmware, record its installed BIOS version and read the exact supported update sequence before dismantling the working system. If the replacement CPU will not be recognized by the current firmware, do not plan on entering an ordinary in-firmware updater with that replacement installed.',
      'MSI documents a separate Flash BIOS Button procedure that can work without a CPU and RAM on models that actually have that feature. ASUS has its own USB BIOS FlashBack procedure. Their file preparation, ports and completion signals are manufacturer-specific. Identify the route for your exact board; do not mix an MSI filename with ASUS instructions, or assume that a reset button is a firmware-update button.'
    ], ['flashButton', 'biosASUS'], { table: table('Plan the route from documented capabilities, not the socket name', ['Situation', 'Evidence to collect', 'Decision before changing parts'], [
      ['Current CPU reaches firmware', 'Installed version and exact supported update procedure', 'Confirm whether an update is required and usable now'],
      ['New CPU needs another BIOS; board has a documented CPU-independent feature', 'Exact-model feature, file preparation, labeled port and power instructions', 'Follow that complete model-specific route'],
      ['New CPU needs another BIOS; feature or installed version is unknown', 'Manufacturer or seller confirmation of a supported preparation route', 'Keep the installation unresolved; arrange support before dismantling']
    ]) }),
    section('Resolve a disagreement without guessing a firmware file', [
      'Suppose a store calls a board “Ryzen-ready,” its exact support list names the selected CPU, and the installed version remains unknown. Those statements do not conflict: the board may support the CPU after the documented update while the particular unit still needs preparation. Save each statement with what it proves. A seller who confirms the exact supplied unit and firmware answers a narrower, more useful question than a general chipset advertisement.',
      'If the CPU is absent from the exact list, the board revision differs, or the file notes do not match the intended update path, stop the inference at that point. Ask the board maker or seller for clarification. Do not treat another model’s successful forum report as permission to cross-flash. Keep the unresolved support record attached to the saved build so a later part swap cannot inherit a stale pass.'
    ], ['cpuList', 'biosMSI'])
  ]),
  revision('MC02', 'M07', [
    section('Include operating-system access in the platform stage', [
      'A motherboard replacement can change more than physical compatibility. Before the platform stage, record the Windows edition and activation state and follow Microsoft’s legitimate preparation route where it applies. Its reactivation guidance distinguishes a linked digital license from a product key and requires the edition to remain consistent. Do not put account credentials, product keys or recovery keys in a shared parts list.',
      'Treat reactivation as a separate task from recovering encrypted data. A saved Windows account link does not unlock an encrypted drive, and a BitLocker recovery key does not establish a transferable license. If either requirement is uncertain, resolve access before the installation. Include any confirmed new operating-system purchase in the complete stage cost; an unknown cost remains a missing line item.'
    ], ['activation', 'bitlocker']),
    section('Use a handoff test rather than a vague finished checkbox', [
      'Write an observable acceptance check for each stage before buying it. A storage-capacity stage might require that the intended drive is recognized and the needed files can be read from a verified backup. A GPU stage might require the correct display path, recognized card and a repeatable run of the actual application. These are examples of checks to define, not evidence that any selected hardware has already passed.',
      'Keep the same baseline conditions when comparing the old and new state. Record the application or game, settings, test segment and any other changes that could explain a difference. If the result does not answer the original goal, keep the next stage on hold. Do not convert a normal boot into a claim of long-term stability or an informal FPS observation into a benchmark dataset.'
    ], [], { table: table('A completed stage leaves a usable decision record', ['Record', 'What belongs here', 'What does not count'], [
      ['Before', 'Working configuration, source records and the problem being solved', 'An assumed bottleneck percentage'],
      ['Installation gate', 'Required parts, supported procedures and private recovery access', 'A boxed component that cannot yet be installed'],
      ['After', 'Observed recognition, a named task and unchanged comparison conditions', 'A claim that one successful boot proves every workload'],
      ['Next decision', 'Keep, investigate, reverse through a supported route, or proceed', 'Automatically buying the next item to cover an unexplained fault']
    ]) })
  ]),
  revision('MC03', 'M08', [
    section('Audit reuse in three separate rows', [
      'Separate the power-supply unit, its DC cable set and the installation accessories. Keeping the unit does not prove that every cable in a drawer belongs to it. Replacing the unit does not make the existing routed cables compatible with the replacement. Seasonic warns that modular wiring can differ across brands and between models within a brand. Identify the supplied or explicitly approved set before connecting it.',
      'NZXT provides a current concrete example: its Gold Core supplies are not compatible with cables from the previous C-series generations despite connectors that can physically mate. This is why “same brand, same wattage” is not a usable cable approval. The exact manufacturer record must connect the particular cable and supply. Do not infer approval from a connector photograph or try to create it by rewiring the cable.'
    ], ['seasonicCables', 'nzxtCables'], { table: table('Reuse is three decisions, not one wattage comparison', ['Item', 'Keep only after checking', 'If unresolved'], [
      ['PSU unit', 'Exact identity, known condition, intended load and required supported connections', 'Obtain model-specific help; do not open the enclosure'],
      ['Modular DC cables', 'Supplied set or explicit compatibility with this exact PSU/revision', 'Do not connect an unidentified cable'],
      ['Mounting and routing', 'Case support, cable reach and the intended drive/fan arrangement', 'Retain a fit or accessory check and any missing cost']
    ]) }),
    section('Include the cost of making reuse possible', [
      'Compare two complete plans: retain the identified working supply with any documented accessories it needs, or replace it with an identified unit and the correct included cables. Record the actual seller quote, region and exclusions for every purchase. A supply already owned is not new spending, but an unpriced replacement cable is not free.',
      'If a necessary approved replacement is unavailable, the reuse route remains unresolved. Keep its cost and availability question visible rather than marking the overall build ready. Recheck after a graphics-card, case or storage change. This workflow helps organize a purchasing decision; it cannot inspect the electrical condition of a used supply remotely.'
    ])
  ]),
  article('MC04', '/blog/read-hardware-benchmarks-test-conditions/', 'How to read GPU benchmarks without comparing the wrong tests',
    'Compare results only after checking the game, settings, system, capture method and metric. A bigger FPS number can describe a different test. Use the original evidence to decide whether a result answers your question before using it to choose a part.',
    'Help a hardware buyer assess whether independent benchmark results can support their own game or upgrade decision', [
      section('Start with the question the test can answer', [
        'Write the decision in ordinary terms: can this configuration deliver a particular experience in this game, would a card change help a workload, or does a setting improve consistency? Then read the original test method. A GPU review on a fast reference platform and a test of an older complete PC can both be useful while answering different questions.',
        'Record the exact models, memory configuration, operating system, driver and software version when the publisher supplies them. Missing fields do not prove the result false, but they limit what you can carry into another setup. Do not apply a desktop result to a similarly named laptop GPU, or a capacity variant to a different card, without explicitly identifying those differences.'
      ]),
      section('Match the workload before comparing the bars', [
        'Resolution is only the beginning. Check the quality preset, individual changes, ray tracing, upscaling mode, frame generation, API and test segment. A built-in sequence, a repeatable route and a live multiplayer match are not interchangeable samples of a whole game. A result from one patch may need rechecking after a substantial software change.',
        'For a buying shortlist, prefer a same-method comparison within a publication before combining charts from unrelated systems. Keep an older card in the same dataset where possible. If one result lacks a matching mode, leave that comparison unanswered rather than adjusting it by an invented percentage.'
      ], [], { table: table('A comparison record you can reproduce', ['Field', 'What to preserve', 'Why it changes the question'], [
        ['Hardware', 'Exact CPU/GPU and memory configuration', 'Different names or variants may describe a different system'],
        ['Game and scene', 'Edition, patch, repeatable segment and capture duration', 'A different scene is a different workload'],
        ['Graphics', 'Resolution, settings, RT, upscaling and frame generation', 'The output and rendering work can change'],
        ['Method', 'Tool/version, metric definition, repeated runs and exclusions', 'Similar labels can be calculated differently'],
        ['Evidence', 'Original source, date and any stated limitations', 'A screenshot alone may omit necessary context']
      ]) }),
      section('Read average FPS and slow-frame metrics together', [
        'Average FPS summarizes the capture, while a frame-time plot can show uneven delivery that the average hides. GamersNexus explains this distinction in its original methodology discussion. A single minimum, a percentile boundary and an average of a slowest-frame subset are different summaries; do not assume every label called “1% low” uses the same calculation.',
        'NVIDIA’s FrameView 1.7 guide, for example, lists its slowest-frame aggregate separately from percentile metrics. Ask how a publisher or tool calculated its number. Without the underlying frame records and a defined method, an average cannot be converted into a measured 1% low by multiplying it by a fixed factor.'
      ], ['gnMethod', 'frameView']),
      section('Keep displayed frames and responsiveness separate', [
        'PresentMon documents distinct present, GPU and display timing fields. A presented frame need not have been displayed, and not every capture exposes every metric. Preserve the tool version and metric mode. A number copied from a CSV header is not self-explanatory evidence unless the definition and capture conditions travel with it.',
        'Frame generation needs its own label. Do not compare a generated-output rate with another card’s base-rendering rate as though they describe identical work or input response. Likewise, an interval calculation such as 1000 divided by FPS is useful arithmetic; it does not measure complete mouse-to-display latency. Use latency evidence only when its actual measurement scope is documented.'
      ], ['presentMon']),
      section('Do not average away differences in method', [
        'A capture-tool update can change reporting even if the hardware is unchanged. NVIDIA’s FrameView 2.0 notes say its FPS reporting changed the handling of dropped and zero-display presents and that an average can read slightly higher. That is a concrete reason to keep software versions with results instead of treating every numerical change as faster hardware.',
        'When repeated runs are available, inspect their spread and the publisher’s aggregation method. Do not claim a tiny lead is repeatable when the results do not establish that. Do not blend unlike presets, generated frames or separate testbeds into a precise overall average. A clearly limited observation is more useful than an apparently exact number assembled from incompatible inputs.'
      ], ['frameViewChange']),
      section('Turn the evidence into a buying condition', [
        'Keep two decisions separate: whether a result supports the experience you want, and what the complete compatible upgrade would cost. A useful conclusion names the conditions that would change it—another game, a different display goal, a missing price or an added PSU requirement. Include keeping the current hardware when the evidence does not justify spending.',
        'Use the performance evidence view to see the site’s actual coverage and limitations. If an exact measured record is unavailable, retain the original external source and the differences rather than inventing an FPS estimate. This guide supplies a reading method and original decision worksheet; it does not report a PC Part Performance laboratory test.'
      ])
    ], [{ href: '/performance/evidence/', label: 'Inspect benchmark evidence' }, { href: '/tools/frame-time-budget/', label: 'Calculate a frame interval' }, { href: '/upgrade/', label: 'Plan the complete upgrade' }],
    { replacesDraftIntent: '40', keywords: ['GPU benchmarks explained', 'how to read 1% lows', 'frame time', 'benchmark test conditions'], limitations: ['No benchmark results, performance ranking or third-party dataset are republished.'] }),
  article('MC05', '/blog/32gb-vs-64gb-ram-workloads/', '32 GB vs 64 GB RAM: decide from the work your PC actually does',
    'Choose capacity from the applications, projects and multitasking you need, then check the exact platform and kit. Doubling RAM capacity does not promise double performance. Keep a working 32 GB setup unless a documented requirement or repeatable capacity problem supports the change.',
    'Resolve the RAM-capacity buying decision without claiming a universal gaming sweet spot or invented measured uplift', [
      section('Separate capacity from speed, VRAM and storage', [
        'A 32 GB versus 64 GB choice concerns how much system memory is available. It does not directly answer transfer rate, timings, graphics-card memory, storage space or whether a particular kit works on the board. List those as separate requirements. Free space on an SSD is not the same resource as RAM, and system RAM is not automatically a substitute for a discrete GPU’s VRAM.',
        'Start with what the PC must do at the same time. A game, voice chat and a browser describe one workload. An editing project, compositing application and other active work describe another. Compare the real task with its software requirements instead of assigning an amount merely because a system is called “gaming” or “creator.”'
      ]),
      section('Use application recommendations within their scope', [
        'Adobe’s current version-scoped Premiere requirements recommend 16 GB RAM for HD media and 32 GB or more for 4K and higher in the Windows table. That is a useful application-specific starting point. It does not establish that every project runs comfortably in 32 GB, or that 64 GB is mandatory for every editor. The macOS table describes a different unified-memory context.',
        'Check the exact software version and platform you will use, including plugins and any required companion applications. Record whether a figure is a minimum, a recommendation or a measured observation. A vendor requirement can rule a configuration out; it cannot supply an export-time improvement for a memory upgrade the source did not test.'
      ], ['premiere']),
      section('Observe a repeatable capacity problem before buying', [
        'On an existing Windows PC, Kingston documents finding memory capacity and use in Task Manager’s Performance view. Open the normal set of applications, reproduce the slow task and record what happened, when it happened and which programs were active. Take observations from an actual representative session rather than only an idle desktop.',
        'High use alone is not a diagnosis. Establish whether the task fails, becomes impractical, or has a repeatable symptom that changes when you safely reduce the active workload. Close only applications you recognize, keep the same project and record the difference. Do not disable the paging file or security features to manufacture a cleaner graph. If the cause remains unclear, investigate before choosing a larger kit.'
      ], ['memoryAssess']),
      section('Compare complete configurations, not loose extra sticks', [
        'Record the board, CPU, firmware, DDR generation, exact kit part number, total capacity, module count and intended settings. Check the manual and applicable support records for the installed configuration. Spare physical slots do not establish that adding an unrelated kit preserves the old profile or supported operation.',
        'Kingston explicitly does not support mixing its overclockable FURY modules or kits. That is a manufacturer-scoped warning, not proof that every mixed module from every brand must fail. The useful purchasing response is to choose a documented configuration and retain the evidence. Do not advertise a four-module expansion as equivalent to a separately supported two-module kit solely because the totals match.'
      ], ['mixedKits'], { table: table('Decide between actual supported memory configurations', ['Observed need', 'Reasonable next check', 'What is still unknown'], [
        ['Current 32 GB handles the required tasks', 'Keep the working kit and review the next real workload change', 'Future projects are not measured by today’s observation'],
        ['A software recommendation or repeatable task suggests more capacity', 'Compare a supported higher-capacity kit and whole upgrade cost', 'The performance gain needs matching measurements'],
        ['The PC is unstable or memory is missing', 'Check recognition, exact configuration and official setup guidance first', 'Buying more capacity does not diagnose the cause'],
        ['A new build has no usage baseline', 'Use version-specific application requirements and relevant project evidence', 'No universal amount covers every workload']
      ]) }),
      section('Include keeping the existing kit in the cost decision', [
        'Compare a complete supported 32 GB configuration, a complete supported 64 GB configuration and keeping what already works. Include verified regional prices and any required replacement rather than treating an old kit as both fully reusable and already sold. Unknown resale value and missing prices stay outside a claimed saving.',
        'If there is no demonstrated capacity problem, a timing label or a discounted larger kit is not evidence that the PC needs an upgrade. If the workload does justify more capacity, choose the actual supported configuration before optional profile tuning. Keep the old baseline so the replacement can be evaluated against the reason it was bought.'
      ]),
      section('Save the reason, not just the capacity number', [
        'A useful memory plan records the workload, source requirement, observed problem where available, exact kit, support conditions and the next check. Add the selected kit to the full build and use the timing calculator only for its stated arithmetic. A lower calculated CAS interval is not a measured substitute for sufficient capacity.',
        'This guide offers a research-based decision process. It supplies neither a game-by-game RAM benchmark nor a claim that one capacity is best for every user. Revisit the plan when the actual applications or projects change, not merely when a newer package appears.'
      ])
    ], [{ href: '/builder/', label: 'Choose an exact memory kit' }, { href: '/compatibility/', label: 'Check the memory configuration' }, { href: '/tools/memory-timing-comparison/', label: 'Keep timings separate from capacity' }, { href: '/upgrade/', label: 'Compare keeping and replacing RAM' }],
    { replacesDraftIntent: '15', keywords: ['32GB vs 64GB RAM', 'how much RAM do I need', 'RAM capacity for video editing'], limitations: ['No measured FPS or export-time difference is asserted. Capacity recommendations remain application- and configuration-specific.'] }),
  article('MC06', '/blog/reuse-pc-components-new-build/', 'Which PC parts can you reuse? A keep, replace and verify checklist',
    'Reuse a component when its exact identity, condition and requirements suit the next complete PC. Start with an inventory, protect your data and check the dependencies. A part being old is not a reason to replace it; a part already owned is not automatic proof that it fits.',
    'Help an existing owner create a practical reuse inventory without remote condition diagnoses or assumed compatibility', [
      section('Record the machine you actually own', [
        'List exact CPU, board revision, graphics card, complete memory kit, drives, PSU, cooler and case. Photograph labels for your private records where useful. Separate a known part number from a visual guess or a store description. If a prebuilt hides an important model, use its service documentation or ask the manufacturer rather than silently substituting a standard desktop part.',
        'Give every item one of three provisional decisions: keep, replace or verify. Add the reason and the next check. “Keep” should identify the intended next configuration; it is not a certification of the component’s remaining life. A successful boot or a health-status screenshot cannot establish that a used part will never fail.'
      ], [], { table: table('Make the reuse decision explicit', ['Item', 'Keep when the evidence supports it', 'Verify before committing'], [
        ['CPU and board', 'Exact combination and required firmware remain supported for the task', 'Revision, support row, installed BIOS and display route'],
        ['RAM', 'Exact kit and configuration meet the next platform requirements', 'DDR generation, module type/count, capacity and intended settings'],
        ['SSD or hard drive', 'Needed interface, mounting and usable capacity are supported', 'Data backup, selected host connection, power and slot sharing'],
        ['PSU and cables', 'Exact unit and approved cable set suit the complete configuration', 'Known condition, supported connectors, form factor and routing'],
        ['Cooler, case and fans', 'Documented mounts, occupied dimensions and connections suit the layout', 'Missing brackets, radiator placement, controls and mounting hardware']
      ]) }),
      section('Protect files before treating a drive as reusable hardware', [
        'Identify the files and recovery information you must retain before disconnecting a drive, changing the platform or creating installation media. Verify that a separate backup can supply the needed files. Microsoft’s Windows Backup describes specific backed-up folders and settings; do not assume that selecting it creates a full image of every disk and installed application.',
        'Keep encryption recovery access private. Record whether the proposed operation is reading an existing data drive, moving an operating-system installation or erasing a destination for a fresh install. Those are different jobs with different consequences. Do not initialize or format a disk merely because another PC asks about an unfamiliar drive. Resolve its identity and the recovery plan first.'
      ], ['windowsBackup', 'bitlocker']),
      section('Check the platform boundary for CPU, RAM and cooling', [
        'A platform move can require several replacements together. AMD identifies the Ryzen 7 5700X3D as an AM4/DDR4 processor and the Ryzen 5 7600 as AM5/DDR5. This documented example explains why keeping the old memory is not a valid assumption for every CPU upgrade. The exact board and processor support record still determines the particular installation.',
        'Check the existing cooler’s exact mounting kit and the intended CPU, board, RAM and case arrangement. Noctua’s compatibility resources illustrate how those are separate model-specific questions. An available bracket can be a required purchase; an old socket label is not proof that the box contains it. Do not infer cooling capability or mechanical clearance from a similar-looking product or a 3D preview.'
      ], ['cpu5700', 'cpu7600', 'coolerSupport']),
      section('Treat storage connections and PSU cables differently', [
        'For storage, preserve both form factor and interface. Kingston explains why M.2 alone does not identify SATA versus NVMe. Check the exact slot or port, supported drive length, mounting hardware and any shared-lane condition in the next board’s manual. A physically spare-looking position does not answer all of those questions.',
        'For a modular PSU, keep cables with the exact supply they belong to and follow its maker’s compatibility record. Seasonic warns that models within one brand can use different wiring. Do not move an unidentified old cable loom into a new supply to save time. A needed approved cable that has not been priced remains an unresolved item in the reuse plan.'
      ], ['storageInterface', 'seasonicCables']),
      section('Check the occupied case layout, not just its size class', [
        'Reusing a case means checking the complete intended interior: board, GPU thickness and height, cooler, drives, PSU and installed fans or radiator. Read the exact edition’s manual. The original Fractal North documentation is one example of configuration-dependent allowances; it must not be used as the measurements for every North edition.',
        'Count missing screws, standoffs, drive mounts, cooler fittings and required connections as separate checks. Fan control and lighting connections also need their actual manuals; do not assume every visually similar plug belongs on the same header. Keep the layout in the builder as a visual aid and retain documentary fit questions outside the model.'
      ], ['north']),
      section('Compare reuse with a complete replacement plan', [
        'Mark retained parts as owned and price only the required new purchases with their region and exclusions. Include mounting kits, approved cables, a needed operating-system license and other confirmed accessories. Unknown prices are not zero. Keep any assumed sale proceeds separate from spending so an unverified resale estimate cannot make a plan look affordable.',
        'Save the current configuration and the proposed configuration before a staged change. Include legitimate software access: Microsoft documents preparation and reactivation after significant Windows hardware changes, but a linked account is not a blanket license-transfer permission. The useful result is a build with clear keep, replace and verify decisions—and the option to keep the working PC when no purchase is justified.'
      ], ['activation'])
    ], [{ href: '/upgrade/', label: 'Create a keep, replace and verify plan' }, { href: '/builder/', label: 'Save the next complete PC' }, { href: '/tools/platform-upgrade-cost/', label: 'Compare the full new spending' }, { href: '/blog/choose-a-pc-power-supply/', label: 'Check PSU reuse and cables' }],
    { replacesDraftIntent: '23', keywords: ['reuse PC parts', 'can I reuse RAM SSD power supply', 'keep replace verify'], limitations: ['No remote health diagnosis, remaining-life prediction, resale value or universal reuse guarantee is supplied.'] }),
  article('MC07', '/blog/gaming-streaming-pc-planning/', 'Plan a gaming and streaming PC around the stream you want to make',
    'Test the game, capture scene, encoder and network together before choosing an upgrade. Streaming adds more than an encoding job, and a stream problem is not automatically a slow GPU. Start with the actual output you need and separate rendering, encoding and connection problems.',
    'Help a beginner plan a single-PC gaming/streaming workload using official OBS guidance and explicit test conditions', [
      section('Write two targets: playing and delivering video', [
        'Record the game and settings you want to play, then the stream or recording you want to produce. Include output resolution and frame rate, recording alongside streaming, audio sources, capture devices, overlays and the destination service. A PC capable of running a game alone has not yet been tested with that entire workflow.',
        'Use the destination service’s current published settings for supported codecs and ingest requirements. A hardware feature is useful only if the application, drivers, operating system and destination support the intended path. Do not choose a component solely because a product name contains an encoder acronym.'
      ]),
      section('Distinguish encoding from rendering the scene', [
        'OBS explains that a supported hardware encoder can move video encoding away from the CPU to a media engine. That can be a useful option, but generations and features differ. Its hardware-encoding article is a starting point for the concept, not a complete current support matrix for every GPU and codec.',
        'OBS also uses GPU resources to compose and render the scene. A hardware encoder therefore does not make the rest of the stream free. Keep the game workload, scene workload and encoding configuration distinct. A busy scene with browser sources or filters can behave differently from a basic game capture on exactly the same PC.'
      ], ['obsHardware', 'obsPerformance']),
      section('Establish a baseline before changing hardware', [
        'Start from OBS’s Auto-Configuration Wizard for the intended task, then test the actual scene and workload. Preserve the selected settings and a representative segment of gameplay. Verify that the capture, audio routing and intended output work before adding optional overlays. A wizard suggestion is an initial configuration, not evidence that the full stream has passed.',
        'Compare a game-only session with a game-plus-output session under the same settings where practical. Record the capture duration and what visibly went wrong. Keep logs private if they contain account paths or other identifying details. A short successful local recording is useful, but it does not test the internet connection to the streaming server.'
      ], ['obsStart']),
      section('Give the symptom the right name', [
        'OBS connection troubleshooting distinguishes dropped network frames from other performance problems: the connection may not sustain the configured bitrate or may be unstable. That is a different question from whether the game is rendering quickly or the stream scene is keeping up. Buying a GPU is not a documented fix for an unexamined network path.',
        'Use the application’s named rendering, encoding and connection observations, plus its current troubleshooting guidance. Record which counter changed during the problem. If viewers report buffering while the sender has no drops, do not assume their experience proves a hardware defect in your PC. Preserve the distinction and investigate the relevant delivery path.'
      ], ['obsNetwork'], { table: table('Diagnose the stage before choosing a purchase', ['Observation', 'Investigate first', 'What it does not prove'], [
        ['Game-only task already misses the desired experience', 'Game settings and comparable hardware evidence', 'That streaming is the original cause'],
        ['Scene rendering or encoding falls behind', 'Actual scene, game load, encoder and output settings', 'That one specific replacement is necessary'],
        ['Dropped network frames or disconnects', 'Connection to the ingest server and configured bitrate', 'That a faster GPU solves the connection'],
        ['No repeatable problem in the needed workflow', 'Keep the baseline and test meaningful changes', 'That a new build is required']
      ]) }),
      section('Try one reversible change at a time', [
        'For a rendering or encoding problem, OBS documents reducing game load, simplifying scenes or reducing output work as relevant checks. Pick one change, keep a record and repeat the same task. If it makes no useful difference, restore the baseline before testing something else. Avoid stacking unrelated tweaks until the cause is impossible to interpret.',
        'Use ordinary application controls and official support instructions. Do not disable security software, install an unofficial optimizer or copy voltage settings as a generic streaming fix. If a hardware change is eventually supported by the evidence, price the whole compatible configuration and retain the test that justified it.'
      ], ['obsPerformance']),
      section('Budget for recordings and the complete workflow', [
        'If you keep local recordings, estimate their storage from an explicit average bitrate and duration. For decimal units, a hypothetical 20 Mb/s recording for one hour is 20 × 3600 ÷ 8 = 9000 MB, or 9 GB, before container overhead and bitrate variation. This is original arithmetic with assumed inputs, not a measured recording size or recommended bitrate.',
        'Use the recording-storage calculator with your own values and leave room for source media, exports and backups. Save the complete PC in the builder, including any required storage, cooling, power and capture-device requirements. No universal gaming FPS, stream quality or encoder ranking is claimed here. Keeping a working PC is a valid result when the actual workflow needs no upgrade.'
      ])
    ], [{ href: '/tools/recording-storage/', label: 'Plan recording storage from your bitrate' }, { href: '/performance/evidence/', label: 'Check game-performance evidence' }, { href: '/builder/', label: 'Plan the complete streaming PC' }, { href: '/upgrade/', label: 'Investigate a targeted upgrade' }],
    { replacesDraftIntent: '09', keywords: ['gaming and streaming PC', 'OBS rendering encoding lag', 'PC for streaming games'], claims: [{ kind: 'original_arithmetic', statement: '20 Mb/s × 3600 s ÷ 8 = 9000 MB = 9 GB in decimal units', measured: false }], limitations: ['No current encoder ranking, stream-quality test, service-specific bitrate recommendation or gaming FPS is supplied.'] }),
  article('MC08', '/blog/video-editing-pc-workload-checklist/', 'Plan a video-editing PC from your projects, not a gaming label',
    'Record the editor version, source media, effects, output and working-storage needs before choosing parts. A requirements list can establish support; it cannot predict your timeline or export speed. Use a small representative project to identify the work the next PC needs to improve.',
    'Provide a complete Premiere-centered project-planning worksheet without pretending to be a tested or priced creator-build recommendation', [
      section('Describe the project that must work', [
        'Write the editing application and version, operating system, source resolution, codec, frame rate and typical number of active streams. Add the effects, plugins, linked applications, output formats and delivery deadline you actually use. “4K editing” alone leaves many of the workload variables unspecified.',
        'Name the difficulty separately: playback that will not stay responsive, an export that takes too long, missing storage capacity or an unsupported effect. A project can have more than one problem, but changing everything at once makes an upgrade hard to evaluate. Retain an untouched copy of the project and representative media for a repeatable comparison.'
      ], [], { table: table('An editing workload record to carry into a build', ['Record', 'Useful detail', 'Decision it supports'], [
        ['Application', 'Version, OS and required plugins', 'Supported hardware and software path'],
        ['Source media', 'Codec, resolution, frame rate and simultaneous streams', 'Relevant decode and playback evidence'],
        ['Effects and linked work', 'Effects used, graphics and companion applications', 'Relevant CPU, GPU and memory demands'],
        ['Output', 'Codec, resolution, deadline and quality settings', 'A comparable export test'],
        ['Storage', 'Source, cache, proxy, export and backup locations/capacities', 'A complete storage and connection plan'],
        ['Observed problem', 'Repeatable task, settings and result', 'A reason to change the current PC']
      ]) }),
      section('Read the requirements for the installed version', [
        'Adobe’s requirements inspected for the listed Premiere 26.x releases separate CPU, OS, RAM, GPU and storage fields. In the Windows recommendations, 4K and higher lists 32 GB RAM or more and the GPU field lists 8 GB of graphics memory. Treat those as vendor guidance for those releases, not a benchmark for every editing project.',
        'The separate January recommendations page contains older broad wording and differs in some figures. Do not silently combine the most convenient numbers from both pages. Start with the exact version’s current requirements and investigate any consequential conflict through the applicable support documentation. Record the source version and date with the parts plan.'
      ], ['premiere', 'premiereRecommendations']),
      section('Match the media path before ranking processors or GPUs', [
        'Decoding source media, playing an effects-heavy timeline and encoding an export are distinct tasks. Preserve the source and output formats when searching for relevant tests. A fast game result or a synthetic graphics score cannot supply an editing-time comparison, and an export result for another codec may answer a different question.',
        'Ask whether an observed test uses the same application version, acceleration settings, source media and effects. Then consider what would change in the whole configuration, including memory and storage. If the supporting measurements are absent, keep the expected improvement qualitative. Do not promise that a larger core count, a newer GPU or an encoder label produces a fixed time saving.'
      ]),
      section('Try a supported proxy workflow when it serves the job', [
        'Adobe documents proxies as lower-resolution editing copies of high-resolution video. Its supported workflow has conditions for eligible clips and preserves a relationship to the original media. That can provide another path to investigate when the project is difficult to edit; it is not a claim that all effects or exports become faster.',
        'Keep the source files and a deliberate proxy location. Check the intended media relationship and output workflow using the application’s instructions. A proxy is not a backup of the source project, and generating one is additional work with storage requirements. Compare the workflow against the actual editing task before deciding that a hardware purchase is the only option.'
      ], ['proxies']),
      section('Budget the working storage separately from the archive', [
        'Adobe’s storage guidance distinguishes application, media and cache roles. Make an inventory of the current locations and capacities before buying another drive. Add proxies, exports and backups to the plan. Do not describe one extra copy on the same working disk as protection against losing that disk.',
        'Use capacity and transfer calculators for their explicit arithmetic. A manufacturer’s maximum sequential MB/s is not a measured multi-stream editing result. Check the host interfaces, occupied slots and conditional lane-sharing rules as well as the drive label. A large drive that cannot be connected or mounted in the intended system is not a complete solution.'
      ], ['premiereStorage']),
      section('Choose a build only after the workload and cost are clear', [
        'Use a representative project to compare candidates when suitable permitted measurements are available. Keep the same media, output and relevant settings, and record the time or observable task result. If no matching evidence exists, retain that limitation. This page does not supply a tested parts list, a current budget build or application-benchmark coverage the site does not have.',
        'Open the builder for exact components and compatibility checks, then use the complete-cost worksheet for required purchases, accessories and any software cost. Owned parts, missing prices and current regional offers remain different states. Save the workload record beside the build so a future comparison answers the same problem rather than starting from a generic “creator PC” label again.'
      ])
    ], [{ href: '/builder/', label: 'Plan the exact editing configuration' }, { href: '/tools/platform-upgrade-cost/', label: 'Record the complete purchase cost' }, { href: '/tools/storage-capacity-planner/', label: 'Budget source, cache and export space' }, { href: '/blog/32gb-vs-64gb-ram-workloads/', label: 'Assess memory capacity for the workload' }],
    { partialIntent: '39', doesNotReplaceBlockedDraft: true, keywords: ['video editing PC requirements', 'Premiere PC planning', 'creator PC workload checklist'], limitations: ['The earlier Premiere build brief still needs comparable permitted application benchmarks, a verified BOM and current regional offers. This worksheet does not claim to complete that blocked buying guide.'] })
];

function wordCount(a) { return [a.title, a.summary, ...a.sections.flatMap(s => [s.title, ...s.paragraphs, ...(s.checklist || []), ...(s.table ? [s.table.caption, ...s.table.headers, ...s.table.rows.flat()] : [])])].join(' ').split(/\s+/).filter(Boolean).length; }
function fingerprint(a) { return crypto.createHash('sha256').update(JSON.stringify({ article: a, sources: Object.fromEntries(a.sourceIds.map(id => [id, sources[id]])) })).digest('hex'); }
function validate(rows = articles, evidence = sources) {
  const errors = [], ids = new Set(), routes = new Set();
  for (const a of rows) {
    if (ids.has(a.id) || routes.has(a.route)) errors.push('Duplicate article identity ' + a.id);
    ids.add(a.id); routes.add(a.route);
    if (!/^\/blog\/[a-z0-9-]+\/$/.test(a.route) || a.canonicalRoute !== a.route) errors.push('Invalid canonical ' + a.id);
    if (a.lifecycle.humanReviewClaimed !== false || a.lifecycle.humanEditorialReview !== null || a.datePublished !== null || a.dateModified !== null) errors.push('Invented publication/review state ' + a.id);
    if (a.sections.length < 5 || a.sections.some(s => !s.title || !s.paragraphs?.length)) errors.push('Incomplete article structure ' + a.id);
    const refs = new Set(a.sections.flatMap(s => s.sourceIds));
    if (!refs.size || refs.size !== a.sourceIds.length || a.sourceIds.some(id => !refs.has(id))) errors.push('Evidence list mismatch ' + a.id);
    for (const id of refs) if (!evidence[id] || !/^https:\/\//.test(evidence[id].url) || !evidence[id].scope || !evidence[id].limitations || !evidence[id].inspected) errors.push('Incomplete source ' + id);
    if (!a.tools.length || a.tools.some(t => !/^\/(?!\/)[a-z0-9/?=#.,%&_-]*$/.test(t.href) || !t.label)) errors.push('Invalid next action ' + a.id);
    const prose = a.sections.flatMap(s => s.paragraphs).join(' ');
    if (/\b(?:TODO|TBD|lorem ipsum)\b|we (?:tested|benchmarked)|guaranteed (?:FPS|compatibility)|(?:is|are) 100% compatible/i.test(prose)) errors.push('Unsupported or placeholder prose ' + a.id);
  }
  return { valid: !errors.length, errors, articles: rows.length, words: rows.reduce((n, a) => n + wordCount(a), 0), sources: new Set(rows.flatMap(a => a.sourceIds)).size };
}
module.exports = { evidenceDate, sources, articles, wordCount, fingerprint, validate, section, table, article };
