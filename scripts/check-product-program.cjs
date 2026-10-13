'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const {createIdentityResolver, rollbackReferences, decisions} = require('./product-identities.cjs');
const program = require('./program-products.cjs');
const repo = path.resolve(__dirname, '..');
const context = {window:{},document:{querySelector(){}}}; vm.createContext(context);
for(const file of ['data','history-data','universe-data','component-data','core','retail-data','phone-catalog']) vm.runInContext(fs.readFileSync(path.join(repo,'dist',file+'.js'),'utf8'),context);
vm.runInContext('globalThis.records=catalog;',context);
const catalog = JSON.parse(JSON.stringify(context.records));
const esc = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
let passed = 0;
function test(name, callback) { callback(); passed++; console.log('PASS '+name); }
const base = {id:'variant-a',brand:'MSI',cat:'gpu',name:'Same name',sku:'EXACT-12G-OC',revision:'A',region:'CA',specs:{Memory:12,'Form factor':'Full height'}};
const fixture = [{...base}, {...base,id:'variant-b'}, {...base,id:'variant-c'}, {...base,id:'other-8',sku:'EXACT-8G-OC',specs:{Memory:8}}];
const approval = (from,to) => ({from,to,decision:'confirmed_duplicate',scope:'exact_identity',evidence:['https://www.msi.com/example-exact-document'],review:{status:'approved',kind:'human',reviewer:'Test fixture only',date:'2026-10-09'}});
const review = aliases => ({version:'test-only',aliases});

test('Real catalog keeps explicit IDs and unresolved named duplicates',()=>{
  const resolver=createIdentityResolver(catalog);
  assert.equal(resolver.byId.size,catalog.length); assert.equal(resolver.aliases.size,0);
  for(const alias of decisions.aliases) {assert.equal(resolver.canonicalId(alias.from),alias.from); assert.equal(resolver.canonicalId(alias.to),alias.to);}
  for(const [a,b] of [['rtx3050','rtx30506'],['rtx5070','retail-msi-geforce-rtx-5070-12g-ventus-3x-oc'],['retail-corsair-4000d-black','x-case-corsair-4000d-airflow']]) {assert.notEqual(resolver.resolve(a).record,resolver.resolve(b).record);}
  assert.deepEqual(resolver.redirects(),[]); assert.equal(resolver.resolve('missing-product').status,'unknown');
  assert.equal(resolver.resolve('missing-product').record,null);
});
test('Name equality and machine review cannot silently alias',()=>{
  const alias=approval('variant-a','variant-b'); alias.review.kind='source_checked_by_agent';
  assert.equal(createIdentityResolver(fixture,review([alias])).canonicalId('variant-a'),'variant-a');
  alias.review.kind='human';alias.review.reviewer=null;
  assert.equal(createIdentityResolver(fixture,review([alias])).canonicalId('variant-a'),'variant-a');
});
test('Reviewed exact aliases migrate without losing quantities, slots, unknowns or notes',()=>{
  const resolver=createIdentityResolver(fixture,review([approval('variant-a','variant-b')]));
  const original={schema:1,revisions:[{name:'variant-a',parts:{cpu:[''],gpu:['variant-a','variant-a','missing-product'],ram:[]},owned:['variant-a'],locked:['variant-a'],items:[{productId:'variant-a',quantity:3}],comparison:['variant-a','variant-c'],notes:'variant-a'}]};
  const migrated=resolver.migrateReferences(original);assert.equal(migrated.journal.length,6);
  assert.deepEqual(migrated.value.revisions[0].parts.gpu,['variant-b','variant-b','missing-product']);
  assert.equal(migrated.value.revisions[0].items[0].quantity,3);assert.equal(migrated.value.revisions[0].name,'variant-a');
  assert.equal(migrated.value.revisions[0].notes,'variant-a');assert.equal(original.revisions[0].parts.gpu[0],'variant-a');
  assert.deepEqual(resolver.migrateReferences(migrated.value).value,migrated.value); assert.equal(resolver.migrateReferences(migrated.value).journal.length,0);
  assert.deepEqual(rollbackReferences(migrated.value,migrated.journal),original);
  const edited=structuredClone(migrated.value);edited.revisions[0].owned[0]='variant-c';
  assert.throws(()=>rollbackReferences(edited,migrated.journal),/subsequent edit/);
  assert.equal(resolver.redirects().length,3);for(const redirect of resolver.redirects()){assert.equal(redirect.status,301);assert.equal(redirect.target,'/learn/variant-b.html');assert.equal(redirect.preserveQuery,true);}
});
test('Alias chains are idempotent and cycles are rejected',()=>{
  const resolver=createIdentityResolver(fixture,review([approval('variant-a','variant-b'),approval('variant-b','variant-c')]));
  assert.equal(resolver.canonicalId('variant-a'),'variant-c');assert.deepEqual(resolver.migrateReferences(['variant-a','variant-b','']).value,['variant-c','variant-c','']);
  assert.throws(()=>createIdentityResolver(fixture,review([approval('variant-a','variant-b'),approval('variant-b','variant-a')])),/cycle/);
});
test('SKU, revision, region, manufacturer and memory conflicts block aliases',()=>{
  assert.throws(()=>createIdentityResolver(fixture,review([approval('variant-a','other-8')])),/sku|specification/);
  for(const change of [{revision:'B'},{region:'US'},{cat:'board'},{brand:'ASUS'},{sku:'EXACT-12G-NONOC'},{specs:{Memory:8}}]){
    const records=[base,{...base,...change,id:'variant-b'}];assert.throws(()=>createIdentityResolver(records,review([approval('variant-a','variant-b')])));
  }
  assert.throws(()=>createIdentityResolver([base,base]),/Duplicate product ID/);
  assert.throws(()=>createIdentityResolver([{...base,id:'bad/../id'}]),/Invalid product ID/);
  const alias=approval('variant-a','variant-b');alias.evidence=['javascript:alert(1)'];
  assert.throws(()=>createIdentityResolver(fixture,review([alias])),/HTTPS/);
  const resolver=createIdentityResolver(fixture);assert.throws(()=>resolver.migrateReferences(JSON.parse('{"__proto__":{"gpu":"variant-a"}}')),/Unsafe/);
});
test('Twenty scoped product profiles have traceable original sources and truthful review state',()=>{
  assert.equal(program.profiles.length,20);assert.equal(new Set(program.profiles.map(p=>p.id)).size,20);
  for(const profile of program.profiles){
    const product=catalog.find(p=>p.id===profile.id);assert.ok(product,'Existing stable ID '+profile.id);
    assert.equal(profile.editorial.status,'evidence_checked');assert.equal(profile.editorial.humanReview,'required');assert.equal(profile.editorial.reviewer,null);assert.equal(profile.editorial.publishedAt,null);assert.equal(profile.priority.basis,'provisional');
    assert.ok(profile.answer.length>50 && profile.decision.length>50 && profile.verify.length>=2 && profile.reuse.length>50);
    assert.ok(profile.guides.length);assert.ok(profile.alternatives.some(a=>catalog.some(p=>p.id===a.id)));
    for(const guide of profile.guides)assert.ok(fs.existsSync(path.join(repo,'dist/blog',guide,'index.html')),'Existing guide route '+guide);
    for(const fact of profile.facts){assert.ok(program.sources[fact.sourceId]);assert.equal(typeof fact.unit,'string');assert.equal(fact.status,fact.value===null?'unknown':'manufacturer_specified');assert.ok(fact.value!==undefined);}
    for(const id of profile.sourceIds){const source=program.sources[id];assert.equal(source.checkedAt,id==='rmxSku'?'2026-10-13':'2026-10-09');assert.equal(source.verification,'original_document_inspected');assert.equal(new URL(source.url).protocol,'https:');assert.ok(source.scope.length>30);}
  }
  const p=id=>program.profiles.find(p=>p.id===id),f=(id,key)=>p(id).facts.find(f=>f.key===key).value;
  assert.equal(f('rtx30506','memoryCapacity'),6);assert.equal(f('rtx30506','graphicsPower'),70);assert.equal(f('rtx5060ti16','memoryCapacity'),16);
  assert.equal(f('rtx5070','exactDimensions'),null);assert.equal(f('b650','m2Slots'),3);assert.equal(f('b850tomahawk','m2Slots'),4);
  assert.equal(p('ddr5').identity.sku,'CMK32GX5M2B6000C30');assert.equal(f('ddr5','profile'),'Intel XMP');
  assert.equal(f('rm850x','fanSize'),135);assert.equal(p('barracuda2').identity.sku,'ST2000DM008');assert.equal(f('barracuda2','spindleSpeed'),7200);
});
test('Readable panels escape supplied text and preserve exact builder positions',()=>{
  const profile=program.profiles.find(p=>p.id==='rtx5070'),record=catalog.find(p=>p.id==='rtx5070');
  const hostile={...profile,answer:'<script>alert(1)</script>'};const html=program.renderPanel(hostile,record,catalog,esc);
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('<caption>'));assert.ok(html.includes('scope="row"'));assert.ok(html.includes('Needs verification'));
  assert.ok(html.includes('human editorial review required'));assert.ok(html.includes('no site-owned hardware test'));
  for(const cat of ['cpu','board','gpu','ram','ssd','hdd','psu','case','fan']){
    const url=new URL(program.openBuilder({cat,id:'variant-a'}),'https://example.invalid');const parts=url.searchParams.get('build').split(',');
    assert.equal(parts.length,9);assert.equal(parts[['cpu','board','gpu','ram','ssd','hdd','psu','case','fan'].indexOf(cat)],'variant-a');assert.equal(parts.filter(Boolean).length,1);
  }
});

const testRoot=fs.mkdtempSync(path.join(repo,'docs/program-2026-10-09/.product-test-'));
const dist=path.join(testRoot,'dist'),docs=path.join(testRoot,'docs');fs.mkdirSync(path.join(dist,'learn'),{recursive:true});
const inherited='<html><head></head><body><main><div class="record-detail"><h2>Specifications</h2><table><tbody><tr><th scope="row">Fan size</th><td>135 mm</td></tr></tbody></table></div></main></body></html>';
const originalPreview=process.env.PROGRAM_PREVIEW;
try{
  for(const profile of program.profiles)fs.writeFileSync(path.join(dist,'learn',profile.id+'.html'),inherited);
  fs.writeFileSync(path.join(dist,'learn','c-board-msi-mag-b850-tomahawk-max-wifi.html'),inherited);
  test('Preview build renders 20 panels, review flags and source JSON without duplicate output',()=>{
    process.env.PROGRAM_PREVIEW='1';const first=program({root:dist,records:catalog,esc,documentationRoot:docs});assert.equal(first.enhanced,20);
    const before=new Map(program.profiles.map(p=>[p.id,fs.readFileSync(path.join(dist,'learn',p.id+'.html'),'utf8')]));
    program({root:dist,records:catalog,esc,documentationRoot:docs});
    for(const [id,html]of before){assert.equal(fs.readFileSync(path.join(dist,'learn',id+'.html'),'utf8'),html);assert.equal((html.match(/program-product:start/g)||[]).length,1);assert.ok(html.includes('data-stage2-noindex'));}
    const rmx=before.get('rm850x');assert.ok(rmx.includes('<td>135 mm</td>'));assert.ok(!rmx.includes('<td>140 mm</td>'));
    const evidence=JSON.parse(fs.readFileSync(path.join(dist,'data/product-evidence.json'),'utf8'));assert.equal(evidence.products.length,20);assert.equal(evidence.humanReviewed,false);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dist,'data/product-identities.json'),'utf8')).aliases,{});
    assert.equal(JSON.parse(fs.readFileSync(path.join(docs,'product-template-result.json'),'utf8')).publishable,0);
  });
  test('Normal mode does not publish unreviewed product panels and missing IDs fail clearly',()=>{
    process.env.PROGRAM_PREVIEW='0';const result=program({root:dist,records:catalog,esc,documentationRoot:docs});assert.equal(result.enhanced,0);
    for(const profile of program.profiles){const html=fs.readFileSync(path.join(dist,'learn',profile.id+'.html'),'utf8');assert.ok(!html.includes('program-product:start'));assert.ok(!html.includes('data-program-product-preview'));assert.ok(!html.includes('data-stage2-noindex'));}
    const legacy=fs.readFileSync(path.join(dist,'learn','c-board-msi-mag-b850-tomahawk-max-wifi.html'),'utf8');assert.ok(!legacy.includes('data-product-identity-note'));
    assert.throws(()=>program({root:dist,records:catalog.filter(p=>p.id!=='rtx5070'),esc,documentationRoot:docs}),/Priority product ID missing: rtx5070/);
  });
}finally{
  if(originalPreview===undefined)delete process.env.PROGRAM_PREVIEW;else process.env.PROGRAM_PREVIEW=originalPreview;
  // The path is an exact mkdtemp child of this task's documentation directory.
  const allowed=path.resolve(repo,'docs/program-2026-10-09')+path.sep;
  if(!path.resolve(testRoot).startsWith(allowed))throw new Error('Unexpected test cleanup path');
  fs.rmSync(testRoot,{recursive:true,force:true});
}
console.log(`${passed} meaningful product identity, source, migration and template checks passed.`);
