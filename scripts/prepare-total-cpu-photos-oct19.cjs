'use strict';
// Development-only, reviewed exact-model photograph preparation. No runtime or
// scheduled fetches; a changed downloaded source requires a new visual review.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),INTAKE=path.join(ROOT,'data/photo-intake/2026-10-19/total-cpu.json'),REVIEW=path.join(ROOT,'data/photo-intake/2026-10-19/total-cpu-review.json');
const DIRECTORY='assets/hardware/catalog-total-cpu-oct19',REGISTRY=path.join(__dirname,'component-photo-total-cpu-oct19.json'),CACHE=path.join(ROOT,'tmp/total-cpu-photos-oct19');
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const normalized=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
const sharp=()=>require(process.env.PCP_SHARP_PATH||'../tools/quality/node_modules/sharp');
function records(){const c=require('./total-catalog.cjs');return c.prepareCatalog(c.loadExisting());}
function validateIntake(rows,parts=records()){
 const expected=require('../data/catalog-intake/2026-10-19/batch-cpu.json').records.map(p=>p.id).concat('intel4004'),byId=new Map(parts.map(p=>[p.id,p])),seen=new Set();
 if(!Array.isArray(rows)||rows.length!==expected.length)throw Error('Expected 17 reference CPUs and retained Intel 4004');
 for(const row of rows){const part=byId.get(row.id);if(!expected.includes(row.id)||seen.has(row.id)||!part||part.cat!=='cpu')throw Error('Unknown or repeated CPU identity');seen.add(row.id);
  if(![part.name,part.brand+' '+part.name].map(normalized).includes(normalized(row.expectedLabel)))throw Error('CPU model-label mismatch: '+row.id);
  for(const field of ['sourceUrl','imageUrl']){const u=new URL(row[field]);if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error('Unsafe photograph source');}
  if(!row.publisher||!row.expectedCode)throw Error('Missing exact photograph provenance');
 }
 return true;
}
function validateReview(rows,review,cache=CACHE){
 if(review.schema!==1||review.reviewedAt!=='2026-10-19'||Object.keys(review.entries||{}).length!==rows.length)throw Error('Missing visual review');
 for(const row of rows){const item=review.entries[row.id],source=path.join(cache,row.id+'.source');
  if(!item||item.visualReviewed!==true||item.modelLabelVerified!==true||!item.note||item.expectedLabel!==row.expectedLabel||item.imageUrl!==row.imageUrl||item.sourceUrl!==row.sourceUrl||!fs.existsSync(source)||sha(fs.readFileSync(source))!==item.sourceSha256)throw Error('Source/model changed after visual review: '+row.id);
 }
 return true;
}
async function prepare({rows=JSON.parse(fs.readFileSync(INTAKE,'utf8')),review=JSON.parse(fs.readFileSync(REVIEW,'utf8')),parts=records(),cache=CACHE,dist=path.join(ROOT,'dist'),registryFile=REGISTRY}={}){
 validateIntake(rows,parts);validateReview(rows,review,cache);
 const byId=new Map(parts.map(p=>[p.id,p])),output={},pending=[];
 for(const row of rows){const part=byId.get(row.id),r=review.entries[row.id],raw=fs.readFileSync(path.join(cache,row.id+'.source')),meta=await sharp()(raw).metadata();
  if(!['jpeg','png','webp'].includes(meta.format)||meta.width<100||meta.height<100)throw Error('Unusable original photograph: '+row.id);
  const full=await sharp()(raw).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();let thumb;
  for(const quality of [84,76,68,60,52,44]){thumb=await sharp()(raw).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality}).toBuffer();if(thumb.length<=40000)break;}
  if(thumb.length>40000)throw Error('Thumbnail budget exceeded: '+row.id);
  const fm=await sharp()(full).metadata(),tm=await sharp()(thumb).metadata(),stem=row.id+'-'+sha(raw).slice(0,10),src='/'+DIRECTORY+'/'+stem+'.webp',thumbnailSrc='/'+DIRECTORY+'/'+stem+'-320.webp';
  const licensed=row.id==='intel4004';output[row.id]={catalogName:part.name,picturedModel:row.id==='intel4004'?'Intel 4004 (D4004 package)':(part.name.startsWith(part.brand+' ')?part.name:part.brand+' '+part.name),kind:'exact',identityScope:'exact-visible-model-label',src,thumbnailSrc,sourceUrl:row.sourceUrl,imageUrl:row.imageUrl,originalImageUrl:row.imageUrl,sourceKind:licensed?'licensed-historical-product-photograph':'retailer-product-photograph',official:false,attribution:licensed?'LucaDetomi / Wikimedia Commons (CC BY-SA 3.0) — resized and encoded as WebP':row.publisher+' product gallery; original copyright retained',license:licensed?'CC BY-SA 3.0':'Published retailer product photograph; no open license or separate redistribution permission recorded',licenseUrl:licensed?row.licenseUrl:row.sourceUrl,rightsStatus:licensed?'licensed-cc-by-sa-3.0':'published-product-media-no-open-license-recorded',licenseNote:licensed?'Local resized WebP derivatives are distributed under the same CC BY-SA 3.0 license. Attribution does not imply endorsement.':'Source-page attribution records publication provenance, not a grant of reuse permission.',sourceSha256:sha(raw),sourceBytes:raw.length,sourceWidth:meta.width,sourceHeight:meta.height,width:fm.width,height:fm.height,bytes:full.length,sha256:sha(full),thumbnailWidth:tm.width,thumbnailHeight:tm.height,thumbnailBytes:thumb.length,thumbnailSha256:sha(thumb),checked:'2026-10-19',visualReviewed:true,modelLabelVerified:true,reviewedAt:review.reviewedAt,visualReviewSheet:'docs/total-refinement/identity/cpu-photos/'+(part.brand==='Intel'?'intel':'amd')+'-review.webp',identityEvidence:'Visually reviewed exact '+row.expectedLabel+' marking on the actual processor, with the exact named source product/gallery. '+r.note+' No adjacent CPU, generic family logo, generated label, benchmark claim, price or platform compatibility is imported.',visualReview:{date:review.reviewedAt,method:'Actual downloaded source pixels inspected, model label read and bound to source SHA-256',note:r.note},sourcePageReview:r.sourcePageReview,modifications:'Original background, markings and proportions preserved; resized within800px and320px without enlargement and encoded WebP. No cropping, recoloring, label replacement or hardware generation.'};
  if(r.sourcePageSha256)output[row.id].sourcePageSha256=r.sourcePageSha256;
  pending.push([path.join(dist,src),full],[path.join(dist,thumbnailSrc),thumb]);
 }
 // Validate every source and transformation before publishing any binding.
 for(const[file,bytes]of pending){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}
 fs.writeFileSync(registryFile,JSON.stringify(output,null,2)+'\n');return output;
}
async function validatePrepared(images,parts=records(),dist=path.join(ROOT,'dist')){
 const rows=JSON.parse(fs.readFileSync(INTAKE,'utf8'));validateIntake(rows,parts);
 const errors=require('./component-photo-catalog.cjs').validate(parts,images,{root:dist});if(errors.length)throw Error(errors.join('\n'));
 if(Object.keys(images).length!==18)throw Error('Incomplete reviewed CPU registry');const seen=new Set();
 for(const row of rows){const image=images[row.id];if(!image||image.modelLabelVerified!==true||seen.has(image.sourceSha256))throw Error('Missing/reused exact photograph: '+row.id);seen.add(image.sourceSha256);
  if(image.sourceUrl!==row.sourceUrl||image.imageUrl!==row.imageUrl||!image.identityEvidence.includes(row.expectedLabel))throw Error('Changed CPU provenance: '+row.id);
  for(const[field,max]of[['src',800],['thumbnailSrc',320]]){const bytes=fs.readFileSync(path.join(dist,image[field])),m=await sharp()(bytes).metadata();if(m.format!=='webp'||Math.max(m.width,m.height)>max||m.width>image.sourceWidth||m.height>image.sourceHeight)throw Error('Resized image enlarged or outside budget: '+row.id);}
 }
 return{records:18,newReferenceCpus:17,retainedHistoricalCpus:1,exactVisibleModelLabels:18,generatedOrSubstitutedPhotos:0};
}
if(require.main===module)(async()=>{if(process.argv[2]==='prepare')console.log(JSON.stringify(await validatePrepared(await prepare())));else console.log(JSON.stringify(await validatePrepared(JSON.parse(fs.readFileSync(REGISTRY,'utf8')))));})().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={prepare,validateIntake,validateReview,validatePrepared,sha,DIRECTORY};
