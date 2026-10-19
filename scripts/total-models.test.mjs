import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { IDS,geometry } from './total-models-authoring.mjs';
const require=createRequire(import.meta.url),models=require('./total-models.cjs'),{inspect}=require('./audit-model-assets.cjs');
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rows=models.records(),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const fixture=()=>rows.map(row=>({id:row.id,name:row.name,category:'gpu',status:'approximate',estimated:true,model:'/assets/models/gpu-generic.glb',dimensionsMm:[240,42,115],revision:'1'}));
const document=bytes=>JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));

test('20 original envelopes map one-to-one to exact reviewed GPU identities',()=>{
 assert.deepEqual(rows.map(row=>row.id),IDS);assert.equal(new Set(rows.map(row=>row.asset)).size,20);
 const packet=require('../data/catalog-intake/2026-10-19/batch-gpu.json'),sources=require('../data/catalog-intake/2026-10-19/sources.json');
 for(const row of rows){
  const part=packet.records.find(item=>item.id===row.id),source=sources[part.sourceId],evidence=source.models[part.name];
  assert.equal(row.name,part.name);assert.equal(row.source,source.url);assert.equal(source.confidence,'manufacturer-verified');
  assert.equal(row.evidenceSHA256,hash(Buffer.from(JSON.stringify(evidence))));
  assert.deepEqual(row.dimensionsMm,['lengthMm','thicknessMm','heightMm'].map(key=>evidence.facts[key].value));
  assert.deepEqual(row.axisOrder,['length','thickness','height']);assert.equal(row.manufacturerPartNumber,part.identity.manufacturerPartNumber);
 }
});

for(const row of rows)test('self-contained GLB bounds and provenance: '+row.id,async()=>{
 const file=path.join(ROOT,'scripts/assets/total-models',row.asset),bytes=fs.readFileSync(file),audit=await inspect(file),doc=document(bytes);
 assert.equal(hash(bytes),row.sha256);assert.equal(bytes.length,row.bytes);assert.ok(bytes.equals(geometry(row)),'Authoring must reproduce the committed asset');
 for(let axis=0;axis<3;axis++)assert.ok(Math.abs(audit.sourceBounds[axis]*1000-row.dimensionsMm[axis])<.001,'GLB bounds must match source millimeters on axis '+axis);
 assert.equal(audit.triangles,252);assert.equal(audit.textures,0);assert.equal(audit.animations,0);assert.ok(audit.bytes<8000,'Simple envelope must stay small');
 assert.equal(doc.extras.productId,row.id);assert.equal(doc.extras.source,row.source);assert.equal(doc.extras.clearanceVerified,false);
 assert.equal(doc.extras.appearance,'original-dimension-envelope');assert.deepEqual(doc.extras.dimensionsMm,row.dimensionsMm);
 assert.ok(!doc.nodes.some(node=>/fan|connector|mount|pcb/i.test(node.name)),'Unknown physical details must not be invented');
 assert.ok(doc.buffers.every(buffer=>!buffer.uri));assert.equal(doc.images,undefined);assert.deepEqual(doc.extensionsUsed,['KHR_materials_unlit']);
});

test('mapping replaces assumed sizes while preserving approximate appearance and honest counts',()=>{
 const items=fixture(),result=models.applyLibrary(items);
 assert.equal(result.applied.length,20);assert.equal(result.downloadedAdded,0);assert.equal(result.clearanceVerifiedAdded,0);
 for(let index=0;index<items.length;index++){
  const item=items[index],row=rows[index];assert.equal(item.status,'approximate');assert.equal(item.clearanceVerified,false);assert.equal(item.estimated,false);
  assert.equal(item.model,'/assets/models/'+row.asset);assert.deepEqual(item.dimensionsMm,row.dimensionsMm);assert.match(item.model,/^\/assets\/models\/[a-z0-9-]+\.glb$/);
  assert.match(item.dimensionStatus,/Not exact appearance, CAD or a clearance result/);assert.match(item.missing,/connector and cable/);assert.match(item.rights,/No manufacturer CAD/);
 }
 assert.deepEqual(models.applyLibrary(items).applied,result.applied,'Integration must be idempotent');
});

test('downloaded assets and other authored non-estimated models survive integration unchanged',()=>{
 const items=fixture();items[0]={...items[0],status:'community',attribution:{license:'existing license'},estimated:false,model:'/assets/models/licensed.glb'};
 items[1]={...items[1],estimated:false,model:'/assets/models/existing-original.glb'};
 const before=structuredClone(items.slice(0,2)),result=models.applyLibrary(items);
 assert.deepEqual(items.slice(0,2),before);assert.equal(result.applied.length,18);assert.deepEqual(result.preserved,rows.slice(0,2).map(row=>row.id));
});

test('identity conflicts and duplicate IDs fail before any mutation',()=>{
 const items=fixture();items.at(-1).name='A different GPU variant';const before=structuredClone(items);
 assert.throws(()=>models.applyLibrary(items),/identity mismatch/);assert.deepEqual(items,before);
 assert.throws(()=>models.applyLibrary([...fixture(),fixture()[0]]),/Duplicate/);
 assert.throws(()=>models.applyLibrary(fixture().slice(1)),/identity mismatch/);
});

test('asset preparation copies the entire hash-checked set without runtime dependencies',()=>{
 const temporaryRoot=path.join(ROOT,'tmp');fs.mkdirSync(temporaryRoot,{recursive:true});
 const directory=fs.mkdtempSync(path.join(temporaryRoot,'total-models-test-'));
 try{
  const report=models.prepareAssets({root:directory});assert.equal(report.models,20);assert.equal(report.externalAssets,0);
  for(const row of rows)assert.equal(hash(fs.readFileSync(path.join(directory,'dist/assets/models',row.asset))),row.sha256);
 }finally{assert.ok(path.resolve(directory).startsWith(path.resolve(temporaryRoot)+path.sep));fs.rmSync(directory,{recursive:true,force:true});}
});

test('records are defensive copies and do not mutate integration evidence',()=>{
 const copy=models.records();copy[0].name='wrong';copy[0].dimensionsMm[0]=1;assert.equal(models.records()[0].name,rows[0].name);assert.deepEqual(models.records()[0].dimensionsMm,rows[0].dimensionsMm);
});
