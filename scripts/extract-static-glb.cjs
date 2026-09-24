// Extract a named static component, retaining its ancestor transforms and only
// the geometry, materials and embedded textures it uses. Source rights still apply.
const fs = require('fs'), path = require('path');
const [source, name, output] = process.argv.slice(2);
if (!output) throw Error('Usage: node extract-static-glb.cjs source.glb node-name output.glb');
const input = fs.readFileSync(source), external = path.extname(source).toLowerCase() === '.gltf';
if (!external && input.readUInt32LE(0) !== 0x46546c67) throw Error('Expected GLB or glTF');
const end = external ? 0 : 20 + input.readUInt32LE(12);
const doc = JSON.parse(external ? input : input.subarray(20, end));
function localResource(uri) {
  const base=path.resolve(path.dirname(source)), file=path.resolve(base,decodeURIComponent(uri));
  if(!file.startsWith(base+path.sep))throw Error('Resource outside source directory');
  return file;
}
if(external && (doc.buffers.length!==1 || !doc.buffers[0].uri))throw Error('Expected one external buffer');
const binary = external ? fs.readFileSync(localResource(doc.buffers[0].uri)) : input.subarray(end + 8);
if(doc.animations?.length||doc.skins?.length)throw Error('Static scenes only');
const names=name.startsWith('@')?JSON.parse(fs.readFileSync(name.slice(1),'utf8')):[name];
const matches=names.map(label=>{
  const ids=doc.nodes.map((n,i)=>n.name===label?i:-1).filter(i=>i>=0);
  if(ids.length!==1)throw Error('Component name must match exactly one node: '+label);
  return ids[0];
});
const keep = new Set(), roots=new Set();
function descendants(i) { keep.add(i); for (const c of doc.nodes[i].children || []) descendants(c); }
for(const selected of matches){
  descendants(selected);
  let root=selected;
  while (true) { const parent = doc.nodes.findIndex(n => n.children?.includes(root)); if (parent < 0) break; keep.add(parent); root = parent; }
  roots.add(root);
}
const maps = {};
function take(key, indices) {
  const ids = [...new Set(indices)].sort((a,b) => a-b);
  maps[key] = new Map(ids.map((id, i) => [id, i]));
  return ids.map(id => structuredClone(doc[key][id]));
}
const nodes = take('nodes', [...keep]);
const meshes = take('meshes', nodes.filter(n => n.mesh !== undefined).map(n => n.mesh));
const primitives = meshes.flatMap(m => m.primitives);
const accessors = take('accessors', primitives.flatMap(p => [...Object.values(p.attributes), ...(p.indices === undefined ? [] : [p.indices]), ...(p.targets || []).flatMap(Object.values)]));
const materials = take('materials', primitives.filter(p => p.material !== undefined).map(p => p.material));
function textureReferences(value, callback) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (/Texture$/.test(key) && child && Number.isInteger(child.index)) callback(child);
    else textureReferences(child, callback);
  }
}
const textureIds = [];
for (const m of materials) textureReferences(m, t => textureIds.push(t.index));
const textures = take('textures', textureIds);
const images = take('images', textures.map(t => t.source));
const samplers = take('samplers', textures.filter(t => t.sampler !== undefined).map(t => t.sampler));
if (accessors.some(a => a.sparse) || nodes.some(n => n.skin !== undefined) || textures.some(t => t.extensions)) throw Error('Unsupported sparse, skinned or extension texture asset');
const bufferViews = take('bufferViews', [...accessors.filter(a => a.bufferView !== undefined).map(a => a.bufferView), ...images.filter(i=>i.bufferView!==undefined).map(i => i.bufferView)]);
for (const n of nodes) {
  if (n.children) n.children = n.children.filter(i => keep.has(i)).map(i => maps.nodes.get(i));
  if (n.mesh !== undefined) n.mesh = maps.meshes.get(n.mesh);
  delete n.camera; delete n.extensions;
}
for (const p of primitives) {
  for (const key of Object.keys(p.attributes)) p.attributes[key] = maps.accessors.get(p.attributes[key]);
  if (p.indices !== undefined) p.indices = maps.accessors.get(p.indices);
  if (p.material !== undefined) p.material = maps.materials.get(p.material);
  for (const target of p.targets || []) for (const key of Object.keys(target)) target[key] = maps.accessors.get(target[key]);
}
for (const a of accessors) if (a.bufferView !== undefined) a.bufferView = maps.bufferViews.get(a.bufferView);
for (const m of materials) textureReferences(m, t => { t.index = maps.textures.get(t.index); });
for (const t of textures) { t.source = maps.images.get(t.source); if (t.sampler !== undefined) t.sampler = maps.samplers.get(t.sampler); }
for (const i of images) if(i.bufferView!==undefined)i.bufferView = maps.bufferViews.get(i.bufferView);
let offset = 0;
const compactViews = [], chunks = [];
function copyRange(view, start, length) {
  const data = Buffer.alloc(Math.ceil(length / 4) * 4);
  binary.copy(data, 0, (view.byteOffset || 0) + start, (view.byteOffset || 0) + start + length);
  compactViews.push({...view, buffer:0, byteOffset:offset, byteLength:length});
  offset += data.length; chunks.push(data);
  return compactViews.length - 1;
}
for (const a of accessors) {
  if (a.bufferView === undefined) continue;
  const v = bufferViews[a.bufferView];
  const width = {5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[a.componentType] * {SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
  if (!width) throw Error('Unsupported accessor layout');
  a.bufferView = copyRange(v, a.byteOffset || 0, (a.count-1)*(v.byteStride || width)+width);
  a.byteOffset = 0;
}
for (const image of images) {
  if(image.uri){
    const bytes=fs.readFileSync(localResource(image.uri)),data=Buffer.alloc(Math.ceil(bytes.length/4)*4);bytes.copy(data);
    image.bufferView=compactViews.length;compactViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});offset+=data.length;chunks.push(data);
    image.mimeType=image.mimeType||(/\.png$/i.test(image.uri)?'image/png':/\.jpe?g$/i.test(image.uri)?'image/jpeg':null);
    if(!image.mimeType)throw Error('Unsupported image type');delete image.uri;
  }else{const v=bufferViews[image.bufferView]; image.bufferView=copyRange(v,0,v.byteLength);}
}
const result = {asset:doc.asset, scene:0, scenes:[{nodes:[...roots].map(root=>maps.nodes.get(root))}], nodes, meshes, accessors, materials, textures, images, samplers, bufferViews:compactViews, buffers:[{byteLength:offset}], ...(doc.extensionsUsed ? {extensionsUsed:doc.extensionsUsed} : {})};
const raw = Buffer.from(JSON.stringify(result));
const json = Buffer.alloc(Math.ceil(raw.length / 4) * 4, 32); raw.copy(json);
const header = Buffer.alloc(20), binHeader = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0); header.writeUInt32LE(2,4); header.writeUInt32LE(28+json.length+offset,8); header.writeUInt32LE(json.length,12); header.writeUInt32LE(0x4e4f534a,16);
binHeader.writeUInt32LE(offset,0); binHeader.writeUInt32LE(0x004e4942,4);
fs.writeFileSync(output, Buffer.concat([header,json,binHeader,...chunks]));
console.log(name, nodes.length, 'nodes;', fs.statSync(output).size, 'bytes');
