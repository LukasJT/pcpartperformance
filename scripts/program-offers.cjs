/* Pure offer and history policy. No scraping, network requests, storage or jobs.
 * Callers must supply verified observations and reviewed exact product identities. */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else globalThis.PCP_OFFER_RULES = api;
})(function () {
  'use strict';
  const VERSION = '2026-10-09.1', DEFAULT_TTL_MS = 900000, MAX_OBSERVATIONS = 5000, MAX_ITEMS = 100;
  const SOURCE_KINDS = ['verified-manual', 'authorized-retailer-api', 'authorized-retailer-feed'];
  const CONDITIONS = ['new', 'used', 'refurbished', 'open-box'];
  const text = (value, max = 160) => typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, '').trim().slice(0, max) : null;
  const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10000000 ? value : null;
  const date = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value)) && Number(value.slice(8, 10)) <= new Date(Date.UTC(Number(value.slice(0, 4)), Number(value.slice(5, 7)), 0)).getUTCDate() ? new Date(value).toISOString() : null;
  const safeURL = value => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password ? u.href : null; } catch { return null; } };
  const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
  function bounded(value, name, max = MAX_OBSERVATIONS) {
    if (!Array.isArray(value)) throw new TypeError(name + ' must be an array');
    if (value.length > max) throw new RangeError(name + ' exceeds the ' + max + ' record limit');
    return value;
  }
  function options(input = {}) {
    const region = input.region || 'CA';
    if (!['CA', 'US'].includes(region)) throw new RangeError('Region must be CA or US');
    const now = input.now === undefined ? Date.now() : input.now;
    if (typeof now !== 'number' || !Number.isFinite(now)) throw new TypeError('now must be a finite timestamp');
    const ttlMs = input.ttlMs === undefined ? DEFAULT_TTL_MS : input.ttlMs;
    if (!Number.isInteger(ttlMs) || ttlMs < 1 || ttlMs > DEFAULT_TTL_MS) throw new RangeError('Current-offer TTL must be 1 to 900000 milliseconds');
    const condition = input.condition || 'new';
    if (!CONDITIONS.includes(condition)) throw new RangeError('A supported product condition is required');
    const chargeBasis = input.chargeBasis || { tax: 'excluded', shipping: 'excluded' };
    if (!['included', 'excluded'].includes(chargeBasis.tax) || !['included', 'excluded'].includes(chargeBasis.shipping)) throw new RangeError('A known tax/shipping charge basis is required for price comparison');
    return { region, currency: region === 'US' ? 'USD' : 'CAD', now, ttlMs, condition, chargeBasis: { tax: chargeBasis.tax, shipping: chargeBasis.shipping } };
  }
  function productIdentity(product = {}) {
    const identity = product.identity || product;
    return { productId: text(product.id || product.productId, 120), exact: identity.exact === true || identity.exactVariant === true, sku: text(identity.sku || identity.mpn || identity.model, 120), variant: text(identity.variant), memoryVariant: text(identity.memoryVariant), revision: text(identity.revision) };
  }
  function normalizeOffer(raw = {}, { product, now = Date.now(), ttlMs = DEFAULT_TTL_MS } = {}) {
    options({ now, ttlMs });
    raw = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const issues = [], add = code => issues.push(code), productId = text(raw.productId || raw.id, 120);
    const sourceRaw = raw.source && typeof raw.source === 'object' ? raw.source : {};
    const source = { kind: SOURCE_KINDS.includes(sourceRaw.kind) ? sourceRaw.kind : null, url: safeURL(sourceRaw.url), publisher: text(sourceRaw.publisher), recordId: text(sourceRaw.recordId, 120), redistributionAllowed: sourceRaw.redistributionAllowed === true };
    const checkedAt = date(raw.checkedAt), availabilityCheckedAt = date(raw.availabilityCheckedAt || raw.checkedAt), explicitExpiry = raw.expiresAt === undefined || raw.expiresAt === null ? null : date(raw.expiresAt);
    let availability = ['in-stock', 'out-of-stock', 'preorder', 'backorder', 'unknown'].includes(raw.availability) ? raw.availability : raw.inStock === true ? 'in-stock' : raw.inStock === false ? 'out-of-stock' : 'unknown';
    const inStock = availability === 'in-stock' ? true : availability === 'out-of-stock' ? false : null;
    if (raw.availability !== undefined && !['in-stock', 'out-of-stock', 'preorder', 'backorder', 'unknown'].includes(raw.availability)) add('invalid-availability');
    if (raw.inStock !== undefined && raw.inStock !== null && typeof raw.inStock !== 'boolean') add('invalid-stock');
    if (typeof raw.inStock === 'boolean' && raw.availability !== undefined && raw.inStock !== inStock) add('conflicting-stock-evidence');
    const offer = {
      productId, sku: text(raw.sku || raw.model || raw.mpn, 120), variant: text(raw.variant), memoryVariant: text(raw.memoryVariant), revision: text(raw.revision), exactVariant: raw.exactVariant === true,
      merchantId: text(raw.merchantId, 120), merchant: text(raw.merchant || raw.store), url: safeURL(raw.url), region: ['CA', 'US'].includes(raw.region) ? raw.region : null, currency: ['CAD', 'USD'].includes(raw.currency) ? raw.currency : null,
      price: amount(raw.price), condition: CONDITIONS.includes(raw.condition) ? raw.condition : null,
      availability, inStock, checkedAt, availabilityCheckedAt, expiresAt: explicitExpiry,
      validUntil: checkedAt && availabilityCheckedAt ? new Date(Math.min(Date.parse(checkedAt) + ttlMs, Date.parse(availabilityCheckedAt) + ttlMs, explicitExpiry ? Date.parse(explicitExpiry) : Infinity)).toISOString() : null,
      charges: { tax: ['included', 'excluded'].includes(raw.charges?.tax) ? raw.charges.tax : 'unknown', shipping: ['included', 'excluded'].includes(raw.charges?.shipping) ? raw.charges.shipping : 'unknown' }, source
    };
    if (!productId || !/^[a-zA-Z0-9_-]{1,120}$/.test(productId)) add('invalid-product-id');
    if (!offer.merchant || !offer.merchantId) add('missing-merchant-identity');
    if (!offer.url) add('missing-safe-store-link');
    if (!offer.region || offer.currency !== (offer.region === 'CA' ? 'CAD' : 'USD')) add('region-currency-mismatch');
    if (offer.price === null) add('missing-price');
    if (!offer.condition) add('unknown-condition');
    if (!checkedAt || Date.parse(checkedAt) > now) add('invalid-observation-time');
    if (!availabilityCheckedAt || Date.parse(availabilityCheckedAt) > now) add('invalid-stock-time');
    if (checkedAt && availabilityCheckedAt && Date.parse(availabilityCheckedAt) > Date.parse(checkedAt)) add('stock-newer-than-price-observation');
    if (raw.expiresAt !== undefined && raw.expiresAt !== null && (!explicitExpiry || (checkedAt && Date.parse(explicitExpiry) <= Date.parse(checkedAt)))) add('invalid-expiry');
    if (!source.kind || !source.url || !source.publisher || !source.recordId) add('missing-source-record');
    if (!source.redistributionAllowed) add('redistribution-unconfirmed');
    if (!offer.exactVariant) add('variant-match-unconfirmed');
    const expected = productIdentity(product);
    if (!expected.productId || !expected.exact || !expected.sku) add('catalog-exact-identity-unconfirmed');
    if (expected.productId && productId !== expected.productId) add('product-id-mismatch');
    for (const key of ['sku', 'variant', 'memoryVariant', 'revision']) if (expected[key] !== null && offer[key] !== expected[key]) add('identity-' + key + '-mismatch');
    offer.identity = expected;
    return { offer, issues: [...new Set(issues)] };
  }
  function observationKey(offer) { return JSON.stringify([offer.productId, offer.sku, offer.variant, offer.memoryVariant, offer.revision, offer.merchantId, offer.region, offer.currency, offer.condition, offer.checkedAt]); }
  function priceSignature(offer) { return JSON.stringify([offer.price, offer.availability, offer.availabilityCheckedAt, offer.charges]); }
  function observations(records, product, policy) {
    const normalized = bounded(records, 'observations').map(raw => normalizeOffer(raw, { product, now: policy.now, ttlMs: policy.ttlMs }));
    const groups = new Map();
    for (const row of normalized) { const key = observationKey(row.offer), group = groups.get(key) || []; group.push(row); groups.set(key, group); }
    const accepted = [], rejected = [];
    for (const group of groups.values()) {
      if (new Set(group.map(row => priceSignature(row.offer))).size > 1) { for (const row of group) rejected.push({ ...row, issues: [...new Set([...row.issues, 'conflicting-duplicate-observation'])] }); continue; }
      const valid = group.find(row => row.issues.length === 0);
      if (valid) accepted.push(valid.offer);
      for (const row of group.filter(row => row.issues.length > 0)) rejected.push(row);
    }
    return { accepted, rejected };
  }
  function currentOffers(records, { product, ...input } = {}) {
    const policy = options(input), data = observations(records, product, policy), eligible = [], excluded = [...data.rejected];
    for (const offer of data.accepted) {
      const issues = [];
      if (offer.region !== policy.region || offer.currency !== policy.currency) issues.push('different-region-currency');
      if (offer.condition !== policy.condition) issues.push('different-condition');
      if (offer.price <= 0) issues.push('nonpositive-current-price');
      if (offer.charges.tax !== policy.chargeBasis.tax || offer.charges.shipping !== policy.chargeBasis.shipping) issues.push('different-or-unknown-charge-basis');
      if (offer.inStock !== true) issues.push('stock-not-confirmed-available');
      if (!offer.validUntil || policy.now >= Date.parse(offer.validUntil)) issues.push('expired-current-offer');
      if (issues.length) excluded.push({ offer, issues }); else eligible.push(offer);
    }
    // A later snapshot supersedes an older one from the same seller and condition.
    const latest = new Map();
    const expected = productIdentity(product), recent = [...data.accepted, ...data.rejected.filter(row => row.issues.includes('conflicting-duplicate-observation')).map(row => row.offer)];
    for (const offer of recent.filter(o => o.productId === expected.productId && o.sku === expected.sku && o.region === policy.region && o.currency === policy.currency && o.condition === policy.condition && o.checkedAt && Date.parse(o.checkedAt) <= policy.now)) {
      const key = offer.merchantId, previous = latest.get(key);
      if (!previous || Date.parse(offer.checkedAt) > Date.parse(previous.checkedAt)) latest.set(key, offer);
    }
    const offers = eligible.filter(o => latest.get(o.merchantId) === o).sort((a, b) => a.price - b.price || a.merchant.localeCompare(b.merchant));
    for (const offer of eligible.filter(o => latest.get(o.merchantId) !== o)) excluded.push({ offer, issues: ['superseded-observation'] });
    return { version: VERSION, productId: productIdentity(product).productId, region: policy.region, currency: policy.currency, condition: policy.condition, chargeBasis: policy.chargeBasis, offers, excluded, observedMerchants: [...new Set(data.accepted.filter(o => o.region === policy.region && o.condition === policy.condition).map(o => o.merchantId))].length, includedMerchants: new Set(offers.map(o => o.merchantId)).size, cheapest: offers[0] || null, basis: 'lowest-item-price-among-included-eligible-offers', excludedCharges: ['tax unless explicitly included', 'shipping unless explicitly included'], notClaimed: ['all-retailer coverage', 'lowest delivered total', 'live quote', 'reservation of stock'] };
  }
  function cheapestOffer(records, input) { return currentOffers(records, input).cheapest; }
  function priceHistory(records, { product, from, to, gapMs = 86400000, ...input } = {}) {
    const policy = options(input), data = observations(records, product, policy);
    if (!Number.isInteger(gapMs) || gapMs < 1 || gapMs > 366 * 86400000) throw new RangeError('History gap threshold is invalid');
    const fromDate = from === undefined ? null : date(from), toDate = to === undefined ? null : date(to);
    if (from !== undefined && !fromDate || to !== undefined && !toDate || fromDate && toDate && Date.parse(fromDate) > Date.parse(toDate)) throw new RangeError('History date range is invalid');
    const points = data.accepted.filter(o => o.region === policy.region && o.currency === policy.currency && o.condition === policy.condition && (!fromDate || Date.parse(o.checkedAt) >= Date.parse(fromDate)) && (!toDate || Date.parse(o.checkedAt) <= Date.parse(toDate))).sort((a, b) => Date.parse(a.checkedAt) - Date.parse(b.checkedAt) || a.merchantId.localeCompare(b.merchantId));
    const series = new Map();
    for (const p of points) { const rows = series.get(p.merchantId) || []; rows.push(p); series.set(p.merchantId, rows); }
    const gaps = [];
    for (const [merchantId, rows] of series) for (let i = 1; i < rows.length; i++) { const elapsed = Date.parse(rows[i].checkedAt) - Date.parse(rows[i - 1].checkedAt); if (elapsed > gapMs) gaps.push({ merchantId, from: rows[i - 1].checkedAt, to: rows[i].checkedAt, elapsedMs: elapsed }); }
    const availablePoints = points.filter(p => p.inStock === true && p.price > 0 && p.charges.tax === policy.chargeBasis.tax && p.charges.shipping === policy.chargeBasis.shipping);
    return { productId: productIdentity(product).productId, region: policy.region, currency: policy.currency, condition: policy.condition, chargeBasis: policy.chargeBasis, points, gaps, rejected: data.rejected, firstObservation: points[0]?.checkedAt || null, lastObservation: points.at(-1)?.checkedAt || null, observationCount: points.length, comparableObservationCount: availablePoints.length, observedAvailableMinimum: availablePoints.length ? Math.min(...availablePoints.map(p => p.price)) : null, basis: 'recorded-observations-only', continuousCoverage: false, interpolation: false, boundaryCoverage: 'No observation implies availability or price before, between or after its recorded timestamp.' };
  }
  function fairDealComparison({ quote, records = [], product, ...input } = {}) {
    const policy = options(input), current = currentOffers(records, { product, ...policy }), history = priceHistory(records, { product, ...policy }), quotePrice = amount(quote?.price);
    const expected = productIdentity(product), comparable = !!(quotePrice !== null && expected.exact && expected.sku && quote?.currency === policy.currency && quote?.region === policy.region && quote?.condition === policy.condition && quote?.productId === expected.productId && quote?.exactVariant === true && ['sku', 'variant', 'memoryVariant', 'revision'].every(key => expected[key] === null || quote?.[key] === expected[key]) && quote?.charges?.tax === policy.chargeBasis.tax && quote?.charges?.shipping === policy.chargeBasis.shipping);
    return { comparable, quotePrice, currentMinimum: current.cheapest?.price ?? null, differenceFromCurrentItemMinimum: comparable && current.cheapest ? money(quotePrice - current.cheapest.price) : null, observedAvailableMinimum: history.observedAvailableMinimum, historyFrom: history.firstObservation, historyTo: history.lastObservation, current, basis: 'explicit-quote-versus-included-item-prices', reason: comparable ? current.cheapest ? 'A calculated item-price difference; delivery charges and coverage may differ.' : 'No eligible current offer for this exact product.' : 'Confirm exact identity, region, currency and condition before comparing.', dealRating: null };
  }
  function retainedBuildChanges({ items = [], savedOffers = [], currentRecords = [], products = [], ...input } = {}) {
    bounded(items, 'items', MAX_ITEMS); bounded(savedOffers, 'savedOffers'); bounded(currentRecords, 'currentRecords'); bounded(products, 'products', MAX_OBSERVATIONS);
    const policy = options(input), catalog = new Map(products.map(p => [productIdentity(p).productId, p])), rows = [];
    let previousKnownSubtotal = 0, currentKnownSubtotal = 0, knownSubsetDelta = 0, comparableItems = 0, missingPrevious = 0, missingCurrent = 0, owned = 0;
    for (const item of items) {
      if (!item || typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || typeof item.owned !== 'boolean') throw new TypeError('Build items require productId, quantity 1 to 99 and an owned boolean');
      if (item.owned) { owned += item.quantity; rows.push({ productId: item.productId, quantity: item.quantity, owned: true, previous: null, current: null, difference: null, reason: 'Owned parts are excluded from new spending.' }); continue; }
      const product = catalog.get(item.productId), prior = priceHistory(savedOffers.filter(o => (o.productId || o.id) === item.productId), { product, ...policy }).points.filter(o => o.inStock === true && o.price > 0), latestTime = prior.length ? prior.at(-1).checkedAt : null;
      const previous = prior.filter(o => o.checkedAt === latestTime).sort((a, b) => a.price - b.price)[0] || null;
      const current = currentOffers(currentRecords.filter(o => (o.productId || o.id) === item.productId), { product, ...policy }).cheapest;
      // Saved snapshots have their own historical time and basis; never derive them from a build's saved date.
      const sameBasis = previous && current && previous.charges.tax !== 'unknown' && previous.charges.shipping !== 'unknown' && previous.charges.tax === current.charges.tax && previous.charges.shipping === current.charges.shipping;
      const difference = sameBasis ? money((current.price - previous.price) * item.quantity) : null;
      if (previous) previousKnownSubtotal += previous.price * item.quantity; else missingPrevious += item.quantity;
      if (current) currentKnownSubtotal += current.price * item.quantity; else missingCurrent += item.quantity;
      if (difference !== null) { knownSubsetDelta += difference; comparableItems += item.quantity; }
      rows.push({ productId: item.productId, quantity: item.quantity, owned: false, previous, current, difference, reason: !previous ? 'No preserved eligible historical observation.' : !current ? 'No eligible current offer.' : !sameBasis ? 'Price charge bases differ.' : 'Calculated change between two observed item prices, potentially from different included merchants.' });
    }
    const purchaseItems = items.reduce((n, i) => n + (i.owned ? 0 : i.quantity), 0), complete = purchaseItems > 0 && comparableItems === purchaseItems;
    return { rows, region: policy.region, currency: policy.currency, owned, purchaseItems, missingPrevious, missingCurrent, comparableItems, previousKnownSubtotal: money(previousKnownSubtotal), currentKnownSubtotal: money(currentKnownSubtotal), knownSubsetDelta: comparableItems ? money(knownSubsetDelta) : null, completeDelta: complete ? money(knownSubsetDelta) : null, complete, basis: 'preserved-observation-versus-current-included-offer', excluded: ['unpriced items', 'tax unless included', 'shipping unless included', 'items outside component picker'] };
  }
  return { VERSION, DEFAULT_TTL_MS, MAX_OBSERVATIONS, MAX_ITEMS, SOURCE_KINDS, productIdentity, normalizeOffer, currentOffers, cheapestOffer, priceHistory, fairDealComparison, retainedBuildChanges, safeURL };
});
