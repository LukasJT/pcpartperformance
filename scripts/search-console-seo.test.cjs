'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fullName,referencePageSchema,referenceSchemaScript}=require('./reference-page-schema.cjs');
const {policy}=require('./program-routing.cjs');
const DOMAIN='https://www.pcpartperformance.com';
const part={brand:'ASRock',name:'ASRock A620I Lightning WiFi',summary:'Mini-ITX AM5 motherboard',source:'https://www.asrock.com/mb/AMD/A620I%20Lightning%20WiFi/index.asp'};
const schemas=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
test('reference metadata describes the page and never manufactures rich-result requirements',()=>{
 const value=referencePageSchema(part,DOMAIN+'/learn/example.html');
 assert.equal(value['@type'],'WebPage');assert.equal(value.name,part.name);assert.equal(value.about['@type'],'Thing');assert.equal(value.citation,part.source);
 for(const field of ['offers','review','aggregateRating','price','availability','datePublished','dateModified'])assert.equal(value[field],undefined);
 assert.equal(value.primaryImageOfPage,undefined);
});
test('brand prefixes are not repeated or removed from exact model names',()=>{
 assert.equal(fullName(part),part.name);assert.equal(fullName({brand:'AMD',name:'amd Ryzen 7 9800X3D'}),'amd Ryzen 7 9800X3D');
 assert.equal(fullName({brand:'NVIDIA',name:'GeForce RTX 5070'}),'NVIDIA GeForce RTX 5070');
 assert.equal(fullName({brand:'Intel',name:'Intel'}),'Intel');
});
test('only supplied HTTP(S) citations and exact image URLs enter page metadata',()=>{
 const value=referencePageSchema({...part,source:'javascript:alert(1)'},DOMAIN+'/learn/example.html','https://www.pcpartperformance.com/assets/hardware/exact-example.webp');
 assert.equal(value.citation,undefined);assert.equal(value.primaryImageOfPage.url,DOMAIN+'/assets/hardware/exact-example.webp');
 assert.throws(()=>referencePageSchema(part,'javascript:alert(1)'),/canonical/);
});
test('names cannot escape the JSON-LD script into executable HTML',()=>{
 const name='</script><img src=x onerror=alert(1)>',html=referenceSchemaScript({...part,brand:'',name},DOMAIN+'/learn/example.html');
 assert.equal((html.match(/<\/script>/g)||[]).length,1);assert(!html.includes('<img'));assert.equal(schemas(html)[0].name,name);
});
test('curated alias redirects have a consistent indexable destination',async()=>{
 const manifest=JSON.parse(fs.readFileSync('dist/route-policy.json','utf8'));
 for(const suffix of ['', '&utm_source=guide']){
  const result=policy(DOMAIN+'/compare/?parts=rtx5070,rtx5060ti16'+suffix,manifest);
  assert.equal(result.status,301);assert.equal(result.headers['X-Robots-Tag'],undefined);assert(result.headers.Location.startsWith(DOMAIN+'/compare/rtx-5070-vs-rtx-5060-ti-16gb/'));
 }
 const worker=(await import('./worker.mjs')).default,response=await worker.fetch(new Request(DOMAIN+'/compare/?parts=rtx5070,rtx5060ti16'),{});
 assert.equal(response.status,301);assert.equal(response.headers.get('X-Robots-Tag'),null);
});
test('private state, unknown queries, previews and withheld targets retain exclusions',()=>{
 const manifest=JSON.parse(fs.readFileSync('dist/route-policy.json','utf8'));
 for(const url of ['/builder/?build=9800x3d','/compare/?parts=rtx5070,rtx5060ti16&mode=interactive','/compare/?parts=rtx5070,rtx5060ti16&unknown=1'])assert.match(policy(DOMAIN+url,manifest).headers['X-Robots-Tag'],/noindex/);
 assert.match(policy(DOMAIN+'/compare/?parts=rtx5070,rtx5060ti16',manifest,{staging:true}).headers['X-Robots-Tag'],/noindex/);
 const withheld=structuredClone(manifest);withheld.routes['/compare/rtx-5070-vs-rtx-5060-ti-16gb/'].noindex=true;
 assert.match(policy(DOMAIN+'/compare/?parts=rtx5070,rtx5060ti16',withheld).headers['X-Robots-Tag'],/noindex/);
});
test('the transferred account has the only homepage verification token',()=>{
 const html=fs.readFileSync('dist/index.html','utf8'),head=html.match(/<head>([\s\S]*?)<\/head>/)[1];
 const values=[...head.matchAll(/<meta name="google-site-verification" content="([^"]+)">/g)].map(m=>m[1]);
 assert.deepEqual(values,['ycg3UOM77yWTZdFshXncQAeWpWUN1TBSi-BJ-vRb_dI']);
});
test('indexable hardware references use factual WebPage metadata without invalid Product claims',()=>{
 const urls=[...fs.readFileSync('dist/sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);let checked=0;
 for(const url of urls.filter(u=>u.startsWith(DOMAIN+'/learn/'))){
  const html=fs.readFileSync(path.join('dist',new URL(url).pathname),'utf8'),items=schemas(html),pages=items.filter(x=>x['@type']==='WebPage');
  assert.equal(pages.length,1,url);assert.equal(pages[0].url,url);assert(!items.some(x=>x['@type']==='Product'),url);checked++;
 }
 assert(checked>800);
});
test('every sitemap page has an incoming crawlable link from another sitemap page',()=>{
 const urls=[...fs.readFileSync('dist/sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),routes=new Set(urls.map(u=>new URL(u).pathname)),incoming=new Set(['/']);
 for(const route of routes){const file=path.join('dist',route.endsWith('/')?route+'index.html':route),html=fs.readFileSync(file,'utf8');
  for(const m of html.matchAll(/href="(\/(?!\/)[^"?#]*)(?:[?#][^"]*)?"/g))if(m[1]!==route&&routes.has(m[1]))incoming.add(m[1]);
 }
 assert.deepEqual([...routes].filter(route=>!incoming.has(route)),[]);
});


test('phone specification pages keep their WebPage metadata without unsupported Product claims',()=>{
 for(const p of require('./phone-data.cjs')){
  const route='/phones/'+p.id+'/',html=fs.readFileSync(path.join('dist',route,'index.html'),'utf8'),items=schemas(html);
  assert(!items.some(x=>x['@type']==='Product'),route);
  const page=items.find(x=>x['@type']==='WebPage');assert(page,route);assert.equal(page.url,DOMAIN+route);
  assert(html.includes('<caption>Specifications</caption>'),route);assert(html.includes('id="sources"'),route);
 }
});
