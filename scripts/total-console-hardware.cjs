'use strict';
const fs=require('node:fs'),path=require('node:path');
const data=require('./total-console-hardware-data.cjs');
const {replaceElement}=require('./clarity-site.cjs');
function silhouette(kind){
 const shapes={
  switch:'<rect x="30" y="46" width="180" height="86" rx="22"/><rect x="66" y="55" width="108" height="68" rx="4"/><path d="M61 48v82m117-82v82M40 80h14m-7-7v14"/><circle cx="192" cy="89" r="5"/>',
  switch2:'<rect x="20" y="39" width="200" height="98" rx="24"/><rect x="58" y="48" width="124" height="80" rx="4"/><path d="M54 43v90m132-90v90M31 73h14m-7-7v14"/><circle cx="203" cy="101" r="5"/>',
  ps5:'<path d="M86 19q19 60 2 126l26-7h18l26 7q-17-66 2-126l-30 10h-16Z"/><path d="M115 31v107m16-107v107M94 124h13"/>',
  ps5pro:'<path d="M86 19q19 60 2 126l26-7h18l26 7q-17-66 2-126l-30 10h-16Z"/><path d="M115 31v107m16-107v107M92 81h20m-19 8h19m-20 8h20"/>',
  seriesx:'<path d="m78 30 57-15 29 18v107l-59 15-27-20Zm0 0 27 20 59-17m-59 17v105"/><path d="m90 33 45-11m-37 17 46-11"/><circle cx="149" cy="55" r="4"/>',
  seriess:'<rect x="74" y="21" width="92" height="134" rx="7"/><circle cx="120" cy="70" r="29"/><path d="M101 53h38m-44 10h50m-53 11h55m-48 11h42"/><circle cx="148" cy="138" r="3"/>',
  gameboy:'<path d="M75 15h91v124q0 18-24 18H75Z"/><rect x="86" y="28" width="68" height="54" rx="4"/><path d="M92 109h25m-13-12v25m19 16 16-4"/><circle cx="141" cy="105" r="5"/><circle cx="154" cy="94" r="5"/>',
  handheld:'<rect x="20" y="51" width="200" height="85" rx="27"/><rect x="65" y="60" width="110" height="65" rx="4"/><path d="M31 90h22m-11-11v22"/><circle cx="191" cy="86" r="4"/><circle cx="205" cy="100" r="4"/>',
  ds:'<path d="M65 15h110v65H65zm-8 70h126v66H57Z"/><rect x="80" y="25" width="80" height="43" rx="3"/><rect x="80" y="96" width="80" height="43" rx="3"/><path d="M62 115h12m-6-6v12"/>',
  ps1:'<path d="m45 53 142-12 24 20v64l-151 12-15-20Z"/><path d="m45 53 15 20 151-12M60 73v64"/><ellipse cx="127" cy="67" rx="45" ry="18"/><path d="M74 108h24m9-2h23"/>',
  ps2:'<path d="m51 40 125-14 20 16v100l-123 14-22-21Zm0 0 22 17 123-15M73 57v99M79 70l102-12m-102 24 102-12m-101 25 101-12M84 120l87-10"/>',
  ps3:'<path d="M41 52q72-45 154 0l12 79H32Z"/><path d="M52 66h140M57 115h120m-120 10h50"/>',
  cube:'<path d="m64 47 74-22 47 29v84l-77 24-44-30Zm0 0 44 31 77-24m-77 24v84"/><path d="M93 36v-13q0-14 20-14h31q18 0 18 15v18M119 112h9m10-5h9m10-5h9"/>',
  wii:'<path d="m90 20 55-10 10 133-56 14Z"/><path d="m111 40 3 75m20 11h5m-32 14 37-6"/>',
  wiiu:'<rect x="22" y="70" width="195" height="69" rx="19"/><rect x="66" y="78" width="108" height="51" rx="4"/><path d="M32 103h22m-11-11v22"/><circle cx="194" cy="99" r="5"/><path d="M71 41h121v21H71Z"/>',
  n64:'<path d="m43 85 23-29h108l26 29-13 52H57Z"/><path d="M92 52v-13h54v13M72 104h12m18 0h12m18 0h12m18 0h12"/>',
  nes:'<path d="m40 62 130-22 37 24v76L72 157l-32-28Z"/><path d="m40 62 32 22 135-20M72 84v73M93 88l76-11v41l-76 10Z"/>',
  snes:'<rect x="34" y="53" width="172" height="87" rx="22"/><path d="M83 59h73v36H83zm-30 50h43m39 0h43"/><circle cx="66" cy="125" r="4"/><circle cx="83" cy="125" r="4"/>',
  xbox:'<path d="m36 59 136-20 36 24v71L71 155l-35-22Z"/><path d="m36 59 35 22 137-18M71 81v74m18-83 65-24m-62 2 65 19M89 120h78"/>',
  disc:'<rect x="40" y="49" width="160" height="94" rx="12"/><ellipse cx="120" cy="78" rx="48" ry="22"/><path d="M56 119h22m16 0h22m16 0h22m16 0h14"/>'
 };
 return '<svg class="total-console-silhouette" viewBox="0 0 240 170" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[kind]||shapes.disc)+'</svg>';
}
function sourceLink(id,esc){const s=data.sources[id];return '<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.publisher)+' source</a>';}
function facts(record,esc){return '<dl class="total-console-facts">'+record.facts.map(f=>'<div><dt>'+esc(f.label)+'</dt><dd>'+esc(f.value)+'</dd></div>').join('')+'</dl>';}
function validate(){const ids=new Set(),errors=[];for(const r of [...data.modern,...data.historical]){if(ids.has(r.id))errors.push('Duplicate console '+r.id);ids.add(r.id);if(!data.sources[r.source])errors.push('Missing source '+r.id);if(r.facts)for(const f of r.facts)if(!data.sources[f.source]||f.status!=='manufacturer-specified')errors.push('Unverified fact '+r.id);if('desktopEquivalentGpu' in r||'fps' in r)errors.push('Unsupported performance claim '+r.id);}return{valid:errors.length===0,errors,modern:data.modern.length,historical:data.historical.length};}
function prepare({root,shell,write,esc}){
 const audit=validate();if(!audit.valid)throw Error(audit.errors.join('\n'));
 fs.copyFileSync(path.join(__dirname,'total-console-hardware.css'),path.join(root,'total-console-hardware.css'));
 const sourceDetails='<details class="total-console-sources"><summary>Sources and scope</summary><p>Manufacturer specifications describe the named hardware. Output capability is not a measured game frame rate. Illustrations show form factors, not physical clearance.</p><ul>'+Object.entries(data.sources).map(([id,s])=>'<li>'+sourceLink(id,esc)+' — '+esc(s.title)+'; inspected '+s.checkedAt+'</li>').join('')+'</ul></details>';
 const modern=data.modern.map(r=>'<article class="total-console-card" id="'+r.id+'"><div class="total-console-card-top">'+silhouette(r.kind)+'<div><h2>'+esc(r.name)+'</h2><p>'+esc(r.summary)+'</p></div></div><p class="total-console-scope">'+esc(r.scope)+'</p><details><summary>Hardware details</summary>'+facts(r,esc)+'<p>'+esc(r.unknown.join(' '))+'</p>'+sourceLink(r.source,esc)+'</details><div class="total-console-actions"><a href="/performance/?platform='+r.platform+'">Game evidence</a>'+(r.partId?'<a href="/learn/'+r.partId+'.html">Hardware record</a>':sourceLink(r.source,esc))+'</div></article>').join('');
 write('performance/consoles',shell('Console Hardware Guide: Switch 2, PS5 and Xbox Series','resource','<header class="page-heading total-console-heading"><div><h1>Console hardware</h1><p>Compare what manufacturers disclose, then check the game.</p></div><a class="button primary" href="/performance/?platform=other">Find a console game</a></header><nav class="total-console-navigation" aria-label="Console research"><a href="/performance/retro/">Retro timeline</a><a href="/hardware/consoles/">All consoles</a><a href="/performance/coverage/">FPS evidence</a></nav><section class="total-console-grid" aria-label="Modern consoles">'+modern+'</section>'+sourceDetails,{description:'Source-linked Nintendo Switch 2, Switch, PlayStation 5, PS5 Pro and Xbox Series hardware facts with exact-model scope, original illustrations and game-performance links.'}).replace('</head>','<link rel="stylesheet" href="/total-console-hardware.css"></head>'));
 const timeline=data.historical.slice().sort((a,b)=>a.year-b.year||a.name.localeCompare(b.name)).map(r=>'<li id="'+r.id+'"><div class="total-retro-art">'+silhouette(r.kind)+'</div><div><span class="total-retro-year">'+r.year+'</span><h2>'+esc(r.name)+'</h2><p>'+esc(r.region)+'</p><details><summary>Platform notes</summary><p>'+esc(r.note)+'</p>'+sourceLink(r.source,esc)+'</details></div><a class="total-retro-record" href="/learn/'+r.partId+'.html">Hardware record<span class="sr-only"> for '+esc(r.name)+'</span></a></li>').join('');
 write('performance/retro',shell('Retro Console Hardware Timeline: Nintendo, PlayStation, Xbox and SEGA','resource','<header class="page-heading total-console-heading"><div><h1>Retro hardware timeline</h1><p>Explore earlier systems without mixing their games or regional releases.</p></div><a class="button secondary" href="/performance/consoles/">Modern consoles</a></header><p class="total-retro-intro">Dates follow the named manufacturer history or region. This is a selected hardware reference, not a complete retro game or performance archive.</p><ol class="total-retro-timeline">'+timeline+'</ol>'+sourceDetails,{description:'Explore source-linked Nintendo, PlayStation, Xbox and Dreamcast hardware history with original silhouettes, regional launch context and existing hardware records.'}).replace('</head>','<link rel="stylesheet" href="/total-console-hardware.css"></head>'));
 fs.writeFileSync(path.join(root,'data/console-hardware-reference.json'),JSON.stringify(data));
 return audit;
}
function polish(html,route){
 if(html.includes('data-total-console-reference'))return html;
 const record=data.modern.find(r=>r.partId&&route==='/learn/'+r.partId+'.html');
 if(record){html=html.replace('</head>','<link rel="stylesheet" href="/total-console-hardware.css"></head>');const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));html=html.replace('</main>','<section class="total-console-reference" data-total-console-reference><div>'+silhouette(record.kind)+'</div><div><h2>Manufacturer hardware details</h2><p>'+esc(record.scope)+'</p><details><summary>View the source-linked specifications</summary>'+facts(record,esc)+'<p>'+esc(record.unknown.join(' '))+'</p>'+sourceLink(record.source,esc)+'</details><a href="/performance/consoles/#'+record.id+'">Explore console hardware</a></div></section></main>');}
 if(route==='/hardware/consoles/')html=html.replace('<div class="catalog-tools">','<nav class="total-console-navigation" data-total-console-reference aria-label="Console research"><a href="/performance/consoles/">Modern console guide</a><a href="/performance/retro/">Retro timeline</a></nav><div class="catalog-tools">').replace('</head>','<link rel="stylesheet" href="/total-console-hardware.css"></head>');
 if(route==='/performance/')html=replaceElement(html,/<details class="total-fps-method"[^>]*>/,'details',old=>old.replace('</details>','<p data-total-console-reference><a href="/performance/consoles/">Console hardware guide</a> · <a href="/performance/retro/">Retro hardware</a></p></details>'));
 return html;
}
module.exports={prepare,polish,validate,silhouette,data};
