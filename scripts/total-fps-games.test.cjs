'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const pc = require('./total-fps-games.cjs'), consoles = require('./total-fps-platforms.cjs');
test('official PC expansion has at least100 real edition records and no made-up performance fields', () => {
  const records = require('../data/total-games-verified.json').records;
  assert(records.length >= 100); assert.equal(new Set(records.map(r => r.appId)).size, records.length);
  for (const r of records) { assert.deepEqual(pc.validate(r), []); assert.equal(r.platforms.windows, true); assert.match(r.metadataUrl, /^https:\/\/store\.steampowered\.com\/api\/appdetails\?/); assert.equal(r.artwork.status, 'not-imported'); }
  assert(pc.profiles().every(r => r.benchmarkStatus === 'no-verified-record'));
  assert(pc.profiles().filter(r => ['steam-22300','steam-22370'].includes(r.id)).every(r => r.canonicalGameId === 'game-fallout-3'));
});
test('PC validator rejects a DLC, a non-Windows game and fabricated FPS', () => {
  const r = require('../data/total-games-verified.json').records[0];
  assert(pc.validate({ ...r, type: 'dlc' }).length); assert(pc.validate({ ...r, platforms: { windows: false } }).length); assert(pc.validate({ ...r, averageFps: 120 }).length);
  assert(pc.validate({ ...r, appId:r.appId+1 }).length);assert(pc.validate({ ...r, metadataUrl:'https://store.steampowered.com/api/appdetails?appids=999&cc=us&l=en' }).length);assert(pc.validate({ ...r, evidenceHash:'not-a-hash' }).length);
});
test('console parser requires the product-specific platform field, not PS5 elsewhere in navigation', () => {
  const url = 'https://www.playstation.com/en-us/games/example/';
  assert.equal(consoles.sonyRecord('<h1>PS5 Games</h1><nav>PS5</nav>', url, '2026-10-19T00:00:00Z'), null);
  const h = '<h1 data-qa="mfe-game-title#name">Example &amp; Adventure</h1><span data-qa="mfe-game-title#publisher">Publisher</span><dd data-qa="gameInfo#releaseInformation#platform-value">PS5</dd><dd data-qa="gameInfo#releaseInformation#releaseDate-value">9/6/2024</dd>';
  const r = consoles.sonyRecord(h, url, '2026-10-19T00:00:00Z'); assert.equal(r.name, 'Example & Adventure'); assert.equal(r.releaseDate, '2024-09-06'); assert.deepEqual(consoles.validate(r), []);
  assert(consoles.validate({ ...r, sourceUrl: 'http://127.0.0.1/private' }).length);
  assert(consoles.validate({ ...r, id:'ps5-different-game' }).length);assert(consoles.validate({ ...r, releaseDate:'2024-02-31' }).length);assert(consoles.validate({ ...r, averageFps:60 }).length);
});
test('Nintendo ingestion excludes upgrade packs, DLC, bundles, future listings and unknown platforms', () => {
  const base = { nsuid: '70010000000001', name: 'Example', platform: { code: 'NINTENDO_SWITCH_2' }, topLevelCategory: { code: 'GAMES' }, availability: ['Available now'], urlKey: 'example-switch-2', releaseDate: '2026-01-01T00:00:00Z' };
  const products = [base, { ...base, nsuid: '70050000000001', name: 'Upgrade Pack' }, { ...base, nsuid: '70070000000001', name: 'Bundle' }, { ...base, nsuid: '70010000000002', name: 'DLC', dlcType: {} }, { ...base, nsuid: '70010000000003', availability: ['Coming soon'] }, { ...base, nsuid: '70010000000004', platform: { code: 'UNKNOWN' } }];
  const h = '<script id="__NEXT_DATA__" type="application/json">' + JSON.stringify({ props: { pageProps: { products } } }) + '</script>';
  const rows = consoles.nintendoRecords(h, 'https://www.nintendo.com/us/store/games/nintendo-switch-2-games/', '2026-10-19T00:00:00Z');
  assert.equal(rows.length, 1); assert.equal(rows[0].platform, 'switch2'); assert.deepEqual(consoles.validate(rows[0]), []); assert.equal(rows[0].performanceStatus, 'not-verified');
});
test('new console catalog entries cannot inherit a performance record through a shared canonical game', () => {
  const source = fs.readFileSync(path.join(__dirname, '../dist/performance.js'), 'utf8');
  assert(source.includes('!x.catalogOnly&&window.PCP_CONSOLE_EVIDENCE')); assert(source.includes('catalogOnly:true')); assert(source.includes("fetch('/data/console-release-evidence.json')"));
  assert(!source.includes('total-console-expansion.js'));
});
test('published console release additions are source-valid and unique; native Switch2 is never inferred', () => {
  const rows = consoles.records(), seen = new Set();
  for (const r of rows) { assert.deepEqual(consoles.validate(r), []); assert(!seen.has(r.id), r.id); seen.add(r.id); }
  for (const platform of ['ps5','switch','switch2']) assert(rows.filter(r => r.platform === platform).length >= 100, platform);
  assert(rows.filter(r => r.platform === 'xbox-series').length >=100);
  assert(rows.filter(r => r.platform === 'switch2').every(r => r.sourceScope.includes('not automatically')));
});

test('Xbox Wire requires an exact SKU and platform statement in the same game paragraph',()=>{
 const wire=require('./total-fps-xbox-wire.cjs'),url='https://news.xbox.com/en-us/2026/06/05/next-week-on-xbox-new-games-for-june-8-to-12/',date='2026-10-19T00:00:00Z';
 const meta='<meta property="article:published_time" content="2026-06-05T12:00:00Z">',game='<p><strong><a href="https://www.xbox.com/en-US/games/store/example/9N8BRH7PGJMJ">Example – June 8</a></strong><br><strong>Optimized for XBOX Series X|S / Smart Delivery</strong></p>';
 const rows=wire.parse(meta+game,url,date);assert.equal(rows.length,1);assert.deepEqual(consoles.validate(rows[0]),[]);assert.equal(rows[0].releaseDateStatus,'announced-not-confirmed');assert.equal(rows[0].releaseDate,'2026-06-08');
 assert.equal(wire.parse(meta+game.replace('Optimized for XBOX Series X|S','Xbox Play Anywhere'),url,date).length,0);assert.equal(wire.parse(meta+game.replace('Example –','Example (DLC) –'),url,date).length,0);
 assert.equal(wire.parse(meta+'<nav>Optimized for XBOX Series X|S</nav>'+game.replace('Optimized for XBOX Series X|S','Xbox Play Anywhere'),url,date).length,0);
 assert.throws(()=>wire.parse(meta+game,url,'2026-01-01T00:00:00Z'),/future publication/);
  const other=consoles.records().find(r=>r.platform==='ps5');assert.equal(consoles.mergeRecords([other,...rows],[{...rows[0],publisher:'Updated official publisher'}]).length,2);assert.equal(consoles.mergeRecords([other,...rows],[{...rows[0],publisher:'Updated official publisher'}])[1].publisher,'Updated official publisher');assert.throws(()=>consoles.mergeRecords(rows,[{...rows[0],averageFps:120}]),/unverified FPS/);
});
test('remote Xbox state is parsed as JSON without executing page code and requires its explicit channel', () => {
  const p = { productId:'ABCDEFGHIJKL',productKind:'Game',availableOn:['XboxSeriesX'],title:'Example Game',publisherName:'Publisher',developerName:'Developer',releaseDate:'2026-01-01T00:00:00Z' };
  const data = { content:{channels:{channelData:{'BROWSE_CHANNELID=DYNAMICCHANNEL.OPTIMIZEDSERIESXS_FILTERS=':{data:{products:[{productId:p.productId}]}}}},products:{productSummaries:{[p.productId]:p}}} };
  const h = '<script>window.__PRELOADED_STATE__ = '+JSON.stringify(data)+'; throw Error("must never execute")</script>';
  assert.deepEqual(consoles.assignedJSON(h,'window.__PRELOADED_STATE__'),data);
  const rows=consoles.xboxRecords(h,'2026-10-19T00:00:00Z'); assert.equal(rows.length,1); assert.deepEqual(consoles.validate(rows[0]),[]);
  assert.throws(()=>consoles.xboxRecords('<script>window.__PRELOADED_STATE__={"content":{}};</script>','2026-10-19T00:00:00Z'));
});
