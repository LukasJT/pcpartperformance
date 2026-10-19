'use strict';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const directory=path.resolve('docs/total-refinement/qa/ad-semantics'),origin=process.env.PCP_TOTAL_ORIGIN||'http://127.0.0.1:4200';
async function main(){
 fs.mkdirSync(directory,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),reports=[];
 try{
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce'});
   await context.addInitScript(()=>{localStorage.setItem('pcp-ad-consent','declined');localStorage.setItem('pcp-theme-palette','arctic');});const page=await context.newPage();
   for(const route of ['/','/upgrade/','/tools/monitor-pixel-density/','/hardware/','/build-school/','/compatibility/','/blog/','/blog/32gb-vs-64gb-ram-workloads/','/tools/','/news/','/phones/size-compare/','/builder/']){
    const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.axe);await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(element=>element.remove()));
    const result=await page.evaluate(async()=>{
     const result=await window.axe.run(document,{preload:false,runOnly:{type:'rule',values:['aria-prohibited-attr']},resultTypes:['violations']});
     return {slots:[...document.querySelectorAll('.pcp-ad-slot')].map(element=>({tag:element.tagName,role:element.getAttribute('role'),name:element.getAttribute('aria-label'),type:element.dataset.pcpAd})),violations:result.violations.map(violation=>({id:violation.id,nodes:violation.nodes.map(node=>({target:node.target,html:node.html,summary:node.failureSummary}))}))};
    });
    const allowed=result.slots.every(slot=>slot.tag==='ASIDE'||['complementary','region','group'].includes(slot.role)),expectedSlots=route==='/builder/'?result.slots.length===0:result.slots.length>0;
    reports.push({route,width,status:response.status(),...result,passed:response.status()===200&&allowed&&expectedSlots&&result.violations.length===0});console.log(JSON.stringify({route,width,slots:result.slots.length,passed:reports.at(-1).passed}));
   }
   await context.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),scope:'Actual rendered pages, axe-core aria-prohibited-attr only, two viewport widths; not a complete accessibility certification.',origin,reports},null,2)+'\n');}
 if(reports.some(report=>!report.passed))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
