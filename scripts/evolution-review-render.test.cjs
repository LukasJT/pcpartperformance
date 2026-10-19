'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=require('./evolution-review-render.cjs'),content=require('./evolution-editorial-data.cjs');
test('complete local review pages preserve exact draft hashes and assets while staying out of production discovery',()=>{
 const report=app.render();assert.equal(report.rendered,36);assert.equal(report.published,0);
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8'),feed=fs.readFileSync('dist/blog/feed.xml','utf8'),search=fs.readFileSync('dist/data/search-index.json','utf8');
 for(const p of report.pages){const file=path.resolve(report.output,p.file),html=fs.readFileSync(file,'utf8'),a=content.articles.find(a=>a.id===p.id);assert(html.includes(a.contentHash));assert(html.includes('noindex, nofollow'));assert(!/application\/ld\+json|<script|datePublished/.test(html));assert(fs.existsSync(path.resolve(path.dirname(file),p.visual)));assert(!fs.existsSync(path.join('dist',a.route,'index.html')));for(const discovery of [sitemap,feed,search])assert(!discovery.includes(a.route),a.id);}
});
test('local previews cannot write into the public build or arbitrary directories',()=>{assert.throws(()=>app.render(path.resolve('dist/review')),/local editorial/);});
