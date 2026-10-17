'use strict';
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'program-thumbnail-variants.json'),variants=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
function thumbnail(id,asset,root){
 if(/^\/assets\/hardware\/(?:catalog-[a-z0-9-]+|repaired)\/[a-zA-Z0-9._-]+\.webp$/.test(asset?.thumbnailSrc||'')&&fs.existsSync(path.join(root,asset.thumbnailSrc))){
  const scale=Math.min(1,320/Math.max(asset.width||320,asset.height||320));
  return{src:asset.thumbnailSrc,width:Math.round((asset.width||320)*scale),height:Math.round((asset.height||320)*scale),original:asset.src};
 }
 const value=variants[id];return value?.original===asset?.src&&/^\/assets\/optimized\/thumb-[a-f0-9]{14}-320\.webp$/.test(value.src)&&fs.existsSync(path.join(root,value.src))?value:null;
}
function source(id,asset,root){return thumbnail(id,asset,root)?.src||asset.src}
function catalogEntry(part,asset,root){return{src:source(part.id,asset,root),...(part.cat==='gpu'||asset.kind!=='exact'?{picturedModel:asset.picturedModel}:{})};}
function comparisonEntry(id,asset,root){return Object.fromEntries(['src','picturedModel','sourceUrl','kind','attribution','license','licenseUrl'].filter(key=>asset[key]!==undefined).map(key=>[key,asset[key]]).concat([['thumbnailSrc',source(id,asset,root)]]));}
function catalogHTML(html,images,root){const replacements=new Map();for(const [id,asset]of Object.entries(images)){const value=thumbnail(id,asset,root);if(value)replacements.set(asset.src,value)}return html.replace(/<img\b[^>]*>/g,tag=>{const src=tag.match(/\bsrc="([^"]+)"/)?.[1],value=replacements.get(src);return value?tag.replace(/\bsrc="[^"]+"/,'src="'+value.src+'"').replace(/\bwidth="\d+"/,'width="'+value.width+'"').replace(/\bheight="\d+"/,'height="'+value.height+'"'):tag})}
module.exports={thumbnail,source,catalogHTML,catalogEntry,comparisonEntry};
