'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const content = require('./oct16-editorial-data.cjs');
const generate = require('./oct16-editorial.cjs');
const results = [];
const test = (name, run) => { run(); results.push(name); console.log('PASS ' + name); };
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const dates = { cost: '2026-10-11T22:03:10.405Z', fit: '2026-09-18' };
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcpart-oct16-editorial-'));
  fs.mkdirSync(path.join(root, 'blog'), { recursive: true });
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'master-publication-metadata.json'), JSON.stringify({
    [content.articles[2].route]: { datePublished: dates.fit, dateModified: '2026-10-13' }
  }));
  fs.writeFileSync(path.join(root, 'continuation-editorial-metadata.json'), JSON.stringify({
    [content.articles[1].route]: { datePublished: dates.cost }
  }));
  fs.writeFileSync(path.join(root, 'data/search-index.json'), JSON.stringify([
    { id: 'old_cost', url: content.articles[1].route }, { id: 'unrelated', url: '/hardware/' }
  ]));
  const write = (route, html) => { const directory = path.join(root, route); fs.mkdirSync(directory, { recursive: true }); fs.writeFileSync(path.join(directory, 'index.html'), html); };
  const shell = (title, type, body, options = {}) => '<!doctype html><html><head><title>' + esc(title) + '</title><meta name="description" content="' + esc(options.description || '') + '"></head><body><main data-template="' + type + '">' + body + '</main></body></html>';
  return { root, write, shell, esc };
}
function cleanup(root) {
  const parent = path.resolve(os.tmpdir()) + path.sep;
  const resolved = path.resolve(root);
  assert.ok(resolved.startsWith(parent) && path.basename(resolved).startsWith('pcpart-oct16-editorial-'));
  fs.rmSync(resolved, { recursive: true, force: true });
}
const articleHTML = (root, article) => fs.readFileSync(path.join(root, article.route, 'index.html'), 'utf8');
const jsonLD = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(row => JSON.parse(row[1]));

test('the batch adds one missing intent and materially revises two existing URLs', () => {
  const checked = content.validate(); assert.equal(checked.valid, true, checked.errors.join('; '));
  assert.equal(checked.newArticles, 1); assert.equal(checked.revisedArticles, 2);
  for (const a of content.articles.filter(a => a.change === 'material_revision')) assert.equal(a.route, a.revises.previousCanonical);
});
test('hardware guidance uses scoped primary evidence without invented review or deployment', () => {
  const hosts = new Set(['www.amd.com', 'www.noctua.at', 'support.arctic.de', 'fractaldesign.freshdesk.com', 'www.msi.com', 'www.intel.com', 'support.microsoft.com', 'storage-asset.msi.com', 'www.asus.com', 'www.fractal-design.com']);
  for (const source of Object.values(content.sources)) { assert.ok(hosts.has(new URL(source.url).hostname), source.url); assert.ok(source.scope && source.limitations); }
  for (const a of content.articles) { assert.equal(a.humanReviewClaimed, false); assert.equal(a.humanReview, null); assert.equal(a.lifecycle.confirmedDeployment, false); }
});
test('cooler example separates exact documented inputs from hypothetical values', () => {
  const a = content.articles[0], text = JSON.stringify(a);
  assert.ok(text.includes('100-100001084WOF')); assert.ok(text.includes('176 mm'));
  assert.ok(text.includes('168 + (40 − 32)')); assert.ok(text.includes('hypothetical inputs'));
  assert.ok(text.includes('no temperature, noise or FPS comparison')); assert.ok(text.includes('not a universal formula'));
});
test('radiator guidance preserves a real source conflict instead of selecting a convenient length', () => {
  const text = JSON.stringify(content.articles[2]);
  assert.ok(text.includes('38 mm')); assert.ok(text.includes('66 mm'));
  assert.ok(text.includes('do not give the same overall radiator length'));
  assert.ok(text.includes('uses neither disputed length as a fit verdict'));
});
test('complete-cost revision keeps unknown, owned and manually quoted prices distinct', () => {
  const text = JSON.stringify(content.articles[1]);
  assert.ok(text.includes('Neither status means that a retailer quoted a zero price'));
  assert.ok(text.includes('Keep manual quotes separate from observed offers'));
  assert.ok(text.includes('licence')); assert.ok(text.includes('Delivery') || text.includes('delivery'));
});
test('a changed attached source invalidates the exact article fingerprint', () => {
  const a = content.articles[0], hash = content.fingerprint(a), id = a.sourceIds[0], old = content.sources[id].scope;
  try { content.sources[id].scope = old + ' amended'; assert.notEqual(content.fingerprint(a), hash); }
  finally { content.sources[id].scope = old; }
  assert.equal(content.fingerprint(a), hash);
});
test('existing publication dates survive revisions and missing history fails explicitly', () => {
  const a = content.articles[1];
  assert.deepEqual(generate.datesFor(a, { continuationMetadata: { [a.route]: { datePublished: dates.cost } } }), { datePublished: dates.cost, dateModified: '2026-10-16' });
  assert.equal(generate.datesFor(a, { previousHTML: '<script>{"datePublished":"2026-10-11"}</script>' }).datePublished, '2026-10-11');
  assert.throws(() => generate.datesFor(a), /preserve the real original publication date/);
  assert.deepEqual(generate.datesFor(a, { preview: true }), { datePublished: null, dateModified: null });
});
test('original diagrams have real dimensions and small image payloads', () => {
  for (const a of content.articles) {
    const bytes = fs.readFileSync(path.join(__dirname, '../data/editorial-oct16', a.id + '.png'));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG'); assert.equal(bytes.readUInt32BE(16), 1200); assert.equal(bytes.readUInt32BE(20), 675);
    assert.ok(bytes.length < 50000, a.id + ' diagram unexpectedly large');
  }
});
test('ordinary internal actions resolve to existing tool pages or this exact batch', () => {
  const routes = new Set(content.articles.map(a => a.route));
  for (const a of content.articles) for (const action of a.tools) {
    const route = action.href.split('#')[0];
    assert.ok(routes.has(route) || fs.existsSync(path.join(__dirname, '../dist', route, 'index.html')), a.id + ' ' + route);
  }
});
test('generator produces one readable article and honest organization Article markup per route', () => {
  const context = fixture();
  try {
    const result = generate(context); assert.equal(result.articles, 3);
    for (const a of content.articles) {
      const html = articleHTML(context.root, a), schema = jsonLD(html);
      assert.equal((html.match(/<h1\b/g) || []).length, 1); assert.equal(schema.length, 1);
      assert.equal(schema[0]['@type'], 'Article'); assert.equal(schema[0].author['@type'], 'Organization');
      assert.equal(schema[0].author.name, 'PC Part Performance'); assert.equal(schema[0].url, 'https://www.pcpartperformance.com' + a.route);
      assert.equal(schema[0].citation.length, a.sourceIds.length); assert.ok(schema[0].image[0].endsWith(a.id + '.png'));
      assert.equal(schema[0].review, undefined); assert.equal(schema[0].offers, undefined);
      assert.ok(!html.includes('we tested')); assert.ok(!html.includes('master-assistance'));
    }
    assert.equal(jsonLD(articleHTML(context.root, content.articles[1]))[0].datePublished, dates.cost);
    assert.equal(jsonLD(articleHTML(context.root, content.articles[2]))[0].datePublished, dates.fit);
  } finally { cleanup(context.root); }
});
test('search and guide discovery update in place and repeated generation remains idempotent', () => {
  const context = fixture();
  try {
    generate(context); const before = JSON.parse(fs.readFileSync(path.join(context.root, 'master-publication-metadata.json')));
    generate(context); const after = JSON.parse(fs.readFileSync(path.join(context.root, 'master-publication-metadata.json')));
    assert.deepEqual(before, after);
    const index = JSON.parse(fs.readFileSync(path.join(context.root, 'data/search-index.json')));
    assert.equal(index.filter(row => row.id === 'unrelated').length, 1);
    for (const a of content.articles) assert.equal(index.filter(row => row.url === a.route).length, 1);
    const directory = fs.readFileSync(path.join(context.root, 'blog/index.html'), 'utf8');
    assert.ok(directory.includes(content.articles[0].route));
    const release = JSON.parse(fs.readFileSync(path.join(context.root, 'data/oct16-editorial-release.json')));
    assert.equal(release.confirmedDeployment, false); assert.equal(release.humanReviewClaimed, false);
  } finally { cleanup(context.root); }
});
test('preview draft mode does not leak new articles into search or claim first publication', () => {
  const context = fixture(), previous = process.env.PROGRAM_PREVIEW;
  try {
    process.env.PROGRAM_PREVIEW = '1'; generate(context);
    for (const a of content.articles) { const html = articleHTML(context.root, a); assert.ok(html.includes('data-program-draft')); assert.equal(jsonLD(html).length, 0); assert.ok(!html.includes('Published <time')); }
    const index = JSON.parse(fs.readFileSync(path.join(context.root, 'data/search-index.json')));
    assert.equal(index.length, 1);
    const metadata = JSON.parse(fs.readFileSync(path.join(context.root, 'master-publication-metadata.json')));
    for (const a of content.articles) { assert.equal(metadata[a.route].noindex, true); assert.equal(metadata[a.route].publicationAuthorized, false); assert.equal(metadata[a.route].datePublished, null); }
  } finally { if (previous === undefined) delete process.env.PROGRAM_PREVIEW; else process.env.PROGRAM_PREVIEW = previous; cleanup(context.root); }
});
console.log(JSON.stringify({ passed: results.length, batch: content.validate() }));
