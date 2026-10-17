'use strict';
const t=require('./cpu-extra-research.cjs'),fs=require('node:fs'),path=require('node:path'),sharp=require('C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const cats=require('./cpu-extra-commons-categories.json');const picks=[];
for(const x of cats){let files=x.files.filter(f=>!/webm|\.svg|@|Labelled|die_|_die|CPU-Z|Cpu-z|Cinebench|Auslastung|WaKü|bottom/i.test(f));
 const selection={
  '9950x3d':/00\.00\.(04|07|18)|00\.01\.10/,
  '7950x3d':/Memory_PC\)_(05|18)|00\.01\.02/,
  '7950x':/Memory_PC\)_04|Geekerwan\)_(02|03)/,
  '5950x':/Geekerwan\)_(07|08)/,
  'ultra7265k':/00\.01\.(50|58)|00\.00\.05/,
  'ultra5245k':/00\.01\.16/,
  'i714700k':/INVADERPC|00\.08\.45/,
  'i514600k':/00\.19\.(37|41)/,
  'i913900k':/00\.08\.(26|30)/,
  'i513600k':/Intel_Core_i5_13600K.jpg/,
  'i912900k':/verkaufsverpackung_IMGP6274/,
  'i712700k':/Alder_Lake_top/,
  'i512600k':/00\.03\.44/,
  'i910900k':/00\.00\.33/,
  'i99900k':/20201121_120317|Intel_i9-9900K.jpg/,
  'i77700k':/Hardware\)_(02|03|04)/,
  'i74790k':/IMG_95(?:89|92)/,
  'i76700k':/Skylake_top/,
  'i512400f':/DSC04509|00|ZS-DMap-1/,
  'i312100f':/00\.02\.02|Мой_Компьютер\)_18/,
  '7600':/top_IMGP/,
  '5700x':/_5700X_1.jpg/,
  '5600':/00\.02\.(05|17)|00\.06\.30/,
  '5700g':/Мой_Компьютер\)_01/,
  '3600':/Zen_2_Matisse/,
  '1600':/Ryzen_5_1600_CPU/
 }[x.id];if(!selection)continue;files=files.filter(f=>selection.test(f)).slice(0,4);for(const file of files)picks.push({id:x.id,name:x.name,fileTitle:file.replace('/wiki/','').replace(/_/g,' '),page:'https://commons.wikimedia.org'+file});}
async function main(){const titles=[...new Set(picks.map(x=>x.fileTitle))],infos={};for(let start=0;start<titles.length;start+=12){const u=new URL('https://commons.wikimedia.org/w/api.php');for(const[k,v]of Object.entries({action:'query',format:'json',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'800',titles:titles.slice(start,start+12).join('|')}))u.searchParams.set(k,v);const r=await t.request(u.href);console.log('metadata',r.status,start);if(r.status!==200)break;const json=JSON.parse(r.body);for(const p of Object.values(json.query?.pages||{}))infos[p.title]=p.imageinfo?.[0];await t.delay(1200);}
 const result=[];for(let n=0;n<picks.length;n++){const p=picks[n],info=infos[p.fileTitle];if(!info){result.push({...p,error:'No image metadata'});continue;}const u=info.thumburl||info.url,r=await t.request(u,true);if(r.status!==200){result.push({...p,info,error:'Image HTTP '+r.status});continue;}const file=path.join(t.cache,`candidate-${n+1}-${p.id}.webp`);await sharp(r.body).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:90}).toFile(file);result.push({...p,info,imageUrl:u,sourceSha256:t.sha(r.body),file});console.log('photo',n+1,p.id);await t.delay(300);}
 fs.writeFileSync(path.join(__dirname,'cpu-extra-candidates.json'),JSON.stringify(result,null,2));
 for(let start=0;start<result.length;start+=20){const group=result.slice(start,start+20),tiles=[];for(let n=0;n<group.length;n++){const p=group[n];if(!p.file)continue;const img=await sharp(p.file).flatten({background:'#fff'}).resize(240,155,{fit:'contain',background:'#fff'}).png().toBuffer(),left=(n%4)*260,top=Math.floor(n/4)*196;const text=(start+n+1)+'. '+p.id+' '+p.fileTitle.slice(5,43);tiles.push({input:img,left:left+10,top},{input:Buffer.from(`<svg width="260" height="40"><rect width="260" height="40" fill="white"/><text x="5" y="15" font-family="Arial" font-size="11">${text.slice(0,40).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text></svg>`),left,top:top+155});}await sharp({create:{width:1040,height:Math.ceil(group.length/4)*196,channels:3,background:'#ddd'}}).composite(tiles).png().toFile(path.join(__dirname,'cpu-extra-contact-'+(Math.floor(start/20)+1)+'.png'));}console.log('candidates',result.length);}
main().catch(e=>{console.error(e);process.exitCode=1;});
