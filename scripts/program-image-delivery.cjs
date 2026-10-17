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
function catalogEntry(part,asset,root){return{src:source(part.id,asset,root),...(asset.kind!=='exact'?{picturedModel:asset.picturedModel}:{})};}
// Share directory prefixes on the wire. The public object has the same shape, so
// filtering, navigation and image alternatives keep working without extra requests.
function catalogScript(entries){
 const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
 const directories=[...new Set(Object.values(entries).map(image=>image.src.slice(0,image.src.lastIndexOf('/')+1)))];
 const rows=Object.entries(entries).map(([id,image])=>{
  const directory=directories.indexOf(image.src.slice(0,image.src.lastIndexOf('/')+1)),file=image.src.slice(image.src.lastIndexOf('/')+1),named=file.startsWith(id);
  return[id,named?directory:-directory-1,named?file.slice(id.length):file,...(image.picturedModel?[image.picturedModel]:[])];
 });
 return 'window.PCP_IMAGES=Object.fromEntries('+json(rows)+'.map(([id,p,file,picturedModel])=>[id,{src:'+json(directories)+'[p<0?-p-1:p]+(p<0?"":id)+file,...(picturedModel?{picturedModel}:{})}]));';
}
function comparisonEntry(id,asset,root){return Object.fromEntries(['src','picturedModel','sourceUrl','kind','attribution','license','licenseUrl'].filter(key=>asset[key]!==undefined).map(key=>[key,asset[key]]).concat([['thumbnailSrc',source(id,asset,root)]]));}
function catalogHTML(html,images,root){const replacements=new Map();for(const [id,asset]of Object.entries(images)){const value=thumbnail(id,asset,root);if(value)replacements.set(asset.src,value)}return html.replace(/<img\b[^>]*>/g,tag=>{const src=tag.match(/\bsrc="([^"]+)"/)?.[1],value=replacements.get(src);return value?tag.replace(/\bsrc="[^"]+"/,'src="'+value.src+'"').replace(/\bwidth="\d+"/,'width="'+value.width+'"').replace(/\bheight="\d+"/,'height="'+value.height+'"'):tag})}
module.exports={thumbnail,source,catalogHTML,catalogEntry,catalogScript,comparisonEntry};
