'use strict';
// Reviewed manufacturer Excel exports, downloaded through the public model-table
// country filters. Each source row is an actual SKU, not a family permutation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const directory=path.resolve(__dirname,'../data/prebuilt-intake/2026-10-19');
const reviewed=[
 {file:'legion-t5-26irb8',family:'Legion T5 26IRB8',platform:'Legion_T5_26IRB8',withdrawn:true,count:56,exportHash:'9e7ba3f0e444cd72c6e958a4f957bbd5f359071d403051713feebe7ba6507c76',rowsHash:'b5996165d0f5ab618ef62fe8df4bf7dd787fdb329a5b55a51e536bc2ea26d5a2'},
 {file:'legion-t5-26amr5',family:'Lenovo Legion T5 26AMR5',platform:'Lenovo_Legion_T5_26AMR5',withdrawn:true,count:64,exportHash:'0868bd71aad079fecca012dcaf5a81e284629cb013084b123012514ba11fd065',rowsHash:'9527e7ac14a94e31aa969699ad59e349fbc42caf35d0439207198a991580b71c'}
];
const requireMatch=(text,re,field)=>{const match=String(text).match(re);if(!match)throw Error('Unreviewed '+field+': '+text);return match;};
const capacity=(number,unit)=>Number(number)*(unit==='TB'?1000:1);
function factsFor(row,cohort){
 const cpu=requireMatch(row.Processor,/^(?:Intel|AMD) ((?:Core|Ryzen) [^(,]+)(?:,| \()/,'processor')[1].trim();
 const graphics=requireMatch(row.Graphics,/^(?:NVIDIA|AMD) (.+?) (\d+)GB GDDR\dX?(?: \d+ AI TOPS)?$/,'graphics');
 const gpu=graphics[1].replace(/(Radeon RX \d+)(XT)$/,'$1 XT');
 const memory=requireMatch(row.Memory,/^(\d+)x (\d+)GB (UDIMM)(?: ARMOR)? (DDR[345])-(\d+)$/,'module layout');
 const drive=requireMatch(row.Storage,/^(\d+(?:\.\d+)?)(TB|GB) SSD M\.2 2280 PCIe (\d+)\.0(?:x4)? NVMe(?: \+ (\d+(?:\.\d+)?)(TB|GB) HDD .*)?$/,'storage layout');
 const psu=requireMatch(row['Power Supply'],/^(\d+)W (\d+)%$/,'power supply');
 const os=requireMatch(row['Operating System'],/^(Windows (?:10|11) (?:Home|Pro)(?: 64)?), (?:English|French \/ English)$/,'operating system')[1];
 const warranty=requireMatch(row['Base Warranty'],/^(\d+)-year, Mail-in$/,'base warranty');
 if(!['USA','Canada'].includes(row['Country/Region']))throw Error('Unreviewed region '+row['Country/Region']);
 if(row.Product!==cohort.family)throw Error('Wrong product family for '+row.Model);
 const ssd=capacity(drive[1],drive[2]),hdd=drive[4]?capacity(drive[4],drive[5]):0;
 const facts={cpu,gpu,vramGB:Number(graphics[2]),ramGB:Number(memory[1])*Number(memory[2]),ddr:memory[4],ramModules:Number(memory[1]),ramModuleGB:Number(memory[2]),ramMTs:Number(memory[5]),ramClass:memory[3],storageGB:ssd+hdd,storageInterface:hdd?null:'NVMe',storageGeneration:hdd?null:Number(drive[3]),chipset:row.Chipset.replace(/ Chipset$/,''),psuW:Number(psu[1]),psuEfficiency:'Manufacturer reports '+psu[2]+'% efficiency; certification not asserted',cooling:row.Cooler,network:row['WLAN + Bluetooth'],os,warrantyYears:Number(warranty[1]),withdrawn:cohort.withdrawn,identityNote:'Withdrawn manufacturer fixed configuration. Published memory module rating does not guarantee operating speed. Exact motherboard, PSU and GPU board-partner models are not asserted.'};
 if(hdd)facts.storageLayout=ssd+' GB NVMe SSD + '+hdd+' GB HDD';
 if(row['Included Upgrade']&&row['Included Upgrade']!=='None')facts.warrantyUpgrade=row['Included Upgrade'];
 return facts;
}
function augment({sources,records},options={}){
 const counts=[],ids=new Set(records.map(r=>r.id));
 for(const cohort of reviewed){
  const base=options.directory||directory,sourceBytes=fs.readFileSync(path.join(base,'observations',cohort.file+'.xlsx')),rowsBytes=fs.readFileSync(path.join(base,'observations',cohort.file+'.rows.json'));
  for(const [bytes,expected]of [[sourceBytes,cohort.exportHash],[rowsBytes,cohort.rowsHash]])if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Reviewed export evidence changed: '+cohort.file);
  const rows=JSON.parse(rowsBytes.toString('utf8'));
  if(rows.length!==cohort.count)throw Error('Reviewed export row count changed: '+cohort.file);
  let added=0;
  for(const raw of rows){
   const mpn=raw.Model,region=raw['Country/Region']==='USA'?'US':'CA',sourceId='lenovo-'+mpn.toLowerCase(),id='total-'+region.toLowerCase()+'-'+sourceId,model=cohort.family.replace(/^Lenovo /,'')+' '+mpn;
   if(ids.has(id)){if(!sources[sourceId]?.inspection?.includes(cohort.file+'.xlsx')||JSON.stringify(sources[sourceId].facts)!==JSON.stringify(factsFor(raw,cohort)))throw Error('Existing identity requires review: '+id);continue;}
   const facts=factsFor(raw,cohort),source={publisher:'Lenovo',url:'https://psref.lenovo.com/Detail/'+cohort.platform+'?M='+mpn,tableUrl:'https://psref.lenovo.com/Product/Legion/'+cohort.platform+'?tab=model',inspectedAt:'2026-10-19',confidence:'manufacturer-verified',inspection:'Manufacturer Models table inspected and its USA/Canada-filtered Excel export reviewed: observations/'+cohort.file+'.xlsx; exact row retained in '+cohort.file+'.rows.json. AI-assisted strict field extraction and consistency review; no independent system testing.',scope:'Exact fixed-SKU row from the manufacturer-provided filtered export. No family-option combinations. Historical/withdrawn model. RAM rate is nominal; exact board/PSU models, stock, seller, prices and photography rights are not asserted.',identity:{model,manufacturerPartNumber:mpn},facts};
   const row={id,brand:'Lenovo',model,manufacturerPartNumber:mpn,region,currency:region==='US'?'USD':'CAD',sourceId,status:'evidence-checked',configurationKind:'fixed-manufacturer-sku'};
   if(sources[sourceId])throw Error('Duplicate source identity '+sourceId);sources[sourceId]=source;records.push(row);ids.add(id);added++;
  }
  counts.push({family:cohort.family,reviewedRows:rows.length,added});
 }
 return counts;
}
module.exports={reviewed,factsFor,augment};
if(require.main===module){const packets=require('./total-prebuilts.cjs').readPackets(),counts=augment(packets);const report=require('./total-prebuilts.cjs').stage(require('./oct14-prebuilt-data.cjs'),packets);if(!report.ok)throw Error(report.errors.join('\n'));for(const [name,data]of [['sources',packets.sources],['batch',packets.records]])fs.writeFileSync(path.join(directory,name+'.json'),JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({counts,after:require('./total-prebuilts.cjs').measure(require('./total-prebuilts.cjs').systems(undefined,packets))},null,2));}
