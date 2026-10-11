'use strict';
/* Local validation/build preparation only. No network, scraping, purchases or jobs.
 * Sources in data/ are never rewritten. Generated public copies contain no reviewer
 * identities or permission-document records. Schema validation does not grant rights. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const policy = require('./program-offers.cjs');
const {createIdentityResolver} = require('./product-identities.cjs');
const REPO = path.resolve(__dirname, '..');
const MAX_FILE_BYTES = 16 * 1024 * 1024, MAX_EVIDENCE = 20, MAX_AUTHORIZATIONS = 500;
const ID = /^[a-z0-9][a-z0-9-]{0,119}$/;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
class OfferSourceError extends Error {
  constructor(issues) { super('Offer source validation failed: ' + issues.join('; ')); this.name='OfferSourceError'; this.issues=issues; }
}
function fail(at, message) { throw new OfferSourceError([at + ': ' + message]); }
function object(value, at, keys, required = keys) {
  if(!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype,null].includes(Object.getPrototypeOf(value))) fail(at,'requires a plain object');
  for(const key of Object.keys(value)) if(!keys.includes(key) || ['__proto__','constructor','prototype'].includes(key)) fail(at+'.'+key,'unsupported field');
  for(const key of required) if(!own(value,key)) fail(at+'.'+key,'required field missing');
  return value;
}
function list(value, at, max, min = 0) { if(!Array.isArray(value) || value.length < min || value.length > max) fail(at,'requires '+min+' to '+max+' records'); return value; }
function text(value, at, max = 160, nullable = false) {
  if(nullable && value === null) return null;
  if(typeof value !== 'string' || !value.length || value.length > max || value !== value.trim() || /[\u0000-\u001f\u007f]/.test(value)) fail(at,'requires bounded, nonempty text without control characters or outer whitespace');
  return value;
}
function id(value, at) { text(value,at,120); if(!ID.test(value)) fail(at,'invalid stable ID'); return value; }
function url(value, at) {
  text(value,at,2048);
  const safe = policy.safeURL(value); if(!safe) fail(at,'requires a public HTTPS URL without embedded credentials');
  const parsed = new URL(safe);
  if(parsed.protocol!=='https:' || ['localhost','127.0.0.1','[::1]'].includes(parsed.hostname) || !parsed.hostname.includes('.')) fail(at,'requires a public HTTPS URL');
  for(const key of parsed.searchParams.keys()) if(/^(api[_-]?key|access[_-]?token|token|secret|password|authorization)$/i.test(key)) fail(at,'credential query parameters are not allowed');
  return parsed.href;
}
function timestamp(value, at, now) {
  text(value,at,40);
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)) fail(at,'requires an explicit UTC ISO timestamp');
  const parsed=Date.parse(value), canonical=Number.isFinite(parsed)?new Date(parsed).toISOString():'';
  if(!canonical || canonical.slice(0,19)!==value.slice(0,19) || parsed>now) fail(at,'invalid calendar date or future timestamp');
  return canonical;
}
function review(value, at, now) {
  object(value,at,['status','kind','reviewer','checkedAt']);
  if(value.status!=='approved' || value.kind!=='human') fail(at,'requires documented human approval; automated checks cannot approve a source');
  text(value.reviewer,at+'.reviewer');
  return timestamp(value.checkedAt,at+'.checkedAt',now);
}
function evidence(value, at, scope, now) {
  return list(value,at,MAX_EVIDENCE,1).map((entry,index)=>{
    const key=at+'['+index+']'; object(entry,key,['url','publisher','checkedAt','scope']);
    if(entry.scope!==scope) fail(key+'.scope','requires '+scope);
    return {url:url(entry.url,key+'.url'),publisher:text(entry.publisher,key+'.publisher'),checkedAt:timestamp(entry.checkedAt,key+'.checkedAt',now),scope};
  });
}
function validateOfferSources({identities, observations, records, now = Date.now()} = {}) {
  if(typeof now!=='number' || !Number.isFinite(now)) fail('now','requires a finite timestamp');
  if(!Array.isArray(records) || records.length>20000) fail('catalog','requires a bounded catalog array');
  const resolver=createIdentityResolver(records), catalog=resolver.byId;
  object(identities,'identities',['schema','products']); object(observations,'observations',['schema','authorizations','observations']);
  if(identities.schema!==1 || observations.schema!==1) fail('schema','only version 1 is supported');
  const products=[], productMap=new Map(), authorizations=new Map();
  for(const [index,row] of list(identities.products,'identities.products',policy.MAX_OBSERVATIONS).entries()) {
    const at='identities.products['+index+']'; object(row,at,['id','identity','evidence','review']); id(row.id,at+'.id');
    const existing=catalog.get(row.id); if(!existing) fail(at+'.id','unknown exact catalog ID; names and aliases are not matched automatically');
    if(productMap.has(row.id)) fail(at+'.id','duplicate identity record');
    object(row.identity,at+'.identity',['exact','sku','variant','memoryVariant','revision']);
    if(row.identity.exact!==true) fail(at+'.identity.exact','exact SKU and variant must be reviewed');
    text(row.identity.sku,at+'.identity.sku',120);
    for(const field of ['variant','memoryVariant','revision']) text(row.identity[field],at+'.identity.'+field,160,true);
    for(const field of ['sku','variant','memoryVariant','revision']) {
      const known=existing.identity?.[field] ?? existing[field];
      if(known!==undefined && known!==null && String(known)!==row.identity[field]) fail(at+'.identity.'+field,'differs from catalog identity; review the catalog instead of silently merging variants');
    }
    if(['gpu','ram','ssd','hdd'].includes(existing.cat) && row.identity.memoryVariant===null) fail(at+'.identity.memoryVariant','memory or storage capacity variant must be explicit for this category');
    const expectedCapacity=['ssd','hdd'].includes(existing.cat)?existing.specs?.['Storage capacity']:['gpu','ram'].includes(existing.cat)?existing.specs?.Memory:null;
    if(typeof expectedCapacity==='number' && Number.isFinite(expectedCapacity) && expectedCapacity>0) {
      const capacity=/^(\d+(?:\.\d+)?) (GB|TB)(?:\b|$)/.exec(row.identity.memoryVariant||'');
      if(!capacity || Number(capacity[1])*(capacity[2]==='TB'?1000:1)!==expectedCapacity) fail(at+'.identity.memoryVariant','capacity does not match the catalog; use explicit decimal GB or TB, followed by optional variant details');
    }
    const source=evidence(row.evidence,at+'.evidence','exact_sku_variant',now), reviewedAt=review(row.review,at+'.review',now);
    if(source.some(item=>Date.parse(item.checkedAt)>Date.parse(reviewedAt))) fail(at+'.review.checkedAt','approval cannot precede its evidence checks');
    const product={id:row.id,identity:{...row.identity}};products.push(product);productMap.set(row.id,product);
  }
  for(const [index,row] of list(observations.authorizations,'observations.authorizations',MAX_AUTHORIZATIONS).entries()) {
    const at='observations.authorizations['+index+']'; object(row,at,['id','kind','publisher','origins','merchantIds','permission','evidence','review']);id(row.id,at+'.id');
    if(authorizations.has(row.id)) fail(at+'.id','duplicate authorization');
    if(!policy.SOURCE_KINDS.includes(row.kind)) fail(at+'.kind','unsupported source kind');text(row.publisher,at+'.publisher');
    const origins=list(row.origins,at+'.origins',20,1).map((value,i)=>{
      const safe=url(value,at+'.origins['+i+']'),parsed=new URL(safe);if(parsed.href!==parsed.origin+'/')fail(at+'.origins['+i+']','requires a source origin without a path, query or fragment');return parsed.origin;
    });
    const merchantIds=list(row.merchantIds,at+'.merchantIds',100,1).map((value,i)=>id(value,at+'.merchantIds['+i+']'));
    object(row.permission,at+'.permission',['access','redistribution']); if(row.permission.access!==true || row.permission.redistribution!==true) fail(at+'.permission','access and public redistribution permission must both be confirmed');
    const source=evidence(row.evidence,at+'.evidence','access_and_redistribution',now),reviewedAt=review(row.review,at+'.review',now);
    if(source.some(item=>Date.parse(item.checkedAt)>Date.parse(reviewedAt))) fail(at+'.review.checkedAt','approval cannot precede its evidence checks');
    authorizations.set(row.id,{kind:row.kind,publisher:row.publisher,origins,merchantIds});
  }
  const normalized=[], observationRecords=new Map();
  for(const [index,row] of list(observations.observations,'observations.observations',policy.MAX_OBSERVATIONS).entries()) {
    const at='observations.observations['+index+']';
    object(row,at,['productId','sku','variant','memoryVariant','revision','exactVariant','merchantId','merchant','url','region','currency','price','condition','availability','inStock','checkedAt','availabilityCheckedAt','expiresAt','charges','source','review'],['productId','sku','variant','memoryVariant','revision','exactVariant','merchantId','merchant','url','region','currency','price','condition','availability','checkedAt','availabilityCheckedAt','charges','source','review']);
    id(row.productId,at+'.productId'); const product=productMap.get(row.productId);
    if(!product) fail(at+'.productId','requires a reviewed exact identity for this stable catalog ID');
    id(row.merchantId,at+'.merchantId');text(row.merchant,at+'.merchant');text(row.sku,at+'.sku',120);
    for(const field of ['variant','memoryVariant','revision']) {text(row[field],at+'.'+field,160,true);if(row[field]!==product.identity[field]) fail(at+'.'+field,'does not match the reviewed exact identity');}
    if(row.sku!==product.identity.sku) fail(at+'.sku','does not match the reviewed exact identity');
    if(row.exactVariant!==true) fail(at+'.exactVariant','exact variant match must be confirmed');
    const storeURL=url(row.url,at+'.url');timestamp(row.checkedAt,at+'.checkedAt',now);timestamp(row.availabilityCheckedAt,at+'.availabilityCheckedAt',now);
    if(row.expiresAt!==undefined && row.expiresAt!==null) {
      // Expiration may legitimately lie in the future; the shared policy checks its relation to the observation.
      timestamp(row.expiresAt,at+'.expiresAt',Infinity);
    }
    object(row.charges,at+'.charges',['tax','shipping']);
    if(!['included','excluded','unknown'].includes(row.charges.tax) || !['included','excluded','unknown'].includes(row.charges.shipping)) fail(at+'.charges','charge basis must be explicit, including unknown when unverified');
    object(row.source,at+'.source',['authorizationId','kind','url','publisher','recordId','redistributionAllowed']);
    id(row.source.authorizationId,at+'.source.authorizationId'); const authorization=authorizations.get(row.source.authorizationId);
    if(!authorization) fail(at+'.source.authorizationId','missing reviewed source authorization');
    id(row.source.recordId,at+'.source.recordId'); const sourceURL=url(row.source.url,at+'.source.url');text(row.source.publisher,at+'.source.publisher');
    if(row.source.kind!==authorization.kind || row.source.publisher!==authorization.publisher || row.source.redistributionAllowed!==true || !authorization.merchantIds.includes(row.merchantId) || !authorization.origins.includes(new URL(sourceURL).origin) || !authorization.origins.includes(new URL(storeURL).origin)) fail(at+'.source','does not match the reviewed permission scope, merchant and public origins');
    const reviewedAt=review(row.review,at+'.review',now);
    if(Date.parse(reviewedAt)<Date.parse(row.checkedAt) || Date.parse(reviewedAt)<Date.parse(row.availabilityCheckedAt)) fail(at+'.review.checkedAt','approval cannot precede its observed price or availability evidence');
    const {offer,issues}=policy.normalizeOffer(row,{product,now});
    if(issues.length) fail(at,issues.join(', '));
    const recordKey=row.source.authorizationId+'/'+row.source.recordId,signature=JSON.stringify(offer), previous=observationRecords.get(recordKey);
    if(previous!==undefined && previous!==signature) fail(at+'.source.recordId','same source record cannot identify different observations');
    if(previous===undefined) {normalized.push(offer);observationRecords.set(recordKey,signature);}
  }
  // Reuse the common conflict/deduplication policy for the complete observation set.
  const preserved=[], current=[], coverage=[];
  for(const product of products) {
    const rows=normalized.filter(row=>row.productId===product.id);
    // Conditions have already been validated by the shared policy. Enumerate them
    // from accepted rows so a future policy addition cannot silently lose history.
    const conditions=[...new Set(rows.map(row=>row.condition))];
    for(const region of ['CA','US']) for(const condition of conditions) {
      const history=policy.priceHistory(rows,{product,now,region,condition});
      if(history.rejected.length) fail('observations',history.rejected.flatMap(row=>row.issues).join(', '));
      preserved.push(...history.points);
      if(history.points.length) coverage.push({productId:product.id,region,currency:history.currency,condition,firstObservation:history.firstObservation,lastObservation:history.lastObservation,observationCount:history.observationCount,gaps:history.gaps,continuousCoverage:false,interpolation:false});
      current.push(...policy.currentOffers(rows,{product,now,region,condition}).offers);
    }
  }
  const sort=(a,b)=>a.productId.localeCompare(b.productId)||a.region.localeCompare(b.region)||Date.parse(a.checkedAt)-Date.parse(b.checkedAt)||a.merchantId.localeCompare(b.merchantId)||a.condition.localeCompare(b.condition);
  preserved.sort(sort);current.sort(sort);products.sort((a,b)=>a.id.localeCompare(b.id));
  const sourceStatus=preserved.length?'reviewed_observations_available':'not_configured';
  const generatedAt=new Date(now).toISOString();
  return {
    identities:{schema:1,products,status:products.length?'reviewed_exact_identities':'not_configured'},
    observations:{schema:1,policyVersion:policy.VERSION,observations:preserved,currentFeedStatus:'not_configured',recordsStatus:sourceStatus,historicalCoverage:coverage.length?coverage:null,limitations:['Recorded observations do not imply continuous price or stock coverage.','Expired observations are retained as history and excluded from current offers.','No collector, retailer feed or alert job is activated by this preparation.']},
    current:{schema:1,policyVersion:policy.VERSION,generatedAt,status:current.length?'reviewed_current_observations':preserved.length?'no_eligible_current_observations':'not_configured',currentFeedStatus:'not_configured',ttlMs:policy.DEFAULT_TTL_MS,offers:current,priceBasis:'item prices with matching explicit tax/shipping basis; current list excludes unknown charges',notClaimed:['live quote','all-retailer coverage','lowest delivered total','reservation of stock']},
    report:{schema:1,generatedAt,policyVersion:policy.VERSION,catalogProducts:catalog.size,reviewedProducts:products.length,reviewedAuthorizations:authorizations.size,sourceObservationCount:observations.observations.length,preservedObservationCount:preserved.length,currentOfferCount:current.length,sourceStatus,currentFeedStatus:'not_configured',sourceFilesRewritten:false,networkRequests:0,reviewValidation:'Validates required human approval records; does not independently grant or establish permission.'}
  };
}
function readJSON(file) {
  const stat=fs.statSync(file);if(!stat.isFile() || stat.size>MAX_FILE_BYTES) fail('source file','requires a JSON file no larger than '+MAX_FILE_BYTES+' bytes');
  return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
}
function loadCatalog(repo=REPO) {
  const context={window:{},document:{querySelector(){}}};vm.createContext(context);
  for(const file of ['data','history-data','universe-data','component-data','core','retail-data','phone-catalog']) vm.runInContext(fs.readFileSync(path.join(repo,'dist',file+'.js'),'utf8'),context,{timeout:5000});
  vm.runInContext('globalThis.records=catalog;',context,{timeout:5000});return JSON.parse(JSON.stringify(context.records));
}
function prepareOfferData({repo=REPO,records,now=Date.now(),identitiesFile,observationsFile}={}) {
  return validateOfferSources({identities:readJSON(identitiesFile||path.join(repo,'data/program-offer-identities.json')),observations:readJSON(observationsFile||path.join(repo,'data/program-offer-observations.json')),records:records||loadCatalog(repo),now});
}
function writeOfferData({prepared,outDir,sourceFiles=[]}={}) {
  if(!prepared || !prepared.report || !outDir) throw new TypeError('A validated prepared result and output directory are required');
  const outputs={'offer-identities.json':prepared.identities,'offer-observations.json':prepared.observations,'offer-current.json':prepared.current};
  const directory=path.resolve(outDir), protectedFiles=[path.join(REPO,'data/program-offer-identities.json'),path.join(REPO,'data/program-offer-observations.json'),...sourceFiles].map(file=>path.resolve(file).toLocaleLowerCase());
  for(const name of Object.keys(outputs)) if(protectedFiles.includes(path.join(directory,name).toLocaleLowerCase())) throw new RangeError('Output cannot replace a canonical source file');
  fs.mkdirSync(directory,{recursive:true});
  for(const [name,data] of Object.entries(outputs)) {
    const target=path.join(directory,name),temporary=target+'.prepare-'+process.pid+'.tmp';
    try {fs.writeFileSync(temporary,JSON.stringify(data,null,2)+'\n',{flag:'wx'});fs.renameSync(temporary,target);}
    finally {if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
  }
  return Object.keys(outputs).map(name=>path.join(directory,name));
}
function cli(args=process.argv.slice(2)) {
  const command=args.shift();if(!['validate','prepare'].includes(command)) throw new RangeError('Use validate or prepare. Optional flags: --identities, --observations, --catalog (JSON), --out-dir, --now (UTC ISO).');
  const values={};while(args.length){const flag=args.shift();if(!['--identities','--observations','--catalog','--out-dir','--now'].includes(flag) || !args.length || own(values,flag))throw new RangeError('Invalid or repeated CLI flag');values[flag]=args.shift();}
  const now=values['--now']?Date.parse(values['--now']):Date.now();if(values['--now'])timestamp(values['--now'],'--now',Infinity);
  const prepared=prepareOfferData({identitiesFile:values['--identities'],observationsFile:values['--observations'],records:values['--catalog']?readJSON(values['--catalog']):undefined,now});
  if(command==='validate' && values['--out-dir'])throw new RangeError('validate does not write output');
  if(command==='prepare')writeOfferData({prepared,outDir:values['--out-dir']||path.join(REPO,'dist/data'),sourceFiles:[values['--identities'],values['--observations'],values['--catalog']].filter(Boolean)});
  process.stdout.write(JSON.stringify({...prepared.report,command},null,2)+'\n');
  return prepared;
}
module.exports={OfferSourceError,MAX_FILE_BYTES,validateOfferSources,prepareOfferData,writeOfferData,loadCatalog,cli};
if(require.main===module){try{cli();}catch(error){process.stderr.write(error.name+': '+error.message+'\n');process.exitCode=1;}}
