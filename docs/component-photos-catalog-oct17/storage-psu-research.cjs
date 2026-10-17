'use strict';
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'), cache=path.join(__dirname,'storage-psu-research');
fs.mkdirSync(cache,{recursive:true});
const s={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/builder-catalog.js'),'utf8'),s);
const catalog=s.window.PCP_BUILDER_CATALOG.filter(x=>['ram','ssd','hdd','psu'].includes(x.cat));
const images=JSON.parse(fs.readFileSync(path.join(root,'dist/images.json'),'utf8'));
const prior=JSON.parse(fs.readFileSync(path.join(root,'scripts/builder-photo-repairs.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
async function request(url,binary=false){
 const key=sha(url).slice(0,20), f=path.join(cache,key+(binary?'.bin':'.html')),meta=f+'.json';
 if(fs.existsSync(meta)){const m=JSON.parse(fs.readFileSync(meta));if(m.status!==0)return {...m,body:fs.existsSync(f)?fs.readFileSync(f,binary?undefined:'utf8'):''};}
 try{const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),body=Buffer.from(await r.arrayBuffer());const m={url,finalUrl:r.url,status:r.status,type:r.headers.get('content-type'),cache:f};fs.writeFileSync(meta,JSON.stringify(m,null,2));if(r.ok)fs.writeFileSync(f,body);return {...m,body:binary?body:body.toString('utf8')};}
 catch(e){const m={url,status:0,error:String(e)};fs.writeFileSync(meta,JSON.stringify(m,null,2));return {...m,body:''};}
}
function extract(html,base){
 const urls=[...html.matchAll(/(?:https?:)?\/\/[^"'<>\s]+?\.(?:webp|png|jpe?g)(?:\?[^"'<>\s]*)?/gi)].map(m=>m[0].replace(/&amp;/g,'&').replace(/\\u002[Ff]/g,'/'));
 const metas=[...html.matchAll(/<meta\b[^>]+>/gi)].filter(m=>/og:image|twitter:image|description|og:title/i.test(m[0])).map(m=>m[0]);
 const relative=[...html.matchAll(/["'](\/(?:_upload\/images|upload|content\/dam)[^"'<>\s]+?\.(?:png|jpg|webp))["'.?]/gi)].map(m=>new URL(m[1],base).href);
 return {title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],metas:metas.slice(0,10),images:[...new Set([...urls,...relative])].filter(u=>!/(logo|icon|sprite|flag|badge|payment|banner|footer|cart|spacer|separator)/i.test(u))};
}
async function pool(arr,fn,n=5){let i=0;await Promise.all(Array.from({length:n},async()=>{while(i<arr.length){const x=arr[i++];await fn(x);}}));}
async function main(){
 if(process.argv[2]==='initial'){
 const source=[...new Set(catalog.map(x=>x.source).filter(Boolean))], results={};
 await pool(source,async url=>{const r=await request(url);results[url]={...r,body:undefined,...extract(typeof r.body==='string'?r.body:'',url)};console.log(r.status,url);});
 fs.writeFileSync(path.join(__dirname,'storage-psu-source-audit.json'),JSON.stringify(catalog.map(x=>({id:x.id,cat:x.cat,name:x.name,brand:x.brand,sku:x.sku,source:x.source,current:images[x.id],preservedRepair:prior[x.id]||null,attempt:results[x.source]})),null,2));
 }
}
module.exports={root,cache,catalog,images,prior,sha,request,extract,pool};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
