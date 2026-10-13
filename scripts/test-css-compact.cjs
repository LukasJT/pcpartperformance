'use strict';const assert=require('node:assert/strict'),compact=require('./css-compact.cjs');
const cases=[
 ['.a { margin: 0  10px; }','.a{margin: 0 10px;}'],
 ['a :hover { color: red; }','a :hover{color: red;}'],
 ['.a { width: calc(100% - 24px); }','.a{width: calc(100% - 24px);}'],
 ['.a { content: "a ; /* keep */ : b"; }','.a{content: "a ; /* keep */ : b";}'],
 ['.a { background:url("data:image/svg+xml; x  y"); }','.a{background:url("data:image/svg+xml; x  y");}'],
 ['.a{--x: one /* comment */ two; --y: "a\\\" b";}','.a{--x: one/**/ two;--y: "a\\\" b";}'],
 ['.a/**/.b{color:red}','.a/**/.b{color:red}'],
 ['a /* keep separation */ :hover {color:red}','a/**/ :hover{color:red}'],
 ['.a{font-family:Hel/**/vetica}','.a{font-family:Hel/**/vetica}'],
 ['@media (max-width: 600px) { .a,.b {padding: 1px} }','@media (max-width: 600px){.a,.b{padding: 1px}}']
];for(const [input,expected]of cases)assert.equal(compact(input),expected);assert.throws(()=>compact('a{/*oops'));assert.throws(()=>compact('a{content:"oops}'));console.log('12 CSS string, selector, comment boundary, calc, custom-property and invalid-input checks passed.');
