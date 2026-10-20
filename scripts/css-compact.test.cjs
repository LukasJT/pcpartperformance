'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),compact=require('./css-compact.cjs');
// Frozen prior algorithm proves byte parity, including comments, escapes,
// descendant selectors and spaces around calc() operators.
function previous(input){let out='',quote='',space=false;for(let i=0;i<input.length;i++){const c=input[i];if(quote){out+=c;if(c==='\\'&&i+1<input.length)out+=input[++i];else if(c===quote)quote='';continue;}if(c==='/'&&input[i+1]==='*'){const end=input.indexOf('*/',i+2);if(end<0)throw Error('Unclosed CSS comment');i=end+1;out+='/**/';continue;}if(/\s/.test(c)){space=true;continue;}if(space&&out&&!/[{};,]$/.test(out)&&!/[{};,]/.test(c))out+=' ';space=false;if(c==='"'||c==="'")quote=c;out+=c;}if(quote)throw Error('Unclosed CSS string');return out.trim();}
test('linear compaction is byte-identical on current shared, builder, homepage and studio CSS',()=>{
 for(const name of ['clean-studio.css','evolution-system.css','evolution-builder.css','ui-system.css','oct16-home.css']){const source=fs.readFileSync('scripts/'+name,'utf8');assert.equal(compact(source),previous(source),name);}
});
test('quoted text, escapes, comments and descendant spaces retain their exact earlier behavior',()=>{
 for(const source of ['  .a .b { width: calc(100% - 2px); } ','.a { content: "a; b \\\" c"; }','.a /* comment */ .b { color : red ; }','@media (max-width: 600px) { .a > .b { display: grid } }'])assert.equal(compact(source),previous(source));
 assert.throws(()=>compact('/* unfinished'),/Unclosed CSS comment/);assert.throws(()=>compact('.a{content:"unfinished}'),/Unclosed CSS string/);
});
