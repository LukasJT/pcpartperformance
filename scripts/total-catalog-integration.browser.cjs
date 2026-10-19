'use strict';

// Disposable browser fixtures only. No live retail offer, user record or API
// credential is installed by this regression runner.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PCP_PLAYWRIGHT_MODULE || 'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.PCP_TOTAL_ORIGIN || 'http://127.0.0.1:4200';
const revision = { id:'total-us-price-fixture', schema:1, name:'US revision price regression', region:'US', currency:'USD', parts:{cpu:['9600x']}, savedAt:'2026-10-19T12:00:00Z' };
const restoreURL=new URL(require('./compatibility-evidence.cjs').buildURL({...revision,owned:[],locked:[],requirements:{}},origin));
restoreURL.searchParams.set('restore',revision.id);
// Workspace links include the complete public build snapshot plus the local
// restore ID. Omitting only region exercises the saved US metadata under a CA
// header; a bare restore ID is not the workspace's supported link contract.
restoreURL.searchParams.delete('region');
const systems=require('./total-prebuilts.cjs').systems();
const prebuiltFixtures=[systems.find(p=>p.brand==='MSI'&&p.sourceKind==='manufacturer-specification'),systems.find(p=>p.brand==='Lenovo'&&p.sourceKind==='manufacturer-specification'&&/^Withdrawn/.test(p.status))];

async function main() {
  const browser = await chromium.launch({headless:true, executablePath:process.env.PCP_BROWSER_EXE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const checks = [];
  try {
    for (const mode of ['load-revision', 'restore-url']) {
      const context = await browser.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, reducedMotion:'reduce'});
      try {
        await context.addInitScript(saved => {
          localStorage.setItem('pcp-region','CA');
          localStorage.setItem('pcp-ad-consent','declined');
          localStorage.setItem('pcp-build-revisions-v1',JSON.stringify({schema:1,revisions:[saved]}));
        }, revision);
        const page = await context.newPage(); page.setDefaultTimeout(15000);
        const fixtureRoute=mode==='restore-url'?restoreURL.pathname+restoreURL.search:'/builder/';
        await page.goto(origin+fixtureRoute,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>!!window.PCP_BUILD_SESSION && !!window.PCP_BUILDER_SELECTORS);
        if (mode==='load-revision') {
          assert.equal(await page.evaluate(()=>document.documentElement.dataset.region),'CA','Fixture must begin in Canada');
          await page.locator('#builder-workflow a[href="#readiness-report"]').click();
          const load=page.locator('[data-revision-load="'+revision.id+'"]');
          await load.evaluate(button=>{for(let d=button.closest('details');d;d=d.parentElement?.closest('details'))d.open=true;});
          await load.click();
          await page.locator('#builder-workflow a[href="#builder-guidance"]').click();
        }
        assert.equal(await page.evaluate(()=>window.PCP_BUILD_SESSION.current().region),'US','The saved US revision must be active');
        const headerRegion=await page.evaluate(()=>document.documentElement.dataset.region);
        await page.evaluate(()=>{
          window.__totalPriceRegionCalls=[];
          window.PCP_PUBLIC_PRICES={
            refresh:async()=>{}, observationsFor:()=>[],
            offersFor(id,region){window.__totalPriceRegionCalls.push({id,region});return id==='9600x'?[{productId:id,region,currency:region==='US'?'USD':'CAD',price:region==='US'?199.11:299.22,checkedAt:new Date().toISOString(),store:'TEST FIXTURE — not a live offer'}]:[];}
          };
        });
        await page.locator('select[data-build-primary="cpu"]').evaluate(select=>select.closest('.modern-select').querySelector('.select-trigger').click());
        const picker=page.locator('#builder-picker'); await picker.waitFor({state:'visible'});
        const price=picker.locator('[role="option"]').filter({hasText:'Ryzen 5 9600X'}).locator('.builder-picker-price');
        const priceText=await price.textContent();
        assert.match(priceText,/USD\s*199\.11/,'Picker prices must use the restored session region; rendered '+priceText);
        const calls=await page.evaluate(()=>window.__totalPriceRegionCalls.filter(call=>call.id==='9600x'));
        assert(calls.length>0 && calls.every(call=>call.region==='US'),'Canadian offer lookups must not override a US revision');
        await picker.getByRole('button',{name:'Close choices',exact:true}).click();
        assert.equal(await page.evaluate(()=>window.PCP_BUILD_SESSION.current().parts.cpu[0]),'9600x','Inspecting prices must preserve the saved selection');
        checks.push({name:mode,passed:true,fixtureRoute,initialPreference:'CA',restoredRegion:'US',headerRegion,priceFixture:'USD 199.11; no real price asserted',offerCalls:calls.length});
        console.log('PASS '+mode+' preserves US region for picker offers');
      } catch(error) { checks.push({name:mode,passed:false,error:error.message}); console.error('FAIL '+mode+': '+error.message); }
      finally { await context.close(); }
    }
    for(const system of prebuiltFixtures){
      assert(system,'Both MSI source-only and withdrawn Lenovo fixtures must exist');
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),name=system.brand+' source-only prebuilt';
      try{
        const page=await context.newPage();page.setDefaultTimeout(15000);
        await page.goto(origin+'/prebuilts/'+system.id+'/',{waitUntil:'domcontentloaded'});
        const evidence=page.locator('[data-master-system-evidence]'),link=evidence.getByRole('link',{name:'View manufacturer specifications',exact:true});
        await link.waitFor();assert.equal(await link.getAttribute('href'),system.url);
        const text=await evidence.textContent();assert(text.includes('manufacturer part number '+system.sku));assert(!text.includes('retailer SKU'));
        assert(text.includes(system.status),'Manufacturer/historical qualification must survive the embedded checklist projection');
        assert.equal(await evidence.getByRole('link',{name:'Open the exact retailer listing',exact:true}).count(),0);
        const payload=await page.locator('[data-master-system-data]').evaluate(node=>JSON.parse(node.textContent));
        const row=payload.systems.find(p=>p.id===system.id);assert.equal(row.sourceKind,'manufacturer-specification');assert.equal(row.status,system.status);assert.equal(row.seller,null);
        if(system.brand==='Lenovo')assert(/Withdrawn/.test(text),'Withdrawn models must remain visibly historical');
        checks.push({name,passed:true,id:system.id,sourceKind:row.sourceKind,status:row.status,liveOfferAsserted:false});console.log('PASS '+name);
      }catch(error){checks.push({name,passed:false,error:error.message});console.error('FAIL '+name+': '+error.message);}
      finally{await context.close();}
    }
    {
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),name='Picker pagination remains outside the listbox';
      try{
        const page=await context.newPage();page.setDefaultTimeout(15000);
        await page.goto(origin+'/builder/',{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>!!window.PCP_BUILDER_SELECTORS);
        await page.locator('select[data-build-primary="cpu"]').evaluate(select=>select.closest('.modern-select').querySelector('.select-trigger').click());
        const picker=page.locator('#builder-picker'),list=picker.getByRole('listbox'),more=picker.locator('.builder-picker-more');
        await picker.waitFor({state:'visible'});assert(await more.isVisible());
        assert.equal(await list.locator('.builder-picker-more').count(),0,'Listbox must own options, not a pagination button');
        const before=await list.getByRole('option').count();await list.focus();await page.keyboard.press('Tab');assert(await more.evaluate(node=>node===document.activeElement),'Pagination must follow the listbox in keyboard order');
        await page.keyboard.press('Enter');const after=await list.getByRole('option').count();assert(after>before,'Keyboard pagination must load more choices');
        assert.equal(await list.locator('.builder-picker-more').count(),0,'Rerendering must not move pagination back inside the listbox');
        checks.push({name,passed:true,before,after});console.log('PASS '+name);
      }catch(error){checks.push({name,passed:false,error:error.message});console.error('FAIL '+name+': '+error.message);}
      finally{await context.close();}
    }
  } finally {
    await browser.close();
    console.log(JSON.stringify({origin,testedAt:new Date().toISOString(),fixtureOnly:true,checks},null,2));
  }
  if(checks.length!==5 || checks.some(check=>!check.passed))process.exitCode=1;
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={revision};
