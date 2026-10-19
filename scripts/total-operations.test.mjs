import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {SOURCES} from './total-operations-sources.mjs';
import {ROOT,LIMITS,isPublicAddress,publicDNS,sourceURL,readSource,discoverCandidates,validateSourceState,validateQueue,auditCatalog,auditPrices,runOperations} from './total-operations.mjs';
import {PUBLISH_FILES,validatePublication,preparePublication} from './total-operations-publish.mjs';
const require=createRequire(import.meta.url),workspace=require('./oct16-workspace.js'),retention=require('./completion-retention.js'),rules=require('./compatibility-evidence.cjs');
const source=SOURCES[0],now=Date.parse('2026-10-18T16:00:00Z'),response=(body,options={})=>({status:200,headers:new Headers({'content-type':'text/html',...options.headers}),body,...options});
// A recorded exact identity seeds isolated test fixtures; fixture timestamps are
// never exported as real retailer observations or added to public history.
const recorded=JSON.parse(await fs.readFile(path.join(ROOT,'data/public-price-history.json'),'utf8')).observations[0];
const observation={...recorded,checkedAt:new Date(now-1000).toISOString(),availabilityCheckedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+86400000-1000).toISOString()};
const snapshot={schema:1,policy:'daily-checked-snapshot',generatedAt:new Date(now).toISOString(),observations:[observation]};
const history={schema:1,policy:'recorded-exact-listing-observations',updatedAt:new Date(now).toISOString(),observations:[observation]};
const candidateHTML='<a href="/news-events/press-releases/detail/9999/source-announcement">A manufacturer product announcement</a>';
const input=()=>({snapshot:structuredClone(snapshot),history:structuredClone(history),state:{schema:1,sources:{}},queue:[],status:{schema:1,lastAttemptAt:new Date(now).toISOString(),lastSuccessfulRunAt:null,lastFailedRunAt:new Date(now).toISOString(),status:'degraded',catalogRecords:1236,offersUpdated:0,currentObservations:0,invalidRecords:0,retailerFailures:1,sourceFailures:1,reviewQueue:0,deploymentVerified:false}});
const testDirectory=path.join(ROOT,'tmp/operations-tests');await fs.mkdir(testDirectory,{recursive:true});
test('only registered sources and the exact inspected HTTPS origin are accepted',()=>{
 assert.equal(sourceURL(source).href,source.url);
 for(const url of ['http://ir.amd.com/news','https://evil.example/news','https://user:secret@ir.amd.com/news','https://ir.amd.com:444/news','https://ir.amd.com/news#fragment','https://127.0.0.1/'])assert.throws(()=>sourceURL(source,url));
 assert.throws(()=>sourceURL({...source}));
});
test('private, loopback, metadata, transition and documentation networks fail closed',()=>{
 for(const address of ['127.0.0.1','10.0.0.2','169.254.169.254','172.16.0.1','192.168.1.2','100.64.0.1','0.0.0.0','224.0.0.1','::1','::ffff:127.0.0.1','fc00::1','fe80::1','2001:db8::1','2002:7f00:1::1','invalid'])assert.equal(isPublicAddress(address),false,address);
 for(const address of ['8.8.8.8','1.1.1.1','2606:4700:4700::1111'])assert.equal(isPublicAddress(address),true,address);
});
test('mixed DNS answers are rejected before a connection, rather than selecting a public-looking answer',async()=>{
 await assert.rejects(publicDNS(source.host,{lookup:async()=>[{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}]}),/source_dns_not_public/);
 assert.deepEqual(await publicDNS(source.host,{lookup:async()=>[{address:'8.8.8.8',family:4}]}),{address:'8.8.8.8',family:4});
});
test('a cross-origin redirect is rejected without fetching its destination',async()=>{
 let calls=0;await assert.rejects(readSource(source,{transport:async()=>{calls++;return response('',{status:302,headers:new Headers({location:'https://169.254.169.254/latest/meta-data/'})});}}),/source_url_not_allowed/);assert.equal(calls,1);
});
test('transient failure has one bounded retry; access denial is not bypassed or retried',async()=>{
 let calls=0;const result=await readSource(source,{transport:async()=>++calls===1?response('',{status:503}):response(candidateHTML),sleep:async()=>{}});assert.equal(result.requests,2);
 calls=0;await assert.rejects(readSource(source,{transport:async()=>{calls++;return response('',{status:403});},sleep:async()=>{}}),/source_access_denied/);assert.equal(calls,1);
});
test('oversized bodies, non-document responses and external XML entities are rejected',async()=>{
 for(const value of [response('x'.repeat(LIMITS.bytes+1)),response('{}',{headers:new Headers({'content-type':'application/json'})}),response('<!DOCTYPE x SYSTEM "file:///etc/passwd"><rss/>')])await assert.rejects(readSource(source,{transport:async()=>value}));
});
test('the inspected missing-type Google RSS fallback requires actual RSS and rejects arbitrary HTML',async()=>{
 const rss=SOURCES.find(row=>row.format==='rss');const result=await readSource(rss,{transport:async()=>response('<?xml version="1.0"?><rss version="2.0"><channel/></rss>',{headers:new Headers({'content-type':'None'})})});assert.equal(result.requests,1);
 await assert.rejects(readSource(rss,{transport:async()=>response('<html>not a feed</html>',{headers:new Headers({'content-type':'None'})})}),/source_content_type/);
});
test('HTML discovery only creates bounded same-origin unpublished leads and never treats URL dates as verified publication',()=>{
 const rows=discoverCandidates(source,candidateHTML+'<a href="/news-events/press-releases/detail/9999/source-announcement">Read Press Release</a><a href="https://evil.example/news">Ignore this external candidate title</a><script>alert(1)</script>',now);assert.equal(rows.length,1);assert.equal(rows[0].title,'A manufacturer product announcement');assert.equal(rows[0].sourcePublishedAt,null);assert.equal(rows[0].published,false);assert.equal(rows[0].status,'needs_editorial_review');assert.deepEqual(validateQueue(rows,{now}),rows);
 assert.throws(()=>validateQueue([{...rows[0],url:'https://evil.example/'}],{now}));assert.throws(()=>validateQueue([{...rows[0],status:'approved',published:true}],{now}));
});
test('RSS date filtering keeps actual recent dates separate from discovery timestamps',()=>{
 const rss=SOURCES.find(row=>row.format==='rss'),body='<rss><item><title>Current search documentation update</title><link>https://developers.google.com/search/docs/test</link><pubDate>Sun, 18 Oct 2026 12:00:00 GMT</pubDate></item><item><title>Future search documentation update</title><link>https://developers.google.com/search/docs/future</link><pubDate>Sun, 18 Oct 2027 12:00:00 GMT</pubDate></item></rss>';
 const rows=discoverCandidates(rss,body,now);assert.equal(rows.length,1);assert.equal(rows[0].sourcePublishedAt,'2026-10-18T12:00:00.000Z');
});
test('persisted source fingerprints require known identities and real past timestamps',()=>{
 assert.deepEqual(validateSourceState(null),{schema:1,sources:{}});assert.throws(()=>validateSourceState({schema:1,sources:{evil:{fingerprint:'a'.repeat(64)}}}));
 assert.throws(()=>validateSourceState({schema:1,sources:{[source.id]:{fingerprint:'a'.repeat(64),firstObservedAt:'2030-01-01',lastSuccessAt:'2030-01-01'}}},{now}));
});
test('catalog identity audit reports duplicates and missing exact local images without pretending to verify all specs',()=>{
 const rows=[{id:'gpu-a',name:'A',cat:'gpu',image:'/assets/missing.webp'},{id:'gpu-a',name:'A',cat:'gpu'}],result=auditCatalog(rows,{exists:()=>false});assert.equal(result.issues.length,2);assert.equal(result.counts.gpu,2);assert.match(result.provenance,/not verification/);
});
test('expired observations are excluded from current prices but remain real recorded history',()=>{
 const result=auditPrices(snapshot,history,{now:Date.parse(snapshot.generatedAt)+2*86400000});assert.equal(result.currentObservations,0);assert.equal(result.expiredObservations,snapshot.observations.length);assert.equal(result.historyValid,true);assert(result.historyObservations>0);
});
test('publisher rejects wrong variant, currency, zero prices, fabricated shipping and failed integrity',()=>{
 for(const change of [{price:0},{currency:'USD'},{sku:'different-variant'},{charges:{tax:'excluded',shipping:'free'}},{checkedAt:'2030-01-01T00:00:00Z'}]){const value=input();Object.assign(value.snapshot.observations[0],change);assert.throws(()=>validatePublication(value,{now}),/publication_price_invalid/);}
 const value=input();value.status.invalidRecords=1;assert.throws(()=>validatePublication(value,{now}));
});
test('publisher normalizes records, strips arbitrary artifact keys and only returns the fixed five JSON files',()=>{
 const value=input();value.snapshot.script='untrusted executable';value.snapshot.observations[0].coupon='not verified';value.status.command='rm everything';const files=validatePublication(value,{now});assert.deepEqual(Object.keys(files),PUBLISH_FILES);assert(!('script' in files[PUBLISH_FILES[0]]));assert(!('coupon' in files[PUBLISH_FILES[0]].observations[0]));assert(!('command' in files['data/operations-status.json']));
});
test('actual offline operations run writes a report with zero network activity and no article or deployment claims',async()=>{
 const root=await fs.mkdtemp(path.join(testDirectory,'audit-'));
 try{await fs.mkdir(path.join(root,'data'));await fs.mkdir(path.join(root,'dist'));await fs.writeFile(path.join(root,'data/public-price-snapshot.json'),JSON.stringify(snapshot));await fs.writeFile(path.join(root,'data/public-price-history.json'),JSON.stringify(history));await fs.writeFile(path.join(root,'dist/shopping-catalog.json'),'[]');
 let calls=0;const output=path.join(root,'report'),result=await runOperations({root,output,clock:()=>now,transport:async()=>{calls++;throw Error('unexpected network');}});assert.equal(calls,0);assert.equal(result.sources.requested,0);assert.equal(result.review.articlesPublished,0);assert.equal(result.deployment.attempted,false);assert.equal(JSON.parse(await fs.readFile(path.join(output,'last-run.json'))).mode,'offline-audit');
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('network run records success and failure separately without changing existing source success dates or publishing leads',async()=>{
 const root=await fs.mkdtemp(path.join(testDirectory,'network-'));
 try{await fs.mkdir(path.join(root,'data'));await fs.mkdir(path.join(root,'dist'));await fs.writeFile(path.join(root,'data/public-price-snapshot.json'),JSON.stringify(snapshot));await fs.writeFile(path.join(root,'data/public-price-history.json'),JSON.stringify(history));await fs.writeFile(path.join(root,'dist/shopping-catalog.json'),'[]');
 const output=path.join(root,'report'),result=await runOperations({root,output,online:true,clock:()=>now,transport:async url=>url.hostname===source.host?response(candidateHTML):response('',{status:403})});assert.equal(result.sources.successful,1);assert.equal(result.sources.failed,SOURCES.length-1);assert.equal(result.status,'degraded');assert.equal(result.review.queued,1);assert.equal(result.review.articlesPublished,0);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('file publisher completes validation before any destination mutation',async()=>{
 const root=await fs.mkdtemp(path.join(testDirectory,'publish-'));
 try{const folder=path.join(root,'.operations-artifact');await fs.mkdir(folder);await fs.mkdir(path.join(root,'data'));await fs.writeFile(path.join(root,'data/public-price-snapshot.json'),'original');const value=input(),names={'public-price-snapshot.json':value.snapshot,'public-price-history.json':value.history,'source-state.json':value.state,'review-queue.json':value.queue,'operations-status.json':{...value.status,invalidRecords:1}};for(const [name,data]of Object.entries(names))await fs.writeFile(path.join(folder,name),JSON.stringify(data));await assert.rejects(preparePublication({root,now}));assert.equal(await fs.readFile(path.join(root,'data/public-price-snapshot.json'),'utf8'),'original');
 await fs.writeFile(path.join(folder,'operations-status.json'),JSON.stringify(value.status));await fs.writeFile(path.join(root,'data/public-price-snapshot.json'),JSON.stringify(snapshot));const result=await preparePublication({root,now});assert.deepEqual(result.files,PUBLISH_FILES);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('a concurrent newer observation and additional real history survive artifact publication',()=>{
 const value=input(),newer={...observation,price:observation.price+1,checkedAt:new Date(now).toISOString(),availabilityCheckedAt:new Date(now).toISOString(),expiresAt:new Date(now+86400000).toISOString()},currentSnapshot={...snapshot,observations:[newer]},currentHistory={...history,observations:[observation,newer]};
 const files=validatePublication(value,{now,currentSnapshot,currentHistory});assert.equal(files['data/public-price-snapshot.json'].observations[0].price,newer.price);assert.equal(files['data/public-price-history.json'].observations.length,2);
});
test('existing private workspace backup restores independently of build storage, with rollback on a second-store failure',()=>{
 const state={...workspace.blank(),profiles:[{revisionId:'build-a',note:'Synthetic private test note',journal:[],quotes:[]}]},records=retention.blank(),backup=workspace.backupEnvelope(state,records,new Date(now).toISOString()),parsed=workspace.parseBackup(JSON.stringify(backup));
 const values=new Map([['pcp-build-revisions-v1','unchanged original revisions']]),store={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 assert.equal(workspace.commitStores(store,parsed.workspace,parsed.retention).ok,true);assert.deepEqual(workspace.loadState(store).state,state);assert.equal(values.get('pcp-build-revisions-v1'),'unchanged original revisions');
 const before=new Map(values);let failed=false;store.setItem=(key,value)=>{if(key===retention.KEY&&!failed){failed=true;throw Error('quota');}values.set(key,value);};assert.equal(workspace.commitStores(store,workspace.blank(),records).ok,false);assert.deepEqual(values,before);
 const build={parts:{cpu:['cpu-a']},owned:[],name:'Synthetic private note',region:'CA',manualItems:[{name:'Private warranty reference'}]};const link=rules.buildURL(build,'https://www.pcpartperformance.com');assert(!link.includes('Synthetic'));assert(!link.includes('warranty'));
});
test('workflow separates read-only collection from fixed-file write publication and pins every action',async()=>{
 const workflow=await fs.readFile(path.join(ROOT,'.github/workflows/daily-public-prices.yml'),'utf8');assert.match(workflow,/permissions:\s*\n  contents: read/);assert.match(workflow,/persist-credentials: false/);assert.match(workflow,/publish-data:[\s\S]*permissions:\s*\n      contents: write/);assert.doesNotMatch(workflow,/pull_request_target|secrets\.|continue-on-error/);for(const match of workflow.matchAll(/uses: (\S+)/g))assert.match(match[1],/^[\w-]+\/[\w-]+@[a-f0-9]{40}$/);assert.match(workflow,/node scripts\/total-operations-publish.mjs/);assert.match(workflow,/retention-days: 30/);assert.match(workflow,/path: \.operations-run\/\s*\n\s+include-hidden-files: true\s*\n\s+if-no-files-found: error/,'The fixed hidden report directory must be uploaded; a missing artifact must fail at collection.');
});
