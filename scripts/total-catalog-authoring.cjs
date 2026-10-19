'use strict';

// Reproducible, bounded primary-source observation packet authored 2026-10-19.
// This is not a web scraper or an exhaustive manufacturer feed. No images,
// benchmark tables, asset licenses or live offers are inferred from these facts.
const fs = require('node:fs');
const path = require('node:path');
const directory = path.resolve(__dirname, '../data/catalog-intake/2026-10-19');
const sources = {}, batches = { gpu: [], cpu: [], ram: [], ssd: [] };
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const value = (n, unit = '') => ({ value: n, unit });
function source(id, publisher, url, scope) {
  return sources[id] ||= { publisher, url, inspectedAt: '2026-10-19', confidence: 'manufacturer-verified', inspection: 'Original specification table inspected; source facts transcribed and normalized. AI-assisted evidence review, not first-party hardware testing.', scope, models: {} };
}
function add({ category, brand, name, mpn = null, revision = null, sourceId, facts, architecture, summary, segment = 'consumer', eligible = segment === 'consumer', identity = {}, note, year = null }) {
  sources[sourceId].models[name] = { manufacturerPartNumber: mpn, revision, facts };
  const row = { id: 'total-' + category + '-' + slug(brand + '-' + (mpn || name)), cat: category, brand, name, sourceId, status: 'evidence-checked', segment, builderEligible: eligible, year, architecture, summary, identity: { manufacturer: brand, commercialModel: name, manufacturerPartNumber: mpn, revision, ...identity }, note };
  batches[category].push(row); return row;
}

// MSI dimension order is length × height × thickness, not a generic XYZ mesh.
// Gaming-mode boost is used where the table offers OC/Gaming/Silent profiles.
const msi = [
  ['GTX-950-GAMING-2G', 'GeForce GTX 950 GAMING 2G', 'GTX 950', 2, 'GDDR5', 128, 1279, 90, 350, [270,137,37], '1 × PCIe 6-pin'],
  ['GTX-960-GAMING-2G', 'GeForce GTX 960 GAMING 2G', 'GTX 960', 2, 'GDDR5', 128, 1253, 120, 400, [267,139,36], '1 × PCIe 8-pin'],
  ['GTX-960-GAMING-4G', 'GeForce GTX 960 GAMING 4G', 'GTX 960', 4, 'GDDR5', 128, 1279, 120, 400, [267,139,40], '1 × PCIe 8-pin'],
  ['GTX-970-GAMING-4G', 'GeForce GTX 970 GAMING 4G', 'GTX 970', 4, 'GDDR5', 256, 1253, 145, 500, [277,140,35], '1 × PCIe 8-pin + 1 × PCIe 6-pin'],
  ['GTX-980-GAMING-4G', 'GeForce GTX 980 GAMING 4G', 'GTX 980', 4, 'GDDR5', 256, 1291, 165, 500, [279,140,36], '2 × PCIe 8-pin'],
  ['GTX-980-Ti-GAMING-6G', 'GeForce GTX 980 Ti GAMING 6G', 'GTX 980 Ti', 6, 'GDDR5', 384, 1228, 250, 600, [277,140,40], '2 × PCIe 8-pin'],
  ['GeForce-GTX-1050-GAMING-X-2G', 'GeForce GTX 1050 GAMING X 2G', 'GTX 1050', 2, 'GDDR5', 128, 1531, 75, 300, [229,131,39], '1 × PCIe 6-pin'],
  ['GeForce-GTX-1050-Ti-GAMING-X-4G', 'GeForce GTX 1050 Ti GAMING X 4G', 'GTX 1050 Ti', 4, 'GDDR5', 128, 1468, 75, 300, [229,131,39], '1 × PCIe 6-pin'],
  ['GeForce-GTX-1060-GAMING-X-3G', 'GeForce GTX 1060 GAMING X 3G', 'GTX 1060', 3, 'GDDR5', 192, 1784, 120, 400, [277,140,39], '1 × PCIe 8-pin', 1152],
  ['GeForce-GTX-1060-GAMING-X-6G', 'GeForce GTX 1060 GAMING X 6G', 'GTX 1060', 6, 'GDDR5', 192, 1784, 120, 400, [277,140,39], '1 × PCIe 8-pin', 1280],
  ['GEFORCE-GTX-1070-GAMING-X-8G', 'GeForce GTX 1070 GAMING X 8G', 'GTX 1070', 8, 'GDDR5', 256, 1771, 150, 500, [279,140,42], '1 × PCIe 6-pin + 1 × PCIe 8-pin', 1920],
  ['GeForce-GTX-1070-Ti-GAMING-8G', 'GeForce GTX 1070 Ti GAMING 8G', 'GTX 1070 Ti', 8, 'GDDR5', 256, 1683, 180, 500, [279,140,42], '1 × PCIe 6-pin + 1 × PCIe 8-pin', 2432],
  ['GeForce-GTX-1080-GAMING-X-8G', 'GeForce GTX 1080 GAMING X 8G', 'GTX 1080', 8, 'GDDR5X', 256, 1822, 180, 500, [279,140,42], '1 × PCIe 6-pin + 1 × PCIe 8-pin', 2560],
  ['GeForce-GTX-1080-Ti-GAMING-X-11G', 'GeForce GTX 1080 Ti GAMING X 11G', 'GTX 1080 Ti', 11, 'GDDR5X', 352, 1657, 250, 600, [290,140,51], '2 × PCIe 8-pin', 3584],
  ['GeForce-GTX-1660-SUPER-GAMING-X', 'GeForce GTX 1660 SUPER GAMING X', 'GTX 1660 SUPER', 6, 'GDDR6', 192, 1830, 125, 450, [247,127,46], '1 × PCIe 8-pin', 1408],
  ['GeForce-GTX-1660-Ti-GAMING-X-6G', 'GeForce GTX 1660 Ti GAMING X 6G', 'GTX 1660 Ti', 6, 'GDDR6', 192, 1875, 130, 450, [247,127,46], '1 × PCIe 8-pin', 1536]
];
for (const [route, name, chip, memory, type, bus, boost, power, psu, dimensions, connectors, cores] of msi) {
  const id = 'msi-' + slug(route), facts = { gpuChip: value(chip), memoryGB: value(memory, 'GB'), memoryType: value(type), memoryBus: value(bus, 'bit'), boostGHz: value(boost, 'MHz'), boardPowerW: value(power, 'W'), recommendedPsuW: value(psu, 'W'), lengthMm: value(dimensions[0], 'mm'), heightMm: value(dimensions[1], 'mm'), thicknessMm: value(dimensions[2], 'mm'), connectors: value(connectors), pcie: value('PCIe 3.0 ×16') };
  if (cores) facts.shaderUnits = value(cores);
  source(id, 'MSI', 'https://www.msi.com/Graphics-Card/' + route + '/Specification', 'Exact named MSI variant only. Gaming-mode boost when multiple profiles are listed. Published power/PSU figures are specifications, not system measurements. Dimensions exclude proof of cable clearance; no exact manufacturing part number or board revision is asserted.');
  add({ category: 'gpu', brand: 'MSI', name, sourceId: id, facts, architecture: chip + ' · PCIe 3.0', summary: memory + ' GB ' + type + ' · ' + dimensions[0] + ' mm long', identity: { gpuChip: chip, boardPartner: 'MSI', productFamily: /GAMING X/.test(name) ? 'GAMING X' : 'GAMING' }, note: 'Exact MSI named card, not NVIDIA reference dimensions. ' + (name.includes('1070 Ti') || name.includes('1660') ? 'Boost is the single published value.' : 'Boost clock shown is Gaming mode; OC and Silent modes differ.') + ' Confirm the connector, case and installed cable clearance. MPN and revision remain unknown; no exact photo or downloaded 3D asset has been assigned.' });
}
source('gigabyte-750ti', 'Gigabyte', 'https://www.gigabyte.com/vn/Graphics-Card/GV-N75TOC-2GI/sp', 'Exact GV-N75TOC-2GI product table. Dimensions explicitly H=27 L=191 W=129 mm; normalized to length/height/thickness. A separate hardware revision is not documented here. Board power and auxiliary connector requirements remain unknown.');
add({ category: 'gpu', brand: 'Gigabyte', name: 'GeForce GTX 750 Ti OC 2GB (GV-N75TOC-2GI)', mpn: 'GV-N75TOC-2GI', sourceId: 'gigabyte-750ti', identity: { boardPartner: 'Gigabyte', gpuChip: 'GTX 750 Ti', productFamily: 'Ultra Durable 2' }, architecture: 'GTX 750 Ti · PCIe 3.0', summary: '2 GB GDDR5 · 191 mm long', facts: { gpuChip: value('GTX 750 Ti'), memoryGB: value(2048, 'MiB'), memoryType: value('GDDR5'), memoryBus: value(128, 'bit'), baseGHz: value(1033, 'MHz'), boostGHz: value(1111, 'MHz'), recommendedPsuW: value(400, 'W'), lengthMm: value(191, 'mm'), heightMm: value(129, 'mm'), thicknessMm: value(27, 'mm'), displayOutputs: value('Dual-link DVI-I ×1; DVI-D ×1; HDMI ×2'), pcie: value('PCIe 3.0 ×16') }, note: 'Manufacturer dimensions are length 191 mm, width 129 mm and thickness 27 mm. The exact product page does not establish board power, auxiliary connectors or a revision. Published PSU recommendation is not measured consumption.' });
const asrock = [
  ['Intel Arc A310 Low Profile 4GB', 'A310 LP 4G', 'Arc A310', 4, 64, 2000, [169,69,39], 450, null, 'HDMI 2.0b ×1; DisplayPort 2.0 with DSC ×1', 8],
  ['Intel Arc A380 Challenger ITX 6GB OC', 'A380 CLI 6GO', 'Arc A380', 6, 96, 2250, [190,124,39], 500, '1 × PCIe 8-pin', 'HDMI 2.0b ×1; DisplayPort 2.0 with DSC ×3', 8],
  ['Intel Arc A750 Challenger D 8GB OC', 'A750 CLD 8GO', 'Arc A750', 8, 256, 2200, [271,132,48], 650, '2 × PCIe 8-pin', 'DisplayPort 2.0 ×2; HDMI 2.1 ×1; HDMI 2.0b ×1', 16]
];
for (const [name, mpn, chip, memory, bus, base, size, psu, connectors, outputs, lanes] of asrock) {
  const id = 'asrock-' + slug(mpn);
  source(id, 'ASRock', 'https://www.asrock.com/Graphics-Card/Intel/' + encodeURIComponent(name) + '/index.asp', 'Exact ASRock commercial model and printed model code. Intel engine/base clock is not renamed a boost clock. Exact dimensions and PSU recommendation only; board power is not disclosed in this table. A310 auxiliary power remains unasserted; A750 DP certification note must still be consulted.');
  const facts = { gpuChip: value(chip), memoryGB: value(memory, 'GB'), memoryType: value('GDDR6'), memoryBus: value(bus, 'bit'), baseGHz: value(base, 'MHz'), lengthMm: value(size[0], 'mm'), heightMm: value(size[1], 'mm'), thicknessMm: value(size[2], 'mm'), recommendedPsuW: value(psu, 'W'), pcie: value('PCIe 4.0 ×' + lanes), displayOutputs: value(outputs) };
  if (connectors) facts.connectors = value(connectors);
  add({ category: 'gpu', brand: 'ASRock', name, mpn, sourceId: id, facts, architecture: chip + ' · PCIe 4.0', summary: memory + ' GB GDDR6 · ' + size[0] + ' mm long', identity: { gpuChip: chip, boardPartner: 'ASRock', productFamily: name.includes('Low Profile') ? 'Low Profile' : 'Challenger' }, note: 'Exact ASRock named board. Published engine/base clock is not an FPS result or boost guarantee. Check Intel platform requirements and the ASRock table for display-output limitations; system support, board power and cable routing remain separate checks.' });
}

const xeons = [
  ['E5-1620 v4',92991,4,8,3.5,3.8,10,140,'3-50',1], ['E5-1630 v4',92987,4,8,3.7,4.0,10,140,'3-70',1],
  ['E5-1650 v4',92994,6,12,3.6,4.0,15,140,'3-60',1], ['E5-1660 v4',92985,8,16,3.2,3.8,20,140,'3-20',1],
  ['E5-1680 v4',92992,8,16,3.4,4.0,20,140,'3-40',1], ['E5-2620 v4',92986,8,16,2.1,3.0,20,85,'2-10',2],
  ['E5-2630 v4',92981,10,20,2.2,3.1,25,85,'2-20',2], ['E5-2650 v4',91767,12,24,2.2,2.9,30,105,'2-20',2],
  ['E5-2680 v4',91754,14,28,2.4,3.3,35,120,'2-40',2]
];
for (const [model, ark, cores, threads, base, boost, cache, tdp, frequency, sockets] of xeons) {
  const name = 'Xeon ' + model, sourceId = 'intel-' + slug(model), url = 'https://www.intel.com/content/www/us/en/products/sku/' + ark + '/intel-xeon-processor-' + model.toLowerCase().replace(' v4', '-v4').replace('-', '') + '-' + cache + 'm-cache-' + frequency + '-ghz/specifications.html';
  source(sourceId, 'Intel', url, 'Exact Intel ARK processor number, Broadwell generation, cores/threads, base/max turbo, cache, TDP, 2016 launch and socket/platform information. Retail boxed/tray order codes are not inferred. Intel labels the socket FCLGA2011; exact v4 board/firmware support is a separate requirement.');
  add({ category: 'cpu', brand: 'Intel', name, sourceId, segment: 'server', eligible: false, year: 2016, architecture: 'Broadwell · Xeon E5 v4 · FCLGA2011', summary: cores + ' cores / ' + threads + ' threads · ' + tdp + ' W TDP', identity: { productNumber: model.replace(' v4', 'V4'), productFamily: 'Xeon E5 v4', platformGeneration: 'Broadwell-EP' }, facts: { cores: value(cores), threads: value(threads), baseGHz: value(base, 'GHz'), boostGHz: value(boost, 'GHz'), l3MB: value(cache, 'MB'), tdpW: value(tdp, 'W'), cpuSegment: value('Server'), socket: value('FCLGA2011 (Xeon E5 v4 platform)'), maxSockets: value(sockets) }, note: 'Historical server/workstation reference; excluded from the consumer builder. A matching 2011-pin label does not establish board, chipset, memory or BIOS compatibility. Exact boxed/tray ordering MPN is not indexed. TDP is not measured wall power or an all-core turbo promise.' });
}
source('amd-tr7000', 'AMD', 'https://www.amd.com/en/newsroom/press-releases/2023-10-19-amd-introduces-new-amd-ryzen-threadripper-7000-ser.html', 'Dated 2023 announcement: exact Threadripper 7000 and PRO 7000 WX product table, cores/threads, base/up-to boost, total L2+L3 cache and TDP. TRX50/WRX90 use DDR5 RDIMM; capacity and channels depend on platform. Launch prices are deliberately not imported as current offers.');
source('amd-tr7000-platform', 'AMD', 'https://www.amd.com/en/partner/articles/unchained-creativity-threadripper-7000-series.html', 'Exact product family tables establish sTR5 and PRO-model L3 versus non-PRO total-cache labels. No performance chart or benchmark results are copied.');
for (const [model, cores, threads, base, boost, total] of [['7960X',24,48,4.2,5.3,152], ['7970X',32,64,4,5.3,160], ['7980X',64,128,3.2,5.1,320], ['PRO 7945WX',12,24,4.7,5.3,76], ['PRO 7955WX',16,32,4.5,5.3,80], ['PRO 7965WX',24,48,4.2,5.3,152], ['PRO 7975WX',32,64,4,5.3,160], ['PRO 7985WX',64,128,3.2,5.1,320]]) {
  const name = 'Ryzen Threadripper ' + model;
  add({ category: 'cpu', brand: 'AMD', name, sourceId: 'amd-tr7000', segment: 'workstation', eligible: false, year: 2023, architecture: 'Zen 4 · Threadripper 7000 · DDR5 RDIMM', summary: cores + ' cores / ' + threads + ' threads · 350 W TDP', identity: { productNumber: model.replace('PRO ', ''), productFamily: model.startsWith('PRO') ? 'Threadripper PRO 7000 WX' : 'Threadripper 7000' }, facts: { cores: value(cores), threads: value(threads), baseGHz: value(base, 'GHz'), boostGHz: value(boost, 'GHz'), totalCacheMB: value(total, 'MB'), tdpW: value(350, 'W'), cpuSegment: value('Workstation'), cpuMemory: value('DDR5 RDIMM; exact board/platform support required') }, note: 'Workstation reference, excluded from the consumer builder. Total cache is L2 + L3, not L3 alone. AMD documents TRX50/WRX90 platform-specific support, with RDIMM memory rather than ordinary consumer UDIMM. Exact board CPU support, firmware, cooler and power requirements must be checked; no gaming uplift or current price is inferred.' });
  // A second observation, deliberately not merged into a broader compatibility
  // statement. The source register records this corroborating platform scope.
  sources['amd-tr7000-platform'].models[name] = { manufacturerPartNumber: null, revision: null, facts: { socket: value('sTR5') } };
}

const memorySets = [
  ['kingston-ddr4-udimm','https://www.kingston.com/en/memory/client/ddr4-3200mts-non_ecc-unbuffered-d%C4%B1mm','DDR4',3200,22,1.2,'UDIMM','consumer',false,false,[['KVR32N22S6/4',4,1,16,8],['KVR32N22S6/8',8,1,16,16],['KVR32N22S8/8',8,1,8,8],['KVR32N22D8/16',16,2,8,8],['KVR32N22S8/16',16,1,8,16],['KVR32N22D8/32',32,2,8,16]]],
  ['kingston-ddr5-udimm','https://www.kingston.com/en/memory/client/ddr5-5600mts-non_ecc-unbuffered-dimm','DDR5',5600,46,1.1,'UDIMM','consumer',false,false,[['KVR56U46BS6-8',8,1,16,16],['KVR56U46BS8-16',16,1,8,16],['KVR56U46BD8-32',32,2,8,16],['KVR56U46BS8-32',32,1,8,32],['KVR56U46BD8-48',48,2,8,24],['KVR56U46BD8-64',64,2,8,32]]],
  ['kingston-ddr4-rdimm','https://www.kingston.com/unitedkingdom/en/memory/server-premier/ddr4-3200mts-ecc-registered-d%C4%B1mm','DDR4',3200,null,null,'RDIMM','server',true,true,[['KSM32RS8/16HD',16,1,8,null,'SK hynix','D'],['KSM32RD8/32HD',32,2,8,null,'SK hynix','D'],['KSM32RS4/32HCR',32,1,4,null,'SK hynix','C'],['KSM32RS4/32MFR',32,1,4,null,'Micron','F'],['KSM32RD4/64HCR',64,2,4,null,'SK hynix','C'],['KSM32RD4/64HD',64,2,4,null,'SK hynix','D'],['KSM32RD4/64MFR',64,2,4,null,'Micron','F']]],
  ['kingston-ddr4-sodimm','https://www.kingston.com/datasheets/KVR32S22S8_16.pdf','DDR4',3200,22,1.2,'SO-DIMM','laptop',false,false,[['KVR32S22S8/16',16,1,8,16],['KVR32S22D8/32',32,2,8,16]]]
];
for (const [familyId, url, generation, transfer, cas, voltage, form, segment, ecc, registered, products] of memorySets) {
  source(familyId, 'Kingston', url, 'Exact part-number table, nominal per-module capacity, generation, data rate, unbuffered/registered and system ECC class, chip organization and ranks. Part numbers are individual modules, not two-stick kits. Chip/die suffixes are retained as distinct identities.');
  for (const [mpn, capacity, ranks, chipWidth, density, dram, die] of products) {
    const name = (registered ? 'Server Premier ' : 'ValueRAM ') + mpn + ' ' + capacity + 'GB ' + generation + '-' + transfer;
    const facts = { capacityGB: value(capacity, 'GB'), generation: value(generation), transferMTs: value(transfer, 'MT/s'), modules: value(1), ranks: value(ranks), chipWidth: value(chipWidth, 'bit'), form: value(form), ecc: value(ecc), registered: value(registered) };
    if (density) facts.dramDensityGbit = value(density, 'Gbit');
    if (dram) facts.dramManufacturer = value(dram);
    if (die) facts.die = value(die);
    let sourceId = familyId;
    // Per-module datasheets were opened for these timing/voltage records. The
    // 4GB datasheet timed out; its live family table supports only listed facts.
    if (!registered && mpn !== 'KVR32N22S6/4') {
      sourceId = 'kingston-' + slug(mpn);
      source(sourceId, 'Kingston', 'https://www.kingston.com/datasheets/' + mpn.replace('/', '_') + '.pdf', 'Exact single-module datasheet and matching family table: capacity, rank, chip width, DDR generation, JEDEC SPD data rate/timing, voltage and form. Non-ECC means no system-level ECC guarantee; DDR5 on-die ECC is a different mechanism.');
      facts.cas = value(cas, 'cycles'); facts.voltage = value(voltage, 'V'); facts.pins = value(form === 'SO-DIMM' ? 260 : 288);
    }
    add({ category: 'ram', brand: 'Kingston', name, mpn, sourceId, segment, eligible: segment === 'consumer', architecture: generation + ' · ' + form + (ecc ? ' · ECC' : ' · non-ECC') + (registered ? ' registered' : ' unbuffered'), summary: capacity + ' GB · one module · ' + ranks + 'R×' + chipWidth, identity: { packageType: 'module', productFamily: registered ? 'Server Premier' : 'ValueRAM' }, facts, note: 'Single ' + form + ' module, not a matched multi-module kit. ' + (registered ? 'Registered ECC memory needs a supporting server/workstation platform; not ordinary consumer DDR4. DRAM manufacturer and die suffix are part of this exact part number.' : form === 'SO-DIMM' ? 'Laptop SO-DIMM form factor; not a desktop DIMM.' : 'Generation alone does not establish CPU/board support, population limits or rated speed. DDR5 on-die ECC is not system-level ECC.') + ' No QVL match, profile stability, exact image or downloaded 3D model is asserted.' });
  }
}
source('kingston-dc600m', 'Kingston', 'https://www.kingston.com/datasheets/SEDC600M_en.pdf', 'Current 2026 three-page DC600M/DC600ME manufacturer datasheet inspected, including part-number matrix and JEDEC enterprise TBW conditions. This batch indexes DC600M only: no hardware encryption. DC600ME is a separate encrypted variant. Read/write values are advertised sequential specifications, not measured application performance.');
for (const [capacity, write, endurance] of [[480,470,876],[960,530,1752],[1920,530,3504],[3840,530,7008],[7680,530,14016]]) {
  const mpn = 'SEDC600M/' + capacity + 'G', name = 'DC600M ' + capacity + 'GB (' + mpn + ')';
  add({ category: 'ssd', brand: 'Kingston', name, mpn, sourceId: 'kingston-dc600m', segment: 'server', eligible: false, architecture: 'SATA 6 Gb/s · 2.5-inch · enterprise', summary: capacity + ' GB · hardware power-loss protection', identity: { productFamily: 'DC600M', encryptionVariant: 'Non-encrypted' }, facts: { storageGB: value(capacity, 'GB'), storageInterface: value('SATA'), storageForm: value('2.5-inch, 7 mm'), readMBs: value(560, 'MB/s'), writeMBs: value(write, 'MB/s'), enduranceTBW: value(endurance, 'TBW'), powerLossProtection: value(true), encryption: value('No (DC600M; DC600ME is distinct)') }, note: 'Exact DC600M capacity and part number; DC600ME encryption is not inherited. Manufacturer sequential specifications and enterprise-workload TBW are not real-world transfer guarantees or a replacement for the conditional warranty. Decimal capacity; formatted space is lower. Reference-only until a dedicated enterprise installation path is supported.' });
}

const candidates = [
  { id: 'evga-750ti-ftw', name: 'GeForce GTX 750 Ti FTW ACX / 02G-P4-3757-KR', source: 'https://www.evga.com/products/pdf/02G-P4-3757.pdf', status: 'blocked-source', reason: 'Search indexed an official historical datasheet, but direct opening redirected to EVGA homepage. Do not publish specs from a snippet. Need an inspectable original/archive source and exact regional suffix verification.' },
  { id: 'evga-750ti-sc', name: 'GeForce GTX 750 Ti Superclocked / 02G-P4-3753-KR', source: 'https://www.evga.com/marketing/EVGA_RoadMap_2017_Q1.pdf', status: 'blocked-source', reason: 'Official roadmap is search-discoverable but currently redirects on direct fetch. Historical source inspection is unresolved.' },
  { id: 'kingston-ecc-udimm-32', name: 'KSM32ED8/32HC', source: 'https://www.kingston.com/datasheets/KSM32ED8_32HC.pdf', status: 'needs-review', reason: 'Exact ECC module datasheet inspected, but this batch has not independently corroborated unbuffered platform classification. Do not infer supported consumer systems from DDR4 alone.' },
  { id: 'kingston-ecc-udimm-16', name: 'KSM32ES8/16MF', source: 'https://www.kingston.com/datasheets/KSM32ES8_16MF.pdf', status: 'needs-review', reason: 'Exact ECC datasheet inspected; require corroborated module-class and platform scope before publishing.' }
];
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'sources.json'), JSON.stringify(sources, null, 2) + '\n');
for (const [category, records] of Object.entries(batches)) fs.writeFileSync(path.join(directory, 'batch-' + category + '.json'), JSON.stringify({ schema: 1, evidenceDate: '2026-10-19', records }, null, 2) + '\n');
fs.writeFileSync(path.join(directory, 'candidates.json'), JSON.stringify(candidates, null, 2) + '\n');
console.log(JSON.stringify({ records: Object.values(batches).reduce((sum, records) => sum + records.length, 0), categories: Object.fromEntries(Object.entries(batches).map(([cat, records]) => [cat, records.length])), sources: Object.keys(sources).length, candidates: candidates.length }, null, 2));
