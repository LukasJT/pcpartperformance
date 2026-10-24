'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {LANDINGS,ARTICLE,DATE,polish}=require('./search-landing-content.cjs');
const fixture=route=>'<!doctype html><html><head><title>Existing title</title><link rel="canonical" href="https://www.pcpartperformance.com'+route+'"><meta name="robots" content="index,follow"></head><body><main><h1>Existing tool</h1><form id="existing-form"><label>Exact model<input id="exact-model" name="model" required></label><button type="submit">Check</button></form><output aria-live="polite">Existing result</output></main></body></html>';
test('planning guidance stays outside existing forms and preserves tool controls and indexing policy',()=>{
 for(const route of Object.keys(LANDINGS)){
  const before=fixture(route),after=polish(before,route);
  assert(after.includes(before.match(/<form[\s\S]*?<\/form>/)[0]));
  assert(after.indexOf('data-search-landing')>after.indexOf('</form>'));
  assert(after.includes('<output aria-live="polite">Existing result</output>'));
  for(const text of ['<h1>Existing tool</h1>','name="robots" content="index,follow"','href="https://www.pcpartperformance.com'+route+'"'])assert(after.includes(text));
  assert.equal(polish(after,route),after);
 }
});
test('unrelated pages and their dates are untouched',()=>{
 const html=fixture('/blog/another-guide/');assert.equal(polish(html,'/blog/another-guide/'),html);
});
test('a substantive article revision preserves its original publication date and historical source date',()=>{
 const data={'@context':'https://schema.org','@graph':[{'@type':'Article',url:'https://www.pcpartperformance.com'+ARTICLE,datePublished:'2026-10-03',dateModified:'2026-10-03'}]};
 const before=fixture(ARTICLE).replace('</head>','<script type="application/ld+json">'+JSON.stringify(data)+'</script></head>').replace('</main>','<div class="article-byline">Original byline</div><article><section id="section-4"><h2>Keep a final verification record</h2><p>Previous record.</p></section><p>Research checked October 3, 2026.</p></article></main>');
 const after=polish(before,ARTICLE),schema=JSON.parse(after.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
 assert.equal(schema['@graph'][0].dateModified,DATE);assert.equal(schema['@graph'][0].datePublished,'2026-10-03');
 assert(after.includes('Research checked October 3, 2026.'));assert(after.includes('data-search-worksheet'));assert.equal(polish(after,ARTICLE),after);
 assert(!/"(?:offers|aggregateRating|review)":/.test(after));
});
test('published guidance links resolve to canonical, indexable existing pages without private query state',()=>{
 for(const route of [...Object.keys(LANDINGS),ARTICLE]){
  const html=fs.readFileSync(path.join('dist',route,'index.html'),'utf8');
  const marker=route===ARTICLE?'data-search-worksheet':'data-search-landing';assert.equal((html.match(new RegExp(marker,'g'))||[]).length,1,route);
  const block=html.match(route===ARTICLE?/<section id="section-4" data-search-worksheet>[\s\S]*?<\/section>/:/<section class="search-guide"[\s\S]*?<\/section>/)?.[0];assert(block,route);
  for(const match of block.matchAll(/href="(\/[^"?#]*)"/g)){
   const target=path.join('dist',match[1],'index.html');assert(fs.existsSync(target),match[1]);const content=fs.readFileSync(target,'utf8');
   assert(!/name="robots" content="noindex/.test(content),match[1]);assert(!content.includes('data-legacy-redirect'),match[1]);
  }
 }
});
test('the built article keeps its original identity, byline, sources and only its real revision date changes',()=>{
 const html=fs.readFileSync(path.join('dist',ARTICLE,'index.html'),'utf8'),schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).flatMap(s=>s['@graph']||[s]),article=schemas.find(s=>s['@type']==='Article');
 assert.equal(article.datePublished,'2026-10-03');assert.equal(article.dateModified,DATE);assert.equal(article.url,'https://www.pcpartperformance.com'+ARTICLE);
 assert(html.includes('id="sources"'));assert(html.includes('By <a href="/about/">PC Part Performance'));
 assert(html.includes('Installed firmware'));assert(html.includes('Original source inspection dates are retained.'));
});
