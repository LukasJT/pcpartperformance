'use strict';
const fs = require('node:fs');
const path = require('node:path');

module.exports = function prepare({ root }) {
  const file = path.join(root, 'upgrade', 'index.html');
  if (!fs.existsSync(file)) return { decorated: false, assets: [] };
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-upgrade-parse') || !html.includes('data-upgrade-matches')) throw Error('Parts import could not find the retained upgrade form.');
  const assets = ['completion-parts-import.js', 'completion-parts-import.css'];
  for (const asset of assets) fs.copyFileSync(path.join(__dirname, asset), path.join(root, asset));
  if (!html.includes('src="/completion-parts-import.js"')) {
    const anchor = /<script\b[^>]*\bsrc="\/upgrade-program\.js(?:\?[^"<>]*)?"[^>]*><\/script>/;
    if (!anchor.test(html)) throw Error('Parts import needs the existing upgrade-program.js script.');
    html = html.replace(anchor, '<script src="/completion-parts-import.js" defer></script>$&');
  }
  if (!html.includes('href="/completion-parts-import.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/completion-parts-import.css"></head>');
  html = html.replace('>Find model matches</button>', '>Review pasted parts</button>');
  fs.writeFileSync(file, html);
  return { decorated: true, assets, behavior: 'Staged exact-model review; no pasted URL requests or automatic inventory detection.' };
};
