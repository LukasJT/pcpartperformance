'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const playwright=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.PCP_TOTAL_ORIGIN||'http://127.0.0.1:4200',output=path.resolve('docs/total-refinement/qa/consoles');
const widths=(process.env.PCP_TOTAL_WIDTHS||'320,360,375,390,430,768,1024,1440,1920').split(',').map(Number);
async function main(){
 fs.mkdirSync(output,{recursive:true});const browser=await playwright.chromium.launch({executablePath:process.env.PCP_BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),results=[],failures=[];
 try{
 for(const theme of ['light','dark'])for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',colorScheme:theme,isMobile:width<768,hasTouch:width<768});await context.addInitScript(t=>{localStorage.setItem('pcp-theme',t);localStorage.setItem('pcp-theme-palette',t==='dark'?'midnight':'arctic');},theme);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
  try{
   for(const [slug,count,selector] of [['consoles',6,'.total-console-card'],['retro',16,'.total-retro-timeline>li']]){
    const response=await page.goto(origin+'/performance/'+slug+'/',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);await page.locator(selector).first().waitFor();assert.equal(await page.locator(selector).count(),count);
    const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,art:[...document.querySelectorAll('.total-console-silhouette')].map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})),headingPx:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),cardTitlePx:parseFloat(getComputedStyle(document.querySelector('.total-console-card h2,.total-retro-timeline h2')).fontSize),title:document.title,canonical:document.querySelector('link[rel="canonical"]')?.href}));
    assert(!geometry.overflow,slug+' page overflow');assert(geometry.art.every(a=>a.width>40&&a.height>30));assert(geometry.headingPx<=44,JSON.stringify(geometry));assert(geometry.cardTitlePx>=17&&geometry.cardTitlePx<=24,JSON.stringify(geometry));assert(geometry.canonical?.endsWith('/performance/'+slug+'/'),geometry.canonical);assert(!/Switch2|PlayStation5/.test(geometry.title));
    await page.addStyleTag({content:'#completion-a11y-run{display:none!important}'});await page.screenshot({path:path.join(output,slug+'-'+theme+'-'+width+'.png'),fullPage:true});
    const detail=page.locator(selector+' details').first();await detail.locator('summary').click();assert(await detail.evaluate(x=>x.open));assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),slug+' details overflow');
    assert.equal(errors.length,0,errors.join('\n'));results.push({slug,width,theme,passed:true,...geometry});
   }
  }catch(error){failures.push({width,theme,error:error.message,pageErrors:errors});await page.screenshot({path:path.join(output,'failure-'+theme+'-'+width+'.png'),fullPage:true}).catch(()=>{});}
  await context.close();
 }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,browser:'Isolated headless Edge Chromium; not iOS Safari',results,failures},null,2));console.log(JSON.stringify({passed:results.length,failed:failures.length,report:path.join(output,'report.json')}));if(failures.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
