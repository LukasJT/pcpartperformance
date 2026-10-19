'use strict';
const fs = require('node:fs');
const path = require('node:path');
function polishHTML(html, route) {
  if (route !== '/builder/' || !html.includes('id="pc-visual"')) return html;
  html = html.replace(/src="\/assembly-3d\.js(?:\?[^"<>]*)?"/g, 'src="/assembly-3d.js?v=20261019a"');
  if (!html.includes('href="/evolution-scene.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/evolution-scene.css"></head>');
  // The control adapter, Three and GLBs are all imported only after the
  // visitor's explicit preview action. Remove an earlier eager adapter tag.
  html = html.replace(/<script\b[^>]*\bsrc="\/evolution-scene\.js(?:\?[^"<>]*)?"[^>]*><\/script>/g, '');
  return html;
}
function prepare({ root }) {
  for (const file of ['evolution-scene.js', 'evolution-scene.css', 'evolution-scene-motion.js']) fs.copyFileSync(path.join(__dirname, file), path.join(root, file));
  const file = path.join(root, 'builder/index.html');
  if (fs.existsSync(file)) { const html = fs.readFileSync(file, 'utf8'); fs.writeFileSync(file, polishHTML(html, '/builder/')); }
  return { routes: ['/builder/'], eager3DEngine: false, assets: ['evolution-scene.js', 'evolution-scene.css', 'evolution-scene-motion.js'] };
}
module.exports = { prepare, polishHTML };
