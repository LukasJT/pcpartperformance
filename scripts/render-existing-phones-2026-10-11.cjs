// Fill only the twelve approved phone-card image gaps from already registered GLBs.
// This never changes source geometry, registry rotations, phone facts or official photos.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.cjs');
const root=path.resolve(__dirname,'..'),dir='docs/program-2026-10-11/models/';
const ids=['iphone-13','pixel-5','pixel-6','pixel-6-pro','pixel-6a','galaxy-s21','galaxy-s21-ultra','galaxy-s23-ultra','galaxy-z-flip3','galaxy-a23-5g','galaxy-s3','oneplus-7-pro'];
const manifestFile='scripts/phone-model-render-overrides-2026-10-11.json';
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const write=(file,value)=>fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const fileHash=file=>hash(fs.readFileSync(path.join(root,file)));
const recordHash=record=>hash(Buffer.from(JSON.stringify(record)));
const assert=(test,message)=>{if(!test)throw Error(message);};
function sourceInfo(id,models){
 const model=models[id],bytes=fs.readFileSync(path.join(root,'dist/assets/models',model.asset));
 assert(bytes.readUInt32LE(0)===0x46546c67,'Invalid source GLB: '+id);
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),extras=json.asset.extras;
 const uid=model.sourceUrl.match(/([0-9a-f]{32})$/)?.[1];
 assert(model.license==='CC BY 4.0'&&extras?.license?.includes('CC-BY-4.0')&&uid&&extras.source?.endsWith(uid),'Registered/embedded source licence mismatch: '+id);
 const author=extras.author?.match(/^(.*?)\s*\((https:\/\/sketchfab\.com\/[^)]+)\)$/);
 assert(author,'Missing source creator profile: '+id);
 return{id,name:model.name,aliases:[...new Set([id,...model.ids])],asset:model.asset,sourceAssetSha256:hash(bytes),sourceAssetBytes:bytes.length,registeredRotation:model.rotation,creator:model.creator,sourceCreator:author[1],creatorUrl:model.creatorUrl||author[2],sourceUrl:model.sourceUrl,sourceUid:uid,license:model.license,licenseUrl:model.licenseUrl||'https://creativecommons.org/licenses/by/4.0/',embeddedExtras:extras,screenshot:'existing-'+id+'-front.png'};
}
function unchanged(plan,models,images,manifest){
 assert(fileHash('scripts/phone-models.json')===plan.phoneRegistrySha256,'Phone registry changed during render batch');
 assert(fileHash('scripts/phone-data.cjs')===plan.phoneDataSha256,'Main phone records changed during render batch');
 for(const item of plan.protectedPhoneAssets)assert(fileHash('dist/assets/models/'+item.asset)===item.sha256,'Source phone GLB changed: '+item.id);
 for(const item of plan.protectedManifestEntries)assert(recordHash(manifest[item.id])===item.sha256,'Existing render metadata changed: '+item.id);
 for(const item of plan.protectedExactPhotos)assert(recordHash(images[item.id])===item.sha256,'Exact official photo record changed: '+item.id);
 for(const record of plan.records)assert(JSON.stringify(models[record.id].rotation)===JSON.stringify(record.registeredRotation),'Registered rotation changed: '+record.id);
}
async function main(){
 const mode=process.argv[2]||'prepare',models=read('scripts/phone-models.json'),phones=require('./phone-data.cjs'),images=read('dist/images.json'),manifest=read(manifestFile);
 if(mode==='prepare'){
  const records=ids.map(id=>{assert(phones.some(p=>p.id===id)&&models[id],'Missing canonical phone/model: '+id);return sourceInfo(id,models);});
  for(const record of records)for(const id of record.aliases){
   const old=images[id];assert(!old?.src||(old.kind==='model-render'&&old.src==='/assets/phone-model-renders/'+record.id+'.webp'),'Do not replace an existing phone image: '+id);
   assert(!manifest[id]||manifest[id].src==='/assets/phone-model-renders/'+record.id+'.webp','Conflicting render mapping: '+id);
  }
  const phoneAliases=new Set(phones.flatMap(phone=>[phone.id,...(models[phone.id]?.ids||[])]));
  const plan={checked:'2026-10-11',scope:'Only twelve approved missing phone-card images, rendered from existing exact-model registry assets.',newlyDownloadedModelCount:0,additionalRenderedExistingModels:records.length,pixel9Pro:'No model or substitute image; remains unknown.',phoneRegistrySha256:fileHash('scripts/phone-models.json'),phoneDataSha256:fileHash('scripts/phone-data.cjs'),protectedPhoneAssets:Object.entries(models).map(([id,m])=>({id,asset:m.asset,sha256:fileHash('dist/assets/models/'+m.asset)})),protectedManifestEntries:Object.entries(manifest).filter(([id])=>!records.some(m=>m.aliases.includes(id))).map(([id,m])=>({id,sha256:recordHash(m)})),protectedExactPhotos:Object.entries(images).filter(([id,m])=>phoneAliases.has(id)&&m.kind==='exact').map(([id,m])=>({id,src:m.src,sha256:recordHash(m)})),records};
  write(dir+'existing-phone-renders-plan.json',plan);
  write(dir+'existing-phone-render-scenarios.json',records.map(m=>({name:path.basename(m.screenshot,'.png'),file:'/assets/models/'+m.asset,rotation:m.registeredRotation,phone:true,view:'front'})));
  console.log('Prepared',records.length,'front views; source GLBs and registered rotations unchanged.');return;
 }
 assert(mode==='register'||mode==='check','Use prepare, register or check');
 const plan=read(dir+'existing-phone-renders-plan.json');unchanged(plan,models,images,manifest);
 const review=read(dir+'existing-phone-render-review.json');
 assert(review.scenarios.length===ids.length&&review.scenarios.every(s=>s.state.title==='REVIEW_READY'),'Not every approved front render loaded');
 for(const record of plan.records){
  const scene=review.scenarios.find(s=>s.name===path.basename(record.screenshot,'.png'));
  assert(scene?.file==='/assets/models/'+record.asset&&JSON.stringify(scene.rotation)===JSON.stringify(record.registeredRotation)&&scene.view==='front','Wrong model, rotation or view in screenshot: '+record.id);
 }
 if(mode==='check'){
  for(const record of plan.records){const render=manifest[record.id];assert(render?.kind==='model-render'&&render.sourceUrl===record.sourceUrl&&render.license===record.license&&render.creator===record.creator,'Missing/incorrect render credit: '+record.id);assert(fileHash('dist'+render.src)===render.sha256,'Render hash drift: '+record.id);}
  assert(!manifest['pixel-9-pro']&&!manifest['x-phone-google-pixel-9-pro'],'Pixel 9 Pro must remain unknown');
  console.log('12 existing-model renders, 42 unchanged phone GLBs/rotations, existing render metadata and exact photos verified.');return;
 }
 const outputDir=path.join(root,'dist/assets/phone-model-renders');fs.mkdirSync(outputDir,{recursive:true});
 const additions=[];
 for(const record of plan.records){
  const filename=record.id+'.webp',output=path.join(outputDir,filename);
  await sharp(path.join(root,dir,record.screenshot)).extract({left:0,top:0,width:1000,height:648}).resize(800,518).webp({quality:90}).toFile(output);
  const sourceAlias=record.sourceCreator!==record.creator?' (credited in the source as '+record.sourceCreator+')':'';
  const render={src:'/assets/phone-model-renders/'+filename,width:800,height:518,bytes:fs.statSync(output).size,picturedModel:record.name+' — 3D model render',kind:'model-render',caption:'3D model render of '+record.name+' by '+record.creator+sourceAlias+'. Independent creator visualization; not a photograph.',sourceUrl:record.sourceUrl,creator:record.creator,creatorUrl:record.creatorUrl,sourceCreator:record.sourceCreator,license:record.license,licenseUrl:record.licenseUrl,checked:'2026-10-11',changes:'Rendered the existing credited GLB with its unchanged registered rotation using the local phone renderer; cropped the stage and encoded WebP at quality 90. Source geometry and phone records were retained.',sourceAsset:record.asset,sourceAssetSha256:record.sourceAssetSha256,registeredRotation:record.registeredRotation,sha256:fileHash('dist/assets/phone-model-renders/'+filename)};
  for(const id of record.aliases)manifest[id]=render;
  additions.push({id:record.id,sourceUid:record.sourceUid,...render});
 }
 unchanged(plan,models,images,manifest);
 write(manifestFile,manifest);
 write(dir+'existing-phone-renders.json',{checkedAt:new Date().toISOString(),method:'One front view from each already registered exact phone GLB through the actual phone-scene renderer; no source asset, registered rotation, main phone record or official photo changes.',newlyDownloadedModelCount:0,additionalRenderedExistingModels:additions.length,uniqueNewRenderAssets:new Set(additions.map(m=>m.src)).size,totalRenderBytes:additions.reduce((n,m)=>n+m.bytes,0),protectedPhoneGlbs:plan.protectedPhoneAssets.length,protectedExactPhotoMappings:plan.protectedExactPhotos.length,previousRenderMetadataPreserved:true,pixel9Pro:'Unknown; no substitute image.',additions});
 const layers=[],escape=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 for(const [index,record]of plan.records.entries()){
  const left=(index%3)*400,top=Math.floor(index/3)*299;
  const label=Buffer.from('<svg width="400" height="40"><rect width="400" height="40" fill="white"/><text x="8" y="17" font-size="15" font-family="Arial">'+escape(record.name)+'</text><text x="8" y="33" font-size="12" font-family="Arial">Model render · '+escape(record.creator)+'</text></svg>');
  layers.push({input:label,left,top},{input:await sharp(path.join(outputDir,record.id+'.webp')).resize(400,259).toBuffer(),left,top:top+40});
 }
 await sharp({create:{width:1200,height:Math.ceil(plan.records.length/3)*299,channels:3,background:'#f5f8fa'}}).composite(layers).png().toFile(path.join(root,dir,'existing-phone-renders-contact.png'));
 console.log(JSON.stringify({newlyDownloadedModelCount:0,additionalRenderedExistingModels:additions.length,totalRenderBytes:additions.reduce((n,m)=>n+m.bytes,0)},null,2));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
