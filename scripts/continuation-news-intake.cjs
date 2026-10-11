'use strict';
// Review-only source snapshots. This command never writes dist, decisions or publication timestamps.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const editorial=require('./continuation-editorial-content.cjs'),{queueEntry}=require('./news-policy.cjs');
const SOURCE_IDS=['micronFY26','rtxSpark','amdLinux2616','pixelOctober'];
const MAX_BYTES=1024*1024,CACHE_MS=15*60*1000;
const sources=SOURCE_IDS.map(id=>({id,...editorial.sources[id],host:new URL(editorial.sources[id].url).hostname}));
const discoverySources=[{id:'pixel-bulletin-index',publisher:'Android Open Source Project / Google',title:'Pixel Update Bulletins index',url:'https://source.android.com/docs/security/bulletin/pixel',host:'source.android.com',format:'pixel-index',checked:'2026-10-11',scope:'Inspected monthly-bulletin index; discovers candidate original bulletin URLs, not verified release dates.'}];
function bodyFingerprint(html){
  // Only a change signal. Navigation or markup changes can still trigger a false lead.
  const text=String(html).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<!--([\s\S]*?)-->/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  return crypto.createHash('sha256').update(text).digest('hex');
}
async function boundedGet(source,{etag,fetchImpl=fetch}={}){
  let url=source.url;
  const deadline=AbortSignal.timeout(12000);
  for(let attempt=0;attempt<3;attempt++){
    const u=new URL(url);
    if(u.protocol!=='https:'||u.hostname!==source.host||u.username||u.password)throw Error('Source redirect left the inspected HTTPS host');
    const r=await fetchImpl(u.href,{redirect:'manual',signal:deadline,headers:{'User-Agent':'PCPartPerformance-EditorialReview/1.0','Accept':'text/html',...(etag?{'If-None-Match':etag}:{})}});
    if([301,302,303,307,308].includes(r.status)){const location=r.headers.get('location');if(!location)throw Error('Redirect missing location');url=new URL(location,url).href;continue;}
    if(r.status===304)return{unchanged:true};
    if(!r.ok)throw Error('Source HTTP '+r.status);
    if(!/text\/html|application\/xhtml\+xml/i.test(r.headers.get('content-type')||''))throw Error('Unexpected source content type');
    const length=Number(r.headers.get('content-length'));if(length>MAX_BYTES)throw Error('Source exceeds 1 MiB limit');
    const reader=r.body?.getReader();if(!reader)throw Error('Source has no readable body');
    const chunks=[];let size=0;
    try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES)throw Error('Source exceeds 1 MiB limit');chunks.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}
    const body=Buffer.concat(chunks).toString('utf8');
    return{fingerprint:bodyFingerprint(body),body,etag:r.headers.get('etag'),finalUrl:u.href,bytes:size};
  }
  throw Error('Too many redirects');
}
function lead(source,{now,revision,kind}){
  const entry=queueEntry({source:source.id+':'+revision,title:kind==='source_revision'?'Source changed — review '+source.title:source.title,url:source.url},now);
  return{...entry,kind,sourceId:source.id,sourceAnnouncementDate:source.sourcePublishedAt||null,sourceDatePrecision:'day',sourcePublishedAt:null,evidenceInspected:source.checked,revision,affectedArticles:editorial.articles.filter(a=>a.sourceIds.includes(source.id)).map(a=>({id:a.id,route:a.route})),requiresSourceReinspection:kind!=='existing_report_review',proposal:'Review the original source and decide whether to revise the existing article or report a genuinely new event. Do not refresh dates or publish from this signal.'};
}
function discoverPixelBulletins(source,body,now){
  const urls=new Map(),known=new Set(sources.map(s=>s.url));
  for(const match of String(body).matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)){
    let u;try{u=new URL(match[1].replace(/&amp;/g,'&'),source.url);}catch{continue;}
    if(u.protocol!=='https:'||u.hostname!==source.host||u.username||u.password)continue;
    const date=u.pathname.match(/^\/docs\/security\/bulletin\/pixel\/(\d{4})\/(\d{4}-\d{2}-\d{2})$/);
    if(!date||date[1]!==date[2].slice(0,4))continue;
    u.search='';u.hash='';if(known.has(u.href))continue;
    urls.set(u.href,date[2]);
  }
  return[...urls].sort((a,b)=>b[1].localeCompare(a[1])).slice(0,3).map(([url,pathLabel])=>({...queueEntry({source:source.id,title:'Pixel bulletin candidate — '+pathLabel.slice(0,7),url},now),kind:'discovered_source_candidate',sourceId:source.id,sourceAnnouncementDate:null,sourceDatePrecision:'unknown',sourcePublishedAt:null,indexCheckedAt:now,evidenceInspected:null,requiresSourceReinspection:true,affectedArticles:editorial.articles.filter(a=>a.sourceIds.includes('pixelUpdates')||a.sourceIds.includes('pixelOctober')).map(a=>({id:a.id,route:a.route})),proposal:'Open and inspect this original bulletin before reporting it. The URL month is an identifier, not a verified publication date; initial intake can include historical bulletins.'}));
}
async function run({offline=false,stateDir=path.join(__dirname,'../docs/program-2026-10-11/editorial/intake-state'),now=new Date().toISOString(),fetchImpl=fetch}={}){
  if(!Number.isFinite(Date.parse(now)))throw Error('A real observation timestamp is required');
  fs.mkdirSync(stateDir,{recursive:true});
  const queueFile=path.join(stateDir,'queue.json'),cacheFile=path.join(stateDir,'cache.json');
  const read=(file,fallback)=>{if(!fs.existsSync(file))return fallback;if(fs.statSync(file).size>MAX_BYTES)throw Error('Intake state exceeds 1 MiB');return JSON.parse(fs.readFileSync(file,'utf8'));};
  const queue=read(queueFile,[]),cache=read(cacheFile,{}),report=[];
  if(!Array.isArray(queue)||!cache||Array.isArray(cache))throw Error('Invalid intake state schema');
  const known=new Set(queue.map(row=>row.id));
  for(const source of [...sources,...discoverySources]){
    if(offline){
      if(source.format){report.push({source:source.id,status:'offline: discovery index not polled',networkRequest:false});continue;}
      const row=lead(source,{now,revision:'inspected-'+source.checked,kind:'existing_report_review'});
      if(!known.has(row.id)){queue.push(row);known.add(row.id);}
      report.push({source:source.id,status:'offline inspected-source seed',networkRequest:false});continue;
    }
    const old=cache[source.id]||{};
    if(old.checkedAt&&Date.parse(now)-Date.parse(old.checkedAt)>=0&&Date.parse(now)-Date.parse(old.checkedAt)<CACHE_MS){report.push({source:source.id,status:'15-minute cache'});continue;}
    try{
      const result=await boundedGet(source,{etag:old.etag,fetchImpl});
      if(source.format==='pixel-index'&&!result.unchanged){
        for(const row of discoverPixelBulletins(source,result.body,now))if(!known.has(row.id)){queue.push(row);known.add(row.id);}
      }else if(!source.format&&!result.unchanged&&result.fingerprint!==old.fingerprint){
        const row=lead(source,{now,revision:result.fingerprint,kind:old.fingerprint?'source_revision':'initial_snapshot_review'});
        if(!known.has(row.id)){queue.push(row);known.add(row.id);}
      }
      cache[source.id]={...old,...(!result.unchanged?{fingerprint:result.fingerprint,etag:result.etag,finalUrl:result.finalUrl}:{}),checkedAt:now};
      report.push({source:source.id,status:source.format?'discovery index checked':result.unchanged||result.fingerprint===old.fingerprint?'unchanged':'snapshot queued for review'});
    }catch(error){report.push({source:source.id,status:'failed',error:error.message+(error.cause?.code?' ('+error.cause.code+')':'')});}
  }
  const bounded=queue.slice(-500);
  fs.writeFileSync(queueFile,JSON.stringify(bounded,null,2)+'\n');fs.writeFileSync(cacheFile,JSON.stringify(cache,null,2)+'\n');
  const result={checkedAt:now,offline,scope:'Four known original announcement pages plus the inspected Pixel monthly-bulletin discovery index. Other future releases need additional inspected sources; no complete live news feed is claimed.',queued:bounded.length,published:0,approvalsWritten:0,report};
  fs.writeFileSync(path.join(stateDir,'last-run.json'),JSON.stringify(result,null,2)+'\n');return result;
}
module.exports={sources,discoverySources,discoverPixelBulletins,bodyFingerprint,boundedGet,lead,run,MAX_BYTES,CACHE_MS};
if(require.main===module)run({offline:process.argv.includes('--offline')}).then(result=>{console.log(JSON.stringify(result,null,2));if(result.report.some(r=>r.status==='failed'))process.exitCode=1;}).catch(error=>{console.error(error.message);process.exitCode=1;});
