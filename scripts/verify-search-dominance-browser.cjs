'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.EDITORIAL_PLAYWRIGHT || 'playwright');
const { routeFor, library } = require('./search-dominance-publication.cjs');
const articles = require('../data/search-dominance-articles.json');
const { records } = require('./guide-expansion.cjs');

const root = path.resolve(__dirname, '../dist');
const resultDir = path.resolve(process.argv[2] || 'docs/search-dominance-release/qa');
const viewports = [320, 360, 375, 390, 430, 768, 1024, 1440, 1920]
  .map(width => ({ width, scheme: 'light' }))
  .concat([{ width: 390, scheme: 'dark' }, { width: 1440, scheme: 'dark' }, { width: 390, scheme: 'light', zoom: true }]);
const screenshots = new Set(['151', '226', '251', '276', 'directory']);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };

function serve() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      const file = path.resolve(root, '.' + url.pathname, ...(url.pathname.endsWith('/') ? ['index.html'] : []));
      assert(file.startsWith(root + path.sep));
      const bytes = await fs.readFile(file);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function openPage(page, base, route) {
  const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, route);
}

async function verify() {
  await fs.mkdir(resultDir, { recursive: true });
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, chromiumSandbox: true,
      ...(process.env.EDITORIAL_BROWSER ? { executablePath: process.env.EDITORIAL_BROWSER } : {}) });
    let next = 0;
    const completed = [];
    const failures = [];
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (next < viewports.length) {
        const scenario = viewports[next++];
        const { width, scheme, zoom } = scenario;
        const context = await browser.newContext({
          viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce',
        });
        await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
        const page = await context.newPage();
        let cases = 0;
        try {
          for (const item of [{ id: 'directory', title: 'Hardware Research Guides', route: library },
            ...records.map(row => ({ ...row, route: routeFor(row) }))]) {
            const label = item.id + ' · ' + width + ' · ' + scheme + (zoom ? ' · enlarged' : '');
            await openPage(page, base, item.route);
            if (zoom) await page.addStyleTag({ content: 'html { font-size: 200% }' });
            await page.evaluate(() => document.fonts.ready.then(() => true));
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
            if (overflow) failures.push('Horizontal overflow ' + label);
            assert.equal(await page.locator('h1').innerText(), item.title, label);
            if (item.id === 'directory') {
              assert.equal(await page.locator('.research-directory-group a').count(), articles.length + records.length, label);
            } else {
              assert.match(await page.locator('.master-byline').innerText(), /PC Part Performance/, label);
              assert(await page.locator('.hardware-guide-expansion figure, .hardware-guide-expansion table').count() > 0, label);
            }
            if (screenshots.has(item.id) && [390, 1440].includes(width) && !zoom && scheme === 'light') {
              await page.screenshot({ path: path.join(resultDir, item.id + '-' + width + '.png'), fullPage: true });
            }
            cases++;
          }
          completed.push({ ...scenario, cases });
        } finally {
          await context.close();
        }
      }
    }));
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
    await openPage(page, base, '/blog/');
    await page.getByRole('link', { name: 'Browse hardware research guides', exact: true }).click();
    await page.locator('.research-directory-group a').first().click();
    const first = articles[0];
    assert(new URL(page.url()).pathname === routeFor(first));
    await page.locator('a[href="#article-source-1"]').first().click();
    assert.equal(new URL(page.url()).hash, '#article-source-1');
    await page.locator('.master-contents a').first().click();
    assert.equal(new URL(page.url()).hash, '#guide-step-1');
    await page.locator('.research-collection a').click();
    await page.locator('.research-directory-group a[href="' + routeFor(records[0]) + '"]').click();
    assert.equal(new URL(page.url()).pathname, routeFor(records[0]));
    await page.close();
    const cases = completed.reduce((count, scenario) => count + scenario.cases, 0);
    assert.equal(cases, viewports.length * (records.length + 1));
    await fs.writeFile(path.join(resultDir, 'browser.json'), JSON.stringify({ cases, scenarios: completed, failures }, null, 2) + '\n');
    console.log(JSON.stringify({ cases, failures: failures.slice(0, 20), totalFailures: failures.length, navigation: 'passed' }));
    assert.equal(failures.length, 0, failures[0]);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

verify().catch(error => { console.error(error); process.exitCode = 1; });
