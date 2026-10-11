const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const rules = require('./compatibility-evidence.cjs');
const planners = require('./program-planners.cjs');
const source = fs.readFileSync('dist/upgrade-program.js', 'utf8');
const slots = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case'];
let tests = 0;
async function test(name, fn) { await fn(); tests++; console.log('PASS ' + name); }
class Element {
  constructor() { this.value = ''; this.disabled = false; this.innerHTML = ''; this.textContent = ''; this.children = []; this.listeners = {}; this.dataset = {}; this.elements = {}; }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  dispatchEvent(event) { this.emit(event.type, event.target || this); return true; }
  emit(type, target = this) { for (const fn of this.listeners[type] || []) fn({ type, target, preventDefault() {} }); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this[name] = value; }
  querySelector() { return this.detail ||= new Element(); }
  insertAdjacentHTML(position, html) { this.innerHTML = html + this.innerHTML; }
  click() { this.emit('click'); }
}
const evidence = value => ({ value, source: 'https://example.com/exact-source', publisher: 'Fixture maker', checked: '2026-10-09', exact: true, status: 'manufacturer-specified' });
const cpu = { id: '9800x3d', cat: 'cpu', name: 'Ryzen 7 9800X3D', brand: 'AMD' }, alternate = { id: 'fixture-am4-cpu', cat: 'cpu', name: 'AM4 fixture', brand: 'Fixture', evidence: { fields: { socket: evidence('AM4') } } }, board = { id: 'b650', cat: 'board', name: 'MAG B650 TOMAHAWK WIFI', brand: 'MSI' }, gpu = { id: 'variant-gpu', cat: 'gpu', name: 'Exact graphics card OC 16 GB', brand: 'Fixture' };
const records = [cpu, alternate, board, gpu];
async function setup(data = records) {
  const nodes = new Map(), get = key => { if (!nodes.has(key)) nodes.set(key, new Element()); return nodes.get(key); };
  const form = get('[data-upgrade-form]'), parse = get('[data-upgrade-parse]'), change = get('[data-upgrade-change]');
  for (const name of [...slots, 'region', 'budget', 'goal', 'symptom', 'notes']) { form.elements[name] = new Element(); form.elements[name].name = name; }
  form.elements.region.value = 'CA'; form.elements.goal.value = 'gaming'; form.elements.symptom.value = 'none';
  parse.elements.parts = new Element(); change.elements.slot = new Element(); change.elements.slot.value = 'cpu'; change.elements.replacement = new Element();
  const blobs = [], context = { URL, console, PCP_BUILD_RULES: rules, PCP_PLANNERS: planners, Event: class { constructor(type) { this.type = type; } },
    document: { querySelector: get, documentElement: { dataset: {} }, createElement: () => new Element() },
    location: { href: 'http://127.0.0.1:4185/upgrade/', origin: 'http://127.0.0.1:4185' }, localStorage: { getItem: () => 'US' }, window: {},
    fetch: async () => ({ ok: true, json: async () => data }), setTimeout() {}, Blob: class { constructor(content) { this.content = content; blobs.push(this); } } };
  // Local export only; no real file, clipboard or external request is involved.
  context.URL = class extends URL { static createObjectURL() { return 'blob:fixture'; } static revokeObjectURL() {} };
  vm.createContext(context); vm.runInContext(source, context); await new Promise(resolve => setImmediate(resolve));
  const create = () => { form.elements.cpu.value = cpu.id; form.elements.board.value = board.id; form.elements.gpu.value = gpu.id; form.emit('submit'); };
  return { get, nodes, form, parse, change, context, blobs, create };
}
(async () => {
  await test('the source loads validated choices and preserves the chosen region', async () => {
    const h = await setup(); assert.equal(h.form.elements.region.value, 'US'); assert.equal(h.form.elements.cpu.disabled, false); assert(h.get('[data-upgrade-loading]').textContent.includes('Older parts remain available'));
  });
  await test('malformed or duplicate catalogs leave the planning state unavailable', async () => {
    for (const data of [{}, [...records, cpu], [{ id: 'bad<script>', name: 'Bad', cat: 'cpu' }]]) {
      const h = await setup(data); h.form.emit('submit'); assert(h.get('[data-upgrade-status]').textContent.includes('unavailable')); assert.equal(h.get('[data-upgrade-result]').innerHTML, '');
    }
  });
  await test('exact alternatives recheck evidence without replacing the current phase', async () => {
    const h = await setup(); h.create(); h.change.elements.replacement.value = alternate.id; h.change.emit('submit');
    assert(h.get('[data-upgrade-change-result]').innerHTML.includes('failed')); assert(h.get('[data-upgrade-change-result]').innerHTML.includes('https://example.com/exact-source'));
    h.get('[data-upgrade-builder]').click(); const url = new URL(h.context.location.href, h.context.location.origin);
    assert.equal(url.searchParams.get('build').split(',')[0], cpu.id);
  });
  await test('a phased swap refreshes current readiness and shares the exact state', async () => {
    const h = await setup(); h.create(); h.change.elements.replacement.value = alternate.id; h.get('[data-upgrade-phase]').click();
    assert(h.get('[data-upgrade-readiness]').innerHTML.includes('failed')); assert(h.get('[data-upgrade-status]').textContent.includes('1 documented conflicts'));
    h.get('[data-upgrade-builder]').click(); const url = new URL(h.context.location.href, h.context.location.origin), selected = url.searchParams.get('build').split(',');
    assert.equal(selected.length, rules.SLOTS.length); assert.equal(selected[0], alternate.id); assert.equal(selected[2], gpu.id); assert.equal(url.searchParams.get('region'), 'US');
    assert.deepEqual(url.searchParams.get('owned').split('~').sort(), [board.id, gpu.id].sort());
    assert.equal(url.searchParams.get('plan').split('~')[0], 'gaming'); assert.equal(url.searchParams.has('budget'), false);
  });
  await test('changed inventory blocks stale comparison, share and export until regeneration', async () => {
    const h = await setup(); h.create(); h.form.elements.cpu.value = alternate.id; h.form.emit('change', h.form.elements.cpu);
    const before = h.context.location.href; h.get('[data-upgrade-builder]').click(); assert.equal(h.context.location.href, before);
    h.change.elements.replacement.value = cpu.id; h.change.emit('submit'); assert(h.get('[data-upgrade-status]').textContent.includes('again'));
    h.get('[data-upgrade-export]').click(); assert.equal(h.blobs.length, 0);
    h.form.emit('submit'); h.get('[data-upgrade-builder]').click(); assert.equal(new URL(h.context.location.href, h.context.location.origin).searchParams.get('build').split(',')[0], alternate.id);
  });
  await test('parsed selections require a confirmation and invalidate a prior plan', async () => {
    const h = await setup(); h.create(); h.parse.elements.parts.value = 'CPU: AM4 fixture'; h.parse.emit('submit');
    const row = h.get('[data-upgrade-matches]').children[0], select = row.children[0].children[0], confirm = row.children[1];
    assert.equal(h.form.elements.cpu.value, cpu.id); select.value = alternate.id; confirm.click(); assert.equal(h.form.elements.cpu.value, alternate.id);
    const before = h.context.location.href; h.get('[data-upgrade-builder]').click(); assert.equal(h.context.location.href, before);
  });
  await test('export keeps exact phases and a numeric budget, excluding free-form notes', async () => {
    const h = await setup(); h.form.elements.budget.value = '1500'; h.form.elements.notes.value = 'private fixture note'; h.create(); h.get('[data-upgrade-export]').click();
    const data = JSON.parse(h.blobs[0].content[0]); assert.equal(data.budget, 1500); assert.equal(data.currency, 'USD'); assert.equal(data.parts.cpu[0], cpu.id); assert.equal(data.notes, undefined); assert.equal(data.phases.length, 0);
  });
  await test('phase count is bounded with explicit feedback', async () => {
    const h = await setup(); h.create(); for (let i = 0; i < 26; i++) { h.change.elements.replacement.value = i % 2 === 0 ? alternate.id : cpu.id; h.get('[data-upgrade-phase]').click(); }
    assert.equal(h.get('[data-upgrade-phases]').children.length, 25); assert(h.get('[data-upgrade-status]').textContent.includes('25 phases'));
  });
  console.log(`${tests} upgrade source-behavior tests passed. These are VM behavior tests, not browser or visual QA.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
