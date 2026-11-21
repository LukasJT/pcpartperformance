'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { DOMAIN, policy } = require('./program-routing.cjs');
const { records, approval, validate, validateBody } = require('./guide-expansion.cjs');
const { routeFor, library } = require('./search-dominance-publication.cjs');
const root = path.resolve(__dirname, '../dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function checkGuide(article, html) {
  const url = DOMAIN + routeFor(article);
  assert(html.includes('data-hardware-research="' + article.id + '"'), url);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, url);
  assert(html.includes('<h1>' + escape(article.title) + '</h1>'), url);
  assert(html.includes('<meta name="description" content="' + escape(article.description) + '">'), url);
  assert(html.includes('<p class="master-byline">By <a href="/about/">PC Part Performance</a>'), url);
  assert(html.includes('<link rel="canonical" href="' + url + '">'), url);
  assert(html.includes('<meta name="robots" content="index,follow'), url);
  // Site enhancement passes add heading anchors and canonicalize legacy links.
  const comparable = content => content.replace(/<h2 id="guide-section-\d+">/g, '<h2>').replaceAll('href="/learn/"', 'href="/blog/"');
  assert(comparable(html).includes(comparable(article.body)), 'Reviewed content differs at ' + url);
  for (const citation of article.sources) assert(html.includes('href="' + escape(citation) + '"'), url + ' missing ' + citation);
  const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, text]) => JSON.parse(text));
  const org = { '@type': 'Organization', name: approval.author, url: DOMAIN + '/about/' };
  assert.equal(schema.filter(item => item['@type'] === 'Article').length, 1, url);
  const item = schema.find(record => record['@type'] === 'Article');
  assert.equal(item.url, url);
  assert.equal(item.datePublished, approval.releaseDate);
  assert.deepEqual(item.author, org);
  assert.deepEqual(item.publisher, org);
  assert.deepEqual(item.citation, article.sources);
}

if (require.main === module) {
  test('exact permission, content and article HTML restrictions', () => {
    assert.equal(validate(records, approval).length, 150);
    assert.throws(() => validate([{ ...records[0], body: 'Changed' }, ...records.slice(1)], approval), /content changed/);
    for (const payload of ['<img src="x">', '<a href="javascript:alert(1)">x</a>', '<p onclick="x()">x</p>', '<p onmouseover=x()>x</p>']) {
      assert.throws(() => validateBody('<figure></figure>' + payload));
    }
  });
  if (process.env.PROGRAM_PREVIEW !== '1') {
    test('all approved expansion articles contain the exact reviewed content, sources, and visible and structured byline', () => {
      for (const article of records) checkGuide(article, read(routeFor(article) + 'index.html'));
    });
    test('all expansion articles have one canonical sitemap, feed, search and directory entry', () => {
      const directory = read(library + 'index.html');
      const sitemap = read('sitemap.xml');
      const feed = read('blog/feed.xml');
      const index = JSON.parse(read('data/search-index.json'));
      const manifest = JSON.parse(read('route-policy.json'));
      for (const article of records) {
        const route = routeFor(article);
        assert.equal(directory.split('href="' + route + '"').length, 2, route);
        assert.equal(sitemap.split('<loc>' + DOMAIN + route + '</loc>').length, 2, route);
        assert.equal(feed.split('<link>' + DOMAIN + route + '</link>').length, 2, route);
        assert.equal(index.filter(item => item.url === route).length, 1, route);
        assert.equal(policy(DOMAIN + route, manifest).status, 200);
        assert.equal(policy(DOMAIN + route, manifest).headers['X-Robots-Tag'], undefined);
        assert.equal(policy(DOMAIN + route.slice(0, -1), manifest).headers.Location, DOMAIN + route);
      }
    });
  }
}

module.exports = { checkGuide };
