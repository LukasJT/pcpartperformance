// Finish the extracted O11 EVO after simplification and static consolidation.
const path=require('path'),root=path.resolve(process.argv[2]);
const {NodeIO}=require(path.join(root,'node_modules/@gltf-transform/core'));
const {ALL_EXTENSIONS}=require(path.join(root,'node_modules/@gltf-transform/extensions'));
const {quantize,prune}=require(path.join(root,'node_modules/@gltf-transform/functions'));
(async()=>{const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.read(process.argv[3]);
if(doc.getRoot().listAnimations().length||doc.getRoot().listSkins().length)throw Error('Static model required');
for(const material of doc.getRoot().listMaterials())if(material.getMetallicFactor()>.7)material.setMetallicFactor(.35).setRoughnessFactor(.4);
await doc.transform(quantize({quantizePosition:14,quantizeNormal:10,quantizeTexcoord:12}),prune());await io.write(process.argv[4],doc);})();
