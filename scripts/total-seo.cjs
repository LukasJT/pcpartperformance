'use strict';
// Intent-led wording for existing destinations. No new indexable routes, ranking
// claims, date refreshing, ratings, offers or benchmark records are created.
const INTENTS=Object.freeze({
 '/performance/':{title:'Game FPS & Console Performance: Benchmark Evidence',description:'Choose a game and platform, check available PC benchmark evidence and compare documented console graphics modes. Missing results stay clearly identified.',intent:'Find game-performance evidence for a chosen setup, not a promised FPS prediction.'},
 '/phones/size-compare/':{title:'Phone Size Comparison: Height, Width & 3D Models',description:'Compare phone height, width, thickness and weight at the same scale. Rotate available 3D models and inspect the manufacturer dimensions.',intent:'Compare how phones differ in physical size, with clearly scoped optional 3D appearance.'},
 '/tools/monitor-pixel-density/':{title:'Monitor PPI Calculator: Screen Size, Width & Height',description:'Calculate monitor pixels per inch, width and height from resolution and diagonal size. Compare the physical dimensions of rectangular displays.',intent:'Calculate screen pixel density and physical rectangular dimensions.'},
 '/blog/':{title:'PC Building Guides, Compatibility & Upgrade Advice',description:'Learn how to choose PC parts, check fit and BIOS support, plan upgrades and troubleshoot a build. Browse source-linked guides and practical tools.',intent:'Browse practical PC-building and upgrade education rather than a generic AI-news archive.'},
 '/prebuilts/':{title:'Compare Prebuilt Gaming PCs in Canada & the US',description:'Compare researched prebuilt PC configurations, regional buying links and upgradeability checks. Use the build-versus-buy worksheet to compare complete quotes.',intent:'Investigate actual regional configurations and complete purchase costs, without an unsupported best-PC ranking.'}
});
const CORRECTION=Object.freeze({route:'/blog/how-to-choose-a-graphics-card/',before:'Our FPS tool is a model estimate; use it to explore a setup, then confirm your shortlist against published testing.',after:'<a href="/performance/">Game FPS</a> shows available benchmark evidence and source-linked console modes. If no matching benchmark is documented, it does not provide measured FPS for that setup.',reason:'The normal tool now reports benchmark evidence. Its old model-estimate description no longer describes the current workflow.'});
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match=>[match[1].toLowerCase(),match[2]??match[3]]));
function updateContent(tag,value){return /\bcontent\s*=/.test(tag)?tag.replace(/\bcontent\s*=\s*(?:"[^"]*"|'[^']*')/i,()=> 'content="'+esc(value)+'"'):tag.replace(/>$/,()=> ' content="'+esc(value)+'">');}
function polish(html,route){
 const intent=INTENTS[route];
 if(intent){
  html=html.replace(/<title>[\s\S]*?<\/title>/i,()=> '<title>'+esc(intent.title)+'</title>');
  html=html.replace(/<meta\b[^>]*>/gi,tag=>{const a=attrs(tag),key=a.name||a.property;if(['description','og:description','twitter:description'].includes(key))return updateContent(tag,intent.description);if(['og:title','twitter:title'].includes(key))return updateContent(tag,intent.title);return tag;});
  // Preserve existing schema types/claims; align only a matching WebPage's text.
  html=html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,(block,open,raw,close)=>{try{const data=JSON.parse(raw),walk=value=>{if(!value||typeof value!=='object')return;if([].concat(value['@type']||[]).includes('WebPage')&&value.url==='https://www.pcpartperformance.com'+route){value.name=intent.title;value.description=intent.description;}for(const child of Object.values(value))if(Array.isArray(child))child.forEach(walk);else if(child&&typeof child==='object')walk(child);};walk(data);return open+JSON.stringify(data).replace(/</g,'\\u003c')+close;}catch{return block;}});
 }
 if(route===CORRECTION.route)html=html.replace(CORRECTION.before,CORRECTION.after);
 if(route==='/tools/monitor-pixel-density/'&&!html.includes('data-total-seo-links'))html=html.replace('<p><a href="/tools/">All planning tools</a>','<p data-total-seo-links><a href="/performance/">Check game performance</a> · <a href="/tools/">All planning tools</a>');
 return html;
}
module.exports={INTENTS,CORRECTION,polish,attrs,esc};
