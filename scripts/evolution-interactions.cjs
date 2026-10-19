'use strict';
/* Prepared browser gate. An unexecuted runner is not a passing interaction test. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.PCP_EVOLUTION_ORIGIN||'http://127.0.0.1:4198';
const directory=path.resolve('docs/evolution-oct18/qa/interactions');
async function main(){
 fs.mkdirSync(directory,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme:'dark',reducedMotion:'reduce'});
 await context.addInitScript(()=>{if(!localStorage.getItem('pcp-ad-consent'))localStorage.setItem('pcp-ad-consent','declined');if(!localStorage.getItem('pcp-theme-palette'))localStorage.setItem('pcp-theme-palette','midnight');});
 const page=await context.newPage(),checks=[];page.setDefaultTimeout(15000);
 const visit=async route=>{await page.goto(origin+route,{waitUntil:'domcontentloaded'});await page.locator('h1').first().waitFor();};
 const fits=async()=>{const r=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert(r.scroll<=r.client,JSON.stringify(r));return r;};
 const test=async(name,action)=>{try{checks.push({name,passed:true,evidence:await action()});console.log('PASS '+name);}catch(error){checks.push({name,passed:false,error:String(error)});await page.screenshot({path:path.join(directory,'failed-'+checks.length+'.png'),animations:'disabled'}).catch(()=>{});console.error('FAIL '+name+': '+error.message);}};
 try{
  await test('Compact menu, focus loop, consent inertness and appearance handoff at 320px',async()=>{
   await page.setViewportSize({width:320,height:740});await visit('/builder/');
   await page.evaluate(()=>{if(!document.querySelector('.pcp-ad-consent')){const banner=document.createElement('aside');banner.className='pcp-ad-consent';banner.innerHTML='<button>Consent fixture</button>';document.body.append(banner);}});
   const header=await page.locator('.site-header').boundingBox();assert(header.height<=80);
   await page.getByRole('button',{name:'Menu',exact:true}).click();const menu=page.getByRole('dialog',{name:'Explore the site',exact:true});await menu.waitFor({state:'visible'});
   assert(await page.locator('main').evaluate(e=>e.inert));assert(await page.locator('.pcp-ad-consent').evaluate(e=>e.inert));
   await page.getByRole('button',{name:'Close menu',exact:true}).focus();await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>document.activeElement.hasAttribute('data-appearance-open')));await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close menu');
   assert(await menu.getByRole('link',{name:'Phone comparison',exact:true}).isVisible());assert(await menu.getByRole('link',{name:'Game FPS',exact:true}).isVisible());
   await menu.locator('[data-appearance-open]').click();await page.locator('#lab-appearance').waitFor({state:'visible'});assert.equal(await page.locator('main').evaluate(e=>e.inert),false);
   await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Menu');
   assert.equal(await page.locator('.pcp-ad-consent').evaluate(e=>e.inert),false);return{headerHeight:header.height,...await fits(),consentFixture:'checks late DOM addition; not proof of live ad networking'};
  });
  await test('Six palettes persist without changing the selected parts; manual contrast and motion',async()=>{
   await page.setViewportSize({width:390,height:844});await visit('/builder/');const before=await page.evaluate(()=>JSON.stringify(window.PCP_BUILD.snapshot().parts));
   const palettes=['midnight','arctic','solar','aurora','neon','paper'];
   for(const id of palettes){await page.locator('[data-appearance-open]:visible').first().click();await page.locator('[data-palette-choice="'+id+'"]').click();assert.equal(await page.locator('html').getAttribute('data-palette'),id);await page.locator('[data-appearance-close]').click();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(id=>document.documentElement.dataset.palette===id,id);await fits();}
   assert.equal(await page.evaluate(()=>JSON.stringify(window.PCP_BUILD.snapshot().parts)),before);
   await page.locator('[data-appearance-open]:visible').first().click();await page.locator('[data-lab-contrast]').check();await page.locator('[data-lab-reduce]').check();await page.locator('[data-lab-ambient]').uncheck();await page.locator('[data-appearance-close]').click();
   assert.equal(await page.locator('html').getAttribute('data-contrast'),'high');assert.equal(await page.locator('html').getAttribute('data-motion'),'reduced');assert.equal(await page.locator('html').getAttribute('data-ambient'),'off');return{palettes,partsUnchanged:true};
  });
  await test('Three actual builder stages, CPU/PSU sheets, filters, search, skip and focus return',async()=>{
   await visit('/builder/');const workflow=page.locator('#builder-workflow');await page.waitForFunction(()=>!!document.querySelector('[data-evolution-ready]'));
   await workflow.locator('a[href="#build-preview"]').click();assert(await page.locator('#build-preview').isVisible());assert.equal(await page.locator('.builder-parts').isVisible(),false);
   await workflow.locator('a[href="#readiness-report"]').click();assert(await page.locator('#readiness-report').isVisible());assert.equal(await page.locator('#build-preview').isVisible(),false);
   await workflow.locator('a[href="#builder-guidance"]').click();await page.getByRole('button',{name:'Expert',exact:true}).click();
   for(const category of ['Processor','Power supply']){await page.getByRole('button',{name:new RegExp('Choose '+category+':','i')}).first().click();const modal=page.locator('#builder-picker');await modal.waitFor({state:'visible'});assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('role')),'listbox');assert(await modal.locator('#builder-picker-search').isVisible());assert.equal(await modal.locator('.picker-empty-option').count(),0);const skip=await modal.locator('.builder-picker-skip').boundingBox();assert(skip.height>=44&&skip.height<=64);assert(await modal.getByRole('listbox').getByRole('option').count()>0);const hints=modal.locator('.select-hint');assert.equal(await hints.isVisible(),false);await page.setViewportSize({width:390,height:530});const box=await modal.boundingBox();assert(box.y>=0&&box.y+box.height<=531);await modal.getByRole('button',{name:'Close choices',exact:true}).click();await page.setViewportSize({width:390,height:844});}
   await page.getByRole('button',{name:/Choose Power supply:/i}).click();const modal=page.locator('#builder-picker');await modal.locator('.builder-picker-filters>summary').click();const brands=modal.locator('.select-brand-filters input');assert(await brands.count()>=2);await brands.nth(0).check();await brands.nth(1).check();assert.equal(await modal.locator('.select-brand-filters input:checked').count(),2);await modal.locator('.builder-picker-reset').click();assert.equal(await modal.locator('.select-brand-filters input:checked').count(),0);await modal.locator('.builder-picker-filters>summary').click();
   await modal.locator('#builder-picker-search').fill('M12II EVO 620W');assert.equal(await modal.getByRole('listbox').getByRole('option').count(),1);await modal.getByRole('listbox').focus();await page.keyboard.press('Enter');await modal.waitFor({state:'hidden'});assert(await page.evaluate(()=>document.activeElement.classList.contains('select-trigger')));const selected=await page.evaluate(()=>window.PCP_BUILD.snapshot().parts.psu?.[0]);assert(selected);return{selectedPSU:selected,viewportTest:'short emulated viewport; physical software keyboard still needs device testing'};
  });
  await test('Starter build, review, local revision save and My PC restore',async()=>{
   await visit('/builder/');await page.getByRole('button',{name:'Try a starter build',exact:true}).click();await page.locator('#builder-workflow a[href="#readiness-report"]').click();await page.getByLabel('Revision name',{exact:true}).fill('Evolution QA build');await page.getByRole('button',{name:'Save this revision',exact:true}).click();await visit('/my-pc/');assert(await page.getByText('Evolution QA build',{exact:true}).count()>0);assert(await page.getByRole('navigation',{name:'Workspace shortcuts',exact:true}).isVisible());return{testRecordsOnly:true,...await fits()};
  });
  await test('Eight diagrams respond to inputs and honor reduced motion',async()=>{
   await visit('/build-school/hardware-diagrams/');assert.equal(await page.locator('[data-hardware-diagram]').count(),8);const gpu=page.locator('[data-hardware-diagram="gpu"]'),before=await gpu.locator('[data-diagram-result]').innerText();await gpu.locator('[data-diagram-input="card"]').fill('500');assert.notEqual(await gpu.locator('[data-diagram-result]').innerText(),before);const motion=page.locator('button[data-diagram-motion]');assert(await motion.isDisabled());return{diagrams:8,changedReadout:true,...await fits()};
  });
  await test('No-JavaScript destinations, article content and hardware fallback remain present',async()=>{
   const plain=await browser.newContext({viewport:{width:360,height:800},javaScriptEnabled:false});try{const p=await plain.newPage();await p.goto(origin+'/build-school/hardware-diagrams/');assert(await p.locator('h1').isVisible());assert.equal(await p.locator('[data-hardware-diagram]').count(),8);assert(await p.locator('[data-diagram-art] svg').first().isVisible());await p.goto(origin+'/blog/32gb-vs-64gb-ram-workloads/');assert(await p.locator('article.journey-content').isVisible());assert(await p.locator('article.journey-content h2').count()>1);}finally{await plain.close();}return{crawlableArticle:true,noJSInitialDiagrams:true};
  });
  await test('Real 3D preview defers graphics, recovers a failed catalog request and closes without losing parts',async()=>{
   await visit('/builder/');await page.getByRole('button',{name:'Try a starter build',exact:true}).click();const parts=await page.evaluate(()=>JSON.stringify(window.PCP_BUILD.snapshot().parts));
   assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/vendor\/three|\.glb(?:$|\?)/.test(r.name)).length),0);
   await page.locator('#builder-workflow a[href="#build-preview"]').click();await page.route('**/model-library.json',route=>route.abort('failed'));await page.locator('#scene-open').click();
   await page.waitForFunction(()=>window.PCP_SCENE?.state().phase==='error',{},{timeout:20000});await page.unroute('**/model-library.json');await page.getByRole('button',{name:'Retry models',exact:true}).click();
   await page.waitForFunction(()=>['ready','partial'].includes(window.PCP_SCENE?.state().phase)&&!window.PCP_SCENE.state().busy,{},{timeout:45000});
   const loaded=await page.evaluate(()=>window.PCP_SCENE.state());assert(loaded.open&&loaded.rendered>0);assert(await page.locator('#scene-stage canvas').isVisible());assert(await page.getByRole('button',{name:'Auto rotate',exact:true}).isDisabled());
   await page.locator('.scene-advanced>summary').click();await page.locator('#scene-low').check();assert.equal(await page.evaluate(()=>window.PCP_SCENE.state().quality),'lower-resolution');if(loaded.focusAvailable)await page.getByRole('button',{name:'Focus selected part',exact:true}).click();await fits();await page.screenshot({path:path.join(directory,'actual-3d-mobile.png'),animations:'disabled'});
   await page.getByRole('button',{name:'Close preview',exact:true}).click();assert.equal(await page.evaluate(()=>window.PCP_SCENE.state().open),false);assert.equal(await page.evaluate(()=>JSON.stringify(window.PCP_BUILD.snapshot().parts)),parts);assert.equal(await page.evaluate(()=>document.activeElement.id),'scene-open');return{loaded,initialGraphicsRequests:0,simulatedCatalogFailureRecovered:true,partsPreserved:true};
  });
 }finally{await browser.close();fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,checks,passed:checks.every(x=>x.passed),scope:'Actual isolated headless Edge interactions when executed. Synthetic late consent element is explicitly identified. No personal profile, user records, external submission or provider acceptance. Physical mobile keyboard and field metrics are separate.'},null,2)+'\n');}
 if(checks.some(x=>!x.passed))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
