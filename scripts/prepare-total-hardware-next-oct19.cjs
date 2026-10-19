'use strict';
// Bounded transcription from twelve individually inspected named MSI PDFs.
// This writes a separate intake packet and its own photo registry only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.PCP_SHARP_PATH||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),intakeDir=path.join(root,'data/catalog-intake/2026-10-19-hardware-next'),photoDocs=path.join(root,'docs/total-refinement/photos/hardware-next'),catalogDocs=path.join(root,'docs/total-refinement/catalog/hardware-next');
const extracted=require('../docs/total-refinement/photos/hardware-next/extraction.json').rows;
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const intelModern=['LGA1150','LGA1151','LGA1155','LGA1156','LGA1200','LGA1700','LGA1851'];
const intelWide=[...intelModern,'LGA1366','LGA2011','LGA2011-3','LGA2066'];
const intelK=['LGA1200','LGA1151','LGA1150','LGA1155','LGA1156','LGA2066','LGA2011-3','LGA2011'];
const amdLegacy=['AM5','AM4','FM2+','FM2','FM1','AM3+','AM3','AM2+','AM2'];
const threadripper=['TR4','sTRX4','SP3'];
const modern=['AM5','AM4'];
// name, nominal radiator class (only when an explicit PDF row exists), bare
// radiator L/W/T, radiator-fan W/T/count, block H, sockets, PDF generation date.
const definitions=[
 ['MAG CORELIQUID E240',240,[277,119.2,27],[120,25,2],54.2,[...intelModern,...modern],'2024-12-04'],
 ['MAG CORELIQUID E360',360,[394,119.2,27],[120,25,3],54.2,[...intelModern,...modern,'TR4','sTRX4'],'2024-12-04'],
 ['MAG CORELIQUID I240',240,[277,119.2,27],[120,25,2],62.45,[...intelModern,...modern],'2026-04-28'],
 ['MAG CORELIQUID I360',360,[394,120,27],[120,25,3],62.45,[...intelModern,...modern],'2026-04-28'],
 ['MAG CORELIQUID P240',null,[276,120,27],[120,25,2],52,[...intelWide,...amdLegacy],'2024-10-15'],
 ['MAG CORELIQUID P360',null,[396,120,27],[120,25,3],52,[...intelWide,...amdLegacy,...threadripper],'2026-04-28'],
 ['MAG CORELIQUID C240',null,[276,120,27],[120,25,2],52,[...intelWide,...amdLegacy],'2024-10-18'],
 ['MAG CORELIQUID C280',null,[316,140,27],[140,25,2],52,[...intelWide,...amdLegacy],'2024-10-18'],
 ['MAG CORELIQUID C360',null,[396,120,27],[120,25,3],52,[...intelWide,...amdLegacy,...threadripper],'2024-10-18'],
 ['MPG CORELIQUID K240',240,[272.5,120,27],[120,25,2],94,[...intelK,...amdLegacy,...threadripper],'2023-11-15'],
 ['MPG CORELIQUID K360',360,[394,120,27],[120,25,3],94,[...intelK,...amdLegacy,...threadripper],'2024-03-04'],
 ['MEG CORELIQUID S360',360,[394,120,27],[120,27.5,3],83.53,['LGA1851','LGA1700','LGA1200','LGA1151','LGA1150','LGA1155','LGA1156',...modern,...threadripper],'2026-04-28']
];
const observation=(value,unit='')=>({value,unit});
function recordsAndSources(){
 const sources={},records=[];
 for(const[name,nominal,dimensions,fans,blockHeight,sockets,generated]of definitions){
  const row=extracted.find(r=>r.name===name);if(!row?.exactModelTextVerified)throw Error('Uninspected source: '+name);
  const pdf=fs.readFileSync(path.join(root,row.file));if(sha(pdf)!==row.sourceSha256)throw Error('Source changed: '+name);
  const text=fs.readFileSync(path.join(root,row.file.replace(/\.pdf$/,'.txt')),'utf8');if(!text.includes('Generated '+generated))throw Error('Unexpected source version: '+name);
  const sourceId='msi-cooling-'+name.toLowerCase().replaceAll(' ','-'),special=[];
  const facts={coolerType:observation('aio'),coolerSockets:observation(sockets),radiatorSizeMm:observation(nominal,'mm'),radiatorLengthMm:observation(dimensions[0],'mm'),radiatorWidthMm:observation(dimensions[1],'mm'),radiatorThicknessMm:observation(dimensions[2],'mm'),blockHeightMm:observation(blockHeight,'mm'),fanSizeMm:observation(fans[0],'mm'),fanThicknessMm:observation(fans[1],'mm'),fanCount:observation(fans[2]),pumpConnector:observation(null),fanConnector:observation(null)};
  if(/ E\d/.test(name)){facts.pumpConnector=observation('4-pin');facts.fanConnector=observation('4-pin');}
  if(/ I\d/.test(name)){facts.pumpConnector=observation('4-pin PWM + 5V ARGB 3-pin (female and male)');if(name.endsWith('I240'))facts.fanConnector=observation('4-pin PWM + 5V ARGB 3-pin');else special.push('The I360 PDF lists only a 5V ARGB lighting header in its Fan Connector row; a fan-motor connector is not inferred from that row.');}
  if(/ [KS]\d/.test(name)){facts.pumpConnector=observation('4-pin PWM');facts.fanConnector=observation('4-pin PWM');special.push('The inspected source also lists a USB 2.0 pin-header interface and SATA power; check available internal headers and power connections.');}
  if(/ K\d/.test(name))special.push('The inspected K-series PDF does not document LGA1700 or LGA1851; newer bracket or revision support must be checked separately.');
  if(nominal===null)special.push('Nominal radiator class is left unknown because this PDF publishes bare dimensions without an explicit Radiator Size row.');
  const note='Exact standard black model. Published socket support does not establish that the required bracket is included in a particular retail package, adequate cooling, or complete system fit. Bare radiator and fan dimensions exclude proof of installed stack, fittings, hoses, screw clearance and adjacent parts. MPN and hardware revision remain unknown. '+special.join(' ');
  records.push({id:row.id,cat:'cooler',brand:'MSI',name,sourceId,status:'evidence-checked',segment:'consumer',builderEligible:true,year:null,architecture:'All-in-one liquid CPU cooler',summary:dimensions.join(' × ')+' mm radiator · '+fans[2]+' × '+fans[0]+' mm fans',identity:{manufacturer:'MSI',commercialModel:name,manufacturerPartNumber:null,revision:null,productFamily:name.split(' ')[0]+' CORELIQUID'},note:note.trim()});
  sources[sourceId]={publisher:'MSI',url:row.sourceUrl,productUrl:row.productUrl,inspectedAt:'2026-10-19',observedAt:row.observedAt,confidence:'manufacturer-verified',inspection:'Exact named manufacturer PDF text, generation date, dimensions, socket list and color product image inspected. AI-assisted transcription and visual review; no claimed thermal measurements or physical installation test.',scope:'Datasheet generated '+generated+'. Only facts printed for this named model are retained. E/I documents cover BLACK/WHITE jointly; this record and reviewed photo represent the standard black version only. Retail bracket contents, product revision, current market availability and an installed fit verdict remain unverified. '+special.join(' '),sourceSha256:row.sourceSha256,sourceBytes:row.bytes,documentGeneratedAt:generated,models:{[name]:{manufacturerPartNumber:null,revision:null,facts}}};
 }
 return{records,sources};
}
async function main(){
 fs.mkdirSync(intakeDir,{recursive:true});const bundle=recordsAndSources();
 fs.writeFileSync(path.join(intakeDir,'sources.json'),JSON.stringify(bundle.sources,null,2)+'\n');
 fs.writeFileSync(path.join(intakeDir,'batch-coolers.json'),JSON.stringify({schema:1,evidenceDate:'2026-10-19',records:bundle.records},null,2)+'\n');
 const directory='assets/hardware/catalog-total-hardware-next-oct19';fs.mkdirSync(path.join(root,'dist',directory),{recursive:true});const images={},reviews=[];
 for(const row of extracted){
  // All I4 color objects were individually compared in candidates-1/2/3.jpg.
  // I2 is a composite/header; I5+ are marketing badges, not exact product photos.
  const candidate=row.candidates.find(im=>im.sourceImageObject==='I4.png');if(!candidate)throw Error('Reviewed color photo missing: '+row.id);
  const original=fs.readFileSync(path.join(root,candidate.candidateFile));if(sha(original)!==candidate.extractedSha256)throw Error('Photo changed after review: '+row.id);
  const full=await sharp(original).resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:88,alphaQuality:100}).toBuffer();let thumb;
  for(const quality of[86,78,68,58]){thumb=await sharp(original).resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality,alphaQuality:100}).toBuffer();if(thumb.length<=40000)break;}if(thumb.length>40000)throw Error('Thumbnail budget exceeded');
  const fullName=row.id+'.webp',thumbName=row.id+'-320.webp',dimensions=await sharp(full).metadata(),thumbnail=await sharp(thumb).metadata();fs.writeFileSync(path.join(root,'dist',directory,fullName),full);fs.writeFileSync(path.join(root,'dist',directory,thumbName),thumb);
  const index=extracted.indexOf(row),sheet=index<6?'candidates-1.jpg':index<10?'candidates-2.jpg':'candidates-3.jpg';
  const review={id:row.id,name:row.name,sourceSha256:row.sourceSha256,extractedSha256:candidate.extractedSha256,sourceImageObject:'I4.png',visualReviewed:true,visualReviewSheet:'docs/total-refinement/photos/hardware-next/'+sheet};reviews.push(review);
  images[row.id]={src:'/'+directory+'/'+fullName,thumbnailSrc:'/'+directory+'/'+thumbName,catalogName:row.name,picturedModel:'MSI '+row.name,representedVariant:'MSI '+row.name+' (standard black)',sourceUrl:row.productUrl,imageUrl:row.sourceUrl,sourceType:'official-datasheet',sourcePage:1,sourceImageObject:'I4.png',attribution:'MSI',official:true,kind:'exact',license:'Manufacturer product media; no open license or separate redistribution permission recorded',licenseUrl:row.sourceUrl,rightsStatus:'published-product-media-no-open-license-recorded',checked:'2026-10-19',width:dimensions.width,height:dimensions.height,bytes:full.length,thumbnailWidth:thumbnail.width,thumbnailHeight:thumbnail.height,thumbnailBytes:thumb.length,sourceSha256:row.sourceSha256,extractedSha256:candidate.extractedSha256,sha256:sha(full),thumbnailSha256:sha(thumb),identityEvidence:'The exact named MSI datasheet identifies this model and embeds its color product photo as I4.png on page 1. The black assembly, fan count, radiator and block design were visually checked. Shared black/white marketing composites, lighting badges and neighboring models were excluded. No unseen MPN or revision is inferred.',modifications:'Color manufacturer photo extracted from exact PDF, transparency and proportions preserved. Resized within 800px and 320px without enlargement and encoded WebP. No generated or recolored hardware.',visualReviewed:true,reviewedAt:'2026-10-19',visualReviewSheet:review.visualReviewSheet};
 }
 const errors=require('./component-photo-catalog.cjs').validate(bundle.records,images);if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync(path.join(__dirname,'component-photo-total-hardware-next-oct19.json'),JSON.stringify(images,null,2)+'\n');
 fs.writeFileSync(path.join(photoDocs,'reviewed-selection.json'),JSON.stringify({reviewedAt:'2026-10-19',rows:reviews},null,2)+'\n');
 const catalog=require('./total-catalog.cjs'),base=catalog.loadExisting(),prior=catalog.stage(base,catalog.loadPackets(path.join(root,'data/catalog-intake/2026-10-19')));if(!prior.valid)throw Error('Prior intake invalid');const before=base.concat(prior.additions),staged=catalog.stage(before,catalog.loadPackets(intakeDir));
 const report={checkedAt:new Date().toISOString(),requested:12,validated:staged.additions.length,alreadyApplied:staged.unchanged.length,valid:staged.valid,errors:staged.errors,conflicts:staged.conflicts,before:catalog.counts(before),after:catalog.counts(before.concat(staged.additions)),sources:12,photos:Object.keys(images).length,fullBytes:Object.values(images).reduce((n,r)=>n+r.bytes,0),thumbnailBytes:Object.values(images).reduce((n,r)=>n+r.thumbnailBytes,0),largestThumbnail:Math.max(...Object.values(images).map(r=>r.thumbnailBytes)),new3DModels:0,newOffers:0,rights:'Manufacturer-published product media; no open license or separate redistribution permission recorded. No licensing clearance claim.',remaining:'Bounded 12-model expansion only. Exact MPN/revision, retail package bracket inventory, full installed fit, thermal performance and market-wide completeness remain unverified.'};
 fs.writeFileSync(path.join(catalogDocs,'report.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(photoDocs,'report.json'),JSON.stringify(report,null,2)+'\n');if(!staged.valid)throw Error(staged.errors.join('\n'));console.log(JSON.stringify(report));
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={recordsAndSources,main};
