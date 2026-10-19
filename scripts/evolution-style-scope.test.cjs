'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const app=require('./evolution-style-scope.cjs');
test('page families retain their own nested states without shipping unrelated destination layouts',()=>{
 const source='@media(max-width:600px){.lab-home-hero:hover{color:red}.fps-controls:focus-within{color:blue}}.lab-workspace-detail[open]{display:block}';
 assert.equal(app.scopeCSS(source,['home']),'@media(max-width:600px){.lab-home-hero:hover{color:red}}');
 assert.equal(app.scopeCSS(source,['performance']),'@media(max-width:600px){.fps-controls:focus-within{color:blue}}');
 assert.equal(app.scopeCSS(source,['workspace']),'.lab-workspace-detail[open]{display:block}');
});
test('selector lists respect functional pseudo-classes, attributes and quoted commas',()=>{assert.deepEqual(app.splitSelectors('.lab-home-hero:is(a,b), [data-lab-article] a[href="a,b"]'),['.lab-home-hero:is(a,b)','[data-lab-article] a[href="a,b"]']);assert.throws(()=>app.scopeCSS('.lab-home-hero{color:red',['home']),/Unbalanced/);});
test('all built destination families preserve their actual responsive typography, images and reading styles',()=>{
 const css=fs.readFileSync('scripts/evolution-destinations.css','utf8');
 for(const [route,needle]of [['/','.tech-vs'],['/my-pc/','.workspace-section'],['/learn/rtx5070.html','.part-hero'],['/performance/','.fps-controls'],['/blog/a-guide/','[data-lab-article]'],['/tools/ram-latency/','.lab-tool-hero']])assert(app.scopeCSS(css,app.families(route)).includes(needle),route);
 const home=app.scopeCSS(css,app.families('/'));assert(home.includes('.ui-status-list'));assert(!home.includes('.fps-controls')&&!home.includes('.workspace-section'));
});
