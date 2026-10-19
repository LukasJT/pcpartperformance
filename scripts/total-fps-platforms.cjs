'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), file = path.join(root, 'data/total-console-releases.json');
function text(html) { return html.replace(/<[^>]*>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&(?:amp|quot|apos|nbsp|lt|gt);/g, value => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ', '&lt;': '<', '&gt;': '>' }[value])).replace(/\s+/g, ' ').trim(); }
const normalize = value => text(value).replace(/[™®©]/g, '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');
// Parse a bounded JSON value, never execute a remote page's JavaScript.
function assignedJSON(html, variable) {
  const marker = html.indexOf(variable); if (marker < 0) throw Error('Official JSON state not found');
  const start = html.indexOf('{', marker); let depth = 0, quoted = false, escape = false;
  for (let i = start; i < html.length; i++) { const c = html[i]; if (quoted) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === '"') quoted = false; } else if (c === '"') quoted = true; else if (c === '{' || c === '[') depth++; else if (c === '}' || c === ']') { depth--; if (!depth) return JSON.parse(html.slice(start, i + 1)); } }
  throw Error('Incomplete official JSON state');
}
function links(html, origin) { const urls = new Set(); for (const m of html.matchAll(/href="([^"#]+)"/g)) { try { const u = new URL(text(m[1]), origin); if (u.origin === new URL(origin).origin) urls.add(u.href); } catch {} } return [...urls]; }
function qa(html, key) { return text(html.match(new RegExp('<[^>]+data-qa="' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>([\\s\\S]*?)<\\/[^>]+>'))?.[1] || ''); }
function sonyRecord(html, url, verifiedAt) {
  const name = qa(html, 'mfe-game-title#name') || text(html.match(/<h1\b[^>]*class="game-title"[^>]*>([\s\S]*?)<\/h1>/)?.[1] || ''), platformText = qa(html, 'gameInfo#releaseInformation#platform-value'), publisher = qa(html, 'gameInfo#releaseInformation#publisher-value') || qa(html, 'mfe-game-title#publisher'), release = qa(html, 'gameInfo#releaseInformation#releaseDate-value');
  if (!name || !/(?:^|\W)PS5(?:\W|$)/.test(platformText)) return null;
  const slug = new URL(url).pathname.split('/').filter(Boolean).at(-1), m = release.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/), releaseDate = m ? [m[3], m[1].padStart(2, '0'), m[2].padStart(2, '0')].join('-') : null;
  return { id: 'ps5-' + slug, canonicalGameId: 'game-' + slug, name, platform: 'ps5', system: 'PlayStation 5 / PS5 Slim', family: 'playstation', edition: name, publisher: publisher || null, developer: null, releaseDate, releaseDateText: release || null, sourceUrl: url, verifiedAt, evidenceType: 'official-platform-product-page', evidenceHash: crypto.createHash('sha256').update(JSON.stringify({ name, platformText, publisher, release })).digest('hex'), sourceScope: 'Exact official title and PS5 platform field; release date is the US listing date when supplied. No PC support, PS5 Pro mode, FPS or artwork license inferred.', performanceStatus: 'not-verified', artworkStatus: 'original-category-illustration' };
}
function read() { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { records: [] }; }
function validate(r) {
  const errors = [];
  if (!r.id || !r.name || !r.canonicalGameId) errors.push('missing identity');
  const sony = r.platform === 'ps5' && /^https:\/\/www\.playstation\.com\/en-us\/games\/[^/?]+\/$/.test(r.sourceUrl);
  // Both Nintendo collections include cross-promoted products; the native platform
  // is verified from the product's explicit metadata, never the collection URL.
  const nintendo = ['switch','switch2'].includes(r.platform) && /^https:\/\/www\.nintendo\.com\/us\/store\/products\/[^/?]+\/$/.test(r.sourceUrl) && /^700100\d+$/.test(r.nsuid || '') && /^https:\/\/www\.nintendo\.com\/us\/store\/games\/nintendo-switch(?:-2)?-games\/$/.test(r.metadataSourceUrl || '');
  const xbox = r.platform === 'xbox-series' && /^https:\/\/www\.xbox\.com\/en-US\/games\/store\/-\/[A-Z\d]{12}$/.test(r.sourceUrl);
  const xboxListing=xbox&&r.metadataSourceUrl==='https://www.xbox.com/en-US/games/optimized'&&r.evidenceType==='official-platform-product-page';
  const xboxAnnouncement=xbox&&/^https:\/\/news\.xbox\.com\/en-us\/\d{4}\/\d{2}\/\d{2}\/next-week-on-xbox-[^/]+\/$/.test(r.metadataSourceUrl||'')&&r.evidenceType==='official-platform-release-announcement'&&/Optimized for (?:Xbox|XBOX) Series X\|S/.test(r.platformStatement||'')&&r.releaseDateStatus==='announced-not-confirmed'&&Number.isFinite(Date.parse(r.sourcePublishedAt));
  if (!sony && !nintendo && !xboxListing && !xboxAnnouncement) errors.push('unrecognized official source');
  if (sony && r.id !== 'ps5-' + r.sourceUrl.split('/').filter(Boolean).at(-1)) errors.push('mismatched product identity');
  if (nintendo && r.id !== 'nintendo-' + r.nsuid) errors.push('mismatched product identity');
  if (xbox && (r.id !== 'xbox-' + String(r.productId).toLowerCase() || !r.sourceUrl.endsWith('/' + r.productId))) errors.push('mismatched product identity');
  if (r.evidenceType !== 'official-platform-product-page'&&!xboxAnnouncement) errors.push('platform not verified');
  if (!Number.isFinite(Date.parse(r.verifiedAt)) || !/^[a-f\d]{64}$/.test(r.evidenceHash || '')) errors.push('missing evidence');
  if (r.releaseDate && (!/^\d{4}-\d{2}-\d{2}$/.test(r.releaseDate) || !Number.isFinite(Date.parse(r.releaseDate)) || new Date(r.releaseDate).toISOString().slice(0,10)!==r.releaseDate)) errors.push('invalid release date');
  if (r.performanceStatus !== 'not-verified' || ['fps','averageFps','onePercentLow','measuredFps','frameTime'].some(key=>key in r)) errors.push('unverified FPS');
  return errors;
}
function records() { const rows = read().records,seen=new Set();for (const r of rows) { const errors = validate(r);if(seen.has(r.id))errors.push('duplicate release identity');seen.add(r.id);if (errors.length) throw Error(r.id + ': ' + errors.join(', ')); } return rows; }
function mergeRecords(previous,incoming){const result=new Map(previous.map(r=>[r.id,r]));for(const r of incoming){const errors=validate(r);if(errors.length)throw Error(r.id+': '+errors.join(', '));result.set(r.id,r);}return [...result.values()];}
function prepare({ root: output }) { const oldRuntime=path.join(output,'total-console-expansion.js');if(fs.existsSync(oldRuntime))fs.unlinkSync(oldRuntime);fs.writeFileSync(path.join(output, 'data/console-release-evidence.json'), JSON.stringify({ schemaVersion: 1, records: records() })); return { verifiedConsoleAdditions: records().length }; }
async function fetchSony() {
  const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/game-library.js'), 'utf8'), c);
  const allPc = [...c.window.performanceGames, ...require('./total-fps-games.cjs').profiles()], existingNames = new Set(c.window.consolePerformanceGames.filter(r => r.family === 'playstation' && r.system === 'PlayStation 5 / PS5 Slim').map(r => normalize(r.game))), canonical = new Map(allPc.map(r => [normalize(r.name), r.canonicalGameId || r.id]));
  const urls = new Set(), accepted = [], rejected = [], old = new Map(read().records.map(r => [r.sourceUrl, r]));
  const fetchHTML = async url => { const response = await fetch(url, { signal: AbortSignal.timeout(20000) }); if (!response.ok) throw Error('HTTP ' + response.status); return response.text(); };
  for (const seed of ['https://www.playstation.com/en-us/ps5/games/', 'https://www.playstation.com/en-us/ps-plus/games/']) {
    const html = await fetchHTML(seed);
    for (const m of html.matchAll(/href="((?:https:\/\/www\.playstation\.com)?\/en-us\/games\/[^"?#]+)"/g)) { const url = new URL(m[1], seed); if (/^\/en-us\/games\/[^/]+\/$/.test(url.pathname)) urls.add(url.href); }
  }
  for (const url of urls) {
    try {
      let r = old.get(url); if (!r) { r = sonyRecord(await fetchHTML(url), url, new Date().toISOString()); await new Promise(resolve => setTimeout(resolve, 800)); }
      if (!r) { rejected.push({ sourceUrl: url, reason: 'No exact official PS5 platform field; candidate remains unverified.' }); continue; }
      const errors = validate(r); if (existingNames.has(normalize(r.name))) errors.push('already-indexed-title');
      if (errors.length) { rejected.push({ sourceUrl: url, reason: errors.join('; ') }); continue; }
      r.canonicalGameId = canonical.get(normalize(r.name)) || r.canonicalGameId; existingNames.add(normalize(r.name)); accepted.push(r);
      if (accepted.length >= 110) break;
    } catch (error) { rejected.push({ sourceUrl: url, reason: error.message }); }
  }
  const report = { checkedAt: new Date().toISOString(), sources: [...urls], verifiedAdditions: accepted.length, rejected, limitation: 'Exact PS5 listing fields only; no other console, backwards compatibility, graphics mode or FPS inferred.' };
  fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, records: mergeRecords(read().records,accepted) }, null, 2) + '\n'); fs.mkdirSync(path.join(root, 'docs/total-refinement/games'), { recursive: true }); fs.writeFileSync(path.join(root, 'docs/total-refinement/games/console-import-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ verifiedPs5Additions: accepted.length, candidates: urls.size, rejected: rejected.length }));
}
function nintendoRecords(html, metadataSourceUrl, verifiedAt) {
  const start = html.indexOf('__NEXT_DATA__'); if (start < 0) throw Error('Official Nintendo metadata not found'); const a = html.indexOf('>', start) + 1, state = JSON.parse(html.slice(a, html.indexOf('</script>', a))), products = new Map();
  function walk(x) { if (!x || typeof x !== 'object') return; if (!Array.isArray(x) && x.nsuid && x.name && x.platform) products.set(x.nsuid, x); for (const value of Object.values(x)) walk(value); }
  walk(state.props?.pageProps);
  const rows = [];
  for (const p of products.values()) {
    const platform = { NINTENDO_SWITCH: 'switch', NINTENDO_SWITCH_2: 'switch2' }[p.platform.code];
    if (!platform || !/^700100\d+$/.test(p.nsuid) || p.dlcType || p.topLevelCategory?.code !== 'GAMES' || !p.urlKey || !p.availability?.includes('Available now')) continue;
    const name = text(p.name), canonicalName = name.replace(/\s*[–—-]\s*Nintendo Switch(?:™)?\s*2 Edition.*$/i, '').trim();
    rows.push({ id: 'nintendo-' + p.nsuid, canonicalGameId: 'game-' + normalize(canonicalName), nsuid: p.nsuid, name, platform, system: platform === 'switch2' ? 'Nintendo Switch 2' : 'Nintendo Switch / Switch Lite', family: 'nintendo', edition: name, publisher: p.softwarePublisher || null, developer: p.softwareDeveloper || null, releaseDate: p.releaseDate?.slice(0, 10) || null, releaseDateText: p.releaseDateDisplay || null, sourceUrl: 'https://www.nintendo.com/us/store/products/' + p.urlKey + '/', metadataSourceUrl, verifiedAt, evidenceType: 'official-platform-product-page', evidenceHash: crypto.createHash('sha256').update(JSON.stringify({ nsuid: p.nsuid, name: p.name, platform: p.platform.code, publisher: p.softwarePublisher, developer: p.softwareDeveloper, releaseDate: p.releaseDate, availability: p.availability, urlKey: p.urlKey })).digest('hex'), sourceScope: 'Official Nintendo US catalog metadata verifies this base-game NSUID, native platform and available-now listing. A Switch release is not automatically asserted to be Switch2 compatible. No FPS, sustained resolution or artwork license inferred.', performanceStatus: 'not-verified', artworkStatus: 'original-category-illustration' });
  }
  return rows;
}
async function fetchNintendo() {
  const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/game-library.js'), 'utf8'), c);
  const known = [...c.window.performanceGames, ...require('./total-fps-games.cjs').profiles()], canonical = new Map(known.map(r => [normalize(r.name), r.canonicalGameId || r.id])), existing = new Set(c.window.consolePerformanceGames.filter(r => r.family === 'nintendo').map(r => normalize(r.game) + '|' + (r.system.includes('Switch 2') ? 'switch2' : r.system.includes('Switch') ? 'switch' : r.system)));
  const accepted = new Map(), rejected = [], sources = [];
  for (const url of ['https://www.nintendo.com/us/store/games/nintendo-switch-games/', 'https://www.nintendo.com/us/store/games/nintendo-switch-2-games/']) {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) }); if (!response.ok) throw Error('HTTP ' + response.status);
    const verifiedAt = new Date().toISOString(); sources.push({ url, verifiedAt });
    for (const r of nintendoRecords(await response.text(), url, verifiedAt)) {
      const errors = validate(r), key = normalize(r.name) + '|' + r.platform;
      if (existing.has(key)) errors.push('already-indexed-title-platform');
      if (errors.length) { rejected.push({ id: r.id, reason: errors.join('; ') }); continue; }
      r.canonicalGameId = canonical.get(normalize(r.name)) || r.canonicalGameId; accepted.set(r.id, r);
    }
  }
  const current = read().records, rows = [...accepted.values()];
  fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, records: mergeRecords(current,rows) }, null, 2) + '\n');
  fs.mkdirSync(path.join(root, 'docs/total-refinement/games'), { recursive: true });
  const counts = Object.fromEntries(['switch','switch2'].map(p => [p, rows.filter(r => r.platform === p).length]));
  fs.writeFileSync(path.join(root, 'docs/total-refinement/games/nintendo-import-report.json'), JSON.stringify({ sources, counts, rejected, limitation: 'Base-game IDs with explicit native-platform and available-now metadata only. DLC, upgrade packs, bundles and unconfirmed backward-compatibility associations excluded.' }, null, 2));
  console.log(JSON.stringify(counts));
}
function xboxRecords(html, verifiedAt) {
  const data = assignedJSON(html, 'window.__PRELOADED_STATE__'), channel = Object.entries(data.content?.channels?.channelData || {}).find(([key]) => key.includes('DYNAMICCHANNEL.OPTIMIZEDSERIESXS_FILTERS='))?.[1]?.data;
  if (!channel) throw Error('Explicit Xbox Series X|S optimized channel not found');
  const allowed = new Set(channel.products.map(r => r.productId)), rows = [];
  for (const p of Object.values(data.content?.products?.productSummaries || {})) {
    if (!allowed.has(p.productId) || p.productKind !== 'Game' || !p.availableOn?.includes('XboxSeriesX') || /\b(?:bundle|vault edition|ultimate edition|cross-gen bundle)\b/i.test(p.title)) continue;
    rows.push({ id: 'xbox-' + p.productId.toLowerCase(), canonicalGameId: 'game-' + normalize(p.title), productId: p.productId, name: text(p.title), platform: 'xbox-series', system: 'Xbox Series X / Series S', family: 'xbox', edition: text(p.title), publisher: p.publisherName || null, developer: p.developerName || null, releaseDate: p.releaseDate?.slice(0, 10) || null, sourceUrl: 'https://www.xbox.com/en-US/games/store/-/' + p.productId, metadataSourceUrl: 'https://www.xbox.com/en-US/games/optimized', verifiedAt, evidenceType: 'official-platform-product-page', evidenceHash: crypto.createHash('sha256').update(JSON.stringify({ productId: p.productId, title: p.title, availableOn: p.availableOn, productKind: p.productKind, releaseDate: p.releaseDate, developer: p.developerName, publisher: p.publisherName })).digest('hex'), sourceScope: 'Official Xbox Optimized for Series X|S channel plus exact product ID and store platform metadata. This is one grouped family listing, not a separate measured Series X or Series S result. No FPS or image license inferred.', performanceStatus: 'not-verified', artworkStatus: 'original-category-illustration' });
  }
  return rows;
}
async function fetchXbox() {
  const url = 'https://www.xbox.com/en-US/games/optimized', response = await fetch(url, { signal: AbortSignal.timeout(20000) }); if (!response.ok) throw Error('HTTP ' + response.status);
  const rows = xboxRecords(await response.text(), new Date().toISOString()), c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/game-library.js'), 'utf8'), c);
  const existing = new Set(c.window.consolePerformanceGames.filter(r => r.family === 'xbox').map(r => normalize(r.game))), known = new Map([...c.window.performanceGames, ...require('./total-fps-games.cjs').profiles()].map(r => [normalize(r.name), r.canonicalGameId || r.id])), accepted = [], rejected = [];
  for (const r of rows) { const errors = validate(r); if (existing.has(normalize(r.name))) errors.push('already-indexed-title-family'); if (errors.length) { rejected.push({ id: r.id, reason: errors.join('; ') }); continue; } r.canonicalGameId = known.get(normalize(r.name)) || r.canonicalGameId; accepted.push(r); }
  fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, records: mergeRecords(read().records,accepted) }, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'docs/total-refinement/games/xbox-import-report.json'), JSON.stringify({ checkedAt: new Date().toISOString(), source: url, verifiedAdditions: accepted.length, rejected, remainingAgainst100Additional: Math.max(0, 100 - accepted.length), limitation: 'Official first-page product metadata only. Other optimized titles require additional exact product-page verification; unobserved catalog pages are not counted.' }, null, 2)); console.log(JSON.stringify({ verifiedXboxAdditions: accepted.length }));
}
if (require.main === module) { const action = process.argv.includes('--fetch-sony') ? fetchSony : process.argv.includes('--fetch-nintendo') ? fetchNintendo : process.argv.includes('--fetch-xbox') ? fetchXbox : null; if (action) action().catch(error => { console.error(error); process.exitCode = 1; }); else console.log(JSON.stringify({ verified: records().length })); }
module.exports = { records, validate, text, sonyRecord, nintendoRecords, xboxRecords, assignedJSON, links, prepare, mergeRecords };
