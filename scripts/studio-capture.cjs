'use strict';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.PCP_STUDIO_ORIGIN||'https://www.pcpartperformance.com';
const phase=process.env.PCP_STUDIO_PHASE||'before';
const directory=path.resolve('docs/clean-studio/screenshots',phase);
const routes=[['home','/'],['builder','/builder/'],['workspace','/my-pc/'],['upgrade','/upgrade/'],['compare','/compare/?parts=rtx5070,rtx5060ti16&mode=interactive'],['hardware','/hardware/'],['product','/learn/9800x3d.html'],['learn','/blog/'],['article','/blog/understanding-pc-memory/'],['school','/build-school/']];
async function main(){
 fs.mkdirSync(directory,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[];
 try{for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},colorScheme:'light',reducedMotion:'reduce',isMobile:width===390,hasTouch:width===390});
  await context.addInitScript(()=>{localStorage.setItem('pcp-theme-palette','arctic');localStorage.setItem('pcp-ad-consent','declined');});
  const page=await context.newPage();
  for(const [name,route] of routes){
   await page.goto(origin+route,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));
   const file=name+'-'+width+'.png';await page.screenshot({path:path.join(directory,file),fullPage:false,animations:'disabled'});
   results.push({name,route,width,file,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   if(name==='home')await page.screenshot({path:path.join(directory,'home-full-'+width+'.png'),fullPage:true,animations:'disabled'});
   if(name==='builder'){
    await page.getByRole('button',{name:'Expert',exact:true}).click();
    await page.getByRole('button',{name:/Choose Processor:/i}).first().click();
    await page.waitForFunction(()=>[...document.querySelectorAll('#builder-picker img')].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).every(i=>i.complete&&i.naturalWidth>0));
    await page.screenshot({path:path.join(directory,'picker-'+width+'.png'),animations:'disabled'});
   }
  }
  await context.close();
 }}finally{await browser.close();fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify({origin,phase,checkedAt:new Date().toISOString(),results},null,2)+'\n');}
 console.log(JSON.stringify({origin,phase,cases:results.length,overflow:results.filter(r=>r.overflow)}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
