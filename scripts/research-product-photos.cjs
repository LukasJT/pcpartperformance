// Collect public manufacturer media for an exact product URL. Never turn a
// category page, shared CPU pack shot or unrelated card into an exact photo.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const vm=require('node:vm'),context={window:{},document:{querySelector(){}}};vm.createContext(context);for(const file of ['data','history-data','universe-data','component-data','core','retail-data'])vm.runInContext(fs.readFileSync('dist/'+file+'.js','utf8'),context);const rows=vm.runInContext('catalog',context);
const dir=path.resolve('../work/product-photos');fs.mkdirSync(dir,{recursive:true});
const clean=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const candidates=[];
const get=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('HTTP '+r.status);return r;};
async function collect(p){
 try{
  if(p.cat==='board'&&/msi\.com\/Motherboard\//i.test(p.source)){
   const slug=new URL(p.source).pathname.split('/')[2],url='https://storage-asset.msi.com/datasheet/mb/global/'+slug+'.pdf';
   const r=await get(url),file=path.join(dir,p.id+'.pdf');fs.writeFileSync(file,Buffer.from(await r.arrayBuffer()));candidates.push({id:p.id,name:p.name,brand:p.brand,sourceUrl:p.source,imageUrl:url,pdf:file});return;
  }
  if(!['cpu','gpu','board'].includes(p.cat)||!/amd\.com|rog\.asus\.com|asrock\.com|gigabyte\.com/.test(p.source))return;
  if(/all-series|\/products\/(cpu|graphics-cards)\/?$/.test(new URL(p.source).pathname))return;
  let r=await get(p.source),html=await r.text();if(!html.toLowerCase().includes(p.name.toLowerCase().replace(/^ASRock |^ASUS |^AMD |^GIGABYTE /i,''))&&!/amd\.com/.test(p.source))return;
  fs.writeFileSync(path.join(dir,p.id+'.html'),html);
  const urls=[...new Set([...html.matchAll(/(?:https?:)?\/\/[^"'<>\s]+?\.(?:png|jpe?g|webp)(?:\?[^"'<>\s]*)?|(?:\/|\.\.\/)?(?:content\/dam|images\/product|image\/product)[^"'<>\s]+?\.(?:png|jpe?g|webp)/gi)].map(m=>new URL(m[0].replaceAll('&amp;','&'),r.url).href))];
  let picked;
  if(/amd\.com/.test(p.source)){
   const token=clean(p.name.replace(/Ryzen \d |Radeon |AMD /gi,''));
   picked=urls.find(x=>/\/products\//.test(x)&&clean(path.basename(new URL(x).pathname)).includes(token));
  } else if(/rog\.asus/.test(p.source))picked=urls.find(x=>/\/kv\/pd\.(png|webp)/.test(x))||urls.find(x=>/\/P_setting_/i.test(x));
  else if(/asrock/.test(p.source))picked=urls.find(x=>/\/product\//i.test(x)&&clean(x).includes(clean(p.name.replace(/^ASRock /i,'')))&&!/banner|bg|logo|feature/i.test(x));
  else picked=urls.find(x=>/Product\/\d+\/\d+\/.*(?:png|jpg)/i.test(x));
  if(picked){const response=await get(picked),ext=/png/.test(response.headers.get('content-type'))?'.png':'.jpg',file=path.join(dir,p.id+ext);fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));candidates.push({id:p.id,name:p.name,brand:p.brand,sourceUrl:p.source,imageUrl:picked,file});}
 }catch(e){console.log(p.id,e.message)}
}
(async()=>{const targets=rows.filter(p=>['cpu','gpu','board'].includes(p.cat));for(let i=0;i<targets.length;i+=4)await Promise.allSettled(targets.slice(i,i+4).map(collect));fs.writeFileSync(path.join(dir,'candidates.json'),JSON.stringify(candidates,null,2));console.log('Collected '+candidates.length+' product-specific candidates for visual review.');})();
