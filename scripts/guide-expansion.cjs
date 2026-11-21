'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const records = require('../data/guide-expansion.json');
const approval = require('../data/guide-expansion-approval.json');
const safeElements = new Set('a b br caption desc div figcaption figure g h2 li nav ol p path rect section small span strong svg table tbody td text th thead title tr ul'.split(' '));
const safeAttributes = new Set('aria-label aria-labelledby class colspan d fill font-family font-size height href id opacity role rx scope stroke stroke-dasharray stroke-width text-anchor viewBox width x y'.split(' '));

function validateBody(body) {
  assert(!/<!--|<!|<\?|&(?:#x0*3c|#0*60);\s*(?:script|iframe)/i.test(body));
  for (const [tag, closing, element, attrs] of body.matchAll(/<(\/?)([a-z][\w-]*)\b([^<>]*)>/gi)) {
    assert(safeElements.has(element), 'Unrecognized guide element ' + tag.slice(0, 100));
    assert(!closing || !attrs.trim());
    let remainder = attrs;
    for (const [attribute, name, value] of attrs.matchAll(/\s+([\w-]+)="([^"]*)"/g)) {
      assert(safeAttributes.has(name), 'Unrecognized guide attribute ' + name);
      if (name === 'href') assert(/^(?:https:\/\/[^\s]+|\/(?![\/\\])[^\s]*|#[\w-]+)$/.test(value), 'Unexpected link ' + value);
      if (name === 'fill' || name === 'stroke') assert(/^(?:#[a-f\d]{3,8}|none|currentColor|[a-z]+)$/i.test(value), value);
      remainder = remainder.replace(attribute, '');
    }
    assert(/^\s*\/?\s*$/.test(remainder), 'Unrecognized markup ' + tag.slice(0, 120));
  }
  assert(!body.replace(/<\/?[a-z][\w-]*\b[^<>]*>/gi, '').includes('<'), 'Unparsed guide markup');
  assert(/<(?:figure|table|svg)\b/.test(body), 'Missing visual');
}

function validate(rows, permission) {
  assert.equal(permission.schema, 1);
  assert.equal(permission.origin, 'direct_owner_instruction');
  assert.equal(permission.author, 'PC Part Performance');
  assert.equal(permission.personalReviewAttestationRecorded, false);
  assert(permission.ownerInstruction.includes('151–300'));
  assert.match(permission.releaseDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(permission.reviewedTrackerSha256, /^[a-f\d]{64}$/);
  assert.match(permission.sourceAuditSha256, /^[a-f\d]{64}$/);
  assert.equal(permission.approvedArticleCount, 150);
  assert.equal(rows.length, 150);
  assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'), permission.contentSha256, 'Approved guide content changed');
  rows.forEach((row, i) => {
    assert.equal(row.id, String(151 + i));
    assert.match(row.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(row.reviewedHtmlSha256, /^[a-f\d]{64}$/);
    assert(row.title && row.description && row.group);
    assert.match(row.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert(row.checked <= permission.releaseDate);
    assert(row.sources.length && row.sources.every(url => new URL(url).protocol === 'https:'));
    try { validateBody(row.body); } catch (error) { throw new Error(row.slug + ': ' + error.message); }
  });
  return rows;
}

const readable = day => new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(day));
const time = day => `<time datetime="${day}">${readable(day)}</time>`;

function render(row, esc, author, directory, groupId) {
  return `<article class="master-article hardware-research-article hardware-guide-expansion" data-hardware-research="${row.id}"><header>
    <p class="research-collection"><a href="${directory}#${groupId}">${esc(row.group)}</a></p>
    <h1>${esc(row.title)}</h1><p class="master-byline">By <a href="/about/">${esc(author)}</a> · ${time(approval.releaseDate)}</p>
    </header>${row.body}
    <p class="master-citations">Source review ${time(row.checked)}. Research and writing prepared with AI assistance.</p>
  </article>`;
}

module.exports = { records, approval, render, validate, validateBody };
