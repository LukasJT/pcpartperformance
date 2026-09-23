import fs from 'node:fs';

// Convert a downloaded OBJ and its PNG texture to a self-contained GLB.
// Usage: node scripts/import-sketchfab-obj.mjs source.obj texture.png output.glb
const [objPath, texturePath, outPath] = process.argv.slice(2);
if (!objPath || !texturePath || !outPath) throw Error('Expected OBJ, PNG and output GLB paths');
const lines = fs.readFileSync(objPath, 'utf8').split(/\r?\n/);
const positions = [], texcoords = [], normals = [];
const outPos = [], outUv = [], outNorm = [];
function vertex(token) {
  const [pi, ti, ni] = token.split('/').map(Number);
  const p = positions[pi - 1], uv = texcoords[ti - 1], n = normals[ni - 1];
  if (!p || !uv || !n) throw Error(`Invalid OBJ vertex ${token}`);
  outPos.push(...p); outUv.push(uv[0], 1 - uv[1]); outNorm.push(...n);
}
for (const line of lines) {
  const [kind, ...raw] = line.trim().split(/\s+/);
  if (kind === 'v') positions.push(raw.slice(0, 3).map(Number));
  else if (kind === 'vt') texcoords.push(raw.slice(0, 2).map(Number));
  else if (kind === 'vn') normals.push(raw.slice(0, 3).map(Number));
  else if (kind === 'f') {
    for (let i = 1; i < raw.length - 1; i++) {
      vertex(raw[0]); vertex(raw[i]); vertex(raw[i + 1]);
    }
  }
}
if (!outPos.length || outPos.some(x => !Number.isFinite(x))) throw Error('OBJ has no valid faces');
const min = [0, 1, 2].map(axis => Math.min(...outPos.filter((_, i) => i % 3 === axis)));
const max = [0, 1, 2].map(axis => Math.max(...outPos.filter((_, i) => i % 3 === axis)));
const chunks = [], views = [], accessors = []; let offset = 0;
function add(bytes) {
  const index = views.push({buffer: 0, byteOffset: offset, byteLength: bytes.length}) - 1;
  chunks.push(bytes, Buffer.alloc((4 - bytes.length % 4) % 4));
  offset += bytes.length + (4 - bytes.length % 4) % 4;
  return index;
}
function attribute(data, type, bounds) {
  const arr = new Float32Array(data), view = add(Buffer.from(arr.buffer));
  return accessors.push({bufferView: view, componentType: 5126, count: data.length / (type === 'VEC2' ? 2 : 3), type, ...bounds}) - 1;
}
const POSITION = attribute(outPos, 'VEC3', {min, max});
const NORMAL = attribute(outNorm, 'VEC3');
const TEXCOORD_0 = attribute(outUv, 'VEC2');
const image = add(fs.readFileSync(texturePath));
const json = {
  asset: {version: '2.0', generator: 'PC Part Performance Sketchfab OBJ importer'},
  scene: 0, scenes: [{nodes: [0]}], nodes: [{mesh: 0}],
  meshes: [{primitives: [{attributes: {POSITION, NORMAL, TEXCOORD_0}, material: 0}]}],
  materials: [{pbrMetallicRoughness: {baseColorTexture: {index: 0}, metallicFactor: 0, roughnessFactor: 0.8}, doubleSided: true}],
  textures: [{source: 0}], images: [{bufferView: image, mimeType: 'image/png'}],
  buffers: [{byteLength: offset}], bufferViews: views, accessors,
};
const raw = Buffer.from(JSON.stringify(json));
const padded = Buffer.concat([raw, Buffer.alloc((4 - raw.length % 4) % 4, 32)]);
const binary = Buffer.concat(chunks);
const glb = Buffer.alloc(28 + padded.length + binary.length);
glb.writeUInt32LE(0x46546c67, 0); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(glb.length, 8);
glb.writeUInt32LE(padded.length, 12); glb.writeUInt32LE(0x4e4f534a, 16); padded.copy(glb, 20);
glb.writeUInt32LE(binary.length, 20 + padded.length); glb.writeUInt32LE(0x004e4942, 24 + padded.length);
binary.copy(glb, 28 + padded.length);
fs.writeFileSync(outPath, glb);
console.log(`${outPath}: ${outPos.length / 3} triangles, ${glb.length} bytes`);
