// Inspect group envelopes from accessor metadata without loading large buffers.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const [source,parentIndex,output]=process.argv.slice(2);
if(!output)throw Error('Usage: inspect-gltf-groups.cjs scene.gltf parent-node-index output.json');
(async()=>{
 const T=await import(pathToFileURL(path.resolve(__dirname,'../dist/vendor/three/build/three.module.min.js')).href);
 const d=JSON.parse(fs.readFileSync(source,'utf8')),world=new Map();
 function visit(i,parent){const n=d.nodes[i],local=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1]))),w=parent.clone().multiply(local);world.set(i,w);for(const c of n.children||[])visit(c,w);}
 for(const i of d.scenes[d.scene||0].nodes)visit(i,new T.Matrix4());
 function bounds(i,box,materials){const n=d.nodes[i];if(n.mesh!==undefined)for(const p of d.meshes[n.mesh].primitives){const a=d.accessors[p.attributes.POSITION];if(!a.min||!a.max)throw Error('Missing position bounds');box.union(new T.Box3(new T.Vector3(...a.min),new T.Vector3(...a.max)).applyMatrix4(world.get(i)));if(p.material!==undefined)materials.add(p.material);}for(const c of n.children||[])bounds(c,box,materials);}
 const rows=d.nodes[Number(parentIndex)].children.map(i=>{const b=new T.Box3(),m=new Set();bounds(i,b,m);return{index:i,name:d.nodes[i].name,min:b.min.toArray(),max:b.max.toArray(),center:b.getCenter(new T.Vector3()).toArray(),size:b.getSize(new T.Vector3()).toArray(),materials:[...m]};});
 fs.writeFileSync(output,JSON.stringify(rows,null,2));console.log(rows.length+' groups inspected');
})();
