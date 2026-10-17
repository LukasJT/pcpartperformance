'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('isolated ad documents remain noindex assets rather than public editorial pages',()=>{
 const manifest=JSON.parse(fs.readFileSync('dist/route-policy.json','utf8')),sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
 for(const name of ['300x250','320x50','468x60','728x90','native']){
  const route='/ads/'+name+'.html',html=fs.readFileSync('dist'+route,'utf8');
  assert(manifest.assets.includes(route),route+' asset registration missing');
  assert.equal(manifest.routes[route],undefined,route+' must not be an editorial route');
  assert(!sitemap.includes(route),route+' leaked into sitemap');
  assert(/<meta name="robots" content="noindex"/.test(html),route+' template exclusion missing');
  assert(!html.includes('BreadcrumbList')&&!html.includes('site-header'),route+' was decorated as a website page');
 }
});
