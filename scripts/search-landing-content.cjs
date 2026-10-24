'use strict';
const fs=require('node:fs'),path=require('node:path');
const DATE='2026-10-24';
const SOURCES={
 cpu:['MSI: CPU support and BIOS checks','https://www.msi.com/support/technical_details/MB_CPU_Upgrade_Installation'],
 memory:['ASUS: find CPU and memory support lists','https://www.asus.com/us/support/faq/1043883/'],
 upgrade:['Intel: desktop processor upgrade checks','https://www.intel.com/content/www/us/en/support/articles/000005682/processors.html'],
 cables:['CORSAIR: modular PSU cable compatibility','https://www.corsair.com/us/cs/explorer/diy-builder/power-supply-units/are-psu-cable-universal/']
};
const LANDINGS={
 '/builder/':{
  title:'Make a PC parts list you can check',
  intro:'Start with exact models, then review the connections between them. This builder keeps selected parts, documented conflicts, unknown checks and the priced portion of your plan together.',
  steps:[
   ['Choose a platform','Select a processor, motherboard and memory kit. Keep the board revision and the complete kit number with your notes; a family name can cover several different products.'],
   ['Check the complete assembly','Add storage, graphics, case, cooling and power. Use the readiness report to separate indexed matches from measurements, firmware and connections that still need confirmation.'],
   ['Review before ordering','Mark owned parts and save a revision. The known-price subtotal covers available observations, not every purchase cost. Add separate quotes for missing prices, delivery, tax and accessories.']
  ],
  questions:[
   ['Can I build with parts I already own?','Yes. Select the indexed models and mark them as owned. For a change to an existing computer, the upgrade planner separates your current system from the proposed purchase.'],
   ['Does the 3D preview prove everything fits?','No. It helps you inspect a layout. Use the exact case, cooler and card documentation for physical clearances and mounting; an approximate model cannot certify them.']
  ],
  links:[['/build-school/','Follow the first-build checklist'],['/compatibility/','Check CPU and motherboard support'],['/upgrade/','Plan around the parts you own']],sources:[]
 },
 '/upgrade/':{
  title:'What should you upgrade first?',
  intro:'Name the problem before choosing a replacement. Record your current parts and the workload you want to improve, then compare a focused change with the full cost of a platform move.',
  steps:[
   ['Not enough capacity?','Check whether the limit is memory or storage in the workload you actually use. Record the installed memory kit, occupied slots, drives and available connections before adding more.'],
   ['A game misses your target?','Write down the game, resolution and settings. Look for tests that match that goal; a specification difference or a bottleneck percentage alone does not predict the improvement.'],
   ['Changing the processor?','Verify motherboard and BIOS support first. Include any required board, memory or cooling change in the same purchase plan instead of pricing the processor by itself.']
  ],
  checks:[['Case','Recheck the new card, cooler, board and PSU against the available space.'],['Power supply','Check the exact unit and cable compatibility. Similar-looking modular connectors do not establish that a cable can be reused.'],['Storage','Back up your files and confirm that the proposed system has the required drive connections.']],
  questions:[['Can I keep my motherboard when upgrading the CPU?','Only after confirming the exact processor in that board’s support list and checking its firmware requirements. A matching socket is one check, not the complete answer.']],
  links:[['/blog/am5-upgrade-checklist/','Use the AM5 verification worksheet'],['/tools/platform-upgrade-cost/','Calculate the platform-change budget'],['/my-pc/','Keep your current PC records']],sources:['upgrade','cables']
 },
 '/compatibility/':{
  title:'How to check CPU and motherboard compatibility',
  intro:'A socket match starts the check. The exact motherboard’s support list and firmware requirements determine what else you need to verify before installing a processor.',
  steps:[
   ['Identify the exact board','Record its full model and hardware revision. Open the manufacturer’s support page for that board, not a list for a similarly named model.'],
   ['Find the processor entry','Locate the intended CPU in the support list. Record the required BIOS version and compare it with the version installed on your working PC.'],
   ['Confirm the update path','If an update is needed, follow the board’s documented procedure. Establish whether it needs a supported processor or provides a separate flash feature before removing the old CPU.']
  ],
  questions:[
   ['What about RAM compatibility?','Check the exact kit number and configuration against the board’s memory support documentation. Generation, module count and firmware matter; a matching capacity alone does not establish support.'],
   ['What does an unknown result mean?','The available record does not establish a pass or a conflict. Keep the check unresolved and use the linked manufacturer documents; missing evidence is not a compatibility guarantee.']
  ],
  links:[['/blog/am5-upgrade-checklist/','Record the BIOS and support evidence'],['/blog/understanding-pc-memory/','Understand memory generation and configuration'],['/builder/','Review a complete PC parts list']],sources:['cpu','memory']
 },
 '/compare/':{
  title:'Compare the exact part, not just the family name',
  intro:'Start with two models in the same category. Use the differences view to shortlist meaningful changes, then open each product’s source and variant details before deciding.',
  steps:[
   ['Graphics cards','Compare memory capacity, documented power and the exact card dimensions. Different partner cards using the same GPU can need separate fit checks. Specification bars are not measured game results.'],
   ['Processors and memory','Keep platform requirements beside the specification differences. A CPU change may also need a board or memory change; compare the total plan rather than one isolated part.'],
   ['Storage and purchase costs','Match capacity, interface and physical format before comparing a price. Confirm the exact listing, country and observation time; an absent price stays unknown.']
  ],
  questions:[['Which GPU is faster for my game?','Use documented testing with the game, resolution, quality and rendering settings attached. This comparison shows specifications; memory size alone cannot establish a frame-rate winner.']],
  links:[['/compare/rtx-5070-vs-rtx-5060-ti-16gb/','RTX 5070 vs RTX 5060 Ti 16 GB'],['/compare/ryzen-7-9800x3d-vs-7800x3d/','Ryzen 7 9800X3D vs 7800X3D'],['/blog/how-to-choose-a-graphics-card/','Turn GPU specifications into a buying checklist']],sources:[]
 }
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const links=rows=>rows.map(([url,label])=>'<a href="'+esc(url)+'">'+esc(label)+'</a>').join('');
const citations=ids=>ids.length?'<p class="search-guide-sources">Manufacturer guidance: '+ids.map(id=>{const [label,url]=SOURCES[id];return '<a href="'+esc(url)+'" rel="noopener noreferrer" target="_blank">'+esc(label)+'</a>';}).join(' · ')+'</p>':'';
function checks(rows){return '<dl class="search-checks">'+rows.map(([label,text])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(text)+'</dd></div>').join('')+'</dl>';}
function section(value){return '<section class="search-guide" id="planning-guide" aria-labelledby="search-guide-title" data-search-landing><header><h2 id="search-guide-title">'+esc(value.title)+'</h2><p>'+esc(value.intro)+'</p></header><ol class="search-guide-steps">'+value.steps.map(([title,text])=>'<li><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p></li>').join('')+'</ol>'+(value.checks?'<h3>What can you reuse?</h3>'+checks(value.checks):'')+'<div class="search-guide-questions">'+value.questions.map(([title,text])=>'<details><summary>'+esc(title)+'</summary><p>'+esc(text)+'</p></details>').join('')+'</div><nav class="search-guide-links" aria-label="Continue your hardware research">'+links(value.links)+'</nav>'+citations(value.sources)+'</section>';}
const ARTICLE='/blog/am5-upgrade-checklist/';
function worksheet(){return '<section id="section-4" data-search-worksheet><h2>Keep a final verification record</h2><p>Keep the answer and its source together. These five records turn a shortlist into a checkable upgrade plan; an empty field remains unresolved.</p>'+checks([
 ['Board identity','Full model and hardware revision, with the matching manufacturer support URL.'],
 ['CPU support','Exact processor entry, its required BIOS and the date you checked the support list.'],
 ['Installed firmware','The version reported by your existing system. Do not substitute the latest download version for what is actually installed.'],
 ['Update procedure','The exact manual page and any prerequisite processor or flash feature. Confirm this before dismantling a working PC.'],
 ['Other checks','Memory kit and module layout, cooler mounting, power connections and physical measurements. Record confirmed, unresolved or not applicable separately.']
 ])+'<h3>Decide from the missing evidence</h3><p>If the processor is absent from the support list, seek confirmation from the board maker. If the installed firmware does not meet the listed requirement, resolve the update procedure first. If all support checks are documented, physical installation and workload testing still remain.</p><p>After assembly, verify the detected components and settings and test the workload that justified the change. The 3D preview is a layout aid, not a mounting or cable-clearance certificate.</p><nav class="search-guide-links" aria-label="Use your upgrade record">'+links([['/compatibility/','Check documented CPU support'],['/upgrade/','Compare the complete upgrade cost']])+'</nav>'+citations(['cpu','memory'])+'<p class="revision-note">Updated <time datetime="'+DATE+'">October 24, 2026</time>: added the five-field verification worksheet and clarified support-list and installed-firmware checks. Original source inspection dates are retained.</p></section>';}
function polish(html,route){
 if(LANDINGS[route]&&!html.includes('data-search-landing'))html=html.replace('</main>',section(LANDINGS[route])+'</main>');
 if(route===ARTICLE&&!html.includes('data-search-worksheet')){
  html=html.replace(/<section id="section-4">[\s\S]*?<\/section>/,worksheet());
  html=html.replace('The current MSI support table was not extractable in our audit, so the exact version remains a manual check.','Use the support entry for your exact processor and board revision; do not copy a firmware requirement from a similar model.');
  html=html.replace(/(<div class="article-byline">[\s\S]*?)(<\/div>)/,'$1 · Updated <time datetime="'+DATE+'">October 24, 2026</time>$2');
  html=html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,(block,open,json,close)=>{const data=JSON.parse(json),walk=node=>{if(!node||typeof node!=='object')return;if(node['@type']==='Article'&&node.url==='https://www.pcpartperformance.com'+ARTICLE)node.dateModified=DATE;if(node['@graph'])node['@graph'].forEach(walk);};walk(data);return open+JSON.stringify(data).replace(/</g,'\\u003c')+close;});
 }
 if((LANDINGS[route]||route===ARTICLE)&&!html.includes('href="/search-landing.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/search-landing.css"></head>');
 if(route==='/compare/'&&!html.includes('href="/search-comparison.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/search-comparison.css"></head>');
 return html;
}
function prepare({root}){for(const file of ['search-landing.css','search-comparison.css'])fs.copyFileSync(path.join(__dirname,file),path.join(root,file));}
module.exports={LANDINGS,ARTICLE,DATE,SOURCES,polish,prepare};
