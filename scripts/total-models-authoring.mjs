import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Original measurement geometry only. No product photography, manufacturer
// meshes, guessed fan arrangements, ports or mounting positions are embedded.
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PACKET='data/catalog-intake/2026-10-19/';
export const IDS=[
 'total-gpu-msi-geforce-gtx-950-gaming-2g','total-gpu-msi-geforce-gtx-960-gaming-2g',
 'total-gpu-msi-geforce-gtx-960-gaming-4g','total-gpu-msi-geforce-gtx-970-gaming-4g',
 'total-gpu-msi-geforce-gtx-980-gaming-4g','total-gpu-msi-geforce-gtx-980-ti-gaming-6g',
 'total-gpu-msi-geforce-gtx-1050-gaming-x-2g','total-gpu-msi-geforce-gtx-1050-ti-gaming-x-4g',
 'total-gpu-msi-geforce-gtx-1060-gaming-x-3g','total-gpu-msi-geforce-gtx-1060-gaming-x-6g',
 'total-gpu-msi-geforce-gtx-1070-gaming-x-8g','total-gpu-msi-geforce-gtx-1070-ti-gaming-8g',
 'total-gpu-msi-geforce-gtx-1080-gaming-x-8g','total-gpu-msi-geforce-gtx-1080-ti-gaming-x-11g',
 'total-gpu-msi-geforce-gtx-1660-super-gaming-x','total-gpu-msi-geforce-gtx-1660-ti-gaming-x-6g',
 'total-gpu-gigabyte-gv-n75toc-2gi','total-gpu-asrock-a310-lp-4g',
 'total-gpu-asrock-a380-cli-6go','total-gpu-asrock-a750-cld-8go'
];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const json=file=>JSON.parse(fs.readFileSync(path.join(ROOT,file),'utf8'));

function cubeBuffer(){
 const faces=[[[1,0,0],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]],
  [[-1,0,0],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]],
  [[0,1,0],[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]],
  [[0,-1,0],[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]],
  [[0,0,1],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],
  [[0,0,-1],[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]];
 const positions=[],normals=[],indices=[];
 for(const [normal,...points] of faces){const offset=positions.length/3;for(const p of points){positions.push(...p);normals.push(...normal);}indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);}
 return Buffer.concat([Buffer.from(new Float32Array(positions).buffer),Buffer.from(new Float32Array(normals).buffer),Buffer.from(new Uint16Array(indices).buffer)]);
}

export function geometry(row){
 const [length,thickness,height]=row.dimensionsMm.map(value=>value/1000),size=[length,thickness,height];
 const beam=.00075,corner=.0018,nodes=[];
 const add=(name,scale,translation,mesh)=>nodes.push({name,mesh,scale,translation});
 // All bars and corner markers sit inside the published outer envelope.
 add('Published outer envelope — not a surface-accurate model',size,[0,0,0],0);
 for(let axis=0;axis<3;axis++){
  const other=[0,1,2].filter(index=>index!==axis);
  for(const first of [-1,1])for(const second of [-1,1]){
   const scale=[beam,beam,beam],translation=[0,0,0];scale[axis]=size[axis];
   translation[other[0]]=first*(size[other[0]]-beam)/2;
   translation[other[1]]=second*(size[other[1]]-beam)/2;
   add(['Length','Thickness','Height'][axis]+' guide',scale,translation,axis+1);
  }
 }
 for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])
  add('Envelope corner',Array(3).fill(corner),size.map((value,index)=>[x,y,z][index]*(value-corner)/2),4);
 const color=(name,rgba)=>({name,pbrMetallicRoughness:{baseColorFactor:rgba,metallicFactor:0,roughnessFactor:1},extensions:{KHR_materials_unlit:{}},...(rgba[3]<1?{alphaMode:'BLEND',doubleSided:true}:{})});
 // Unlit axis guides stay readable under the viewer's bright studio lighting.
 const materials=[color('Neutral volume — illustrative',[.15,.31,.46,.11]),color('Length — blue',[.04,.24,.44,1]),color('Thickness — violet',[.36,.15,.55,1]),color('Height — teal',[.02,.31,.23,1]),color('Corners',[.22,.38,.52,1])];
 const bin=cubeBuffer(),doc={
  asset:{version:'2.0',generator:'PC Part Performance original dimension envelope v1',copyright:'Original geometry authored for PC Part Performance; third-party product names identify the source specification only.'},
  scene:0,scenes:[{name:row.name+' — outer dimensions',nodes:nodes.map((_,index)=>index)}],nodes,
  meshes:materials.map((material,index)=>({name:material.name,primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:index}]})),materials,extensionsUsed:['KHR_materials_unlit'],
  buffers:[{byteLength:bin.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:288,target:34962},{buffer:0,byteOffset:288,byteLength:288,target:34962},{buffer:0,byteOffset:576,byteLength:72,target:34963}],
  accessors:[{bufferView:0,componentType:5126,count:24,type:'VEC3',min:[-.5,-.5,-.5],max:[.5,.5,.5]},{bufferView:1,componentType:5126,count:24,type:'VEC3'},{bufferView:2,componentType:5123,count:36,type:'SCALAR',min:[0],max:[23]}],
  extras:{productId:row.id,appearance:'original-dimension-envelope',clearanceVerified:false,dimensionsMm:row.dimensionsMm,axisOrder:['length','thickness','height'],source:row.source,sourceId:row.sourceId,reviewedAt:row.reviewedAt,limitations:row.limitations}
 };
 const raw=Buffer.from(JSON.stringify(doc)),padding=(4-raw.length%4)%4,body=Buffer.concat([raw,Buffer.alloc(padding,0x20)]);
 const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+body.length+8+bin.length,8);header.writeUInt32LE(body.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const chunk=Buffer.alloc(8);chunk.writeUInt32LE(bin.length);chunk.writeUInt32LE(0x004e4942,4);
 return Buffer.concat([header,body,chunk,bin]);
}

export function author({root=ROOT}={}){
 if(root!==ROOT)throw Error('Authoring uses only the checked-in evidence packet.');
 const packet=json(PACKET+'batch-gpu.json'),sources=json(PACKET+'sources.json');
 const limitations='Outer dimensions only. Surface shape, fan layout, mounting, bracket, power connector and cable clearances are not modeled or certified.';
 const records=IDS.map(id=>{
  const part=packet.records.find(item=>item.id===id),source=part&&sources[part.sourceId],evidence=source?.models?.[part?.name],facts=evidence?.facts;
  if(!part||source?.confidence!=='manufacturer-verified'||part.status!=='evidence-checked'||!facts)throw Error('Source evidence missing: '+id);
  const dimensionsMm=['lengthMm','thicknessMm','heightMm'].map(key=>{const fact=facts[key];if(fact?.unit!=='mm'||!Number.isFinite(fact.value)||fact.value<=0||fact.value>2000)throw Error('Invalid dimension: '+id+'/'+key);return fact.value;});
  const row={id,name:part.name,category:'gpu',asset:'total-envelope-'+id+'.glb',status:'approximate',appearance:'original-dimension-envelope',dimensionsMm,axisOrder:['length','thickness','height'],source:source.url,sourceId:part.sourceId,publisher:source.publisher,reviewedAt:source.inspectedAt,evidenceSHA256:hash(Buffer.from(JSON.stringify(evidence))),manufacturerPartNumber:part.identity.manufacturerPartNumber,revision:part.identity.revision,rights:'Original measurement geometry authored for PC Part Performance from published factual dimensions. No manufacturer CAD, textures, photographs or third-party mesh redistributed.',limitations};
  const bytes=geometry(row);return {...row,bytes:bytes.length,sha256:hash(bytes)};
 });
 const directory=path.join(root,'scripts/assets/total-models');fs.mkdirSync(directory,{recursive:true});
 for(const row of records)fs.writeFileSync(path.join(directory,row.asset),geometry(row));
 const manifest={schema:1,reviewedAt:'2026-10-19',kind:'original-dimension-envelopes',units:'millimeters',clearanceVerified:false,externalModelsAdded:0,records};
 fs.writeFileSync(path.join(root,'scripts/total-models-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return {models:records.length,bytes:records.reduce((sum,row)=>sum+row.bytes,0),externalAssets:0};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(author(),null,2));
