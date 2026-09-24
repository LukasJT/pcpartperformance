// Offline, error-bounded simplification for large static community meshes.
const path=require('path'),root=path.resolve(process.argv[2]);
const {NodeIO}=require(path.join(root,'node_modules/@gltf-transform/core'));
const {ALL_EXTENSIONS}=require(path.join(root,'node_modules/@gltf-transform/extensions'));
const {simplify,prune,quantize}=require(path.join(root,'node_modules/@gltf-transform/functions'));
const {MeshoptSimplifier}=require(path.join(root,'node_modules/meshoptimizer'));
const ratio=Number(process.argv[5]||.3),error=Number(process.argv[6]||.001);
if(!(ratio>0&&ratio<=1&&error>0&&error<=.01))throw Error('Expected ratio 0..1 and error 0..0.01');
(async()=>{await MeshoptSimplifier.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.read(process.argv[3]);
if(doc.getRoot().listAnimations().length||doc.getRoot().listSkins().length)throw Error('Static meshes only');
await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio,error}),quantize({quantizePosition:14,quantizeNormal:10,quantizeTexcoord:12}),prune());
await io.write(process.argv[4],doc);})();
