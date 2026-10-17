import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { NodeIO } from '../../model-tools/node_modules/@gltf-transform/core/dist/index.js';
import { ALL_EXTENSIONS } from '../../model-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import { getBounds } from '../../model-tools/node_modules/@gltf-transform/functions/dist/index.js';
import { MeshoptDecoder } from '../../model-tools/node_modules/meshoptimizer/index.js';
import sharp from '../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.mjs';

const require = createRequire(import.meta.url), validator = require('../../work/gltf-validator');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const acquisition = require('../docs/master-completion/models/acquisition.json');
const metadata = require('../docs/master-completion/models/public-model-research.json').models;
const candidates = require('./completion-models-candidates.json');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const report = { schema: 1, checkedAt: new Date().toISOString(), validatorVersion: validator.version(), method: 'Khronos structural GLB validation plus Meshopt decoding, embedded image pixel decoding, finite accessors, self-contained resources, immutable source/asset hashes, source-license/title joins and preserved triangle counts/bounds. No physical clearance or real-GPU rendering certification.', assets: [] };
for (const item of candidates) {
  const record = acquisition.assets[item.uid];if (!record?.outputSha256) continue;
  const source = metadata[item.uid];
  assert.equal(source.license.slug, 'by');assert.equal(source.downloadable, true);assert.equal(source.name, item.title);assert.equal(record.creator, source.creator);
  const file = path.join(root, 'dist', record.output), bytes = fs.readFileSync(file);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), record.outputSha256, item.id + ': output changed');
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF');assert.equal(bytes.readUInt32LE(8), bytes.length);
  const json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
  assert.ok((json.buffers || []).every(buffer => !buffer.uri), item.id + ': external buffer');
  assert.ok((json.images || []).every(image => image.bufferView !== undefined && !image.uri), item.id + ': external image');
  const result = await validator.validateBytes(new Uint8Array(bytes), { uri: item.asset, maxIssues: 1000 });
  const doc = await io.read(file), asset = doc.getRoot().getAsset(), bounds = getBounds(doc.getRoot().listScenes()[0]);
  assert.equal(asset.extras.title, item.title);assert.ok(asset.extras.source.includes(item.uid));assert.ok(asset.extras.author.includes(source.creator));assert.match(asset.extras.license, /CC-BY-4.0/);
  let finiteValues = 0;
  const decodedImages = [];
  for (const [index, texture] of doc.getRoot().listTextures().entries()) {
    const image = texture.getImage();assert.ok(image?.length, item.id + ': empty embedded image');
    const { data, info } = await sharp(image, { limitInputPixels: 4096 * 4096 }).raw().toBuffer({ resolveWithObject: true });
    assert.ok(info.width > 0 && info.height > 0 && info.width <= 1024 && info.height <= 1024, item.id + ': invalid prepared image size');
    assert.equal(data.length, info.width * info.height * info.channels, item.id + ': incomplete pixel decode');
    decodedImages.push({ index, mimeType: texture.getMimeType(), encodedBytes: image.length, width: info.width, height: info.height, channels: info.channels, decodedPixelBytes: data.length });
  }
  for (const accessor of doc.getRoot().listAccessors()) for (const value of accessor.getArray() || []) { assert.ok(Number.isFinite(value), item.id + ': non-finite accessor');finiteValues++; }
  for (let axis = 0; axis < 3; axis++) {
    assert.ok(Number.isFinite(bounds.min[axis]) && Number.isFinite(bounds.max[axis]) && bounds.max[axis] > bounds.min[axis], item.id + ': invalid volume');
    const extent = record.sourceBounds.max[axis] - record.sourceBounds.min[axis];
    assert.ok(Math.abs(bounds.min[axis] - record.sourceBounds.min[axis]) < extent * .001 + 1e-7 && Math.abs(bounds.max[axis] - record.sourceBounds.max[axis]) < extent * .001 + 1e-7, item.id + ': unexpected source-envelope change');
  }
  const triangles = doc.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((count, primitive) => count + (primitive.getIndices()?.getCount() || primitive.getAttribute('POSITION')?.getCount() || 0) / 3, 0), 0);
  assert.equal(triangles, record.sourceTriangles, item.id + ': unreviewed topology change');
  const issueCodes = {};for (const issue of result.issues.messages) issueCodes[issue.code] = (issueCodes[issue.code] || 0) + 1;
  report.assets.push({ id: item.id, uid: item.uid, asset: record.output, bytes: bytes.length, sha256: record.outputSha256, errors: result.issues.numErrors, warnings: result.issues.numWarnings, issueCodes, decodedImages, finiteValues, triangles, bounds, sourceLicense: 'CC BY 4.0', creator: source.creator });
  console.log(item.id, result.issues.numErrors + ' structural errors;', result.issues.numWarnings + ' warnings;', bytes.length + ' bytes;', finiteValues + ' finite decoded values');
}
report.uniquePreparedAssets = report.assets.length;
report.totalBytes = report.assets.reduce((total, asset) => total + asset.bytes, 0);
report.errors = report.assets.reduce((total, asset) => total + asset.errors, 0);
report.warnings = report.assets.reduce((total, asset) => total + asset.warnings, 0);
fs.writeFileSync(path.join(root, 'docs/master-completion/models/validation.json'), JSON.stringify(report, null, 2) + '\n');
assert.equal(report.errors, 0, 'Khronos errors need repair before release.');
