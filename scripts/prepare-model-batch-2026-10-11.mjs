import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '../../model-tools/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../model-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import {dedup, prune, flatten, join, meshopt, getBounds, textureCompress} from '../../model-tools/node_modules/@gltf-transform/functions/dist/index.js';
import sharp from '../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.mjs';
import {MeshoptDecoder, MeshoptEncoder} from '../../model-tools/node_modules/meshoptimizer/index.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const work=path.join(root,'tmp/model-batch-2026-10-11');
fs.mkdirSync(work,{recursive:true});
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
await MeshoptEncoder.ready;
const [mode,input,output,removeNode]=process.argv.slice(2);
if(!mode||!input)throw Error('Usage: inspect INPUT | prepare INPUT OUTPUT [REMOVE_NODE_NAME]');
const doc=await io.read(path.resolve(input));
if(mode==='inspect-summary'){
  const bounds=getBounds(doc.getRoot().listScenes()[0]);
  const meshes=doc.getRoot().listNodes().filter(n=>n.getMesh());
  console.log(JSON.stringify({source:input,extras:doc.getRoot().getAsset().extras,bounds,extent:bounds.max.map((x,i)=>x-bounds.min[i]),meshNodes:meshes.length,triangles:doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()||p.getAttribute('POSITION')?.getCount()||0)/3,0),0),nodes:meshes.slice(0,15).map(n=>({name:n.getName(),bounds:getBounds(n)}))}));
}else if(mode==='inspect'){
  const summary={source:input,extras:doc.getRoot().getAsset().extras,
    scenes:doc.getRoot().listScenes().map(s=>({name:s.getName(),bounds:getBounds(s)})),
    nodes:doc.getRoot().listNodes().filter(n=>!n.getName().startsWith('Object')).map(n=>({name:n.getName(),bounds:getBounds(n),rotation:n.getRotation(),scale:n.getScale(),translation:n.getTranslation(),mesh:!!n.getMesh()})),
    materials:doc.getRoot().listMaterials().map(m=>({name:m.getName(),alphaMode:m.getAlphaMode(),alpha:m.getBaseColorFactor()[3],metallic:m.getMetallicFactor(),roughness:m.getRoughnessFactor()}))};
  console.log(JSON.stringify(summary,null,2));
}else if(['prepare','prepare-web','prepare-web-gpu','prepare-neutral'].includes(mode)){
  if(!output)throw Error('Output path required');
  if(mode==='prepare-neutral'){
    for(const name of (removeNode||'').split('|').filter(Boolean)){
      const n=doc.getRoot().listNodes().find(n=>n.getName()===name);if(!n)throw Error('Neutralization node missing: '+name);
      n.setRotation([0,0,0,1]).setTranslation([0,0,0]);
    }
  }else if(removeNode){const n=doc.getRoot().listNodes().find(n=>n.getName()===removeNode);if(!n)throw Error('Selection node missing: '+removeNode);n.dispose();}
  const before=getBounds(doc.getRoot().listScenes()[0]);
  if(mode==='prepare-web-gpu'){
    // This source's small side-mark UV island is vertically inverted with fans installed downward.
    // The exact five island vertices were inspected against the creator's texture atlas.
    let fixed=0;
    for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
      const uv=primitive.getAttribute('TEXCOORD_0');if(!uv)continue;
      for(let i=0;i<uv.getCount();i++){
        const value=uv.getElement(i,[]);
        if(value[0]>=0.4501&&value[0]<=0.5978&&value[1]>=0.2713&&value[1]<=0.3120){value[1]=0.583381175994873-value[1];uv.setElement(i,value);fixed++;}
      }
    }
    if(fixed!==5)throw Error('GPU UV repair is specific to the reviewed five-vertex source island');
  }
  if(mode.startsWith('prepare-web'))await doc.transform(textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:90}));
  await doc.transform(prune(),flatten(),join(),dedup(),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
  await io.write(path.resolve(output),doc);
  console.log(JSON.stringify({input,output,bytes:fs.statSync(output).size,boundsBefore:before,boundsAfter:getBounds(doc.getRoot().listScenes()[0]),modifications:(mode==='prepare-neutral'?'Neutralized the explicitly listed presentation ancestors; authored scale retained. ':removeNode?'Removed only the explicitly selected presentation duplicate. ':'')+(mode==='prepare-web'?'Resized embedded textures to at most 1024 pixels and encoded WebP at quality 90. ':'')+'Flattened static transforms, joined compatible primitives, deduplicated resources and used meshopt compression. Creator materials retained.'}));
}else throw Error('Unknown mode');
