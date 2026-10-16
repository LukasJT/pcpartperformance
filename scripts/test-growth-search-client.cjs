'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('./growth-search-core.cjs');
const source = fs.readFileSync(path.join(__dirname, 'growth-search.js'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const fixtureRows = [
  { title: 'NVIDIA GeForce RTX 5070', url: '/learn/rtx5070.html', kind: 'Hardware specifications' },
  { title: 'MSI GeForce RTX 5070 VENTUS', url: '/learn/ventus.html', kind: 'Hardware specifications', identifiers: ['G5070-12V3C'] },
  { title: 'iPhone 16 vs Pixel 9', url: '/phones/compare/iphone-16-vs-pixel-9/', kind: 'Phone comparison' },
  { title: 'Will a graphics card fit your case?', url: '/blog/will-a-graphics-card-fit-my-case/', kind: 'Hardware guide' },
  { title: 'Compatibility Center', url: '/compatibility/', kind: 'Compatibility tool' }
];
function fixture({ rows = fixtureRows, href = 'https://www.pcpartperformance.com/search/', fetcher } = {}) {
  const document = { activeElement: null };
  class Element {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.listeners = new Map(); this.attributes = {}; this.dataset = {}; this.value = ''; this.id = ''; this.textContent = ''; this._html = ''; this.resultLinks = []; }
    addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
    emit(type, extra = {}) { const event = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra }; for (const fn of this.listeners.get(type) || []) fn(event); return event; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name] ?? null; }
    focus() { document.activeElement = this; }
    scrollIntoView(options) { this.scrollOptions = options; }
    set innerHTML(value) {
      this._html = value; this.resultLinks = [];
      for (const match of value.matchAll(/<a data-search-result-link href="([^"]+)">/g)) { const link = new Element('a'); link.href = match[1]; this.resultLinks.push(link); }
      this.retry = value.includes('data-search-retry') ? new Element('button') : null;
    }
    get innerHTML() { return this._html; }
    querySelectorAll(selector) { return selector === '[data-search-result-link]' ? this.resultLinks : []; }
    querySelector(selector) { return selector === 'button' ? this.retry : null; }
  }
  const form = new Element('form'), input = new Element('input'), output = new Element('section'), status = new Element('p');
  const buttons = ['all', 'hardware', 'comparisons', 'guides', 'tools', 'reports', 'data'].map(type => { const button = new Element('button'); button.dataset.searchType = type; return button; });
  form.elements = { q: input };
  document.querySelector = selector => ({ '.growth-site-search': form, '[data-growth-search-results]': output, '[data-growth-search-status]': status })[selector] || null;
  document.querySelectorAll = selector => selector === '[data-search-type]' ? buttons : [];
  const location = { href, get search() { return new URL(this.href).search; } };
  const replacements = [], timerQueue = new Map(), windowEvents = new Map(), fetchCalls = [];
  const context = {
    document, location, URL, URLSearchParams, PCP_SEARCH_CORE: core,
    history: { replaceState(state, unused, next) { location.href = String(next); replacements.push(location.href); } },
    window: { addEventListener(type, fn) { windowEvents.set(type, fn); } },
    setTimeout(fn) { const id = timerQueue.size + 1; timerQueue.set(id, fn); return id; },
    clearTimeout(id) { timerQueue.delete(id); },
    fetch: async url => { fetchCalls.push(url); return fetcher ? fetcher(url) : { ok: true, json: async () => rows }; }
  };
  vm.runInNewContext(source, context, { filename: 'growth-search.js' });
  return { document, form, input, output, status, buttons, location, replacements, timerQueue, fetchCalls, popstate: () => windowEvents.get('popstate')(), flush: () => { for (const fn of [...timerQueue.values()]) fn(); timerQueue.clear(); } };
}
const results = [];
async function test(name, run) { await run(); results.push(name); console.log('PASS ' + name); }
async function main() {
  await test('actual controller restores a bookmarked query and creates ordinary focusable result links', async () => {
    const f = fixture({ href: 'https://www.pcpartperformance.com/search/?q=GPU+wont+fit&type=guides' }); await tick();
    assert.equal(f.input.value, 'GPU wont fit'); assert.equal(f.output.resultLinks[0].href, '/blog/will-a-graphics-card-fit-my-case/');
    assert.equal(f.input.getAttribute('aria-controls'), f.output.id); assert.equal(f.input.getAttribute('aria-describedby'), f.status.id);
    assert.equal(f.output.getAttribute('aria-busy'), 'false'); assert.equal(f.document.activeElement, null);
    assert.ok(!f.output.innerHTML.includes('role="option"')); assert.equal(f.fetchCalls[0], '/data/search-index.json');
  });
  await test('keyboard arrows flush a pending query, focus results, and return to search without trapping Tab or Enter', async () => {
    const f = fixture(); await tick(); f.input.value = 'RTX5070'; f.input.emit('input'); f.input.focus();
    assert.equal(f.input.emit('keydown', { key: 'ArrowDown' }).defaultPrevented, true);
    const first = f.output.resultLinks[0], last = f.output.resultLinks.at(-1);
    assert.equal(f.document.activeElement, first); assert.ok(f.output.resultLinks.length > 1); assert.equal(f.timerQueue.size, 0);
    f.output.emit('keydown', { key: 'End' }); assert.equal(f.document.activeElement, last);
    f.output.emit('keydown', { key: 'Home' }); assert.equal(f.document.activeElement, first);
    f.output.emit('keydown', { key: 'ArrowUp' }); assert.equal(f.document.activeElement, f.input);
    f.input.emit('keydown', { key: 'ArrowUp' }); assert.equal(f.document.activeElement, f.output.resultLinks.at(-1));
    assert.equal(f.output.emit('keydown', { key: 'Tab' }).defaultPrevented, false);
    assert.equal(f.output.emit('keydown', { key: 'Enter' }).defaultPrevented, false);
    f.output.emit('keydown', { key: 'Escape' }); assert.equal(f.document.activeElement, f.input);
  });
  await test('comparison filtering is distinct, URL state persists, and browser history restores controls', async () => {
    const f = fixture({ href: 'https://www.pcpartperformance.com/search/?campaign=kept' }); await tick();
    f.input.value = 'iPhone'; f.input.emit('input'); f.flush(); f.buttons[2].emit('click');
    assert.equal(f.output.resultLinks.length, 1); assert.equal(f.buttons[2].getAttribute('aria-pressed'), 'true');
    assert.equal(new URL(f.location.href).searchParams.get('type'), 'comparisons'); assert.equal(new URL(f.location.href).searchParams.get('campaign'), 'kept');
    f.location.href = 'https://www.pcpartperformance.com/search/?q=RTX5070&type=hardware'; f.popstate();
    assert.equal(f.input.value, 'RTX5070'); assert.equal(f.buttons[1].getAttribute('aria-pressed'), 'true'); assert.equal(f.output.resultLinks.length, 2);
  });
  await test('typing during index loading is preserved and does not trigger a mobile keyboard automatically', async () => {
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const f = fixture({ href: 'https://www.pcpartperformance.com/search/?q=old', fetcher: () => pending });
    f.input.value = 'G5070-12V3C'; f.input.emit('input');
    release({ ok: true, json: async () => fixtureRows }); await tick();
    assert.equal(f.input.value, 'G5070-12V3C'); assert.equal(f.output.resultLinks.length, 1);
    assert.equal(f.output.resultLinks[0].href, '/learn/ventus.html'); assert.equal(f.document.activeElement, null);
  });
  await test('a failed index request has a working retry with the current query retained', async () => {
    let attempts = 0;
    const f = fixture({ fetcher: async () => { attempts++; if (attempts === 1) throw Error('network unavailable'); return { ok: true, json: async () => fixtureRows }; } });
    await tick(); assert.ok(f.output.retry); assert.ok(f.status.textContent.includes('temporarily unavailable'));
    f.input.value = 'GPU wont fit'; f.input.emit('input'); f.output.retry.emit('click'); await tick();
    assert.equal(attempts, 2); assert.equal(f.output.resultLinks[0].href, '/blog/will-a-graphics-card-fit-my-case/'); assert.equal(f.output.getAttribute('aria-busy'), 'false');
  });
  await test('untrusted index titles are escaped and unsafe destinations never become links', async () => {
    const f = fixture({ href: 'https://www.pcpartperformance.com/search/?q=malicious', rows: [
      { title: 'malicious <img src=x onerror=alert(1)>', url: '/learn/example.html', kind: '<script>bad</script>' },
      { title: 'malicious unsafe destination', url: '//evil.example/x' }, null
    ] }); await tick();
    assert.equal(f.output.resultLinks.length, 1); assert.ok(f.output.innerHTML.includes('&lt;img')); assert.ok(!f.output.innerHTML.includes('<img'));
    assert.ok(f.output.innerHTML.includes('&lt;script&gt;')); assert.ok(!f.output.innerHTML.includes('evil.example'));
  });
  await test('empty and malformed responses remain usable and do not create a fake successful result', async () => {
    const f = fixture(); await tick(); assert.equal(f.output.resultLinks.length, 0); assert.ok(f.status.textContent.includes('Enter a model'));
    f.input.value = 'unknown'; f.input.emit('input'); f.flush(); assert.equal(f.output.resultLinks.length, 0); assert.ok(f.output.innerHTML.includes('Check the exact model'));
    const broken = fixture({ rows: { not: 'an array' } }); await tick(); assert.ok(broken.output.retry); assert.equal(broken.output.resultLinks.length, 0);
  });
  console.log(JSON.stringify({ passed: results.length, scope: 'actual browser controller in a minimal DOM/event fixture; not a rendered-browser claim' }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
