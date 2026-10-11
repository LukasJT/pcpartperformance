// Register only the accepted exact-identity assets after source/license and renderer review.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,value)=>fs.writeFileSync(path.join(root,p),JSON.stringify(value,null,2)+'\n');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const batch=read('scripts/licensed-phone-batch-2026-10-11.json');
const selected=new Set((process.argv[2]||'').split(',').filter(Boolean));
for(const id of selected)if(!batch.some(model=>model.id===id))throw Error('Unknown batch phone: '+id);
const prepared=read('docs/program-2026-10-11/models/phone-preparation.json');
const phones=read('scripts/phone-models.json'),components=read('scripts/sketchfab-models.json');
const distribution=read('docs/program-2026-10-11/models/public-distribution-research.json');
const research=read('docs/program-2026-10-11/models/research.json');
const licenseUrl='https://creativecommons.org/licenses/by/4.0/';
const inventory=selected.size?read('docs/program-2026-10-11/models/integrated-model-batch.json'):{checked:'2026-10-11',method:'Individually verified CC BY 4.0 source assets; exact-identity visual review using the actual local renderer. Manufacturer facts are separate from artist geometry.',additions:[]};
const renderManifest=fs.existsSync(path.join(root,'scripts/phone-model-render-overrides-2026-10-11.json'))?read('scripts/phone-model-render-overrides-2026-10-11.json'):{};
const note='Independent creator appearance preview. Overall model height is normalized to the published body height; authored width/depth ratios and camera protrusions may differ. Not manufacturer-certified fit or clearance geometry.';
const limitations={
 'galaxy-s22-ultra':' Low-detail source with untextured screen and simplified camera/body geometry.',
 'galaxy-s8':' Low-detail untextured source; camera and fingerprint details are outlines.',
 'galaxy-s10':' Source camera and ports use simplified geometry; display changed to screen-off appearance.',
 'iphone-xr':' Display changed to screen-off appearance.',
 'iphone-11-pro':' Source appearance uses simplified flat rear camera details.'
};
async function main(){
 for(const model of batch){
  if(selected.size&&!selected.has(model.id))continue;
  const p=prepared[model.id];if(!p||p.uid!==model.uid)throw Error('Unprepared source: '+model.id);
  const metaPath=model.input.startsWith('tmp/model-batch-2026-10-11/raw/objaverse/')?'tmp/model-batch-2026-10-11/raw/objaverse/'+model.uid+'.json':'tmp/model-batch-2026-10-11/raw/phone-mockup-studio/'+model.uid+'.json';
  const meta=read(metaPath),extras=p.sourceExtras;
  if(meta.uid!==model.uid||meta.license?.slug!=='by'||!extras.license?.includes('CC-BY-4.0')||!extras.source?.includes(model.uid))throw Error('Individual license/source mismatch: '+model.id);
  const author=extras.author.match(/^(.*?)\s*\((https:\/\/sketchfab\.com\/[^)]+)\)$/);
  if(!author)throw Error('Attribution is not explicit: '+model.id);
  const file=path.join(root,'dist/assets/models',model.asset);
  if(fs.statSync(file).size!==p.outputBytes)throw Error('Asset changed after preparation: '+model.id);
  if(phones[model.id]&&!phones[model.id].sourceUrl.includes(model.uid))throw Error('Do not overwrite an existing different model: '+model.id);
  const distributionUrl=distribution.downloads[model.uid]?.downloadUrl||'https://raw.githubusercontent.com/quentin-pla/phone-mockup-studio/main/source/'+encodeURIComponent(path.basename(model.input));
  const entry={name:model.name,ids:model.ids,asset:model.asset,creator:author[1],creatorUrl:author[2],title:extras.title,sourceUrl:extras.source,license:'CC BY 4.0',licenseUrl,rotation:[0,0,0],dimensionsMm:model.dimensionsMm,dimensionSource:model.dimensionSource,changes:p.modifications,note:note+(limitations[model.id]||''),sourceUid:model.uid,distributionUrl,reviewed:'2026-10-11',bytes:p.outputBytes};
  phones[model.id]=entry;
  const addition={id:model.id,type:'phone',...entry,inputBytes:p.inputBytes,sha256:hash(file),triangles:Math.round(p.triangles),extentMm:p.extentMm};
  const previous=inventory.additions.findIndex(m=>m.id===model.id);
  if(previous>=0)inventory.additions[previous]=addition;else inventory.additions.push(addition);
  const screenshot=path.join(root,'docs/program-2026-10-11/models','batch-'+model.id+'-front.png');
  const folder=path.join(root,'dist/assets/phone-model-renders');fs.mkdirSync(folder,{recursive:true});
  const renderFile=path.join(folder,model.id+'.webp');
  await sharp(screenshot).extract({left:0,top:0,width:1000,height:648}).resize(800,518).webp({quality:90}).toFile(renderFile);
  const record={src:'/assets/phone-model-renders/'+model.id+'.webp',width:800,height:518,bytes:fs.statSync(renderFile).size,picturedModel:model.name+' — 3D model render',kind:'model-render',caption:'3D model render of '+model.name+' by '+author[1]+'. Independent creator visualization; not a photograph.',sourceUrl:entry.sourceUrl,creator:entry.creator,creatorUrl:entry.creatorUrl,license:entry.license,licenseUrl,checked:'2026-10-11',changes:'Rendered the credited adapted GLB with the local phone renderer; cropped the stage and encoded WebP. '+entry.changes,sha256:hash(renderFile)};
  for(const id of model.ids)renderManifest[id]=record;
 }
 if(!selected.size){
 const uid='26fbe59aa2ab4a749ef71583aefdadd5';
 const source=research.models[uid];
 if(source?.license?.slug!=='by')throw Error('MSI individual license unavailable');
 source.user={displayName:source.creator,profileUrl:source.creatorUrl};source.viewerUrl=source.url;
 const component={id:'retail-msi-geforce-rtx-5070-12g-gaming-trio-oc',asset:'sketchfab-msi-rtx-5070-gaming-trio-oc.glb',title:source.name,creator:source.user.displayName,creatorUrl:source.user.profileUrl,sourceUrl:source.viewerUrl,license:'CC BY 4.0',licenseUrl,changes:'Corrected the vertical UV direction of the five-vertex source side MSI-mark island; retained downward-facing fan orientation. Resized embedded textures to at most 1024 pixels and encoded WebP at quality 90; flattened static transforms, joined compatible primitives, deduplicated resources and used meshopt compression. Builder centers the pivot and applies the registered orientation and manufacturer envelope.',orientation:[Math.PI/2,Math.PI/2,0],dimensionsMm:[338,50,140],dimensionSource:'https://www.msi.com/Graphics-Card/GeForce-RTX-5070-12G-GAMING-TRIO-OC/Specification',sourceUid:uid,identityNote:'Source title uses Gaming X Trio, but its description links the exact MSI GAMING TRIO OC product. Source visual fan/shroud/backplate and retail SKU G5070-12GTC reviewed. Low-detail textured exterior; fans are largely textures. Appearance preview; not clearance geometry.',reviewed:'2026-10-11'};
 const ci=components.findIndex(x=>x.id===component.id);
 if(ci>=0&&!components[ci].sourceUrl.includes(uid))throw Error('Do not overwrite existing different component');
 if(ci>=0)components[ci]=component;else components.push(component);
 const componentPath=path.join(root,'dist/assets/models',component.asset);
 const componentInput=path.join(root,'tmp/model-batch-2026-10-11/raw/msi-5070-trio/source/RTX 5070 OC.glb');
 inventory.additions.push({type:'gpu',...component,inputBytes:fs.statSync(componentInput).size,bytes:fs.statSync(componentPath).size,sha256:hash(componentPath),triangles:883,distribution:'User-downloaded Sketchfab archive nvidia-geforce-rtx-5070-msi-gaming-x-trio.zip'});
 }
 inventory.completedMappings=inventory.additions.length;
 inventory.uniqueNewAssets=new Set(inventory.additions.map(m=>m.asset)).size;
 inventory.totalNewBytes=inventory.additions.reduce((n,m)=>n+m.bytes,0);
 inventory.totalPhoneRenderBytes=[...new Map(batch.map(m=>renderManifest[m.id]).filter(Boolean).map(m=>[m.src,m])).values()].reduce((n,m)=>n+m.bytes,0);
 inventory.allComponentMappings=components.length;
 inventory.allUniqueComponentAssets=new Set(components.map(m=>m.asset)).size;
 inventory.allPhoneMappings=Object.keys(phones).length;
 inventory.allUniquePhoneAssets=new Set(Object.values(phones).map(m=>m.asset)).size;
 write('scripts/phone-models.json',phones);if(!selected.size)write('scripts/sketchfab-models.json',components);
 write('scripts/phone-model-render-overrides-2026-10-11.json',renderManifest);
 write('docs/program-2026-10-11/models/integrated-model-batch.json',inventory);
 console.log(JSON.stringify({completedMappings:inventory.completedMappings,uniqueNewAssets:inventory.uniqueNewAssets,totalNewBytes:inventory.totalNewBytes,totalPhoneRenderBytes:inventory.totalPhoneRenderBytes,componentMappings:inventory.allComponentMappings,uniqueComponents:inventory.allUniqueComponentAssets,phoneMappings:inventory.allPhoneMappings},null,2));
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
