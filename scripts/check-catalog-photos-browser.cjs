'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const directory=path.resolve('docs/component-photos-catalog-oct17/qa'),origin=process.env.PCP_PHOTO_ORIGIN||'http://127.0.0.1:4198',baseline=process.env.PCP_PHOTO_BASELINE==='1';
const slotOrder=['cpu','board','gpu','ram','ssd','hdd','psu','case','fan','cooler'];
fs.mkdirSync(directory,{recursive:true});
const c={window:{}};require('node:vm').runInNewContext(fs.readFileSync('dist/builder-catalog.js','utf8'),c);
const registry=require('./component-photo-catalog.cjs');
// Baseline inspection reads only model IDs; release checks require reviewed media.
const total=require('./total-catalog.cjs');
const images=baseline?Object.assign({},...registry.files.filter(f=>fs.existsSync(path.join(__dirname,f))).map(f=>JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')))):registry.load(total.prepareCatalog(total.loadExisting()));
const preferred={cpu:'3950x',board:'b650aorus',gpu:'r9380x',ram:'ddr266-256',ssd:'kc3000',hdd:'barracuda2',psu:'focusgx850',case:'retail-lian-li-o11-air-mini-black',fan:'retail-lian-li-uni-fan-tl-120-wireless-black',cooler:'cooler-noctua-nh-u12a'};
const chosen=slotOrder.map(cat=>images[preferred[cat]]?preferred[cat]:Object.keys(images).find(id=>c.window.PCP_BUILDER_CATALOG.find(p=>p.id===id)?.cat===cat));
assert(chosen.every(Boolean));
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),checks=[],errors=[];
 try{for(const width of [360,390,1440]){
  const mobile=width<600,context=await browser.newContext({viewport:{width,height:960},colorScheme:mobile?'dark':'light',isMobile:mobile,hasTouch:mobile}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const visit=async url=>{await page.goto(url,{waitUntil:'domcontentloaded'});await page.addStyleTag({content:'#completion-a11y-run{display:none!important}'});};
  await visit(origin+'/builder/?build='+encodeURIComponent(chosen.join(',')));
  await page.getByRole('button',{name:'Expert',exact:true}).click();
  await page.waitForFunction(()=>Object.keys(window.PCP_IMAGES||{}).length>0);
  const observed=[];
  for(let k=0;k<slotOrder.length;k++){
   const row=page.locator('.builder-row[data-builder-row="'+slotOrder[k]+'"]'),image=row.locator('.builder-workspace-thumbnail img');
   if(baseline){observed.push({category:slotOrder[k],hasImage:await image.count()});continue;}
   await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());
   const state=await image.evaluate(i=>({src:i.getAttribute('src'),width:i.naturalWidth,height:i.naturalHeight,fit:window.getComputedStyle(i).objectFit}));
   assert.equal(state.src,images[chosen[k]].thumbnailSrc,chosen[k]);assert(state.width>0&&state.width<=320);assert.equal(state.fit,'contain');observed.push({category:slotOrder[k],id:chosen[k],...state});
  }
  await page.locator('#builder-parts').screenshot({path:path.join(directory,(baseline?'before':'after')+'-builder-'+width+'.png'),animations:'disabled'});
  await page.locator('.builder-row[data-builder-row="cpu"]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(directory,(baseline?'before':'after')+'-builder-viewport-'+width+'.png'),animations:'disabled'});
  if(!baseline){
   for(const cat of ['gpu','ram','hdd','psu','case','cooler']){
    await page.locator('.builder-row[data-builder-row="'+cat+'"] .select-trigger').first().click();
    const dialog=page.locator('#builder-picker');await dialog.waitFor({state:'visible'});assert.notEqual(await page.evaluate(()=>document.activeElement?.id),'builder-picker-search');
    const picture=dialog.locator('[role="option"][aria-selected="true"] img').first();await picture.scrollIntoViewIfNeeded();await picture.evaluate(i=>i.decode());assert.equal(await picture.getAttribute('src'),images[chosen[slotOrder.indexOf(cat)]].thumbnailSrc);
    assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1));
    if(cat==='psu'||cat==='gpu')await page.screenshot({path:path.join(directory,'after-picker-'+cat+'-'+width+'.png'),animations:'disabled'});
    await dialog.getByRole('button',{name:'Close choices',exact:true}).click();
   }
  }
  checks.push({width,route:'/builder/',photos:observed});
  if(!baseline){for(const id of [chosen[0],chosen[1],chosen[2],chosen[3],chosen[4],chosen[5],chosen[6]]){
   await visit(origin+'/learn/'+id+'.html');const hero=page.locator('.part-visual .hardware-photo img');await hero.evaluate(i=>i.decode());assert.equal(await hero.getAttribute('src'),images[id].src);assert(await hero.evaluate(i=>i.naturalWidth>0));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push({width,route:'/learn/'+id+'.html',correctImage:true});
   if(id===chosen[2])await page.screenshot({path:path.join(directory,'after-product-'+width+'.png'),animations:'disabled'});
  }
   await visit(origin+'/hardware/graphics-cards/');await page.locator('#hardware-rows .catalog-product img').first().waitFor();
   const catalogImages=page.locator('#hardware-rows .catalog-product img');for(let k=0;k<Math.min(6,await catalogImages.count());k++){const image=catalogImages.nth(k);await image.scrollIntoViewIfNeeded();await image.evaluate(i=>i.decode());assert(await image.evaluate(i=>!!i.alt.trim()&&i.alt!=='undefined'&&i.naturalWidth>0));}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push({width,route:'/hardware/graphics-cards/',decodedCatalogImages:Math.min(6,await catalogImages.count()),meaningfulAlt:true});
   const gpu=chosen[2],second=Object.keys(images).find(id=>id!==gpu&&c.window.PCP_BUILDER_CATALOG.find(p=>p.id===id)?.cat==='gpu');
   await visit(origin+'/compare/?parts='+encodeURIComponent(gpu+','+second));await page.locator('.product-card .hardware-photo img').first().evaluate(i=>i.decode());
   assert.equal(await page.locator('.product-card .hardware-photo img').first().getAttribute('src'),images[gpu].src);
   await page.locator('.change-product').first().click();const picker=page.locator('#part-picker');await picker.waitFor({state:'visible'});const pickerImage=picker.locator('.picker-photo img').first();await pickerImage.scrollIntoViewIfNeeded();await pickerImage.evaluate(i=>i.decode());assert(await pickerImage.evaluate(i=>i.naturalWidth>0&&i.naturalWidth<=320&&!!i.alt.trim()));
   const layout=await picker.locator('#picker-results button').first().evaluate(row=>{const picture=row.querySelector('.picker-photo'),style=window.getComputedStyle(picture),text=row.querySelector('.picker-info').getBoundingClientRect();return{marginLeft:style.marginLeft,marginRight:style.marginRight,textWidth:text.width};});
   assert.equal(layout.marginLeft,'0px');assert.equal(layout.marginRight,'0px');assert(layout.textWidth>=(width===360?110:140),'Picture margins must not squeeze the model name');
   await page.screenshot({path:path.join(directory,'after-compare-picker-'+width+'.png'),animations:'disabled'});await picker.getByRole('button',{name:'Close hardware picker',exact:true}).click();checks.push({width,route:'/compare/',fullCardAndSmallPickerImages:true});
  }
  await context.close();
 }}finally{await browser.close();fs.writeFileSync(path.join(directory,(baseline?'before':process.env.PCP_PHOTO_ORIGIN?'live':'local')+'-browser.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,baseline,checks,errors},null,2)+'\n');}
 if(!baseline)assert.deepEqual(errors,[]);console.log(JSON.stringify({origin,baseline,checks:checks.length,errors}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
