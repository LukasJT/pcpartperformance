'use strict';

const fs = require('node:fs');
const path = require('node:path');
const content = require('./completion-editorial-data.cjs');
const intents = require('./completion-editorial-map.cjs');
const publication = require('./master-publication.cjs');
const { recoverOwnedArticle } = require('./completion-editorial-history.cjs');
const DOMAIN = 'https://www.pcpartperformance.com';
const AUTHOR = { '@type': 'Organization', name: 'PC Part Performance', url: DOMAIN + '/about/' };
const readJSON = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;

function validateDay(value) {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\d$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function validateAuthorization(value, now = Date.now()) {
  if (!value || typeof value !== 'object') throw Error('An exact-version owner release record is required');
  const a = value;
  if (a.schema !== 1 || a.kind !== 'completion_editorial_owner_release' || a.origin !== 'direct_owner_instruction' ||
      a.author !== AUTHOR.name || a.humanReviewClaimed !== false || typeof a.statement !== 'string' || !a.statement.trim()) {
    throw Error('Truthful owner instruction and organization attribution required');
  }
  if (typeof a.recordedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(a.recordedAt) ||
      !Number.isFinite(Date.parse(a.recordedAt)) || Date.parse(a.recordedAt) > now) throw Error('Invalid or future authorization instant');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date(now));
  if (!validateDay(a.releaseDate) || a.releaseDate > today || a.releaseDate < content.evidenceDate) throw Error('Invalid, backdated or future release day');
  if (!Array.isArray(a.articles) || !a.articles.length) throw Error('Missing pinned article versions');
  const seen = new Set();
  for (const item of a.articles) {
    const candidate = content.articles.find(c => c.id === item?.id);
    if (!candidate || seen.has(item.id) || item.hash !== content.fingerprint(candidate)) throw Error('Unknown, duplicate or changed authorized article ' + item?.id);
    seen.add(item.id);
  }
  return a;
}

/** Build a consistency record from an actual owner instruction supplied by the caller.
 * This helper does not decide whether permission exists or claim a personal human review. */
function authorizationFor({ statement, recordedAt, releaseDate, ids = content.articles.map(a => a.id) }, now = Date.now()) {
  const value = {
    schema: 1, kind: 'completion_editorial_owner_release', origin: 'direct_owner_instruction',
    statement, recordedAt, releaseDate, author: AUTHOR.name, humanReviewClaimed: false,
    articles: ids.map(id => { const a = content.articles.find(c => c.id === id); return { id, hash: a ? content.fingerprint(a) : '' }; })
  };
  return validateAuthorization(value, now);
}

function datesFor(a, { previousMetadata = {}, previousHTML = '', releaseDate, preview = false } = {}) {
  if (preview) return { datePublished: null, dateModified: null };
  if (!validateDay(releaseDate)) throw Error('A real prepared release day is required');
  const old = previousMetadata[a.route];
  const schemaPublished = previousHTML.match(/"datePublished"\s*:\s*"([^"<>]+)"/)?.[1];
  const published = old?.datePublished || schemaPublished;
  if (old?.editorialId === a.id && old.completionFingerprint === content.fingerprint(a)) {
    if (!published || !Number.isFinite(Date.parse(published))) throw Error('Lost publication history for ' + a.route);
    return { datePublished: published, dateModified: old.dateModified || null };
  }
  if (a.change === 'material_revision') {
    if (!published || !Number.isFinite(Date.parse(published)) || published.slice(0, 10) > releaseDate) throw Error('Cannot preserve original publication history for ' + a.route);
    return { datePublished: published, dateModified: releaseDate };
  }
  // A private old program draft may be replaced at its intended canonical. A different
  // already-published article must be reviewed as a material revision rather than overwritten.
  if (published && old?.publicationAuthorized !== false && !previousHTML.includes('data-program-draft')) throw Error('A published canonical already owns ' + a.route);
  return { datePublished: releaseDate, dateModified: null };
}

function schemaFor(a, dates, image = null) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
    url: DOMAIN + a.route, datePublished: dates.datePublished,
    ...(dates.dateModified ? { dateModified: dates.dateModified } : {}), author: AUTHOR, publisher: AUTHOR,
    ...(image?.src ? { image: [DOMAIN + image.src] } : {}),
    citation: a.sourceIds.map(id => content.sources[id].url)
  };
}

function localPage(root, href) {
  const pathname = href.split(/[?#]/)[0];
  return path.join(root, pathname, pathname.endsWith('/') ? 'index.html' : '');
}

/** Integrate after oct16-editorial and before guide-directory/SEO. Nothing is released
 * without the caller's truthful exact-version owner record; private previews stay noindex. */
function integrate(context, options = {}) {
  const { root, shell, write, esc } = context;
  const checked = content.validate();
  if (!checked.valid) throw Error(checked.errors.join('; '));
  const preview = options.preview === true || process.env.PROGRAM_PREVIEW === '1';
  const authorization = options.authorization || context.completionEditorialAuthorization || null;
  if (!preview && !authorization) return { ...checked, rendered: 0, released: 0, state: 'prepared_awaiting_exact_version_owner_release' };
  if (!root || !fs.existsSync(root) || typeof shell !== 'function' || typeof write !== 'function' || typeof esc !== 'function') throw Error('Existing build context is required');
  const approved = preview ? content.articles : (() => {
    const auth = validateAuthorization(authorization, options.now);
    return auth.articles.map(item => content.articles.find(a => a.id === item.id));
  })();
  const metadataPath = path.join(root, 'master-publication-metadata.json');
  const metadata = readJSON(metadataPath, {});
  const history = { ...readJSON(path.join(root, 'continuation-editorial-metadata.json'), {}), ...metadata };
  const priorRelease = readJSON(path.join(root, 'data/completion-editorial-release.json'), null);
  const planned = new Set(approved.map(a => a.route));
  // Preflight before writing any public page: preserve dates, avoid canonical collisions,
  // and require real destinations for all recommended tool actions.
  const plans = approved.map(a => {
    const file = localPage(root, a.route), previousHTML = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const recovered = !preview && recoverOwnedArticle({ article: a, contentHash: content.fingerprint(a), previousHTML, release: priorRelease,
      marker: 'data-completion-editorial', fingerprintField: 'completionFingerprint', now: options.now });
    const previousMetadata = recovered ? { ...history, [a.route]: { ...history[a.route], ...recovered } } : history;
    const dates = datesFor(a, { previousMetadata, previousHTML, releaseDate: authorization?.releaseDate, preview });
    for (const t of a.tools) {
      const target = t.href.split(/[?#]/)[0];
      if (!planned.has(target) && !fs.existsSync(localPage(root, t.href))) throw Error('Missing next-action destination ' + t.href + ' for ' + a.id);
    }
    return { a, dates, image: history[a.route]?.image || null };
  });
  const release = {
    schema: 1, state: preview ? 'private_preview' : 'owner_authorized_release_prepared',
    author: AUTHOR.name, humanReviewClaimed: false, confirmedDeployment: false,
    ownerInstructionRecordedAt: preview ? null : authorization.recordedAt,
    releaseDate: preview ? null : authorization.releaseDate,
    attribution: content.articles[0].attribution, articles: []
  };
  fs.copyFileSync(path.join(__dirname, 'master-publication.css'), path.join(root, 'master-publication.css'));
  for (const { a, dates, image } of plans) {
    let body = publication.render(a, content.sources, esc, dates.datePublished || content.evidenceDate, dates.dateModified)
      .replace(/<p class="master-assistance">[\s\S]*?<\/p>/, '')
      .replace('<article ', '<article data-completion-editorial="' + esc(a.id) + '" ');
    if (image?.src && /^\/assets\//.test(image.src) && fs.existsSync(path.join(root, image.src))) {
      const width = Number.isFinite(image.width) && image.width > 0 ? image.width : 1200;
      const height = Number.isFinite(image.height) && image.height > 0 ? image.height : 675;
      const figure = '<figure class="master-diagram"><img src="' + esc(image.src) + '" alt="' + esc(image.alt || a.title) + '" width="' + width + '" height="' + height + '" decoding="async"></figure>';
      body = body.replace('<nav class="master-contents"', figure + '<nav class="master-contents"');
    }
    if (preview) body = body.replace('<article ', '<article data-program-draft ')
      .replace(/<p class="master-byline">[\s\S]*?<\/p>/, '<p class="master-byline">Research draft · PC Part Performance</p>');
    if (a.revisionSummary) body = body.replace('</article>', '<details class="analysis-block"><summary>Update record</summary><p>' + esc(preview ? 'Prepared revision: ' : dates.dateModified + ': ') + esc(a.revisionSummary) + '.</p></details></article>');
    const schema = preview ? '' : '<script type="application/ld+json">' + JSON.stringify(schemaFor(a, dates, image)).replace(/</g, '\\u003c') + '</script>';
    let html = shell(a.title, 'guide', body, { description: a.description });
    if (!html.includes('/master-publication.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/master-publication.css"></head>');
    html = html.replace('</head>', schema + '</head>');
    write(a.route.slice(1, -1), html);
    metadata[a.route] = {
      title: a.title, description: a.description, noindex: preview, publicationAuthorized: !preview,
      editorialId: a.id, completionFingerprint: content.fingerprint(a), ...dates,
      ...(image ? { image } : {})
    };
    release.articles.push({ id: a.id, route: a.route, title: a.title, change: a.change, words: content.wordCount(a),
      contentHash: content.fingerprint(a), sourceIds: a.sourceIds, ...dates,
      lifecycle: { ...a.lifecycle, state: release.state } });
  }
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  const indexPath = path.join(root, 'data/search-index.json');
  const index = readJSON(indexPath, []).filter(r => !planned.has(r.url));
  if (!preview) index.push(...approved.map(a => ({ id: 'completion_' + a.id, title: a.title, url: a.route, kind: 'Hardware guide', aliases: a.keywords })));
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index));
  fs.writeFileSync(path.join(root, 'data/completion-editorial-release.json'), JSON.stringify(release, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'data/completion-editorial-sources.json'), JSON.stringify(content.sources, null, 2) + '\n');
  const draftPath = path.join(root, 'program-draft-routes.json');
  const priorDrafts = readJSON(draftPath, []);
  const drafts = preview ? [...new Set([...priorDrafts, ...planned])] : priorDrafts.filter(r => !planned.has(r));
  fs.writeFileSync(draftPath, JSON.stringify(drafts, null, 2) + '\n');
  return { ...checked, rendered: plans.length, released: preview ? 0 : plans.length, preview, state: release.state };
}

function markdown(a) {
  const lines = ['# ' + a.title, '', a.summary, '',
    '- ID: ' + a.id, '- Canonical: ' + a.route, '- Change: ' + a.change,
    '- Intended author: PC Part Performance (organization)',
    '- Status: complete source-checked research; exact-version owner release still required.',
    '- Human review: none claimed. Deployment: not confirmed.',
    '- Research inspection day: ' + content.evidenceDate + '. Individual source records preserve their actual inspected date.',
    '- Version: ' + a.contentVersion, '- Fingerprint: ' + content.fingerprint(a),
    '- Intent: ' + a.intent, '- Attribution: ' + a.attribution, ''];
  for (const s of a.sections) {
    lines.push('## ' + s.title, '', ...s.paragraphs.flatMap(p => [p, '']));
    if (s.checklist) lines.push(...s.checklist.map(p => '- ' + p), '');
    if (s.table) {
      const cell = s => String(s).replace(/\|/g, '\\|');
      lines.push('**' + s.table.caption + '**', '', '| ' + s.table.headers.map(cell).join(' | ') + ' |', '| ' + s.table.headers.map(() => '---').join(' | ') + ' |', ...s.table.rows.map(r => '| ' + r.map(cell).join(' | ') + ' |'), '');
    }
    if (s.sourceIds.length) lines.push('Sources: ' + s.sourceIds.map(id => '[' + content.sources[id].publisher + ' — ' + content.sources[id].title + '](' + content.sources[id].url + ')').join('; '), '');
  }
  lines.push('## Apply this to your PC', '', ...a.tools.map(t => '- [' + t.label + '](' + DOMAIN + t.href + ')'), '', '## Sources and scope', '');
  for (const id of a.sourceIds) { const s = content.sources[id]; lines.push('- **' + id + '** — [' + s.publisher + ': ' + s.title + '](' + s.url + ')', '  - Scope: ' + s.scope, '  - Limits: ' + s.limitations, '  - Inspected: ' + s.inspected + (s.version ? '; applicable version: ' + s.version : ''), ''); }
  if (a.limitations.length) lines.push('## Remaining limits', '', ...a.limitations.map(l => '- ' + l), '');
  return lines.join('\n').trimEnd() + '\n';
}

function prepare({ directory = path.join(__dirname, '../docs/master-completion/content') } = {}) {
  const checked = content.validate(), mapped = intents.validate();
  if (!checked.valid || !mapped.valid) throw Error([...checked.errors, ...mapped.errors].join('; '));
  fs.mkdirSync(directory, { recursive: true });
  for (const a of content.articles) fs.writeFileSync(path.join(directory, a.id + '.md'), markdown(a));
  fs.writeFileSync(path.join(directory, 'GAP-MAP.csv'), intents.csv());
  fs.writeFileSync(path.join(directory, 'GAP-MAP.json'), JSON.stringify({ schema: 1, interpretation: '72 requested intents across two overlapping roadmaps, not 72 separate articles or completed tasks.', ...mapped, rows: intents.map }, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, 'SOURCES.json'), JSON.stringify(content.sources, null, 2) + '\n');
  const manifest = { schema: 1, author: AUTHOR.name, humanReviewClaimed: false, deploymentConfirmed: false,
    status: 'complete_source_checked_release_pending', evidenceDate: content.evidenceDate,
    ...checked, articles: content.articles.map(a => ({ id: a.id, route: a.route, title: a.title, change: a.change, words: content.wordCount(a), hash: content.fingerprint(a),
      replacesDraftIntent: a.replacesDraftIntent || null, partialIntent: a.partialIntent || null, lifecycle: a.lifecycle })) };
  fs.writeFileSync(path.join(directory, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
  const packet = ['# Master completion — editorial review packet', '',
    'Eight complete articles/revisions are prepared for the organization byline. This is a research packet, not proof of personal human review or production deployment.', '',
    'Five new canonical guides reuse existing draft intents where applicable. Three material revisions keep the original public canonical and require the real original publication date to be preserved. No priced build, measured benchmark or human reviewer is invented.', '',
    '| ID | Change | Article | Words |', '| --- | --- | --- | --- |',
    ...content.articles.map(a => '| ' + a.id + ' | ' + a.change + ' | [' + a.title + '](' + a.id + '.md) | ' + content.wordCount(a) + ' |'), '',
    '## Read before release', '',
    '- Review complete article text, applicable sources and the conditions of its recommendations.',
    '- The publication system distinguishes an explicit owner release from a personal human review. Do not create a false human-review attestation.',
    '- Pass the current owner instruction, a real recordedAt instant, real release day and these exact content/source hashes through completion-editorial.authorizationFor. It validates consistency, not human understanding.',
    '- The original program review function still requires its own truthful human attestation. This module does not change that policy or mark the original 40 drafts reviewed.',
    '- Original topics P02–P05, P14 and P39 retain hard missing-data blockers. MC08 is a workload-planning worksheet, not a replacement for the blocked priced/tested Premiere build.',
    '- Guide-directory and the existing SEO pass must run after integration. The parent release process must then inspect the actual pages and verify deployment.', '',
    '## Evidence and gaps', '',
    '[The 72-intent gap map](GAP-MAP.csv) records matching public guides/tools, partial coverage, this batch, missing evidence and remaining editorial work. Query phrases are qualitative task hypotheses, not measured search volume or rankings. See [source records](SOURCES.json) and [version manifest](MANIFEST.json).', '',
    '## Scope-specific source findings', '',
    '- The inspected Adobe version-scoped Premiere requirements were updated October 7, 2026; the separate recommendations page was updated January 7, 2026 and contains different broad figures. MC08 preserves that conflict rather than silently mixing them.',
    '- MSI distinguishes M-FLASH from its supported-board Flash BIOS Button procedure; a CPU-support entry alone does not prove the purchased unit can boot the new CPU.',
    '- NZXT’s August 17, 2026 cable guide supplies a real same-brand/different-generation incompatibility example. No individual unknown cable is approved by appearance.',
    '- FrameView 2.0 documents a reporting-method change. A metric change does not itself prove hardware became faster.',
    '- Blender requirements/manual pages did not return inspectable full text in the research tool; their search snippets were not promoted into article facts.',
    '- Seasonic’s knowledge-base cable warning was inspected, while its linked compatibility chart did not yield readable content. No exact pair approval is claimed.', '',
    'No traffic, rankings, keyword volumes, retail prices, FPS results or laboratory measurements are supplied by this batch.', ''].join('\n');
  fs.writeFileSync(path.join(directory, 'REVIEW-PACKET.md'), packet);
  return { ...checked, gapRows: mapped.rows, directory };
}

Object.assign(integrate, { integrate, prepare, markdown, authorizationFor, validateAuthorization, datesFor, schemaFor, localPage,
  dataset: content, intents, readJSON });
module.exports = integrate;
if (require.main === module) console.log(JSON.stringify(prepare(), null, 2));
