'use strict';
const fs=require('node:fs'),path=require('node:path'),identity=require('./identity-review-oct19.cjs');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const retained=part=>part.identityStatus==='needs-exact-identity';
function builderCatalog(records){return records.filter(p=>(p.builderEligible!==false||retained(p))&&['cpu','board','gpu','ram','ssd','hdd','psu','case','fan','cooler'].includes(p.cat)).map(({identityReview,...part})=>require('./completion-catalog-delivery.cjs').builderPart(part));}
function prepare({root,records}){
 const refs=identity.restorationReferences(records).map(({note,...part})=>part);
 const json=JSON.stringify(refs).replace(/</g,'\\u003c');
 fs.writeFileSync(path.join(root,'identity-review-catalog.js'),'/* Saved references only; not exact product choices. */\nwindow.PCP_IDENTITY_REFERENCES='+json+';if(typeof catalog!=="undefined"){for(const ref of window.PCP_IDENTITY_REFERENCES){const part=catalog.find(p=>p.id===ref.id);if(part)Object.assign(part,ref,{fields:{},evidence:{fields:{}},physical:null});}}\n');
 return {references:refs.length};
}
function removeProductSchemas(html){return html.replace(/<script\b([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi,(all,attributes,raw)=>{
 try{const data=JSON.parse(raw),product=node=>node&&[].concat(node['@type']||[]).includes('Product');if(product(data))return '';if(Array.isArray(data)){const rest=data.filter(node=>!product(node));return rest.length?'<script'+attributes+'>'+JSON.stringify(rest).replace(/</g,'\\u003c')+'</script>':'';}if(data['@graph']){data['@graph']=data['@graph'].filter(node=>!product(node));return '<script'+attributes+'>'+JSON.stringify(data).replace(/</g,'\\u003c')+'</script>';}return all;}catch{return all;}
 });}
function finalizeSEO({root,records}){
 const refs=records.filter(retained),urls=new Set(refs.map(p=>'/learn/'+p.id+'.html'));
 for(const part of refs){const file=path.join(root,'learn',part.id+'.html');if(!fs.existsSync(file))throw Error('Missing retained identity URL '+part.id);let html=fs.readFileSync(file,'utf8');
  html=removeProductSchemas(html).replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi,'');html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
  if(!html.includes('data-identity-warning'))html=html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/,'$1<section role="note" data-identity-warning><h2>Exact identity needs review</h2><p>'+esc(part.identityWarning)+'</p><p>This saved reference is retained for recovery. It is excluded from new selections until the exact manufacturer part number and specifications are established.</p></section>');
  fs.writeFileSync(file,html);
 }
 for(const name of fs.readdirSync(root).filter(name=>/sitemap.*\.xml$/i.test(name))){const file=path.join(root,name),xml=fs.readFileSync(file,'utf8');fs.writeFileSync(file,xml.replace(/<url\b[^>]*>[\s\S]*?<\/url>/g,block=>{const loc=block.match(/<loc>(.*?)<\/loc>/)?.[1];try{return urls.has(new URL(loc).pathname)?'':block;}catch{return block;}}));}
 for(const relative of ['search-index.json','data/search-index.json']){const file=path.join(root,relative);if(fs.existsSync(file)){const rows=JSON.parse(fs.readFileSync(file,'utf8'));if(Array.isArray(rows))fs.writeFileSync(file,JSON.stringify(rows.filter(row=>{try{return !urls.has(new URL(row.url,'https://www.pcpartperformance.com').pathname);}catch{return true;}})));}}
 return {retained:refs.length,noindex:refs.length,newSelectionEligible:0};
}
module.exports={builderCatalog,prepare,finalizeSEO,removeProductSchemas};
