'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const files=['component-photo-cpu-board-oct17.json','component-photo-cpu-extra-oct17.json','component-photo-board-extra-oct17.json','component-photo-gpu-oct17.json','component-photo-retail-gpu-oct17.json','component-photo-storage-psu-oct17.json','component-photo-case-cooling-oct17.json','component-photo-cpu-supplement-oct17.json','component-photo-memory-psu-supplement-oct17.json','component-photo-storage-supplement-oct17.json'];
files.push(...["component-photo-remaining-parent-oct17.json","component-photo-remaining-gpu-oct17.json","component-photo-remaining-storage-oct17.json","component-photo-remaining-cpu-oct17.json","component-photo-remaining-special-oct17.json","component-photo-remaining-cpu-extra-oct17.json","component-photo-remaining-cpu-final-oct17.json","component-photo-remaining-cpu-last-oct17.json"]);
const categories=new Set(['cpu','board','gpu','ram','ssd','hdd','psu','case','fan','cooler']);
function validate(records,images,{root=path.resolve(__dirname,'../dist')}={}){
 const index=new Map(records.map(p=>[p.id,p])),errors=[];
 for(const[id,image]of Object.entries(images)){
  const part=index.get(id);if(!part||!categories.has(part.cat)){errors.push('No component identity: '+id);continue;}
  if(image.catalogName!==part.name||image.visualReviewed!==true||!image.identityEvidence)errors.push('Unreviewed or mismatched component identity: '+id);
  if(!['exact','same-chip-variant'].includes(image.kind))errors.push('Unapproved image kind: '+id);
  if(!/^https:\/\//.test(image.sourceUrl||'')||!/^https:\/\//.test(image.imageUrl||'')||!image.license||!image.licenseUrl||!image.attribution)errors.push('Missing source/rights record: '+id);
  if(image.kind==='same-chip-variant'&&(part.cat!=='gpu'||part.id.startsWith('retail-')||!image.representedVariant||image.gpuModel!==part.name||!Number.isFinite(image.memoryGB)||image.memoryGB!==Number(part.specs?.Memory)))errors.push('Wrong or unknown GPU variant capacity: '+id);
  for(const field of ['src','thumbnailSrc']){
   const src=image[field];if(!/^\/assets\/hardware\/(?:catalog-[a-z0-9-]+|repaired)\/[a-zA-Z0-9._-]+\.webp$/.test(src||'')){errors.push('Unsafe photo path: '+id+' '+field);continue;}
   const file=path.join(root,src);if(!fs.existsSync(file)){errors.push('Missing photo file: '+id+' '+field);continue;}
   if(field==='src'){
    const bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');if(image.sha256!==hash||image.bytes!==bytes.length)errors.push('Photo changed after review: '+id);
    if(!Number.isInteger(image.width)||!Number.isInteger(image.height)||image.width<100||image.height<100||(Math.max(image.width,image.height)<300&&image.lowResolution!==true))errors.push('Invalid photo dimensions: '+id);
   }
   if(field==='thumbnailSrc'){
    const bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
    if(image.thumbnailSha256!==hash)errors.push('Thumbnail changed after review: '+id);
    if(bytes.length>40000)errors.push('Oversized thumbnail: '+id);
   }
  }
 }
 return errors;
}
function load(records,options){const images={};for(const name of files){const file=path.join(__dirname,name);if(fs.existsSync(file))for(const[id,image]of Object.entries(JSON.parse(fs.readFileSync(file,'utf8')))){if(images[id])throw Error('Duplicate catalog photo repair: '+id);images[id]=image;}}const errors=validate(records,images,options);if(errors.length)throw Error(errors.join('\n'));return images;}
module.exports={load,validate,files,categories};
