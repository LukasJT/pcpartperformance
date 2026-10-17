'use strict';

const fs = require('node:fs');
const path = require('node:path');
const content = require('./completion-editorial-extra-data.cjs');
const publication = require('./master-publication.cjs');
const { recoverOwnedArticle } = require('./completion-editorial-history.cjs');
const DOMAIN = 'https://www.pcpartperformance.com';
const AUTHOR = { '@type': 'Organization', name: 'PC Part Performance', url: DOMAIN + '/about/' };
const readJSON = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
function validateDay(day) { return typeof day === 'string' && /^\d{4}-\d\d-\d\d$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day; }

function validateAuthorization(value, now = Date.now()) {
  const a = value;
  if (!a || a.schema !== 1 || a.kind !== 'completion_editorial_extra_owner_release' || a.origin !== 'direct_owner_instruction' || a.author !== AUTHOR.name || a.humanReviewClaimed !== false || typeof a.statement !== 'string' || !a.statement.trim()) throw Error('Truthful owner instruction and organization attribution required');
  if (typeof a.recordedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(a.recordedAt) || !Number.isFinite(Date.parse(a.recordedAt)) || Date.parse(a.recordedAt) > now) throw Error('Invalid or future authorization instant');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date(now));
  if (!validateDay(a.releaseDate) || a.releaseDate < content.evidenceDate || a.releaseDate > today) throw Error('Invalid, backdated or future release day');
  if (!Array.isArray(a.articles) || !a.articles.length) throw Error('Missing pinned article versions');
  const ids = new Set();
  for (const pin of a.articles) {
    const row = content.articles.find(r => r.id === pin?.id);
    if (!row || ids.has(pin.id) || pin.hash !== content.fingerprint(row)) throw Error('Unknown, duplicate or changed authorized article ' + pin?.id);
    ids.add(pin.id);
  }
  return a;
}

/** The caller supplies a real owner instruction and timestamp. This pins the exact
 * source/text versions; it does not attest that a person personally reviewed them. */
function authorizationFor({ statement, recordedAt, releaseDate, ids = content.articles.map(a => a.id) }, now = Date.now()) {
  return validateAuthorization({ schema: 1, kind: 'completion_editorial_extra_owner_release', origin: 'direct_owner_instruction', statement, recordedAt, releaseDate,
    author: AUTHOR.name, humanReviewClaimed: false,
    articles: ids.map(id => { const row = content.articles.find(a => a.id === id); return { id, hash: row ? content.fingerprint(row) : '' }; }) }, now);
}

function datesFor(a, { previousMetadata = {}, previousHTML = '', releaseDate, preview = false } = {}) {
  if (preview) return { datePublished: null, dateModified: null };
  if (!validateDay(releaseDate)) throw Error('A real release day is required');
  const old = previousMetadata[a.route];
  const published = old?.datePublished || previousHTML.match(/"datePublished"\s*:\s*"([^"<>]+)"/)?.[1];
  if (old?.editorialId === a.id && old.completionExtraFingerprint === content.fingerprint(a)) {
    if (!published || !Number.isFinite(Date.parse(published))) throw Error('Lost publication history ' + a.route);
    return { datePublished: published, dateModified: old.dateModified || null };
  }
  if (a.change === 'material_revision') {
    if (!published || !Number.isFinite(Date.parse(published)) || published.slice(0, 10) > releaseDate) throw Error('Cannot preserve original publication history ' + a.route);
    return { datePublished: published, dateModified: releaseDate };
  }
  if (published && old?.publicationAuthorized !== false && !previousHTML.includes('data-program-draft')) throw Error('Published canonical collision ' + a.route);
  return { datePublished: releaseDate, dateModified: null };
}

function localPage(root, href) { const route = href.split(/[?#]/)[0]; return path.join(root, route, route.endsWith('/') ? 'index.html' : ''); }
function schemaFor(a, dates) {
  return { '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description, url: DOMAIN + a.route,
    datePublished: dates.datePublished, ...(dates.dateModified ? { dateModified: dates.dateModified } : {}), author: AUTHOR, publisher: AUTHOR,
    citation: a.sourceIds.map(id => content.sources[id].url) };
}

/** After existing editorials and first-eight completion batch, before directory,
 * clarity and final SEO. Without authorization, no public files are changed. */
function integrate(context, options = {}) {
  const checked = content.validate();
  if (!checked.valid) throw Error(checked.errors.join('; '));
  const preview = options.preview === true || process.env.PROGRAM_PREVIEW === '1';
  const authorization = options.authorization || context.completionEditorialExtraAuthorization;
  if (!preview && !authorization) return { ...checked, rendered: 0, released: 0, state: 'prepared_awaiting_exact_version_owner_release' };
  const { root, shell, write, esc } = context;
  if (!root || !fs.existsSync(root) || typeof shell !== 'function' || typeof write !== 'function' || typeof esc !== 'function') throw Error('Existing build context required');
  const approved = preview ? content.articles : validateAuthorization(authorization, options.now).articles.map(pin => content.articles.find(a => a.id === pin.id));
  const metadataPath = path.join(root, 'master-publication-metadata.json');
  const metadata = readJSON(metadataPath, {});
  const history = { ...readJSON(path.join(root, 'continuation-editorial-metadata.json'), {}), ...metadata };
  const priorRelease = readJSON(path.join(root, 'data/completion-editorial-extra-release.json'), null);
  const planned = new Set(approved.map(a => a.route));
  // Plan the whole batch before writing: no partial release after a collision or
  // broken next action. Existing dates never become a fresh date on each build.
  const plans = approved.map(a => {
    const file = localPage(root, a.route);
    const previousHTML = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const recovered = !preview && recoverOwnedArticle({ article: a, contentHash: content.fingerprint(a), previousHTML, release: priorRelease,
      marker: 'data-completion-editorial-extra', fingerprintField: 'completionExtraFingerprint', now: options.now });
    const previousMetadata = recovered ? { ...history, [a.route]: { ...history[a.route], ...recovered } } : history;
    const dates = datesFor(a, { previousMetadata, previousHTML, releaseDate: authorization?.releaseDate, preview });
    for (const t of a.tools) if (!planned.has(t.href.split(/[?#]/)[0]) && !fs.existsSync(localPage(root, t.href))) throw Error('Missing next-action destination ' + t.href);
    return { a, dates };
  });
  const release = { schema: 1, state: preview ? 'private_preview' : 'owner_authorized_release_prepared', author: AUTHOR.name,
    humanReviewClaimed: false, confirmedDeployment: false, ownerInstructionRecordedAt: preview ? null : authorization.recordedAt,
    releaseDate: preview ? null : authorization.releaseDate, attribution: content.articles[0].attribution, articles: [] };
  fs.copyFileSync(path.join(__dirname, 'master-publication.css'), path.join(root, 'master-publication.css'));
  for (const { a, dates } of plans) {
    let body = publication.render(a, content.sources, esc, dates.datePublished || content.evidenceDate, dates.dateModified)
      .replace(/<p class="master-assistance">[\s\S]*?<\/p>/, '')
      .replace('<article ', '<article data-completion-editorial-extra="' + esc(a.id) + '" ');
    if (preview) body = body.replace('<article ', '<article data-program-draft ')
      .replace(/<p class="master-byline">[\s\S]*?<\/p>/, '<p class="master-byline">Research draft · PC Part Performance</p>');
    let html = shell(a.title, 'guide', body, { description: a.description });
    if (!html.includes('/master-publication.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/master-publication.css"></head>');
    if (preview) html = html.replace(/<meta\b[^>]*name=["']robots["'][^>]*>/gi, '').replace('</head>', '<meta name="robots" content="noindex,follow"></head>');
    else html = html.replace('</head>', '<script type="application/ld+json">' + JSON.stringify(schemaFor(a, dates)).replace(/</g, '\\u003c') + '</script></head>');
    write(a.route.slice(1, -1), html);
    metadata[a.route] = { title: a.title, description: a.description, noindex: preview, publicationAuthorized: !preview,
      editorialId: a.id, completionExtraFingerprint: content.fingerprint(a), ...dates };
    release.articles.push({ id: a.id, route: a.route, title: a.title, words: content.wordCount(a), contentHash: content.fingerprint(a), sourceIds: a.sourceIds, ...dates,
      lifecycle: { ...a.lifecycle, state: release.state } });
  }
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  const dataDir = path.join(root, 'data'); fs.mkdirSync(dataDir, { recursive: true });
  const indexPath = path.join(dataDir, 'search-index.json');
  const index = readJSON(indexPath, []).filter(row => !planned.has(row.url));
  if (!preview) index.push(...approved.map(a => ({ id: 'completion_extra_' + a.id, title: a.title, url: a.route, kind: 'Hardware guide', aliases: a.keywords })));
  fs.writeFileSync(indexPath, JSON.stringify(index));
  fs.writeFileSync(path.join(dataDir, 'completion-editorial-extra-release.json'), JSON.stringify(release, null, 2) + '\n');
  fs.writeFileSync(path.join(dataDir, 'completion-editorial-extra-sources.json'), JSON.stringify(content.sources, null, 2) + '\n');
  const draftFile = path.join(root, 'program-draft-routes.json');
  const drafts = readJSON(draftFile, []);
  fs.writeFileSync(draftFile, JSON.stringify(preview ? [...new Set([...drafts, ...planned])] : drafts.filter(route => !planned.has(route)), null, 2) + '\n');
  return { ...checked, rendered: plans.length, released: preview ? 0 : plans.length, state: release.state };
}

function markdown(a) {
  const lines = ['# ' + a.title, '', a.summary, '', '- ID: ' + a.id, '- Canonical: ' + a.route, '- Author: PC Part Performance (organization)',
    '- Status: source-checked; exact-version owner release pending. Human review and deployment are not claimed.', '- Inspection day: ' + content.evidenceDate,
    '- Fingerprint: ' + content.fingerprint(a), '- Intent: ' + a.intent, '- Attribution: ' + a.attribution, ''];
  for (const s of a.sections) {
    lines.push('## ' + s.title, '', ...s.paragraphs.flatMap(p => [p, '']));
    if (s.checklist) lines.push(...s.checklist.map(p => '- ' + p), '');
    if (s.table) { const cell = v => String(v).replace(/\|/g, '\\|'); lines.push('**' + s.table.caption + '**', '', '| ' + s.table.headers.map(cell).join(' | ') + ' |', '| ' + s.table.headers.map(() => '---').join(' | ') + ' |', ...s.table.rows.map(r => '| ' + r.map(cell).join(' | ') + ' |'), ''); }
    if (s.sourceIds.length) lines.push('Sources: ' + s.sourceIds.map(id => '[' + content.sources[id].publisher + ' — ' + content.sources[id].title + '](' + content.sources[id].url + ')').join('; '), '');
  }
  lines.push('## Apply this to your PC', '', ...a.tools.map(t => '- [' + t.label + '](' + DOMAIN + t.href + ')'), '', '## Sources and scope', '');
  for (const id of a.sourceIds) { const s = content.sources[id]; lines.push('- **' + id + '** — [' + s.publisher + ': ' + s.title + '](' + s.url + ')', '  - Scope: ' + s.scope, '  - Limits: ' + s.limitations, '  - Inspected: ' + s.inspected + (s.version ? '; version: ' + s.version : ''), ''); }
  lines.push('## Remaining limits', '', ...a.limitations.map(l => '- ' + l), '');
  return lines.join('\n').trimEnd() + '\n';
}

function prepare({ directory = path.join(__dirname, '../docs/master-completion/content-extra') } = {}) {
  const checked = content.validate(); if (!checked.valid) throw Error(checked.errors.join('; '));
  fs.mkdirSync(directory, { recursive: true });
  for (const a of content.articles) fs.writeFileSync(path.join(directory, a.id + '.md'), markdown(a));
  fs.writeFileSync(path.join(directory, 'SOURCES.json'), JSON.stringify(content.sources, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'MANIFEST.json'), JSON.stringify({ schema: 1, evidenceDate: content.evidenceDate, author: AUTHOR.name, humanReviewClaimed: false, confirmedDeployment: false,
    state: 'complete_source_checked_release_pending', ...checked, articles: content.articles.map(a => ({ id: a.id, route: a.route, title: a.title, words: content.wordCount(a), contentHash: content.fingerprint(a), sourceIds: a.sourceIds, replacesDraftIntent: a.replacesDraftIntent || null, roadmapIntents: a.roadmapIntents, limitations: a.limitations })) }, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'GAP-OVERLAY.json'), JSON.stringify({ schema: 1, base: '../content/GAP-MAP.json', interpretation: 'Five remaining editorial rows addressed by four distinct practical guides. Documentation-based planning does not complete unavailable tested/priced recommendations.', rows: content.gapOverlay,
    hardBlockedIntentsUnchanged: ['P02', 'P03', 'P04', 'P05', 'P14', 'P39'] }, null, 2) + '\n');
  return { ...checked, directory };
}

Object.assign(integrate, { integrate, prepare, markdown, authorizationFor, validateAuthorization, datesFor, localPage, schemaFor, dataset: content });
module.exports = integrate;
if (require.main === module) console.log(JSON.stringify(prepare(), null, 2));
