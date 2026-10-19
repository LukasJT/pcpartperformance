'use strict';
/* Complete local review pages. Never writes to dist, a feed or a public route. */
const fs=require('node:fs'),path=require('node:path');
const content=require('./evolution-editorial-data.cjs'),themes=require('./evolution-themes.cjs'),styles=require('./evolution-style-scope.cjs');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(directory=path.resolve('docs/evolution-oct18/editorial/previews')){
 const repo=path.resolve(__dirname,'..'),allowed=path.join(repo,'docs/evolution-oct18/editorial');
 if(!path.resolve(directory).startsWith(allowed+path.sep))throw Error('Review output must stay inside the local editorial packet');
 fs.mkdirSync(directory,{recursive:true});
 const css=themes.css()+fs.readFileSync(path.join(__dirname,'evolution-system.css'),'utf8')+styles.scopeCSS(fs.readFileSync(path.join(__dirname,'evolution-destinations.css'),'utf8'),['article'])+'body{margin:0;font-family:system-ui,sans-serif}main{padding:24px;max-width:980px;margin:auto}.review-banner{padding:18px 24px;border-bottom:1px solid #8c9db5;background:#eaf0fb;color:#142039;line-height:1.6}.review-banner a{text-decoration:underline}img{max-width:100%;height:auto}.review-status{border:1px solid #7c8ca5;border-radius:12px;padding:20px;margin:28px 0;line-height:1.8}h1{font-size:2.4rem}ul{padding-left:24px}a{color:#2153c6}.review-sources{margin-top:40px}';
 const shell=(title,body)=>'<!doctype html><html lang="en" data-theme="light" data-palette="arctic" data-motion="reduced"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>'+esc(title)+' — private research draft</title><style>'+css+'</style></head><body data-ui-refined data-lab-evolution><header class="review-banner"><strong>Local editorial review</strong> · Unpublished · No human approval<br><a href="index.html">All36 drafts</a> · <a href="../REVIEW-PACKET.md">Review packet</a></header><main>'+body+'</main></body></html>';
 const pages=[];
 for(const a of content.articles){
  const visual=path.relative(directory,path.resolve(repo,a.visual.path)).replaceAll('\\','/');
  const sources=a.sourceIds.map(id=>{const s=content.sources[id];return '<li><a href="'+esc(s.url)+'">'+esc(s.publisher+': '+s.title)+'</a><p>'+esc(s.limitations)+'</p></li>';}).join('');
  const article='<article class="evolution-article" data-lab-article><p>'+esc(a.id)+' · Evidence inspected '+esc(a.evidenceDate)+'</p><h1>'+esc(a.title)+'</h1><p class="master-answer">'+esc(a.answer)+'</p><div class="review-status">Research-assisted draft. Proposed byline: PC Part Performance. No first-hand testing, publication date, editorial approval or human authorship is claimed.</div><figure><img src="'+esc(visual)+'" alt="'+esc(a.visual.alt)+'" width="960" height="520"><figcaption>'+esc(a.visual.evidence)+'</figcaption></figure>'+a.body+'<section><h2>Apply this to your PC</h2><ul>'+a.relatedTools.map(t=>'<li><a href="https://www.pcpartperformance.com'+esc(t.href)+'">'+esc(t.label)+'</a></li>').join('')+'</ul></section><section class="review-sources"><h2>Sources and scope</h2><ol>'+sources+'</ol></section><p>Content fingerprint: <code>'+esc(a.contentHash)+'</code></p></article>';
  const file=a.id+'-'+a.slug+'.html';fs.writeFileSync(path.join(directory,file),shell(a.title,article));pages.push({id:a.id,file,contentHash:a.contentHash,visual});
 }
 fs.writeFileSync(path.join(directory,'index.html'),shell('Editorial review index','<h1>36 research drafts.</h1><p>Read the complete copy, source conditions and original diagram before recording a human editorial decision. These pages are local files, excluded from the production build.</p><ol>'+pages.map(p=>'<li><a href="'+p.file+'">'+esc(content.articles.find(a=>a.id===p.id).title)+'</a></li>').join('')+'</ol>'));
 const report={generatedAt:new Date().toISOString(),rendered:pages.length,published:0,humanReviewed:0,output:path.relative(repo,directory).replaceAll('\\','/'),pages,scope:'Local static reading previews only. Browser rendering and human editorial review remain separate gates.'};
 fs.writeFileSync(path.join(allowed,'preview-manifest.json'),JSON.stringify(report,null,2)+'\n');return report;
}
module.exports={render};if(require.main===module)console.log(JSON.stringify({rendered:render().rendered,published:0}));
