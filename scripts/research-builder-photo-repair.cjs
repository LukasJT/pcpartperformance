'use strict';
// Bounded, manual research intake. Downloads no catalog-wide guesses or user URLs.
const fs=require('node:fs'),path=require('node:path');
const pages={msi3060:'https://www.msi.com/Graphics-Card/GeForce-RTX-3060-GAMING-X-TRIO-12G',u12a:'https://www.noctua.at/en/products/nh-u12a',airmini:'https://lian-li.com/product/o11-air-mini/',tlwireless:'https://lian-li.com/product/uni-fan-tl-wireless/'};
const directory=path.resolve('tmp/component-photo-pages');fs.mkdirSync(directory,{recursive:true});
async function main(){
 const results=await Promise.allSettled(Object.entries(pages).map(async([id,url])=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(id+': '+response.status);
  const html=await response.text();fs.writeFileSync(path.join(directory,id+'.html'),html);
  const images=[...new Set([...html.matchAll(/(?:https?:)?\/\/[^"'<>\s]+?\.(?:webp|png|jpe?g)(?:\?[^"'<>\s]*)?/gi)].map(m=>m[0].replace(/&amp;/g,'&')))];
  return{id,url,images:images.filter(x=>id==='msi3060'?/product.*\/(?:picture|vga)|VGA.*(?:product|3D)|3060/i.test(x):id==='u12a'?/u12a|u12_a|u12-a/i.test(x):id==='airmini'?/air.?mini/i.test(x):/wireless|TL_.*120|TL-W/i.test(x)).slice(0,30)};
 }));console.log(JSON.stringify(results,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
