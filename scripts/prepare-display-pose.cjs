// Remove only creator presentation rotations/translations from explicitly reviewed ancestors.
// Keep authored scale and all descendant geometry, materials and relative component transforms.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const [source,output,list]=process.argv.slice(2);
if(!list)throw Error('Usage: prepare-display-pose.cjs source.glb output.glb 0,1,2,3');
(async()=>{
 const T=await import(pathToFileURL(path.resolve(__dirname,'../dist/vendor/three/build/three.module.min.js')).href);
 const b=fs.readFileSync(source),end=20+b.readUInt32LE(12),j=JSON.parse(b.subarray(20,end));
 if(j.animations?.length||j.skins?.length)throw Error('Static models only');
 for(const i of list.split(',').map(Number)){
  const n=j.nodes[i];if(!n)throw Error('Invalid reviewed node '+i);
  if(n.matrix){const scale=new T.Vector3();new T.Matrix4().fromArray(n.matrix).decompose(new T.Vector3(),new T.Quaternion(),scale);n.scale=scale.toArray();}
  delete n.matrix;delete n.rotation;delete n.translation;
 }
 const raw=Buffer.from(JSON.stringify(j)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),h=Buffer.from(b.subarray(0,20));
 h.writeUInt32LE(20+json.length+b.length-end,8);h.writeUInt32LE(json.length,12);
 fs.writeFileSync(output,Buffer.concat([h,json,b.subarray(end)]));
})().catch(e=>{console.error(e);process.exitCode=1});
