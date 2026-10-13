'use strict';
const fs=require('node:fs'),path=require('node:path');
const {articles,sources}=require('./continuation-editorial-content.cjs');
const humanGate=require('./program-editorial-review.cjs');
const newsPolicy=require('./news-policy.cjs');
const ownerPublication=require('./continuation-publication.cjs');
const DOMAIN='https://www.pcpartperformance.com';
const evidenceDate='2026-10-11';
const defaultEsc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readJSON=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const wordCount=a=>[a.title,a.summary,...a.sections.flatMap(s=>[s.title,...s.paragraphs,...(s.checklist||[]),...(s.table?[s.table.caption,...s.table.headers,...s.table.rows.flat()]:[])])].join(' ').trim().split(/\s+/).length;
const routeFile=(root,route)=>path.join(root,route.split(/[?#]/)[0].replace(/^\//,'').replace(/\/$/,''),'index.html');
const anchor=title=>title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function toolLinks(a,root){
  return a.tools.map(tool=>{
    const preferred=tool.href,available=!root||fs.existsSync(routeFile(root,preferred));
    const href=available?preferred:tool.fallback&&fs.existsSync(routeFile(root,tool.fallback))?tool.fallback:null;
    return href?{...tool,href}:null;
  }).filter(Boolean);
}
function citations(ids,esc){
  return ids.length?'<p class="oct11-citations">Sources: '+ids.map(id=>{
    const s=sources[id];if(!s)throw Error('Missing continuation source '+id);
    return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)} — ${esc(s.title)}</a>`;
  }).join(' · ')+'</p>':'';
}
function renderArticle(a,{esc=defaultEsc,root,review}={}){
  const state=review?.publishable?'Human review recorded · publication still pending':'Research draft · awaiting human editorial review';
  const byline=review?.publishable?`<p>${esc(review.byline.name)} · ${esc(review.byline.attribution)}</p>`:'<p>Prepared through PC Part Performance’s research workflow with AI assistance. No human author or reviewer is claimed.</p>';
  const tools=toolLinks(a,root);
  return `<article class="oct11-article" data-program-draft data-editorial-id="${esc(a.id)}">
<p class="oct11-kicker">${a.type==='news'?'News report draft':'Buying guide draft'}</p><h1>${esc(a.title)}</h1><p class="oct11-summary">${esc(a.summary)}</p>
<aside class="oct11-status" role="note"><strong>${state}</strong>${byline}<p>Sources inspected ${esc(a.evidenceDate)}. No publication date is assigned.${a.sourcePublishedAt?' Original source announcement: '+esc(a.sourcePublishedAt)+'.':''}</p></aside>
<figure class="oct11-hero"><img src="${esc(a.image.src)}" alt="${esc(a.image.alt)}" width="1200" height="675" fetchpriority="high" decoding="async"><figcaption>Original editorial schematic; not a product photograph, test result or physical fit model.</figcaption></figure>
<nav class="oct11-contents" aria-label="Article contents"><h2>In this article</h2><ul>${a.sections.map(s=>`<li><a href="#${anchor(s.title)}">${esc(s.title)}</a></li>`).join('')}</ul></nav>
${a.sections.map(s=>`<section id="${anchor(s.title)}"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}${s.table?`<div class="oct11-table-wrap" tabindex="0" role="region" aria-label="${esc(s.table.caption)}"><table><caption>${esc(s.table.caption)}</caption><thead><tr>${s.table.headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')}</tr></thead><tbody>${s.table.rows.map(row=>'<tr>'+row.map((cell,i)=>i?'<td>'+esc(cell)+'</td>':'<th scope="row">'+esc(cell)+'</th>').join('')+'</tr>').join('')}</tbody></table></div>`:''}${s.checklist?'<ul class="oct11-checklist">'+s.checklist.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>':''}${citations(s.sourceIds,esc)}${s.videoSourceId?renderVideo(s.videoSourceId,esc):''}</section>`).join('')}
${tools.length?`<section><h2>Use the tools with this evidence</h2><div class="oct11-actions">${tools.map(tool=>`<a class="button secondary" href="${esc(tool.href)}">${esc(tool.title)}</a>`).join('')}</div></section>`:''}
<details class="oct11-sources"><summary>Inspected sources and limits</summary><ul>${a.sourceIds.map(id=>{const s=sources[id];return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)} — ${esc(s.title)}</a><p>Inspected ${esc(s.checked)}. ${esc(s.scope)}</p><p>${esc(s.limitations)}</p></li>`}).join('')}</ul></details>
<footer><p><a href="/editorial-policy/">Editorial standards</a> · <a href="/editorial-policy/#corrections">Report a correction</a> · <a href="/about/">About this publication</a></p></footer></article>`;
}
function renderVideo(id,esc){
  const v=sources[id]?.video;if(!v)return'';
  return `<aside class="oct11-video"><h3>Original video context</h3><p><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.channel)} — ${esc(v.title)}</a></p><p>${esc(v.identityVerification)} ${esc(v.availabilityVerification)} This optional external link loads no player and carries no VideoObject markup.</p></aside>`;
}
function draftHead(html,a,esc){
  return html.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi,'').replace('</head>',`<meta name="robots" content="noindex,follow,max-image-preview:large"><meta property="og:type" content="website"><meta property="og:image" content="${DOMAIN}${esc(a.image.src)}"><meta property="og:image:alt" content="${esc(a.image.alt)}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/editorial-oct11.css"></head>`);
}
function validate(){
  const issues=[],ids=new Set(),routes=new Set();
  if(articles.length!==12||articles.filter(a=>a.type==='news').length!==4)issues.push('Expected eight guides and four news reports.');
  for(const a of articles){
    if(ids.has(a.id)||routes.has(a.route))issues.push(a.id+': duplicate identity or route');ids.add(a.id);routes.add(a.route);
    if(!/^\/(blog|news)\/[a-z0-9-]+\/$/.test(a.route))issues.push(a.id+': invalid route');
    if(wordCount(a)<(a.type==='news'?500:650)||a.sections.length<5)issues.push(a.id+': incomplete article');
    if(a.publishable||a.published||a.indexable||a.humanReview||a.datePublished||a.dateModified)issues.push(a.id+': draft claims publication or review');
    if(!a.sourceIds.length||a.sourceIds.some(id=>sources[id]?.access!=='inspected'||sources[id]?.checked!==evidenceDate))issues.push(a.id+': missing source inspection');
    if(a.sections.some(s=>s.sourceIds.some(id=>!a.sourceIds.includes(id))))issues.push(a.id+': citation not registered');
    if(a.type==='news'&&(!a.sourcePublishedAt||a.sourcePublishedAt>evidenceDate||!a.route.startsWith('/news/')))issues.push(a.id+': missing real announcement date');
    if(a.image.width<1200||a.image.width*a.image.height<300000)issues.push(a.id+': inadequate original asset');
  }
  for(const [id,s]of Object.entries(sources))if(!/^https:\/\//.test(s.url)||!s.scope||!s.limitations||!s.rights)issues.push(id+': incomplete evidence scope');
  return{valid:!issues.length,issues,articles:articles.length,guides:8,news:4,wordCount:articles.reduce((n,a)=>n+wordCount(a),0),sourceCount:Object.keys(sources).length};
}
function resolveReviews(decisions=readJSON(path.join(__dirname,'continuation-editorial-review-decisions.json')),asOf=new Date().toISOString()){
  return humanGate.resolveReviews(articles,decisions,{asOf,sources});
}
// A separate, explicit publication adapter must record actual release and deployment.
// Consistency checks do not establish a person's identity or verify a deployed page.
function publishedNews(publications,{decisions=readJSON(path.join(__dirname,'continuation-editorial-review-decisions.json')),authorization,now=Date.now()}={}){
  if(publications?.schemaVersion===2)return ownerPublication.resolve(publications,{authorization,now}).filter(a=>a.type==='news'&&a.confirmedDeployment);
  if(!publications||publications.schemaVersion!==1||!Array.isArray(publications.publications))throw Error('Publication registry schema 1 is required');
  const reviews=resolveReviews(decisions,new Date(now).toISOString()),seen=new Set();
  if(!reviews.registryValid||reviews.invalidDecisions.length)throw Error('Human decisions are invalid or stale');
  return publications.publications.map(p=>{
    const allowed=new Set(['articleId','status','contentHash','datePublished','dateModified','confirmedDeployment','deploymentEvidence']);
    if(!p||Object.keys(p).some(key=>!allowed.has(key)))throw Error('Unexpected publication-record field');
    if(seen.has(p.articleId))throw Error('Duplicate publication record');seen.add(p.articleId);
    const a=articles.find(row=>row.id===p.articleId),r=reviews.items.find(row=>row.articleId===p.articleId);
    const date=Date.parse(p.datePublished),modified=p.dateModified?Date.parse(p.dateModified):null;
    if(!a||a.type!=='news'||!r?.publishable||p.contentHash!==r.contentHash)throw Error('News publication lacks a current human decision');
    if(p.status!=='published'||p.confirmedDeployment!==true||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(p.datePublished||'')||!Number.isFinite(date)||new Date(date).toISOString().slice(0,19)!==p.datePublished.slice(0,19)||date>now||p.datePublished.slice(0,10)<r.review.reviewedAt)throw Error('Invalid actual first publication/deployment state');
    if(p.dateModified&&(!Number.isFinite(modified)||modified<date||modified>now))throw Error('Invalid material modification date');
    const expected=DOMAIN+a.route;
    if(p.deploymentEvidence?.url!==expected||p.deploymentEvidence?.access!=='inspected'||!Number.isFinite(Date.parse(p.deploymentEvidence?.checkedAt))||Date.parse(p.deploymentEvidence.checkedAt)<date||Date.parse(p.deploymentEvidence.checkedAt)>now)throw Error('Missing exact deployed-page inspection record');
    return{...a,route:a.route.slice(1,-1),status:'published',editorApproved:true,confirmedDeployment:true,datePublished:p.datePublished,dateModified:p.dateModified||null,byline:r.byline,contentHash:r.contentHash};
  });
}
function rss(rows,now=Date.now()){
  const x=newsPolicy.xml;
  const published=rows.filter(a=>a.type==='news'&&a.status==='published'&&a.editorApproved===true&&a.confirmedDeployment===true&&a.sourceIds?.length&&a.byline?.name&&/^news\/[a-z0-9-]+$/.test(a.route)&&Number.isFinite(Date.parse(a.datePublished))&&Date.parse(a.datePublished)<=now);
  return`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>PC Part Performance News</title><link>${DOMAIN}/news/</link><description>Source-led technology reports from PC Part Performance.</description><language>en</language>${published.map(a=>`<item><title>${x(a.title)}</title><link>${DOMAIN}/${x(a.route)}/</link><guid isPermaLink="true">${DOMAIN}/${x(a.route)}/</guid><description>${x(a.summary)}</description><pubDate>${x(new Date(a.datePublished).toUTCString())}</pubDate></item>`).join('')}</channel></rss>`;
}
function newsSchema(a){
  const base=newsPolicy.newsArticle(a);
  return{...base,description:a.summary,image:[DOMAIN+a.image.src],author:{'@type':a.byline.type==='person'?'Person':'Organization',name:a.byline.name,...(a.byline.type==='person'?{}:{url:DOMAIN+'/about/'})}};
}
function renderReleasedNews(a,{root,esc=defaultEsc}={}){
  return renderReleasedArticle(a,{root,esc});
}
function renderReleasedArticle(a,{root,esc=defaultEsc}={}){
  const url=DOMAIN+'/'+a.route+'/';
  const structured=a.type==='news'&&a.confirmedDeployment?newsSchema(a):{'@context':'https://schema.org','@type':'Article',headline:a.title,description:a.summary,url,datePublished:a.datePublished,...(a.dateModified?{dateModified:a.dateModified}:{}),image:[DOMAIN+a.image.src],author:{'@type':'Organization',name:a.byline.name,url:DOMAIN+'/about/'},publisher:{'@type':'Organization',name:'PC Part Performance',url:DOMAIN+'/about/'},citation:a.sourceIds.map(id=>sources[id].url)};
  const review={publishable:true,byline:a.byline};
  const draft=renderArticle(a,{root,esc,review});
  const date=value=>new Intl.DateTimeFormat('en-US',{timeZone:value.length===10?'UTC':'America/Toronto',year:'numeric',month:'long',day:'numeric'}).format(new Date(value));
  const attribution=`<div class="oct11-attribution"><p class="oct11-byline">By <a href="/about/">${esc(a.byline.name)}</a></p><p class="oct11-date">Published <time datetime="${esc(a.datePublished)}">${date(a.datePublished)}</time>${a.dateModified?' · Updated <time datetime="'+esc(a.dateModified)+'">'+date(a.dateModified)+'</time>':''}${a.sourcePublishedAt?' · Source announcement: '+date(a.sourcePublishedAt):''}</p><p class="oct11-assistance">${esc(a.byline.attribution)}</p></div>`;
  return draft.replace(' data-program-draft','').replace('News report draft','News report').replace('Buying guide draft','Buying guide').replace(/<aside class="oct11-status"[\s\S]*?<\/aside>/,attribution)+`<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script>`;
}
function newsLanding(rows,{preview=false,esc=defaultEsc}={}){
  const newsDrafts=articles.filter(a=>a.type==='news');
  const readableDate=value=>new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:value.includes('T')?'America/Toronto':'UTC'}).format(new Date(value));
  const cards=list=>'<div class="oct11-grid">'+list.map(a=>`<article><img src="${esc(a.image.src)}" alt="${esc(a.image.alt)}" width="1200" height="675" loading="lazy" decoding="async"><h2><a href="${esc(a.route.startsWith('/')?a.route:'/'+a.route+'/')}">${esc(a.title)}</a></h2><p>${esc(a.summary)}</p><p>${a.datePublished?'Published <time datetime="'+esc(a.datePublished)+'">'+esc(readableDate(a.datePublished))+'</time>':'Review draft · source announcement '+esc(a.sourcePublishedAt)}</p></article>`).join('')+'</div>';
  return`<section class="oct11-news"><p class="oct11-kicker">PC Part Performance</p><h1>Technology newsroom</h1><p>Hardware and software reporting with original sources, announcement dates and buyer implications visible.</p>${rows.length?cards(rows):'<p>No news reports are available in this release.</p>'}${preview?'<aside class="oct11-status"><strong>Private review preview</strong><p>The four reports below are complete research drafts. Their announcement dates are source dates; no first publication date or human approval is claimed.</p></aside>'+cards(newsDrafts):''}<h2>Reporting standards</h2><p>We distinguish company announcements, original independent testing and our analysis. A monitored source update enters an editorial queue; software does not approve or publish it. A material correction receives a clear revision record. Headlines and dates must describe the actual report.</p><p><a href="/news/feed.xml">News RSS</a> · <a href="/editorial-policy/">Editorial standards and corrections</a> · <a href="/about/">About this publication</a></p><h2>Background reading</h2><ul><li><a href="/blog/memory-market-watch-ai-is-not-a-retail-price/">Interpreting memory-market claims</a></li><li><a href="/blog/local-ai-memory-weights-kv-cache/">Local-AI memory requirements</a></li><li><a href="/blog/phone-software-support-commitment-vs-end-date/">Phone support commitments and dates</a></li></ul>${preview?'<p><a href="/editorial-review/oct11/">Read the complete 12-item review batch</a></p>':''}</section>`;
}
function reviewLanding(reviews,esc){
  return `<section class="oct11-news" data-program-draft><h1>October 11 editorial review batch</h1><p>Eight complete buying guides and four dated news-report drafts. Read the full articles and their inspected source limits before entering a decision. Software validation is not human editorial approval.</p><p>Prepared with AI research and writing assistance. The owner must decide truthful bylines and review status. No fabricated person, credentials, benchmark or publication date is supplied.</p><div class="oct11-grid">${articles.map(a=>{const r=reviews.items.find(row=>row.articleId===a.id);return `<article><h2><a href="${esc(a.route)}">${esc(a.id+' — '+a.title)}</a></h2><p>${esc(a.summary)}</p><p>${wordCount(a)} words · ${a.sourceIds.length} inspected sources · ${esc(r.reviewStatus)}</p><details><summary>Version and content hash</summary><p>${esc(r.contentVersion)}</p><code>${esc(r.contentHash)}</code></details></article>`}).join('')}</div></section>`;
}
function copyAssets(root){
  const from=path.join(__dirname,'../data/editorial-oct11/assets'),to=path.join(root,'assets/editorial-oct11');
  fs.mkdirSync(to,{recursive:true});
  for(const a of articles)for(const ext of ['png','svg'])fs.copyFileSync(path.join(from,a.slug+'.'+ext),path.join(to,a.slug+'.'+ext));
  fs.copyFileSync(path.join(__dirname,'continuation-editorial.css'),path.join(root,'editorial-oct11.css'));
}
function generate({root,records,images,shell,write,esc=defaultEsc,publicationRegistry,ownerAuthorization}){
  const checked=validate();if(!checked.valid)throw Error(checked.issues.join('\n'));
  const preview=process.env.PROGRAM_PREVIEW==='1',asOf=new Date().toISOString(),reviews=resolveReviews(undefined,asOf);
  if(!reviews.registryValid||reviews.invalidDecisions.length)throw Error('Continuation editorial review decisions are invalid or stale');
  const releaseRegistry=publicationRegistry||readJSON(path.join(__dirname,'continuation-editorial-publications.json'));
  const released=releaseRegistry.schemaVersion===2?ownerPublication.resolve(releaseRegistry,{authorization:ownerAuthorization,now:Date.parse(asOf)}):publishedNews(releaseRegistry,{now:Date.parse(asOf)});
  const news=released.filter(a=>a.type==='news'&&a.confirmedDeployment);
  copyAssets(root);
  const metadata={};
  if(preview){
    for(const a of articles){
      const review=reviews.items.find(row=>row.articleId===a.id);
      write(a.route.slice(1,-1),draftHead(shell(a.title,'guide',renderArticle(a,{esc,root,review}),{description:a.summary}),a,esc));
      metadata[a.route]={title:a.title,description:a.summary,image:a.image,noindex:true,datePrepared:a.evidenceDate,datePublished:null,dateModified:null,editorialId:a.id};
    }
    const reviewRoute='/editorial-review/oct11/';
    const reviewHTML=shell('October 11 editorial review batch','guide',reviewLanding(reviews,esc),{description:'Read eight buying guides and four source-led news drafts before human editorial review.'});
    write(reviewRoute.slice(1,-1),draftHead(reviewHTML,{image:articles[0].image},esc));
    metadata[reviewRoute]={noindex:true,title:'October 11 editorial review batch',datePublished:null};
  }else{
    // Remove only this batch's identified stale draft output; never delete a normal article.
    for(const a of articles){const file=routeFile(root,a.route);if(fs.existsSync(file)&&/data-(?:program|news)-draft/.test(fs.readFileSync(file,'utf8')))fs.unlinkSync(file);}
    const reviewFile=routeFile(root,'/editorial-review/oct11/');
    if(fs.existsSync(reviewFile)&&/data-program-draft/.test(fs.readFileSync(reviewFile,'utf8')))fs.unlinkSync(reviewFile);
    const draftFile=path.join(root,'program-draft-routes.json');
    if(fs.existsSync(draftFile)){const prior=readJSON(draftFile),own=new Set([...articles.map(a=>a.route),'/editorial-review/oct11/']);if(!Array.isArray(prior))throw Error('Expected an array of program draft routes');fs.writeFileSync(draftFile,JSON.stringify(prior.filter(route=>!own.has(route))));}
    const searchFile=path.join(root,'data/search-index.json');
    if(fs.existsSync(searchFile)){const prior=readJSON(searchFile),own=new Set(articles.map(a=>'oct11_'+a.id));fs.writeFileSync(searchFile,JSON.stringify(prior.filter(row=>!own.has(row.id))));}
  }
  // The owner authorized these exact versions. Deployment evidence is recorded separately.
  for(const a of preview?[]:released){
    const html=shell(a.title,'guide',renderReleasedArticle(a,{root,esc}),{description:a.summary}).replace('</head>',`<meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="article"><link rel="stylesheet" href="/editorial-oct11.css"></head>`);
    write(a.route,html);
    metadata['/'+a.route+'/']={title:a.title,description:a.summary,image:a.image,noindex:false,datePublished:a.datePublished,dateModified:a.dateModified,editorialId:a.id,publicationAuthorized:!!a.publicationAuthorized,confirmedDeployment:a.confirmedDeployment};
  }
  fs.mkdirSync(path.join(root,'news'),{recursive:true});
  fs.writeFileSync(path.join(root,'news/feed.xml'),rss(news,Date.parse(asOf)));
  fs.writeFileSync(path.join(root,'news-sitemap.xml'),newsPolicy.newsSitemap(news,Date.parse(asOf)));
  const hub=shell('Technology newsroom: source-led hardware reporting','guide',newsLanding(preview?[]:released.filter(a=>a.type==='news'),{preview,esc}),{description:'Source-led hardware and software news with original announcements, dates and practical buyer implications.'}).replace('</head>','<link rel="alternate" type="application/rss+xml" title="PC Part Performance News" href="/news/feed.xml"><link rel="stylesheet" href="/editorial-oct11.css"></head>');
  write('news',preview?hub.replace('</head>','<meta name="robots" content="noindex,follow"></head>'):hub);
  metadata['/news/']={title:'Technology newsroom: source-led hardware reporting',description:'Source-led hardware and software news with original announcements, dates and practical buyer implications.',noindex:preview,datePublished:null};
  const draftRoutes=preview?[...articles.map(a=>a.route),'/editorial-review/oct11/']:[];
  fs.writeFileSync(path.join(root,'continuation-editorial-metadata.json'),JSON.stringify(metadata,null,2));
  const report={...checked,preview,asOf,publishable:reviews.publishable.length,releaseAuthorized:released.length,published:released.filter(a=>a.confirmedDeployment).length,humanDecisions:readJSON(path.join(__dirname,'continuation-editorial-review-decisions.json')).decisions.length,draftRoutes,withheldRoutes:articles.filter(a=>!released.some(n=>'/'+n.route+'/'===a.route)).map(a=>a.route),metadata};
  if(!preview&&released.length){
    const blogFile=routeFile(root,'/blog/');
    let blog=fs.readFileSync(blogFile,'utf8');
    const cards=rows=>rows.map(a=>`<article><img src="${esc(a.image.src)}" alt="${esc(a.image.alt)}" width="1200" height="675" loading="lazy" decoding="async"><h3><a href="/${esc(a.route)}/">${esc(a.title)}</a></h3><p>${esc(a.summary)}</p></article>`).join('');
    const section=`<!--oct11-library-start--><section class="oct11-library" aria-labelledby="oct11-guides-title"><h2 id="oct11-guides-title">New buying guides</h2><div class="oct11-grid">${cards(released.filter(a=>a.type==='guide'))}</div><h2>Hardware and software reports</h2><div class="oct11-grid">${cards(released.filter(a=>a.type==='news'))}</div><p><a href="/news/">Explore the newsroom</a></p></section><!--oct11-library-end-->`;
    blog=blog.replace(/<!--oct11-library-start-->[\s\S]*?<!--oct11-library-end-->/,'').replace(/(<header class="learn-intro">[\s\S]*?<\/header>)/,'$1'+section).replace('</head>','<link rel="stylesheet" href="/editorial-oct11.css"></head>');
    fs.writeFileSync(blogFile,blog);
    const searchFile=path.join(root,'data/search-index.json');
    if(fs.existsSync(searchFile)){const rows=readJSON(searchFile);fs.writeFileSync(searchFile,JSON.stringify([...rows,...released.map(a=>({id:'oct11_'+a.id,title:a.title,url:'/'+a.route+'/',kind:a.type==='news'?'News report':'Buying guide',aliases:[]}))]));}
  }
  if(preview){
    const file=path.join(root,'program-draft-routes.json');
    const prior=fs.existsSync(file)?readJSON(file):[];
    if(!Array.isArray(prior))throw Error('Expected an array of program draft routes');
    fs.writeFileSync(file,JSON.stringify([...new Set([...prior,...draftRoutes])]));
    const index=path.join(root,'data/search-index.json');
    if(fs.existsSync(index)){const rows=readJSON(index),ids=new Set(articles.map(a=>'oct11_'+a.id));fs.writeFileSync(index,JSON.stringify([...rows.filter(row=>!ids.has(row.id)),...articles.map(a=>({id:'oct11_'+a.id,title:a.title,url:a.route,kind:'Research draft · review pending',aliases:[]}))]));}
  }
  return report;
}
function markdownArticle(a,publication){
  const fp=humanGate.contentFingerprint(a,sources);
  const state=publication?(publication.confirmedDeployment?'**Published by owner authorization.** First observed live '+publication.datePublished+'.':'**Owner-authorized release; deployment not yet confirmed.**'):'**Research draft; needs human editorial review.** No publication date.';
  const lines=[`<a id="${a.id.toLowerCase()}"></a>`,'',`## ${a.id} — ${a.title}`,'',`${state} ${wordCount(a)} words. Sources inspected ${a.evidenceDate}.`, '',`Route: ${a.route}`,'',`Version: ${fp.contentVersion}`,'',`SHA-256: ${fp.contentHash}`,'',a.summary,''];
  if(a.sourcePublishedAt)lines.push('Original source announcement: '+a.sourcePublishedAt+' (not the site publication date).','');
  for(const s of a.sections){lines.push('### '+s.title,'',...s.paragraphs.flatMap(p=>[p,'']));if(s.table)lines.push('*'+s.table.caption+'*','', '| '+s.table.headers.join(' | ')+' |','| '+s.table.headers.map(()=>'---').join(' | ')+' |',...s.table.rows.map(row=>'| '+row.join(' | ')+' |'),'');if(s.checklist)lines.push(...s.checklist.map(p=>'- '+p),'');if(s.sourceIds.length)lines.push('Sources: '+s.sourceIds.map(id=>'['+sources[id].publisher+' — '+sources[id].title+']('+sources[id].url+')').join('; '), '');if(s.videoSourceId){const v=sources[s.videoSourceId].video;lines.push('Optional original video: ['+v.channel+' — '+v.title+']('+v.url+'). '+v.identityVerification+' '+v.availabilityVerification,'');}}
  lines.push('### Source scope and limitations','',...a.sourceIds.flatMap(id=>{const s=sources[id];return['- ['+s.publisher+' — '+s.title+']('+s.url+'), inspected '+s.checked+'. '+s.scope+' '+s.limitations,''];}));
  return lines.join('\n');
}
function writeDocumentation(target=path.join(__dirname,'../docs/program-2026-10-11/editorial'),options={}){
  fs.mkdirSync(target,{recursive:true});
  const registry=options.publicationRegistry||ownerPublication.read('continuation-editorial-publications.json');
  const released=registry.schemaVersion===2?ownerPublication.resolve(registry,{authorization:options.ownerAuthorization||ownerPublication.read('continuation-editorial-owner-authorization.json')}):[];
  const byId=new Map(released.map(a=>[a.id,a]));
  const report=validate(),reviews=resolveReviews(undefined,evidenceDate),manifest=articles.map(a=>{const p=byId.get(a.id);return{id:a.id,title:a.title,route:a.route,type:a.type,words:wordCount(a),sourcePublishedAt:a.sourcePublishedAt||null,sourceIds:a.sourceIds,image:a.image,...humanGate.checklist(a,sources),reviewStatus:reviews.items.find(r=>r.articleId===a.id).reviewStatus,publicationStatus:p?.status||'draft',ownerAuthorized:!!p,humanReviewClaimed:false,author:p?.byline.name||null,datePublished:p?.confirmedDeployment?p.datePublished:null,published:!!p?.confirmedDeployment};});
  const intro=['# October 11 editorial review packet','',`Complete batch: ${report.guides} buying guides and ${report.news} news-report drafts; ${report.wordCount.toLocaleString('en-US')} article words; ${report.sourceCount} inspected source records.`, '', '**Zero human approvals and zero publications are recorded.** Evidence checking is not human editorial approval. Read the entire article and applicable sources before entering a truthful decision.','', 'Prepared through the site research workflow with AI research and writing assistance. No staff identity, expert credentials, hands-on testing or review approval is invented. Each fingerprint includes the current article and applicable source records; edits invalidate the matching decision.','', 'The existing program-editorial-review.cjs gate requires a named actual human reviewer, full-content/source attestation, a truthful byline, a real nonfuture review date and the exact current version/hash. It checks consistency; it cannot prove who read the articles. The empty continuation-editorial-review-decisions.json is owner-entered only.','', 'Human-review attestation: '+humanGate.HUMAN_ATTESTATION,'','Byline attestation: '+humanGate.BYLINE_ATTESTATION,'', 'After actual approval, a separate release step must record first publication and confirmed deployment. Source dates, inspection dates and review dates never substitute for that timestamp. The continuation generator stages drafts and does not publish an approved article by itself.','', '## Batch index','', '| ID | Full article | Type | Words | Sources | State |','| --- | --- | --- | ---: | ---: | --- |', ...manifest.map(a=>'| '+a.id+' | ['+a.title+'](#'+a.id.toLowerCase()+') | '+a.type+' | '+a.words+' | '+a.sourceIds.length+' | needs human review |'),''];
  if(released.length){
    intro[2]=intro[2].replace('news-report drafts','news reports');
    intro.splice(4,intro.indexOf('## Batch index')-4,
      `**${released.length} exact article versions are authorized by the owner's direct publication instruction; ${released.filter(a=>a.confirmedDeployment).length} have verified live publication records.**`,'',
      'The owner requested: “okay publish all 12 articles and use PC Part Performance as the author”. This supersedes the pending personal-review prerequisite for these twelve versions only. No personal reading attestation, named reviewer, staff credentials or hands-on testing is claimed. The personal-review registry remains empty.','',
      'The public author is PC Part Performance. Research and writing prepared with AI assistance. Article and source fingerprints pin the authorized versions; edits invalidate the matching authorization.','',
      'Publication timestamps come from actual exact-page inspections on the production domain. Source and preparation dates are separate. Release authorization alone never confirms deployment.','');
    for(let i=0;i<intro.length;i++)if(intro[i].includes('| needs human review |')){const id=intro[i].split('|')[1].trim(),p=byId.get(id);if(p)intro[i]=intro[i].replace('needs human review',p.confirmedDeployment?'published · owner authorized':'owner authorized · release pending');}
  }
  fs.writeFileSync(path.join(target,'REVIEW-PACKET.md'),intro.join('\n')+'\n'+articles.map(a=>markdownArticle(a,byId.get(a.id))).join('\n\n---\n\n')+'\n');
  fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify({preparedAt:evidenceDate,statusCheckedAt:new Date().toISOString(),...report,humanApprovals:0,ownerAuthorized:released.length,published:released.filter(a=>a.confirmedDeployment).length,items:manifest},null,2)+'\n');
  fs.writeFileSync(path.join(target,'source-evidence.json'),JSON.stringify(sources,null,2)+'\n');
  fs.writeFileSync(path.join(target,'review-checklist.json'),JSON.stringify({schemaVersion:1,asOf:evidenceDate,items:articles.map(a=>humanGate.checklist(a,sources))},null,2)+'\n');
  return report;
}
Object.assign(generate,{articles,sources,evidenceDate,wordCount,renderArticle,renderReleasedArticle,validate,resolveReviews,publishedNews,rss,newsSchema,newsLanding,writeDocumentation,markdownArticle,toolLinks});
module.exports=generate;
if(require.main===module){try{const command=process.argv[2]||'check';const report=command==='prepare'?writeDocumentation():command==='review'?resolveReviews(undefined,new Date().toISOString()):validate();console.log(JSON.stringify(report,null,2));if(report.valid===false||report.registryValid===false||report.invalidDecisions?.length)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}}
