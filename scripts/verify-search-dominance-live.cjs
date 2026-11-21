'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { DOMAIN } = require('./program-routing.cjs');
const { routeFor, library } = require('./search-dominance-publication.cjs');
const { checkArticle, checkDiscovery } = require('./search-dominance-release.test.cjs');
const articles = require('../data/search-dominance-articles.json');
const { records } = require('./guide-expansion.cjs');
const { checkGuide } = require('./guide-expansion.test.cjs');

async function get(route, expectedType) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(DOMAIN + route, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await response.body?.cancel();
      await delay(600 * (attempt + 1));
      continue;
    }
    assert.equal(response.status, 200, route + ' HTTP status');
    assert(response.headers.get('content-type')?.includes(expectedType), route + ' unexpected content type');
    assert(!/\bnoindex\b/i.test(response.headers.get('x-robots-tag') || ''), route + ' header excludes indexing');
    return response.text();
  }
}

async function main(commit, outputPath) {
  assert.match(commit || '', /^[a-f0-9]{40}$/);
  const marker = JSON.parse(await get('/data/release.json', 'json'));
  assert.equal(marker.commit, commit, 'Waiting for the pushed production release');
  assert.equal(marker.staging, false, 'Expected a production deploy');
  const [sitemap, directory, blog, robots, feed, searchIndex] = await Promise.all([
    get('/sitemap.xml', 'xml'), get(library, 'html'), get('/blog/', 'html'), get('/robots.txt', 'text'),
    get('/blog/feed.xml', 'xml'), get('/data/search-index.json', 'json'),
  ]);
  assert(robots.includes('Sitemap: ' + DOMAIN + '/sitemap.xml'));
  assert(directory.includes('<link rel="canonical" href="' + DOMAIN + library + '">'));
  assert(directory.includes('<meta name="robots" content="index,follow'));
  const urls = checkDiscovery(sitemap, directory, blog);
  const builtSitemap = fs.readFileSync(path.join(__dirname, '../dist/sitemap.xml'), 'utf8');
  const builtURLs = [...builtSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.deepEqual([...urls].sort(), builtURLs.sort(), 'Live sitemap differs from the verified release build');
  const searchable = new Set(JSON.parse(searchIndex).map(entry => entry.url));
  const cohort = [...articles, ...records];
  for (const row of cohort) {
    const route = routeFor(row);
    assert(urls.includes(DOMAIN + route) && directory.includes('href="' + route + '"'), route + ' missing from discovery');
    assert(searchable.has(route), route + ' missing from live site search');
    assert(feed.includes('<link>' + DOMAIN + route + '</link>'), route + ' missing from live RSS');
  }
  const errors = [];
  const verified = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (cursor < cohort.length) {
      const row = cohort[cursor++];
      const route = routeFor(row);
      try {
        const check = row.body ? checkGuide : checkArticle;
        check(row, await get(route, 'html'));
        verified.push(route);
      } catch (error) {
        errors.push({ route, error: error.message });
      }
    }
  }));
  const report = { checkedAt: new Date().toISOString(), productionCommit: marker.commit, articlesVerified: verified.length,
    expansionVerified: records.filter(row => verified.includes(routeFor(row))).length,
    sitemapUrls: urls.length, directory: DOMAIN + library, urls: verified.sort(), errors };
  if (outputPath) fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, urls: undefined }));
  assert.equal(errors.length, 0, 'Live article verification failed');
}

main(...process.argv.slice(2)).catch(error => { console.error(error); process.exitCode = 1; });
