const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const offers = require('./program-offers.cjs');
let tests = 0;
function test(name, fn) { fn(); tests++; console.log('PASS ' + name); }
const now = Date.parse('2026-10-09T12:00:00Z');
const product = { id: 'fixture-exact-gpu', identity: { exact: true, sku: 'GPU-16G-OC', variant: 'OC', memoryVariant: '16 GB', revision: '1.0' } };
const quote = { productId: product.id, sku: 'GPU-16G-OC', variant: 'OC', memoryVariant: '16 GB', revision: '1.0', exactVariant: true, merchantId: 'fixture-retailer', merchant: 'Fixture retailer', url: 'https://example.com/products/exact-gpu', region: 'CA', currency: 'CAD', price: 500, condition: 'new', inStock: true, checkedAt: '2026-10-09T11:59:00Z', charges: { tax: 'excluded', shipping: 'excluded' }, source: { kind: 'verified-manual', publisher: 'Fixture retailer', url: 'https://example.com/products/exact-gpu', recordId: 'fixture-observation-1', redistributionAllowed: true } };
const policy = { product, now, region: 'CA' };
test('unknown price and stock remain null; no type coercion creates a price', () => {
  for (const price of ['', null, undefined, '0', false, NaN, -1]) assert.equal(offers.normalizeOffer({ ...quote, price }, policy).offer.price, null);
  assert.equal(offers.normalizeOffer({ ...quote, inStock: undefined }, policy).offer.inStock, null);
  assert.equal(offers.currentOffers([{ ...quote, inStock: undefined }], policy).cheapest, null);
  assert.equal(offers.normalizeOffer({ ...quote, price: 0 }, policy).offer.price, 0);
  assert.equal(offers.currentOffers([{ ...quote, price: 0 }], policy).cheapest, null);
  assert.equal(offers.normalizeOffer(null, policy).offer.productId, null);
});
test('only current sourced exact in-stock regional observations qualify', () => {
  const result = offers.currentOffers([quote], policy);
  assert.equal(result.cheapest.price, 500); assert.equal(result.includedMerchants, 1);
  assert(result.notClaimed.includes('all-retailer coverage'));
  for (const change of [{ sku: 'GPU-8G-OC' }, { variant: 'non-OC' }, { memoryVariant: '8 GB' }, { revision: '2.0' }, { productId: 'different-id' }, { exactVariant: false }, { region: 'US', currency: 'USD' }, { currency: 'USD' }, { condition: 'used' }, { condition: undefined }, { charges: {} }, { source: {} }, { source: { ...quote.source, redistributionAllowed: false } }, { merchantId: undefined }, { url: 'javascript:alert(1)' }, { url: 'https://user:pass@example.com/exact' }, { checkedAt: '2026-10-09T12:01:00Z' }, { checkedAt: '2026-10-09T11:44:59Z' }]) assert.equal(offers.currentOffers([{ ...quote, ...change }], policy).cheapest, null, JSON.stringify(change));
  assert.equal(offers.currentOffers([quote], { ...policy, product: { id: product.id, identity: { sku: quote.sku } } }).cheapest, null);
});
test('TTL cannot be relaxed beyond 15 minutes and explicit shorter expiry wins', () => {
  assert.throws(() => offers.currentOffers([quote], { ...policy, ttlMs: 900001 }), RangeError);
  assert.equal(offers.currentOffers([{ ...quote, checkedAt: '2026-10-09T11:45:00Z' }], policy).cheapest, null);
  assert.equal(offers.currentOffers([{ ...quote, expiresAt: '2026-10-09T11:59:59Z' }], policy).cheapest, null);
  assert.equal(offers.currentOffers([{ ...quote, expiresAt: '2026-10-09T12:30:00Z' }], policy).cheapest.validUntil, '2026-10-09T12:14:00.000Z');
  assert.equal(offers.currentOffers([{ ...quote, expiresAt: 'invalid' }], policy).cheapest, null);
});
test('stock evidence and preorder states never become available inventory', () => {
  for (const availability of ['unknown', 'preorder', 'backorder', 'out-of-stock']) assert.equal(offers.currentOffers([{ ...quote, inStock: undefined, availability }], policy).cheapest, null);
  assert.equal(offers.currentOffers([{ ...quote, availability: 'out-of-stock', inStock: true }], policy).cheapest, null);
  assert.equal(offers.currentOffers([{ ...quote, availabilityCheckedAt: '2026-10-09T11:40:00Z' }], policy).cheapest, null);
  assert.equal(offers.currentOffers([{ ...quote, availabilityCheckedAt: '2026-10-09T12:00:00Z' }], policy).cheapest, null);
});
test('later out-of-stock observations supersede earlier cheap snapshots', () => {
  const newer = { ...quote, inStock: false, checkedAt: '2026-10-09T11:59:30Z' };
  assert.equal(offers.currentOffers([quote, newer], policy).cheapest, null);
  const available = { ...newer, inStock: true, price: 550 };
  assert.equal(offers.currentOffers([quote, available], policy).cheapest.price, 550);
  const anotherMerchant = { ...quote, merchantId: 'second-retailer', merchant: 'Second retailer', price: 525 };
  assert.equal(offers.currentOffers([quote, available, anotherMerchant], policy).cheapest.merchantId, 'second-retailer');
});
test('identical observations deduplicate, conflicting duplicates are rejected', () => {
  assert.equal(offers.currentOffers([quote, { ...quote }], policy).offers.length, 1);
  const laterA = { ...quote, checkedAt: '2026-10-09T11:59:30Z', price: 490 }, laterB = { ...laterA, price: 600 };
  const result = offers.currentOffers([quote, laterA, laterB], policy);
  assert.equal(result.cheapest, null); assert(result.excluded.some(r => r.issues.includes('conflicting-duplicate-observation')));
  assert.equal(offers.priceHistory([laterA, laterB], policy).points.length, 0);
});
test('tax/shipping basis is explicit and different bases are not ranked together', () => {
  const delivered = { ...quote, merchantId: 'delivered-store', price: 480, charges: { tax: 'included', shipping: 'included' } };
  assert.equal(offers.currentOffers([quote, delivered], policy).cheapest.price, 500);
  assert.equal(offers.currentOffers([quote, delivered], { ...policy, chargeBasis: delivered.charges }).cheapest.price, 480);
  assert.equal(offers.priceHistory([delivered], policy).observedAvailableMinimum, null);
  assert.throws(() => offers.currentOffers([quote], { ...policy, chargeBasis: { tax: 'unknown', shipping: 'unknown' } }), RangeError);
});
test('history contains actual points, expired observations, stock states and gaps only', () => {
  const old = { ...quote, price: 450, checkedAt: '2026-09-01T12:00:00Z' }, outOfStock = { ...quote, price: 200, inStock: false, checkedAt: '2026-10-01T12:00:00Z' }, unknownStock = { ...quote, price: 100, inStock: undefined, checkedAt: '2026-10-08T12:00:00Z' };
  const result = offers.priceHistory([quote, old, outOfStock, unknownStock], policy);
  assert.equal(result.points.length, 4); assert.equal(result.points[0].price, 450); assert.equal(result.observedAvailableMinimum, 450);
  assert.equal(result.gaps.length, 2); assert.equal(result.interpolation, false); assert.equal(result.continuousCoverage, false);
  assert.equal(offers.priceHistory([old], { ...policy, from: '2026-10-01T00:00:00Z' }).points.length, 0);
  assert.throws(() => offers.priceHistory([old], { ...policy, from: '2026-02-30T00:00:00Z' }), RangeError);
});
test('fair-deal comparison is exact-region arithmetic without a deal rating', () => {
  const userQuote = { ...quote, price: 530 }, result = offers.fairDealComparison({ quote: userQuote, records: [quote], ...policy });
  assert.equal(result.comparable, true); assert.equal(result.differenceFromCurrentItemMinimum, 30); assert.equal(result.dealRating, null);
  for (const mutation of [{ currency: 'USD' }, { sku: 'different' }, { memoryVariant: '8 GB' }, { charges: {} }]) assert.equal(offers.fairDealComparison({ quote: { ...userQuote, ...mutation }, records: [quote], ...policy }).differenceFromCurrentItemMinimum, null);
  assert.equal(offers.fairDealComparison({ quote: userQuote, records: [], ...policy }).differenceFromCurrentItemMinimum, null);
});
test('retained builds use actual saved observations, quantities and ownership', () => {
  const old = { ...quote, price: 450, checkedAt: '2026-09-01T12:00:00Z' }, result = offers.retainedBuildChanges({ items: [{ productId: product.id, quantity: 2, owned: false }, { productId: 'owned-id', quantity: 1, owned: true }], products: [product], savedOffers: [old], currentRecords: [quote], now, region: 'CA' });
  assert.equal(result.previousKnownSubtotal, 900); assert.equal(result.currentKnownSubtotal, 1000); assert.equal(result.completeDelta, 100); assert.equal(result.owned, 1);
  const missing = offers.retainedBuildChanges({ items: [{ productId: product.id, quantity: 2, owned: false }, { productId: 'missing-id', quantity: 1, owned: false }], products: [product], savedOffers: [old], currentRecords: [quote], now, region: 'CA' });
  assert.equal(missing.knownSubsetDelta, 100); assert.equal(missing.completeDelta, null); assert.equal(missing.complete, false); assert.equal(missing.missingCurrent, 1); assert.equal(missing.missingPrevious, 1);
  const noSnapshot = offers.retainedBuildChanges({ items: [{ productId: product.id, quantity: 1, owned: false }], products: [product], savedOffers: [], currentRecords: [quote], now, region: 'CA' });
  assert.equal(noSnapshot.completeDelta, null); assert.equal(noSnapshot.previousKnownSubtotal, 0); assert.equal(noSnapshot.missingPrevious, 1);
});
test('changes never compare different currencies or unknown historical charge bases', () => {
  const old = { ...quote, price: 450, charges: {}, checkedAt: '2026-09-01T12:00:00Z' }, input = { items: [{ productId: product.id, quantity: 1, owned: false }], products: [product], savedOffers: [old], currentRecords: [quote], now, region: 'CA' };
  assert.equal(offers.retainedBuildChanges(input).completeDelta, null);
  assert.equal(offers.retainedBuildChanges({ ...input, savedOffers: [{ ...old, region: 'US', currency: 'USD' }] }).missingPrevious, 1);
});
test('record limits and invalid build inputs fail explicitly rather than truncating', () => {
  assert.throws(() => offers.currentOffers(Array(5001).fill(quote), policy), RangeError);
  assert.throws(() => offers.currentOffers({}, policy), TypeError);
  assert.throws(() => offers.currentOffers([quote], { ...policy, region: 'GB' }), RangeError);
  assert.throws(() => offers.retainedBuildChanges({ items: [{ productId: product.id, quantity: 0, owned: false }] }), TypeError);
  assert.throws(() => offers.retainedBuildChanges({ items: Array(101).fill({}) }), RangeError);
});
test('UMD browser policy runs without network or Node dependencies', () => {
  const context = { URL }; vm.createContext(context); vm.runInContext(fs.readFileSync('scripts/program-offers.cjs', 'utf8'), context);
  assert.equal(context.PCP_OFFER_RULES.VERSION, offers.VERSION);
  assert.equal(context.PCP_OFFER_RULES.currentOffers([quote], policy).cheapest.price, 500);
});
test('legacy checked-price rows cannot silently become current exact stock evidence', () => {
  const legacy = JSON.parse(fs.readFileSync('dist/prices.json', 'utf8')).offers;
  const result = offers.currentOffers(legacy, policy); assert.equal(result.offers.length, 0);
  assert(result.excluded.every(r => r.issues.includes('missing-source-record') && r.issues.includes('variant-match-unconfirmed')));
});
console.log(`${tests} offer policy behavior tests passed.`);
