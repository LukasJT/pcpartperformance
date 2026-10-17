'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
const {displayPart,builderPart}=require('./completion-catalog-delivery.cjs'),rules=require('./compatibility-evidence.cjs');
function records(){const c={window:{},document:{querySelector(){}}};vm.createContext(c);for(const name of ['data','history-data','universe-data','component-data','core','retail-data'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),c);vm.runInContext('globalThis.parts=catalog;',c);for(const cooler of require('./oct16-cooling-data.cjs').COOLERS)c.parts.push(cooler);return require('./completion-models.cjs').prepareCatalog(c.parts);}
test('display delivery retains identity, specifications and real source while omitting redundant evidence only from general catalog controls',()=>{
 for(const part of records()){const slim=displayPart(part);for(const key of ['id','name','brand','cat','year','architecture','summary','specs','source','sku','model','note','builderEligible','indexable'])assert.deepEqual(slim[key],part[key]);assert.equal(slim.evidence,undefined);assert.equal(slim.cooler,undefined);}
});
test('builder delivery preserves every field used for compatibility decisions and retains known fan mounting data',()=>{
 for(const part of records()){const slim=builderPart(part);assert.deepEqual(slim.evidence,part.evidence);assert.deepEqual(slim.fields,part.fields);assert.deepEqual(slim.specs,part.specs);for(const key of ['mounts','psuFormats','connector','reverse','swappable'])assert.deepEqual(slim.physical?.[key],part.physical?.[key]);assert.equal(!!slim.physical,!!part.physical);assert.equal(slim.source,part.source);}
});
test('readiness engine outputs exactly the same conclusions for all researched coolers and every component addition after delivery projection',()=>{
 const source=records(),get=id=>source.find(p=>p.id===id),base={cpu:[get('9800x3d')],board:[get('b650')],gpu:[get('rtx4080s')],ram:[get('ddr5')],ssd:[get('990pro')],psu:[get('rm850x')],case:[get('x-case-fractal-design-north')]},parts=source.filter(p=>p.cat==='cooler'||p.catalogOrigin==='completion-models-2026-10-16');
 for(const part of parts){const full={...base,[part.cat]:[part]},slim=Object.fromEntries(Object.entries(full).map(([key,items])=>[key,items.map(builderPart)]));assert.deepEqual(rules.createReadiness({parts:slim}),rules.createReadiness({parts:full}),part.id);}
});
test('delivery savings are measured without removing the complete model manifest or evidence packet',()=>{
 const source=records().filter(p=>p.builderEligible!==false),full=zlib.gzipSync(JSON.stringify(source)).length,slim=zlib.gzipSync(JSON.stringify(source.map(builderPart))).length;assert(slim<full-3000);const library=JSON.parse(fs.readFileSync('dist/model-library.json','utf8'));assert(library.items.some(p=>p.physical?.size));assert(require('./oct16-cooling-data.cjs').COOLERS.every(p=>p.cooler&&p.evidence));
});
