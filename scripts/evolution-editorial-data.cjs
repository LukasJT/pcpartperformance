'use strict';

// Research drafts only. This module grants no publication or human-review status.
const crypto = require('node:crypto');
const evidenceDate = '2026-10-19';
const source = (publisher, title, url, claims, limitations, extra = {}) => ({
  publisher, title, url, inspected: evidenceDate,
  access: 'Primary-source page opened and applicable text inspected',
  claims, limitations,
  rights: 'Citation and original explanation only; no source images, diagrams or benchmark tables reproduced.',
  ...extra
});
const sources = {
  atx: source('CORSAIR', 'ATX 3.0 vs ATX 3.1', 'https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/atx-30-vs-atx-31-whats-the-difference/',
    ['ATX 3.1 changes the GPU connector to 12V-2x6 and changes hold-up requirements.'],
    'Manufacturer explanation rather than a certification test. No unit is recommended from its revision label alone; its broad efficiency/safety marketing is not repeated.'),
  cables: source('CORSAIR', 'PSU cable compatibility', 'https://www.corsair.com/us/en/s/psu-cable-compatibility',
    ['The 24-pin cable pinout differs between Type 3 and Type 4; Type 3/4 are not compatible with Type 5 PSUs. Incorrect modular cables can damage hardware.'],
    'Only CORSAIR products in the applicable compatibility matrix. No all-brand pinout or interchangeability claim.'),
  pwm: source('Noctua', '3-pin fans and 4-pin PWM connectors', 'https://www.noctua.at/en/support/faqs/can-i-run-noctua-3-pin-fans-on-4-pin-pwm-connectors-or-4-pin-fans-on-3-pin-connectors',
    ['3-pin speed control depends on supplied voltage; a 4-pin fan on a 3-pin header lacks its PWM control signal and can run at full speed unless voltage control is supported.'],
    'No universal BIOS menu, fan stopping voltage, header current rating or RPM-to-duty conversion.'),
  rgb: source('ASUS', 'Connecting 5 V and 12 V RGB cables', 'https://www.asus.com/tw/support/faq/1056087/',
    ['The named-board example distinguishes 5 V Addressable Gen2 from 12 V AURA RGB headers; manuals identify the correct header and voltage orientation.'],
    'Traditional Chinese full text inspected. Board-specific LED/current limits are not generalized. The English regional endpoints were unavailable during this check.'),
  headers: source('MSI', 'Motherboard ports and headers', 'https://www.msi.com/blog/what-are-the-functions-of-motherboard-ports-and-headers',
    ['Front-panel switch/LED, USB Type-A, USB Type-C, audio and supplemental USB PD connections have different purposes.'],
    'General naming examples only; exact pinout, current limits and available functions require the selected board manual.'),
  b760manual: source('MSI', 'PRO B760-VC WIFI II user guide', 'https://download-2.msi.com/archive/mnu_exe/mb/PROB760-VCWIFIII_EN.pdf',
    ['Printed page 32 labels JFP1 switch/LED functions; page 35 identifies JUSB1 as USB 3.2 Gen 1 Type-C; pages 40–41 distinguish 12 V JRGB and 5 V ARGB.'],
    'Exact named board only. Original illustrations are not copied. PDF text inspected; screenshot fetch succeeded for page 32 and failed for later pages, so no uninspected graphical wiring detail is adopted.', { access: 'Official 60-page PDF opened; applicable extracted sections inspected' }),
  sfx: source('CORSAIR', 'Difference between SFX and SFX-L power supplies', 'https://www.corsair.com/ca/en/explorer/diy-builder/power-supply-units/whats-the-difference-between-sfx-and-sfx-l-power-supplies/',
    ['SFX envelope 100 × 125 × 63.5 mm; SFX-L 130 × 125 × 63.5 mm.'],
    'Use exact product dimensions and mounting rules. The article’s historical cable-family generalization is not used for newer revisions.'),
  gpu5070: source('NVIDIA', 'GeForce RTX 5070 family specifications', 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/',
    ['Reference display connections and up-to-four-display support have qualifications; partner-card dimensions vary. GPU power-connector alternatives and installation-space requirements are model-specific.'],
    'No simultaneous maximum-mode guarantee; no partner layout inferred from Founders Edition. No performance chart reused.'),
  expo: source('AMD', 'EXPO technology', 'https://www.amd.com/en/products/processors/technologies/expo.html',
    ['EXPO is memory overclocking technology, with supported configurations and manufacturer warranty caveats.'],
    'No marketing performance uplift imported. A memory profile is not a guarantee for an arbitrary CPU/board/kit combination.'),
  xmp: source('Intel', 'Extreme Memory Profile', 'https://www.intel.com/content/www/us/en/gaming/extreme-memory-profile-xmp.html',
    ['XMP stores predefined memory overclocking profiles; compatible memory, board and CPU are required; operation beyond specifications can affect warranty.'],
    'No universal frequency, voltage, certification or stability promise.'),
  cpu9950: source('AMD', 'Ryzen 9 9950X specifications', 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html',
    ['Two memory channels, DDR5 UDIMM; 2×1R/2×2R DDR5-5600 versus 4×1R/4×2R DDR5-3600 maximum-memory-speed entries; ECC requires board support.'],
    'One exact CPU. Rank is not synonymous with a module’s capacity or with a channel. Not overclocking results or a universal rule for all Ryzen models.'),
  nonbinary: source('Kingston', 'Non-binary memory FAQs', 'https://www.kingston.com/en/blog/system-builder/24gbit-memory-faq',
    ['24 Gbit DRAM enables capacities including 24 and 48 GB; platform firmware and exact module support must be checked; mixing FURY overclocking kits is not supported by Kingston.'],
    'The historical platform list is not treated as complete current support. No two independently purchased kits are certified as one kit.'),
  ddr5: source('Kingston', 'DDR5 memory standard overview', 'https://www.kingston.com/en/blog/pc-performance/ddr5-overview',
    ['DDR5 on-die ECC works inside DRAM and does not protect the external bus; system ECC requires appropriate module, CPU and platform support; UDIMM and RDIMM are different module types.'],
    'On-die correction is not end-to-end ECC or a guarantee against all data corruption.'),
  m2: source('Kingston', 'SATA and M.2 SSD FAQs', 'https://www.kingston.com/en/ssd/ssd-faq',
    ['M.2 2230/2242/2260/2280/22110 correspond to 22 mm width and the encoded length; physical format alone does not establish interface compatibility.'],
    'Old maximum-capacity examples on this page are deliberately not repeated as current limits.'),
  ssdwarranty: source('Samsung', 'SSD product warranty', 'https://semiconductor.samsung.com/consumer-storage/support/warranty/',
    ['Limited warranty conditions depend on exact model/capacity, elapsed time and total bytes written; warranty terms and exclusions must be read together.'],
    'No promised drive failure date or data-recovery entitlement; no country-specific legal conclusion.'),
  ssdTrouble: source('Samsung', 'Internal SSD troubleshooting', 'https://semiconductor.samsung.com/consumer-storage/support/faqs/internalssd-trouble-shooting/',
    ['Check detection/connection and system firmware support; Samsung Magician detection can differ with controllers such as RAID.'],
    'Does not authorize destructive initialization, universal BIOS-mode changes or a flash/update without the device’s instructions.'),
  ssdheat: source('Kingston', 'M.2 NVMe SSD cooling', 'https://www.kingston.com/en/blog/pc-performance/ssd-cooling-m2-nvme-heatsink',
    ['Sustained work and heat can cause thermal throttling; airflow and correctly installed cooling affect operating conditions.'],
    'No universal threshold, percentage slowdown or test result imported. A speed drop alone is not proof of heat throttling.'),
  gsync: source('NVIDIA', 'G-SYNC control-panel help', 'https://www.nvidia.com/content/Control-Panel-Help/vLatest/en-us/mergedProjects/Display/Variable_Refresh_Rate.htm',
    ['G-SYNC aligns display refresh with GPU frame output; G-SYNC Compatible is NVIDIA validation of a VRR display.'],
    'Legacy OS examples are not adopted as current recommendations. Actual monitor/input/GPU support still governs.'),
  freesync: source('AMD', 'FreeSync technology', 'https://www.amd.com/en/products/graphics/technologies/freesync.html',
    ['FreeSync uses variable-refresh protocols and a certification program; features depend on display and connection.'],
    'Marketing claims do not prove all stutter disappears. Tier requirements can change; no copied tier table or universal range.'),
  hdmi: source('HDMI Licensing Administrator', 'HDMI 2.2 specification overview', 'https://www.hdmi.org/spec/hdmi2',
    ['Current HDMI feature and cable discussion separates features and supported capabilities; VRR and display-stream compression are relevant to a complete link.'],
    'No assumption that a version label provides every optional feature or maximum rate; this is not the complete licensed specification.'),
  dp: source('VESA/DisplayPort', 'Choosing a DisplayPort cable', 'https://www.displayport.org/how-to-choose-a-displayport-cable-and-not-get-a-bad-one/',
    ['Certified cables have defined capability; required source/display features and link bandwidth matter.'],
    'Historical cable examples are not asserted to cover all 2026 modes. No universal refresh limit derived from the connector shape.'),
  presentmon: source('Intel/GameTechDev', 'PresentMon documentation', 'https://github.com/GameTechDev/PresentMon',
    ['Windows ETW-based capture produces frame duration/latency records; capture, service and console tools have documented metric limitations.'],
    'No site-owned benchmark was run; illustrative frame-time values are constructed examples, not submitted measurements.'),
  shader: source('AMD GPUOpen', 'Radeon Developer Panel system experiments', 'https://gpuopen.com/manuals/rdp_manual/system/',
    ['Driver-side pipeline compilation can take time; compiled shaders may be cached; cold-cache and warm-cache runs differ.'],
    'Developer diagnostics are not consumer instructions to disable caches or clear folders; a correlation does not diagnose every hitch.'),
  nvenc: source('NVIDIA', 'Video encode and decode support matrix', 'https://developer.nvidia.com/video-encode-decode-support-matrix',
    ['Encode and decode support are separate and vary by exact GPU, codec, bit depth and format.'],
    'Citation only; no matrix republished and no real-time quality or FPS promises.'),
  obs: source('OBS Project', 'Hardware encoding', 'https://obsproject.com/kb/hardware-encoding',
    ['Available hardware encoders depend on hardware and software; selection belongs in the recording/streaming workflow.'],
    'An encoder being selectable does not establish service acceptance, quality equivalence or zero performance cost.'),
  undervolt: source('AMD', 'Adrenalin GPU performance tuning', 'https://www.amd.com/en/resources/support-articles/faqs/DH3-020.html',
    ['Undervolt options are available only on select GPUs; reset/default and stress-test behavior are documented.'],
    'No voltage offsets or stability guarantees copied. Automatic recovery is not a substitute for backups or confirmation of stock behavior.'),
  vram: source('Microsoft', 'DXGI video-memory budget structure', 'https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_4/ns-dxgi1_4-dxgi_query_video_memory_info',
    ['Budget, CurrentUsage, AvailableForReservation and CurrentReservation are different quantities; exceeding the OS budget can cause performance penalties.'],
    'Application API semantics do not identify what every overlay reports or determine a game’s exact needed VRAM/FPS.'),
  airflow: source('Noctua', 'Airflow guide: setup ideas', 'https://www.noctua.at/en/support/faqs/airflow-guide-setup-ideas',
    ['Positive/negative pressure refers to intake/exhaust balance; case layouts differ and opposing flows/obstructions matter.'],
    'No fan-count prescription, measured temperature improvement or guaranteed dust prevention imported.'),
  aio: source('CORSAIR', 'AIO radiator mounting guidance', 'https://help.corsair.com/hc/en-us/articles/360049358271-AIO-How-should-I-mount-the-radiator-of-my-AIO-cooler',
    ['For the conventional CPU-pump layout discussed, keep the pump below the loop’s highest radiator point; top mount or suitable front/tubes-down configurations are described.'],
    'Not every cooler has its pump in the CPU block. Product-specific instructions and case fit override a generic diagram.'),
  noise: source('CDC/NIOSH', 'Sound Level Meter app', 'https://www.cdc.gov/niosh/noise/about/app.html',
    ['NIOSH validation is scoped to its iOS app and specified test conditions; calibrated external microphone conditions differ from an arbitrary phone reading.'],
    'Not validation at very quiet PC noise levels or proof of a phone’s noise floor. This guide is not occupational exposure advice.'),
  riser: source('CORSAIR', 'PCIe 3.0 extension video-output troubleshooting', 'https://help.corsair.com/hc/en-us/articles/360052676711-PCIe-3-0-Extension-How-to-fix-video-outputting-issues-when-using-the-CORSAIR-PCIe-3-0-extension-cable',
    ['For the named Gen3 extension with Gen4 devices, direct mounting allows access to firmware before selecting Gen3 and retrying the extension.'],
    'Exact named older extension scenario only; not a blanket fix for all risers or a recommendation to force any unknown link mode.'),
  paste: source('Noctua', 'NT-H1/NT-H2 application and removal', 'https://www.noctua.at/en/support/faqs/how-should-i-apply-the-nt-h1-or-nt-h2-thermal-paste-on-the-cpu-and-how-can-i-remove-it',
    ['When the heatsink is removed, Noctua recommends cleaning both contact surfaces and applying fresh compound; application instructions depend on the CPU/package.'],
    'Only NT-H1/NT-H2 and relevant instructions; not a universal dose, replacement interval, or instruction for liquid metal.'),
  sag: source('ASUS', 'Installing the supplied graphics-card holder', 'https://www.asus.com/us/support/faq/1054765/',
    ['Check exact-card accessory list; secure the card to the chassis; position the supported holder as specified without interference.'],
    'Examples use particular ASUS products; no universal support location or guarantee for arbitrary heavy cards.'),
  placement: source('Dell', 'Desktop care and ventilation', 'https://www.dell.com/support/kbdoc/en-us/000184427/best-practices-for-product-use-and-handling-for-dell-desktops',
    ['Avoid blocked vents, soft surfaces and unventilated enclosures; preserve the manufacturer’s clearance guidance.'],
    'Dell’s specific numeric spacing examples are not a universal DIY case clearance rule.'),
  zero: source('CORSAIR', 'Zero-RPM power supplies', 'https://help.corsair.com/hc/en-us/articles/4415184478477-PSU-What-are-zero-RPM-PSUs',
    ['Some PSU fans remain stopped under suitable conditions and start according to the model’s documented control behavior.'],
    'No universal wattage/temperature threshold. A stationary fan is neither sufficient proof of health nor of failure.'),
  activation: source('Microsoft', 'Reactivating Windows after a hardware change', 'https://support.microsoft.com/en-us/windows/activation/reactivating-windows-after-a-hardware-change',
    ['A motherboard change can require reactivation; preserve activation method and edition, and use Microsoft’s supported recovery path.'],
    'License transfer rights vary; linking an account does not create a new transferable license.'),
  bitlocker: source('Microsoft', 'Find your BitLocker recovery key', 'https://support.microsoft.com/en-us/windows/security/encryption/find-your-bitlocker-recovery-key',
    ['Hardware changes can trigger recovery; the correct recovery key must remain accessible; Microsoft cannot recreate a lost key.'],
    'No secrets are collected by the site, and no encryption bypass or guarantee of recovery is offered.'),
  resale: source('Microsoft', 'Before selling, recycling or gifting a Windows PC', 'https://support.microsoft.com/en-us/accounts-billing/security/before-you-recycle-sell-or-gift-your-xbox-or-windows-pc',
    ['Back up, reset appropriately and remove the retired device from the Microsoft account after the required preparation.'],
    'Account removal alone does not erase local storage; no claim of certified sanitization for sensitive data.'),
  reset: source('Microsoft', 'Reset your PC', 'https://support.microsoft.com/en-us/windows/experience/backup-recovery/reset-your-pc',
    ['Back up before reset; Keep my files and Remove everything differ; drive cleaning makes recovery harder but is not a government/industry sanitization standard.'],
    'No universal secure-erasure guarantee for every drive, recovery partition, external device or sensitive-data use case.'),
  flash: source('MSI', 'Flash BIOS Button', 'https://www.msi.com/support/technical_details/MB_Flash_BIOS_Button',
    ['Only supported models provide the button-based method; the correct model file, designated USB port and uninterrupted power matter.'],
    'No universal filename, wait time or electrical sequence applied to other board manufacturers.'),
  bios: source('ASUS', 'Motherboard BIOS update methods', 'https://www.asus.com/support/faq/1044348/',
    ['Firmware-menu updating and supported USB BIOS FlashBack are different methods; some upgrades require an intermediate version or old supported CPU/service.'],
    'Cannot assume rollback is always possible; exact board revision/support instructions remain required.'),
  quicksync: source('Intel', 'Quick Sync with a separate GPU', 'https://www.intel.com/content/www/us/en/support/articles/000094565/graphics.html',
    ['Processor-graphics Quick Sync acceleration depends on the integrated graphics remaining enabled.'],
    'Does not certify every codec/profile or an exact export-speed improvement; this discussion is distinct from Intel Arc discrete media support.')
};

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const section = (heading, paragraphs, sourceIds = [], extra = {}) => ({ heading, paragraphs, sourceIds, ...extra });
const table = (caption, headers, rows) => ({ caption, headers, rows });
function bodyFor(sections) {
  return sections.map(s => `<section><h2>${esc(s.heading)}</h2>${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${s.table ? `<table><caption>${esc(s.table.caption)}</caption><thead><tr>${s.table.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row=>`<tr>${row.map((c,i)=>i?`<td>${esc(c)}</td>`:`<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table>`:''}${s.checklist ? `<ul>${s.checklist.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}</section>`).join('');
}
function article(number, slug, title, description, intent, answer, sections, tools, visual, relation) {
  const sourceIds = [...new Set(sections.flatMap(s => s.sourceIds))];
  const item = {
    id: `LE-${String(number).padStart(2,'0')}`, slug, title, description, intent, answer,
    route: `/blog/${slug}/`, previewRoute: `/review/evolution/${slug}/`,
    status: 'draft', evidenceStatus: 'primary_sources_inspected_agent_checked',
    humanReview: null, humanReviewClaimed: false, publishable: false, published: false, indexable: false,
    proposedAuthor: { type:'Organization', name:'PC Part Performance' },
    editorialDisclosure: 'Research and draft preparation assisted by AI; no human editorial review or hands-on testing claimed.',
    evidenceDate, contentVersion: 'liquid-evolution-2026-10-19.1',
    sections, body: bodyFor(sections), sourceIds, sources: sourceIds.map(id=>({ id, ...sources[id] })),
    relatedTools: tools.map(([label,href])=>({label,href})),
    visual: { ...visual, path:`scripts/assets/evolution-editorial/${slug}.svg`, src:`/assets/evolution-editorial/${slug}.svg`, width:960, height:520, original:true, evidence:'Original schematic; not a manufacturer wiring diagram, product measurement or benchmark.' },
    relation,
    lifecycle: { researched:true, draftComplete:true, agentEvidenceCheck:true, humanEditorialReview:false, approved:false, released:false },
    publicationBlockers: ['human_editorial_review', 'truthful_byline_confirmation', 'final_visual_and_link_review'],
    datePublished: null
  };
  item.contentHash = crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex');
  return item;
}
const articles = [];

// Complete specialist drafts follow. Shared helpers affect presentation only.

articles.push(article(1, 'atx-31-vs-30-psu-buying-checks', 'ATX 3.1 vs ATX 3.0: which PSU details matter?',
  'Separate the power-supply design revision from wattage, cable compatibility and exact-card installation requirements.',
  'Interpret an ATX 3.1 label without assuming a complete PSU upgrade is necessary',
  'ATX 3.1 changes parts of the power-supply specification, including the GPU connector arrangement. The label alone cannot tell you whether a particular unit has the right cables, fits the case or is a worthwhile replacement.', [
    section('Three labels that answer different questions', [
      'ATX revision, continuous output and cable type describe different properties. A revision identifies a design requirement; wattage describes an output rating; the cable family identifies a connection system. Do not replace one of these checks with another. A higher revision number does not turn a wrong modular cable into a compatible one.',
      'CORSAIR describes the transition to the 12V-2x6 GPU connector and changed hold-up requirements in ATX 3.1. That is a useful starting explanation, not an independent test of every unit bearing the label. Do not read the revision as a guarantee against a poorly seated connection or as a measured efficiency ranking.'
    ], ['atx','cables']),
    section('Check the exact purchase, not the product-family name', [
      'Record the complete PSU part number and revision from the offer. Open that revision’s manual and package list. Identify the GPU cable supplied, the CPU power cables needed by the motherboard, and any separate cable the manufacturer approves. Similar retail names can persist across hardware generations.',
      'Then compare the actual GPU installation instructions with the case layout. The 16-pin connector, cable exit and side panel occupy space beyond the card body. A PSU standard and a GPU chip name cannot verify that routing. Keep a missing cable specification or uncertain clearance as an outstanding task rather than approving the whole build.'
    ], ['gpu5070']),
    section('Decide whether replacing a working PSU solves a real problem', [
      'Make two plans: keep the current unit with a documented supported connection, or replace it with an exact alternative. Include the replacement unit, any required mounting bracket and shipping. If the current unit’s identity, condition or cables cannot be established, do not count it as verified reusable equipment.',
      'This is a connection-and-purchase decision worksheet. It does not test transient response, protections, noise or ageing. Use independent testing of the exact unit for those questions. A newer label may be relevant, but it should not erase evidence about an older unit or substitute for the complete requirements of your system.'
    ], [], { checklist:['Record exact PSU revision','Identify supplied and approved GPU cable','Check CPU connections and case cable space','Keep unknown condition or cable origin unresolved'] })
  ], [['Record the PSU in your build','/builder/'],['Check the full replacement cost','/tools/platform-upgrade-cost/']],
  { kind:'lanes', title:'One PSU purchase, three separate checks', labels:['Design revision','Output rating','Exact cable family'], notes:['Requirements','Power budget','Connection approval'], alt:'Three independent PSU checks: ATX revision, rated output and cable-family compatibility.' },
  { related:'/blog/choose-a-pc-power-supply/', difference:'Specialist interpretation of ATX revision labels; existing guide covers complete PSU selection.' }));

articles.push(article(2, 'modular-psu-cables-identify-before-reuse', 'Can you reuse modular PSU cables? Identify them first',
  'A safe decision process for a mixed cable box: exact PSU model, cable family, documented approval and unknown origins.',
  'Decide whether an existing modular cable is documented for a replacement PSU',
  'Reuse a modular cable only when the PSU manufacturer explicitly supports that cable with the exact unit. A matching plug, familiar brand or similar wattage is not sufficient evidence.', [
    section('Start at the power-supply end', [
      'The device-end connector can look familiar while the PSU-end wiring differs. CORSAIR’s matrix gives a concrete example: Type 3 and Type 4 differ at the 24-pin ATX cable, and neither family is compatible with Type 5 PSUs. The manufacturer warns that using the wrong cables can damage hardware.',
      'This does not mean those family names apply to another brand. Nor should a cable from a different unit be accepted because it physically enters a socket. Keep the power disconnected while identifying cables; never power a component as an experiment to discover whether an unknown cable works.'
    ], ['cables']),
    section('Build a cable record you can actually verify', [
      'Put the PSU model, hardware generation and cable markings together in one photograph or note. Compare them with the current manufacturer compatibility resource. A cable’s packaging or invoice is useful only if it identifies the actual item in your hand. A loose cable next to a PSU box is not a reliable provenance record.',
      'Separate approved cables from unknown ones before starting the build. Do not combine the sets while routing behind the motherboard tray. If the manufacturer cannot confirm an unmarked cable, use a documented replacement or the correct supplied set. Keep the uncertain cable out of the purchase and assembly plan.'
    ], [], { table: table('Decisions for a box of spare cables', ['Evidence','Decision'], [
      ['Exact cable and exact PSU explicitly approved','Eligible for the documented use; inspect condition too'],
      ['Same manufacturer, unclear generation','Unverified; check the exact matrix or support'],
      ['Plug fits, markings absent','Do not use it to test compatibility']
    ]) }),
    section('Recheck after the PSU changes', [
      'A case or GPU upgrade can leave neatly routed old cables in place. Treat a PSU replacement as a new cable-identification task, even when the new unit has a similar name. Label the cable set you remove with the old PSU model so that future you does not inherit the same uncertainty.',
      'Keep extension cables conceptually separate from modular replacement cables: they attach at different points. An extension still needs documented electrical and connector suitability, but its presence does not establish the PSU-side cable’s identity. If a connector is damaged, discoloured or has an uncertain repair, stop and obtain manufacturer guidance rather than adapting it.'
    ], ['cables'])
  ], [['Save the PSU identity and notes','/builder/'],['Plan reused components','/upgrade/']],
  { kind:'connector', title:'Identify both ends before reuse', labels:['Exact PSU','Approved cable','Component'], notes:['Model + revision','Manufacturer matrix','Correct device connector'], alt:'A cable-identification chain from exact PSU model through documented cable approval to its component.' },
  { related:'/blog/reuse-pc-components-new-build/', difference:'Cable provenance and PSU-end compatibility, rather than the broader reuse inventory.' }));

articles.push(article(3, 'pwm-vs-dc-case-fan-control', 'PWM vs DC fans: why the control mode matters',
  'Identify fan power, speed reporting and control so a fan curve does not become a guessing game.',
  'Match 3-pin or 4-pin fan control to the motherboard header mode',
  'PWM and DC describe different ways to control a fan. Match the fan and the header’s supported mode, then verify its response; the number shown on a curve is not automatically the resulting RPM.', [
    section('Power, reporting and control have separate jobs', [
      'A conventional 3-pin fan has power, ground and a speed-reporting connection. Voltage-based control changes its supplied voltage. A 4-pin PWM fan adds a control signal. Noctua explains that its 4-pin fan can connect to a 3-pin header, but without PWM it may run at full speed unless that header supports voltage control.',
      'That distinction explains why drawing a fan curve may appear to do nothing. Before blaming the fan, identify the actual header and its selected mode in the exact motherboard manual. The setting may be called DC, voltage or PWM. Do not assume Auto identified an unusual fan or hub correctly.'
    ], ['pwm']),
    section('Do not confuse lighting with motor control', [
      'A lit fan can still have a disconnected motor cable. A spinning fan can have no lighting connection. Identify those systems separately, especially with a hub or a proprietary combined connector. The drawing here shows signal roles, not a universal wiring pinout for every fan or controller.',
      'Before using a splitter, check the header’s documented load limit against the connected fans and the hub instructions. A header label alone is not evidence that it can power an arbitrary number of motors. Do not assume a powered hub reports each fan individually; inspect the hub’s monitoring arrangement.'
    ], ['headers']),
    section('Verify a curve without losing the baseline', [
      'Record the original mode, curve and observed fan behavior. Change one supported setting and allow a repeatable workload to settle. Watch both the reported speed and actual cooling behavior; a valid tachometer reading does not establish a safe temperature or whole-system acoustic quality.',
      'If the fan fails to start reliably, reports implausible speed or behaves differently from the manufacturer’s instructions, return to the known working configuration. Do not keep reducing voltage until a motor stalls or copy another PC’s minimum duty cycle. Save the fan model, header and final supported settings with the build so later maintenance is understandable.'
    ], [], { checklist:['Fan motor connector identified','Lighting connection checked separately','Header mode and current limit documented','Starting behavior and workload response observed'] })
  ], [['Choose and record case fans','/builder/'],['Keep configuration notes','/my-pc/']],
  { kind:'signal', title:'Two routes to fan-speed control', labels:['DC: supplied voltage','PWM: separate control','RPM: reported result'], notes:['Header support required','Fourth control connection','Not the curve percentage'], alt:'Two control paths show voltage regulation and PWM command as different inputs, with RPM as the observed output.' },
  { related:'/blog/compact-quiet-pc-fit-cooling/', difference:'Electrical fan-control modes and verification, rather than case/cooling purchase planning.' }));

articles.push(article(4, '5v-argb-vs-12v-rgb-connectors', '5 V ARGB vs 12 V RGB: check before connecting',
  'Identify lighting voltage, connector type and controller requirements without treating similar RGB labels as interchangeable.',
  'Prevent a 5 V lighting device being connected to the wrong 12 V header',
  '5 V addressable lighting and 12 V RGB lighting are different electrical systems. Match the device, header and controller using their manuals before connecting anything.', [
    section('The voltage label matters more than the colour effect', [
      'ARGB usually describes individually addressable lighting, while conventional RGB changes channels together. More importantly for installation, the familiar desktop arrangements use different voltage and connector systems. ASUS’s header guidance explicitly separates 5 V Addressable Gen2 from 12 V AURA RGB and directs readers to the exact manual.',
      'The connector sketch below is an identification aid, not permission to wire a product from memory. Some lighting ecosystems use proprietary connectors and hubs. Read the actual voltage and connection instructions; a three-pin shape or an RGB product name cannot prove compatibility across every system.'
    ], ['rgb']),
    section('Identify the header on your exact board', [
      'Use the board model and revision to find the manual. MSI’s PRO B760-VC WIFI II guide has separate JRGB and JARGB sections; those are not names you can assume on another board. Find the specified header in the board layout, then confirm the markings on the physical board.',
      'Record the connected devices and the applicable header or hub limit. Do not copy the current or LED allowance from an example board into your own plan. Splitters increase the attached load, and a connector adaptor does not necessarily convert voltage or signalling. If the device documentation and board manual do not agree, leave it disconnected and ask the manufacturer.'
    ], ['b760manual']),
    section('Separate the hub’s power and control paths', [
      'A lighting controller can require external power and a separate motherboard control lead. List each connection instead of assuming one cable provides everything. Also check whether the controller needs its own software or supports motherboard synchronization. The fan motor may have a different cable and control system altogether.',
      'Shut the PC down and follow the manuals’ power-disconnection precautions before changing internal wiring. Do not hot-plug lighting to test an uncertain combination. If you replace a motherboard, revisit this check even when you keep the same case and fans. Save a simple connection record so future troubleshooting starts from known identities.'
    ], [], { checklist:['Device voltage recorded','Header or hub model identified','Polarity and connector orientation checked in manual','Attached load within that exact controller’s documented limit'] })
  ], [['Record fans and controllers','/builder/'],['Save wiring notes','/my-pc/']],
  { kind:'rgb', title:'Similar lighting names, different systems', labels:['5 V addressable','12 V RGB'], notes:['Match device + header','Do not join the systems'], alt:'Separated conceptual connectors labelled 5 V addressable and 12 V RGB, with no connection between them.' },
  { related:'/build-school/', difference:'Voltage-safe lighting identification; not a duplicate general assembly lesson.' }));

articles.push(article(5, 'front-panel-usb-c-header-checklist', 'Will your case’s front USB-C port work?',
  'Trace the case port, internal cable, motherboard header, speed and power requirements before buying an adapter.',
  'Check a case front USB-C connection against the exact motherboard header',
  'A front USB-C socket needs the right internal connection. The port shape does not establish data rate, charging power or display support.', [
    section('Trace the whole path', [
      'Start at the case’s front port and identify the cable inside the chassis. Find the matching header in the motherboard manual. Then check the data specification and any power requirements at both ends. A rear USB-C port does not prove the motherboard has the internal header needed by the case.',
      'A useful example is MSI’s PRO B760-VC WIFI II: its manual calls JUSB1 a USB 3.2 Gen 1 Type-C front-panel connector. That is a board-specific capability, not a claim that every Type-C header has the same speed. An internal header’s shape must not replace its specification.'
    ], ['b760manual']),
    section('Keep data, charging and display separate', [
      'Make three columns in your port plan: data, charging and video. Leave unsupported or undocumented functions marked unknown. Do not infer DisplayPort Alternate Mode from a case’s Type-C socket or assume high-power charging from a modern USB generation.',
      'MSI’s general header guide distinguishes the front Type-C connection from a supplemental power input used on some models for front-port charging. That extra input is not universal. Check whether it exists and is required on the exact board before counting a charging feature or adding a cable.'
    ], ['headers']),
    section('Treat an adapter as another specified component', [
      'If the case and board do not match, compare an appropriate documented adapter, leaving the port unused, or choosing different hardware. Record what the adapter preserves and what it loses. It may change the speed or consume a header needed by another port; a mechanical fit alone does not settle those tradeoffs.',
      'Before ordering, check the cable’s reach and the space around the header with the GPU installed. Avoid forced bends or blocked latches. Keep the exact case cable, board header and adapter model together in the build notes. A working front port should be the result of a documented path, not a surprise discovered after assembly.'
    ], [], { table:table('A front-port connection record', ['Check','What to record'], [['Case','Port and supplied internal cable'],['Motherboard','Exact header and documented data rate'],['Power','Charging support and extra input if required'],['Adapter','Exact model, supported functions and occupied header']]) })
  ], [['Check the case and motherboard together','/builder/'],['Compare motherboard specifications','/compare/']],
  { kind:'connector', title:'The front port is a complete path', labels:['Case USB-C','Internal cable','Board header'], notes:['Socket shape','Exact connector','Data + power specification'], alt:'A front USB-C socket connects through its internal cable to the documented motherboard header.' },
  { related:'/blog/usb-c-speed-charging-display-checklist/', difference:'Internal case-to-motherboard path, rather than external USB-C device/cable selection.' }));

articles.push(article(6, 'front-panel-power-led-connector-map', 'Front-panel power and LED cables: make a connection map',
  'Read the case labels and exact motherboard header diagram before attaching power, reset and indicator leads.',
  'Map a case’s switch and LED leads to the documented motherboard front-panel header',
  'Use the exact motherboard diagram to identify each front-panel connection. The power switch, reset switch, power LED and drive LED have different jobs even when their small plugs look similar.', [
    section('Collect identities before reaching inside the case', [
      'Put the case manual and motherboard manual side by side. Read the labels on the case leads and locate the front-panel header in the board overview. Photograph the labels while they are still visible. A generic internet picture can be mirrored, rotated or simply describe another header.',
      'For a concrete reference, the PRO B760-VC WIFI II manual labels JFP1 switch and LED functions on printed page 32. That page is the source for that board, not a universal numbered pinout. The conceptual drawing in this guide groups functions without pretending to be an installation diagram.'
    ], ['b760manual']),
    section('Switches and indicators are not the same thing', [
      'The case’s power and reset buttons are controls; the LEDs are indicators. Use the manual’s polarity markings for the LED leads. Do not move an unknown plug between headers while the system is powered, and do not confuse the front-panel block with USB, audio or lighting connections.',
      'A combined case plug may be convenient only if its layout matches the board. Check any supplied breakout adapter against both manuals. If a case lacks a reset button or drive indicator, an unused supported function can be normal; it does not mean you need to populate every pin on the header.'
    ], ['headers']),
    section('Verify one symptom at a time', [
      'After finishing the manufacturer’s assembly checks, verify the power button and observe the indicators. A dark LED and a PC that will not power on are different symptoms. Preserve the current connection record before making a correction, and disconnect power as the manual requires before touching internal leads.',
      'Do not bridge unknown pins with a screwdriver as a general troubleshooting shortcut. If labels are missing or the case uses a proprietary block, stop at identification and obtain the correct documentation. A tidy map of function, case label and manual location is more useful than memorizing a pin pattern that may not apply to the next motherboard.'
    ], [], { checklist:['Exact header found in board manual','Case leads mapped by function','LED polarity checked','Unused functions identified deliberately','Power disconnected before changes'] })
  ], [['Keep the board and case plan','/builder/'],['Follow the assembly learning path','/build-school/']],
  { kind:'quadrants', title:'Four functions, one documented map', labels:['Power switch','Reset switch','Power LED','Drive LED'], notes:['Control','Control','Indicator','Indicator'], alt:'Four labelled function groups distinguish case switches from power and drive indicators without specifying universal pin positions.' },
  { related:'/blog/new-pc-no-display-safe-checks/', difference:'Front-panel cable mapping before assembly; existing no-display flow diagnoses a broader boot symptom.' }));

articles.push(article(7, 'sfx-vs-sfx-l-psu-cable-space', 'SFX vs SFX-L: the extra length is only part of the fit check',
  'Compare compact PSU envelopes, mounting support and the cable space that a case specification may not show.',
  'Choose between SFX and SFX-L with an explicit cable-routing envelope',
  'SFX-L keeps the familiar compact width and height but extends the body length. Check the exact case allowance, bracket and cable exit before assuming a supported PSU label means a comfortable installation.', [
    section('Use dimensions with named axes', [
      'CORSAIR’s form-factor explanation gives SFX as 125 mm wide, 63.5 mm high and 100 mm long; SFX-L extends that length to 130 mm. The same-scale illustration below shows that 30 mm difference. It does not depict a real case or certify a complete build.',
      'Copy the exact PSU’s published dimensions into the plan. ATX supplies can have different body lengths, so an ATX label is not a single comparison length. Also check the bracket: a case may accept a compact supply directly, require an adapter, or impose position-specific restrictions.'
    ], ['sfx']),
    section('Body fit and working space are different checks', [
      'Mark the modular connector end in your case layout. Ask where the cable can leave the unit, where it turns, and what occupies the next area: a GPU, radiator, drive cage or front fan. The extra SFX-L body length can consume space that an SFX unit leaves for those connections.',
      'Use only documented or measured dimensions for the actual configuration. Do not invent a universal cable-bend allowance. A listed maximum PSU length may exclude the cable space you need, or depend on moving another bracket. If the manual does not settle the arrangement, keep that clearance unresolved and ask the case manufacturer.'
    ], []),
    section('Compare the complete purchase', [
      'Do not infer acoustic quality from a larger fan or smaller enclosure. If noise is part of the decision, look for comparable testing of the exact PSU and operating load. For the purchase list, include any required bracket and an approved cable set; a compact enclosure does not establish electrical compatibility.',
      'Before final assembly, retain access to the PSU switch, intake and connectors as the case instructions require. Store the chosen mounting location and cable route with the build revision. If the GPU or radiator changes later, review the shared space again rather than treating the original PSU fit decision as permanent.'
    ], [], { table:table('A compact PSU fit record', ['Dimension or condition','Check'], [['Body envelope','Exact model width, height and length'],['Mount','Case bracket and permitted orientation'],['Cable exit','Manufacturer guidance and nearby components'],['Ventilation','Intake and exhaust remain unobstructed']]) })
  ], [['Plan PSU, case and GPU together','/builder/'],['Record unresolved fit checks','/compatibility/']],
  { kind:'dimensions', title:'SFX and SFX-L at the same scale', labels:['SFX · 100 mm long','SFX-L · 130 mm long'], values:[100,130], notes:['Both: 125 mm wide × 63.5 mm high','Body dimensions only; cable space is additional'], alt:'Same-scale PSU side profiles show 100 mm SFX and 130 mm SFX-L bodies; both are 63.5 mm high.' },
  { related:'/blog/compact-quiet-pc-fit-cooling/', difference:'PSU enclosure versus cable-routing envelope, not a broad compact-PC buying guide.' }));

articles.push(article(8, 'gpu-power-cable-side-panel-clearance', 'GPU power-cable clearance: check the side panel too',
  'Plan connector seating, cable exit and panel space without using a universal bend-distance rule.',
  'Document GPU power cable routing beyond the card-body dimensions',
  'A card can fit the expansion slots while its power cable conflicts with the side panel. Check the exact GPU, approved cable and installation instructions together before closing the case.', [
    section('The card body is not the whole occupied space', [
      'NVIDIA’s RTX 5070 family page separates card dimensions, power connections and installation requirements; partner models can differ. That is why a chip name cannot supply the dimensions or cable exit of an ASUS, MSI or other partner card. Find the documentation for the product you will actually receive.',
      'Sketch the connector location and the space between that edge of the card and the closed panel. Record the cable’s permitted routing from its manufacturer. A generic 3D preview can help you notice the question, but it cannot establish the cable’s installed envelope or certify a bend you have not measured.'
    ], ['gpu5070']),
    section('Separate electrical approval from mechanical routing', [
      'First identify the supported power connection and PSU cable family. Then check the physical routing. A cable can be documented for a PSU yet still lack space in the chosen chassis. Conversely, an adapter that appears to solve a bend is not acceptable without explicit product compatibility.',
      'Do not use the side panel to force a connector or cable into position. Follow the exact installation instructions for insertion, seating and strain relief. Avoid borrowing a bend distance from another cable, an older GPU or an uncited diagram. Where guidance is missing or contradictory, preserve the unresolved task and ask the relevant manufacturer.'
    ], ['cables']),
    section('Make the check repeatable after a swap', [
      'Save the GPU part number, PSU model, cable model and case layout with a clear photograph of the completed routing where safe. Do not publish serial numbers or private receipts merely to share the build. Record whether the panel was checked in its final closed configuration.',
      'A new GPU, vertical mount or radiator can change the space and cable tension, so recheck after those swaps. Stop using damaged, discoloured or loose connections and seek manufacturer support. This guide makes no claim that a particular connector revision eliminates installation risk or that visual inspection proves the complete electrical system healthy.'
    ], [], { checklist:['Exact partner GPU identified','PSU-side cable approved','Seating checked to product instructions','Closed-panel space verified','No pressure used to force routing'] })
  ], [['Plan the exact card and case','/builder/'],['Open the fit checks','/compatibility/']],
  { kind:'clearance', title:'Body fit is only one boundary', labels:['GPU body','Power connector','Closed side panel'], notes:['Published dimensions','Cable maker’s routing guidance','Must not force the cable'], alt:'Conceptual card, power connector and side-panel boundary show that cable exit adds space beyond the GPU body.' },
  { related:'/blog/will-a-graphics-card-fit-my-case/', difference:'Dedicated connector/panel routing task instead of general GPU length, thickness and radiator fit.' }));

articles.push(article(9, 'xmp-expo-profiles-before-and-after', 'XMP and EXPO: record the default before changing the profile',
  'Understand what a memory profile changes, verify support and preserve a working baseline before enabling it.',
  'Make an informed, reversible memory-profile decision rather than copy an unsupported setting',
  'XMP and EXPO are memory overclocking profile systems. A kit’s advertised profile is not the same as the CPU’s standard memory specification or proof that your complete configuration is stable.', [
    section('A profile is a configuration, not extra capacity', [
      'Intel describes XMP as predefined memory-overclocking profiles; AMD describes EXPO as its memory-overclocking technology. Both still depend on compatible hardware and firmware. A profile can change operating parameters, but it does not create more RAM capacity or upgrade DDR generation.',
      'Separate the module’s default/SPD operation, advertised profile and processor’s published support. Do not compare a profile transfer rate with a standard support figure as though they are the same guarantee. Manufacturer warranty conditions can be affected by operating outside specifications; check the terms for the actual parts.'
    ], ['xmp','expo']),
    section('Save a baseline that can be restored', [
      'Record CPU, board revision, firmware, complete memory-kit number, module count and occupied slots. Observe the detected capacity and current settings before changing anything. Keep a photograph of the original firmware configuration and the exact board’s supported reset procedure.',
      'Establish whether the PC is reliable at its existing settings using your normal work. If it already crashes or loses data, a faster profile is not the first repair. Resolve that problem before using it as the baseline for an experiment. Back up important work and avoid changing unrelated CPU or GPU settings at the same time.'
    ], []),
    section('Validate the result for your workload', [
      'If you choose a documented profile, follow the board instructions and allow its stated training process. Confirm detected capacity, configuration and behavior after restart. Booting once is not a stability certificate. Check the workloads you actually use and retain the baseline for comparison.',
      'If problems begin, use the documented route back to the known configuration. Do not add voltage or copy timings from another kit as a generic fix. A profile that works with two modules may not work after adding more. Save the final result as an observed configuration, including failures, rather than asserting that every kit with the same speed label will behave identically.'
    ], [], { checklist:['Default settings recorded','Exact CPU/board/kit support checked','Warranty and recovery procedure understood','Only one change made','Actual workload checked after the change'] })
  ], [['Record your memory configuration','/builder/'],['Keep the previous revision','/my-pc/']],
  { kind:'lanes', title:'Three different memory records', labels:['Default operation','Profile request','Observed result'], notes:['Working baseline','XMP or EXPO parameters','Your configuration and workload'], alt:'Memory configuration progresses from saved default through optional profile to an observed result, without a stability guarantee.' },
  { related:'/blog/how-to-choose-gaming-ram/', difference:'Reversible profile workflow, not a repeated memory compatibility/QVL purchase guide.' }));

articles.push(article(10, 'two-vs-four-ddr5-modules', 'Two DDR5 sticks vs four: capacity and supported speed',
  'Understand channels, ranks and module count before filling the remaining slots or mixing memory kits.',
  'Compare two- and four-module DDR5 configurations using exact CPU and board evidence',
  'Four DIMM slots do not mean four memory channels or the same supported speed with every slot occupied. Check the exact CPU’s configuration table and the board’s kit support before adding modules.', [
    section('Count modules, channels and ranks separately', [
      'A module is a physical DIMM. A channel is a memory-controller connection. Rank is another organization within the module. These labels answer different questions; four sticks on a dual-channel desktop do not turn it into a four-channel workstation.',
      'AMD’s Ryzen 9 9950X provides a useful exact example: it lists two channels and DDR5-5600 for its 2×1R/2×2R entries, versus DDR5-3600 for 4×1R/4×2R. Those are published standard limits for that CPU, not measured overclocking outcomes or limits to apply to every Ryzen model.'
    ], ['cpu9950']),
    section('Another kit is another configuration', [
      'A second kit with a similar label is not automatically the first kit with more capacity. Kingston specifically does not support mixing its FURY overclocking kits. Preserve the actual kit number, module count and validated arrangement when comparing options.',
      'Price two alternatives: an adequately sized matched two-module kit, and a supported four-module arrangement when one is actually documented. Include the opportunity to keep the existing setup if capacity is sufficient. Do not treat empty slots as a defect or buy more RAM solely to fill the board visually.'
    ], ['nonbinary']),
    section('Plan capacity first, then the supported arrangement', [
      'Record the workload that needs more memory and how much capacity it actually requires. Check maximum total capacity, per-module support, slot order and firmware requirements. Capacity compatibility and an overclocking profile are separate tasks; passing one does not settle the other.',
      'After installation, verify the detected total and operating configuration before performance comparisons. Keep training or boot failures in the record and return to the documented baseline when necessary. The best arrangement is one supported by the exact platform and useful for the workload, not simply the one with the greatest module count.'
    ], [], { table:table('Do not interchange these labels', ['Label','Meaning'], [['Four slots','Physical places on the board'],['Two channels','Memory-controller topology in this CPU example'],['1R or 2R','Module rank organization'],['XMP/EXPO profile','Requested operating configuration; separate validation']]) })
  ], [['Compare complete memory arrangements','/builder/'],['Keep or replace an existing kit','/upgrade/']],
  { kind:'memory', title:'Four slots can still be two channels', labels:['Channel A','Channel B','A1','A2','B1','B2'], notes:['Conceptual dual-channel layout','Use your board manual for population order'], alt:'A conceptual four-DIMM board groups two slots under channel A and two under channel B; it does not specify a universal installation order.' },
  { related:'/blog/32gb-vs-64gb-ram-workloads/', difference:'Electrical population and support tradeoffs; existing article decides workload capacity.' }));

articles.push(article(11, '24gb-48gb-ddr5-module-support', '24 GB and 48 GB DDR5 modules: check the platform, not the pattern',
  'Understand non-binary module capacities, kit totals and firmware support before choosing a 48 GB or 96 GB kit.',
  'Understand 24/48 GB DIMMs and check their exact kit/platform support',
  '24 GB and 48 GB modules are legitimate DDR5 capacities. They still need explicit platform and firmware support; the unusual number is neither a compatibility problem by itself nor a guarantee of support.', [
    section('Read module capacity and kit capacity separately', [
      'Kingston explains that 24 Gbit DRAM enables module capacities including 24 GB and 48 GB. Gbit describes an individual chip density; GB describes the module’s capacity. A 2×24 GB kit totals 48 GB, while a 2×48 GB kit totals 96 GB. Those are simple sums, not performance ratings.',
      'A listing that says only “48 GB DDR5” is ambiguous for planning. Establish whether it is one 48 GB module or a two-module 48 GB kit, and record the exact part number. The number of slots consumed matters when comparing future capacity options.'
    ], ['nonbinary']),
    section('Firmware support belongs in the purchase check', [
      'Open the exact CPU specification and motherboard support resources. Check per-module capacity, total capacity, module type, kit arrangement and required firmware. A physical DDR5 slot or a high advertised maximum capacity does not settle every combination.',
      'Avoid converting an old platform table into a permanent support list. Firmware and validation records can change, while different board revisions can have separate support. Save the document version or observation date with the kit you intend to buy. When support is missing, label it unresolved rather than assuming either compatibility or a proven conflict.'
    ], []),
    section('Compare useful capacity, not novelty', [
      'Make a capacity plan from the work you do. If the choice is between 32, 48, 64 or 96 GB, include exact supported kit prices when available and leave missing prices unknown. Do not assume a non-binary kit has a special latency or gaming benefit because of its capacity.',
      'Prefer a documented matched configuration over combining unrelated kits to reach a desired total. Kingston’s guidance against mixing FURY overclocking kits applies even when arithmetic totals look attractive. After installing, verify the detected capacity and the actual operating settings; a successful boot is not comprehensive workload validation.'
    ], ['nonbinary'], { table:table('Capacity arithmetic only', ['Arrangement','Total capacity','Slots used'], [['2 × 24 GB','48 GB','2'],['2 × 48 GB','96 GB','2'],['4 × 24 GB','96 GB','4; separately verify support']]) })
  ], [['Record exact memory-kit identity','/builder/'],['Compare keeping and replacing memory','/upgrade/']],
  { kind:'capacity', title:'Same total, different arrangement', labels:['2 × 24 GB = 48 GB','2 × 48 GB = 96 GB','4 × 24 GB = 96 GB'], values:[48,96,96], notes:['Capacity arithmetic only','Module count and support remain separate'], alt:'Three module arrangements show 48 GB and two different 96 GB totals without implying equal support or performance.' },
  { related:'/blog/understanding-pc-memory/', difference:'Non-binary chip/module/kit capacity and support identification, rather than general RAM selection.' }));

articles.push(article(12, 'm2-2230-2242-2280-22110-sizes', 'M.2 SSD sizes: 2230, 2242, 2280 and 22110',
  'Use a same-scale length diagram to check the slot, mounting point, interface and heatsink envelope.',
  'Decode M.2 length numbers and check the actual mounting position',
  'The digits describe physical dimensions: 2280 means 22 mm wide and 80 mm long. Length is one check; interface, keying, mounting and cooling space still have to match.', [
    section('Decode the number before comparing drives', [
      'Kingston lists common SSD module sizes as 2230, 2242, 2260, 2280 and 22110: 22 mm wide with lengths of 30, 42, 60, 80 and 110 mm. The original same-scale diagram below compares those lengths without making claims about capacity or speed.',
      'Do not read a longer module as automatically faster or more spacious. Controller, NAND, capacity and interface are separate specifications. Also distinguish the bare PCB dimensions from a product supplied with a heatsink; the installed envelope can be larger.'
    ], ['m2']),
    section('A supported length needs a supported mounting point', [
      'Find the exact M.2 socket in the motherboard or device manual. Record which lengths that socket supports and the correct standoff or latch position. A long cavity does not establish a usable mounting point for a shorter drive. Do not bend a module down to a misplaced standoff or improvise a screw arrangement.',
      'Keep motherboard sockets distinct. One board can have several M.2 positions with different interfaces, lane sharing or physical restrictions. A Wi-Fi M.2 socket is not an SSD socket just because both names contain M.2. Check the exact socket specification rather than purchasing from the shape alone.'
    ], []),
    section('Finish the interface and cooling checks', [
      'Verify SATA or PCIe/NVMe support and keying for the selected slot. Record any slot-sharing condition from the exact manual. Then inspect clearance for the device’s permitted single- or double-sided module and any required cooling assembly. Do not stack a factory heatsink underneath a board cover unless the manufacturers explicitly support it.',
      'Before ordering, put the drive part number, length, selected slot and mounting hardware into the build notes. If the drive is replacing an existing system disk, plan the data migration separately. Correct dimensions do not prove boot support, preserve your files or establish the actual copy speed.'
    ], [], { checklist:['Exact socket and supported lengths','Correct standoff/latch position','Supported interface and key','Installed heatsink/side clearance','Any lane-sharing condition'] })
  ], [['Choose storage and motherboard together','/builder/'],['Inspect slot-sharing evidence','/compatibility/']],
  { kind:'m2', title:'M.2 lengths at the same scale', labels:['2230','2242','2260','2280','22110'], values:[30,42,60,80,110], notes:['All shown 22 mm wide','Lengths in millimetres; interface not implied'], alt:'Same-scale 22 mm-wide M.2 module silhouettes measure 30, 42, 60, 80 and 110 mm long.' },
  { related:'/blog/choosing-an-ssd/', difference:'Dimension decoding and mounting-point identification; general SSD guide covers broader selection.' }));

articles.push(article(13, 'ssd-tbw-warranty-not-failure-date', 'SSD TBW: an endurance rating is not a failure countdown',
  'Read exact-capacity warranty terms and write observations without turning TBW into a promised lifespan.',
  'Interpret TBW, warranty limits and actual writes without predicting a drive failure date',
  'TBW is a documented write-endurance measure used in some warranty conditions. It is not a clock that predicts the day an SSD will fail, and a warranty is not a backup.', [
    section('Read the exact model and capacity terms', [
      'Samsung’s warranty resource separates model/capacity conditions, elapsed time and written-data limits. Read the entry for the exact drive rather than borrowing a figure from a larger capacity in the same family. A warranty duration and TBW condition must be considered together.',
      'Do not convert the warranty limit into a guarantee that a drive cannot fail earlier, or a claim that it must fail immediately afterward. Warranty remedies, exclusions and data responsibilities are separate terms. This guide does not establish local statutory rights or promise data recovery.'
    ], ['ssdwarranty']),
    section('Use a write log for planning, not fortune-telling', [
      'If the vendor’s supported tool exposes total host writes, record the value, unit, tool version and date. Take another observation after a representative period. Preserve both raw values so that a GB/TB conversion or counter reset is not mistaken for a change in workload.',
      'A calculated daily write average describes that interval only. A video-editing project, backup job or cache policy can change it substantially. Do not multiply one busy day into a promised multi-year lifespan. If the tool reports health warnings, back up and follow the vendor’s support path instead of trusting a reassuring remaining-percentage graphic.'
    ], []),
    section('Compare drives around the workload and recovery plan', [
      'For a write-heavy purchase, compare the exact endurance terms alongside interface support, usable capacity and the application’s real storage behavior. A larger TBW number does not prove faster random access or better game FPS. Keep the warranty claim and the performance claim in separate columns.',
      'Maintain a tested backup regardless of the rating. Store the invoice, part number and serial privately for support; share only the information needed to identify the public product. If your data matters more than the device, prioritize recovery planning before replacing a drive solely because its counter looks old.'
    ], [], { table:table('Three different records', ['Record','What it can tell you'], [['Warranty/TBW condition','Documented coverage conditions for an exact SKU'],['Observed writes','What the counter recorded during a named interval'],['Backup test','Whether your recovery procedure works; not SSD health']]) })
  ], [['Record the exact SSD','/builder/'],['Plan capacity separately','/tools/storage-capacity-planner/']],
  { kind:'lanes', title:'Endurance, coverage and recovery are separate', labels:['Write counter','Warranty terms','Backup copy'], notes:['Observed history','Exact SKU conditions','Recovery path'], alt:'Separate records for observed writes, warranty conditions and backup recovery show why TBW is not a failure countdown.' },
  { related:'/blog/ssd-transfer-time-advertised-speed/', difference:'Endurance and coverage interpretation replaces the overlapping proposed PCIe-speed topic.' }));

articles.push(article(14, 'ssd-missing-bios-detection-checks', 'SSD not showing in BIOS? Separate detection from booting',
  'A safe diagnostic sequence for a missing SSD, controller visibility and an absent boot entry.',
  'Distinguish physical SSD detection from boot-entry and operating-system visibility problems',
  'First establish where the drive is missing: firmware device inventory, boot menu, operating system or a vendor utility. Those are different observations and do not justify the same repair.', [
    section('Write down the actual symptom', [
      '“Not in BIOS” can mean the drive is absent from a storage list or simply absent from the boot menu. A detected blank SSD need not contain a bootable operating system. Photograph the relevant screen and record the drive part number, socket or SATA port and any recent hardware changes.',
      'Samsung’s troubleshooting guidance covers connection, system support and detection limitations. It also notes that vendor-tool visibility can differ behind controllers such as RAID. A drive missing from Magician is therefore not, by itself, proof that the firmware cannot detect it.'
    ], ['ssdTrouble']),
    section('Check the documented path with power disconnected', [
      'Follow the exact device’s safety and handling instructions before reseating anything. For SATA, identify the data and power paths. For M.2, verify the supported interface, mounting and selected socket. Consult the motherboard’s storage and sharing notes instead of moving hardware repeatedly without a record.',
      'If a previously working drive disappears, preserve that history. Stop experimentation when the drive contains important unbacked-up data or shows physical damage. Repeated repair attempts can complicate recovery; obtain appropriate support rather than treating every missing drive as a blank installation target.'
    ], []),
    section('Avoid destructive fixes for an identification problem', [
      'Do not initialize, format or erase a drive just to make it visible in a list. Do not switch SATA/RAID modes blindly; a mode change can alter the path the installed operating system expects. A firmware update is also a separate, model-specific procedure with its own prerequisites.',
      'Once the device is identified, address boot configuration or operating-system setup using the relevant official instructions. Keep detection, bootability and data accessibility as separate outcomes. A useful support report includes the exact SSD, board, firmware, connection and screenshots—not just “NVMe broken.”'
    ], [], { checklist:['Location of missing-drive symptom recorded','Exact drive and socket interface checked','Connection inspected under manual precautions','Data value and backup status assessed','No initialization or mode switch used as a guess'] })
  ], [['Record the storage arrangement','/builder/'],['Review the first-boot path','/build-school/']],
  { kind:'flow', title:'Where is the drive missing?', labels:['Firmware inventory','Boot entry','Operating system','Vendor utility'], notes:['Physical device path','Bootable installation','OS/controller path','Tool support'], alt:'Four separate visibility layers distinguish SSD detection, boot entry, operating-system access and vendor-tool recognition.' },
  { related:'/blog/new-pc-first-boot-setup-checklist/', difference:'Storage-specific detection diagnosis rather than repeating the full first-boot checklist.' }));

articles.push(article(15, 'ssd-thermal-throttling-how-to-check', 'Is your SSD thermal-throttling? Check more than one speed drop',
  'Separate heat-related slowdown from cache, workload and connection limits with a repeatable observation record.',
  'Investigate a suspected SSD heat slowdown without diagnosing it from throughput alone',
  'Thermal throttling can reduce SSD performance during sustained work, but a falling transfer rate does not prove it. Record temperature, workload and timing together before changing cooling.', [
    section('A speed graph is a symptom, not a diagnosis', [
      'Kingston describes how heat can trigger thermal throttling under sustained NVMe work and how airflow or a suitable heatsink can affect operating conditions. That establishes a mechanism, not a universal temperature threshold or a promised cooling improvement for your drive.',
      'A transfer also depends on the source, destination, file pattern, cache behavior and other activity. Record those conditions before attributing a dip to temperature. Do not compare a sustained write of many files with a short sequential read specification as though they measure the same thing.'
    ], ['ssdheat']),
    section('Create a useful observation record', [
      'Use the drive manufacturer’s supported monitoring tool where available. Record exact drive/firmware, installed cooling, ambient conditions, temperature sensor name and the workload. Save the original result before altering the heatsink or case. If the task writes substantial data, ensure the test is justified and the files are backed up.',
      'Observe whether the slowdown and temperature behavior recur under the same conditions. A sensor threshold needs the exact model’s documentation; do not copy another SSD’s limit. A simultaneous change can support further investigation, but it still does not rule out every other bottleneck.'
    ], []),
    section('Inspect cooling without improvising it', [
      'Check the installation instructions for the SSD and motherboard cooling assembly. Confirm the correct pad arrangement and protective-film removal where specified. Do not stack incompatible heatsinks, remove labels or choose thermal-pad thickness from a random example. A larger metal cover is not proof of proper contact.',
      'After a documented change, repeat the same observation and keep both results. If errors, disconnects or health warnings appear, prioritize backup and manufacturer support. The illustrative graph here teaches how to record a sequence; it contains no measured drive data and cannot establish a guaranteed benefit from any heatsink.'
    ], [], { table:table('Keep these conditions with the result', ['Field','Why it matters'], [['Workload and duration','Short bursts and sustained transfers differ'],['Sensor and temperature','Names and thresholds differ by model'],['Cooling configuration','Contact and airflow are part of the setup'],['Other activity','The drive may not be the limiting device']]) })
  ], [['Record SSD and cooling choices','/builder/'],['Understand copy-speed limits','/blog/ssd-transfer-time-advertised-speed/']],
  { kind:'tracks', title:'Record heat and transfer behavior together', labels:['Workload timeline','Temperature observation','Transfer-rate observation'], notes:['Illustrative sequence only','Correlation requires a controlled follow-up'], alt:'Three aligned conceptual timelines show recording workload, temperature and transfer behavior together; no benchmark values are plotted.' },
  { related:'/blog/ssd-transfer-time-advertised-speed/', difference:'Heat diagnosis and cooling follow-up, rather than a duplicate advertised-throughput explanation.' }));

articles.push(article(16, 'ddr5-on-die-ecc-vs-system-ecc', 'DDR5 on-die ECC is not the same as system ECC',
  'Separate internal DRAM correction, ECC UDIMMs and registered memory before shopping for workstation RAM.',
  'Prevent on-die ECC or an ECC label from being mistaken for complete platform support',
  'DDR5’s on-die ECC corrects errors inside a DRAM chip. It does not make every DDR5 desktop module an end-to-end ECC memory system or make registered memory compatible with an ordinary desktop.', [
    section('Ask where correction operates', [
      'Kingston explains that on-die ECC does not correct errors on the bus between the module and memory controller. System-level ECC needs the relevant memory type and platform support. These are different scopes of protection, so “DDR5 has ECC” is an incomplete buying answer.',
      'The schematic below shows the boundary deliberately: correction inside a chip is not a protected path all the way to the CPU. It does not claim that any implementation prevents every corruption or replaces backups, application checks or a recovery plan.'
    ], ['ddr5']),
    section('Module type is a separate compatibility field', [
      'Read UDIMM, ECC UDIMM and RDIMM as distinct identities. A server-memory listing is not a bargain substitute merely because it has the same DDR generation and attractive capacity. Check the processor, board and firmware support for the exact type and kit.',
      'AMD’s Ryzen 9 9950X, for example, specifies DDR5 UDIMM and says ECC support requires motherboard support. That conditional statement is not support for arbitrary registered server memory. Do not copy one CPU’s ECC field into an approval for another processor or for a motherboard that lacks the necessary implementation.'
    ], ['cpu9950']),
    section('Document a complete evidence chain', [
      'For a workstation purchase, record the module part number and type, CPU support, motherboard support and any firmware condition. If the operating system exposes an ECC status, keep the actual verification method with the record; a product-box claim does not prove the installed correction path is active.',
      'Choose memory around the workload’s reliability requirements and the supported platform. This guide does not measure error rates or claim a gaming advantage. If the seller’s description conflicts with the part-number datasheet, resolve the identity before ordering rather than using the most reassuring label.'
    ], [], { checklist:['On-die and system-level claims separated','Exact module type identified','CPU and motherboard support both documented','Installed verification method recorded','Backup strategy remains separate'] })
  ], [['Compare exact platform specifications','/compare/'],['Record your workstation parts','/builder/']],
  { kind:'ecc', title:'The correction boundary matters', labels:['Inside DRAM','Module-to-controller path','CPU + board support'], notes:['On-die ECC scope','Not protected merely by on-die ECC','Required for system ECC'], alt:'A DRAM-chip boundary encloses on-die correction while the separate path to the CPU is labelled as requiring system-level ECC support.' },
  { related:'/blog/how-to-choose-gaming-ram/', difference:'Replaces the proposed duplicate QVL article with a distinct ECC scope and module-type decision.' }));

articles.push(article(17, 'freesync-gsync-compatible-vrr-path', 'FreeSync, G-SYNC Compatible and VRR: check the whole path',
  'Match GPU, display input, cable and settings instead of treating a variable-refresh badge as a universal promise.',
  'Identify a supported variable-refresh path for the exact GPU and display input',
  'Variable refresh changes when a display refreshes to follow frame delivery within its supported behavior. It does not create more game frames or guarantee that every kind of stutter disappears.', [
    section('Certification and operation answer different questions', [
      'AMD FreeSync and NVIDIA G-SYNC Compatible describe vendor programs built around variable-refresh displays. NVIDIA says its Compatible label identifies a VRR display it has validated. That is different from assuming any monitor with a vaguely similar feature name works identically over every input.',
      'Read the exact display model’s supported range and inputs alongside the GPU’s requirements. HDMI and DisplayPort can have different restrictions on the same monitor. Preserve those differences rather than reducing the purchase to a badge or an unspecified maximum refresh number.'
    ], ['gsync','freesync']),
    section('Trace the connection and settings', [
      'List the GPU output, cable or adapter, display input and required settings at both ends. Check the display’s on-screen menu and the supported driver control panel. A cable connected to a different port, or a dock with different capabilities, changes the path you are evaluating.',
      'Do not treat a successful high-refresh signal as proof that variable refresh is active. Use the monitor and driver’s supported indicators or test procedure. Record the operating mode you checked, including window/full-screen behavior where relevant, so later troubleshooting is not based on an assumed setting.'
    ], []),
    section('Keep rendering performance separate', [
      'A game can still deliver uneven work because of shader compilation, CPU stalls or another problem. VRR addresses display timing; it is not a diagnosis for all of those mechanisms. Evaluate game performance with matching settings and evidence rather than expecting the display feature to repair the renderer.',
      'Before buying, compare the complete supported path and your intended games. Leave an undocumented range or adapter behavior unresolved. The animation proposed by this guide is a timing explanation only: it does not reproduce a monitor measurement, quantify input latency or establish that one certification is always the better purchase.'
    ], [], { checklist:['Exact monitor and GPU','Supported input and range','Cable/adapter capability','Display and driver settings','Observed active mode recorded'] })
  ], [['Compare display and GPU choices','/compare/'],['Inspect game evidence separately','/performance/']],
  { kind:'timing', title:'Frame delivery and display timing', labels:['New frame ready','Fixed refresh','Variable refresh'], notes:['Illustrative timing, not measured latency','VRR follows supported delivery; it does not generate frames'], alt:'Conceptual timing tracks compare irregular frame readiness with fixed and variable display refreshes.' },
  { related:'/blog/choose-display-target-game-evidence/', difference:'VRR connection/activation task; existing guide chooses an overall display target.' }));

articles.push(article(18, 'displayport-hdmi-1440p-refresh-checklist', 'DisplayPort or HDMI for 1440p high refresh? Read the mode table',
  'Check exact device modes, bit depth, compression and cable certification instead of buying from a connector-version slogan.',
  'Choose a supported 1440p high-refresh connection from exact monitor and GPU specifications',
  'Use the connection that both devices support for your exact resolution, refresh rate and colour mode. The HDMI or DisplayPort shape alone does not establish that mode.', [
    section('Write the desired mode completely', [
      '“1440p” leaves important questions unanswered. Record resolution, refresh rate, colour depth, HDR requirements and any compression condition. Then look for that mode in the monitor’s documentation and the GPU output specification. A mode available on one input may differ on another.',
      'HDMI’s current specification overview and VESA’s cable guidance make the complete link relevant. Do not assume a version label supplies every feature, or that an old cable article covers all newer modes. Read the devices’ current mode tables rather than calculating a universal limit from the socket.'
    ], ['hdmi','dp']),
    section('Treat adapters and docks as links in the chain', [
      'If an adapter, dock or extension is involved, identify its exact supported conversion and limits. A cable’s two connector shapes do not prove a direction of conversion or support for VRR, HDR or the desired refresh rate. Prefer a simpler documented path when it solves the actual use case.',
      'Check an appropriate cable certification and manufacturer listing for the needed capability. Do not use vague “gaming cable” wording as evidence. Save the cable model with the device mode you intend to run so a later replacement can be evaluated against a requirement rather than a marketing name.'
    ], []),
    section('Verify the negotiated mode after connecting', [
      'Inspect the operating system’s advanced display information and the monitor’s own information screen. Confirm the selected refresh, resolution and colour settings instead of assuming the maximum advertised on the box became active. If a desired mode is unavailable, recheck the input and link before replacing the GPU.',
      'A supported signal mode is not measured game FPS. Keep rendering evidence separate, and do not interpret an interface bandwidth headline as end-to-end latency. This checklist is useful even when the final answer is to keep an existing cable: the aim is a documented working mode, not purchasing the newest connector revision.'
    ], [], { table:table('A complete display-mode requirement', ['Field','Record'], [['Image','Resolution and refresh'],['Colour','Bit depth and HDR requirement'],['Link','Output, cable/adapter and input'],['Conditions','Compression or input-specific limitations'],['Verification','Actual negotiated mode after setup']]) })
  ], [['Compare display specifications','/compare/'],['Keep FPS separate from refresh','/performance/']],
  { kind:'connector', title:'Every link must support the desired mode', labels:['GPU output','Cable / adapter','Display input'], notes:['Exact mode support','Certified capability','Input-specific mode table'], alt:'A display connection path shows GPU, cable or adapter and monitor input all needing support for the requested mode.' },
  { related:'/blog/choose-display-target-game-evidence/', difference:'Exact 1440p signal-mode selection, distinct from setting a monitor/gaming target.' }));

articles.push(article(19, 'record-game-frame-times-presentmon', 'Record game frame times: a repeatable capture worksheet',
  'Plan a comparable PresentMon capture with settings, scene, tool version and metric limitations recorded.',
  'Create a reproducible personal frame-time capture without claiming a universal benchmark',
  'A useful capture needs a repeatable scene and a complete settings record. A frame-time file without its context cannot establish why one PC, driver or setting performed differently.', [
    section('Choose the question before recording', [
      'Decide what you are comparing: a settings change, an upgrade or an intermittent hitch. Choose a repeatable route or built-in sequence and define what is excluded, such as loading screens. Record game version, resolution, quality settings, upscaling, frame generation, CPU/GPU and driver.',
      'PresentMon’s official project describes Windows capture tools that use presentation events and can export per-frame data. It also documents metric limitations. Use the current official release and documentation; do not assume every similarly named overlay measures the same point in the pipeline.'
    ], ['presentmon']),
    section('Preserve comparable runs', [
      'Keep the same scene, duration and background conditions for the comparison. Record whether the run is a first launch or follows a warm-up. Keep multiple raw captures when practical so a single unusual run does not become the entire conclusion. Do not delete slow frames merely because they make a graph look untidy.',
      'Write down the capture tool’s version and selected metric. Presented-frame timing, display timing and input latency are different measurements. Frame generation introduces another distinction; identify whether a reported rate includes generated output before comparing it with native rendering.'
    ], ['presentmon']),
    section('Explain the chart before choosing a part', [
      'A frame-time spike means a frame interval was longer in the recorded metric. It does not identify the responsible component by itself. Use the timing and repeatability to guide a follow-up, and inspect the source context before turning the result into a purchase recommendation.',
      'The original chart here contains constructed teaching values, not a tested GPU result. If you later publish your own capture, include the conditions and calculation definition with the raw evidence you are entitled to share. Do not turn one personal run into a claim that every system with the same GPU will achieve the same FPS.'
    ], [], { checklist:['Question and repeatable scene','Hardware, game/driver versions and settings','Capture version and exact metric','Raw runs retained','Generated versus native output identified','No component blame from one spike alone'] })
  ], [['Inspect the site’s performance evidence','/performance/'],['Record the tested configuration','/builder/']],
  { kind:'frame', title:'Frame-time spikes need context', labels:['Illustrative frame intervals','Longer interval','Repeat the same scene'], values:[12,13,12,14,36,13,12,15,12,13], notes:['Constructed example; not a GPU benchmark','Time per frame, not a diagnosis'], alt:'A constructed sequence of frame intervals contains one longer interval, labelled as an illustration rather than benchmark data.' },
  { related:'/blog/read-hardware-benchmarks-test-conditions/', difference:'Practical personal capture protocol replaces a second general FPS/1%-low explainer.' }));

articles.push(article(20, 'shader-cache-first-run-stutter', 'First-run stutter: why shader-cache state belongs in the test notes',
  'Separate cold and warm runs and preserve evidence before clearing caches or blaming storage.',
  'Recognize shader-cache state as a testing condition without diagnosing every hitch as compilation',
  'A game’s first run and a later run can do different work. Record cache and launch conditions before comparing them, and do not clear caches as a universal stutter fix.', [
    section('Compilation and rendering are different stages', [
      'AMD GPUOpen documents a driver-side stage that compiles pipeline information for a particular GPU, and explains that caching can avoid repeating some work. A cold-cache run can therefore differ from a later run. That is a mechanism to investigate, not proof of the cause of a particular game’s hitch.',
      'The developer documentation describes experiments for diagnosis. It is not a consumer instruction to disable caches, delete folders or import someone else’s cache. Avoid turning a developer switch into a generic optimization tip.'
    ], ['shader']),
    section('Preserve the state you are trying to understand', [
      'Record whether the issue began after a game or driver update, happens only at a new location, or recurs on a repeated route. Keep the same quality settings and capture conditions. Note whether an official in-game compilation step finished before the run.',
      'Do not repeatedly erase caches between observations unless your question specifically requires a documented cold-state test and you understand the product instructions. Otherwise, you can recreate first-run work and mistake the resulting slowdown for a persistent hardware limit.'
    ], []),
    section('Compare explanations instead of jumping to an upgrade', [
      'If a second pass becomes smoother, that observation supports further investigation but does not identify compilation uniquely. Asset loading, background work and other changing conditions can differ too. Use repeatable frame-time capture and official game support notes to narrow the question.',
      'If the problem repeats, record its location and conditions and report it through the game’s real support route. Do not buy a faster SSD or CPU from a single spike, and do not install untrusted cache packages. A useful result can be “cause still unresolved” with a precise reproducible sequence; it is more actionable than an unsupported bottleneck percentage.'
    ], [], { table:table('Keep these runs distinct', ['Run state','Record'], [['First launch after change','Game/driver versions and compilation state'],['Repeated route','Same settings, scene and capture duration'],['Persistent hitch','Exact location, repeatability and other observations']]) })
  ], [['Use evidence-led game performance','/performance/'],['Plan an upgrade after diagnosis','/upgrade/']],
  { kind:'flow', title:'Cold and warm runs are different test conditions', labels:['New pipeline work','Cache available','Repeat scene','Compare conditions'], notes:['May require compilation','Can avoid repeated work','Hold other settings steady','Not a universal stutter diagnosis'], alt:'A pipeline diagram distinguishes new compilation work from cached reuse and a controlled repeated-scene comparison.' },
  { related:'/blog/graphics-driver-update-rollback-checklist/', difference:'Shader-cache test-state documentation replaces another broad frame-generation explainer.' }));

articles.push(article(21, 'gpu-two-three-monitors-output-plan', 'Choosing a GPU for two or three monitors: map the outputs',
  'Plan connectors, simultaneous modes, adapters and rendering workload without assuming all port maximums combine.',
  'Verify a multi-monitor connection plan for exact displays and GPU outputs',
  'Count supported simultaneous displays and map each exact monitor mode to a real output. Four physical sockets do not prove every maximum resolution and refresh combination works at once.', [
    section('Make a row for every display', [
      'Record monitor model, desired resolution and refresh, required input, HDR/VRR needs and cable. Mark which screen runs games and which shows desktop work. Separate this connection plan from the rendering workload; driving a desktop screen is not the same question as rendering a game across all screens.',
      'NVIDIA’s RTX 5070 family specification lists reference connections and up-to-four-display support with qualifications. That is not a universal simultaneous maximum-mode promise. Confirm the exact partner card’s ports and read the applicable display-support footnotes before ordering.'
    ], ['gpu5070']),
    section('Treat each adapter as a specified part', [
      'Map a specific output to each monitor input. If a dock, daisy chain or adapter is involved, document its direction, supported modes and limits. A spare connector does not prove the adapter can provide the desired refresh or preserve a variable-refresh feature.',
      'Use the manufacturers’ supported combinations rather than adding individual maximum bandwidth headlines together. If the documentation does not cover your exact combination, ask the vendor and keep it unresolved. Do not advertise an untested multi-screen setup as a verified property of the GPU chip.'
    ], []),
    section('Verify the final desktop arrangement', [
      'After connecting, confirm each negotiated resolution and refresh in the operating system and display information screens. Verify the intended extended or mirrored arrangement and your main gaming display. Keep those observations with the cable map for future troubleshooting.',
      'If gaming across multiple screens, find evidence for that actual rendered resolution and settings. Do not multiply a single-monitor FPS estimate by the number of displays, or infer gaming performance from maximum desktop resolution. A complete output map can justify keeping a current card if it already supports the task.'
    ], [], { table:table('Fill one row per monitor', ['Display','Mode','Path','Verification'], [['Monitor A','Resolution + Hz','GPU port → cable → input','Actual negotiated mode'],['Monitor B','Resolution + Hz','GPU port → cable → input','Actual negotiated mode'],['Monitor C','Resolution + Hz','GPU port → adapter if needed','Combination support still required']]) })
  ], [['Compare exact graphics-card outputs','/compare/'],['Record the complete configuration','/builder/']],
  { kind:'monitors', title:'One documented path per screen', labels:['GPU','Display A','Display B','Display C'], notes:['Check combined support','Record mode and cable','Ports vary by partner model'], alt:'One graphics card connects to three individually labelled monitors, each requiring its own supported cable and mode.' },
  { related:'/blog/choose-display-target-game-evidence/', difference:'Multi-monitor topology and simultaneous-output checks, not single-display target selection.' }));

articles.push(article(22, 'av1-hardware-encoding-before-buying', 'AV1 encoding: check hardware, software and the destination',
  'Distinguish AV1 playback from recording and verify the complete encode workflow before choosing a GPU.',
  'Verify an AV1 recording or streaming path without assuming decode support implies encode support',
  'AV1 decoding and AV1 encoding are separate capabilities. Check the exact GPU’s encoder, the application and the receiving service or editor before buying hardware for AV1.', [
    section('Start with the direction of the work', [
      'Playback decodes compressed video; recording or export encodes it. NVIDIA’s support matrix separates these functions and specifies capabilities by GPU and format. A card that plays AV1 video is not automatically able to record it through an AV1 hardware encoder.',
      'Do not reduce the question to a GPU generation. Record the exact model, codec, bit depth and relevant format, then inspect the matching matrix entry. The matrix is a capability resource, not a measured quality comparison or a promise of real-time throughput for every preset.'
    ], ['nvenc']),
    section('Trace the application and destination', [
      'Confirm that your recording or streaming application exposes the supported encoder on the installed hardware and driver. OBS’s hardware-encoding guide is a useful official starting point for its supported workflow. A selectable encoder does not establish that a particular streaming service accepts that output.',
      'For local recordings, check the editor and playback devices that will use the file. For live streaming, use the destination’s current format guidance. Keep container, audio and workflow requirements with the codec choice rather than assuming every part of the pipeline changes automatically.'
    ], ['obs']),
    section('Compare a real use case before replacing hardware', [
      'Make a small representative test recording with hardware you already own when possible. Inspect successful playback, editing and the application’s dropped-frame or overload reporting. Preserve the settings. Do not compare different presets or bitrates as though they were a controlled encoder-quality test.',
      'If a new GPU is needed, include game-rendering demands, power connections, case fit and actual verified price separately. AV1 support may be a useful feature, but it does not choose an overall GPU winner or establish a free performance gain. This guide provides no encoder benchmark or claimed quality percentage.'
    ], [], { checklist:['Encode versus decode identified','Exact model and format supported','Application/driver path verified','Destination accepts the output','Representative file tested'] })
  ], [['Compare GPU features','/compare/'],['Plan a gaming/streaming system','/blog/gaming-streaming-pc-planning/']],
  { kind:'media', title:'AV1 must work end to end', labels:['Capture / source','Encoder','File or service','Playback / editor'], notes:['Input format','Exact hardware + software','Accepted output','Decode and workflow support'], alt:'A four-stage AV1 workflow separates capture, encoding, destination and later playback or editing support.' },
  { related:'/blog/gaming-streaming-pc-planning/', difference:'AV1 capability-chain verification rather than another complete streaming-PC guide.' }));

articles.push(article(23, 'gpu-undervolting-baseline-validation', 'GPU undervolting: preserve stock settings and validate the change',
  'A cautious decision guide for supported tuning, rollback, workloads and avoiding copied voltage settings.',
  'Evaluate supported GPU undervolting as a reversible experiment with documented limitations',
  'Undervolting is an operating-setting change, not a guaranteed improvement. Use only the supported controls for the exact GPU, preserve stock behavior and verify the workload before relying on the result.', [
    section('Check the supported tool and its scope', [
      'AMD’s Adrenalin tuning documentation describes an undervolt option for select GPUs, along with defaults, profiles and stress-test behavior. An option available on one card or driver is not a supported procedure for every graphics card. Read the software terms and product guidance before proceeding.',
      'This guide supplies no voltage, clock offset or power-limit recipe. Two apparently identical cards can still need different operating settings. Do not flash modified firmware, disable protection or import an unknown profile to reproduce someone else’s screenshot.'
    ], ['undervolt']),
    section('Establish what the stock configuration does', [
      'Back up important work and record the exact GPU, driver, current settings and the workloads you care about. Preserve the default profile and the supported reset route. If the PC is already unstable at stock, investigate that first rather than tuning around an unidentified fault.',
      'Define the objective before changing anything: a particular noise concern, power behavior or repeatable workload. Record the same observations before and after. A lower reported voltage alone does not prove a meaningful benefit, and a synthetic score alone does not represent every game or application.'
    ], []),
    section('Treat validation as ongoing evidence', [
      'Use the vendor’s supported test process and representative real workloads. A short stress test passing is an observation, not a universal stability guarantee. Record artifacts, crashes, errors and changes in behavior. Avoid testing important unsaved work as the first workload.',
      'If a problem appears, restore the supported default and verify it again. AMD documents automatic reset after certain stress-test failures, but automatic recovery is not a substitute for your own rollback record. Revisit the configuration after a driver or workload change. Do not publish a promised temperature, power or FPS reduction without an actual controlled measurement.'
    ], [], { checklist:['Supported exact-model controls','Stock baseline retained','Objective and comparable workload','No copied voltage prescription','Rollback checked','Result described as observed, not guaranteed'] })
  ], [['Record the tested GPU configuration','/my-pc/'],['Check game evidence separately','/performance/']],
  { kind:'flow', title:'A reversible tuning experiment', labels:['Stock baseline','Supported change','Workload checks','Keep or reset'], notes:['Save original settings','One variable at a time','Record failures too','No universal offset'], alt:'A reversible experiment flows from saved stock settings through one supported change and validation to keeping or resetting it.' },
  { related:'/blog/graphics-driver-update-rollback-checklist/', difference:'GPU tuning validation and rollback, distinct from graphics-driver installation problems.' }));

articles.push(article(24, 'vram-capacity-allocation-usage-budget', 'VRAM capacity, usage and budget are different numbers',
  'Read graphics-memory counters without turning one overlay value into a capacity requirement or FPS prediction.',
  'Interpret different GPU-memory counters and avoid a false upgrade conclusion',
  'Installed VRAM is a hardware capacity. An application’s usage, reservation and operating-system budget are different observations. Identify the counter before using it to decide that a GPU needs replacing.', [
    section('Ask what the counter actually measures', [
      'Microsoft’s DXGI documentation separates the OS-provided Budget, CurrentUsage and CurrentReservation fields. It warns that an application exceeding its budget may incur performance penalties. The existence of these separate fields is why a label such as “memory used” needs a definition.',
      'That API description does not identify what every game menu or overlay reports. Some values may describe a request or reservation rather than a direct measurement of every actively needed byte. Read the tool’s documentation and record the exact counter name, not merely a screenshot with a large number.'
    ], ['vram']),
    section('Use a controlled settings comparison', [
      'If investigating a memory-related symptom, record the exact scene, resolution, texture settings, other graphics options and background applications. Compare one supported setting change while keeping the rest fixed. Preserve frame-time behavior and visible image differences alongside the memory observation.',
      'A high counter alone does not prove that more VRAM will improve FPS; a low counter does not certify that no memory problem exists. Look for repeatable behavior and relevant testing of the exact game settings. Do not derive an upgrade percentage from the difference between installed capacity and an overlay value.'
    ], []),
    section('Keep capacity separate from the whole GPU decision', [
      'Compare exact GPU variants and their relevant benchmark evidence. More VRAM can be important to some workloads, but the number does not determine overall rendering speed, encoder features, power connections or case fit. Avoid ranking two different GPUs solely by capacity.',
      'Save the observation with the workload rather than labelling the card universally inadequate. If evidence is insufficient, retain a useful unresolved question: which setting or workload is affected, under which conditions? This guide contains no measured VRAM trace or game-capacity threshold; the diagram explains the categories of information.'
    ], [], { table:table('Keep these meanings distinct', ['Quantity','Meaning'], [['Installed capacity','Physical hardware specification'],['OS budget','Application target assigned by the system'],['Current usage','Usage reported by the specified API/counter'],['Reservation','Separate request/hint; not identical to all active content']]) })
  ], [['Compare exact GPU variants','/compare/'],['Inspect game-specific evidence','/performance/']],
  { kind:'vram', title:'Do not subtract unlike memory counters', labels:['Installed capacity','OS budget','Reported usage','Reservation'], notes:['Hardware','System/application target','Defined counter','Separate hint or request'], alt:'Four distinct labelled memory quantities are presented separately rather than as a fabricated stacked benchmark bar.' },
  { related:'/blog/rtx-5060-ti-8gb-vs-16gb/', difference:'Counter semantics and diagnosis, rather than a duplicate comparison of two capacity variants.' }));

articles.push(article(25, 'pc-airflow-intake-exhaust-pressure', 'PC airflow: draw the intake and exhaust path first',
  'Plan fan direction, filters and obstructions without assuming fan count proves pressure or temperature.',
  'Create a case-specific airflow plan and distinguish pressure concepts from measured results',
  'An airflow plan needs a route into and out of the case. Fan direction, filters, speed and obstructions matter; counting intake and exhaust fans alone cannot establish the final balance.', [
    section('Draw a route through the actual case', [
      'Mark available intake and exhaust locations, filters, the CPU cooler and GPU. Identify the airflow direction from the fan’s documentation or marked frame. Do not assume the attractive side always faces intake, especially with reverse-blade products.',
      'Noctua’s airflow guidance explains that different case layouts need different arrangements. It distinguishes intake/exhaust balance and cautions against opposing streams and obstructions. Use those principles to ask better questions, not to copy a fan count as a guaranteed cooling result.'
    ], ['airflow']),
    section('Pressure is not a count of matching circles', [
      'Positive and negative pressure describe the balance of air entering and leaving. Different fans, speeds, filters and restrictions can change that balance. Three slow filtered intakes and two unrestricted exhausts cannot be classified reliably from the number of fans alone.',
      'Treat pressure language as a planning concept unless you have an appropriate observation or measurement. Do not promise a dust-free PC from “positive pressure,” and do not replace temperature evidence with a diagram. The paths in this guide are conceptual and do not simulate fluid dynamics.'
    ], []),
    section('Test the arrangement you intend to use', [
      'Preserve the existing fan locations, settings and workload observations. Change one arrangement or supported setting at a time, then compare under similar ambient conditions. Record noise and temperatures for the workloads that matter rather than optimizing one idle reading.',
      'Check clearances, fan-header load and cable security before operating. Keep the final layout in the build notes, including filter access for cleaning. If adding another fan does not address a demonstrated problem, keeping the simpler setup can be a reasonable outcome. More fans are not automatically more useful.'
    ], [], { checklist:['Direction verified for each fan','Intake and exhaust route marked','Filters and obstructions recorded','Header/control support checked','Comparable workload observations retained'] })
  ], [['Plan case and fan locations','/builder/'],['Review cooling fit first','/blog/how-to-choose-a-cpu-cooler-that-fits/']],
  { kind:'airflow', title:'A route through the case', labels:['Filtered intake','CPU / GPU zone','Exhaust'], notes:['Conceptual airflow only','Fan count does not measure pressure'], alt:'A conceptual case diagram routes air from filtered intake past hardware toward exhaust, without simulated temperatures.' },
  { related:'/blog/compact-quiet-pc-fit-cooling/', difference:'Airflow path and pressure interpretation, rather than a broad compact/quiet build plan.' }));

articles.push(article(26, 'aio-radiator-pump-orientation-check', 'AIO radiator placement: identify where the pump is',
  'Check the cooler layout and mounting instructions before applying a tubes-up or tubes-down rule.',
  'Evaluate AIO orientation using the exact pump location and supported radiator position',
  'Identify the pump location before applying generic radiator advice. A conventional CPU-block pump and a cooler with a different pump arrangement do not necessarily have the same installation constraints.', [
    section('Find the loop’s actual components', [
      'Read the exact cooler manual and identify the pump, radiator, tubes and permitted mounting positions. CORSAIR’s general guidance for a conventional CPU-pump layout keeps the pump below the radiator’s highest point and discusses top mounting or suitable front/tubes-down installation.',
      'That advice is not proof that every AIO has its pump in the CPU block. Do not turn a helpful general drawing into an override of the actual cooler instructions. A bottom-mounted radiator question must be evaluated against the documented pump location and supported configuration.'
    ], ['aio']),
    section('Orientation does not settle physical fit', [
      'Check the full radiator/fan envelope, motherboard components, GPU clearance and tube reach for the chosen position. A nominal radiator size does not provide those dimensions. A route that requires pulling the tubes taut or forcing a panel is not established as suitable by an orientation slogan.',
      'Keep fan direction separate from radiator orientation. Record whether the intended position brings air into the case or exhausts it, then consider the rest of the case route. Do not claim a temperature advantage without comparable testing of that complete layout.'
    ], []),
    section('Plan the installation and follow-up', [
      'Use only the correct mounting screws and brackets from the product instructions. Improvised long screws or unsupported disassembly can create a new problem. Confirm the required electrical connections and control method separately from the mechanical mounting.',
      'After a supported installation, inspect the reported pump/fan behavior and normal workload temperatures as instructed by the manufacturer. Persistent unusual noise, leaks or abnormal operation should go through the vendor’s support process. Do not open a sealed AIO to “bleed” it as a beginner fix. This illustration explains relative height in a conventional layout; it is not a fit or longevity certificate.'
    ], [], { checklist:['Exact pump location','Supported radiator position','Full fan/radiator/tube envelope','Correct hardware and electrical connections','Manufacturer follow-up checks'] })
  ], [['Check cooler and case fit','/builder/'],['Review the installed cooling envelope','/blog/how-to-choose-a-cpu-cooler-that-fits/']],
  { kind:'radiator', title:'Conventional CPU-pump example', labels:['Radiator high point','CPU-block pump','Supported tube route'], notes:['Relative-height illustration only','Other pump locations need their own instructions'], alt:'A conventional CPU-block pump sits below a top radiator in a conceptual loop; the diagram explicitly excludes other pump arrangements.' },
  { related:'/blog/ryzen-7800x3d-north-air-vs-aio/', difference:'Pump-location/orientation decision, not the existing exact CPU/case air-versus-liquid comparison.' }));

articles.push(article(27, 'measure-pc-noise-repeatable-home-test', 'Measuring PC noise at home: make the comparison repeatable',
  'Record room noise, microphone position and workload before comparing a fan setting or case change.',
  'Create a repeatable home acoustic observation without claiming laboratory-grade dBA results',
  'Use home noise measurements for a carefully documented comparison, not an automatic laboratory rating. The room, microphone and workload can dominate the result.', [
    section('Decide what the measurement can establish', [
      'A phone reading near a quiet PC is not automatically comparable with a review laboratory’s dBA result. NIOSH’s official app documentation describes validation under specified conditions and distinguishes calibrated external-microphone use. It does not validate every phone, app or very low sound level.',
      'Do not import the app’s published accuracy into a promise about your PC test. If the source level is close to the room or microphone’s floor, small reported differences may not be meaningful. Avoid declaring a precise noise reduction that the equipment and setup cannot support.'
    ], ['noise']),
    section('Keep geometry and workload fixed', [
      'Mark the microphone position and orientation relative to the case, and keep the same distance for each run. Record the meter/app, weighting or metric, room conditions and background sources. Take an observation with the PC not producing the workload so the background is documented.',
      'Use the same repeatable task and allow the chosen operating state to settle. Keep the fan profile and case configuration with the result. Do not compare an idle measurement from one build with a gaming measurement from another, or move the phone closer after a quieter setting.'
    ], []),
    section('Write down the sound as well as the number', [
      'Record rattles, tonal noise and cycling behavior separately from an average level. A single number can conceal a sound you find distracting. Do not diagnose a PSU or pump fault purely from the recording; use the relevant manufacturer’s support instructions.',
      'Change one supported setting at a time and retain the original observations. A useful report can honestly say the measurement setup could not resolve a small difference. This guide provides no measured product ranking, acoustic certification or occupational-exposure advice. Its worksheet helps you make your own observations more consistent.'
    ], [], { table:table('Home comparison record', ['Condition','Keep it fixed or record it'], [['Geometry','Distance, direction and microphone position'],['Room','Background noise and other operating equipment'],['Workload','Same task and settling behavior'],['Equipment','Meter/app, settings and limitations'],['Perception','Tone, rattle and speed cycling']]) })
  ], [['Record the configuration under test','/my-pc/'],['Choose a supported fan-control mode','/builder/']],
  { kind:'noise', title:'Keep the measurement geometry fixed', labels:['PC','Microphone position','Room background'], notes:['Same workload and fan settings','Record equipment limitations'], alt:'A home test plan fixes the microphone position relative to the PC and records background sound separately.' },
  { related:'/blog/compact-quiet-pc-fit-cooling/', difference:'Repeatable acoustic observation protocol rather than unsupported quiet-build buying claims.' }));

articles.push(article(28, 'pcie-riser-no-display-generation-check', 'No display through a PCIe riser? Identify the link first',
  'Separate the GPU, slot and extension cable before changing firmware or replacing a working card.',
  'Investigate a riser-specific no-display problem using documented cable generation and a direct-slot baseline',
  'A riser adds another component to the GPU path. Record its exact model and supported generation before assuming the card, motherboard or driver is faulty.', [
    section('Map the three-part link', [
      'Write down the GPU, motherboard slot and extension model. Note whether the same hardware worked when the GPU was mounted directly. A product listing that says only “vertical GPU kit” does not identify the electrical specification of the included riser.',
      'CORSAIR documents a specific case in which its PCIe 3.0 extension with PCIe 4.0 hardware may need a supported Gen3 setting. It first directs the reader to mount the GPU directly to access firmware. That is a named older-cable scenario, not a universal instruction to force every system to Gen3.'
    ], ['riser']),
    section('Preserve a safe working baseline', [
      'Follow the case and board instructions for power disconnection, handling and mounting before changing hardware. If a direct installation is physically supported, it can help separate extension-path behavior from a broader no-display fault. Keep the exact observation and configuration in the notes.',
      'If direct mounting does not work either, do not keep applying the riser-specific explanation. Follow the wider no-display checks and manufacturer support. If the case cannot accommodate a supported direct test, obtain an appropriate service path rather than operating an improvised unsecured assembly.'
    ], []),
    section('Change only a documented setting', [
      'Use the board and cable manufacturers’ instructions to identify any applicable link-mode setting. Record its previous value and the supported rollback route. Firmware updates or resets can change settings later, so retain the riser requirement with the build revision.',
      'Do not assume a lower negotiated mode is a performance measurement or that a newer-generation cable cures every problem. Inspect supported routing, connector condition and mounting without forcing the cable. A useful outcome is a documented direct-slot pass and riser-path failure that support can reproduce, rather than an unsupported declaration that the GPU is defective.'
    ], [], { checklist:['Exact riser model and generation','GPU and slot identified','Supported direct-slot baseline','Applicable manufacturer setting only','Original firmware value retained'] })
  ], [['Record the complete GPU path','/builder/'],['Use the wider no-display checklist','/blog/new-pc-no-display-safe-checks/']],
  { kind:'connector', title:'A riser is another specified link', labels:['Motherboard slot','Exact riser','GPU'], notes:['Supported slot mode','Generation + routing','Direct test as documented'], alt:'The motherboard slot, riser and GPU are three distinct parts of a connection path requiring separate identification.' },
  { related:'/blog/compact-quiet-pc-fit-cooling/', difference:'Replaces overlapping small-form-factor buying topic with a riser-specific diagnostic intent.' }));

articles.push(article(29, 'thermal-paste-remount-checklist', 'Thermal paste after removing a CPU cooler: what to check',
  'Use exact compound and cooler instructions, renew the interface appropriately and avoid replacing paste on an invented schedule.',
  'Plan a cooler remount without reusing an uncertain thermal interface or copying a universal paste dose',
  'Removing a cooler changes the thermal interface. Follow the compound and cooler instructions for cleaning and fresh application rather than assuming the disturbed layer is reusable.', [
    section('Use the instructions for your materials', [
      'Noctua recommends cleaning the CPU and heatsink contact surfaces and reapplying compound after removing the heatsink when using its NT-H1/NT-H2 guidance. The application amount and method need the appropriate CPU/package instructions. This does not establish a universal pattern for every paste or processor.',
      'Also identify any factory-applied interface before adding more. Do not combine an unknown compound with fresh material or treat liquid metal as interchangeable with conventional paste. If the cooler or CPU has a special handling requirement, follow that product’s documentation.'
    ], ['paste']),
    section('Separate a remount from routine maintenance', [
      'A disturbed interface is a specific event. It does not prove that every working PC needs paste replacement at the same age. Preserve the operating baseline and identify the actual symptom before dismantling a reliable system because of an arbitrary calendar rule.',
      'A high temperature can have several causes: mounting, fan behavior, airflow, workload or settings. Record what changed and check the relevant instructions. Do not interpret one temperature screenshot as proof the paste is exhausted, and do not use a remount to hide an unresolved fan or pump problem.'
    ], []),
    section('Keep the remount procedure controlled', [
      'Disconnect power and follow the exact cooler removal sequence. Protect the socket and nearby components, use the documented cleaning materials, and allow any required preparation before installation. Do not scrape contact surfaces with improvised metal tools or mix cleaning instructions from unrelated products.',
      'After installing with the specified hardware and sequence, reconnect and verify the cooling controls, then compare an appropriate normal workload with the baseline. Keep the compound model and remount date in your maintenance notes. This guide offers no measured paste ranking, promised temperature reduction or universal tightening torque.'
    ], [], { checklist:['Exact cooler and compound identified','Product removal and cleaning instructions','Fresh interface where required','Correct mounting hardware and sequence','Fan/pump connections verified','Comparable follow-up observation'] })
  ], [['Keep cooler and maintenance notes','/my-pc/'],['Check physical cooler fit','/blog/how-to-choose-a-cpu-cooler-that-fits/']],
  { kind:'flow', title:'A remount is a documented process', labels:['Remove safely','Clean as specified','Apply correctly','Verify cooling'], notes:['Exact cooler sequence','Correct materials','CPU/package instructions','Comparable workload'], alt:'Four remount steps show safe removal, product-specified cleaning, appropriate application and subsequent cooling verification.' },
  { related:'/blog/how-to-choose-a-cpu-cooler-that-fits/', difference:'Thermal-interface handling after removal, distinct from selecting a cooler that physically fits.' }));

articles.push(article(30, 'gpu-sag-support-bracket-installation', 'GPU support brackets: support the card without creating a new obstruction',
  'Check supplied accessories, chassis anchoring and contact points before placing a support under a graphics card.',
  'Install a documented GPU support without pushing on fans or unknown components',
  'Use the card or holder manufacturer’s installation method. A support must stabilize the intended structure without pressing on fans, cables or unsupported surfaces.', [
    section('Identify the holder and its intended contact', [
      'ASUS’s support article first checks whether the exact card includes a holder, then uses named card/case examples for installation. It secures the card to the chassis before adjusting the support. These details are useful because a stand is not a substitute for the primary mounting hardware.',
      'Do not turn the example’s contact location into a universal rule. Cards have different housings, fan positions and structural surfaces. Read the exact support instructions and accessory list, including whether a chassis rail, magnetic base or model-specific bracket is required.'
    ], ['sag']),
    section('Inspect the surrounding space', [
      'Check that the holder cannot contact fan blades, block an intake, pull a cable or conflict with a lower expansion card. A flat-looking surface in a photograph may be a moving fan or thin decorative cover. Do not choose a support point from appearance alone.',
      'Adjust only as the instructions describe; do not jack the card upward to make it look perfectly level. If the chassis mounting and specified holder cannot be arranged safely, leave the question unresolved and ask the manufacturer. A generic 3D model cannot prove a load-bearing contact point.'
    ], []),
    section('Record the installed arrangement', [
      'Follow the manuals’ power-disconnection precautions before working. Verify the slot latch and chassis fastening according to the board/card instructions, then check that the support remains secure. Keep photographs of the supported arrangement without exposing serial numbers in public build shares.',
      'Recheck after moving the PC or changing the card, but do not assume the support makes shipping an assembled heavy GPU safe. Use the system maker’s transport guidance. This guide contains no allowable sag measurement, structural certification or promise that a universal stand fits every card.'
    ], [], { checklist:['Exact support and card instructions','Primary mounting secure','Approved structural contact','Fan/cable/slot clearance','No forced lifting','Transport guidance checked separately'] })
  ], [['Record the exact GPU and case','/builder/'],['Keep installation notes','/my-pc/']],
  { kind:'support', title:'Support the intended structure', labels:['Chassis fastening','Documented support point','Keep fans clear'], notes:['Conceptual arrangement','Not a universal contact-point drawing'], alt:'A conceptual GPU support diagram distinguishes chassis fastening, a manufacturer-specified structural support point and fan-clearance zones.' },
  { related:'/blog/will-a-graphics-card-fit-my-case/', difference:'Physical support and installation interference rather than general card-envelope fit.' }));

articles.push(article(31, 'pc-under-desk-ventilation-check', 'Putting a PC under a desk: check the air path before the fans',
  'Inspect rear exhaust, side intakes, floor clearance and cabinet recirculation before buying more cooling.',
  'Evaluate desk and cabinet placement as part of the PC ventilation plan',
  'Case ventilation continues outside the chassis. A clear internal fan layout cannot compensate for blocked vents or warm air trapped in an unsuitable enclosure.', [
    section('Inspect the installed position', [
      'Identify where the case actually takes in and expels air. Check the rear gap, side panels, underside intake and access to filters. Do not assume all tower cases draw from the front, or that the desk’s open front provides a free exit at the rear.',
      'Dell’s desktop-care guidance warns against blocked vents, soft surfaces and enclosures without adequate ventilation. Its numeric clearance examples are for that guidance; they are not a universal allowance for every DIY case. Use the exact chassis/system instructions for required spacing.'
    ], ['placement']),
    section('Look for recirculation and obstruction', [
      'A cabinet can allow the hot exhaust to return to an intake or collect around the system. Cables, a wall and stored objects can change the effective route. Check the final working position with the panels and doors as they will actually be used.',
      'Do not place a bottom-intake system directly onto a surface that obstructs it. Use a stable, supported arrangement consistent with the case guidance. Avoid improvised stands that could tip, block vents or strain cables. Preserve safe access to power and maintenance.'
    ], []),
    section('Compare placement before changing hardware', [
      'Record the workload and normal temperature/fan observations in the original position. If a supported alternative location is available, compare under similar room conditions while changing only the position. Do not treat an uncontrolled open-panel test as the final normal configuration.',
      'If placement explains an issue, more fans may not be the useful first purchase. Keep the chosen location and required clearances in the PC’s maintenance notes, and recheck after moving furniture. This guide supplies no guaranteed temperature drop or measured airflow calculation; its diagram illustrates the surrounding route you need to inspect.'
    ], [], { checklist:['All vent locations identified','Exact maker spacing retained','No soft-surface obstruction','Exhaust can leave the furniture','Stable mounting and maintenance access','Comparable observations before new hardware'] })
  ], [['Record the case and fan layout','/builder/'],['Keep placement in your maintenance notes','/my-pc/']],
  { kind:'desk', title:'The air path continues outside the case', labels:['Intake path','Exhaust exit','Furniture boundary'], notes:['Follow exact case clearance guidance','Avoid recirculation and obstruction'], alt:'A desk enclosure illustration shows intake access, exhaust exit and the surrounding furniture boundary as separate ventilation checks.' },
  { related:'/blog/compact-quiet-pc-fit-cooling/', difference:'Furniture and external ventilation, rather than selecting compact-PC components.' }));

articles.push(article(32, 'zero-rpm-psu-fan-behavior', 'PSU fan not spinning? Check whether zero-RPM mode is expected',
  'Identify semi-passive behavior from the exact power-supply manual without diagnosing health from fan motion alone.',
  'Distinguish documented zero-RPM behavior from a symptom that needs manufacturer support',
  'Some PSUs intentionally stop their fan under suitable operating conditions. A stationary fan alone proves neither a healthy PSU nor a failed one.', [
    section('Find the exact model’s normal behavior', [
      'CORSAIR describes zero-RPM operation on certain models and says the default behavior belongs in the unit’s manual. The applicable control can depend on the product. Do not assume a relative’s similar-looking PSU has the same threshold or software control.',
      'Record the full PSU part number, revision and operating conditions. A wattage headline or efficiency badge does not identify the fan policy. Nor does zero-RPM branding establish measured acoustic quality, protections or suitability for a particular build.'
    ], ['zero']),
    section('Keep observations separate from conclusions', [
      'Note whether the PC is operating normally, whether the fan follows the documented behavior, and whether there are shutdowns, unusual smells or other symptoms. Do not repeatedly create an extreme workload just to force the fan to spin. A visual observation is not a load test or an electrical-health measurement.',
      'If behavior conflicts with the manual or there are signs of damage, stop and use the manufacturer’s support process. Do not open the PSU, insert objects through its grille or override its protections. This guide does not reproduce improvised paperclip or live-voltage testing instructions.'
    ], []),
    section('Consider the installation around the PSU', [
      'Check that intake and exhaust openings are unobstructed and the orientation follows the case and PSU instructions. A quiet fan setting does not make a blocked intake acceptable. Keep dust-filter maintenance accessible without modifying the unit.',
      'When shopping, compare exact supported connections, fit and relevant independent testing rather than buying solely for a stopped-fan mode. If the current documented behavior is normal and the system meets its requirements, the observation may call for no purchase at all. Save the manual and useful symptoms with the PC record so the next investigation starts with an exact model.'
    ], [], { checklist:['Exact PSU identified','Manual’s normal fan behavior checked','Other symptoms recorded','Ventilation unobstructed','No enclosure opening or improvised live test','Support used for abnormal behavior'] })
  ], [['Record PSU identity and condition','/my-pc/'],['Plan a replacement only when justified','/upgrade/']],
  { kind:'fanstate', title:'Fan behavior needs its operating context', labels:['Documented stopped state','Documented running state','Abnormal symptoms'], notes:['Not proof of failure','Not proof of complete health','Use manufacturer support'], alt:'Separate conceptual states distinguish expected stopped-fan behavior, expected running behavior and symptoms requiring support.' },
  { related:'/blog/choose-a-pc-power-supply/', difference:'Semi-passive fan symptom interpretation, distinct from the complete PSU buying guide.' }));

articles.push(article(33, 'windows-ssd-new-motherboard-preparation', 'Moving a Windows SSD to a new motherboard: prepare before the swap',
  'Separate physical storage fit, boot support, encrypted-data access and Windows activation before changing the platform.',
  'Prepare a recoverable Windows system-drive move without promising it will boot unchanged',
  'A drive fitting the new board does not guarantee that the current Windows installation will boot or reactivate. Prepare a backup, encrypted-drive recovery and an installation plan before dismantling the working PC.', [
    section('Protect access to the data first', [
      'Make a recoverable backup and confirm how you would restore essential files without the old motherboard. If the drive is encrypted, verify access to the correct recovery key from a separate device or secure offline record before the change. Do not put that key into a public build note or share URL.',
      'Microsoft explains that hardware changes can trigger BitLocker recovery and that it cannot recreate a lost recovery key. A password you remember and an account you can access are not a substitute for checking the actual recovery record that applies to this drive.'
    ], ['bitlocker']),
    section('Keep boot support and activation as separate tasks', [
      'Check the new board’s supported storage interface and boot requirements against the existing installation. Record the old firmware/storage configuration and obtain official support instructions and drivers for the new platform. Do not switch boot or controller modes as a guess when the data has no recovery path.',
      'Microsoft says a major hardware change such as a motherboard replacement can require Windows reactivation. Record the edition and activation method and read the applicable license conditions. Linking a digital license to an account may support the documented reactivation process; it does not create transfer rights that the license never had.'
    ], ['activation']),
    section('Choose the fallback before starting', [
      'Decide whether the supported plan is to move the existing installation, migrate data into a fresh supported installation, or obtain qualified help. Keep official installation media and essential drivers available where needed. A clean installation can erase data, so identify the intended drive and recovery requirements before proceeding.',
      'After a successful change, verify detected hardware, updates, activation and normal workloads before deleting old recovery material. Preserve the old configuration record so problems have context. This guide offers preparation, not a guarantee of an in-place migration or an instruction to disable security features to force a boot.'
    ], [], { checklist:['Restorable backup confirmed','Correct recovery key accessible privately','New storage/boot path documented','Edition and activation method recorded','Official drivers and fallback available','Post-change verification planned'] })
  ], [['Compare the complete platform change','/upgrade/'],['Record the new storage arrangement','/builder/']],
  { kind:'lanes', title:'Four independent migration checks', labels:['Data recovery','Physical / boot path','Activation','Fallback'], notes:['Backup + private key','Exact board and drive','License + edition','Supported restore or install'], alt:'Four separate preparation lanes cover data recovery, storage and boot support, activation and a fallback plan.' },
  { related:'/blog/reuse-pc-components-new-build/', difference:'Windows system-drive migration preparation, rather than general storage reuse.' }));

articles.push(article(34, 'bios-flashback-vs-firmware-menu-update', 'BIOS Flashback vs a normal BIOS update: choose the documented route',
  'Check whether the board can update without a supported CPU, then follow its exact file, port and power instructions.',
  'Choose an exact motherboard’s supported firmware-update method before a CPU upgrade',
  'A firmware-menu update needs a system that can reach that utility. Supported button-based flash features can provide a different route, but they exist only on particular boards and have their own instructions.', [
    section('Start with what the board can do now', [
      'Record the full board model, hardware revision, installed BIOS if known and the CPU currently available. Determine whether the PC can enter the firmware utility. A button on the rear panel is not automatically a flash feature; identify its documented function.',
      'ASUS distinguishes its firmware-menu method from USB BIOS FlashBack on supported models. MSI’s Flash BIOS Button instructions also explicitly limit the method to equipped boards. Do not apply a filename, USB-port choice or waiting-time rule from one brand to another.'
    ], ['bios','flash']),
    section('Check the entire update path', [
      'Find the target CPU in the exact support list and read the firmware release notes and prerequisites. Check whether an intermediate version or additional firmware step is required. If the system cannot boot with the available CPU and has no supported independent flash method, arrange a documented service or supported-CPU path.',
      'Use only the official file for the exact board/revision. Keep any required recovery information and backup before changing firmware. Do not assume rollback is always possible or that a file with a similar name belongs to the board.'
    ], ['bios']),
    section('Keep the procedure beside the hardware', [
      'Follow that product’s instructions for USB preparation, supplied power connections, designated port and completion indication. Maintain power as required and do not interrupt an active update. If the indications do not match the manual, use official support rather than guessing whether another press or unplugging will help.',
      'After completion, verify the installed version and recheck settings that matter to the configuration. A firmware update does not certify RAM profiles, clearances or every connected component. Save the method and version with the CPU-support evidence so future upgrades start from a documented state.'
    ], ['flash'], { checklist:['Exact model/revision','Current ability to enter firmware','Official CPU support and prerequisites','Supported method and exact instructions','Backup/recovery readiness','Completion and installed version verified'] })
  ], [['Check CPU and board support','/compatibility/'],['Plan the platform upgrade','/upgrade/']],
  { kind:'decision', title:'Choose the method the exact board supports', labels:['Can enter firmware?','Use documented menu method','Cannot enter firmware','Supported flash button or service'], notes:['No universal filename or port','Read model-specific prerequisites'], alt:'A decision diagram separates a working firmware-menu path from a supported independent flash-button or service path.' },
  { related:'/blog/check-cpu-bios-support/', difference:'Update-method prerequisites and access path, rather than repeating CPU support-list interpretation.' }));

articles.push(article(35, 'intel-quick-sync-discrete-gpu-check', 'Quick Sync with a discrete GPU: keep the media path in view',
  'Check processor graphics, firmware, driver and application support instead of assuming the gaming GPU does every video task.',
  'Verify processor-graphics Quick Sync availability alongside a discrete GPU',
  'A discrete graphics card does not automatically make processor-graphics media acceleration irrelevant. For the Quick Sync path discussed here, Intel says the integrated graphics must remain enabled.', [
    section('Identify the media engine separately from rendering', [
      'Video decoding, encoding and game rendering are different jobs. Intel’s support guidance says processor-graphics Quick Sync depends on the iGPU being enabled, even when a separate GPU is present. A motherboard display connector alone is not evidence that the installed CPU has the required graphics.',
      'Record the exact processor, its graphics capability, firmware configuration and driver. This is not a statement about every Intel Arc discrete encoder, every codec or every processor with a similar retail name. Use the exact hardware and application support records.'
    ], ['quicksync']),
    section('Trace the actual application path', [
      'Check whether the editor or recording application supports the required hardware path for the source codec, bit depth and output format. A checkbox called hardware acceleration may cover only part of the workflow. Preserve the application version and the selected decode or encode setting.',
      'OBS’s hardware-encoding guidance provides an application-level starting point when OBS is the actual tool. Do not transfer its options into a different editor as a universal procedure. A supported encoder being available is not proof that the project uses it or that every effect becomes GPU-accelerated.'
    ], ['obs']),
    section('Test the workflow rather than buy from a logo', [
      'Use a representative project or recording and inspect successful output, playback and relevant application reporting. Keep the same input and settings when comparing paths. Do not claim a speedup from a different preset, changed quality or a marketing label.',
      'If considering a CPU without integrated graphics, include the media requirement in the complete platform decision. If the current setup already performs the task, no upgrade may be needed. This guide supplies no export benchmark or blanket CPU recommendation; it helps prevent a useful capability from being silently disabled or assumed.'
    ], [], { checklist:['Exact CPU graphics capability','iGPU state documented','Supported driver','Application and format support','Representative output verified','Rendering and media claims separated'] })
  ], [['Compare exact CPU capabilities','/compare/'],['Plan around the editing project','/blog/video-editing-pc-workload-checklist/']],
  { kind:'media', title:'Rendering and media are separate paths', labels:['Game / effects','Discrete GPU','Video encode / decode','Supported media engine'], notes:['Application chooses the work path','Enabled hardware is only one requirement'], alt:'Two application paths distinguish rendering on a discrete GPU from supported video encode or decode on an available media engine.' },
  { related:'/blog/video-editing-pc-workload-checklist/', difference:'Replaces the overlapping proposed editing-PC article with exact processor-graphics media-path verification.' }));

articles.push(article(36, 'prepare-pc-for-sale-data-records', 'Preparing a PC for sale: separate hardware records from private data',
  'Back up, identify every storage device and use an appropriate data-removal process before handing over a computer.',
  'Prepare a Windows PC ownership handover with a storage inventory and appropriate data-removal limits',
  'Prepare the hardware description and data-removal plan separately. Removing an account or deleting visible files is not the same as clearing every drive appropriately.', [
    section('Inventory what will leave your ownership', [
      'Record every internal drive, removable card and external device included in the sale. Distinguish items you will retain. Prepare a public hardware list with exact models and known limitations, while keeping invoices, keys, serial records and personal notes private where appropriate.',
      'Make and verify the backups you need before starting removal. Microsoft’s handover guidance begins with backing up and resetting the device, then removing it from the account. Do not confuse removing an entry from an online account with erasing data still stored on the machine.'
    ], ['resale']),
    section('Choose a process appropriate to the data and drive', [
      'Microsoft distinguishes Keep my files from Remove everything and provides a drive-cleaning option for a consumer handover. It explicitly does not present that cleaning feature as meeting government or industry sanitization standards. Do not market a reset as certified erasure of all devices.',
      'For sensitive or managed data, use the organization’s approved process or qualified service. For each storage device, follow the relevant manufacturer and operating-system instructions. Do not run a generic erase command against an unconfirmed disk, and do not assume a reset option covered an additional drive you never checked.'
    ], ['reset']),
    section('Verify the handover without signing back into private services', [
      'Confirm the intended removal completed and that retained drives or removable media have not been left in the case. Keep a record of the process and outcome without exposing the old owner’s recovery keys or personal files. Follow the supported setup/transfer path rather than creating a fake new-owner identity.',
      'Provide an honest configuration list, accessories, relevant manuals and known faults. Do not promise warranty transfer without checking the product’s terms. If the device cannot complete a suitable removal process, keep the storage or obtain the appropriate service instead of assuming broken hardware makes the data inaccessible.'
    ], [], { checklist:['All storage identified','Backups checked','Removal method appropriate to data','Each included drive accounted for','Accounts handled through official process','Public hardware record excludes private secrets','Known faults disclosed'] })
  ], [['Prepare a clean parts record','/my-pc/'],['Compare keeping and replacing parts','/upgrade/']],
  { kind:'decision', title:'Two separate handover records', labels:['Public hardware list','Private data inventory','Backup and removal','Verify the handover'], notes:['Exact parts + known limitations','Every included storage device','Appropriate to the data','No blanket erasure guarantee'], alt:'A handover diagram separates a public component record from a private storage inventory, backup/removal process and final verification.' },
  { related:'/blog/buying-used-pc-parts-checklist/', difference:'Seller-side data and ownership handover rather than the existing buyer-side condition checklist.' }));

module.exports = { evidenceDate, sources, articles, bodyFor };
