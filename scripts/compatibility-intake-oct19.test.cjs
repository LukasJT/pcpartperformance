'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),api=require('./compatibility-intake-oct19.cjs'),catalog=require('./total-catalog.cjs'),rules=require('./compatibility-evidence.cjs');
const clone=value=>JSON.parse(JSON.stringify(value)),base=()=>{const records=catalog.prepareCatalog(catalog.loadExisting());require('./completion-models.cjs').prepareCatalog(records);return records;},packet=api.packet();
test('ten exact existing identities hydrate34 sourced observations and hold five disputed values unknown',()=>{
 const parts=base(),before=parts.map(p=>p.id),actions=api.preflight(parts);assert.equal(actions.length,39);assert.equal(actions.filter(a=>a.observation.value!==null).length,34);assert.equal(actions.filter(a=>a.observation.value===null).length,5);api.applyCatalog(parts);assert.deepEqual(parts.map(p=>p.id),before);
 for(const row of packet.records){const p=parts.find(p=>p.id===row.id);for(const[key,fact]of Object.entries(row.fields)){const current=rules.field(p,key);assert.equal(rules.verified(current),fact.value!==null,key);if(fact.value!==null)assert.deepEqual(current.value,fact.value);}}
});
test('applying evidence twice preserves the complete catalog, notes and stable identifiers',()=>{
 const parts=base();api.applyCatalog(parts);const once=clone(parts);api.applyCatalog(parts);assert.deepEqual(parts,once);
});
test('preflight rejects changed SKU identity or stronger contradictory evidence before any mutation',()=>{
 for(const update of [p=>{p.find(p=>p.id==='sf750').sku='CP-9020284-NA';},p=>{p.find(p=>p.id==='retail-corsair-4000d-black').name='4000D Airflow';},p=>{p.find(p=>p.id==='rm750x').fields={psuLength:{value:999,status:'manufacturer-specified',exact:true,source:'https://www.corsair.com/example',checked:'2026-10-19'}};}]){const parts=base();update(parts);const before=clone(parts);assert.throws(()=>api.applyCatalog(parts),/identity|Contradictory/);assert.deepEqual(parts,before);}
 const parts=base();api.applyCatalog(parts);parts.find(p=>p.id==='ax1600i').compatibilityIntake.hash='edited';const before=clone(parts);assert.throws(()=>api.applyCatalog(parts),/requires review/);assert.deepEqual(parts,before);
});
test('stronger identical evidence keeps its original source; unverified evidence wrappers cannot shadow new facts',()=>{
 const parts=base(),psu=parts.find(p=>p.id==='rm650x'),old={value:650,status:'manufacturer-specified',exact:true,source:'https://www.corsair.com/original-rated-output',checked:'2026-10-18'};psu.fields={psuOutput:clone(old)};psu.evidence={fields:{psuLength:{value:999,status:'indexed-unverified',exact:false}}};api.applyCatalog(parts);assert.deepEqual(psu.fields.psuOutput,old);assert.equal(rules.field(psu,'psuLength').value,160);assert.equal(rules.verified(rules.field(psu,'psuLength')),true);
});
test('actual readiness distinguishes native SFX support, ATX conflict and unresolved GPU/PSU lengths',()=>{
 const parts=base();api.applyCatalog(parts);const get=id=>parts.find(p=>p.id===id),read=(items,id)=>rules.createReadiness({parts:items}).checks.find(c=>c.id===id);
 assert.equal(read({case:[get('retail-lian-li-o11-dynamic-mini-black')],psu:[get('sf750')]},'psu-form').state,'passed');
 assert.equal(read({case:[get('retail-lian-li-o11-dynamic-mini-black')],psu:[get('rm750x')]},'psu-form').state,'failed');
 const gpu={id:'retail-msi-geforce-rtx-3060-gaming-x-trio-12g',cat:'gpu',name:'GeForce RTX3060 GAMING XTRIO12G'};
 assert.equal(read({case:[get('retail-corsair-4000d-black')],gpu:[gpu]},'gpu-length-0').state,'passed');
 for(const id of['retail-lian-li-o11-dynamic-mini-black','retail-lian-li-o11-dynamic-mini-white','retail-corsair-carbide-200r-black'])assert.equal(read({case:[get(id)],gpu:[gpu]},'gpu-length-0').state,'needs-verification');
 assert.equal(read({case:[get('retail-nzxt-h500')],gpu:[gpu]},'gpu-length-0').state,'passed');assert.equal(read({case:[get('retail-nzxt-h500')],gpu:[gpu]},'gpu-clearance-0').state,'needs-verification');
 assert.equal(read({case:[get('retail-corsair-4000d-black')],psu:[get('rm1000x')]},'psu-length').state,'needs-verification');
 assert.equal(read({case:[get('retail-corsair-4000d-black')],psu:[get('rm750x')]},'cables').state,'needs-verification');
});
test('only actually displayed disputed numeric specifications are demoted, with original values retained',()=>{
 const parts=base(),original=clone(parts.find(p=>p.id==='retail-corsair-carbide-200r-black').specs),actions=api.preflight(parts),demotions=actions.flatMap(action=>action.displayDemotions);assert.equal(demotions.length,2);api.applyCatalog(parts);const changed=parts.find(p=>p.id==='retail-corsair-carbide-200r-black');
 assert.equal(changed.specs['Maximum GPU length'],api.DISPLAY_UNKNOWN);assert.equal(changed.specs['Maximum CPU cooler height'],api.DISPLAY_UNKNOWN);assert.equal(changed.specs['Maximum PSU length'],original['Maximum PSU length']);assert.deepEqual(changed.compatibilityIntake.displayDemotions.map(d=>[d.key,d.previousValue]),[['Maximum GPU length',420],['Maximum CPU cooler height',165]]);
 assert.equal(parts.find(p=>p.id==='retail-nzxt-h500').specs['Maximum GPU length'],325);assert.equal(parts.find(p=>p.id==='rm1000x').specs['PSU length'],undefined);assert.deepEqual(parts.find(p=>p.id==='retail-lian-li-o11-dynamic-mini-black').specs,{});
 assert.equal(rules.field(changed,'gpuLengthMax').value,null,'An explicit unknown observation must not fall back to a speculative number or display label');assert.equal(rules.field(changed,'coolerHeightMax').exact,false);assert.ok(rules.field(changed,'gpuLengthMax').conflicts.length>=2);
});
test('manufacturer hosts, format lists, units and conflict evidence cannot be spoofed',()=>{
 for(const update of [p=>{p.sources.mini.url='https://lian-li.com.evil.example/';},p=>{p.records[0].fields.gpuLengthMax={value:null,sourceId:'mini',unit:'mm',condition:'unknown'};},p=>{p.records[0].fields.forms.value=['ATX','<script>'];},p=>{p.records[0].fields.boardWidthMax.unit='inch';},p=>{p.records[0].fields.cableInterchangeable={value:true,sourceId:'mini',unit:'',condition:'unfounded'};}]){const data=clone(packet);update(data);assert.throws(()=>api.validate(data));}
 const sf=packet.sources.sf750;assert.match(sf.scope,/CP-9020186/);assert.match(sf.scope,/RPS0115/);assert.equal(packet.records.find(r=>r.id==='rm1000x').fields.psuLength.value,null);
});
