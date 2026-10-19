'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm');
const app = require('./evolution-diagrams.js'), generator = require('./evolution-diagrams.cjs');
test('all eight modules include distinct original SVG artwork, sources, native labels and still-state readouts', () => {
  const html = generator.body(), ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(generator.TOPICS.length, 8);
  assert.equal((html.match(/data-hardware-diagram=/g) || []).length, 8);
  assert.equal((html.match(/data-diagram-result/g) || []).length, 8);
  assert.equal(new Set(generator.TOPICS.map(topic => app.artwork(topic.id, topic.values))).size, 8);
  for (const topic of generator.TOPICS) {
    const art = app.artwork(topic.id, topic.values); assert(art.includes('role="img"')); assert(art.includes('aria-label='));
    assert(!/<image|<script|onload|foreignObject/.test(art));
    assert(topic.sources.every(key => /^https:\/\//.test(generator.SOURCES[key][1])));
    assert(html.includes(app.evaluate(topic.id, topic.values).readout.replace(/&/g, '&amp;')));
  }
  for (const match of html.matchAll(/<label for="([^"]+)"/g)) assert(ids.includes(match[1]), match[1]);
  assert(html.includes('<noscript>')); assert(html.includes('not specifications for an actual card'));
});
test('airflow direction never asserts pressure or a measured thermal result', () => {
  const intake = app.evaluate('airflow', { front: 'in', rear: 'in' }); assert.equal(intake.state, 'check');
  assert(intake.readout.includes('Fan count alone does not establish case pressure'));
  assert.notEqual(app.artwork('airflow', { front: 'in' }), app.artwork('airflow', { front: 'out' }));
});
test('memory layout changes only within the explicit documented four-slot example', () => {
  assert.deepEqual(app.evaluate('memory', { modules: '1' }).slots, ['A2']);
  assert.deepEqual(app.evaluate('memory', { modules: '2' }).slots, ['A2', 'B2']);
  assert.equal(app.evaluate('memory', { modules: '4' }).slots.length, 4);
  assert(app.evaluate('memory').readout.includes('does not establish BIOS support'));
});
test('MSI documented sharing reduces only the named occupied slots, and empty slots have no active energy path', () => {
  assert.equal(app.evaluate('lanes', { m2: true, pcie: false }).m2Lanes, 4);
  assert.equal(app.evaluate('lanes', { m2: true, pcie: true }).m2Lanes, 2);
  assert.equal(app.evaluate('lanes', { m2: true, pcie: true }).pcieLanes, 2);
  assert.equal(app.evaluate('lanes', { m2: false, pcie: true }).m2Lanes, 0);
  assert(!app.artwork('lanes', { m2: false, pcie: false }).includes('class="hd-energy"'));
});
test('PWM command is not treated as RPM and a three-pin/PWM mismatch requires checking', () => {
  assert(app.evaluate('fan', { pins: '4', mode: 'pwm', duty: '30' }).readout.includes('30% illustrative PWM command'));
  assert.equal(app.evaluate('fan', { pins: '3', mode: 'pwm' }).state, 'check');
  assert(app.evaluate('fan', { pins: '3', mode: 'dc' }).readout.includes('supply voltage'));
  assert.equal(app.evaluate('fan', { duty: '500' }).duty, 50);
});
test('length worksheet preserves missing data, negative remainder and single-axis limits', () => {
  assert.equal(app.evaluate('gpu', { card: '300', space: '340', obstruction: '20' }).remaining, 20);
  assert.equal(app.evaluate('gpu', { card: '350', space: '340', obstruction: '20' }).remaining, -30);
  assert.equal(app.evaluate('gpu', { card: '300', space: '300', obstruction: '0' }).state, 'check');
  for (const value of ['', null, 'Infinity', 'oops', -5, 99999]) assert.equal(app.evaluate('gpu', { card: value, space: '340', obstruction: '20' }).remaining, null);
  assert(app.evaluate('gpu', { card: '300', space: '340', obstruction: '20' }).readout.includes('one axis'));
});
test('connector identity is distinct from compatibility and PSU-side pinout', () => {
  const cpu = app.evaluate('power', { connector: 'eps' }), gpu = app.evaluate('power', { connector: 'pcie' });
  assert.notEqual(cpu.name, gpu.name); assert.equal(cpu.columns * cpu.rows, gpu.columns * gpu.rows);
  assert(cpu.readout.includes('not a pinout')); assert(gpu.readout.includes('not universally interchangeable'));
  assert(app.evaluate('power', { connector: 'modern' }).readout.includes('four smaller sideband'));
});
test('M.2 artwork uses a common linear scale and protocol stays independent of dimensions', () => {
  const art = app.artwork('storage');
  for (const width of [30 * 3.2, 42 * 3.2, 80 * 3.2, 110 * 3.2]) assert(art.includes('width="' + width + '"'));
  assert.equal(app.evaluate('storage', { size: '22110', protocol: 'sata' }).length, 110);
  assert(app.evaluate('storage', { size: '2230', protocol: 'nvme' }).readout.includes('socket that supports PCIe/NVMe'));
  assert(!app.artwork('storage', { size: '<script>' }).includes('<script>'));
});
test('cooling example states pump-location assumption and does not infer temperature', () => {
  assert.equal(app.evaluate('cooling', { placement: 'bottom' }).state, 'check');
  assert(app.evaluate('cooling', { placement: 'top' }).readout.includes('CPU-block-pump example'));
  assert(app.evaluate('cooling', { placement: 'air' }).readout.includes('installed height'));
});
test('scoped route generation copies two assets and does not load the catalog or 3D engines', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-diagrams-')), writes = [];
  const result = generator.prepare({ root, shell: (title, view, body, options) => '<html><head><title>' + title + '</title></head><body>' + body + '</body></html>', write: (route, html) => writes.push({ route, html }) });
  assert.deepEqual(result.routes, ['/build-school/hardware-diagrams/']); assert.equal(result.diagrams, 8);
  assert.equal(writes.length, 1); assert(writes[0].html.includes('src="/evolution-diagrams.js"'));
  assert(!/src="\/(?:data|component-data|three|build-scene)\.js/.test(writes[0].html));
  for (const asset of result.assets) assert(fs.existsSync(path.join(root, asset)));
});
test('motion is opt-in, paused offscreen and for hidden documents, with no timer loop', () => {
  const source = fs.readFileSync(path.join(__dirname, 'evolution-diagrams.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'evolution-diagrams.css'), 'utf8');
  assert(source.includes('let running = false')); assert(source.includes('!document.hidden')); assert(source.includes('IntersectionObserver'));
  assert(!/setInterval|requestAnimationFrame|setTimeout/.test(source));
  assert(css.includes('[data-diagram-motion=true] [data-diagram-visible=true]'));
  assert(css.includes('@media(prefers-reduced-motion:reduce)')); assert(css.includes('@media(max-width:600px)'));
});
function mountedFixture() {
  const reduced = { matches: false, addEventListener(name, fn) { this.listener = fn; } }, events = {}, windowEvents = {}, root = { dataset: { motion: 'standard', ambient: 'on' } };
  const cards = generator.TOPICS.map(topic => {
    const handlers = {}, inputs = Object.entries(topic.values).map(([key, value]) => ({ dataset: { diagramInput: key }, value: String(value), checked: value, type: typeof value === 'boolean' ? 'checkbox' : 'select' }));
    const art = { innerHTML: '' }, result = { textContent: '' };
    return { dataset: { hardwareDiagram: topic.id }, inputs, art, result, handlers, addEventListener(name, fn) { handlers[name] = fn; }, querySelectorAll(selector) { return selector === '[data-diagram-input]' ? inputs : []; }, querySelector(selector) { return selector === '[data-diagram-art]' ? art : result; } };
  });
  const motion = { attributes: {}, textContent: '', setAttribute(name, value) { this.attributes[name] = value; }, addEventListener(name, fn) { this.click = fn; } };
  const page = { dataset: {}, querySelectorAll: () => cards, querySelector: () => motion };
  const context = { window: { matchMedia: () => reduced, addEventListener(name, fn) { windowEvents[name] = fn; } }, document: { documentElement: root, readyState: 'complete', hidden: false, querySelector: () => page, addEventListener(name, fn) { events[name] = fn; } } };
  vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(__dirname, 'evolution-diagrams.js'), 'utf8'), context);
  return { reduced, events, windowEvents, root, cards, motion, page, context };
}
test('mounted controls update artwork and accessible readouts, while reduced motion disables the opt-in switch', () => {
  const { reduced, events, cards, motion, page, context } = mountedFixture();
  assert.equal(page.dataset.diagramMotion, 'false'); assert.equal(cards[0].dataset.diagramVisible, 'true');
  const memory = cards.find(card => card.dataset.hardwareDiagram === 'memory'), before = memory.art.innerHTML;
  memory.inputs[0].value = '1'; memory.handlers.input();
  assert.notEqual(memory.art.innerHTML, before); assert(memory.result.textContent.includes('populate A2.'));
  motion.click(); assert.equal(page.dataset.diagramMotion, 'true');
  context.document.hidden = true; events.visibilitychange(); assert.equal(page.dataset.diagramMotion, 'false');
  context.document.hidden = false; reduced.matches = true; reduced.listener();
  assert.equal(motion.disabled, true); assert.equal(motion.attributes['aria-pressed'], 'false');
});
test('manual reduced motion and global ambient pause cancel diagram opt-in without restarting on preference resume', () => {
  const { root, motion, page, windowEvents } = mountedFixture();
  motion.click(); assert.equal(page.dataset.diagramMotion, 'true');
  root.dataset.motion = 'reduced'; windowEvents['pcp:appearance']();
  assert.equal(page.dataset.diagramMotion, 'false'); assert.equal(motion.disabled, true); assert.equal(motion.attributes['aria-pressed'], 'false');
  assert.equal(motion.textContent, 'Reduced motion enabled');
  root.dataset.motion = 'standard'; windowEvents['pcp:appearance']();
  assert.equal(motion.disabled, false); assert.equal(page.dataset.diagramMotion, 'false'); assert.equal(motion.textContent, 'Animate diagrams');
  motion.click(); assert.equal(page.dataset.diagramMotion, 'true');
  root.dataset.ambient = 'off'; windowEvents['pcp:appearance']();
  assert.equal(page.dataset.diagramMotion, 'false'); assert.equal(motion.disabled, true); assert.equal(motion.textContent, 'Ambient motion paused');
  root.dataset.ambient = 'on'; windowEvents['pcp:appearance']();
  assert.equal(motion.disabled, false); assert.equal(page.dataset.diagramMotion, 'false'); assert.equal(motion.attributes['aria-pressed'], 'false');
});
