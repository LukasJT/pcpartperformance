'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const playwright = require(process.env.PCP_PLAYWRIGHT_MODULE || 'C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = process.env.PCP_TOTAL_ORIGIN || 'http://127.0.0.1:4200';
const output = path.resolve('docs/total-refinement/qa/fps');
const widths = (process.env.PCP_TOTAL_WIDTHS || '320,360,375,390,430,768,1024,1440,1920').split(',').map(Number);
const expectedReleases=require('../data/total-console-releases.json').records.length;
async function screenshot(page, file) {
  // The preview server injects its own audit button. It is not production UI.
  await page.addStyleTag({ content: '#completion-a11y-run{display:none!important}' });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(75); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150);
  await page.screenshot({ path: file, fullPage: true });
}
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await playwright.chromium.launch({ executablePath: process.env.PCP_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const results = [], failures = [];
  try {
    for (const theme of ['light', 'dark']) for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce', colorScheme: theme, isMobile: width < 768, hasTouch: width < 768 });
      await context.addInitScript(t => { localStorage.setItem('pcp-theme', t); localStorage.setItem('pcp-theme-palette', t === 'dark' ? 'midnight' : 'arctic'); }, theme);
      const page = await context.newPage(), errors = [],requests=[];
      page.setDefaultTimeout(10000);
      page.on('pageerror', e => errors.push(e.message));
      page.on('request',request=>requests.push(request.url()));
      try {
        await page.goto(origin + '/performance/', { waitUntil: 'domcontentloaded' });
        await page.locator('[data-total-platform="pc"]').waitFor();
        await page.locator('#fps-result h2').waitFor();
        assert.equal(await page.locator('#fps-experimental').count(), 0);
        assert.equal(await page.locator('.game-tile').count(), 12);
        assert(!requests.some(url=>url.includes('/data/console-release-evidence.json')),'console metadata must not load for PC-only visitors');
        assert(await page.locator('#fps-result').innerText().then(s => s.includes('No verified benchmark is available for this exact setup.')));
        const geometry = await page.evaluate(() => {
          const controls = [...document.querySelectorAll('.total-fps-controls select,.total-fps-controls .select-trigger')].filter(x => x.getBoundingClientRect().height).map(x => { const r = x.getBoundingClientRect(); return { id: x.id, height: r.height, right: r.right, left: r.left }; });
          const buttons = [...document.querySelectorAll('[data-total-platform]')].map(x => { const r = x.getBoundingClientRect(); return { label: x.textContent.trim(), width: r.width, height: r.height, right: r.right, left: r.left, scrollWidth: x.scrollWidth, clientWidth: x.clientWidth }; });
          return { overflow: document.documentElement.scrollWidth > innerWidth + 1, controls, buttons, setupHeight: document.querySelector('#fps-controls').getBoundingClientRect().height };
        });
        assert(!geometry.overflow, 'page overflow');
        assert(geometry.controls.every(x => x.height >= 44 && x.height <= 58 && x.left >= 0 && x.right <= width + 1), JSON.stringify(geometry.controls));
        assert(geometry.buttons.every(x => x.height >= 44 && x.scrollWidth <= x.clientWidth + 1 && x.left >= 0 && x.right <= width + 1), JSON.stringify(geometry.buttons));
        await screenshot(page, path.join(output, 'pc-' + theme + '-' + width + '.png'));
        await page.locator('#game-search').fill('Portal');
        assert((await page.locator('.game-tile').allTextContents()).every(s => /portal/i.test(s)));
        await page.locator('[data-game-id="steam-400"]').click();assert.equal(await page.locator('#fps-result h2').innerText(),'Portal');assert((await page.locator('#fps-result').innerText()).includes('No verified benchmark'));
        if (!await page.locator('.fps-filter-panel').evaluate(x => x.open)) await page.locator('.fps-filter-panel>summary').click();
        await page.locator('#game-reset').click();
        assert.equal(await page.locator('.game-tile').count(), 12);
        const releaseResponse=page.waitForResponse(response=>response.url().endsWith('/data/console-release-evidence.json'));
        await page.locator('[data-total-platform="ps5pro"]').click();
        const metadata=await (await releaseResponse).json();assert.equal(metadata.records.length,expectedReleases,'built release metadata must match validated source');
        assert(await page.locator('#console-fps-view').isVisible()); assert(!await page.locator('#pc-fps-view').isVisible());
        const filterSpacing=await page.evaluate(()=>{const label=document.querySelector('.console-filter-bottom>label').getBoundingClientRect(),button=document.querySelector('#console-reset').getBoundingClientRect();return{separated:button.left>=label.right+8||button.top>=label.bottom+8,height:button.height};});assert(filterSpacing.separated&&filterSpacing.height>=44,'console filter controls need a visible gap and touch target: '+JSON.stringify(filterSpacing));
        assert((await page.locator('.console-platform strong').allTextContents()).every(s => s === 'PlayStation 5 Pro'));
        await page.locator('#console-search').fill('Fortnite');
        assert((await page.locator('.console-card h3').allTextContents()).every(s => /fortnite/i.test(s)));
        await screenshot(page, path.join(output, 'console-' + theme + '-' + width + '.png'));
        const nativeGame=metadata.records.find(r=>r.platform==='switch2');await page.locator('[data-total-platform="switch2"]').click();await page.locator('#console-search').fill(nativeGame.name);
        await page.locator('.console-card h3').filter({hasText:nativeGame.name}).first().waitFor();assert(await page.locator('.console-card a[href="'+nativeGame.sourceUrl+'"]').first().isVisible());assert((await page.locator('.console-modes').allTextContents()).every(s=>s.includes('No verified FPS')));
        await screenshot(page,path.join(output,'native-switch2-'+theme+'-'+width+'.png'));
        const announcedGame=metadata.records.find(r=>r.evidenceType==='official-platform-release-announcement');await page.locator('[data-total-platform="series-x"]').click();await page.locator('#console-search').fill(announcedGame.name);
        const announcement=page.locator('.console-card').filter({has:page.locator('h3',{hasText:announcedGame.name})}).first();await announcement.waitFor();assert((await announcement.locator('.console-edition').innerText()).includes('Announced release'));await announcement.locator('summary').click();assert(await announcement.locator('a[href="'+announcedGame.metadataSourceUrl+'"]').isVisible());assert((await announcement.locator('.console-modes').innerText()).includes('No verified FPS'));
        await screenshot(page,path.join(output,'xbox-announcement-'+theme+'-'+width+'.png'));
        await page.locator('[data-total-platform="pc"]').click();
        assert(await page.locator('#fps-controls').isVisible()); assert.equal(errors.length, 0, errors.join('\n'));
        results.push({ width, theme, passed: true,consoleReleaseRecords:metadata.records.length,nativeSwitch2Record:nativeGame.id,xboxAnnouncementRecord:announcedGame.id, ...geometry });
      } catch (error) { failures.push({ width, theme, error: error.message, pageErrors: errors }); await page.screenshot({ path: path.join(output, 'failure-' + theme + '-' + width + '.png'), fullPage: true }).catch(() => {}); }
      await context.close();
    }
  } finally { await browser.close(); }
  const report = { checkedAt: new Date().toISOString(), origin, browser: 'Isolated headless Edge Chromium; not iOS Safari', results, failures, renderedStates: results.length * 4 };
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: results.length, failed: failures.length, report: path.join(output, 'report.json') }));
  if (failures.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
