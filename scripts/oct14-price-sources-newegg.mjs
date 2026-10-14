import { PUBLIC_PRICE_POLICY } from './oct14-price-sources.mjs';

/* First-party US listing only. A missing condition stays unknown. */
export const NEWEGG_PUBLIC_TARGET = Object.freeze({ productId: '9800x3d', adapter: 'newegg-original-product-state', merchantId: 'newegg-us', merchant: 'Newegg', seller: 'Newegg', region: 'US', currency: 'USD', sku: '100-100001084WOF', retailerSku: 'N82E16819113877', retailerItem: '19-113-877', name: 'AMD Ryzen 7 9800X3D', listingUrl: 'https://www.newegg.com/amd-ryzen-7-9000-series-ryzen-7-9800x3d-granite-ridge-zen-5-socket-am5-desktop-cpu-processor/p/N82E16819113877', exactVariant: true, variant: null, memoryVariant: null, revision: null });
const error = code => { const failure = new Error(code); failure.code = code; throw failure; };
const iso = timestamp => new Date(timestamp).toISOString();
function validTarget(target) {
  if (!target || target.adapter !== 'newegg-original-product-state' || target.merchantId !== 'newegg-us' || target.region !== 'US' || target.currency !== 'USD' || target.seller !== 'Newegg' || !/^[A-Za-z0-9_-]{1,120}$/.test(target.productId) || !/^N82E168\d{8}$/.test(target.retailerSku) || !/^\d{2}-\d{3}-\d{3}$/.test(target.retailerItem) || typeof target.sku !== 'string' || target.sku.length > 120 || !/^https:\/\/www\.newegg\.com\/[a-z0-9-]+\/p\/N82E168\d{8}$/.test(target.listingUrl) || !target.listingUrl.endsWith('/' + target.retailerSku) || target.exactVariant !== true) error('target_invalid');
}
export function parseNeweggOriginalState(html, target = NEWEGG_PUBLIC_TARGET, now = Date.now()) {
  validTarget(target);
  if (typeof html !== 'string' || new TextEncoder().encode(html).byteLength > PUBLIC_PRICE_POLICY.maxBytes) error('response_oversize');
  if (!Number.isFinite(now)) error('clock_invalid');
  const matches = [...html.matchAll(/window\.__initialState__\s*=\s*([\s\S]*?)<\/script>/g)];
  if (matches.length !== 1) error('original_state_missing_or_ambiguous');
  let item; try { item = JSON.parse(matches[0][1].trim().replace(/;$/, '')).ItemDetail; } catch { error('original_state_invalid'); }
  if (!item || item.Item !== target.retailerItem || item.Model !== target.sku) error('identity_mismatch');
  if (item.CountryCode !== 'USA' || item.CurrencyCode != null && item.CurrencyCode !== 'USD') error('region_currency_mismatch');
  if (!item.Seller || item.Seller.SellerId !== '' || item.Seller.SellerName != null && item.Seller.SellerName !== 'Newegg') error('seller_scope_mismatch');
  if (item.IsActivated !== true || item.PriceHideMark !== '0') error('restricted_or_inactive_listing');
  const name = item.Description?.ProductName || item.Description?.Title;
  if (typeof name !== 'string' || !name.length || name.length > 400 || /[\u0000-\u001f\u007f]/.test(name) || /refurbished|open.?box|\bused\b/i.test(name)) error('name_or_condition_mismatch');
  if (typeof item.FinalPrice !== 'number' || !Number.isFinite(item.FinalPrice) || item.FinalPrice <= 0 || item.FinalPrice > 1000000 || Math.abs(item.FinalPrice * 100 - Math.round(item.FinalPrice * 100)) > 0.000001) error('price_invalid');
  if (item.Instock != null && typeof item.Instock !== 'boolean') error('stock_schema_changed');
  const rawCondition = item.ItemCondition ?? item.Condition;
  const condition = ['New', 'new', 'https://schema.org/NewCondition'].includes(rawCondition) ? 'new' : 'unknown';
  const inStock = item.Instock === true ? true : item.Instock === false ? false : null;
  return { schema: 1, policy: 'daily-checked-snapshot', productId: target.productId, name: target.name, itemName: name, sku: target.sku, retailerMpn: item.Model, retailerSku: target.retailerSku, retailerItem: item.Item,
    exactVariant: true, variant: null, memoryVariant: null, revision: null, merchantId: 'newegg-us', merchant: 'Newegg', seller: 'Newegg', region: 'US', currency: 'USD',
    currencyBasis: 'original-state USA country scope plus retailer published country-currency policy', price: Math.round(item.FinalPrice * 100) / 100, condition,
    inStock, availability: inStock === true ? 'in-stock' : inStock === false ? 'out-of-stock' : 'unknown', availabilityBasis: 'original-retailer-online-product-state',
    url: target.listingUrl, checkedAt: iso(now), availabilityCheckedAt: iso(now), expiresAt: iso(now + PUBLIC_PRICE_POLICY.snapshotMs), charges: { tax: 'excluded', shipping: 'excluded' },
    eligibleForNewPurchaseMinimum: condition === 'new' && inStock === true,
    source: { kind: 'public-retailer-original-state', publisher: 'Newegg', url: target.listingUrl }, scope: condition === 'new' ? 'Exact first-party listing observation.' : 'Exact first-party price observation; new-item condition needs verification before a verified-new subtotal.' };
}
export async function fetchNeweggPublicTarget(target = NEWEGG_PUBLIC_TARGET, { fetchImpl = (input, init) => globalThis.fetch(input, init), now = Date.now() } = {}) {
  validTarget(target);
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), PUBLIC_PRICE_POLICY.timeoutMs);
  try {
    const response = await fetchImpl(target.listingUrl, { method: 'GET', redirect: 'error', headers: { Accept: 'text/html', 'User-Agent': 'PCPartPerformance/1.0 (+https://www.pcpartperformance.com/methodology/)' }, signal: controller.signal });
    if (!response.ok) error([401, 403, 429].includes(response.status) ? 'source_access_restricted' : 'source_http_' + response.status);
    if (!(response.headers.get('Content-Type') || '').toLowerCase().includes('text/html')) error('response_type_changed');
    if (Number(response.headers.get('Content-Length')) > PUBLIC_PRICE_POLICY.maxBytes || !response.body?.getReader) error('response_oversize_or_empty');
    const reader = response.body.getReader(), chunks = []; let length = 0;
    try { while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > PUBLIC_PRICE_POLICY.maxBytes) { await reader.cancel(); error('response_oversize'); } chunks.push(value); } } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return parseNeweggOriginalState(new TextDecoder().decode(bytes), target, now);
  } catch (failure) { if (failure.code) throw failure; error(controller.signal.aborted ? 'source_timeout' : /illegal invocation|invalid.*this|binding/i.test(String(failure.message)) ? 'source_runtime_binding_error' : /redirect/i.test(String(failure.message)) ? 'source_redirect_rejected' : /different request|I\/O/i.test(String(failure.message)) ? 'source_request_context_error' : 'source_network_error'); } finally { clearTimeout(timeout); }
}
