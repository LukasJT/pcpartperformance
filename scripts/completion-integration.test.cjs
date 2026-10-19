'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const models=require('./completion-models-data.cjs'),routing=require('./program-routing.cjs');
const html=route=>fs.readFileSync('dist'+route+(route.endsWith('/')?'index.html':''),'utf8');
const manifest=JSON.parse(fs.readFileSync('dist/route-policy.json','utf8'));
test('all acquired source scenes have a reachable product viewer without an initial Three download',()=>{
 for(const model of models.MODEL_ADDITIONS){const route='/learn/'+model.id+'.html',h=html(route);assert.equal(routing.policy(route,manifest).status,200);assert(h.includes('data-model="/assets/models/'+model.asset+'"'));assert(h.includes('data-model-id="'+model.id+'"'));assert(h.includes(model.sourceUrl));assert(h.includes(model.creator));assert(!/<script[^>]+src="[^"]*(?:three\.module|\.glb)/.test(h));}
 const viewer=fs.readFileSync('dist/part-model.js','utf8');assert(!/^import .*from /m.test(viewer));assert(/import\('\/build-scene\.js(?:\?[^']*)?'\)/.test(viewer));
});
test('practical catalog and workspace exclude explicit reference-only parts while retaining their old URLs',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync('dist/builder-catalog.js','utf8'),context);const catalog=context.window.PCP_BUILDER_CATALOG;
 for(const id of ['intel4004','completion-cpu-intel-core-i5-661','retail-cooler-master-masterbox-lite-5']){assert(!catalog.some(p=>p.id===id));assert(!/href="\/builder\/\?build=/.test(html('/learn/'+id+'.html')));assert(!html('/my-pc/').match(/id="workspace-catalog">[^<]*/)?.[0].includes('"id":"'+id+'"'));}
 for(const id of ['completion-cpu-intel-core-i5-661','retail-cooler-master-masterbox-lite-5'])assert(manifest.routes['/learn/'+id+'.html'].noindex);
 assert.equal(catalog.filter(p=>p.cat==='cooler').length,13);
 assert(catalog.find(p=>p.id==='retail-corsair-carbide-200r-black').sku==='CC-9011023-WW');
 const library=JSON.parse(fs.readFileSync('dist/model-library.json','utf8'));assert.equal(library.total,library.items.length);assert.equal(library.practicalBuilder.total,catalog.length);assert.equal(library.downloaded,115);assert.equal(library.verified,0);assert(html('/builder/model-coverage/').includes('CPU coolers'));
});
test('all priced history rows stay separate from offers and only their product pages load the history UI',()=>{
 const history=JSON.parse(fs.readFileSync('data/public-price-history.json','utf8'));assert(history.observations.length>=16);
 for(const id of new Set(history.observations.map(row=>row.productId))){const h=html('/learn/'+id+'.html');assert(h.includes('data-price-history'));assert(h.includes('type="module" src="/completion-price-history.js"'));}
 for(const route of ['/','/builder/','/phones/'])assert(!html(route).includes('/completion-price-history.js'));
 assert.deepEqual(JSON.parse(fs.readFileSync('dist/data/public-price-history.json','utf8')),history);
});
test('confirmed pasted import loads before the retained upgrade controller and does not create a new route',()=>{
 const h=html('/upgrade/');assert(h.includes('Review pasted parts'));assert(h.indexOf('src="/completion-parts-import.js"')<h.indexOf('src="/upgrade-program.js"'));assert(h.includes('/completion-parts-import.css')||h.includes('/assets/css/site-'));assert(!manifest.routes['/import/']);
});
test('reviewed stale prebuilt URL variants resolve in one step to the same exact configuration',()=>{
 const target='https://www.pcpartperformance.com/prebuilts/us-skytech-gaming-st-king95-2062-w-bu/';
 for(const suffix of ['', '/', '/index.html']){const result=routing.policy('/prebuilts/us-null-st-king95-2062-w-bu'+suffix,manifest);assert.equal(result.status,301);assert.equal(result.headers.Location,target);assert.equal(routing.policy(target,manifest).status,200);}
 assert(fs.readFileSync('dist/prebuilt-ui.js','utf8').includes("id==='us-null-st-king95-2062-w-bu'?'us-skytech-gaming-st-king95-2062-w-bu':id"));
});
test('new editorial pages have complete visible evidence and truthful organization attribution in HTML and discovery',()=>{
 const data=require('./completion-editorial-data.cjs'),sitemap=fs.readFileSync('dist/sitemap.xml','utf8'),feed=fs.readFileSync('dist/blog/feed.xml','utf8'),index=JSON.parse(fs.readFileSync('dist/data/search-index.json','utf8'));
 for(const article of [...data.articles,...require('./completion-editorial-extra-data.cjs').articles]){const h=html(article.route);assert(h.includes('data-completion-editorial'+(article.id.startsWith('MX')?'-extra':'')+'="'+article.id+'"'));assert(!h.includes('data-program-draft'));assert.equal(manifest.routes[article.route].noindex,false);assert(h.includes('"name":"PC Part Performance"'));for(const id of article.sourceIds)assert(h.includes((article.id.startsWith('MX')?require('./completion-editorial-extra-data.cjs').sources[id]:data.sources[id]).url.replaceAll('&','&amp;'))||h.includes((data.sources[id]||require('./completion-editorial-extra-data.cjs').sources[id]).url));assert(sitemap.includes(article.route));assert(feed.includes(article.route));assert(index.some(row=>row.url===article.route));}
});
test('mobile comparison opens controls without focusing its text search automatically',()=>{
 const source=fs.readFileSync('dist/interface.js','utf8'),body=source.slice(source.indexOf('function openPicker('),source.indexOf('\nfunction closePicker('));assert(body.includes("matchMedia('(pointer: coarse)')"));
 for(const coarse of [true,false]){const focus=[],nodes={'#picker-query':{value:'',focus:()=>focus.push('query')},'#picker-category-label':{},'#part-picker':{showModal(){},querySelector:()=>({focus:()=>focus.push('close')})}},context={document:{activeElement:{}},categories:[],activeCategory:'gpu',replacing:null,pickerCategory:null,returnFocus:null,renderPicker(){},matchMedia:()=>({matches:coarse}),$:id=>nodes[id]};vm.runInNewContext(body+';openPicker();',context);assert.deepEqual(focus,[coarse?'close':'query']);}
});

test('catalog comparison buttons retain their visible label in both selected states',()=>{
 const source=fs.readFileSync('dist/interface.js','utf8'),start=source.indexOf(' function renderLibrary(){'),end=source.indexOf('\n for(const id of',start),body=source.slice(start,end);
 const preludeStart=source.indexOf(' const pcPartCategories='),preludeEnd=source.indexOf(' let limit=',preludeStart),prelude=source.slice(preludeStart,preludeEnd);
 assert(start>=0&&end>start);
 assert(preludeStart>=0&&preludeEnd>preludeStart,'Use the real catalog scope declarations surrounding renderLibrary');
 for(const selected of [[],['fixture-gpu']]){
  const nodes={'#catalog-search':{value:''},'#catalog-category':{value:'all'},'#catalog-era':{value:'all'},'#catalog-sort':{value:'new'},'#hardware-rows':{},'#catalog-summary':{},'#catalog-empty':{},'#catalog-more':{},'#selected-link':{},'.page-heading h1':{}};
  const context={selected,limit:24,catalog:[{id:'fixture-gpu',name:'Example GPU',cat:'gpu',brand:'Example',architecture:'Example',summary:'Fixture',year:2026}],categories:[['gpu','Graphics cards']],photos:{},escapeHTML:value=>String(value),$:selector=>nodes[selector],document:{body:{dataset:{}},querySelectorAll:()=>[]},location:{href:'https://www.pcpartperformance.com/hardware/'},history:{replaceState(){}},URL,renderEvent(){}};
  vm.runInNewContext(prelude+body+';renderLibrary();',context);
  const markup=nodes['#hardware-rows'].innerHTML,label=markup.match(/data-library-add="fixture-gpu" aria-label="([^"]+)"/)[1],visible=markup.match(/aria-label="[^"]+">([+✓\s\w]+)<\/button>/)[1].replace(/[+✓]/g,'').trim();
  assert(label.toLowerCase().includes(visible.toLowerCase()),'Voice navigation must match the visible '+visible+' label');
  if(selected.length)assert(label.includes('remove'));
 }
});

test('horizontal comparison specifications expose a named keyboard scroll region',()=>{
 const h=html('/compare/');assert(h.includes('id="comparison-table" tabindex="0" role="region" aria-label="Comparison specifications"'));
});

test('new guide breadcrumbs use complete topic labels rather than fragments of their headlines',()=>{
 const compact=require('./clarity-site.cjs').compactBreadcrumb;
 assert.equal(compact('/blog/compact-quiet-pc-fit-cooling/','Plan a compact PC with a realistic noise goal'),'Compact PC planning');
 assert.equal(compact('/blog/rtx-3060-upgrade-or-keep/','RTX 3060: upgrade or keep it?'),'RTX 3060 upgrade options');
});

test('offer expiry labels include the next calendar date instead of repeating an ambiguous clock time',()=>{
 const source=fs.readFileSync('scripts/shopping.js','utf8'),start=source.indexOf('function freshness('),end=source.indexOf('\nfunction offerRows',start),context={region:'US',Date,esc:value=>String(value)};
 vm.runInNewContext(source.slice(start,end)+'; label=freshness({checkedAt:"2026-10-16T01:00:00Z",expiresAt:"2026-10-17T13:00:00Z"});',context);
 assert(context.label.includes('Oct')&&context.label.includes('17'));assert(!source.slice(start,end).includes('toLocaleTimeString'));
});

test('all prepared production runtimes match their source and the built shopping asset',()=>{
 const crypto=require('node:crypto');
 for(const [source,metadata]of [['compatibility-evidence.cjs','compatibility-evidence.browser.json'],['builder-program.js','builder-program.browser.json'],['shopping.js','shopping.browser.json']]){
  const text=fs.readFileSync('scripts/'+source,'utf8').replace(/\r\n/g,'\n'),prepared=JSON.parse(fs.readFileSync('scripts/'+metadata,'utf8'));
  assert.equal(crypto.createHash('sha256').update(text).digest('hex'),prepared.sourceHash,source+' changed: run prepare-master-runtime before building or releasing');
 }
 assert.equal(fs.readFileSync('dist/shopping.js','utf8').replace(/\r\n/g,'\n'),fs.readFileSync('scripts/shopping.browser.js','utf8').replace(/\r\n/g,'\n'));
});
