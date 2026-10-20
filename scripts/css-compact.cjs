'use strict';
// Conservative whitespace compaction. Strings, escapes, descendant selectors
// and calc() operator spacing remain intact; no declaration rewriting.
module.exports=function compactCSS(input){const out=[];let last='',quote='',space=false;const append=value=>{out.push(value);last=value.at(-1)||last;};for(let i=0;i<input.length;i++){
 const c=input[i];if(quote){append(c);if(c==='\\'&&i+1<input.length)append(input[++i]);else if(c===quote)quote='';continue}
 if(c==='/'&&input[i+1]==='*'){const end=input.indexOf('*/',i+2);if(end<0)throw Error('Unclosed CSS comment');i=end+1;append('/**/');continue}
 if(/\s/.test(c)){space=true;continue}
 if(space&&last&&!/[{};,]/.test(last)&&!/[{};,]/.test(c))append(' ');space=false;
 if(c==='"'||c==="'")quote=c;append(c);
 }if(quote)throw Error('Unclosed CSS string');return out.join('').trim()};
