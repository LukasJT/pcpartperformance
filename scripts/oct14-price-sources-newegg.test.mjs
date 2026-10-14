import assert from 'node:assert/strict';
import { NEWEGG_PUBLIC_TARGET as target, parseNeweggOriginalState, fetchNeweggPublicTarget } from './oct14-price-sources-newegg.mjs';
const item = { Item: '19-113-877', Model: '100-100001084WOF', CountryCode: 'USA', FinalPrice: 444, Instock: true, IsActivated: true, PriceHideMark: '0', Seller: { SellerId: '', SellerName: null }, Description: { ProductName: 'AMD Ryzen 7 9800X3D 8-Core 5.2 GHz' } };
const html = value => '<script>window.__initialState__=' + JSON.stringify({ ItemDetail: value }) + ';</script>';
const now = Date.parse('2026-10-14T16:00:00Z');
const tests = [
  ['actual-shape US price preserved with unknown condition', () => { const result = parseNeweggOriginalState(html(item), target, now); assert.equal(result.price, 444); assert.equal(result.currency, 'USD'); assert.equal(result.inStock, true); assert.equal(result.condition, 'unknown'); assert.equal(result.eligibleForNewPurchaseMinimum, false); }],
  ['explicit supported new-condition becomes eligible', () => { const copy = { ...item, ItemCondition: 'New' }; assert.equal(parseNeweggOriginalState(html(copy), target, now).eligibleForNewPurchaseMinimum, true); }],
  ['marketplace offer rejected despite same MPN', () => { const copy = structuredClone(item); copy.Item = '9SIC0X3KK06706'; copy.Seller.SellerId = 'C0X3'; assert.throws(() => parseNeweggOriginalState(html(copy), target, now), /identity/); }],
  ['country and currency change rejected', () => { for (const copy of [{ ...item, CountryCode: 'CAN' }, { ...item, CurrencyCode: 'CAD' }]) assert.throws(() => parseNeweggOriginalState(html(copy), target, now), /currency/); }],
  ['missing first-party seller marker rejected', () => { const copy = structuredClone(item); delete copy.Seller.SellerId; assert.throws(() => parseNeweggOriginalState(html(copy), target, now), /seller/); }],
  ['unknown availability remains null', () => { const copy = { ...item }; delete copy.Instock; assert.equal(parseNeweggOriginalState(html(copy), target, now).inStock, null); }],
  ['wrong model, duplicate state and executable script rejected', () => { assert.throws(() => parseNeweggOriginalState(html({ ...item, Model: '100-100000910WOF' }), target, now), /identity/); assert.throws(() => parseNeweggOriginalState(html(item) + html(item), target, now), /ambiguous/); assert.throws(() => parseNeweggOriginalState('<script>window.__initialState__=process.exit();</script>', target, now), /invalid/); }],
  ['restricted price and malformed stock rejected', () => { assert.throws(() => parseNeweggOriginalState(html({ ...item, PriceHideMark: '1' }), target, now), /restricted/); assert.throws(() => parseNeweggOriginalState(html({ ...item, Instock: 'true' }), target, now), /stock/); }]
];
for (const [name, fn] of tests) { fn(); console.log('PASS ' + name); }
await fetchNeweggPublicTarget(target, { now, fetchImpl: async (_url, options) => { assert.equal(options.redirect, 'manual'); assert.equal(options.method, 'GET'); return new Response(html(item), { headers: { 'Content-Type': 'text/html' } }); } });
await assert.rejects(() => fetchNeweggPublicTarget(target, { now, fetchImpl: async () => new Response('restricted', { status: 403 }) }), /restricted/);
let redirectCalls=0;
await assert.rejects(() => fetchNeweggPublicTarget(target, { now, fetchImpl: async () => { redirectCalls++; return new Response(null, { status: 303, headers: { Location: 'https://www.newegg.com/access-check?token=private-value' } }); } }), failure => failure.code==='source_redirect_requires_review' && !JSON.stringify(failure.diagnostic).includes('private-value'));
assert.equal(redirectCalls,1);
console.log(JSON.stringify({ passed: tests.length + 3, syntheticProviderFixtures: true, realNewConditionClaimed: false }));
