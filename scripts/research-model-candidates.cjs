// Public Sketchfab metadata only. Downloads use the signed-in browser, not scraped credentials.
const fs = require('node:fs');
const path = require('node:path');
const {setTimeout: delay} = require('node:timers/promises');
const library = JSON.parse(fs.readFileSync('dist/model-library.json', 'utf8'));
const out = path.resolve('docs/model-research');
fs.mkdirSync(out, {recursive: true});
const file = path.join(out, 'sketchfab-searches.json');
const report = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {method: 'Exact catalog name searches of public Sketchfab metadata. Results are candidates, not verified matches or downloaded assets. Zero results do not prove a model does not exist.', searches: {}};
const limit = Number(process.argv[2] || 1000);
let done = 0;
const save = () => fs.writeFileSync(file, JSON.stringify(report, null, 2));
async function main() {
 for (const item of library.items.filter(x => x.status !== 'community')) {
  if (done >= limit) break;
  const prior = report.searches[item.id];
  if (prior?.checkedAt?.slice(0,10) === new Date().toISOString().slice(0,10) && prior.status === 200) continue;
  const query = item.name;
  const url = new URL('https://api.sketchfab.com/v3/search');
  url.search = new URLSearchParams({type: 'models', q: query, downloadable: 'true', count: '24'});
  try {
   const response = await fetch(url, {signal: AbortSignal.timeout(15000)});
   if ([403,429].includes(response.status)) { console.log('Public metadata access stopped:', response.status); break; }
   if (!response.ok) throw Error('HTTP '+response.status);
   const body = await response.json();
   report.searches[item.id] = {name: item.name, category:item.category, query, status: response.status, checkedAt: new Date().toISOString(), hasFurtherResults:!!body.next, results:(body.results||[]).map(m=>({uid:m.uid,name:m.name,url:m.viewerUrl,isDownloadable:m.isDownloadable,creator:m.user?.displayName||m.user?.username,creatorUrl:m.user?.profileUrl,license:m.license,triangles:m.faceCount,animations:m.animationCount,review:'unreviewed'}))};
  } catch (error) { report.searches[item.id] = {name:item.name,category:item.category,query,status:'error',checkedAt:new Date().toISOString(),error:error.message}; }
  done++;
  save();
  if (done % 25 === 0) console.log('Checked',done,'this run;',Object.keys(report.searches).length,'catalog queries recorded');
  await delay(750);
 }
 report.updatedAt = new Date().toISOString();
 save();
 console.log('Research complete for',Object.keys(report.searches).length,'catalog records. These are unreviewed candidates, not model coverage.');
}
main().catch(e=>{save();console.error(e.message);process.exitCode=1});
