'use strict';
/* Isolated headless development QA. Never attaches to a user's browser/profile. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const directory=path.resolve('docs/ui-refinement-oct17'),phase=process.argv.includes('--before')?'before':'after';
const origin=process.env.PCP_UI_ORIGIN||'http://127.0.0.1:4198';
const routes=[['builder','/builder/'],['home','/'],['upgrade','/upgrade/'],['compare','/compare/'],['learn','/blog/'],['workspace','/my-pc/'],['hardware','/hardware/graphics-cards/'],['shop','/shop/'],['phones','/phones/'],['compatibility','/compatibility/'],['performance','/performance/'],['product','/learn/rtx5070.html'],['guide','/blog/32gb-vs-64gb-ram-workloads/']];
if(phase==='after')routes.push(['phone-compare','/phones/size-compare/'],['school','/build-school/'],['prebuilts','/prebuilts/'],['laptops','/laptops/'],['tools','/tools/'],['troubleshooting','/troubleshooting/'],['news','/news/']);
const selectedRoutes=process.env.PCP_UI_ONLY?routes.filter(([name])=>process.env.PCP_UI_ONLY.split(',').includes(name)):routes;
async function main(){
 fs.mkdirSync(path.join(directory,phase),{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const reports=[];
 try{
  for(const width of process.env.PCP_UI_WIDTHS?process.env.PCP_UI_WIDTHS.split(',').map(Number):phase==='before'?[390,1440]:[360,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:width<600?844:960},isMobile:width<600,hasTouch:width<600,deviceScaleFactor:1,colorScheme:process.env.PCP_UI_THEME||'dark'});
   const page=await context.newPage();page.setDefaultTimeout(10000);
   for(const[name,route]of selectedRoutes){
    const errors=[];const capture=error=>errors.push(String(error.message));page.on('pageerror',capture);
    const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('h1').first().waitFor();await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]));
    const report=await page.evaluate(()=>({title:document.title,viewport:document.documentElement.clientWidth,innerWidth,width:document.documentElement.scrollWidth,header:document.querySelector('.site-header')?.getBoundingClientRect().height,h1:document.querySelector('h1')?.textContent,mainText:document.querySelector('main')?.innerText.slice(0,3600),headings:[...document.querySelectorAll('main h2')].map(e=>e.textContent),overflowElements:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>document.documentElement.clientWidth+1&&!e.closest('dialog')&&!e.closest('.ui-site-menu:not([role=dialog])');}).slice(0,15).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right})),buttons:[...document.querySelectorAll('main button')].slice(0,16).map(e=>({text:e.textContent,name:e.getAttribute('aria-label')}))}));
    if(await page.locator('#completion-a11y-run').count()){
     await page.locator('#completion-a11y-run').evaluate(e=>{e.hidden=true;});
     if(phase==='after'){
      await page.locator('#completion-a11y-results[data-state="complete"]').waitFor({state:'attached',timeout:20000});
      const a11y=JSON.parse(await page.locator('#completion-a11y-results').textContent());report.a11y={axeVersion:a11y.axeVersion,violations:a11y.violations,incomplete:a11y.incomplete?.length||0};
     }
    }
    await page.evaluate(()=>Promise.race([Promise.allSettled(document.getAnimations().filter(a=>a.playState==='running'&&Number.isFinite(a.effect?.getComputedTiming()?.endTime)&&a.effect.getComputedTiming().endTime<=1500).map(a=>a.finished)),new Promise(resolve=>setTimeout(resolve,1600))]));
    const screenshot=`${name}-${width}${process.env.PCP_UI_THEME==='light'?'-light':''}.png`;await page.screenshot({path:path.join(directory,phase,screenshot),animations:'disabled'});
    reports.push({route,status:response.status(),...report,errors,screenshot});console.log(JSON.stringify({phase,route,width,status:response.status(),overflow:report.width>width,header:report.header,errors:errors.length}));
    if(name==='builder'&&width===390){
     await page.getByRole('button',{name:'Expert',exact:true}).click();
      const trigger=page.getByRole('button',{name:/Choose Power supply:/i});
     if(await trigger.count()){
      await trigger.click();await page.locator('#builder-picker').waitFor({state:'visible'});
      await page.screenshot({path:path.join(directory,phase,process.env.PCP_UI_THEME==='light'?'picker-390-light.png':'picker-390.png'),animations:'disabled'});
      reports.push({route,interaction:'open PSU picker',width,focused:await page.evaluate(()=>({tag:document.activeElement.tagName,role:document.activeElement.getAttribute('role')})),text:await page.locator('#builder-picker').innerText(),rect:await page.locator('#builder-picker').boundingBox()});
      await page.getByRole('button',{name:'Close choices',exact:true}).click();
     }
    }
    page.removeListener('pageerror',capture);
   }
   await context.close();
  }
 }finally{await browser.close();const filename=process.env.PCP_UI_REPORT||phase+'-browser.json';if(!/^[a-z0-9-]+\.json$/.test(filename))throw Error('Invalid QA report filename');fs.writeFileSync(path.join(directory,filename),JSON.stringify({checkedAt:new Date().toISOString(),phase,origin,reports,scope:'Isolated headless Edge, emulated viewport/touch. Local axe-core checks are automated only. Only the injected QA button is hidden in screenshots. Not a physical phone or field performance test.'},null,2)+'\n');}
 if(reports.some(r=>(r.viewport&&r.width>r.viewport)||r.errors?.length||r.a11y?.violations?.length))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
