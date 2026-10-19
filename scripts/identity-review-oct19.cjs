'use strict';
// Build-time identity corrections only. No network, browser storage, aliases,
// photographs or silent replacements are introduced by this module.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const FILE=path.resolve(__dirname,'../data/identity-review-oct19.json');
const IDS=['c-ram-crucial-pro-overclocking-64gb-ddr5-6000-cl36','c-ram-teamgroup-t-create-expert-96gb-ddr5-6000-cl34','c-psu-cooler-master-v-gold-i-multi-1050','c-case-supermicro-4u-workstation-chassis','c-psu-supermicro-1600w-redundant-power-supply','c-ssd-seagate-firecuda-540-4tb','c-hdd-seagate-ironwolf-24tb'];
const HOSTS={Crucial:'crucial.com',TEAMGROUP:'teamgroupinc.com','Cooler Master':'coolermaster.com',Supermicro:'supermicro.com',Seagate:'seagate.com'};
const SLOTS=['cpu','board','gpu','ram','ssd','hdd','psu','case','fan','cooler'];
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain=(value,trail='packet')=>{
 if(value===null||['string','number','boolean'].includes(typeof value))return;
 if(Array.isArray(value)){value.forEach((item,index)=>plain(item,trail+'['+index+']'));return;}
 if(!value||Object.getPrototypeOf(value)!==Object.prototype)throw Error('Non-data value in '+trail);
 for(const [key,item]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))throw Error('Unsafe key in '+trail);plain(item,trail+'.'+key);}
};
function validatePacket(packet,{now=Date.now()}={}){
 plain(packet);
 if(packet.schema!==1||packet.version!=='2026-10-19.1'||packet.reviewedAt!=='2026-10-19'||Date.parse(packet.reviewedAt+'T00:00:00Z')>now||!Array.isArray(packet.records)||packet.records.length!==IDS.length)throw Error('Invalid identity-review packet.');
 const ids=new Set();
 for(const [id,source]of Object.entries(packet.sources||{})){
  let url;try{url=new URL(source.url);}catch{throw Error('Invalid identity source '+id);}
  const domain=HOSTS[source.publisher];
  if(!domain||url.protocol!=='https:'||url.username||url.password||url.port||!(url.hostname===domain||url.hostname.endsWith('.'+domain))||source.checkedAt!==packet.reviewedAt||!['inspected','access-unavailable'].includes(source.status)||!source.scope)throw Error('Invalid identity source '+id);
 }
 for(const row of packet.records){
  if(!IDS.includes(row.id)||ids.has(row.id)||row.original?.id!==row.id||row.original.name!==row.originalName||row.original.brand!==row.brand||row.original.cat!==row.category||row.status!=='needs-exact-identity'||row.disposition!=='quarantine-new-selections'||row.replacementId!==null||row.verifiedExactPhoto!==false)throw Error('Invalid review identity '+row.id);
  if(!row.sourceIds?.length||row.sourceIds.some(id=>!packet.sources[id])||['finding','warning','requiredEvidence'].some(key=>typeof row[key]!=='string'||!row[key].trim()||/[<>\u0000-\u001f]/.test(row[key])))throw Error('Missing review evidence '+row.id);
  ids.add(row.id);
 }
 return true;
}
function packet(){const value=JSON.parse(fs.readFileSync(FILE,'utf8'));validatePacket(value);return value;}
const snapshot=record=>Object.fromEntries(['id','name','brand','cat','year','architecture','summary','specs','source','note'].filter(key=>record[key]!==undefined).map(key=>[key,clone(record[key])]));
function applyCatalog(records){
 if(!Array.isArray(records))throw Error('Expected the complete catalog array.');
 const data=packet(),byId=new Map(records.map(record=>[record.id,record]));
 if(byId.size!==records.length)throw Error('Duplicate catalog IDs before identity review.');
 // Complete preflight before mutation. A later documented exact correction must
 // receive explicit review rather than be silently re-quarantined by old data.
 for(const row of data.records){
  const current=byId.get(row.id);if(!current)throw Error('Missing retained identity '+row.id);
  if(current.identityReview?.version===data.version){if(current.identityReview.reviewHash!==hash(row)||current.name!==row.originalName||current.cat!==row.category)throw Error('Changed reviewed identity '+row.id);continue;}
  if(hash(snapshot(current))!==hash(row.original)||current.sku||current.mpn||current.identity?.manufacturerPartNumber)throw Error('Catalog identity changed; review before quarantine: '+row.id);
 }
 const retained=[];
 for(const row of data.records){
  const current=byId.get(row.id);if(current.identityReview?.version===data.version){retained.push(row.id);continue;}
  const original=snapshot(current);
  if(current.fields)original.fields=clone(current.fields);
  if(current.evidence)original.evidence=clone(current.evidence);
  Object.assign(current,{builderEligible:false,indexable:false,usageScope:'identity-review-reference',identityStatus:'needs-exact-identity',identityWarning:row.warning,sourceStatus:'unverified',year:null,architecture:'Exact identity under review',summary:'Exact product identity needs confirmation',specs:{'Identity status':'Exact SKU unverified'},fields:{},evidence:{status:'identity-unverified',sourceIds:[],fields:{}},physical:null,note:'Identity under review: '+row.finding+' '+row.requiredEvidence,identity:{manufacturer:row.brand,commercialModel:row.originalName,manufacturerPartNumber:null,revision:null,status:'unverified'},identityReview:{version:data.version,reviewedAt:data.reviewedAt,reviewHash:hash(row),classification:row.classification,finding:row.finding,requiredEvidence:row.requiredEvidence,sourceIds:[...row.sourceIds],original}});
  retained.push(row.id);
 }
 return {reviewed:retained.length,retainedIds:retained,newSelectionEligible:0,automaticSubstitutions:0,photoBindingsAdded:0,compatibilityState:'unknown',restoration:'Keep these records in saved-build lookup even when new-choice lists exclude them.'};
}
function selectionPolicy(id){
 const row=packet().records.find(record=>record.id===id);
 return row?{id,allowNewSelection:false,retainSavedSelection:true,compatibilityState:'unknown',warning:row.warning,replacementId:null}:{id,allowNewSelection:true,retainSavedSelection:true,compatibilityState:null,warning:null,replacementId:null};
}
function inspectSavedSelection(selection){
 const rows=new Map(packet().records.map(row=>[row.id,row])),warnings=[];
 const parts=selection?.parts&&typeof selection.parts==='object'?selection.parts:selection||{};
 const selected=Array.isArray(parts)?[['unassigned',parts]]:SLOTS.filter(slot=>Object.hasOwn(parts,slot)).map(slot=>[slot,parts[slot]]);
 for(const [slot,raw]of selected){
  const entries=Array.isArray(raw)?raw:raw?[raw]:[];
  entries.forEach((entry,index)=>{const id=typeof entry==='string'?entry:entry?.id,row=rows.get(id);if(row)warnings.push({id,slot,index,label:row.originalName,state:'unknown',code:'identity-needs-review',message:row.warning,retain:true,replacementId:null});});
 }
 return {selection,warnings,changed:false,droppedIds:[],substitutions:[],blocksVerifiedReadiness:warnings.length>0};
}
function restorationReferences(records){
 const ids=new Set(IDS);
 return records.filter(record=>ids.has(record.id)).map(record=>{
  if(record.identityStatus!=='needs-exact-identity'||record.builderEligible!==false)throw Error('Apply identity review before making restoration references.');
  return Object.fromEntries(['id','name','brand','cat','year','architecture','summary','specs','builderEligible','indexable','usageScope','identityStatus','identityWarning','sourceStatus','source','note'].map(key=>[key,clone(record[key]??null)]));
 });
}
module.exports={IDS:[...IDS],validatePacket,packet,applyCatalog,selectionPolicy,inspectSavedSelection,restorationReferences};
