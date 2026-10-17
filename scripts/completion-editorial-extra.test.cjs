'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const extra = require('./completion-editorial-extra.cjs');
const data = extra.dataset;
const original = require('./program-editorial.cjs');
const first = require('./completion-editorial.cjs');
const NOW = Date.parse('2026-10-17T02:00:00Z');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (root, name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
function auth(options = {}) { return extra.authorizationFor({ statement: 'Synthetic test instruction only; no public release.', recordedAt: '2026-10-17T01:30:00Z', releaseDate: '2026-10-16', ...options }, NOW); }
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-extra-editorial-'));
  const write = (route, html) => { const file = path.join(root, route, 'index.html'); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); };
  const shell = (title, kind, body, options) => '<!doctype html><html><head><title>' + esc(title) + '</title><meta name="description" content="' + esc(options.description) + '"></head><body><main>' + body + '</main></body></html>';
  for (const row of data.articles) for (const action of row.tools) { const file = extra.localPage(root, action.href); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, '<!doctype html><main>Existing working destination</main>'); }
  fs.writeFileSync(path.join(root, 'master-publication-metadata.json'), JSON.stringify({ '/blog/existing-guide/': { datePublished: '2026-09-22', title: 'Existing guide' } }));
  fs.writeFileSync(path.join(root, 'program-draft-routes.json'), JSON.stringify(['/blog/premiere-creator-pc-workload-guide/', ...data.articles.map(a => a.route)]));
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/search-index.json'), JSON.stringify([{ id: 'keep', title: 'Existing tool', url: '/builder/' }, { id: 'old-draft', title: 'Old reserved draft', url: data.articles[0].route }]));
  fs.writeFileSync(path.join(root, 'data/completion-editorial-release.json'), '{"state":"existing_first_eight_release"}');
  return { root, write, shell, esc, cleanup() { const resolved = path.resolve(root); assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('pcp-extra-editorial-')); fs.rmSync(resolved, { recursive: true, force: true }); } };
}

test('four complete practical guides cover five remaining intents without duplicating the first eight', () => {
  assert.equal(data.validate().valid, true);
  assert.equal(data.articles.length, 4);
  assert.deepEqual(data.gapOverlay.map(r => r.id), ['L12', 'L30', 'P08', 'P18', 'P20']);
  for (const a of data.articles) {
    assert.equal(a.author, 'PC Part Performance');
    assert.equal(a.lifecycle.humanReviewClaimed, false);
    assert.equal(a.lifecycle.humanEditorialReview, null);
    assert.equal(a.datePublished, null);
    assert.equal(a.dateModified, null);
    assert.ok(data.wordCount(a) > 650, a.id + ' contains full decision guidance');
    assert.ok(a.sections.every(s => s.paragraphs.length >= 2));
    assert.ok(!first.dataset.articles.some(p => p.route === a.route));
    assert.match(data.fingerprint(a), /^[a-f0-9]{64}$/);
  }
});

test('reserved draft intents retain their canonical URLs while used-sale guidance has its own distinct task', () => {
  for (const a of data.articles.filter(a => a.replacesDraftIntent)) assert.equal(a.route, original.articles.find(row => row.id === a.replacesDraftIntent).route);
  const used = data.articles.find(a => a.id === 'MX02');
  assert.equal(used.route, '/blog/buying-used-pc-parts-checklist/');
  assert.ok(used.tools.some(t => t.href === '/blog/reuse-pc-components-new-build/'));
  assert.match(used.sections.at(-1).paragraphs.at(-1), /different question/);
});

test('Terra example requires a shared supported position rather than independent largest allowances', () => {
  const a = data.articles.find(a => a.id === 'MX01');
  const { coolerHeightMm, gpuThicknessMm } = a.claims[0].inputs;
  const cooler = [77, 72, 67, 62, 57, 53, 48], gpu = [43, 48, 53, 58, 63, 67, 72];
  assert.equal(cooler.some((height, i) => height >= coolerHeightMm && gpu[i] >= gpuThicknessMm), false);
  assert.equal(a.claims[0].measured, false);
  assert.match(a.sections[1].paragraphs[1], /hypothetical dimensions/);
  assert.match(a.sections[2].paragraphs[1], /200 mm.*120 mm radiator.*322 mm/);
});

test('North comparison retains the side-bracket conflict and does not turn AIO width into a full fit pass', () => {
  const a = data.articles.find(a => a.id === 'MX03');
  assert.equal(158 <= 170, true);
  assert.equal(158 <= 145, false);
  assert.match(a.sections[1].table.rows[2][2], /Exceeds/);
  assert.match(a.sections[2].paragraphs[0], /35 mm.*RAM/);
  assert.match(a.sections[2].paragraphs[0], /does not prove that the complete assembly fits/);
  assert.match(a.sections[4].paragraphs[1], /did not establish a matched thermal\/acoustic test/);
  assert.match(a.limitations.join(' '), /No cooler winner/);
});

test('RTX guide distinguishes exact memory variants and chart modes, preserving missing direct measurements', () => {
  const a = data.articles.find(a => a.id === 'MX04');
  assert.match(a.sections[0].paragraphs[0], /12 GB.*192-bit.*8 GB.*128-bit/);
  assert.match(a.sections[2].paragraphs[0], /5060 Ti 16 GB.*9060 XT 16 GB/);
  assert.match(a.sections[3].paragraphs[0], /different frame-generation modes/);
  assert.match(a.sections[3].paragraphs[1], /does not list an RTX 3060/);
  assert.match(a.limitations.join(' '), /No direct matched.*current-offer winner/);
  assert.ok(a.tools.some(t => t.href === '/performance/evidence/'));
});

test('used-part evidence cannot become warranty transfer, health or unknown-cable approval', () => {
  const a = data.articles.find(a => a.id === 'MX02');
  assert.match(a.sections[2].paragraphs[1], /not proof of years of remaining life/);
  assert.match(a.sections[3].paragraphs[1], /applicable-law exceptions/);
  assert.match(a.sections[4].paragraphs[1], /do not connect the unknown cable/);
  assert.match(a.limitations[0], /No remote hardware health/);
  assert.ok(a.sourceIds.includes('warrantyMSI') && a.sourceIds.includes('warrantyCorsair') && a.sourceIds.includes('warrantyNvidia'));
});

test('source records are traceable and an invalid or missing source prevents rendering', () => {
  for (const s of Object.values(data.sources)) assert.ok(s.publisher && s.title && s.url.startsWith('https://') && s.scope && s.limitations && s.inspected === '2026-10-16');
  const rows = structuredClone(data.articles); rows[0].sections[0].sourceIds.push('missing');
  assert.equal(data.validate(rows).valid, false);
  const f = fixture(); const old = data.sources.terra.scope;
  try { data.sources.terra.scope = ''; assert.throws(() => extra(f, { authorization: auth() }), /Incomplete source/); }
  finally { data.sources.terra.scope = old; f.cleanup(); }
});

test('no owner record means no public writes or changes to the first-eight release', () => {
  const f = fixture();
  try {
    const index = fs.readFileSync(path.join(f.root, 'data/search-index.json'), 'utf8');
    assert.equal(extra(f).rendered, 0);
    assert.equal(fs.readFileSync(path.join(f.root, 'data/search-index.json'), 'utf8'), index);
    assert.deepEqual(json(f.root, 'data/completion-editorial-release.json'), { state: 'existing_first_eight_release' });
    assert.equal(fs.existsSync(extra.localPage(f.root, data.articles[0].route)), false);
  } finally { f.cleanup(); }
});

test('separate release pin rejects changed text, sources, dates, duplicate IDs and invented human review', () => {
  const valid = auth();
  const mutations = [v => { v.humanReviewClaimed = true; }, v => { v.author = 'Fake reviewer'; }, v => { v.kind = 'completion_editorial_owner_release'; },
    v => { v.recordedAt = '2027-01-01T00:00:00Z'; }, v => { v.releaseDate = '2026-10-15'; }, v => { v.releaseDate = '2027-01-01'; },
    v => { v.articles[0].hash = 'f'.repeat(64); }, v => { v.articles.push(v.articles[0]); }, v => { v.statement = ''; }];
  for (const change of mutations) { const value = structuredClone(valid); change(value); assert.throws(() => extra.validateAuthorization(value, NOW)); }
  const old = data.sources.terraSpine.scope;
  try { data.sources.terraSpine.scope += ' Changed scope.'; assert.throws(() => extra.validateAuthorization(valid, NOW), /changed/); }
  finally { data.sources.terraSpine.scope = old; }
  assert.throws(() => first.validateAuthorization(valid, NOW), /required/);
});

test('authorized integration merges search/metadata and releases exact versions without a deployment or human-review claim', () => {
  const f = fixture();
  try {
    const result = extra(f, { authorization: auth(), now: NOW });
    assert.equal(result.released, 4);
    const release = json(f.root, 'data/completion-editorial-extra-release.json');
    assert.equal(release.confirmedDeployment, false);
    assert.equal(release.humanReviewClaimed, false);
    assert.equal(release.articles.length, 4);
    assert.deepEqual(json(f.root, 'data/completion-editorial-release.json'), { state: 'existing_first_eight_release' });
    assert.ok(json(f.root, 'master-publication-metadata.json')['/blog/existing-guide/']);
    const index = json(f.root, 'data/search-index.json');
    assert.ok(index.some(row => row.id === 'keep'));
    for (const a of data.articles) {
      assert.equal(index.filter(row => row.url === a.route).length, 1);
      const html = fs.readFileSync(extra.localPage(f.root, a.route), 'utf8');
      assert.ok(html.includes('data-completion-editorial-extra="' + a.id + '"'));
      assert.ok(!html.includes('data-program-draft'));
      assert.match(html, /"author":\{"@type":"Organization","name":"PC Part Performance"/);
      assert.match(html, /"datePublished":"2026-10-16"/);
      assert.ok(!html.includes('master-assistance'));
    }
    assert.deepEqual(json(f.root, 'program-draft-routes.json'), ['/blog/premiere-creator-pc-workload-guide/']);
  } finally { f.cleanup(); }
});

test('private preview has no Article publication schema, no public search entry and an explicit noindex', () => {
  const f = fixture();
  try {
    const result = extra(f, { preview: true }); assert.equal(result.released, 0);
    for (const a of data.articles) {
      const html = fs.readFileSync(extra.localPage(f.root, a.route), 'utf8');
      assert.match(html, /data-program-draft/);
      assert.match(html, /name="robots" content="noindex,follow"/);
      assert.ok(!html.includes('datePublished') && !html.includes('Published <time'));
      assert.ok(!json(f.root, 'data/search-index.json').some(row => row.url === a.route));
    }
  } finally { f.cleanup(); }
});

test('unchanged rebuild dates remain stable and a published canonical collision fails before any page is written', () => {
  const f = fixture();
  try {
    extra(f, { authorization: auth(), now: NOW });
    const before = json(f.root, 'master-publication-metadata.json');
    const later = Date.parse('2026-10-18T02:00:00Z');
    const next = extra.authorizationFor({ statement: 'Synthetic rebuild.', recordedAt: '2026-10-18T01:00:00Z', releaseDate: '2026-10-17' }, later);
    extra(f, { authorization: next, now: later });
    assert.deepEqual(json(f.root, 'master-publication-metadata.json'), before);
    const revised = { ...data.articles[0], change: 'material_revision' };
    const dates = extra.datesFor(revised, { previousMetadata: { [revised.route]: { datePublished: '2026-09-24' } }, releaseDate: '2026-10-16' });
    assert.deepEqual(dates, { datePublished: '2026-09-24', dateModified: '2026-10-16' });
  } finally { f.cleanup(); }
  const other = fixture();
  try {
    const a = data.articles[3];
    other.write(a.route.slice(1, -1), '<script type="application/ld+json">{"@type":"Article","datePublished":"2026-09-20"}</script>');
    assert.throws(() => extra(other, { authorization: auth(), now: NOW }), /Published canonical collision/);
    assert.equal(fs.existsSync(extra.localPage(other.root, data.articles[0].route)), false);
  } finally { other.cleanup(); }
});

test('missing tool destination fails preflight; subset release cannot accidentally release the other articles', () => {
  const f = fixture();
  try {
    const item = extra.localPage(f.root, '/performance/evidence/'); fs.unlinkSync(item);
    assert.throws(() => extra(f, { authorization: auth(), now: NOW }), /Missing next-action/);
    assert.equal(fs.existsSync(extra.localPage(f.root, data.articles[0].route)), false);
    const result = extra(f, { authorization: auth({ ids: ['MX02'] }), now: NOW });
    assert.equal(result.released, 1);
    assert.deepEqual(json(f.root, 'data/completion-editorial-extra-release.json').articles.map(a => a.id), ['MX02']);
    assert.equal(fs.existsSync(extra.localPage(f.root, data.articles[0].route)), false);
  } finally { f.cleanup(); }
});

test('extra articles survive upstream metadata reset without changing dates or consulting the first-eight release', () => {
  const f = fixture();
  try {
    extra(f, { authorization: auth(), now: NOW });
    const before = json(f.root, 'master-publication-metadata.json');
    fs.writeFileSync(path.join(f.root, 'master-publication-metadata.json'), JSON.stringify({ '/blog/upstream-only/': { title: 'Keep this upstream record' } }));
    const later = Date.parse('2026-10-18T02:00:00Z');
    const next = extra.authorizationFor({ statement: 'Synthetic next full-chain build.', recordedAt: '2026-10-18T01:00:00Z', releaseDate: '2026-10-17' }, later);
    assert.equal(extra(f, { authorization: next, now: later }).released, 4);
    const after = json(f.root, 'master-publication-metadata.json');
    for (const a of data.articles) assert.deepEqual(after[a.route], before[a.route]);
    assert.equal(after['/blog/upstream-only/'].title, 'Keep this upstream record');
    assert.deepEqual(json(f.root, 'data/completion-editorial-release.json'), { state: 'existing_first_eight_release' });
  } finally { f.cleanup(); }
});

test('extra recovery fails closed for wrong ownership markers, foreign HTML, bad dates or a changed source/text pin', () => {
  for (const problem of ['wrong_marker', 'other_html', 'wrong_hash', 'wrong_id', 'wrong_date', 'missing_record', 'future_recording']) {
    const f = fixture();
    try {
      extra(f, { authorization: auth(), now: NOW });
      fs.writeFileSync(path.join(f.root, 'master-publication-metadata.json'), '{}');
      const a = data.articles[0], file = extra.localPage(f.root, a.route);
      const release = json(f.root, 'data/completion-editorial-extra-release.json');
      const row = release.articles.find(row => row.id === a.id);
      if (problem === 'wrong_marker') fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('data-completion-editorial-extra=', 'data-completion-editorial='));
      if (problem === 'other_html') f.write(a.route.slice(1, -1), '<script type="application/ld+json">{"@type":"Article","datePublished":"2026-10-10"}</script><article>Other published page</article>');
      if (problem === 'wrong_hash') row.contentHash = '0'.repeat(64);
      if (problem === 'wrong_id') row.id = 'MC01';
      if (problem === 'wrong_date') row.datePublished = '2026-10-15';
      if (problem === 'missing_record') release.articles = release.articles.filter(row => row.id !== a.id);
      if (problem === 'future_recording') release.ownerInstructionRecordedAt = '2027-01-01T00:00:00Z';
      fs.writeFileSync(path.join(f.root, 'data/completion-editorial-extra-release.json'), JSON.stringify(release));
      assert.throws(() => extra(f, { authorization: auth(), now: NOW }), /Published canonical collision/, problem);
    } finally { f.cleanup(); }
  }
});

test('prepared documentation preserves all six data-dependent blockers and contains complete full text', () => {
  const f = fixture();
  try {
    const directory = path.join(f.root, 'private-review'); extra.prepare({ directory });
    assert.deepEqual(json(directory, 'GAP-OVERLAY.json').hardBlockedIntentsUnchanged, ['P02', 'P03', 'P04', 'P05', 'P14', 'P39']);
    for (const a of data.articles) {
      const md = fs.readFileSync(path.join(directory, a.id + '.md'), 'utf8');
      for (const s of a.sections) assert.ok(md.includes(s.paragraphs[1]));
      assert.ok(md.includes(data.sources[a.sourceIds[0]].url));
    }
  } finally { f.cleanup(); }
});
