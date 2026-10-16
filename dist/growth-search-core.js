(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.PCP_SEARCH_CORE = api;
})(() => {
  'use strict';
  const types = new Set(['all', 'hardware', 'comparisons', 'guides', 'tools', 'reports', 'data']);
  const ignoredWords = new Set(['a', 'an', 'and', 'are', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'should', 'the', 'to', 'with', 'you', 'your']);
  const codeKeys = ['sku', 'mpn', 'partNumber', 'modelNumber', 'boxedPartNumber', 'trayPartNumber'];
  const textCache = new WeakMap();
  function normalize(value) {
    return String(value ?? '').slice(0, 2000).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u2018\u2019']/g, '').replace(/\bnvda\b/g, 'nvidia')
      .replace(/\bmothe[r]?bord\b/g, 'motherboard').replace(/\bryzan\b/g, 'ryzen')
      .replace(/\b(\d+)\s*(?:gb|g)\b/g, '$1 gb')
      .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
      .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const compact = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const strings = values => values.filter(value => typeof value === 'string' && value.trim());
  function safeRow(row) {
    return !!row && typeof row.title === 'string' && typeof row.url === 'string'
      && /^\/[a-zA-Z0-9_/.\-]+$/.test(row.url) && !row.url.includes('//')
      && !/(?:^|\/)\.{1,2}(?:\/|$)/.test(row.url);
  }
  function group(row) {
    const url = row.url || '';
    if (/comparison/i.test(row.kind || '') || url.startsWith('/compare/') || url.startsWith('/phones/compare/')) return 'comparisons';
    if (url.startsWith('/learn/') || url.startsWith('/phones/') && !url.includes('size-compare')) return 'hardware';
    if (url.startsWith('/news/')) return 'reports';
    if (url.startsWith('/blog/') || url === '/build-school/') return 'guides';
    if (url.startsWith('/data/') || /resource|methodology/i.test(row.kind || '')) return 'data';
    return 'tools';
  }
  function identifiers(row) {
    return [...new Set(strings([
      ...(Array.isArray(row.identifiers) ? row.identifiers : []),
      ...codeKeys.map(key => row[key]),
      ...codeKeys.map(key => row.identity?.[key])
    ]))];
  }
  function searchable(row) {
    if (textCache.has(row)) return textCache.get(row);
    const aliases = Array.isArray(row.aliases) ? strings(row.aliases) : [];
    const ids = identifiers(row);
    const title = normalize(row.title);
    const text = normalize([row.title, ...aliases, ...ids, row.kind || ''].join(' '));
    const result = { title, text, tokens: new Set(text.split(' ')), identifiers: ids.map(compact) };
    textCache.set(row, result); return result;
  }
  // One edit or adjacent transposition, only for complete alphabetic words.
  // Numbers, short fragments and SKU punctuation are never fuzzy matched.
  function oneLetterEdit(a, b) {
    if (!/^[a-z]{5,}$/.test(a) || !/^[a-z]{5,}$/.test(b) || Math.abs(a.length - b.length) > 1) return false;
    if (a === b) return true;
    if (a.length === b.length) {
      const differences = [];
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) differences.push(i);
      if (differences.length === 1) return true;
      return differences.length === 2 && differences[1] === differences[0] + 1
        && a[differences[0]] === b[differences[1]] && a[differences[1]] === b[differences[0]];
    }
    const shorter = a.length < b.length ? a : b, longer = a.length < b.length ? b : a;
    let first = 0;
    while (first < shorter.length && shorter[first] === longer[first]) first++;
    return shorter.slice(first) === longer.slice(first + 1);
  }
  function looksLikePartNumber(raw) {
    const value = String(raw).trim();
    if (/\s/.test(value) || /^(?:rtx|gtx|rx|ryzen|core|ddr)\d/i.test(value)) return false;
    return /^[a-z0-9-]+$/i.test(value) && compact(value).length >= 10
      && (value.match(/\d/g) || []).length >= 5 && /[a-z]/i.test(value);
  }
  function queryTokens(q) { return q.split(' ').filter(token => token && !ignoredWords.has(token)); }
  function lexicalMatch(row, raw) {
    const q = normalize(raw), fields = searchable(row);
    if (!q) return { score: 1, match: 'browse', reason: '' };
    if (fields.identifiers.includes(compact(raw))) return { score: 220, match: 'identifier', reason: 'Exact part number' };
    if (looksLikePartNumber(raw)) return { score: 0, match: '', reason: '' };
    const terms = queryTokens(q);
    if (!terms.length) return { score: 0, match: '', reason: '' };
    if (terms.every(term => fields.tokens.has(term))) {
      return { score: fields.title === q ? 100 : fields.title.endsWith(q) ? 80 : fields.title.includes(q) ? 60 : fields.text.includes(q) ? 40 : 20, match: 'exact_terms', reason: '' };
    }
    const missing = terms.filter(term => !fields.tokens.has(term));
    if (missing.length > 1 || !/^[a-z]{5,}$/.test(missing[0])) return { score: 0, match: '', reason: '' };
    if ([...fields.tokens].some(token => oneLetterEdit(missing[0], token))) {
      return { score: 10, match: 'letter_typo', reason: 'Similar spelling; model numbers unchanged' };
    }
    return { score: 0, match: '', reason: '' };
  }
  function intentMatches(raw) {
    const q = normalize(raw), tokens = new Set(q.split(' ')), found = [];
    const has = (...words) => words.some(word => tokens.has(word));
    const fit = has('fit', 'fits', 'clearance', 'room', 'long', 'large', 'big', 'space');
    if ((has('gpu', 'graphics', 'video') && fit) && !has('phone', 'laptop')) found.push({
      id: 'gpu_fit', label: 'GPU fit and case clearance', routes: ['/blog/will-a-graphics-card-fit-my-case/', '/compatibility/']
    });
    if (has('cooler', 'aio', 'radiator') && (fit || has('ram', 'mount', 'socket'))) found.push({
      id: 'cooler_fit', label: 'CPU cooler fit', routes: ['/blog/how-to-choose-a-cpu-cooler-that-fits/', '/compatibility/']
    });
    if ((has('bios', 'firmware') && has('cpu', 'processor', 'motherboard', 'board', 'support', 'update'))
      || has('cpu', 'processor') && has('motherboard', 'board') && has('support', 'supports', 'compatible', 'compatibility')) found.push({
      id: 'cpu_bios', label: 'CPU and BIOS support', routes: ['/blog/check-cpu-bios-support/', '/compatibility/']
    });
    if ((/\b(?:no display|no signal|black screen|blank screen)\b/.test(q) || /\b(?:screen|monitor)\b.*\b(?:blank|black)\b/.test(q))
      && !has('phone', 'iphone', 'android', 'laptop', 'tv', 'playstation', 'xbox', 'switch')) found.push({
      id: 'no_display', label: 'Safe no-display checks', routes: ['/blog/new-pc-no-display-safe-checks/', '/troubleshooting/']
    });
    if (has('upgrade', 'upgrading') && (has('first', 'which', 'should') || has('cpu') && has('gpu'))) found.push({
      id: 'upgrade_first', label: 'Choose what to upgrade first', routes: ['/blog/cpu-or-gpu-upgrade-for-gaming/', '/upgrade/']
    });
    return found;
  }
  function rank(row, q) { return lexicalMatch(row, q).score; }
  function search(rows, raw, type = 'all') {
    const q = String(raw ?? '').slice(0, 120), intents = intentMatches(q);
    const selected = types.has(type) ? type : 'all';
    const matches = new Map();
    for (const row of rows) {
      if (!safeRow(row) || selected !== 'all' && group(row) !== selected) continue;
      let match = lexicalMatch(row, q);
      for (const intent of intents) {
        const place = intent.routes.indexOf(row.url);
        if (place !== -1 && 160 - place * 10 > match.score) {
          match = { score: 160 - place * 10, match: 'intent', reason: intent.label };
        }
      }
      if (!match.score) continue;
      const old = matches.get(row.url);
      if (!old || old.score < match.score) matches.set(row.url, { row, ...match });
    }
    return [...matches.values()].sort((a, b) => b.score - a.score || a.row.title.localeCompare(b.row.title));
  }
  function enrichIndex(rows, records = [], profiles = []) {
    const parts = new Map(records.map(p => [p.id, p]));
    const identities = new Map(profiles.map(p => [p.id, p.identity || p]));
    return rows.map(row => {
      const id = row.url?.match(/^\/learn\/([a-zA-Z0-9_.-]+)\.html$/)?.[1];
      const record = parts.get(id), identity = identities.get(id);
      if (!record && !identity) return row;
      const ids = [...new Set(strings([
        ...identifiers(row), ...codeKeys.map(key => record?.[key]),
        ...codeKeys.map(key => record?.identity?.[key]), ...codeKeys.map(key => identity?.[key])
      ]))];
      return ids.length ? { ...row, identifiers: ids } : row;
    });
  }
  function displayTitle(title) { return String(title).replace(/^(AMD|Intel|NVIDIA|3dfx|MSI|ASUS|GIGABYTE)\s+\1\b\s*/i, '$1 '); }
  return { normalize, group, rank, search, displayTitle, safeRow, enrichIndex, oneLetterEdit, intentMatches };
});
