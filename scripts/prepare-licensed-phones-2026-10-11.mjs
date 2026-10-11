// Deterministic asset preparation from downloaded, individually licensed source GLBs.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '../../model-tools/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../model-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import {dedup,prune,flatten,join,meshopt,getBounds,textureCompress,metalRough,simplify,weld} from '../../model-tools/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from '../../model-tools/node_modules/meshoptimizer/index.js';
import sharp from '../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifestPath=path.join(root,'scripts/licensed-phone-batch-2026-10-11.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const selected=new Set((process.argv[2]||'').split(',').filter(Boolean));
const reportFile=path.join(root,'docs/program-2026-10-11/models/phone-preparation.json');
const report=fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile)):{};
function quaternion([x,y,z]){const a=Math.cos(x/2),b=Math.cos(y/2),c=Math.cos(z/2),d=Math.sin(x/2),e=Math.sin(y/2),f=Math.sin(z/2);return[d*b*c+a*e*f,a*e*c-d*b*f,a*b*f+d*e*c,a*b*c-d*e*f];}
for(const m of manifest){
 if(selected.size&&!selected.has(m.id))continue;
 const input=path.join(root,m.input),output=path.join(root,'dist/assets/models',m.asset);
 const doc=await io.read(input);
 if(doc.getRoot().listSkins().length)throw Error('Skinned phone artwork requires a separate review: '+m.id);
 if(doc.getRoot().listAnimations().length){if(!m.removeAnimations)throw Error('Animation removal must be explicit: '+m.id);for(const a of doc.getRoot().listAnimations())a.dispose();}
 const extras=doc.getRoot().getAsset().extras;
 const legacySpecGloss=doc.getRoot().listExtensionsUsed().some(e=>e.extensionName==='KHR_materials_pbrSpecularGlossiness');
 if(!extras?.license?.includes('CC-BY-4.0')||!extras.source?.includes(m.uid))throw Error('Embedded source/license mismatch: '+m.id);
 for(const name of m.removeNodes||[]){const n=doc.getRoot().listNodes().find(n=>n.getName()===name);if(!n)throw Error('Specified presentation extra missing: '+m.id+' '+name);n.dispose();}
 const scene=doc.getRoot().listScenes()[0],roots=scene.listChildren();
 const oriented=doc.createNode('PC Part Performance: upright, centered appearance preview').setRotation(quaternion(m.rotation));
 for(const node of roots){scene.removeChild(node);oriented.addChild(node);}scene.addChild(oriented);
 let bounds=getBounds(scene),height=bounds.max[1]-bounds.min[1];if(!(height>0))throw Error('Empty geometry: '+m.id);
 const factor=m.dimensionsMm[1]/height;oriented.setScale([factor,factor,factor]);
 bounds=getBounds(scene);oriented.setTranslation(bounds.max.map((x,i)=>-(x+bounds.min[i])/2));
 const before=getBounds(scene);
 if(legacySpecGloss)await doc.transform(metalRough());
 for(const name of m.offScreenMaterials||[]){
  const material=doc.getRoot().listMaterials().find(x=>x.getName()===name);
  if(!material)throw Error('Specified display material missing: '+m.id+' '+name);
  material.setBaseColorTexture(null).setEmissiveTexture(null).setBaseColorFactor([0.005,0.005,0.005,1]).setEmissiveFactor([0,0,0]).setMetallicFactor(0).setRoughnessFactor(0.22);
 }
 const textureMaxSize=m.textureMaxSize??1024,textureQuality=m.textureQuality??90;
 if(!Number.isInteger(textureMaxSize)||textureMaxSize<1||!Number.isInteger(textureQuality)||textureQuality<1||textureQuality>100)throw Error('Invalid texture settings: '+m.id);
 await doc.transform(textureCompress({encoder:sharp,targetFormat:'webp',resize:[textureMaxSize,textureMaxSize],quality:textureQuality}),prune(),flatten(),join(),dedup(),prune());
 if(m.simplifyRatio)await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:m.simplifyRatio,error:0.001,lockBorder:true}),prune());
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high'}));
 await io.write(output,doc);
 bounds=getBounds(scene);
 const modifications=(m.offScreenMaterials?.length?'Changed only the named display materials '+m.offScreenMaterials.join(', ')+' from a blank luminous panel to a non-emissive black screen-off appearance. ':'')+(m.removeAnimations?'Removed source presentation rotation animations; static rest-pose geometry retained. ':'')+(m.removeNodes?.length?'Removed the named presentation extras '+m.removeNodes.join(', ')+'. ':'')+(legacySpecGloss?'Converted legacy specular/glossiness materials to the supported metal/roughness workflow. ':'')+'Baked upright front-facing orientation, centered the asset pivot, and uniformly scaled its overall height to the published body height in millimeters; authored width/depth ratios and camera protrusions retained. Resized embedded textures to at most '+textureMaxSize+' pixels, encoded WebP at quality '+textureQuality+', flattened static transforms, joined compatible primitives, deduplicated resources, '+(m.simplifyRatio?'simplified geometry within a relative error limit of 0.001, ':'')+'and used meshopt compression. Remaining creator appearance retained.';
 report[m.id]={input:m.input,asset:m.asset,uid:m.uid,sourceExtras:extras,inputBytes:fs.statSync(input).size,outputBytes:fs.statSync(output).size,textureMaxSize,textureQuality,dimensionsMm:m.dimensionsMm,dimensionSource:m.dimensionSource,sourceRotation:m.rotation,sourceToMmScale:factor,boundsBeforeCompression:before,boundsAfterCompression:bounds,extentMm:bounds.max.map((x,i)=>x-bounds.min[i]),triangles:doc.getRoot().listMeshes().reduce((s,mesh)=>s+mesh.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()||p.getAttribute('POSITION')?.getCount()||0)/3,0),0),modifications};
 fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');console.log(m.id,report[m.id].outputBytes,'bytes',Math.round(report[m.id].triangles),'triangles');
}
