'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const reportFile = path.join(root, 'docs/program-2026-10-11/client-test-results.json');
const sourceFiles = ['scripts/prebuilt-ui.js', 'scripts/prebuilt-pages.cjs', 'scripts/morning-prices-ui.js', 'scripts/worker.mjs'];
const sources = new Map(sourceFiles.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const now = Date.parse('2026-10-11T15:00:00.000Z');
const results = [];
const describe = value => JSON.stringify(value, (_, item) => item === undefined ? '<undefined>' : typeof item === 'number' && !Number.isFinite(item) ? String(item) : item);

// Minimal standards-shaped DOM, events and FormData. No client calculation/filter logic is copied.
const camel = name => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
function decode(text) { return text.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, value => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'" })[value]); }
class Element {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null; this.attributes = {}; this.dataset = {}; this.listeners = new Map(); this.hidden = false; this.checked = false; this.disabled = false; this.value = ''; this.defaultValue = ''; this._text = ''; }
  setAttribute(name, value = '') {
    this.attributes[name] = String(value);
    if (name.startsWith('data-')) this.dataset[camel(name.slice(5))] = String(value);
    if (name === 'class') this.className = String(value);
    if (['id', 'name', 'type'].includes(name)) this[name] = String(value);
    if (name === 'value') this.value = this.defaultValue = String(value);
    if (['hidden', 'checked', 'disabled'].includes(name)) this[name] = true;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  append(...children) { for (let child of children) { if (!(child instanceof Element)) { const node = new Element('#text'); node._text = String(child); child = node; } if (child.parentNode) child.parentNode.children.splice(child.parentNode.children.indexOf(child), 1); child.parentNode = this; this.children.push(child); } }
  replaceChildren(...children) { for (const child of this.children) child.parentNode = null; this.children = []; this._text = ''; this.append(...children); }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.replaceChildren(); this._text = value == null ? '' : String(value); }
  matches(selector) {
    const parts = selector.trim().split(/\s+/); let node = this;
    if (!node.matchesSimple(parts.pop())) return false;
    while (parts.length) { const part = parts.pop(); node = node.parentNode; while (node && !node.matchesSimple(part)) node = node.parentNode; if (!node) return false; }
    return true;
  }
  matchesSimple(selector) {
    if (selector.endsWith(':checked')) { if (!this.checked) return false; selector = selector.slice(0, -8); }
    const tag = selector.match(/^[a-zA-Z][\w-]*/); if (tag && this.tagName !== tag[0].toUpperCase()) return false;
    const id = selector.match(/#([\w-]+)/); if (id && this.id !== id[1]) return false;
    for (const [, name] of selector.matchAll(/\.([\w-]+)/g)) if (!(this.className || '').split(/\s+/).includes(name)) return false;
    for (const [, name, value] of selector.matchAll(/\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)) {
      const actual = name.startsWith('data-') ? this.dataset[camel(name.slice(5))] : this[name] ?? this.attributes[name];
      if (actual === undefined || actual === null || (value !== undefined && String(actual) !== value)) return false;
    }
    return true;
  }
  querySelectorAll(selector) { const result = []; const visit = element => { for (const child of element.children) { if (child.matches(selector)) result.push(child); visit(child); } }; visit(this); return result; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(handler); }
  dispatchEvent(event) {
    event.target ||= this; event.currentTarget = this; event.preventDefault ||= () => { event.defaultPrevented = true; };
    for (const handler of this.listeners.get(event.type) || []) handler(event);
    if (event.bubbles !== false && this.parentNode) this.parentNode.dispatchEvent(event);
    return !event.defaultPrevented;
  }
  emit(type, extra = {}) { return this.dispatchEvent({ type, bubbles: true, ...extra }); }
  click() { if (!this.disabled) this.emit('click'); }
  reset() { this.emit('reset'); for (const field of this.querySelectorAll('input[name]')) field.value = field.defaultValue; }
  scrollIntoView(options) { this.scrollOptions = options; }
}
class Document extends Element { constructor() { super('document'); this.documentElement = this; } createElement(tag) { return new Element(tag); } }
function parseHTML(html) {
  const document = new Document(), stack = [document], voids = new Set(['INPUT', 'IMG', 'META', 'LINK', 'BR', 'HR', 'SOURCE']);
  for (const token of html.match(/<\/?[a-zA-Z][^>]*>|[^<]+/g) || []) {
    if (token.startsWith('</')) { const name = token.match(/^<\/([\w-]+)/)[1].toUpperCase(), index = stack.findLastIndex(node => node.tagName === name); if (index >= 1) stack.length = index; continue; }
    if (token.startsWith('<')) {
      const match = token.match(/^<([\w-]+)([\s\S]*?)\/?>(?:$)/); if (!match) continue;
      const element = new Element(match[1]);
      for (const attribute of match[2].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) element.setAttribute(attribute[1], decode(attribute[2] ?? attribute[3] ?? attribute[4] ?? ''));
      stack.at(-1).append(element); if (!voids.has(element.tagName) && !token.endsWith('/>')) stack.push(element);
    } else stack.at(-1).append(decode(token));
  }
  return document;
}
function storage(initial = {}, unavailable = false) {
  const values = new Map(Object.entries(initial));
  return { values, getItem(key) { if (unavailable) throw Error('Synthetic unavailable storage'); return values.get(key) ?? null; }, setItem(key, value) { if (unavailable) throw Error('Synthetic unavailable storage'); values.set(key, String(value)); } };
}
class TestFormData { constructor(form) { this.values = form.querySelectorAll('input[name]').filter(input => !input.disabled && (input.type !== 'checkbox' || input.checked)).map(input => [input.name, input.value]); } [Symbol.iterator]() { return this.values[Symbol.iterator](); } }
function clocks() {
  let time = now, sequence = 0; const timers = new Map();
  class FakeDate extends Date { constructor(...args) { super(...(args.length ? args : [time])); } static now() { return time; } }
  return { Date: FakeDate, setTimeout(callback, ms) { const id = ++sequence; timers.set(id, { callback, at: time + ms }); return id; }, clearTimeout(id) { timers.delete(id); }, async advance(ms) { time += ms; for (const [id, timer] of [...timers]) if (timer.at <= time) { timers.delete(id); timer.callback(); } await settle(); } };
}
async function settle() { for (let i = 0; i < 16; i++) await Promise.resolve(); }
function runClient(file, document, extras = {}) {
  const timing = clocks(), localStorage = extras.localStorage || storage(), location = { origin: 'https://www.pcpartperformance.com', search: '', href: 'https://www.pcpartperformance.com/prebuilts/', ...extras.location };
  const context = vm.createContext({ document, localStorage, location, URL, URLSearchParams, Intl, FormData: TestFormData, AbortController, console, matchMedia: () => ({ matches: true }), ...timing, window: {}, ...extras });
  vm.runInContext(sources.get(file), context, { filename: file });
  return { context, timing, localStorage, location };
}
function generatedPrebuilts() {
  const output = new Map(), files = new Map(), generatorFile = path.join(root, 'scripts/prebuilt-pages.cjs');
  const context = vm.createContext({ module: { exports: {} }, __dirname: path.dirname(generatorFile), console, require(name) { if (name === 'fs') return { writeFileSync(file, value) { files.set(file, value); }, copyFileSync() {} }; if (name === 'path') return path; return require(path.resolve(path.dirname(generatorFile), name)); } });
  vm.runInContext(sources.get('scripts/prebuilt-pages.cjs'), context, { filename: generatorFile });
  context.module.exports({ root: '/synthetic-in-memory', shell: (title, type, body) => '<html><head></head><body>' + body + '</body></html>', write: (route, html) => output.set(route, html), esc: value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') });
  return { html: output.get('prebuilts'), systems: JSON.parse([...files.values()][0]).systems };
}
const generated = generatedPrebuilts();
function addCountries(document) {
  const group = document.createElement('div'); group.setAttribute('class', 'country-switch');
  for (const region of ['CA', 'US']) { const button = document.createElement('button'); button.setAttribute('data-region', region); group.append(button); }
  document.append(group); return group;
}
function prebuiltHarness({ initial = {}, unavailable = false, catalogFailure = false, catalogData = { systems: generated.systems } } = {}) {
  const document = parseHTML(generated.html); addCountries(document);
  const localStorage = storage(initial, unavailable);
  const app = runClient('scripts/prebuilt-ui.js', document, { localStorage, fetch: async () => { if (catalogFailure) throw Error('Synthetic catalog network failure'); return { ok: true, json: async () => catalogData }; } });
  const select = (id, checked = true) => { const checkbox = document.querySelector('[data-prebuilt-compare="' + id + '"]'); checkbox.checked = checked; checkbox.emit('change'); };
  const field = name => document.querySelector('input[name="' + name + '"]');
  const setQuote = values => { for (const [key, value] of Object.entries(values)) field(key).value = String(value); };
  return { ...app, document, select, field, setQuote, submit: () => document.querySelector('[data-buy-worksheet]').emit('submit'), country: region => document.querySelector('.country-switch [data-region="' + region + '"]').click(), quote: () => document.querySelector('[data-buy-result]').textContent, visible: () => document.querySelectorAll('[data-prebuilt-id]').filter(card => !card.hidden) };
}
function morningOffer(id = 'fixture-cpu', overrides = {}) {
  const offer = { schema: 1, policy: 'daily-checked-snapshot', productId: id, retailerSku: '1000001', sku: 'SYNTHETIC-MODEL', modelNumber: 'SYNTHETIC-MODEL', name: 'Synthetic exact product', exactVariant: true, variant: null, memoryVariant: null, revision: null, merchantId: 'bestbuy-us', merchant: 'Best Buy', seller: 'Best Buy', region: 'US', currency: 'USD', price: 100, availability: 'in-stock', inStock: true, availabilityBasis: 'online-purchasable-not-store-inventory', condition: 'new', checkedAt: new Date(now - 1000).toISOString(), expiresAt: new Date(now + 3600000).toISOString(), eligible: true, stale: false, url: 'https://api.bestbuy.com/click/syntheticPublicLink/1000001/pdp', source: { id: 'synthetic-source', kind: 'authorized-retailer-api', publisher: 'Best Buy', attribution: 'Best Buy', logoUrl: 'https://developer.bestbuy.com/images/bestbuy-logo.png', url: 'https://api.bestbuy.com/click/syntheticPublicLink/1000001/pdp' } };
  return { ...offer, ...overrides, source: overrides.source === undefined ? offer.source : overrides.source === null ? null : { ...offer.source, ...overrides.source } };
}
function morningHarness({ payload = { status: 'daily_checked', offers: [morningOffer()] }, parts = { cpu: ['fixture-cpu'] }, owned = [], ids = null, region = 'US', failed = false, fetchImpl } = {}) {
  const document = parseHTML('<section data-morning-prices' + (ids ? ' data-morning-ids="' + ids + '"' : '') + '><p data-morning-status></p><div data-morning-results></div><button data-morning-refresh></button></section>');
  addCountries(document);
  for (const id of owned) { const input = document.createElement('input'); input.setAttribute('data-program-owned', id); input.checked = true; document.append(input); }
  let currentPayload = payload, currentParts = parts; const calls = [];
  const localStorage = storage({ 'pcp-region': region });
  const app = runClient('scripts/morning-prices-ui.js', document, { localStorage, window: { PCP_BUILD: { snapshot: () => ({ parts: currentParts }) } }, fetch: async (url, options) => { calls.push({ url, options }); if (fetchImpl) return fetchImpl(url, options); if (failed) throw Error('Synthetic API outage'); return { ok: true, json: async () => currentPayload }; } });
  return { ...app, document, calls, setPayload: value => { currentPayload = value; }, setParts: value => { currentParts = value; }, refresh: () => document.querySelector('[data-morning-refresh]').click(), buildChanged: () => document.emit('pcp:build-state'), status: () => document.querySelector('[data-morning-status]').textContent, results: () => document.querySelector('[data-morning-results]'), country: value => { localStorage.setItem('pcp-region', value); document.querySelector('.country-switch [data-region="' + value + '"]').click(); } };
}
async function test(id, name, execute) {
  try { await execute(); results.push({ id, name, status: 'passed' }); console.log('PASS ' + name); }
  catch (error) { const failure = { id, name, status: 'failed', message: error.message.slice(0, 1500) }; results.push(failure); console.log('FAIL ' + name + ': ' + failure.message); }
}
(async () => {
  await test('prebuilt-initial-markup', 'generated prebuilt markup initializes the actual browser controller', async () => { const h = prebuiltHarness(); await settle(); assert(h.document.querySelector('[data-buy-currency]')); assert.equal(h.quote(), 'Enter quotes to compare the complete cost.'); });
  await test('prebuilt-filter', 'prebuilt country, case-insensitive search and GPU filters intersect and reset', async () => {
    const h = prebuiltHarness(); await settle(); assert.equal(h.visible().length, Math.min(12,generated.systems.filter(system => system.region === 'CA').length));
    const query = h.document.querySelector('#prebuilt-search'), gpu = h.document.querySelector('#prebuilt-gpu'); const candidate = generated.systems.find(system => system.region === 'CA'); query.value = candidate.name.toUpperCase(); query.emit('input'); assert(h.visible().every(card => card.dataset.name.includes(candidate.name.toLowerCase())));
    query.value = ''; query.emit('input'); gpu.value = candidate.gpu; gpu.emit('change'); assert(h.visible().every(card => card.dataset.gpu === candidate.gpu)); h.document.querySelector('[data-prebuilt-reset]').click(); assert.equal(h.visible().length, Math.min(12,generated.systems.filter(system => system.region === 'CA').length));
    h.document.querySelector('[data-prebuilt-more]').click();assert.equal(h.visible().length,24);const brand=h.document.querySelector('#prebuilt-brand');brand.value=candidate.brand||candidate.merchant;brand.emit('change');assert(h.visible().every(card=>card.dataset.brand===brand.value));h.document.querySelector('[data-prebuilt-reset]').click();h.country('US'); assert(h.visible().length > 0); assert(h.visible().every(card => card.dataset.prebuiltRegion === 'US'));
  });
  await test('prebuilt-cap-save', 'shortlist selects up to three, supports removal, saves and restores exact IDs', async () => {
    const h = prebuiltHarness(); await settle(); const systems = generated.systems.filter(system => system.region === 'CA'); assert(systems.length >= 4); systems.slice(0, 4).forEach(system => h.select(system.id)); assert.equal(h.document.querySelectorAll('[data-prebuilt-compare]').filter(input => input.checked).length, 3); assert.match(h.document.querySelector('[data-prebuilt-status]').textContent, /up to three/);
    h.select(systems[1].id, false); h.select(systems[3].id); h.document.querySelector('[data-prebuilt-save]').click(); const saved = JSON.parse(h.localStorage.values.get('pcp-prebuilt-shortlist')); assert.deepEqual(saved, [systems[0].id, systems[2].id, systems[3].id]);
    const restored = prebuiltHarness({ initial: { 'pcp-prebuilt-shortlist': JSON.stringify(saved) } }); await settle(); assert.deepEqual(restored.document.querySelectorAll('[data-prebuilt-compare]').filter(input => input.checked).map(input => input.dataset.prebuiltCompare).sort(), [...saved].sort());
  });
  await test('prebuilt-comparison', 'selected systems render real specification columns and unknown values stay explicit', async () => {
    const h = prebuiltHarness(); await settle(); const pair = generated.systems.filter(system => system.region === 'CA').slice(0, 2); pair.forEach(system => h.select(system.id)); h.document.querySelector('[data-prebuilt-open-compare]').click(); const panel = h.document.querySelector('[data-prebuilt-comparison]'); assert.equal(panel.hidden, false); assert.equal(panel.querySelectorAll('thead th').length, 3); for (const system of pair) assert(panel.textContent.includes(system.name)); assert(panel.textContent.includes('Motherboard')); assert(panel.textContent.includes('Seller')); assert(panel.textContent.includes('Not verified'));
  });
  await test('prebuilt-quote-unknown', 'blank, whitespace and invalid required costs never become known zero totals', async () => {
    const h = prebuiltHarness(); await settle(); const valid = { prebuilt: 1000, prebuiltDelivery: 20, parts: 850, os: 50, support: 25, delivery: 15 }; h.setQuote(valid);
    for (const value of ['', '  ', '-1', 'Infinity', '1000001', 'bad']) { h.field('os').value = value; h.submit(); assert.match(h.quote(), /Complete every required quote/); assert(!h.quote().includes('CAD')); }
  });
  await test('prebuilt-quote-totals', 'complete explicit quotes calculate exact totals, zero, equality and USD/CAD labels', async () => {
    const h = prebuiltHarness(); await settle(); h.setQuote({ prebuilt: 1000.5, prebuiltDelivery: 20.25, parts: 850, os: 50, support: 25, delivery: 15 }); h.submit(); assert.match(h.quote(), /Prebuilt: CAD\s*1,020\.75/); assert.match(h.quote(), /DIY: CAD\s*940\.00/); assert.match(h.quote(), /CAD\s*80\.75 less for DIY/);
    h.setQuote({ prebuilt: 0, prebuiltDelivery: 0, parts: 0, os: 0, support: 0, delivery: 0 }); h.submit(); assert.match(h.quote(), /same total/); assert.match(h.quote(), /CAD\s*0\.00/);
    h.setQuote({ prebuilt: '1000.10', prebuiltDelivery: '20.20', parts: '1000.30', os: '0.00', support: '0.00', delivery: '20.00' }); h.submit(); assert.match(h.quote(), /same total/, 'Equal cent-valued quotes must not produce a CAD 0.00 less claim'); assert.match(h.quote(), /CAD\s*1,020\.30/);
    h.country('US'); h.setQuote({ prebuilt: 100, prebuiltDelivery: 0, parts: 90, os: 0, support: 0, delivery: 0 }); h.submit(); assert.match(h.quote(), /USD\s*100\.00/); assert(!h.quote().includes('CAD'));
  });
  await test('prebuilt-quote-countries', 'country switches preserve separate unsaved and saved CAD/USD quote sets', async () => {
    const h = prebuiltHarness(); await settle(); const ca = { prebuilt: 1200, prebuiltDelivery: 60, parts: 1000, os: 50, support: 20, delivery: 30 }, us = { prebuilt: 900, prebuiltDelivery: 45, parts: 700, os: 25, support: 10, delivery: 20 };
    h.setQuote(ca); h.submit(); h.country('US'); assert.equal(h.field('prebuilt').value, ''); assert(!h.quote().includes('CAD')); h.setQuote(us); h.country('CA'); assert.equal(h.field('prebuilt').value, '1200'); h.submit(); assert.match(h.quote(), /CAD\s*1,260\.00/); h.document.querySelector('[data-buy-save]').click();
    const saved = JSON.parse(h.localStorage.values.get('pcp-build-vs-buy')); assert.equal(saved.version, 2); assert.equal(saved.quotes.CA.prebuilt, '1200'); assert.equal(saved.quotes.US.prebuilt, '900');
    const restored = prebuiltHarness({ initial: { 'pcp-region': 'US', 'pcp-build-vs-buy': JSON.stringify(saved) } }); await settle(); assert.equal(restored.field('prebuilt').value, '900'); restored.country('CA'); assert.equal(restored.field('prebuilt').value, '1200');
  });
  await test('prebuilt-storage-failure', 'unavailable storage preserves interactive filtering and truthful save failure messages', async () => {
    const h = prebuiltHarness({ unavailable: true }); await settle(); h.select(generated.systems[0].id); h.document.querySelector('[data-prebuilt-save]').click(); assert.match(h.document.querySelector('[data-prebuilt-status]').textContent, /Saving is unavailable/); h.document.querySelector('[data-buy-save]').click(); assert.match(h.document.querySelector('[data-buy-save-status]').textContent, /storage is unavailable/);
  });
  await test('prebuilt-catalog-failure', 'catalog network failure leaves quote calculation usable with a visible error', async () => {
    const h = prebuiltHarness({ catalogFailure: true }); await settle(); assert.match(h.document.querySelector('[data-prebuilt-status]').textContent, /comparison data is unavailable/); h.setQuote({ prebuilt: 100, prebuiltDelivery: 0, parts: 90, os: 0, support: 0, delivery: 0 }); h.submit(); assert.match(h.quote(), /CAD\s*100\.00/);
  });
  await test('morning-disabled-failure', 'disabled, unconfigured and failed daily checks display no price rows', async () => {
    for (const state of ['disabled', 'not_configured']) { const h = morningHarness({ payload: { status: state, offers: [morningOffer()] } }); await settle(); assert.match(h.status(), /not available yet/); assert.equal(h.results().querySelectorAll('a').length, 0); }
    const failed = morningHarness({ failed: true }); await settle(); assert.match(failed.status(), /unavailable/); assert.equal(failed.results().querySelectorAll('a').length, 0);
  });
  await test('morning-stale-region-stock', 'malformed, stale, wrong country/currency and stock missing observations never display a price', async () => {
    const mutations = [{ schema: 2 }, { price: '100' }, { price: NaN }, { price: -1 }, { expiresAt: new Date(now - 1).toISOString() }, { checkedAt: new Date(now + 1).toISOString() }, { expiresAt: new Date(now + 2 * 86400000).toISOString() }, { checkedAt: 'invalid' }, { region: 'CA' }, { currency: 'CAD' }, { inStock: undefined }, { inStock: null }, { inStock: false }, { exactVariant: false }, { eligible: false }, { policy: 'current-offer' }, { productId: 'unrequested-product' }, { condition: 'refurbished' }, { source: null }, { source: { logoUrl: undefined } }];
    for (const change of mutations) { const h = morningHarness({ payload: { status: 'daily_checked', offers: [morningOffer('fixture-cpu', change)] } }); await settle(); assert.equal(h.results().querySelectorAll('a').length, 0, describe(change)); assert(!h.status().includes('subtotal')); }
  });
  await test('morning-quantity-owned', 'daily subtotal multiplies repeated exact parts and excludes owned parts', async () => {
    const h = morningHarness({ parts: { cpu: ['fixture-cpu', 'fixture-cpu'], gpu: ['fixture-owned'], ssd: ['fixture-missing'] }, owned: ['fixture-owned'], payload: { status: 'daily_checked', offers: [morningOffer(), morningOffer('fixture-owned', { price: 500 })] } }); await settle(); assert.match(h.status(), /Partial morning-checked subtotal: USD\s*200\.00/); assert.match(h.status(), /2 of 3 new items priced/); assert.equal(h.results().querySelectorAll('li').length, 1); assert.match(h.results().textContent, /× 2/); assert(!h.results().textContent.includes('500.00'));
  });
  await test('morning-owned-change', 'toggling an owned part updates the displayed purchase subtotal and price rows', async () => {
    const h = morningHarness({ owned: ['fixture-cpu'] }); await settle(); assert.equal(h.results().querySelectorAll('a').length, 0); const owned = h.document.querySelector('[data-program-owned="fixture-cpu"]'); owned.checked = false; owned.emit('change'); await h.timing.advance(150); assert.match(h.status(), /USD\s*100\.00/); owned.checked = true; owned.emit('change'); await h.timing.advance(150); assert.equal(h.results().querySelectorAll('a').length, 0); assert(!h.status().includes('subtotal'));
  });
  await test('morning-attribution-link-logo', 'daily rows retain the exact provided link, approved logo, seller and checked price basis', async () => {
    const offer = morningOffer(); const h = morningHarness({ payload: { status: 'daily_checked', offers: [offer] } }); await settle(); const link = h.results().querySelector('a'), logo = h.results().querySelector('img'); assert.equal(link.href, offer.url); assert.equal(link.target, '_blank'); assert.equal(link.rel, 'noopener'); assert.equal(logo.src, offer.source.logoUrl); assert.equal(logo.alt, 'Best Buy'); assert.match(h.results().textContent, /Best Buy · New · Available online · Checked/); assert.match(h.results().textContent, /Tax and shipping excluded/); assert.match(h.results().textContent, /Lowest among the checked stores/);
  });
  await test('morning-invalid-link-logo', 'wrong SKU/direct link and unapproved logo URLs cannot display prices', async () => {
    const cases = [{ url: 'https://www.bestbuy.com/site/1000002.p?skuId=1000002' }, { url: 'https://api.bestbuy.com/click/syntheticPublicLink/1000002/pdp' }, { url: 'https://api.bestbuy.com/v1/products/1000001.json?apiKey=private' }, { url: 'https://www.bestbuy.com@evil.invalid/1000001.p' }, { url: 'https://user:secret@www.bestbuy.com/site/1000001.p' }, { url: 'https://www.bestbuy.com:8443/site/1000001.p' }, { url: 'https://www.bestbuy.com/site/1000001.p#checkout' }, { url: 'https://www.bestbuy.com/site/1000001.p?skuId=1000001&skuId=1000002' }, { url: 'https://www.bestbuy.com/site/1000001.p?token=syntheticSecret' }, { url: 'http://www.bestbuy.com/site/1000001.p' }, { source: { logoUrl: 'https://developer.bestbuy.com/images/other.png' } }, { source: { logoUrl: 'https://evil.invalid/logo.png' } }, { source: { logoUrl: '/assets/retailers/unapproved.svg?secret=one' } }, { source: { logoUrl: '/assets/retailers/approved.svg#alternate' } }, { source: { logoUrl: 'https://user:secret@www.pcpartperformance.com/assets/retailers/approved.svg' } }, { source: { logoUrl: 'https://www.pcpartperformance.com:8443/assets/retailers/approved.svg' } }];
    const accepted = [];
    for (const change of cases) { const h = morningHarness({ payload: { status: 'daily_checked', offers: [morningOffer('fixture-cpu', change)] } }); await settle(); if (h.results().querySelectorAll('a').length) accepted.push(change); }
    assert.deepEqual(accepted, [], 'Displayed malformed link/logo fixtures: ' + describe(accepted));
  });
  await test('morning-valid-direct-local-logo', 'exact SKU direct links and reviewed local asset paths supported by the service remain usable', async () => {
    for (const logoUrl of ['/assets/retailers/bestbuy-approved.png', '/assets/retailers/BestBuy_approved.png']) {
      const offer = morningOffer('fixture-cpu', { url: 'https://www.bestbuy.com/site/synthetic-product/1000001.p?skuId=1000001', source: { logoUrl, url: 'https://www.bestbuy.com/site/synthetic-product/1000001.p?skuId=1000001' } });
      const h = morningHarness({ payload: { status: 'daily_checked', offers: [offer] } }); await settle(); assert.equal(h.results().querySelector('a')?.href, offer.url, logoUrl); assert.equal(h.results().querySelector('img')?.src, logoUrl, logoUrl);
    }
  });
  await test('morning-malformed-identity', 'missing exact SKU/model/seller and contradictory stock cannot render a daily checked price', async () => {
    const cases = [{ retailerSku: undefined }, { retailerSku: 'not-a-sku' }, { modelNumber: undefined }, { name: undefined }, { seller: undefined }, { seller: 'Unconfirmed marketplace seller' }, { availability: 'unknown' }, { stale: true }], accepted = [];
    for (const change of cases) { const h = morningHarness({ payload: { status: 'daily_checked', offers: [morningOffer('fixture-cpu', change)] } }); await settle(); if (h.results().querySelectorAll('a').length) accepted.push(change); }
    assert.deepEqual(accepted, [], 'Displayed malformed identity fixtures: ' + describe(accepted));
  });
  await test('morning-malformed-attribution', 'contradictory or missing merchant and source attribution cannot present a first-party Best Buy price', async () => {
    const cases = [{ merchant: 'Different store' }, { merchantId: 'different-store' }, { source: { publisher: 'Different store' } }, { source: { attribution: undefined } }, { source: { attribution: 'Different store' } }, { source: { url: 'https://www.bestbuy.com/site/1000002.p?skuId=1000002' } }], accepted = [];
    for (const change of cases) { const h = morningHarness({ payload: { status: 'daily_checked', offers: [morningOffer('fixture-cpu', change)] } }); await settle(); if (h.results().querySelectorAll('a').length) accepted.push(change); }
    assert.deepEqual(accepted, [], 'Displayed malformed attribution fixtures: ' + describe(accepted));
  });
  await test('morning-lowest', 'lowest exact eligible item price is used and complete purchase count is explicit', async () => {
    const h = morningHarness({ payload: { status: 'daily_checked', offers: [morningOffer('fixture-cpu', { price: 120 }), morningOffer('fixture-cpu', { price: 90 }), morningOffer('fixture-cpu', { price: 10, inStock: null })] } }); await settle(); assert.match(h.status(), /Morning-checked purchase subtotal: USD\s*90\.00/); assert.match(h.status(), /1 of 1 new items priced/); assert.equal(h.results().querySelectorAll('li').length, 1);
  });
  await test('morning-disabled-region-change', 'changing country retries the regional API after a regional not-configured response', async () => {
    const h = morningHarness({ region: 'CA', payload: { status: 'not_configured', blockers: ['reviewed_regional_source_access'], offers: [] } }); await settle(); h.setPayload({ status: 'daily_checked', offers: [morningOffer()] }); h.country('US'); await h.timing.advance(150); assert.equal(h.calls.length, 2); assert.equal(new URL(h.calls[1].url, h.location.origin).searchParams.get('region'), 'US'); assert.match(h.status(), /USD\s*100\.00/);
  });
  await test('morning-disabled-return-region', 'returning to a cached unavailable country clears the previous country price rows', async () => {
    const h = morningHarness({ region: 'CA', payload: { status: 'not_configured', offers: [] } }); await settle(); h.setPayload({ status: 'daily_checked', offers: [morningOffer()] }); h.country('US'); await h.timing.advance(150); assert.match(h.status(), /USD\s*100\.00/); h.country('CA'); await h.timing.advance(150); assert.equal(h.calls.length, 2, 'A cached disabled region should avoid an extra request'); assert.equal(h.results().querySelectorAll('a').length, 0, 'A US price remained visible after returning to unavailable CA'); assert.match(h.status(), /not available yet/);
  });
  await test('morning-region-pending', 'previous-country price rows are removed while a changed-country request is pending', async () => {
    let release, calls = 0; const pending = new Promise(resolve => { release = resolve; });
    const h = morningHarness({ fetchImpl: async () => ++calls === 1 ? { ok: true, json: async () => ({ status: 'daily_checked', offers: [morningOffer()] }) } : pending }); await settle(); assert.match(h.status(), /USD\s*100\.00/); h.country('CA'); await h.timing.advance(150); assert.equal(calls, 2); const visibleWhilePending = h.results().querySelectorAll('a').length; release({ ok: true, json: async () => ({ status: 'not_configured', offers: [] }) }); await settle(); assert.equal(visibleWhilePending, 0, 'The prior US price remained visible while the CA response was pending');
  });
  await test('morning-expiry-refresh', 'an open page refreshes at the observation expiry and removes an expired snapshot', async () => {
    const h = morningHarness({ payload: { status: 'daily_checked', offers: [morningOffer('fixture-cpu', { expiresAt: new Date(now + 1000).toISOString() })] } }); await settle(); assert.equal(h.results().querySelectorAll('a').length, 1); await h.timing.advance(1021); assert.equal(h.calls.length, 2); assert.equal(h.results().querySelectorAll('a').length, 0); assert(!h.status().includes('subtotal'));
  });
  await test('morning-expiry-pending', 'an expired snapshot is removed while its refresh request remains pending', async () => {
    let release, calls = 0; const pending = new Promise(resolve => { release = resolve; });
    const h = morningHarness({ fetchImpl: async () => ++calls === 1 ? { ok: true, json: async () => ({ status: 'daily_checked', offers: [morningOffer('fixture-cpu', { expiresAt: new Date(now + 1000).toISOString() })] }) } : pending }); await settle(); await h.timing.advance(1021); assert.equal(calls, 2); const visibleWhilePending = h.results().querySelectorAll('a').length; release({ ok: false }); await settle(); assert.equal(visibleWhilePending, 0, 'An expired daily price remained visible until the refresh response arrived');
  });
  await test('morning-timeout', 'an API request aborts after eight seconds with a clear unavailable state and no prices', async () => {
    const h = morningHarness({ fetchImpl: async (_url, options) => new Promise((_resolve, reject) => { options.signal.addEventListener('abort', () => reject(new DOMException('Synthetic timeout', 'AbortError'))); }) }); await h.timing.advance(8001); assert.equal(h.calls[0].options.signal.aborted, true); assert.match(h.status(), /unavailable/); assert.equal(h.results().querySelectorAll('a').length, 0);
  });
  await test('morning-race', 'an older slow response cannot replace a newer build selection', async () => {
    let release; const delayed = new Promise(resolve => { release = resolve; }); let calls = 0;
    const h = morningHarness({ fetchImpl: async () => ++calls === 1 ? delayed : { ok: true, json: async () => ({ status: 'daily_checked', offers: [morningOffer('fixture-next', { price: 250 })] }) } });
    h.setParts({ cpu: ['fixture-next'] }); h.buildChanged(); await h.timing.advance(150); assert.match(h.status(), /USD\s*250\.00/); release({ ok: true, json: async () => ({ status: 'daily_checked', offers: [morningOffer()] }) }); await settle(); assert.match(h.status(), /USD\s*250\.00/); assert.equal(h.results().querySelectorAll('li').length, 1); assert.equal(h.calls[0].options.signal.aborted, true);
  });
  await test('morning-prebuilt-empty', 'prebuilt exact ID uses prices API; an empty builder requests status without inventing parts', async () => {
    const prebuilt = morningHarness({ ids: 'fixture-cpu', parts: {} }); await settle(); assert.equal(new URL(prebuilt.calls[0].url, prebuilt.location.origin).searchParams.get('ids'), 'fixture-cpu'); assert.match(prebuilt.status(), /USD\s*100\.00/);
    const empty = morningHarness({ parts: {}, payload: { status: 'configured', offers: [] } }); await settle(); assert.equal(empty.calls[0].url, '/api/v1/morning-prices/status'); assert.match(empty.status(), /Choose parts/); assert.equal(empty.results().querySelectorAll('a').length, 0);
  });
  const worker = (await import(pathToFileURL(path.join(root, 'scripts/worker.mjs')).href)).default;
  await test('worker-daily-before-assets', 'Worker API endpoints return the disabled contract before asset routing and reject unsafe requests', async () => {
    let assets = 0; const env = { ASSETS: { fetch: async () => { assets++; return new Response('Synthetic asset'); } } };
    for (const endpoint of ['/api/v1/morning-prices?ids=fixture-cpu&region=US', '/api/v1/morning-prices/status']) { const response = await worker.fetch(new Request('https://www.pcpartperformance.com' + endpoint), env); assert.equal(response.status, 200); const payload = await response.json(); assert.equal(payload.status, 'not_configured'); assert.deepEqual(payload.offers, []); assert.match(response.headers.get('X-Robots-Tag'), /noindex/); assert.match(response.headers.get('Content-Type'), /application\/json/); assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff'); }
    for (const query of ['ids=https%3A%2F%2Fevil.invalid', 'ids=one&region=EU', 'ids=one&url=https%3A%2F%2Fevil.invalid', new URLSearchParams({ ids: Array.from({ length: 51 }, (_, index) => 'fixture-' + index).join(',') }).toString()]) assert.equal((await worker.fetch(new Request('https://www.pcpartperformance.com/api/v1/morning-prices?' + query), env)).status, 400, query);
    const permitted = await worker.fetch(new Request('https://www.pcpartperformance.com/api/v1/morning-prices?' + new URLSearchParams({ ids: Array.from({ length: 50 }, (_, index) => 'fixture-' + index).join(','), region: 'CA' })), env); assert.equal(permitted.status, 200); assert.equal((await permitted.json()).status, 'not_configured'); assert.equal((await worker.fetch(new Request('https://www.pcpartperformance.com/api/v1/morning-prices?ids=one', { method: 'POST' }), env)).status, 405); const head = await worker.fetch(new Request('https://www.pcpartperformance.com/api/v1/morning-prices/status', { method: 'HEAD' }), env); assert.equal(await head.text(), ''); assert.equal(assets, 0);
  });
  await test('worker-existing-assets', 'Worker keeps existing canonical asset and redirect behavior', async () => {
    const calls = [], env = { ASSETS: { fetch: async request => { calls.push(new URL(request.url).pathname); return new Response(request.method === 'HEAD' ? null : 'Synthetic asset'); } } }; const response = await worker.fetch(new Request('https://www.pcpartperformance.com/builder/'), env); assert.equal(response.status, 200); assert.deepEqual(calls, ['/builder/index.html']); const redirect = await worker.fetch(new Request('https://www.pcpartperformance.com/builder'), env); assert.equal(redirect.status, 301); assert.equal(redirect.headers.get('Location'), 'https://www.pcpartperformance.com/builder/');
  });
  await test('worker-scheduled-gate', 'Worker scheduled handler awaits the gated service without provider access or activation', async () => {
    let job; const result = worker.scheduled({ scheduledTime: now }, {}, { waitUntil(promise) { job = promise; } }); assert.equal(result, undefined); assert(job && typeof job.then === 'function'); const completed=await job;assert.equal(completed[0].value.status,'not_configured');assert.equal(completed[1].value.status,'outside_morning_window'); const config = JSON.parse(fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8')); assert.deepEqual(config.triggers.crons,['0 11,12 * * *']); assert.notEqual(config.vars?.MORNING_PRICES_ENABLED, 'true');
  });
  for (const file of sourceFiles) if (fs.readFileSync(path.join(root, file), 'utf8') !== sources.get(file)) results.push({ id: 'source-changed-' + file, name: 'Source did not change during this bounded check: ' + file, status: 'failed', message: 'Source changed during the check; rerun to verify a coherent source revision.' });
  const report = { schema: 1, checkedAt: new Date().toISOString(), status: results.some(result => result.status === 'failed') ? 'failed' : 'passed', passed: results.filter(result => result.status === 'passed').length, failed: results.filter(result => result.status === 'failed').length, method: 'Actual parent browser scripts executed in Node VM with minimal DOM/events/FormData and synthetic Web API responses; actual prebuilt generator executed in memory; actual Worker imported with mocked ASSETS. No browser layout, live provider, cloud deployment or full build.', fixtures: 'All provider prices/models and approval implications are synthetic. Prebuilt specifications are the existing researched source data.', fixtureLimitations: ['No rendering/layout/viewport checks.', 'Countries are standard header fixtures; morning region event tests explicitly simulate shared region storage change.', 'All prebuilt controller tests use the actual generated markup without control injection.'], files: sourceFiles.map(file => ({ file, sha256: crypto.createHash('sha256').update(sources.get(file)).digest('hex') })), tests: results };
  fs.mkdirSync(path.dirname(reportFile), { recursive: true }); fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n'); console.log(report.passed + ' passed, ' + report.failed + ' failed continuation client checks.'); if (report.failed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
