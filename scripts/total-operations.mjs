import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import dns from 'node:dns/promises';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {SOURCES,BLOCKERS} from './total-operations-sources.mjs';
import {PUBLIC_SNAPSHOT_TARGETS,validatePublicPriceSnapshot} from './public-price-snapshot.mjs';
import {collectDailyPublicPrices} from './public-price-daily.mjs';
import {appendPriceHistory,validatePriceHistory} from './completion-price-history.mjs';

export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const LIMITS=Object.freeze({bytes:1024*1024,timeoutMs:12000,redirects:2,retries:1,sources:12,queue:200,candidatesPerSource:12,stateBytes:512*1024});
const registry=new Map(SOURCES.map(source=>[source.id,source]));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const fail=code=>{throw Object.assign(new Error(code),{code});};
const safeCode=error=>/^[a-z0-9_]{1,80}$/.test(error?.code||'')?error.code:'source_read_failed';
const date=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):null;
const clean=value=>String(value).replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_match,number)=>{const code=number[0].toLowerCase()==='x'?parseInt(number.slice(1),16):Number(number);return code>0&&code<=0x10ffff?String.fromCodePoint(code):' ';}).replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,m=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[m])).replace(/<[^>]*>/g,' ').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();

export function isPublicAddress(address){
 if(net.isIP(address)===4){const [a,b,c]=address.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&[0,168].includes(b)||a===100&&b>=64&&b<=127||a===198&&[18,19,51].includes(b)||a===203&&b===0&&c===113);}
 // Only global-unicast IPv6; reject mapped IPv4, loopback, ULA, link-local,
 // multicast, NAT64, documentation and transition ranges rather than guessing.
 if(net.isIP(address)===6){const words=address.toLowerCase().split(':'),first=parseInt(words[0],16),second=parseInt(words[1]||'0',16);return first>=0x2000&&first<=0x3fff&&first!==0x2002&&!(first===0x2001&&(second<=0x1ff||second===0xdb8));}
 return false;
}
export function sourceURL(source,input=source.url){
 if(registry.get(source?.id)!==source)fail('source_not_registered');
 let url;try{url=new URL(input);}catch{fail('source_url_invalid');}
 if(url.protocol!=='https:'||url.hostname!==source.host||url.port||url.username||url.password||url.hash||url.href.length>1600||net.isIP(url.hostname))fail('source_url_not_allowed');
 return url;
}
export async function publicDNS(host,{lookup=dns.lookup}={}){
 let timer;const addresses=await Promise.race([lookup(host,{all:true,verbatim:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('source_dns_timeout'),{code:'source_dns_timeout'})),LIMITS.timeoutMs);})]).finally(()=>clearTimeout(timer));
 if(!addresses.length||addresses.length>32||addresses.some(row=>!isPublicAddress(row.address)))fail('source_dns_not_public');
 return addresses[0];
}
export async function secureTransport(url,{lookup=dns.lookup,accept='document'}={}){
 if(!['document','github-json'].includes(accept))fail('source_accept_invalid');
 const selected=await publicDNS(url.hostname,{lookup});
 return new Promise((resolve,reject)=>{
  const request=https.request(url,{method:'GET',agent:false,lookup(_host,options,callback){if(options?.all)callback(null,[selected]);else callback(null,selected.address,selected.family);},signal:AbortSignal.timeout(LIMITS.timeoutMs),headers:{'User-Agent':'PCPartPerformance-Maintenance/1.0 (+https://www.pcpartperformance.com/contact/)','Accept':accept==='github-json'?'application/vnd.github+json':'text/html, application/rss+xml, application/xml;q=0.9','Accept-Encoding':'identity'}},response=>{
   const status=response.statusCode||0,headers=new Headers(Object.entries(response.headers).filter(([,value])=>value!==undefined).map(([key,value])=>[key,Array.isArray(value)?value.join(', '):String(value)]));
   if(status!==200){response.resume();resolve({status,headers,body:''});return;}
   if(Number(headers.get('content-length'))>LIMITS.bytes){response.destroy();reject(Object.assign(new Error('source_oversize'),{code:'source_oversize'}));return;}
   const chunks=[];let bytes=0;response.on('data',chunk=>{bytes+=chunk.length;if(bytes>LIMITS.bytes)response.destroy(Object.assign(new Error('source_oversize'),{code:'source_oversize'}));else chunks.push(chunk);});
   response.once('end',()=>resolve({status,headers,body:Buffer.concat(chunks).toString('utf8')}));response.once('error',reject);
  });
  request.once('error',reject);request.end();
 });
}
export async function readSource(source,{transport=secureTransport,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 let url=sourceURL(source),requests=0;
 for(let redirect=0;redirect<=LIMITS.redirects;redirect++){
  let response;
  for(let attempt=0;attempt<=LIMITS.retries;attempt++){
   requests++;
   try{response=await transport(url);}
   catch(error){if(attempt===LIMITS.retries||['source_dns_not_public','source_oversize'].includes(error.code))throw error;await sleep(350);continue;}
   if((response.status===429||response.status>=500)&&attempt<LIMITS.retries){await sleep(350);continue;}break;
  }
  if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');if(!location)fail('source_redirect_invalid');url=sourceURL(source,new URL(location,url).href);continue;}
  if(response.status!==200)fail(response.status===403||response.status===401?'source_access_denied':'source_http_'+response.status);
  const contentType=(response.headers.get('content-type')||'').toLowerCase();
  // This inspected Google feed currently sends the literal Content-Type "None".
  // Only this registered RSS source may use the narrow XML/RSS fallback. HTML
  // and arbitrary missing-type responses still fail closed.
  const typed=/^(?:text\/html|application\/(?:xhtml\+xml|rss\+xml|xml)|text\/xml)(?:;|$)/i.test(contentType);
  const inspectedFeedFallback=source.id==='google-documentation'&&['','none'].includes(contentType)&&/^\s*(?:<\?xml[^>]*\?>\s*)?<rss\s+version=["']2\.0["']/i.test(response.body);
  if(!typed&&!inspectedFeedFallback)fail('source_content_type');
  if(typeof response.body!=='string'||Buffer.byteLength(response.body)>LIMITS.bytes)fail('source_oversize');
  if(/<!ENTITY\b|<!DOCTYPE[^>]*\bSYSTEM\b/i.test(response.body))fail('source_external_entity');
  return {body:response.body,bytes:Buffer.byteLength(response.body),finalURL:url.href,requests,fingerprint:hash(clean(response.body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'')).slice(0,LIMITS.bytes))};
 }
 fail('source_redirect_limit');
}
function candidateURL(source,input){
 try{const url=sourceURL(source,new URL(input.replace(/&amp;/g,'&'),source.url).href);if(url.search||url.href===source.url||!source.paths.some(prefix=>url.pathname.startsWith(prefix)))return null;return url.href;}catch{return null;}
}
export function discoverCandidates(source,body,now){
 const found=new Map(),add=(title,input,published=null)=>{
  title=clean(title);const url=candidateURL(source,input);if(!url||title.length<12||title.length>220||/^(?:read (?:more|press release)|learn more|accessibility help)$/i.test(title))return;
  const sourceTime=date(published);if(sourceTime!==null&&(sourceTime>now||now-sourceTime>30*86400000))return;
  found.set(url,{id:hash(source.id+'|'+url).slice(0,24),sourceId:source.id,publisher:source.publisher,title,url,kind:source.kind,discoveredAt:new Date(now).toISOString(),sourcePublishedAt:sourceTime===null?null:new Date(sourceTime).toISOString(),evidence:'primary-index-lead-needs-original-source-review',status:'needs_editorial_review',published:false,reason:source.reason,relatedRoutes:source.related,relatedProducts:[],suggestedVisual:'Use an original explanatory diagram only after the original source establishes the relevant technical facts.'});
 };
 if(source.format==='rss'){
  for(const match of body.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){const item=match[1],field=name=>item.match(new RegExp('<'+name+'\\b[^>]*>([\\s\\S]*?)<\\/'+name+'>','i'))?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g,'');add(field('title')||'',field('link')||'',field('pubDate')||null);}
 }else for(const match of body.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))add(match[2],match[1]);
 return [...found.values()].slice(0,LIMITS.candidatesPerSource);
}
export function validateSourceState(raw,{now=Date.now()}={}){
 if(raw===null||raw===undefined)return {schema:1,sources:{}};
 if(raw.schema!==1||!raw.sources||Array.isArray(raw.sources)||Object.keys(raw.sources).length>SOURCES.length)fail('state_invalid');
 const sources={};
 for(const [id,row] of Object.entries(raw.sources)){
  if(!registry.has(id)||!row||!/^([a-f0-9]{64})$/.test(row.fingerprint)||date(row.firstObservedAt)===null||date(row.lastSuccessAt)===null||date(row.lastSuccessAt)>now||date(row.firstObservedAt)>date(row.lastSuccessAt))fail('state_invalid');
  sources[id]={fingerprint:row.fingerprint,firstObservedAt:row.firstObservedAt,lastSuccessAt:row.lastSuccessAt};
 }
 return {schema:1,sources};
}
export function validateQueue(raw,{now=Date.now()}={}){
 if(raw===null||raw===undefined)return [];
 if(!Array.isArray(raw)||raw.length>LIMITS.queue)fail('queue_invalid');
 return raw.map(row=>{
  const source=registry.get(row?.sourceId);if(!source||row.status!=='needs_editorial_review'||row.published!==false||date(row.discoveredAt)===null||date(row.discoveredAt)>now||!candidateURL(source,row.url)||row.id!==hash(source.id+'|'+row.url).slice(0,24)||typeof row.title!=='string'||clean(row.title)!==row.title||row.title.length<12||row.title.length>220)fail('queue_invalid');
  return {id:row.id,sourceId:source.id,publisher:source.publisher,title:row.title,url:row.url,kind:source.kind,discoveredAt:row.discoveredAt,sourcePublishedAt:date(row.sourcePublishedAt)!==null&&date(row.sourcePublishedAt)<=now?row.sourcePublishedAt:null,evidence:'primary-index-lead-needs-original-source-review',status:'needs_editorial_review',published:false,reason:source.reason,relatedRoutes:source.related,relatedProducts:[],suggestedVisual:'Use an original explanatory diagram only after the original source establishes the relevant technical facts.'};
 });
}
export function auditCatalog(rows,{exists=()=>true}={}){
 if(!Array.isArray(rows)||rows.length>100000)fail('catalog_invalid');
 const counts={},seen=new Set(),issues=[];
 for(const row of rows){
  if(!row||typeof row.id!=='string'||!/^[A-Za-z0-9_-]{1,120}$/.test(row.id)||typeof row.name!=='string'||!row.name.trim()||typeof row.cat!=='string')issues.push({id:row?.id||null,code:'catalog_identity_invalid'});
  else {if(seen.has(row.id))issues.push({id:row.id,code:'catalog_duplicate_id'});seen.add(row.id);counts[row.cat]=(counts[row.cat]||0)+1;}
  if(typeof row?.image==='string'&&row.image.startsWith('/assets/')&&!exists(row.image))issues.push({id:row.id,code:'catalog_image_missing'});
 }
 return {records:rows.length,counts,issues,provenance:'Identity/image-path audit of the existing generated shopping catalog; not verification of every underlying specification or SKU.'};
}
export function auditPrices(snapshot,history,{now=Date.now()}={}){
 const current=validatePublicPriceSnapshot(snapshot,{now}),past=validatePriceHistory(history,{now});
 const expired=current.rejected.filter(row=>row.issues.includes('observation_expired')).length;
 return {registeredListings:PUBLIC_SNAPSHOT_TARGETS.length,registeredProducts:new Set(PUBLIC_SNAPSHOT_TARGETS.map(row=>row.productId)).size,merchants:[...new Set(PUBLIC_SNAPSHOT_TARGETS.map(row=>row.merchantId))],currentObservations:current.observations.length,currentNewInStock:current.observations.filter(row=>row.condition==='new'&&row.inStock===true).length,expiredObservations:expired,invalidObservations:current.rejected.length-expired,envelopeValid:current.envelopeValid,historyValid:past.valid,historyObservations:past.observations.length,generatedAt:current.generatedAt,policy:'At most 24-hour exact-listing observations; missing/expired offers never become current prices. Tax/shipping excluded.'};
}
export async function readJSON(file,fallback=null,max=4*1024*1024){try{const raw=await fs.readFile(file);if(raw.length>max)fail('file_oversize');return JSON.parse(raw.toString('utf8'));}catch(error){if(error.code==='ENOENT')return fallback;throw error;}}
export async function atomicJSON(file,value){const destination=path.resolve(file),directory=path.dirname(destination);await fs.mkdir(directory,{recursive:true});const temporary=path.join(directory,'.operations-'+crypto.randomUUID()+'.tmp');try{await fs.writeFile(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o644});await fs.rename(temporary,destination);}finally{await fs.unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});}}
export async function runOperations({root=ROOT,output=path.join(root,'docs/total-refinement/operations'),online=false,collectPrices=false,clock=Date.now,transport=secureTransport,sleep}={}){
 const started=clock();if(!Number.isFinite(started)||collectPrices&&!online)fail('run_options_invalid');
 const state=validateSourceState(await readJSON(path.join(root,'data/operations-source-state.json')),{now:started});
 const previous=validateQueue(await readJSON(path.join(root,'data/operations-review-queue.json')),{now:started});
 let snapshot=await readJSON(path.join(root,'data/public-price-snapshot.json')),history=await readJSON(path.join(root,'data/public-price-history.json'));
 let collection=null;
 if(collectPrices){snapshot=await collectDailyPublicPrices({previous:snapshot,clock});history=appendPriceHistory(history,snapshot,{now:clock()});collection=snapshot.collection;}
 const catalog=await readJSON(path.join(root,'dist/shopping-catalog.json'),[]),catalogFiles=new Set();
 for(const row of catalog)if(typeof row.image==='string'&&row.image.startsWith('/assets/'))try{await fs.access(path.join(root,'dist',row.image));catalogFiles.add(row.image);}catch{}
 const catalogAudit=auditCatalog(catalog,{exists:relative=>catalogFiles.has(relative)}),priceAudit=auditPrices(snapshot,history,{now:clock()});
 const outcomes=[],candidates=[];
 for(const source of SOURCES){
  if(!online){outcomes.push({id:source.id,status:'not_requested_offline',requests:0});continue;}
  try{const result=await readSource(source,{transport,sleep}),at=new Date(clock()).toISOString(),old=state.sources[source.id];state.sources[source.id]={fingerprint:result.fingerprint,firstObservedAt:old?.firstObservedAt||at,lastSuccessAt:at};outcomes.push({id:source.id,status:!old?'initial_snapshot':old.fingerprint===result.fingerprint?'unchanged':'changed_needs_review',bytes:result.bytes,requests:result.requests,lastSuccessAt:at});candidates.push(...discoverCandidates(source,result.body,clock()));}
  catch(error){outcomes.push({id:source.id,status:'unavailable',error:safeCode(error),lastSuccessAt:state.sources[source.id]?.lastSuccessAt||null});}
 }
 const queue=new Map(previous.map(row=>[row.id,row]));for(const row of candidates)if(!queue.has(row.id))queue.set(row.id,row);
 const proposals=[...queue.values()].sort((a,b)=>Date.parse(b.discoveredAt)-Date.parse(a.discoveredAt)).slice(0,LIMITS.queue),completed=clock();
 const failures=outcomes.filter(row=>row.status==='unavailable'),status=catalogAudit.issues.length||!priceAudit.envelopeValid||!priceAudit.historyValid||priceAudit.invalidObservations?'failed_integrity':failures.length||collectPrices&&(!collection?.refreshed||collection.failed)||priceAudit.expiredObservations?'degraded':'completed';
 const listingRuns=collectPrices?(snapshot.runs||[]).map(row=>({productId:row.productId,merchantId:row.merchantId,region:row.region,state:row.state,...(row.errorCode?{errorCode:row.errorCode}:{}),attemptedAt:row.attemptedAt})):[];
 const report={schema:1,startedAt:new Date(started).toISOString(),completedAt:new Date(completed).toISOString(),mode:online?'bounded-network':'offline-audit',status,catalog:catalogAudit,prices:priceAudit,collection,listingRuns,sources:{requested:online?SOURCES.length:0,successful:outcomes.filter(row=>['initial_snapshot','unchanged','changed_needs_review'].includes(row.status)).length,failed:failures.length,outcomes},review:{queued:proposals.length,newCandidates:proposals.filter(row=>!previous.some(old=>old.id===row.id)).length,articlesPublished:0,catalogRecordsPublished:0,publicationDatesChanged:0},deployment:{attempted:false,verified:false},blockers:BLOCKERS,limits:LIMITS,scope:'Operational observations and review proposals, not a complete news/game feed, source-content license, human editorial check, security certification or production deployment.'};
 await atomicJSON(path.join(output,'last-run.json'),report);await atomicJSON(path.join(output,'source-state.json'),state);await atomicJSON(path.join(output,'review-queue.json'),proposals);
 if(collectPrices){await atomicJSON(path.join(output,'public-price-snapshot.json'),snapshot);await atomicJSON(path.join(output,'public-price-history.json'),history);}
 const previousStatus=await readJSON(path.join(root,'data/operations-status.json'));
 const statusRecord={schema:1,lastAttemptAt:report.completedAt,lastSuccessfulRunAt:status==='completed'?report.completedAt:previousStatus?.lastSuccessfulRunAt||null,lastFailedRunAt:status!=='completed'?report.completedAt:previousStatus?.lastFailedRunAt||null,status,catalogRecords:catalogAudit.records,offersUpdated:collection?.refreshed||0,currentObservations:priceAudit.currentObservations,invalidRecords:catalogAudit.issues.length+priceAudit.invalidObservations,retailerFailures:collection?.failed||0,sourceFailures:failures.length,reviewQueue:proposals.length,deploymentVerified:false};
 await atomicJSON(path.join(output,'operations-status.json'),statusRecord);
 const summary=`# Daily operations\n\nRun: ${report.completedAt}\nStatus: **${status}** (${report.mode})\n\n- Catalog identities: ${catalogAudit.records}; issues: ${catalogAudit.issues.length}.\n- Registered exact retail listings: ${priceAudit.registeredListings}; current observations: ${priceAudit.currentObservations}; expired: ${priceAudit.expiredObservations}.\n- Retail checks: ${collection?.refreshed||0} refreshed, ${collection?.failed||0} failed or retained without a successful refresh.\n- Source checks: ${report.sources.successful} successful, ${failures.length} unavailable.\n- Review queue: ${proposals.length}; new leads: ${report.review.newCandidates}.\n- Articles published: 0. Deployment attempted: no.\n\nA changed index is a review lead, not a verified hardware event. Source failures are retained as failures; no challenge bypass or fabricated replacement.\n`;
 await fs.writeFile(path.join(output,'SUMMARY.md'),summary);
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);if(args.some(arg=>!['--online','--collect-prices','--ci-output'].includes(arg)))throw Error('Use --online, optional --collect-prices and --ci-output only; arbitrary URLs and output paths are not accepted.');
 const result=await runOperations({online:args.includes('--online'),collectPrices:args.includes('--collect-prices'),...(args.includes('--ci-output')?{output:path.join(ROOT,'.operations-run')}:{})});console.log(JSON.stringify({status:result.status,mode:result.mode,catalogRecords:result.catalog.records,prices:result.prices,sources:result.sources,review:result.review},null,2));if(result.status==='failed_integrity')process.exitCode=1;
}
