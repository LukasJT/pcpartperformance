const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
async function inspect(file, orientation=[0,0,0]) {
 const T=await import(pathToFileURL(path.resolve(__dirname,'../dist/vendor/three/build/three.module.min.js')).href);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.readUInt32LE(0),0x46546c67,'GLB magic');
 assert.equal(bytes.readUInt32LE(4),2,'GLB version');
 assert.equal(bytes.readUInt32LE(8),bytes.length,'GLB truncated');
 assert.equal(bytes.readUInt32LE(16),0x4e4f534a,'JSON chunk');
 const end=20+bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,end));
 assert.equal(bytes.readUInt32LE(end+4),0x004e4942,'BIN chunk');
 const binaryLength=bytes.readUInt32LE(end);
 assert.ok(end+8+binaryLength===bytes.length,'Invalid binary length');
 assert.ok(doc.buffers.every((b,i)=>!b.uri&&(i===0||b.extensions?.EXT_meshopt_compression?.fallback===true)),'Must be self-contained');
 for(const view of doc.bufferViews||[]) {
  const packed=view.extensions?.EXT_meshopt_compression;
  assert.ok((view.byteOffset||0)+view.byteLength<=doc.buffers[view.buffer].byteLength,'View exceeds declared buffer');
  if(packed){assert.equal(packed.buffer,0);assert.ok((packed.byteOffset||0)+packed.byteLength<=binaryLength,'Compressed view exceeds binary');assert.equal(packed.count*packed.byteStride,view.byteLength);}
  else {assert.equal(view.buffer,0);assert.ok((view.byteOffset||0)+view.byteLength<=binaryLength,'View exceeds binary');}
 }
 for(const image of doc.images||[])assert.ok(image.bufferView!==undefined&&!image.uri,'Texture must be embedded');
 const bounds=new T.Box3(),rotate=new T.Matrix4().makeRotationFromEuler(new T.Euler(...orientation));
 let triangles=0,meshes=0;
 function visit(i,parent,ancestors=new Set()) {
  assert.ok(!ancestors.has(i),'Cyclic scene');
  const next=new Set(ancestors);next.add(i);
  const n=doc.nodes[i];assert.ok(n,'Invalid node');
  const local=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1])));
  const world=parent.clone().multiply(local);
  if(n.mesh!==undefined){meshes++;for(const p of doc.meshes[n.mesh].primitives){
   const a=doc.accessors[p.attributes.POSITION];assert.ok(a?.min&&a?.max,'Position bounds required');
   const divisor=a.normalized?({5120:127,5121:255,5122:32767,5123:65535,5124:2147483647,5125:4294967295}[a.componentType]||1):1;
   const normalized=v=>v.map(x=>Math.max(-1,x/divisor));
   const min=a.normalized?normalized(a.min):a.min,max=a.normalized?normalized(a.max):a.max;
   bounds.union(new T.Box3(new T.Vector3(...min),new T.Vector3(...max)).applyMatrix4(world));
   const count=p.indices===undefined?a.count:doc.accessors[p.indices].count;
   if(p.mode===undefined||p.mode===4)triangles+=count/3;
  }}
  for(const c of n.children||[])visit(c,world,next);
 }
 for(const root of doc.scenes[doc.scene||0].nodes)visit(root,rotate);
 const size=bounds.getSize(new T.Vector3()).toArray();
 assert.ok(size.every(x=>Number.isFinite(x)&&x>1e-9),'Empty or flat scene');
 assert.ok(triangles>0&&Number.isInteger(triangles),'No valid triangles');
 return {bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),meshes,triangles,textures:doc.images?.length||0,sourceBounds:size,animations:doc.animations?.length||0};
}
module.exports={inspect};
if(require.main===module)(async()=>{
 if(process.argv[2]) { console.log(JSON.stringify(await inspect(process.argv[2]),null,2));return; }
 const manifest=JSON.parse(fs.readFileSync('dist/model-library.json'));
 const peripherals=require('./peripheral-models.json');
 const phones=require('./phone-models.json');
 const files=[...new Set([...manifest.items.map(x=>'dist'+x.model),...Object.values(peripherals).map(x=>'dist/assets/models/'+x.asset),...Object.values(phones).map(x=>'dist/assets/models/'+x.asset)])];
 const assets=[];
 for(const file of files)assets.push({file,...await inspect(file)});
 fs.mkdirSync('docs/model-research',{recursive:true});
 fs.writeFileSync('docs/model-research/asset-validation.json',JSON.stringify({checkedAt:new Date().toISOString(),totalComponents:manifest.total,downloadedMappings:manifest.community,simplifiedMappings:manifest.approximate,uniqueFiles:assets.length,method:'Self-contained GLB, chunk lengths, embedded texture ranges, reachable scene transforms, nonzero volume and triangles. This does not certify shape identity or clearance.',assets},null,2));
 console.log(files.length+' unique GLB files passed structural and scene-volume validation.');
})().catch(e=>{console.error(e);process.exitCode=1});
