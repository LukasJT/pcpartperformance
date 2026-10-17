'use strict';

const crypto = require('node:crypto');
const evidenceDate = '2026-10-16';
const source = (publisher, title, url, scope, limitations, extra = {}) => ({
  publisher, title, url, scope, limitations, inspected: evidenceDate,
  access: 'Public primary-source full text inspected',
  rights: 'Source-linked original explanation; no copied photographs, test charts or benchmark datasets.', ...extra
});
const sources = {
  terra: source('Fractal Design', 'Terra Graphite specifications', 'https://www.fractal-design.com/products/cases/terra-series/terra/terra-graphite/', 'Exact Terra Graphite FD-C-TER1N-01: Mini-ITX, SFX/SFX-L and 130 mm PSU length limit; component limits require the layout support article.', 'The product-page maximums are not a simultaneous clearance approval. No acoustic result is inferred.'),
  terraSpine: source('Fractal Design', 'Terra CPU cooler/GPU support', 'https://support.fractal-design.com/support/solutions/articles/4000194849-terra-cpu-cooler-gpu-support', 'Seven linked spine positions; cooler height trades against GPU thickness and the GPU height band. The 322 mm GPU length limit becomes 200 mm with the documented 120 mm radiator configuration.', 'Only the named Terra layout. The hypothetical 70 mm cooler and 130 mm high, 56 mm thick GPU example is original constraint arithmetic, not an actual tested build.', { version: 'Support article modified July 6, 2023; current full text inspected' }),
  terraSupport: source('Fractal Design', 'Terra installation and compatibility support', 'https://support.fractal-design.com/support/solutions/articles/4000194859-terra', 'Installation/manual entry points, PSU dimensions and the supplied PCIe 4.0 riser configuration note.', 'This does not document a different riser, universal BIOS menu path or complete wiring/clearance of an unspecified build.', { version: 'Support article modified February 11, 2025' }),
  fanSettings: source('Noctua', 'How do I optimise my fan settings?', 'https://www.noctua.at/en/support/faqs/how-do-i-optimise-my-fan-settings', 'PWM curves depend on the workload and CPU; abrupt curve changes can cause audible speed changes.', 'Manufacturer examples are not a universal safe curve. No fixed temperature, duty cycle or dBA recommendation is imported.'),
  north: source('Fractal Design', 'Original North product sheet', 'https://www.fractal-design.com/app/uploads/2022/12/North_Product-Sheet_EN.pdf', 'Original North: TG cooler limit 170 mm; Mesh 170 mm without side fan bracket or 145 mm with it; top radiator support up to 240 mm.', 'Not North XL or North XL RC. Height, top radiator label and front configurations do not individually prove a complete fit.', { access: 'Official seven-page PDF text inspected; relevant specification table inspected', version: 'Original North December 2022 product sheet' }),
  northRad: source('Fractal Design', 'North radiator compatibility', 'https://fractaldesign.freshdesk.com/support/solutions/articles/4000189453-north-radiator-compatibility', 'Original North top radiator width limit 122 mm and conditional motherboard component height limit 35 mm; RAM height must be checked.', 'Not a blanket approval for every radiator/fan stack or board. The note does not certify the named AIO in an unspecified complete configuration.'),
  cpu7800: source('AMD', 'Ryzen 7 7800X3D specifications', 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html', 'AM5 processor, boxed identifier 100-100000910WOF, no included thermal solution and AMD recommendation for a liquid cooler for optimal performance.', 'A recommendation is not a matched air-versus-AIO benchmark or proof that every liquid cooler fits or performs adequately.'),
  u12a: source('Noctua', 'NH-U12A specifications', 'https://www.noctua.at/en/products/nh-u12a/specifications', 'Named NH-U12A: AM5 mounting support and 158 mm total height including its fans.', 'Not NH-U12A alternatives or every motherboard/RAM layout. Fan specification noise is not whole-PC acoustic performance.'),
  u12aCPU: source('Noctua', 'Ryzen 7 7800X3D cooler compatibility', 'https://www.noctua.at/en/compatibility/by-components/cpus/amd-ryzen-7-7800x3d', 'Noctua lists NH-U12A as a compatible cooler for this exact CPU, with its own suitability categorization.', 'No manufacturer category is converted into a measured temperature, noise result or overclocking guarantee; board, RAM and case need separate checks.'),
  lf3: source('ARCTIC', 'Liquid Freezer III 240 ACFRE00134A specifications', 'https://www.arctic.de/en/Liquid-Freezer-III-240/ACFRE00134A', 'Original black non-RGB Liquid Freezer III 240: AM5 support and bare radiator dimensions 277 × 120 × 38 mm.', 'Not Pro, RGB or other sizes. Bare radiator thickness is not the installed fan/fastener/tube assembly. Promotional cooling claims are not adopted.'),
  lf3Mount: source('ARCTIC', 'Liquid Freezer III 240 installation', 'https://support.arctic.de/liquid-freezer-III-240/', 'Exact-series mounting and connection instructions, including the supported AMD installation route.', 'Read the applicable supplied revision and motherboard manual. This guide is not a substitute for assembly instructions.'),
  lf3Board: source('ARCTIC', 'Liquid Freezer III motherboard compatibility', 'https://support.arctic.de/lf3-compatibility', 'Exact-board compatibility resource for cooler block/nearby-component checks.', 'No unspecified motherboard is approved. The current list does not prove a complete case/radiator/RAM layout.'),
  warrantyCorsair: source('CORSAIR', 'Corsair Limited Warranty', 'https://help.corsair.com/hc/en-us/articles/360033067832-Warranty-Corsair-Limited-Warranty', 'Original-purchaser and nontransferable terms with applicable-law exceptions, product/region conditions, and receipt/serial requirements.', 'Not legal advice or another manufacturer’s policy. A used seller’s receipt alone does not establish eligibility.', { version: 'Updated August 11, 2026, v1.107' }),
  warrantyMSI: source('MSI', 'How to check the status of my warranty', 'https://www.msi.com/support/technical_details/product-warranty-related', 'Serial-number status lookup, region-dependent terms and local support contact route.', 'A status result is not a transfer approval. Do not assume country-independent coverage or collect a visitor’s full serial in public tools.', { version: 'May 5, 2025 support procedure' }),
  warrantyNvidia: source('NVIDIA', 'Product warranties', 'https://www.nvidia.com/en-us/support/warranty/', 'Partner GeForce boards are warranted by the add-in-board partner; Founders Edition coverage is handled by NVIDIA.', 'The GPU chip name does not establish the board partner’s actual terms, buyer eligibility or remaining coverage.'),
  gpuIdentity: source('NVIDIA', 'Identifying the graphics card model and device ID in a PC', 'https://nvidia.custhelp.com/app/answers/detail/a_id/2040', 'NVIDIA Control Panel System Information exposes installed GPU, driver, video memory and related identifiers when its driver is functioning.', 'Software identification does not establish physical condition, exact retail cooler variant, lawful seller ownership or remaining service life.', { version: 'Support article updated September 29, 2021; current page inspected' }),
  magician: source('Samsung', 'Magician software and supported-drive information', 'https://semiconductor.samsung.com/consumer-storage/magician/', 'Manufacturer drive information, S.M.A.R.T. and diagnostic features with model/function support limits.', 'Diagnostics are a present observation, not a guarantee of future life. No erasure, firmware update, destructive write test or unsupported-drive authentication is prescribed.', { version: 'Current public Magician 9.0 page' }),
  psuCables: source('CORSAIR', 'PSU cable compatibility', 'https://www.corsair.com/us/en/s/psu-cable-compatibility', 'Explicit warning that Type 3/4 modular cables are not compatible with Type 5 power supplies and wrong cables can damage hardware.', 'CORSAIR type labels do not describe cross-brand compatibility or approve a cable with unknown identity.'),
  gpu3060: source('NVIDIA', 'GeForce RTX 3060 family specifications', 'https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/', 'Desktop RTX 3060 has separate 12 GB/192-bit and 8 GB/128-bit configurations; RTX 3060 Ti is a separate product. Family specifications differ from board-partner dimensions and connectors.', 'No original FPS is imported. The 550 W reference system recommendation is scoped to NVIDIA’s i9-10900K configuration, not approval of an owned PSU.'),
  gpu5060ti: source('NVIDIA', 'GeForce RTX 5060 family specifications and chart conditions', 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/', 'RTX 5060 Ti has separate 16 GB/8 GB GDDR7 options. The manufacturer comparison charts disclose different frame-generation modes across generations and the 3060 comparison uses a 12 GB card.', 'The manufacturer chart is not a native-rendering upgrade percentage or input-latency result. Dimensions and shipping specifications vary by partner; no price is taken from placeholders.'),
  gpu9060xt: source('AMD', 'Radeon RX 9060 XT 16 GB specifications', 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html', 'Exact 16 GB RX 9060 XT base product and AV1 encode support for a candidate feature check.', 'Not an 8 GB model or exact partner-board fit. No current sale price, general FPS advantage or application support is inferred.'),
  review5060ti: source('TechSpot / Hardware Unboxed', 'GeForce RTX 5060 Ti 16 GB review', 'https://www.techspot.com/review/2979-nvidia-geforce-rtx-5060-ti-16gb/', 'Original publisher’s review and test-system record; its April 2025 system uses a 9800X3D and the enumerated comparison set does not include an RTX 3060.', 'Linked as a candidate review, not a direct 3060 upgrade measurement. No charts, FPS table or dataset is redistributed.', { version: 'Steven Walton, April 16, 2025; current full article inspected' }),
  reviewPCIe: source('TechSpot / Hardware Unboxed', 'RTX 5060 Ti 8 GB and 16 GB across PCIe generations', 'https://www.techspot.com/review/3004-nvidia-rtx-5060-ti-pcie-benchmark/', 'Original targeted testing of the two capacities under differing PCIe configurations; useful evidence for checking an older platform.', 'Those configurations and games are not the visitor’s setup. No measured uplift, benchmark rows or claimed statistical range is imported.', { version: 'Steven Walton, June 28, 2025; full article inspected' })
};

const section = (title, paragraphs, sourceIds = [], extra = {}) => ({ title, paragraphs, sourceIds, ...extra });
const table = (caption, headers, rows) => ({ caption, headers, rows });
const common = {
  author: 'PC Part Performance', type: 'research-based practical guide', change: 'new', contentVersion: 'extra-1',
  datePublished: null, dateModified: null,
  attribution: 'Original research-based writing prepared with AI assistance for PC Part Performance; no first-hand hardware tests or personal human review are claimed.',
  lifecycle: { state: 'source_checked_release_pending', evidenceChecked: true, humanEditorialReview: null, humanReviewClaimed: false, publicationAuthorized: false }
};
function article(id, slug, title, description, summary, intent, sections, tools, extra = {}) {
  return { ...common, id, route: '/blog/' + slug + '/', canonicalRoute: '/blog/' + slug + '/', title, description, summary, intent,
    sections, tools, sourceIds: [...new Set(sections.flatMap(s => s.sourceIds))], keywords: [], claims: [], limitations: [], ...extra };
}

const articles = [
  article('MX01', 'compact-quiet-pc-fit-cooling', 'Plan a compact PC with a realistic noise goal',
    'Choose a small PC layout, check shared GPU and cooler space, and plan repeatable noise checks without mistaking fit for cooling performance.',
    'Start with the space you actually need to save and the workload you want to hear less of. Then choose one documented internal layout. A compact parts list can fit on paper and still leave its noise goal unproven.',
    'Help a small-PC buyer turn a quiet-use goal into a feasible layout and a repeatable acceptance check.', [
      section('Define quiet during the task you care about', [
        'Write a specific goal before selecting the enclosure: less fan ramping while working, a less noticeable PC during a particular game, or less disturbance at the desk during a long export. Keep the seating position, usual room conditions and application settings in the record. A system that is unobtrusive at idle has not answered the question of how it sounds during that export.',
        'Separate a desk-space requirement from an appearance preference. Measure the available space, cable exit room and access needed for the case’s panels and vents. If a slightly larger enclosure is acceptable, keep it as a genuine alternative. Small volume alone is not evidence of better cooling, quieter operation or a better purchase.'
      ]),
      section('Plan one complete layout, not separate maximums', [
        'The Terra is a useful documented example because its movable motherboard spine trades CPU-cooler space against graphics-card space. Fractal’s support table gives different allowances at seven settings, with a further GPU-height condition. Choosing the largest cooler figure and the largest GPU thickness from different columns does not produce a valid configuration.',
        'For an original arithmetic example, imagine a 70 mm tall cooler and a GPU that is 130 mm high and 56 mm thick. Position 2 allows a 72 mm cooler but only 48 mm GPU thickness in the applicable height band. Position 4 allows a 58 mm thick GPU but only a 62 mm cooler. No documented position supports this pair. These are hypothetical dimensions, not a tested product recommendation.'
      ], ['terraSpine'], { table: table('A shared setting must satisfy both components', ['Hypothetical pair', 'Documented setting', 'Narrow conclusion'], [
        ['70 mm cooler; 56 mm GPU thickness; 130 mm GPU height', 'Position 2: 72 mm cooler / 48 mm GPU', 'Cooler height fits; GPU thickness does not'],
        ['Same components', 'Position 4: 62 mm cooler / 58 mm GPU', 'GPU thickness fits; cooler height does not'],
        ['Both independent maximums', 'No single common column', 'Change a component or choose another case']
      ]) }),
      section('Check the pieces around the CPU and GPU', [
        'Continue the layout check through the power supply, storage, fans, riser and cables. The Terra Graphite lists Mini-ITX motherboard support and SFX or SFX-L power supplies up to 130 mm long. Those are starting constraints, not a promise that every allowed PSU leaves the same cable-management space. Check the actual unit, its cable exits and the intended fan installation against the case instructions.',
        'Changing the layout changes the evidence you need. Fractal’s Terra support limits GPU length to 200 mm in its documented 120 mm radiator arrangement, rather than the ordinary 322 mm figure. Its support page also identifies the supplied riser as PCIe 4.0 and documents a configuration step when both board and GPU support PCIe 5.0. Follow the exact board and case instructions; do not guess a BIOS menu or transfer that advice to another riser.'
      ], ['terra', 'terraSpine', 'terraSupport']),
      section('Look for comparable cooling and sound evidence', [
        'Once a configuration is physically plausible, look for tests of the exact case and relevant layout. Record the CPU/GPU load, room conditions, installed cooling, fan settings, microphone distance and whether the comparison holds temperature or noise constant. A review of a different cooler in an open bench can be useful context, but it does not establish the sound of your closed compact build.',
        'Do not add fan dBA specifications together or promote the quietest maximum-speed fan label into a whole-PC result. If suitable testing is missing, keep the acoustic outcome unresolved. You can still choose a layout for its documented fit and service access; describe that reason accurately. The 3D preview helps explain arrangement, while the manuals and measurements establish fit.'
      ], ['fanSettings']),
      section('Make fan adjustments traceable and reversible', [
        'Noctua’s guidance explains why fan control should reflect the workload and why abrupt speed changes can be distracting. Use the motherboard’s supported controls and record the original profile before making a change. A smooth curve is a behavior to evaluate, not a universal set of temperatures or percentages that can be copied safely to every CPU and case.',
        'Change one supported setting at a time and repeat the same task while watching the relevant temperatures and any throttling or warning behavior. Preserve manufacturer protection and appropriate cooling under sustained load. If the result becomes unstable, hotter than the applicable guidance allows, or less pleasant, restore the baseline. Do not stop a running fan by hand or disconnect cooling as a noise test.'
      ], ['fanSettings']),
      section('Save a compact-build acceptance record', [
        'Keep the selected layout and its conditions beside the exact build. Include which physical checks passed narrowly, which evidence is missing and what you will observe after assembly. A claim such as “GPU thickness matches position 4” is useful; “silent and fully compatible” hides several unanswered questions.',
        'Use the builder for exact components, the readiness report for remaining checks and the complete-cost worksheet for any required replacements or mounting accessories. A quieter-use goal can also be solved by an acceptable existing configuration or a more spacious case. Buy only after the tradeoff you are making is clear.'
      ], [], { checklist: [
        'Record the exact case variant, internal setting and occupied mounting positions.',
        'Resolve CPU-cooler and GPU dimensions in the same documented configuration.',
        'Check PSU, cable, riser, storage and fan constraints separately.',
        'Keep sound/temperature evidence and missing tests visible.',
        'Save a reversible control baseline and the real workload used to assess the result.'
      ] })
    ], [{ href: '/builder/', label: 'Plan the exact compact build' }, { href: '/builder/#readiness-report', label: 'Review remaining fit checks' }, { href: '/blog/how-to-choose-a-cpu-cooler-that-fits/', label: 'Check the cooler’s full installed envelope' }, { href: '/tools/platform-upgrade-cost/', label: 'Include cooling and layout changes in the cost' }],
    { replacesDraftIntent: '08', roadmapIntents: ['L12', 'P08'], keywords: ['how to build a quiet PC', 'small quiet PC fit cooling', 'Fractal Terra GPU cooler clearance'],
      claims: [{ kind: 'original_constraint_arithmetic', measured: false, inputs: { coolerHeightMm: 70, gpuHeightMm: 130, gpuThicknessMm: 56 }, conclusion: 'No documented Terra spine position satisfies both selected dimensions.' }],
      limitations: ['A planning workflow and documented layout example, not a tested silent build or a measured acoustic ranking.'] }),

  article('MX02', 'buying-used-pc-parts-checklist', 'What to check before buying used PC parts',
    'Check exact model identity, condition evidence, warranty terms, missing accessories and the complete cost before buying a used GPU or other PC component.',
    'A used component is worth considering when you can identify it, establish a useful record of its current behavior and understand the transaction’s limits. A clean photograph, a boot screen or a seller’s assurance cannot establish all three.',
    'Help a used-parts buyer evaluate a listing and safe evidence before payment, without promising remote health certification.', [
      section('Identify the item that will actually change hands', [
        'Ask for the exact manufacturer, model, part number and capacity, with current photographs of the item’s identifying label and connectors. Distinguish a photograph of the actual item from a stock image or an attractive box. Confirm whether pictured cables, brackets and accessories are included. Keep full serial numbers and receipts private rather than placing them in a public comparison or shared build.',
        'For a functioning NVIDIA-based system, its official System Information view can report the installed GPU and video memory. Compare that observation with the physical label and manufacturer listing. Software identification supports the record, but it does not prove the retail cooler variant or replace inspection. An RTX 3060 Ti, RTX 3060 12 GB and RTX 3060 8 GB are different buying decisions even when a listing shortens all of them to “3060.”'
      ], ['gpuIdentity', 'gpu3060']),
      section('Agree what evidence you need before paying', [
        'Define a demonstration that addresses the part’s intended use. For a graphics card, that might include identification and a repeatable run of the game or application you plan to use, with its settings and any visible errors recorded. For a motherboard, ask which processor, BIOS, memory slots and connections were actually demonstrated. A normal desktop proves less than a relevant task, and one task does not establish that every port or memory slot works.',
        'Have the seller explain known faults, repairs, modifications and what could not be checked. A screenshot can be incomplete or from another item; an in-person demonstration can still miss an intermittent problem. Where identity, behavior or the opportunity to return a faulty item remains uncertain, treat that as a limitation of the purchase rather than inventing a condition score.'
      ]),
      section('Inspect safely without turning the sale into a repair job', [
        'With equipment safely disconnected, look for damage or missing pieces that can be seen without dismantling protected assemblies: damaged connectors, missing mounting parts, bent accessible contacts, damaged fan blades or signs that deserve an explanation. Do not power a visibly damaged component merely to see whether it works. Do not open a PSU, bypass protection, repin a modular cable or perform a firmware flash to complete a sale demonstration.',
        'For storage, ask what the manufacturer’s supported diagnostic tool actually reports for that exact drive. Samsung Magician, for example, provides supported-drive information, S.M.A.R.T. and diagnostic functions with model-dependent availability. A health report is an observation at that time, not proof of years of remaining life. Do not run destructive tests, erase the seller’s data or accept private files as part of the demonstration.'
      ], ['magician']),
      section('Check warranty eligibility rather than the logo', [
        'Warranty responsibility can differ from the GPU chip brand. NVIDIA’s support page directs partner-board warranty questions to the board maker and distinguishes Founders Edition coverage. Ask the responsible manufacturer about the exact model, sale region, proof of purchase and second-owner eligibility before assigning warranty value to a listing.',
        'Policies are not interchangeable. CORSAIR’s inspected terms limit coverage to the original purchaser and describe nontransferability with applicable-law exceptions. MSI provides a serial-based status check and explains regional conditions. A receipt or an online status page is useful evidence, but neither alone establishes that your claim as a new owner will be accepted. Save any applicable confirmation privately and read the current policy for your country.'
      ], ['warrantyNvidia', 'warrantyCorsair', 'warrantyMSI']),
      section('Price the missing parts and installation constraints', [
        'Compare the complete usable purchase, including documented replacement mounting hardware, correct cables, transport, taxes or shipping that apply and any supported installation work. Do not subtract an assumed resale value or count an unconfirmed warranty replacement as a saving. If required accessories cannot be sourced and matched, leave their cost and usability unresolved.',
        'A mixed bag of PSU cables is particularly poor evidence of a complete power supply. CORSAIR explicitly warns that its Type 3/4 cables are not compatible with Type 5 supplies. Physical mating and a familiar logo do not establish pinout compatibility. Obtain the exact applicable cable evidence; if that cannot be established, do not connect the unknown cable. Include the right documented replacement or another PSU in the purchase comparison.'
      ], ['psuCables'], { table: table('Keep the listing price separate from the usable total', ['Record', 'Useful evidence', 'Unresolved case'], [
        ['Exact part', 'Actual label and matching manufacturer model/capacity', 'Ambiguous name or stock image only'],
        ['Observed behavior', 'Relevant demonstrated task with stated conditions', 'Untested function or intermittent fault'],
        ['Support and return terms', 'Applicable written conditions and manufacturer response if needed', 'Assumed transferable warranty'],
        ['Required extras', 'Matched brackets/cables and actual quote', 'Unknown accessory treated as free']
      ]) }),
      section('Keep the transaction and compatibility records separate', [
        'Read the seller or marketplace’s actual payment, delivery and return terms before committing, and preserve the listing and agreed configuration. This guide does not determine your legal rights or certify a seller. If the evidence or terms do not meet your needs, keeping the current part or choosing another listing is a legitimate outcome.',
        'After deciding that a listing is worth considering, enter the exact component in the builder and check it against the rest of the system. A working used card can still be the wrong size or need unsupported cabling in your PC. Use the reuse guide for installation planning and private data access; use this checklist for the different question of whether this particular sale is sufficiently documented.'
      ], [], { checklist: [
        'Match the physical product, capacity and included accessories to the agreed listing.',
        'Record the relevant demonstration and the functions that were not tested.',
        'Read the applicable warranty and transaction terms before assigning them value.',
        'Leave unknown condition, cable identity and missing prices unresolved.',
        'Check the exact component against the intended PC before payment.'
      ] })
    ], [{ href: '/hardware/', label: 'Look up the exact model and variant' }, { href: '/builder/', label: 'Check the item against your build' }, { href: '/tools/platform-upgrade-cost/', label: 'Add missing accessories to the complete cost' }, { href: '/blog/reuse-pc-components-new-build/', label: 'Plan installation of parts you will reuse' }],
    { roadmapIntents: ['L30'], keywords: ['what to check before buying used PC parts', 'used graphics card checklist', 'used GPU warranty'],
      limitations: ['No remote hardware health, seller, remaining-life or legal-rights certification. No used sale price or manufacturer-wide transferable-warranty assumption.'] }),

  article('MX03', 'ryzen-7800x3d-north-air-vs-aio', 'Air cooler or AIO for a Ryzen 7 7800X3D in the original North?',
    'Compare NH-U12A and Liquid Freezer III 240 fit checks for a Ryzen 7 7800X3D in the original Fractal North, with layout conditions kept explicit.',
    'For this CPU and case, an air-versus-AIO choice starts with exact mounting and occupied space. The NH-U12A passes the original North TG height comparison; that is not a full fit or noise verdict. A 240 mm AIO still needs its complete radiator, fan, RAM and motherboard layout checked.',
    'A source-based physical decision for a 7800X3D gaming build in the original North; not a matched thermal or acoustic review.', [
      section('Set the scope before choosing a cooling type', [
        'This guide compares the named Noctua NH-U12A and original black ARCTIC Liquid Freezer III 240, part ACFRE00134A, for a Ryzen 7 7800X3D in the original Fractal North. It is aimed at a gaming build whose owner wants a documented installation path. It does not cover North XL, other radiator sizes, Pro editions or an assumed all-core workstation workload.',
        'AMD lists no included thermal solution for the boxed 7800X3D and recommends liquid cooling for optimal performance. Noctua separately lists the NH-U12A as compatible with that exact CPU. These statements answer different questions. Neither establishes a site-measured temperature, proves an acoustic winner or approves every motherboard and case arrangement.'
      ], ['cpu7800', 'u12aCPU']),
      section('The air cooler’s height changes with the North variant', [
        'Noctua lists the NH-U12A’s total height with fans as 158 mm. The original North product sheet lists 170 mm for the TG version. Comparing those two documented dimensions gives a narrow height match. The remaining 12 mm is arithmetic from nominal figures, not a universal safety allowance or proof that nearby parts and wiring clear.',
        'The Mesh version is conditional: Fractal lists 170 mm without its side fan bracket but 145 mm with the bracket. A 158 mm cooler exceeds that bracket-installed limit. Choose the actual arrangement before treating the air path as viable. Then inspect the exact motherboard, memory and cooler compatibility resources and follow the supplied mounting instructions.'
      ], ['u12a', 'north'], { table: table('NH-U12A height is one check, not complete compatibility', ['Original North arrangement', 'Published height allowance', '158 mm NH-U12A comparison'], [
        ['TG', '170 mm', 'Within the listed height allowance'],
        ['Mesh without side fan bracket', '170 mm', 'Within the listed height allowance'],
        ['Mesh with side fan bracket', '145 mm', 'Exceeds the listed height allowance']
      ]) }),
      section('A 240 mm label does not finish the AIO check', [
        'The original North supports a top radiator up to the 240 mm class. Fractal also gives a 122 mm top radiator width limit and warns of a 35 mm motherboard-component-height condition, explicitly asking readers to check RAM height. ARCTIC lists the selected cooler’s bare radiator as 277 × 120 × 38 mm. Its 120 mm width is within that one width constraint; it does not prove that the complete assembly fits.',
        'Collect the fan and fastener envelope, tube path and motherboard/RAM positions from the actual drawings and instructions. Bare radiator thickness excludes other installed parts. The exact motherboard also needs ARCTIC’s compatibility check for the block and surrounding components. If the required stack or overlap dimension is not established, record “needs verification” rather than approving it because both products say 240 mm.'
      ], ['north', 'northRad', 'lf3', 'lf3Board']),
      section('Compare the installation and service choices', [
        'For the air path, the practical record includes the exact mounting kit, access to the fastening points, nearby memory and the ability to service or remove components later. For the AIO path, include the supported AMD mount, block clearance, radiator arrangement, fan connections and pump/control connections in ARCTIC’s exact instructions. Use the motherboard manual to identify headers and their limits.',
        'Do not substitute a generic assembly video for either manufacturer’s instructions, and do not infer an included bracket from a retailer photograph. A used or old-stock cooler can have a different supplied kit. If a required part is absent, establish the supported replacement and cost before adding that option to a ready-to-buy plan.'
      ], ['u12a', 'lf3Mount', 'lf3Board']),
      section('Choose the evidence needed for your noise goal', [
        'A gaming acoustic comparison would need the same case arrangement, relevant workload, room conditions, control settings and measurement approach. An all-core cooler test on another processor does not directly give the sound of this PC during your game. A pump or fan’s individual specification is not the total system result, and a higher nominal cooling category does not by itself establish the preferable sound.',
        'This research did not establish a matched thermal/acoustic test of these two coolers in this complete configuration. There is therefore no numerical noise or temperature winner here. Use the documentation to eliminate unsuitable arrangements first, then seek comparable original testing or define a repeatable post-assembly observation. Noctua’s fan-control guidance is useful context, not a fixed safe curve for every build.'
      ], ['fanSettings']),
      section('Make the decision with explicit conditions', [
        'The NH-U12A is a documented candidate when the CPU-specific support, applicable North height and remaining board/RAM checks all support the selected arrangement. The side-bracket height conflict makes it unsuitable for that stated Mesh layout. The Liquid Freezer III 240 remains a candidate only after its complete top assembly, motherboard/RAM overlap and installation requirements are verified. The width check alone does not release it from those conditions.',
        'Compare the actual regional purchase costs, missing hardware and your preferred service access. Keep an unknown offer as missing, and do not claim a thermal advantage to justify a price premium without appropriate evidence. Save the configuration and its unresolved checks in the builder. If those checks cannot be resolved, choose a documented alternative or contact the manufacturer before buying.'
      ], [], { checklist: [
        'Use the original North variant and actual side-bracket arrangement.',
        'Verify the exact supplied AM5 mount and the motherboard support record.',
        'Check full air or radiator/fan/tube dimensions, not only a class label.',
        'Keep measured sound and temperature comparisons separate from physical fit.',
        'Include missing mounting parts and current regional costs in the final choice.'
      ] })
    ], [{ href: '/builder/', label: 'Select exact cooling parts and case' }, { href: '/builder/#readiness-report', label: 'Review documented and unresolved checks' }, { href: '/blog/how-to-choose-a-cpu-cooler-that-fits/', label: 'Follow the full cooler-fit process' }, { href: '/tools/platform-upgrade-cost/', label: 'Compare the complete cooling purchase cost' }],
    { replacesDraftIntent: '18', roadmapIntents: ['P18'], keywords: ['7800X3D Fractal North air cooler vs AIO', 'NH-U12A North height', 'Liquid Freezer III 240 North compatibility'],
      claims: [{ kind: 'narrow_manufacturer_dimension_comparison', measured: false, coolerHeightMm: 158, caseLimitsMm: [170, 145], extraScope: 'No complete configuration approval or tested cooling ranking.' }],
      limitations: ['Matched complete-system thermal/acoustic evidence was not established. No cooler winner, temperature difference or sound result is claimed.', 'The exact motherboard, RAM and full AIO assembly remain required checks; no default board/RAM is invented.'] }),

  article('MX04', 'rtx-3060-upgrade-or-keep', 'RTX 3060 upgrade options: when to keep the card',
    'Start with your exact RTX 3060 variant and actual games, then compare keeping it with documented GPU candidates and the complete cost of changing.',
    'Keep an RTX 3060 if it still meets your actual workload and display goal. If it does not, identify the 8 GB or 12 GB variant, record a repeatable problem and require relevant evidence before buying a replacement. A newer model number is not an upgrade plan.',
    'Help an RTX 3060 owner compare keeping the card with concrete candidate checks, without an invented FPS uplift or current-price winner.', [
      section('Identify which RTX 3060 you own', [
        'NVIDIA lists desktop RTX 3060 configurations with 12 GB of memory on a 192-bit interface and 8 GB on a 128-bit interface. The RTX 3060 Ti is a separate GPU. Do not select a Ti benchmark or assume a review of the 12 GB card describes the 8 GB one. Record the board maker and full product model as well, because dimensions, cooler and shipping specifications can vary.',
        'Use the installed driver’s System Information and the physical model record to confirm the starting point. Add your CPU, memory configuration, motherboard/slot, PSU, display resolution and the games or applications you actually use. Keep serial numbers and private notes out of public share links. A correct starting record makes every subsequent comparison more useful.'
      ], ['gpu3060', 'gpuIdentity']),
      section('Define a reason to change, including no purchase', [
        'Choose a specific unmet goal: steadier behavior in one repeatable game segment, an application feature you need, a different display target, or a project that no longer fits its available resources. Record the game or application version, settings, resolution and relevant observations before changing anything. “It is old” and a universal bottleneck percentage do not identify the problem.',
        'Keep three paths open: use the current configuration, make a supported settings/configuration change, or replace hardware. Repeat the same task after one reversible change. If the current card reaches an acceptable result at settings you like, keeping it can meet the goal without a purchase. If the evidence instead points elsewhere in the system, carry that question into the upgrade planner rather than automatically assigning it to the GPU.'
      ]),
      section('Use exact candidates as research questions', [
        'Two concrete candidates to investigate are an RTX 5060 Ti 16 GB and a Radeon RX 9060 XT 16 GB. The named capacities matter: the 5060 Ti also has an 8 GB option, and the AMD source used here is specifically the 16 GB product. Both candidate names describe base GPUs, so a shopping or fit decision still needs the exact board-partner product.',
        'These are not a complete market ranking or a promise of worthwhile performance. Use the 5060 Ti candidate to ask whether your application and game evidence supports the required features and change. Use the RX 9060 XT candidate to ask the same question on its supported software path. If a task requires a particular acceleration API or encoder feature, confirm actual application support; a manufacturer feature label such as AV1 encode does not prove the whole workflow.'
      ], ['gpu5060ti', 'gpu9060xt'], { table: table('A short candidate list is a research plan', ['Option', 'What to establish', 'Reason to hold off'], [
        ['Keep the exact RTX 3060', 'The real task meets an acceptable result', 'The task or required feature still cannot be completed'],
        ['RTX 5060 Ti 16 GB, exact partner model', 'Matching workload evidence, required software support and complete fit/cost', 'Only marketing frame-generation comparisons or an ambiguous 8 GB listing'],
        ['RX 9060 XT 16 GB, exact partner model', 'Matching workload evidence and application/output support', 'Assumed cross-vendor feature equivalence or unsupported software path']
      ]) }),
      section('Read the chart conditions before using a percentage', [
        'NVIDIA’s current 5060 family comparison page discloses different frame-generation modes across GPU generations; its RTX 3060 comparison uses the 12 GB card. Such a chart must not be rewritten as the native-rendering improvement for any RTX 3060 owner. Generated-frame output and input responsiveness are different questions. Keep resolution, render settings and generation/upscaling modes visible when interpreting a result.',
        'Original reviews can help, but their comparison set matters. TechSpot’s April 2025 RTX 5060 Ti review records a 9800X3D system and does not list an RTX 3060 among its tested cards. It is a useful candidate review, not a direct 3060 upgrade measurement. Its separate capacity/PCIe study is useful for examining a particular platform question. Neither is silently imported into this site as a measured prediction for your PC.'
      ], ['gpu5060ti', 'review5060ti', 'reviewPCIe']),
      section('Check the host PC and the full purchase cost', [
        'Recheck the exact replacement board’s dimensions, connector position, required cables and relevant PSU guidance against your occupied case. NVIDIA’s RTX 3060 reference system recommendation was based on a stated i9-10900K system. It is not proof that an unidentified PSU is suitable for either candidate or that its existing modular cables can be moved to another supply.',
        'Include any actually required PSU, supported cables, case changes or other installation items alongside the quoted GPU. Keep current offers, manually entered quotes, owned parts and unknown prices separate. A lower advertised card price does not establish a cheaper complete upgrade if necessary extras remain missing. Verify the actual listing and currency for Canada or the US before acting.'
      ], ['gpu3060', 'psuCables']),
      section('Make the purchase conditional on the problem being solved', [
        'A useful decision record says what the replacement must improve, which evidence supports it, what it will cost in your region and which checks remain open. If the only available comparison changes the game, CPU, quality settings and frame-generation mode at the same time, it may not answer your question. Seek more relevant testing or keep the decision unresolved.',
        'Open the upgrade planner with the existing system first. Compare a proposed replacement in the hardware comparison tool, then transfer the exact parts into the builder for readiness checks. The performance evidence hub should show evidence or its absence, not turn a missing dataset into a precise FPS number. Save the keep option alongside the upgrade so the decision can be revisited when a real offer or useful test appears.'
      ], [], { checklist: [
        'Confirm desktop RTX 3060 8 GB or 12 GB and the exact partner model.',
        'Record a workload and acceptable outcome before selecting a replacement.',
        'Require the tested starting GPU and conditions to match before applying an uplift.',
        'Review physical fit, PSU/cables and the complete regional purchase cost.',
        'Keep the current card when the evidence does not justify changing it.'
      ] })
    ], [{ href: '/upgrade/', label: 'Record the current PC and compare upgrade paths' }, { href: '/compare/', label: 'Compare exact GPU specifications' }, { href: '/performance/evidence/', label: 'Inspect available game-performance evidence' }, { href: '/blog/read-hardware-benchmarks-test-conditions/', label: 'Check whether the benchmark answers your question' }, { href: '/tools/platform-upgrade-cost/', label: 'Compare the complete upgrade cost' }],
    { replacesDraftIntent: '20', roadmapIntents: ['P20'], keywords: ['RTX 3060 should I upgrade or keep', 'RTX 3060 8GB vs 12GB upgrade', 'RTX 3060 upgrade options'],
      limitations: ['No direct matched 3060-versus-candidate FPS result or current-offer winner is established. Candidate selection remains conditional on the owner’s workload, exact system and complete cost.', 'No benchmark dataset is redistributed; linked original reviews retain their actual test configurations.'] })
];

function wordCount(a) { return [a.title, a.summary, ...a.sections.flatMap(s => [s.title, ...s.paragraphs, ...(s.checklist || []), ...(s.table ? [s.table.caption, ...s.table.headers, ...s.table.rows.flat()] : [])])].join(' ').split(/\s+/).filter(Boolean).length; }
function fingerprint(a) { return crypto.createHash('sha256').update(JSON.stringify({ article: a, sources: Object.fromEntries(a.sourceIds.map(id => [id, sources[id]])) })).digest('hex'); }
function validate(rows = articles, evidence = sources) {
  const errors = [], ids = new Set(), routes = new Set();
  for (const a of rows) {
    if (ids.has(a.id) || routes.has(a.route)) errors.push('Duplicate identity ' + a.id);
    ids.add(a.id); routes.add(a.route);
    if (!/^\/blog\/[a-z0-9-]+\/$/.test(a.route) || a.route !== a.canonicalRoute) errors.push('Invalid canonical ' + a.id);
    if (a.author !== 'PC Part Performance' || a.lifecycle.humanReviewClaimed !== false || a.lifecycle.humanEditorialReview !== null || a.datePublished !== null || a.dateModified !== null) errors.push('Invented attribution/release state ' + a.id);
    if (a.sections.length < 5 || a.sections.some(s => !s.title || s.paragraphs.length < 2)) errors.push('Incomplete guide ' + a.id);
    const refs = [...new Set(a.sections.flatMap(s => s.sourceIds))];
    if (!refs.length || refs.length !== a.sourceIds.length || a.sourceIds.some(id => !refs.includes(id))) errors.push('Evidence list mismatch ' + a.id);
    for (const id of refs) if (!evidence[id] || !/^https:\/\//.test(evidence[id].url) || !evidence[id].scope || !evidence[id].limitations || !evidence[id].inspected) errors.push('Incomplete source ' + id);
    if (a.tools.length < 3 || a.tools.some(t => !/^\/(?!\/)[a-z0-9/?=#.,%&_-]*$/.test(t.href) || !t.label)) errors.push('Invalid next action ' + a.id);
    const prose = a.sections.flatMap(s => s.paragraphs).join(' ');
    if (/\b(?:TODO|TBD|lorem ipsum)\b|we (?:tested|benchmarked)|guaranteed (?:FPS|compatibility)|(?:is|are) 100% compatible/i.test(prose)) errors.push('Unsupported/placeholder prose ' + a.id);
  }
  return { valid: !errors.length, errors, articles: rows.length, words: rows.reduce((n, a) => n + wordCount(a), 0), sources: new Set(rows.flatMap(a => a.sourceIds)).size };
}

const gapOverlay = [
  { id: 'L12', article: 'MX01', status: 'source_checked_practical_guide', scope: 'Quiet-workload planning and reversible observation; not an acoustic ranking.' },
  { id: 'L30', article: 'MX02', status: 'source_checked_practical_guide', scope: 'Used-sale identity, inspection evidence, warranty and complete purchase record; not remote health certification.' },
  { id: 'P08', article: 'MX01', status: 'source_checked_planning_guide', scope: 'Compact layout and quiet-goal workflow; a tested quiet parts list is not supplied.' },
  { id: 'P18', article: 'MX03', status: 'source_checked_documentation_comparison', scope: 'Exact CPU/cooler/case conditional fit and service decisions; matched complete-system thermal/acoustic ranking remains unavailable.' },
  { id: 'P20', article: 'MX04', status: 'source_checked_upgrade_decision_guide', scope: 'Exact starting variants, concrete candidates, keep option and evidence/cost conditions; matched uplift and current-price winner remain unavailable.' }
];
module.exports = { evidenceDate, sources, articles, gapOverlay, wordCount, fingerprint, validate };
