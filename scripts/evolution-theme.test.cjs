'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const definitions = require('./evolution-themes.cjs');
const site = require('./evolution-site.cjs');
const art = require('./evolution-art.cjs');
const source = fs.readFileSync(path.join(__dirname, 'evolution-theme.js'), 'utf8');

function browser({ stored = {}, dark = false, reduced = false, blocked = false, motionImport = null } = {}) {
  const values = new Map(Object.entries(stored)), windowListeners = {}, documentListeners = {}, calls = [], media = new Map(), extraRoots=[];
  let doc;
  class Element {
    constructor(name, attrs = {}) { this.name = name; this.attrs = { ...attrs }; this.dataset = {}; this.listeners = {}; this.hidden = false; this.checked = false; this.isConnected = true; this.inert = false; this.style = {}; this.children = []; this.textContent = ''; }
    setAttribute(name, value) { this.attrs[name] = value; }
    removeAttribute(name) { delete this.attrs[name]; }
    addEventListener(name, action) { (this.listeners[name] ||= []).push(action); }
    emit(name, event = {}) { for (const action of this.listeners[name] || []) action({ target: this, ...event }); }
    closest(selector) { return this.matches?.has(selector) ? this : null; }
    querySelector(selector) { return this.selectors?.[selector] || null; }
    querySelectorAll() { return []; }
    focus() { doc.activeElement = this; calls.push(['focus', this.name]); }
    click() { this.emit('click'); }
    getBoundingClientRect() { return { left: 10, right: 300, top: 10, bottom: 400 }; }
    getClientRects() { return [{}]; }
  }
  const root = new Element('html'), body = new Element('body'), main = new Element('main'), footer = new Element('footer');
  body.style.overflow = 'auto';
  const theme = new Element('theme'); theme.matches = new Set(['.theme-toggle']); theme.selectors = { '.theme-label': new Element('theme-label') };
  const palette = new Map([...definitions.themes.map(t => t.id), 'system'].map(id => { const e = new Element(id); e.dataset.paletteChoice = id; e.matches = new Set(['[data-palette-choice]']); return [id, e]; }));
  const controls = Object.fromEntries(['contrast', 'reduce', 'ambient'].map(name => [name, new Element(name)]));
  const themeColor = new Element('theme-color'), status = new Element('status'), pause = new Element('pause'); pause.matches = new Set(['[data-motion-pause]']);
  const appearance = new Element('appearance'), appearanceClose = new Element('appearance-close'), appearanceOpen = new Element('appearance-open');
  appearanceOpen.matches = new Set(['[data-appearance-open]']); appearanceClose.matches = new Set(['[data-appearance-close]']); appearance.selectors = { '[data-appearance-close]': appearanceClose };
  appearance.showModal = () => { appearance.open = true; calls.push(['show-modal', main.inert]); };
  appearance.close = () => { appearance.open = false; appearance.emit('close'); };
  const header = new Element('header'), menu = new Element('menu'), menuOpen = new Element('menu-open'), menuClose = new Element('menu-close'), scrim = new Element('scrim'), brand = new Element('brand');
  header.children = [brand, menuOpen, scrim, menu];
  header.selectors = { '[data-menu-toggle]': menuOpen, '#site-menu': menu, '[data-menu-dismiss]': scrim, '[data-menu-close]': menuClose };
  header.querySelector = selector => header.selectors[selector] || null;
  header.selectors['[data-menu-close]'] = menuClose;
  const selector = {
    'meta[name="theme-color"]': themeColor, '#lab-appearance': appearance,
    '[data-theme-status]': status, '[data-menu-toggle]': menuOpen, '[data-ui-header]': header,
    ...Object.fromEntries(Object.entries(controls).map(([key, node]) => ['[data-lab-' + key + ']', node]))
  };
  doc = { documentElement: root, body, readyState: 'loading', activeElement: null,
    addEventListener(name, action) { (documentListeners[name] ||= []).push(action); },
    querySelector(name) { if (name === '[data-menu-open]') return Object.hasOwn(header.dataset, 'menuOpen') ? header : null; return selector[name] || null; },
    querySelectorAll(name) { return name === '.theme-toggle' ? [theme] : name === '[data-palette-choice]' ? [...palette.values()] : name === '[data-motion-pause]' ? [pause] : name === '[data-appearance-open]' ? [appearanceOpen] : name === 'main,.site-footer' ? [main, footer] : name === 'main,.site-footer,.pcp-ad-consent' ? [main,footer,...extraRoots] : []; }
  };
  function matchMedia(query) {
    if (!media.has(query)) media.set(query, { matches: query.includes('color-scheme') ? dark : query.includes('reduced-motion') ? reduced : true, listeners: [], addEventListener(name, action) { this.listeners.push(action); }, emit(value) { this.matches = value; this.listeners.forEach(action => action({ matches: value })); } });
    return media.get(query);
  }
  const win = { document: doc, matchMedia, CustomEvent: class { constructor(type, properties) { this.type = type; this.detail = properties?.detail; } },
    dispatchEvent(event) { calls.push(['event', event.type, event.detail]); for (const action of windowListeners[event.type] || []) action(event); }, addEventListener(name, action) { (windowListeners[name] ||= []).push(action); },
    removeEventListener(name, action) { windowListeners[name] = (windowListeners[name] || []).filter(item => item !== action); },
    localStorage: { getItem(key) { if (blocked) throw Error('Storage blocked'); return values.get(key) ?? null; }, setItem(key, value) { if (blocked) throw Error('Storage blocked'); values.set(key, value); } },
    fixtureMotionImport() { calls.push(['motion-import']); return motionImport ? motionImport(calls.filter(call => call[0] === 'motion-import').length) : Promise.resolve({}); },
    fetch() { throw Error('Appearance must not make a network request'); }
  };
  const runtime = source.replace("import('/evolution-motion.js')", 'fixtureMotionImport()');
  win.window = win; vm.createContext(win); vm.runInContext(runtime, win);
  const ready = () => { doc.readyState = 'complete'; for (const action of documentListeners.DOMContentLoaded || []) action(); };
  const click = target => { for (const action of documentListeners.click || []) action({ target }); };
  const storage = (key, newValue) => { for (const action of windowListeners.storage || []) action({ key, newValue }); };
  const fireWindow = name => { for (const action of [...(windowListeners[name] || [])]) action({ type: name }); };
  return { win, doc, root, main, footer, header, menuOpen, menuClose, appearance, appearanceOpen, appearanceClose, theme, themeColor, palette, controls, status, pause, values, media, calls, ready, click, storage, fireWindow,extraRoots };
}

test('saved palettes apply before DOMContentLoaded and preserve light/dark compatibility', () => {
  for (const t of definitions.themes) {
    const h = browser({ stored: { 'pcp-theme-palette': t.id }, dark: t.mode === 'light' });
    assert.equal(h.root.dataset.palette, t.id); assert.equal(h.root.dataset.theme, t.mode);
    assert.equal(h.themeColor.attrs.content, t.colors.bg);
    assert.equal(h.doc.readyState, 'loading');
  }
});
test('first visit follows the device preference while legacy preferences migrate without a fabricated palette', () => {
  assert.equal(browser({ dark: true }).root.dataset.palette, 'midnight');
  assert.equal(browser({ dark: false }).root.dataset.palette, 'arctic');
  assert.equal(browser({ dark: false, stored: { 'pcp-theme': 'dark' } }).root.dataset.palette, 'midnight');
  assert.equal(browser({ dark: true, stored: { 'pcp-theme': 'light' } }).root.dataset.palette, 'arctic');
});
test('invalid stored values fall back to the system and cannot become markup or arbitrary attributes', () => {
  for (const value of ['<script>alert(1)</script>', 'future-palette', 'false', '0']) {
    const h = browser({ dark: true, stored: { 'pcp-theme-palette': value, 'pcp-theme': 'light' } });
    assert.equal(h.root.dataset.palette, 'midnight'); assert.equal(h.root.dataset.theme, 'dark');
    assert(!JSON.stringify(h.root.dataset).includes(value));
  }
});
test('blocked localStorage does not prevent a manual theme change or misreport persistence', () => {
  const h = browser({ blocked: true }); h.ready(); h.click(h.palette.get('solar'));
  assert.equal(h.root.dataset.palette, 'solar'); assert.equal(h.root.dataset.theme, 'dark');
  assert.match(h.status.textContent, /storage is unavailable/); assert.equal(h.values.size, 0);
});
test('manual choices survive a reload and update the legacy mode value and selected state', () => {
  const h = browser(); h.ready(); h.click(h.palette.get('paper'));
  assert.equal(h.values.get('pcp-theme-palette'), 'paper'); assert.equal(h.values.get('pcp-theme'), 'light');
  assert.equal(h.palette.get('paper').attrs['aria-pressed'], 'true'); assert.equal(h.palette.get('midnight').attrs['aria-pressed'], 'false');
  const restored = browser({ dark: true, stored: Object.fromEntries(h.values) }); assert.equal(restored.root.dataset.palette, 'paper');
});
test('system changes affect only the system choice; a manually selected palette remains stable', () => {
  const h = browser(); h.ready(); h.media.get('(prefers-color-scheme: dark)').emit(true); assert.equal(h.root.dataset.palette, 'midnight');
  h.click(h.palette.get('aurora')); h.media.get('(prefers-color-scheme: dark)').emit(false); assert.equal(h.root.dataset.palette, 'aurora');
  h.click(h.palette.get('system')); assert.equal(h.root.dataset.palette, 'arctic'); h.media.get('(prefers-color-scheme: dark)').emit(true); assert.equal(h.root.dataset.palette, 'midnight');
});
test('system reduced motion takes precedence over the manual checkbox and updates dynamically', () => {
  const h = browser({ reduced: true }); h.ready(); h.controls.reduce.checked = false; h.controls.reduce.emit('change'); assert.equal(h.root.dataset.motion, 'reduced');
  h.media.get('(prefers-reduced-motion: reduce)').emit(false); assert.equal(h.root.dataset.motion, 'standard');
  h.controls.reduce.checked = true; h.controls.reduce.emit('change'); assert.equal(h.root.dataset.motion, 'reduced'); assert.equal(h.values.get('pcp-reduce-motion'), 'true');
});
test('high contrast and ambient preferences persist without changing any hardware state', () => {
  const h = browser({ stored: { 'pcp-high-contrast': 'true', 'pcp-ambient': 'false', 'pcp-build-revisions-v1': 'private-build-state' } }); h.ready();
  assert.equal(h.root.dataset.contrast, 'high'); assert.equal(h.root.dataset.ambient, 'off'); assert.equal(h.pause.attrs['aria-pressed'], 'true');
  h.click(h.pause); assert.equal(h.values.get('pcp-ambient'), 'true'); assert.equal(h.root.dataset.ambient, 'on');
  h.controls.contrast.checked = false; h.controls.contrast.emit('change'); assert.equal(h.root.dataset.contrast, 'standard');
  assert.equal(h.values.get('pcp-build-revisions-v1'), 'private-build-state');
});
test('cross-tab palette updates remain constrained and do not fabricate account or traffic data', () => {
  const h = browser(); h.ready(); h.storage('pcp-theme-palette', 'neon'); assert.equal(h.root.dataset.palette, 'neon');
  h.storage('pcp-theme-palette', 'unknown'); assert.equal(h.root.dataset.palette, 'arctic');
  h.storage('pcp-theme-palette', null); assert.equal(h.root.dataset.palette, 'arctic');
  for (const event of h.calls.filter(call => call[0] === 'event')) {
    assert.equal(event[1], 'pcp:appearance'); assert.deepEqual(Object.keys(event[2]).sort(), ['ambient', 'mode', 'palette', 'reduced']);
  }
});
test('the old quick theme listener is guarded so one click changes appearance once', () => {
  const h = browser({ dark: true }); h.ready();
  const legacy = fs.readFileSync(path.join(__dirname, '../dist/site-ui.js'), 'utf8').split('/* Text arrows')[0];
  vm.runInContext(legacy, h.win); assert.equal((h.theme.listeners.click || []).length, 0);
  h.click(h.theme); assert.equal(h.root.dataset.palette, 'arctic'); assert.equal(h.values.get('pcp-theme'), 'light');
});
test('opening appearance from the real mobile menu restores inert roots before showing the native dialog', () => {
  const h = browser(); h.ready();
  const navigation = fs.readFileSync(path.join(__dirname, 'continuation-ui.js'), 'utf8').split('})();')[0] + '})();';
  vm.runInContext(navigation, h.win); h.menuOpen.click(); assert.equal(h.main.inert, true); assert.equal(h.footer.inert, true);
  h.click(h.appearanceOpen); assert.equal(h.main.inert, false); assert.equal(h.footer.inert, false); assert.equal(h.appearance.open, true);
  assert.deepEqual(h.calls.find(call => call[0] === 'show-modal'), ['show-modal', false]);
  h.click(h.appearanceClose); assert.equal(h.doc.activeElement, h.menuOpen); assert.equal(h.doc.body.style.overflow, 'auto');
});

test('a consent banner added after navigation startup is inert only while the mobile menu is open',()=>{
 const h=browser();h.ready();const navigation=fs.readFileSync(path.join(__dirname,'continuation-ui.js'),'utf8').split('})();')[0]+'})();';vm.runInContext(navigation,h.win);
 const banner={inert:false};h.extraRoots.push(banner);h.menuOpen.click();assert.equal(banner.inert,true);assert.equal(h.main.inert,true);h.menuClose.click();assert.equal(banner.inert,false);assert.equal(h.main.inert,false);
 banner.inert=true;h.menuOpen.click();h.menuClose.click();assert.equal(banner.inert,true,'An existing inert state must be preserved');
});
test('optional motion code stays unloaded until interaction and simultaneous gestures do not duplicate the import', async () => {
  assert(source.includes("import('/evolution-motion.js')"));
  const h = browser(); assert.equal(h.calls.filter(call => call[0] === 'motion-import').length, 0); h.ready();
  assert.equal(h.calls.filter(call => call[0] === 'motion-import').length, 0);
  h.fireWindow('pointerdown'); h.fireWindow('keydown'); h.fireWindow('scroll'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.calls.filter(call => call[0] === 'motion-import').length, 1); h.fireWindow('scroll'); assert.equal(h.calls.filter(call => call[0] === 'motion-import').length, 1);
});
test('an optional motion download failure permits another gesture attempt without breaking appearance', async () => {
  const h = browser({ motionImport: count => count === 1 ? Promise.reject(Error('Optional motion unavailable')) : Promise.resolve({}) }); h.ready();
  h.fireWindow('pointerdown'); await new Promise(resolve => setImmediate(resolve)); h.click(h.palette.get('paper')); assert.equal(h.root.dataset.palette, 'paper');
  h.fireWindow('keydown'); await new Promise(resolve => setImmediate(resolve)); h.fireWindow('scroll');
  assert.equal(h.calls.filter(call => call[0] === 'motion-import').length, 2); assert.equal(h.root.dataset.palette, 'paper');
});

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
test('all six palettes meet normal-text contrast on their actual base, card and raised surfaces', () => {
  for (const t of definitions.themes) for (const background of ['bg', 'surface', 'raised']) for (const foreground of ['ink', 'muted', 'accent']) {
    const ratio = contrast(t.colors[foreground], t.colors[background]); assert(ratio >= 4.5, `${t.id} ${foreground}/${background}: ${ratio.toFixed(2)}`);
  }
});
test('primary buttons, palette checkmarks and focus rings have adequate contrast in every palette', () => {
  for (const t of definitions.themes) {
    assert(contrast(t.colors.buttonInk, t.colors.button) >= 4.5, t.id + ' button text');
    for (const background of ['bg', 'surface', 'raised']) assert(contrast(t.colors.accent, t.colors[background]) >= 3, t.id + ' focus on ' + background);
  }
});
test('form controls have a dedicated boundary token meeting non-text contrast on every declared surface', () => {
  const css = fs.readFileSync(path.join(__dirname, 'evolution-system.css'), 'utf8');
  assert(css.includes('--lab-control-line:var(--muted)')); assert(css.includes('border-color:var(--lab-control-line)'));
  for (const t of definitions.themes) for (const background of ['bg', 'surface', 'raised']) assert(contrast(t.colors.muted, t.colors[background]) >= 3, t.id + ' boundary/' + background);
});
test('the palette picker has six named choices plus system, correctly escaped text and no network script', () => {
  const html = definitions.picker(); assert.equal((html.match(/data-palette-choice=/g) || []).length, 7);
  assert(html.includes('Paper &amp; Precision')); assert(html.includes('aria-labelledby="lab-appearance-title"')); assert(!html.includes('<script')); assert(!html.includes('https://'));
  for (const t of definitions.themes) assert(definitions.css().includes(`:root[data-palette="${t.id}"]`));
});
test('hardware artwork is local original SVG with no executable or external payload and escapes attributes', () => {
  for (const kind of art.kinds) {
    const svg = art.hardware(kind); assert(svg.startsWith('<svg')); assert(svg.includes('role="img"'));
    assert(!/<script|<foreignObject|\son\w+\s*=|(?:href|src)=["']https?:|url\(["']?https?:/i.test(svg));
    assert(art.hardware(kind, { decorative: true }).includes('aria-hidden="true"'));
  }
  assert(!art.hardware('cpu', { className: 'x" onload="alert(1)' }).includes('class="x" onload='));
  assert.throws(() => art.hardware('not-a-component'));
});
test('non-content routes and legacy redirects keep their content and are never silently rewritten as articles', () => {
  const html = '<main><h1>Tool</h1><article class="article-copy"><h2>Inputs</h2><p>Original inputs and limits.</p></article></main>';
  assert.equal(site.articlePolish(html, '/tools/a-tool/'), html);
  const redirect = '<html><body data-legacy-redirect><a href="/builder/">Continue</a></body></html>';
  assert.equal(site.polish(redirect, '/old-route/'), redirect);
});

// Ratios describe opaque declared palette pairs, not rendered accessibility,
// images, composited gradients, disabled states or third-party advertisements.
