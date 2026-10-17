const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/builder-catalog.js'),'utf8'),ctx);
const records=ctx.window.PCP_BUILDER_CATALOG.filter(p=>['case','fan','cooler'].includes(p.cat));
const urls={};
const set=(id,url)=>urls[id]=url;
for(const p of records){
 let u=p.source;
 if(p.brand==='Noctua')u=u.replace('/specifications','');
 if(p.id.startsWith('x-case-lian-li-'))u='https://lian-li.com/product/'+p.id.replace('x-case-lian-li-','').replace('pc-o11-dynamic','pc-o11-dynamic').replace('dan-cases-a3','a3-matx')+'/';
 if(p.id.startsWith('c-case-phanteks-'))u='https://phanteks.com/product/'+p.id.replace('c-case-phanteks-','')+'/';
 if(p.id.startsWith('x-case-nzxt-'))u='https://nzxt.com/products/'+p.id.replace('x-case-nzxt-','');
 if(p.id.startsWith('c-case-cooler-master-'))u='https://www.coolermaster.com/en-global/products/'+p.id.replace('c-case-cooler-master-','').replace('cosmos-c700m','cosmos-c700m')+'/';
 set(p.id,u);
}
const fractal={ 'define-r5':'define/define-r5/black','define-7':'define/define-7/black-tg-dark-tint','meshify-c':'meshify/meshify-c/black','meshify-2':'meshify/meshify-2/black-tg-dark-tint','north':'north/north/charcoal-black-tg-dark','north-xl':'north/north-xl/charcoal-black-tg-dark','torrent':'torrent/torrent/black-tg-dark-tint','torrent-compact':'torrent/torrent-compact/black-tg-dark-tint','terra':'terra/terra/jade','ridge':'ridge/ridge/black','mood':'mood/mood/dark-gray'};
for(const [id,p] of Object.entries(fractal))set('x-case-fractal-design-'+id,'https://www.fractal-design.com/products/cases/'+p+'/');
const corsair={ 'obsidian-900d':['cc-9011022-ww','obsidian-series-900d-super-tower-case-cc-9011022-ww'],'obsidian-1000d':['cc-9011148-ww','obsidian-series-1000d-super-tower-case-cc-9011148-ww'],'4000d-airflow':['cc-9011200-ww','4000d-airflow-tempered-glass-mid-tower-atx-case-black-cc-9011200-ww'],'5000d-airflow':['cc-9011210-ww','5000d-airflow-tempered-glass-mid-tower-atx-pc-case-black-cc-9011210-ww'],'7000d-airflow':['cc-9011218-ww','7000d-airflow-full-tower-atx-pc-case-black-cc-9011218-ww'],'2500d-airflow':['cc-9011263-ww','2500d-airflow-mid-tower-dual-chamber-pc-case-black-cc-9011263-ww'],'3500x':['cc-9011276-ww','3500x-mid-tower-pc-case-black-cc-9011276-ww'],'6500x':['cc-9011257-ww','6500x-mid-tower-dual-chamber-pc-case-black-cc-9011257-ww'],'frame-4000d':['cc-9011290-ww','frame-4000d-modular-mid-tower-pc-case-black-cc-9011290-ww']};
for(const [id,[sku,slug]]of Object.entries(corsair))set('x-case-corsair-'+id,'https://www.corsair.com/us/en/p/pc-cases/'+sku+'/'+slug);
set('c-case-be-quiet-dark-base-pro-901','https://www.bequiet.com/en/case/4425');
set('c-case-be-quiet-dark-base-701','https://www.bequiet.com/en/case/4589');
set('c-case-be-quiet-pure-base-500dx','https://www.bequiet.com/en/case/1854');
set('retail-thermaltake-core-p5','https://thermaltakeusa.com/products/core-p5');
set('retail-nzxt-h500','https://nzxt.com/products/h500');
set('retail-arctic-p14-pro-pst','https://www.arctic.de/en/P14-Pro-PST/ACFAN00315A');
set('retail-arctic-p12-pro-pst','https://www.arctic.de/en/P12-Pro-PST/ACFAN00305A');
const extraFile=path.join(__dirname,'case-cooling-extra-urls.json');if(fs.existsSync(extraFile))Object.assign(urls,JSON.parse(fs.readFileSync(extraFile)));
const target=path.join(__dirname,'case-cooling-pages.json');
const previous=fs.existsSync(target)?JSON.parse(fs.readFileSync(target)):{};
const htmlDir=path.join(__dirname,'case-cooling-pages');fs.mkdirSync(htmlDir,{recursive:true});
async function run(p){
 if(process.argv.includes('--resume')&&previous[p.id])return;
 const url=urls[p.id];let item={id:p.id,catalogName:p.name,cat:p.cat,url,attemptedAt:new Date().toISOString()};
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'Mozilla/5.0'}});item.status=r.status;item.finalUrl=r.url;const t=await r.text();fs.writeFileSync(path.join(htmlDir,p.id+'.html'),t);
  item.title=(t.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1];
  item.meta=[...t.matchAll(/<meta\s[^>]*>/gi)].map(m=>m[0]).filter(s=>/(?:og:image|og:title|twitter:image)/i.test(s));
  item.images=[...new Set([...t.matchAll(/(?:https?:)?(?:\\\/|\/)[^\s<>"']+?\.(?:png|jpe?g|webp)(?:\?[^\s<>"']*)?/gi)].map(m=>m[0].replace(/\\\//g,'/').replace(/&amp;/g,'&')))];
 }catch(e){item.error=e.message;}
 previous[p.id]=item;fs.writeFileSync(target,JSON.stringify(previous,null,2));console.log(p.id,item.status||item.error,item.title?.slice(0,90));
}
(async()=>{let todo=records.filter(p=>!process.argv.includes('--only')||process.argv.includes(p.id));for(let i=0;i<todo.length;i+=6)await Promise.all(todo.slice(i,i+6).map(run));})();
