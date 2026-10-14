'use strict';
const fs=require('node:fs'),path=require('node:path'),content=require('./oct14-editorial-content.cjs'),master=require('./master-publication.cjs');
const date='2026-10-14',domain='https://www.pcpartperformance.com';
module.exports=({root,shell,write,esc})=>{
 const checked=content.validate();if(!checked.valid)throw Error(checked.errors.join('; '));
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'master-publication-metadata.json'),'utf8'));
 const preview=process.env.PROGRAM_PREVIEW==='1';
 for(const a of content.articles){
  const route=a.canonicalRoute||a.route;
  let body=master.render(a,content.sources,esc,date).replace(/<p class="master-assistance">[\s\S]*?<\/p>/,'');
  if(preview)body=body.replace('<article ','<article data-program-draft ');
  const schema={'@context':'https://schema.org','@type':'Article',headline:a.title,description:a.summary,url:domain+route,datePublished:date,author:{'@type':'Organization',name:'PC Part Performance',url:domain+'/about/'},publisher:{'@type':'Organization',name:'PC Part Performance',url:domain+'/about/'},citation:a.sourceIds.map(id=>content.sources[id].url)};
  write(route.slice(1,-1),shell(a.title,'guide',body,{description:a.summary}).replace('</head>','<link rel="stylesheet" href="/master-publication.css">'+(preview?'':'<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>')+'</head>'));
  metadata[route]={title:a.title,description:a.summary,noindex:preview,publicationAuthorized:!preview,editorialId:a.id,datePublished:preview?null:date};
 }
 const cards='<section class="master-library"><h2>Gaming laptops and game requirements</h2><div class="master-guide-grid">'+content.articles.map(a=>'<article><h3><a href="'+esc(a.route)+'">'+esc(a.title)+'</a></h3><p>'+esc(a.summary.split('. ')[0]+'.')+'</p></article>').join('')+'</div></section>';
 const blog=path.join(root,'blog/index.html');fs.writeFileSync(blog,fs.readFileSync(blog,'utf8').replace('</main>',cards+'</main>'));
 const idx=path.join(root,'data/search-index.json'),rows=JSON.parse(fs.readFileSync(idx,'utf8')),routes=new Set(content.articles.map(a=>a.route));
 fs.writeFileSync(idx,JSON.stringify([...rows.filter(r=>!routes.has(r.url)),...content.articles.map(a=>({id:'oct14_'+a.id,title:a.title,url:a.route,kind:'Hardware guide',aliases:a.keywords||[]}))]));
 fs.writeFileSync(path.join(root,'master-publication-metadata.json'),JSON.stringify(metadata,null,2));
 fs.writeFileSync(path.join(root,'data/clarity-editorial-release.json'),JSON.stringify({schema:1,releaseDate:date,ownerAuthorized:true,origin:'direct_owner_instruction',statement:'Implement the requested new source-checked content and publish through the existing deployment.',author:'PC Part Performance',humanReviewClaimed:false,preview,articles:content.articles.map(a=>({id:a.id,route:a.route,hash:content.fingerprint(a)}))},null,2));
 const directory=require('./guide-directory.cjs')({root,shell,write,esc});
 return {articles:content.articles.length,preview,directory};
};
