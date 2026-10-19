'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {replaceElement,icon}=require('./clarity-site.cjs'),art=require('./evolution-art.cjs'),theme=require('./evolution-themes.cjs'),styles=require('./evolution-style-scope.cjs');
const major=['/','/builder/','/upgrade/','/compare/','/my-pc/','/hardware/','/shop/','/compatibility/','/performance/','/build-school/','/blog/','/phones/','/phones/size-compare/','/prebuilts/','/laptops/','/tools/','/news/','/troubleshooting/','/search/'];
const appearanceButton='<button type="button" class="lab-appearance-open" data-appearance-open hidden aria-haspopup="dialog" aria-controls="lab-appearance" aria-label="Customize appearance"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m12 3 9 5v8l-9 5-9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg><span>Appearance</span></button>';
function kindFor(text){const s=text.toLowerCase();return /motherboard|bios|firmware|pcie|pci-e|socket/.test(s)?'motherboard':/power|psu|cable|connector|atx 3/.test(s)?'psu':/ram|memory|ddr|xmp|expo|cas/.test(s)?'ram':/ssd|nvme|storage|drive|sata|m\.2/.test(s)?'ssd':/cool|thermal|paste|noise/.test(s)?'cooler':/fan|airflow/.test(s)?'fan':/laptop/.test(s)?'laptop':/display|monitor|resolution|refresh|hdmi|frame|fps/.test(s)?'display':/gpu|graphics|vram|geforce|radeon/.test(s)?'gpu':/cpu|processor|cache/.test(s)?'cpu':'case';}
function originalHero(old){let copy='',search='';replaceElement(old,/<div>/,'div',s=>{copy=s;return s;});replaceElement(old,/<form\b[^>]*class="tech-search"[^>]*>/,'form',s=>{search=s;return s;});return '<section class="lab-home-hero lab-ambient" data-lab-ambient aria-labelledby="home-title">'+copy.replace('<div>','<div class="lab-hero-copy">')+'<div class="lab-home-art">'+art.studio()+'<div class="lab-hero-stages" aria-label="Your build journey"><span>Choose parts</span>'+icon('chevron')+'<span>Explore in 3D</span>'+icon('chevron')+'<span>Review &amp; save</span></div></div></section><div class="lab-home-search">'+search+'</div>';}
function articlePolish(html,route){
 if(!/^\/(?:blog|news)\/[^/]+\/$/.test(route)||html.includes('data-program-draft'))return html;
 const title=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]*>/g,'')||'';
 return replaceElement(html,/<article\b[^>]*class="[^"]*(?:master-article|oct11-article|article-copy|research-article|publication-copy)[^"]*"[^>]*>/,'article',article=>{
  article=article.replace('<article','<article data-lab-article');
  article=article.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/,'<div class="lab-article-title"><h1$1>$2</h1><div class="lab-article-mark" aria-hidden="true">'+art.hardware(kindFor(title),{decorative:true})+'</div></div>');
  if(!/aria-label="(?:Article contents|Table of contents|On this page)"|class="[^"]*(?:contents|toc)/i.test(article)){
   const items=[],used=new Set([...article.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));let n=0;article=article.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g,(all,attrs,label)=>{if(/<a\b/.test(label))return all;let id=attrs.match(/\bid="([^"]+)"/)?.[1];if(!id){do{id='guide-section-'+(++n);}while(used.has(id));used.add(id);}items.push({id,label:label.replace(/<[^>]*>/g,'')});return '<h2'+(attrs.includes('id=')?attrs:attrs+' id="'+id+'"')+'>'+label+'</h2>';});
   if(items.length>2){const toc='<details class="lab-contents"><summary>On this page</summary><ol>'+items.map(i=>'<li><a href="#'+i.id+'">'+i.label+'</a></li>').join('')+'</ol></details>';article=article.includes('</div></div>')?article.replace('</div></div>','</div></div>'+toc):article.replace(/(<article\b[^>]*>)/,'$1'+toc);}
  }
  return '<div class="lab-reading-progress" aria-hidden="true"><span data-reading-progress></span></div>'+article;
 });
}
function polish(html,route){
 if(html.includes('data-legacy-redirect')||html.includes('data-lab-evolution'))return html;
 html=html.replace(/<body(?=\s|>)/,'<body data-lab-evolution');
 html=html.replace(/<link\b[^>]*rel="preconnect"[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>/g,'');
 html=html.replace(/<link rel="stylesheet" href="\/(?:refinement|editorial|motion)\.css">/g,'');
 html=html.replace(/<script\b[^>]*\bsrc="\/(?:motion|evolution-motion)\.js"[^>]*><\/script>/g,'');
 const families=styles.families(route);html=html.replace('</head>','<link rel="stylesheet" href="/evolution-themes.css"><link rel="stylesheet" href="/evolution-system.css">'+(families.length?'<link rel="stylesheet" href="/evolution-view-'+families.join('-')+'.css">':'')+'</head>');
 html=replaceElement(html,/<div class="ui-menu-utilities"[^>]*>/,'div',old=>old.replace('<div class="ui-menu-utilities">','<div class="ui-menu-utilities"><p class="lab-preference-heading">Preferences</p>').replace(/<\/div>$/,appearanceButton+'</div>'));
 html=html.replace('</body>',theme.picker()+'</body>');
 html=replaceElement(html,/<footer\b[^>]*class="[^"]*site-footer[^"]*"[^>]*>/,'footer',old=>old.replace(/<\/footer>$/,'<div class="lab-motion-footer"><button type="button" data-appearance-open hidden aria-haspopup="dialog" aria-controls="lab-appearance">Appearance settings</button><button type="button" data-motion-pause hidden aria-pressed="false">Pause ambient motion</button></div></footer>'));
 if(route==='/'){
  html=html.replace('<link rel="stylesheet" href="/ui-destinations.css">','');
  html=replaceElement(html,/<section class="tech-intro"[^>]*>/,'section',originalHero);
  html=replaceElement(html,/<div class="ui-readiness-art"[^>]*>/,'div',()=>'<div class="ui-readiness-art lab-readiness-connections">'+art.hardware('cpu',{decorative:true})+'<span>'+icon('chevron')+'</span>'+art.hardware('motherboard',{decorative:true})+'</div>');
  html=html.replace('More than a parts list.','Understand the connections.');
 }
 if(route==='/upgrade/')html=replaceElement(html,/<div class="ui-hero-art"[^>]*>/,'div',()=>'<div class="ui-hero-art lab-upgrade-art">'+art.hardware('gpu',{decorative:true})+art.hardware('psu',{decorative:true})+'</div>');
 if(route==='/compatibility/')html=replaceElement(html,/<div class="ui-hero-art"[^>]*>/,'div',()=>'<div class="ui-hero-art">'+art.hardware('motherboard',{decorative:true})+'</div>');
 if(route==='/my-pc/'){
  html=replaceElement(html,/<nav\b[^>]*aria-label="Workspace shortcuts"[^>]*>/,'nav',()=> '');
  html=html.replace('<nav class="workspace-tabs" aria-label="Your workspace">','<nav class="workspace-tabs lab-workspace-shortcuts" aria-label="Workspace shortcuts">');
  html=html.replace('<header class="my-pc-heading">','<header class="my-pc-heading lab-ambient" data-lab-ambient>');
  html=replaceElement(html,/<div class="my-pc-icon[^>]*>/,'div',()=>'<div class="my-pc-icon lab-workspace-icon" aria-hidden="true">'+art.hardware('case',{decorative:true})+'</div>');
  for(const id of ['workspace-notebook','workspace-changes'])html=replaceElement(html,new RegExp('<section\\b[^>]*id="'+id+'"[^>]*>'),'section',old=>'<details class="lab-workspace-detail"><summary>'+(id==='workspace-notebook'?'Notebook, purchases & ownership':'What changed?')+'</summary>'+old+'</details>');
 }
 if(route==='/build-school/'){
  html=replaceElement(html,/<header class="program-intro"[^>]*>/,'header',old=>'<div class="lab-school-hero lab-ambient" data-lab-ambient>'+old+'<div class="lab-school-art">'+art.hardware('case',{decorative:true})+art.hardware('motherboard',{decorative:true})+'</div></div>');
  let lesson=0;html=html.replace(/<article class="program-card">/g,()=>'<article class="program-card lab-lesson"><div class="lab-lesson-art" aria-hidden="true">'+art.hardware(['case','cpu','motherboard','psu','cooler','ssd'][lesson++%6],{decorative:true})+'</div>');
  html=html.replace('<section class="program-grid"','<p class="lab-diagram-link"><a class="button secondary" href="/build-school/hardware-diagrams/">Explore interactive hardware diagrams</a></p><section class="program-grid"');
 }
 if(route==='/resources/')html=html.replace('</main>','<p><a href="/resources/publisher-readiness/">Publisher setup checklist</a></p></main>');
 if(route.startsWith('/tools/'))html=replaceElement(html,/<header\b[^>]*class="[^"]*(?:page-heading|program-intro)[^"]*"[^>]*>/,'header',old=>'<div class="lab-tool-hero">'+old+'<div class="lab-tool-art" aria-hidden="true">'+art.hardware(kindFor(old),{decorative:true})+'</div></div>');
 if(route==='/prebuilts/'||route==='/laptops/')html=replaceElement(html,/<header\b[^>]*class="[^"]*(?:page-heading|program-intro)[^"]*"[^>]*>/,'header',old=>'<div class="lab-device-hero">'+old+'<div class="lab-device-art" aria-hidden="true">'+art.hardware(route==='/laptops/'?'laptop':'case',{decorative:true})+'</div></div>');
 if(route.startsWith('/hardware/'))html=replaceElement(html,/<nav class="catalog-directory"[^>]*>/,'nav',old=>'<details class="lab-catalog-directory"><summary>Browse all hardware categories</summary>'+old+'</details>');
 if(route==='/blog/')html=replaceElement(html,/<div class="ui-hero-art"[^>]*>/,'div',()=>'<div class="ui-hero-art lab-guide-art">'+art.hardware('cpu',{decorative:true})+art.hardware('ram',{decorative:true})+'</div>');
 if(route==='/performance/')html=html.replace('<div class="fps-hero-copy">','<div class="fps-hero-copy"><span class="lab-performance-symbol" aria-hidden="true">'+art.hardware('display',{decorative:true})+'</span>');
 html=articlePolish(html,route);
 return html;
}
function prepare({root}){
 art.prepare(root);
 const swatches=theme.themes.map(t=>'.lab-swatch-'+t.id+'{background:'+t.colors.bg+'}.lab-swatch-'+t.id+' i:first-child{background:'+t.colors.muted+'}.lab-swatch-'+t.id+' i:nth-child(2){background:'+t.colors.accent+'}.lab-swatch-'+t.id+' i:nth-child(3){background:'+t.colors.raised+'}.lab-swatch-'+t.id+' i:nth-child(4){background:'+t.colors.secondary+'}').join('\n');
 fs.writeFileSync(path.join(root,'evolution-themes.css'),theme.css()+'\n'+swatches);
 fs.copyFileSync(path.join(__dirname,'evolution-system.css'),path.join(root,'evolution-system.css'));
 fs.copyFileSync(path.join(__dirname,'evolution-theme-fallback.js'),path.join(root,'evolution-theme-fallback.js'));
 const destinationSource=fs.readFileSync(path.join(__dirname,'evolution-destinations.css'),'utf8');for(const family of Object.keys(styles.groups))fs.writeFileSync(path.join(root,'evolution-view-'+family+'.css'),styles.scopeCSS(destinationSource,[family]));
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'prepared-evolution/manifest.json'),'utf8'));
 for(const name of ['evolution-theme.js','evolution-motion.js']){const source=fs.readFileSync(path.join(__dirname,name),'utf8'),output=fs.readFileSync(path.join(__dirname,'prepared-evolution',name),'utf8'),entry=manifest.files[name],hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');if(!entry||hash(source)!==entry.sourceHash||hash(output)!==entry.outputHash)throw Error('Stale evolution runtime '+name);fs.writeFileSync(path.join(root,name==='evolution-theme.js'?'theme.js':name),output);}
 return {themes:theme.themes.map(t=>t.id),hardwareIllustrations:art.kinds.length};
}
module.exports={prepare,polish,articlePolish,kindFor,major,appearanceButton};
