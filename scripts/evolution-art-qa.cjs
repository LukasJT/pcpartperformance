'use strict';
/* Source-art geometry review, not a browser or page-layout substitute. */
const fs=require('node:fs'),path=require('node:path');
const art=require('./evolution-art.cjs'),{themes}=require('./evolution-themes.cjs');
async function run(){const sharp=require(process.env.PCP_SHARP_PATH||'sharp'),dir=path.resolve('docs/evolution-oct18/qa/artwork');fs.mkdirSync(dir,{recursive:true});const rows=[];
 for(const t of themes){const c=t.colors,vars={surface:c.surface,'surface-2':c.raised,'accent-ink':c.accent,'lab-secondary':c.secondary,'lab-chip':c.raised,'lab-glass':c.raised};let svg=art.studio().replace(/<svg /,'<svg style="color:'+c.ink+';background:'+c.bg+'" ').replace(/var\(--([\w-]+)(?:,[^)]+)?\)/g,(all,key)=>vars[key]||c.accent);const buffer=await sharp(Buffer.from(svg)).resize({width:480}).flatten({background:c.bg}).png().toBuffer(),file=path.join(dir,'studio-'+t.id+'.png');fs.writeFileSync(file,buffer);rows.push({theme:t.id,file,width:480,buffer});}
 const canvas=sharp({create:{width:1440,height:768,channels:4,background:'#ffffff'}}).composite(rows.map((r,i)=>({input:r.buffer,left:(i%3)*480,top:Math.floor(i/3)*384})));await canvas.png().toFile(path.join(dir,'studio-palettes.png'));
 for(const kind of art.kinds){const svg=art.hardware(kind),meta=await sharp(Buffer.from(svg)).metadata();if(meta.width!==320||meta.height!==270)throw Error('Unexpected drawing dimensions '+kind);await sharp(Buffer.from(svg)).png().toFile(path.join(dir,kind+'.png'));}
 const report={checkedAt:new Date().toISOString(),hardwareAssets:art.kinds.length,paletteRenders:themes.length,passed:true,scope:'SVG decoding, intrinsic dimensions and source-art palette rasterization only. Human visual inspection and actual browser/theme/layout behavior are separate.'};fs.writeFileSync(path.join(dir,'decode.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1;});module.exports=run;
