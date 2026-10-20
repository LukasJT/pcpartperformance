'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.PCP_STUDIO_ORIGIN||'http://127.0.0.1:4212',directory=path.resolve('docs/clean-studio/qa');
const widths=[320,360,375,390,430,768,1024,1440,1920];
const routes=['/','/builder/','/my-pc/','/upgrade/','/compare/?parts=rtx5070,rtx5060ti16&mode=interactive','/hardware/','/learn/9800x3d.html','/blog/','/blog/understanding-pc-memory/','/build-school/'];
async function main(){
 fs.mkdirSync(directory,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),reports=[];
 try{
  for(const palette of ['arctic','midnight'])for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:width<600?844:1000},hasTouch:width<600,isMobile:width<600,reducedMotion:'reduce',colorScheme:palette==='arctic'?'light':'dark'});
   await context.addInitScript(palette=>{localStorage.setItem('pcp-theme-palette',palette);localStorage.setItem('pcp-ad-consent','declined');},palette);
   const page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&/\.(?:css|js|webp|png|svg|woff2)(?:\?|$)/.test(r.url())&&r.status()>=400)errors.push(r.status()+' '+r.url());});
   async function audit(state){
    await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));
    const metrics=await page.evaluate(()=>{
     const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
     const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
     const wordLines=e=>{const range=document.createRange();range.selectNodeContents(e);return new Set([...range.getClientRects()].filter(r=>r.width>0).map(r=>Math.round(r.y))).size;};
     const menu=[...document.querySelectorAll('.ui-site-menu .clarity-nav>a>span')].filter(visible).map(e=>({text:e.textContent,lines:wordLines(e)}));
     const add=[...document.querySelectorAll('.builder-picker .select-check>span')].filter(visible).map(e=>({text:e.textContent,lines:wordLines(e)}));
     const collisions=[...document.querySelectorAll('.total-feature-row')].filter(visible).map(e=>{const title=e.querySelector('strong'),detail=e.querySelector('small');return title&&detail?{title:rect(title),detail:rect(detail)}:null;}).filter(Boolean).filter(r=>r.title.bottom>r.detail.y+1);
     const images=[...document.images].filter(e=>{const r=e.getBoundingClientRect();return visible(e)&&r.top<innerHeight&&r.bottom>0&&e.complete&&!e.naturalWidth;}).map(e=>e.src);
     const dialog=document.querySelector('#builder-picker[open]');const close=dialog?.querySelector('.select-close');
     return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,menu,add,collisions,brokenImages:images,dialog:dialog?rect(dialog):null,close:close?rect(close):null};
    });
    const failures=[];if(metrics.documentWidth>width)failures.push('horizontal overflow');if(state.includes('picker')&&!metrics.dialog)failures.push('picker unexpectedly closed');if(metrics.menu.some(r=>r.lines>1))failures.push('navigation label wrapped');if(metrics.add.some(r=>r.lines>1))failures.push('Add label wrapped');if(metrics.collisions.length)failures.push('feature copy collision');if(metrics.brokenImages.length)failures.push('broken image');if(metrics.close&&(metrics.close.y<0||metrics.close.bottom>(await page.viewportSize()).height+1))failures.push('close control obscured');if(errors.length)failures.push(...errors.splice(0));
    reports.push({palette,width,route:new URL(page.url()).pathname,state,passed:!failures.length,failures,metrics});
    if(failures.length)await page.screenshot({path:path.join(directory,'failure-'+reports.length+'.png'),animations:'disabled'});
   }
   for(const route of routes){
    const response=await page.goto(origin+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);await page.evaluate(()=>document.fonts.ready);await audit('page');
    if(route==='/builder/'){
     if(width<=1024){await page.getByRole('button',{name:'Menu',exact:true}).click();await audit('menu');if(width<600){await page.evaluate(()=>document.documentElement.style.fontSize='150%');await audit('menu enlarged text');await page.evaluate(()=>document.documentElement.style.fontSize='');}await page.keyboard.press('Escape');}
     await page.getByRole('button',{name:'Expert',exact:true}).click();await page.getByRole('button',{name:/Choose Processor:/i}).first().click();
     await page.waitForFunction(()=>[...document.querySelectorAll('#builder-picker img')].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).every(i=>i.complete&&i.naturalWidth>0));await audit('CPU picker');
     if(width<600){await page.setViewportSize({width,height:390});await audit('picker reduced visible height');await page.setViewportSize({width,height:844});}
     const search=page.locator('#builder-picker-search');await search.fill('Ryzen 7 9800X3D');await page.locator('#builder-picker-options .select-option').filter({hasText:'Ryzen 7 9800X3D'}).first().click();
     assert((await page.evaluate(()=>window.PCP_BUILD.snapshot())).parts.cpu.includes('9800x3d'));await audit('CPU selected');
     await page.getByRole('button',{name:/Choose Power supply:/i}).first().click();await audit('PSU picker');await page.keyboard.press('Escape');
     assert.equal(await page.locator('#builder-picker[open]').count(),0);
    }
   }
   await context.close();console.log(JSON.stringify({palette,width,cases:reports.filter(r=>r.palette===palette&&r.width===width).length,failures:reports.filter(r=>r.palette===palette&&r.width===width&&!r.passed).length}));
  }
  // A populated local fixture checks real dashboard counts and restore links.
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const workspace=require('./oct16-workspace.js').blank();workspace.watchlist=['9800x3d','rtx5070'];
  await context.addInitScript(workspace=>{localStorage.setItem('pcp-theme-palette','arctic');localStorage.setItem('pcp-ad-consent','declined');localStorage.setItem('pcp-my-pc-workspace-v1',JSON.stringify(workspace));localStorage.setItem('pcp-build-revisions-v1',JSON.stringify({schema:1,revisions:[{schema:1,id:'studio-browser-fixture',name:'A saved build with a deliberately long but readable title',region:'CA',currency:'CAD',parts:{cpu:['9800x3d'],gpu:['rtx5070'],ram:[],board:[],ssd:[],hdd:[],psu:[],case:[],fan:[],cooler:[]},savedAt:'2026-10-20T12:00:00Z'}]}));},workspace);
  const page=await context.newPage();await page.goto(origin+'/my-pc/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-studio-build-count]').textContent(),'1');assert.equal(await page.locator('[data-studio-watch-count]').textContent(),'2');assert.equal(await page.locator('[data-studio-comparison-count]').textContent(),'0');
  const continueURL=await page.locator('[data-studio-continue]').getAttribute('href');assert(continueURL.includes('9800x3d'));assert(!continueURL.includes('note='));
  await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));await page.screenshot({path:path.join(directory,'workspace-populated-390.png'),fullPage:false,animations:'disabled'});reports.push({state:'populated workspace counts and public restore link',passed:true,builds:1,watched:2,comparisons:0});await context.close();
 }finally{await browser.close();fs.writeFileSync(path.join(directory,'browser-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,scope:'Isolated Edge; viewport and touch emulation, not physical iOS Safari. Reduced-height picker approximates lost screen space, not a real software keyboard.',reports},null,2)+'\n');}
 const failures=reports.filter(r=>!r.passed);console.log(JSON.stringify({cases:reports.length,failures:failures.length}));if(failures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
