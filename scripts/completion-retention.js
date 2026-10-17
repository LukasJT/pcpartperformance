(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.PCP_RETENTION = api;
})(function () {
  'use strict';
  const KEY = 'pcp-completion-retention-v1', MAX_BYTES = 262144, MAX_COMPARISONS = 20, MAX_PURCHASES = 100;
  const SLOTS = ['cpu', 'board', 'gpu', 'ram', 'ssd', 'hdd', 'psu', 'case', 'fan', 'cooler'];
  const idOK = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(value);
  const textOK = (value, limit, empty = true) => typeof value === 'string' && value.length <= limit && (empty || value.trim().length > 0) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
  const bytes = value => new TextEncoder().encode(value).length;
  const timestamp = value => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
  const dateOnly = value => { if (value === null) return true; if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '2200-12-31') return false; const parsed = new Date(value + 'T12:00:00Z'); return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value; };
  const amountOK = value => value === null || typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1000000 && Math.abs(value * 100 - Math.round(value * 100)) < .000001;
  const https = value => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && value.length <= 1200 ? url.href : null; } catch { return null; } };
  const blank = () => ({ schema: 'pcp-completion-retention-v1', version: 1, comparisons: [], purchases: [] });
  const newID = prefix => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2, 10));
  function comparisonKey(parts) { return parts.map(part => typeof part === 'string' ? part : part.id).sort().join('|'); }
  function parseComparison(input) {
    if (!input || !idOK(input.id) || !textOK(input.name, 120, false) || !timestamp(input.savedAt) || !timestamp(input.updatedAt) || Date.parse(input.updatedAt) < Date.parse(input.savedAt) || typeof input.onlyDifferences !== 'boolean' || !Array.isArray(input.parts) || input.parts.length < 2 || input.parts.length > 4 || new Set(input.parts.map(part => part?.id)).size !== input.parts.length) throw Error('A saved comparison is invalid.');
    const parts = input.parts.map(part => {
      if (!part || !idOK(part.id) || !idOK(part.cat) || !textOK(part.name, 160, false) || !textOK(part.brand, 80) || part.source !== null && !https(part.source) || !Array.isArray(part.specs) || part.specs.length > 24) throw Error('A comparison product snapshot is invalid.');
      const fields = new Set();
      const specs = part.specs.map(spec => { if (!spec || !textOK(spec.key, 80, false) || fields.has(spec.key) || !textOK(spec.unit, 24) || spec.value !== null && !(typeof spec.value === 'number' && Number.isFinite(spec.value) && Math.abs(spec.value) <= 1e15 || typeof spec.value === 'boolean' || textOK(spec.value, 160))) throw Error('A saved specification is invalid.'); fields.add(spec.key); return { key: spec.key, unit: spec.unit, value: spec.value }; });
      return { id: part.id, cat: part.cat, name: part.name, brand: part.brand, source: part.source === null ? null : https(part.source), specs };
    });
    return { id: input.id, name: input.name, savedAt: input.savedAt, updatedAt: input.updatedAt, onlyDifferences: input.onlyDifferences, parts, basis: 'saved-catalog-specifications' };
  }
  function parsePurchase(input) {
    if (!input || !idOK(input.id) || !idOK(input.revisionId) || !idOK(input.plannedId) || input.actualId !== null && !idOK(input.actualId) || !textOK(input.actualName, 120, false) || !textOK(input.plannedName, 120, false) || !Number.isInteger(input.plannedQuantity) || input.plannedQuantity < 1 || input.plannedQuantity > 99 || !Number.isInteger(input.purchasedQuantity) || input.purchasedQuantity < 0 || input.purchasedQuantity > 99 || !Number.isInteger(input.ownedQuantity) || input.ownedQuantity < 0 || input.ownedQuantity + input.purchasedQuantity > 99 || !amountOK(input.unitAmount) || !['CA', 'US'].includes(input.region) || !textOK(input.merchant, 100) || !textOK(input.warrantyReference, 120) || !textOK(input.note, 500) || !textOK(input.reminderNote, 120) || !dateOnly(input.purchasedOn) || !dateOnly(input.warrantyUntil) || !dateOnly(input.remindOn) || typeof input.reminderDone !== 'boolean' || !timestamp(input.createdAt) || !timestamp(input.updatedAt) || Date.parse(input.updatedAt) < Date.parse(input.createdAt)) throw Error('A purchase record is invalid. Check quantities, amount and dates.');
    return Object.fromEntries(['id', 'revisionId', 'plannedId', 'plannedName', 'plannedQuantity', 'actualId', 'actualName', 'purchasedQuantity', 'ownedQuantity', 'unitAmount', 'region', 'merchant', 'purchasedOn', 'warrantyUntil', 'warrantyReference', 'remindOn', 'reminderNote', 'reminderDone', 'note', 'createdAt', 'updatedAt'].map(key => [key, input[key]]));
  }
  function parse(raw) {
    if (typeof raw === 'string' && bytes(raw) > MAX_BYTES) throw Error('Use a retention backup smaller than 256 KiB.');
    const input = typeof raw === 'string' ? JSON.parse(raw.replace(/^\uFEFF/, '')) : raw;
    if (!input || input.schema !== 'pcp-completion-retention-v1' || input.version !== 1 || !Array.isArray(input.comparisons) || input.comparisons.length > MAX_COMPARISONS || !Array.isArray(input.purchases) || input.purchases.length > MAX_PURCHASES) throw Error('Use a valid saved-comparisons and purchase-journal backup.');
    const comparisons = input.comparisons.map(parseComparison), purchases = input.purchases.map(parsePurchase);
    if (new Set(comparisons.map(row => row.id)).size !== comparisons.length || new Set(comparisons.map(row => comparisonKey(row.parts))).size !== comparisons.length || new Set(purchases.map(row => row.id)).size !== purchases.length) throw Error('The backup has duplicate record identities.');
    const result = { schema: input.schema, version: 1, comparisons, purchases };
    if (bytes(JSON.stringify(result)) > MAX_BYTES) throw Error('The local collection exceeds 256 KiB. Export and remove older records first.');
    return result;
  }
  function read(storage) { try { const raw = storage.getItem(KEY); return { available: true, state: raw ? parse(raw) : blank() }; } catch { return { available: false, state: blank(), error: 'Saved comparisons or purchase records could not be read. Existing data has not been overwritten.' }; } }
  function write(storage, candidate) { try { const state = parse(candidate); storage.setItem(KEY, JSON.stringify(state)); return { ok: true, state }; } catch (error) { return { ok: false, error: error?.message || 'Local saving is unavailable. Export a backup instead.' }; } }
  const priorities = ['Memory', 'Memory bandwidth', 'Board power', 'CPU cores', 'CPU threads', 'CPU TDP', 'Boost clock', 'Transfer rate', 'CAS latency', 'Storage capacity', 'Sequential read', 'Rated output', 'Cooler height', 'Fan size', 'Height', 'Width', 'Thickness'];
  function makeComparison(snapshot, now = new Date().toISOString(), id = newID('comparison')) {
    if (!snapshot || !Array.isArray(snapshot.parts) || snapshot.parts.length < 2 || snapshot.parts.length > 4) throw Error('Choose two to four exact products before saving.');
    const cleanText = (value, max) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
    const parts = snapshot.parts.map(part => {
      const data = { ...(part.specs || {}) }; if (part.architecture) data.Architecture = part.architecture; if (part.year) data['Release year'] = part.year;
      const fields = Object.keys(data).sort((a, b) => { const x = priorities.indexOf(a), y = priorities.indexOf(b); return (x < 0 ? 100 : x) - (y < 0 ? 100 : y) || a.localeCompare(b); }).slice(0, 24);
      const specs = fields.map(key => { const raw = data[key], value = typeof raw === 'number' ? Number.isFinite(raw) && Math.abs(raw) <= 1e15 ? raw : null : typeof raw === 'boolean' ? raw : typeof raw === 'string' ? cleanText(raw, 160) : null; return { key: cleanText(key, 80), unit: cleanText(snapshot.units?.[key], 24), value }; });
      return { id: part.id, cat: part.cat, name: cleanText(part.name, 160), brand: cleanText(part.brand, 80), source: https(part.source), specs };
    });
    return parseComparison({ id, name: cleanText(snapshot.name || parts.map(part => part.name).join(' vs '), 120), savedAt: now, updatedAt: now, onlyDifferences: snapshot.onlyDifferences === true, parts });
  }
  function saveComparison(storage, snapshot, now = new Date().toISOString()) {
    const current = read(storage); if (!current.available) return { ok: false, error: current.error };
    try { let comparison = makeComparison(snapshot, now), existing = current.state.comparisons.find(row => comparisonKey(row.parts) === comparisonKey(comparison.parts)); if (existing) comparison = { ...comparison, id: existing.id, savedAt: existing.savedAt }; const remaining = current.state.comparisons.filter(row => row.id !== comparison.id); if (remaining.length >= MAX_COMPARISONS) throw Error('You can save 20 comparisons. Export or remove an older one in My PC first.'); const result = write(storage, { ...current.state, comparisons: [comparison, ...remaining] }); return result.ok ? { ...result, comparison, updated: Boolean(existing) } : result; } catch (error) { return { ok: false, error: error.message }; }
  }
  function differences(comparison) {
    const keys = [...new Set(comparison.parts.flatMap(part => part.specs.map(spec => spec.key)))];
    const rows = keys.map(key => { const cells = comparison.parts.map(part => part.specs.find(spec => spec.key === key) || { key, value: null, unit: '' }), signatures = cells.map(cell => JSON.stringify([cell.value, cell.unit])); return { key, cells, missing: cells.some(cell => cell.value === null), differing: new Set(signatures).size > 1, unitsDiffer: new Set(cells.filter(cell => cell.value !== null).map(cell => cell.unit)).size > 1 }; });
    return rows.filter(row => row.differing).sort((a, b) => { const x = priorities.indexOf(a.key), y = priorities.indexOf(b.key); return (x < 0 ? 100 : x) - (y < 0 ? 100 : y) || a.key.localeCompare(b.key); });
  }
  function comparisonURL(comparison, origin = 'https://www.pcpartperformance.com') { const url = new URL('/compare/', origin); url.searchParams.set('mode', 'interactive'); url.searchParams.set('parts', comparison.parts.map(part => part.id).join(',')); if (comparison.onlyDifferences) url.searchParams.set('differences', '1'); return url.href; }
  function buildURL(part, quantity = 1, owned = false, origin = 'https://www.pcpartperformance.com') { const slot = SLOTS.indexOf(part.cat); if (slot < 0 || !idOK(part.id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null; const values = SLOTS.map(() => ''); values[slot] = Array(quantity).fill(part.id).join('~'); const url = new URL('/builder/', origin); url.searchParams.set('build', values.join(',')); if (owned) url.searchParams.set('owned', part.id); return url.href; }
  function putPurchase(state, input, now = new Date().toISOString()) { const current = parse(state), existing = current.purchases.find(row => row.id === input.id), record = parsePurchase({ ...input, id: input.id || newID('purchase'), createdAt: existing?.createdAt || now, updatedAt: now }); const purchases = existing ? current.purchases.map(row => row.id === record.id ? record : row) : [...current.purchases, record]; return parse({ ...current, purchases }); }
  function merge(left, right) { const current = parse(left), imported = parse(right), existingIDs = new Set(current.comparisons.map(row => row.id)), sets = new Set(current.comparisons.map(row => comparisonKey(row.parts))), purchaseIDs = new Set(current.purchases.map(row => row.id)); return parse({ ...current, comparisons: [...current.comparisons, ...imported.comparisons.filter(row => !existingIDs.has(row.id) && !sets.has(comparisonKey(row.parts)))], purchases: [...current.purchases, ...imported.purchases.filter(row => !purchaseIDs.has(row.id))] }); }
  function purchaseTotals(purchases, region) { let subtotal = 0, missing = 0, owned = 0, purchased = 0; for (const row of purchases.filter(row => row.region === region)) { owned += row.ownedQuantity; purchased += row.purchasedQuantity; if (row.purchasedQuantity && row.unitAmount === null) missing += row.purchasedQuantity; else subtotal += row.purchasedQuantity * (row.unitAmount || 0); } return { region, currency: region === 'US' ? 'USD' : 'CAD', subtotal: Math.round(subtotal * 100) / 100, missing, owned, purchased, complete: missing === 0, basis: 'user-entered-purchase-records' }; }
  function plannedSummary(revision, purchases) { const groups = new Map(); for (const [slot, ids] of Object.entries(revision.parts || {})) for (const id of ids) { const old = groups.get(id); if (old) old.quantity++; else groups.set(id, { id, slot, quantity: 1, ownedInPlan: (revision.owned || []).includes(id) }); } return [...groups.values()].map(group => { const records = purchases.filter(row => row.revisionId === revision.id && row.plannedId === group.id), acquired = records.reduce((sum, row) => sum + row.purchasedQuantity + row.ownedQuantity, 0); return { ...group, records, acquired, remaining: Math.max(0, group.quantity - acquired), extra: Math.max(0, acquired - group.quantity), differentModels: records.some(row => row.actualId !== group.id) }; }); }
  const localDay = (now = new Date()) => [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  function reminderState(record, today = localDay()) { if (!record.remindOn) return 'not-set'; if (record.reminderDone) return 'done'; return record.remindOn < today ? 'overdue' : record.remindOn === today ? 'today' : 'upcoming'; }
  return { KEY, MAX_BYTES, MAX_COMPARISONS, MAX_PURCHASES, SLOTS, blank, parse, read, write, comparisonKey, makeComparison, saveComparison, differences, comparisonURL, buildURL, putPurchase, merge, purchaseTotals, plannedSummary, reminderState, dateOnly };
});
