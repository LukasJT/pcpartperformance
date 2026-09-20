const fs=require('fs'),path=require('path');
const root=path.resolve('dist'),html=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html')&&!full.includes(path.join('dist','ads')))html.push(full);}}
walk(root);
const errors=[],seenTitles=new Map();
for(const file of html){const body=fs.readFileSync(file,'utf8'),rel=path.relative(root,file).replaceAll('\\','/');
 const title=body.match(/<title>([^<]+)<\/title>/)?.[1],canonical=body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 if(!title)errors.push(`${rel}: missing title`);else if(seenTitles.has(title)&&rel!=='404.html')errors.push(`${rel}: duplicate title with ${seenTitles.get(title)}`);else seenTitles.set(title,rel);
 if(!canonical)errors.push(`${rel}: missing canonical`);
 if((body.match(/<h1\b/g)||[]).length!==1)errors.push(`${rel}: expected one h1`);
 for(const match of body.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){let target=match[1];if(target==='/'||target.endsWith('/'))target+=target==='/'?'index.html':'index.html';const full=path.join(root,target.replace(/^\//,''));if(!fs.existsSync(full))errors.push(`${rel}: missing link ${match[1]}`);}
}
for(const required of ['robots.txt','sitemap.xml','ads.js','ads.css','privacy/index.html'])if(!fs.existsSync(path.join(root,required)))errors.push(`missing ${required}`);
if(errors.length){console.error(errors.slice(0,100).join('\n'));process.exit(1)}
console.log(`Validated ${html.length} HTML pages with unique titles, canonicals, one H1, and local link targets.`);
