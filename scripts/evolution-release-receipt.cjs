'use strict';
// Collect existing receipts; never promotes source checks into browser approval.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'docs/evolution-oct18');
const json=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const git=(...args)=>cp.execFileSync('git',['-c','core.autocrlf=false',...args],{cwd:root,encoding:'utf8'}).trim();
const baseline='e8c321b90d75e4dca9f0e96ded6b39dd71b83fd4';
const before=JSON.parse(git('show',baseline+':docs/program-2026-10-09/performance-budget-results.json'));
const after=json('docs/program-2026-10-09/performance-budget-results.json');
const results=after.results.map(r=>{const b=before.results.find(x=>x.route===r.route);if(!b)throw Error('Missing comparable baseline '+r.route);return{route:r.route,beforeJS:b.scriptGzip,afterJS:r.scriptGzip,changeJS:r.scriptGzip-b.scriptGzip,beforeCSS:b.styleBytes,afterCSS:r.styleBytes,changeCSS:r.styleBytes-b.styleBytes,scriptLimit:r.scriptLimit,styleLimit:r.styleLimit,passed:r.scriptGzip<=r.scriptLimit&&r.styleBytes<=r.styleLimit};});
const performance={checkedAt:new Date().toISOString(),baselineCommit:baseline,beforeMeasuredAt:before.checkedAt,afterMeasuredAt:after.checkedAt,scope:'Static HTML-linked script gzip and stylesheet bytes. Optional dynamic motion/3D, Worker-injected advertising and actual network timing are separate. Not field Core Web Vitals.',results};
fs.writeFileSync(path.join(dir,'qa/performance-before-after.json'),JSON.stringify(performance,null,2)+'\n');
const tests=json('docs/master-completion/qa/test-commands.json'),editorial=json('docs/evolution-oct18/editorial/draft-status.json'),previews=json('docs/evolution-oct18/editorial/preview-manifest.json'),publisher=json('docs/evolution-oct18/publisher-audit.json');
const html=json('docs/master-completion/qa/all-route-html.json'),resources=json('docs/master-completion/qa/resource-audit.json');
const browserFile=path.join(dir,'qa/acceptance.json'),browser=fs.existsSync(browserFile)?JSON.parse(fs.readFileSync(browserFile,'utf8')):null;
const report={checkedAt:new Date().toISOString(),branch:git('branch','--show-current'),baseCommit:git('rev-parse','HEAD'),priorVerifiedProduction:baseline,scope:'Implementation candidate; this command collects existing receipts and does not itself run browser QA or publish.',tests:{commands:tests.commands,passed:tests.passed,checkedAt:tests.checkedAt},performance,html,resources,browser:browser?{checkedAt:browser.checkedAt,acceptedStates:browser.acceptedStates,captures:browser.captures,failures:browser.failures,interactionChecks:browser.interactionChecks,passed:browser.passed}:null,editorial:{drafts:editorial.researchDrafts,publishable:editorial.publishable,published:editorial.published,humanReviewed:editorial.humanReviewed,localPreviews:previews.rendered},publisher:{eligibility:publisher.eligibility,analytics:publisher.analytics,articleLandmarks:publisher.articles},gates:{renderedBrowserQA:browser?.passed?'passed_isolated_edge_emulation':'pending',physicalMobileKeyboard:'not_tested',fieldCoreWebVitals:'unavailable',humanEditorialReview:'pending',journeyProviderApproval:'unverified',deployed:false}};
fs.writeFileSync(path.join(dir,'qa/release-receipt.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({groups:tests.commands,passed:tests.passed,payloadBudgets:results.filter(r=>r.passed).length,drafts:editorial.researchDrafts,published:editorial.published,deployed:false}));
