'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),app=require('./total-display.js'),page=require('./total-display.cjs');
test('monitor has true active-area aspect ratio and matching physical dimensions',()=>{
 for(const v of [{x:2560,y:1440,diagonal:27},{x:3440,y:1440,diagonal:34},{x:1080,y:1920,diagonal:24}]){const p=app.layout(v);assert(Math.abs(p.w/p.h-v.x/v.y)<1e-8);assert(Math.abs(Math.hypot(p.width,p.height)-v.diagonal)<1e-8);assert(p.x>=90&&p.y>=60&&p.x+p.w<=550&&p.y+p.h<=300);assert.equal(p.ppi,Math.hypot(v.x,v.y)/v.diagonal);assert(app.illustration(v).includes('Stand and bezel are illustrative.'));}
});
test('empty, invalid and nonfinite measurements never produce a geometry',()=>{for(const v of [{x:'',y:1080,diagonal:24},{x:1920,y:0,diagonal:24},{x:1920,y:1080,diagonal:Infinity},{x:1920,y:1080,diagonal:-4}])assert.throws(()=>app.layout(v));});
test('visual replacement preserves native form constraints, formula fallback and excludes the repeated generic picture',()=>{
 const input='<head></head><form class="planning-form" data-planning="display"><h2>Enter your inputs</h2><input name="diagonal" required><button class="button primary" type="submit">Calculate</button><output aria-live="polite">Enter your inputs, then calculate.</output><noscript>Formula below</noscript></form><img class="publication-hero" src="/assets/publication/monitor-pixel-density.png"><h2>Method and limits</h2>';
 const result=page.polish(input,'/tools/monitor-pixel-density/');assert(!result.includes('data-planning="display"'));assert(result.includes('name="diagonal" required'));assert(result.includes('Formula below'));assert(result.includes('Method and limits'));assert(!result.includes('monitor-pixel-density.png'));assert.equal((result.match(/data-display-preset=/g)||[]).length,4);assert.equal(page.polish(result,'/tools/monitor-pixel-density/'),result);assert.equal(page.polish(input,'/tools/other/'),input);
});
