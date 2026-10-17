import { PUBLIC_PRICE_POLICY, parseProductJSONLD, validatePublicTarget, fetchPublicTarget } from './oct14-price-sources.mjs';

// Explicit exact listings only. No browser input can supply a fetch URL.
const cc = (productId, sku, retailerSku, name, path) => Object.freeze({ productId, adapter: 'canada-computers-product-jsonld', merchantId: 'canada-computers', merchant: 'Canada Computers', seller: 'Canada Computers & Electronics', region: 'CA', currency: 'CAD', sku, retailerMpn: sku, retailerSku, name, listingUrl: 'https://www.canadacomputers.com' + path, exactVariant: true, condition: 'new', variant: null, memoryVariant: null, revision: null });
const corsair = (region) => Object.freeze({ productId: 'ddr4', adapter: 'corsair-product-jsonld', merchantId: 'corsair', merchant: 'CORSAIR', seller: 'CORSAIR', region, currency: region === 'US' ? 'USD' : 'CAD', sku: 'CMK32GX4M2E3200C16', retailerMpn: 'CMK32GX4M2E3200C16', retailerSku: 'CMK32GX4M2E3200C16', name: 'CORSAIR VENGEANCE LPX 32 GB DDR4-3200 CL16', listingUrl: 'https://www.corsair.com/' + region.toLowerCase() + '/en/p/memory/cmk32gx4m2e3200c16/vengeance-lpx-32gb-2-x-16gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk32gx4m2e3200c16', exactVariant: true, condition: 'new', variant: null, memoryVariant: null, revision: null });
export const COMPLETION_PRICE_TARGETS = Object.freeze([
  cc('ddr4', 'CMK32GX4M2E3200C16', 'MECOI00366', 'CORSAIR VENGEANCE LPX 32 GB DDR4-3200 CL16', '/en/desktop-memory/183957/corsair-vengeance-lpx-32gb-2x16gb-ddr4-3200mhz-cl16-udimm-cmk32gx4m2e3200c16.html'),
  cc('5600', '100-100000927BOX', 'CPAMD00137', 'AMD Ryzen 5 5600 boxed with Wraith Stealth', '/en/amd-desktop-processors/216441/amd-ryzen-5-5600-6-core-12-thread-7nm-zen-3-processor-with-cooler-65w-100-100000927box.html'),
  cc('5500', '100-100000457BOX', 'CPAMD00138', 'AMD Ryzen 5 5500 boxed with Wraith Stealth', '/en/amd-desktop-processors/216442/amd-ryzen-5-5500-6-core-12-thread-7nm-processor-with-cooler-65w-100-100000457box.html'),
  cc('retail-samsung-990-evo-plus-1-tb', 'MZ-V9S1T0B/AM', 'SSSAS00242', 'Samsung 990 EVO Plus 1 TB', '/en/desktop-laptop-internal-ssds/265360/samsung-990-evo-plus-1tb-m-2-nvme-pcie-4-0-solid-state-drive-mz-v9s1t0b-am.html'),
  corsair('US'),
  corsair('CA')
]);

const failure = code => { const error = new Error(code); error.code = code; throw error; };
const sameURL = (raw, expected) => { try { const url = new URL(raw); return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.search && !url.hash && url.href === expected; } catch { return false; } };
const schemaType = (node, type) => node?.['@type'] === type || Array.isArray(node?.['@type']) && node['@type'].includes(type);
const identifier = (target) => target.productId + '|' + target.region + '|' + target.merchantId;
export function validateCompletionPriceTarget(target) {
  const pinned = COMPLETION_PRICE_TARGETS.find(row => identifier(row) === identifier(target || {}));
  if (!pinned || Object.keys(pinned).some(key => target[key] !== pinned[key])) failure('target_not_registered');
  if (target.adapter === 'canada-computers-product-jsonld') return validatePublicTarget(target);
  if (target.adapter !== 'corsair-product-jsonld' || target.merchantId !== 'corsair' || target.seller !== 'CORSAIR' || !['US','CA'].includes(target.region) || target.currency !== (target.region === 'US' ? 'USD' : 'CAD') || !sameURL(target.listingUrl, pinned.listingUrl)) failure('target_invalid');
  return target;
}
export function parseCorsairProductJSONLD(html, target, now = Date.now()) {
  validateCompletionPriceTarget(target);
  if (target.adapter !== 'corsair-product-jsonld') failure('target_adapter_mismatch');
  if (!Number.isFinite(now)) failure('clock_invalid');
  const matched = parseProductJSONLD(html).filter(node => node.sku === target.sku);
  if (matched.length !== 1) failure('identity_missing_or_ambiguous');
  const product = matched[0], offer = product.offers;
  if (typeof product.name !== 'string' || product.name.length < 1 || product.name.length > 320 || /[\u0000-\u001f\u007f]|open.?box|refurbished|\bused\b/i.test(product.name) || product.mpn != null && product.mpn !== target.sku) failure('identity_mismatch');
  if (!schemaType(offer, 'Offer') || Array.isArray(offer) || !sameURL(offer.url, target.listingUrl)) failure('offer_identity_invalid');
  if (offer.seller?.name !== 'Corsair' || offer.priceCurrency !== target.currency || !['NewCondition','https://schema.org/NewCondition'].includes(offer.itemCondition)) failure('offer_scope_mismatch');
  if (!(typeof offer.price === 'number' || typeof offer.price === 'string' && /^\d{1,7}(?:\.\d{1,2})?$/.test(offer.price))) failure('price_invalid');
  const price = Number(offer.price);
  if (!Number.isFinite(price) || price <= 0 || price > 1000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) failure('price_invalid');
  let validUntil = Infinity;
  if (offer.priceValidUntil != null) {
    validUntil = Date.parse(offer.priceValidUntil + 'T23:59:59Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(offer.priceValidUntil) || !Number.isFinite(validUntil) || new Date(validUntil).toISOString().slice(0,10) !== offer.priceValidUntil || validUntil <= now) failure('price_expired');
  }
  const status = typeof offer.availability === 'string' ? offer.availability.replace(/^https:\/\/schema.org\//, '') : null;
  const inStock = status === 'InStock' ? true : ['OutOfStock','SoldOut','Discontinued'].includes(status) ? false : null;
  const checkedAt = new Date(now).toISOString();
  return { schema: 1, policy: 'daily-checked-snapshot', productId: target.productId, name: target.name, itemName: product.name, sku: target.sku, retailerMpn: target.sku, retailerSku: product.sku,
    exactVariant: true, variant: null, memoryVariant: null, revision: null, merchantId: target.merchantId, merchant: target.merchant, seller: target.seller, region: target.region, currency: target.currency, condition: 'new', price: Math.round(price * 100) / 100,
    inStock, availability: inStock === true ? 'in-stock' : inStock === false ? 'out-of-stock' : 'unknown', availabilityBasis: 'manufacturer-direct-online-product-offer', url: target.listingUrl, checkedAt, availabilityCheckedAt: checkedAt, expiresAt: new Date(Math.min(now + PUBLIC_PRICE_POLICY.snapshotMs, validUntil)).toISOString(),
    charges: { tax: 'excluded', shipping: 'excluded' }, eligibleForNewPurchaseMinimum: inStock === true,
    source: { kind: 'public-manufacturer-structured-data', publisher: 'CORSAIR', url: target.listingUrl }, scope: 'Exact manufacturer-direct listing observation; no all-store lowest-price or reserved-inventory claim.' };
}
export async function fetchCorsairPublicTarget(target, { fetchImpl = (input, init) => globalThis.fetch(input, init), now = Date.now() } = {}) {
  validateCompletionPriceTarget(target);
  if (target.adapter !== 'corsair-product-jsonld') failure('target_adapter_mismatch');
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), PUBLIC_PRICE_POLICY.timeoutMs);
  try {
    const response = await fetchImpl(target.listingUrl, { method: 'GET', redirect: 'manual', headers: { Accept: 'text/html', 'User-Agent': 'PCPartPerformance/1.0 (+https://www.pcpartperformance.com/methodology/)' }, signal: controller.signal });
    if (response.status >= 300 && response.status < 400) failure('source_redirect_requires_review');
    if (!response.ok) failure([401,403,429].includes(response.status) ? 'source_access_restricted' : 'source_http_' + response.status);
    if (!(response.headers.get('content-type') || '').toLowerCase().includes('text/html')) failure('response_type_changed');
    if (Number(response.headers.get('content-length')) > PUBLIC_PRICE_POLICY.maxBytes || !response.body?.getReader) failure('response_oversize_or_empty');
    const reader = response.body.getReader(), chunks = []; let length = 0;
    try { while (true) { const next = await reader.read(); if (next.done) break; length += next.value.byteLength; if (length > PUBLIC_PRICE_POLICY.maxBytes) { await reader.cancel(); failure('response_oversize'); } chunks.push(next.value); } } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return parseCorsairProductJSONLD(new TextDecoder().decode(bytes), target, now);
  } catch (error) { if (error.code) throw error; failure(controller.signal.aborted ? 'source_timeout' : 'source_network_error'); } finally { clearTimeout(timer); }
}
export function fetchCompletionPriceTarget(target, options = {}) {
  validateCompletionPriceTarget(target);
  return target.adapter === 'corsair-product-jsonld' ? fetchCorsairPublicTarget(target, options) : fetchPublicTarget(target, options);
}
