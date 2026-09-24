// Consolidate static meshes without reducing triangle detail. Runtime packages live outside the site.
const path=require('path');
const [runtime,source,dest]=process.argv.slice(2);
if(!dest)throw Error('Usage: node optimize-static-glb.cjs runtime-directory source.glb output.glb');
const {NodeIO}=require(path.resolve(runtime,'node_modules/@gltf-transform/core'));
const {ALL_EXTENSIONS}=require(path.resolve(runtime,'node_modules/@gltf-transform/extensions'));
const {dedup,flatten,join,prune}=require(path.resolve(runtime,'node_modules/@gltf-transform/functions'));
(async()=>{const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.read(source);if(doc.getRoot().listAnimations().length||doc.getRoot().listSkins().length)throw Error('Static models only');const before=doc.getRoot().listMeshes().length;await doc.transform(dedup(),flatten(),join(),prune());await io.write(dest,doc);console.log(`${before} meshes -> ${doc.getRoot().listMeshes().length} meshes; ${doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().length,0)} draw primitives`);})();
