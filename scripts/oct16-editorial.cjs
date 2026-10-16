'use strict';

const fs = require('node:fs');
const path = require('node:path');
const content = require('./oct16-editorial-data.cjs');
const master = require('./master-publication.cjs');
const DOMAIN = 'https://www.pcpartperformance.com';
const RELEASE_DATE = '2026-10-16';
const AUTHOR = { '@type': 'Organization', name: 'PC Part Performance', url: DOMAIN + '/about/' };
const readJSON = (file, fallback = {}) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
const imageDescriptions = {
  'T16-C01': 'Original schematic: raising an overhanging cooler fan for taller RAM also increases the required case height. Not a scaled hardware model.',
  'T16-C02': 'Original purchase worksheet diagram separating checked offers, manually entered quotes, owned or included items and prices still unknown. No retail prices are shown.',
  'T16-C03': 'Original layout diagram showing a graphics card and front radiator as separate occupied spaces inside a conceptual case. Not verified product geometry.'
};
function datesFor(article, { masterMetadata = {}, continuationMetadata = {}, previousHTML = '', preview = false } = {}) {
  // A full private preview may withhold the upstream publication registries.
  // Its draft byline and metadata must not invent a first-publication date.
  if (preview) return { datePublished: null, dateModified: null };
  const old = masterMetadata[article.route] || continuationMetadata[article.route];
  const schemaDate = previousHTML.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1];
  const oldPublished = old?.datePublished || schemaDate || null;
  if (article.change === 'material_revision' && (!oldPublished || !Number.isFinite(Date.parse(oldPublished)))) {
    throw Error('Cannot preserve the real original publication date for ' + article.route);
  }
  return {
    datePublished: article.change === 'material_revision' ? oldPublished : RELEASE_DATE,
    dateModified: article.change === 'material_revision' ? RELEASE_DATE : null
  };
}
function schemaFor(article, dates, image) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
    description: article.description, url: DOMAIN + article.route,
    datePublished: dates.datePublished,
    ...(dates.dateModified ? { dateModified: dates.dateModified } : {}),
    author: AUTHOR, publisher: AUTHOR,
    image: [DOMAIN + image.src],
    citation: article.sourceIds.map(id => content.sources[id].url)
  };
}
function generate({ root, shell, write, esc }) {
  const checked = content.validate();
  if (!checked.valid) throw Error(checked.errors.join('; '));
  const preview = process.env.PROGRAM_PREVIEW === '1';
  const metadataPath = path.join(root, 'master-publication-metadata.json');
  const metadata = readJSON(metadataPath);
  const continuationMetadata = readJSON(path.join(root, 'continuation-editorial-metadata.json'));
  const release = {
    schema: 1, preparedDate: RELEASE_DATE, author: AUTHOR.name, preview,
    origin: 'direct_owner_instruction',
    statement: 'Implement the current master request and prepare source-checked guides under the previously authorized PC Part Performance organization byline.',
    humanReviewClaimed: false, confirmedDeployment: false, articles: []
  };
  fs.mkdirSync(path.join(root, 'assets/editorial-oct16'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'master-publication.css'), path.join(root, 'master-publication.css'));
  for (const a of content.articles) {
    const file = path.join(root, a.route, 'index.html');
    const previousHTML = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const dates = datesFor(a, { masterMetadata: metadata, continuationMetadata, previousHTML, preview });
    const image = { src: '/assets/editorial-oct16/' + a.id + '.png', width: 1200, height: 675, alt: imageDescriptions[a.id] };
    const assetSource = path.join(__dirname, '../data/editorial-oct16', a.id + '.png');
    if (!fs.existsSync(assetSource)) throw Error('Missing original editorial diagram ' + a.id);
    fs.copyFileSync(assetSource, path.join(root, image.src));
    let body = master.render(a, content.sources, esc, dates.datePublished || RELEASE_DATE, dates.dateModified)
      .replace(/<p class="master-assistance">[\s\S]*?<\/p>/, '')
      .replace('<article ', '<article data-oct16-editorial="' + esc(a.id) + '" ');
    const figure = '<figure class="master-diagram"><img src="' + image.src + '" alt="' + esc(image.alt) + '" width="1200" height="675" decoding="async"><figcaption>' + esc(image.alt) + '</figcaption></figure>';
    body = body.replace('<nav class="master-contents"', figure + '<nav class="master-contents"');
    if (preview) {
      body = body.replace('<article ', '<article data-program-draft ')
        .replace(/<p class="master-byline">[\s\S]*?<\/p>/, '<p class="master-byline">Research draft prepared ' + RELEASE_DATE + ' · PC Part Performance</p>');
    }
    const change = a.change === 'new'
      ? 'New source-linked cooling guide with an explicitly hypothetical RAM-height example.'
      : a.id === 'T16-C02'
        ? 'Expanded the purchase checklist to include cooling, accessories and distinct owned, included, quoted and unknown cost states.'
        : 'Added occupied radiator-envelope checks, conditional top-mount restrictions and a documented source-conflict example.';
    body = body.replace('</article>', '<details class="analysis-block"><summary>Update record</summary><p>' + RELEASE_DATE + ': ' + esc(change) + '</p></details></article>');
    const schema = preview ? '' : '<script type="application/ld+json">' + JSON.stringify(schemaFor(a, dates, image)).replace(/</g, '\\u003c') + '</script>';
    write(a.route.slice(1, -1), shell(a.title, 'guide', body, { description: a.description })
      .replace('</head>', '<link rel="stylesheet" href="/master-publication.css">' + schema + '</head>'));
    metadata[a.route] = {
      title: a.title, description: a.description, image, noindex: preview,
      publicationAuthorized: !preview, editorialId: a.id,
      datePublished: preview ? null : dates.datePublished,
      dateModified: preview ? null : dates.dateModified
    };
    release.articles.push({
      id: a.id, route: a.route, title: a.title, change: a.change, words: content.wordCount(a),
      contentHash: content.fingerprint(a), sourceIds: a.sourceIds,
      preparedPublicationDate: preview ? null : dates.datePublished,
      preparedModificationDate: preview ? null : dates.dateModified,
      lifecycle: { ...a.lifecycle, state: preview ? 'private_draft' : 'owner_authorized_release_prepared' }
    });
  }
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  const ids = new Set(content.articles.map(a => a.route));
  const indexPath = path.join(root, 'data/search-index.json');
  const index = readJSON(indexPath, []).filter(row => !ids.has(row.url));
  if (!preview) index.push(...content.articles.map(a => ({ id: 'oct16_' + a.id, title: a.title, url: a.route, kind: 'Hardware guide', aliases: a.keywords })));
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(index));
  fs.writeFileSync(path.join(root, 'data/oct16-editorial-release.json'), JSON.stringify(release, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'data/oct16-editorial-sources.json'), JSON.stringify(content.sources, null, 2) + '\n');
  const directory = require('./guide-directory.cjs')({ root, shell, write, esc });
  return { ...checked, preview, directory };
}
Object.assign(generate, { datesFor, schemaFor, imageDescriptions });
module.exports = generate;
