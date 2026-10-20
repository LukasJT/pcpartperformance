'use strict';
const fs=require('node:fs'),path=require('node:path');
const {replaceElement,icon}=require('./clarity-site.cjs');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<span class="studio-arrow" aria-hidden="true">↗</span>';
function photo(id,images,{eager=false,cls='',sizes=eager?'(max-width:767px) 90vw, 540px':'(max-width:600px) 45vw, 320px'}={}){
 const image=images[id];if(!image)return '';
 const variants=require('./program-image-variants.json')[id];
 const responsive=variants?.original===image.src;
 const src=responsive?variants.variants.at(-1).src:eager?image.src:image.thumbnailSrc||image.src;
 const choices=responsive?variants.variants:image.thumbnailSrc&&image.width>320?[{src:image.thumbnailSrc,width:320},{src:image.src,width:image.width}]:[];
 const srcset=choices.length?' srcset="'+choices.map(v=>esc(v.src)+' '+v.width+'w').join(', ')+'" sizes="'+esc(sizes)+'"':'';
 return '<img class="'+cls+'" src="'+esc(src)+'"'+srcset+' alt="'+esc(image.picturedModel)+'" width="640" height="400" loading="'+(eager?'eager':'lazy')+'" decoding="async"'+(eager?' fetchpriority="high"':'')+'>';
}
function home({records,images}){
 const pic=(id,options)=>photo(id,images,options);
 const categories=[['gpu','Graphics cards','graphics-cards','rtx5070'],['cpu','Processors','processors','9800x3d'],['ram','Memory','memory','ddr5'],['ssd','SSDs','solid-state-drives','990pro']];
 return `<div class="studio-home tech-home">
 <section class="studio-hero" aria-labelledby="home-title">
  <div class="studio-hero-copy"><span class="studio-eyebrow">Your next PC starts here</span><h1 id="home-title">Build smarter.<br><span>Upgrade with confidence.</span></h1><p>Choose the right parts. Understand the fit. Keep your next move in one place.</p>
   <div class="studio-primary-paths program-actions"><a class="button primary" href="/builder/">Build a PC ${arrow}</a><a class="button secondary" href="/upgrade/">Upgrade my PC ${arrow}</a><a class="button secondary" href="/compare/">Compare hardware ${arrow}</a></div>
   <div class="studio-hero-foot"><a href="/build-school/">First build? Start here ${arrow}</a><a href="/my-pc/">Your saved work ${arrow}</a></div>
  </div>
  <div class="studio-hardware-scene"><div class="studio-scene-label"><span>Parts with a purpose</span><a href="/hardware/">Explore ${arrow}</a></div>
   <a class="studio-scene-gpu" href="/learn/rtx5070.html">${pic('rtx5070',{eager:true})}<span>GeForce RTX 5070<small>Graphics · 12 GB GDDR7</small></span></a>
   <div class="studio-scene-bottom"><a href="/learn/9800x3d.html">${pic('9800x3d')}<span>Ryzen 7 9800X3D<small>Processor · AM5</small></span></a><a href="/blog/understanding-pc-memory/">${pic('ddr5')}<span>Make room for more<small>Memory, explained</small></span></a></div>
  </div>
 </section>
 <form class="studio-search tech-search" action="/search/" method="get" role="search"><label for="home-search">Find your next part</label><div><input id="home-search" name="q" type="search" placeholder="Model, specification or question" maxlength="120" required><button type="submit" aria-label="Search the site">${icon('search')}</button></div><a href="/hardware/">Browse ${records.length.toLocaleString('en-US')} records ${arrow}</a></form>
 <section class="studio-review home-passport" aria-labelledby="studio-review-title"><div><span class="studio-eyebrow">A clearer build review</span><h2 id="studio-review-title">Know what fits.<br>See what needs a closer look.</h2><a href="/builder/#readiness-report">See your build report ${arrow}</a></div><div class="studio-evidence-preview"><span class="studio-example-label">Example checks · not your current build</span><div><span class="studio-status-icon" aria-hidden="true">✓</span><span><strong>CPU socket</strong><small>Documented match</small></span><span class="studio-check-label">Match</span></div><div><span class="studio-status-icon studio-pending" aria-hidden="true">?</span><span><strong>BIOS &amp; clearances</strong><small>Check exact support and dimensions</small></span><span class="studio-check-label">Review</span></div></div></section>
 <div class="tech-lead studio-editorial-lead"><section class="tech-feature" aria-labelledby="feature-title"><div class="tech-feature-heading"><span class="studio-eyebrow">The closer look</span><a href="/compare/">All comparisons ${arrow}</a></div><h2 id="feature-title">Similar names.<br>Different priorities.</h2><p class="tech-feature-deck">RTX 5070 vs RTX 5060 Ti 16 GB</p><a class="tech-product-pair" href="/compare/rtx-5070-vs-rtx-5060-ti-16gb/"><figure>${pic('rtx5070')}<figcaption><strong>RTX 5070</strong><span>12 GB GDDR7</span></figcaption></figure><span class="tech-vs" aria-hidden="true">vs</span><figure>${pic('rtx5060ti16')}<figcaption><strong>RTX 5060 Ti</strong><span>16 GB GDDR7</span></figcaption></figure></a><div class="tech-feature-bottom"><p>Memory capacity is only part of the picture.</p><a class="tech-button" href="/compare/rtx-5070-vs-rtx-5060-ti-16gb/">Compare these GPUs ${arrow}</a></div></section>
 <aside class="tech-desk studio-upgrade" aria-labelledby="desk-title"><span class="studio-eyebrow">The upgrade desk</span><h2 id="desk-title">A new chapter.<br>A familiar PC.</h2><p>Start with what you own. Plan what changes next.</p><div class="studio-upgrade-parts"><div><span>Keep</span>${pic('9800x3d')}<small>Current platform</small></div><div><span>Reuse</span>${pic('ddr5')}<small>Supported memory</small></div><div><span>Replace</span>${pic('rtx5070')}<small>Your next GPU</small></div></div><p class="studio-caption">Illustrative plan. Check your exact parts.</p><div class="tech-build-note"><div><h3>Planning a whole PC?</h3><a href="/builder/">Open PC builder ${arrow}</a></div></div><a class="button secondary" href="/upgrade/">Plan my upgrade ${arrow}</a></aside></div>
 <section class="tech-guides studio-learning" aria-labelledby="guides-title"><div class="tech-section-heading"><div><span class="studio-eyebrow">Before you buy</span><h2 id="guides-title">A little knowledge.<br>A better decision.</h2></div><a href="/blog/">All hardware guides ${arrow}</a></div><div class="studio-learning-layout"><a class="studio-featured-guide" href="/blog/understanding-pc-memory/"><div class="studio-guide-photo">${pic('ddr5')}</div><div><span class="studio-eyebrow">Memory, without the mystery</span><h3>More RAM or faster RAM?</h3><p>Capacity, generation and speed. Know which matters for your build.</p><span class="studio-text-link">Get to know memory ${arrow}</span></div></a><div class="tech-guide-grid total-guide-grid"><a class="total-guide-link" href="/performance/">${icon('game')}<span><h3>Game performance</h3><p>PC evidence and console modes.</p></span>${arrow}</a><a class="total-guide-link" href="/blog/understanding-pc-memory/">${icon('parts')}<span><h3>Choose memory</h3><p>Capacity, generation and speed.</p></span>${arrow}</a><a class="total-guide-link" href="/blog/choosing-an-ssd/">${icon('parts')}<span><h3>Choose storage</h3><p>Understand SSD fit and interfaces.</p></span>${arrow}</a><a class="total-guide-link" href="/compatibility/">${icon('check')}<span><h3>Check compatibility</h3><p>The connections that matter.</p></span>${arrow}</a></div></div></section>
 <section class="tech-categories" aria-labelledby="category-title"><div class="tech-section-heading"><h2 id="category-title">Meet the components</h2><a href="/hardware/">Browse ${records.length.toLocaleString('en-US')} parts ${arrow}</a></div><div class="tech-category-grid">${categories.map(([cat,label,slug,id])=>`<a class="tech-category" href="/hardware/${slug}/"><div class="tech-category-image">${pic(id)}</div><div class="tech-category-copy"><span class="tech-count">${records.filter(p=>p.cat===cat).length} parts</span><h3>${label}</h3></div>${arrow}</a>`).join('')}</div></section>
 <section class="studio-workspace-promo"><div><span class="studio-eyebrow">Made to come back to</span><h2>Your PC.<br>Your next step.</h2><p>Saved builds, watched parts and private notes. Ready when you are.</p><a class="button primary" href="/my-pc/">Open My PC ${arrow}</a></div><div class="studio-workspace-preview" aria-label="Workspace features"><span>My workspace</span><div>${icon('build')}<strong>Saved computers</strong><span>Continue</span></div><div>${icon('compare')}<strong>Parts to revisit</strong><span>Shortlist</span></div><div>${icon('learn')}<strong>Notes &amp; purchases</strong><span>Organize</span></div><small>Saved locally in your browser.</small></div></section>
 <nav class="clarity-features total-feature-rows" aria-label="More ways to explore">${[['/phones/','Compare phones','Size, specifications and 3D.','phone'],['/prebuilts/','Find a prebuilt','Compare real configurations.','build'],['/performance/','Game performance','PC evidence and console modes.','game']].map(([href,title,copy,kind])=>`<a class="total-feature-row" href="${href}"><span class="total-feature-icon">${icon(kind)}</span><span class="total-feature-copy"><strong>${title}</strong><small>${copy}</small></span><span class="total-feature-arrow">${arrow}</span></a>`).join('')}</nav>
 <div class="tech-source-note"><strong>Specifications with sources.</strong><p>Exact identities. Honest unknowns. Reference data you can inspect.</p><a href="/methodology/">How we use data ${arrow}</a></div>
 </div>`;
}
function dashboard(){return '<section class="studio-dashboard" aria-label="Workspace overview"><div class="studio-dashboard-welcome"><span class="studio-eyebrow">Your hardware, together</span><h2>Pick up where you left off.</h2><p>Saved here. Ready when you are.</p><a class="button primary" data-studio-continue href="/builder/">Start a build '+arrow+'</a></div><div class="studio-dashboard-stats"><a href="#workspace-builds"><strong data-studio-build-count>—</strong><span>Saved builds</span></a><a href="#workspace-watchlist"><strong data-studio-watch-count>—</strong><span>Watched parts</span></a><a href="#workspace-saved-comparisons"><strong data-studio-comparison-count>—</strong><span>Comparisons</span></a></div></section>';}
function polish(html,route,context={}){
 if(html.includes('data-clean-studio')||html.includes('data-legacy-redirect')||!html.includes('data-ui-refined'))return html;
 html=html.replace(/<body(?=\s|>)/,'<body data-clean-studio');
 html=html.replace('</head>','<link rel="stylesheet" href="/clean-studio-'+family(route)+'.css"></head>');
 if(route==='/')html=html.replace(/<link rel="stylesheet" href="\/(?:homepage|growth-home|oct16-home|evolution-view-home)\.css">/g,'');
 if(route.startsWith('/hardware/'))html=html.replace('href="/builder-refresh.css"','href="/clean-studio-catalog-selects.css"');
 if(route==='/'&&context.records&&context.images)html=replaceElement(html,/<main\b[^>]*>/,'main',old=>old.slice(0,old.indexOf('>')+1)+home(context)+'</main>');
 if(route==='/builder/'){
  html=html.replace('<strong>Choose parts</strong>','<strong>Parts</strong>').replace('<strong>Explore build</strong>','<strong>Preview</strong>').replace('<strong>Review &amp; save</strong>','<strong>Review</strong>');
 }
 if(route==='/my-pc/'){
  html=replaceElement(html,/<header class="my-pc-heading[^>]*>/,'header',()=>'<header class="my-pc-heading studio-workspace-heading"><div><span class="studio-eyebrow">Your personal hardware studio</span><h1>My PC</h1></div><a class="button secondary" href="/upgrade/">Plan an upgrade '+arrow+'</a></header>'+dashboard());
  html=html.replace('<nav class="workspace-tabs lab-workspace-shortcuts"','<nav class="workspace-tabs lab-workspace-shortcuts studio-choice-pills"');
  html=replaceElement(html,/<nav class="workspace-tabs[^>]*>/,'nav',()=>'<nav class="workspace-tabs lab-workspace-shortcuts studio-choice-pills" aria-label="Workspace shortcuts"><a href="#workspace-builds">Builds</a><a href="#workspace-watchlist">Watchlist</a><a href="#workspace-saved-comparisons">Comparisons</a><a href="#workspace-notebook">Records</a></nav>');
 }
 if(route==='/blog/'){
  html=replaceElement(html,/<div class="ui-hero-art[^>]*>/,'div',()=>'<div class="studio-learn-art">'+photo('ddr5',context.images||{},{sizes:'(max-width:1100px) 40vw, 480px'})+'</div>');
  html=html.replace('<h1>PC building &amp; upgrade guides</h1>','<h1>Know your hardware.<br>Build your confidence.</h1>').replace('<h1>PC building & upgrade guides</h1>','<h1>Know your hardware.<br>Build your confidence.</h1>');
  html=replaceElement(html,/<nav\b[^>]*aria-label="Learning paths"[^>]*>/,'nav',()=>'<nav class="studio-learning-paths" aria-label="Learning paths"><a href="/build-school/">Build your first PC '+arrow+'</a><a href="#guides-build">Check the fit '+arrow+'</a><a href="#guides-cpu">Plan an upgrade '+arrow+'</a></nav>');
  html=html.replace('<div class="guide-directory-controls">','<section class="studio-editorial-pick" aria-labelledby="studio-editorial-title"><a class="studio-editorial-photo" href="/blog/choosing-an-ssd/">'+photo('990pro',context.images||{})+'</a><div><span class="studio-eyebrow">A good place to start</span><h2 id="studio-editorial-title"><a href="/blog/choosing-an-ssd/">Small drive.<br>Important details.</a></h2><p>M.2 is a shape. NVMe is an interface. Find the storage that fits your PC.</p><a class="studio-text-link" href="/blog/choosing-an-ssd/">Read the storage guide '+arrow+'</a></div><aside><a href="/blog/how-to-choose-a-graphics-card/"><strong>Know your graphics card</strong><span>Memory, power and the bigger picture.</span>'+arrow+'</a><a href="/blog/how-to-choose-a-processor/"><strong>Look beyond GHz</strong><span>Cores, clocks and platform support.</span>'+arrow+'</a></aside></section><div class="guide-directory-controls">');
 }
 return html;
}
const styleFamilies={
 home:/\.studio-(?:home|hero|primary|hardware-scene|scene|search|review|evidence|example|status|pending|check|editorial-lead|upgrade|learning|featured|guide-photo|text-link|workspace-(?:promo|preview)|caption)|\.tech-(?!button)|\.total-feature/,
 builder:/builder|\.evolution-selection|\.oct16-step|\.select-check/,
 workspace:/workspace|my-pc|studio-dashboard|studio-empty/,
 catalog:/catalog-product|catalog-grid|catalog-tools|evolution-catalog/,
 product:/part-hero|part-visual|part-title/,
 compare:/product-card|comparison-controls/,
 guides:/guide-directory|guide-topic|data-guide-card|studio-learn|studio-editorial-pick|studio-editorial-photo|studio-learning-paths|studio-text-link/,
 article:/data-lab-article|lab-article|lab-contents/,
 school:/lab-school|lab-lesson/
};
function family(route){if(route==='/')return 'home';if(route==='/builder/')return 'builder';if(route==='/my-pc/')return 'workspace';if(route.startsWith('/hardware/'))return 'catalog';if(route.startsWith('/learn/'))return 'product';if(route.startsWith('/compare/'))return 'compare';if(route==='/blog/')return 'guides';if(/^\/(?:blog|news)\/[^/]+\/$/.test(route))return 'article';if(route.startsWith('/build-school/'))return 'school';return 'common';}
// Scope only this owned stylesheet. Shared controls, media fallbacks and theme
// rules survive on every page; destination-specific rules are never global payload.
function filterCSS(input,allow){
 const split=require('./evolution-style-scope.cjs').splitSelectors;
 const css=input.replace(/\/\*[\s\S]*?\*\//g,'');let out='',i=0;
 while(i<css.length){const open=css.indexOf('{',i);if(open===-1)break;const header=css.slice(i,open).trim();let depth=1,quote='',end=open+1;
  for(;end<css.length&&depth;end++){const c=css[end];if(quote){if(c==='\\')end++;else if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='{')depth++;else if(c==='}')depth--;}
  if(depth)throw Error('Unbalanced Clean Studio CSS');const body=css.slice(open+1,end-1);
  if(/^@(?:media|supports)\b/.test(header)){const nested=filterCSS(body,allow);if(nested)out+=header+'{'+nested+'}';}
  else if(/^@(?:-webkit-)?keyframes\b/.test(header))out+=header+'{'+body+'}';
  else{const selectors=split(header).filter(allow);if(selectors.length)out+=selectors.join(',')+'{'+body+'}';}
  i=end;
 }
 return out;
}
function scopedCSS(input,selected){return filterCSS(input,selector=>{if(/\.studio-(?:arrow|eyebrow)/.test(selector)&&!['home','workspace','guides'].includes(selected))return false;const groups=Object.entries(styleFamilies).filter(([,pattern])=>pattern.test(selector)).map(([name])=>name);return !groups.length||groups.includes(selected);});}
function catalogSelectorCSS(input){return filterCSS(input,selector=>!/builder|assembly-/.test(selector)&&/\.modern-select|\.select-|\.catalog-tools/.test(selector));}
function prepare({root}){const css=fs.readFileSync(path.join(__dirname,'clean-studio.css'),'utf8');for(const name of ['common',...Object.keys(styleFamilies)])fs.writeFileSync(path.join(root,'clean-studio-'+name+'.css'),scopedCSS(css,name));fs.writeFileSync(path.join(root,'clean-studio-catalog-selects.css'),catalogSelectorCSS(fs.readFileSync(path.join(root,'builder-refresh.css'),'utf8')));}
module.exports={polish,prepare,home,photo,dashboard,scopedCSS,family,catalogSelectorCSS};
