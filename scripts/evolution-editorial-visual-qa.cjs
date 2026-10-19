'use strict';

// Isolated local-file artwork QA; no profile access, network fetch or publication.
const fs=require('node:fs');
const path=require('node:path');
const {articles}=require('./evolution-editorial-data.cjs');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'docs/evolution-oct18/editorial/qa');
const sharp=require(process.env.PCP_SHARP_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
async function main(){
  fs.mkdirSync(output,{recursive:true});
  const rasterOnly=process.argv.includes('--raster-only');
  const browser=rasterOnly?null:await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const page=browser?await browser.newPage({viewport:{width:960,height:520}}):null;
  const results=[];
  try{
    for(const a of articles){
      const svg=fs.readFileSync(path.join(root,a.visual.path),'utf8');
      if(rasterOnly){await sharp(Buffer.from(svg)).png().toFile(path.join(output,a.id+'.png'));results.push({id:a.id,slug:a.slug,rasterDecoded:true,outside:[],collisions:[],boundsChecked:false});continue;}
      await page.setContent(`<style>body{margin:0}svg{display:block}</style>${svg}`);
      const bounds=await page.evaluate(()=>{
        const boxes=[...document.querySelectorAll('svg text')].map(n=>{const r=n.getBBox();return{text:n.textContent,x:r.x,y:r.y,width:r.width,height:r.height};});
        const outside=boxes.filter(r=>r.x<12||r.y<10||r.x+r.width>948||r.y+r.height>510);
        const collisions=[];
        for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];const w=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x),h=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);if(w>4&&h>4)collisions.push([a.text,b.text,{w,h}]);}
        return{outside,collisions,textNodes:boxes.length};
      });
      await page.screenshot({path:path.join(output,a.id+'.png')});
      results.push({id:a.id,slug:a.slug,...bounds});
    }
  }finally{if(browser)await browser.close();}
  for(let batch=0;batch<9;batch++){
    const inputs=await Promise.all(articles.slice(batch*4,batch*4+4).map(a=>sharp(path.join(output,a.id+'.png')).resize(768,416).toBuffer()));
    await sharp({create:{width:1536,height:832,channels:4,background:'#ffffff'}}).composite(inputs.map((input,i)=>({input,left:(i%2)*768,top:Math.floor(i/2)*416}))).png().toFile(path.join(output,`contact-${batch+1}.png`));
  }
  const failures=results.filter(r=>r.outside.length||r.collisions.length);
  fs.writeFileSync(path.join(output,rasterOnly?'raster-decode.json':'visual-bounds.json'),JSON.stringify({runAt:new Date().toISOString(),environment:rasterOnly?'Sharp/libvips local SVG decode; text bounds not checked':'Isolated headless Microsoft Edge, local generated SVGs, system UI font, 960×520',artworks:36,failures:failures.length,results},null,2)+'\n');
  console.log(JSON.stringify({artworks:36,failures},null,2));
  if(failures.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
