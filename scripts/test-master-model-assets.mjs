import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {NodeIO} from '../../model-tools/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../../model-tools/node_modules/@gltf-transform/extensions/dist/index.js';
import {getBounds} from '../../model-tools/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptDecoder} from '../../model-tools/node_modules/meshoptimizer/index.js';

const require=createRequire(import.meta.url),validator=require('../../work/gltf-validator');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const registry=require('./sketchfab-models.json'),batch=require('../docs/growth/master-model-assets.json');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const report={checkedAt:new Date().toISOString(),validatorVersion:validator.version(),method:'Khronos GLB structure validation plus Meshopt decoding, finite accessor scan, embedded provenance, exact registry joins and self-contained resource checks. Actual renderer reports are checked separately; these checks do not certify physical fit.',assets:[]};
assert.equal(new Set(registry.map(m=>m.id)).size,registry.length,'Duplicate component mapping');
assert.equal(new Set(batch.additions.map(m=>m.asset)).size,batch.newDistinctAssets,'Inflated new-asset count');
assert.equal(batch.additions.length,batch.newComponentMappings,'Inflated mapping count');

for(const m of batch.additions){
  const entries=registry.filter(x=>x.asset===m.asset),r=entries.find(x=>x.id===m.id);
  assert.ok(r,'Missing exact mapping');assert.equal(entries.length,1,'New chip model has spread to partner variants');
  assert.equal(r.identity,'family-or-chip');assert.equal(r.estimated,true);
  assert.ok(/not manufacturer measurements/.test(r.dimensionStatus),'Unknown axes presented as measurements');
  assert.deepEqual(r.orientation,[Math.PI,0,0],'Installation orientation changed without review');
  assert.equal(r.creator,m.creator);assert.equal(r.sourceUid,m.sourceUid);
  assert.equal(r.license,'CC BY 4.0');assert.equal(r.licenseUrl,'https://creativecommons.org/licenses/by/4.0/');
  assert.equal(m.currentMetadata.isDownloadable,true);assert.equal(m.currentMetadata.license.slug,'by');
  const assetPath=path.join(root,'dist/assets/models',m.asset),bytes=fs.readFileSync(assetPath);
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256,m.sha256);assert.equal(sha256,r.assetSha256);assert.equal(bytes.length,m.bytes);
  assert.ok(bytes.length<m.sourceBytes*.25,'Web optimization regression');
  assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(8),bytes.length);
  const result=await validator.validateBytes(new Uint8Array(bytes),{uri:m.asset,maxIssues:1000});
  assert.equal(result.issues.numErrors,0,'GLB validator reports structural errors');
  const doc=await io.read(assetPath),asset=doc.getRoot().getAsset().extras,bounds=getBounds(doc.getRoot().listScenes()[0]);
  assert.ok(asset.author.includes(m.creator));assert.ok(asset.source.includes(m.sourceUid));assert.equal(asset.title,m.title);
  assert.ok(asset.license.includes('CC-BY-4.0'),'Source license attribution missing from distributed GLB');
  const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
  assert.ok((json.buffers||[]).every(b=>!b.uri),'External buffer dependency');
  assert.ok((json.images||[]).every(i=>i.bufferView!==undefined&&!i.uri),'External image dependency');
  assert.ok(bounds.min.every((v,i)=>Number.isFinite(v)&&Number.isFinite(bounds.max[i])&&bounds.max[i]>v),'Non-positive volume');
  let values=0;for(const accessor of doc.getRoot().listAccessors())for(const value of accessor.getArray()||[]){assert.ok(Number.isFinite(value),'Decoded non-finite geometry');values++;}
  const triangles=doc.getRoot().listMeshes().reduce((n,mesh)=>n+mesh.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()||p.getAttribute('POSITION')?.getCount()||0)/3,0),0);
  assert.equal(triangles,m.triangles,'Unreviewed topology change');
  for(const rendererReport of m.rendererReports){
    const scenes=JSON.parse(fs.readFileSync(path.join(root,rendererReport),'utf8')).scenarios;
    assert.ok(scenes.length>0);for(const scene of scenes){assert.equal(scene.state.title,'REVIEW_READY');const actual=JSON.parse(scene.state.result);assert.deepEqual(actual.failed,[]);assert.equal(actual.rendered,1);assert.ok(Number(scene.state.canvas.triangles)>0);}
  }
  const issues={};for(const issue of result.issues.messages||[])issues[issue.code]=(issues[issue.code]||0)+1;
  report.assets.push({id:m.id,bytes:bytes.length,sha256,errors:result.issues.numErrors,warnings:result.issues.numWarnings,issues,decodedFiniteValues:values,triangles,bounds});
  console.log(m.id,bytes.length,'bytes;',triangles,'triangles;',result.issues.numErrors,'structural errors;',values,'finite decoded values; 5 successful actual-renderer scenarios');
}
fs.writeFileSync(path.join(root,'docs/growth/master-model-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log('Master model asset checks passed. Appearance assets remain unsuitable as physical-fit certification.');
