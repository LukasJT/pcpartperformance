'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),review=require('./identity-review-oct19.cjs'),rules=require('./compatibility-evidence.cjs');
const origin=process.env.PCP_TOTAL_ORIGIN||'http://127.0.0.1:4200',rows=review.packet().records;
async function main(){const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),checks=[];
 try{
  await context.addInitScript(records=>{localStorage.setItem('pcp-ad-consent','declined');if(!localStorage.getItem('pcp-build-revisions-v1'))localStorage.setItem('pcp-build-revisions-v1',JSON.stringify({schema:1,revisions:records.map((r,i)=>({schema:1,id:'identity-fixture-'+i,name:'Retained identity '+i,parts:{[r.category]:[r.id]},region:'CA',savedAt:'2026-10-19T12:00:00Z'}))}));},rows);
  const page=await context.newPage();page.setDefaultTimeout(15000);const sitemap=await(await context.request.get(origin+'/sitemap.xml')).text();
  for(const [i,row]of rows.entries()){
   const name='Saved identity '+row.id;
   try{
    const revision={parts:{[row.category]:[row.id]},owned:[],locked:[],requirements:{},region:'CA'},url=new URL(rules.buildURL(revision,origin));url.searchParams.set('restore','identity-fixture-'+i);
    await page.goto(url.href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.PCP_BUILD_SESSION);
    assert.equal(await page.evaluate(slot=>window.PCP_BUILD.snapshot().parts[slot][0],row.category),row.id);
    const data=await page.evaluate(id=>({part:window.PCP_BUILD.catalog().find(p=>p.id===id),check:window.PCP_BUILD_SESSION.report().checks.find(c=>c.id==='identity-'+id)}),row.id);assert.equal(data.part.builderEligible,false);assert.equal(data.check.state,'needs-verification');assert.equal(data.check.reason,row.warning);assert.equal(data.part.identityReview,undefined);
    if(['ram','ssd','hdd'].includes(row.category))assert((await page.locator('#build-specs').textContent()).includes('Capacity needs verification'),'An unknown saved capacity must not appear as zero or a complete known total');
    const newChoices=await page.locator('select[data-build-add] option').evaluateAll(options=>options.map(o=>o.value));assert(!newChoices.some(id=>rows.some(r=>r.id===id)));
    const choices=await page.locator('select[data-build-primary] option, select[data-build-slot] option').evaluateAll(options=>options.filter(o=>o.value&&!o.selected).map(o=>o.value));assert(!choices.some(id=>rows.some(r=>r.id===id)));
    await page.locator('#builder-workflow a[href="#readiness-report"]').click();await page.getByLabel('Build name',{exact:true}).fill('Verified recovery '+i);await page.getByRole('button',{name:'Save build',exact:true}).click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pcp-build-revisions-v1')).revisions);assert(saved.some(r=>r.name==='Verified recovery '+i&&r.parts[row.category]?.[0]===row.id));
    const response=await context.request.get(origin+'/learn/'+row.id+'.html');assert.equal(response.status(),200);const html=await response.text();assert(/name="robots" content="noindex,follow"/.test(html));assert(html.includes('data-identity-warning'));assert(!/"@type"\s*:\s*"Product"/.test(html));assert(!sitemap.includes('/learn/'+row.id+'.html'));
    checks.push({name,passed:true,savedIdRetained:true,newChoiceAllowed:false,readiness:'needs-verification',oldURL:200,noindex:true});console.log('PASS '+name);
   }catch(error){checks.push({name,passed:false,error:error.message});console.error('FAIL '+name+': '+error.message);}
  }
  await page.goto(origin+'/my-pc/',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Verified recovery 0',exact:true}).waitFor();for(let i=0;i<rows.length;i++)assert(await page.getByRole('heading',{name:'Verified recovery '+i,exact:true}).count()>0,'Saved recovery must appear in My PC');
  const report={origin,testedAt:new Date().toISOString(),fixtureOnly:true,checks,myPCSavedCards:true};const directory=process.env.PCP_TOTAL_QA_DIRECTORY||'docs/total-refinement/qa/identity-final';fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(checks.some(c=>!c.passed))process.exitCode=1;
 }finally{await context.close();await browser.close();}}
main().catch(error=>{console.error(error);process.exitCode=1;});
