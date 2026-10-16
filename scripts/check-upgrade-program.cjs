const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const rules = require('./compatibility-evidence.cjs');
const planners = require('./program-planners.cjs');
const source = fs.readFileSync('dist/upgrade-program.js', 'utf8');
const slots = rules.SLOTS;
let tests = 0;
async function test(name, fn) { await fn(); tests++; console.log('PASS ' + name); }
class Element {
  constructor() { this.value = ''; this.disabled = false; this.innerHTML = ''; this.textContent = ''; this.children = []; this.listeners = {}; this.dataset = {}; this.elements = {}; }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  dispatchEvent(event) { this.emit(event.type, event.target || this); return true; }
  emit(type, target = this) { for (const fn of this.listeners[type] || []) fn({ type, target, currentTarget: this, preventDefault() {} }); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this[name] = value; }
  querySelector() { return this.detail ||= new Element(); }
  querySelectorAll() { return []; }
  insertAdjacentHTML(position, html) { this.innerHTML = html + this.innerHTML; }
  click() { this.emit('click'); }
}
const evidence = value => ({ value, source: 'https://example.com/exact-source', publisher: 'Fixture maker', checked: '2026-10-09', exact: true, status: 'manufacturer-specified' });
const cpu = { id: '9800x3d', cat: 'cpu', name: 'Ryzen 7 9800X3D', brand: 'AMD' }, alternate = { id: 'fixture-am4-cpu', cat: 'cpu', name: 'AM4 fixture', brand: 'Fixture', evidence: { fields: { socket: evidence('AM4') } } }, board = { id: 'b650', cat: 'board', name: 'MAG B650 TOMAHAWK WIFI', brand: 'MSI' }, gpu = { id: 'variant-gpu', cat: 'gpu', name: 'Exact graphics card OC 16 GB', brand: 'Fixture' };
const records = [cpu, alternate, board, gpu];
const cooler = { id: 'fixture-cooler', cat: 'cooler', name: 'Exact cooler', brand: 'Fixture' }, fan = { id: 'fixture-fan', cat: 'fan', name: 'Exact case fan', brand: 'Fixture' }, otherFan = { id: 'other-fan', cat: 'fan', name: 'Other exact fan', brand: 'Fixture' }, drive = { id: 'fixture-ssd', cat: 'ssd', name: 'Exact SSD', brand: 'Fixture' };
const expanded = [...records, cooler, fan, otherFan, drive];
async function setup(data = records, options = {}) {
  const nodes = new Map(), get = key => { if (!nodes.has(key)) nodes.set(key, new Element()); return nodes.get(key); };
  const form = get('[data-upgrade-form]'), parse = get('[data-upgrade-parse]'), change = get('[data-upgrade-change]');
  for (const name of [...slots, 'region', 'budget', 'goal', 'symptom', 'notes']) { form.elements[name] = new Element(); form.elements[name].name = name; }
  form.elements.region.value = 'CA'; form.elements.goal.value = 'gaming'; form.elements.symptom.value = 'none';
  parse.elements.parts = new Element(); change.elements.slot = new Element(); change.elements.slot.value = 'cpu'; change.elements.replacement = new Element(); change.elements.instance = new Element(); change.elements.instance.value = '0'; change.elements.mode = new Element(); change.elements.mode.value = 'replace';
  const blobs = [], context = { URL, console, PCP_BUILD_RULES: rules, PCP_PLANNERS: planners, Event: class { constructor(type) { this.type = type; } },
    document: { querySelector: get, documentElement: { dataset: {} }, createElement: () => new Element() },
    location: { href: options.href || 'http://127.0.0.1:4185/upgrade/', origin: 'http://127.0.0.1:4185' }, localStorage: { getItem: () => 'US' }, window: {},
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
  await test('new cooler and case-fan choices use the same exact catalog identities', async () => {
    const h = await setup(expanded); assert(h.form.elements.cooler.innerHTML.includes(cooler.id)); assert(h.form.elements.fan.innerHTML.includes(fan.id)); h.form.elements.cooler.value = cooler.id; h.form.elements.fan.value = fan.id; h.create(); h.get('[data-upgrade-builder]').click();
    const selected = new URL(h.context.location.href, h.context.location.origin).searchParams.get('build').split(','); assert.equal(selected[rules.SLOTS.indexOf('fan')], fan.id); assert.equal(selected[rules.SLOTS.indexOf('cooler')], cooler.id);
  });
  await test('legacy eight-slot and nine-slot URLs preserve extra drives and fans', async () => {
    for (const version of [8, 9, 10]) {
      const selected = [cpu.id, board.id, gpu.id, '', drive.id + '~' + drive.id, '', '', '']; if (version >= 9) selected.push(fan.id + '~' + fan.id); if (version === 10) selected.push(cooler.id);
      const h = await setup(expanded, { href: 'http://127.0.0.1:4185/upgrade/?build=' + encodeURIComponent(selected.join(',')) }); h.form.emit('submit'); const snapshot = h.context.window.PCP_UPGRADE.snapshot(); assert.equal(snapshot.parts.ssd.length, 2); assert.equal(snapshot.parts.fan.length, version >= 9 ? 2 : 0); assert.equal(snapshot.parts.cooler.length, version === 10 ? 1 : 0); h.get('[data-upgrade-export]').click(); assert.equal(JSON.parse(h.blobs[0].content[0]).parts.ssd.length, 2);
    }
  });
  await test('legacy owned links allow repeated categories without dropping quantities', async () => {
    const h = await setup(expanded, { href: 'http://127.0.0.1:4185/upgrade/?owned=' + [cpu.id, fan.id, fan.id, cooler.id].join(',') }); h.form.emit('submit'); const snapshot = h.context.window.PCP_UPGRADE.snapshot(); assert.equal(snapshot.parts.fan.length, 2); assert.equal(snapshot.parts.cooler[0], cooler.id); assert(h.get('[data-upgrade-status]').textContent.includes('Reuse plan created'));
  });
  await test('replacing one selected fan preserves its other instances and all cooling', async () => {
    const selected = Object.fromEntries(slots.map(slot => [slot, []])); selected.cpu = [cpu.id]; selected.fan = [fan.id, fan.id]; selected.cooler = [cooler.id];
    const h = await setup(expanded, { href: 'http://127.0.0.1:4185/upgrade/?inventory=' + encodeURIComponent(slots.map(slot => selected[slot].join('~')).join(',')) }); h.form.emit('submit'); h.change.elements.slot.value = 'fan'; h.change.elements.instance.value = '1'; h.change.elements.replacement.value = otherFan.id; h.get('[data-upgrade-phase]').click();
    const snapshot = h.context.window.PCP_UPGRADE.snapshot(); assert.deepEqual(Array.from(snapshot.parts.fan), [fan.id, otherFan.id]); assert.equal(snapshot.parts.cooler[0], cooler.id); assert.deepEqual(Array.from(snapshot.baseline.fan), [fan.id, fan.id]);
  });
  await test('adding an identical model never marks newly added units already owned', async () => {
    const h = await setup(expanded, { href: 'http://127.0.0.1:4185/upgrade/?owned=' + [cpu.id, fan.id].join(',') }); h.form.emit('submit'); h.change.elements.slot.value = 'fan'; h.change.elements.mode.value = 'add'; h.change.elements.replacement.value = fan.id; h.get('[data-upgrade-phase]').click(); assert.equal(h.context.window.PCP_UPGRADE.snapshot().parts.fan.length, 2); h.get('[data-upgrade-builder]').click();
    const query = new URL(h.context.location.href, h.context.location.origin).searchParams; assert.equal(query.get('build').split(',')[slots.indexOf('fan')], fan.id + '~' + fan.id); assert(!query.get('owned').split('~').includes(fan.id)); assert(query.get('owned').split('~').includes(cpu.id));
  });
  await test('an empty submission stays calm without a fictional readiness failure', async () => {
    const h = await setup(expanded); h.form.emit('submit'); assert(h.get('[data-upgrade-result]').innerHTML.includes('Start with the PC you have')); assert(!h.get('[data-upgrade-result]').innerHTML.includes('data-upgrade-readiness')); assert.equal(h.context.window.PCP_UPGRADE.snapshot(), null); assert(h.get('[data-upgrade-status]').textContent.includes('No compatibility checks have run'));
  });
  await test('upgrade imports restore old layouts and recheck source evidence instead of trusting stored passes', async () => {
    const h = await setup(expanded), original = Object.fromEntries(slots.slice(0, 8).map(slot => [slot, []])); original.cpu = [cpu.id]; original.board = [board.id]; original.ssd = [drive.id, drive.id];
    const parts = { ...original, fan: [fan.id, fan.id], cooler: [cooler.id] }, data = { schema: 'pcp-upgrade-v1', region: 'CA', budget: 800, baseline: original, parts, phases: [{ slot: 'cooler', productId: cooler.id, parts, checks: [{ state: 'passed', title: 'Fake old certification' }] }] };
    const file = JSON.stringify(data), input = h.get('[data-upgrade-import]'); input.files = [{ size: file.length, text: async () => file }]; await input.listeners.change[0]({ currentTarget: input }); const snapshot = h.context.window.PCP_UPGRADE.snapshot(); assert.equal(snapshot.parts.ssd.length, 2); assert.equal(snapshot.parts.fan.length, 2); assert.equal(snapshot.parts.cooler[0], cooler.id); assert.equal(snapshot.baseline.cooler.length, 0); h.get('[data-upgrade-export]').click(); const exported = JSON.parse(h.blobs[0].content[0]); assert.equal(exported.budget, 800); assert(!JSON.stringify(exported.phases).includes('Fake old certification'));
  });
  await test('invalid imports preserve the existing open plan and reject unknown components', async () => {
    const h = await setup(expanded); h.create(); const before = JSON.stringify(h.context.window.PCP_UPGRADE.snapshot()), input = h.get('[data-upgrade-import]'); const data = { schema: 'pcp-upgrade-v1', region: 'CA', baseline: { cpu: ['missing-exact-cpu'] }, parts: { cpu: [cpu.id] }, phases: [] }, file = JSON.stringify(data); input.files = [{ size: file.length, text: async () => file }]; await input.listeners.change[0]({ currentTarget: input }); assert.equal(JSON.stringify(h.context.window.PCP_UPGRADE.snapshot()), before); assert(h.get('[data-upgrade-status]').textContent.includes('missing-exact-cpu'));
  });
  console.log(`${tests} upgrade source-behavior tests passed. These are VM behavior tests, not browser or visual QA.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
