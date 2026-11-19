'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { DOMAIN, policy } = require('./program-routing.cjs');
const { validate, routeFor, library } = require('./search-dominance-publication.cjs');
const articles = require('../data/search-dominance-articles.json');
const approval = require('../data/search-dominance-authorization.json');
const root = path.resolve(__dirname, '../dist');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = route => read(route + 'index.html');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sitemapUrls = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

function checkArticle(row, html) {
  const route = routeFor(row);
  assert(html.includes('data-hardware-research="' + row.id + '"'), route);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, route);
  assert(html.includes('<h1>' + escape(row.title) + '</h1>'), route);
  assert(html.includes('<meta name="description" content="' + escape(row.description) + '">'), route);
  assert(html.includes('<p class="master-byline">By <a href="/about/">PC Part Performance</a>'), route);
  assert(html.includes('<link rel="canonical" href="' + DOMAIN + route + '">'), route);
  assert(html.includes('<meta name="robots" content="index,follow'), route);
  assert(!html.includes('data-program-draft'), route);
  assert(html.includes('<figcaption>' + escape(row.visual.title) + '</figcaption>'), route);
  for (const [heading, ...parts] of row.sections) {
    assert(html.includes('<h2>' + escape(heading) + '</h2>'), route);
    for (const part of parts) {
      const literalParts = part.split(/\[[a-zA-Z0-9]+\]/).map(text => text.trim()).filter(Boolean);
      for (const fragment of literalParts) assert(html.includes(escape(fragment)), 'Approved copy not rendered in ' + route);
    }
  }
  for (const [, url] of Object.values(row.sources)) assert(html.includes('href="' + escape(url) + '"'), route);
  for (const [, url] of row.actions) assert(html.includes('href="' + url + '"'), route + ' missing link ' + url);
  assert.equal([...html.matchAll(/id="article-source-\d+"/g)].length, Object.keys(row.sources).length, route);
  for (const [, target] of html.matchAll(/href="#(article-source-\d+|guide-step-\d+)"/g)) assert(html.includes('id="' + target + '"'), route);
  const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, text]) => JSON.parse(text));
  const article = schema.filter(item => item['@type'] === 'Article');
  assert.equal(article.length, 1, route);
  const expectedOrg = { '@type': 'Organization', name: 'PC Part Performance', url: DOMAIN + '/about/' };
  assert.deepEqual(article[0].author, expectedOrg, route);
  assert.deepEqual(article[0].publisher, expectedOrg, route);
  assert.equal(article[0].headline, row.title, route);
  assert.equal(article[0].url, DOMAIN + route, route);
  assert.equal(article[0].datePublished, approval.releaseDate, route);
  assert.deepEqual(article[0].citation, Object.values(row.sources).map(([, url]) => url), route);
  assert.equal(schema.filter(item => item['@type'] === 'BreadcrumbList').length, 1, route);
  assert(!schema.some(item => item['@type'] === 'NewsArticle' || item['@type'] === 'Product'), route);
}

function checkDiscovery(sitemap, directory, blog) {
  const urls = sitemapUrls(sitemap);
  for (const route of [library, ...articles.map(routeFor)]) {
    assert.equal(urls.filter(url => url === DOMAIN + route).length, 1, route);
  }
  assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URL');
  assert(blog.includes('href="' + library + '"'), 'Blog must link to the research directory');
  for (const row of articles) assert(directory.includes('href="' + routeFor(row) + '"'), 'Orphaned article ' + row.id);
  return urls;
}

if (require.main === module) {
  test('direct approval pins the 150 exact revisions and organization byline', () => {
    assert.equal(validate(articles, approval).length, 150);
    assert.throws(() => validate([{ ...articles[0], answer: 'Modified without approval.' }, ...articles.slice(1)], approval), /content changed/);
    assert.throws(() => validate(articles.slice(1), approval));
    assert.throws(() => validate(articles, { ...approval, author: 'Another author' }));
  });
  if (process.env.PROGRAM_PREVIEW !== '1') {
    test('all 150 generated articles preserve approved copy, evidence, visuals and publisher schema', () => {
      for (const row of articles) checkArticle(row, page(routeFor(row)));
    });
    test('sitemap, directory, site search, feed and Worker expose each canonical article once', () => {
      checkDiscovery(read('sitemap.xml'), page(library), page('/blog/'));
      const feed = read('blog/feed.xml');
      const index = JSON.parse(read('data/search-index.json'));
      const manifest = JSON.parse(read('route-policy.json'));
      for (const row of articles) {
        const route = routeFor(row);
        assert.equal(index.filter(item => item.url === route).length, 1, route);
        assert.equal(feed.split('<link>' + DOMAIN + route + '</link>').length, 2, route);
        assert.deepEqual(manifest.routes[route], { noindex: false, draft: false, canonical: DOMAIN + route });
        assert.equal(policy(DOMAIN + route, manifest).status, 200);
        assert.equal(policy(DOMAIN + route, manifest).headers['X-Robots-Tag'], undefined);
        assert.equal(policy(DOMAIN + route.slice(0, -1), manifest).headers.Location, DOMAIN + route);
      }
    });
  }
}

module.exports = { checkArticle, checkDiscovery };
