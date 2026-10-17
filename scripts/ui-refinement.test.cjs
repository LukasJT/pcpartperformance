'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const clarity=require('./clarity-site.cjs'),ui=require('./ui-refinement.cjs');
const fs=require('node:fs'),path=require('node:path');
const base=body=>clarity.polish('<!doctype html><html><head><link rel="stylesheet" href="/clarity-site.css"></head><body data-page="test"><header class="site-header"><a class="brand" href="/">Brand</a><nav class="liquid-nav"></nav><div class="country-switch"><button data-region="CA" aria-pressed="false">CA</button><button data-region="US" aria-pressed="true">US</button></div><button class="theme-toggle"><span class="theme-label">Theme</span></button></header><main id="main">'+body+'</main><footer class="site-footer">Footer</footer></body></html>','/upgrade/',[]);
test('one navigation tree preserves each regional control, theme state and primary destination',()=>{
 const html=ui.polish(base('<h1>Upgrade</h1>'),'/upgrade/');
 assert.equal((html.match(/aria-label="Main navigation"/g)||[]).length,1);
 assert.equal((html.match(/data-region="CA"/g)||[]).length,1);assert.equal((html.match(/data-region="US"/g)||[]).length,1);
 assert(html.includes('data-region="US" aria-pressed="true"'));assert.equal((html.match(/class="theme-toggle"/g)||[]).length,1);
 for(const href of ['/builder/','/upgrade/','/compare/','/hardware/','/blog/','/my-pc/','/phones/','/performance/'])assert(html.includes('href="'+href+'"'));
 assert(html.includes('data-menu-toggle aria-expanded="false" aria-controls="site-menu" hidden'));
});
test('refinement is idempotent across destination, product and editorial routes',()=>{
 for(const route of ['/','/builder/','/compare/','/blog/','/my-pc/','/learn/rtx5070.html','/blog/example/']){
  const once=ui.polish(base('<h1>Example</h1><p>Useful content</p>'),route);assert.equal(ui.polish(once,route),once);
 }
});
test('existing upgrade anchors replace duplicate navigation without losing form controls or source evidence',()=>{
 const body='<header class="program-intro"><h1>Improve the PC you already own</h1></header><nav class="md-steps"><a href="#inventory">Record your PC</a></nav><section class="program-panel" id="inventory"><h2>1. Record your existing PC</h2><form data-upgrade-form><select name="cpu"><option value="exact-sku">Exact SKU</option></select></form></section><section id="change"></section><section id="costs"><p>Unknown price</p><a href="https://www.amd.com/">Source</a></section>';
 const html=ui.polish(base(body),'/upgrade/');assert(!html.includes('class="md-steps"'));for(const id of ['inventory','change','costs'])assert(html.includes('href="#'+id+'"')&&html.includes('id="'+id+'"'));
 assert(html.includes('data-upgrade-form'));assert(html.includes('value="exact-sku"'));assert(html.includes('Unknown price'));assert(html.includes('href="https://www.amd.com/"'));
});
test('builder readability changes retain the original state controls and evidence boundaries',()=>{
 const body='<nav id="builder-workflow" class="builder-workflow"><a href="#build-preview"><strong>Inspect the build</strong></a><a href="#readiness-report"><strong>Review and save</strong></a></nav><p class="builder-step-label">02 · Inspect</p><div id="builder-parts"></div><div id="build-preview"></div><div id="readiness-report">Needs verification</div><button id="builder-clear">Clear build</button><button id="builder-starter">Load starter build</button>';
 const html=ui.polish(base(body),'/builder/');for(const id of ['builder-parts','build-preview','readiness-report','builder-clear','builder-starter'])assert(html.includes('id="'+id+'"'));
 assert(html.includes('Needs verification'));assert(html.includes('<strong>3D preview</strong>'));assert(!html.includes('class="builder-step-label"'));
});
test('legacy redirect documents remain unchanged',()=>{const html='<!doctype html><html><body data-legacy-redirect><a href="/hardware/">Continue</a></body></html>';assert.equal(ui.polish(html,'/old/'),html);});
test('illustrations are accessible decorative vectors without fabricated measured results',()=>{
 for(const kind of ['build','upgrade','workspace','compare','learn','compatibility','phone']){const svg=ui.illustration(kind);assert(svg.includes('aria-hidden="true"'));assert(svg.includes('viewBox="0 0 380 280"'));assert(!/100%|FPS|verified|<image|<script/.test(svg));}
});

test('every generated public page receives one working shared header and locally served fonts',()=>{
 let pages=0;
 function inspect(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);if(entry.isDirectory()){inspect(file);continue;}
  if(!file.endsWith('.html'))continue;const html=fs.readFileSync(file,'utf8');
  if(html.includes('data-legacy-redirect')||!html.includes('class="site-header'))continue;
  assert(html.includes('data-ui-refined'),file);assert.equal((html.match(/data-ui-header/g)||[]).length,1,file);
  assert.equal((html.match(/id="site-menu"/g)||[]).length,1,file);
  const header=html.match(/<header class="site-header[^>]*>[\s\S]*?<\/header>/)?.[0]||'';
  assert.equal((header.match(/data-region="CA"/g)||[]).length,1,file);
  assert.equal((header.match(/data-region="US"/g)||[]).length,1,file);
  assert(!/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com/.test(html),file);
  assert(html.includes('href="/assets/fonts/dm-sans-latin-v17.woff2"'),file);pages++;
 }}inspect(path.resolve('dist'));assert(pages>1500);
 for(const name of ['dm-sans-latin-v17.woff2','dm-sans-latin-ext-v17.woff2','space-grotesk-latin-v22.woff2','space-grotesk-latin-ext-v22.woff2','space-grotesk-vietnamese-v22.woff2'])assert.equal(fs.readFileSync(path.join('dist/assets/fonts',name)).toString('ascii',0,4),'wOF2');
 for(const name of ['DM-Sans-OFL.txt','Space-Grotesk-OFL.txt'])assert(fs.readFileSync(path.join('dist/assets/fonts',name),'utf8').includes('SIL OPEN FONT LICENSE'));
});

test('versioned font requests are cacheable, correctly typed assets without weakening private route policy',async()=>{
 const {default:worker}=await import('./worker.mjs');
 const assets={async fetch(request){const file=new URL(request.url).pathname;return new Response(file.endsWith('.woff2')?'font bytes':'<html></html>',{headers:{'Content-Type':file.endsWith('.woff2')?'font/woff2':'text/html'}});}};
 const font=await worker.fetch(new Request('https://www.pcpartperformance.com/assets/fonts/dm-sans-latin-v17.woff2'),{ASSETS:assets});
 assert.equal(font.status,200);assert.equal(font.headers.get('Content-Type'),'font/woff2');assert.equal(font.headers.get('Cache-Control'),'public, max-age=31536000, immutable');
 const state=await worker.fetch(new Request('https://www.pcpartperformance.com/builder/?build=9800x3d'),{ASSETS:assets});
 assert.equal(state.headers.get('Cache-Control'),'no-store');assert.match(state.headers.get('X-Robots-Tag'),/noindex/);
});

test('host builds use fingerprinted UI outputs and reject changed source or corrupted runtime',()=>{
 const manifest=JSON.parse(fs.readFileSync('scripts/prepared-ui/manifest.json','utf8'));
 for(const [name,entry]of Object.entries(manifest.files)){
  const source=fs.readFileSync(path.join('scripts',name),'utf8'),output=fs.readFileSync(path.join('scripts/prepared-ui',name),'utf8');
  assert.equal(ui.validateRuntime(name,source,output,entry),output);
  assert.throws(()=>ui.validateRuntime(name,source+'\nchanged',output,entry),/Stale prepared UI runtime/);
  assert.throws(()=>ui.validateRuntime(name,source,output+'changed',entry),/Stale prepared UI runtime/);
  assert.equal(ui.validateRuntime(name,source.replace(/\r?\n/g,'\r\n'),output,entry),output);
 }
});
