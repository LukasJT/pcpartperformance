// Public model metadata only. Download rights and product identity still require review.
const fs=require('node:fs');
const groups={
 phone:['iPhone','Samsung Galaxy','Google Pixel','OnePlus phone'],
 gpu:['GeForce RTX','Radeon graphics card','ASUS graphics card','MSI graphics card'],
 cpu:['AMD Ryzen processor','Intel Core processor','CPU processor'],
 board:['MSI motherboard','ASUS motherboard','Gigabyte motherboard','ASRock motherboard'],
 case:['Lian Li case','Fractal Design case','NZXT case','Corsair case','Cooler Master case'],
 ssd:['Samsung SSD','Western Digital SSD','Kingston SSD','Crucial SSD','NVMe SSD'],
 fan:['Lian Li fan','Noctua fan','Arctic fan','Corsair fan','PC case fan']
};
const target=process.argv[2]||'all';if(target!=='all'&&!groups[target])throw Error('Unknown category');
const file='docs/model-research/expansion-searches.json';
const report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{method:'Public downloadable-model searches; title matches are candidates, not installed or identity-verified models.',searches:{}};
const save=()=>fs.writeFileSync(file,JSON.stringify(report,null,2));
(async()=>{for(const [category,queries]of Object.entries(groups)){if(target!=='all'&&target!==category)continue;for(const query of queries){const key=category+':'+query;if(report.searches[key]?.checked?.startsWith(new Date().toISOString().slice(0,10)))continue;const url=new URL('https://api.sketchfab.com/v3/search');url.search=new URLSearchParams({type:'models',q:query,downloadable:'true',count:'48'});const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if([403,429].includes(r.status))throw Error('Public access stopped: HTTP '+r.status);if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();report.searches[key]={category,query,checked:new Date().toISOString(),hasMore:!!d.next,results:(d.results||[]).map(m=>({uid:m.uid,name:m.name,url:m.viewerUrl,creator:m.user?.displayName||m.user?.username,license:m.license?.label||m.license?.slug,licenseUrl:m.license?.url,triangles:m.faceCount}))};save();console.log(category,query,d.results.length);await new Promise(r=>setTimeout(r,800))}}report.updated=new Date().toISOString();save()})().catch(e=>{save();console.error(e.message);process.exitCode=1});
