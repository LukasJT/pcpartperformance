'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const editorial = require('./completion-editorial.cjs');
const data = editorial.dataset;
const original = require('./program-editorial.cjs');
const NOW = Date.parse('2026-10-17T01:30:00Z');
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function auth(extra = {}) {
  return editorial.authorizationFor({ statement: 'Synthetic test owner release; no real publication is performed.', recordedAt: '2026-10-17T01:00:00Z', releaseDate: '2026-10-16', ...extra }, NOW);
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-completion-editorial-'));
  const write = (route, html) => { const file = path.join(root, route, 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); };
  const shell = (title, kind, body, options) => '<!doctype html><html><head><title>' + esc(title) + '</title><meta name="description" content="' + esc(options.description) + '"></head><body><main>' + body + '</main></body></html>';
  for (const a of data.articles) for (const t of a.tools) { const file = editorial.localPage(root, t.href); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, '<!doctype html><main>Existing destination</main>'); }
  const metadata = {};
  for (const a of data.articles.filter(a => a.change === 'material_revision')) {
    write(a.route.slice(1, -1), '<!doctype html><head><script type="application/ld+json">{"@type":"Article","datePublished":"2026-09-18"}</script></head><main>Existing published guide</main>');
    metadata[a.route] = { editorialId: a.priorEditorialId, datePublished: '2026-09-18', dateModified: '2026-10-13', publicationAuthorized: true, image: { src: '/assets/existing.png', alt: 'Existing relevant diagram', width: 1200, height: 675 } };
  }
  fs.writeFileSync(path.join(root, 'master-publication-metadata.json'), JSON.stringify(metadata));
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/existing.png'), 'synthetic test asset');
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/search-index.json'), JSON.stringify([{ id: 'keep', title: 'Existing useful tool', url: '/builder/' }, { id: 'old', title: 'Old PSU title', url: '/blog/choose-a-pc-power-supply/' }]));
  fs.writeFileSync(path.join(root, 'program-draft-routes.json'), JSON.stringify(['/blog/premiere-creator-pc-workload-guide/', ...data.articles.filter(a => a.change === 'new').map(a => a.route)]));
  return { root, write, shell, esc, cleanup() {
    const resolved = path.resolve(root), temp = path.resolve(os.tmpdir()) + path.sep;
    assert.ok(resolved.startsWith(temp) && path.basename(resolved).startsWith('pcp-completion-editorial-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  } };
}
const json = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('eight complete source-linked articles have truthful lifecycle, organization author and unique canonicals', () => {
  assert.equal(data.validate().valid, true);
  assert.equal(data.articles.length, 8);
  assert.equal(data.articles.filter(a => a.change === 'material_revision').length, 3);
  for (const a of data.articles) {
    assert.equal(a.author, 'PC Part Performance');
    assert.equal(a.lifecycle.humanEditorialReview, null);
    assert.equal(a.lifecycle.humanReviewClaimed, false);
    assert.equal(a.datePublished, null);
    assert.ok(a.sections.every(s => s.paragraphs.length >= 2));
    assert.ok(a.sections.filter(s => s.sourceIds.length).length >= 2);
    assert.ok(a.tools.length >= 3);
    assert.match(data.fingerprint(a), /^[a-f0-9]{64}$/);
  }
});

test('draft intent reuse preserves intended canonicals and leaves priced/tested creator brief blocked', () => {
  for (const a of data.articles.filter(a => a.replacesDraftIntent)) assert.equal(a.route, original.articles.find(p => p.id === a.replacesDraftIntent).route);
  const planning = data.articles.find(a => a.id === 'MC08');
  assert.equal(planning.doesNotReplaceBlockedDraft, true);
  assert.equal(planning.partialIntent, '39');
  assert.notEqual(planning.route, original.articles.find(p => p.id === '39').route);
  assert.match(planning.limitations.join(' '), /benchmarks.*BOM.*offers/);
});

test('all 72 requested intents have explicit coverage, evidence and next actions without measured-demand claims', () => {
  const checked = editorial.intents.validate();
  assert.equal(checked.valid, true);
  assert.equal(checked.rows, 72);
  assert.equal(editorial.intents.map.filter(r => r.program === 'L').length, 32);
  assert.equal(editorial.intents.map.filter(r => r.program === 'P').length, 40);
  assert.deepEqual(editorial.intents.map.filter(r => r.status === 'blocked_data').map(r => r.id), ['P02', 'P03', 'P04', 'P05', 'P14', 'P39']);
  assert.ok(editorial.intents.map.every(r => /hypothesis/.test(r.demandBasis)));
  assert.equal(editorial.intents.validate(editorial.intents.map.slice(1)).valid, false);
});

test('source records preserve version conflicts and failed-access scope instead of inferring unavailable facts', () => {
  assert.match(data.sources.premiere.version, /26\.5\.2/);
  assert.match(data.sources.premiereRecommendations.limitations, /differ/);
  assert.match(data.sources.frameViewChange.scope, /reporting changed/);
  assert.match(data.sources.seasonicCables.limitations, /did not return readable/);
  assert.equal(Object.keys(data.sources).some(k => /blender/i.test(k)), false);
  for (const s of Object.values(data.sources)) assert.ok(s.publisher && s.url.startsWith('https://') && s.inspected && s.scope && s.limitations);
});

test('original recording-size arithmetic remains an assumption, not a bitrate recommendation or observation', () => {
  const a = data.articles.find(a => a.id === 'MC07');
  assert.equal(20 * 3600 / 8, 9000);
  assert.equal(9000 / 1000, 9);
  assert.equal(a.claims[0].kind, 'original_arithmetic');
  assert.equal(a.claims[0].measured, false);
  assert.match(a.sections.at(-1).paragraphs[0], /hypothetical.*before container overhead.*not a measured/);
});

test('missing owner release writes no public pages or new index entries', () => {
  const f = fixture();
  try {
    const before = fs.readFileSync(path.join(f.root, 'data/search-index.json'), 'utf8');
    const r = editorial(f);
    assert.equal(r.rendered, 0);
    assert.equal(r.released, 0);
    assert.equal(fs.readFileSync(path.join(f.root, 'data/search-index.json'), 'utf8'), before);
    assert.equal(fs.existsSync(editorial.localPage(f.root, '/blog/read-hardware-benchmarks-test-conditions/')), false);
  } finally { f.cleanup(); }
});

test('owner release pins exact content and sources and cannot fabricate review, author, time or duplicates', () => {
  const a = auth();
  assert.equal(editorial.validateAuthorization(a, NOW), a);
  const mutations = [
    b => { b.humanReviewClaimed = true; }, b => { b.author = 'Invented reviewer'; },
    b => { b.recordedAt = '2027-01-01T00:00:00Z'; }, b => { b.releaseDate = '2027-01-01'; },
    b => { b.releaseDate = '2026-10-15'; }, b => { b.articles[0].hash = 'a'.repeat(64); },
    b => { b.articles.push(b.articles[0]); }, b => { b.statement = ''; }
  ];
  for (const change of mutations) { const b = structuredClone(a); change(b); assert.throws(() => editorial.validateAuthorization(b, NOW)); }
  const old = data.sources.flashButton.scope;
  try { data.sources.flashButton.scope += ' Material source record changed.'; assert.throws(() => editorial.validateAuthorization(a, NOW), /changed/); }
  finally { data.sources.flashButton.scope = old; }
});

test('material revisions preserve original publication and require real history', () => {
  const a = data.articles.find(a => a.id === 'MC03');
  assert.deepEqual(editorial.datesFor(a, { previousHTML: '<script>{"datePublished":"2026-09-18"}</script>', releaseDate: '2026-10-16' }), { datePublished: '2026-09-18', dateModified: '2026-10-16' });
  assert.throws(() => editorial.datesFor(a, { releaseDate: '2026-10-16' }), /publication history/);
  assert.deepEqual(editorial.datesFor(a, { preview: true }), { datePublished: null, dateModified: null });
});

test('integration releases the eight exact versions, keeps original dates, source links and blocked draft exclusions', () => {
  const f = fixture();
  try {
    const r = editorial(f, { authorization: auth(), now: NOW });
    assert.equal(r.released, 8);
    const meta = json(f.root, 'master-publication-metadata.json');
    for (const a of data.articles) {
      const html = fs.readFileSync(editorial.localPage(f.root, a.route), 'utf8');
      assert.ok(html.includes(esc(a.title)));
      assert.ok(!html.includes('data-program-draft'));
      assert.ok(!html.includes('master-assistance'));
      assert.equal(meta[a.route].publicationAuthorized, true);
      const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
      assert.equal(schemas.length, 1);
      assert.equal(schemas[0]['@type'], 'Article');
      assert.equal(schemas[0].author['@type'], 'Organization');
      assert.equal(schemas[0].author.name, 'PC Part Performance');
      assert.equal(schemas[0].url, 'https://www.pcpartperformance.com' + a.route);
      assert.equal(schemas[0].offers, undefined);
      assert.equal(schemas[0].aggregateRating, undefined);
      for (const id of a.sourceIds) assert.ok(html.includes(esc(data.sources[id].url)));
      assert.equal(meta[a.route].datePublished, a.change === 'new' ? '2026-10-16' : '2026-09-18');
      if (a.change === 'material_revision') assert.ok(html.includes('<img src="/assets/existing.png"'));
    }
    const release = json(f.root, 'data/completion-editorial-release.json');
    assert.equal(release.confirmedDeployment, false);
    assert.equal(release.humanReviewClaimed, false);
    assert.equal(release.state, 'owner_authorized_release_prepared');
    assert.deepEqual(json(f.root, 'program-draft-routes.json'), ['/blog/premiere-creator-pc-workload-guide/']);
    const index = json(f.root, 'data/search-index.json');
    assert.equal(index.filter(r => data.articles.some(a => a.route === r.url)).length, 8);
    assert.ok(index.some(r => r.id === 'keep'));
  } finally { f.cleanup(); }
});

test('rebuilding the same pinned versions does not freshen dates or duplicate search entries', () => {
  const f = fixture();
  try {
    editorial(f, { authorization: auth(), now: NOW });
    const before = json(f.root, 'master-publication-metadata.json');
    const next = editorial.authorizationFor({ statement: 'Synthetic subsequent build only.', recordedAt: '2026-10-18T01:00:00Z', releaseDate: '2026-10-17' }, Date.parse('2026-10-18T01:30:00Z'));
    editorial(f, { authorization: next, now: Date.parse('2026-10-18T01:30:00Z') });
    const after = json(f.root, 'master-publication-metadata.json');
    for (const a of data.articles) assert.deepEqual(after[a.route], before[a.route]);
    const index = json(f.root, 'data/search-index.json');
    assert.equal(new Set(index.map(r => r.url)).size, index.length);
  } finally { f.cleanup(); }
});

test('full-chain metadata regeneration restores only pinned own publication history from retained HTML and release record', () => {
  const f = fixture();
  try {
    editorial(f, { authorization: auth(), now: NOW });
    const before = json(f.root, 'master-publication-metadata.json');
    // Simulate master-publication rebuilding its own metadata while previously
    // generated completion HTML and its owned release record remain on disk.
    fs.writeFileSync(path.join(f.root, 'master-publication-metadata.json'), JSON.stringify({ '/blog/upstream-only/': { title: 'Unrelated upstream guide', datePublished: '2026-09-15' } }));
    const later = Date.parse('2026-10-18T01:30:00Z');
    const next = editorial.authorizationFor({ statement: 'Synthetic next full-chain build.', recordedAt: '2026-10-18T01:00:00Z', releaseDate: '2026-10-17' }, later);
    assert.equal(editorial(f, { authorization: next, now: later }).released, 8);
    const after = json(f.root, 'master-publication-metadata.json');
    for (const a of data.articles) {
      assert.equal(after[a.route].editorialId, a.id);
      assert.equal(after[a.route].completionFingerprint, data.fingerprint(a));
      assert.equal(after[a.route].datePublished, before[a.route].datePublished);
      assert.equal(after[a.route].dateModified, before[a.route].dateModified);
    }
    assert.equal(after['/blog/upstream-only/'].title, 'Unrelated upstream guide');
  } finally { f.cleanup(); }
});

test('retained release data cannot claim another published page or an uncorroborated date/version as its own', () => {
  for (const problem of ['different_html', 'wrong_hash', 'wrong_route', 'changed_date', 'future_date', 'duplicate_record', 'invented_review']) {
    const f = fixture();
    try {
      editorial(f, { authorization: auth(), now: NOW });
      fs.writeFileSync(path.join(f.root, 'master-publication-metadata.json'), '{}');
      const a = data.articles.find(row => row.id === 'MC04');
      const release = json(f.root, 'data/completion-editorial-release.json');
      const row = release.articles.find(row => row.id === a.id);
      if (problem === 'different_html') f.write(a.route.slice(1, -1), '<script type="application/ld+json">{"@type":"Article","datePublished":"2026-10-10","headline":"Another published guide"}</script><article>Other owner</article>');
      if (problem === 'wrong_hash') row.contentHash = 'f'.repeat(64);
      if (problem === 'wrong_route') row.route = '/blog/another-guide/';
      if (problem === 'changed_date') row.datePublished = '2026-10-15';
      if (problem === 'future_date') row.datePublished = '2027-01-01';
      if (problem === 'duplicate_record') release.articles.push({ ...row });
      if (problem === 'invented_review') release.humanReviewClaimed = true;
      fs.writeFileSync(path.join(f.root, 'data/completion-editorial-release.json'), JSON.stringify(release));
      assert.throws(() => editorial(f, { authorization: auth(), now: NOW }), /published canonical/, problem);
    } finally { f.cleanup(); }
  }
});

test('private preview has no public article dates, schema or searchable draft entries', () => {
  const f = fixture();
  try {
    const r = editorial(f, { preview: true });
    assert.equal(r.released, 0);
    assert.equal(r.rendered, 8);
    const meta = json(f.root, 'master-publication-metadata.json');
    for (const a of data.articles) {
      const html = fs.readFileSync(editorial.localPage(f.root, a.route), 'utf8');
      assert.ok(html.includes('data-program-draft'));
      assert.ok(html.includes('Research draft'));
      assert.ok(!html.includes('"@type":"Article"'));
      assert.equal(meta[a.route].datePublished, null);
      assert.equal(meta[a.route].noindex, true);
    }
    assert.equal(json(f.root, 'data/search-index.json').some(r => data.articles.some(a => a.route === r.url)), false);
  } finally { f.cleanup(); }
});

test('a broken next action or canonical collision fails before modifying any public article', () => {
  for (const problem of ['link', 'canonical']) {
    const f = fixture();
    try {
      const originalArticle = fs.readFileSync(editorial.localPage(f.root, data.articles[0].route), 'utf8');
      if (problem === 'link') fs.unlinkSync(editorial.localPage(f.root, '/upgrade/'));
      else f.write(data.articles.find(a => a.id === 'MC04').route.slice(1, -1), '<head><script>{"datePublished":"2026-10-10"}</script></head><main>Other published article</main>');
      assert.throws(() => editorial(f, { authorization: auth(), now: NOW }), /Missing next-action|published canonical/);
      assert.equal(fs.readFileSync(editorial.localPage(f.root, data.articles[0].route), 'utf8'), originalArticle);
    } finally { f.cleanup(); }
  }
});

test('review packet contains full text, source scope, hashes and all roadmaps without claiming deployment', () => {
  const f = fixture();
  try {
    const docs = path.join(f.root, 'private-review');
    const r = editorial.prepare({ directory: docs });
    assert.equal(r.gapRows, 72);
    for (const a of data.articles) {
      const md = fs.readFileSync(path.join(docs, a.id + '.md'), 'utf8');
      for (const s of a.sections) assert.ok(md.includes(s.paragraphs[0]));
      assert.ok(md.includes(data.fingerprint(a)));
      assert.ok(md.includes('Human review: none claimed'));
    }
    assert.equal(json(docs, 'MANIFEST.json').deploymentConfirmed, false);
    assert.equal(json(docs, 'GAP-MAP.json').rows.length, 72);
    assert.ok(fs.readFileSync(path.join(docs, 'REVIEW-PACKET.md'), 'utf8').includes('hard missing-data blockers'));
  } finally { f.cleanup(); }
});

test('all action destinations and public coverage routes exist in the current generated site or this batch', () => {
  const root = path.join(__dirname, '../dist');
  const planned = new Set(data.articles.map(a => a.route));
  for (const a of data.articles) for (const t of a.tools) assert.ok(planned.has(t.href.split(/[?#]/)[0]) || fs.existsSync(editorial.localPage(root, t.href)), a.id + ' missing ' + t.href);
  for (const r of editorial.intents.map.filter(r => !['blocked_data', 'remaining_editorial'].includes(r.status))) for (const route of r.routes) {
    assert.ok(planned.has(route) || fs.existsSync(editorial.localPage(root, route)), r.id + ' missing ' + route);
  }
});
