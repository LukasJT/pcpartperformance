// Public creative-commons redistributions only. No Sketchfab session, token, or viewer extraction.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),work=path.join(root,'tmp/model-batch-2026-10-11');
const reportPath=path.join(root,'docs/program-2026-10-11/models/public-distribution-research.json');
const paths=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(work,'object-paths.json.gz'))));
const installed=[...require('./sketchfab-models.json'),...Object.values(require('./phone-models.json'))];
const installedUids=new Set(installed.map(m=>(m.sourceUrl||m.url||'').match(/([a-f0-9]{32})(?:\?|$)/)?.[1]).filter(Boolean));
const queries=['iPhone 13 Pro','Samsung Galaxy S22','Samsung Galaxy S20 Ultra','Samsung Galaxy S21 FE','iPhone 11','iPhone 6','iPhone 8','iPhone 12 mini','iPhone XR','iPhone XS Max','Samsung Galaxy S10','Samsung Galaxy Note 20','Samsung Galaxy S8','Google Pixel 2','Google Pixel 3','OnePlus 6','OnePlus 8','MSI GTX 1080','ASUS GTX 1080','AMD Ryzen 5900X','AMD Ryzen 5950X','MSI Z370','Samsung 970 PRO','Corsair RM750','NZXT H510','Fractal Define R6'];
const report=fs.existsSync(reportPath)?JSON.parse(fs.readFileSync(reportPath)):{checkedAt:new Date().toISOString(),dataset:'https://huggingface.co/datasets/allenai/objaverse',datasetLicense:'ODC-By v1.0 for the database. Each object retains its own Creative Commons license. Only individually verified CC BY assets are candidates here.',searches:{},downloads:{}};
const fetchJson=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('HTTP '+r.status+' '+url);return r.json();};
const summary=m=>({uid:m.uid,name:m.name,description:m.description,creator:m.user?.displayName,creatorUrl:m.user?.profileUrl,sourceUrl:m.viewerUrl||'https://sketchfab.com/3d-models/'+m.uid,license:m.license,publishedAt:m.publishedAt,objaversePath:paths[m.uid]||null,alreadyInstalled:installedUids.has(m.uid)});
async function main(){
 if(process.argv[2]==='search'){
  for(const q of queries){if(report.searches[q])continue;const url='https://api.sketchfab.com/v3/search?'+new URLSearchParams({type:'models',q,downloadable:'true',count:'24'});try{const j=await fetchJson(url);report.searches[q]={url,checkedAt:new Date().toISOString(),results:j.results.map(summary)};console.log(q,j.results.length,j.results.filter(m=>paths[m.uid]&&m.license?.label==='CC Attribution'&&!installedUids.has(m.uid)).length+' public candidates');}catch(error){report.searches[q]={url,error:error.message};console.log(q,error.message);}fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
 }else if(process.argv[2]==='download'){
  const dir=path.join(work,'raw/objaverse');fs.mkdirSync(dir,{recursive:true});
  for(const uid of (process.argv[3]||'').split(',').filter(Boolean)){
   if(!paths[uid])throw Error('Not in public Objaverse index: '+uid);
   const m=await fetchJson('https://api.sketchfab.com/v3/models/'+uid);
   if(m.license?.slug!=='by')throw Error('Only verified CC BY assets are downloaded: '+uid);
   const dest=path.join(dir,uid+'.glb'),url='https://huggingface.co/datasets/allenai/objaverse/resolve/main/'+paths[uid];
   try{
    if(!fs.existsSync(dest)){
     const r=await fetch(url,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error('HTTP '+r.status);
     const chunks=[];let bytes=0;for await(const chunk of r.body){bytes+=chunk.length;if(bytes>45000000)throw Error('Asset exceeds the 45 MB review limit');chunks.push(chunk);}const b=Buffer.concat(chunks);if(b.toString('ascii',0,4)!=='glTF')throw Error('Not a GLB');fs.writeFileSync(dest,b);
    }
    fs.writeFileSync(path.join(dir,uid+'.json'),JSON.stringify(m,null,2)+'\n');report.downloads[uid]={...summary(m),downloadUrl:url,downloadedAt:new Date().toISOString(),bytes:fs.statSync(dest).size,status:'Downloaded for exact identity and viewer review; not yet an integration.'};console.log(uid,m.name,report.downloads[uid].bytes);
   }catch(error){report.downloads[uid]={...summary(m),downloadUrl:url,error:error.message};console.log(uid,error.message);}
   fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  }
 }else throw Error('Usage: research-public-model-distribution-2026-10-11.cjs search | download UID,UID');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
