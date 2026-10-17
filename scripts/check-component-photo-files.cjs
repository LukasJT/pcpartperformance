'use strict';
// Development QA. Use the bundled Sharp runtime via PCP_SHARP_PATH when needed.
const fs=require('node:fs'),vm=require('node:vm'),sharp=require(process.env.PCP_SHARP_PATH||'sharp');
const context={window:{}};vm.runInNewContext(fs.readFileSync('dist/builder-catalog.js','utf8'),context);
const images=require('./component-photo-catalog.cjs').load(context.window.PCP_BUILDER_CATALOG);
async function main(){
 let decodedFiles=0,fullImageBytes=0,thumbnailBytes=0;
 for(const[id,image]of Object.entries(images))for(const field of ['src','thumbnailSrc']){
  const bytes=fs.readFileSync('dist'+image[field]),meta=await sharp(bytes).metadata();
  if(meta.format!=='webp')throw Error(id+' is not WebP');await sharp(bytes).raw().toBuffer();
  if(field==='src'){if(meta.width!==image.width||meta.height!==image.height)throw Error(id+' dimensions differ from reviewed media');fullImageBytes+=bytes.length;}
  else{if(meta.width>320||meta.height>320)throw Error(id+' thumbnail exceeds320px');thumbnailBytes+=bytes.length;}
  decodedFiles++;
 }
 const report={checkedAt:new Date().toISOString(),passed:true,images:Object.keys(images).length,decodedFiles,fullImageBytes,thumbnailBytes,scope:'Every accepted new full image and thumbnail decoded with Sharp, format/dimensions/budget checked, after registry identity and SHA-256 validation. Per-ID aliases may reference the same file.'};
 fs.mkdirSync('docs/component-photos-catalog-oct17/qa',{recursive:true});fs.writeFileSync('docs/component-photos-catalog-oct17/qa/image-decode.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
