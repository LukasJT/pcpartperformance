// Reproducible permitted-source import. Example:
// node --use-system-ca scripts/completion-models-import.mjs acquire
// node scripts/completion-models-import.mjs prepare
// Existing user ZIPs are read only; output stays in the named completion folders.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { NodeIO } from '../../model-tools/node_modules/@gltf-transform/core/dist/index.js';
import { ALL_EXTENSIONS } from '../../model-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import { prune, flatten, join, dedup, meshopt, textureCompress, getBounds } from '../../model-tools/node_modules/@gltf-transform/functions/dist/index.js';
import sharp from '../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.mjs';
import { MeshoptDecoder, MeshoptEncoder } from '../../model-tools/node_modules/meshoptimizer/index.js';

const require = createRequire(import.meta.url), root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidates = require('./completion-models-candidates.json');
const docs = path.join(root, 'docs/master-completion/models'), raw = path.join(root, 'tmp/completion-models/raw'), dest = path.join(root, 'dist/assets/models/completion');
const reportFile = path.join(docs, 'acquisition.json');
const report = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : { schema: 1, method: 'Public individually licensed CC BY sources or user-provided downloaded archive. No protected viewer/download extraction.', assets: {} };
const metadata = require('../docs/master-completion/models/public-model-research.json').models;
for (const dir of [docs, raw, dest]) fs.mkdirSync(dir, { recursive: true });
const save = () => fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const triangles = doc => doc.getRoot().listMeshes().reduce((sum, mesh) => sum + mesh.listPrimitives().reduce((total, primitive) => total + (primitive.getIndices()?.getCount() || primitive.getAttribute('POSITION')?.getCount() || 0) / 3, 0), 0);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const maxBytes = 60000000;
function verifyMeta(item) {
  const record = metadata[item.uid];
  if (!record || record.uid !== item.uid || record.license?.slug !== 'by' || record.downloadable !== true || record.name !== item.title || !record.creator || !record.creatorUrl) throw Error('Exact title, creator, downloadable status or individual CC BY license not verified: ' + item.uid);
  const age = Date.now() - Date.parse(record.checkedAt);
  if (!Number.isFinite(age) || age < -60000 || age > 7 * 86400000) throw Error('Refresh individual public source metadata before importing; cached license evidence is older than seven days.');
  return record;
}
function readZipEntry(file, wanted) {
  const archive = fs.readFileSync(file);if (archive.length > 100000000) throw Error('Archive exceeds the bounded review size.');
  const lower = Math.max(0, archive.length - 65557);let end = archive.length - 22;
  while (end >= lower && archive.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < lower) throw Error('ZIP central directory is missing.');
  const count = archive.readUInt16LE(end + 10);let offset = archive.readUInt32LE(end + 16);
  for (let i = 0; i < count; i++) {
    if (archive.readUInt32LE(offset) !== 0x02014b50) throw Error('Invalid ZIP central directory.');
    const method = archive.readUInt16LE(offset + 10), crc = archive.readUInt32LE(offset + 16), compressed = archive.readUInt32LE(offset + 20), size = archive.readUInt32LE(offset + 24), nameLength = archive.readUInt16LE(offset + 28), extraLength = archive.readUInt16LE(offset + 30), commentLength = archive.readUInt16LE(offset + 32), localOffset = archive.readUInt32LE(offset + 42);
    const name = archive.toString('utf8', offset + 46, offset + 46 + nameLength);offset += 46 + nameLength + extraLength + commentLength;
    if (name !== wanted) continue;
    if (size > maxBytes || compressed > maxBytes || ![0, 8].includes(method) || archive.readUInt32LE(localOffset) !== 0x04034b50) throw Error('ZIP entry is unsupported or exceeds review limits.');
    const dataOffset = localOffset + 30 + archive.readUInt16LE(localOffset + 26) + archive.readUInt16LE(localOffset + 28), bytes = archive.subarray(dataOffset, dataOffset + compressed);
    const extracted = method === 0 ? bytes : zlib.inflateRawSync(bytes, { maxOutputLength: maxBytes });
    if (extracted.length !== size || zlib.crc32(extracted) !== crc) throw Error('ZIP entry failed length/CRC validation.');
    return { bytes: extracted, archiveSha256: hash(archive) };
  }
  throw Error('Expected source entry is absent from the exact local archive.');
}
async function acquire(item) {
  const meta = verifyMeta(item), rawFile = path.join(raw, item.uid + '.glb');
  let bytes, distributionUrl = null, archiveSha256 = null;
  if (item.localArchive) {
    const source = path.join(os.homedir(), 'Downloads', item.localArchive);
    const extracted = readZipEntry(source, item.archiveEntry);bytes = extracted.bytes;archiveSha256 = extracted.archiveSha256;
  } else {
    if (!/^glbs\/\d{3}-\d{3}\/[a-f0-9]{32}\.glb$/.test(meta.publicObjectPath || '') || !meta.publicObjectPath.includes(item.uid)) throw Error('No exact public indexed distribution.');
    distributionUrl = 'https://huggingface.co/datasets/allenai/objaverse/resolve/main/' + meta.publicObjectPath;
    if (fs.existsSync(rawFile)) bytes = fs.readFileSync(rawFile);
    else {
      const response = await fetch(distributionUrl, { signal: AbortSignal.timeout(90000) });if (!response.ok) throw Error('Public distribution HTTP ' + response.status);
      const chunks = [];let size = 0;
      for await (const chunk of response.body) { size += chunk.length;if (size > maxBytes) throw Error('Public model exceeds the 60 MB review limit.');chunks.push(chunk); }
      bytes = Buffer.concat(chunks);
    }
  }
  if (bytes.toString('ascii', 0, 4) !== 'glTF' || bytes.readUInt32LE(8) !== bytes.length) throw Error('Source is not a complete GLB file.');
  fs.writeFileSync(rawFile, bytes);
  const doc = await io.read(rawFile), extras = doc.getRoot().getAsset().extras || {};
  if (!item.localArchive && (!extras.source?.includes(item.uid) || !/CC-BY-4.0|creativecommons.org\/licenses\/by\/4.0/i.test(extras.license || ''))) throw Error('Public distributed GLB lacks matching embedded source/license.');
  const count = triangles(doc);
  if (item.expectedSourceTriangles && count !== item.expectedSourceTriangles) throw Error('Local archive topology does not match the named public model.');
  report.assets[item.uid] = { ...item, sourceUrl: 'https://sketchfab.com/3d-models/' + item.uid, creator: meta.creator, creatorUrl: meta.creatorUrl, license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', metadataCheckedAt: meta.checkedAt, distributionUrl, localArchive: item.localArchive || null, archiveSha256, sourceSha256: hash(bytes), sourceBytes: bytes.length, sourceTriangles: count, sourceBounds: getBounds(doc.getRoot().listScenes()[0]), sourceExtras: extras, acquiredAt: new Date().toISOString(), status: 'acquired-awaiting-preparation-and-identity-review' };
  save();console.log(item.id, bytes.length, 'source bytes;', count, 'triangles');
}
async function prepare(item) {
  verifyMeta(item);const record = report.assets[item.uid];if (!record?.sourceSha256) throw Error('Acquire the exact licensed source first.');
  const input = path.join(raw, item.uid + '.glb'), bytes = fs.readFileSync(input);if (hash(bytes) !== record.sourceSha256) throw Error('Source changed after acquisition.');
  const doc = await io.read(input), asset = doc.getRoot().getAsset();
  if (doc.getRoot().listSkins().length) throw Error('Skinned source needs a separate reviewed import.');
  const animations = doc.getRoot().listAnimations(), allowedPoseNodes = new Set(item.freezeAuthoredPoseNodes || []);
  if (animations.length) {
    if (!allowedPoseNodes.size) throw Error('Animated source needs a separately reviewed static pose.');
    for (const animation of animations) for (const channel of animation.listChannels()) {
      const node = channel.getTargetNode(), target = channel.getTargetPath();
      if (!allowedPoseNodes.has(node.getName()) || !['rotation', 'scale'].includes(target)) throw Error('Animation no longer matches the reviewed two-fan pose.');
      if (target === 'scale') {
        const array = channel.getSampler().getOutput().getArray(), initial = node.getScale();
        if (Array.from(array).some((value, index) => Math.abs(value - initial[index % 3]) > 0.00001)) throw Error('Animated scale differs from the reviewed constant fan scale.');
      }
    }
    for (const animation of animations) animation.dispose();
  }
  asset.extras = { ...asset.extras, sourceAuthor: record.sourceExtras.author || null, title: item.title, author: record.creator + ' (' + record.creatorUrl + ')', source: record.sourceUrl, license: 'CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/)', modifications: (animations.length ? 'Fan rotation tracks removed; the two named fan nodes retain their authored default transforms. ' : '') + 'Static transforms flattened; matching primitives joined; duplicate/unused resources removed; image textures resized to 1024 pixels maximum and encoded WebP; Meshopt compression. Source appearance and proportions retained. Not clearance-certified geometry.' };
  await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 90 }), prune(), flatten(), join(), dedup(), prune(), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  const output = path.join(dest, item.asset);await io.write(output, doc);
  const data = fs.readFileSync(output);if (data.length > 25000000) throw Error('Prepared model exceeds the deployment file limit.');
  Object.assign(record, { output: '/assets/models/completion/' + item.asset, outputBytes: data.length, outputSha256: hash(data), outputTriangles: triangles(doc), outputBounds: getBounds(doc.getRoot().listScenes()[0]), modifications: asset.extras.modifications, preparedAt: new Date().toISOString(), status: 'prepared-awaiting-final-identity-review' });
  delete record.error;
  save();console.log(item.id, data.length, 'prepared bytes;', record.outputTriangles, 'triangles');
}
const [mode = 'acquire', selected = ''] = process.argv.slice(2), ids = new Set(selected.split(',').filter(Boolean));
const chosen = ids.size ? candidates.filter(item => ids.has(item.id) || ids.has(item.uid)) : candidates;
for (const id of ids) if (!candidates.some(item => item.id === id || item.uid === id)) throw Error('Unknown reviewed candidate: ' + id);
await MeshoptEncoder.ready;
let failures = 0;
for (const item of chosen) {
  try { if (mode === 'acquire') await acquire(item);else if (mode === 'prepare') await prepare(item);else throw Error('Usage: acquire | prepare [ID,ID]'); }
  catch (error) { failures++;const prior = report.assets[item.uid] || item;report.assets[item.uid] = { ...prior, error: error.message, attemptedAt: new Date().toISOString() };save();console.error(item.id + ': ' + error.message); }
}
if (failures) process.exitCode = 1;
