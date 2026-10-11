'use strict';
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'program-thumbnail-variants.json'),variants=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
function thumbnail(id,asset,root){const value=variants[id];return value?.original===asset?.src&&/^\/assets\/optimized\/thumb-[a-f0-9]{14}-320\.webp$/.test(value.src)&&fs.existsSync(path.join(root,value.src))?value:null}
function source(id,asset,root){return thumbnail(id,asset,root)?.src||asset.src}
function catalogHTML(html,images,root){const replacements=new Map();for(const [id,asset]of Object.entries(images)){const value=thumbnail(id,asset,root);if(value)replacements.set(asset.src,value)}return html.replace(/<img\b[^>]*>/g,tag=>{const src=tag.match(/\bsrc="([^"]+)"/)?.[1],value=replacements.get(src);return value?tag.replace(/\bsrc="[^"]+"/,'src="'+value.src+'"').replace(/\bwidth="\d+"/,'width="'+value.width+'"').replace(/\bheight="\d+"/,'height="'+value.height+'"'):tag})}
module.exports={thumbnail,source,catalogHTML};
