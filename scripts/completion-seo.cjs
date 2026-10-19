'use strict';

const fs = require('node:fs');
const path = require('node:path');
const identities = require('./product-identities.cjs');
const prebuiltDecision = require('../docs/master-completion/seo/SKYTECH-SLUG-DECISION.json');
const DOMAIN = 'https://www.pcpartperformance.com';
const PREBUILT_ALIASES = Object.freeze({ 'us-null-st-king95-2062-w-bu': 'us-skytech-gaming-st-king95-2062-w-bu' });
const PREBUILT_ROUTE_REDIRECTS = Object.freeze(Object.fromEntries(Object.entries(PREBUILT_ALIASES).flatMap(([from, to]) =>
  ['', '/', '/index.html'].map(suffix => ['/prebuilts/' + from + suffix, '/prebuilts/' + to + '/']))));
const SKYTECH_SOURCE = 'https://www.bestbuy.com/product/skytech-gaming-king95-gaming-desktop-pc-amd-ryzen-7-9700x-2024-16gb-memory-nvidia-geforce-rtx-5060-ti-16gb-1tb-nvme-storage-white/J3GW8HKX4Z/sku/6633460';
const SKYTECH_FIELDS = ['name', 'region', 'currency', 'merchant', 'model', 'sku', 'skuKind', 'url', 'cpu', 'gpu', 'vram', 'ram', 'storage'];
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = value => String(value).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).trim();
const readJSON = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
const fileFor = (root, route) => path.join(root, route, route.endsWith('/') ? 'index.html' : '');
const fullName = p => p.name.toLowerCase().startsWith(p.brand.toLowerCase() + ' ') ? p.name : p.brand + ' ' + p.name;
const keyFor = p => [p.cat, p.brand, fullName(p)].join('|').toLowerCase().replace(/[™®]/g, '').replace(/\s+/g, ' ').trim();
function resolvePrebuiltId(id) { return typeof id === 'string' && Object.hasOwn(PREBUILT_ALIASES, id) ? PREBUILT_ALIASES[id] : id; }
function resolvePrebuiltIds(ids) { return Array.isArray(ids) ? [...new Set(ids.map(resolvePrebuiltId))] : ids; }

function attributes(tag) {
  const output = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) output[m[1].toLowerCase()] = m[2] ?? m[3];
  return output;
}
function setMeta(html, kind, name, value) {
  let found = false;
  const tag = '<meta ' + kind + '="' + name + '" content="' + esc(value) + '">';
  html = html.replace(/<meta\b[^>]*>/gi, existing => {
    if (attributes(existing)[kind]?.toLowerCase() !== name.toLowerCase()) return existing;
    if (found) return '';
    found = true; return tag;
  });
  return found ? html : html.replace('</head>', tag + '</head>');
}
function metadata(html, { title, description }) {
  if (!/<head\b/i.test(html) || !/<\/head>/i.test(html)) throw Error('Expected a complete HTML document');
  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + esc(title) + '</title>');
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'name', 'twitter:title', title);
  }
  if (description) {
    html = setMeta(html, 'name', 'description', description);
    html = setMeta(html, 'property', 'og:description', description);
    html = setMeta(html, 'name', 'twitter:description', description);
  }
  return html;
}

function knownRevision(p) {
  if (typeof p.revision === 'string' && p.revision.trim()) return p.revision.trim();
  // Exact official page and alias decision inspected; rev-12 is not a general parser rule.
  if (p.id === 'b650aorus' && /^https:\/\/www\.gigabyte\.com\/Motherboard\/B650-AORUS-ELITE-AX-rev-12\/sp(?:#sp)?$/.test(p.source || '')) return '1.2';
  return null;
}
function missingVariant(p, kind) {
  const values = [];
  if (kind === 'phone') {
    if (!p.storageVariant && !p.memoryVariant) values.push('storage variant');
    if (!p.simVariant) values.push('SIM variant');
    if (!p.region) values.push('region');
  } else {
    if (!knownRevision(p)) values.push('board revision');
    if (!p.sku) values.push('regional SKU');
  }
  return values.length ? values.join(', ').replace(/, ([^,]+)$/, ' and $1') + ' not recorded' : '';
}
function productPlans(records) {
  const resolver = identities.createIdentityResolver(records), groups = new Map(), plans = [];
  for (const p of records) {
    const key = keyFor(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue; // Grouping is for presentation candidates, never an alias decision.
    for (const p of group) {
      if (resolver.canonicalId(p.id) !== p.id) continue;
      const name = fullName(p), revision = knownRevision(p), note = p.note || '';
      const related = group.find(other => other.id !== p.id && !/Manufacturer-family record|Family timeline record/.test(other.note || '') && /\/Specification|\/sp(?:#|$)|\/(?:111872|articles\/)/i.test(other.source || ''));
      const missing = missingVariant(p, p.cat === 'phone' ? 'phone' : 'board');
      let role, title, scope, description;
      if (p.cat === 'board' && /Manufacturer-family record/.test(note)) {
        role = 'catalog_listing'; title = name + ': Catalog Listing & Variant Notes';
        scope = 'Catalog entry; ' + (missing ? missing + '.' : 'check the exact supplied model before choosing parts.');
        description = name + ' catalog listing. ' + (p.architecture ? p.architecture + '. ' : '') + (missing ? missing[0].toUpperCase() + missing.slice(1) + '. ' : '') + 'Review the source and exact-model requirements before selecting parts.';
      } else if (p.cat === 'phone' && /Family timeline record/.test(note)) {
        role = 'phone_timeline'; title = name + ': Model History & Variant Notes';
        scope = 'Model timeline entry; ' + (missing ? missing + '.' : 'variant identifiers are recorded below.');
        description = name + ' model-history entry' + (Number.isInteger(p.year) ? ' from ' + p.year : '') + '. ' + (missing ? missing[0].toUpperCase() + missing.slice(1) + '; ' : '') + 'review the source and the supplied phone variant.';
      } else if (p.cat === 'phone' && Number.isFinite(p.specs?.Height) && Number.isFinite(p.specs?.Width)) {
        role = 'phone_dimensions'; title = name + ': Dimensions & Published Specifications';
        scope = 'Published dimensions; confirm the storage, SIM and regional version before buying.';
        description = name + ': ' + p.specs.Height + ' × ' + p.specs.Width + ' mm body dimensions' + (Number.isFinite(p.specs.Thickness) ? ', ' + p.specs.Thickness + ' mm thickness' : '') + '. Compare published size specifications and check regional variant details.';
      } else if (p.cat === 'board' && /^retail-/.test(p.id) && /Exact named variant/.test(note)) {
        role = 'build_listing'; title = name + ': Build Listing & Fit Notes';
        scope = 'Named-model build listing; ' + (missing || 'review the recorded variant') + '. Preview geometry does not certify fit.';
        description = name + ' build listing. ' + (p.summary ? p.summary + '. ' : '') + (missing ? missing[0].toUpperCase() + missing.slice(1) + '. ' : '') + 'Review source specifications and the preview’s fit limitations.';
      } else if (p.cat === 'board' && revision) {
        role = 'documented_revision'; title = name + ' (rev. ' + revision + '): Specs & Support';
        scope = 'Specification source applies to revision ' + revision + '; check the revision printed on your board.';
        description = name + ' revision ' + revision + ': ' + (p.summary ? p.summary + '. ' : '') + 'Read the documented specifications, support links and compatibility questions for this board revision.';
      } else continue;
      plans.push({ id: p.id, route: '/learn/' + p.id + '.html', role, name, title: title + ' | PC Part Performance', description, scope,
        related: related && related.id !== p.id ? { id: related.id, label: p.cat === 'phone' ? 'See published dimensions' : 'See the named-model specification record' } : null,
        source: p.source || null, knownRevision: revision, missingVariantFields: missing });
    }
  }
  return { plans, activeCatalogAliases: [...resolver.aliases], aliasRegistryVersion: identities.decisions.version };
}

function insertScope(html, plan, root) {
  html = html.replace(/<p\b[^>]*data-completion-identity-scope[^>]*>[\s\S]*?<\/p>/gi, '');
  const link = plan.related && fs.existsSync(fileFor(root, '/learn/' + plan.related.id + '.html'))
    ? ' <a href="/learn/' + esc(plan.related.id) + '.html">' + esc(plan.related.label) + '</a>.' : '';
  const scope = '<p class="muted" data-completion-identity-scope="' + esc(plan.role) + '">' + esc(plan.scope) + link + '</p>';
  const pattern = /(<div class="part-title">[\s\S]*?<h1\b[^>]*>[\s\S]*?<\/h1>)(<p\b[^>]*>[\s\S]*?<\/p>)?/;
  if (!pattern.test(html)) throw Error('Product title layout missing ' + plan.id);
  // Replace a vague family summary instead of adding a new label plus another subtitle.
  return html.replace(pattern, (_, prefix, summary = '') => prefix + (['catalog_listing', 'phone_timeline'].includes(plan.role) ? scope : summary + scope));
}
function productSchema(html, plan) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (block, json) => {
    let value;
    try { value = JSON.parse(json); } catch { return block; }
    const visit = item => {
      if (!item || typeof item !== 'object') return;
      if (item['@type'] === 'Product' && (!item.url || item.url === DOMAIN + plan.route)) {
        item.name = plan.name; item.description = plan.description;
      }
      if (Array.isArray(item['@graph'])) item['@graph'].forEach(visit);
    };
    visit(value);
    return '<script type="application/ld+json">' + JSON.stringify(value).replace(/</g, '\\u003c') + '</script>';
  });
}

function gamePlans(root) {
  const dir = path.join(root, 'performance/games');
  if (!fs.existsSync(path.join(dir, 'index.html'))) return [];
  const pages = [{ page: 1, route: '/performance/games/', file: path.join(dir, 'index.html') }];
  const paged = path.join(dir, 'page');
  if (fs.existsSync(paged)) for (const n of fs.readdirSync(paged)) if (/^[2-9]\d*$|^1\d+$/.test(n) && fs.existsSync(path.join(paged, n, 'index.html'))) pages.push({ page: Number(n), route: '/performance/games/page/' + n + '/', file: path.join(paged, n, 'index.html') });
  pages.sort((a, b) => a.page - b.page);
  let offset = 0;
  for (const [i, p] of pages.entries()) {
    if (p.page !== i + 1) throw Error('Game directory pagination has a gap');
    p.html = fs.readFileSync(p.file, 'utf8');
    p.names = [...p.html.matchAll(/<article class="game-discovery-card">[\s\S]*?<h2\b[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<\/article>/g)].map(m => decode(m[1]));
    if (!p.names.length) throw Error('No server-rendered game cards for ' + p.route);
    p.first = offset + 1; offset += p.names.length; p.last = offset;
  }
  for (const p of pages) {
    p.total = offset; p.pageCount = pages.length;
    p.title = 'PC Game Directory — Page ' + p.page + ' of ' + p.pageCount + ' | PC Part Performance';
    p.description = 'Browse games ' + p.first + '–' + p.last + ' of ' + p.total + ', including ' + p.names[0] + ' and ' + p.names.at(-1) + '. Page ' + p.page + ' of ' + p.pageCount + '; open a game to check available performance evidence.';
    p.countText = 'Games ' + p.first + '–' + p.last + ' of ' + p.total + ' · Page ' + p.page + ' of ' + p.pageCount;
  }
  return pages;
}
function prebuiltDescription(p) {
  const region = { CA: { name: 'Canada', currency: 'CAD' }, US: { name: 'United States', currency: 'USD' } }[p.region];
  if (!region || p.currency !== region.currency) throw Error('Unresolved prebuilt region/currency ' + p.id);
  const fields = [p.cpu, p.gpu, p.ram && p.ram + ' RAM', p.storage].filter(v => typeof v === 'string' && v.trim());
  return region.name + ' (' + region.currency + ') buying checklist for ' + p.name + ' ' + (p.sku || p.model) + '. ' + fields.join('; ') + '. Check the exact ' + p.merchant + ' listing and undisclosed components.';
}
function embeddedLegacy(html) {
  const old = html.match(/<script type="application\/json" data-master-system-data>([\s\S]*?)<\/script>/)?.[1];
  if (old) { try { return JSON.parse(old).systems?.find(p => Object.hasOwn(PREBUILT_ALIASES, p.id)) || null; } catch { return null; } }
  const prior = html.match(/<script type="application\/json" data-completion-alias-evidence>([\s\S]*?)<\/script>/)?.[1];
  if (prior) { try { return JSON.parse(prior).legacy || null; } catch { return null; } }
  return null;
}
function verifySkytech(legacy, current) {
  const from = Object.keys(PREBUILT_ALIASES)[0], to = PREBUILT_ALIASES[from];
  const mismatches = [];
  if (!legacy || !current || legacy.id !== from || current.id !== to) return { verified: false, mismatches: ['Missing bounded legacy/current identity'] };
  if (legacy.brand !== null || current.brand !== 'Skytech Gaming') mismatches.push('Missing-brand origin is not established');
  if (legacy.model !== 'ST-KING95-2062-W-BU' || legacy.sku !== '6633460' || legacy.url !== SKYTECH_SOURCE) mismatches.push('Exact retailer identity differs');
  for (const key of SKYTECH_FIELDS) if (legacy[key] !== current[key]) mismatches.push('Configuration mismatch: ' + key);
  return { verified: !mismatches.length, mismatches };
}
function redirectHTML(legacy, current) {
  const evidence = { schema: 1, kind: 'stale_generated_slug', humanApprovalClaimed: false, legacy: Object.fromEntries(['id', 'brand', ...SKYTECH_FIELDS].map(k => [k, legacy[k]])) };
  const target = DOMAIN + '/prebuilts/' + current.id + '/';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prebuilt listing moved | PC Part Performance</title><link rel="canonical" href="' + target + '"><meta http-equiv="refresh" content="0;url=' + target + '"><meta name="robots" content="noindex,follow"></head><body data-legacy-redirect data-completion-prebuilt-alias><main><h1>This prebuilt listing has moved</h1><p><a href="' + target + '">Open ' + esc(current.name + ' ' + current.model) + '</a>.</p></main><script type="application/json" data-completion-alias-evidence>' + JSON.stringify(evidence).replace(/</g, '\\u003c') + '</script></body></html>';
}

/** Run after seo-pass and before routing and HTML audit. Does not alter catalog IDs,
 * saved data, canonical policy or human-review aliases. The one reviewed stale-slug
 * redirect is separate and requires exact embedded retailer/configuration evidence. */
function generate({ root, records }, { reportDirectory = null } = {}) {
  if (!root || !Array.isArray(records)) throw Error('Build root and complete product records required');
  const { plans, activeCatalogAliases, aliasRegistryVersion } = productPlans(records);
  const changes = [], productWrites = [], prebuiltWrites = [], gameWrites = [], redirects = [], blocked = [];
  for (const plan of plans) {
    const file = fileFor(root, plan.route);
    if (!fs.existsSync(file)) continue;
    const original = fs.readFileSync(file, 'utf8');
    if (original.includes('data-legacy-redirect')) continue;
    let html = metadata(original, plan);
    html = productSchema(insertScope(html, plan, root), plan);
    productWrites.push({ file, html });
    changes.push({ route: plan.route, kind: plan.role, title: plan.title, description: plan.description, scope: plan.scope, source: plan.source });
  }
  const prebuilt = readJSON(path.join(root, 'data/prebuilts.json'), { systems: [] }).systems;
  for (const p of prebuilt) {
    const route = '/prebuilts/' + p.id + '/', file = fileFor(root, route);
    if (!fs.existsSync(file)) continue;
    const description = prebuiltDescription(p), html = metadata(fs.readFileSync(file, 'utf8'), { description });
    prebuiltWrites.push({ file, html }); changes.push({ route, kind: 'regional_prebuilt_description', description });
  }
  for (const p of gamePlans(root)) {
    const html = metadata(p.html, p).replace(/(<p\b[^>]*data-game-discovery-count[^>]*>)[\s\S]*?(<\/p>)/, '$1' + esc(p.countText) + '$2');
    gameWrites.push({ file: p.file, html });
    changes.push({ route: p.route, kind: 'game_pagination', title: p.title, description: p.description, first: p.first, last: p.last, total: p.total });
  }
  for (const [from, to] of Object.entries(PREBUILT_ALIASES)) {
    const source = '/prebuilts/' + from + '/', file = fileFor(root, source), current = prebuilt.find(p => p.id === to);
    const legacy = fs.existsSync(file) ? embeddedLegacy(fs.readFileSync(file, 'utf8')) : prebuiltDecision.legacySnapshot;
    const checked = verifySkytech(legacy, current);
    if (!checked.verified || !fs.existsSync(fileFor(root, '/prebuilts/' + to + '/'))) { blocked.push({ source, target: '/prebuilts/' + to + '/', reason: checked.mismatches.join('; ') || 'Missing current target page' }); continue; }
    redirects.push({ file, html: redirectHTML(legacy, current), source, target: '/prebuilts/' + to + '/', status: 301, sourceURL: current.url, review: 'agent_source_review', humanApprovalClaimed: false });
  }
  // All parsing and checks finish before any page write. Root owns production release.
  for (const p of [...productWrites, ...prebuiltWrites, ...gameWrites, ...redirects]) { fs.mkdirSync(path.dirname(p.file), { recursive: true }); fs.writeFileSync(p.file, p.html); }
  const routeRedirects = Object.fromEntries(redirects.flatMap(r => Object.entries(PREBUILT_ROUTE_REDIRECTS).filter(([, to]) => to === r.target)));
  const report = { schema: 1, status: 'static_decorator_prepared', confirmedDeployment: false,
    productPages: productWrites.length, prebuiltPages: prebuiltWrites.length, gamePages: gameWrites.length,
    aliasRegistryVersion, activeCatalogAliases, catalogIDsChanged: false, userDataMigrated: false,
    changes, redirects: redirects.map(r => ({ source: r.source, target: r.target, status: r.status, sourceURL: r.sourceURL, review: r.review, humanApprovalClaimed: r.humanApprovalClaimed })), routeRedirects, blocked };
  if (reportDirectory) { fs.mkdirSync(reportDirectory, { recursive: true }); fs.writeFileSync(path.join(reportDirectory, 'DECORATOR-REPORT.json'), JSON.stringify(report, null, 2) + '\n'); }
  return report;
}

Object.assign(generate, { generate, metadata, setMeta, productPlans, insertScope, productSchema, knownRevision, gamePlans, prebuiltDescription,
  embeddedLegacy, verifySkytech, redirectHTML, resolvePrebuiltId, resolvePrebuiltIds, PREBUILT_ALIASES, PREBUILT_ROUTE_REDIRECTS, SKYTECH_SOURCE, SKYTECH_FIELDS, fileFor, esc });
module.exports = generate;
