'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const studio=require('./clean-studio.cjs');
const base='<html><head></head><body data-ui-refined><main id="main"><h1>Old title</h1><p>Old duplicated feature links</p></main><footer>Preserved footer</footer></body></html>';
test('the home composition replaces the main once, with working routes and actual photo identities',()=>{
 const context={records:[{id:'gpu1',cat:'gpu'}],images:{rtx5070:{src:'/exact-board.webp',picturedModel:'Actual board variant'}}};
 const html=studio.polish(base,'/',context);
 assert.equal(studio.polish(html,'/',context),html);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/<main\b/g)||[]).length,1);
 assert(!html.includes('Old duplicated feature links'));assert(html.includes('Preserved footer'));
 assert(html.includes('/exact-board.webp'));assert(html.includes('alt="Actual board variant"'));
 for(const href of ['/builder/','/upgrade/','/compare/','/my-pc/','/blog/','/hardware/'])assert(html.includes('href="'+href+'"'));
 assert(html.includes('Example checks · not your current build'));assert(!/100%|guaranteed|measured FPS|live price/.test(html));
});
test('product and editorial transformations retain data, sources, disclosures and private-field boundaries',()=>{
 const original=base.replace('Old duplicated feature links','Source evidence: <a href="https://example.com/manual">manual</a><input name="note">');
 for(const route of ['/learn/exact-sku.html','/blog/a-guide/','/upgrade/','/compare/']){
  const result=studio.polish(original,route);assert(result.includes('Source evidence:'));assert(result.includes('https://example.com/manual'));assert(result.includes('<input name="note">'));
 }
 const redirect='<body data-legacy-redirect>Keep recovery</body>';assert.equal(studio.polish(redirect,'/old/'),redirect);
});
test('photography preserves the registry source and escapes its exact pictured identity',()=>{
 assert.equal(studio.photo('missing',{}),'');
 const result=studio.photo('test',{test:{src:'/source.webp',thumbnailSrc:'/thumb.webp',picturedModel:'Model <variant> "OC"'}});
 assert(result.includes('src="/thumb.webp"'));assert(result.includes('Model &lt;variant&gt; &quot;OC&quot;'));assert(result.includes('loading="lazy"'));
 assert(studio.photo('test',{test:{src:'/source.webp',picturedModel:'Actual model'}},{eager:true}).includes('fetchpriority="high"'));
});
test('workspace overview starts without invented data and preserves existing forms',()=>{
 const html=studio.polish(base.replace('<h1>Old title</h1>','<header class="my-pc-heading"><h1>Old title</h1></header><form data-workspace-notes><textarea name="note"></textarea></form>'),'/my-pc/');
 for(const name of ['build','watch','comparison'])assert(html.includes('data-studio-'+name+'-count>—'));
 assert(html.includes('data-workspace-notes'));assert(html.includes('<textarea name="note">'));
 assert(!html.includes('compatibility score'));
});
test('destination CSS is scoped while shared controls and reduced-motion fallbacks survive',()=>{
 const css=fs.readFileSync('scripts/clean-studio.css','utf8');
 const builder=studio.scopedCSS(css,'builder'),home=studio.scopedCSS(css,'home'),catalog=studio.scopedCSS(css,'catalog');
 assert(builder.includes('.builder-picker'));assert(!builder.includes('.studio-scene-gpu'));assert(!builder.includes('.studio-dashboard'));
 assert(home.includes('.studio-scene-gpu'));assert(!home.includes('.builder-picker'));assert(!home.includes(' .catalog-product{'));
 for(const output of [builder,home,catalog]){assert(output.includes('prefers-reduced-motion'));assert(output.includes('.button.primary'));assert(output.includes('.ui-site-menu'));}
 assert.equal(studio.family('/blog/guide/'),'article');assert.equal(studio.family('/my-pc/'),'workspace');
});
test('every major generated destination receives the same system without extra visual JavaScript',()=>{
 for(const route of ['','builder','my-pc','upgrade','hardware','compare','blog','build-school']){
  const html=fs.readFileSync('dist/'+(route?route+'/':'')+'index.html','utf8');
  assert(html.includes('data-clean-studio'),route);assert.equal((html.match(/data-clean-studio/g)||[]).length,1);
  assert(!html.includes('clean-studio.js'));assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
 }
});
