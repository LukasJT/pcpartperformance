// Adapt reflective materials to the builder's direct lighting while preserving textures.
const path=require('path');
const {NodeIO}=require(path.resolve(process.argv[2],'node_modules/@gltf-transform/core'));
(async()=>{const io=new NodeIO(),doc=await io.read(process.argv[3]);
for(const m of doc.getRoot().listMaterials())if(m.getMetallicFactor()>.7){m.setMetallicFactor(.35);m.setRoughnessFactor(Math.max(.4,m.getRoughnessFactor()));}
await io.write(process.argv[4],doc);})();
