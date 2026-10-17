'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function audit(root='dist'){
 const inline=new Map(),handlers=[],scripts=new Set(),frames=new Set(),links=new Set();let pages=0;
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.name.endsWith('.html')){
  pages++;const html=fs.readFileSync(file,'utf8');
  for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)){
   const src=m[1].match(/\bsrc=["']([^"']+)/i);if(src)scripts.add(src[1]);
   else if(m[2].trim()&&!/application\/(?:ld\+)?json/i.test(m[1]))inline.set(m[2],(inline.get(m[2])||0)+1);
  }
  if(/\son(?:click|input|change|error|load|submit|focus)=["']/i.test(html))handlers.push(path.relative(root,file).replaceAll('\\','/'));
  for(const m of html.matchAll(/<iframe[^>]+src=["']([^"']+)/gi))frames.add(m[1]);
  for(const m of html.matchAll(/<link[^>]+href=["'](https:[^"']+)/gi))links.add(m[1]);
 }}}
 walk(root);return{pages,inlineExecutableCount:inline.size,inlineScripts:[...inline].map(([code,count])=>({start:code.slice(0,300),hash:'sha256-'+crypto.createHash('sha256').update(code).digest('base64'),count})),handlerPages:handlers,externalScripts:[...scripts].filter(x=>/^https?:/.test(x)),frames:[...frames],externalLinks:[...links].filter(x=>!x.includes('pcpartperformance.com')).slice(0,40)};
}
if(require.main===module){const report={checkedAt:new Date().toISOString(),...audit()};fs.mkdirSync('docs/master-completion/qa',{recursive:true});fs.writeFileSync('docs/master-completion/qa/resource-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
module.exports={audit};
