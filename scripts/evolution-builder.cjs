'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { replaceElement } = require('./clarity-site.cjs');
const catalogScopeLinks = '<nav class="evolution-catalog-scopes" aria-label="Hardware collections"><a href="/hardware/" data-evolution-catalog-scope="pc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 2h12v20H6zM9 5h6M9 19h6"/><circle cx="12" cy="11" r="4"/><path d="m10 8 4 6m-5-3 6 0"/></svg><span>PC components</span></a><a href="/hardware/?category=devices" data-evolution-catalog-scope="devices"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4M11 19h2"/></svg><span>Phones &amp; consoles</span></a><a href="/hardware/?category=peripherals" data-evolution-catalog-scope="peripherals"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="7" width="20" height="12" rx="2"/><path d="M5 10h2m3 0h2m3 0h2M5 13h2m3 0h2m3 0h2M6 16h12"/></svg><span>Peripherals</span></a></nav>';

/* Progressive presentation only: the established builder remains the source of
 * selections, compatibility, prices, local revisions and model loading. */
function polish(html, route) {
  if (!['/builder/', '/hardware/'].includes(route) && !route.startsWith('/hardware/')) return html;
  if (html.includes('data-evolution-builder-assets')) return html;
  html = html.replace('</head>', route === '/builder/' ? '<link data-evolution-builder-assets rel="stylesheet" href="/evolution-builder.css"><script src="/evolution-builder.js" defer></script></head>' : '<link data-evolution-builder-assets rel="stylesheet" href="/evolution-catalog.css"></head>');
  if (route === '/builder/') {
    html = html.replace('<section id="builder"', '<section data-evolution-builder id="builder"');
    html = replaceElement(html, /<nav\b[^>]*id="builder-workflow"[^>]*>/, 'nav', nav => nav
      .replace('aria-label="Build your PC in three steps"', 'aria-label="Build stages"')
      .replace('<strong>Parts</strong>', '<strong>Choose parts</strong>')
      .replace('<strong>3D preview</strong>', '<strong>Explore build</strong>')
      .replace('<strong>Review</strong>', '<strong>Review &amp; save</strong>'));
    html = html.replace('See missing items, documented conflicts and the checks to finish before buying.', 'Your parts, costs and checks before buying.');
    html = html.replace('Rotate your build. Select a part to inspect it.', 'Rotate, zoom and select a part.');
    html = html.replace('Other purchases: OS, adapters and accessories', 'Other purchases');
  }
  if (route.startsWith('/hardware/')) html = html.replace('<div class="catalog-tools">', catalogScopeLinks + '<div class="catalog-tools">');
  return html;
}

function prepare({ root }) {
  for (const file of ['evolution-builder.css', 'evolution-catalog.css']) fs.copyFileSync(path.join(__dirname, file), path.join(root, file));
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'prepared-evolution/builder-manifest.json'), 'utf8'));
  for (const name of ['evolution-builder.js', 'builder-workspace.js', 'oct16-builder-journey.js']) {
    const source = fs.readFileSync(path.join(__dirname, name), 'utf8'), output = fs.readFileSync(path.join(__dirname, 'prepared-evolution', name), 'utf8');
    fs.writeFileSync(path.join(root, name), validateRuntime(name, source, output, manifest.files[name]));
  }
  return { assets: ['/evolution-builder.css', '/evolution-catalog.css', '/evolution-builder.js', '/builder-workspace.js', '/oct16-builder-journey.js'] };
}
function validateRuntime(name, source, output, entry) {
  const hash = value => crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
  if (!entry || entry.sourceHash !== hash(source) || entry.outputHash !== hash(output)) throw Error('Stale prepared builder runtime: ' + name + '. Run node scripts/prepare-evolution-builder-runtime.cjs.');
  return output;
}
module.exports = { polish, prepare, catalogScopeLinks, validateRuntime };
