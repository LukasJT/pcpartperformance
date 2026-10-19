'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const publisher = require('./evolution-publisher.cjs');

let passed = 0;
function test(name, run) { run(); passed++; console.log('PASS ' + name); }
const schema = type => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': type, headline: 'A real article' })}</script>`;
const page = (body = '<article class="master-article"><p>First paragraph.</p></article>', head = schema('Article')) => `<!doctype html><html><head>${head}</head><body data-page="guide"><header>Navigation</header><main>${body}</main><footer>Site footer</footer></body></html>`;
const route = '/blog/a-real-guide/';

test('only a real, public editorial route qualifies', () => {
  assert.equal(publisher.editorialState(page(), route), 'editorial');
  for (const url of ['/', '/blog/', '/news/', '/builder/', '/resources/about/', '/learn/rtx5070.html', '/phones/pixel-9/']) assert.notEqual(publisher.editorialState(page(), url), 'editorial');
  assert.equal(publisher.editorialState(page(undefined, schema('Product')), route), 'missing-article-schema');
  assert.equal(publisher.editorialState(page(undefined, '<script type="application/ld+json">invalid</script>'), route), 'missing-article-schema');
});
test('drafts, noindex and redirects never receive an ad-content landmark', () => {
  for (const marker of ['data-program-draft', 'data-stage2-noindex', 'data-legacy-redirect']) {
    const html = page().replace('<body ', '<body ' + marker + ' ');
    assert.equal(publisher.polishHTML(html, route), html);
  }
  assert.equal(publisher.editorialState(page(undefined, '<meta name="robots" content="noindex, follow">' + schema('Article')), route), 'draft-or-excluded');
  assert.equal(publisher.editorialState(page(undefined, "<meta content='NOINDEX, follow' name='ROBOTS'>" + schema('Article')), route), 'draft-or-excluded');
});
test('the content class is attached directly to the article body without wrappers or scripts', () => {
  const html = publisher.polishHTML(page(), route);
  assert(html.includes('<article class="master-article journey-content">'));
  assert.equal((html.match(/journey-content/g) || []).length, 1);
  assert.equal(html.split('<script').length, page().split('<script').length);
  assert(html.includes('<footer>Site footer</footer>'));
  assert.equal(publisher.inspectHTML(html, route).issues.length, 0);
});
test('all retained article templates and single-quoted classes are supported', () => {
  for (const name of ['master-article', 'oct11-article', 'article-copy', 'publication-copy', 'evolution-article']) {
    const html = page(`<article data-author="PC Part Performance" class='${name}'><p>Content</p></article>`);
    assert(publisher.polishHTML(html, route).includes(`class='${name} journey-content'`));
  }
});
test('JSON-LD graphs and article type arrays are recognized', () => {
  const head = `<script type="application/ld+json">${JSON.stringify({ '@graph': [{ '@type': ['WebPage', 'BlogPosting'] }] })}</script>`;
  assert.equal(publisher.editorialState(page(undefined, head), route), 'editorial');
  assert.equal(publisher.editorialState(page(undefined, schema('NewsArticle')), '/news/source-backed-event/'), 'editorial');
});
test('the transformation is idempotent and does not replace an existing chosen landmark', () => {
  const once = publisher.polishHTML(page(), route);
  assert.equal(publisher.polishHTML(once, route), once);
  const existing = page('<article id="journey-content" class="master-article">Content</article>');
  assert.equal(publisher.polishHTML(existing, route), existing);
});
test('ambiguous multiple bodies stay untouched and are reported rather than guessed', () => {
  const html = page('<article class="master-article">A</article><article class="article-copy">B</article>');
  assert.equal(publisher.polishHTML(html, route), html);
  assert.equal(publisher.inspectHTML(html, route).issues.length, 1);
  const duplicate = page('<article class="master-article journey-content">A</article><article class="journey-content">B</article>');
  assert.equal(publisher.inspectHTML(duplicate, route).landmarks, 2);
});
test('homepages, tools and layout wrappers cannot quietly become Journey content targets', () => {
  const tool = page('<div class="journey-content"><form><input></form></div>');
  assert.equal(publisher.inspectHTML(tool, '/builder/').issues.length, 2);
  assert.equal(publisher.polishHTML(page(), '/'), page());
});
test('the default GA4 preparation is disabled with no invented property', () => {
  assert.equal(publisher.DEFAULT_ANALYTICS.measurementId, null);
  const value = publisher.validateAnalyticsConfig();
  assert.equal(value.valid, true);
  assert.equal(value.activationAllowed, false);
  assert.equal(value.requestedEnabled, false);
});
test('GA4 config rejects malformed IDs and missing owner, consent or privacy decisions', () => {
  assert.equal(publisher.validateAnalyticsConfig(null).valid, false);
  assert.equal(publisher.validateAnalyticsConfig({ schema: 1, enabled: true, measurementId: 'https://evil.invalid/tag', consentMode: 'advanced' }).valid, false);
  const requested = publisher.validateAnalyticsConfig({ schema: 1, enabled: true, measurementId: null, consentMode: 'basic' });
  assert.equal(requested.issues.length, 4);
  assert.equal(requested.activationAllowed, false);
  for (const measurementId of [123, {}, '', 'G-<script>', 'UA-123-1']) assert.equal(publisher.validateAnalyticsConfig({ ...publisher.DEFAULT_ANALYTICS, measurementId }).valid, false);
});
test('even a syntactically prepared config cannot activate an absent runtime adapter', () => {
  const value = publisher.validateAnalyticsConfig({ schema: 1, enabled: true, measurementId: 'G-TESTONLY00', consentMode: 'basic', ownerAuthorized: true, consentReviewed: true, privacyReviewed: true });
  assert.equal(value.valid, true);
  assert.equal(value.activationAllowed, false);
  assert.equal(value.state, 'prepared_only_no_runtime_adapter');
});
test('static tag discovery does not claim a connected account or actual network behavior', () => {
  const html = page(undefined, schema('Article') + '<script src="https://www.googletagmanager.com/gtag/js?id=G-TESTONLY00"></script><script src="/ads.js" defer></script>');
  const result = publisher.inspectHTML(html, route);
  assert.equal(result.analyticsScriptCount, 1);
  assert.equal(result.localAdBootstrap, true);
});

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pcp-evolution-publisher-'));
try {
  const put = (file, html) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, html); };
  put('index.html', page()); put('blog/a-real-guide/index.html', page()); put('news/a-new-event/index.html', page(undefined, schema('NewsArticle')));
  put('blog/index.html', page('<article class="publication-card">Index card</article>', ''));
  put('ads/native.html', '<html><body><script src="https://ads.invalid/tag"></script></body></html>');
  put('ads.js', '/* Adsterra pcp-ad-consent navigator.globalPrivacyControl */');
  put('privacy/index.html', page('This operational description is not a substitute for an owner-specific legal privacy policy.', ''));
  test('whole-site polish preserves ad templates and keeps missing audience metrics null', () => {
    const result = publisher.polish({ root });
    assert.equal(result.changed, 2);
    assert.equal(result.articles.checked, 2); assert.equal(result.articles.semanticLandmarks, 2);
    assert.deepEqual(result.articles.issues, []);
    assert.equal(result.eligibility.qualifyingSessions30Days, null);
    assert.equal(result.eligibility.ga4AccountConnected, null);
    assert.equal(result.advertising.existingAdsterra, true);
    assert.equal(result.advertising.existingProviderPreserved, true);
    assert.equal(result.advertising.journeyPages, 0);
    assert.equal(result.analytics.networkBehaviorVerified, false);
    assert.equal(publisher.polish({ root }).changed, 0);
    assert.equal(fs.readFileSync(path.join(root, 'ads/native.html'), 'utf8'), '<html><body><script src="https://ads.invalid/tag"></script></body></html>');
  });
  test('the owner resource is crawlable but noindex and contains no imaginary integration', () => {
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    publisher.prepare({ root, shell: (title, type, body) => `<!doctype html><html><head><title>${esc(title)}</title></head><body data-page="${type}"><main>${body}</main></body></html>`, write: (name, html) => put(name + '/index.html', html), esc });
    const html = fs.readFileSync(path.join(root, 'resources/publisher-readiness/index.html'), 'utf8');
    assert(html.includes('data-stage2-noindex'));
    assert(html.includes('<meta name="robots" content="noindex, follow">'));
    assert(html.includes('1,000')); assert(html.includes('exclusive programmatic inventory'));
    assert(!html.includes('<script')); assert(!html.includes('G-TESTONLY00'));
    assert(!html.includes('class="journey-content"'));
    const report = JSON.parse(fs.readFileSync(path.join(root, 'data/publisher-readiness.json')));
    assert.equal(report.eligibility.providerApproval, null);
    assert.equal(report.analytics.activationAllowed, false);
    assert.equal(report.selectors.sidebar, null);
    assert.equal(report.articles.semanticLandmarks, 2);
  });
} finally {
  // The resolved temporary directory above is created by this process only.
  assert(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(root, { recursive: true, force: true });
}
console.log(`${passed} publisher-readiness checks passed.`);
