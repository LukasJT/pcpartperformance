'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const phones=require('./phone-data.cjs'),models=require('./phone-models.json'),page=require('./phone-pages.cjs');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let passed=0;const tests=[];
async function test(name,run){await run();passed++;tests.push({name,status:'passed'});console.log('PASS '+name)}
const fixture=body=>'<html><head><title>Phone</title><meta name="description" content="Manufacturer dimensions"></head><body data-publication ><main id="main" tabindex="-1">'+body+'</main></body></html>';
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.attributes={};this.dataset={};this.style={};this.listeners={};this.hidden=false;this.checked=false;this._text='';this.classList={toggle:()=>{}};this.options=[];}
 setAttribute(name,value){this.attributes[name]=String(value)}
 append(...nodes){this.children.push(...nodes)}
 prepend(...nodes){this.children.unshift(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes];this._text=''}
 set textContent(value){this.children=[];this._text=String(value)}
 get textContent(){return this._text+this.children.map(n=>typeof n==='string'?n:n.textContent).join('')}
 addEventListener(type,listener){(this.listeners[type]??=[]).push(listener)}
 dispatchEvent(event){for(const listener of this.listeners[event.type]||[])listener(event)}
 click(){this.dispatchEvent({type:'click'})}
 focus(){this.focused=true}
 closest(){return this.parentElement}
}
function client(query='?a=iphone-16&b=pixel-9&view=size'){
 const controls={};for(const name of ['a','b','overlay','folded'])controls[name]=new Element(name==='a'||name==='b'?'select':'input');
 controls.a.value='iphone-16';controls.b.value='pixel-9';for(const s of [controls.a,controls.b])s.options=phones.map(p=>({value:p.id}));
 const form=new Element('form');form.elements=controls;const selectors={};for(const selector of ['[data-phone-folded-option]','[data-phone-scale]','output','[data-phone-measurements]','[data-phone-specs]','[data-phone-design]','[data-phone-size-view]','.phone-measurements','[data-phone-spec-view]','[data-phone-linked]','[data-phone-mode-help]','[data-phone-share]','[data-phone-share-status]','[data-phone-swap]'])selectors[selector]=new Element();
 selectors['[data-phone-linked]'].parentElement=new Element('label');
 const buttons=['design','size','specs'].map(value=>{const e=new Element('button');e.dataset.phoneMode=value;return e});
 form.querySelector=selector=>selectors[selector]||null;form.querySelectorAll=selector=>selector==='[data-phone-mode]'?buttons:[];
 const document={querySelector:selector=>selector==='[data-phone-size]'?form:null,createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag),createTextNode:text=>String(text),dispatchEvent:()=>{}};
 const location={href:'https://www.pcpartperformance.com/phones/size-compare/'+query,search:query};let resolveFetch,rejectFetch,copied='';
 const fetchPromise=new Promise((resolve,reject)=>{resolveFetch=resolve;rejectFetch=reject});
 const context=vm.createContext({document,location,URL,URLSearchParams,console,Event:class{constructor(type,init={}){this.type=type;Object.assign(this,init)}},window:{addEventListener:()=>{}},history:{replaceState(_state,_title,url){location.href=String(url);location.search=new URL(url).search}},navigator:{clipboard:{writeText:async value=>{copied=value}}},fetch:()=>fetchPromise});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'phone-comparison.js'),'utf8'),context,{filename:'phone-comparison.js'});
 return {form,selectors,buttons,controls,location,resolveFetch,rejectFetch,copied:()=>copied};
}
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
(async()=>{
 await test('the phone workspace keeps essential controls and removes the extra method disclosure',()=>{
  const options=selected=>phones.map(p=>'<option value="'+p.id+'"'+(p.id===selected?' selected':'')+'>'+esc(p.name)+'</option>').join('');
  const html=require('./phone-size-page.cjs')({phones,options,silhouette:p=>'<svg aria-label="'+esc(p.name)+'"></svg>',esc});
  for(const control of ['data-phone-picker','data-phone-swap','data-phone-scale','data-phone-measurements'])assert(html.includes(control));
  assert(!html.includes('Sources and how size is compared'));assert(html.includes('Not actual size on your screen.'));
  assert.match(html,/<div id="phone-design-view" data-phone-design hidden>/);assert.match(html,/data-phone-mode="size" aria-pressed="true"/);
 });
 await test('the real phone and continuation generators produce all three views in build order',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-phone-clarity-'));
  const write=(route,html)=>{fs.mkdirSync(path.join(root,route),{recursive:true});fs.writeFileSync(path.join(root,route,'index.html'),html)};
  try{
   fs.mkdirSync(path.join(root,'data'));for(const phone of phones)write('phones/'+phone.id,fixture('<article class="publication-copy"><p>Regional facts</p></article>'));
   for(const [a,b]of [['iphone-16','iphone-16-pro'],['iphone-16','pixel-9']])write('phones/compare/'+a+'-vs-'+b,fixture('<article class="publication-copy"></article>'));
   const options=selected=>phones.map(p=>'<option value="'+p.id+'"'+(p.id===selected?' selected':'')+'>'+esc(p.name)+'</option>').join('');
   write('phones/size-compare',fixture(require('./phone-size-page.cjs')({phones,options,silhouette:p=>'<svg aria-label="'+esc(p.name)+'"></svg>',esc})));
   write('builder/model-credits',fixture('<p class="data-note">Preview geometry</p>'));write('',fixture('<h1>Home</h1>'));write('compare',fixture('<div class="compare-controls"></div>'));
   page({root,images:{},esc});require('./continuation-site.cjs')({root,records:[],images:{},shell:(_title,_type,body)=>fixture(body),write,esc});page.decorate({root,records:[],esc});
   const html=fs.readFileSync(path.join(root,'phones/size-compare/index.html'),'utf8');for(const view of ['size','design','specs'])assert(html.includes('data-phone-mode="'+view+'"'));
   assert(html.includes('data-phone-spec-view'));assert(html.includes('data-phone-linked'));assert(html.includes('data-phone-share'));assert(html.includes('data-phone-mode-help class="phone-accessible-help"'));assert(html.includes('phone-comparison.js?v=20261014clarity'));
   const credits=fs.readFileSync(path.join(root,'builder/model-credits/index.html'),'utf8');assert(credits.includes('id="phone-pixel-9"'));
  }finally{assert(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(root,{recursive:true,force:true})}
 });
 await test('phone cleanup removes the requested review block while preserving metadata and view controls',()=>{
  const original=fixture('<h1>Compare phones</h1><button data-phone-mode="design">3D & angles</button><details class="phone-method"><summary>Sources and how size is compared</summary><p>Old copy</p></details><section class="review-panel" data-related-reviews data-phone-review-panel hidden><h2>Watch this phone comparison</h2><p>Android Authority</p></section><script src="/review-video-ui.js" defer></script>');
  const result=page.decorateHtml(original,{route:'/phones/size-compare/',esc});
  assert(!result.includes('Android Authority'));assert(!result.includes('phone-method'));assert(!result.includes('review-video-ui.js'));assert(result.includes('name="description" content="Manufacturer dimensions"'));assert(result.includes('data-phone-mode="design"'));assert(result.includes('href="/phones/#phone-catalog"'));
 });
 await test('exact-phone cross-links preserve identity and unsupported phones are not assigned another model',()=>{
  const pixel=phones.find(p=>p.id==='pixel-9'),html=page.decorateHtml(fixture('<h1>Pixel 9</h1>'),{route:'/phones/pixel-9/',phone:pixel,esc});
  for(const view of ['size','design','specs'])assert(html.includes('?a=pixel-9&amp;b=iphone-16&amp;view='+view));
  assert.equal(page.comparisonUrl(null,'design'),'/phones/size-compare/?view=design');
  const unknown=page.decorateHtml(fixture('<h1>A different phone</h1>'),{route:'/learn/x-phone-unmapped.html',esc});assert(!unknown.includes('?a=pixel-9'));assert(unknown.includes('/phones/size-compare/?view=design'));
 });
 await test('presentation decoration is repeatable without duplicating phone navigation or stylesheet',()=>{
  const first=page.decorateHtml(fixture('<h1>Compare phones</h1>'),{route:'/phones/size-compare/',esc});
  const twice=page.decorateHtml(first,{route:'/phones/size-compare/',esc});assert.equal(first,twice);assert.equal((twice.match(/data-phone-clarity/g)||[]).length,1);assert.equal((twice.match(/phone-clarity\.css/g)||[]).length,1);
 });
 await test('the phone hub exposes a 3D link only when that exact phone has a registered model',()=>{
  const body=['pixel-9','pixel-9-pro'].map(id=>'<article><span>3D model available</span><a class="button secondary" href="/phones/size-compare/?a='+id+'&b=iphone-16&view=size">Compare size</a></article>').join('');
  const html=page.decorateHtml(fixture(body),{route:'/phones/',esc});assert(html.includes('?a=pixel-9&b=iphone-16&view=design'));assert(!html.includes('?a=pixel-9-pro&b=iphone-16&view=design'));assert(!models['pixel-9-pro']);
 });
 await test('view buttons and keyboard arrows work before the specification request completes',()=>{
  const c=client();assert.equal(c.selectors['[data-phone-size-view]'].hidden,false);c.buttons[0].click();assert.equal(c.selectors['[data-phone-design]'].hidden,false);assert.equal(c.buttons[0].attributes['aria-pressed'],'true');assert.equal(c.controls.a.focused,undefined);
  let prevented=false;c.buttons[0].dispatchEvent({type:'keydown',key:'ArrowRight',preventDefault(){prevented=true}});assert(prevented);assert.equal(c.selectors['[data-phone-size-view]'].hidden,false);assert.equal(c.buttons[1].focused,true);
 });
 await test('sharing during loading preserves validated selected phones and the selected view',async()=>{
  const c=client('?a=pixel-9&b=iphone-16-pro&view=design');await c.selectors['[data-phone-share]'].listeners.click[0]();const copied=new URL(c.copied());assert.equal(copied.searchParams.get('a'),'pixel-9');assert.equal(copied.searchParams.get('b'),'iphone-16-pro');assert.equal(copied.searchParams.get('view'),'design');assert.equal(c.selectors['[data-phone-share-status]'].textContent,'Link copied.');
 });
 await test('loaded data produces real same-scale differences and mode selections made during loading survive',async()=>{
  const c=client();c.buttons[0].click();c.resolveFetch({ok:true,json:async()=>({phones})});await settle();assert.equal(c.selectors['[data-phone-design]'].hidden,false);assert.match(c.selectors.output.textContent,/5\.2 mm taller/);assert.match(c.selectors.output.textContent,/28 g heavier/);assert(c.selectors['[data-phone-specs]'].textContent.includes('Google Tensor G4'));assert(c.selectors['[data-phone-specs]'].textContent.includes('Not verified'));
 });
 await test('a specification failure is visible in every view and leaves a working recovery link',async()=>{
  const c=client('?view=design');c.rejectFetch(Error('Synthetic network failure'));await settle();const alert=c.form.children[0];assert.equal(alert.attributes.role,'alert');assert(alert.textContent.includes('Reload this page'));const link=alert.children.find(child=>child.tagName==='a');assert.equal(link.href,'/phones/');assert(!alert.hidden);
 });
 await test('model credits remain exact and point to the complete attribution registry',()=>{
  const controller=fs.readFileSync(path.join(__dirname,'phone-preview-controller.js'),'utf8'),generator=fs.readFileSync(path.join(__dirname,'phone-pages.cjs'),'utf8');assert(controller.includes("model.sourceUrl"));assert(controller.includes("model.licenseUrl"));assert(controller.includes("'/builder/model-credits/#phone-'+model.ids[0]"));assert(generator.includes('id="phone-${esc(m.ids[0])}"'));for(const model of Object.values(models)){assert(model.creator);assert(model.sourceUrl.startsWith('https://sketchfab.com/'));assert(model.license)}
 });
 console.log(passed+' phone clarity tests passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
