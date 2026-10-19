'use strict';
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'playwright');
const before=process.argv.includes('--before'),origin=process.env.PCP_TOTAL_ORIGIN||'http://127.0.0.1:4200';
const phase=before?'before':'after',directory=path.resolve(process.env.PCP_TOTAL_QA_DIRECTORY||path.join('docs/total-refinement/qa',phase));
const widths=(process.env.PCP_TOTAL_WIDTHS||'320,360,375,390,430,768,1024,1440,1920').split(',').map(Number);
const themes=(process.env.PCP_TOTAL_THEMES||'light,dark').split(',');
async function main(){
 fs.mkdirSync(directory,{recursive:true});const b=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),reports=[];
 try{for(const theme of themes)for(const width of widths){
  const c=await b.newContext({viewport:{width,height:width<600?844:1000},isMobile:width<600,hasTouch:width<600,colorScheme:theme,reducedMotion:'reduce'});
  await c.addInitScript(theme=>{localStorage.setItem('pcp-theme-palette',theme==='light'?'arctic':'midnight');localStorage.setItem('pcp-ad-consent','declined');},theme);
  const p=await c.newPage();p.setDefaultTimeout(10000);
  const capture=async(name,selector,extra={})=>{
   const target=p.locator(selector).first();await p.locator('#completion-a11y-run').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));await target.scrollIntoViewIfNeeded();await p.waitForFunction(()=>[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).every(i=>i.complete),{},{timeout:5000}).catch(()=>{});await p.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))]));
   const file=name+'-'+width+'-'+theme+'.png';await p.screenshot({path:path.join(directory,file),animations:'disabled'});
   const data=await p.evaluate(selector=>{
    const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
    const lines=e=>{const r=document.createRange();r.selectNodeContents(e);return [...r.getClientRects()].filter(x=>x.width>0).map(x=>({y:x.y,h:x.height,w:x.width}));};
    return{viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,target:box(document.querySelector(selector)),features:[...document.querySelectorAll('.clarity-features>a')].map(e=>({title:e.querySelector('strong')?.textContent,titleBox:box(e.querySelector('strong')),descriptionBox:box(e.querySelector('small')),row:box(e)})),nav:[...document.querySelectorAll('.ui-site-menu .clarity-nav>a>span')].filter(visible).map(e=>({text:e.textContent,lines:lines(e),box:box(e)})),preferences:[...document.querySelectorAll('.ui-menu-utilities>.lab-preference-heading,.ui-menu-utilities>.lab-appearance-open,.ui-menu-utilities>.theme-toggle,.ui-menu-utilities>.country-switch')].filter(visible).map(e=>({name:e.className,box:e.classList.contains('lab-preference-heading')?(()=>{const range=document.createRange();range.selectNodeContents(e);return box(range);})():box(e),textBoxes:e.classList.contains('lab-preference-heading')?lines(e):[],display:getComputedStyle(e).display})),guideCards:[...document.querySelectorAll('.tech-guide-grid>a')].map(e=>({h:e.getBoundingClientRect().height})),categoryCards:[...document.querySelectorAll('.tech-category')].map(e=>({h:e.getBoundingClientRect().height})),picker:document.querySelector('#builder-picker[open]')?{box:box(document.querySelector('#builder-picker')),rows:[...document.querySelectorAll('#builder-picker-options>.select-option')].slice(0,6).map(e=>box(e)),search:box(document.querySelector('#builder-picker-search')),close:box(document.querySelector('#builder-picker .select-close'))}:null};
   },selector);
   if(!before&&name==='home-features'){
    data.builderLink=await p.locator('.tech-build-note>div>a').evaluate(link=>{const arrow=link.querySelector('span').getBoundingClientRect(),range=document.createRange();range.selectNode(link.firstChild);const text=range.getBoundingClientRect();return{arrowY:arrow.y,arrowBottom:arrow.bottom,textY:text.y,textBottom:text.bottom,display:getComputedStyle(link).display};});
    if(data.builderLink.arrowY>=data.builderLink.textBottom||data.builderLink.textY>=data.builderLink.arrowBottom)throw Error('Builder CTA arrow wrapped away from its label at '+width+'px');
   }
   const collisions=data.features.filter(x=>x.titleBox&&x.descriptionBox&&x.titleBox.y<x.descriptionBox.bottom&&x.descriptionBox.y<x.titleBox.bottom&&x.titleBox.right>=x.descriptionBox.x-2).map(x=>x.title);
   const preferenceCollisions=data.preferences.flatMap((a,i)=>data.preferences.slice(i+1).filter(b=>a.box.x<b.box.right-1&&a.box.right>b.box.x+1&&a.box.y<b.box.bottom-1&&a.box.bottom>b.box.y+1).map(b=>a.name+' / '+b.name));
   if(!before&&data.preferences.length){const heading=data.preferences.find(x=>x.name==='lab-preference-heading'),controls=data.preferences.filter(x=>x.name!=='lab-preference-heading');if(heading&&controls.some(x=>x.box.y<heading.box.bottom-1))throw Error('Preference controls appear above their heading at '+width+'px');}
   const wrapped=data.nav.filter(x=>new Set(x.lines.map(r=>Math.round(r.y))).size>1).map(x=>x.text);
   const result={name,width,theme,screenshot:file,...extra,...data,collisions,wrapped,preferenceCollisions};reports.push(result);console.log(JSON.stringify({phase,name,width,theme,overflow:data.documentWidth>data.viewport,collisions,wrapped,preferenceCollisions}));
  };
  await p.goto(origin+'/',{waitUntil:'domcontentloaded'});await capture('home-features','.clarity-features');await capture('home-categories','.tech-categories');await capture('home-guides','.tech-guides');
  if(width<=1024){await p.getByRole('button',{name:'Menu',exact:true}).click();await capture('menu-primary','.ui-site-menu');if(!before&&width<600){await p.evaluate(()=>{document.documentElement.style.fontSize='150%';});await capture('menu-text150','.ui-site-menu');await p.evaluate(()=>{document.documentElement.style.fontSize='';});}await p.locator('.ui-menu-utilities').scrollIntoViewIfNeeded();await capture('menu-preferences','.ui-menu-utilities');await p.keyboard.press('Escape');}
  await p.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});if(width<=1024){await p.getByRole('button',{name:'Menu',exact:true}).click();await capture('builder-menu-primary','.ui-site-menu');await capture('builder-menu-preferences','.ui-menu-utilities');await p.keyboard.press('Escape');}
  await p.goto(origin+'/builder/#readiness-report',{waitUntil:'domcontentloaded'});await capture('builder-save','#build-revisions');
  await p.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});await p.getByRole('button',{name:'Expert',exact:true}).click();await p.getByRole('button',{name:/Choose Processor:/i}).first().click();await capture('picker-cpu','#builder-picker');if(!before&&width<600){await p.getByRole('button',{name:'Expand choices',exact:true}).click();await capture('picker-expanded','#builder-picker');await p.setViewportSize({width,height:390});await capture('picker-short-viewport','#builder-picker');await p.setViewportSize({width,height:844});}await p.getByRole('button',{name:'Close choices',exact:true}).click();
  await p.locator('#build-plan summary').first().click().catch(()=>{});await capture('builder-preferences','#build-plan');
  await p.goto(origin+'/performance/',{waitUntil:'domcontentloaded'});await capture('fps-settings','.fps-workbench');
  await c.close();
 }}finally{await b.close();fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify({checkedAt:new Date().toISOString(),origin,phase,widths,themes,reports,scope:'Actual isolated Edge with emulated viewport/touch; physical iPhone/browser chrome and software keyboard remain separate.'},null,2)+'\n');}
 const failures=reports.filter(r=>r.documentWidth>r.viewport||r.collisions.length||r.wrapped.length||r.preferenceCollisions.length);console.log(JSON.stringify({cases:reports.length,failures:failures.map(r=>({name:r.name,width:r.width,theme:r.theme,collisions:r.collisions,wrapped:r.wrapped}))}));if(!before&&failures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
