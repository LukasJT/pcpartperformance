import { PUBLIC_PRICE_POLICY, PUBLIC_PRICE_TARGETS } from './oct14-price-sources.mjs';
import { NEWEGG_PUBLIC_TARGET } from './oct14-price-sources-newegg.mjs';

/* Pure validation for the six fixed public listings. Suitable for a Worker. */
export const PUBLIC_SNAPSHOT_TARGETS = Object.freeze([...PUBLIC_PRICE_TARGETS, NEWEGG_PUBLIC_TARGET]);
export const PUBLIC_SNAPSHOT_SCHEMA = 1;
const key = row => [row.merchantId, row.region, row.productId].join(':');
const registry = new Map(PUBLIC_SNAPSHOT_TARGETS.map(target => [key(target), target]));
const text = (value, max = 400) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
const date = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value.slice(0, 10) ? time : null;
};

export function validatePublicPriceObservation(raw, { now = Date.now() } = {}) {
  const issues = [];
  const reject = issue => issues.push(issue);
  if (!Number.isFinite(now) || !raw || typeof raw !== 'object' || Array.isArray(raw)) return { valid: false, issues: ['observation_invalid'], observation: null };
  const target = registry.get(key(raw));
  if (!target) return { valid: false, issues: ['target_unknown'], observation: null };
  if (raw.schema !== 1 || raw.policy !== 'daily-checked-snapshot' || raw.exactVariant !== true) reject('observation_policy_invalid');
  if (raw.region !== target.region || raw.currency !== target.currency || raw.merchantId !== target.merchantId || raw.merchant !== target.merchant || raw.seller !== target.seller) reject('region_seller_currency_mismatch');
  if (raw.sku !== target.sku || raw.retailerMpn !== (target.retailerMpn || target.sku) || raw.url !== target.listingUrl) reject('identity_mismatch');
  if (!text(raw.retailerSku, 80) || target.retailerSku !== null && raw.retailerSku !== target.retailerSku) reject('retailer_sku_mismatch');
  if (target.retailerItem && raw.retailerItem !== target.retailerItem) reject('retailer_item_mismatch');
  for (const field of ['variant', 'memoryVariant', 'revision']) if (raw[field] !== target[field]) reject('variant_mismatch');
  if (raw.name !== target.name || !text(raw.itemName)) reject('name_invalid');
  if (typeof raw.price !== 'number' || !Number.isFinite(raw.price) || raw.price <= 0 || raw.price > 1000000 || Math.abs(raw.price * 100 - Math.round(raw.price * 100)) > 0.000001) reject('price_invalid');
  const conditions = target.region === 'CA' ? ['new'] : ['new', 'unknown'];
  if (!conditions.includes(raw.condition)) reject('condition_invalid');
  if (![true, false, null].includes(raw.inStock)) reject('stock_invalid');
  const availability = raw.inStock === true ? 'in-stock' : raw.inStock === false ? 'out-of-stock' : 'unknown';
  if (raw.availability !== availability) reject('stock_inconsistent');
  if (raw.charges?.tax !== 'excluded' || raw.charges?.shipping !== 'excluded') reject('charge_basis_mismatch');
  const checked = date(raw.checkedAt), stock = date(raw.availabilityCheckedAt), expiry = date(raw.expiresAt);
  if (checked === null || stock === null || expiry === null || checked > now || stock > now || stock !== checked || expiry <= checked || expiry > checked + PUBLIC_PRICE_POLICY.snapshotMs) reject('timestamps_invalid');
  else if (now - checked >= PUBLIC_PRICE_POLICY.snapshotMs || now >= expiry) reject('observation_expired');
  const kind = target.region === 'CA' ? 'public-retailer-structured-data' : 'public-retailer-original-state';
  if (raw.source?.kind !== kind || raw.source?.publisher !== target.merchant || raw.source?.url !== target.listingUrl) reject('source_mismatch');
  if (issues.length) return { valid: false, issues: [...new Set(issues)], observation: null };
  const observation = {
    schema: 1, policy: 'daily-checked-snapshot', productId: target.productId, name: target.name, itemName: raw.itemName,
    sku: target.sku, retailerMpn: raw.retailerMpn, retailerSku: raw.retailerSku, ...(target.retailerItem ? { retailerItem: target.retailerItem } : {}),
    exactVariant: true, variant: target.variant, memoryVariant: target.memoryVariant, revision: target.revision,
    merchantId: target.merchantId, merchant: target.merchant, seller: target.seller, region: target.region, currency: target.currency,
    price: raw.price, condition: raw.condition, inStock: raw.inStock, availability, url: target.listingUrl,
    checkedAt: raw.checkedAt, availabilityCheckedAt: raw.availabilityCheckedAt, expiresAt: raw.expiresAt,
    charges: { tax: 'excluded', shipping: 'excluded' }, source: { kind, publisher: target.merchant, url: target.listingUrl },
    eligibleForNewPurchaseMinimum: raw.condition === 'new' && raw.inStock === true,
    availabilityBasis: target.region === 'CA' ? 'retailer-product-online-offer-not-local-store-inventory' : 'original-retailer-online-product-state'
  };
  return { valid: true, issues: [], observation };
}

export function validatePublicPriceSnapshot(raw, { now = Date.now() } = {}) {
  const generated = date(raw?.generatedAt);
  if (!Number.isFinite(now) || !raw || raw.schema !== PUBLIC_SNAPSHOT_SCHEMA || raw.policy !== 'daily-checked-snapshot' || generated === null || generated > now || !Array.isArray(raw.observations) || raw.observations.length > PUBLIC_SNAPSHOT_TARGETS.length) return { valid: false, envelopeValid: false, errors: ['snapshot_invalid'], observations: [], rejected: [], generatedAt: null };
  const observations = [], rejected = [], seen = new Map(), duplicates = new Set();
  for (const row of raw.observations) { const id = key(row || {}); seen.set(id, (seen.get(id) || 0) + 1); if (seen.get(id) > 1) duplicates.add(id); }
  for (const row of raw.observations) {
    const result = validatePublicPriceObservation(row, { now });
    if (duplicates.has(key(row || {}))) rejected.push({ productId: text(row?.productId, 120) ? row.productId : null, issues: ['duplicate_observation'] });
    else if (!result.valid) rejected.push({ productId: text(row?.productId, 120) ? row.productId : null, issues: result.issues });
    else if (date(result.observation.checkedAt) > generated) rejected.push({ productId: result.observation.productId, issues: ['observation_newer_than_snapshot'] });
    else observations.push(result.observation);
  }
  return { valid: rejected.length === 0, envelopeValid: true, errors: [], observations, rejected, generatedAt: raw.generatedAt };
}

export function publicPriceSnapshotPayload(raw, { ids, region = 'CA', now = Date.now() } = {}) {
  if (!Array.isArray(ids) || !ids.length || ids.length > PUBLIC_PRICE_POLICY.maxIds || ids.some(id => typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,120}$/.test(id)) || !['CA', 'US'].includes(region)) throw new TypeError('snapshot_request_invalid');
  const verified = validatePublicPriceSnapshot(raw, { now });
  const requested = [...new Set(ids)], wanted = new Set(requested), offers = verified.observations.filter(row => row.region === region && wanted.has(row.productId));
  const lowestByProduct = Object.fromEntries(offers.filter(row => row.eligibleForNewPurchaseMinimum).map(row => [row.productId, row]));
  const results = requested.map(productId => {
    const offer = offers.find(row => row.productId === productId);
    return { productId, state: offer ? offer.condition === 'unknown' ? 'condition_requires_verification' : 'checked' : PUBLIC_SNAPSHOT_TARGETS.some(row => row.region === region && row.productId === productId) ? 'no_current_observation' : 'not_covered' };
  });
  return { schema: 1, status: offers.length ? 'checked' : 'no_current_observation', policy: 'daily-checked-snapshot', region, currency: region === 'CA' ? 'CAD' : 'USD', offers, lowestByProduct, results,
    snapshotGeneratedAt: verified.generatedAt, coverage: { targets: PUBLIC_SNAPSHOT_TARGETS.filter(row => row.region === region).length, merchants: region === 'CA' ? 1 : 1, basis: 'included-exact-listings-only' },
    sourceMode: 'daily-published-public-snapshot', snapshotRejectedRecords: verified.rejected.length };
}
