'use strict';
// Conservative whitespace compaction. Strings, escapes, descendant selectors
// and calc() operator spacing remain intact; no declaration rewriting.
module.exports=function compactCSS(input){let out='',quote='',space=false;for(let i=0;i<input.length;i++){
 const c=input[i];if(quote){out+=c;if(c==='\\'&&i+1<input.length)out+=input[++i];else if(c===quote)quote='';continue}
 if(c==='/'&&input[i+1]==='*'){const end=input.indexOf('*/',i+2);if(end<0)throw Error('Unclosed CSS comment');i=end+1;out+='/**/';continue}
 if(/\s/.test(c)){space=true;continue}
 if(space&&out&&!/[{};,]$/.test(out)&&!/[{};,]/.test(c))out+=' ';space=false;
 if(c==='"'||c==="'")quote=c;out+=c;
 }if(quote)throw Error('Unclosed CSS string');return out.trim()};
