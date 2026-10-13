'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const growth=require('./growth-editorial-content.cjs');
const products=require('./program-products.cjs');
const {validateAuthorization,articleRoute}=require('./master-release-policy.cjs');
const DOMAIN='https://www.pcpartperformance.com';
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const anchor=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function candidates(){
 const extra=fs.existsSync(path.join(__dirname,'master-editorial-content.cjs'))?require('./master-editorial-content.cjs'):{articles:[],sources:{}};
 const revised=new Set((extra.articles||[]).map(a=>a.canonicalRoute));
 return {articles:[...growth.articles.filter(a=>!revised.has(a.canonicalRoute)),...(extra.articles||[])],sources:{...growth.sources,...extra.sources}};
}
function fingerprint(a,sources){return digest({article:a,sources:Object.fromEntries(a.sourceIds.map(id=>[id,sources[id]]))})}
function resolve(auth,now=Date.now()){
 validateAuthorization(auth,now);
 const {articles,sources}=candidates();
 if(auth?.schema!==1||auth.origin!=='direct_owner_instruction'||auth.humanReviewClaimed!==false||auth.author!=='PC Part Performance'||!auth.statement||!Number.isFinite(Date.parse(auth.recordedAt))||Date.parse(auth.recordedAt)>now)throw Error('Truthful owner release authorization required');
 const checked=new Set(),approved=[];
 for(const row of auth.articles){
  const a=articles.find(a=>a.id===row.id);
  if(!a||checked.has(row.id)||row.hash!==fingerprint(a,sources))throw Error('Unknown, changed or duplicate authorized article '+row.id);
  articleRoute(a.canonicalRoute);
  if(!a.sections.length||a.sourceIds.some(id=>!sources[id]||!/^https:\/\//.test(sources[id].url)))throw Error('Invalid article route/evidence');
  checked.add(row.id);approved.push(a);
 }
 const productApprovals=new Map(auth.products.map(p=>[p.id,p.hash]));
 for(const p of products.profiles)if(productApprovals.get(p.id)!==digest({profile:p,sources:Object.fromEntries(p.sourceIds.map(id=>[id,products.sources[id]]))}))throw Error('Product context version not authorized '+p.id);
 return{articles:approved,sources};
}
function render(a,sources,esc,date,dateModified=null){
 const readable=value=>new Intl.DateTimeFormat('en-US',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'}).format(new Date(value));
 const citations=ids=>'<p class="master-citations">'+ids.map(id=>'<a href="'+esc(sources[id].url)+'">'+esc(sources[id].publisher+' — '+sources[id].title)+'</a>').join(' · ')+'</p>';
 return `<article class="master-article" data-master-article="${esc(a.id)}"><a href="/blog/">Hardware guides</a><h1>${esc(a.title)}</h1><p class="master-answer">${esc(a.summary)}</p><p class="master-byline">By <a href="/about/">PC Part Performance</a> · Published <time datetime="${date}">${readable(date)}</time>${dateModified?' · Updated <time datetime="'+dateModified+'">'+readable(dateModified)+'</time>':''}</p><p class="master-assistance">Research and writing prepared with AI assistance. Research-based guidance; no site-owned hardware testing is claimed.</p><nav class="master-contents" aria-label="Article contents"><h2>In this guide</h2><ul>${a.sections.map(s=>'<li><a href="#'+anchor(s.title)+'">'+esc(s.title)+'</a></li>').join('')}</ul></nav>${a.sections.map(s=>`<section id="${anchor(s.title)}"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')}${s.checklist?'<ul>'+s.checklist.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':''}${s.table?'<div class="master-table" tabindex="0" role="region" aria-label="'+esc(s.table.caption)+'"><table><caption>'+esc(s.table.caption)+'</caption><thead><tr>'+s.table.headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+s.table.rows.map(row=>'<tr>'+row.map((v,i)=>'<'+(i?'td':'th scope="row"')+'>'+esc(v)+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</tbody></table></div>':''}${citations(s.sourceIds||[])}</section>`).join('')}<section><h2>Apply this to your PC</h2><div class="master-actions">${a.tools.map(t=>'<a class="button secondary" href="'+esc(t.href)+'">'+esc(t.label)+'</a>').join('')}</div></section><section><h2>Sources and scope</h2><ul>${a.sourceIds.map(id=>{const s=sources[id];return'<li><a href="'+esc(s.url)+'">'+esc(s.publisher+' — '+s.title)+'</a><p>'+esc(s.scope||'')+' '+esc(s.limitations||'')+' Source inspected '+esc(s.inspected||s.checkedAt||s.checked||a.evidenceDate)+'.</p></li>'}).join('')}</ul></section></article>`;
}
function generate({root,records,shell,write,esc}){
 if(process.env.PROGRAM_PREVIEW==='1'){fs.writeFileSync(path.join(root,'master-publication-metadata.json'),'{}');return{articles:0,productContexts:0,preview:true};}
 const auth=JSON.parse(fs.readFileSync(path.join(__dirname,'master-release-authorization.json'),'utf8'));
 const {articles,sources}=resolve(auth),date=auth.releaseDate;
 fs.copyFileSync(path.join(__dirname,'master-publication.css'),path.join(root,'master-publication.css'));
 fs.writeFileSync(path.join(root,'program-products.css'),products.css);
 const metadata={},history=JSON.parse(fs.readFileSync(path.join(__dirname,'master-publication-history.json'),'utf8'));
 for(const a of articles){
  const prior=history.find(p=>p.route===a.canonicalRoute),published=prior?.datePublished||date,modified=prior?date:null;
  const asset='/assets/editorial-master/'+a.id+'.png',alt='Decision diagram for '+a.title;
  fs.mkdirSync(path.join(root,'assets/editorial-master'),{recursive:true});
  fs.copyFileSync(path.join(__dirname,'../data/editorial-master/assets',a.id+'.png'),path.join(root,asset.slice(1)));
  const schema={'@context':'https://schema.org','@type':'Article',headline:a.title,description:a.summary,url:DOMAIN+a.canonicalRoute,datePublished:published,...(modified?{dateModified:modified}:{}),author:{'@type':'Organization',name:auth.author,url:DOMAIN+'/about/'},publisher:{'@type':'Organization',name:auth.author,url:DOMAIN+'/about/'},citation:a.sourceIds.map(id=>sources[id].url)};
  schema.image=[DOMAIN+asset];
  const body=render(a,sources,esc,published,modified).replace('<nav class="master-contents"','<figure class="master-diagram"><img src="'+asset+'" alt="'+esc(alt)+'" width="1200" height="675" decoding="async"><figcaption>Original decision diagram. The sources below explain the conditions.</figcaption></figure><nav class="master-contents"');
  write(a.canonicalRoute.slice(1,-1),shell(a.title,'guide',body,{description:a.description||a.summary}).replace('</head>','<link rel="stylesheet" href="/master-publication.css"><script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script></head>'));
  metadata[a.canonicalRoute]={title:a.title,description:a.description||a.summary,noindex:false,publicationAuthorized:true,editorialId:a.id,datePublished:published,dateModified:modified,image:{src:asset,alt,width:1200,height:675}};
 }
 const blog=path.join(root,'blog/index.html'),cards='<section class="master-library"><h2>Build, upgrade and troubleshoot</h2><p>Practical guides connected to the parts and planning tools.</p><div class="master-guide-grid">'+articles.map(a=>'<article><h3><a href="'+esc(a.canonicalRoute)+'">'+esc(a.title)+'</a></h3><p>'+esc(a.summary)+'</p></article>').join('')+'</div></section>';
 fs.writeFileSync(blog,fs.readFileSync(blog,'utf8').replace(/(<header class="learn-intro">[\s\S]*?<\/header>)/,'$1'+cards).replace('</head>','<link rel="stylesheet" href="/master-publication.css"></head>'));
 const idx=path.join(root,'data/search-index.json'),routes=new Set(articles.map(a=>a.canonicalRoute));
 const rows=JSON.parse(fs.readFileSync(idx,'utf8')).filter(r=>!routes.has(r.url));
 fs.writeFileSync(idx,JSON.stringify([...rows,...articles.map(a=>({id:'master_'+a.id,title:a.title,url:a.canonicalRoute,kind:'Hardware guide',aliases:[]}))]));
 const draftFile=path.join(root,'program-draft-routes.json');
 if(fs.existsSync(draftFile))fs.writeFileSync(draftFile,JSON.stringify(JSON.parse(fs.readFileSync(draftFile,'utf8')).filter(r=>!routes.has(r))));
 let panels=0;
 for(const p of products.profiles){
  const record=records.find(r=>r.id===p.id),file=path.join(root,'learn',p.id+'.html');
  if(!record||!fs.existsSync(file))throw Error('Exact context product missing '+p.id);
  const panel=products.renderPanel(p,record,records,esc).replace('Status: evidence checked; human editorial review required before publishing this new panel. No human reviewer or publication date is recorded.','Research and writing prepared with AI assistance. Released under the owner’s publication instruction; no personal review or hardware testing is claimed.');
  let h=fs.readFileSync(file,'utf8').replace(/<!-- program-product:start -->[\s\S]*?<!-- program-product:end -->/g,'');
  h=h.replace('</head>','<link rel="stylesheet" href="/program-products.css"></head>').replace('<div class="record-detail">',panel+'<div class="record-detail">');
  fs.writeFileSync(file,h);panels++;
  metadata['/learn/'+p.id+'.html']={noindex:false,publicationAuthorized:true,productContext:true};
 }
 const productEvidence=path.join(root,'data/product-evidence.json');
 const evidence=JSON.parse(fs.readFileSync(productEvidence,'utf8'));
 evidence.status='owner_authorized_release';evidence.humanReviewed=false;evidence.ownerAuthorized=true;evidence.releaseDate=date;
 fs.writeFileSync(productEvidence,JSON.stringify(evidence,null,2));
 const compareFile=path.join(root,'compare/index.html'),comparison=articles.find(a=>a.canonicalRoute.startsWith('/compare/'));
 if(comparison){let h=fs.readFileSync(compareFile,'utf8');h=h.replace('</main>','<section class="master-library"><h2>RX 9070 or RX 9070 XT?</h2><p>Compare the documented features, power requirements and exact-model checks.</p><a class="button secondary" href="'+comparison.canonicalRoute+'">Read the RX 9070 comparison</a></section></main>').replace('</head>','<link rel="stylesheet" href="/master-publication.css"></head>');fs.writeFileSync(compareFile,h);}
 fs.writeFileSync(path.join(root,'master-publication-metadata.json'),JSON.stringify(metadata,null,2));
 fs.writeFileSync(path.join(root,'data/master-release.json'),JSON.stringify({releaseDate:date,ownerAuthorized:true,humanReviewClaimed:false,author:auth.author,articles:articles.map(a=>({id:a.id,title:a.title,route:a.canonicalRoute})),productContexts:panels}));
 return{articles:articles.length,productContexts:panels};
}
Object.assign(generate,{candidates,fingerprint,resolve,digest,render});module.exports=generate;
