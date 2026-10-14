'use strict';
const fs=require('node:fs'),path=require('node:path'),{icon}=require('./clarity-site.cjs');
const clean=s=>String(s||'').replace(/<[^>]+>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replace(/\s+/g,' ').trim();
const groups=[['build','Building & compatibility','build'],['gpu','Graphics cards','parts'],['cpu','Processors & upgrades','parts'],['memory','Memory & storage','parts'],['laptop','Gaming laptops','laptop'],['games','Gaming performance','game'],['phones','Phones & 3D','phone'],['ai','AI hardware','parts']];
function category(slug,title){const s=(slug+' '+title).toLowerCase();if(/laptop|optimus|mux-switch/.test(s))return'laptop';if(/phone|3d.*preview/.test(s))return'phones';if(/ai-|data.center|hbm|memory-demand|local-ai|ram-shortage/.test(s))return'ai';if(/fps|frame|benchmark|display-target|baldur|game-requirements/.test(s))return'games';if(/ssd|nvme|storage|ram-|memory|ddr/.test(s))return'memory';if(/cpu|processor|am4|am5|platform-upgrade/.test(s))return'cpu';if(/gpu|graphics-card|rtx-|rx-/.test(s))return'gpu';return'build';}
module.exports=({root,shell,write,esc})=>{
 const items=[];
 for(const entry of fs.readdirSync(path.join(root,'blog'),{withFileTypes:true})){
  const file=path.join(root,'blog',entry.name,'index.html');if(!entry.isDirectory()||!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,'utf8');if(/data-program-draft|data-stage2-noindex|data-legacy-redirect/.test(html))continue;
  const title=clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]);if(!title)continue;
  const description=clean(html.match(/<meta name="description" content="([^"]*)"/)?.[1]);
  items.push({route:'/blog/'+entry.name+'/',title,description:description.split(/(?<=\.)\s/)[0],category:category(entry.name,title)});
 }
 items.sort((a,b)=>a.title.localeCompare(b.title));
 for(const asset of ['guide-directory.css','guide-directory.js'])fs.copyFileSync(path.join(__dirname,asset),path.join(root,asset));
 const filters='<details class="guide-topic-filter"><summary>Topics <span data-guide-filter-count></span></summary><fieldset><legend class="sr-only">Guide topics</legend>'+groups.map(([id,title])=>'<label><input type="checkbox" data-guide-topic="'+id+'">'+title+'</label>').join('')+'</fieldset></details>';
 const sections=groups.map(([id,title,name])=>{const rows=items.filter(a=>a.category===id);if(!rows.length)return'';return '<section class="guide-directory-group" data-guide-group="'+id+'" id="guides-'+id+'"><h2>'+icon(name)+title+'</h2><div>'+rows.map(a=>'<article data-guide-card data-guide-category="'+id+'" data-guide-search="'+esc((a.title+' '+a.description).toLowerCase())+'"><h3><a href="'+a.route+'">'+esc(a.title)+'</a></h3><p>'+esc(a.description)+'</p></article>').join('')+'</div></section>';}).join('');
 write('blog',shell('PC hardware guides: build, upgrade and understand your PC','learn','<div class="guide-directory"><header class="page-heading"><div><h1>Hardware guides</h1><p>Build, upgrade and understand your hardware.</p></div><a class="button secondary" href="/build-school/">Start with Build School</a></header><div class="guide-directory-controls"><label class="search-field">'+icon('search')+'<span class="sr-only">Search guides</span><input type="search" data-guide-query placeholder="Search guides"></label>'+filters+'<button class="button secondary" type="button" data-guide-reset>Reset</button></div><p data-guide-count aria-live="polite">'+items.length+' guides</p>'+sections+'<p data-guide-empty hidden>No matching guides. Try another topic or clear the search.</p><div class="guide-directory-next"><a href="/news/">Read hardware news</a><a href="/resources/">Checklists and resources</a><a href="/blog/feed.xml">Subscribe by RSS</a></div></div>',{description:'Read practical PC building, upgrade, compatibility, graphics card, SSD and gaming laptop guides. Browse by topic or search an exact question.'}).replace('</head>','<link rel="stylesheet" href="/guide-directory.css"><script src="/guide-directory.js" defer></script></head>'));
 return {guides:items.length,groups:groups.length};
};
module.exports.category=category;
