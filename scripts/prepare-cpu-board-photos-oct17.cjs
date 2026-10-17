'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.PCP_SHARP_PATH||'sharp'),audit=require('../docs/component-photos-catalog-oct17/catalog-audit.json');
const directory=path.resolve('tmp/cpu-board-photos-oct17'),data=require('../docs/component-photos-catalog-oct17/cpu-board-research.json');
const output=[];
async function main(){
 for(const row of data.rows.filter(x=>x.status==='candidate'&&!x.candidates[0]?.file)){
  if(row.id==='3600')continue;
  const part=audit.rows.find(x=>x.id===row.id),c=row.candidates.find(x=>!/-og\./i.test(x.imageUrl))||row.candidates[0];
  try{const file=path.join(directory,row.id+'-candidate.webp'),original=path.join(directory,row.id+'-original.media');if(!fs.existsSync(original)){const r=await fetch(c.imageUrl,{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('HTTP '+r.status);fs.writeFileSync(original,Buffer.from(await r.arrayBuffer()));}
   const raw=fs.readFileSync(original),prepared=await sharp(raw).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).png().toBuffer();if(fs.existsSync(file)&&!prepared.equals(fs.readFileSync(file)))throw Error('Original image changed; inspect the new candidate before selecting it');fs.writeFileSync(file,prepared);
   const m=await sharp(file).metadata();if(m.width<200||m.height<150)throw Error('Not a useful product photo');output.push({id:row.id,name:row.name,brand:part.brand,file,sourceUrl:c.sourceUrl,imageUrl:c.imageUrl,type:'manufacturer-photo',sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),intakeSha256:crypto.createHash('sha256').update(prepared).digest('hex')});
  }catch(e){console.log(row.id+': '+e.message);}
 }
 for(const row of JSON.parse(fs.readFileSync(path.join(directory,'pdf-images.json'),'utf8'))){for(const [index,image]of (row.images||[]).entries())output.push({...row,...image,id:row.id,name:row.name,brand:audit.rows.find(x=>x.id===row.id).brand,index,type:'manufacturer-datasheet-image',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(row.sourcePdf)).digest('hex')});}
 const commonsFile='docs/component-photos-catalog-oct17/cpu-commons-research.json';if(fs.existsSync(commonsFile))for(const row of JSON.parse(fs.readFileSync(commonsFile,'utf8')).rows.filter(x=>x.candidates.length))for(const c of row.candidates.slice(0,2))try{const key=crypto.createHash('sha256').update(c.imageUrl).digest('hex').slice(0,10),file=path.join(directory,row.id+'-'+key+'.png');if(!fs.existsSync(file)){const r=await fetch(c.downloadUrl,{signal:AbortSignal.timeout(15000)});if(!r.ok)continue;fs.writeFileSync(file,await sharp(Buffer.from(await r.arrayBuffer())).resize({width:1000,height:1000,fit:'inside'}).png().toBuffer());}output.push({...c,id:row.id,name:row.name,brand:audit.rows.find(x=>x.id===row.id).brand,file,type:'licensed-photo',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}catch(e){console.log(row.id+': '+e.message);}
 fs.writeFileSync(path.join(directory,'candidate-images.json'),JSON.stringify(output,null,2)+'\n');
 const esc=s=>String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
 for(let start=0;start<output.length;start+=20){const batch=output.slice(start,start+20),tiles=[];for(let k=0;k<batch.length;k++){const row=batch[k],picture=await sharp(row.file).resize({width:235,height:195,fit:'inside'}).flatten({background:'#fff'}).png().toBuffer(),svg=Buffer.from('<svg width="260" height="265"><rect width="260" height="265" fill="white"/><text x="8" y="218" font-size="12" fill="black">'+esc((start+k)+': '+row.id.slice(0,34))+'</text><text x="8" y="237" font-size="11" fill="black">'+esc(row.name.slice(0,39))+'</text><text x="8" y="254" font-size="11" fill="black">'+esc(row.object||row.type)+'</text></svg>');tiles.push({input:await sharp(svg).composite([{input:picture,left:12,top:5}]).png().toBuffer(),left:(k%4)*260,top:Math.floor(k/4)*265});}const name='cpu-board-candidates-'+Math.floor(start/20)+'.jpg';await sharp({create:{width:1040,height:Math.ceil(batch.length/4)*265,channels:3,background:'#ddd'}}).composite(tiles).jpeg({quality:92}).toFile('docs/component-photos-catalog-oct17/'+name);}
 console.log(output.length+' candidate images prepared for visual inspection');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
