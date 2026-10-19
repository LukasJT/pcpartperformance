'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, 'data/total-games-verified.json');
const pendingFile = path.join(root, 'docs/total-refinement/games/import-report.json');
// Discovery identifiers only. A name is never promoted to a record until the official listing verifies it.
const candidates = [400,620,70,220,380,420,500,550,546560,239140,534380,292030,292050,377160,22380,22370,38400,38410,22300,489830,72850,22330,10180,812140,582160,48190,15100,33230,242050,311560,368500,460930,2208920,916440,236850,394360,1158310,529340,289070,8930,294100,1145360,1145350,367520,105600,413150,646570,1092790,2379780,881100,892970,552520,298110,220240,1358700,21690,254700,883710,952060,418370,1196590,2050650,304240,339340,221040,304430,329430,287290,1544020,1693980,17470,47780,1238060,247080,268910,588650,504230,240720,250900,252950,203160,391220,750920,814380,1245620,374320,335300,211420,1217060,322170,359320,236430,275850,359550,674940,322330,219740,431960,1085660,990080,1174180,271590,306130,346110,2399830,582010,1446780,2246340,632360,548430,548570,782330,2280,2300,379720,379430,1151640,2420110,2322010,1659040,1817070,1817190,2651280,2215430,1151340,489830,200260,209000,208650,35140,22320,236090,257850,311690,552500,235540,1551360,1293830,1557740,431240,477160,728880,1245620,1240440,976730,1222680,1262540,1222140,1286830,1063730,1151340,1971870,1973530,976310,686810,460920,307690,638970,2058190,927380,1105510,1235140,1388590,2072450,1687950,1113000,2161700,1172380,1774580,1088850,637650,1462040,39150,39140,359870,1200410,1608070,1442840,2515020,1304930,424840,860510,262060,1940340,413410,413420,567640,519860,548430,244850,244210,227300,270880,493340,703080,255710,949230,526870,427520,553850,1086940,435150,230230,233450,239030,375910,784150,1066780,359550,730,440];
function baseGames() { const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/game-library.js'), 'utf8'), c); return c.window.performanceGames || []; }
function fingerprint(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
const normalize = s => String(s).replace(/[™®©]/g, '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');
function validate(record) {
  const problems = [];
  if (!Number.isInteger(record.appId) || record.appId <= 0 || record.id !== 'steam-' + record.appId) problems.push('invalid stable identity');
  if (record.type !== 'game' || record.platforms?.windows !== true) problems.push('not a Windows game');
  if (!record.name?.trim() || record.sourceUrl !== 'https://store.steampowered.com/app/' + record.appId + '/' || record.metadataUrl !== 'https://store.steampowered.com/api/appdetails?appids=' + record.appId + '&cc=us&l=en') problems.push('missing or mismatched official identity');
  if (!Number.isFinite(Date.parse(record.verifiedAt)) || !/^[a-f\d]{64}$/.test(record.evidenceHash || '') || !Array.isArray(record.developer) || !record.developer.length || !Array.isArray(record.publisher) || !record.publisher.length) problems.push('missing evidence metadata');
  if (record.release?.comingSoon !== false) problems.push('not an already-released listing');
  if (['fps','base','cpuCap','averageFps','onePercentLow','measuredFps','frameTime'].some(key=>key in record)) problems.push('catalog entry must not invent performance');
  return problems;
}
// Editions keep separate store identities but share an explicit underlying game where reviewed.
const canonicalEditions = { 22370: 'game-fallout-3', 22300: 'game-fallout-3', 335300: 'game-dark-souls-2', 236430: 'game-dark-souls-2', 271590: 'gta5' };
function toProfile(r) { return { id: r.id, canonicalGameId: canonicalEditions[r.appId] || r.id, name: r.name, series: r.name, genre: r.genres[0] || 'Unclassified', year: r.release.year, featured: false, art: '/assets/game-library-illustration.svg', artStatus: 'original-category-illustration', sourceUrl: r.sourceUrl, verifiedAt: r.verifiedAt, pcReleaseConfirmed: true, platforms: [{ id: 'pc-windows', edition: r.name, sourceUrl: r.sourceUrl, releaseDate: r.release.date, evidenceType: 'official-store-listing' }], developer: r.developer, publisher: r.publisher, benchmarkStatus: 'no-verified-record' }; }
function read() { return fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : { records: [] }; }
function profiles() { const data = read(),seen=new Set(); for (const r of data.records) { const errors = validate(r); if(seen.has(r.id))errors.push('duplicate release identity');seen.add(r.id);if (errors.length) throw Error(r.id + ': ' + errors.join(', ')); } return data.records.map(toProfile); }
function runtime() { const keys = ['id','canonicalGameId','name','series','genre','year','art','artStatus','sourceUrl','pcReleaseConfirmed']; return '/* Official listing facts only; no benchmark or image-rights claims. */\nwindow.performanceGames=window.performanceGames.concat(' + JSON.stringify(profiles().map(r => Object.fromEntries(keys.map(key => [key, r[key]])))) + ');\n'; }
function prepare({ root: output }) {
  fs.writeFileSync(path.join(output, 'total-game-expansion.js'), runtime());
  fs.writeFileSync(path.join(output, 'data/game-release-evidence.json'), JSON.stringify({ schemaVersion: 1, records: profiles(), limitation: 'Store-listed Windows editions, not measured FPS records; no console association inferred.' }));
  fs.writeFileSync(path.join(output, 'assets/game-library-illustration.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="460" height="259" viewBox="0 0 460 259"><rect width="460" height="259" rx="16" fill="#172437"/><g fill="none" stroke="#bad3f8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M161 88h138q30 0 36 30l15 52q4 20-15 23l-39-32H164l-39 32q-19-3-15-23l15-52q6-30 36-30Z"/><path d="M163 111v35m-17-17h34"/><circle cx="283" cy="116" r="5"/><circle cx="306" cy="139" r="5"/></g></svg>');
  return { verifiedPcAdditions: profiles().length };
}
async function fetchOfficial() {
  const existing = baseGames(), ids = new Set(existing.map(g => g.art?.match(/steam\/apps\/(\d+)\//)?.[1]).filter(Boolean)), names = new Set(existing.map(g => normalize(g.name))), accepted = [], rejected = [];
  const previous = new Map(read().records.map(r => [r.appId, r]));
  for (const appId of [...new Set(candidates)]) {
    if (ids.has(String(appId))) { rejected.push({ appId, reason: 'already-indexed-app-id' }); continue; }
    let record = previous.get(appId);
    try {
      if (!record) {
        const endpoint = 'https://store.steampowered.com/api/appdetails?appids=' + appId + '&cc=us&l=en';
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'PCPartPerformance research metadata check' } });
        if (!response.ok) throw Error('HTTP ' + response.status);
        const entry = (await response.json())[String(appId)];
        if (!entry?.success) throw Error('listing unavailable');
        const d = entry.data, releaseYear = Number(d.release_date?.date?.match(/\b(19|20)\d{2}\b/)?.[0]) || null;
        record = { id: 'steam-' + appId, appId, type: d.type, name: d.name, developer: d.developers || [], publisher: d.publishers || [], genres: (d.genres || []).map(g => g.description), platforms: d.platforms, release: { date: d.release_date?.date || null, year: releaseYear, comingSoon: d.release_date?.coming_soon }, sourceUrl: 'https://store.steampowered.com/app/' + appId + '/', metadataUrl: endpoint, verifiedAt: new Date().toISOString(), evidenceHash: fingerprint({ appId: d.steam_appid, name: d.name, type: d.type, developers: d.developers, publishers: d.publishers, platforms: d.platforms, release: d.release_date, genres: d.genres }), scope: 'Official store listing verifies Windows release identity, publisher/developer and listed release date; no FPS, requirements interpretation or artwork redistribution rights imported.', artwork: { status: 'not-imported', reason: 'No redistribution license established; original category illustration used.' } };
        await new Promise(resolve => setTimeout(resolve, 900));
      }
      const errors = validate(record);
      if (names.has(normalize(record.name))) errors.push('already-indexed-name');
      if (errors.length) { rejected.push({ appId, name: record.name, reason: errors.join('; ') }); continue; }
      names.add(normalize(record.name)); accepted.push(record);
      if (accepted.length >= 110) break;
    } catch (error) { rejected.push({ appId, reason: error.message }); }
  }
  const result = { schemaVersion: 1, evidenceType: 'official-store-listing', generatedAt: new Date().toISOString(), measurementStatus: 'not-benchmark-data', records: accepted };
  fs.mkdirSync(path.dirname(pendingFile), { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(pendingFile, JSON.stringify({ checkedAt: result.generatedAt, existingPcProfiles: existing.length, additions: accepted.length, candidatesAttempted: accepted.length + rejected.length, rejected, limitations: ['Windows store release dates may differ from original releases and other regions.', 'No new console association is inferred from Windows listings.', 'No performance records or licensed third-party artwork were imported.', 'Listing presence does not prove current multiplayer service availability or compatibility with a particular PC.'] }, null, 2));
  console.log('Verified ' + accepted.length + ' additional Windows games; rejected or existing ' + rejected.length + '.');
}
if (require.main === module) { if (process.argv.includes('--fetch')) fetchOfficial().catch(error => { console.error(error); process.exitCode = 1; }); else console.log(JSON.stringify({ verified: profiles().length })); }
module.exports = { prepare, profiles, validate, toProfile, runtime, candidates };
