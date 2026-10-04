// Offline compression; browser decoder is vendored locally and loaded only with 3D.
const path=require('node:path');
const [runtime,source,dest]=process.argv.slice(2);
if(!dest)throw Error('Usage: node compress-static-glb.cjs runtime source.glb output.glb');
const root=path.resolve(runtime);
const {NodeIO}=require(path.join(root,'node_modules/@gltf-transform/core'));
const {ALL_EXTENSIONS}=require(path.join(root,'node_modules/@gltf-transform/extensions'));
const {meshopt}=require(path.join(root,'node_modules/@gltf-transform/functions'));
const {MeshoptEncoder,MeshoptDecoder}=require(path.join(root,'node_modules/meshoptimizer'));
(async()=>{await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});const doc=await io.read(source);await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high'}));await io.write(dest,doc);})();
