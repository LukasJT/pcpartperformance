'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const cleanup = require('./completion-seo.cjs');
const { policy } = require('./program-routing.cjs');
const { createIdentityResolver } = require('./product-identities.cjs');
const DIST = path.join(__dirname, '../dist');
function loadRecords() {
  const c = { window: {}, document: { querySelector() {} } };
  vm.createContext(c);
  for (const name of ['data', 'history-data', 'universe-data', 'component-data', 'core', 'retail-data', 'phone-catalog', 'cooling-data']) vm.runInContext(fs.readFileSync(path.join(DIST, name + '.js'), 'utf8'), c);
  vm.runInContext('globalThis.records=catalog', c);
  return JSON.parse(JSON.stringify(c.records));
}
const records = loadRecords();
const systems = JSON.parse(fs.readFileSync(path.join(DIST, 'data/prebuilts.json'), 'utf8')).systems;
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/master-completion/seo/BASELINE-CLUSTERS.json'), 'utf8'));
const html = (root, route) => fs.readFileSync(cleanup.fileFor(root, route), 'utf8');
const title = value => value.match(/<title>([\s\S]*?)<\/title>/)?.[1];
const meta = (value, name) => [...value.matchAll(/<meta\b[^>]*>/g)].map(m => m[0]).find(t => t.includes('="' + name + '"'))?.match(/content="([^"]*)"/)?.[1];
const canonical = value => value.match(/<link rel="canonical"[^>]*>/)?.[0];
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-completion-seo-'));
  const copy = route => { const target = cleanup.fileFor(root, route); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(cleanup.fileFor(DIST, route), target); };
  const routes = new Set([...audit.duplicateTitles.flatMap(g => g.routes), ...cleanup.productPlans(records).plans.map(p => p.route), ...systems.map(p => '/prebuilts/' + p.id + '/'), ...cleanup.gamePlans(DIST).map(p => p.route), '/prebuilts/us-null-st-king95-2062-w-bu/']);
  for (const route of routes) copy(route);
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.copyFileSync(path.join(DIST, 'data/prebuilts.json'), path.join(root, 'data/prebuilts.json'));
  return { root, routes, remove() {
    const resolved = path.resolve(root), temp = path.resolve(os.tmpdir()) + path.sep;
    assert.ok(resolved.startsWith(temp) && path.basename(resolved).startsWith('pcp-completion-seo-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  } };
}

test('product metadata distinguishes catalog, documented revision, build and phone-history scopes', () => {
  const plans = cleanup.productPlans(records).plans;
  const get = id => plans.find(p => p.id === id);
  assert.equal(get('c-board-msi-mag-b650-tomahawk-wifi').role, 'catalog_listing');
  assert.match(get('c-board-msi-mag-b650-tomahawk-wifi').scope, /revision.*SKU not recorded/);
  assert.equal(get('b650aorus').knownRevision, '1.2');
  assert.match(get('b650aorus').title, /rev\. 1\.2/);
  assert.equal(get('c-board-gigabyte-b650-aorus-elite-ax').knownRevision, null);
  assert.equal(get('retail-msi-mag-b850-tomahawk-max-wifi').role, 'build_listing');
  assert.equal(get('x-phone-iphone-13').role, 'phone_timeline');
  assert.equal(get('iphone-13').role, 'phone_dimensions');
  assert.match(get('iphone-13').description, /146\.7 × 71\.5 mm/);
  assert.equal(get('iphone-13').description.includes('128 GB model'), false);
});

test('the original dormant human-review alias gate and all catalog IDs remain unchanged', () => {
  const source = JSON.stringify(records), decisionsFile = path.join(__dirname, '../docs/program-2026-10-09/product-alias-decisions.json');
  const decisions = fs.readFileSync(decisionsFile, 'utf8');
  const resolver = createIdentityResolver(records);
  assert.equal(resolver.canonicalId('c-board-msi-mag-b650-tomahawk-wifi'), 'c-board-msi-mag-b650-tomahawk-wifi');
  assert.equal(resolver.canonicalId('b650'), 'b650');
  cleanup.productPlans(records);
  assert.equal(JSON.stringify(records), source);
  assert.equal(fs.readFileSync(decisionsFile, 'utf8'), decisions);
});

test('unknown identifiers are not replaced with a guessed SKU/revision or confused card variant', () => {
  const plans = cleanup.productPlans(records).plans;
  assert.ok(!plans.some(p => ['rtx3050', 'rtx30506', 'rtx3060', 'retail-msi-geforce-rtx-3060-ventus-2x-8g-oc'].includes(p.id)));
  const c = records.find(p => p.id === 'c-board-gigabyte-b650-aorus-elite-ax');
  assert.equal(c.revision, undefined);
  assert.equal(c.sku, undefined);
  assert.equal(cleanup.knownRevision({ ...c, source: 'https://www.gigabyte.com/Motherboard/another-rev-12/sp' }), null);
});

test('metadata updates keep canonical/robots and synchronize title, description and social fields', () => {
  const source = '<html><head><title>Old</title><link rel="canonical" href="https://example.com/same/"><meta name="robots" content="noindex,follow"><meta name="description" content="Old"><meta property="og:title" content="Old"><meta name="twitter:title" content="Old"></head><body></body></html>';
  const result = cleanup.metadata(source, { title: 'A & B <specs>', description: 'Actual "scope" & region' });
  assert.equal(canonical(result), canonical(source));
  assert.equal(meta(result, 'robots'), 'noindex,follow');
  assert.equal(title(result), meta(result, 'og:title'));
  assert.equal(title(result), meta(result, 'twitter:title'));
  assert.equal(meta(result, 'description'), meta(result, 'og:description'));
  assert.equal(meta(result, 'description'), meta(result, 'twitter:description'));
  assert.ok(!result.includes('<specs>'));
  assert.equal(cleanup.metadata(result, { title: 'A & B <specs>', description: 'Actual "scope" & region' }), result);
});

test('all eleven reported product title clusters become distinct without redirects or extra H1s', () => {
  assert.equal(audit.duplicateTitles.length, 11);
  const f = fixture();
  try {
    const before = new Map([...f.routes].map(r => [r, html(f.root, r)]));
    const result = cleanup({ root: f.root, records });
    assert.equal(result.blocked.length, 0);
    for (const group of audit.duplicateTitles) {
      const titles = group.routes.map(r => title(html(f.root, r)));
      assert.equal(new Set(titles).size, titles.length, group.text);
      for (const route of group.routes) {
        const value = html(f.root, route);
        assert.equal(canonical(value), canonical(before.get(route)));
        assert.equal(meta(value, 'robots'), meta(before.get(route), 'robots'));
        assert.equal((value.match(/<h1\b/g) || []).length, 1);
        assert.ok(!value.includes('data-legacy-redirect'));
      }
    }
  } finally { f.remove(); }
});

test('visible scope replaces vague catalog subtitle and JSON-LD stays factual without inventing offers', () => {
  const f = fixture();
  try {
    const route = '/learn/c-board-msi-mag-b650-tomahawk-wifi.html';
    const before = html(f.root, route);
    cleanup({ root: f.root, records });
    const after = html(f.root, route);
    assert.equal((after.match(/data-completion-identity-scope=/g) || []).length, 1);
    assert.ok(!after.includes('<h1>MSI MAG B650 TOMAHAWK WIFI</h1><p>Desktop motherboard</p>'));
    const schemas = text => [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const a = schemas(before).find(s => s['@type'] === 'WebPage'), b = schemas(after).find(s => s['@type'] === 'WebPage');
    assert.equal(b.name, 'MSI MAG B650 TOMAHAWK WIFI');
    assert.equal(b.about.name, b.name);
    assert.equal(b.citation, a.citation);
    assert.deepEqual(b.primaryImageOfPage, a.primaryImageOfPage);
    const tables = value => [...value.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)].map(m => m[0]);
    assert.ok(tables(before).length > 0);
    assert.deepEqual(tables(after), tables(before));
    assert.ok(!schemas(after).some(s => s['@type'] === 'Product'));
    assert.equal(b.url, a.url);
    assert.equal(b.sku, undefined);
    assert.equal(b.offers, undefined);
    assert.equal(b.aggregateRating, undefined);
  } finally { f.remove(); }
});

test('game descriptions and visible ranges derive from actual server-rendered cards', () => {
  const pages = cleanup.gamePlans(DIST);
  assert.equal(pages[0].first, 1);
  assert.equal(pages.at(-1).last, pages.reduce((n, p) => n + p.names.length, 0));
  for (const [i, p] of pages.entries()) {
    if (i) assert.equal(p.first, pages[i - 1].last + 1);
    assert.match(p.description, new RegExp('Page ' + p.page + ' of ' + pages.length));
    assert.ok(p.description.includes(p.names[0]) && p.description.includes(p.names.at(-1)));
  }
  assert.equal(new Set(pages.map(p => p.description)).size, pages.length);
});

test('regional descriptions use real country and currency and reject a mismatch', () => {
  const ca = systems.find(p => p.id === 'ca-ibuypower-exwa7n5701'), us = systems.find(p => p.id === 'us-ibuypower-exwa7n5701');
  assert.ok(cleanup.prebuiltDescription(ca).includes('Canada (CAD)'));
  assert.ok(cleanup.prebuiltDescription(us).includes('United States (USD)'));
  assert.notEqual(cleanup.prebuiltDescription(ca), cleanup.prebuiltDescription(us));
  assert.throws(() => cleanup.prebuiltDescription({ ...ca, currency: 'USD' }), /Unresolved/);
  assert.ok(!cleanup.prebuiltDescription(us).includes('in stock'));
});

test('all four reported duplicate-description clusters are resolved in the real decorated fixtures', () => {
  assert.equal(audit.duplicateDescriptions.length, 4);
  const f = fixture();
  try {
    cleanup({ root: f.root, records });
    for (const group of audit.duplicateDescriptions) {
      const pages = group.routes.map(route => html(f.root, route)).filter(page => !page.includes('data-legacy-redirect'));
      const descriptions = pages.map(page => meta(page, 'description'));
      assert.ok(descriptions.every(Boolean));
      assert.equal(new Set(descriptions).size, descriptions.length, group.text);
    }
  } finally { f.remove(); }
});

test('Skytech redirect requires exact retailer identity and matching embedded configuration', () => {
  const legacy = cleanup.embeddedLegacy(html(DIST, '/prebuilts/us-null-st-king95-2062-w-bu/'));
  const current = systems.find(s => s.id === 'us-skytech-gaming-st-king95-2062-w-bu');
  assert.equal(cleanup.verifySkytech(legacy, current).verified, true);
  for (const patch of [{ sku: '6633461' }, { gpu: 'Different GPU' }, { brand: 'Already known' }, { url: 'https://www.bestbuy.com/site/another-listing' }]) assert.equal(cleanup.verifySkytech({ ...legacy, ...patch }, current).verified, false);
  assert.equal(cleanup.verifySkytech(null, current).verified, false);
  assert.equal(cleanup.verifySkytech(legacy, { ...current, region: 'CA' }).verified, false);
});

test('only the bounded legacy slug redirects and HTTP routing preserves query context', () => {
  const f = fixture();
  try {
    const result = cleanup({ root: f.root, records });
    assert.equal(result.redirects.length, 1);
    const r = result.redirects[0];
    assert.equal(r.source, '/prebuilts/us-null-st-king95-2062-w-bu/');
    assert.equal(r.humanApprovalClaimed, false);
    const value = html(f.root, r.source);
    assert.ok(value.includes('data-legacy-redirect'));
    assert.ok(value.includes('data-completion-alias-evidence'));
    const manifest = { routes: { [r.target]: { noindex: false } }, assets: [], products: [], redirects: result.routeRedirects };
    for (const source of Object.keys(result.routeRedirects)) {
      const response = policy('https://www.pcpartperformance.com' + source + '?region=US', manifest);
      assert.equal(response.status, 301);
      assert.equal(response.headers.Location, 'https://www.pcpartperformance.com' + r.target + '?region=US');
    }
    assert.equal(policy('https://www.pcpartperformance.com/prebuilts/unrelated/', manifest).status, 404);
  } finally { f.remove(); }
});

test('bounded ID aliases recover a legacy shortlist without broad matching or destructive migration', () => {
  const from = 'us-null-st-king95-2062-w-bu', to = 'us-skytech-gaming-st-king95-2062-w-bu';
  assert.equal(cleanup.resolvePrebuiltId(from), to);
  assert.equal(cleanup.resolvePrebuiltId('same-name-unreviewed'), 'same-name-unreviewed');
  assert.equal(cleanup.resolvePrebuiltId('__proto__'), '__proto__');
  const old = [from, to, 'unknown-retained'];
  assert.deepEqual(cleanup.resolvePrebuiltIds(old), [to, 'unknown-retained']);
  assert.deepEqual(old, [from, to, 'unknown-retained']);
});

test('a clean build retains the old URL from the persisted source review, with no human approval claim', () => {
  const f = fixture();
  try {
    const route = '/prebuilts/us-null-st-king95-2062-w-bu/';
    fs.unlinkSync(cleanup.fileFor(f.root, route));
    const result = cleanup({ root: f.root, records });
    assert.equal(result.redirects.length, 1);
    assert.ok(html(f.root, route).includes('data-legacy-redirect'));
    const proof = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/master-completion/seo/SKYTECH-SLUG-DECISION.json'), 'utf8'));
    assert.equal(proof.review.humanApprovalClaimed, false);
    assert.equal(proof.review.kind, 'agent_source_review');
    assert.equal(proof.implementation.catalogAliasesChanged, false);
  } finally { f.remove(); }
});

test('reapplying cleanup is idempotent and previously checked redirect evidence survives', () => {
  const f = fixture();
  try {
    cleanup({ root: f.root, records });
    const first = new Map([...f.routes].map(r => [r, html(f.root, r)]));
    const result = cleanup({ root: f.root, records });
    assert.equal(result.redirects.length, 1);
    assert.equal(result.blocked.length, 0);
    for (const [route, source] of first) assert.equal(html(f.root, route), source, route);
  } finally { f.remove(); }
});
