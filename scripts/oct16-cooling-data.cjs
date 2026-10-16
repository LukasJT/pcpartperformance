'use strict';

// Exact cooler identities and narrow manufacturer facts. This module does not
// certify a cooler/CPU pairing, acoustic result, installed clearance or thermals.
const CHECKED_AT = '2026-10-16';
const VERSION = '2026-10-16.1';
const modernSockets = ['AM5', 'AM4', 'LGA1851', 'LGA1700'];
const noctuaSockets = [...modernSockets, 'LGA1954', 'LGA1200', 'LGA1150', 'LGA1151', 'LGA1155', 'LGA1156'];
const thermalrightSockets = [...modernSockets, 'LGA1200', 'LGA1150', 'LGA1151', 'LGA1155', 'LGA1156'];
const SOURCES = {
  noctuaD15G2: { publisher: 'Noctua', model: 'NH-D15 G2 (standard)', url: 'https://www.noctua.at/en/products/nh-d15-g2/specifications', scope: 'Current standard brown model: supported sockets, included multi-socket kit, total dimensions and fans. HBC/LBC are distinct variants.' },
  noctuaU12A: { publisher: 'Noctua', model: 'NH-U12A (brown)', url: 'https://www.noctua.at/en/products/nh-u12a/specifications', scope: 'Brown NH-U12A, current product specification and package contents. Not chromax.black or NH-U12S.' },
  noctuaD15Black: { publisher: 'Noctua', model: 'NH-D15 chromax.black', url: 'https://www.noctua.at/en/products/nh-d15-chromax-black/specifications', scope: 'Current page explicitly lists 168 mm with fans and 160 mm without. This record does not inherit the commonly quoted historical 165 mm height or NH-D15 G2 specifications.' },
  noctuaL9AM5: { publisher: 'Noctua', model: 'NH-L9a-AM5 (brown)', url: 'https://www.noctua.at/en/products/nh-l9a-am5/specifications', scope: 'AM5-specific low-profile model, AM5 mounting kit, total dimensions and fan. AM4 and NH-L9i are distinct products. Socket support is not thermal suitability.' },
  thermalrightPS: { publisher: 'Thermalright', model: 'Phantom Spirit 120 SE', url: 'https://www.thermalright.com/product/phantom-spirit-120-se/', scope: 'Non-ARGB Phantom Spirit 120 SE: supported sockets, heatsink dimensions and TL-C12B V2 fan size. Heatsink dimensions are not asserted to include an arbitrarily raised fan.' },
  thermalrightPA: { publisher: 'Thermalright', model: 'Peerless Assassin 120 SE', url: 'https://www.thermalright.com/product/peerless-assassin-120-se/', scope: 'Non-ARGB Peerless Assassin 120 SE: socket support, heatsink dimensions and TL-C12C fan size. Not PA120, SE ARGB or Mini.' },
  thermalrightAX: { publisher: 'Thermalright', model: 'Assassin X 120 Refined SE', url: 'https://www.thermalright.com/product/assassin-x-120-refined-se/', scope: 'Exact non-ARGB model: socket list, heatsink dimensions and TL-C12C fan dimensions. The page also contains an ARGB connector row; lighting is deliberately not asserted.' },
  arctic240: { publisher: 'ARCTIC', model: 'Liquid Freezer III 240 Black / ACFRE00134A', url: 'https://www.arctic.de/en/Liquid-Freezer-III-240/ACFRE00134A', scope: 'Original non-RGB black Liquid Freezer III 240, exact part number: supported sockets, 277 × 120 × 38 mm radiator and two P12 fans. Not III Pro, RGB or B-stock.' },
  arctic360: { publisher: 'ARCTIC', model: 'Liquid Freezer III 360 Black / ACFRE00136A', url: 'https://www.arctic.de/en/Liquid-Freezer-III-360/ACFRE00136A', scope: 'Original non-RGB black Liquid Freezer III 360, exact part number: supported sockets, 398 × 120 × 38 mm radiator and three P12 fans. A separate older 2D drawing lists 397 mm; this record preserves the current product table basis.' },
  arctic420: { publisher: 'ARCTIC', model: 'Liquid Freezer III 420 Black / ACFRE00137A', url: 'https://www.arctic.de/en/Liquid-Freezer-III-420/ACFRE00137A', scope: 'Original non-RGB black Liquid Freezer III 420, exact part number: supported sockets, 458 × 138 × 38 mm radiator and three P14 fans. Nominal 420 mm is not physical length.' },
  arcticManual: { publisher: 'ARCTIC', model: 'Liquid Freezer III 240 installation manual', url: 'https://support.arctic.de/liquid-freezer-III-240/', scope: 'Exact 240 installation paths for AMD AM5/AM4 and Intel LGA1851/1700, contact-frame procedure, cables and packaging. Not a machine-verified installation or a substitute for the manual.' },
  arcticBoardFit: { publisher: 'ARCTIC', model: 'Liquid Freezer III motherboard compatibility list', url: 'https://support.arctic.de/lf3-compatibility', scope: 'Manufacturer documents exact-board pump/M.2-heatsink interference and unsupported boards. No universal motherboard compatibility is inferred from socket support.' },
  corsair240: { publisher: 'CORSAIR', model: 'NAUTILUS 240 RS Black / CW-9060088-WW', url: 'https://www.corsair.com/us/en/p/cpu-coolers/cw-9060088-ww/nautilus-240-rs-liquid-cpu-cooler-cw-9060088-ww', scope: 'Exact non-ARGB black 240 model: four supported sockets, nominal radiator size and tube length. Generic Product Height/Width values are not treated as verified radiator thickness.' },
  corsair360: { publisher: 'CORSAIR', model: 'NAUTILUS 360 RS Black / CW-9060089-WW', url: 'https://www.corsair.com/us/en/p/cpu-coolers/cw-9060089-ww/nautilus-360-rs-liquid-cpu-cooler-cw-9060089-ww', scope: 'Exact non-ARGB black 360 model: four supported sockets, nominal radiator size and tube length. Product length is not converted into a full radiator-fit claim.' },
  corsairManual: { publisher: 'CORSAIR', model: 'NAUTILUS 240 | 360 RS quick-start guide', url: 'https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/nautilus-240-360-rs/', scope: 'Explicit included LGA1851/1700 and AM5/AM4 hardware; two RS fans for 240, three for 360. OEM AMD motherboard backplate and case layout must still be checked.' },
  amd9800: { publisher: 'AMD', model: 'Ryzen 7 9800X3D boxed / 100-100001084WOF', url: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html', scope: 'Processor-in-box thermal solution: not included. Manufacturer recommends liquid cooling; this does not establish that every AIO is suitable or an air cooler cannot work.' },
  amd7800: { publisher: 'AMD', model: 'Ryzen 7 7800X3D boxed / 100-100000910WOF', url: 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html', scope: 'Processor-in-box thermal solution: not included. Manufacturer recommends liquid cooling; no measured cooler performance is inferred.' },
  amd7600: { publisher: 'AMD', model: 'Ryzen 5 7600 boxed / 100-100001015BOX', url: 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html', scope: 'Exact boxed model lists AMD Wraith Stealth. Does not prove an OEM, tray or second-hand listing includes it or certify case fit.' }
};
for (const source of Object.values(SOURCES)) source.checked = CHECKED_AT;

const FACTS = {};
const fact = (value, sourceId, condition, extra = {}) => ({ value, source: SOURCES[sourceId].url, publisher: SOURCES[sourceId].publisher, checked: CHECKED_AT, model: SOURCES[sourceId].model, status: value === null ? 'unknown' : 'manufacturer-specified', exact: value !== null, ...(condition ? { condition } : {}), ...extra });
const sharedLimitations = ['A socket match checks only the documented mounting platform; it does not certify thermal performance.', 'Confirm the exact motherboard, memory, case layout, fan position and supplied kit before assembly.', 'No acoustic measurement, cooler wattage guarantee, verified 3D geometry or current price is supplied by this record.'];

function air({ id, name, brand, sourceId, sockets, size, height, heatsinkHeight = height, heightBasis = 'manufacturer height with supplied fan(s)', fanSize, fanCount, includedSockets = null, notes, sku = null, image = null }) {
  const source = SOURCES[sourceId];
  const cooler = {
    type: 'air', supportedSockets: [...sockets], includedMounting: includedSockets ? [...includedSockets] : null,
    mountingKitIncluded: brand === 'Noctua' ? true : null,
    heightMm: height, heatsinkHeightMm: heatsinkHeight, dimensionsMm: size,
    heightBasis, radiator: null, fanSizeMm: fanSize, fanCount,
    ramClearanceMm: null, thermalSuitability: null, motherboardFit: null,
    mountingNotes: notes, limitations: [...sharedLimitations]
  };
  const fields = {
    coolingType: fact('air', sourceId), supportedSockets: fact([...sockets], sourceId, 'Supported mounting platforms only; exact board, CPU thermal requirements and supplied hardware remain separate checks.'),
    installedHeight: fact(height, sourceId, height === null ? 'Only heatsink height is documented in the inspected table; installed fan height has not been established.' : 'Nominal manufacturer height in the documented fan position. Raising a fan for memory can increase the installed height.'),
    heatsinkHeight: fact(heatsinkHeight, sourceId, 'Heatsink height; do not substitute for a documented installed assembly height.'),
    mountingIncluded: fact(cooler.includedMounting, sourceId, includedSockets ? 'Current stated retail package only; inspect the actual package, especially used or older stock.' : 'A socket support list or generic kit name does not independently establish every kit supplied with an older/used unit.'),
    ramClearance: fact(null, sourceId, 'No unconditional RAM-height limit was verified for this exact assembled configuration.'),
    coolerThermalSuitability: fact(null, sourceId, 'No performance test for the selected CPU/workload has been recorded.')
  };
  FACTS[id] = fields;
  return { id, name, model: name, brand, cat: 'cooler', source: source.url, sku, skuKind: sku ? 'manufacturer-part-number' : null, year: null,
    architecture: 'CPU air cooler', summary: `${height === null ? heatsinkHeight + ' mm heatsink; installed fan height to check' : height + ' mm nominal height'} · ${fanSize} mm fan`,
    specs: { 'Cooling type': 'Air', 'Supported sockets': [...sockets], 'Cooler height': height, 'Heatsink height': heatsinkHeight, 'Fan size': fanSize, 'Fan count': fanCount, 'RAM clearance': null },
    cooler, evidence: { checkedAt: CHECKED_AT, sourceIds: [sourceId], fields }, ...(image ? { manufacturerImage: { url: image, sourceUrl: source.url, picturedModel: name, rightsStatus: 'Manufacturer product image; redistribution license not independently confirmed' } } : {}) };
}

function aio({ id, name, brand, sku, sourceId, nominal, radiator, fanSize, fanCount, tubeLength, includedSockets = null, mountingSourceId = sourceId, notes }) {
  const source = SOURCES[sourceId];
  const cooler = { type: 'aio', supportedSockets: [...modernSockets], includedMounting: includedSockets ? [...includedSockets] : null, mountingKitIncluded: includedSockets ? true : null,
    heightMm: null, heatsinkHeightMm: null, dimensionsMm: null, heightBasis: null,
    radiator: { nominalSizeMm: nominal, lengthMm: radiator?.[0] ?? null, widthMm: radiator?.[1] ?? null, thicknessMm: radiator?.[2] ?? null, fanSizeMm: fanSize, fanCount, assemblyThicknessMm: null },
    fanSizeMm: fanSize, fanCount, tubeLengthMm: tubeLength, ramClearanceMm: null, thermalSuitability: null, motherboardFit: null,
    mountingNotes: notes, limitations: [...sharedLimitations, 'A nominal radiator size is not physical length or proof that the radiator, fans, tubes and motherboard fit together.'] };
  const fields = {
    coolingType: fact('aio', sourceId), supportedSockets: fact([...modernSockets], sourceId, 'Socket support does not establish pump-body/motherboard compatibility or CPU cooling performance.'),
    installedHeight: fact(null, sourceId, 'AIO pump/radiator geometry cannot be checked using the case air-cooler-height limit.'),
    mountingIncluded: fact(cooler.includedMounting, mountingSourceId, includedSockets ? 'Explicit current retail package hardware; the actual kit and original motherboard backplate still need inspection.' : 'Mounting platform support is documented; exact supplied inventory is not separately verified here.'),
    radiatorSize: fact(nominal, sourceId, 'Nominal fan-layout class, not physical radiator length or a complete installation envelope.'),
    radiatorLength: fact(cooler.radiator.lengthMm, sourceId, 'Bare radiator product-table dimension; fan stack, fittings and tube bend requirements are additional.'),
    radiatorWidth: fact(cooler.radiator.widthMm, sourceId), radiatorThickness: fact(cooler.radiator.thicknessMm, sourceId),
    radiatorAssemblyThickness: fact(null, sourceId, 'Bare radiator thickness does not include fans, screw heads or mounting offsets.'),
    coolerThermalSuitability: fact(null, sourceId, 'No approved measurement for the selected CPU, case and workload has been recorded.')
  };
  FACTS[id] = fields;
  return { id, name, model: name, brand, cat: 'cooler', source: source.url, sku, skuKind: 'manufacturer-part-number', year: null,
    architecture: 'All-in-one liquid CPU cooler', summary: `${nominal} mm radiator class · ${fanCount} × ${fanSize} mm fans`,
    specs: { 'Cooling type': 'AIO liquid', 'Supported sockets': [...modernSockets], 'Radiator size': nominal, 'Radiator length': cooler.radiator.lengthMm, 'Radiator width': cooler.radiator.widthMm, 'Radiator thickness': cooler.radiator.thicknessMm, 'Fan size': fanSize, 'Fan count': fanCount, 'Tube length': tubeLength },
    cooler, evidence: { checkedAt: CHECKED_AT, sourceIds: [...new Set([sourceId, mountingSourceId, ...(brand === 'ARCTIC' ? ['arcticBoardFit'] : [])])], fields } };
}

const COOLERS = [
  air({ id: 'cooler-noctua-nh-d15-g2', name: 'NH-D15 G2', brand: 'Noctua', sourceId: 'noctuaD15G2', sockets: noctuaSockets, height: 168, size: { width: 150, depth: 152, height: 168, basis: 'with supplied fans in specified position' }, fanSize: 140, fanCount: 2, notes: 'Standard base-convexity brown version. The current box lists SecuFirm2+ hardware; inspect the exact socket kit and use the corresponding manufacturer instructions. No inherited HBC/LBC support or performance ranking.' }),
  air({ id: 'cooler-noctua-nh-u12a', name: 'NH-U12A', brand: 'Noctua', sourceId: 'noctuaU12A', sockets: noctuaSockets, height: 158, size: { width: 125, depth: 112, height: 158, basis: 'with supplied fans in specified position' }, fanSize: 120, fanCount: 2, notes: 'Brown NH-U12A. Current delivery includes a SecuFirm2 kit; confirm the kit version for the exact socket, particularly second-hand or older inventory.' }),
  air({ id: 'cooler-noctua-nh-d15-chromax-black', name: 'NH-D15 chromax.black', brand: 'Noctua', sourceId: 'noctuaD15Black', sockets: noctuaSockets, height: 168, heatsinkHeight: 160, size: { width: 150, depth: 161, height: 168, basis: 'current product table with supplied fans' }, fanSize: 140, fanCount: 2, notes: 'Current specification table says 168 mm with fans; do not silently substitute the historical 165 mm figure. Check the actual retail revision, front-fan position and memory clearance.' }),
  air({ id: 'cooler-noctua-nh-l9a-am5', name: 'NH-L9a-AM5', brand: 'Noctua', sourceId: 'noctuaL9AM5', sockets: ['AM5'], includedSockets: ['AM5'], height: 37, heatsinkHeight: 23, size: { width: 114, depth: 92, height: 37, basis: 'with supplied 14 mm fan' }, fanSize: 92, fanCount: 1, notes: 'AM5-only model with an explicit SecuFirm2 AM5 kit. Noctua warns against high-heat-load CPUs: a socket match is not a recommendation for every AM5 processor. Check Noctua CPU compatibility before buying.' }),
  air({ id: 'cooler-thermalright-phantom-spirit-120-se', name: 'Phantom Spirit 120 SE', brand: 'Thermalright', sourceId: 'thermalrightPS', sockets: thermalrightSockets, height: null, heatsinkHeight: 154, size: { width: 125, depth: 110, height: 154, basis: 'heatsink table only; supplied fan installation envelope not separately verified' }, fanSize: 120, fanCount: null, notes: 'Non-ARGB SE model. The manufacturer table documents a 154 mm heatsink and 120 × 120 × 25 mm fan; total installed fan height and exact kit inventory need confirmation. LGA115X is normalized to the four established LGA1150/1151/1155/1156 sockets.', image: 'https://www.thermalright.com/wp-content/uploads/2026/08/phantom-spirit-120-se.png' }),
  air({ id: 'cooler-thermalright-peerless-assassin-120-se', name: 'Peerless Assassin 120 SE', brand: 'Thermalright', sourceId: 'thermalrightPA', sockets: thermalrightSockets, height: null, heatsinkHeight: 155, size: { width: 110, depth: 125, height: 155, basis: 'manufacturer L125 × W110 × H155 heatsink table; not full fan envelope' }, fanSize: 120, fanCount: null, notes: 'Non-ARGB SE model. This source labels its dimensions as heatsink dimensions, so installed-fan height is not certified. Verify supplied mounting parts and RAM/fan clearance.', image: 'https://www.thermalright.com/wp-content/uploads/2026/08/peerless-assassin-120-se.png' }),
  air({ id: 'cooler-thermalright-assassin-x-120-refined-se', name: 'Assassin X 120 Refined SE', brand: 'Thermalright', sourceId: 'thermalrightAX', sockets: thermalrightSockets, height: null, heatsinkHeight: 148, size: { width: 46, depth: 120, height: 148, basis: 'manufacturer L120 × W46 × H148 heatsink table; orientation follows the source labels' }, fanSize: 120, fanCount: null, notes: 'Exact Refined SE model. The source has an inconsistent ARGB connector row; no lighting claim is imported. Full fan envelope, motherboard clearance and package inventory remain to check.', image: 'https://www.thermalright.com/wp-content/uploads/2026/08/assassin-x-120-refined-se.png' }),
  aio({ id: 'cooler-arctic-liquid-freezer-iii-240-black', name: 'Liquid Freezer III 240 Black', brand: 'ARCTIC', sku: 'ACFRE00134A', sourceId: 'arctic240', nominal: 240, radiator: [277, 120, 38], fanSize: 120, fanCount: 2, tubeLength: 450, notes: 'Original black non-RGB version. Check ARCTIC exact-motherboard pump/M.2 fit and the case mounting location. Intel installation uses the manufacturer contact-frame procedure; follow the exact manual, not a generic socket-only instruction.' }),
  aio({ id: 'cooler-arctic-liquid-freezer-iii-360-black', name: 'Liquid Freezer III 360 Black', brand: 'ARCTIC', sku: 'ACFRE00136A', sourceId: 'arctic360', nominal: 360, radiator: [398, 120, 38], fanSize: 120, fanCount: 3, tubeLength: 450, notes: 'Original black non-RGB version. Current product table says 398 mm radiator length while an older 2D drawing says 397 mm; confirm the exact physical unit. Check motherboard pump/M.2 conflicts and complete radiator/fan/tube envelope.' }),
  aio({ id: 'cooler-arctic-liquid-freezer-iii-420-black', name: 'Liquid Freezer III 420 Black', brand: 'ARCTIC', sku: 'ACFRE00137A', sourceId: 'arctic420', nominal: 420, radiator: [458, 138, 38], fanSize: 140, fanCount: 3, tubeLength: 450, notes: 'Original black non-RGB version. The 420 label denotes three 140 mm fan positions; actual radiator length is 458 mm. Confirm complete layout and exact motherboard compatibility.' }),
  aio({ id: 'cooler-corsair-nautilus-240-rs-black', name: 'NAUTILUS 240 RS Black', brand: 'CORSAIR', sku: 'CW-9060088-WW', sourceId: 'corsair240', mountingSourceId: 'corsairManual', nominal: 240, radiator: null, fanSize: 120, fanCount: 2, tubeLength: 400, includedSockets: modernSockets, notes: 'Non-ARGB RS model. The quick-start guide explicitly lists Intel and AMD hardware. Keep the AMD backplate required by the instructions. Ambiguous generic product dimensions were not converted into radiator thickness or fit.' }),
  aio({ id: 'cooler-corsair-nautilus-360-rs-black', name: 'NAUTILUS 360 RS Black', brand: 'CORSAIR', sku: 'CW-9060089-WW', sourceId: 'corsair360', mountingSourceId: 'corsairManual', nominal: 360, radiator: null, fanSize: 120, fanCount: 3, tubeLength: 450, includedSockets: modernSockets, notes: 'Non-ARGB RS model. Both Intel LGA1851/1700 and AMD AM5/AM4 hardware are itemized in the current guide. Verify full case radiator/fan clearance; no thickness is inferred from the generic 125 mm Product Height field.' })
];

const BOXED_CPU_FACTS = {
  '9800x3d': { includedCooler: fact(false, 'amd9800', 'Applies to the exact boxed 100-100001084WOF listing. A separate cooler is required.'), coolerRecommendation: fact('Liquid cooler recommended by AMD', 'amd9800', 'Manufacturer recommendation, not a measured result or a guarantee for a particular cooler.') },
  '7800x3d': { includedCooler: fact(false, 'amd7800', 'Applies to the exact boxed 100-100000910WOF listing. A separate cooler is required.'), coolerRecommendation: fact('Liquid cooler recommended by AMD', 'amd7800', 'Manufacturer recommendation, not a claim that all air coolers are incompatible.') },
  '7600': { includedCooler: fact(true, 'amd7600', 'Boxed 100-100001015BOX only. Catalog identity alone does not establish that an OEM, tray, used or incomplete package contains this cooler.', { packaging: 'boxed', exactSku: '100-100001015BOX' }), includedCoolerModel: fact('AMD Wraith Stealth', 'amd7600', 'Verify the actual supplied cooler, mounting hardware and installed case clearance; no height or acoustic claim is supplied.') }
};

function validateCatalog(records = COOLERS) {
  const issues = [], ids = new Set(), identities = new Set();
  if (!Array.isArray(records)) return ['Cooler catalog must be an array'];
  const allowedHosts = new Set(['www.noctua.at', 'www.thermalright.com', 'www.arctic.de', 'www.corsair.com']);
  const validPositiveOrNull = value => value === null || (typeof value === 'number' && Number.isFinite(value) && value > 0);
  for (const part of records) {
    if (!part || typeof part !== 'object') { issues.push('Invalid cooler record'); continue; }
    if (!/^cooler-[a-z0-9-]+$/.test(part.id || '') || ids.has(part.id)) issues.push(`Invalid or duplicate ID: ${part.id}`);
    ids.add(part.id);
    const identity = `${part.brand}:${part.model}:${part.sku || ''}`;
    if (identities.has(identity)) issues.push(`Duplicate exact cooler identity: ${identity}`);
    identities.add(identity);
    let url;
    try { url = new URL(part.source); } catch { /* reported below */ }
    if (!url || url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) issues.push(`Unapproved source: ${part.id}`);
    if (part.cat !== 'cooler' || !part.name || part.model !== part.name || !['air', 'aio'].includes(part.cooler?.type)) issues.push(`Invalid identity/type: ${part.id}`);
    const sockets = Array.isArray(part.cooler?.supportedSockets) ? part.cooler.supportedSockets : [];
    if (!sockets.length || new Set(sockets).size !== sockets.length || sockets.some(socket => typeof socket !== 'string' || !/^(AM[45]|LGA\d{3,4})$/.test(socket))) issues.push(`Invalid socket list: ${part.id}`);
    if (part.cooler?.includedMounting !== null && (!Array.isArray(part.cooler?.includedMounting) || part.cooler.includedMounting.some(socket => !sockets.includes(socket)))) issues.push(`Unsupported kit claim: ${part.id}`);
    if (!validPositiveOrNull(part.cooler?.heightMm) || !validPositiveOrNull(part.cooler?.ramClearanceMm) || !validPositiveOrNull(part.cooler?.fanCount)) issues.push(`Unknown dimension/count must be null: ${part.id}`);
    if (part.cooler?.type === 'aio') {
      if (part.cooler.heightMm !== null || !part.cooler.radiator) issues.push(`Invalid AIO geometry: ${part.id}`);
      for (const key of ['nominalSizeMm', 'lengthMm', 'widthMm', 'thicknessMm', 'assemblyThicknessMm']) if (!validPositiveOrNull(part.cooler.radiator[key])) issues.push(`Invalid radiator ${key}: ${part.id}`);
    }
    const sourceIds = Array.isArray(part.evidence?.sourceIds) ? part.evidence.sourceIds : [];
    if (part.evidence?.checkedAt !== CHECKED_AT || !sourceIds.length || !sourceIds.every(id => SOURCES[id])) issues.push(`Missing source/date: ${part.id}`);
    for (const [key, value] of Object.entries(part.evidence?.fields || {})) {
      if (!value || typeof value !== 'object') { issues.push(`Invalid fact record: ${part.id}/${key}`); continue; }
      if (value.value === null && (value.status !== 'unknown' || value.exact !== false)) issues.push(`Unknown marked verified: ${part.id}/${key}`);
      if (value.value !== null && (value.status !== 'manufacturer-specified' || value.exact !== true || !value.source || value.checked !== CHECKED_AT)) issues.push(`Invalid sourced fact: ${part.id}/${key}`);
    }
  }
  return issues;
}

function getCooler(id) { return COOLERS.find(part => part.id === id) || null; }
function evidencePacket() {
  return { schema: 1, version: VERSION, checkedAt: CHECKED_AT, scope: '12 exact CPU cooler identities; 7 air / 5 AIO; narrow manufacturer facts only',
    verification: { method: 'Codex inspection of official product tables and the linked Corsair/ARCTIC manuals', humanEditorialReview: null, measuredThermalTests: 0, manufacturerCertifiedBuilds: 0 },
    sources: SOURCES, coolers: COOLERS, boxedCpuFacts: BOXED_CPU_FACTS,
    unresolved: ['Full installed-fan height for the three Thermalright records.', 'Radiator physical dimensions for both Corsair records.', 'Exact supplied socket-kit inventory for older or used units.', 'Per-build motherboard, RAM, tubes, headers, mounting location and cooling performance.', 'No new exact 3D asset or license is represented by these records.'] };
}

module.exports = { VERSION, CHECKED_AT, SOURCES, COOLERS, FACTS, BOXED_CPU_FACTS, getCooler, validateCatalog, evidencePacket };

if (require.main === module) {
  const issues = validateCatalog();
  if (issues.length) throw new Error(issues.join('\n'));
  const fs = require('node:fs'), path = require('node:path');
  const file = path.resolve(__dirname, '../docs/transformation-oct16/cooling-evidence.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(evidencePacket(), null, 2) + '\n');
  console.log(`Cooling evidence: ${COOLERS.length} exact models, ${Object.keys(SOURCES).length} official source records, no thermal or installed-fit guarantee.`);
}
