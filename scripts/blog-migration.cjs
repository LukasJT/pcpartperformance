const fs=require('fs'),path=require('path');
const map={'/learn/':'/blog/','/learn/gpu/':'/blog/how-to-choose-a-graphics-card/','/learn/cpu/':'/blog/how-to-choose-a-processor/','/learn/ram/':'/blog/understanding-pc-memory/','/learn/ssd/':'/blog/choosing-an-ssd/'};
for(const a of [...require('./feature-articles.cjs'),...require('./blog-additions.cjs')])map['/learn/'+a.slug+'/']='/blog/'+a.slug+'/';
exports.destination=route=>map[route]||route;
exports.redirects=root=>{
 const file=path.join(root,'_redirects');let previous=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';previous=previous.replace(/# Blog migration start[\s\S]*?# Blog migration end\n?/,'');
 const rules=[];for(const [from,to]of Object.entries(map)){rules.push(`${from} ${to} 301`,`${from.slice(0,-1)} ${to} 301`,`${from}index.html ${to} 301`);const dir=path.join(root,from);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en" data-legacy-redirect><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guide moved · PC Part Performance</title><link rel="canonical" href="https://www.pcpartperformance.com${to}"><meta http-equiv="refresh" content="0;url=${to}"></head><body><p>This guide is now in our Blog. <a href="${to}">Continue reading</a>.</p></body></html>`)}
 fs.writeFileSync(file,previous+'# Blog migration start\n'+rules.join('\n')+'\n# Blog migration end\n');
};
