import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { COMPLETION_PRICE_TARGETS, parseCorsairProductJSONLD, fetchCorsairPublicTarget, fetchCompletionPriceTarget, validateCompletionPriceTarget } from './completion-price-expansion.mjs';
import { parseCanadaComputers } from './oct14-price-sources.mjs';

const directory = new URL('./fixtures/completion-price-expansion/', import.meta.url);
const fixtures = await Promise.all((await fs.readdir(directory)).filter(file => file.endsWith('.json')).map(async file => JSON.parse(await fs.readFile(new URL(file, directory), 'utf8'))));
const getFixture = target => fixtures.find(row => row.productId === target.productId && row.merchantId === target.merchantId && row.region === target.region);
const htmlFor = products => '<script type="application/ld+json">' + JSON.stringify(products) + '</script>';
const us = COMPLETION_PRICE_TARGETS.find(row => row.region === 'US');
const fixture = getFixture(us);
const observed = Date.parse(fixture.checkedAt);
const original = structuredClone(fixture.products[0]);
const changed = fn => { const product = structuredClone(original); fn(product); return htmlFor(product); };

test('all six fixed exact targets have actual persisted HTTP200 source fragments', () => {
  assert.equal(COMPLETION_PRICE_TARGETS.length, 6);
  for (const target of COMPLETION_PRICE_TARGETS) {
    assert.deepEqual(validateCompletionPriceTarget({ ...target }), target);
    const record = getFixture(target);
    assert.equal(record.responseStatus,200);
    assert.equal(record.sourceUrl,target.listingUrl);
    assert.match(record.responseSHA256,/^[a-f0-9]{64}$/);
    assert.equal(record.products.length,1);
    const parsed = target.adapter === 'corsair-product-jsonld' ? parseCorsairProductJSONLD(htmlFor(record.products),target,Date.parse(record.checkedAt)) : parseCanadaComputers(htmlFor(record.products),target,Date.parse(record.checkedAt));
    assert.equal(parsed.sku,target.sku);
    assert.equal(parsed.region,target.region);
    assert.equal(parsed.currency,target.currency);
    assert.equal(parsed.source.url,target.listingUrl);
    assert.equal(parsed.checkedAt,record.checkedAt);
    assert.equal(Date.parse(parsed.expiresAt) - Date.parse(parsed.checkedAt),86400000);
  }
});
test('US manufacturer evidence has USD259.99 and actual explicit new, stocked state', () => {
  const row = parseCorsairProductJSONLD(htmlFor(original),us,observed);
  assert.equal(row.price,259.99);
  assert.equal(row.currency,'USD');
  assert.equal(row.condition,'new');
  assert.equal(row.inStock,true);
  assert.equal(row.eligibleForNewPurchaseMinimum,true);
  assert.equal(row.seller,'CORSAIR');
  assert.equal(row.source.kind,'public-manufacturer-structured-data');
  assert.deepEqual(row.charges,{tax:'excluded',shipping:'excluded'});
});
test('Canadian manufacturer price is separately sourced CAD, never converted from USD', () => {
  const target = COMPLETION_PRICE_TARGETS.find(row => row.adapter === 'corsair-product-jsonld' && row.region === 'CA');
  const saved = getFixture(target);
  const row = parseCorsairProductJSONLD(htmlFor(saved.products),target,Date.parse(saved.checkedAt));
  assert.equal(row.price,359.99);
  assert.equal(row.currency,'CAD');
  assert.equal(row.inStock,true);
});
test('boxed processors and exact SSD preserve observed sold-out state', () => {
  for (const id of ['5600','5500','retail-samsung-990-evo-plus-1-tb']) {
    const target = COMPLETION_PRICE_TARGETS.find(row => row.productId === id), saved = getFixture(target);
    const row = parseCanadaComputers(htmlFor(saved.products),target,Date.parse(saved.checkedAt));
    assert.equal(row.inStock,false);
    assert.equal(row.availability,'out-of-stock');
  }
});
for (const [name, mutate, error] of [
  ['different capacity or model SKU', p => { p.sku = 'CMK16GX4M2B3200C16'; },'identity_missing_or_ambiguous'],
  ['conflicting manufacturer number', p => { p.mpn = 'SOME-OTHER-PART'; },'identity_mismatch'],
  ['marketplace seller', p => { p.offers.seller.name = 'Other merchant'; },'offer_scope_mismatch'],
  ['missing seller', p => { delete p.offers.seller; },'offer_scope_mismatch'],
  ['wrong currency', p => { p.offers.priceCurrency = 'CAD'; },'offer_scope_mismatch'],
  ['missing new-item condition', p => { delete p.offers.itemCondition; },'offer_scope_mismatch'],
  ['used-item condition', p => { p.offers.itemCondition = 'UsedCondition'; },'offer_scope_mismatch'],
  ['different URL', p => { p.offers.url += '-different'; },'offer_identity_invalid'],
  ['URL tracking or query', p => { p.offers.url += '?price=1'; },'offer_identity_invalid'],
  ['multiple unpinned offers', p => { p.offers = [p.offers]; },'offer_identity_invalid'],
  ['negative price', p => { p.offers.price = -1; },'price_invalid'],
  ['comma-formatted price', p => { p.offers.price = '1,259.99'; },'price_invalid'],
  ['fractional cents', p => { p.offers.price = 259.999; },'price_invalid'],
  ['expired offer', p => { p.offers.priceValidUntil = '2020-01-01'; },'price_expired'],
  ['impossible calendar date', p => { p.offers.priceValidUntil = '2026-02-30'; },'price_expired'],
  ['used listing name', p => { p.name = 'Used ' + p.name; },'identity_mismatch']
]) test('rejects ' + name, () => assert.throws(() => parseCorsairProductJSONLD(changed(mutate),us,observed), {code:error}));
test('unknown availability stays unknown and cannot qualify for a new-purchase minimum', () => {
  const row = parseCorsairProductJSONLD(changed(p => { p.offers.availability = 'PreOrder'; }),us,observed);
  assert.equal(row.inStock,null);
  assert.equal(row.availability,'unknown');
  assert.equal(row.eligibleForNewPurchaseMinimum,false);
});
test('out-of-stock manufacturer offer stays a price observation, not an available purchase', () => {
  const row = parseCorsairProductJSONLD(changed(p => { p.offers.availability = 'https://schema.org/OutOfStock'; }),us,observed);
  assert.equal(row.inStock,false);
  assert.equal(row.eligibleForNewPurchaseMinimum,false);
});
test('rejects ambiguous duplicate exact products', () => assert.throws(() => parseCorsairProductJSONLD(htmlFor([original,original]),us,observed),{code:'identity_missing_or_ambiguous'}));
test('rejects arbitrary network targets before any request', async () => {
  let calls = 0;
  await assert.rejects(async () => fetchCompletionPriceTarget({...us,listingUrl:'https://www.corsair.com/account/'},{fetchImpl:async()=>{calls++;}}),{code:'target_not_registered'});
  assert.equal(calls,0);
});
test('normal fixed GET explicitly refuses redirects and never supplies cookies or auth', async () => {
  let calls = 0;
  const row = await fetchCorsairPublicTarget(us,{now:observed,fetchImpl:async(url,init)=>{
    calls++;
    assert.equal(url,us.listingUrl);
    assert.equal(init.method,'GET');
    assert.equal(init.redirect,'manual');
    assert.equal(init.headers.Cookie,undefined);
    assert.equal(init.headers.Authorization,undefined);
    return new Response(htmlFor(original),{status:200,headers:{'content-type':'text/html'}});
  }});
  assert.equal(calls,1);
  assert.equal(row.price,259.99);
});
test('access restrictions are reported without bypass or retry', async () => {
  let calls=0;
  await assert.rejects(fetchCorsairPublicTarget(us,{fetchImpl:async()=>{calls++;return new Response('',{status:403});}}),{code:'source_access_restricted'});
  assert.equal(calls,1);
});
test('redirect response is not followed to a storefront or challenge', async () => {
  let calls=0;
  await assert.rejects(fetchCorsairPublicTarget(us,{fetchImpl:async()=>{calls++;return new Response('',{status:302,headers:{location:'https://www.corsair.com/account/'}});}}),{code:'source_redirect_requires_review'});
  assert.equal(calls,1);
});
test('rejects oversized and non-HTML bodies', async () => {
  await assert.rejects(fetchCorsairPublicTarget(us,{fetchImpl:async()=>new Response('{}',{headers:{'content-type':'application/json'}})}),{code:'response_type_changed'});
  await assert.rejects(fetchCorsairPublicTarget(us,{fetchImpl:async()=>new Response('x'.repeat(1048577),{headers:{'content-type':'text/html'}})}),{code:'response_oversize'});
});
