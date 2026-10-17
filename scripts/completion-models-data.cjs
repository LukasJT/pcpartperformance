'use strict';

// Reviewed acquisition additions, deliberately separate from generated manifests.
// These are artist appearances. None is certified CAD or an automated fit test.
const path = require('node:path');
const CHECKED = '2026-10-16';
const candidates = require('./completion-models-candidates.json');
const acquired = require('../docs/master-completion/models/acquisition.json').assets;
const validation = require('../docs/master-completion/models/validation.json');

const SOURCES = {
  amd7600: { publisher: 'AMD', model: 'Ryzen 5 7600 boxed / 100-100001015BOX', url: 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-5-7600.html', scope: 'AM5 boxed processor lists Wraith Stealth. Does not establish all revisions, cooler dimensions, independent kit inventory or suitability for another CPU.' },
  msi1660: { publisher: 'MSI', model: 'GeForce GTX 1660 GAMING X 6G', url: 'https://www.msi.com/Graphics-Card/GeForce-GTX-1660-GAMING-X-6G/Specification', scope: 'Exact 6 GB GDDR5 card: published dimensions, nominal board power and connector. Not GTX 1660 SUPER or Ti.' },
  msiZ590: { publisher: 'MSI', model: 'MEG Z590 ACE GOLD EDITION', url: 'https://www.msi.com/Motherboard/MEG-Z590-ACE-GOLD-EDITION/Specification', scope: 'LGA1200, DDR4, DIMMs, capacity and ATX dimensions. M.2 availability and lane sharing are conditional; no automatic BIOS pass.' },
  asusZ170: { publisher: 'ASUS', model: 'Z170-P manual E12045, revised V3 September 2016', url: 'https://dlcdnets.asus.com/pub/ASUS/mb/LGA1151/Z170-P/E12045_Z170-P_UM_V3_WEB.pdf', scope: 'Exact original Z170-P: LGA1151, DDR4, four DIMMs, published 64 GB limit, four SATA ports, one conditional SATA/PCIe M.2 slot, ATX 305 × 224 mm. Not Z170-P D3.' },
  asusZ170Cpu: { publisher: 'ASUS', model: 'Z170-P exact processor support list', url: 'https://www.asus.com/us/supportonly/z170p/helpdesk_cpu/', scope: 'Exact processor/revision/minimum BIOS rows require inspection; no compatible BIOS is inferred from LGA1151.' },
  gigabyteTrx40: { publisher: 'GIGABYTE', model: 'TRX40 AORUS XTREME rev. 1.0', url: 'https://www.gigabyte.com/Motherboard/TRX40-AORUS-XTREME-rev-10/sp', scope: 'Exact rev. 1.0 specification: sTRX4, DDR4, eight DIMMs, 256 GB and XL-ATX 325 × 275 mm. Creator does not identify model PCB revision; the mesh includes a processor.' },
  corsair200r: { publisher: 'CORSAIR', model: 'Carbide Series 200R / CC-9011023-WW', url: 'https://www.corsair.com/us/en/p/pc-cases/cc-9011023-ww/carbide-series-200r-compact-atx-case-cc-9011023-ww', scope: 'Exact black 200R: supported boards, nominal cooler/GPU/PSU allowances, seven slots. Full outer dimensions and an assembled internal layout were not verified here.' },
  coolerMasterIdentity: { publisher: 'Cooler Master', model: 'MasterBox Lite 5 spare-parts collection', url: 'https://store.coolermaster.eu/collections/masterbox-lite-5', scope: 'Manufacturer store establishes product identity. It does not supply a complete original-case specification or confirm the artist model SKU. Original product page currently returns 404.' },
  intelI5Family: { publisher: 'Intel', model: 'Core i5 desktop processor support, article 000006047', url: 'https://www.intel.com/content/www/us/en/support/articles/000006047/processors.html', scope: 'Intel identifies Core i5-6xx series as LGA1156 with DDR3. Exact i5-661 ARK page returned 403; core counts, clocks, power and package dimensions remain unverified in this batch.' },
  titanRtx: { publisher: 'NVIDIA', model: 'NVIDIA TITAN RTX', url: 'https://www.nvidia.com/en-us/titan/titan-rtx/', scope: '24 GB GDDR6, Turing, two 8-pin connectors, 280 W nominal TDP and 650 W recommended system PSU. No present-day speed claim is inherited from historical marketing.' },
  titanSheet: { publisher: 'NVIDIA', model: 'TITAN RTX creator product overview, May 2019', url: 'https://www.nvidia.com/content/dam/en-zz/Solutions/titan/documents/titan-rtx-for-creators-us-nvidia-1011126-r6-web.pdf', scope: 'Nominal 10.5-inch length and 4.4-inch height, dual-slot. Converted to 266.7 × 111.76 mm; exact bracket/cable/thickness envelope is not documented by those two dimensions.' }
};
for (const source of Object.values(SOURCES)) source.checked = CHECKED;
const field = (value, sourceId, condition = '') => ({ value, source: SOURCES[sourceId].url, publisher: SOURCES[sourceId].publisher, model: SOURCES[sourceId].model, checked: CHECKED, status: value === null ? 'unknown' : 'manufacturer-specified', exact: value !== null, ...(condition ? { condition } : {}) });
const evidence = (sourceIds, fields) => ({ checkedAt: CHECKED, sourceIds, fields });
const catalog = (id, name, brand, cat, sourceId, more) => ({ id, name, model: name, brand, cat, source: SOURCES[sourceId].url, year: null, sku: null, builderEligible: true, catalogOrigin: 'completion-models-2026-10-16', ...more });

const CATALOG_ADDITIONS = [
  catalog('cooler-amd-wraith-stealth', 'AMD Wraith Stealth', 'AMD', 'cooler', 'amd7600', {
    architecture: 'CPU air cooler', summary: 'Stock air cooler supplied with the boxed Ryzen 5 7600',
    specs: { 'Cooling type': 'Air', 'Supported sockets': ['AM5'], 'Cooler height': null, 'Fan size': null },
    cooler: { type: 'air', supportedSockets: ['AM5'], includedMounting: null, heightMm: null, heatsinkHeightMm: null, dimensionsMm: null, fanSizeMm: null, fanCount: null, ramClearanceMm: null, thermalSuitability: null, mountingNotes: 'AM5 use is documented with the exact boxed Ryzen 5 7600. Inspect the actual stock-cooler revision and mounting hardware. No other platform or CPU thermal claim is made.' },
    evidence: evidence(['amd7600'], { coolingType: field('air', 'amd7600'), supportedSockets: field(['AM5'], 'amd7600', 'Documented use with the boxed Ryzen 5 7600, not universal cooler thermal suitability.'), installedHeight: field(null, 'amd7600', 'Manufacturer installed assembly dimensions were not verified.'), mountingIncluded: field(null, 'amd7600', 'Exact loose-cooler kit inventory is unknown.') })
  }),
  catalog('retail-msi-geforce-gtx-1660-gaming-x-6g', 'GeForce GTX 1660 GAMING X 6G', 'MSI', 'gpu', 'msi1660', {
    baseModel: 'gtx1660', architecture: 'Turing', summary: '6 GB GDDR5 · dual-fan MSI card',
    specs: { 'Memory': 6, 'Memory type': 'GDDR5', 'Memory bus': 192, 'Board power': 130, 'Card length': 247, 'Card height': 127, 'Card thickness': 46, 'Recommended PSU': 450 },
    evidence: evidence(['msi1660'], { gpuLength: field(247, 'msi1660'), gpuHeight: field(127, 'msi1660'), gpuThickness: field(46, 'msi1660'), gpuPower: field(130, 'msi1660'), connectors: field('1 × PCIe 8-pin', 'msi1660'), recommendedPsu: field(450, 'msi1660', 'Manufacturer system PSU recommendation; not a measured total system load.') })
  }),
  catalog('retail-msi-meg-z590-ace-gold-edition', 'MEG Z590 ACE GOLD EDITION', 'MSI', 'board', 'msiZ590', {
    architecture: 'Intel Z590 · LGA1200', summary: 'ATX · DDR4 · four DIMM slots',
    specs: { 'Socket': 'LGA1200', 'DDR generation': 'DDR4', 'DIMM slots': 4, 'Max RAM': 128, 'Form factor': 'ATX', 'SATA ports': 6, 'M.2 slots': 4 },
    note: 'Four nominal M.2 positions are conditional. M2_1 requires an 11th-generation processor. M2_2/M2_3 can disable SATA ports; M2_4 shares PCIe resources. Check the exact manual and BIOS support list.',
    evidence: evidence(['msiZ590'], { socket: field('LGA1200', 'msiZ590'), ddr: field('DDR4', 'msiZ590'), modules: field(4, 'msiZ590'), memoryMax: field(128, 'msiZ590'), form: field('ATX', 'msiZ590'), boardLength: field(305, 'msiZ590'), boardWidth: field(244, 'msiZ590'), sata: field(6, 'msiZ590', 'Lane-sharing conditions can disable SATA ports.'), m2: field(null, 'msiZ590', 'Nominal four positions are not four unconditionally usable NVMe connections.') })
  }),
  catalog('retail-asus-z170-p', 'Z170-P', 'ASUS', 'board', 'asusZ170', {
    architecture: 'Intel Z170 · LGA1151', summary: 'ATX · DDR4 · four DIMM slots',
    specs: { 'Socket': 'LGA1151', 'DDR generation': 'DDR4', 'DIMM slots': 4, 'Max RAM': 64, 'Form factor': 'ATX', 'SATA ports': 4, 'M.2 slots': 1 },
    note: 'Original DDR4 Z170-P. Matching LGA1151 alone does not establish processor/BIOS support. One M.2 socket supports documented SATA/PCIe configurations; check lane sharing. Artist preview is a scan of a used board described as broken.',
    evidence: evidence(['asusZ170', 'asusZ170Cpu'], { socket: field('LGA1151', 'asusZ170'), ddr: field('DDR4', 'asusZ170'), modules: field(4, 'asusZ170'), memoryMax: field(64, 'asusZ170', 'Published limit in the inspected September 2016 V3 manual.'), form: field('ATX', 'asusZ170'), boardLength: field(305, 'asusZ170'), boardWidth: field(224, 'asusZ170'), sata: field(4, 'asusZ170'), m2: field(1, 'asusZ170', 'Confirm SATA/PCIe configuration and sharing from the manual.') })
  }),
  catalog('retail-gigabyte-trx40-aorus-xtreme-rev-1-0', 'TRX40 AORUS XTREME rev. 1.0', 'GIGABYTE', 'board', 'gigabyteTrx40', {
    architecture: 'AMD TRX40 · sTRX4', summary: 'XL-ATX · DDR4 · eight DIMM slots',
    specs: { 'Socket': 'sTRX4', 'DDR generation': 'DDR4', 'DIMM slots': 8, 'Max RAM': 256, 'Form factor': 'XL-ATX' },
    note: 'Exact catalog specifications refer to rev. 1.0. The third-party 3D model does not identify its PCB revision and contains an installed Threadripper; it does not render the user-selected CPU.',
    evidence: evidence(['gigabyteTrx40'], { socket: field('sTRX4', 'gigabyteTrx40'), ddr: field('DDR4', 'gigabyteTrx40'), modules: field(8, 'gigabyteTrx40'), memoryMax: field(256, 'gigabyteTrx40'), form: field('XL-ATX', 'gigabyteTrx40'), boardLength: field(325, 'gigabyteTrx40'), boardWidth: field(275, 'gigabyteTrx40') })
  }),
  catalog('retail-corsair-carbide-200r-black', 'Carbide Series 200R', 'CORSAIR', 'case', 'corsair200r', {
    sku: 'CC-9011023-WW', skuKind: 'manufacturer-part-number', architecture: 'ATX mid-tower', summary: 'Black steel case · seven expansion slots',
    specs: { 'Form factor': 'ATX mid-tower', 'Maximum CPU cooler height': 165, 'Maximum GPU length': 420, 'Maximum PSU length': 200, 'Expansion slots': 7 },
    note: 'Nominal allowances are manufacturer specifications, not a combined fit guarantee. Verify drive cages, radiator placement and power-cable space. The artist model is a basic exterior; optical faceplates do not prove optical drives are supplied.',
    evidence: evidence(['corsair200r'], { forms: field(['ATX', 'MICRO-ATX', 'MINI-ITX'], 'corsair200r'), coolerHeightMax: field(165, 'corsair200r'), gpuLengthMax: field(420, 'corsair200r', 'Nominal maximum; exact cage, fan and radiator configuration still needs checking.'), psuLengthMax: field(200, 'corsair200r', 'Body allowance; cable-routing space is separate.'), psuFormats: field(['ATX'], 'corsair200r') })
  }),
  catalog('retail-cooler-master-masterbox-lite-5', 'MasterBox Lite 5', 'Cooler Master', 'case', 'coolerMasterIdentity', {
    builderEligible: false, indexable: false, architecture: 'Case appearance reference', summary: 'Artist model; exact SKU and installed fit to verify', specs: {},
    note: 'Reference-only catalog addition. Manufacturer spare-parts page confirms the model family; a full original-case specification was not retrieved. Creator model is very low detail and untextured. Do not infer RGB variant, exact SKU or calibrated dimensions.',
    evidence: evidence(['coolerMasterIdentity'], { forms: field(null, 'coolerMasterIdentity'), coolerHeightMax: field(null, 'coolerMasterIdentity'), gpuLengthMax: field(null, 'coolerMasterIdentity') })
  }),
  catalog('completion-cpu-intel-core-i5-661', 'Core i5-661', 'Intel', 'cpu', 'intelI5Family', {
    builderEligible: false, indexable: false, architecture: 'Legacy Core i5-6xx', summary: 'Legacy desktop processor appearance reference',
    specs: { 'Socket': 'LGA1156', 'DDR generation': 'DDR3', 'Cores': null, 'Threads': null, 'Boost clock': null, 'TDP': null },
    note: 'Exact name is visible on the creator model. Intel family documentation confirms the i5-6xx platform, while the exact ARK page returned 403. Detailed processor specifications and package dimensions remain unknown. Not offered as a new-build recommendation.',
    evidence: evidence(['intelI5Family'], { socket: field('LGA1156', 'intelI5Family', 'Intel published i5-6xx family mapping; no exact board BIOS support is established.'), ddr: field('DDR3', 'intelI5Family'), cpuPower: field(null, 'intelI5Family') })
  })
];

const CATALOG_OVERRIDES = {
  intel4004: { builderEligible: false, usageScope: 'historical-reference', modelNote: 'Historical Intel 4004 DIP-package artist model, not a current desktop socket component.' },
  titanrtx: { evidence: evidence(['titanRtx', 'titanSheet'], { gpuLength: field(266.7, 'titanSheet', 'Converted nominal 10.5-inch card length; mounting bracket and cable envelope are not established.'), gpuHeight: field(111.76, 'titanSheet', 'Converted nominal 4.4-inch card height.'), gpuThickness: field(null, 'titanSheet', 'Dual-slot is not an exact millimeter thickness.'), connectors: field('2 × PCIe 8-pin', 'titanRtx'), gpuPower: field(280, 'titanRtx'), recommendedPsu: field(650, 'titanRtx', 'Manufacturer system recommendation, not measured full-system demand.') }) }
};

const REVIEWS = {
  'cooler-amd-wraith-stealth': { appearance: 'Named AMD Wraith Stealth stock-cooler recreation', caveats: ['Stock-cooler revision is unspecified.', 'Cable extends the source bounding box; cooler body dimensions cannot be inferred from it.', 'No installed height, thermal suitability or complete loose-kit inventory verified.'] },
  'retail-msi-geforce-gtx-1660-gaming-x-6g': { appearance: 'Exact named card photogrammetry with capture base', caveats: ['Green cutting mat is in the same mesh/material as the scanned card.', 'Display the complete capture in isolation; do not place its cutting mat inside an assembled PC.'] },
  'retail-msi-meg-z590-ace-gold-edition': { appearance: 'Named MSI MEG Z590 ACE GOLD EDITION recreation', scaleReference: { axis: 'x', millimeters: 305, sourceId: 'msiZ590', scope: 'Nominal board long edge only; authored thickness and bracket geometry remain uncalibrated.' }, caveats: ['PCB appearance is artist-made; connector positions and exact installed geometry are not certified.', 'Source board lies in the XZ plane; assembler orientation needs a rendered review.'] },
  'retail-asus-z170-p': { appearance: 'Creator-described scan of a used, broken Z170-P', caveats: ['Not a pristine manufacturer model.', 'Scan proportions and surface defects are retained; no exact placement or connector certification.'] },
  'retail-gigabyte-trx40-aorus-xtreme-rev-1-0': { appearance: 'TRX40 AORUS XTREME artist appearance with unspecified PCB revision', identity: 'related-variant', caveats: ['Creator does not state PCB revision; model is not verified specifically as rev. 1.0.', 'Source includes a Threadripper CPU that does not follow the selected CPU.', 'Use as a standalone source scene; do not silently substitute its CPU for a selected component.'] },
  'retail-corsair-carbide-200r-black': { appearance: 'Basic Corsair 200R exterior recreation', caveats: ['Exterior only; no verified interior, standoffs or cable-routing layout.', 'Closed side panel and optical faceplates retained; they are not proof that drives are included.'] },
  'retail-cooler-master-masterbox-lite-5': { appearance: 'Low-detail untextured MasterBox Lite 5 recreation', identity: 'model-needs-verification', caveats: ['Only 321 triangles; no manufacturer color/texture fidelity.', 'Exact retail SKU and revision are unspecified; technical-fit fields remain unknown.'] },
  intel4004: { appearance: 'Historical Intel 4004 DIP-package recreation', usageScope: 'historical-reference', caveats: ['Not a modern desktop CPU.', 'No assembly placement, socket compatibility or package-dimension certification.'] },
  'completion-cpu-intel-core-i5-661': { appearance: 'Named Intel Core i5-661 package recreation', usageScope: 'legacy-reference', caveats: ['Exact ARK specification page could not be retrieved.', 'No package dimensions or performance measurements are inferred from the mesh.'] },
  titanrtx: { appearance: 'Named NVIDIA TITAN RTX recreation', scaleReference: { axis: 'x', millimeters: 266.7, sourceId: 'titanSheet', scope: 'Nominal card length only; full bracket-inclusive model bounds are not calibrated.' }, caveats: ['Two fan tracks removed at the authored default pose; source geometry and textures otherwise retained.', 'Public source snapshot has 95,023 triangles; current creator metadata reports a later 95,214-triangle revision.', 'Creator username changed since the public archive; both original embedded and current attribution are retained.'] }
};

const MODEL_ADDITIONS = candidates.map(item => {
  const source = acquired[item.uid], result = validation.assets.find(row => row.uid === item.uid), review = REVIEWS[item.id];
  if (!source?.output || !review || !result || result.errors !== 0) throw Error('Model did not pass acquisition/review gates: ' + item.id);
  return {
    id: item.id, category: item.category, asset: 'completion/' + item.asset,
    title: item.title, creator: source.creator, creatorUrl: source.creatorUrl,
    sourceUid: item.uid, sourceUrl: source.sourceUrl, sourceDistributionUrl: source.distributionUrl,
    originalAttribution: source.sourceExtras?.author || null,
    license: source.license, licenseUrl: source.licenseUrl, changes: source.modifications,
    identity: review.identity || 'exact-model', appearance: review.appearance,
    reviewed: CHECKED, metadataCheckedAt: source.metadataCheckedAt,
    sha256: source.outputSha256, sourceSha256: source.sourceSha256,
    bytes: source.outputBytes, triangles: source.outputTriangles,
    validated: true, validationErrors: result.errors, validationWarnings: result.warnings,
    clearanceCertified: false, dimensionsMm: null, dimensionStatus: 'Artist proportions retained. No complete verified assembly envelope or calibrated mounting coordinates.',
    placement: 'standalone-only', standaloneOnly: true, buildPlacementReady: false,
    scaleMode: 'uniform-autoframe', orientation: null, ...(review.scaleReference ? { scaleReference: review.scaleReference } : {}),
    usageScope: review.usageScope || 'component-appearance', caveats: review.caveats,
    registrationStatus: 'ready-for-standalone-render-qa'
  };
});

function validatePacket() {
  const errors = [], ids = new Set(), uids = new Set(), files = new Set();
  for (const model of MODEL_ADDITIONS) {
    const inspected = validation.assets.find(asset => asset.uid === model.sourceUid);
    if (ids.has(model.id) || uids.has(model.sourceUid) || files.has(model.asset)) errors.push('Duplicate model identity: ' + model.id);
    ids.add(model.id);uids.add(model.sourceUid);files.add(model.asset);
    if (model.license !== 'CC BY 4.0' || model.licenseUrl !== 'https://creativecommons.org/licenses/by/4.0/' || !model.creator || !model.creatorUrl) errors.push('Missing individual attribution: ' + model.id);
    if (!/^completion\/[a-z0-9-]+\.glb$/.test(model.asset) || !/^[a-f0-9]{64}$/.test(model.sha256)) errors.push('Invalid model path/hash: ' + model.id);
    if (model.validationErrors || !model.validated || model.clearanceCertified) errors.push('Invalid validation/clearance claim: ' + model.id);
    if (inspected?.sha256 !== model.sha256 || inspected?.bytes !== model.bytes || inspected?.triangles !== model.triangles) errors.push('Stale binary validation: ' + model.id);
    if (!model.standaloneOnly || model.buildPlacementReady || model.scaleMode !== 'uniform-autoframe' || model.dimensionsMm !== null) errors.push('Unreviewed assembly placement: ' + model.id);
  }
  for (const item of CATALOG_ADDITIONS) {
    if (!ids.has(item.id) || !SOURCES[item.evidence.sourceIds[0]] || !item.name || !item.cat) errors.push('Unjoined catalog record: ' + item.id);
    for (const fact of Object.values(item.evidence.fields)) if (fact.value === null && (fact.exact !== false || fact.status !== 'unknown')) errors.push('Unknown fact promoted to verified: ' + item.id);
  }
  if (CATALOG_OVERRIDES.intel4004.builderEligible !== false) errors.push('Historical Intel 4004 exposed as modern builder part.');
  return errors;
}

function evidencePacket() {
  return { schema: 1, checkedAt: CHECKED, sources: SOURCES, catalogAdditions: CATALOG_ADDITIONS, catalogOverrides: CATALOG_OVERRIDES, models: MODEL_ADDITIONS, totals: { acquiredAssets: MODEL_ADDITIONS.length, newCatalogIdentities: CATALOG_ADDITIONS.length, existingCatalogIdentities: MODEL_ADDITIONS.length - CATALOG_ADDITIONS.length, preparedBytes: MODEL_ADDITIONS.reduce((n, model) => n + model.bytes, 0), clearanceCertified: 0, assemblyPlacementReviewed: 0 }, limitations: ['Structural validation and identity review are complete; real-browser rendering and isolated product-preview integration remain release gates.', 'No old asset, catalog identity or license mapping is replaced by this module.', 'All ten files can be used as isolated source appearances; complete installed-PC placement is deliberately not certified.'] };
}

if (require.main === module) {
  const errors = validatePacket();
  if (errors.length) { console.error(errors.join('\n'));process.exitCode = 1; }
  else if (process.argv[2] === 'write-evidence') {
    require('node:fs').writeFileSync(path.resolve(__dirname, '../docs/master-completion/models/integration-packet.json'), JSON.stringify(evidencePacket(), null, 2) + '\n');
    console.log('Wrote 10 individually attributed model additions and 8 bounded catalog records.');
  } else console.log(JSON.stringify(evidencePacket().totals));
}

module.exports = { CHECKED, SOURCES, CATALOG_ADDITIONS, CATALOG_OVERRIDES, MODEL_ADDITIONS, REVIEWS, validatePacket, evidencePacket };
