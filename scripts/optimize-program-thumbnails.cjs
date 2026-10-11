'use strict';
// Reuse licensed/source-recorded local photos. Full originals and credits stay
// on product pages; these derivatives are only for lists and part pickers.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
let sharp;try{sharp=require('sharp')}catch{if(!process.env.PCP_SHARP_PATH)throw Error('Set PCP_SHARP_PATH to the existing Sharp package.');sharp=require(process.env.PCP_SHARP_PATH)}
(async()=>{const root=path.resolve('dist'),images=JSON.parse(fs.readFileSync(path.join(root,'images.json'),'utf8')),manifest={},unique=new Map();
for(const [id,asset]of Object.entries(images)){
 if(!asset.src?.startsWith('/assets/')||! /\.(?:png|jpe?g|webp)$/i.test(asset.src))continue;
 const original=path.resolve(root,'.'+asset.src);if(!original.startsWith(root+path.sep)||!fs.existsSync(original))continue;
 const bytes=fs.readFileSync(original);if(bytes.length<20000)continue;
 const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,14);let derivative=unique.get(hash);
 if(!derivative){const src='/assets/optimized/thumb-'+hash+'-320.webp',file=path.join(root,src);fs.mkdirSync(path.dirname(file),{recursive:true});let info;if(!fs.existsSync(file))info=await sharp(bytes).resize({width:320,withoutEnlargement:true}).webp({quality:82}).toFile(file);else info=await sharp(file).metadata();derivative={src,width:info.width,height:info.height,bytes:fs.statSync(file).size,originalBytes:bytes.length};unique.set(hash,derivative)}
 if(derivative.bytes<bytes.length)manifest[id]={...derivative,original:asset.src};
}
fs.writeFileSync('scripts/program-thumbnail-variants.json',JSON.stringify(manifest,null,2));const stats={date:'2026-10-09',products:Object.keys(manifest).length,uniqueDerivatives:unique.size,originalBytes:[...unique.values()].reduce((n,a)=>n+a.originalBytes,0),thumbnailBytes:[...unique.values()].reduce((n,a)=>n+a.bytes,0),use:'Catalog and picker delivery only; originals/provenance unchanged'};fs.writeFileSync('docs/program-2026-10-09/thumbnail-optimization.json',JSON.stringify(stats,null,2));console.log(stats);
})().catch(e=>{console.error(e.message);process.exitCode=1});
