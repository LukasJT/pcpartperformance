'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const app=require('./total-refinement.cjs'),picker=require('./builder-selectors.js'),scope=require('./evolution-style-scope.cjs');
test('feature navigation separates label, description and affordance without accepting raw HTML',()=>{
 const html=app.featureRows([['/builder/','Build <PC>','Choose & review','build']]);
 assert(html.includes('Build &lt;PC&gt;'));assert(html.includes('Choose &amp; review'));assert(html.includes('total-feature-copy'));assert(html.includes('</strong><small>'));assert(html.includes('total-feature-arrow'));
});
test('save toolbar preserves the actual print, download, copy, save and privacy hooks exactly once',()=>{
 const input='<body><section id="readiness-report"><div class="program-actions"><button type="button" data-program-print>Print build report</button><button type="button" data-passport-download disabled>Download build report</button></div></section><section class="program-panel" id="build-revisions"><div class="program-heading"><div><h2 id="build-revisions-title">Save, compare and share</h2><p>Revisions stay on this device. No account or email is needed.</p></div></div><form id="program-save-form"><label>Revision name<input name="name"></label><button>Save this revision</button></form><div class="program-actions"><button data-program-copy="link">Copy share link</button><button data-program-copy="text">Copy parts list</button><details><summary>More save options</summary><button data-program-export>Export</button></details></div><p class="program-help">Private notes are excluded from public links.</p><p id="program-status"></p><div id="program-revisions"></div></section></body>';
 const out=app.polish(input,'/builder/');
 for(const hook of ['data-program-print','data-passport-download','data-program-copy="link"','data-program-copy="text"','id="program-save-form"','data-program-export','id="program-revisions"'])assert.equal(out.split(hook).length-1,1,hook);
 assert(out.indexOf('data-passport-download')>out.indexOf('total-save-toolbar'));assert(out.includes('data-passport-download disabled'));assert(out.includes('Save build</button>'));assert(out.includes('Private notes are excluded from public links.'));assert(out.includes('Sharing &amp; storage'));assert.equal(app.polish(out,'/builder/'),out);
});
test('picker sorting and SKU token matching preserve distinct variants and the selected model',()=>{
 const row=(id,name,sku,brand='Brand')=>({id,name,brand,text:picker.normalize(name+' '+sku),hasModel:false});
 const rows=[row('a','RTX 4070','a'),row('b','RTX 4070 SUPER OC White','B-OC-W'),row('c','RTX 4070 SUPER OC Black','B-OC-B')];
 assert.deepEqual(picker.filterOptions(rows,{query:'b-oc-w'}).map(x=>x.id),['b']);
 assert.deepEqual(picker.filterOptions(rows,{query:'4070 SUPER',sort:'name'}).map(x=>x.id),['c','b']);
 assert.equal(picker.filterOptions(rows,{sort:'name',selected:'b'})[0].id,'b');assert.equal(picker.filterOptions(rows,{query:'ti super'}).length,0);
});
test('homepage responsive component rules survive destination CSS scoping',()=>{
 const home=scope.scopeCSS(fs.readFileSync('scripts/evolution-destinations.css','utf8'),scope.families('/'));
 for(const selector of ['.total-feature-row','.total-feature-copy','.total-guide-link','.tech-category-image'])assert(home.includes(selector),selector);
 assert(!scope.scopeCSS(fs.readFileSync('scripts/evolution-destinations.css','utf8'),scope.families('/performance/')).includes('.total-feature-row'));
});
test('compiled builder retains the source engine behavior for saved selections, locks and invalid identities',()=>{
 const vm=require('node:vm');
 function run(file){const c={console,URL,location:{href:'https://example.com/builder/'},history:{replaceState(){}},document:{querySelector(){return null;},querySelectorAll(){return [];},addEventListener(){},dispatchEvent(){}},CustomEvent:function(name,detail){this.name=name;this.detail=detail;},matchMedia(){return{matches:true};},window:{},setTimeout};vm.createContext(c);vm.runInContext(fs.readFileSync('dist/builder-catalog.js','utf8'),c);vm.runInContext(fs.readFileSync('dist/core.js','utf8'),c);vm.runInContext(fs.readFileSync(file,'utf8'),c);const api=c.window.PCP_BUILD;api.load({parts:{cpu:['9800x3d'],ssd:['990pro','990pro']}});const saved=api.snapshot();api.setLocks(['9800x3d']);const locked=api.select('cpu','9600x');const invalid=api.select('cpu','rtx5070');api.load(saved);return JSON.parse(JSON.stringify({saved,locked,invalid,restored:api.snapshot()}));}
 assert.deepEqual(run('scripts/prepared-total/builder-v2.js'),run('scripts/builder-v2.js'));
});
