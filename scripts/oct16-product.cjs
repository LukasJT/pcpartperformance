'use strict';
const fs=require('node:fs'),path=require('node:path');
const {replaceElement,icon}=require('./clarity-site.cjs');
module.exports=({root,records})=>{
 const modify=(route,fn)=>{const f=path.join(root,route,'index.html');if(fs.existsSync(f))fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')));};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rules=require('./compatibility-evidence.cjs');
 for(const part of records.filter(p=>rules.SLOTS.includes(p.cat))){const file=path.join(root,'learn',part.id+'.html');let h=fs.readFileSync(file,'utf8');const revision={parts:{[part.cat]:[part.id]},region:'CA'},url=new URL(rules.buildURL(revision));url.searchParams.delete('region');h=h.replace(/(<a class="button primary magnetic"[^>]*>[\s\S]*?<\/a>)/,'$1<a class="button secondary" href="'+esc(url.pathname+url.search)+'">Use in PC builder</a>');
  if(part.cat==='cooler'){const evidence=Object.values(part.evidence?.fields||{}),sources=[...new Map(evidence.filter(f=>f.source).map(f=>[f.source,f])).values()];h=h.replace('Reference specifications. Partner models and exact configurations may differ.','Exact catalog model'+(part.sku?' · '+esc(part.sku):'')+'. Manufacturer documents checked October 16, 2026. Socket support and dimensions do not establish cooling performance or a complete installed fit.');h=h.replace('</main>','<details class="clarity-details"><summary>Support and fit evidence</summary><p>Installed fan position, RAM, motherboard heatsinks and radiator placement can change clearance. Unknown dimensions stay undocumented. <a href="/blog/how-to-choose-a-cpu-cooler-that-fits/">Follow the cooler-fit checklist</a>.</p><ul>'+sources.map(f=>'<li><a href="'+esc(f.source)+'">'+esc(f.publisher)+' · '+esc(f.model)+'</a></li>').join('')+'</ul></details></main>');}
  fs.writeFileSync(file,h);
 }
 modify('',h=>{
  let secondary='';
  h=replaceElement(h,/<nav class="clarity-features"[^>]*>/,'nav',body=>{secondary=body;return '';});
  const sample='<section class="home-passport" aria-labelledby="home-passport-title"><div><span>Illustrative example</span><h2 id="home-passport-title">A parts list, with the important checks.</h2><p>The Build Readiness Report separates a documented match from a question you still need to answer.</p><a href="/builder/#readiness-report">See your build’s checks</a></div><ul><li>'+icon('check')+'<span><strong>CPU socket</strong><small>Documented match for the example</small></span></li><li>'+icon('search')+'<span><strong>BIOS support</strong><small>Exact processor support still needs checking</small></span></li><li>'+icon('parts')+'<span><strong>GPU clearance</strong><small>Installed case layout needs verification</small></span></li></ul></section>';
  h=h.replace('<div class="tech-lead">',sample+'<div class="tech-lead">');
  h=h.replace('<section class="tech-categories"',secondary+'<section class="tech-categories"');
  h=h.replace('M.2 is a shape. NVMe is an interface.','M.2 describes a form factor. NVMe is a protocol.');
  return h.replace('</head>','<link rel="stylesheet" href="/oct16-home.css"></head>');
 });
 modify('builder',h=>h.replace('>Build Readiness Report</h2>','>Build Readiness Report</h2>').replace('See missing items, documented conflicts and the checks to finish before buying.','Your parts, purchase costs and remaining checks in one place.').replace('<button class="button secondary" type="button" data-program-print>Print build and report</button>','<div class="program-actions"><button class="button secondary" type="button" data-program-print>Print build report</button><button class="button secondary" type="button" data-passport-download disabled>Download build report</button></div>').replace('<summary>Saved quote worksheet</summary>','<summary>Purchase cost breakdown</summary>').replace('>Compare complete purchase quotes</a></div><form id="program-save-form"','>Compare complete purchase quotes</a><a href="/my-pc/">Open My PC workspace</a></div><form id="program-save-form"').replace('Clearing browser data removes local revisions.','Download and revision exports can contain your private purchase quotes. Clearing browser data removes local revisions.').replace('</head>','<link rel="stylesheet" href="/oct16-builder.css"><script src="/oct16-builder-journey.js" defer></script></head>'));
 modify('saved',h=>h.replace('</main>','<section class="program-panel"><h2>Your PC workspace</h2><p>Find saved build revisions, private notes and the parts you want to revisit.</p><a class="button primary" href="/my-pc/">Open My PC</a></section></main>'));
 modify('upgrade',h=>h.replace('<section class="program-panel"><h2>1. Record your existing PC</h2>','<p><a href="/my-pc/">Open saved PCs and build notes</a></p><section class="program-panel"><h2>1. Record your existing PC</h2>'));
 modify('compatibility',h=>h.replace('<h2>Will it fit? Use your measurements</h2>','<h2>Will it fit? Use your measurements</h2><p><a href="/blog/how-to-choose-a-cpu-cooler-that-fits/">Check cooler height, mounting and radiator space</a> · <a href="/hardware/cpu-coolers/">Browse sourced CPU coolers</a></p>'));
 modify('build-school',h=>h.replace('<h2>Use the exact manual</h2>','<h2>Keep the exact documents with your build</h2><p><a href="/my-pc/">Use your build notebook</a> to record model-specific manuals and checks. Before assembly, <a href="/blog/how-to-choose-a-cpu-cooler-that-fits/">review cooler mounting and fit</a>.</p>'));
 const indexPath=path.join(root,'data/search-index.json'),index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
 for(const row of index){const part=records.find(p=>row.url==='/learn/'+p.id+'.html');if(part)row.aliases=[...new Set([...(row.aliases||[]),part.id,part.sku,part.mpn,...(part.aliases||[])].filter(x=>typeof x==='string'&&x.length<160))];}
 for(const item of [{id:'my_pc_workspace',url:'/my-pc/',title:'My PC workspace: saved builds, notes and upgrade plans',kind:'PC tool',aliases:['my computer','saved PC','build journal','watchlist','build history']},{id:'cooler_catalog',url:'/hardware/cpu-coolers/',title:'CPU coolers: air and liquid cooling specifications',kind:'Hardware category',aliases:['heatsink','AIO','radiator','cpu fan','cooling']}])if(!index.some(x=>x.url===item.url))index.push(item);
 fs.writeFileSync(indexPath,JSON.stringify(require('./growth-search-core.cjs').enrichIndex(index,records,require('./program-products.cjs').profiles))); 
 modify('builder',h=>{
  const markup=require('./oct16-builder-journey.js').markup();let preferences='',toolbar='';
  h=replaceElement(h,/<header class="builder-workspace-head"[^>]*>/,'header',()=> '');h=h.replace('>Interactive layout</span>','>0 parts selected</span>');
  h=replaceElement(h,/<div class="builder-toolbar"[^>]*>/,'div',body=>{toolbar=body;return '';});
  h=replaceElement(h,/<section class="program-panel" id="build-plan"[^>]*>/,'section',body=>{preferences=body.replace('<div class="builder-preferences-body">','<div class="builder-preferences-body">'+toolbar);return '';});
  h=replaceElement(h,/<div id="builder-parts"[^>]*>/,'div',body=>'<section id="builder-guidance" class="oct16-guidance" aria-labelledby="builder-guidance-title">'+markup.header+'</section>'+body+'<nav class="oct16-step-nav" aria-label="Component steps">'+markup.steps+'</nav>'+preferences);
  return h.replace('id="builder" class="builder"','id="builder" class="builder" data-oct16-mode="guided"').replaceAll('href="#builder-choose"','href="#builder-guidance"').replace('<script src="/builder-images.js" defer></script>','<script src="/oct16-builder-images.js" defer></script>');
 });
 for(const asset of ['oct16-builder-journey.js','oct16-builder-images.js','oct16-builder.css','oct16-home.css'])fs.copyFileSync(path.join(__dirname,asset),path.join(root,asset));
 return {home:'PC-first',builder:'guided-and-expert',workspace:'/my-pc/',coolers:records.filter(p=>p.cat==='cooler').length};
};
