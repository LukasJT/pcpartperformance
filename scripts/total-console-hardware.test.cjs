'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const library=require('./total-console-hardware.cjs');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('modern console facts have manufacturer sources and exact model scope',()=>{
 const {modern,sources}=library.data;assert.equal(modern.length,6);assert.deepEqual(library.validate().errors,[]);
 for(const r of modern){assert(r.scope.length>15);assert(r.facts.length>=3);for(const f of r.facts){assert.equal(f.status,'manufacturer-specified');assert(sources[f.source]);assert.match(sources[f.source].url,/^https:\/\/(www\.)?(nintendo\.com|playstation\.com|blog\.playstation\.com|xbox\.com)\//);}}
 const sw=modern.find(r=>r.id==='switch2');assert.equal(sw.facts.find(f=>f.label==='Processor').value,'Custom NVIDIA processor');assert(!sw.facts.some(f=>/clock|core configuration/i.test(f.label)));
 const pro=modern.find(r=>r.id==='ps5-pro');assert(!pro.facts.some(f=>/CPU|GPU|frame rate/i.test(f.label)));
 const s=modern.find(r=>r.id==='series-s');assert(!s.facts.some(f=>/clock|frequency/i.test(f.label)));assert(s.unknown.some(v=>v.includes('model-specific')));
});

test('retro timeline keeps regional scope and links existing hardware instead of duplicating product routes',()=>{
 const rows=library.data.historical;assert.equal(rows.length,16);assert.equal(new Set(rows.map(r=>r.id)).size,16);
 for(const r of rows){assert.equal(r.evidenceType,'manufacturer-history');assert.equal(r.datePrecision,'year');assert(Number.isInteger(r.year)&&r.year>=1980&&r.year<=2012);assert(library.data.sources[r.source]);assert(r.region);assert(fs.existsSync(path.join(__dirname,'../dist/learn',r.partId+'.html')),r.partId);}
 assert.equal(rows.find(r=>r.id==='playstation').year,1994);assert.match(rows.find(r=>r.id==='playstation').region,/Japan.*1995/);assert.match(rows.find(r=>r.id==='ps3').region,/2007/);
});

test('console hub build creates two crawlable pages and a provenance file',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-console-hardware-'));try{
 fs.mkdirSync(path.join(root,'data'));const pages={};
 const result=library.prepare({root,esc,write:(r,h)=>{pages[r]=h;},shell:(title,route,body,options)=>'<html><head><title>'+esc(title)+'</title><meta name="description" content="'+esc(options.description)+'"></head><body><main>'+body+'</main></body></html>'});
 assert.equal(result.valid,true);assert.deepEqual(Object.keys(pages),['performance/consoles','performance/retro']);
 const modern=pages['performance/consoles'],retro=pages['performance/retro'];assert(modern.includes('Switch 2'));assert(!modern.includes('Switch2'));assert(!modern.includes('PlayStation5'));assert(modern.includes('PS5 Pro'));
 assert.equal((modern.match(/class="total-console-card"/g)||[]).length,6);assert.equal((retro.match(/class="total-retro-year"/g)||[]).length,16);
 assert(modern.includes('https://www.nintendo.com/us/gaming-systems/switch-2/tech-specs/'));assert(modern.includes('/performance/?platform=series-s'));
 assert(!/"@type"\s*:\s*"(?:Product|Article|Review)"/.test(modern+retro));assert(!/(?:averageFps|desktopEquivalentGpu)/.test(modern+retro));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'data/console-hardware-reference.json'),'utf8')).modern.length,6);assert(fs.existsSync(path.join(root,'total-console-hardware.css')));
 }finally{assert(root.startsWith(path.join(os.tmpdir(),'pcp-console-hardware-')));fs.rmSync(root,{recursive:true,force:true});}
});

test('reference enhancement is idempotent and does not alter unrelated products',()=>{
 const base='<html><head></head><body><main>Existing product</main></body></html>';
 const result=library.polish(base,'/learn/ps5.html');assert(result.includes('Original 2020 launch hardware'));assert(result.includes('/performance/consoles/#ps5-original'));assert.equal(library.polish(result,'/learn/ps5.html'),result);
 assert.equal(library.polish(base,'/learn/example-gpu.html'),base);
 const fps='<details class="total-fps-method"><summary>Methodology</summary><p>Existing evidence</p></details>';
 const changed=library.polish(fps,'/performance/');assert(changed.includes('Retro hardware'));assert.equal(library.polish(changed,'/performance/'),changed);
});

test('original console silhouettes are self-contained vector illustrations',()=>{
 const kinds=new Set([...library.data.modern,...library.data.historical].map(r=>r.kind));for(const kind of kinds){const svg=library.silhouette(kind);assert(svg.includes('viewBox="0 0 240 170"'));assert(svg.includes('aria-hidden="true"'));assert(!/<(?:image|script|foreignObject)|href=|onload=/.test(svg));}
 const css=fs.readFileSync(path.join(__dirname,'total-console-hardware.css'),'utf8');assert(css.includes('minmax(0,1fr)'));assert(css.includes('min-height:44px'));assert(css.includes('prefers-reduced-motion'));
});
