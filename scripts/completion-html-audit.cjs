'use strict';
/* Static all-route audit. Real rendered accessibility is verified separately with axe and keyboard use. */
const fs=require('node:fs'),path=require('node:path');
const {policy}=require('./program-routing.cjs');
function audit(root='dist'){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'route-policy.json'),'utf8')),issues=[],titles=new Map(),descriptions=new Map(),counts={pages:0,indexable:0,links:0,images:0};
 const text=value=>String(value||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
 const value=(html,re)=>html.match(re)?.[1]||'';
 for(const [route,row]of Object.entries(manifest.routes)){
  const file=path.join(root,route,route.endsWith('/')?'index.html':'');if(!fs.existsSync(file)){issues.push({route,kind:'manifest_file_missing'});continue;}const html=fs.readFileSync(file,'utf8');counts.pages++;
  const add=(kind,detail)=>issues.push({route,kind,...(detail?{detail}:{} )});
  if(!/<html[^>]+lang="en"/.test(html))add('language_missing');
  if((html.match(/<main(?:\s|>)/g)||[]).length!==1)add('main_landmark_count');
  if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)add('h1_count');
  const canonical=value(html,/<link rel="canonical" href="([^"<>]+)"/);if(canonical!==row.canonical)add('canonical_mismatch',canonical);
  if(!row.noindex&&!row.draft&&route!=='/404.html'){
   counts.indexable++;const title=text(value(html,/<title>([^<]+)<\/title>/)),description=text(value(html,/<meta name="description" content="([^"]+)"/));
   if(!title)add('title_missing');if(!description)add('description_missing');
   for(const [map,item]of [[titles,title],[descriptions,description]]){if(!item)continue;const list=map.get(item)||[];list.push(route);map.set(item,list);}
   if(/<meta name="robots" content="noindex/.test(html))add('index_policy_mismatch');
  }
  for(const m of html.matchAll(/<img\b([^>]*)>/g)){counts.images++;if(!/\balt=/.test(m[1]))add('image_alt_missing',m[0].slice(0,160));if(!/\bwidth=/.test(m[1])||!/\bheight=/.test(m[1]))add('image_dimensions_missing',m[0].slice(0,160));}
  for(const m of html.matchAll(/<a\b[^>]*\bhref="([^"<>]+)"/g)){
   const href=m[1].replaceAll('&amp;','&');if(/^(?:javascript|data|vbscript):/i.test(href))add('unsafe_link_protocol',href.slice(0,120));if(!href.startsWith('/')||href.startsWith('//'))continue;counts.links++;
   const decision=policy('https://www.pcpartperformance.com'+href,manifest);if(decision.status>=400)add('broken_internal_link',href);
  }
 }
 const duplicates=map=>[...map].filter(([,routes])=>routes.length>1).map(([text,routes])=>({text,routes}));
 return{checkedAt:new Date().toISOString(),scope:'All generated manifest HTML: canonical/index policy, main/H1, metadata, intrinsic image attributes and crawlable internal destinations. Does not replace rendered or human accessibility review.',counts,issues,duplicateTitles:duplicates(titles),duplicateDescriptions:duplicates(descriptions)};
}
if(require.main===module){const report=audit();fs.mkdirSync('docs/master-completion/qa',{recursive:true});fs.writeFileSync('docs/master-completion/qa/all-route-html.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({counts:report.counts,issues:report.issues.length,duplicateTitles:report.duplicateTitles.length,duplicateDescriptions:report.duplicateDescriptions.length,firstIssues:report.issues.slice(0,12)}));if(report.issues.length)process.exitCode=1;}
module.exports={audit};
