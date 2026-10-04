const fs=require('node:fs');
module.exports=records=>{
 const images=JSON.parse(fs.readFileSync('dist/images.json')),verified=require('./verified-photo-overrides.json');
 const normalized=s=>String(s).toLowerCase().replace(/\b(?:msi|asus|asrock|gigabyte|amd|intel)\b|[^a-z0-9]/g,'');
 const byName=new Map(Object.entries(verified).map(([id,image])=>[normalized(image.catalogName||image.picturedModel),image]));
 const reportFile='docs/image-research/photo-corrections.json',previous=fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile)).unresolvedMappings:[];
 let replaced=0;const removed=[];
 for(const p of records){const replacement=verified[p.id]||byName.get(normalized(p.name));if(replacement){if(!fs.existsSync('dist'+replacement.src))throw Error('Missing verified photo: '+p.id);images[p.id]=replacement;replaced++}else if(images[p.id]&&((['cpu','gpu','board'].includes(p.cat)&&['family','reference','illustration'].includes(images[p.id].kind))||(p.cat==='phone'&&images[p.id].kind==='reference'&&normalized(p.name)!==normalized(images[p.id].picturedModel)))){removed.push({id:p.id,name:p.name,picturedModel:images[p.id].picturedModel,oldAsset:images[p.id].src});delete images[p.id]}}
 fs.writeFileSync('dist/images.json',JSON.stringify(images));fs.writeFileSync('dist/image-catalog.js','window.PCP_IMAGES='+JSON.stringify(images)+';');
 const unresolved=records.filter(p=>['cpu','gpu','board','phone'].includes(p.cat)&&!images[p.id]).map(p=>removed.find(x=>x.id===p.id)||previous.find(x=>x.id===p.id)||{id:p.id,name:p.name});
 fs.mkdirSync('docs/image-research',{recursive:true});fs.writeFileSync(reportFile,JSON.stringify({verifiedOverrides:Object.keys(verified).length,verifiedMappings:replaced,unresolvedMappings:unresolved,policy:'Do not show another CPU, motherboard or graphics chip as the selected product. Genuine same-chip partner images explicitly name the photographed variant. Unverified products retain specifications with an image-unavailable state.'},null,2));
 return images;
};
