import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '../../model-tools/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../model-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import {getBounds} from '../../model-tools/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptDecoder} from '../../model-tools/node_modules/meshoptimizer/index.js';
const require=createRequire(import.meta.url),validator=require('../../work/gltf-validator');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const inventory=require('../docs/program-2026-10-11/models/integrated-model-batch.json');
const phoneModels=require('./phone-models.json'),phoneData=require('./phone-data.cjs');
const renderManifest=require('./phone-model-render-overrides-2026-10-11.json');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const assert=(test,message)=>{if(!test)throw Error(message);};
assert(new Set(phoneData.map(p=>p.id)).size===phoneData.length,'Phone canonical ID collision');
assert(Object.keys(phoneModels).every(id=>phoneData.some(p=>p.id===id)),'Registered phone has no route/data record');
assert(new Set(inventory.additions.map(m=>m.asset)).size===inventory.uniqueNewAssets,'New asset count is not distinct');
const report={checkedAt:new Date().toISOString(),validatorVersion:validator.version(),method:'Khronos glTF structural validation plus glTF-Transform Meshopt decode, finite accessor scan, post-transform bounds and source registry/data/render joins. The Khronos validator cannot inspect EXT_meshopt_compression internals; decoded geometry is checked separately.',phoneDataRecords:phoneData.length,phoneModelMappings:Object.keys(phoneModels).length,phoneModelOrphans:[],assets:[]};
for(const model of inventory.additions){
 const assetPath=path.join(root,'dist/assets/models',model.asset),bytes=fs.readFileSync(assetPath);
 assert(crypto.createHash('sha256').update(bytes).digest('hex')===model.sha256,'Asset hash drift: '+model.id);
 const result=await validator.validateBytes(new Uint8Array(bytes),{uri:model.asset,maxIssues:1000});
 const doc=await io.read(assetPath),scene=doc.getRoot().listScenes()[0],bounds=getBounds(scene);
 let values=0;
 for(const accessor of doc.getRoot().listAccessors()){
  const array=accessor.getArray();if(!array)continue;
  for(const value of array){assert(Number.isFinite(value),'Non-finite accessor: '+model.id+' '+accessor.getName());values++;}
 }
 assert(bounds.min.every((v,i)=>Number.isFinite(v)&&Number.isFinite(bounds.max[i])&&bounds.max[i]>v),'Invalid bounds: '+model.id);
 if(model.type==='phone'){
  const data=phoneData.find(p=>p.id===model.id);
  for(const [field,value]of Object.entries(data.fields))assert(value.value===null?(value.source===null&&value.checked===null):(typeof value.source==='string'&&value.source.startsWith('https://')&&value.checked==='2026-10-11'),'Invalid field provenance: '+model.id+' '+field);
  assert(data.support.commitment===null&&data.support.endDate===null,'Unverified software commitment');
  // Allow 0.05 mm for simplification and quantization, without implying a physical-fit tolerance.
  assert(Math.abs(bounds.max[1]-bounds.min[1]-data.fields.height.value)<0.05,'Incorrect normalized height: '+model.id);
  assert(bounds.max.every((v,i)=>Math.abs((v+bounds.min[i])/2)<0.025),'Uncentered pivot: '+model.id);
  const extra=doc.getRoot().getAsset().extras;
  assert(extra?.license?.includes('CC-BY-4.0')&&extra.source?.includes(model.sourceUid),'Embedded phone source/license mismatch: '+model.id);
  assert(renderManifest[model.id]?.kind==='model-render'&&renderManifest[model.id]?.picturedModel.includes('3D model render'),'Mislabelled source model thumbnail: '+model.id);
  assert(fs.existsSync(path.join(root,'dist',renderManifest[model.id].src)),'Missing source model thumbnail: '+model.id);
 }
 const codes={};for(const issue of result.issues.messages||[])codes[issue.code]=(codes[issue.code]||0)+1;
 report.assets.push({id:model.id,asset:model.asset,bytes:bytes.length,numErrors:result.issues.numErrors,numWarnings:result.issues.numWarnings,numInfos:result.issues.numInfos,issueCodes:codes,decodedFiniteValues:values,bounds});
 console.log(model.id,'errors',result.issues.numErrors,'warnings',result.issues.numWarnings,'decoded values',values);
}
report.completedMappings=inventory.completedMappings;report.uniqueNewAssets=inventory.uniqueNewAssets;
report.errors=report.assets.reduce((n,m)=>n+m.numErrors,0);report.warnings=report.assets.reduce((n,m)=>n+m.numWarnings,0);
fs.writeFileSync(path.join(root,'docs/program-2026-10-11/models/validation.json'),JSON.stringify(report,null,2)+'\n');
assert(report.errors===0,'Khronos validation errors require review');
