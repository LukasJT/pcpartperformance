'use strict';
const fs=require('node:fs');
const rows=[
 ['Audit','verified','docs/growth/site-audit.md','check-seo; live-release','Measured catalog/routes; historical claims treated as hypotheses.'],
 ['Official SEO research','verified','docs/growth/seo-research.md','source-register.json','Current primary guidance applied; no promised ranking.'],
 ['Official video research','access_partial','docs/growth/video-seo-research.md','browser transcript export','13 metadata/description records; 0 readable transcripts.'],
 ['Search opportunity map','qualified_complete','docs/growth/keyword-opportunities.csv','search-intent-map.md','147 candidates: searched versus inferred explicitly separated; no volumes.'],
 ['Competitive advantage','qualified_complete','docs/growth/competitor-analysis.md','primary-source access record','Eight relevant publishers; blocked views are not full audits.'],
 ['Navigation and organization','implemented','scripts/growth-site.cjs','browser controls','Task navigation, grouped Explore and search types.'],
 ['Product homepage','implemented','scripts/growth-site.cjs','desktop/mobile smoke','Preserves the approved product design and useful entry points.'],
 ['Hardware discovery','implemented','scripts/program-products.cjs','check-product-program; check-master-generated','20 full contexts, exact IDs and crawlable categories.'],
 ['Compatibility pillar','implemented_with_unknowns','scripts/compatibility-evidence.cjs','test-master-evidence','26 distinct documented models; no invented BIOS or clearance.'],
 ['Upgrade decisions','implemented','scripts/master-decisions.js','check-master-decisions; browser handoff','Explicit reuse/scenarios/complete cost, including keeping the PC.'],
 ['Comparisons','implemented','scripts/master-editorial-content.cjs','check-master-generated','Research-based RX 9070 comparison; prior comparisons preserved.'],
 ['Benchmark integrity','implemented_data_blocked','scripts/growth-site.cjs','check-console-evidence','Coverage explicit; measured PC dataset unavailable.'],
 ['Diagnostics','implemented','scripts/growth-tools.js','test-growth-tools; browser paths','24 observation-led nodes, safety and rollback.'],
 ['Calculators','implemented','scripts/growth-tools.js','test-growth-tools; browser values','Two additional transparent tools; existing planners retained.'],
 ['Editorial program','implemented_ready_batch','scripts/master-publication.cjs','test-master-publication; check-master-generated','13 distinct resources in this pass, 56-item plan retained.'],
 ['Original data resources','implemented','scripts/growth-site.cjs','resource/export checks','Original aggregate evidence resource, not copied benchmark data.'],
 ['Prebuilt decisions','implemented','scripts/master-decisions.cjs','check-master-decisions; browser checklist','Nine exact listing summaries, configuration/unknown/quote checks.'],
 ['Newsroom','implemented','scripts/news-sitemap-response.mjs','runtime and worker tests','Readable real dates, time-bounded news sitemap and monitored review queue.'],
 ['Technical SEO','implemented','scripts/seo-pass.cjs','check-seo; check-stage2','Canonical, indexing, redirects and sitemap align.'],
 ['Structured data','implemented','scripts/master-publication.cjs','check-master-generated','Visible facts and organization authorship; no fake offers/ratings.'],
 ['Internal discovery','implemented','scripts/master-publication.cjs','generated discovery checks','Blog/search/feed/tool and comparison links.'],
 ['Search presentation','implemented','scripts/seo-pass.cjs','metadata checks','Useful titles/descriptions; no artificial keyword density.'],
 ['Sharing and retention','implemented_existing_extended','dist/program-retention.js','check-program-retention','Exact saved builds/export flows retained; decision handoff added.'],
 ['Visual design','implemented','scripts/master-publication.css','desktop/mobile screenshots','Readable guides and spacious grouped decision controls.'],
 ['Accessibility and speed','implemented_measured_lab','scripts/prepare-master-runtime.cjs','budgets; keyboard; mobile; reduced motion','No initial 3D downloads; lab measurements are not field INP.'],
 ['Analytics and growth','prepared_access_blocked','dist/program-events.js','privacy/event tests','Consent adapter disabled pending authorized configuration.'],
 ['Distribution','prepared_not_sent','docs/growth/distribution-drafts.md','content/evidence review','Video/community/newsletter drafts and capacity-based plan; no external posts.'],
 ['Monetization trust','implemented_disabled_integrations','scripts/program-offers.cjs','offer/worker gates','Missing prices preserved; delivery/ads/affiliate activation requires real dependencies.'],
 ['Integration','implemented','scripts/build-pages.cjs','full normal build','Shared routes and data reused; no framework rewrite.'],
 ['Release verification','in_progress','docs/master/qa','run-master-checks; browser; live verify','Status becomes verified only after the actual live receipt.']
];
const tasks=rows.map(([title,status,file,tests,note],i)=>({id:'MASTER-'+String(i+1).padStart(2,'0'),title,status,dependencies:i?[i<5?'MASTER-01':'MASTER-05']:[],affectedFiles:[file],evidence:note,tests}));
fs.mkdirSync('docs/master',{recursive:true});fs.writeFileSync('docs/master/checklist.json',JSON.stringify({updatedAt:new Date().toISOString(),productionVerified:false,tasks},null,2));
fs.writeFileSync('docs/master/phase-coverage.md','# Master program coverage\n\nEach phase below maps to real source work or an explicitly unavailable external input. A prepared capability is not an active service, and a lab check is not a search-growth result.\n\n| Task | Phase | State | Evidence and implementation |\n| --- | --- | --- | --- |\n'+tasks.map(t=>'| '+t.id+' | '+t.title+' | '+t.status+' | '+t.affectedFiles[0]+' — '+t.evidence+' |').join('\n')+'\n');
console.log('Recorded all 30 master phases and their concrete dependencies.');
