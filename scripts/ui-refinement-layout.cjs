'use strict';
/* Read-only layout probe in an isolated browser, never a user browser session. */
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto('http://127.0.0.1:4198/builder/',{waitUntil:'domcontentloaded'});
 console.log(JSON.stringify(await page.locator('.builder-row').first().evaluate(row=>[row,...row.children].map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return{tag:e.tagName,class:e.className,rect:{x:r.x,y:r.y,width:r.width,height:r.height},display:s.display,height:s.height,minHeight:s.minHeight,rows:s.gridTemplateRows,row:s.gridRow,alignSelf:s.alignSelf,alignContent:s.alignContent,gap:s.gap,padding:s.padding,margin:s.margin};})),null,2));
 await page.emulateMedia({colorScheme:'light'});await page.goto('http://127.0.0.1:4198/blog/',{waitUntil:'domcontentloaded'});console.log(JSON.stringify(await page.locator('.page-heading p').evaluate(p=>{const rows=[];for(let e=p;e;e=e.parentElement){const s=getComputedStyle(e);rows.push({tag:e.tagName,class:e.className,color:s.color,background:s.backgroundColor,opacity:s.opacity,animation:s.animationName});}return rows;}),null,2));
 }finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
