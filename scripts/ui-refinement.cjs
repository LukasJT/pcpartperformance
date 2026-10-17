'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {icon,replaceElement}=require('./clarity-site.cjs');
const destinations=[['/phones/','Phone comparison','phone'],['/performance/','Game FPS','game'],['/prebuilts/','Prebuilt PCs','build'],['/laptops/','Gaming laptops','laptop']];
const planning=[['/build-school/','Build School','book'],['/compatibility/','Compatibility','check'],['/tools/','Calculators','tools'],['/troubleshooting/','Troubleshooting','parts']];
const link=([href,label,name])=>'<a href="'+href+'">'+icon(name)+'<span>'+label+'</span></a>';
function illustration(kind){
 const pc='<path class="ui-diagram-frame" d="M100 35h140l52 31v168l-140 23-52-32Z"/><path d="m100 35 52 35 140-4M152 70v187"/><rect x="169" y="87" width="99" height="125" rx="7"/><rect class="ui-diagram-core" x="180" y="100" width="33" height="32" rx="4"/><path d="M225 99v44m10-44v44M176 155h83v22h-83zM176 189h83"/><circle cx="126" cy="116" r="15"/><circle cx="126" cy="165" r="15"/><path d="m116 106 20 20m-20 0 20-20m-20 49 20 20m-20 0 20-20"/>';
 const scenes={build:pc+'<path class="ui-diagram-signal" d="M42 103h43m-43 12h29m243 31h43m-29 12h29"/><circle class="ui-diagram-dot" cx="50" cy="183" r="5"/><path d="M64 183h24m219-87h29"/>',upgrade:'<rect class="ui-diagram-frame" x="34" y="76" width="94" height="132" rx="12"/><path d="M48 95h65M48 110h65M48 130h30v36H48zM48 188h65"/><path class="ui-diagram-signal" d="M148 142h70m-13-13 13 13-13 13"/><rect class="ui-diagram-frame" x="245" y="76" width="94" height="132" rx="12"/><rect class="ui-diagram-core" x="259" y="129" width="31" height="37" rx="4"/><path d="M259 95h65M259 110h65M259 188h65"/><circle class="ui-diagram-dot" cx="292" cy="49" r="6"/>',workspace:'<rect class="ui-diagram-frame" x="48" y="58" width="280" height="178" rx="13"/><path d="M48 94h280M125 94v142"/><path class="ui-diagram-signal" d="M67 116h38M67 139h28M67 162h32"/><rect x="144" y="114" width="74" height="75" rx="7"/><path d="M159 137h44m-44 13h30m-30 23h40"/><rect class="ui-diagram-core" x="237" y="114" width="72" height="39" rx="7"/><path d="M246 175h54M246 191h43M68 76h6m9 0h6m9 0h6"/>',compare:'<rect class="ui-diagram-frame" x="42" y="66" width="127" height="164" rx="12"/><rect class="ui-diagram-frame" x="212" y="66" width="127" height="164" rx="12"/><path class="ui-diagram-signal" d="M63 105h84M63 133h62M63 161h75M233 105h84M233 133h51M233 161h66"/><path d="M63 195h41m129 0h42M183 132l8 8 8-8m-16 22 8-8 8 8"/>',learn:'<path class="ui-diagram-frame" d="M190 79c-36-22-78-26-131-10v155c53-16 95-12 131 10 36-22 78-26 131-10V69c-53-16-95-12-131 10Z"/><path d="M190 79v155M83 99c27-4 49-1 78 9m-78 18c27-4 49-1 78 9m-78 18c27-4 49-1 78 9m56-54c29-10 51-13 78-9m-78 36c29-10 51-13 78-9m-78 36c29-10 51-13 78-9"/><path class="ui-diagram-signal" d="m174 37 16-14 16 14"/>',compatibility:'<rect class="ui-diagram-frame" x="40" y="76" width="95" height="136" rx="12"/><path d="M60 100h55M60 120h55M60 140h55M60 183h30"/><rect class="ui-diagram-core" x="250" y="114" width="65" height="65" rx="8"/><path d="M266 104V90m16 14V90m16 14V90m-32 99v14m16-14v14m16-14v14"/><path class="ui-diagram-signal" d="M152 145h74"/><circle cx="190" cy="72" r="17"/><path class="ui-diagram-signal" d="m182 72 6 6 10-12"/><circle class="ui-diagram-unknown" cx="190" cy="216" r="17"/><path d="M186 211a4 4 0 1 1 7 3l-3 3m0 5v1"/>'};
 scenes.phone='<rect class="ui-diagram-frame" x="80" y="52" width="90" height="184" rx="15"/><rect class="ui-diagram-frame" x="218" y="35" width="99" height="201" rx="16"/><path d="M94 72h62v137H94zM232 58h71v151h-71zM115 63h20m25 159h-16m114-175h20m-20 176h20"/><path class="ui-diagram-signal" d="M183 130h20m-6-6 6 6-6 6M183 155h20m-14-6-6 6 6 6"/>';
 return '<svg class="ui-illustration" viewBox="0 0 380 280" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(scenes[kind]||scenes.build)+'</svg>';
}
function header(html){
 return replaceElement(html,/<header class="site-header"[^>]*>/,'header',old=>{
  const brand=old.match(/<a class="brand"[\s\S]*?<\/a>/)?.[0]||'';
  const nav=old.match(/<nav class="liquid-nav[^>]*>[\s\S]*?<\/nav>/)?.[0]||'';
  let tools='';replaceElement(old,/<details class="explore-menu[^>]*>/,'details',s=>{tools=s;return s;});
  const country=old.match(/<div class="country-switch"[\s\S]*?<\/div>/)?.[0]||'';
  const theme=old.match(/<button class="theme-toggle"[\s\S]*?<\/button>/)?.[0]||'';
  return '<header class="site-header ui-header" data-ui-header>'+brand+'<a class="clarity-search" href="/search/" aria-label="Search PC Part Performance">'+icon('search')+'</a><button class="ui-menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-menu" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Menu</span></button><div class="ui-menu-scrim" data-menu-dismiss hidden></div><div class="ui-site-menu" id="site-menu"><div class="ui-menu-head"><strong id="site-menu-title">Explore the site</strong><button type="button" class="icon-button" data-menu-close aria-label="Close menu">'+icon('check').replace('<path d="M4 12l5 5L20 6"/>','<path d="m6 6 12 12M18 6 6 18"/>')+'</button></div>'+nav+'<nav class="ui-discover" aria-label="Discover"><p>Discover</p>'+destinations.map(link).join('')+'</nav><nav class="ui-planning" aria-label="Guides and tools"><p>Guides & tools</p>'+planning.map(link).join('')+'</nav>'+tools+'<div class="ui-menu-utilities">'+country+theme+'</div></div></header>';
 });
}
function featureCards(items,label='Choose a starting point',compact=false){
 return '<nav class="ui-feature-grid'+(compact?' ui-feature-grid--compact':'')+'" aria-label="'+label+'">'+items.map(([href,title,copy,art])=>'<a class="ui-feature-card" href="'+href+'"><div class="ui-feature-visual">'+illustration(art)+'</div><div><strong>'+title+'</strong><span>'+copy+'</span></div>'+icon('chevron')+'</a>').join('')+'</nav>';
}
function polish(html,route){
 if(html.includes('data-legacy-redirect')||html.includes('data-ui-refined'))return html;
 const view=route==='/'?'home':route==='/blog/'?'learn':route==='/my-pc/'?'workspace':route.startsWith('/learn/')?'product':(['builder','upgrade','compare','hardware','shop','phones','performance','compatibility','tools','prebuilts','laptops','build-school','troubleshooting','news'].find(v=>route.startsWith('/'+v+'/'))||'general');
 html=html.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g,'');
 html=html.replace('</head>','<link rel="preload" href="/assets/fonts/dm-sans-latin-v17.woff2" as="font" type="font/woff2" crossorigin></head>');
 html=header(html).replace(/<body(?=\s|>)/,'<body data-ui-refined data-ui-view="'+view+'"');
 html=html.replace('<link rel="stylesheet" href="/clarity-site.css">','<link rel="stylesheet" href="/ui-system.css">');
 if(!html.includes('/ui-system.css'))html=html.replace('</head>','<link rel="stylesheet" href="/ui-system.css"></head>');
 if(html.includes('src="/select-ui.js"'))html=html.replace('</head>','<link rel="stylesheet" href="/ui-selectors.css"></head>');
 const major=['/','/builder/','/upgrade/','/compare/','/blog/','/my-pc/','/compatibility/','/shop/','/hardware/','/phones/','/performance/','/prebuilts/','/laptops/','/tools/','/build-school/','/troubleshooting/','/news/'];
 if(major.includes(route)||route.startsWith('/hardware/'))html=html.replace('<link rel="stylesheet" href="/refinement.css">','').replace('</head>','<link rel="stylesheet" href="/ui-destinations.css"></head>');
 if(route==='/'){
  html=html.replace('Compare PC parts, plan a complete build, and understand compatibility, costs and outstanding checks before you buy.','Choose your parts. Check compatibility and costs before you buy.');
  html=replaceElement(html,/<section class="home-passport"[^>]*>/,'section',()=>'<section class="ui-readiness-preview" aria-labelledby="ui-readiness-title"><div class="ui-readiness-art">'+illustration('build')+'</div><div><p class="ui-example-label">Example build review</p><h2 id="ui-readiness-title">More than a parts list.</h2><p>See the connections that match and the checks to finish before buying.</p><ul class="ui-status-list"><li>'+icon('check')+'<span>CPU socket <small>Documented match</small></span></li><li class="ui-status-pending">'+icon('parts')+'<span>BIOS & clearances <small>Exact support still needs checking</small></span></li></ul><a class="button secondary" href="/builder/#readiness-report">See your build report</a></div></section>');
  html=html.replace('New to PCs? <a href="/build-school/">Start with Build School</a>. Returning? <a href="/my-pc/">Open your workspace</a>.','<a href="/build-school/">New to building?</a> <span aria-hidden="true">·</span> <a href="/my-pc/">Your saved work</a>');
 }
 if(route==='/builder/'){
  html=html.replace('<link rel="stylesheet" href="/builder-legacy.css">','');
  html=html.replace('</head>','<link rel="stylesheet" href="/builder-picker.css"></head>');
  html=html.replace('Pick your parts. Check the fit. Preview your PC.','Choose parts. Explore in 3D. Save your plan.');
  html=html.replace('<button class="button secondary" id="builder-clear">Clear build</button>','<button class="button secondary" id="builder-clear">Reset build</button>');
  html=html.replace('<button class="button primary" id="builder-starter">Load starter build</button>','<button class="button primary" id="builder-starter">Try a starter build</button>');
  html=replaceElement(html,/<nav\b[^>]*class="builder-workflow"[^>]*>/,'nav',old=>old.replace('<strong>Choose parts</strong>','<strong>Parts</strong>').replace('Inspect the build','3D preview').replace('Review and save','Review'));
  html=html.replace(/<p class="builder-step-label">[\s\S]*?<\/p>/g,'');
  html=html.replace('Rotate the build and explore your selected parts.','Rotate your build. Select a part to inspect it.');
  html=html.replace('Optional budget, workload and display goal','Budget, workload & display');
 }
 if(route==='/upgrade/'){
  html=html.replace('Keep what still does the job. Compare a specific change with doing nothing, and verify the parts that connect it.','Keep what works. Check a change before you buy.');
  html=replaceElement(html,/<nav class="md-steps"[^>]*>/,'nav',()=> '');
  html=replaceElement(html,/<header class="program-intro"[^>]*>/,'header',old=>'<div class="ui-destination-hero">'+old+'<div class="ui-hero-art">'+illustration('upgrade')+'</div></div>'+featureCards([['#inventory','Record your PC','Start with the parts you own.','workspace'],['#change','Check a change','Recheck each connection.','upgrade'],['#costs','Compare costs','Keep the whole purchase in view.','compare']],'Upgrade workflow'));
  html=html.replace('<h2>1. Record your existing PC','<h2>1. Your current PC').replace('<h2>2. Compare a specific change','<h2>2. Plan a change').replace('<h2>3. Compare the full platform cost','<h2>3. The full upgrade cost');
  html=html.replace(/<p>Select exact models or paste a plain-text list\.[\s\S]*?<\/p>/,'<p>Select your installed parts or review a pasted list.</p><details class="ui-explanation"><summary>How import and extra parts work</summary><p>Your browser cannot detect installed hardware. Confirm every pasted match. Pasted URLs are never fetched; use Additional components for extra drives, cards, memory and fans.</p></details>');
  html=html.replace('Each phase is a complete interim configuration and is checked again. Unknowns still need exact support evidence. Comparable game or application tests are required before claiming a performance gain.','Each phase is checked separately. Verify unknown fit and use comparable tests for performance claims.');
 }
 if(route==='/blog/'){
  html=replaceElement(html,/<header class="page-heading"[^>]*>/,'header',old=>'<div class="ui-destination-hero ui-learn-hero">'+old+'<div class="ui-hero-art">'+illustration('learn')+'</div></div>');
  html=html.replace('<h1>Hardware guides</h1>','<h1>PC building & upgrade guides</h1>').replace('Build, upgrade and understand your hardware.','Practical guides for your next build, upgrade or fix.');
  html=html.replace('<div class="guide-directory-controls">',featureCards([['/build-school/','Build your first PC','From choosing parts to first boot.','build'],['#guides-build','Check the fit','Compatibility, cooling and troubleshooting.','compatibility'],['#guides-cpu','Plan an upgrade','Spend where it makes a difference.','upgrade']],'Learning paths')+'<div class="guide-directory-controls">');
  html=html.replace('<a class="button secondary" href="/build-school/">Start with Build School</a>','');
 }
 if(route==='/my-pc/'){
  html=html.replace('<h1>My PC workspace</h1>','<h1>Your PC, organized.</h1>').replace('Your builds, purchase notes and next steps.','Pick up where you left off.');
  html=html.replace('<div class="my-pc-icon">','<div class="my-pc-icon ui-workspace-symbol">');
  html=html.replace('<nav class="workspace-tabs"',featureCards([['#workspace-builds','Saved builds','Reopen a build or compare revisions.','build'],['#workspace-notebook','Your notebook','Keep purchases, notes and next steps.','workspace'],['#workspace-watchlist','Parts to revisit','Keep your shortlist together.','compare']],'Workspace shortcuts',true)+'<nav class="workspace-tabs"');
  html=html.replace('Save a build to keep its notes and journal here.','Save a build to start its notebook.').replace('Keep the exact products and the differences you were considering.','Save the products and differences that matter.');
 }
 if(route==='/compare/'){
  html=html.replace('Pick up to four parts. See the differences side by side.','Choose up to four exact models.');
  html=replaceElement(html,/<section class="device-entry"[^>]*>/,'section',()=>featureCards([['#comparison-cards','PC parts','Specifications, side by side.','compare'],['/phones/size-compare/','Phones in 3D','Compare the size and design.','phone'],['/prebuilts/','Complete PCs','Compare disclosed configurations.','build']],'Comparison tools',true));
  const exports=[];for(const id of ['export-csv','copy-comparison','print-comparison'])html=html.replace(new RegExp('<button\\b[^>]*id="'+id+'"[^>]*>[\\s\\S]*?<\\/button>'),button=>{exports.push(button);return'';});
  if(exports.length)html=replaceElement(html,/<div class="page-heading"[^>]*>/,'div',old=>old.replace(/<\/div>$/,'<details class="ui-toolbar-more"><summary>Export & share '+icon('chevron')+'</summary><div>'+exports.join('')+'</div></details></div>'));
  html=html.replace('More hardware</small>','Hardware category</small>').replace('Choose what you want to compare','Choose a category');
 }
 if(route==='/compatibility/'){
  html=html.replace('<h1>Check what actually matters</h1>','<h1>Will your parts work together?</h1>').replace('Documented specifications, conditional layouts and unknowns each need a different answer.','Check the connections. Know what still needs verifying.');
  html=replaceElement(html,/<header class="program-intro"[^>]*>/,'header',old=>'<div class="ui-destination-hero">'+old+'<div class="ui-hero-art">'+illustration('compatibility')+'</div></div><div class="ui-status-legend" aria-label="Compatibility states"><span>'+icon('check')+'Documented match</span><span class="ui-status-pending">'+icon('search')+'Needs checking</span><span>'+icon('parts')+'Conflict</span></div>');
 }
 // Shared destinations keep evidence, error messages and original tool controls intact.
 html=html.replace(/<p class="data-note">These are hardware specifications, not game FPS\.<\/p>/,'<p class="data-note">Specifications, not measured FPS.</p>');
 return html;
}
function validateRuntime(name,source,output,entry){
 const digest=value=>crypto.createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex');
 if(!entry||digest(source)!==entry.sourceHash||digest(output)!==entry.outputHash)throw Error('Stale prepared UI runtime: '+name+'. Run node scripts/prepare-ui-runtime.cjs before building.');
 return output;
}
function prepare({root}){
 const fontRoot=path.join(root,'assets/fonts');fs.mkdirSync(fontRoot,{recursive:true});
 for(const name of fs.readdirSync(path.join(__dirname,'assets/fonts')))fs.copyFileSync(path.join(__dirname,'assets/fonts',name),path.join(fontRoot,name));
 for(const name of ['ui-system.css','ui-destinations.css','ui-selectors.css','builder-picker.css'])fs.copyFileSync(path.join(__dirname,name),path.join(root,name));
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'prepared-ui/manifest.json'),'utf8'));
 if(manifest.schema!==1)throw Error('Unsupported UI runtime manifest');
 for(const name of ['continuation-ui.js','builder-selectors.js','select-ui.js']){
  const source=fs.readFileSync(path.join(__dirname,name),'utf8');
  const output=fs.readFileSync(path.join(__dirname,'prepared-ui',name),'utf8');
  fs.writeFileSync(path.join(root,name),validateRuntime(name,source,output,manifest.files[name]));
 }
 return{assets:7};
}
module.exports={polish,prepare,illustration,featureCards,header,validateRuntime};
