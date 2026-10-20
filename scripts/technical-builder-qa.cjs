'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.PCP_STUDIO_ORIGIN||'http://127.0.0.1:4213',directory=path.resolve('docs/technical-refinement');
async function main(){
 fs.mkdirSync(directory,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[];
 try{
  for(const palette of ['arctic','midnight'])for(const width of [320,360,375,390,430,768,1024,1440,1920]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   await context.addInitScript(p=>{localStorage.setItem('pcp-theme-palette',p);localStorage.setItem('pcp-ad-consent','declined');},palette);
   const page=await context.newPage();await page.goto(origin+'/builder/',{waitUntil:'networkidle'});
   await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));
   await page.locator('[data-evolution-ready]').waitFor();
   assert.equal(await page.locator('[data-builder-mode=expert]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.builder-row:visible').count(),10);
   assert.equal(await page.locator('#builder-sections').isVisible(),false);
   async function audit(state){
    const evidence=await page.evaluate(()=>{
     const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
     const shown=e=>!!(e&&e.getBoundingClientRect().width&&e.getBoundingClientRect().height);
     const rows=[...document.querySelectorAll('.builder-row')].filter(shown).map(row=>({row:rect(row),photo:rect(row.querySelector('.builder-workspace-thumbnail')),category:rect(row.querySelector('.builder-type')),control:rect(row.querySelector('.select-trigger'))}));
     const current=window.PCP_BUILD.snapshot().parts;
     return {width:document.documentElement.scrollWidth,rows,count:Object.values(current).flat().length,categories:Object.values(current).filter(x=>x.length).length,displayCount:Number(document.querySelector('[data-build-part-count]').textContent),displayCategories:Number(document.querySelector('[data-build-category-count]').textContent),ring:document.querySelector('.builder-meter-value').getAttribute('stroke-dasharray')};
    });
    assert(evidence.width<=width,`${palette} ${width} ${state}: overflow`);
    assert.equal(evidence.displayCount,evidence.count);assert.equal(evidence.displayCategories,evidence.categories);assert.equal(evidence.ring,evidence.categories+' 10');
    for(const r of evidence.rows){assert(r.photo.right<=r.category.x+1,'thumbnail collides with category');assert(r.control.right<=r.row.right+1,'selector escapes row');assert(r.category.bottom<=r.control.y+1||r.category.right<=r.control.x+1,'category collides with selector');}
    results.push({palette,width,state,passed:true,...evidence});
   }
   await audit('empty');
   if([390,1440].includes(width))await page.screenshot({path:path.join(directory,`builder-empty-${width}-${palette}.png`),animations:'disabled'});
   await page.locator('#builder-starter').click();await page.waitForFunction(()=>Number(document.querySelector('[data-build-part-count]').textContent)>0);await audit('starter');
   assert(await page.locator('.builder-workspace-thumbnail img').count()>0);
   if([390,1440].includes(width))await page.screenshot({path:path.join(directory,`builder-populated-${width}-${palette}.png`),animations:'disabled'});
   await page.locator('#builder-workflow a[href="#build-preview"]').click();assert.equal(await page.locator('.builder-overview').isVisible(),false);
   await page.locator('#builder-workflow a').first().click();assert(await page.locator('.builder-overview').isVisible());
   await page.locator('[data-builder-mode=guided]').click();assert.equal(await page.locator('.builder-row:visible').count(),1);await audit('guided');
   await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-builder-mode=guided]').getAttribute('aria-pressed'),'true');
   await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));
   await page.locator('[data-builder-mode=expert]').click();
   await page.getByRole('button',{name:/Choose Processor:/}).first().click();await page.locator('#builder-picker-search').fill('Ryzen 7 9800X3D');
   if([390,1440].includes(width))await page.screenshot({path:path.join(directory,`picker-${width}-${palette}.png`),animations:'disabled'});
   await page.keyboard.press('Escape');assert.equal(await page.locator('#builder-picker[open]').count(),0);
   await page.locator('#builder-clear').click();await page.waitForFunction(()=>document.querySelector('[data-build-part-count]').textContent==='0');
   await page.locator('.select-trigger-text').first().evaluate(e=>e.textContent='An exceptionally long exact manufacturer model and OC revision name for layout verification');
   await page.evaluate(()=>document.documentElement.style.fontSize='150%');await audit('long name and enlarged text');
   await context.close();console.log('PASS '+palette+' '+width);
  }
 }finally{await browser.close();fs.writeFileSync(path.join(directory,'builder-qa.json'),JSON.stringify({origin,results},null,2)+'\n');}
 console.log(results.length+' builder layout and state checks passed');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
