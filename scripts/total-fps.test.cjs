'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const mod = require('./total-fps.cjs');
const source = fs.readFileSync(path.join(__dirname, '../dist/performance.js'), 'utf8');
function runtime(query = '') {
  const nodes = new Map(), buttons = [], history = [];
  class Element {
    constructor(id, data = {}) { this.id = id; this.dataset = data; this.events = {}; this.attributes = {}; this.value = ''; this.hidden = false; this.checked = false; this.options = []; this.classList = { toggle() {}, add() {} }; }
    set innerHTML(value) { this.html = value; this.options = [...value.matchAll(/<option value="([^"]*)"/g)].map(m => ({ value: m[1] })); if (!this.value && this.options.length) this.value = this.options[0].value; }
    get innerHTML() { return this.html || ''; }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    dispatchEvent(event) { for (const fn of this.events[event.type] || []) fn({ target: this }); }
    click() { this.dispatchEvent({ type: 'click' }); }
    setAttribute(key, value) { this.attributes[key] = value; }
    querySelectorAll() { return []; }
    scrollIntoView() {}
  }
  for (const id of ['fps-gpu','fps-cpu','fps-game','fps-resolution','fps-quality','fps-upscale','fps-controls','fps-result','game-library-grid','game-library-count','game-show-all','game-search','game-reset','game-genres','pc-fps-view','console-fps-view','console-models','console-count','console-results','console-show-more','console-search','console-high-fps','console-reset']) nodes.set('#' + id, new Element(id));
  nodes.set('.fps-workbench', new Element('workbench'));
  nodes.get('#fps-resolution').value = '1440'; nodes.get('#fps-quality').value = 'high'; nodes.get('#fps-upscale').value = 'native';
  for (const value of ['pc','console']) buttons.push(new Element('', { fpsView: value }));
  for (const value of ['all','playstation','xbox','nintendo']) buttons.push(new Element('', { consoleFamily: value }));
  for (const [value] of mod.platforms) buttons.push(new Element('', { totalPlatform: value }));
  const kinds = { 'data-fps-view': 'fpsView', 'data-console-family': 'consoleFamily', 'data-total-platform': 'totalPlatform' };
  function selectAll(selector) { const m = selector.match(/^\[(data-[a-z-]+)(?:="([^"]+)")?\]$/); return m && kinds[m[1]] ? buttons.filter(b => kinds[m[1]] in b.dataset && (!m[2] || b.dataset[kinds[m[1]]] === m[2])) : []; }
  const context = { window: { performanceGames: [
    { id: 'fortnite', name: 'Fortnite', series: 'Fortnite', genre: 'Battle royale', year: 2017, art: '/safe.svg' },
    { id: 'portal', name: 'Portal', series: 'Portal', genre: 'Puzzle', year: 2007, art: '/safe.svg' },
    { id: 'unannounced', name: 'Unannounced PC edition', series: 'Example', genre: 'Action', year: null, art: '', pcReleaseConfirmed: false, sourceUrl: 'https://example.com/' }
  ], consolePerformanceGames: [
    { gameId: 'a', game: 'PS5 Game', system: 'PlayStation 5 / PS5 Slim', family: 'playstation' },
    { gameId: 'b', game: 'Pro Game', system: 'PlayStation 5 Pro', family: 'playstation' },
    { gameId: 'c', game: 'Xbox Game', system: 'Xbox Series X / Series S', family: 'xbox' },
    { gameId: 'd', game: 'Switch Game', system: 'Nintendo Switch 2', family: 'nintendo' }
  ] }, catalog: [
    { id: 'rtx5070', cat: 'gpu', name: 'RTX 5070', specs: { 'PassMark G3D': 30000 } },
    { id: '9800x3d', cat: 'cpu', name: 'Ryzen 7 9800X3D', specs: { 'CPU cores': 8 } }
  ], document: { querySelector: selector => nodes.get(selector) || selectAll(selector)[0], querySelectorAll: selectAll }, location: { href: 'https://example.com/performance/' + query, search: query }, URL, URLSearchParams, Event: class { constructor(type) { this.type = type; } }, history: { replaceState(_, __, url) { context.location.href = String(url); history.push(String(url)); } }, matchMedia: () => ({ matches: true }) };
  vm.runInNewContext(source, context);
  return { nodes, buttons, context, history, choose: value => buttons.find(b => b.dataset.totalPlatform === value).click() };
}
test('page introduces platform -> game -> setup and isolates methodology without a legacy calculator', () => {
  const fixture = '<html><head><link rel="stylesheet" href="/performance.css"></head><body><section class="fps-hero"><h1>Old</h1></section><form class="fps-controls" id="fps-controls"><details class="growth-legacy-model"><input id="fps-experimental"></details></form><aside class="growth-evidence-strip">Counts</aside><div class="fps-explainer">Long explanation</div><div id="console-results" class="console-results"></div></body></html>';
  const html = mod.polish(fixture, '/performance/');
  assert.equal((html.match(/data-total-platform=/g) || []).length, 8);
  assert(html.includes('Choose a game')); assert(html.includes('Graphics settings')); assert(html.includes('How to read these results'));
  assert(!html.includes('fps-experimental')); assert(!html.includes('growth-legacy-model')); assert(!html.includes('performance.css'));
  assert.equal(mod.polish(html, '/performance/'), html); assert.equal(mod.polish(fixture, '/builder/'), fixture);
});
test('unsupported PC combinations show one concise evidence state, never synthetic FPS', () => {
  const r = runtime(); const html = r.nodes.get('#fps-result').innerHTML;
  assert(html.includes('No verified benchmark is available for this exact setup.'));
  assert(!html.includes('assumed FPS')); assert(!/Math\.pow|function estimate\(/.test(source));
  assert(html.includes('Selected setup and sources')); assert(html.includes('RTX 5070'));
});
test('officially unannounced PC release does not become a performance result', () => {
  const r = runtime('?game=unannounced'); assert(r.nodes.get('#fps-result').innerHTML.includes('A PC release is not confirmed'));
});
test('PS5 and Pro filters preserve exact console identities and PC switch restores the form', () => {
  const r = runtime(); r.choose('ps5');
  assert(r.nodes.get('#pc-fps-view').hidden); assert(!r.nodes.get('#console-fps-view').hidden);
  assert(r.nodes.get('#console-results').innerHTML.includes('PS5 Game')); assert(!r.nodes.get('#console-results').innerHTML.includes('Pro Game'));
  r.choose('ps5pro'); assert(r.nodes.get('#console-results').innerHTML.includes('Pro Game')); assert(!r.nodes.get('#console-results').innerHTML.includes('PS5 Game'));
  r.choose('pc'); assert(!r.nodes.get('#pc-fps-view').hidden); assert(r.nodes.get('#console-fps-view').hidden);
  assert(r.history.at(-1).includes('platform=pc'));
});
test('URL restores console choice without inventing benchmarks and grouped Xbox release stays grouped', () => {
  const r = runtime('?platform=series-s'); assert(r.nodes.get('#pc-fps-view').hidden);
  assert(r.nodes.get('#console-results').innerHTML.includes('Xbox Series X / Series S'));
  assert(r.nodes.get('#console-results').innerHTML.includes('No verified FPS'));
  assert(!r.nodes.get('#console-results').innerHTML.includes('PS5 Game'));
});
test('search and reset update the game library without recalculating or removing the setup', () => {
  const r = runtime(), input = r.nodes.get('#game-search'); input.value = 'Portal'; input.dispatchEvent({ type: 'input' });
  assert(r.nodes.get('#game-library-grid').innerHTML.includes('Portal')); assert(!r.nodes.get('#game-library-grid').innerHTML.includes('Fortnite'));
  assert(r.nodes.get('#fps-result').innerHTML.includes('Fortnite'));
  r.nodes.get('#game-reset').click(); assert(r.nodes.get('#game-library-grid').innerHTML.includes('Fortnite'));
});
test('source and responsive CSS remove the oversize mobile settings and bound initial card DOM', () => {
  const css = fs.readFileSync(path.join(__dirname, 'total-fps.css'), 'utf8');
  assert(css.includes('height:46px')); assert(css.includes('grid-template-columns:1fr 1fr!important'));
  assert(source.includes('libraryLimit=12')); assert(source.includes('consoleLimit=24')); assert(source.includes('matches.slice(0,consoleLimit)'));
});
