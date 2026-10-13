'use strict';
// Bounded public release checks. This command never changes publication decisions.
const fs=require('node:fs'),assert=require('node:assert/strict');
const expected=process.argv[2],phase=process.argv[3]||'final';
if(!/^[a-f0-9]{40}$/.test(expected||'')||!['initial','final'].includes(phase))throw Error('Pass a 40-character expected commit and initial or final.');
const publication=require('./continuation-publication.cjs'),rows=publication.resolve(),origin='https://www.pcpartperformance.com';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function read(route,method='GET'){const r=await fetch(origin+route,{method,redirect:'manual',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)});return{route,status:r.status,robots:r.headers.get('x-robots-tag'),body:method==='HEAD'?'':await r.text()};}
async function main(){
 const marker=await read('/data/release.json');let release;try{release=JSON.parse(marker.body)}catch{}
 if(marker.status!==200||release?.commit!==expected){console.log(JSON.stringify({state:'waiting_for_expected_deployment',expected,observedCommit:release?.commit||null}));process.exitCode=2;return;}
 assert.equal(release.staging,false);
 const report={checkedAt:new Date().toISOString(),expectedCommit:expected,phase,release,scope:'Actual public HTTP/HTML/structured-data/discovery checks. Browser layout is verified separately.',articles:[],checks:[]};
 for(const a of rows){
  const route='/'+a.route+'/',r=await read(route);assert.equal(r.status,200,route);assert(!r.robots?.includes('noindex'),route);assert(!/<meta name="robots" content="[^\"]*noindex/.test(r.body),route);
  assert.equal((r.body.match(/<h1\b/g)||[]).length,1,route+' main heading');assert(r.body.includes('rel="canonical" href="'+origin+route+'"'),route+' canonical');assert(!r.body.includes('data-program-draft'),route+' draft leakage');
  assert(r.body.includes('By <a href="/about/">PC Part Performance</a>'),route+' visible author');assert(r.body.includes('Research and writing prepared with AI assistance.'),route+' assistance disclosure');
  assert(r.body.includes(esc(a.sections.at(-1).paragraphs.at(-1))),route+' complete final section');assert(r.body.includes('property="og:image" content="'+origin+a.image.src+'"'),route+' representative image');
  const data=[...r.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])),article=data.find(s=>['Article','NewsArticle'].includes(s['@type']));
  assert(article,route+' article schema');assert.equal(article.author.name,'PC Part Performance',route+' author');assert.equal(article.author['@type'],'Organization',route+' author type');assert.equal(article.datePublished,a.datePublished,route+' publication timestamp');assert.equal(article['@type'],a.type==='news'&&a.confirmedDeployment?'NewsArticle':'Article',route+' schema type');
  for(const id of a.sourceIds)assert(r.body.includes(esc(require('./continuation-editorial-content.cjs').sources[id].url)),route+' source '+id);
  const inspectedAt=new Date().toISOString();report.articles.push({articleId:a.id,url:origin+route,contentHash:a.contentHash,status:r.status,access:'inspected',checkedAt:inspectedAt,commit:expected,author:article.author.name,schema:article['@type'],datePublished:article.datePublished});
  const image=await read(a.image.src,'HEAD');assert.equal(image.status,200,a.id+' image');report.checks.push({name:'representative article image',route:image.route,status:image.status});
 }
 const sitemap=await read('/sitemap.xml'),blog=await read('/blog/'),news=await read('/news/'),search=await read('/data/search-index.json'),blogFeed=await read('/blog/feed.xml'),newsFeed=await read('/news/feed.xml'),newsMap=await read('/news-sitemap.xml');
 for(const r of [sitemap,blog,news,search,blogFeed,newsFeed,newsMap])assert.equal(r.status,200,r.route);
 const index=JSON.parse(search.body);
  for(const a of rows){const route='/'+a.route+'/';assert(sitemap.body.includes(origin+route),a.id+' sitemap');assert(blog.body.includes('href="'+route+'"'),a.id+' Blog discovery');assert(index.some(row=>row.url===route),a.id+' site search');if(a.type==='guide')assert(blogFeed.body.includes(origin+route),a.id+' Blog RSS');else{assert(news.body.includes('href="'+route+'"'),a.id+' Newsroom discovery');assert.equal(newsFeed.body.includes(origin+route),a.confirmedDeployment,a.id+' news RSS publication state');assert.equal(newsMap.body.includes(origin+route),require('./news-policy.cjs').eligible(a),a.id+' news sitemap publication age/state');}}
 assert(!sitemap.body.includes('/editorial-review/oct11/'));
 report.checks.push({name:'all twelve authorizations discovered through canonical sitemap, Blog and site search',passed:true},{name:'eight guides in Blog RSS and four reports in Newsroom',passed:true},{name:'news feed and news sitemap match actually confirmed publications',passed:true});
 report.passed=true;fs.mkdirSync('docs/program-2026-10-11/editorial',{recursive:true});fs.writeFileSync('docs/program-2026-10-11/editorial/publication-live-'+phase+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({state:'verified_live',phase,commit:expected,articles:report.articles.length,checks:report.checks.length,checkedAt:report.checkedAt}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
