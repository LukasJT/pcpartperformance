'use strict';
// Fixed, public product-gallery intake; never loaded by the site or daily jobs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),FILE=path.join(__dirname,'component-photo-total-kingston-oct19.json');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function gallery(row){
 if(!row.sku||!row.variants?.length||row.variants.some(sku=>sku!==row.sku))throw Error('Gallery must identify one exact SKU');
 const source=new URL(row.sourceUrl),image=new URL(row.images?.[0]?.src||'');
 if(source.origin!=='https://www.kingstonstore.com.br'||source.pathname!=='/products/'+row.sku.toLowerCase().replaceAll('/','-'))throw Error('Wrong exact product page');
 if(image.origin!=='https://cdn.shopify.com'||!image.pathname.startsWith('/s/files/1/0134/2924/4004/')||row.images[0].width<600||row.images[0].height<100)throw Error('Wrong gallery asset or inadequate original size');
 return {sourceUrl:source.href,imageUrl:image.href};
}
async function bytes(url){
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port||!['cdn.shopify.com','ccimg.canadacomputers.com'].includes(u.hostname))throw Error('Unapproved photo source');
 const r=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('HTTP '+r.status);
 if(Number(r.headers.get('content-length'))>12000000)throw Error('Image too large');let size=0,parts=[];for await(const chunk of r.body){size+=chunk.length;if(size>12000000)throw Error('Image too large');parts.push(Buffer.from(chunk));}return Buffer.concat(parts);
}
function unchangedReview(previous,row,source,sourceHash){return previous?.visualReviewed===true&&previous.manufacturerSku===row.sku&&previous.sourceUrl===source.sourceUrl&&previous.imageUrl===source.imageUrl&&previous.sourceSha256===sourceHash;}
async function collect(){
 const sharp=require(process.env.PCP_SHARP_PATH||'../tools/quality/node_modules/sharp');
 const total=require('./total-catalog.cjs'),parts=total.prepareCatalog(total.loadExisting()),index=new Map(parts.map(p=>[p.id,p]));
 const rows=require('../data/photo-intake/2026-10-19/kingston-store.json'),registry=JSON.parse(fs.readFileSync(FILE,'utf8'));
 const hd={id:'total-ram-kingston-ksm32rd4-64hd',sku:'KSM32RD4/64HD',sourceUrl:'https://www.canadacomputers.com/en/server-memory/281907/kingston-64gb-3200mhz-cl22-ecc-dimm-ksm32rd4-64hd.html',imageUrl:'https://ccimg.canadacomputers.com/Products/800x800/119/281907/47060.jpg',inspected:true};
 for(const row of rows.concat(hd)){
  if(row.status)continue;const part=index.get(row.id);if(!part||part.sku!==row.sku)throw Error('Catalog mismatch '+row.id);
  const source=row===hd?{sourceUrl:hd.sourceUrl,imageUrl:hd.imageUrl}:gallery(row),raw=await bytes(source.imageUrl),meta=await sharp(raw).metadata();
  if(!['jpeg','png','webp'].includes(meta.format)||meta.width<(row===hd?500:600)||meta.height<100)throw Error('Invalid photographic source '+row.id);
  if(unchangedReview(registry[row.id],row,source,hash(raw))){const errors=require('./component-photo-catalog.cjs').validate(parts,{[row.id]:registry[row.id]});if(errors.length)throw Error(errors.join('; '));console.log(row.sku+' retained unchanged reviewed photograph');continue;}
  const full=await sharp(raw).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();
  let thumb;for(const quality of [84,76,68,60]){thumb=await sharp(raw).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality}).toBuffer();if(thumb.length<=40000)break;}if(thumb.length>40000)throw Error('Thumbnail too large');
  const name=row.id+'-'+hash(raw).slice(0,10),dir='/assets/hardware/catalog-total-kingston-oct19/',fm=await sharp(full).metadata(),tm=await sharp(thumb).metadata();
  fs.writeFileSync(path.join(ROOT,'dist',dir,name+'.webp'),full);fs.writeFileSync(path.join(ROOT,'dist',dir,name+'-320.webp'),thumb);
  registry[row.id]={catalogName:part.name,picturedModel:'Kingston '+row.sku,manufacturerSku:row.sku,kind:'exact',identityScope:'exact-sku-gallery',...source,sourceSha256:hash(raw),identityEvidence:row===hd?'Exact selected Canada Computers Part # and Manufacturer Part Number KSM32RD4/64HD bind the 281907 gallery image. Pending visual review.':'KingstonStore selected product JSON has only '+row.sku+' in its SKU variants and assigns this original image to that exact product gallery. The supplier may share exterior photographs across modules; the photograph does not prove unseen chip/die labels. Pending visual review.',official:false,attribution:row===hd?'Canada Computers / Kingston product media':'KingstonStore / Kingston product media',license:'Supplier product media; no open license or additional permission grant recorded',licenseUrl:source.sourceUrl,rightsStatus:'Copyright retained by the original publisher/manufacturer. Gallery attribution is not a claim of an open license.',src:dir+name+'.webp',thumbnailSrc:dir+name+'-320.webp',sourceWidth:meta.width,sourceHeight:meta.height,width:fm.width,height:fm.height,bytes:full.length,sha256:hash(full),thumbnailWidth:tm.width,thumbnailHeight:tm.height,thumbnailBytes:thumb.length,thumbnailSha256:hash(thumb),checked:'2026-10-19',visualReviewed:false,modifications:'Original gallery proportions and background preserved; bounded WebP conversion without enlargement. No altered labels, generated photography or substituted SKUs.'};
  fs.writeFileSync(FILE,JSON.stringify(registry,null,2)+'\n');console.log(row.sku+' '+meta.width+'x'+meta.height);
 }
 fs.writeFileSync(FILE,JSON.stringify(registry,null,2)+'\n');
}
if(require.main===module)collect().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={gallery,unchangedReview};
