'use strict';
/* Isolated browser QA; never attaches to a personal browser profile. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const phase=process.argv.includes('--before')?'before':'after';
const origin=process.env.PCP_TOTAL_ORIGIN||'http://127.0.0.1:4200';
const label=process.env.PCP_TOTAL_QA_LABEL||phase;if(!/^[a-z0-9-]+$/.test(label))throw Error('Use a simple QA output label');
const directory=path.resolve('docs/total-refinement/qa/broad',label);
const widths=(process.env.PCP_TOTAL_WIDTHS||'320,360,375,390,430,768,1024,1440,1920').split(',').map(Number);
const themes=(process.env.PCP_TOTAL_THEMES||'dark,light').split(',');
const routes=[['home','/'],['builder','/builder/'],['upgrade','/upgrade/'],['compare','/compare/'],['workspace','/my-pc/'],['hardware','/hardware/'],['product','/learn/rtx5070.html'],['compatibility','/compatibility/'],['shop','/shop/'],['school','/build-school/'],['blog','/blog/'],['article','/blog/32gb-vs-64gb-ram-workloads/'],['search','/search/?q=gpu'],['performance','/performance/'],['phones','/phones/size-compare/'],['prebuilts','/prebuilts/'],['laptops','/laptops/'],['tools','/tools/'],['news','/news/'],['monitor','/tools/monitor-pixel-density/']];
const selected=process.env.PCP_TOTAL_ROUTES?routes.filter(([name])=>process.env.PCP_TOTAL_ROUTES.split(',').includes(name)):routes;
async function main(){
 fs.mkdirSync(directory,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),reports=[];
 try{
  for(const theme of themes)for(const width of widths){
   const mode=['light','arctic','paper'].includes(theme)?'light':'dark';
   const context=await browser.newContext({viewport:{width,height:width<600?844:1000},isMobile:width<600,hasTouch:width<600,deviceScaleFactor:1,colorScheme:mode,reducedMotion:'reduce'});
   await context.addInitScript(({mode,theme})=>{localStorage.setItem('pcp-theme',mode);localStorage.setItem('pcp-theme-palette',theme==='dark'?'midnight':theme==='light'?'arctic':theme);localStorage.setItem('pcp-ad-consent','declined');},{mode,theme});
   const page=await context.newPage();page.setDefaultTimeout(10000);
   for(const [name,route]of selected){
    const errors=[],assetErrors=[],capture=error=>errors.push(error.message),assetCapture=response=>{if(response.status()>=400&&/\.(?:css|m?js)$/.test(new URL(response.url()).pathname))assetErrors.push({url:response.url(),status:response.status()});};page.on('pageerror',capture);page.on('response',assetCapture);
    const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('h1').first().waitFor();await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,4000))]));
    await page.evaluate(()=>Promise.race([Promise.allSettled([...document.images].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;}).map(e=>e.decode())),new Promise(resolve=>setTimeout(resolve,6000))]));
    const measured=await page.evaluate(()=>{
     const viewport=document.documentElement.clientWidth;
     const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
     const overflows=[...document.querySelectorAll('main *, .site-header *')].filter(e=>visible(e)&&e.getBoundingClientRect().right>viewport+1&&!e.closest('dialog,[role=dialog]')&&!e.closest('.ui-site-menu:not([role=dialog])')).slice(0,12).map(e=>({tag:e.tagName,class:String(e.className),right:Math.round(e.getBoundingClientRect().right)}));
     const nav=document.querySelector('.site-header'),h1=document.querySelector('h1');
     return{title:document.title,width:document.documentElement.scrollWidth,viewport,theme:document.documentElement.dataset.theme,palette:document.documentElement.dataset.palette||null,headerHeight:nav?.getBoundingClientRect().height,h1:h1?.textContent,headings:[...document.querySelectorAll('main h2')].map(e=>e.textContent),initialText:document.querySelector('main')?.innerText.slice(0,1600),overflows,brokenImages:[...document.images].filter(e=>visible(e)&&e.complete&&e.naturalWidth===0).map(e=>e.currentSrc),pendingImages:[...document.images].filter(e=>visible(e)&&!e.complete&&e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0).map(e=>e.currentSrc||e.src),navigation:performance.getEntriesByType('navigation').map(e=>({responseStart:e.responseStart,domContentLoaded:e.domContentLoadedEventEnd,transferSize:e.transferSize})),assets:performance.getEntriesByType('resource').filter(e=>/script|link|css|img/.test(e.initiatorType)).map(e=>({url:new URL(e.name).pathname,transferSize:e.transferSize,decodedBodySize:e.decodedBodySize}))};
    });
    if(await page.locator('#completion-a11y-run').count())await page.locator('#completion-a11y-run').evaluate(e=>{e.hidden=true;});
    const filename=`${name}-${width}-${theme}.png`;await page.screenshot({path:path.join(directory,filename),animations:'disabled'});
    reports.push({route,name,requestedWidth:width,width,theme,status:response.status(),...measured,errors,assetErrors,screenshot:filename});
    if(name==='builder'&&width===390&&['dark','light','midnight','arctic'].includes(theme)){
     for(const category of ['CPU','Power supply']){
      const expert=page.getByRole('button',{name:'Expert',exact:true});if(await expert.isVisible())await expert.click();
      const label=category==='CPU'?'Processor':category;
      const trigger=page.getByRole('button',{name:new RegExp('Choose '+label+':','i')});
      if(await trigger.count()){
       await trigger.first().click();await page.locator('#builder-picker').waitFor({state:'visible'});
       const file=`picker-${category==='CPU'?'cpu':'psu'}-${width}-${theme}.png`;await page.screenshot({path:path.join(directory,file),animations:'disabled'});
       reports.push({route,state:'picker '+category,width,theme,screenshot:file,box:await page.locator('#builder-picker').boundingBox(),activeElement:await page.evaluate(()=>({tag:document.activeElement.tagName,role:document.activeElement.getAttribute('role')}))});
       await page.getByRole('button',{name:'Close choices',exact:true}).click();
      }
     }
    }
    if(name==='home'&&width===390){await page.getByRole('button',{name:'Menu',exact:true}).click();const file=`menu-${width}-${theme}.png`;await page.screenshot({path:path.join(directory,file),animations:'disabled'});reports.push({route,state:'mobile menu',width,theme,screenshot:file,mainInert:await page.locator('main').evaluate(e=>e.inert)});await page.keyboard.press('Escape');}
    page.removeListener('pageerror',capture);page.removeListener('response',assetCapture);
    console.log(JSON.stringify({phase,name,width,theme,status:response.status(),overflow:measured.width>measured.viewport,errors:errors.length}));
   }
   await context.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),phase,origin,widths,themes,reports,scope:'Isolated headless Edge, emulated sizes and touch; reduced motion for reproducible screenshots; local consent declined. Navigation/resource timings are lab observations, not field Core Web Vitals or proof of a physical mobile keyboard.'},null,2)+'\n');}
 const failures=reports.filter(r=>(r.viewport&&r.width>r.viewport)||r.errors?.length||r.assetErrors?.length||r.brokenImages?.length||r.pendingImages?.length);
 console.log(JSON.stringify({phase,cases:reports.length,failures:failures.map(r=>({name:r.name,width:r.width,theme:r.theme,errors:r.errors,overflows:r.overflows,brokenImages:r.brokenImages}))}));
 if(phase==='after'&&failures.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
