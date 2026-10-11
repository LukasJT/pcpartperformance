'use strict';
// Product IDs are identities, not names. A name match is only an audit candidate.
const decisions = require('../docs/program-2026-10-09/product-alias-decisions.json');
const referenceKeys = new Set(['productId', 'partId', 'parts', 'selected', 'comparison', 'cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan', 'cooler', 'owned', 'locked', 'reuse']);
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const copy = value => JSON.parse(JSON.stringify(value));

function createIdentityResolver(records, review = decisions) {
  const byId = new Map();
  for (const record of records) {
    if (!record || typeof record.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(record.id)) throw new Error('Invalid product ID');
    if (byId.has(record.id)) throw new Error('Duplicate product ID: ' + record.id);
    byId.set(record.id, record);
  }
  const aliases = new Map();
  for (const alias of review.aliases || []) {
    // Evidence-checked proposals are intentionally dormant until the owner reviews them.
    if (alias.decision !== 'confirmed_duplicate' || alias.review?.status !== 'approved' || alias.review?.kind !== 'human' || !alias.review?.reviewer || !alias.review?.date) continue;
    if (!byId.has(alias.from) || !byId.has(alias.to)) throw new Error('Alias endpoint not in catalog: ' + alias.from);
    if (alias.from === alias.to || aliases.has(alias.from)) throw new Error('Invalid alias: ' + alias.from);
    if (!Array.isArray(alias.evidence) || !alias.evidence.length || alias.scope !== 'exact_identity') throw new Error('Alias needs exact-identity evidence: ' + alias.from);
    if (!alias.evidence.every(url => { try { const parsed = new URL(url); return parsed.protocol === 'https:' && !parsed.username && !parsed.password; } catch { return false; } })) throw new Error('Alias evidence must use HTTPS source URLs: ' + alias.from);
    const a = byId.get(alias.from), b = byId.get(alias.to);
    if (a.cat !== b.cat || a.brand.toLowerCase() !== b.brand.toLowerCase()) throw new Error('Alias crosses manufacturer or category: ' + alias.from);
    const variantFields = ['sku', 'revision', 'memoryVariant', 'region'];
    for (const key of variantFields) {
      if (a[key] != null && b[key] != null && String(a[key]).toLowerCase() !== String(b[key]).toLowerCase()) throw new Error('Alias crosses ' + key + ': ' + alias.from);
    }
    for (const key of ['Memory', 'Storage capacity', 'Modules', 'Memory type', 'Socket', 'Form factor']) {
      if (a.specs?.[key] != null && b.specs?.[key] != null && a.specs[key] !== b.specs[key]) throw new Error('Alias crosses specification ' + key + ': ' + alias.from);
    }
    aliases.set(alias.from, alias.to);
  }
  for (const start of aliases.keys()) {
    const visited = new Set(); let id = start;
    while (aliases.has(id)) { if (visited.has(id)) throw new Error('Alias cycle: ' + start); visited.add(id); id = aliases.get(id); }
  }
  const canonicalId = id => {
    if (typeof id !== 'string' || !byId.has(id)) return null;
    let next = id; while (aliases.has(next)) next = aliases.get(next); return next;
  };
  const resolve = id => {
    const canonical = canonicalId(id);
    return canonical ? { requestedId: id, id: canonical, status: canonical === id ? 'known' : 'reviewed_alias', record: byId.get(canonical) } : { requestedId: id, id: null, status: 'unknown', record: null };
  };
  const migrateReferences = original => {
    const journal = [];
    const visit = (value, location, isReference) => {
      if (typeof value === 'string') {
        if (!isReference || !value) return value;
        const resolved = canonicalId(value);
        if (resolved && resolved !== value) { journal.push({ path: [...location], from: value, to: resolved }); return resolved; }
        return value; // Unknown IDs and empty slots survive for explicit repair in the UI.
      }
      if (Array.isArray(value)) return value.map((child, i) => visit(child, [...location, i], isReference));
      if (value && typeof value === 'object') {
        const output = {};
        for (const [key, child] of Object.entries(value)) {
          if (unsafeKeys.has(key)) throw new Error('Unsafe saved-data key');
          output[key] = visit(child, [...location, key], referenceKeys.has(key));
        }
        return output;
      }
      return value;
    };
    return { value: visit(original, [], Array.isArray(original)), journal, registryVersion: review.version };
  };
  const redirects = () => [...aliases.keys()].flatMap(from => {
    const target = '/learn/' + canonicalId(from) + '.html';
    return ['/learn/' + from, '/learn/' + from + '/', '/learn/' + from + '.html'].map(source => ({ source, target, status: 301, preserveQuery: true }));
  });
  return { resolve, canonicalId, migrateReferences, redirects, aliases, byId };
}

function rollbackReferences(current, journal) {
  const result = copy(current);
  for (const entry of [...journal].reverse()) {
    if (!Array.isArray(entry.path) || !entry.path.length || entry.path.some(key => unsafeKeys.has(String(key)))) throw new Error('Invalid rollback path');
    let parent = result;
    for (const key of entry.path.slice(0, -1)) { if (!parent || !Object.hasOwn(parent, key)) throw new Error('Rollback path changed'); parent = parent[key]; }
    const key = entry.path.at(-1);
    if (parent[key] !== entry.to) throw new Error('Rollback would overwrite a subsequent edit');
    parent[key] = entry.from;
  }
  return result;
}

module.exports = { createIdentityResolver, rollbackReferences, decisions };
