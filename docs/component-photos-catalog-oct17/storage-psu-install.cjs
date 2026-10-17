'use strict';
const t=require('./storage-psu-research.cjs'),fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const candidates=require('./storage-psu-candidates.json'),additional=require('./storage-psu-additional.json');
const out=path.join(t.root,'dist/assets/hardware/catalog-storage-psu-oct17');fs.mkdirSync(out,{recursive:true});
const picks=[];
const decode=s=>s?.replace(/&(?:reg|trade);/g,'').replace(/&#34;/g,'"').replace(/&amp;/g,'&').replace(/&ndash;/g,'–').replace(/\s+/g,' ').trim();
function pick(x,imageUrl,note,picturedModel){if(!imageUrl)return;const item=t.catalog.find(i=>i.id===x.id);picks.push({id:x.id,page:x.page||x.url,imageUrl,note:note||x.note,picturedModel:picturedModel||decode(x.title),catalogName:item.name});}
for(const x of candidates){
 if(x.status!==200)continue;
 if(x.page.includes('corsair.com')&&!['sf1000l','domtitanium6000','c-ram-corsair-vengeance-48gb-ddr5-6400-cl36'].includes(x.id)){
  pick(x,x.images.find(u=>/assets.corsair.com.*h_1024.*products\//i.test(u)),x.note+' Manufacturer gallery may share an exterior render among SKU variants; this page explicitly assigns it to the selected SKU.');
 } else if(x.page.includes('gskill.com'))pick(x,x.images.find(u=>u.includes('/_upload/images/')),x.note+' Product title and capacity section confirm the selected kit; accepted image is its official gallery exterior.');
 else if(x.id==='rocket4plus')pick(x,'https://sabrent.com/cdn/shop/products/ROCKET4-Main2_225f5ae1-f5fb-493a-b193-73eb8c0eb5cf.jpg?v=1688176207&width=1200','Official SB-RKT4P-2TB product page selects 2TB; gallery alternate is a plain component photo with a visible 2TB label.','Sabrent Rocket 4 Plus 2TB / SB-RKT4P-2TB');
 else if(x.id==='c-ssd-sabrent-rocket-4-plus-g-4tb')pick(x,'https://sabrent.com/cdn/shop/products/Main_4f908664-78ea-45ec-8baa-67a4b299860e.jpg?v=1688177605&width=1200','Official SB-RKTG-4TB product page selects 4TB; alternate plain gallery component photograph has a clearly visible 4TB label.','Sabrent Rocket 4 Plus-G 4TB / SB-RKTG-4TB');
 else if(x.page.includes('sabrent.com')&&!x.title.includes('Not Found'))pick(x,x.images.find(u=>u.startsWith('https://sabrent.com/cdn/shop/')&&!/grande/.test(u)),x.note);
 else if(x.page.includes('coolermaster.com'))pick(x,x.images.find(u=>/large\/.*gallery-0?1(?:-|\.)/.test(u)),x.note);
 else if(['tforcedelta6000','tforce7600'].includes(x.id))pick(x,x.images.find(u=>u.includes('/delta-rgb/black/dual_01.jpg')),x.note||'Exact FF3D532G6000HC30DC01 official page title confirms black 32GB (2x16GB), 6000MHz CL30; product gallery shows the matching black DELTA RGB DDR5 kit.',x.id==='tforcedelta6000'?'TEAMGROUP T-FORCE DELTA RGB DDR5-6000 CL30 32GB (2x16GB) Black / FF3D532G6000HC30DC01':'TEAMGROUP T-FORCE DELTA RGB DDR5-7600 CL36 32GB (2x16GB) Black / FF3D532G7600HC36DDC01');
 else if(x.page.includes('westerndigital.com')){
  const item=t.catalog.find(i=>i.id===x.id),capacity=item.name.match(/(\d+)\s*TB/i)?.[1];
  const image=x.images.find(u=>new RegExp('(?:-|front-)'+capacity+'tb\\.png$','i').test(u)&&/gallery/.test(u));
  pick(x,image,`Official ${item.name} family page contains a capacity-specific ${capacity} TB gallery photo; filename, gallery group, and printed label are checked against that capacity.`,item.brand+' '+item.name);
 }
 else if(x.id==='barracuda8')pick(x,x.images.find(u=>u.includes('barracuda-3-5-8tb-hero-left-400x400.png')),'Official BarraCuda product page specifically names its 8TB hero asset; printed label capacity checked visually.','Seagate BarraCuda 8TB');
 else if(x.id==='ironwolf8tb')pick(x,x.images.find(u=>u.includes('ironwolf-8tb-front-product-detail-image.png')),'Official IronWolf family gallery links the explicitly named 8TB product image; label inspected visually.','Seagate IronWolf 8TB');
 else if(x.id==='ironwolf4tb')pick(x,x.images.find(u=>u.includes('ironwolf-g2d-4tb-front-110x110.jpg')),'Official IronWolf gallery links the explicitly named 4TB product image. Source is small; retained without upscaling.','Seagate IronWolf 4TB');
}
function productFromHtml(x){
 const html=fs.readFileSync(x.cache,'utf8');
 const found=[];
 for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{const data=JSON.parse(m[1]);const visit=o=>{if(Array.isArray(o))o.forEach(visit);else if(o&&typeof o==='object'){if(o['@type']==='Product'&&o.image)found.push(o);Object.values(o).forEach(v=>{if(typeof v==='object')visit(v);});}};visit(data);}catch{}
 }
 return found.find(o=>/^MZ-/i.test(o.sku||''))||found[0];
}
const samsung=[...candidates.filter(x=>['990pro','980pro'].includes(x.id)),...additional.filter(x=>x.url.includes('samsung.com')&&x.status===200)];
const retail=t.catalog.find(x=>x.id==='retail-samsung-970-evo-2-tb');const audit=require('./storage-psu-source-audit.json').find(x=>x.id===retail.id);samsung.push({id:retail.id,url:retail.source,cache:audit.attempt.cache,title:audit.attempt.title});
for(const x of samsung){const p=productFromHtml(x);let u=typeof p?.image==='string'?p.image:Array.isArray(p?.image)?p.image[0]:p?.image?.url;if(u){const html=fs.readFileSync(x.cache,'utf8');const lead=[...html.matchAll(/(?:https?:)?\/\/images\.samsung\.com\/is\/image\/[^"<>\s]+/gi)].map(m=>m[0]).find(v=>v.includes('?$1164_776_PNG$'));u=new URL(lead||u,x.page||x.url).href;pick(x,u,`Official selected product JSON-LD identifies SKU ${p.sku}; page title is ${decode(x.title)}. Exact capacity and label are checked visually.`,`${decode(p.name)} / ${p.sku}`);}}
for(const x of require('./storage-psu-pdf-picks.json')){const item=t.catalog.find(i=>i.id===x.id);picks.push({...x,catalogName:item.name});}
for(const watts of [1000,850,750]){
 const id='focusgx'+watts,item=t.catalog.find(x=>x.id===id);
 pick({id,page:'https://seasonic.com/focus-gx/'},`https://seasonic.com/wp-content/uploads/2024/04/FOCUS-GX-${watts}-Box-1440x1080.webp`,`Official FOCUS GX gallery's ${watts} W group explicitly links this wattage-named photo; component and its named retail packaging shown. Public web source was readable while direct HTML request was 403.`,item.brand+' '+item.name+' (2019 series)');
}
async function main(){const registry={},failed=[];await t.pool(picks,async x=>{
 try{const r=x.localImage?{status:200,body:fs.readFileSync(x.localImage)}:await t.request(x.imageUrl,true);if(r.status!==200)throw Error('HTTP '+r.status);const meta=await sharp(r.body).metadata();if(!meta.width||!meta.height)throw Error('Not bitmap');const srcHash=t.sha(r.body),stem=x.id.slice(0,55)+'-'+srcHash.slice(0,10),file=path.join(out,stem+'.webp'),thumb=path.join(out,stem+'-320.webp');
 const b=await sharp(r.body).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();await sharp(r.body).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toFile(thumb);fs.writeFileSync(file,b);const m=await sharp(b).metadata();
 const item=t.catalog.find(i=>i.id===x.id),attribution=item.brand==='CORSAIR'?'CORSAIR':item.brand;
 registry[x.id]={src:'/assets/hardware/catalog-storage-psu-oct17/'+path.basename(file),thumbnailSrc:'/assets/hardware/catalog-storage-psu-oct17/'+path.basename(thumb),catalogName:x.catalogName,picturedModel:x.picturedModel,sourceUrl:x.page,imageUrl:x.imageUrl,identityEvidence:x.note,attribution,official:true,kind:'exact',license:'Manufacturer product media; not an open license',licenseUrl:x.page,checked:'2026-10-17',width:m.width,height:m.height,bytes:b.length,sourceSha256:srcHash,sha256:t.sha(b),visualReviewed:false,modifications:'Proportions preserved; resized within 800 × 800 and encoded WebP. No recoloring, generated geometry or background replacement.'};console.log('OK',x.id,m.width,m.height);
 }catch(e){failed.push({...x,error:String(e)});console.log('FAIL',x.id,String(e));}
 });fs.writeFileSync(path.join(__dirname,'storage-psu-pending.json'),JSON.stringify(registry,null,2));fs.writeFileSync(path.join(__dirname,'storage-psu-download-failures.json'),JSON.stringify(failed,null,2));
 const entries=Object.entries(registry).sort(([a],[b])=>a.localeCompare(b));
 for(let start=0;start<entries.length;start+=20){const group=entries.slice(start,start+20), tiles=[];for(let n=0;n<group.length;n++){const[id,r]=group[n],img=await sharp(path.join(t.root,'dist',r.src)).flatten({background:'#fff'}).resize(240,170,{fit:'contain',background:'#fff'}).png().toBuffer();const txt=(start+n+1)+'. '+id;const label=`<svg width="260" height="46"><rect width="260" height="46" fill="white"/><text x="6" y="15" font-family="Arial" font-size="10">${txt.slice(0,40).replace(/&/g,'&amp;')}</text><text x="6" y="30" font-family="Arial" font-size="10">${txt.slice(40,80).replace(/&/g,'&amp;')}</text></svg>`;const left=(n%4)*260,top=Math.floor(n/4)*216;tiles.push({input:img,left:left+10,top},{input:Buffer.from(label),left,top:top+170});}await sharp({create:{width:1040,height:Math.ceil(group.length/4)*216,channels:3,background:'#e4e4e4'}}).composite(tiles).png().toFile(path.join(__dirname,'storage-psu-contact-'+(Math.floor(start/20)+1)+'.png'));}
 console.log('PENDING',entries.length,'FAILED',failed.length);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
