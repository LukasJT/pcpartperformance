'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.PCP_TOTAL_ORIGIN||'http://127.0.0.1:4200',directory=path.resolve(process.env.PCP_TOTAL_QA_DIRECTORY||'docs/total-refinement/qa/photos-oct19');
const total=require('./total-catalog.cjs'),parts=total.prepareCatalog(total.loadExisting()),all=new Map(parts.map(p=>[p.id,p]));
const images=Object.assign({},...require('./component-photo-catalog.cjs').files.filter(name=>name.startsWith('component-photo-total-')&&fs.existsSync(path.join(__dirname,name))).map(name=>JSON.parse(fs.readFileSync(path.join(__dirname,name)))));
async function run(){
 fs.mkdirSync(directory,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),checks=[],errors=[];
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await context.addInitScript(()=>{localStorage.setItem('pcp-ad-consent','declined');});
  const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  for(const[id,image]of Object.entries(images)){
   const route='/learn/'+id+'.html';await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   const photo=page.locator('main img').filter({visible:true}).first();
   await photo.scrollIntoViewIfNeeded();await photo.evaluate(i=>i.decode());
   const state=await photo.evaluate(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,alt:i.alt,overflow:document.documentElement.scrollWidth>innerWidth+1}));
   assert.equal(state.src,image.src,id+' product hero must use its reviewed image');assert(state.width>0&&state.height>0&&state.alt.trim());assert.equal(state.overflow,false,id+' mobile overflow');
   assert((await page.locator('main').textContent()).includes('Image source'),id+' source disclosure');checks.push({type:'product',id,route,passed:true,src:state.src});
   if(['total-gpu-msi-geforce-gtx-1060-gaming-x-3g','total-ram-kingston-kvr56u46bd8-48'].includes(id)){await page.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(node=>node.remove()));await page.screenshot({path:path.join(directory,id+'-390.png'),animations:'disabled'});}
  }
  await context.close();
  for(const width of [320,390,1440]){
   const c=await browser.newContext({viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce'});await c.addInitScript(()=>{localStorage.setItem('pcp-ad-consent','declined');});const p=await c.newPage();p.setDefaultTimeout(12000);
   await p.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.PCP_BUILDER_SELECTORS&&!!window.PCP_BUILD_SESSION);
   await p.getByRole('button',{name:'Expert',exact:true}).click();
   const rows=Object.entries(images).filter(([id])=>all.get(id)?.builderEligible!==false);
   for(const[id,image]of rows){
    const part=all.get(id),select=p.locator('select[data-build-primary="'+part.cat+'"],select[data-build-slot="'+part.cat+'"]');
    await select.evaluate(s=>s.closest('.modern-select').querySelector('.select-trigger').click());const picker=p.locator('#builder-picker');await picker.waitFor({state:'visible'});
    await picker.locator('#builder-picker-search').fill(part.sku||part.name);
    const option=picker.getByRole('option').filter({hasText:part.name}).first();await option.waitFor();const picture=option.locator('img');await picture.evaluate(i=>i.decode());
    assert.equal(await picture.getAttribute('src'),image.thumbnailSrc,id+' picker thumbnail');
    const boxes=await option.evaluate(el=>{const photo=el.querySelector('img').getBoundingClientRect(),text=el.querySelector('.builder-picker-option-name').getBoundingClientRect();return{photoRight:photo.right,textLeft:text.left,row:el.getBoundingClientRect().right,viewport:innerWidth};});
    assert(boxes.photoRight<=boxes.textLeft+1,id+' photo/text collision');assert(boxes.row<=boxes.viewport+1,id+' picker overflow');
    if(rows.find(([key])=>all.get(key).cat===part.cat)?.[0]===id)await p.screenshot({path:path.join(directory,'picker-'+part.cat+'-'+width+'.png'),animations:'disabled'});
    await option.click();assert.equal(await select.inputValue(),id,id+' selected value');
    const chosen=p.locator('[data-builder-row="'+part.cat+'"] .builder-workspace-thumbnail img');await chosen.evaluate(i=>i.decode());assert.equal(await chosen.getAttribute('src'),image.thumbnailSrc,id+' selected row image');
    checks.push({type:'picker-selection',id,width,passed:true});
   }
   await c.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,photoRecords:Object.keys(images).length,checks,errors},null,2)+'\n');}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({origin,photoRecords:Object.keys(images).length,checks:checks.length,passed:true}));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
