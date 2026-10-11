const fs=require('node:fs'),path=require('node:path');
const sharp=require('../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/program-2026-10-11/models');
const models=require('./licensed-phone-batch-2026-10-11.json');
(async()=>{for(const view of ['front','back','side']){
 const ready=models.filter(x=>fs.existsSync(path.join(dir,'batch-'+x.id+'-'+view+'.png')));
 for(let i=0;i<ready.length;i+=9){const page=ready.slice(i,i+9),layers=[];
  for(let n=0;n<page.length;n++){
   const tile=await sharp(path.join(dir,'batch-'+page[n].id+'-'+view+'.png')).resize(333,240).toBuffer();
   layers.push({input:tile,left:(n%3)*333,top:Math.floor(n/3)*270+30});
   const label=Buffer.from(`<svg width="333" height="30"><rect width="333" height="30" fill="white"/><text x="8" y="20" font-size="16" font-family="Arial">${page[n].name} ${view}</text></svg>`);
   layers.push({input:label,left:(n%3)*333,top:Math.floor(n/3)*270});
  }
  await sharp({create:{width:999,height:Math.ceil(page.length/3)*270,channels:3,background:'#f5f8fa'}}).composite(layers).png().toFile(path.join(dir,'phone-review-'+view+'-'+(i/9+1)+'.png'));
  console.log(view,i/9+1,page.length);
 }
}})().catch(error=>{console.error(error);process.exitCode=1;});
