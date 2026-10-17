'use strict';
// Public manufacturer intake; candidate media remain unpublished until visual review.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const audit=require('../docs/component-photos-catalog-oct17/catalog-audit.json');
const directory=path.resolve('tmp/cpu-board-photos-oct17');fs.mkdirSync(directory,{recursive:true});
const reportFile=path.resolve('docs/component-photos-catalog-oct17/cpu-board-research.json');
const clean=s=>decodeURIComponent(String(s||'')).toLowerCase().replace(/[®™]/g,'').replace(/[^a-z0-9]/g,'');
const brandless=p=>p.name.replace(/^(?:AMD|Intel|ASRock|ASUS|MSI|GIGABYTE|Biostar|Supermicro)\s+/i,'');
const pending=new Map();
async function get(url){
 if(pending.has(url))return pending.get(url);
 const task=(async()=>{const hash=crypto.createHash('sha256').update(url).digest('hex').slice(0,18),metaFile=path.join(directory,hash+'.json'),bodyFile=path.join(directory,hash+'.body');
  if(fs.existsSync(metaFile)&&fs.existsSync(bodyFile))return{...JSON.parse(fs.readFileSync(metaFile)),bytes:fs.readFileSync(bodyFile)};
  const r=await fetch(url,{signal:AbortSignal.timeout(15000)}),bytes=Buffer.from(await r.arrayBuffer()),meta={url,finalUrl:r.url,status:r.status,type:r.headers.get('Content-Type'),checkedAt:new Date().toISOString()};fs.writeFileSync(metaFile,JSON.stringify(meta));fs.writeFileSync(bodyFile,bytes);return{...meta,bytes};})();pending.set(url,task);return task;
}
function imageURLs(html,url){
 const urls=[];for(const tag of html.matchAll(/<meta\b[^>]+>/gi)){const t=tag[0];if(/(?:og:image|twitter:image)/i.test(t)){const content=t.match(/content=["']([^"']+)/i)?.[1];if(content)urls.push(content);}}
 for(const m of html.matchAll(/(?:https?:)?\/\/[^"'<>\s]+?\.(?:png|jpe?g|webp)(?:\?[^"'<>\s]*)?|(?:\/|\.\.\/)(?:content\/dam|mb\/photo|images\/product)[^"'<>\s]+?\.(?:png|jpe?g|webp)/gi))urls.push(m[0]);
 return [...new Set(urls.map(x=>{try{return new URL(x.replace(/&amp;/g,'&').replace(/\\\//g,'/'),url).href;}catch{return null;}}).filter(Boolean))];
}
async function research(part){
 const row={id:part.id,name:part.name,category:part.category,status:'unresolved',attempts:[],candidates:[],previousStatus:part.status};
 if(part.status==='existing-named-image-review'){row.status='existing-image-retained-for-review';return row;}
 try{
  if(part.category==='board'&&/msi/i.test(part.brand)){
   const slug=brandless(part).replace(/\s+/g,'-'),url='https://storage-asset.msi.com/datasheet/mb/global/'+slug.toUpperCase()+'.pdf';const r=await get(url);row.attempts.push({url,status:r.status,finalUrl:r.finalUrl});if(r.status===200&&r.bytes.subarray(0,4).toString()==='%PDF'){const file=path.join(directory,part.id+'.pdf');fs.writeFileSync(file,r.bytes);row.candidates.push({sourceUrl:'https://www.msi.com/Motherboard/'+slug,imageUrl:url,file,kind:'exact-datasheet-needs-text-and-image-review'});row.status='candidate';return row;}
  }
  let r=await get(part.sourceUrl);row.attempts.push({url:part.sourceUrl,status:r.status,finalUrl:r.finalUrl});if(r.status!==200){row.reason='Manufacturer returned HTTP '+r.status;return row;}if(!/html/i.test(r.type)){row.reason='Source is not an exact product image page';return row;}
  let html=r.bytes.toString(),url=r.finalUrl;
  if(part.category==='board'&&/asrock\.com\/mb\/?$/i.test(new URL(url).origin+new URL(url).pathname)){
   const target=clean(brandless(part)),links=[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];const match=links.find(m=>clean(m[2].replace(/<[^>]+>/g,''))===target||clean(m[1]).includes(target+'index'));
   if(match){url=new URL(match[1].replace(/&amp;/g,'&'),url).href;r=await get(url);row.attempts.push({url,status:r.status,finalUrl:r.finalUrl});if(r.status!==200){row.reason='Exact ASRock link failed';return row;}html=r.bytes.toString();url=r.finalUrl;}
  }
  const token=clean(brandless(part)),title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/<[^>]+>/g,'');
  let urls=imageURLs(html,url),modelToken=part.category==='cpu'?brandless(part).match(/(?:\d{4,5}(?:X3D|WX|KS|KF|XT|X|K|F|G|S)?|\d{3}[KFU])/i)?.[0]:brandless(part);
  if(/amd\.com/.test(url)){urls=urls.filter(x=>/\/images\/products\//.test(x)&&modelToken&&clean(x).includes(clean(modelToken)));}
  else if(/asrock\.com/.test(url)){urls=urls.filter(x=>/\/mb\/photo\//i.test(x)&&clean(x).includes(token));}
  else if(/asus\.com/.test(url)){urls=clean(title).includes(token)?urls.filter(x=>/dlcdnwebimgs|dlcdnimgs|P_setting|\/kv\/pd\./i.test(x)):[];}
  else if(/gigabyte\.com/.test(url)){urls=clean(title).includes(token)?urls.filter(x=>/Product\/|FileUpload\/Global\/KeyFeature|gigabyte.*(?:png|jpg)/i.test(x)):[];}
  else if(/intel\.com/.test(url)){urls=urls.filter(x=>modelToken&&clean(x).includes(clean(modelToken))&&!/logo|flag|icon/i.test(x));}
  else urls=clean(title).includes(token)?urls.filter(x=>!/(?:logo|banner|icon|flag|sprite)/i.test(x)):[];
  row.pageTitle=title;row.candidates=urls.slice(0,6).map(imageUrl=>({sourceUrl:url,imageUrl,kind:'candidate-needs-visual-review'}));row.status=row.candidates.length?'candidate':'unresolved';row.reason=row.candidates.length?undefined:'No exact-model image found in returned page';
 }catch(e){row.reason=String(e.message);}
 return row;
}
async function main(){const parts=audit.rows.filter(p=>['cpu','board'].includes(p.category)),rows=[];for(let i=0;i<parts.length;i+=4){const batch=await Promise.allSettled(parts.slice(i,i+4).map(research));for(let k=0;k<batch.length;k++)rows.push(batch[k].status==='fulfilled'?batch[k].value:{id:parts[i+k].id,status:'unresolved',reason:String(batch[k].reason)});fs.writeFileSync(reportFile,JSON.stringify({checkedAt:new Date().toISOString(),rows},null,2)+'\n');console.log(rows.length+'/'+parts.length+' inspected; '+rows.filter(x=>x.status==='candidate').length+' candidates');} }
main().catch(e=>{console.error(e);process.exitCode=1;});
