'use strict';
// Narrow additive evidence hydration. No network, replacement IDs, inferred
// cable compatibility or source-free numeric promotion is permitted here.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),rules=require('./compatibility-evidence.cjs');
const FILE=path.resolve(__dirname,'../data/compatibility-intake-oct19.json'),VERSION='2026-10-19.1';
const TYPES={forms:'array',boardWidthMax:'number',gpuLengthMax:'number',coolerHeightMax:'number',psuFormats:'array',psuLengthMax:'number',psuOutput:'number',psuFormat:'string',psuLength:'number'};
const DISPLAY_UNKNOWN='Needs verification — conflicting manufacturer sources';
const DISPLAY_ALIASES={gpuLengthMax:['Maximum GPU length'],coolerHeightMax:['Maximum CPU cooler height'],psuLength:['PSU length']};
const DOMAINS={CORSAIR:'corsair.com',NZXT:'nzxt.com','Lian Li':'lian-li.com'},clone=value=>JSON.parse(JSON.stringify(value)),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function plain(value){if(value===null||['string','number','boolean'].includes(typeof value))return;if(Array.isArray(value)){value.forEach(plain);return;}if(!value||Object.getPrototypeOf(value)!==Object.prototype)throw Error('Non-data intake value');for(const[key,item]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))throw Error('Unsafe intake key');plain(item);}}
function validate(data){
 plain(data);if(data.schema!==1||data.version!==VERSION||data.reviewedAt!=='2026-10-19'||!Array.isArray(data.records)||data.records.length!==10||!data.sources)throw Error('Invalid compatibility intake');
 if(Date.parse(data.reviewedAt+'T00:00:00Z')>Date.now())throw Error('Future source inspection');const ids=new Set();
 for(const source of Object.values(data.sources)){const url=new URL(source.url),domain=DOMAINS[source.publisher];if(!domain||url.protocol!=='https:'||url.username||url.password||url.port||!(url.hostname===domain||url.hostname.endsWith('.'+domain))||source.checked!==data.reviewedAt||source.confidence!=='manufacturer-verified'||!source.scope||!source.locator)throw Error('Invalid manufacturer evidence');}
 for(const row of data.records){
  if(!row.id||ids.has(row.id)||!row.identity?.name||!row.identity.brand||!['case','psu'].includes(row.identity.cat)||!Object.hasOwn(row.identity,'sku')||!row.notes||/[<>\u0000-\u001f]/.test(row.notes))throw Error('Invalid exact identity');ids.add(row.id);
  for(const[key,fact]of Object.entries(row.fields||{})){
   if(!Object.hasOwn(TYPES,key)||!data.sources[fact.sourceId]||!fact.condition||/[<>\u0000-\u001f]/.test(fact.condition))throw Error('Unsupported compatibility observation');
   if((key.startsWith('psu')&&['psuOutput','psuFormat','psuLength'].includes(key))!==(row.identity.cat==='psu'))throw Error('Fact applies to another category');
   const unit=TYPES[key]==='number'?(key==='psuOutput'?'W':'mm'):'';if(fact.unit!==unit)throw Error('Wrong observation unit');
   if(fact.value===null){if(!Array.isArray(fact.conflicts)||fact.conflicts.length<2||fact.conflicts.some(conflict=>!data.sources[conflict.sourceId]||!conflict.locator||!Number.isFinite(conflict.value)))throw Error('Unknown fact needs a documented conflict');if(fact.supersedes&&(!['value','source','checked','model'].every(key=>Object.hasOwn(fact.supersedes,key))||!fact.conflicts.some(conflict=>conflict.value===fact.supersedes.value&&data.sources[conflict.sourceId].url===fact.supersedes.source)||!fact.supersedes.checked||!fact.supersedes.model))throw Error('Prior evidence demotion is not bound to an inspected contradiction');continue;}
   if(fact.supersedes)throw Error('Prior verified evidence may only be demoted to unknown, never replaced with a convenient number');
   if(TYPES[key]==='number'&&(!Number.isFinite(fact.value)||fact.value<=0||fact.value>10000))throw Error('Invalid numeric fact');
   if(TYPES[key]==='array'&&(!Array.isArray(fact.value)||!fact.value.length||new Set(fact.value).size!==fact.value.length||fact.value.some(item=>typeof item!=='string'||!['ATX','E-ATX','MICRO-ATX','MINI-ITX','SFX','SFX-L'].includes(item))))throw Error('Invalid documented format list');
   if(TYPES[key]==='string'&&!['ATX','SFX','SFX-L'].includes(fact.value))throw Error('Invalid native PSU format');
   if(key==='boardWidthMax'&&fact.comparison!=='lte')throw Error('Width maximum comparison is missing');
  }
 }
 return true;
}
function packet(){const data=JSON.parse(fs.readFileSync(FILE,'utf8'));validate(data);return data;}
function preflight(records,data=packet()){
 validate(data);const index=new Map(records.map(p=>[p.id,p]));if(index.size!==records.length)throw Error('Duplicate existing IDs');const actions=[];
 for(const row of data.records){const part=index.get(row.id);if(!part||part.name!==row.identity.name||part.brand!==row.identity.brand||part.cat!==row.identity.cat||(part.sku??null)!==row.identity.sku||part.identityStatus==='needs-exact-identity')throw Error('Exact existing identity changed: '+row.id);
  if(part.compatibilityIntake&&part.compatibilityIntake.hash!==hash(row))throw Error('Changed compatibility intake requires review');
  for(const[key,fact]of Object.entries(row.fields)){
   const current=rules.field(part,key),strong=rules.verified(current);
   const reviewedDemotion=strong&&fact.value===null&&fact.supersedes&&Object.entries(fact.supersedes).every(([property,value])=>equal(current[property],value));
   if(strong&&!equal(current.value,fact.value)&&!reviewedDemotion)throw Error('Contradictory stronger evidence: '+row.id+' '+key);
   const displayDemotions=fact.value===null?(DISPLAY_ALIASES[key]||[]).filter(alias=>typeof part.specs?.[alias]==='number').map(alias=>({key:alias,previousValue:part.specs[alias],replacement:DISPLAY_UNKNOWN,reason:'The exact manufacturer source contains conflicting values; a single indexed figure must not appear as a settled specification.',sources:clone(fact.conflicts)})):[];
   actions.push({id:row.id,key,action:strong&&!reviewedDemotion?'preserve-existing':fact.value===null?'hold-conflicting-observation':'add-manufacturer-evidence',previous:clone(current),observation:clone(fact),displayDemotions});
  }
 }
 return actions;
}
function applyCatalog(records,{data=packet()}={}){
 const actions=preflight(records,data),index=new Map(records.map(p=>[p.id,p]));
 for(const action of actions){if(action.action==='preserve-existing')continue;const part=index.get(action.id),row=data.records.find(row=>row.id===part.id),fact=action.observation,source=data.sources[fact.sourceId],observation={value:clone(fact.value),source:source.url,publisher:source.publisher,checked:source.checked,model:row.identity.name,status:fact.value===null?'unknown':'manufacturer-specified',exact:fact.value!==null,condition:fact.condition,...(fact.unit?{unit:fact.unit}:{}),...(fact.comparison?{comparison:fact.comparison}:{}),...(fact.conflicts?{conflicts:clone(fact.conflicts)}:{})};
  // The engine reads evidence.fields before fields. Update the existing slot
  // when present so an old unverified wrapper cannot shadow the reviewed fact.
  if(part.evidence?.fields?.[action.key])part.evidence.fields[action.key]=observation;else(part.fields||={})[action.key]=observation;
  for(const demotion of action.displayDemotions)part.specs[demotion.key]=demotion.replacement;
 }
 for(const row of data.records){const part=index.get(row.id),prior=part.compatibilityIntake;if(prior&&prior.hash!==hash(row))throw Error('Changed compatibility intake requires review');part.compatibilityIntake={version:VERSION,hash:hash(row),checked:data.reviewedAt,notes:row.notes,displayDemotions:prior?.displayDemotions||actions.filter(action=>action.id===row.id).flatMap(action=>action.displayDemotions)};if(!part.note?.includes(row.notes))part.note=[part.note,row.notes].filter(Boolean).join(' ');}
 return records;
}
function prepare({records,docsRoot=path.resolve(__dirname,'../docs/total-refinement/catalog/compatibility-oct19')}={}){
 const data=packet(),actions=preflight(records,data);applyCatalog(records,{data});const report={version:VERSION,checkedAt:new Date().toISOString(),records:data.records.length,knownObservations:actions.filter(a=>a.observation.value!==null).length,heldConflictingObservations:actions.filter(a=>a.observation.value===null).length,preservedStrongerObservations:actions.filter(a=>a.action==='preserve-existing').length,displayDemotions:actions.flatMap(action=>action.displayDemotions.map(demotion=>({id:action.id,...demotion}))),actions,sources:data.sources,scope:data.scope,noInstalledFitGuarantee:true};fs.mkdirSync(docsRoot,{recursive:true});fs.writeFileSync(path.join(docsRoot,'report.json'),JSON.stringify(report,null,2)+'\n');return report;
}
module.exports={VERSION,DISPLAY_UNKNOWN,validate,packet,preflight,applyCatalog,prepare};
