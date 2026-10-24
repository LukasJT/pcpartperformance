'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {LANDINGS,ARTICLE}=require('./search-landing-content.cjs');
const origin=process.env.PCP_SEARCH_ORIGIN||'http://127.0.0.1:4238',directory=path.resolve('docs/seo-content-oct24/qa/after'),routes=[...Object.keys(LANDINGS),ARTICLE],results=[];
async function main(){
 fs.mkdirSync(directory,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const palette of ['arctic','midnight'])for(const width of [320,360,375,390,430,768,1024,1440,1920]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   await context.addInitScript(value=>localStorage.setItem('pcp-theme-palette',value),palette);
   for(const route of routes){
    const page=await context.newPage();const response=await page.goto(origin+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
    const locator=page.locator(route===ARTICLE?'[data-search-worksheet]':'[data-search-landing]');assert.equal(await locator.count(),1);assert(await locator.isVisible());
    const metrics=await locator.evaluate(el=>{const rect=el.getBoundingClientRect();return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,left:rect.left,right:rect.right,headingCount:el.querySelectorAll('h2').length};});
    assert(metrics.scrollWidth<=width+1,`${route} ${palette} ${width}: page overflow`);assert(metrics.left>=-1&&metrics.right<=width+1,`${route}: content escapes page`);assert.equal(metrics.headingCount,1);
    results.push({route,palette,width,state:'responsive',passed:true,metrics});
    if((palette==='arctic'&&[390,1440].includes(width))||(palette==='midnight'&&width===390)){await page.locator('h1').click();await locator.screenshot({path:path.join(directory,route.replaceAll('/','_')+width+'-'+palette+'.png'),animations:'disabled'});}
    if(palette==='arctic'&&width===390&&LANDINGS[route]){
     const summary=locator.locator('summary').first();await summary.focus();await page.keyboard.press('Enter');assert.equal(await locator.locator('details').first().getAttribute('open'),'');
     const height=await summary.evaluate(el=>el.getBoundingClientRect().height);assert(height>=44,route+' question touch target');
    }
    if(palette==='midnight'&&width===390){await page.evaluate(()=>document.documentElement.style.fontSize='200%');assert(await locator.isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' enlarged-text overflow');results.push({route,palette,width,state:'text-200-percent',passed:true});}
    await page.close();
   }
   await context.close();console.log('PASS '+palette+' '+width);
  }
  const noJS=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
  for(const route of routes){const page=await noJS.newPage();await page.goto(origin+route);const target=page.locator(route===ARTICLE?'[data-search-worksheet]':'[data-search-landing]');assert(await target.isVisible());assert((await target.innerText()).length>300);results.push({route,state:'JavaScript-disabled',passed:true});await page.close();}await noJS.close();
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();await page.goto(origin+'/builder/',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Expert',exact:true}).click();await page.getByRole('button',{name:/Choose Processor:/i}).first().click();
  await page.locator('#builder-picker-search').fill('Ryzen 7 9800X3D');await page.locator('#builder-picker-options .select-option').filter({hasText:'Ryzen 7 9800X3D'}).first().click();
  assert((await page.evaluate(()=>window.PCP_BUILD.snapshot())).parts.cpu.includes('9800x3d'));
  await page.getByRole('button',{name:/Choose Power supply:/i}).first().click();await page.keyboard.press('Escape');assert.equal(await page.locator('#builder-picker[open]').count(),0);
  assert(await page.locator('[data-search-landing]').isVisible());results.push({route:'/builder/',state:'CPU search/select and PSU dismiss',passed:true});await context.close();
 }finally{await browser.close();fs.writeFileSync(path.resolve('docs/seo-content-oct24/browser-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,scope:'Isolated Edge rendering; not physical iOS or field Core Web Vitals',states:results.length,passed:results.filter(r=>r.passed).length,results},null,2)+'\n');}
 console.log('All '+results.length+' rendered and functional states passed');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
