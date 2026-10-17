'use strict';
const fs=require('fs'),path=require('path');
const DOMAIN='https://www.pcpartperformance.com';
const CURATED={'rtx5060ti16,rtx5070':'/compare/rtx-5070-vs-rtx-5060-ti-16gb/','rtx5070,rx9070':'/compare/rtx-5070-vs-rx-9070/','7800x3d,9800x3d':'/compare/ryzen-7-9800x3d-vs-7800x3d/'};
const STATE_KEYS=new Set(['q','category','era','sort','parts','build','gpu','cpu','game','view','mode','resolution','quality','upscale','fans','owned','locked','plan','region','symptom','budget','display','goal','brand','series','priced']);
function policy(input,manifest,{local=false,staging=false}={}){
 let url;try{url=new URL(input,DOMAIN)}catch{return{status:400,headers:{'X-Robots-Tag':'noindex, follow'}}}
 const headers={},pathname=url.pathname;
 if(url.href.length>12000||/[%](?:00|2f|5c)|\\/i.test(pathname))return{status:400,headers:{'X-Robots-Tag':'noindex, follow'}};
 let destination=manifest.redirects[pathname]||pathname;
 if(!manifest.routes[destination]){
  if(manifest.routes[destination+'/'])destination+='/';
  else if(manifest.routes[destination+'.html'])destination+='.html';
 }
 const ids=new Map(manifest.products.map(p=>[p.id,p.category]));
 if(destination==='/compare/'&&url.searchParams.has('parts')){
  const value=url.searchParams.get('parts'),parts=value.split(',').filter(Boolean);
  if(parts.length<1||parts.length>4||new Set(parts).size!==parts.length||parts.some(id=>!ids.has(id))||new Set(parts.map(id=>ids.get(id))).size!==1)return{status:404,headers:{'X-Robots-Tag':'noindex, follow'}};
  const curated=CURATED[parts.slice().sort().join(',')];if(curated&&manifest.routes[curated]&&url.searchParams.get('mode')!=='interactive')destination=curated;
 }
 const recognized=manifest.routes[destination]||(manifest.assets.includes(destination)?{asset:true}:null);
 const dynamic=[...url.searchParams.keys()].some(k=>STATE_KEYS.has(k)||(!/^utm_[a-z_]+$/.test(k)&&!['gclid','fbclid'].includes(k)));
 if(staging||recognized?.noindex||dynamic||!recognized)headers['X-Robots-Tag']='noindex, follow';
 const changed=destination!==pathname,preferred=!local&&(url.hostname!=='www.pcpartperformance.com'||url.protocol!=='https:');
 if(changed||preferred){let query=url.search;if(destination.startsWith('/compare/')&&destination!=='/compare/'&&url.searchParams.has('parts')){const q=new URLSearchParams(url.search);q.delete('parts');query=q.size?'?'+q.toString():''}return{status:301,headers:{...headers,Location:(local?url.origin:DOMAIN)+destination+query}}}
 return{status:recognized&&destination!=='/404.html'?200:404,headers,route:destination};
}
function buildManifest({root,records,extraRedirects={}}){
 const routes={},redirects={},assets=[];
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.name.endsWith('.html')){const rel='/'+path.relative(root,file).replaceAll('\\','/'),route=rel.replace(/index\.html$/,''),h=fs.readFileSync(file,'utf8');if(h.includes('data-legacy-redirect')){const target=h.match(/<link rel="canonical" href="https:\/\/www\.pcpartperformance\.com([^\"]+)/)?.[1];if(target)redirects[route]=target;continue}routes[route]={noindex:/<meta name="robots" content="noindex/.test(h),draft:h.includes('data-program-draft'),canonical:h.match(/<link rel="canonical" href="([^\"]+)/)?.[1]||DOMAIN+route};if(rel.endsWith('/index.html'))redirects[rel]=route}else assets.push('/'+path.relative(root,file).replaceAll('\\','/'))}}
 walk(root);
 for(const [source,target]of Object.entries(extraRedirects)){
  if(!source.startsWith('/')||source.includes('?')||source.includes('#')||source===target||!routes[target]||routes[source]||redirects[target])throw Error('Invalid reviewed route redirect '+source);
  if(redirects[source]&&redirects[source]!==target)throw Error('Conflicting reviewed route redirect '+source);
  redirects[source]=target;
 }
 for(const [source,target]of Object.entries(redirects))if(source.startsWith('/learn/')&&source.endsWith('.html')){redirects[source.slice(0,-5)]=target;redirects[source.slice(0,-5)+'/']=target}
 const manifest={schema:1,domain:DOMAIN,staging:process.env.PROGRAM_PREVIEW==='1',routes,redirects,assets,products:records.map(p=>({id:p.id,category:p.cat}))};
 fs.writeFileSync(path.join(__dirname,'worker-policy.mjs'),'const DOMAIN='+JSON.stringify(DOMAIN)+';\nconst CURATED='+JSON.stringify(CURATED)+';\nconst STATE_KEYS=new Set('+JSON.stringify([...STATE_KEYS])+');\n'+policy.toString()+'\nexport {policy};\n');
 fs.writeFileSync(path.join(__dirname,'route-manifest.mjs'),'export default '+JSON.stringify(manifest)+';\n');fs.writeFileSync(path.join(root,'route-policy.json'),JSON.stringify(manifest));return manifest;
}
module.exports={policy,buildManifest,DOMAIN,STATE_KEYS,CURATED};
