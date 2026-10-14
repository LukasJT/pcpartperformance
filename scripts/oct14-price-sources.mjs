/* Public exact-product observations. No retailer account, cart or private endpoint. */
export const PUBLIC_PRICE_POLICY = Object.freeze({ cacheMs: 900000, negativeCacheMs: 300000, snapshotMs: 86400000, timeoutMs: 10000, maxBytes: 1048576, maxIds: 20, concurrency: 2 });
const cc = (productId, sku, retailerMpn, retailerSku, name, path) => Object.freeze({ productId, adapter: 'canada-computers-product-jsonld', merchantId: 'canada-computers', merchant: 'Canada Computers', seller: 'Canada Computers & Electronics', region: 'CA', currency: 'CAD', sku, retailerMpn, retailerSku, name, listingUrl: 'https://www.canadacomputers.com' + path, exactVariant: true, condition: 'new', variant: null, memoryVariant: null, revision: null });
export const PUBLIC_PRICE_TARGETS = Object.freeze([
  cc('9800x3d', '100-100001084WOF', '100-100001084WOF', null, 'AMD Ryzen 7 9800X3D', '/en/amd-desktop-processors/264908/amd-ryzen-7-9800x3d-8-core-4nm-am5-104mb-cache-120w-zen-5-cpu-100-100001084wof.html'),
  cc('b650', 'MAG B650 TOMAHAWK WIFI', 'MAG B650 TOMAHAWK WIFI', 'MBMSI00304', 'MSI MAG B650 TOMAHAWK WIFI', '/en/amd-motherboards/229128/msi-mag-b650-tomahawk-wifi-amd-atx-am5-motherboard-mag-b650-tomahawk-wifi.html'),
  cc('ddr5', 'CMK32GX5M2B6000C30', 'CMK32GX5M2B6000C30', null, 'CORSAIR VENGEANCE 32 GB DDR5-6000 CL30', '/en/desktop-memory/248739/corsair-vengeance-32gb-2x16gb-ddr5-6000mhz-cl30-udimm-cmk32gx5m2b6000c30.html'),
  cc('990pro', 'MZ-V9P1T0B/AM', 'MZ-V9P1T0B/AM', 'SSSAS00120', 'Samsung 990 PRO 1 TB', '/en/desktop-laptop-internal-ssds/233285/samsung-990-pro-1tb-m-2-nvme-pcie-4-0-solid-state-drive-mz-v9p1t0b-am.html'),
  cc('retail-msi-geforce-rtx-5070-12g-ventus-3x-oc', 'G5070-12V3C', 'RTX 5070 12G VENTUS 3X OC', 'VCMSI00484', 'MSI GeForce RTX 5070 12G VENTUS 3X OC', '/en/powered-by-nvidia/269805/msi-geforce-rtx-5070-ventus-3x-oc-gddr7-triple-fans-rtx-5070-12g-ventus-3x-oc.html')
]);

class SourceError extends Error { constructor(code) { super(code); this.name = 'SourceError'; this.code = code; } }
const fail = code => { throw new SourceError(code); };
const iso = now => new Date(now).toISOString();
const text = (value, max = 200) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
const typeIs = (node, type) => node && (node['@type'] === type || Array.isArray(node['@type']) && node['@type'].includes(type));
const decode = value => String(value).replaceAll('&amp;', '&').replaceAll('&#38;', '&');
function exactLink(raw, expected) {
  try { const url = new URL(raw), target = new URL(expected); return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash && !url.search && url.hostname === target.hostname && url.pathname === target.pathname ? url.href : null; } catch { return null; }
}
export function validatePublicTarget(target) {
  if (!target || !/^[A-Za-z0-9_-]{1,120}$/.test(target.productId) || target.adapter !== 'canada-computers-product-jsonld' || target.merchantId !== 'canada-computers' || target.seller !== 'Canada Computers & Electronics' || target.region !== 'CA' || target.currency !== 'CAD' || target.exactVariant !== true || target.condition !== 'new' || !text(target.sku, 120) || !text(target.retailerMpn, 120) || !text(target.name) || target.retailerSku !== null && !/^[A-Z0-9_-]{1,80}$/.test(target.retailerSku)) fail('target_invalid');
  if (!exactLink(target.listingUrl, target.listingUrl) || !/^https:\/\/www\.canadacomputers\.com\/en\/[a-z0-9-]+\/\d{5,8}\/[a-z0-9-]+\.html$/.test(target.listingUrl)) fail('target_url_invalid');
  for (const field of ['variant', 'memoryVariant', 'revision']) if (target[field] !== null && !text(target[field], 120)) fail('target_variant_invalid');
  return target;
}
export function parseProductJSONLD(html) {
  if (typeof html !== 'string' || new TextEncoder().encode(html).byteLength > PUBLIC_PRICE_POLICY.maxBytes) fail('response_oversize');
  const nodes = [];
  const walk = (node, depth = 0) => {
    if (depth > 5) fail('structured_data_depth');
    if (Array.isArray(node)) { if (node.length > 100) fail('structured_data_oversize'); for (const entry of node) walk(entry, depth + 1); }
    else if (node && typeof node === 'object') { if (typeIs(node, 'Product')) nodes.push(node); if (node['@graph']) walk(node['@graph'], depth + 1); }
  };
  const scripts = [...html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length > 30) fail('structured_data_oversize');
  for (const script of scripts) { let parsed; try { parsed = JSON.parse(script[1]); } catch { fail('structured_data_invalid'); } walk(parsed); }
  return nodes;
}
export function parseCanadaComputers(html, target, now = Date.now()) {
  validatePublicTarget(target);
  if (!Number.isFinite(now)) fail('clock_invalid');
  const products = parseProductJSONLD(html).filter(node => node.mpn === target.retailerMpn && (target.retailerSku === null || node.sku === target.retailerSku));
  if (products.length !== 1) fail('identity_missing_or_ambiguous');
  const product = products[0], offer = product.offers;
  if (!text(product.name, 320) || !text(product.sku, 80) || !typeIs(offer, 'Offer') || Array.isArray(offer) || !exactLink(offer.url, target.listingUrl)) fail('offer_identity_invalid');
  if (decode(offer.seller?.name) !== target.seller || offer.priceCurrency !== target.currency || offer.itemCondition !== 'https://schema.org/NewCondition' || /open.?box|refurbished|used/i.test(product.name)) fail('offer_scope_mismatch');
  const rawPrice = offer.price;
  if (!(typeof rawPrice === 'number' || typeof rawPrice === 'string' && /^\d{1,7}(?:\.\d{1,2})?$/.test(rawPrice))) fail('price_invalid');
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0 || price > 1000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) fail('price_invalid');
  if (offer.priceValidUntil != null && (!/^\d{4}-\d{2}-\d{2}$/.test(offer.priceValidUntil) || !Number.isFinite(Date.parse(offer.priceValidUntil + 'T23:59:59Z')) || iso(Date.parse(offer.priceValidUntil + 'T23:59:59Z')).slice(0, 10) !== offer.priceValidUntil || Date.parse(offer.priceValidUntil + 'T23:59:59Z') <= now)) fail('price_expired');
  const inStock = offer.availability === 'https://schema.org/InStock' ? true : ['https://schema.org/OutOfStock', 'https://schema.org/SoldOut', 'https://schema.org/Discontinued'].includes(offer.availability) ? false : null;
  const expiry = Math.min(now + PUBLIC_PRICE_POLICY.snapshotMs, offer.priceValidUntil ? Date.parse(offer.priceValidUntil + 'T23:59:59Z') : Infinity);
  return { schema: 1, policy: 'daily-checked-snapshot', productId: target.productId, name: target.name, itemName: decode(product.name), sku: target.sku, retailerMpn: product.mpn, retailerSku: product.sku,
    exactVariant: true, variant: target.variant, memoryVariant: target.memoryVariant, revision: target.revision,
    merchantId: target.merchantId, merchant: target.merchant, seller: target.seller, region: target.region, currency: target.currency, condition: 'new', price: Math.round(price * 100) / 100,
    inStock, availability: inStock === true ? 'in-stock' : inStock === false ? 'out-of-stock' : 'unknown', availabilityBasis: 'retailer-product-online-offer-not-local-store-inventory',
    url: target.listingUrl, checkedAt: iso(now), availabilityCheckedAt: iso(now), expiresAt: iso(expiry), charges: { tax: 'excluded', shipping: 'excluded' },
    source: { kind: 'public-retailer-structured-data', publisher: 'Canada Computers', url: target.listingUrl },
    scope: 'Exact listing observation; no all-store lowest-price or reserved-inventory claim.' };
}
async function boundedText(response) {
  const size = Number(response.headers.get('Content-Length'));
  if (Number.isFinite(size) && size > PUBLIC_PRICE_POLICY.maxBytes) fail('response_oversize');
  if (!response.body?.getReader) fail('response_empty');
  const reader = response.body.getReader(), chunks = []; let length = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > PUBLIC_PRICE_POLICY.maxBytes) { await reader.cancel(); fail('response_oversize'); } chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}
export async function fetchPublicTarget(target, { fetchImpl = fetch, now = Date.now() } = {}) {
  validatePublicTarget(target);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), PUBLIC_PRICE_POLICY.timeoutMs);
  try {
    const response = await fetchImpl(target.listingUrl, { method: 'GET', redirect: 'error', signal: controller.signal, headers: { Accept: 'text/html', 'User-Agent': 'PCPartPerformance/1.0 (+https://www.pcpartperformance.com/methodology/)' } });
    if (!response.ok) fail([401, 403, 429].includes(response.status) ? 'source_access_restricted' : 'source_http_' + response.status);
    if (!(response.headers.get('Content-Type') || '').toLowerCase().includes('text/html')) fail('response_type_changed');
    return parseCanadaComputers(await boundedText(response), target, now);
  } catch (error) { if (error instanceof SourceError) throw error; fail(controller.signal.aborted ? 'source_timeout' : 'source_network_error'); } finally { clearTimeout(timer); }
}
export function createPublicPriceCollector({ targets = PUBLIC_PRICE_TARGETS, fetchImpl = fetch, clock = Date.now } = {}) {
  if (!Array.isArray(targets) || targets.length > 100) fail('targets_invalid');
  const registry = new Map(); for (const target of targets) { validatePublicTarget(target); const key = target.region + ':' + target.productId; if (registry.has(key)) fail('duplicate_target'); registry.set(key, target); }
  const cache = new Map(), inFlight = new Map();
  async function one(target, now) {
    const key = target.region + ':' + target.productId, previous = cache.get(key);
    if (previous && now < previous.until) return previous.result;
    if (inFlight.has(key)) return inFlight.get(key);
    const promise = (async () => {
      let result; try { result = { productId: target.productId, state: 'checked', offer: await fetchPublicTarget(target, { fetchImpl, now }) }; }
      catch (error) { result = { productId: target.productId, state: 'unavailable', error: error instanceof SourceError ? error.code : 'source_error', offer: null }; }
      cache.set(key, { result, until: now + (result.offer ? PUBLIC_PRICE_POLICY.cacheMs : PUBLIC_PRICE_POLICY.negativeCacheMs) });
      return result;
    })();
    inFlight.set(key, promise); try { return await promise; } finally { inFlight.delete(key); }
  }
  return Object.freeze({
    targets: [...registry.values()],
    async collect(ids, { region = 'CA' } = {}) {
      if (!Array.isArray(ids) || !ids.length || ids.length > PUBLIC_PRICE_POLICY.maxIds || ids.some(id => typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,120}$/.test(id)) || !['CA', 'US'].includes(region)) fail('request_invalid');
      const now = clock(); if (!Number.isFinite(now)) fail('clock_invalid');
      const unique = [...new Set(ids)], rows = new Array(unique.length), queue = unique.map((id, index) => ({ id, index }));
      await Promise.all(Array.from({ length: Math.min(PUBLIC_PRICE_POLICY.concurrency, queue.length) }, async () => { while (queue.length) { const { id, index } = queue.shift(), target = registry.get(region + ':' + id); rows[index] = target ? await one(target, now) : { productId: id, state: 'not_covered', offer: null }; } }));
      const offers = rows.filter(row => row.offer).map(row => row.offer), lowestByProduct = Object.fromEntries(offers.filter(offer => offer.inStock === true && now < Date.parse(offer.expiresAt)).map(offer => [offer.productId, offer]));
      return { schema: 1, status: offers.length ? 'checked' : 'no_current_observation', policy: 'daily-checked-snapshot', region, currency: region === 'CA' ? 'CAD' : 'USD', checkedAt: iso(now), offers, lowestByProduct, results: rows.map(({ offer: _offer, ...row }) => row), coverage: { targets: registry.size, merchants: 1, basis: 'included-exact-listings-only' } };
    }
  });
}
