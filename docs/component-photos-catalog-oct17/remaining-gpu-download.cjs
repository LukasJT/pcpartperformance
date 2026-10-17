const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require('C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'dist/assets/hardware/catalog-remaining-gpu-oct17');
const list=JSON.parse(fs.readFileSync(path.join(__dirname,'remaining-gpu-candidates.json')));
const file=path.join(root,'scripts/component-photo-remaining-gpu-oct17.json'),out=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{};
const errors={};const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function run([id,c]){if(process.argv.includes('--resume')&&out[id])return;try{
 const r=await fetch(c.imageUrl,{signal:AbortSignal.timeout(55000)});if(!r.ok)throw Error('HTTP '+r.status);const b=Buffer.from(await r.arrayBuffer());const m=await sharp(b).metadata();if(m.width<200||m.height<200)throw Error('Image too small '+m.width+'x'+m.height);
 const stem=id+'-'+hash(b).slice(0,10),name=stem+'.webp',thumb=stem+'-320.webp';
 const big=await sharp(b).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toBuffer();let small=await sharp(b).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toBuffer();
 for(let q=76;small.length>40000&&q>=35;q-=8)small=await sharp(b).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality:q}).toBuffer(); if(small.length>40000)throw Error('Thumbnail too large'); fs.writeFileSync(path.join(dir,name),big);fs.writeFileSync(path.join(dir,thumb),small);const bigM=await sharp(big).metadata();
 out[id]={...c,src:'/assets/hardware/catalog-remaining-gpu-oct17/'+name,thumbnailSrc:'/assets/hardware/catalog-remaining-gpu-oct17/'+thumb,attribution:c.attribution,licenseUrl:c.sourceUrl,width:bigM.width,height:bigM.height,bytes:big.length,sourceWidth:m.width,sourceHeight:m.height,sourceSha256:hash(b),sha256:hash(big),thumbnailSha256:hash(small),visualReviewed:false,modifications:'Proportions preserved; resized within 800 × 800 and encoded WebP, with 320-pixel thumbnail. No recoloring, generated geometry or background replacement.'};
 fs.writeFileSync(file,JSON.stringify(out,null,2));console.log(id,m.width+'x'+m.height);
 }catch(e){errors[id]={imageUrl:c.imageUrl,error:e.message};console.log(id,e.message);}}
(async()=>{let a=Object.entries(list);for(let i=0;i<a.length;i+=6)await Promise.all(a.slice(i,i+6).map(run));fs.writeFileSync(path.join(__dirname,'remaining-gpu-download-errors.json'),JSON.stringify(errors,null,2));})();
