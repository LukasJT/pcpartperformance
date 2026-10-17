'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), vm = require('node:vm');
const data = require('./completion-models-data.cjs'), adapter = require('./completion-models.cjs');
const acquired = require('../docs/master-completion/models/acquisition.json').assets;
const validated = require('../docs/master-completion/models/validation.json').assets;
const research = require('../docs/master-completion/models/public-model-research.json').models;
const old = require('./sketchfab-models.json'), candidates = require('./completion-models-candidates.json');
const copy = item => JSON.parse(JSON.stringify(item));

test('ten actual individually licensed files join their exact creator/source/validation identities', () => {
  assert.deepEqual(data.validatePacket(), []);assert.equal(data.MODEL_ADDITIONS.length, 10);
  for (const model of data.MODEL_ADDITIONS) {
    const evidence = acquired[model.sourceUid], checked = validated.find(row => row.uid === model.sourceUid), source = research[model.sourceUid];
    const file = fs.readFileSync(path.resolve(__dirname, '../dist/assets/models', model.asset));
    assert.equal(file.toString('ascii', 0, 4), 'glTF');assert.equal(file.readUInt32LE(8), file.length);
    assert.equal(crypto.createHash('sha256').update(file).digest('hex'), model.sha256);
    assert.equal(file.length, model.bytes);assert.equal(checked.sha256, model.sha256);assert.equal(checked.errors, 0);
    assert.equal(checked.triangles, evidence.sourceTriangles);assert.equal(model.triangles, evidence.sourceTriangles);
    assert.equal(source.license.slug, 'by');assert.equal(source.downloadable, true);
    assert.equal(source.uid, model.sourceUid);assert.equal(source.creator, model.creator);assert.ok(model.sourceUrl.endsWith(model.sourceUid));
    const json = JSON.parse(file.toString('utf8', 20, 20 + file.readUInt32LE(12)));
    assert.ok(json.asset.extras.author.includes(model.creator));assert.ok(json.asset.extras.license.includes('CC-BY-4.0'));
    assert.equal(json.asset.extras.source, model.sourceUrl);
    assert.ok(json.asset.extras.modifications);assert.equal(json.animations?.length || 0, 0);
    if (model.originalAttribution) assert.equal(json.asset.extras.sourceAuthor, model.originalAttribution);
    assert.ok(file.length < 25000000);
  }
});

test('all original 105 licensed mappings are preserved byte-for-byte and additions cannot replace an old identity', () => {
  const before = JSON.stringify(old), combined = adapter.registry();
  assert.equal(old.length, 105);assert.equal(combined.length, 115);
  assert.deepEqual(combined.slice(0, old.length), old);assert.equal(JSON.stringify(old), before);
  assert.throws(() => adapter.registry([{ ...old[0], id: data.MODEL_ADDITIONS[0].id }]), /Refusing to replace/);
});

test('catalog preparation is idempotent and preserves unrelated records and existing fact fields', () => {
  const unrelated = { id: 'existing-user-product', name: 'Existing', cat: 'gpu', custom: true };
  const records = [unrelated, { id: 'titanrtx', name: 'TITAN RTX', cat: 'gpu', specs: { Memory: 24 }, evidence: { sourceIds: ['old'], fields: { custom: { value: 1 } } } }, { id: 'intel4004', name: '4004', cat: 'cpu' }];
  const returned = adapter.prepareCatalog(records);const first = JSON.stringify(records);adapter.prepareCatalog(records);
  assert.equal(returned, records);assert.equal(records.length, 11);assert.equal(records[0], unrelated);assert.equal(JSON.stringify(records), first);
  assert.equal(records.find(row => row.id === 'titanrtx').evidence.fields.custom.value, 1);
  assert.equal(records.find(row => row.id === 'titanrtx').specs.Memory, 24);
  assert.equal(records.find(row => row.id === 'intel4004').builderEligible, false);
  assert.throws(() => adapter.prepareCatalog([{ ...data.CATALOG_ADDITIONS[0], cat: 'gpu' }]), /identity conflict/);
});

test('public browser data merges once by stable ID and never expands a compact builder catalog', () => {
  const records = adapter.prepareCatalog([{ id: 'intel4004', name: '4004', cat: 'cpu' }, { id: 'titanrtx', name: 'TITAN RTX', cat: 'gpu' }]);
  const context = { window: {}, seed: [{ id: 'old', cat: 'cpu' }, { id: 'intel4004', name: '4004', cat: 'cpu' }, { id: 'titanrtx', name: 'TITAN RTX', cat: 'gpu', specs: { retained: 99 } }] };vm.createContext(context);vm.runInContext('const catalog=seed;', context);
  const source = adapter.browserSource(records);vm.runInContext(source, context);vm.runInContext(source, context);
  assert.equal(context.seed.length, 11);assert.equal(new Set(context.seed.map(row => row.id)).size, context.seed.length);
  assert.equal(context.seed.find(row => row.id === 'intel4004').builderEligible, false);
  assert.equal(context.seed.find(row => row.id === 'titanrtx').specs.retained, 99);
  const compact = { window: { PCP_BUILDER_CATALOG: [{ id: 'owned' }] }, seed: [{ id: 'owned' }] };vm.createContext(compact);vm.runInContext('const catalog=seed;', compact);vm.runInContext(source, compact);
  assert.equal(compact.seed.length, 1);assert.equal(compact.seed[0].id, 'owned');
  assert.doesNotMatch(source, /Downloads|Users\\|api[_-]?key|access[_-]?token|privateNotes|savedBuilds/i);
});

test('no new source model gains a guessed assembly size or calibrated fit claim', () => {
  for (const model of data.MODEL_ADDITIONS) {
    assert.equal(model.dimensionsMm, null);assert.equal(model.standaloneOnly, true);assert.equal(model.buildPlacementReady, false);
    assert.equal(model.scaleMode, 'uniform-autoframe');assert.equal(model.clearanceCertified, false);
    assert.match(model.asset, /^completion\/[a-z0-9-]+\.glb$/);assert.ok(model.caveats.length);
  }
});

test('unknown package, price and compatibility fields do not become zero, included or verified', () => {
  for (const part of data.CATALOG_ADDITIONS) {
    assert.equal(part.price, undefined);assert.equal(part.inStock, undefined);assert.equal(part.physical, undefined);
    for (const fact of Object.values(part.evidence.fields)) {
      if (fact.value === null) { assert.equal(fact.exact, false);assert.equal(fact.status, 'unknown'); }
      else { assert.equal(fact.status, 'manufacturer-specified');assert.ok(fact.source.startsWith('https://'));assert.ok(fact.checked); }
    }
  }
  const wraith = data.CATALOG_ADDITIONS.find(part => part.cat === 'cooler');
  assert.equal(wraith.cooler.heightMm, null);assert.equal(wraith.cooler.includedMounting, null);assert.equal(wraith.cooler.thermalSuitability, null);
  assert.deepEqual(wraith.evidence.fields.supportedSockets.value, ['AM5']);
});

test('historical and insufficiently documented additions stay outside new-build recommendations and indexing', () => {
  assert.equal(data.CATALOG_OVERRIDES.intel4004.builderEligible, false);
  for (const id of ['completion-cpu-intel-core-i5-661', 'retail-cooler-master-masterbox-lite-5']) {
    const record = data.CATALOG_ADDITIONS.find(part => part.id === id);assert.equal(record.builderEligible, false);assert.equal(record.indexable, false);
  }
});

test('scans retain capture-base, used-board and installed-CPU limitations instead of false exact variants', () => {
  const byId = id => data.MODEL_ADDITIONS.find(model => model.id === id);
  assert.match(byId('retail-msi-geforce-gtx-1660-gaming-x-6g').caveats.join(' '), /Green cutting mat/);
  assert.match(byId('retail-asus-z170-p').appearance, /used, broken/);
  const trx = byId('retail-gigabyte-trx40-aorus-xtreme-rev-1-0');assert.equal(trx.identity, 'related-variant');assert.match(trx.caveats.join(' '), /does not state PCB revision/);assert.match(trx.caveats.join(' '), /Threadripper/);
  assert.ok(!data.MODEL_ADDITIONS.some(model => /chromax|D15 G2|3060 Ti|1660 SUPER/.test(model.title)));
});

test('original TITAN attribution and static fan-pose modification remain traceable', () => {
  const titan = data.MODEL_ADDITIONS.find(model => model.id === 'titanrtx');
  assert.match(titan.originalAttribution, /Blue Lantern/);assert.equal(titan.creator, 'Vivien Deroche');
  assert.match(titan.changes, /authored default transforms/);assert.equal(titan.triangles, 95023);
  assert.equal(data.CATALOG_OVERRIDES.titanrtx.evidence.fields.gpuLength.value, 266.7);
  assert.equal(data.CATALOG_OVERRIDES.titanrtx.evidence.fields.gpuThickness.value, null);
  assert.equal(candidates.find(model => model.id === 'titanrtx').freezeAuthoredPoseNodes.length, 2);
});

test('source facts keep model revisions and conditional slots separate', () => {
  const z170 = data.CATALOG_ADDITIONS.find(part => part.id === 'retail-asus-z170-p');assert.equal(z170.evidence.fields.boardWidth.value, 224);assert.equal(z170.evidence.fields.sata.value, 4);
  const z590 = data.CATALOG_ADDITIONS.find(part => part.id === 'retail-msi-meg-z590-ace-gold-edition');assert.equal(z590.specs['M.2 slots'], 4);assert.equal(z590.evidence.fields.m2.value, null);
  const trx = data.CATALOG_ADDITIONS.find(part => part.id.includes('trx40'));assert.equal(trx.evidence.fields.form.value, 'XL-ATX');assert.equal(trx.evidence.fields.boardWidth.value, 275);
});

test('TITAN keeps its archived material factors and a fully decoded embedded logo image', () => {
  const proof = require('../docs/master-completion/models/texture-diagnostics.json'), model = data.MODEL_ADDITIONS.find(item => item.id === 'titanrtx');
  assert.equal(proof.outputSha256, model.sha256);assert.equal(proof.sourceSha256, model.sourceSha256);
  const bytes = fs.readFileSync(path.resolve(__dirname, '../dist/assets/models', model.asset)), json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
  const factors = json.materials.map(material => ({ name: material.name, pbrMetallicRoughness: material.pbrMetallicRoughness, emissiveFactor: material.emissiveFactor || [0, 0, 0], doubleSided: material.doubleSided === true }));
  assert.deepEqual(factors, proof.findings.sourceMaterialFactors);
  assert.equal(json.textures[0].extensions.EXT_texture_webp.source, 0);assert.equal(json.images[0].mimeType, 'image/webp');
  const image = validated.find(record => record.id === model.id).decodedImages[0];assert.equal(image.width, 1024);assert.equal(image.height, 512);assert.equal(image.decodedPixelBytes, 1572864);
  assert.equal(proof.allNewAssets.embeddedImagesDecoded, 24);
});
