'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const site = require('./evolution-site.cjs');
const html = (article, outside = '') => `<!doctype html><html><head><title>Useful guide</title></head><body><main>${outside}${article}</main></body></html>`;
const article = (body, type = 'master-article') => `<article class="${type}">${body}</article>`;
const headings = '<h2 id="guide-section-1">One</h2><p>Original advice.</p><h2>Two</h2><h2>Three</h2>';
const ids = value => [...value.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const anchors = value => [...value.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);

test('article heading IDs remain unique when an existing section uses the generated prefix', () => {
  const out = site.articlePolish(html(article('<h1>Fit checks</h1>' + headings)), '/blog/fit-checks/');
  const names = ids(out); assert.equal(new Set(names).size, names.length);
  assert(names.includes('guide-section-1')); assert(names.includes('guide-section-2')); assert(names.includes('guide-section-3'));
  for (const target of anchors(out)) assert.equal(names.filter(id => id === target).length, 1);
  assert(out.includes('Original advice.'));
});
test('an article with its title outside the body still receives a functional contents list', () => {
  const out = site.articlePolish(html(article(headings, 'article-copy'), '<header><h1>Fit checks</h1></header>'), '/blog/fit-checks/');
  assert(out.includes('class="lab-contents"')); assert.equal((out.match(/<h1\b/g) || []).length, 1);
  assert(out.indexOf('class="lab-contents"') < out.indexOf('<h2'));
  for (const target of anchors(out)) assert(ids(out).includes(target));
});
test('the original publication-copy template receives the same article reading treatment', () => {
  const out = site.articlePolish(html(article(headings, 'publication-copy'), '<h1>Legacy guide</h1>'), '/blog/legacy-guide/');
  assert(out.includes('data-lab-article')); assert(out.includes('class="publication-copy"')); assert(out.includes('data-reading-progress')); assert(out.includes('class="lab-contents"'));
});
test('existing article navigation is retained rather than duplicated', () => {
  const original = '<nav aria-label="Table of contents"><a href="#one">One</a></nav><h2 id="one">One</h2><h2 id="two">Two</h2><h2 id="three">Three</h2>';
  const out = site.articlePolish(html(article(original)), '/blog/guide-with-contents/');
  assert.equal((out.match(/aria-label="Table of contents"/g) || []).length, 1); assert(!out.includes('class="lab-contents"'));
  assert(out.includes('<h2 id="one">One</h2>'));
});
test('the main transformation is idempotent and preserves source links, disclosures and exact product imagery', () => {
  const content = '<h1>Graphics card fit</h1><p>Check the exact manual.</p><img src="/assets/hardware/exact-model.webp" alt="Exact card"><a href="https://example.test/manufacturer-manual">Manufacturer manual</a><p>Illustrative placement does not certify fit.</p>' + headings;
  const initial = html(article(content)), once = site.polish(initial, '/blog/graphics-card-fit/');
  assert.equal(site.polish(once, '/blog/graphics-card-fit/'), once);
  assert(once.includes('src="/assets/hardware/exact-model.webp"')); assert(once.includes('https://example.test/manufacturer-manual')); assert(once.includes('Illustrative placement does not certify fit.'));
  assert.equal((once.match(/data-lab-evolution/g) || []).length, 1);
});
test('draft and non-article routes keep their original content without new editorial claims', () => {
  const initial = html(article(headings));
  for (const route of ['/tools/transfer-time/', '/blog/', '/hardware/', '/review/evolution/a-draft/']) assert.equal(site.articlePolish(initial, route), initial);
  const draft = initial.replace('<body>', '<body data-program-draft>'); assert.equal(site.articlePolish(draft, '/blog/unreviewed/'), draft);
});
test('contents labels retain reader-visible text and working ampersands without copying embedded formatting', () => {
  const initial = html(article('<h1>Power</h1><h2><em>CPU</em> &amp; board</h2><h2>GPU clearance</h2><h2>Sources</h2>'));
  const out = site.articlePolish(initial, '/blog/power-check/');
  const toc = out.match(/<details class="lab-contents">[\s\S]*?<\/details>/)?.[0];
  assert(toc); assert(toc.includes('CPU &amp; board')); assert(!toc.includes('<em>')); assert.equal(anchors(toc).length, 3);
});
