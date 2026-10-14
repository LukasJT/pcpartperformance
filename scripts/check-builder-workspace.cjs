const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const selectors = require('./builder-selectors.js');
const workspace = require('./builder-workspace.js');
const rules = require('./compatibility-evidence.cjs');
const generator = require('./program-builder.cjs');
const repo = path.resolve(__dirname, '..');
let checks = 0;
function test(name, action) { action(); checks++; console.log('PASS ' + name); }
const records = [
  { id: 'cpu-a', cat: 'cpu', name: 'Ryzen 7 9800X3D', brand: 'AMD', architecture: 'Zen 5 · AM5', summary: '8 cores / 16 threads', specs: {} },
  { id: 'gpu-a', cat: 'gpu', name: 'MSI GeForce RTX 5070 12G VENTUS 3X OC', brand: 'MSI', summary: '12 GB GDDR7', sku: 'G5070-12V3C', specs: {} },
  { id: 'gpu-b', cat: 'gpu', name: 'ASUS TUF Gaming GeForce RTX 5070 OC Edition 12GB', brand: 'ASUS', summary: '12 GB GDDR7', specs: {} },
  { id: 'gpu-c', cat: 'gpu', name: 'ASRock Radeon RX 9070 XT Steel Legend 16GB', brand: 'ASRock', summary: '16 GB GDDR6', specs: {} },
  { id: 'ssd-a', cat: 'ssd', name: '990 PRO 1 TB', brand: 'Samsung', architecture: 'PCIe 4.0 ×4 · NVMe', summary: '1 TB', specs: {} },
  { id: 'fan-a', cat: 'fan', name: 'NF-A12x25 PWM', brand: 'Noctua', specs: { 'Fan size': 120 } }
];
const index = new Map(records.map(part => [part.id, part]));
const option = (value, textContent = value) => ({ value, textContent, disabled: false, hidden: false, dataset: {} });
const select = { options: [option('', 'None selected'), ...records.filter(part => part.cat === 'gpu').map(part => option(part.id, part.name)), { ...option('hidden'), hidden: true }, { ...option('disabled'), disabled: true }] };
const rows = selectors.optionRecords(select, index, new Set(['gpu-a', 'gpu-c']));
test('category choices exclude unavailable options and keep exact partner identities', () => {
  assert.deepEqual(rows.map(row => row.id), ['', 'gpu-a', 'gpu-b', 'gpu-c']);
  assert.equal(rows[1].name, records[1].name);
  assert.equal(rows[2].name, records[2].name);
});
test('multiple brand filters use OR; series and 3D availability then intersect', () => {
  const brands = new Set(['MSI', 'ASUS']);
  assert.deepEqual(selectors.filterOptions(rows, { brands }).map(row => row.id), ['gpu-a', 'gpu-b']);
  assert.deepEqual(selectors.filterOptions(rows, { brands, series: 'GeForce RTX 50 series', modelsOnly: true }).map(row => row.id), ['gpu-a']);
  assert.deepEqual(selectors.filterOptions(rows, { brands: ['ASRock'], series: 'GeForce RTX 50 series' }), []);
});
test('search finds capacities, SKU and punctuation without merging adjacent models', () => {
  assert.deepEqual(selectors.filterOptions(rows, { query: 'MSI 12 GB VENTUS' }).map(row => row.id), ['gpu-a']);
  assert.deepEqual(selectors.filterOptions(rows, { query: 'g5070-12v3c' }).map(row => row.id), ['gpu-a']);
  assert.deepEqual(selectors.filterOptions(rows, { query: '5070 16gb' }), []);
});
test('resetting filters restores choices and an empty category is a valid choice', () => {
  assert.equal(selectors.filterOptions(rows, { query: 'no possible matching model' }).length, 0);
  assert.equal(selectors.filterOptions(rows).length, 4);
  assert.equal(selectors.filterOptions(rows)[0].id, '');
  assert.equal(selectors.filterOptions(rows, { selected: 'gpu-b' })[0].id, 'gpu-b');
});
test('relevant series filters derive from indexed names and formats', () => {
  assert.equal(selectors.facet(records[0]), 'Ryzen 7');
  assert.equal(selectors.facet(records[1]), 'GeForce RTX 50 series');
  assert.equal(selectors.facet(records[3]), 'Radeon RX 9000 series');
  assert.equal(selectors.facet(records[4]), 'PCIe 4.0');
  assert.equal(selectors.facet(records[5]), '120 mm');
  assert.equal(selectors.facet({ cat: 'ram', name: 'VENGEANCE DDR5-6000 CL30' }), 'DDR5');
  assert.equal(selectors.facet({ cat: 'board', name: 'MAG B650 TOMAHAWK WIFI' }), 'B650');
});
test('a photo from another partner model or capacity falls back to a category icon', () => {
  const images = { 'gpu-a': { src: '/assets/msi.webp', picturedModel: records[1].name }, 'gpu-b': { src: '/assets/msi.webp', picturedModel: records[1].name }, 'ssd-a': { src: '/assets/ssd.webp', picturedModel: 'Samsung 990 PRO 2 TB' } };
  assert.equal(selectors.imageFor(records[1], images).src, '/assets/msi.webp');
  assert.equal(selectors.imageFor(records[2], images), null);
  assert.equal(selectors.imageFor(records[4], images), null);
  assert.equal(selectors.imageFor(records[1], { 'gpu-a': { src: 'javascript:alert(1)', exactVariant: true } }), null);
});
test('empty summaries remain empty, quantities count, and unknown IDs do not appear selected', () => {
  const empty = workspace.selectionSummary({ parts: {} }, records, rules);
  assert.equal(empty.count, 0); assert.equal(empty.conflicts, 0); assert(empty.missing.includes('storage'));
  const selected = workspace.selectionSummary({ parts: { cpu: ['cpu-a'], gpu: ['gpu-a', 'gpu-a'], ssd: ['ssd-a'], fan: ['fan-a', 'bad-id'], board: ['gpu-c'] } }, records, rules);
  assert.equal(selected.count, 5); assert(!selected.missing.includes('storage')); assert(selected.missing.includes('board'));
});
test('the browser modules expose helpers without selecting or restoring a build', () => {
  let selections = 0;
  const context = { window: { PCP_BUILD: { select() { selections++; }, load() { selections++; } } }, document: { readyState: 'loading', querySelector() { return null; }, addEventListener() {} } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'builder-selectors.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'builder-workspace.js'), 'utf8'), context);
  assert.equal(typeof context.window.PCP_BUILDER_SELECTORS.filterOptions, 'function');
  assert.equal(typeof context.window.PCP_BUILDER_WORKSPACE.selectionSummary, 'function'); assert.equal(selections, 0);
});
test('mount keeps server-placed preview and readiness in position', () => {
  const forbidMove = () => { throw new Error('Layout panels must be placed before first paint'); };
  const sectionNav={classList:{add(){}},querySelectorAll:()=>[]};
  const heading={nextElementSibling:sectionNav,after:forbidMove};
  const nodes = { '.builder-rail': {}, '.builder-parts': { querySelector: selector => selector==='.builder-workspace-head'?heading:null }, '.builder-jump-nav':sectionNav, '#builder-parts': {}, '#readiness-report': { after: forbidMove }, '.assembly-panel': { after: forbidMove }, '.builder-analysis': { after: forbidMove } };
  const builder = { querySelector: selector => nodes[selector] || null, querySelectorAll: () => [] };
  const context = { window: { PCP_BUILD: { catalog: () => [], snapshot: () => ({ parts: {} }) } }, document: { readyState: 'complete', querySelector: () => builder, addEventListener() {} }, MutationObserver: class { observe() {} } };
  vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(__dirname, 'builder-workspace.js'), 'utf8'), context);
  assert.equal(typeof context.window.PCP_BUILDER_WORKSPACE.mount, 'function');
});

test('the current purchase subtotal stays visible in review after a part change', () => {
  const price={hidden:true},events={},placements=[];
  const report={querySelector:selector=>selector==='.program-heading'?{after:node=>placements.push(node)}:null};
  const nodes={'.builder-rail':{},'#builder-parts':{},'#readiness-report':report,'#build-shopping-summary':price};
  const builder={querySelector:selector=>nodes[selector]||null,querySelectorAll:()=>[]};
  const context={window:{PCP_BUILD:{catalog:()=>[],snapshot:()=>({parts:{}})}},document:{readyState:'complete',querySelector:()=>builder,addEventListener:(name,fn)=>{events[name]=fn;}},MutationObserver:class{observe(){}}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'builder-workspace.js'),'utf8'),context);
  assert.equal(price.hidden,false);assert.deepEqual(placements,[price]);events['pcp:build']();assert.equal(price.hidden,false);assert.equal(placements.length,1);
});

const fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-builder-workspace-'));
const fixtureRoot = path.join(fixtureDirectory, 'dist');
fs.mkdirSync(path.join(fixtureRoot, 'builder'), { recursive: true });
fs.copyFileSync(path.join(repo, 'dist/builder/index.html'), path.join(fixtureRoot, 'builder/index.html'));
const write = (route, html) => { fs.mkdirSync(path.join(fixtureRoot, route), { recursive: true }); fs.writeFileSync(path.join(fixtureRoot, route, 'index.html'), html); };
const shell = (title, route, body) => `<html><head><title>${title}</title></head><body>${body}</body></html>`;
test('scoped generation keeps build controls and emits source assets once', () => {
  const baseline = fs.readFileSync(path.join(fixtureRoot, 'builder/index.html'), 'utf8');
  generator({ root: fixtureRoot, records, shell, write, esc: value => String(value) });
  const first = fs.readFileSync(path.join(fixtureRoot, 'builder/index.html'), 'utf8');
  generator({ root: fixtureRoot, records, shell, write, esc: value => String(value) });
  const second = fs.readFileSync(path.join(fixtureRoot, 'builder/index.html'), 'utf8');
  assert.equal(first, second);
  for (const id of ['builder-workflow', 'builder-choose', 'builder-sections', 'build-plan', 'guided-build-form', 'program-alternative-form', 'readiness-report', 'program-save-form', 'builder-starter', 'builder-clear']) assert.equal(first.split('id="' + id + '"').length - 1, 1);
  const sectionLinks=first.indexOf('<nav id="builder-sections"');
  assert(sectionLinks>first.indexOf('id="builder-choose"')&&sectionLinks<first.indexOf('id="builder-parts"'), 'Section navigation belongs with components before first paint');
  assert.equal(first.split('src="/builder-selectors.js"').length - 1, 1);
  assert.equal(first.split('src="/builder-workspace.js"').length - 1, 1);
  assert(!first.includes('src="/select-ui.js'));
  for (const asset of ['builder-selectors.js', 'builder-workspace.js', 'builder-workspace.css']) assert.equal(fs.readFileSync(path.join(fixtureRoot, asset), 'utf8'), fs.readFileSync(path.join(__dirname, asset), 'utf8'));
  assert.equal(baseline.includes('data-program-staging'), first.includes('data-program-staging'));
  assert(first.indexOf('/compatibility-evidence.js') < first.indexOf('/builder-v2.js'));
  const rail = first.indexOf('<div class="builder-rail">'), preview = first.indexOf('<section class="assembly-panel"'), report = first.indexOf('<section class="program-panel" id="readiness-report"'), analysis = first.indexOf('<aside class="builder-analysis"'), revisions = first.indexOf('<section class="program-panel" id="build-revisions"');
  assert(rail < preview && preview < report && report < analysis && analysis < revisions, 'Initial HTML must place preview, report and specifications in the rail, then saves outside it');
  assert(first.includes('id="build-preview"')); assert.equal(first.split('02 · Inspect your build').length - 1, 1);
  assert(!fs.readFileSync(path.join(fixtureRoot, 'tools/budget-build-lab/index.html'), 'utf8').includes('/builder-selectors.js'));
});
console.log(checks + ' builder workspace behavior checks passed.');
if (process.argv.includes('--serve')) {
  // Only this builder HTML and its emitted assets are overlaid; the existing dist stays untouched.
  const http = require('node:http');
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
  http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1:4192');
      const relative = '.' + decodeURIComponent(url.pathname);
      let target;
      for (const root of [fixtureRoot, path.join(repo, 'dist')]) {
        let candidate = path.resolve(root, relative);
        if (candidate !== root && !candidate.startsWith(root + path.sep)) throw Error('Invalid path');
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, 'index.html');
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) { target = candidate; break; }
      }
      if (!target) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, follow' });
      res.end(fs.readFileSync(target));
    } catch { res.writeHead(400); res.end('Invalid request'); }
  }).listen(4192, '127.0.0.1', () => console.log('Scoped builder QA: http://127.0.0.1:4192/builder/'));
}
