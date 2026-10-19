'use strict';
// Read-only public catalog discovery. It does not use private Redux state, APIs or accounts.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
async function main(){
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),source='https://www.xbox.com/en-US/games/optimized',out=path.resolve('docs/total-refinement/games/xbox-dom-discovery.json');
 const rows=new Map();let failure=null,clicks=0;
 try{
  await page.goto(source,{waitUntil:'domcontentloaded',timeout:45000});
  const reject=page.getByRole('button',{name:/Reject optional|Reject all/i}).first();if(await reject.isVisible().catch(()=>false))await reject.click();
  const more=page.getByRole('button',{name:/load more/i}).first();await more.waitFor({timeout:30000});
  for(let step=0;step<7;step++){
   const found=await page.locator('a[href*="/games/store/"]').evaluateAll(links=>links.map(a=>({url:a.href,label:a.getAttribute('aria-label')||a.textContent.trim()})));
   for(const r of found){const id=new URL(r.url).pathname.split('/').filter(Boolean).at(-1);if(/^[A-Z\d]{12}$/i.test(id))rows.set(id.toUpperCase(),{productId:id.toUpperCase(),sourceUrl:r.url,label:r.label,discoverySource:'https://www.xbox.com/en-US/games/optimized'});}
   if(rows.size>=140||!await more.isVisible())break;
   const before=rows.size;await more.click();clicks++;await page.waitForTimeout(1000);
   if(step>1&&before===rows.size&&!await more.isVisible())break;
  }
 }catch(error){failure=error.message;}
 finally{await browser.close();fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({checkedAt:new Date().toISOString(),source,clicks,records:[...rows.values()],failure,limitation:'Public optimized catalog DOM links are discovery evidence. Exact product metadata must still verify each game and platform; no FPS or prices imported.'},null,2));}
 console.log(JSON.stringify({discovered:rows.size,clicks,failure,report:out}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
