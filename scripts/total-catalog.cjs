'use strict';

// Additive, evidence-bound catalog intake. These packets are data, never code.
// Existing stable IDs are retained. A similar name is not an alias decision.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const DEFAULT_DIR = path.resolve(__dirname, '../data/catalog-intake/2026-10-19');
const VERSION = '2026-10-19.1';
const CONFIDENCE = ['manufacturer-verified', 'trusted-secondary', 'historical-archive', 'retail-listing', 'manual-entry', 'unverified'];
const SEGMENTS = ['consumer', 'workstation', 'server', 'laptop', 'historical'];
const CATEGORIES = ['gpu', 'cpu', 'ram', 'ssd', 'hdd', 'board', 'psu', 'case', 'cooler', 'fan'];
const BRANDS = { msi: 'MSI', gigabyte: 'Gigabyte', asrock: 'ASRock', kingston: 'Kingston', intel: 'Intel', amd: 'AMD', corsair: 'CORSAIR', 'western digital': 'Western Digital', wd: 'Western Digital', seagate: 'Seagate', asus: 'ASUS', evga: 'EVGA' };
const SOURCE_HOSTS = { MSI: ['msi.com'], Gigabyte: ['gigabyte.com'], ASRock: ['asrock.com'], Kingston: ['kingston.com'], Intel: ['intel.com'], AMD: ['amd.com'], CORSAIR: ['corsair.com'], ASUS: ['asus.com'], EVGA: ['evga.com'], Seagate: ['seagate.com'], 'Western Digital': ['westerndigital.com', 'wd.com'] };
const FIELDS = {
  memoryGB: ['Memory', 'GB', 'number'], memoryType: ['Memory type', '', 'string'], memoryBus: ['Memory bus', 'bit', 'number'],
  gpuChip: ['Graphics processor', '', 'string'], boostGHz: ['Boost clock', 'GHz', 'number'], baseGHz: ['Base clock', 'GHz', 'number'],
  shaderUnits: ['Shader units', '', 'number'], boardPowerW: ['Board power', 'W', 'number'], recommendedPsuW: ['Recommended PSU', 'W', 'number'],
  lengthMm: ['Card length', 'mm', 'number'], heightMm: ['Card height', 'mm', 'number'], thicknessMm: ['Card thickness', 'mm', 'number'],
  connectors: ['Power connectors', '', 'string'], displayOutputs: ['Display outputs', '', 'string'], pcie: ['Interface', '', 'string'],
  cores: ['CPU cores', '', 'number'], threads: ['CPU threads', '', 'number'], tdpW: ['CPU TDP', 'W', 'number'], socket: ['Socket', '', 'string'],
  l3MB: ['L3 cache', 'MB', 'number'], totalCacheMB: ['Total cache (L2 + L3)', 'MB', 'number'], cpuSegment: ['Platform class', '', 'string'],
  cpuMemory: ['Supported memory type', '', 'string'], maxSockets: ['Maximum CPU configuration', '', 'number'],
  capacityGB: ['Memory', 'GB', 'number'], generation: ['DDR generation', '', 'string'], transferMTs: ['Transfer rate', 'MT/s', 'number'],
  cas: ['CAS latency', 'cycles', 'number'], modules: ['Modules', '', 'number'], ranks: ['Ranks per module', '', 'number'],
  chipWidth: ['DRAM chip width', 'bit', 'number'], dramDensityGbit: ['DRAM density', 'Gbit', 'number'], voltage: ['Voltage', 'V', 'number'],
  form: ['Module form', '', 'string'], ecc: ['System ECC', '', 'boolean'], registered: ['Registered memory', '', 'boolean'],
  pins: ['Module pins', '', 'number'], dramManufacturer: ['DRAM manufacturer', '', 'string'], die: ['DRAM die revision', '', 'string'],
  storageGB: ['Storage capacity', 'GB', 'number'], storageInterface: ['Storage interface', '', 'string'], storageForm: ['Drive form', '', 'string'],
  readMBs: ['Sequential read', 'MB/s', 'number'], writeMBs: ['Sequential write', 'MB/s', 'number'], enduranceTBW: ['Endurance', 'TBW', 'number'],
  powerLossProtection: ['Power-loss protection', '', 'boolean'], encryption: ['Hardware encryption', '', 'string'],
  coolerType: ['Cooling type', '', 'string'], coolerSockets: ['Supported sockets', '', 'array'],
  radiatorSizeMm: ['Radiator size', 'mm', 'number'], radiatorLengthMm: ['Radiator length', 'mm', 'number'],
  radiatorWidthMm: ['Radiator width', 'mm', 'number'], radiatorThicknessMm: ['Radiator thickness', 'mm', 'number'],
  blockHeightMm: ['Pump block height', 'mm', 'number'], fanSizeMm: ['Fan size', 'mm', 'number'],
  fanThicknessMm: ['Fan thickness', 'mm', 'number'], fanCount: ['Fan count', '', 'number'],
  pumpConnector: ['Pump connector', '', 'string'], fanConnector: ['Fan connector', '', 'string']
};
const COMPAT = { memoryGB: null, boardPowerW: 'gpuPower', recommendedPsuW: 'recommendedPsu', lengthMm: 'gpuLength', heightMm: 'gpuHeight', thicknessMm: 'gpuThickness', connectors: 'connectors', capacityGB: 'capacity', generation: 'ddr', modules: 'modules', storageGB: 'capacity', storageInterface: 'storageInterface', storageForm: 'storageForm' };
Object.assign(COMPAT,{coolerType:'coolingType',coolerSockets:'supportedSockets',radiatorSizeMm:'radiatorSize',radiatorLengthMm:'radiatorLength',radiatorWidthMm:'radiatorWidth',radiatorThicknessMm:'radiatorThickness'});
const clone = value => JSON.parse(JSON.stringify(value));
const canonicalBrand = value => BRANDS[String(value || '').trim().toLowerCase()] || String(value || '').trim();
const normalized = value => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const exactPartNumber = value => normalized(value); // Punctuation is meaningful. Never erase - / + or variant suffixes.
const safeURL = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(u.hostname); } catch { return false; } };
function assertPlain(value, trail = 'packet') {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return;
  if (Array.isArray(value)) { for (const [i, item] of value.entries()) assertPlain(item, trail + '[' + i + ']'); return; }
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) throw Error('Non-data value at ' + trail);
  for (const [key, item] of Object.entries(value)) { if (['__proto__', 'constructor', 'prototype'].includes(key)) throw Error('Unsafe key at ' + trail); assertPlain(item, trail + '.' + key); }
}
function normalizeUnit(field, raw) {
  const def = FIELDS[field]; if (!def) throw Error('Unsupported field: ' + field);
  if (!raw || typeof raw !== 'object' || !Object.hasOwn(raw, 'value')) throw Error('Missing typed observation for ' + field);
  let value = raw.value; const unit = raw.unit ?? '';
  if (value === null) return { value: null, unit: def[1], status: 'unknown' };
  if (def[2] === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw Error('Invalid numeric observation for ' + field);
    if (unit !== def[1]) {
      if (def[1] === 'GHz' && unit === 'MHz') value /= 1000;
      else if (def[1] === 'mm' && unit === 'cm') value *= 10;
      else if (field === 'storageGB' && unit === 'TB') value *= 1000;
      else if (field === 'memoryGB' && unit === 'MiB') value /= 1024;
      else throw Error('Wrong unit for ' + field + ': ' + unit + ', expected ' + def[1]);
    }
    if (['cores', 'threads', 'modules', 'ranks', 'pins', 'chipWidth', 'shaderUnits', 'maxSockets'].includes(field) && !Number.isInteger(value)) throw Error('Expected integer for ' + field);
  } else if (unit !== '') throw Error('Unexpected unit for ' + field);
  if (def[2] === 'string' && (typeof value !== 'string' || !value.trim() || /[<>\u0000-\u001f]/.test(value))) throw Error('Invalid text observation for ' + field);
  if (def[2] === 'boolean' && typeof value !== 'boolean') throw Error('Expected boolean for ' + field);
  if (def[2] === 'array' && (!Array.isArray(value) || !value.length || new Set(value).size !== value.length || value.some(item => typeof item !== 'string' || !/^[a-zA-Z0-9+-]{2,20}$/.test(item)))) throw Error('Expected distinct socket identifiers for ' + field);
  if (field === 'coolerType' && !['aio','air'].includes(value)) throw Error('Unknown cooling type');
  if (field === 'fanCount' && (!Number.isInteger(value) || value > 12)) throw Error('Invalid fan count');
  return { value, unit: def[1], status: 'manufacturer-specified' };
}
function identityKey(part) {
  const identity = part.identity || {}, brand = canonicalBrand(identity.manufacturer || part.brand);
  const mpn = identity.manufacturerPartNumber || part.sku || part.mpn || part.partNumber || part.manufacturerPartNumber;
  if (mpn) return normalized(brand) + '|mpn|' + exactPartNumber(mpn);
  return normalized(brand) + '|model|' + normalized(identity.commercialModel || part.name) + '|revision|' + normalized(identity.revision);
}
function loadPackets(directory) {
  if(directory===undefined){
    const base=loadPackets(DEFAULT_DIR),next=loadPackets(path.resolve(__dirname,'../data/catalog-intake/2026-10-19-hardware-next'));
    for(const id of Object.keys(next.sources))if(Object.hasOwn(base.sources,id))throw Error('Duplicate catalog evidence ID: '+id);
    return {sources:{...base.sources,...next.sources},records:base.records.concat(next.records),candidates:base.candidates.concat(next.candidates)};
  }
  const sources = JSON.parse(fs.readFileSync(path.join(directory, 'sources.json'), 'utf8'));
  const packets = fs.readdirSync(directory).filter(name => /^batch-[a-z0-9-]+\.json$/.test(name)).sort().flatMap(name => {
    const packet = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')); assertPlain(packet);
    if (packet.schema !== 1 || !Array.isArray(packet.records)) throw Error('Unsupported catalog packet: ' + name);
    return packet.records.map(record => ({ ...record, intakeFile: name }));
  });
  const candidatesPath = path.join(directory, 'candidates.json');
  return { sources, records: packets, candidates: fs.existsSync(candidatesPath) ? JSON.parse(fs.readFileSync(candidatesPath, 'utf8')) : [] };
}
function validateRecord(row, sources) {
  const errors = [], fail = message => errors.push(row?.id + ': ' + message);
  try { assertPlain(row); } catch (error) { fail(error.message); return { valid: false, errors }; }
  if (!row || !/^total-[a-z0-9-]{3,110}$/.test(row.id)) fail('Invalid stable ID');
  if (!CATEGORIES.includes(row?.cat)) fail('Unsupported category');
  if (!row?.name || typeof row.name !== 'string' || /[<>\u0000-\u001f]/.test(row.name)) fail('Invalid product name');
  if (!SEGMENTS.includes(row?.segment)) fail('Missing consumer/workstation/server/laptop/historical distinction');
  if (!row?.identity || row.identity.commercialModel !== row.name || canonicalBrand(row.identity.manufacturer) !== canonicalBrand(row.brand)) fail('Identity does not match the named product');
  const identity = row.identity || {};
  if (!Object.hasOwn(identity, 'manufacturerPartNumber') || !Object.hasOwn(identity, 'revision')) fail('MPN and revision must be explicit, including unknown null');
  if (row.cat === 'gpu' && (!identity.boardPartner || canonicalBrand(identity.boardPartner) !== canonicalBrand(row.brand) || !identity.gpuChip)) fail('Missing exact board partner or GPU identity');
  if (row.cat === 'ram' && !['module', 'kit'].includes(identity.packageType)) fail('Memory must identify module versus kit');
  if (row.status !== 'evidence-checked') fail('Ambiguous/unreviewed intake cannot publish');
  const source = sources[row.sourceId];
  if (!source || !safeURL(source.url) || !source.publisher || !source.scope || !/^\d{4}-\d{2}-\d{2}$/.test(source.inspectedAt || '') || !CONFIDENCE.includes(source.confidence)) fail('Missing or invalid source provenance');
  if (source && source.confidence !== 'manufacturer-verified') fail('This automatic publication lane accepts only inspected manufacturer facts; other source classes require a separate review');
  if (source && safeURL(source.url)) {
    const host = new URL(source.url).hostname.toLowerCase(), allowed = SOURCE_HOSTS[canonicalBrand(source.publisher)] || [];
    if (!allowed.some(domain => host === domain || host.endsWith('.' + domain))) fail('Publisher does not match an allowed original manufacturer host');
    const inspected = Date.parse(source.inspectedAt + 'T00:00:00Z');
    if (!Number.isFinite(inspected) || inspected > Date.now() || new Date(inspected).toISOString().slice(0, 10) !== source.inspectedAt) fail('Invalid or future evidence date');
  }
  const observation = source?.models?.[row.name];
  if (!observation || observation.manufacturerPartNumber !== identity.manufacturerPartNumber || observation.revision !== identity.revision) fail('Source applies to a different product variant or revision');
  const facts = {};
  for (const [field, raw] of Object.entries(observation?.facts || {})) { try { facts[field] = normalizeUnit(field, raw); } catch (error) { fail(error.message); } }
  if (!Object.keys(facts).length) fail('No usable sourced observations');
  if (row.cat === 'gpu' && (facts.gpuChip?.value !== identity.gpuChip || !row.name.includes(identity.gpuChip.replace(/^GeForce |^Intel /g, '')) && !row.name.includes(identity.gpuChip))) fail('GPU chip/name conflict');
  if (row.cat === 'gpu') {
    const namedMemory = row.name.match(/\b(\d+)\s*GB\b/i)?.[1] || row.name.match(/\b(\d+)G\b/i)?.[1];
    if (namedMemory && Number(namedMemory) !== facts.memoryGB?.value) fail('Named GPU memory variant conflicts with its sourced capacity');
  }
  if (row.cat === 'ram') {
    if (!facts.generation || !facts.capacityGB || !facts.modules || !facts.form || !facts.registered || !facts.ecc) fail('Memory lacks generation/capacity/modules/form/ECC/registered evidence');
    if (identity.packageType === 'module' && facts.modules?.value !== 1) fail('Single module conflicts with module count');
    if (identity.packageType === 'kit' && facts.modules?.value < 2) fail('Kit conflicts with module count');
    if (facts.registered?.value && row.segment !== 'server' && row.segment !== 'workstation') fail('RDIMM cannot enter consumer memory');
    if (facts.form?.value === 'SO-DIMM' && row.segment !== 'laptop') fail('Laptop form factor cannot enter desktop memory');
    const namedCapacity = row.name.match(/\b(\d+)GB\b/i)?.[1];
    if (namedCapacity && Number(namedCapacity) !== facts.capacityGB?.value) fail('Memory identity/capacity conflict');
    if (facts.generation?.value && !row.architecture.includes(facts.generation.value)) fail('Memory generation conflicts with the named architecture');
  }
  if (row.cat === 'cpu' && (facts.threads?.value < facts.cores?.value || !facts.cpuSegment)) fail('CPU identity/segment facts are invalid');
  if (row.cat === 'ssd' && (!facts.storageGB || !facts.storageInterface || !facts.storageForm)) fail('Storage lacks exact capacity/interface/form');
  if (row.cat === 'cooler' && (!facts.coolerType || !facts.coolerSockets || (facts.coolerType.value === 'aio' && ['radiatorSizeMm','radiatorLengthMm','radiatorWidthMm','radiatorThicknessMm'].some(key => !facts[key])))) fail('Cooling lacks exact type/socket/radiator evidence');
  if (row.cat === 'ssd') {
    const namedCapacity = row.name.match(/\b(\d+)GB\b/i)?.[1];
    if (namedCapacity && Number(namedCapacity) !== facts.storageGB?.value) fail('Storage identity/capacity conflict');
    if (facts.storageInterface?.value && !row.architecture.includes(facts.storageInterface.value)) fail('Storage interface conflicts with the named architecture');
  }
  if (row.builderEligible && ['server', 'workstation', 'laptop', 'historical'].includes(row.segment)) fail('Specialized platform needs a dedicated supported builder path, not consumer eligibility');
  for (const key of ['image', 'photo', 'model3d', 'physical', 'price', 'fps']) if (row[key] !== undefined) fail('Media, price and benchmark acquisition are separate reviewed pipelines: ' + key);
  for (const key of ['fields', 'evidence', 'specs']) if (row[key] !== undefined) fail('Specifications must bind to inspected typed observations, not free-form row fields: ' + key);
  return { valid: errors.length === 0, errors, facts, source, observation };
}
function toCatalog(row, validated) {
  const { facts, source } = validated, identity = clone(row.identity), specs = {}, fields = {};
  const note = row.note || 'Exact model reference. Check original documentation for the complete platform and configuration requirements.';
  for (const [field, observation] of Object.entries(facts)) {
    const [label] = FIELDS[field]; if (observation.value !== null) specs[label] = Array.isArray(observation.value) ? observation.value.join(', ') : typeof observation.value === 'boolean' ? observation.value ? 'Yes' : 'No' : observation.value;
    const compatible = COMPAT[field];
    if (compatible && row.builderEligible) fields[compatible] = { value: observation.value, source: source.url, publisher: source.publisher, checked: source.inspectedAt, model: row.name, status: observation.value === null ? 'unknown' : 'manufacturer-specified', exact: observation.value !== null, ...(observation.unit ? { unit: observation.unit } : {}), ...(field==='coolerSockets'?{exhaustive:false}:{}), condition: field === 'recommendedPsuW' ? 'Published whole-system recommendation, not measured consumption or a cable certification.' : field==='coolerSockets' ? 'Positive support in the inspected document only; an omitted socket may require a later revision or separate kit and is not a documented incompatibility.' : field.endsWith('Mm') ? 'Named-model outer dimension only; cables, adjacent parts and installation still need verification.' : 'Narrow named-model specification only; exact system support is a separate check.' };
  }
  const output = { id: row.id, name: row.name, model: row.name, brand: canonicalBrand(row.brand), cat: row.cat, year: row.year ?? null, architecture: row.architecture, summary: row.summary, specs, source: source.url, sku: identity.manufacturerPartNumber, identity, aliases: row.aliases || [], segment: row.segment, usageScope: row.builderEligible ? 'consumer-component' : row.segment + '-reference', builderEligible: row.builderEligible === true, indexable: true, note, catalogOrigin: 'total-refinement-2026-10-19', sourceStatus: source.confidence, verifiedAt: source.inspectedAt, ...(Object.keys(fields).length ? { fields } : {}), provenance: { sourceId: row.sourceId, publisher: source.publisher, sourceURL: source.url, inspectedAt: source.inspectedAt, scope: source.scope, intakeFile: row.intakeFile, recordHash: hash({ row, observation: validated.observation, source: { url:source.url, publisher:source.publisher, inspectedAt:source.inspectedAt, scope:source.scope, confidence:source.confidence } }) } };
  if (row.cat === 'ram') output.specs['Package type'] = identity.packageType === 'kit' ? 'Matched kit' : 'Single module';
  return output;
}
function stage(existing, bundle = loadPackets()) {
  const errors = [], additions = [], unchanged = [], conflicts = [], ids = new Map(existing.map(part => [part.id, part]));
  const keys = new Map(); for (const part of existing) { const key = identityKey(part); if (!keys.has(key)) keys.set(key, part); }
  for (const row of bundle.records) {
    const checked = validateRecord(row, bundle.sources);
    if (!checked.valid) { errors.push(...checked.errors); continue; }
    const part = toCatalog(row, checked), prior = ids.get(part.id), sameKey = keys.get(identityKey(part));
    if (prior) {
      if (prior.catalogOrigin === part.catalogOrigin && prior.provenance?.recordHash === part.provenance.recordHash && hash(prior) === hash(part)) unchanged.push(part.id);
      else conflicts.push({ id: part.id, existing: prior.id, kind: 'stable-id-conflict', message: 'Review explicitly; existing data was not overwritten.' });
      continue;
    }
    if (sameKey) { conflicts.push({ id: part.id, existing: sameKey.id, kind: 'duplicate-identity', message: 'Resolve to an existing stable ID with a reviewed alias; no automatic merge.' }); continue; }
    ids.set(part.id, part); keys.set(identityKey(part), part); additions.push(part);
  }
  return { valid: errors.length === 0 && conflicts.length === 0, errors, conflicts, additions, unchanged, candidates: bundle.candidates };
}
function prepareCatalog(records, options = {}) {
  if (!Array.isArray(records)) throw Error('Expected the shared catalog array');
  const result = stage(records, options.bundle || loadPackets(options.directory));
  if (!result.valid) throw Error('Catalog intake rejected before mutation:\n' + [...result.errors, ...result.conflicts.map(item => item.id + ': ' + item.kind)].join('\n'));
  records.push(...result.additions.map(clone)); return records;
}
function publicPart(part) {
  const keep = ['id', 'name', 'brand', 'cat', 'year', 'architecture', 'summary', 'specs', 'source', 'sku', 'model', 'note', 'builderEligible', 'indexable', 'aliases', 'segment'];
  return Object.fromEntries(keep.filter(key => part[key] !== undefined).map(key => [key, part[key]]));
}
function browserSource(records) {
  const additions = records.filter(part => part.catalogOrigin === 'total-refinement-2026-10-19').map(publicPart);
  return '/* Inspected, exact-model intake; no price, photo, model or performance claim. */\nwindow.PCP_TOTAL_CATALOG=' + JSON.stringify(additions).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + ';\nif(typeof catalog!=="undefined"&&!window.PCP_BUILDER_CATALOG){for(const part of window.PCP_TOTAL_CATALOG){if(!catalog.some(existing=>existing.id===part.id))catalog.push(part);}}\n';
}
function loaderSource() {
  return `/* Additional exact hardware loads after the crawlable catalog's first render. */
(()=>{'use strict';let pending,ready=false;const doc=document;function notice(text,error=false){let p=doc.querySelector('[data-total-catalog-status]');if(!p){p=doc.createElement('p');p.dataset.totalCatalogStatus='';p.setAttribute('role','status');doc.querySelector('#catalog-summary')?.after(p);}p.className=error?'empty-message':'sr-only';p.textContent=text;if(error){const b=doc.createElement('button');b.type='button';b.textContent='Retry loading';b.addEventListener('click',load);p.append(b);}}
function load(){if(ready)return Promise.resolve();if(pending)return pending;notice('Loading additional hardware.');pending=fetch('/data/total-catalog-display.json',{credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).then(rows=>{if(!Array.isArray(rows)||rows.some(p=>!p.id||!p.name||!p.cat))throw Error('Invalid catalog data');if(typeof catalog==='undefined')throw Error('Catalog unavailable');const ids=new Set(catalog.map(p=>p.id));for(const part of rows)if(!ids.has(part.id)){catalog.push(part);ids.add(part.id);}ready=true;doc.querySelector('#catalog-search')?.dispatchEvent(new Event('input',{bubbles:true}));notice('Hardware catalog ready.');doc.dispatchEvent(new CustomEvent('pcp:catalog-ready'));}).catch(()=>{pending=null;notice('Additional hardware could not load. ',true);});return pending;}
function start(){doc.addEventListener('input',e=>{if(e.target?.id==='catalog-search')load();},true);doc.addEventListener('change',e=>{if(['catalog-category','catalog-era','catalog-sort'].includes(e.target?.id))load();},true);if(window.requestIdleCallback)window.requestIdleCallback(load,{timeout:1500});else window.setTimeout(load,300);}if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();})();\n`;
}
function polishHTML(html, route, records = []) {
  if (typeof html !== 'string') return html;
  // The normal builder consumes its existing shared builder-catalog delivery;
  // the performance tool consumes its existing narrowed performance catalog.
  // Other interactive catalog pages get only this small display payload.
  const delivery = route?.startsWith('/hardware/') ? 'total-catalog-loader.js' : 'total-catalog-data.js';
  if (route !== '/builder/' && route !== '/performance/' && /<script\b[^>]*src="\/interface\.js(?:\?[^"<>]*)?"/.test(html) && !/src="\/total-catalog-(?:data|loader)\.js"/.test(html)) html = html.replace(/(<script\b[^>]*src="\/interface\.js(?:\?[^"<>]*)?"[^>]*><\/script>)/, '<script src="/'+delivery+'" defer></script>$1');
  const productId = route?.match(/^\/learn\/([^/]+)\.html$/)?.[1], part = records.find(p => p.id === productId && p.catalogOrigin === 'total-refinement-2026-10-19');
  if (part && !html.includes('data-total-product-identity')) {
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const detail = '<details data-total-product-identity><summary>Exact model and source</summary><dl><dt>Manufacturer part number</dt><dd>' + esc(part.sku || 'Not documented in the inspected source') + '</dd><dt>Revision</dt><dd>' + esc(part.identity.revision || 'Not documented') + '</dd><dt>Platform</dt><dd>' + esc(part.segment) + '</dd><dt>Source inspected</dt><dd>' + esc(part.verifiedAt) + '</dd></dl><p><a href="' + esc(part.source) + '">Original manufacturer specifications</a></p><p>Specifications describe this named model; system support and installed fit still need checking.</p></details>';
    html = html.replace('<h2>Model notes</h2>', '<h2>Model notes</h2>' + detail);
  }
  return html;
}
function counts(records) { return { total: records.length, byCategory: records.reduce((out, part) => (out[part.cat] = (out[part.cat] || 0) + 1, out), {}), withExplicitMPN: records.filter(p => p.identity?.manufacturerPartNumber || p.sku || p.mpn).length, structuredPartnerGPUIdentities: records.filter(p => p.cat === 'gpu' && p.identity?.boardPartner).length, namedPartnerGPURecords: records.filter(p => p.cat === 'gpu' && !['NVIDIA','AMD','ATI','Intel','IBM','3dfx'].includes(p.brand)).length }; }
function coverage(existing, bundle = loadPackets()) {
  const staged = stage(existing, bundle), accepted = staged.valid ? staged.additions : [], combined = existing.concat(accepted), published = combined.filter(p => p.catalogOrigin === 'total-refinement-2026-10-19');
  const registry=require('./component-photo-catalog.cjs'),publishedIds=new Set(published.map(part=>part.id)),photos={};
  for(const name of registry.files){const file=path.join(__dirname,name);if(fs.existsSync(file))for(const[id,image]of Object.entries(JSON.parse(fs.readFileSync(file,'utf8'))))if(publishedIds.has(id)&&image.visualReviewed===true)photos[id]=image;}
  const photoErrors=registry.validate(combined,photos);if(photoErrors.length)throw Error('Coverage cannot claim unvalidated media: '+photoErrors.join('; '));
  const imageGaps=published.filter(part=>!photos[part.id]).map(part=>part.id);
  return { schema: 1, version: VERSION, evidenceDate: '2026-10-19', status: staged.valid ? 'validated-additive-intake' : 'blocked', before: counts(existing), added: counts(accepted), validatedCandidateCount: staged.additions.length, after: counts(combined), packetRecords: bundle.records.length, alreadyApplied: staged.unchanged.length, sourceCount: Object.keys(bundle.sources).length, errors: staged.errors, conflicts: staged.conflicts, specializedReferenceRecords: published.filter(p => !p.builderEligible).length, newPhotoAssignments: Object.keys(photos).length, photoAssignmentScope:'Reviewed supplier/manufacturer galleries bound to named products; shared exterior images do not prove unseen chip labels or revisions.', newDownloaded3DModels: 0, newRetailOffers: 0, candidates: staged.candidates, gaps: { exactMPNUnknown: published.filter(p => !p.sku).map(p => p.id), revisionUnknown: published.filter(p => p.identity.revision === null).map(p => p.id), newExactImagesMissing: imageGaps, newExactModelsMissing: published.map(p => p.id), completeness: 'Not exhaustive. This batch verifies bounded model sets only; no whole-market denominator or completion percentage is known.' } };
}
function prepare({ root, records, docsRoot } = {}) {
  const report = coverage(records); prepareCatalog(records); fs.writeFileSync(path.join(root, 'total-catalog-data.js'), browserSource(records));fs.writeFileSync(path.join(root,'total-catalog-loader.js'),loaderSource());
  const docs = docsRoot || path.resolve(__dirname, '../docs/total-refinement/catalog'); fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(docs, 'coverage.json'), JSON.stringify(report, null, 2) + '\n');
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(path.join(root,'data/total-catalog-display.json'),JSON.stringify(records.filter(part=>part.catalogOrigin==='total-refinement-2026-10-19').map(publicPart)));
  fs.writeFileSync(path.join(root, 'data/total-catalog-provenance.json'), JSON.stringify({ version: VERSION, records: records.filter(p => p.catalogOrigin === 'total-refinement-2026-10-19'), sources: loadPackets().sources }));
  return report;
}
function planRollback(records, ids) {
  const selected = new Set(ids), bundle = loadPackets(), audited = new Map(stage([], bundle).additions.map(part => [part.id, part]));
  const removable = [], conflicts = [];
  for (const id of selected) {
    const current = records.find(part => part.id === id), original = audited.get(id);
    if (!current || !original || current.catalogOrigin !== original.catalogOrigin || current.provenance?.recordHash !== original.provenance.recordHash || hash(current) !== hash(original)) conflicts.push({ id, reason: 'Unknown or changed record; manual review required.' });
    else removable.push(id);
  }
  return { removable, conflicts, dataLoss: false, note: 'Planning only; never deletes saved builds. If withdrawn later, keep each old product URL and a historical identity stub, and surface affected saved references for repair.' };
}
function loadExisting(root = path.resolve(__dirname, '../dist')) {
  const context = { window: {}, document: { querySelector() {} } }; vm.createContext(context);
  for (const file of ['data', 'history-data', 'universe-data', 'component-data', 'core', 'retail-data', 'phone-catalog', 'cooling-data', 'completion-catalog']) vm.runInContext(fs.readFileSync(path.join(root, file + '.js'), 'utf8'), context);
  vm.runInContext('globalThis.records=catalog', context); return clone(context.records);
}
function writeReport(output = path.resolve(__dirname, '../docs/total-refinement/catalog/coverage.json')) {
  const report = coverage(loadExisting()); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n'); return report;
}
if (require.main === module) {
  const report = writeReport(); console.log(JSON.stringify({ status: report.status, before: report.before.total, added: report.added, after: report.after.total, candidates: report.candidates.length, errors: report.errors, conflicts: report.conflicts }, null, 2)); if (report.status === 'blocked') process.exitCode = 1;
}
module.exports = { VERSION, CONFIDENCE, SEGMENTS, FIELDS, loadPackets, loadExisting, normalizeUnit, canonicalBrand, exactPartNumber, identityKey, validateRecord, toCatalog, stage, prepareCatalog, publicPart, browserSource, loaderSource, polishHTML, counts, coverage, prepare, planRollback, writeReport };
