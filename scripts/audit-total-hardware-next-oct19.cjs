'use strict';
const fs=require('node:fs'),path=require('node:path'),catalog=require('./total-catalog.cjs'),rules=require('./compatibility-evidence.cjs'),photos=require('./component-photo-catalog.cjs');
const checks={case:['forms','gpuLengthMax','coolerHeightMax','psuFormats','psuLengthMax'],psu:['psuOutput','psuFormat','psuLength'],cooler:['coolingType','supportedSockets','mountingIncluded']};
function audit(){
 const parts=catalog.prepareCatalog(catalog.loadExisting());
 // Reproduce build-pages' private-evidence hydration: the public display
 // payload deliberately omits it and must not undercount the existing coolers.
 for(const cooler of require('./oct16-cooling-data.cjs').COOLERS){const part=parts.find(p=>p.id===cooler.id);if(part)Object.assign(part,JSON.parse(JSON.stringify(cooler)));}
 const images=photos.load(parts),report={checkedAt:new Date().toISOString(),scope:'Current full catalog plus all validated additive packets and existing cooler evidence hydration, matching build-pages. Field counts use the actual readiness engine; they are not a claim of complete installation compatibility or an exhaustive market denominator.',categories:{}};
 for(const[category,fields]of Object.entries(checks)){
  const rows=parts.filter(p=>p.cat===category),coverage=Object.fromEntries(fields.map(field=>[field,rows.filter(p=>rules.verified(rules.field(p,field))).length]));
  report.categories[category]={records:rows.length,brands:[...new Set(rows.map(p=>p.brand))].sort(),exactReviewedPhotos:rows.filter(p=>images[p.id]?.kind==='exact').length,compatibleFieldCoverage:coverage,missingFieldExamples:rows.filter(p=>fields.some(field=>!rules.verified(rules.field(p,field)))).slice(0,12).map(p=>({id:p.id,name:p.name,source:p.source||null,missing:fields.filter(field=>!rules.verified(rules.field(p,field)))}))};
 }
 report.coolerBatch={models:12,manufacturer:'MSI',type:'aio',reviewedExactImages:12,measurements:'Bare radiator and radiator-fan dimensions only; installation stack and thermal behavior remain separate.',noNewCasesOrPsus:true};
 report.nextPriorities=['Case-source verification for exact GPU, PSU and radiator layouts; do not promote old unsourced dimensions into evidence.','PSU exact SKU/revision, body form/length and cable family/inventory checks.','Cooler mounting-package inventory and support-list completeness, especially older stock and separately sold upgrade kits.'];
 return report;
}
if(require.main===module){const report=audit(),file=path.resolve(__dirname,'../docs/total-refinement/catalog/hardware-next/coverage-audit.json');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(Object.fromEntries(Object.entries(report.categories).map(([key,value])=>[key,{records:value.records,photos:value.exactReviewedPhotos,fields:value.compatibleFieldCoverage}]))));}
module.exports={audit};
