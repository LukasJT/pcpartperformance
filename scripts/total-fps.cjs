'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { replaceElement } = require('./clarity-site.cjs');

const platforms = [
  ['pc', 'PC', 'M5 4h14v16H5zM8 8h8M8 12h8M11 17h2'],
  ['ps5', 'PS5', 'M8 3 6 21l5-2h2l5 2-2-18-3 3h-2zM11 7v12M13 7v12'],
  ['ps5pro', 'PS5 Pro', 'M8 3 6 21l5-2h2l5 2-2-18-3 3h-2zM11 7v12M13 7v12M7 13h3M7 15h3M7 17h3'],
  ['series-x', 'Series X', 'm6 5 9-2 4 3v15l-10 2-3-3zm0 0 3 3 10-2M9 8v15M15 10h1'],
  ['series-s', 'Series S', 'M7 3h10v18H7zM15 18h.01'],
  ['switch2', 'Switch 2', 'M5 6h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3ZM7 7v10M17 7v10M4 10h1M19 13h1'],
  ['switch', 'Switch', 'M5 6h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3ZM7 7v10M17 7v10M4 10h1M19 13h1'],
  ['other', 'All consoles', 'M7 7h10a4 4 0 0 1 4 4l1 6-3 2-3-3H8l-3 3-3-2 1-6a4 4 0 0 1 4-4ZM7 10v4M5 12h4M16 11h.01M19 13h.01']
];
function platformPicker() {
  return '<section class="total-platforms" aria-labelledby="total-platform-title"><h2 id="total-platform-title">Choose a platform</h2><div role="group" aria-label="Gaming platform">' + platforms.map(([id, label, shape]) => '<button type="button" data-total-platform="' + id + '" aria-pressed="' + (id === 'pc') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + shape + '"/></svg><span>' + label + '</span></button>').join('') + '</div></section>';
}
function pcForm() {
  return '<form class="fps-controls total-fps-controls" id="fps-controls" aria-labelledby="pc-fps-title"><fieldset class="total-game-selection"><legend id="pc-fps-title">Choose a game</legend><label for="fps-game">Game</label><select id="fps-game" aria-label="Game"></select><a href="#game-library-title" class="total-game-browse">Browse game artwork</a></fieldset><fieldset class="total-hardware-selection"><legend>Your PC</legend><label for="fps-gpu">Graphics card<select id="fps-gpu" aria-label="Graphics card"></select></label><label for="fps-cpu">Processor<select id="fps-cpu" aria-label="Processor"></select></label></fieldset><fieldset class="total-settings-selection"><legend>Graphics settings</legend><div class="fps-control-grid"><label for="fps-resolution">Resolution<select id="fps-resolution" aria-label="Resolution"><option value="1080">1920 × 1080</option><option value="1440" selected>2560 × 1440</option><option value="2160">3840 × 2160</option></select></label><label for="fps-quality">Quality<select id="fps-quality" aria-label="Graphics quality"><option value="medium">Medium</option><option value="high" selected>High</option><option value="ultra">Ultra</option></select></label><label for="fps-upscale">Upscaling<select id="fps-upscale" aria-label="Upscaling"><option value="native" selected>Native</option><option value="quality">Quality</option><option value="balanced">Balanced</option></select></label></div></fieldset></form>';
}
function polish(html, route) {
  if (route !== '/performance/' || html.includes('data-total-fps')) return html;
  html = html.replace(/<body(?=\s|>)/, '<body data-total-fps');
  html = html.replace('<link rel="stylesheet" href="/performance.css">', '');
  html = html.replace(/(<script\b[^>]*src="\/performance\.js(?:\?[^\"]*)?"[^>]*><\/script>)/, '<script src="/total-game-expansion.js" defer></script>$1');
  html = html.replace('</head>', '<link rel="stylesheet" href="/total-fps.css"></head>');
  html = replaceElement(html, /<section\b[^>]*class="fps-hero"[^>]*>/, 'section', () => '<header class="total-fps-heading"><h1>Game performance</h1><p>Find your game. Check the available evidence.</p><nav class="total-fps-research" aria-label="Gaming research"><a href="/performance/games/">Game library</a><a href="/performance/consoles/">Console hardware</a><a href="/performance/retro/">Retro timeline</a></nav></header>' + platformPicker() + '<div class="total-fps-legacy-tabs" hidden><button type="button" role="tab" aria-selected="true" data-fps-view="pc">PC performance</button><button type="button" role="tab" aria-selected="false" data-fps-view="console">Console library</button></div>');
  html = replaceElement(html, /<form\b[^>]*id="fps-controls"[^>]*>/, 'form', pcForm);
  html = replaceElement(html, /<aside\b[^>]*class="growth-evidence-strip"[^>]*>/, 'aside', () => '');
  html = replaceElement(html, /<div\b[^>]*class="clarity-performance-links"[^>]*>/, 'div', () => '');
  html = replaceElement(html, /<div\b[^>]*class="fps-explainer"[^>]*>/, 'div', () => '<details class="total-fps-method"><summary>How to read these results</summary><p>Game listings and system requirements do not establish an FPS result. PC measurements require matching hardware, settings and test conditions. Console targets and measured results remain separately labeled.</p><p><a href="/performance/evidence/">Benchmark methodology</a> · <a href="/performance/coverage/">Current evidence coverage</a></p></details>');
  html = html.replace('<h2 id="console-fps-title">Console games</h2><p>Choose a console to see supported graphics modes.</p>', '<h2 id="console-fps-title">Find a console game</h2><p class="total-console-catalog-links"><a href="/performance/games/playstation-5/">PS5 library</a><a href="/performance/games/nintendo-switch/">Switch library</a><a href="/performance/games/nintendo-switch-2/">Switch 2 library</a></p>');
  html = html.replace('<div id="console-results" class="console-results"></div>', '<div id="console-results" class="console-results"></div><button type="button" class="button secondary total-console-more" id="console-show-more" hidden>Show more games</button>');
  return html;
}
function prepare({ root }) {
  fs.copyFileSync(path.join(__dirname, 'total-fps.css'), path.join(root, 'total-fps.css'));
  return { assets: ['/total-fps.css'], platforms: platforms.length, ...require('./total-fps-games.cjs').prepare({ root }), ...require('./total-fps-platforms.cjs').prepare({ root }) };
}
module.exports = { prepare, polish, platformPicker, pcForm, platforms };
