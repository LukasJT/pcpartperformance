'use strict';

// Fixed-SKU intake adapter for the existing prebuilt renderer. No network code,
// arbitrary JavaScript intake, retailer scraping, price feed or asset downloader.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const DIRECTORY = path.resolve(__dirname,'../data/prebuilt-intake/2026-10-19');
const VERSION = 1;
const FACTS = new Set(['cpu','gpu','vramGB','ramGB','ddr','ramModules','ramModuleGB','ramMTs','ramClass','storageGB','storageInterface','storageGeneration','storageLayout','chipset','board','psuW','psuEfficiency','cooling','network','os','warrantyYears','warrantyUpgrade','case','ean','identityNote','withdrawn']);
const TEXT = new Set(['cpu','gpu','ddr','ramClass','storageInterface','storageLayout','chipset','board','psuEfficiency','cooling','network','os','warrantyUpgrade','case','ean','identityNote']);
const normalize = value => String(value||'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
const clone = value => JSON.parse(JSON.stringify(value));
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function readPackets(directory = DIRECTORY) {
  return {records:JSON.parse(fs.readFileSync(path.join(directory,'batch.json'),'utf8')),sources:JSON.parse(fs.readFileSync(path.join(directory,'sources.json'),'utf8')),candidates:JSON.parse(fs.readFileSync(path.join(directory,'candidates.json'),'utf8'))};
}
function identity(row) { return normalize(row.brand)+'|'+normalize(row.manufacturerPartNumber||row.identity?.manufacturerPartNumber||row.model)+'|'+normalize(row.region); }
function validate(row,sources) {
  if(!row||typeof row!=='object'||Array.isArray(row))return ['Invalid intake row'];
  const errors=[], source=sources[row.sourceId];
  const fail = message => errors.push(row.id+': '+message);
  if (!/^total-(ca|us)-[a-z0-9-]+$/.test(row.id||'')) fail('invalid stable ID');
  for(const key of Object.keys(row)) if(!['id','brand','model','manufacturerPartNumber','region','currency','sourceId','status','configurationKind'].includes(key)) fail('unsupported intake field '+key);
  if(!['MSI','CORSAIR','Lenovo'].includes(row.brand)) fail('unsupported manufacturer; source-host policy must be explicitly extended');
  if(typeof row.model!=='string'||!row.model.trim()||row.model.length>140||/[<>\x00-\x1f]/.test(row.model)) fail('invalid model');
  if(typeof row.manufacturerPartNumber!=='string'||!/^[A-Za-z0-9-]{5,80}$/.test(row.manufacturerPartNumber)) fail('exact manufacturer part number required');
  if(!['CA','US'].includes(row.region)||row.currency!==({CA:'CAD',US:'USD'})[row.region]) fail('region/currency mismatch');
  if(row.configurationKind!=='fixed-manufacturer-sku'||row.status!=='evidence-checked') fail('fixed, evidence-checked SKU required; configurable family is not a completed record');
  if(!source) {fail('missing primary source');return errors;}
  for(const key of Object.keys(source))if(!['publisher','url','tableUrl','detailCorroborated','inspectedAt','confidence','inspection','scope','identity','facts'].includes(key))fail('unsupported source metadata '+key);
  let url;try {url=new URL(source.url);}catch {fail('invalid source URL');}
  if(url&&(url.protocol!=='https:'||url.username||url.password||url.hash||!({MSI:['storage-asset.msi.com'],CORSAIR:['www.corsair.com'],Lenovo:['psref.lenovo.com']})[row.brand]?.includes(url.hostname))) fail('source is not an allowed exact manufacturer host');
  if(source.publisher!==row.brand||source.confidence!=='manufacturer-verified') fail('source publisher/confidence mismatch');
  const timestamp=Date.parse(source.inspectedAt);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(source.inspectedAt||'')||!Number.isFinite(timestamp)||(Number.isFinite(timestamp)&&new Date(timestamp).toISOString().slice(0,10)!==source.inspectedAt)||source.inspectedAt>new Date().toISOString().slice(0,10)) fail('invalid or future inspection date');
  if(!source.scope||!source.inspection) fail('source scope and inspection accountability required');
  if(source.identity?.model!==row.model||source.identity?.manufacturerPartNumber!==row.manufacturerPartNumber) fail('source belongs to another model/part number');
  if(row.brand==='MSI'&&url&&decodeURIComponent(url.pathname.split('/').pop())!==row.model+'.pdf') fail('MSI PDF filename does not bind the exact model');
  if(row.brand==='CORSAIR'&&url&&!url.pathname.toLowerCase().includes('/'+row.manufacturerPartNumber.toLowerCase()+'/')) fail('CORSAIR URL does not bind the selected SKU');
  if(row.brand==='Lenovo'&&url&&(url.searchParams.get('M')!==row.manufacturerPartNumber||!/^\/(?:l\/)?Detail\//.test(url.pathname)))fail('Lenovo source must bind the exact model query');
  if(source.tableUrl){let table;try{table=new URL(source.tableUrl);}catch{}if(!table||table.protocol!=='https:'||table.hostname!=='psref.lenovo.com'||!/^\/(?:product|WDProduct)\//.test(table.pathname))fail('invalid manufacturer model-table provenance');}
  const facts=source.facts;
  if(!facts||typeof facts!=='object'||Array.isArray(facts)) {fail('source facts required');return errors;}
  for(const [key,value] of Object.entries(facts)) {
    if(!FACTS.has(key)) {fail('unsupported source fact '+key);continue;}
    if(value===null) continue;
    if(key==='withdrawn'){if(typeof value!=='boolean')fail('invalid withdrawn status');continue;}
    if(TEXT.has(key)){if(typeof value!=='string'||!value.trim()||value.length>350||/[<>\x00-\x1f]/.test(value)) fail('invalid text fact '+key);}
    else if(typeof value!=='number'||!Number.isFinite(value)||value<=0||value>100000) fail('invalid numeric/unit fact '+key);
  }
  for(const field of ['cpu','gpu','ramGB','ddr','storageGB','os']) if(!facts[field]) fail('missing core specification '+field);
  if(facts.ddr&&!/^DDR[345]$/.test(facts.ddr)) fail('unsupported memory generation');
  if(facts.ramClass&&!['UDIMM','CUDIMM','SO-DIMM','RDIMM'].includes(facts.ramClass))fail('unsupported memory module class');
  if(facts.gpu==='No discrete graphics supplied'&&facts.vramGB)fail('omitted discrete GPU cannot have an asserted VRAM capacity');
  if(facts.ramModules&&(!Number.isInteger(facts.ramModules)||facts.ramModules*facts.ramModuleGB!==facts.ramGB)) fail('memory module count/capacity mismatch');
  if(facts.ramModuleGB&&!facts.ramModules) fail('module capacity without documented module count');
  if(facts.storageGeneration&&!facts.storageInterface) fail('PCIe generation cannot infer undisclosed storage protocol');
  if(facts.storageInterface&&!['NVMe','SATA'].includes(facts.storageInterface)) fail('unknown storage interface');
  if(facts.warrantyYears!==null&&facts.warrantyYears!==undefined&&(!Number.isInteger(facts.warrantyYears)||facts.warrantyYears>10)) fail('invalid warranty duration');
  if(facts.ean&&(!/^\d{13}$/.test(facts.ean)||!validEAN(facts.ean))) fail('invalid EAN check digit');
  if(facts.storageLayout){const match=facts.storageLayout.match(/^(\d+) × (\d+) TB NVMe SSD$/),mixed=facts.storageLayout.match(/^(\d+) GB NVMe SSD \+ (\d+) GB HDD$/);if(match?Number(match[1])*Number(match[2])*1000!==facts.storageGB:mixed?Number(mixed[1])+Number(mixed[2])!==facts.storageGB:true) fail('storage layout/capacity mismatch');if(mixed&&facts.storageInterface)fail('mixed SSD/HDD storage must not be labelled entirely NVMe');}
  if(facts.vramGB&&/\b(8|16)G\b/i.test(row.model)&&Number(row.model.match(/\b(8|16)G\b/i)[1])!==facts.vramGB) fail('GPU memory variant mismatch');
  return errors;
}
function validEAN(code){const digits=[...code].map(Number);return (10-digits.slice(0,12).reduce((n,d,i)=>n+d*(i%2?3:1),0)%10)%10===digits[12];}
function toSystem(row,source) {
  const f=source.facts,capacity=gb=>gb>=1000?gb/1000+' TB':gb+' GB';
  const storage=f.storageLayout||capacity(f.storageGB)+' '+(f.storageInterface||'M.2; protocol not disclosed')+(f.storageGeneration?' PCIe '+f.storageGeneration+'.0':'')+' SSD';
  const basis={row,source};
  return {
    id:row.id,name:row.brand+' '+row.model,brand:row.brand,region:row.region,currency:row.currency,
    merchant:row.brand,seller:null,retailerUrl:null,sourceKind:'manufacturer-specification',model:row.model,sku:row.manufacturerPartNumber,skuKind:'manufacturer-part-number',
    url:source.url,checkedAt:source.inspectedAt,status:f.withdrawn?'Withdrawn manufacturer configuration; historical reference':'Manufacturer fixed configuration inspected; current availability unverified',condition:f.withdrawn?'Withdrawn configuration; check actual unit condition and support':'Published new-system configuration; confirm unit condition',price:null,stock:null,
    cpu:f.cpu,gpu:f.gpu,vram:f.vramGB?f.vramGB+' GB':null,ram:f.ramGB+' GB '+f.ddr+(f.ramMTs?'-'+f.ramMTs:'')+(f.ramClass?' '+f.ramClass:''),
    ramLayout:f.ramModules?f.ramModules+' × '+f.ramModuleGB+' GB':null,storage,
    board:f.board||null,chipset:f.chipset||null,
    psu:f.psuW?f.psuW+' W '+(f.psuEfficiency||'')+'; exact PSU model not disclosed':null,
    cooling:f.cooling||null,case:f.case||null,dimensions:null,network:f.network||null,os:f.os,
    warranty:f.warrantyYears?'Manufacturer specification states '+f.warrantyYears+' year'+(f.warrantyYears>1?'s':'')+' base'+(f.warrantyUpgrade?'; listed upgrade: '+f.warrantyUpgrade:'')+'; confirm coverage and terms':null,returns:null,
    source:{publisher:source.publisher,url:source.url,inspectedAt:source.inspectedAt,scope:source.scope,...(source.tableUrl?{tableUrl:source.tableUrl}:{})},
    identity:{manufacturer:row.brand,commercialModel:row.model,manufacturerPartNumber:row.manufacturerPartNumber,revision:null,ean:f.ean||null},
    imageSource:null,imageRights:null,imageWidth:600,imageHeight:450,
    illustrationSource:'/assets/illustrations/total-prebuilt-tower.svg',illustrationAlt:'Illustration of a desktop PC; not a photograph or model-specific depiction',imageKind:'category-illustration',
    sourceConflicts:[],question:f.identityNote||'Confirm the exact SKU at checkout. Component brands, board model, power-supply model and shipped accessories may not be disclosed.',
    normalized:{cpu:f.cpu,gpu:f.gpu,vramGB:f.vramGB||null,ramGB:f.ramGB,ddr:f.ddr,storageGB:f.storageGB,storageInterface:f.storageInterface||null,storageGeneration:f.storageGeneration||null,chipset:f.chipset||null},
    provenance:{pipeline:'total-prebuilts-v'+VERSION,sourceId:row.sourceId,observationHash:digest(basis),recordHash:null}
  };
}
function recordHash(record){const copy=clone(record);delete copy.provenance.recordHash;return digest(copy);}
function stage(existing,packets=readPackets()) {
  const errors=[], additions=[], unchanged=[];
  const ids=new Set(),identities=new Set();
  for(const row of packets.records){
    const rowErrors=validate(row,packets.sources);errors.push(...rowErrors);if(rowErrors.length)continue;
    if(ids.has(row.id))errors.push(row.id+': duplicate batch ID');ids.add(row.id);
    const key=identity(row);if(identities.has(key))errors.push(row.id+': duplicate exact manufacturer SKU and region');identities.add(key);
    const source=packets.sources[row.sourceId];if(!source)continue;
    const current=existing.find(item=>item.id===row.id),sameIdentity=existing.find(item=>item.id!==row.id&&identity(item)===key);
    if(sameIdentity)errors.push(row.id+': exact manufacturer SKU already exists as '+sameIdentity.id);
    const system=toSystem(row,source);system.provenance.recordHash=recordHash(system);
    if(current){if(current.provenance?.observationHash===system.provenance.observationHash&&current.provenance?.recordHash===recordHash(current))unchanged.push(row.id);else errors.push(row.id+': source or current record changed; explicit review required');}
    else additions.push(system);
  }
  return {ok:errors.length===0,errors,additions:errors.length?[]:additions,validCandidateCount:additions.length,unchanged,excluded:packets.candidates||[]};
}
function systems(existing=require('./oct14-prebuilt-data.cjs'),packets=readPackets()) {
  const result=stage(existing,packets);if(!result.ok)throw new Error('Prebuilt intake rejected:\n'+result.errors.join('\n'));
  return [...existing,...result.additions];
}
function coreSignature(system){
  if(system.sourceConflicts?.length)return null;
  const cpu=normalize(system.cpu).replace(/^(?:intel|amd) /,'').replace(/^core /,''),gpu=normalize(system.gpu).replace(/^(?:nvidia |amd )/,'');
  const ram=system.normalized?.ramGB||Number(system.ram?.match(/^(\d+)\s*GB/i)?.[1]);
  const sm=system.storage?.match(/^(\d+(?:\.\d+)?)\s*(TB|GB)/i),storage=system.normalized?.storageGB||(sm?Number(sm[1])*(sm[2].toUpperCase()==='TB'?1000:1):null);
  return cpu&&gpu&&ram&&storage?[cpu,gpu,ram,storage].join('|'):null;
}
function measure(records){
  return {regionalEntries:records.length,uniqueModelIdentifiers:new Set(records.map(r=>normalize(r.brand)+'|'+normalize(r.model||r.sku))).size,
    uniqueConfigurationIdentities:new Set(records.map(r=>normalize(r.brand)+'|'+normalize(r.skuKind==='manufacturer-part-number'?r.sku:r.model||r.sku))).size,
    coreConfigurationSignatures:new Set(records.map(coreSignature).filter(Boolean)).size,
    incompleteOrConflictedCoreEntries:records.filter(r=>!coreSignature(r)).length,
    manufacturerPartNumbers:new Set(records.filter(r=>r.skuKind==='manufacturer-part-number').map(r=>normalize(r.brand)+'|'+normalize(r.sku))).size,
    regions:records.reduce((o,r)=>(o[r.region]=(o[r.region]||0)+1,o),{}),brands:records.reduce((o,r)=>(o[r.brand||'Unknown']=(o[r.brand||'Unknown']||0)+1,o),{})};
}
function coverage(existing=require('./oct14-prebuilt-data.cjs'),packets=readPackets()){
  const result=stage(existing,packets),merged=[...existing,...result.additions];
  return {schema:VERSION,inspectedAt:'2026-10-19',basis:'Bounded fixed-SKU manufacturer specification intake. Regional rows, exact model identifiers and shared core hardware configurations are distinct counts.',before:measure(existing),added:measure(result.additions),after:measure(merged),valid:result.ok,errors:result.errors,excludedCandidates:result.excluded,
    sourceRegisterEntries:Object.keys(packets.sources).length,
    inspectedPrimarySourceDocuments:new Set(Object.values(packets.sources).flatMap(source=>source.tableUrl?[source.tableUrl,...(source.detailCorroborated?[source.url]:[])]:[source.url])).size,
    addedExactPhotographs:0,addedLicensed3DModels:0,addedVerifiedRetailOffers:0,
    countQualification:'Manufacturer part-number counts only include records explicitly carrying the normalized manufacturer-part-number schema. A zero in the inherited cohort does not mean its products lack manufacturer part numbers. A model-family identifier may cover several exact SKUs.',
    target:{distinctVerifiedConfigurations:200,met:false,note:'200 distinct verified configurations have not been established. Matching CPU/GPU/RAM/storage signatures are counted once regardless of manufacturer SKU or region; this is not proof that undisclosed components are identical.'},
    unknowns:{exactPsuModel:result.additions.filter(r=>!r.normalized.psuModel).length,exactMotherboard:result.additions.filter(r=>!r.board).length,ramModuleLayout:result.additions.filter(r=>!r.ramLayout).length,warranty:result.additions.filter(r=>!r.warranty).length,price:result.additions.length,stock:result.additions.length,exactPhoto:result.additions.length},
    gaps:['Additional fixed configurations from other manufacturers require exact source inspection.','No manufacturer photography redistribution licence acquired. Original category artwork is explicitly illustrative.','No current prices or stock are asserted; authorized retail offers are a separate system.','Existing retailer-source records retain their original data, dates and conflicts; this batch is not a re-verification of the inherited cohort.']};
}
const towerSVG='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" role="img" aria-labelledby="title desc"><title id="title">Desktop PC illustration</title><desc id="desc">Original schematic category artwork, not a photograph or a model-specific depiction.</desc><defs><linearGradient id="case" x2="1" y2="1"><stop stop-color="#344967"/><stop offset="1" stop-color="#132237"/></linearGradient><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#b9dce9" stop-opacity=".28"/><stop offset="1" stop-color="#365776" stop-opacity=".15"/></linearGradient></defs><ellipse cx="305" cy="388" rx="164" ry="16" fill="#8ca0bb" opacity=".12"/><path d="M180 81h204l45 30v253l-45 28H180z" fill="url(#case)"/><path d="m384 81 45 30v253l-45 28z" fill="#203148"/><rect x="198" y="105" width="165" height="257" rx="8" fill="url(#glass)" stroke="#a9bfd5" stroke-opacity=".4"/><g fill="none" stroke="#65c6c1" stroke-width="5"><circle cx="405" cy="164" r="17"/><circle cx="405" cy="224" r="17"/><circle cx="405" cy="284" r="17"/></g><g fill="#486782" stroke="#9bb4ca" stroke-width="2"><rect x="216" y="131" width="127" height="143" rx="5"/><rect x="230" y="218" width="108" height="29" rx="4"/><rect x="250" y="154" width="39" height="39" rx="5"/></g><g stroke="#69c6bf" stroke-width="5"><path d="M310 144v55m12-55v55"/></g><rect x="216" y="300" width="127" height="43" rx="5" fill="#203148"/><circle cx="401" cy="119" r="3" fill="#99e0d3"/><path d="M190 392v9m180-9v9" stroke="#263b55" stroke-width="9"/><g stroke="#577493" stroke-opacity=".25" fill="none"><path d="M107 173h43m-10-10 10 10-10 10M457 249h43m-10-10 10 10-10 10"/></g></svg>';
function prepare({root,existing=require('./oct14-prebuilt-data.cjs'),packets=readPackets(),reportDirectory=path.resolve(__dirname,'../docs/total-refinement/prebuilts')}={}){
  const merged=systems(existing,packets),report=coverage(existing,packets);
  fs.mkdirSync(reportDirectory,{recursive:true});fs.writeFileSync(path.join(reportDirectory,'coverage.json'),JSON.stringify(report,null,2)+'\n');
  if(root){fs.mkdirSync(path.join(root,'data'),{recursive:true});fs.writeFileSync(path.join(root,'data/total-prebuilts-provenance.json'),JSON.stringify({schema:VERSION,checkedAt:'2026-10-19',sources:packets.sources,addedIds:merged.slice(existing.length).map(r=>r.id)}));fs.mkdirSync(path.join(root,'assets/illustrations'),{recursive:true});fs.writeFileSync(path.join(root,'assets/illustrations/total-prebuilt-tower.svg'),towerSVG);}
  return {systems:merged,report};
}
module.exports={VERSION,FACTS,readPackets,identity,validate,validEAN,toSystem,recordHash,stage,systems,coreSignature,measure,coverage,prepare,towerSVG};
if(require.main===module){const result=prepare({root:path.resolve(__dirname,'../dist')});console.log(JSON.stringify({before:result.report.before,added:result.report.added,after:result.report.after,valid:result.report.valid},null,2));}
