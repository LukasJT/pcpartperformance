'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { COOLERS, FACTS, BOXED_CPU_FACTS, SOURCES, CHECKED_AT, validateCatalog, getCooler, evidencePacket } = require('./oct16-cooling-data.cjs');
const engine = require('./compatibility-evidence.cjs');
const copy = value => JSON.parse(JSON.stringify(value));

test('twelve distinct exact models have scoped current manufacturer evidence', () => {
  assert.equal(COOLERS.length, 12);
  assert.equal(COOLERS.filter(part => part.cooler.type === 'air').length, 7);
  assert.equal(COOLERS.filter(part => part.cooler.type === 'aio').length, 5);
  assert.deepEqual(validateCatalog(), []);
  assert.equal(new Set(COOLERS.map(part => part.id)).size, 12);
  for (const part of COOLERS) {
    assert.equal(part.cat, 'cooler');
    assert.ok(part.evidence.sourceIds.every(id => SOURCES[id]));
    assert.equal(part.evidence.checkedAt, '2026-10-16');
    assert.equal(engine.field(part, 'coolingType').status, 'manufacturer-specified');
    assert.equal(engine.verified(engine.field(part, 'supportedSockets')), true);
  }
});

test('installed height is independent of a heatsink-only dimension', () => {
  const part = getCooler('cooler-thermalright-phantom-spirit-120-se');
  assert.equal(part.cooler.heatsinkHeightMm, 154);
  assert.equal(part.cooler.heightMm, null);
  assert.equal(engine.field(part, 'heatsinkHeight').value, 154);
  assert.equal(engine.field(part, 'installedHeight').value, null);
  assert.equal(engine.verified(engine.field(part, 'installedHeight')), false);
  assert.equal(FACTS[part.id].installedHeight.exact, false);
});

test('modern Noctua page height is not overwritten by historical or related-model data', () => {
  const part = getCooler('cooler-noctua-nh-d15-chromax-black');
  assert.equal(engine.field(part, 'installedHeight').value, 168);
  assert.equal(engine.field(part, 'heatsinkHeight').value, 160);
  assert.equal(getCooler('cooler-noctua-nh-u12a').cooler.heightMm, 158);
  assert.equal(getCooler('cooler-noctua-nh-l9a-am5').cooler.heightMm, 37);
});

test('socket support does not imply a documented included-kit list', () => {
  const ps = getCooler('cooler-thermalright-phantom-spirit-120-se');
  assert.ok(engine.field(ps, 'supportedSockets').value.includes('AM5'));
  assert.equal(engine.field(ps, 'mountingIncluded').value, null);
  assert.equal(engine.verified(engine.field(ps, 'mountingIncluded')), false);
  const l9a = getCooler('cooler-noctua-nh-l9a-am5');
  assert.deepEqual(engine.field(l9a, 'mountingIncluded').value, ['AM5']);
  assert.equal(engine.field(l9a, 'supportedSockets').value.includes('AM4'), false);
});

test('Corsair current guide explicitly supplies the four socket kits, without inventing radiator thickness', () => {
  for (const nominal of [240, 360]) {
    const part = getCooler(`cooler-corsair-nautilus-${nominal}-rs-black`);
    const kit = engine.field(part, 'mountingIncluded');
    assert.deepEqual(new Set(kit.value), new Set(['AM5', 'AM4', 'LGA1851', 'LGA1700']));
    assert.equal(kit.source, SOURCES.corsairManual.url);
    assert.equal(engine.field(part, 'radiatorThickness').value, null);
    assert.equal(engine.field(part, 'radiatorSize').value, nominal);
    assert.equal(engine.field(part, 'installedHeight').value, null);
  }
});

test('nominal AIO class is distinct from physical dimensions and complete fan-stack clearance', () => {
  const part = getCooler('cooler-arctic-liquid-freezer-iii-420-black');
  assert.equal(part.sku, 'ACFRE00137A');
  assert.equal(engine.field(part, 'radiatorSize').value, 420);
  assert.equal(engine.field(part, 'radiatorLength').value, 458);
  assert.equal(engine.field(part, 'radiatorWidth').value, 138);
  assert.equal(engine.field(part, 'radiatorThickness').value, 38);
  assert.equal(part.cooler.radiator.assemblyThicknessMm, null);
  assert.equal(part.cooler.motherboardFit, null);
  assert.ok(part.evidence.sourceIds.includes('arcticBoardFit'));
});

test('GPU-style name fuzzing cannot silently transfer cooler evidence to other variants', () => {
  for (const id of ['cooler-noctua-nh-d15-g2-hbc', 'cooler-noctua-nh-l9a-am4', 'cooler-arctic-liquid-freezer-iii-pro-360-black', 'cooler-corsair-nautilus-360-rs-argb']) {
    assert.equal(getCooler(id), null);
    assert.equal(FACTS[id], undefined);
    assert.equal(engine.field({ id, cat: 'cooler', name: id }, 'installedHeight').value, null);
  }
});

test('boxed CPU evidence retains exact packaging limits and does not change unknown tray packages into passes', () => {
  assert.equal(BOXED_CPU_FACTS['9800x3d'].includedCooler.value, false);
  assert.equal(BOXED_CPU_FACTS['7800x3d'].includedCooler.value, false);
  assert.equal(BOXED_CPU_FACTS['7600'].includedCooler.value, true);
  assert.equal(BOXED_CPU_FACTS['7600'].includedCooler.exactSku, '100-100001015BOX');
  assert.equal(BOXED_CPU_FACTS['7600'].includedCooler.packaging, 'boxed');
  assert.equal(BOXED_CPU_FACTS['7600x'], undefined);
  assert.match(BOXED_CPU_FACTS['7600'].includedCooler.condition, /tray/);
});

test('schema rejects unverified values disguised as verified, zero dimensions and duplicate identities', () => {
  const badHeight = copy(COOLERS);
  badHeight[0].cooler.heightMm = 0;
  assert.ok(validateCatalog(badHeight).some(issue => issue.includes('must be null')));
  const badFact = copy(COOLERS);
  badFact[4].evidence.fields.installedHeight.exact = true;
  assert.ok(validateCatalog(badFact).some(issue => issue.includes('Unknown marked verified')));
  const duplicate = copy(COOLERS);
  duplicate.push(copy(duplicate[0]));
  assert.ok(validateCatalog(duplicate).some(issue => issue.includes('duplicate ID')));
  assert.ok(validateCatalog(duplicate).some(issue => issue.includes('Duplicate exact cooler identity')));
});

test('schema rejects source substitution and unsupported mounting-kit claims', () => {
  const source = copy(COOLERS);
  source[0].source = 'https://unreviewed-example.invalid/cooler';
  assert.ok(validateCatalog(source).some(issue => issue.includes('Unapproved source')));
  const kit = copy(COOLERS);
  kit[3].cooler.includedMounting.push('AM4');
  assert.ok(validateCatalog(kit).some(issue => issue.includes('Unsupported kit claim')));
  const missing = copy(COOLERS);
  delete missing[0].evidence.sourceIds;
  missing[0].evidence.fields.installedHeight = null;
  missing[1].cooler.supportedSockets = null;
  assert.ok(validateCatalog(missing).some(issue => issue.includes('Missing source/date')));
  assert.ok(validateCatalog(missing).some(issue => issue.includes('Invalid fact record')));
  assert.ok(validateCatalog(missing).some(issue => issue.includes('Invalid socket list')));
  assert.deepEqual(validateCatalog(null), ['Cooler catalog must be an array']);
});

test('evidence packet is deterministic, matches its saved artifact and makes no lab or 3D certification claim', () => {
  const packet = evidencePacket();
  assert.equal(packet.checkedAt, CHECKED_AT);
  assert.equal(packet.verification.measuredThermalTests, 0);
  assert.equal(packet.verification.manufacturerCertifiedBuilds, 0);
  assert.equal(packet.verification.humanEditorialReview, null);
  assert.ok(packet.unresolved.some(item => item.includes('3D')));
  const saved = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../docs/transformation-oct16/cooling-evidence.json'), 'utf8'));
  assert.deepEqual(packet, saved);
});
