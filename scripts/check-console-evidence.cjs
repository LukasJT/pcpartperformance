const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const evidence = require('./program-console-evidence.cjs');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/game-library.js'), 'utf8'), context);
const legacy = context.window.consolePerformanceGames;
let tests = 0;
function test(name, fn) { fn(); tests++; console.log('PASS ' + name); }
const P5 = 'PlayStation 5 / PS5 Slim', X = 'Xbox Series X', S = 'Xbox Series S';
test('covers all 45 actual console records with no duplicate, missing or extra keys', () => {
  assert.equal(legacy.length, 45);
  const originalKeys = Array.from(legacy, r => r.gameId + '|' + r.system);
  assert.equal(new Set(originalKeys).size, 45);
  assert.deepEqual(evidence.listKeys().sort(), originalKeys.sort());
  for (const old of legacy) {
    const row = evidence.lookup(old.gameId, old.system);
    assert.equal(row.key, old.gameId + '|' + old.system);
    assert.equal(row.gameId, old.gameId);
    assert.equal(row.system, old.system);
    assert.ok(row.edition);
  }
});
test('unknown records contain no numerical modes or inherited legacy FPS', () => {
  const rows = Object.values(evidence.audit().records);
  assert.equal(rows.filter(r => r.status === 'unverified').length, 10);
  for (const row of rows.filter(r => r.status === 'unverified')) {
    assert.equal(row.modes.length, 0);
    assert.ok(row.limitations.length);
    assert.doesNotMatch(row.limitations.join(' '), /\b\d+(?:\+)?\s*FPS/i);
  }
  const missing = evidence.lookup('unknown-game', X);
  assert.equal(missing.status, 'unverified');
  assert.equal(missing.checkedAt, null);
  assert.deepEqual(missing.modes, []);
});
test('lookup is exact; no PS5 to PS5 Pro, Xbox or Switch to Switch 2 extrapolation', () => {
  assert.equal(evidence.lookup('fortnite', P5).modes[0].fps, 60);
  assert.deepEqual(evidence.lookup('fortnite', 'PlayStation 5 Pro').modes, []);
  assert.deepEqual(evidence.lookup('fortnite', 'PlayStation 5').modes, []);
  assert.deepEqual(evidence.lookup('fortnite', 'playstation 5 / ps5 slim').modes, []);
  assert.deepEqual(evidence.lookup('forza5', 'Xbox One X').modes, []);
  assert.deepEqual(evidence.lookup('mario-kart-8', 'Nintendo Switch 2').modes, []);
  assert.deepEqual(evidence.lookup('zelda-botw', 'Nintendo Switch 2').modes, []);
});
test('input validation rejects compound delimiter tricks and never uses prototype keys', () => {
  for (const [id, system] of [[{}, X], ['fortnite', {}], ['f|x', X], ['fortnite', 'a'.repeat(101)], ['__proto__', 'constructor']]) {
    assert.equal(evidence.lookup(id, system).status, 'unverified');
    assert.deepEqual(evidence.lookup(id, system).modes, []);
  }
  assert.equal(evidence.getSource('__proto__'), null);
});
test('every numerical mode has inspected evidence, correct classification and scope', () => {
  const audit = evidence.audit();
  for (const row of Object.values(audit.records)) for (const mode of row.modes) {
    assert.equal(mode.checkedAt, evidence.CHECKED_AT);
    assert.ok(mode.appliesTo.length);
    assert.ok(mode.limitations.length);
    const source = audit.sources[mode.sourceId];
    assert.ok(source);
    assert.equal(source.url, mode.sourceUrl);
    assert.equal(source.publisher, mode.publisher);
    assert.ok(source.inspection.startsWith('original-'));
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.equal(source.redistributionRights, 'not-established; linked paraphrase only');
    if (mode.fps === null) {
      assert.equal(mode.measurementStatus, 'unknown');
      assert.equal(evidence.formatFps(mode), 'FPS not verified');
    } else {
      assert.ok(Number.isFinite(mode.fps) && mode.fps > 0);
      assert.notEqual(mode.measurementStatus, 'unknown');
      if (mode.measurementStatus === 'original-measured') assert.equal(source.kind, 'original-analysis');
      if (mode.measurementStatus === 'original-observation') assert.equal(source.kind, 'original-observation');
      if (mode.measurementStatus === 'manufacturer-target') assert.ok(['manufacturer', 'manufacturer-interview'].includes(source.kind));
      assert.doesNotMatch(evidence.formatFps(mode), /average|1%|confidence/i);
    }
  }
});
test('PS4 Pro performance is unlocked from 30, not a fabricated 60 FPS target', () => {
  const mode = evidence.lookup('gowr', 'PlayStation 4 Pro').modes.find(m => m.name.includes('performance'));
  assert.equal(mode.fps, 30);
  assert.equal(mode.metric, 'unlocked-base');
  assert.equal(mode.resolution, '1080p–1656p dynamic');
  assert.equal(evidence.formatFps(mode), 'Unlocked (30 FPS base)');
  assert.doesNotMatch(evidence.formatFps(mode), /up to|60/i);
});
test('God of War PS5 HFR and Pro are distinct and do not promise 120 FPS', () => {
  const modes = evidence.lookup('gowr', P5).modes;
  assert.equal(modes.length, 6);
  assert.equal(modes.filter(m => m.metric === 'unlocked-base').length, 3);
  assert.ok(modes.every(m => m.fps <= 60));
  const pro = evidence.lookup('gowr', 'PlayStation 5 Pro').modes[0];
  assert.equal(pro.sourceId, 'gowr-pro');
  assert.equal(pro.sourceRevision, 'v06.00');
  assert.equal(pro.resolution, null);
});
test('Forza Series S quality corrects 1440p to 1080p; performance pixels stay unknown', () => {
  const modes = evidence.lookup('forza5', S).modes;
  assert.equal(modes[0].resolution, '1080p');
  assert.equal(modes[0].fps, 30);
  assert.equal(modes[1].fps, 60);
  assert.equal(modes[1].resolution, null);
  assert.equal(evidence.lookup('forza5', X).modes[1].resolution, null);
});
test('Sea of Thieves output Hz does not become FPS; no Series S 120 mode', () => {
  const modes = evidence.lookup('sea-thieves', X).modes;
  assert.equal(modes[0].fps, 60);
  assert.equal(modes[1].fps, null);
  assert.equal(evidence.formatFps(modes[1]), 'FPS not verified');
  const seriesS = evidence.lookup('sea-thieves', S);
  assert.equal(seriesS.modes.length, 1);
  assert.equal(seriesS.modes[0].fps, 60);
});
test('Switch resolution documentation is preserved without adding an unsupported FPS', () => {
  const modes = evidence.lookup('fortnite', 'Nintendo Switch').modes;
  assert.equal(modes.length, 2);
  assert.ok(modes.every(m => m.fps === null));
  assert.match(modes[0].resolution, /1560/);
  const switch2 = evidence.lookup('fortnite', 'Nintendo Switch 2').modes;
  assert.ok(switch2.every(m => m.fps === 60 && m.sourceId === 'epic-switch2'));
});
test('Switch Lite receives neither TV-mode nor untested Switch observations', () => {
  for (const id of ['mario-kart-8', 'mario-galaxy', 'mario-galaxy-2']) {
    assert.deepEqual(evidence.modesForSystem(id, 'Nintendo Switch / Switch Lite', 'Nintendo Switch Lite'), []);
    assert.deepEqual(evidence.modesForSystem(id, 'Nintendo Switch / Switch Lite', 'Switch Lite'), []);
    assert.ok(evidence.modesForSystem(id, 'Nintendo Switch / Switch Lite', 'Nintendo Switch').length);
    assert.match(evidence.lookup(id, 'Nintendo Switch / Switch Lite').limitations.join(' '), /no TV mode/);
  }
});
test('Mario Kart distinguishes two-player from three/four-player observations and editions', () => {
  const modes = evidence.lookup('mario-kart-8', 'Nintendo Switch / Switch Lite').modes;
  assert.deepEqual(modes.map(m => m.fps), [60, 60, 30]);
  assert.ok(modes.every(m => m.measurementStatus === 'original-observation'));
  const wii = evidence.lookup('mario-kart-8', 'Wii U');
  assert.match(wii.edition, /original Wii U/);
  assert.equal(wii.modes[0].measurementStatus, 'manufacturer-target');
  assert.equal(wii.modes[0].resolution, null);
});
test('Galaxy Wii evidence comes from the original developers, not the 2025 remaster', () => {
  for (const [id, sourceId] of [['mario-galaxy', 'galaxy-wii'], ['mario-galaxy-2', 'galaxy2-wii']]) {
    const original = evidence.lookup(id, 'Wii').modes[0];
    assert.equal(original.sourceId, sourceId);
    assert.equal(original.resolution, null);
    const remake = evidence.lookup(id, 'Nintendo Switch 2').modes;
    assert.ok(remake.every(m => m.sourceId === 'xtg-galaxy'));
    assert.equal(remake[0].resolutionSourceId, 'galaxy-2025');
    assert.equal(remake[1].resolution, null);
  }
});
test('Minecraft PC listing cannot establish console or upcoming native-release performance', () => {
  for (const system of ['Nintendo Switch / Switch Lite', 'Nintendo Switch 2']) {
    const record = evidence.lookup('minecraft-bedrock', system);
    assert.equal(record.status, 'unverified');
    assert.deepEqual(record.modes, []);
  }
  assert.match(evidence.lookup('minecraft-bedrock', 'Nintendo Switch 2').limitations.join(' '), /upcoming native/);
});
test('Skyrim retains historical FPS Boost context without 60+ or shared 4K claim', () => {
  const row = evidence.lookup('skyrim-se', 'Xbox Series X / Series S');
  assert.match(row.edition, /Backward-compatible/);
  assert.equal(row.modes[0].resolution, null);
  assert.equal(evidence.formatFps(row.modes[0]), 'Nearly 60 FPS (publisher statement)');
});
test('lookup and source mutations cannot poison later visitors or global audit data', () => {
  const row = evidence.lookup('gowr', 'PlayStation 4'); row.modes[0].fps = 999; row.limitations.push('fake');
  assert.equal(evidence.lookup('gowr', 'PlayStation 4').modes[0].fps, 30);
  const source = evidence.getSource('epic-2020'); source.url = 'https://example.com';
  assert.notEqual(evidence.getSource('epic-2020').url, source.url);
  const audit = evidence.audit(); delete audit.records['gowr|PlayStation 4'];
  assert.equal(evidence.lookup('gowr', 'PlayStation 4').status, 'supported');
});
test('safe formatting retains unknowns rather than accepting absent source, invalid FPS or unknown metric', () => {
  for (const mode of [null, {}, {fps: 60}, {fps: 60, metric:'target', sourceId:'unknown', measurementStatus:'manufacturer-target'}, {fps:null, metric:'target', sourceId:'epic-2020', measurementStatus:'manufacturer-target'}, {fps:120, metric:'target', sourceId:'epic-2020', measurementStatus:'unknown'}, {fps:NaN, metric:'target', sourceId:'epic-2020', measurementStatus:'manufacturer-target'}, {fps:120, metric:'invented-mean', sourceId:'epic-2020', measurementStatus:'manufacturer-target'}]) assert.equal(evidence.formatFps(mode), 'FPS not verified');
});
test('UMD runs in a browser without Node imports, network calls or legacy dataset dependency', () => {
  const browser = {};
  const code = fs.readFileSync(path.join(__dirname, 'program-console-evidence.cjs'), 'utf8');
  vm.runInNewContext(code, browser);
  assert.equal(browser.PCP_CONSOLE_EVIDENCE.listKeys().length, 45);
  assert.equal(browser.PCP_CONSOLE_EVIDENCE.lookup('war-thunder', X).modes[0].fps, 60);
  assert.doesNotMatch(code, /\b(?:fetch|XMLHttpRequest|localStorage)\s*\(/);
});
test('persisted audit covers the same exact keys and does not leak legacy claims into the module', () => {
  const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/program-2026-10-09/console-evidence.json'), 'utf8'));
  assert.equal(audit.version, evidence.VERSION);
  assert.deepEqual(audit.records.map(r => r.key).sort(), evidence.listKeys().sort());
  assert.equal(audit.counts.sourceCount, Object.keys(evidence.audit().sources).length);
  for (const row of audit.records) {
    const [gameId, system] = row.key.split('|');
    const actual = evidence.lookup(gameId, system);
    assert.equal(row.status, actual.status);
    assert.equal(row.supportedModes.length, actual.modes.length);
    if (row.status === 'unverified') assert.deepEqual(row.supportedModes, []);
  }
  assert.match(audit.review, /publication review pending/);
});
console.log('Console evidence checks: ' + tests + ' passed.');
