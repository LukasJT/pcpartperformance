'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.PCP_PHOTO_ORIGIN||'http://127.0.0.1:4198';
const directory=path.resolve('docs/component-photos-oct17');fs.mkdirSync(directory,{recursive:true});
async function main(){
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),checks=[];
 try{for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:960},colorScheme:'dark'}),page=await context.newPage();
  await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Try a starter build',exact:true}).click();
  await page.waitForFunction(()=>Object.keys(window.PCP_IMAGES||{}).length>0);
  await page.getByRole('button',{name:'Expert',exact:true}).click();
  const rowPhotos=await page.locator('.builder-row[data-builder-row]').evaluateAll(rows=>rows.map(row=>({category:row.dataset.builderRow,selected:row.dataset.selectedCount,image:row.querySelector('.builder-workspace-thumbnail img')?.getAttribute('src')||null})));
  for(const row of rowPhotos.filter(row=>row.image)){
   const image=page.locator('.builder-row[data-builder-row="'+row.category+'"] .builder-workspace-thumbnail img');
   await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());
  }
  for(const category of ['cpu','gpu','ssd','psu']){
   const trigger=page.locator('.builder-row[data-builder-row="'+category+'"] .select-trigger').first();await trigger.click();
   const modal=page.locator('#builder-picker');await modal.waitFor({state:'visible'});
   const photos=await modal.locator('.builder-picker-photo img').count();
   const firstImage=modal.locator('.builder-picker-photo img').first();
   let naturalWidth=null;if(photos){await firstImage.scrollIntoViewIfNeeded();await firstImage.evaluate(image=>image.decode());naturalWidth=await firstImage.evaluate(image=>image.naturalWidth);}
   const record={width,category,rowPhotos:category==='cpu'?rowPhotos:undefined,pickerPhotos:photos,firstNaturalWidth:naturalWidth};checks.push(record);
   if(!process.env.PCP_PHOTO_BASELINE){assert(photos>0,category+' needs available product pictures');assert(naturalWidth>0);}
   await page.screenshot({path:path.join(directory,(process.env.PCP_PHOTO_BASELINE?'before':'after')+'-'+width+'-'+category+'.png'),animations:'disabled'});
   await modal.getByRole('button',{name:'Close choices',exact:true}).click();
  }
  if(!process.env.PCP_PHOTO_BASELINE)for(const category of ['cpu','board','gpu','ram','ssd','psu','case'])assert(rowPhotos.find(row=>row.category===category)?.image,category+' starter thumbnail missing');
  await context.close();
 }}finally{await browser.close();fs.writeFileSync(path.join(directory,process.env.PCP_PHOTO_REPORT||'browser.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,checks},null,2)+'\n');}
 console.log(JSON.stringify({origin,checks}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
