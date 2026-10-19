'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const manifest=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'total-models-manifest.json'),'utf8'));
const clone=value=>JSON.parse(JSON.stringify(value));

function checkedRecords(){
 const packet=manifest(),seen=new Set();
 if(packet.schema!==1||packet.kind!=='original-dimension-envelopes'||packet.clearanceVerified!==false)throw Error('Invalid original-model manifest.');
 for(const row of packet.records){
  if(seen.has(row.id)||!/^total-gpu-[a-z0-9-]+$/.test(row.id)||row.asset!=='total-envelope-'+row.id+'.glb'||!/^total-envelope-[a-z0-9-]+\.glb$/.test(row.asset))throw Error('Invalid original-model identity.');
  if(row.status!=='approximate'||row.appearance!=='original-dimension-envelope'||row.category!=='gpu'||!Array.isArray(row.dimensionsMm)||row.dimensionsMm.length!==3||row.dimensionsMm.some(value=>!Number.isFinite(value)||value<=0||value>2000)||!/^https:\/\//.test(row.source)||!/^\d{4}-\d{2}-\d{2}$/.test(row.reviewedAt)||!/^[a-f0-9]{64}$/.test(row.sha256))throw Error('Invalid original-model evidence.');
  seen.add(row.id);
 }
 return packet.records;
}

function prepareAssets({root=ROOT}={}){
 const rows=checkedRecords(),files=rows.map(row=>{
  const bytes=fs.readFileSync(path.join(__dirname,'assets/total-models',row.asset));
  if(bytes.length!==row.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==row.sha256)throw Error('Original model changed after validation: '+row.id);
  return {row,bytes};
 });
 // Check the complete set before copying any file into the generated site.
 const destination=path.resolve(root,'dist/assets/models');fs.mkdirSync(destination,{recursive:true});
 for(const {row,bytes} of files)fs.writeFileSync(path.join(destination,row.asset),bytes);
 return {models:files.length,bytes:files.reduce((sum,file)=>sum+file.bytes.length,0),externalAssets:0};
}

function applyLibrary(items){
 if(!Array.isArray(items))throw Error('Expected model-library items.');
 const rows=checkedRecords(),byId=new Map(items.map(item=>[item.id,item]));
 if(byId.size!==items.length)throw Error('Duplicate model-library identities.');
 for(const row of rows){const item=byId.get(row.id);if(!item||item.name!==row.name||item.category!=='gpu')throw Error('Original-model catalog identity mismatch: '+row.id);}
 const applied=[],preserved=[];
 for(const row of rows){
  const item=byId.get(row.id),model='/assets/models/'+row.asset;
  if(item.status==='community'||item.status==='verified'||item.attribution||item.model&&item.model!==model&&item.estimated!==true){preserved.push(row.id);continue;}
  Object.assign(item,{status:'approximate',model,identity:'exact-named-variant',referenceName:row.name,referenceOnly:false,estimated:false,dimensionsMm:[...row.dimensionsMm],dimensionStatus:'Manufacturer outer dimensions; original measurement envelope. Not exact appearance, CAD or a clearance result.',source:row.source,sku:row.manufacturerPartNumber,revision:row.revision,rights:row.rights,researchedAt:row.reviewedAt,missing:row.limitations,appearance:row.appearance,dimensionEvidence:{sourceId:row.sourceId,reviewedAt:row.reviewedAt,confidence:'manufacturer-verified',axes:[...row.axisOrder]},clearanceVerified:false});
  applied.push(row.id);
 }
 return {applied,preserved,downloadedAdded:0,clearanceVerifiedAdded:0};
}
module.exports={prepareAssets,applyLibrary,records:()=>clone(checkedRecords())};
