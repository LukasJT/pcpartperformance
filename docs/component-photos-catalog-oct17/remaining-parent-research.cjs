'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve('tmp/remaining-parent-oct17');fs.mkdirSync(root,{recursive:true});
async function download(url){
 const key=crypto.createHash('sha256').update(url).digest('hex').slice(0,20),file=path.join(root,key),meta=file+'.json';
 if(fs.existsSync(meta))return {...JSON.parse(fs.readFileSync(meta)),body:fs.readFileSync(file)};
 const response=await fetch(url,{signal:AbortSignal.timeout(40000)}),body=Buffer.from(await response.arrayBuffer());
 const record={url,finalUrl:response.url,status:response.status,contentType:response.headers.get('content-type'),retryAfter:response.headers.get('retry-after'),checkedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(body).digest('hex')};
 fs.writeFileSync(file,body);fs.writeFileSync(meta,JSON.stringify(record,null,2));return {...record,body};
}
async function main(){for(const url of process.argv.slice(2)){try{const r=await download(url),html=r.body.toString();const images=[...new Set([...html.matchAll(/(?:https?:)?\/\/[^\s"'<>\\]+?\.(?:png|jpg|jpeg|webp)(?:\?[^\s"'<>\\]*)?/gi)].map(x=>x[0]))];console.log(JSON.stringify({...r,body:undefined,images},null,2));if(r.status===429)break;}catch(e){console.log(JSON.stringify({url,error:e.message}));}}}
if(require.main===module)main();module.exports={download,root};
