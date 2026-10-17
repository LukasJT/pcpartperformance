'use strict';

const DOMAIN = 'https://www.pcpartperformance.com';
function validDay(day) { return typeof day === 'string' && /^\d{4}-\d\d-\d\d$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day; }
function localDay(instant) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date(instant)); }
function validDate(value, now) {
  if (validDay(value)) return value <= localDay(now);
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !validDay(value.slice(0, 10))) return false;
  return Number.isFinite(Date.parse(value)) && Date.parse(value) <= now;
}
function schemaArticles(html) {
  const found = [];
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { for (const child of value) visit(child); return; }
    if (value['@type'] === 'Article' || Array.isArray(value['@type']) && value['@type'].includes('Article')) found.push(value);
    if (value['@graph']) visit(value['@graph']);
  }
  for (const match of html.matchAll(/<script\b[^>]*\btype\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[2])); } catch { /* Malformed schema cannot establish ownership. */ }
  }
  return found;
}

/** Upstream metadata can be regenerated independently of persistent article HTML.
 * Recover only an exact version emitted by this module, with corroborating HTML
 * ownership/schema and nonfuture dates. This is a build-history check, not a new
 * authorization or evidence of deployment, personal review, or a fresh update. */
function recoverOwnedArticle({ article, contentHash, previousHTML, release, marker, fingerprintField, now = Date.now() }) {
  if (!release || release.schema !== 1 || release.state !== 'owner_authorized_release_prepared' || release.author !== 'PC Part Performance' || release.humanReviewClaimed !== false || !Array.isArray(release.articles)) return null;
  if (!validDay(release.releaseDate) || release.releaseDate > localDay(now) || !validDate(release.ownerInstructionRecordedAt, now)) return null;
  const records = release.articles.filter(row => row?.id === article.id || row?.route === article.route);
  if (records.length !== 1) return null;
  const row = records[0];
  if (row.id !== article.id || row.route !== article.route || row.contentHash !== contentHash || row.title !== article.title || row.lifecycle?.humanReviewClaimed !== false || row.lifecycle?.humanEditorialReview !== null) return null;
  if (!validDate(row.datePublished, now) || row.dateModified != null && !validDate(row.dateModified, now)) return null;
  const published = Date.parse(row.datePublished), modified = row.dateModified == null ? published : Date.parse(row.dateModified);
  if (modified < published || localDay(modified) > release.releaseDate) return null;
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const owned = new RegExp('<article\\b[^>]*\\b' + escape(marker) + '\\s*=\\s*(["\'])' + escape(article.id) + '\\1', 'i');
  if (!owned.test(previousHTML) || /\bdata-program-draft\b/.test(previousHTML)) return null;
  const matches = schemaArticles(previousHTML).filter(s => s.url === DOMAIN + article.route && s.headline === article.title && s.author?.name === 'PC Part Performance');
  if (matches.length !== 1 || matches[0].datePublished !== row.datePublished || (matches[0].dateModified || null) !== (row.dateModified || null)) return null;
  return { title: article.title, description: article.description, editorialId: article.id,
    [fingerprintField]: contentHash, datePublished: row.datePublished, dateModified: row.dateModified || null,
    publicationAuthorized: true, noindex: false };
}

module.exports = { recoverOwnedArticle, validDate, schemaArticles };
