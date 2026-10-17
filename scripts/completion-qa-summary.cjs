'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'docs/master-completion/qa');
const reports=['a11y-desktop-dark.json','a11y-desktop-families.json','a11y-mobile-light-core.json','a11y-mobile-light-families.json','a11y-mobile360-dark.json','a11y-workspace-expanded-mobile.json','a11y-tools-fixed-mobile.json','a11y-mobile-dark-remaining.json','a11y-tablet-light.json','a11y-desktop-light.json','a11y-fixed-same-context.json'];
const latest=new Map();
for(const file of reports){
 const raw=JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));
 for(const entry of Array.isArray(raw)?raw:[raw]){
  const row=entry.report||entry;
  if(!Array.isArray(row.violations)||!row.checkedAt||!row.url||!row.width||!row.theme)throw Error('Incomplete actual browser result: '+file);
  const key=[row.url,row.width,row.theme].join('|'),existing=latest.get(key),overflow=entry.overflow??(entry.layout?entry.layout.scroll>entry.layout.client:null);
  if(!existing||row.checkedAt>existing.checkedAt)latest.set(key,{...row,overflow,receipt:file});
 }
}
const checks=[...latest.values()],unresolved=checks.filter(row=>row.violations.length||row.overflow===true);
const summary={checkedAt:new Date().toISOString(),scope:'Axe-core 4.14.0 WCAG A/AA and best-practice rules on representative actual browser pages. Not a blanket WCAG certification; incomplete rules remain contextual checks.',reports,distinctRouteViewportThemeChecks:checks.length,unresolvedAutomatedViolations:unresolved.map(row=>({url:row.url,width:row.width,theme:row.theme,violations:row.violations,overflow:row.overflow})),
 corrections:{catalog:'Matching visible/accessible selected-button labels; original desktop dark context retested.',comparison:'Named keyboard-focusable horizontal specifications region; same mobile context retested.',tools:'Memory/storage heading hierarchy corrected; original 360px dark context retested.',invalidPreview:'a11y-final-desktop-1.json was an invalid unstyled preview using a stale imported manifest after CSS fingerprinting. It is excluded. Restarted current-manifest results are retained here.'},
 checks:checks.map(row=>({url:row.url,width:row.width,height:row.height,theme:row.theme,checkedAt:row.checkedAt,receipt:row.receipt,violations:row.violations.length,incomplete:row.incomplete?.length||0,overflow:row.overflow})),
 manualJourneys:[
  {name:'Mobile builder selection and save',result:'Explicit picker choice, starter load, named 11-component revision saved and visible in My PC.'},
  {name:'Acquisition continuity',result:'Manual unit quote and warranty dates persisted after reload; original planned build unchanged. QA values are test examples.'},
  {name:'Reviewed pasted inventory',result:'Two exact CPU/GPU choices and an excluded URL line preceded replacement confirmation and a generated reuse report. No pasted URL was fetched.'},
  {name:'Keyboard picker',result:'My PC selection accepted ArrowDown/Enter and restored focus to the trigger. Initial focus was listbox rather than search input.'},
  {name:'Phone 3D at 360px',result:'Pixel 9 loaded within its card; Back changed pressed state. No CSP violation was captured.'},
  {name:'New builder model',result:'MSI GTX 1660 source scan loaded with two textures, and standalone view returned to assembly layout without changing selection. Its source includes a scanning mat; it is not an installed-fit asset.'},
  {name:'Model framing',result:'i5-661 and ASUS Z170-P Reset captures retained all corners. Actual canvas bounds, screenshots and source models are retained.'},
  {name:'Regional prices/history',result:'CAD DDR4 showed two actual merchants; US showed a separate USD CORSAIR offer and historical observation. Unsupported US 9800X3D history showed no observations.'}
 ]};
fs.writeFileSync(path.join(directory,'BROWSER-RECEIPT.json'),JSON.stringify(summary,null,2)+'\n');
const current=JSON.parse(fs.readFileSync(path.join(root,'docs/program-2026-10-09/performance-budget-results.json'),'utf8'));
const before=JSON.parse(cp.execFileSync('git',['show','392b938:docs/program-2026-10-09/performance-budget-results.json'],{cwd:root,encoding:'utf8'}));
fs.writeFileSync(path.join(directory,'PAYLOAD-COMPARISON.json'),JSON.stringify({checkedAt:new Date().toISOString(),baselineCommit:'392b938',scope:'Static generated-route transfer budgets, not field Core Web Vitals or Lighthouse.',before,current},null,2)+'\n');
console.log(JSON.stringify({checks:checks.length,unresolved:unresolved.length,payloadBudgetsPassed:current.passed}));if(unresolved.length||!current.passed)process.exitCode=1;
