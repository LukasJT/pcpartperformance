'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const api = require('./completion-parts-import.js');
const rules = require('./compatibility-evidence.cjs');
const decorate = require('./completion-parts-import.cjs');
let passed = 0;
const test = async (name, action) => { await action(); passed++; console.log('PASS ' + name); };
const cpu = { id: 'cpu-9800x3d', cat: 'cpu', brand: 'AMD', name: 'Ryzen 7 9800X3D', sku: '100-100001084WOF', aliases: ['AMD 9800X3D'] };
const oldCPU = { id: 'cpu-7800x3d', cat: 'cpu', brand: 'AMD', name: 'Ryzen 7 7800X3D', sku: '100-100000910WOF' };
const gpu = { id: 'gpu-msi-3060', cat: 'gpu', brand: 'MSI', name: 'GeForce RTX 3060 VENTUS 2X 12G OC', sku: 'RTX3060VENTUS2X12GOC', summary: '12 GB GDDR6' };
const otherGPU = { id: 'gpu-asus-3060', cat: 'gpu', brand: 'ASUS', name: 'Dual GeForce RTX 3060 V2 OC 12GB', mpn: 'DUAL-RTX3060-O12G-V2' };
const sixGPU = { id: 'gpu-3050-6', cat: 'gpu', brand: 'MSI', name: 'GeForce RTX 3050 6GB VENTUS 2X OC', summary: '6 GB GDDR6' };
const eightGPU = { id: 'gpu-3050-8', cat: 'gpu', brand: 'MSI', name: 'GeForce RTX 3050 8GB VENTUS 2X OC', summary: '8 GB GDDR6' };
const board = { id: 'board-b650', cat: 'board', brand: 'MSI', name: 'MAG B650 TOMAHAWK WIFI' };
const ram = { id: 'ram-ddr5', cat: 'ram', brand: 'CORSAIR', name: 'VENGEANCE DDR5-6000 CL30 32GB', sku: 'CMK32GX5M2B6000Z30', summary: '2 × 16 GB' };
const drive = { id: 'ssd-990', cat: 'ssd', brand: 'Samsung', name: '990 PRO 2TB', identity: { manufacturerPartNumber: 'MZ-V9P2T0B/AM' } };
const hdd = { id: 'hdd-ironwolf', cat: 'hdd', brand: 'Seagate', name: 'IronWolf 8TB', partNumber: 'ST8000VN004' };
const fan = { id: 'fan-noctua', cat: 'fan', brand: 'Noctua', name: 'NF-A12x25 PWM' };
const cooler = { id: 'cooler-noctua', cat: 'cooler', brand: 'Noctua', name: 'NH-D15 G2' };
const catalog = [cpu, oldCPU, board, gpu, otherGPU, sixGPU, eightGPU, ram, drive, hdd, fan, cooler];
const empty = () => Object.fromEntries(api.SLOTS.map(slot => [slot, []]));
const choose = (row, id, quantity = row.quantity) => ({ key: row.key, action: 'model', id, quantity });
const exclude = row => ({ key: row.key, action: 'exclude' });
const clone = value => JSON.parse(JSON.stringify(value));

class Element {
  constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.doc = doc; this.children = []; this.listeners = {}; this.attributes = {}; this.dataset = {}; this.elements = {}; this.value = ''; this.disabled = false; this.hidden = false; this.checked = false; this._text = ''; this._html = ''; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set innerHTML(value) { this._html = value; this.children = []; }
  get innerHTML() { return this._html; }
  setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'value') this.value = String(value); if (name === 'type') this.type = String(value); if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value); }
  addEventListener(type, action) { (this.listeners[type] ||= []).push(action); }
  dispatchEvent(event) { this.emit(event.type, event.target || this, event); return true; }
  emit(type, target = this, extra = {}) { for (const action of this.listeners[type] || []) action({ preventDefault() {}, type, target, currentTarget: this, ...extra }); }
  click() { if (!this.disabled) this.emit('click'); }
  focus() { this.doc.activeElement = this; }
  append(...items) { for (const item of items) { item.parent = this; this.children.push(item); } }
  replaceChildren(...items) { this._text = ''; this._html = ''; this.children = []; this.append(...items); }
  matches(selector) {
    const match = selector.match(/^(\w+)?(?:\[([^=\]]+)(?:="([^"]*)")?\])?$/);
    return !!match && (!match[1] || this.tagName === match[1].toUpperCase()) && (!match[2] || Object.hasOwn(this.attributes, match[2]) && (match[3] === undefined || this.attributes[match[2]] === match[3]));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  insertAdjacentHTML(position, html) { this._html = html + this._html; }
}
function documentFixture() {
  const doc = { activeElement: null, roots: new Map(), documentElement: { dataset: {} }, createElement(tag) { return new Element(tag, doc); }, createTextNode(text) { const node = new Element('#text', doc); node.textContent = text; return node; }, querySelector(selector) { return doc.roots.get(selector) || null; }, dispatchEvent(event) { for (const action of doc.listeners[event.type] || []) action(event); }, listeners: {}, addEventListener(type, action) { (doc.listeners[type] ||= []).push(action); } };
  return doc;
}
function controls(target, line) {
  const group = target.querySelectorAll('fieldset').find(field => field.querySelector('legend').textContent.startsWith('Line ' + line + ' ·') || field.querySelector('legend').textContent === 'Line ' + line);
  return { group, choice: group.querySelector('select'), quantity: group.querySelector('input[type="number"]') };
}
const button = (target, text) => target.querySelectorAll('button').find(node => node.textContent === text);
function UI(initial = { ...empty(), cpu: [oldCPU.id], gpu: [otherGPU.id] }) {
  const doc = documentFixture(), form = doc.createElement('form'), target = doc.createElement('div'), main = doc.createElement('form'); form.elements.parts = doc.createElement('textarea'); doc.roots.set('[data-upgrade-form]', main); main.append(doc.createElement('button')); main.children[0].setAttribute('type', 'submit');
  let inventory = clone(initial), applied = 0, available = true, fail = false; const messages = [];
  const upgrade = { inventory: () => available ? clone(inventory) : null, catalog: () => catalog, applyConfirmedInventory(parts, expected) { if (fail) throw Error('Synthetic application failure.'); if (expected !== api.inventoryFingerprint(inventory)) throw Error('Inventory changed during review.'); inventory = clone(parts); applied++; } };
  const controller = api.attach({ form, target, upgrade, document: doc, status: text => messages.push(text) });
  return { form, target, doc, controller, submit(text) { form.elements.parts.value = text; form.emit('submit'); }, get inventory() { return inventory; }, set inventory(value) { inventory = clone(value); }, get applied() { return applied; }, messages, unavailable() { available = false; }, fail() { fail = true; } };
}
async function upgradeFixture() {
  const doc = documentFixture(), nodes = doc.roots, get = selector => { if (!nodes.has(selector)) nodes.set(selector, doc.createElement('div')); return nodes.get(selector); };
  for (const selector of ['[data-upgrade-form]', '[data-upgrade-parse]', '[data-upgrade-change]', '[data-upgrade-matches]', '[data-upgrade-extra-parts]', '[data-upgrade-status]', '[data-upgrade-loading]', '[data-upgrade-result]', '[data-upgrade-phases]', '[data-upgrade-change-result]', '[data-upgrade-readiness]', '[data-upgrade-phase]', '[data-upgrade-builder]', '[data-upgrade-export]', '[data-upgrade-import]']) get(selector);
  const form = get('[data-upgrade-form]'), parse = get('[data-upgrade-parse]'), change = get('[data-upgrade-change]');
  for (const name of [...rules.SLOTS, 'region', 'budget', 'goal', 'symptom', 'notes']) { const control = doc.createElement('input'); control.name = name; form.elements[name] = control; form.append(control); }
  form.elements.region.value = 'CA'; form.elements.goal.value = 'gaming'; form.elements.symptom.value = 'none'; parse.elements.parts = doc.createElement('textarea');
  for (const name of ['slot', 'instance', 'mode', 'replacement']) change.elements[name] = doc.createElement('select'); change.elements.slot.value = 'cpu'; change.elements.instance.value = '0'; change.elements.mode.value = 'replace';
  const requests = [], blobs = [], events = [], context = { document: doc, window: { PCP_EVENTS: { track(name, properties) { events.push({ name, properties: clone(properties) }); } } }, location: { href: 'https://example.test/upgrade/', origin: 'https://example.test' }, PCP_BUILD_RULES: rules, PCP_PARTS_IMPORT: api, Event: class { constructor(type, opts = {}) { this.type = type; Object.assign(this, opts); } }, URL: class extends URL { static createObjectURL() { return 'blob:fixture'; } static revokeObjectURL() {} }, Blob: class { constructor(content) { blobs.push(content); } }, localStorage: { getItem: () => null }, fetch: async url => { requests.push(url); return { ok: true, json: async () => clone(catalog) }; }, setTimeout() {} };
  vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/upgrade-program.js'), 'utf8'), context); await new Promise(resolve => setImmediate(resolve));
  return { doc, get, form, parse, context, requests, blobs, events, bridge: context.window.PCP_UPGRADE };
}
(async () => {
  await test('ordinary category names, documented aliases and exact IDs remain staged', () => {
    const rows = api.parseText('CPU: AMD 9800X3D\nMotherboard: board-b650\n[GPU] MSI GeForce RTX 3060 VENTUS 2X 12G OC', catalog);
    assert.deepEqual(rows.map(row => row.requested), ['cpu', 'board', 'gpu']); assert.deepEqual(rows.map(row => row.candidates[0].id), [cpu.id, board.id, gpu.id]); assert(rows.every(row => row.status === 'needs_confirmation')); assert(rows.every(row => row.quantity === 1));
  });
  await test('ambiguous partner names expose separate exact variants without a default winner', () => {
    const row = api.parseText('GPU: RTX 3060', catalog)[0]; assert.equal(row.status, 'ambiguous'); assert.deepEqual(new Set(row.candidates.map(part => part.id)), new Set([gpu.id, otherGPU.id])); assert(!Object.hasOwn(row, 'selected')); assert(!Object.hasOwn(row, 'score'));
  });
  await test('numeric model and memory variants never fuzzy-match their neighbors', () => {
    assert.deepEqual(api.parseText('GPU: RTX 3050 6 GB', catalog)[0].candidates.map(part => part.id), [sixGPU.id]);
    assert.deepEqual(api.parseText('CPU: Ryzen 7 9801X3D', catalog)[0].candidates, []); assert.deepEqual(api.parseText('GPU: RTX 3061', catalog)[0].candidates, []);
  });
  await test('complete SKU punctuation and digits are required, including nested documented identities', () => {
    assert.equal(api.parseText('CPU: SKU: 100-100001084wof', catalog)[0].candidates[0].id, cpu.id); assert.equal(api.parseText('SSD: MPN: MZ-V9P2T0B/AM', catalog)[0].candidates[0].id, drive.id); assert.equal(api.parseText('HDD: part number: ST8000VN004', catalog)[0].candidates[0].id, hdd.id);
    assert.equal(api.parseText('CPU: SKU: 100100001084WOF', catalog)[0].total, 0); assert.equal(api.parseText('CPU: SKU: 100-100001085WOF', catalog)[0].total, 0); assert.equal(api.parseText('GPU: SKU: RTX3060VENTUS2X12G0C', catalog)[0].total, 0); assert.equal(api.parseText('CPU: SKU: Ryzen 7 9800X3D', catalog)[0].total, 0);
  });
  await test('prefix and explicit trailing quantities preserve separate fans and drives', () => {
    const rows = api.parseText('3 x Case fans: Noctua NF-A12x25 PWM\nSSD: 2 x Samsung 990 PRO 2TB\nCPU cooler: Noctua NH-D15 G2\nGPU: gpu-msi-3060 (qty 2)', catalog);
    assert.deepEqual(rows.map(row => row.quantity), [3, 2, 1, 2]); assert.equal(rows[2].requested, 'cooler'); const result = api.review(rows, rows.map(row => choose(row, row.candidates[0].id)), catalog); assert.equal(result.total, 8); assert.deepEqual(result.parts.fan, [fan.id, fan.id, fan.id]); assert.deepEqual(result.parts.ssd, [drive.id, drive.id]); assert.deepEqual(result.parts.cooler, [cooler.id]); assert.deepEqual(Object.keys(result.parts), rules.SLOTS);
  });
  await test('memory module layouts are not mistaken for a count of memory kits', () => {
    for (const text of ['RAM: 2 x 16 GB CORSAIR VENGEANCE', 'RAM: CORSAIR VENGEANCE 32 GB (2 x 16 GB)', 'RAM: 2x16GB CORSAIR VENGEANCE']) assert.equal(api.parseText(text, catalog)[0].quantity, 1);
    assert.equal(api.parseText('RAM: 2 x ram-ddr5', catalog)[0].quantity, 2);
  });
  await test('unknown and URL lines require explicit exclusion or a manually chosen exact model', () => {
    const rows = api.parseText('CPU: Ryzen 7 9800X3D\nUnknown mystery part\nGPU: https://retailer.test/private?invoice=123', catalog); assert.equal(rows[1].status, 'unresolved'); assert.equal(rows[2].total, 0); assert.match(rows[2].reason, /never opened/);
    assert.throws(() => api.review(rows, [choose(rows[0], cpu.id), { key: rows[1].key }, exclude(rows[2])], catalog), /Line 2/);
    const result = api.review(rows, [choose(rows[0], cpu.id), exclude(rows[1]), exclude(rows[2])], catalog); assert.deepEqual(result.parts.cpu, [cpu.id]); assert.equal(result.excluded.length, 2); assert.equal(result.total, 1);
    assert.equal(api.review(rows, [choose(rows[0], cpu.id), choose(rows[1], drive.id, 1), exclude(rows[2])], catalog).parts.ssd[0], drive.id);
  });
  await test('entirely excluded text cannot silently clear a PC', () => { const rows = api.parseText('Random unknown item', catalog); assert.throws(() => api.review(rows, [exclude(rows[0])], catalog), /cannot clear/); });
  await test('single-instance categories reject duplicate lines and excessive quantities', () => {
    for (const part of [cpu, board, cooler]) { const rows = api.parseText(part.id + '\n' + part.id, catalog); assert.throws(() => api.review(rows, rows.map(row => choose(row, part.id)), catalog), /supports one/); }
    const rows = api.parseText(cpu.id, catalog); assert.throws(() => api.review(rows, [choose(rows[0], cpu.id, 2)], catalog), /supports one/);
  });
  await test('the 99-instance cap preserves repetitions and rejects lossy truncation', () => {
    const rows = api.parseText('Fan: 99 x fan-noctua', catalog); assert.equal(api.review(rows, [choose(rows[0], fan.id)], catalog).parts.fan.length, 99);
    assert.throws(() => api.parseText('Fan: 100 x fan-noctua', catalog), /1 to 99/); const two = api.parseText('Fan: 99 x fan-noctua\nCPU: cpu-9800x3d', catalog); assert.throws(() => api.review(two, two.map(row => choose(row, row.candidates[0].id)), catalog), /no more than 99/);
    for (const quantity of ['', '0', '1.5', '0x2', '1e1', 100, -1]) assert.throws(() => api.review(rows, [choose(rows[0], fan.id, quantity)], catalog), /whole quantity/);
  });
  await test('UTF-8 bytes, total lines and individual lines are bounded before matching', () => {
    assert.throws(() => api.parseText('漢'.repeat(11000), catalog), /32 KiB/); assert.throws(() => api.parseText('\n'.repeat(50), catalog), /50 lines/); assert.throws(() => api.parseText('a'.repeat(1201), catalog), /1,200/); assert.throws(() => api.parseText('CPU:\0x', catalog), /null characters/); assert.equal(api.parseText('\uFEFFCPU: cpu-9800x3d\r\n\n', catalog)[0].line, 1);
  });
  await test('invalid and duplicate catalogs fail closed rather than creating installed identities', () => {
    for (const records of [null, [...catalog, cpu], [{ ...cpu, id: '<script>' }], [{ ...cpu, cat: 'phone' }]]) assert.throws(() => api.parseText(cpu.name, records), /choices/);
    const rows = api.parseText(cpu.name, catalog); assert.throws(() => api.review(rows, [choose(rows[0], 'unknown-model')], catalog), /available exact/); assert.throws(() => api.review(rows, [{ ...choose(rows[0], cpu.id), key: 'line-2' }], catalog), /Line 1/);
  });
  await test('catalog search requires all literal terms and exposes bounded results', () => {
    assert.equal(api.search(catalog, 'sku: DUAL-RTX3060-O12G-V2', 'gpu').candidates[0].id, otherGPU.id); assert.equal(api.search(catalog, '9800X3D', 'gpu').total, 0); assert.equal(api.search(catalog, 'https://example.test/rtx3060').total, 0);
    const many = Array.from({ length: 45 }, (_, index) => ({ id: 'fan-' + index, cat: 'fan', brand: 'Maker', name: 'Common model ' + index })); const result = api.search(many, 'Common model'); assert.equal(result.total, 45); assert.equal(result.candidates.length, 40); assert.match(result.reason, /narrow/);
  });
  await test('exact instance deltas identify quantity reductions and removed categories', () => {
    const before = { ...empty(), cpu: [oldCPU.id], fan: [fan.id, fan.id], ssd: [drive.id] }, after = { ...empty(), cpu: [cpu.id], fan: [fan.id] }; const delta = api.inventoryChanges(before, after);
    assert.deepEqual(delta.added, [{ cat: 'cpu', id: cpu.id, quantity: 1 }]); assert.deepEqual(delta.removed, [{ cat: 'cpu', id: oldCPU.id, quantity: 1 }, { cat: 'ssd', id: drive.id, quantity: 1 }, { cat: 'fan', id: fan.id, quantity: 1 }]);
  });
  await test('UI choices and preview do not mutate inventory; final checkbox and action do', () => {
    const h = UI(), before = clone(h.inventory); h.submit('CPU: cpu-9800x3d\nFans: 3 x fan-noctua'); assert.equal(h.applied, 0); assert.equal(controls(h.target, 1).choice.value, ''); assert.deepEqual(h.inventory, before);
    controls(h.target, 1).choice.value = cpu.id; controls(h.target, 2).choice.value = fan.id; button(h.target, 'Review replacement inventory').click(); assert.equal(h.applied, 0); assert.match(h.target.textContent, /Parts removed/);
    const apply = button(h.target, 'Replace entered inventory'); assert.equal(apply.disabled, true); apply.click(); assert.equal(h.applied, 0); const checkbox = h.target.querySelector('input[type="checkbox"]'); checkbox.checked = true; checkbox.emit('change'); apply.click(); assert.equal(h.applied, 1); assert.deepEqual(h.inventory.cpu, [cpu.id]); assert.deepEqual(h.inventory.fan, [fan.id, fan.id, fan.id]); assert.deepEqual(h.inventory.gpu, []);
  });
  await test('cancellation and back-to-review preserve the previous PC and plan', () => {
    const h = UI(), before = clone(h.inventory); h.submit(cpu.id); controls(h.target, 1).choice.value = cpu.id; button(h.target, 'Review replacement inventory').click(); button(h.target, 'Back to model choices').click(); assert.equal(button(h.target, 'Replace entered inventory'), undefined); assert.deepEqual(h.inventory, before); button(h.target, 'Cancel review').click(); assert.equal(h.controller.pending(), null); assert.deepEqual(h.inventory, before); assert.match(h.messages.at(-1), /not changed/);
  });
  await test('editing a reviewed quantity invalidates final confirmation', () => {
    const h = UI(); h.submit('Fans: fan-noctua'); const row = controls(h.target, 1); row.choice.value = fan.id; button(h.target, 'Review replacement inventory').click(); row.quantity.value = '2'; row.quantity.emit('input'); assert.equal(button(h.target, 'Replace entered inventory'), undefined); assert.equal(h.applied, 0); button(h.target, 'Review replacement inventory').click(); const check = h.target.querySelector('input[type="checkbox"]'); check.checked = true; check.emit('change'); button(h.target, 'Replace entered inventory').click(); assert.equal(h.inventory.fan.length, 2);
  });
  await test('inventory edits elsewhere and application failures never overwrite the newer inventory', () => {
    const h = UI(); h.submit(cpu.id); controls(h.target, 1).choice.value = cpu.id; h.inventory = { ...empty(), cpu: [oldCPU.id], fan: [fan.id] }; button(h.target, 'Review replacement inventory').click(); assert.equal(h.applied, 0); assert.match(h.messages.at(-1), /inventory changed/);
    const failing = UI(); failing.submit(cpu.id); controls(failing.target, 1).choice.value = cpu.id; button(failing.target, 'Review replacement inventory').click(); const before = clone(failing.inventory); failing.fail(); const check = failing.target.querySelector('input[type="checkbox"]'); check.checked = true; check.emit('change'); button(failing.target, 'Replace entered inventory').click(); assert.deepEqual(failing.inventory, before); assert.equal(failing.applied, 0); assert.match(failing.messages.at(-1), /failure/);
  });
  await test('unknown lines remain explicit, search does not autofocus the keyboard on initial open', () => {
    const h = UI(); h.submit('mystery item\nCPU: cpu-9800x3d'); assert.equal(h.doc.activeElement, null); const unknown = controls(h.target, 1); controls(h.target, 2).choice.value = cpu.id; button(h.target, 'Review replacement inventory').click(); assert.match(h.messages.at(-1), /Line 1/); unknown.choice.value = '@exclude'; unknown.choice.emit('change'); assert.equal(unknown.quantity.disabled, true); button(h.target, 'Review replacement inventory').click(); const check = h.target.querySelector('input[type="checkbox"]'); check.checked = true; check.emit('change'); button(h.target, 'Replace entered inventory').click(); assert.match(h.target.textContent, /mystery item/); assert.equal(h.inventory.cpu[0], cpu.id);
  });
  await test('manual catalog search resolves an unknown line only through a chosen exact result', () => {
    const h = UI(); h.submit('not in catalog'); const row = controls(h.target, 1), input = row.group.querySelector('input[type="search"]'); input.value = 'SKU: 100-100001084WOF'; button(row.group, 'Find exact model choices').click(); assert(row.choice.querySelectorAll('option').some(option => option.value === cpu.id)); assert.equal(row.choice.value, ''); row.choice.value = cpu.id; button(h.target, 'Review replacement inventory').click(); assert.equal(h.applied, 0); assert.match(h.target.textContent, /Ryzen 7 9800X3D/);
  });
  await test('hostile pasted text renders as literal text and is never assigned to innerHTML', () => {
    const h = UI(); h.submit('<img src=x onerror=alert(1)>\nCPU: cpu-9800x3d'); assert.match(h.target.textContent, /<img src=x/); assert.equal(h.target.querySelector('img'), null); assert(h.target.querySelectorAll('fieldset').every(group => group.innerHTML === '')); assert.equal(h.applied, 0);
  });
  await test('unavailable choices fail closed without losing the current inventory', () => { const h = UI(), before = clone(h.inventory); h.unavailable(); h.submit(cpu.id); assert.match(h.target.textContent, /Wait/); assert.deepEqual(h.inventory, before); assert.equal(h.controller.pending(), null); });
  await test('real upgrade bridge atomically replaces exact quantities and invalidates stale plans', async () => {
    const h = await upgradeFixture(); h.form.elements.cpu.value = oldCPU.id; h.form.elements.gpu.value = otherGPU.id; h.form.elements.budget.value = '1200'; h.form.elements.notes.value = 'private workload'; h.form.emit('submit'); const oldSnapshot = JSON.stringify(h.bridge.snapshot());
    h.parse.elements.parts.value = 'CPU: cpu-9800x3d\n3 x fan: fan-noctua\nCPU cooler: cooler-noctua\nSSD: 2 x ssd-990'; h.parse.emit('submit'); const target = h.get('[data-upgrade-matches]');
    for (const [line, part] of [[1, cpu], [2, fan], [3, cooler], [4, drive]]) controls(target, line).choice.value = part.id;
    button(target, 'Review replacement inventory').click(); assert.equal(JSON.stringify(h.bridge.snapshot()), oldSnapshot); const check = target.querySelector('input[type="checkbox"]'); check.checked = true; check.emit('change'); button(target, 'Replace entered inventory').click();
    assert.equal(h.bridge.snapshot().ready, false); assert.equal(h.bridge.inventory().fan.length, 3); assert.equal(h.bridge.inventory().ssd.length, 2); assert.equal(h.bridge.inventory().cooler[0], cooler.id); assert.equal(h.form.elements.budget.value, '1200'); assert.equal(h.form.elements.notes.value, 'private workload');
    assert.deepEqual(h.events.filter(event => event.name === 'parts_list_imported'), [{ name: 'parts_list_imported', properties: { page_type: 'upgrade', action: 'confirmed' } }]);
    h.get('[data-upgrade-export]').click(); assert.equal(h.blobs.length, 0); h.form.emit('submit'); assert.equal(h.bridge.snapshot().ready, true); assert.deepEqual(Array.from(h.bridge.snapshot().baseline.ssd), [drive.id, drive.id]); h.get('[data-upgrade-export]').click(); const exported = JSON.parse(h.blobs[0][0]); assert.equal(exported.parts.fan.length, 3); assert.equal(exported.notes, undefined);
  });
  await test('real bridge validation and concurrent inventory guard preserve state on failure', async () => {
    const h = await upgradeFixture(); h.form.elements.cpu.value = oldCPU.id; const original = clone(h.bridge.inventory()), fingerprint = api.inventoryFingerprint(original);
    for (const bad of [{ ...empty(), cpu: ['missing'] }, { ...empty(), cpu: [cpu.id, oldCPU.id] }, empty(), { ...empty(), phone: ['private'] }, { ...empty(), fan: Array(100).fill(fan.id) }]) { assert.throws(() => h.bridge.applyConfirmedInventory(bad, fingerprint)); assert.deepEqual(clone(h.bridge.inventory()), original); }
    h.form.elements.gpu.value = otherGPU.id; const changed = clone(h.bridge.inventory()); assert.throws(() => h.bridge.applyConfirmedInventory({ ...empty(), cpu: [cpu.id] }, fingerprint), /changed during/); assert.deepEqual(clone(h.bridge.inventory()), changed); assert.equal(h.events.filter(event => event.name === 'parts_list_imported').length, 0);
  });
  await test('an unavailable analytics client cannot turn a successful replacement into a failed import', async () => {
    const h = await upgradeFixture(); h.form.elements.cpu.value = oldCPU.id; const fingerprint = api.inventoryFingerprint(h.bridge.inventory()); h.context.window.PCP_EVENTS.track = () => { throw Error('Synthetic analytics failure'); }; h.bridge.applyConfirmedInventory({ ...empty(), cpu: [cpu.id] }, fingerprint); assert.equal(h.bridge.inventory().cpu[0], cpu.id);
  });
  await test('pasted URLs cause no fetch and cancellation preserves a real existing upgrade phase', async () => {
    const h = await upgradeFixture(); h.form.elements.cpu.value = oldCPU.id; h.form.emit('submit'); const change = h.get('[data-upgrade-change]'); change.elements.slot.value = 'fan'; change.elements.mode.value = 'add'; change.elements.replacement.value = fan.id; h.get('[data-upgrade-phase]').click(); const before = JSON.stringify(h.bridge.snapshot()), phaseCount = h.get('[data-upgrade-phases]').children.length; assert.equal(phaseCount, 1); assert.equal(h.bridge.snapshot().parts.fan.length, 1); h.parse.elements.parts.value = 'https://private.test/pc?notes=secret\nCPU: cpu-9800x3d'; h.parse.emit('submit'); button(h.get('[data-upgrade-matches]'), 'Cancel review').click(); assert.equal(JSON.stringify(h.bridge.snapshot()), before); assert.equal(h.get('[data-upgrade-phases]').children.length, phaseCount); assert.deepEqual(h.requests, ['/data/program-parts.json']);
  });
  await test('legacy JSON plan import still preserves repeated drives and optional cooling slots', async () => {
    const h = await upgradeFixture(), baseline = Object.fromEntries(api.SLOTS.slice(0, 8).map(slot => [slot, []])); baseline.cpu = [oldCPU.id]; baseline.ssd = [drive.id, drive.id]; const current = { ...baseline, fan: [fan.id, fan.id], cooler: [cooler.id] }, data = { schema: 'pcp-upgrade-v1', region: 'CA', budget: 900, baseline, parts: current, phases: [] }; const serialized = JSON.stringify(data), input = h.get('[data-upgrade-import]'); input.files = [{ size: Buffer.byteLength(serialized), text: async () => serialized }]; await input.listeners.change[0]({ currentTarget: input }); assert.equal(h.bridge.snapshot().parts.ssd.length, 2); assert.equal(h.bridge.snapshot().parts.fan.length, 2); assert.equal(h.bridge.snapshot().parts.cooler[0], cooler.id); assert.equal(h.bridge.snapshot().baseline.cooler.length, 0);
  });
  await test('generator decorates only retained upgrade route with correct dependency order and is idempotent', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-parts-import-'));
    try { fs.mkdirSync(path.join(temp, 'upgrade')); const file = path.join(temp, 'upgrade/index.html'); fs.writeFileSync(file, '<html><head><script src="/upgrade-program.js" defer></script></head><body><form data-upgrade-parse><button>Find model matches</button></form><div data-upgrade-matches></div></body></html>'); assert.equal(decorate({ root: temp }).decorated, true); const first = fs.readFileSync(file, 'utf8'); assert(first.indexOf('/completion-parts-import.js') < first.indexOf('/upgrade-program.js')); assert.match(first, /Review pasted parts/); assert(fs.existsSync(path.join(temp, 'completion-parts-import.css'))); decorate({ root: temp }); assert.equal(fs.readFileSync(file, 'utf8'), first); fs.writeFileSync(file, '<head></head><form data-upgrade-parse></form><div data-upgrade-matches></div>'); assert.throws(() => decorate({ root: temp }), /existing upgrade-program/); }
    finally { const target = fs.realpathSync(temp), intended = fs.realpathSync(os.tmpdir()) + path.sep; assert(target.startsWith(intended) && path.basename(target).startsWith('pcp-parts-import-')); fs.rmSync(target, { recursive: true }); }
  });
  console.log(passed + ' pasted-parts import behavior tests passed. Synthetic fixtures and actual upgrade controller; no browser, deployment or hardware detection.');
})().catch(error => { console.error(error); process.exitCode = 1; });
