'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const articles = require('../data/search-dominance-articles.json');
const authorization = require('../data/search-dominance-authorization.json');
const { DOMAIN } = require('./program-routing.cjs');

const author = 'PC Part Performance';
const library = '/hardware-guides/';
const routeFor = article => '/blog/' + article.slug + '/';
const fileFor = (root, route) => path.join(root, route, 'index.html');
const sectionsByGroup = [
  ['gta-access', 'GTA VI setup and access'],
  ['game-evidence', 'Game settings and performance evidence'],
  ['local-ai', 'Local AI hardware'],
  ['development', 'Development workstations'],
  ['infrastructure', 'AI infrastructure'],
  ['graphics', 'Graphics cards and game performance'],
  ['platforms', 'CPU and motherboard upgrades'],
  ['building', 'Building and buying a PC'],
  ['components', 'Memory, drives and cooling'],
  ['systems', 'Consoles, prebuilts and market trends'],
];
const groupNames = [...new Set(articles.map(row => row.group))];
const groups = new Map(groupNames.map((name, i) => [name, sectionsByGroup[i]]));

function validate(rows, approval) {
  assert.equal(approval.schema, 1);
  assert.equal(approval.origin, 'direct_owner_instruction');
  assert.equal(approval.author, author);
  assert.equal(approval.personalReviewAttestationRecorded, false);
  assert(approval.ownerInstruction.trim());
  assert.match(approval.reviewCommit, /^[a-f0-9]{40}$/);
  assert.match(approval.releaseDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(approval.releaseDate).toISOString().slice(0, 10), approval.releaseDate);
  assert.equal(approval.approvedArticleCount, 150);
  assert.equal(rows.length, approval.approvedArticleCount);
  assert.equal(groups.size, sectionsByGroup.length);
  assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'), approval.contentSha256, 'Approved article content changed');
  const ids = new Set(rows.map(row => row.id));
  for (const field of ['title', 'slug', 'description']) {
    assert.equal(new Set(rows.map(row => row[field])).size, rows.length, 'Duplicate article ' + field);
  }
  rows.forEach((row, index) => {
    assert.equal(row.id, String(index + 1).padStart(3, '0'));
    assert.match(row.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(row.reviewedHtmlSha256, /^[a-f0-9]{64}$/);
    assert(groups.has(row.group));
    assert(row.sections.length >= 3 && row.actions.length > 0);
    assert(row.related.every(id => id !== row.id && ids.has(id)));
    assert(Object.values(row.sources).length >= 2);
    assert(Object.values(row.sources).every(([label, url]) => label && new URL(url).protocol === 'https:'));
    assert(row.actions.every(([label, route]) => label && /^\/[a-z0-9/-]+\/$/.test(route)));
    assert(row.checked <= approval.releaseDate);
  });
  return rows;
}

function renderFigure(visual, esc) {
  let content;
  if (visual.bars) {
    assert(visual.total > 0 && visual.bars.length <= 4);
    assert.equal(visual.bars.reduce((sum, [, amount]) => sum + amount, 0), visual.total);
    let offset = 0;
    const segments = visual.bars.map(([, value], index) => {
      const start = offset;
      offset += value;
      return `<rect class="research-segment-${index}" x="${start}" width="${value}" height="20"></rect>`;
    }).join('');
    const legend = visual.bars.map(([label, value], index) =>
      `<li><span class="research-swatch research-segment-${index}" aria-hidden="true"></span>${esc(label)} <strong>${value} ${esc(visual.unit)}</strong></li>`).join('');
    content = `<svg viewBox="0 0 ${visual.total} 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">${segments}</svg><ul class="research-legend">${legend}</ul><p>${visual.total} ${esc(visual.unit)} total in this example</p>`;
  } else {
    content = '<ol class="research-steps">' + visual.rows.map(([title, detail, cue]) =>
      `<li><strong>${esc(title)}</strong><span>${esc(detail)}</span><small>${esc(cue)}</small></li>`).join('') + '</ol>';
  }
  return `<figure class="research-figure"><figcaption>${esc(visual.title)}</figcaption>${content}</figure>`;
}

function renderTable(table, esc) {
  const columns = table.columns.map(label => `<th scope="col">${esc(label)}</th>`).join('');
  const rows = table.rows.map(([label, ...values]) =>
    `<tr><th scope="row">${esc(label)}</th>${values.map(value => `<td>${esc(value)}</td>`).join('')}</tr>`).join('');
  return `<div class="master-table" role="region" aria-label="${esc(table.title)}" tabindex="0"><table><caption>${esc(table.title)}</caption><thead><tr>${columns}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderArticle(article, byId, esc, date) {
  const link = (route, name) => `<a href="${esc(route)}">${esc(name)}</a>`;
  const numbers = new Map(Object.keys(article.sources).map((key, i) => [key, i + 1]));
  const cite = value => esc(value).replace(/\[([a-zA-Z0-9]+)\]/g, (marker, key) => {
    const number = numbers.get(key);
    assert(number, 'Unknown citation ' + marker);
    return `<sup><a href="#article-source-${number}" aria-label="Source ${number}">[${number}]</a></sup>`;
  });
  const toc = article.sections.map(([name], i) => '<li>' + link('#guide-step-' + (i + 1), name) + '</li>').join('');
  const sections = article.sections.map(([name, ...paragraphs], i) =>
    `<section id="guide-step-${i + 1}"><h2>${esc(name)}</h2>${paragraphs.map(p => '<p>' + cite(p) + '</p>').join('')}</section>`).join('');
  const sources = Object.values(article.sources).map(([label, url], i) =>
    `<li id="article-source-${i + 1}">${link(url, label)}</li>`).join('');
  const actions = article.actions.map(([label, route]) => `<li>${link(route, label)}</li>`).join('');
  const related = article.related.map(id => byId.get(id)).map(item => `<li>${link(routeFor(item), item.title)}</li>`).join('');
  const readable = day => new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(day));
  const time = day => `<time datetime="${day}">${readable(day)}</time>`;
  const [groupId, groupTitle] = groups.get(article.group);
  return `<article class="master-article hardware-research-article" data-hardware-research="${article.id}"><header>
    <p class="research-collection">${link(library + '#' + groupId, groupTitle)}</p>
    <h1>${esc(article.title)}</h1><p class="master-byline">By ${link('/about/', author)} · ${time(date)}</p>
    <p class="master-answer">${cite(article.answer)}</p></header>
    ${renderFigure(article.visual, esc)}${article.table ? renderTable(article.table, esc) : ''}
    <nav class="master-contents" aria-label="Article contents"><h2>In this guide</h2><ul>${toc}</ul></nav>
    ${sections}<section><h2>Put it into practice</h2><ul>${actions}</ul></section>
    ${related ? '<section><h2>Related guides</h2><ul>' + related + '</ul></section>' : ''}
    <section aria-labelledby="article-sources"><h2 id="article-sources">Sources</h2>
    <p class="master-citations">Source review ${time(article.checked)}. Research and writing prepared with AI assistance.</p><ol>${sources}</ol></section>
  </article>`;
}

function integrate({ root, shell, write, esc }) {
  if (process.env.PROGRAM_PREVIEW === '1') return;
  const rows = validate(articles, authorization);
  const byId = new Map(rows.map(article => [article.id, article]));
  const { releaseDate } = authorization;
  const planned = new Set([library, ...rows.map(routeFor)]);
  const metadataFile = path.join(root, 'master-publication-metadata.json');
  const searchFile = path.join(root, 'data/search-index.json');
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  const search = JSON.parse(fs.readFileSync(searchFile, 'utf8'));
  for (const route of planned) {
    const file = fileFor(root, route);
    if (fs.existsSync(file)) {
      const html = fs.readFileSync(file, 'utf8');
      assert(html.includes('data-hardware-research="') || html.includes('data-hardware-research-library'), 'Existing URL collision ' + route);
    }
    assert(!metadata[route], 'Existing published metadata ' + route);
  }
  for (const row of rows) {
    for (const [, route] of row.actions) assert(fs.existsSync(fileFor(root, route)), 'Missing site destination ' + route);
  }
  const withCss = html => html.replace('</head>', '<link rel="stylesheet" href="/master-publication.css"><link rel="stylesheet" href="/hardware-research.css"></head>');
  const org = { '@type': 'Organization', name: author, url: DOMAIN + '/about/' };
  fs.copyFileSync(path.join(__dirname, 'hardware-research.css'), path.join(root, 'hardware-research.css'));
  for (const row of rows) {
    const route = routeFor(row);
    const body = renderArticle(row, byId, esc, releaseDate);
    const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: row.title, description: row.description,
      url: DOMAIN + route, mainEntityOfPage: DOMAIN + route, datePublished: releaseDate, author: org, publisher: org,
      citation: Object.values(row.sources).map(([, url]) => url) };
    const html = withCss(shell(row.title, 'guide', body, { description: row.description }))
      .replace('</head>', '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, '\\u003c') + '</script></head>');
    write(route.slice(1, -1), html);
    metadata[route] = { title: row.title, description: row.description, noindex: false, publicationAuthorized: true,
      editorialId: 'research-' + row.id, datePublished: releaseDate };
  }
  const groupNav = [...groups.values()].map(([id, title]) => `<li><a href="#${id}">${esc(title)}</a></li>`).join('');
  const groupSections = [...groups].map(([key, [id, title]]) => {
    const links = rows.filter(row => row.group === key).map(row => `<li><a href="${routeFor(row)}">${esc(row.title)}</a></li>`).join('');
    return `<section id="${id}" class="research-directory-group"><h2>${esc(title)}</h2><ul>${links}</ul></section>`;
  }).join('');
  const description = 'Browse source-backed guides to graphics cards, PC builds, console settings, local AI and hardware upgrades.';
  write(library.slice(1, -1), withCss(shell('Hardware Research Guides', 'learn', `<div class="research-directory" data-hardware-research-library>
    <header class="page-heading"><div><h1>Hardware Research Guides</h1><p>${esc(description)}</p></div></header>
    <nav aria-label="Guide topics"><ul>${groupNav}</ul></nav>${groupSections}</div>`, { description })));
  const incoming = [
    ['/blog/', library, 'Browse hardware research guides'],
    ['/blog/check-cpu-bios-support/', library + '#platforms', 'Browse CPU and motherboard upgrade guides'],
    ['/blog/local-ai-memory-weights-kv-cache/', library + '#local-ai', 'Browse local AI hardware guides'],
    ['/blog/choose-display-target-game-evidence/', library + '#graphics', 'Browse graphics and game performance guides'],
    ['/blog/prebuilt-gaming-pc-canada-shortlist/', library + '#systems', 'Browse prebuilt and market guides'],
  ];
  for (const [route, destination, label] of incoming) {
    const file = fileFor(root, route);
    const before = fs.readFileSync(file, 'utf8');
    const clean = before.replace(/<section class="master-library" data-hardware-research-link>[\s\S]*?<\/section>/g, '');
    assert(clean.includes('</main>'), 'Missing main landmark ' + route);
    const entry = `<section class="master-library" data-hardware-research-link><h2>More hardware research</h2><p><a href="${destination}">${esc(label)}</a></p></section>`;
    fs.writeFileSync(file, clean.replace('</main>', entry + '</main>'));
  }
  const newSearch = rows.map(row => ({ id: 'research-' + row.id, title: row.title, url: routeFor(row), kind: 'Hardware guide', aliases: [] }));
  newSearch.push({ id: 'hardware-research-guides', title: 'Hardware Research Guides', url: library, kind: 'Hardware guide', aliases: [] });
  fs.writeFileSync(searchFile, JSON.stringify([...search.filter(row => !planned.has(row.url)), ...newSearch]));
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  console.log('Release build generated ' + rows.length + ' owner-approved hardware guides.');
}

module.exports = { integrate, validate, routeFor, library };
