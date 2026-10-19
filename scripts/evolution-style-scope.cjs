'use strict';
/* Scope only the new, owned destination stylesheet. No catalog-driven purge of
 * legacy selectors or dynamically generated application states is performed. */
const groups={home:/lab-(?:home|hero|studio|flow|readiness)|ui-readiness|ui-status|tech-/,upgrade:/lab-upgrade|program-panel|md-path|md-keep/,workspace:/workspace|my-pc/,school:/lab-school|lab-lesson|lab-diagram-link/,catalog:/lab-catalog|catalog-|growth-catalog/,product:/part-|product-program|buy-/,shop:/shop-/,compare:/product-card|comparison-|metric-/,performance:/fps-|lab-performance|clarity-performance/,search:/growth-site-search|growth-search/,guides:/guide-|lab-guide/,article:/data-lab-article|lab-article|lab-contents|lab-reading|master-contents|clarity-article/,publisher:/evolution-publisher/,tools:/lab-tool/,devices:/lab-device/};
function families(route){if(route==='/')return['home'];if(route==='/upgrade/')return['upgrade'];if(route==='/my-pc/')return['workspace'];if(route.startsWith('/build-school/'))return['school'];if(route.startsWith('/hardware/'))return['catalog'];if(route.startsWith('/learn/'))return['product'];if(route==='/shop/')return['shop'];if(route.startsWith('/compare/'))return['compare'];if(route.startsWith('/performance/'))return['performance'];if(route==='/search/')return['search'];if(route==='/blog/')return['guides'];if(/^\/(?:blog|news)\/[^/]+\/$/.test(route))return['article'];if(route==='/resources/publisher-readiness/')return['publisher'];if(route.startsWith('/tools/'))return['tools'];if(route==='/prebuilts/'||route==='/laptops/')return['devices'];return[];}
function splitSelectors(value){const result=[];let depth=0,quote='',start=0;for(let i=0;i<value.length;i++){const c=value[i];if(quote){if(c==='\\')i++;else if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;else if(c===','&&depth===0){result.push(value.slice(start,i).trim());start=i+1;}}result.push(value.slice(start).trim());return result;}
function scopeCSS(input,selected){const css=input.replace(/\/\*[\s\S]*?\*\//g,''),active=selected.map(key=>groups[key]);let out='',i=0;
 while(i<css.length){const open=css.indexOf('{',i);if(open===-1)break;const header=css.slice(i,open).trim();let depth=1,quote='',end=open+1;for(;end<css.length&&depth;end++){const c=css[end];if(quote){if(c==='\\')end++;else if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='{')depth++;else if(c==='}')depth--;}
  if(depth)throw Error('Unbalanced destination stylesheet');const body=css.slice(open+1,end-1);
  if(/^@(?:media|supports|container|layer)\b/.test(header)){const nested=scopeCSS(body,selected);if(nested)out+=header+'{'+nested+'}';}
  else if(/^@(?:-webkit-)?keyframes\b/.test(header)){if(selected.length)out+=header+'{'+body+'}';}
  else{const kept=splitSelectors(header).filter(selector=>active.some(pattern=>pattern.test(selector)));if(kept.length)out+=kept.join(',')+'{'+body+'}';}
  i=end;
 }
 return out;
}
module.exports={groups,families,splitSelectors,scopeCSS};
