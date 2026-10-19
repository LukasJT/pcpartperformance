'use strict';
const {replaceElement,icon}=require('./clarity-site.cjs');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const actionIcon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+({share:'<path d="M12 16V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H4v13h4"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',print:'<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7zM17 11h1"/>'}[name]||'')+'</svg>';
function featureRows(items,label='Featured tools'){
 return '<nav class="clarity-features total-feature-rows" aria-label="'+esc(label)+'">'+items.map(([href,title,description,kind])=>'<a class="total-feature-row" href="'+esc(href)+'"><span class="total-feature-icon" aria-hidden="true">'+icon(kind)+'</span><span class="total-feature-copy"><strong>'+esc(title)+'</strong><small>'+esc(description)+'</small></span><span class="total-feature-arrow" aria-hidden="true">'+icon('chevron')+'</span></a>').join('')+'</nav>';
}
function polish(html,route){
 if(html.includes('data-total-refined')||html.includes('data-legacy-redirect'))return html;
 html=html.replace(/<body(?=\s|>)/,'<body data-total-refined');
 html=replaceElement(html,/<nav class="ui-planning"[^>]*>/,'nav',nav=>'<details class="total-menu-tools"><summary>Guides &amp; tools</summary>'+nav+'</details>');
 if(route==='/'){
  html=replaceElement(html,/<nav class="clarity-features"[^>]*>/,'nav',()=>featureRows([['/phones/','Compare phones','Size, specifications and 3D.','phone'],['/prebuilts/','Find a prebuilt','Compare real configurations.','build'],['/performance/','Game performance','PC evidence and console modes.','game']]));
  html=replaceElement(html,/<section class="tech-categories"[^>]*>/,'section',block=>block.replace(/<div class="tech-category-copy">([\s\S]*?)<\/div>/g,(all,copy)=>'<div class="tech-category-copy">'+copy.replace(/<p>[\s\S]*?<\/p>/g,'').replace('<h3>Solid-state drives</h3>','<h3>SSDs</h3>')+'</div>').replace('Browse all ','Browse '));
  html=replaceElement(html,/<div class="tech-guide-grid"[^>]*>/,'div',()=>'<div class="tech-guide-grid total-guide-grid">'+[['/performance/','Game performance','PC benchmarks and console modes.','game'],['/blog/understanding-pc-memory/','Choose memory','Capacity, generation and speed.','parts'],['/blog/choosing-an-ssd/','Choose storage','Understand SSD fit and interfaces.','parts'],['/builder/','Check compatibility','Review your whole parts list.','check']].map(([href,title,copy,kind])=>'<a class="total-guide-link" href="'+href+'">'+icon(kind)+'<span><h3>'+title+'</h3><p>'+copy+'</p></span>'+icon('chevron')+'</a>').join('')+'</div>');
 }
 if(route==='/builder/'){
  let reportActions='';
  html=html.replace(/<div class="program-actions">\s*(<button[^>]*data-program-print[\s\S]*?<\/button>\s*<button[^>]*data-passport-download[\s\S]*?<\/button>)\s*<\/div>/,(_,buttons)=>{reportActions=buttons.replace('Print build report',actionIcon('print')+'<span>Print report</span>').replace('Download build report',actionIcon('download')+'<span>Download report</span>');return '';});
  html=replaceElement(html,/<section[^>]*id="build-revisions"[^>]*>/,'section',old=>{
   let help='';old=old.replace(/<p class="program-help">([\s\S]*?)<\/p>/,(all,text)=>{help=text;return '';});
   old=old.replace('<h2 id="build-revisions-title">Save, compare and share</h2>','<h2 id="build-revisions-title">Save your build</h2>').replace('<p>Revisions stay on this device. No account or email is needed.</p>','').replace('Compare complete purchase quotes','Purchase worksheet').replace('Open My PC workspace','My PC workspace');
   old=old.replace('Revision name<input','Build name<input').replace('Save this revision</button>','Save build</button>');
   old=old.replace('Copy share link</button>',actionIcon('share')+'<span>Copy link</span></button>').replace('Copy parts list</button>',actionIcon('copy')+'<span>Copy parts</span></button>');
   old=old.replace(/(<button[^>]*data-program-copy="text"[\s\S]*?<\/button>)/,'$1'+reportActions);
   old=old.replace('<div class="program-actions">','<div class="program-actions total-save-toolbar" aria-label="Share and export build">');
   old=old.replace('<summary>More save options</summary>','<summary>Backups &amp; files</summary>');
   return old.replace('<p id="program-status"','<details class="total-save-info"><summary>Sharing &amp; storage</summary><p>'+help+'</p></details><p id="program-status"');
  });
  html=html.replace('Set up a guided plan</summary>','Budget &amp; goals</summary>').replace('Explore a part alternative</summary>','Find an alternative</summary>');
 }
 return html;
}
function prepare({root}){
 const fs=require('node:fs'),path=require('node:path'),{digest}=require('./prepare-total-runtime.cjs');
 const source=fs.readFileSync(path.join(__dirname,'builder-v2.js'),'utf8'),output=fs.readFileSync(path.join(__dirname,'prepared-total/builder-v2.js'),'utf8'),manifest=require('./prepared-total/manifest.json');
 if(digest(source)!==manifest.sourceHash||digest(output)!==manifest.outputHash)throw Error('Stale builder runtime; run node scripts/prepare-total-runtime.cjs');
 fs.writeFileSync(path.join(root,'builder-v2.js'),output);
}
module.exports={featureRows,polish,prepare};
