// Public metadata only. No credentials, cookies, viewer extraction or access bypass.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'docs/program-2026-10-11/models');
fs.mkdirSync(out, {recursive: true});
const file = path.join(out, 'research.json');
const report = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {
  started: new Date().toISOString(),
  method: 'Public Sketchfab search and model metadata, official download endpoint status, local user-downloaded archive review, and manufacturer public pages. Search candidates do not count as integrations.',
  searches: {}, models: {}, downloads: {}, manufacturer: [],
};
const queries = [
  ['gpu', 'MSI RTX 5070 Gaming Trio'], ['gpu', 'ASUS RTX 5070'],
  ['case', 'Fractal North'], ['case', 'Lian Li O11 Dynamic'],
  ['case', 'NZXT H510'], ['case', 'Corsair 5000D'],
  ['fan', 'Lian Li UNI FAN TL'], ['fan', 'Phanteks T30'],
  ['fan', 'Corsair RS120'], ['fan', 'be quiet Light Wings'],
  ['cpu', 'AMD Ryzen 9950X3D'], ['cpu', 'Intel 14900K'],
  ['board', 'ASUS X870 motherboard'], ['board', 'MSI B650 motherboard'],
  ['ram', 'G Skill Trident Z5'], ['ssd', 'Samsung 990 EVO Plus'],
  ['hdd', 'Seagate Barracuda'], ['psu', 'Corsair RM850x'],
  ['phone', 'iPhone 13 Pro'], ['phone', 'iPhone 15 Pro'],
  ['phone', 'Google Pixel 9 Pro'], ['phone', 'Samsung Galaxy S24'],
  ['phone', 'Samsung Galaxy Z Fold'], ['phone', 'OnePlus 12'],
];
const localUids = [
  '26fbe59aa2ab4a749ef71583aefdadd5',
  'a35156d91cf44e70a2fdfeade54ae0b2',
  'fff4a783d9824800a912c3c7a79c1ac0',
  '27f023b65e814d1c946460fcc0cb8250',
  '04e5d962c897434fb8e2294e6bb13366',
  'faa8f55407404fd2870e35ab6a8f03bb',
];
const delay = () => new Promise(r => setTimeout(r, 450));
const save = () => { report.updated = new Date().toISOString(); fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n'); };
const publicModel = m => ({uid:m.uid, name:m.name, url:m.viewerUrl,
  description:m.description, downloadable:m.isDownloadable,
  creator:m.user?.displayName, creatorUrl:m.user?.profileUrl,
  license:m.license, triangles:m.faceCount, vertices:m.vertexCount,
  thumbnail:m.thumbnails?.images?.at(-1)?.url});
async function get(url) {
  const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
  const text = await response.text();
  let body; try {body=JSON.parse(text);} catch {body={response:'Non-JSON response'};}
  return {status:response.status, checkedAt:new Date().toISOString(), body};
}
async function run() {
  for (const [category, query] of queries) {
    if (report.searches[query]) continue;
    const url = new URL('https://api.sketchfab.com/v3/search');
    url.search = new URLSearchParams({type:'models',q:query,downloadable:'true',count:'24'});
    const result = await get(url);
    report.searches[query] = {category, query, sourceUrl:url.href,
      status:result.status, checkedAt:result.checkedAt, hasMore:!!result.body.next,
      results:(result.body.results||[]).map(publicModel)};
    save(); console.log(category, query, result.status, report.searches[query].results.length);
    if ([403,429].includes(result.status)) break;
    await delay();
  }
  for (const uid of localUids) {
    if (report.models[uid]) continue;
    const result=await get('https://api.sketchfab.com/v3/models/'+uid);
    report.models[uid]={status:result.status,checkedAt:result.checkedAt,...publicModel(result.body)};
    save(); console.log('local source',uid,result.status);
    if ([403,429].includes(result.status)) break;
    await delay();
  }
  // Verify official access requirements for a bounded set of distinct candidates.
  const installed=[...require('./sketchfab-models.json'),...Object.values(require('./phone-models.json'))];
  const installedUids=new Set(installed.map(m=>m.sourceUrl?.match(/[a-f0-9]{32}/)?.[0]).filter(Boolean));
  const matches = (category,m) => {
    if(/concept|inspired|based off|front panel|replacement|mod\b/i.test(m.name))return false;
    const patterns={gpu:/RTX|Radeon|Arc B/i,case:/^Lian Li O11|^Fractal.*North|^NZXT H510|^Corsair 5000D/i,
      fan:/UNI FAN TL|Phanteks T30|Corsair RS120|Light Wings/i,cpu:/9950X3D|14900K/i,
      board:/X870|B650/i,ram:/Trident Z5/i,ssd:/990 EVO Plus/i,hdd:/Barracuda/i,psu:/RM850x/i,
      phone:/^(?:\(FREE\)\s*)?(?:Apple\s+)?(?:iPhone|Samsung Galaxy|Google Pixel|Pixel 9|Galaxy|OnePlus)/i};
    return patterns[category]?.test(m.name);
  };
  const candidates=Object.values(report.searches).flatMap(s=>(s.results||[]).filter(m=>matches(s.category,m)))
    .filter(m=>m.downloadable && !installedUids.has(m.uid) && !localUids.includes(m.uid)
      && (m.license?.slug==='by'||m.license?.label==='CC Attribution'));
  const ids=[...new Set(candidates.map(m=>m.uid))].slice(0,20);
  for(const uid of ids) {
    if(!report.models[uid]){
      const result=await get('https://api.sketchfab.com/v3/models/'+uid);
      report.models[uid]={status:result.status,checkedAt:result.checkedAt,...publicModel(result.body)};
      save();if([403,429].includes(result.status))break;await delay();
    }
    if(report.downloads[uid])continue;
    const url='https://api.sketchfab.com/v3/models/'+uid+'/download';
    const result=await get(url);
    report.downloads[uid]={sourceUrl:url,status:result.status,checkedAt:result.checkedAt,
      detail:result.body.detail||result.body.error||null,
      integrated:false,reason:result.status===401?'Official download requires an authenticated, authorized account. No credentials or alternate viewer extraction were used.':'Download outcome requires review.'};
    save(); console.log('download check',uid,result.status);
    if([403,429].includes(result.status))break;
    await delay();
  }
  save();
}
run().catch(error=>{report.error={at:new Date().toISOString(),message:error.message};save();console.error(error.message);process.exitCode=1;});
