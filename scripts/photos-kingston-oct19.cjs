'use strict';
// Development-only, fixed reviewed gallery intake. Never runs in the website or scheduled publisher.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),INPUT=path.join(ROOT,'data/photo-intake/2026-10-19/kingston.json'),REGISTRY=path.join(__dirname,'component-photo-total-kingston-oct19.json');
const HASH=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const decode=value=>value.replace(/&amp;/g,'&').replace(/&#47;/g,'/').replace(/&quot;/g,'"');
function parseGallery(html,expected){
 const mpns=[...html.matchAll(/<[^>]+itemprop="mpn"[^>]*>([^<]+)<\/[^>]+>/g)].map(m=>decode(m[1]).trim());
 const canonical=decode(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1]||'');
 const image=decode(html.match(/<img\b[^>]*itemprop="image"[^>]*src="([^"]+)"/i)?.[1]||'');
 const sku=html.match(/<[^>]+itemprop="sku"[^>]*>([^<]+)</)?.[1]?.trim();
 if(mpns[0]!==expected.sku||sku!==expected.retailerSku)throw Error('Exact gallery MPN/retailer SKU does not match '+expected.sku);
 const c=new URL(canonical),i=new URL(image);
 if(c.origin!=='https://www.cdw.com'||c.pathname.split('/').pop()!==sku||i.origin!=='https://webobjects2.cdw.com'||i.pathname!=='/is/image/CDW/'+sku)throw Error('Image or canonical belongs to another listing');
 return {sourceUrl:c.href,imageUrl:i.href,sku,manufacturerPartNumber:mpns[0]};
}
async function fetchBytes(url,limit,fetcher=fetch){
 const allowed=new Set(['www.cdw.com','webobjects2.cdw.com']);let target=new URL(url);
 for(let attempt=0;attempt<3;attempt++){
  if(target.protocol!=='https:'||target.username||target.password||target.port||!allowed.has(target.hostname))throw Error('Unapproved photo origin');
  const response=await fetcher(target,{redirect:'manual',signal:AbortSignal.timeout(30000)});
  if([301,302,303,307,308].includes(response.status)){target=new URL(response.headers.get('location'),target);continue;}
  if(!response.ok)throw Error('HTTP '+response.status);
  if(Number(response.headers.get('content-length'))>limit)throw Error('Source too large');
  const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>limit)throw Error('Source exceeded size limit');chunks.push(Buffer.from(chunk));}
  return {bytes:Buffer.concat(chunks),url:target.href};
 }
 throw Error('Too many redirects');
}
async function collect(){
 const sharp=require(process.env.PCP_SHARP_PATH||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
 const catalog=require('./total-catalog.cjs'),parts=catalog.prepareCatalog(catalog.loadExisting()),byId=new Map(parts.map(p=>[p.id,p]));
 const candidates=JSON.parse(fs.readFileSync(INPUT,'utf8')),registry=fs.existsSync(REGISTRY)?JSON.parse(fs.readFileSync(REGISTRY,'utf8')):{},report=[];
 const assetDir=path.join(ROOT,'dist/assets/hardware/catalog-total-kingston-oct19'),cache=path.join(ROOT,'tmp/photo-coverage-oct19');fs.mkdirSync(assetDir,{recursive:true});fs.mkdirSync(cache,{recursive:true});
 for(const item of candidates){
  try{
   if(registry[item.id]){report.push({id:item.id,status:'retained',visualReviewed:registry[item.id].visualReviewed});continue;}
   const part=byId.get(item.id);if(!part||part.identity?.manufacturerPartNumber!==item.sku||part.brand!=='Kingston')throw Error('Catalog identity mismatch');
   const source=await fetchBytes(item.sourceUrl,3*1024*1024),html=source.bytes.toString('utf8'),gallery=parseGallery(html,item),image=await fetchBytes(gallery.imageUrl,12*1024*1024),meta=await sharp(image.bytes).metadata();
   if(!['png','jpeg','webp','tiff'].includes(meta.format)||meta.width<100||meta.height<100)throw Error('Missing usable photographic source');
   const stem=item.id+'-'+HASH(image.bytes).slice(0,10),full=await sharp(image.bytes).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();
   let thumb;for(const quality of [84,76,68,60,52,44]){thumb=await sharp(image.bytes).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality}).toBuffer();if(thumb.length<=40000)break;}if(thumb.length>40000)throw Error('Thumbnail exceeds budget');
   const fm=await sharp(full).metadata(),tm=await sharp(thumb).metadata();fs.writeFileSync(path.join(assetDir,stem+'.webp'),full);fs.writeFileSync(path.join(assetDir,stem+'-320.webp'),thumb);fs.writeFileSync(path.join(cache,item.id+'.source'),image.bytes);
   registry[item.id]={catalogName:part.name,picturedModel:'Kingston '+item.sku,manufacturerSku:item.sku,kind:'exact',identityScope:'exact-sku-gallery',...gallery,sourceSha256:HASH(image.bytes),sourcePageSha256:HASH(source.bytes),identityEvidence:'Exact selected CDW Mfg # and retailer SKU bind the Product itemprop image to '+item.sku+'. Actual image review is required before publication; no recommendation image is used.',official:false,attribution:'CDW / Kingston product media',license:'Supplier product media; no open license or additional permission grant recorded',licenseUrl:gallery.sourceUrl,rightsStatus:'Copyright retained by the original publisher/manufacturer. Product-gallery attribution is not a claim of an open license.',src:'/assets/hardware/catalog-total-kingston-oct19/'+stem+'.webp',thumbnailSrc:'/assets/hardware/catalog-total-kingston-oct19/'+stem+'-320.webp',sourceWidth:meta.width,sourceHeight:meta.height,width:fm.width,height:fm.height,bytes:full.length,sha256:HASH(full),thumbnailWidth:tm.width,thumbnailHeight:tm.height,thumbnailBytes:thumb.length,thumbnailSha256:HASH(thumb),checked:'2026-10-19',visualReviewed:false,modifications:'Proportions and original background preserved; bounded WebP conversion without enlargement. No generated labels, recoloring or substituted components.'};
   fs.writeFileSync(REGISTRY,JSON.stringify(registry,null,2)+'\n');report.push({id:item.id,status:'downloaded-pending-visual-review',...gallery,width:meta.width,height:meta.height});console.log(item.id+' '+meta.width+'x'+meta.height);
  }catch(error){report.push({id:item.id,status:'held',reason:error.message});console.log(item.id+' HELD '+error.message);}
 }
 fs.mkdirSync(path.join(ROOT,'docs/total-refinement/photos'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs/total-refinement/photos/kingston-download.json'),JSON.stringify({checkedAt:new Date().toISOString(),report},null,2)+'\n');
}
if(require.main===module)collect().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={parseGallery,fetchBytes,collect};
