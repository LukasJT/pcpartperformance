'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const preparer=require('./prepare-program-offers.cjs');
const policy=require('./program-offers.cjs');
const repo=path.resolve(__dirname,'..'),now=Date.parse('2026-10-09T12:00:00Z');
const catalog=[{id:'fixture-exact-gpu',name:'Fixture exact GPU',brand:'Fixture',cat:'gpu',sku:'FIXTURE-16G-OC',revision:'1.0',specs:{Memory:16}},{id:'fixture-same-name-8g',name:'Fixture exact GPU',brand:'Fixture',cat:'gpu',sku:'FIXTURE-8G-OC',revision:'1.0',specs:{Memory:8}}];
const review=checkedAt=>({status:'approved',kind:'human',reviewer:'Synthetic test fixture; not a real reviewer',checkedAt});
const evidence=(scope,date='2026-10-08T12:00:00Z')=>[{url:'https://example.com/fixture-evidence',publisher:'Fixture source',checkedAt:date,scope}];
function sources() {
  const identity={exact:true,sku:'FIXTURE-16G-OC',variant:'OC',memoryVariant:'16 GB',revision:'1.0'};
  return {identities:{schema:1,products:[{id:catalog[0].id,identity,evidence:evidence('exact_sku_variant'),review:review('2026-10-08T13:00:00Z')}]},observations:{schema:1,authorizations:[{id:'fixture-permission',kind:'verified-manual',publisher:'Fixture retailer',origins:['https://example.com'],merchantIds:['fixture-retailer'],permission:{access:true,redistribution:true},evidence:evidence('access_and_redistribution'),review:review('2026-10-08T13:00:00Z')}],observations:[{productId:catalog[0].id,sku:identity.sku,variant:identity.variant,memoryVariant:identity.memoryVariant,revision:identity.revision,exactVariant:true,merchantId:'fixture-retailer',merchant:'Fixture retailer',url:'https://example.com/product/exact',region:'CA',currency:'CAD',price:500,condition:'new',availability:'in-stock',inStock:true,checkedAt:'2026-10-09T11:59:00Z',availabilityCheckedAt:'2026-10-09T11:59:00Z',charges:{tax:'excluded',shipping:'excluded'},source:{authorizationId:'fixture-permission',kind:'verified-manual',url:'https://example.com/product/exact',publisher:'Fixture retailer',recordId:'fixture-price-1',redistributionAllowed:true},review:review('2026-10-09T11:59:30Z')} ]}};
}
const validate=data=>preparer.validateOfferSources({...data,records:catalog,now});
let tests=0;
function test(name,fn){fn();tests++;console.log('PASS '+name);}
test('Default durable sources are empty and explicitly unconfigured',()=>{
  const result=preparer.prepareOfferData({repo,now});
  assert(result.report.catalogProducts>1000);assert.equal(result.report.sourceStatus,'not_configured');
  assert.equal(result.report.currentFeedStatus,'not_configured');assert.equal(result.report.currentOfferCount,0);assert.equal(result.report.preservedObservationCount,0);
  assert.deepEqual(result.identities.products,[]);assert.deepEqual(result.observations.observations,[]);
  assert.equal(result.report.networkRequests,0);assert.equal(result.report.sourceFilesRewritten,false);
});
test('Approved exact records produce public data without private reviews or permission documents',()=>{
  const result=validate(sources());
  assert.equal(result.identities.products.length,1);assert.equal(result.current.offers.length,1);assert.equal(result.current.offers[0].price,500);
  assert.equal(result.current.offers[0].validUntil,'2026-10-09T12:14:00.000Z');
  const published=JSON.stringify([result.identities,result.observations,result.current]);
  assert(!published.includes('fixture-permission'));assert(!published.includes('Synthetic test fixture'));assert(!published.includes('fixture-evidence'));assert(!published.includes('reviewer'));
  assert.equal(result.observations.observations[0].source.redistributionAllowed,true);assert.equal(result.current.currentFeedStatus,'not_configured');
  assert.equal(result.current.offers[0].checkedAt,'2026-10-09T11:59:00.000Z');assert.equal(result.current.generatedAt,'2026-10-09T12:00:00.000Z');
});
test('Stable catalog IDs do not resolve by matching names or partner aliases',()=>{
  for(const id of ['different-id','Fixture exact GPU','FIXTURE-exact-gpu']){const data=sources();data.identities.products[0].id=id;assert.throws(()=>validate(data));}
  const data=sources();data.identities.products[0].id=catalog[1].id;assert.throws(()=>validate(data),/differs from catalog identity/);
  assert.throws(()=>preparer.validateOfferSources({...sources(),records:[catalog[0],catalog[0]],now}),/Duplicate product ID/);
  assert.equal(validate(sources()).report.catalogProducts,2);
});
test('Exact SKU, memory capacity, revision and partner variant are mandatory and isolated',()=>{
  for(const [field,value] of [['sku','FIXTURE-8G-OC'],['memoryVariant','8 GB'],['revision','2.0'],['variant','non-OC'],['variant',null],['exactVariant',false]]){const data=sources();data.observations.observations[0][field]=value;assert.throws(()=>validate(data));}
  for(const change of [{memoryVariant:'8 GB'},{memoryVariant:null},{memoryVariant:'sixteen'},{sku:'generic-model'},{revision:'2.0'},{exact:false}]){const data=sources();Object.assign(data.identities.products[0].identity,change);assert.throws(()=>validate(data));}
  const data=sources();data.identities.products.push(structuredClone(data.identities.products[0]));assert.throws(()=>validate(data),/duplicate identity/);
  const withNull=sources();withNull.identities.products[0].identity.variant=null;withNull.observations.observations[0].variant='OC';assert.throws(()=>validate(withNull),/does not match/);
});
test('Source access, redistribution, merchant and origin scope require reviewed permission',()=>{
  for(const mutation of [data=>data.observations.authorizations[0].permission.access=false,data=>data.observations.authorizations[0].permission.redistribution=false,data=>data.observations.authorizations[0].review.kind='agent',data=>data.observations.authorizations[0].review.status='pending',data=>data.observations.observations[0].source.redistributionAllowed=false,data=>data.observations.observations[0].source.authorizationId='not-reviewed',data=>data.observations.observations[0].source.kind='unofficial-scraper',data=>data.observations.observations[0].source.publisher='Wrong publisher',data=>data.observations.observations[0].merchantId='wrong-merchant',data=>data.observations.observations[0].url='https://other.example.com/product',data=>data.observations.observations[0].source.url='https://other.example.com/product']){const data=sources();mutation(data);assert.throws(()=>validate(data));}
  const data=sources();data.observations.authorizations[0].origins=['https://example.com/path'];assert.throws(()=>validate(data),/origin/);
});
test('Bounded schema rejects extra fields, credentials, invalid prices and oversized lists',()=>{
  for(const mutation of [data=>data.identities.token='secret',data=>data.observations.observations[0].password='secret',data=>data.observations.observations[0].source.apiKey='secret',data=>data.identities.products[0].identity.sku='x'.repeat(121),data=>data.observations.observations[0].price='500',data=>data.observations.observations[0].price=null,data=>data.observations.observations[0].price=-1,data=>data.observations.observations[0].price=Infinity,data=>data.observations.observations[0].merchant='abc\nsecret',data=>data.observations.observations=Array(5001).fill(data.observations.observations[0])]){const data=sources();mutation(data);assert.throws(()=>validate(data));}
  for(const unsafe of ['http://example.com/product','javascript:alert(1)','https://user:password@example.com/product','https://localhost/product','https://example.com/product?api_key=private']){const data=sources();data.observations.observations[0].url=unsafe;assert.throws(()=>validate(data));}
  const data=sources();data.observations.observations[0].source=JSON.parse('{"__proto__":{},"authorizationId":"fixture-permission"}');assert.throws(()=>validate(data),/unsupported field/);
});
test('Dates, review order, exact currency and stock evidence are validated without coercion',()=>{
  for(const mutation of [data=>data.observations.observations[0].checkedAt='2026-02-30T12:00:00Z',data=>data.observations.observations[0].checkedAt='2026-10-09T12:01:00Z',data=>data.observations.observations[0].checkedAt='2026-10-09',data=>data.observations.observations[0].availabilityCheckedAt='2026-10-09T11:59:10Z',data=>data.observations.observations[0].expiresAt='2026-10-09T11:58:00Z',data=>data.observations.observations[0].currency='USD',data=>data.observations.observations[0].region='GB',data=>data.observations.observations[0].inStock='true',data=>data.observations.observations[0].availability='out-of-stock',data=>data.observations.observations[0].review.checkedAt='2026-10-09T11:58:00Z',data=>data.identities.products[0].review.checkedAt='2026-10-07T12:00:00Z']){const data=sources();mutation(data);assert.throws(()=>validate(data));}
  const us=sources();us.observations.observations[0].region='US';us.observations.observations[0].currency='USD';assert.equal(validate(us).current.offers[0].currency,'USD');
});
test('Expired reviewed observations remain history and never become current through regeneration',()=>{
  const data=sources(),row=data.observations.observations[0];row.checkedAt='2026-09-01T12:00:00Z';row.availabilityCheckedAt=row.checkedAt;row.expiresAt='2026-09-01T12:10:00Z';
  const result=validate(data);assert.equal(result.observations.observations.length,1);assert.equal(result.current.offers.length,0);assert.equal(result.observations.recordsStatus,'reviewed_observations_available');
  assert.equal(result.observations.historicalCoverage[0].continuousCoverage,false);assert.equal(result.observations.historicalCoverage[0].interpolation,false);
  assert.equal(result.observations.observations[0].checkedAt,'2026-09-01T12:00:00.000Z');assert.equal(result.observations.observations[0].expiresAt,'2026-09-01T12:10:00.000Z');
  const later=preparer.validateOfferSources({...data,records:catalog,now:now+86400000});assert.equal(later.current.offers.length,0);assert.deepEqual(later.observations.observations,result.observations.observations);
});
test('Later unavailability supersedes old prices and charge unknowns never rank',()=>{
  for(const availability of ['out-of-stock','unknown','preorder','backorder']) {
    const data=sources(),row=structuredClone(data.observations.observations[0]);row.checkedAt='2026-10-09T11:59:20Z';row.availabilityCheckedAt=row.checkedAt;row.availability=availability;row.inStock=availability==='out-of-stock'?false:null;row.source.recordId='fixture-price-2';data.observations.observations.push(row);
    const result=validate(data);assert.equal(result.current.offers.length,0);assert.equal(result.observations.observations.length,2);
  }
  const unknown=sources();unknown.observations.observations[0].charges.tax='unknown';assert.equal(validate(unknown).current.offers.length,0);assert.equal(validate(unknown).observations.observations.length,1);
  const zero=sources();zero.observations.observations[0].price=0;assert.equal(validate(zero).current.offers.length,0);assert.equal(validate(zero).observations.observations[0].price,0);
});
test('Duplicate observations deduplicate deterministically and conflicts fail closed',()=>{
  const data=sources();data.observations.observations.push(structuredClone(data.observations.observations[0]));assert.equal(validate(data).observations.observations.length,1);
  data.observations.observations[1].price=600;assert.throws(()=>validate(data),/source record/);
  data.observations.observations[1].source.recordId='different-source-record';assert.throws(()=>validate(data),/conflicting-duplicate-observation/);
  assert.deepEqual(validate(sources()),validate(sources()));
});
test('Inherited legacy snapshots cannot enter the approved source schema or history',()=>{
  const data=sources();const legacy=JSON.parse(fs.readFileSync(path.join(repo,'dist/prices.json'),'utf8')).offers;
  if(legacy.length){data.observations.observations=[legacy[0]];assert.throws(()=>validate(data));}
  data.observations.observations=[{productId:catalog[0].id,price:500}];assert.throws(()=>validate(data),/required field missing/);
  assert.equal(preparer.prepareOfferData({repo,now}).observations.observations.length,0);
});
const fixtureParent=path.join(repo,'docs/program-2026-10-09');
const temporary=fs.mkdtempSync(path.join(fixtureParent,'pcp-offer-sources-'));
try {
  test('Read-only CLI validates; prepare copies public data without rewriting source records',()=>{
    const data=sources(),files={identities:path.join(temporary,'identities.json'),observations:path.join(temporary,'observations.json'),catalog:path.join(temporary,'catalog.json')},output=path.join(temporary,'public-data');
    for(const [name,file] of Object.entries(files))fs.writeFileSync(file,JSON.stringify(name==='catalog'?catalog:data[name],null,2));
    const original=Object.fromEntries(Object.entries(files).map(([name,file])=>[name,fs.readFileSync(file,'utf8')]));
    const flags=['--identities',files.identities,'--observations',files.observations,'--catalog',files.catalog,'--now','2026-10-09T12:00:00Z'];
    const script=path.join(__dirname,'prepare-program-offers.cjs'),report=JSON.parse(cp.execFileSync(process.execPath,[script,'validate',...flags],{encoding:'utf8'}));
    assert.equal(report.command,'validate');assert.equal(report.currentOfferCount,1);assert(!fs.existsSync(output));
    cp.execFileSync(process.execPath,[script,'prepare',...flags,'--out-dir',output],{encoding:'utf8'});
    assert.equal(JSON.parse(fs.readFileSync(path.join(output,'offer-current.json'),'utf8')).offers.length,1);
    const first=fs.readFileSync(path.join(output,'offer-observations.json'),'utf8');
    cp.execFileSync(process.execPath,[script,'prepare',...flags,'--out-dir',output],{encoding:'utf8'});
    assert.equal(fs.readFileSync(path.join(output,'offer-observations.json'),'utf8'),first);
    for(const [name,file] of Object.entries(files))assert.equal(fs.readFileSync(file,'utf8'),original[name]);
    data.observations.observations[0].memoryVariant='8 GB';fs.writeFileSync(files.observations,JSON.stringify(data.observations));
    const rejected=cp.spawnSync(process.execPath,[script,'prepare',...flags,'--out-dir',output],{encoding:'utf8'});
    assert.equal(rejected.status,1);assert.equal(fs.readFileSync(path.join(output,'offer-observations.json'),'utf8'),first);
    assert.throws(()=>preparer.writeOfferData({prepared:validate(sources()),outDir:temporary,sourceFiles:[path.join(temporary,'offer-identities.json')]}),/canonical source/);
  });
  test('JSON byte bound and invalid CLI flags fail explicitly',()=>{
    const large=path.join(temporary,'large.json');const descriptor=fs.openSync(large,'w');fs.ftruncateSync(descriptor,preparer.MAX_FILE_BYTES+1);fs.closeSync(descriptor);
    assert.throws(()=>preparer.prepareOfferData({repo,identitiesFile:large,now}),/no larger than/);
    assert.throws(()=>preparer.cli(['download']),/validate or prepare/);
    assert.throws(()=>preparer.cli(['validate','--fetch','https://example.com']),/Invalid/);
  });
} finally {
  // This generated fixture directory is the only deletion target.
  const resolved=path.resolve(temporary),parent=path.resolve(fixtureParent);
  if(path.dirname(resolved)!==parent || !path.basename(resolved).startsWith('pcp-offer-sources-'))throw new Error('Unsafe fixture cleanup target');
  fs.rmSync(resolved,{recursive:true,force:true});
}
assert.equal(policy.DEFAULT_TTL_MS,900000);
console.log(`${tests} durable offer source tests passed. No external requests or real permission/price records created.`);
