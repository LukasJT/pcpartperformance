import defaultConfiguration from '../data/morning-price-targets.json' with { type: 'json' };

/* Daily snapshots have their own policy. They never extend program-offers.cjs current-offer TTL. */
export const MORNING_POLICY = Object.freeze({ timezone: 'America/Toronto', localHour: 7, responseCacheMs: 900000, snapshotTtlMs: 86400000, retentionHeadroomMs: 86400000, timeoutMs: 8000, maxRetries: 1, maxIds: 50, maxTargets: 100, batchSize: 25, leaseMs: 300000, maxDailyAttempts: 3, maxResponseBytes: 524288 });
export const UNCONFIGURED_ADAPTERS = Object.freeze(['canada-computers', 'memory-express', 'vuugo', 'bestbuy-ca', 'newegg-ca', 'newegg-us', 'amazon-ca', 'amazon-us', 'pcpartpicker']);
const ID = /^[a-zA-Z0-9_-]{1,120}$/, SKU = /^\d{7}$/;
const API_ORIGIN = 'https://api.bestbuy.com';
const ADAPTER = 'bestbuy-us-products';
const nowISO = value => new Date(value).toISOString();
class PriceError extends Error { constructor(code, retryable = false) { super(code); this.code = code; this.retryable = retryable; } }
const failure = (code, retryable = false) => { throw new PriceError(code, retryable); };
const safeCode = error => error instanceof PriceError ? error.code : 'upstream_or_storage_failure';
function text(value, max = 160) { return typeof value === 'string' && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value) && value === value.trim(); }
function approvedBrandLogo(source) {
  if (!text(source.brandAssetAuthorization, 160)) return false;
  return source.brandLogoUrl === 'https://developer.bestbuy.com/images/bestbuy-logo.png' || (typeof source.brandLogoUrl === 'string' && /^\/assets\/retailers\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}\.(?:png|svg|webp)$/.test(source.brandLogoUrl));
}
function validTime(value, maximum = Infinity) {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value)) && nowISO(Date.parse(value)).slice(0, 10) === value.slice(0, 10) && Date.parse(value) <= maximum;
}
function exactListing(value, sku) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['www.bestbuy.com', 'bestbuy.com', 'api.bestbuy.com'].includes(url.hostname) || url.username || url.password || url.port || url.hash || value.length > 1800) return null;
    if ([...url.searchParams.keys()].some(key => /key|token|secret|password|signature/i.test(key))) return null;
    if (url.hostname === 'api.bestbuy.com') {
      if (!new RegExp('^/click/(?:-|[a-zA-Z0-9_-]{1,160})/' + sku + '/pdp$').test(url.pathname)) return null;
    } else {
      if (url.searchParams.getAll('skuId').length > 1 || (url.searchParams.has('skuId') && url.searchParams.get('skuId') !== sku)) return null;
      if (url.searchParams.get('skuId') !== sku && !url.pathname.endsWith('/' + sku + '.p')) return null;
    }
    return url.href;
  } catch { return null; }
}
function approved(review, now) {
  return review?.status === 'approved' && review?.kind === 'human' && text(review.reviewer, 120) && validTime(review.checkedAt, now) && text(review.authorizationRef, 160);
}
export function torontoDateParts(timestamp) {
  if (!Number.isFinite(timestamp)) failure('invalid_clock');
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: MORNING_POLICY.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(timestamp)).map(field => [field.type, field.value]));
  return { localDate: fields.year + '-' + fields.month + '-' + fields.day, hour: Number(fields.hour), minute: Number(fields.minute) };
}
export function validateConfiguration(raw, now = Date.now()) {
  // One official provider is supported initially, so aliases cannot multiply its request allowance.
  if (!raw || raw.schema !== 1 || !Array.isArray(raw.sources) || !Array.isArray(raw.targets) || raw.sources.length > 1 || raw.targets.length > MORNING_POLICY.maxTargets) failure('configuration_invalid');
  const sources = new Map(), targets = [];
  for (const source of raw.sources) {
    if (!source || !ID.test(source.id) || sources.has(source.id) || source.adapter !== ADAPTER || source.region !== 'US' || source.currency !== 'USD' || source.merchantId !== 'bestbuy-us' || source.publisher !== 'Best Buy' || source.seller !== 'Best Buy' || !approved(source.review, now) || !approvedBrandLogo(source)) failure('source_approval_invalid');
    const access = source.permission;
    if (access?.apiAccess !== true || access.display !== true || access.temporaryStorage !== true || access.firstPartyOnlyConfirmed !== true || !Number.isInteger(access.retentionHours) || access.retentionHours < 48 || access.retentionHours > 8760) failure('source_permission_invalid');
    // D1 Time Travel retains deleted content; ordinary 72-hour caching terms alone cannot authorize it.
    if (access.datastoreBackupStorageConfirmed !== true || !text(access.datastoreBackupAuthorizationRef, 160)) failure('backup_permission_missing');
    if (access.retentionHours > 72 && !(access.extendedHistory === true && text(access.extendedHistoryAuthorizationRef, 160))) failure('history_permission_missing');
    if (!Number.isInteger(source.snapshotTtlHours) || source.snapshotTtlHours < 1 || source.snapshotTtlHours > 24 || source.snapshotTtlHours > access.retentionHours - MORNING_POLICY.retentionHeadroomMs / 3600000) failure('snapshot_expiry_invalid');
    sources.set(source.id, { ...source });
  }
  const keys = new Set(), skus = new Set();
  for (const target of raw.targets) {
    if (!target || !ID.test(target.productId) || !sources.has(target.sourceId) || !SKU.test(target.retailerSku) || !text(target.modelNumber, 120) || !text(target.name, 200) || target.exactVariant !== true || target.region !== 'US' || target.currency !== 'USD' || target.condition !== 'new' || target.seller !== 'Best Buy' || !approved(target.review, now) || !exactListing(target.listingUrl, target.retailerSku)) failure('target_identity_invalid');
    for (const field of ['variant', 'memoryVariant', 'revision']) if (target[field] !== null && !text(target[field], 120)) failure('target_variant_invalid');
    const key = target.sourceId + ':' + target.productId, skuKey = target.sourceId + ':' + target.retailerSku;
    if (keys.has(key) || skus.has(skuKey)) failure('duplicate_target');
    keys.add(key); skus.add(skuKey); targets.push({ ...target });
  }
  return { sources: [...sources.values()], targets };
}
function configurationState(env, config) {
  const blockers = [];
  if (!env.MORNING_PRICES_DB || typeof env.MORNING_PRICES_DB.prepare !== 'function' || typeof env.MORNING_PRICES_DB.batch !== 'function') blockers.push('datastore');
  if (!config.sources.length) blockers.push('reviewed_source_access');
  if (!config.targets.length) blockers.push('reviewed_exact_targets');
  if (config.sources.some(source => source.adapter === ADAPTER) && !text(env.BESTBUY_API_KEY, 256)) blockers.push('retailer_credentials');
  return { status: blockers.length ? 'not_configured' : env.MORNING_PRICES_ENABLED === 'true' ? 'configured' : 'disabled', blockers };
}
export function validateBestBuyProduct(raw, target, source, checkedAt) {
  const checked = Date.parse(checkedAt);
  if (!validTime(checkedAt) || !raw || String(raw.sku) !== target.retailerSku || raw.modelNumber !== target.modelNumber || !text(raw.name, 300) || !exactListing(raw.url, target.retailerSku)) failure('provider_identity_mismatch');
  if (typeof raw.salePrice !== 'number' || !Number.isFinite(raw.salePrice) || raw.salePrice <= 0 || raw.salePrice > 1000000 || Math.abs(raw.salePrice * 100 - Math.round(raw.salePrice * 100)) > 0.000001) failure('provider_price_invalid');
  if (String(raw.condition || '').toLocaleLowerCase() !== target.condition || (raw.preowned !== undefined && raw.preowned !== false)) failure('provider_condition_mismatch');
  if ((raw.currency !== undefined && raw.currency !== 'USD') || (raw.region !== undefined && raw.region !== 'US')) failure('provider_currency_mismatch');
  // Seller scope requires reviewed evidence; an explicit differing provider seller always rejects.
  if (source.permission.firstPartyOnlyConfirmed !== true || (raw.seller !== undefined && raw.seller !== target.seller)) failure('provider_seller_unconfirmed');
  if (raw.priceRestriction !== null && raw.priceRestriction !== undefined && raw.priceRestriction !== '') failure('provider_price_restricted');
  if (raw.onlineAvailability !== undefined && raw.onlineAvailability !== null && typeof raw.onlineAvailability !== 'boolean') failure('provider_stock_schema_changed');
  for (const field of ['priceUpdateDate', 'onlineAvailabilityUpdateDate']) if (raw[field] != null && !validTime(raw[field], checked)) failure('provider_timestamp_invalid');
  const availability = raw.onlineAvailability === true ? 'in-stock' : raw.onlineAvailability === false ? 'out-of-stock' : 'unknown';
  return {
    schema: 1, policy: 'daily-checked-snapshot', productId: target.productId, sku: target.modelNumber, retailerSku: target.retailerSku,
    name: target.name, modelNumber: target.modelNumber, variant: target.variant, memoryVariant: target.memoryVariant, revision: target.revision, exactVariant: true,
    merchantId: source.merchantId, merchant: source.publisher, seller: target.seller, url: raw.url, region: 'US', currency: 'USD',
    price: Math.round((raw.salePrice + Number.EPSILON) * 100) / 100, condition: target.condition, availability, inStock: availability === 'in-stock' ? true : availability === 'out-of-stock' ? false : null,
    checkedAt, availabilityCheckedAt: checkedAt, expiresAt: nowISO(checked + source.snapshotTtlHours * 3600000),
    charges: { tax: 'excluded', shipping: 'excluded' },
    availabilityBasis: 'online-purchasable-not-store-inventory',
    source: { id: source.id, kind: 'authorized-retailer-api', publisher: source.publisher, url: raw.url, attribution: 'Best Buy', logoUrl: source.brandLogoUrl }
  };
}
async function boundedJSON(response) {
  const declared = Number(response.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > MORNING_POLICY.maxResponseBytes) failure('provider_response_oversize');
  const reader = response.body?.getReader(); if (!reader) failure('provider_empty_response');
  let length = 0, chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength; if (length > MORNING_POLICY.maxResponseBytes) { await reader.cancel(); failure('provider_response_oversize'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { failure('provider_json_changed'); }
}
async function fetchBestBuyBatch(targets, key, { fetchImpl, sleep, timeoutMs }) {
  const skus = targets.map(target => target.retailerSku);
  const url = new URL(API_ORIGIN + '/v1/products(sku in(' + skus.join(',') + '))');
  url.searchParams.set('format', 'json'); url.searchParams.set('pageSize', String(MORNING_POLICY.batchSize));
  url.searchParams.set('show', 'sku,name,modelNumber,url,salePrice,condition,preowned,onlineAvailability,onlineAvailabilityUpdateDate,priceUpdateDate,priceRestriction');
  url.searchParams.set('apiKey', key);
  for (let attempt = 0; attempt <= MORNING_POLICY.maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url.href, { method: 'GET', redirect: 'error', headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) failure(response.status === 429 ? 'provider_rate_limited' : 'provider_http_error', response.status === 429 || [500, 502, 503, 504].includes(response.status));
      if (!(response.headers.get('Content-Type') || '').toLocaleLowerCase().includes('application/json')) failure('provider_content_type_changed');
      const payload = await boundedJSON(response);
      if (!Array.isArray(payload.products) || payload.products.length > targets.length || payload.partial === true || (payload.totalPages !== undefined && payload.totalPages > 1)) failure('provider_schema_changed');
      const seen = new Set();
      for (const product of payload.products) { const sku = String(product?.sku); if (!skus.includes(sku) || seen.has(sku)) failure('provider_duplicate_or_unrequested_sku'); seen.add(sku); }
      return payload.products;
    } catch (error) {
      const safe = error instanceof PriceError ? error : new PriceError(controller.signal.aborted ? 'provider_timeout' : 'provider_network_error', true);
      if (!safe.retryable || attempt >= MORNING_POLICY.maxRetries) throw safe;
      await sleep(1000 * (attempt + 1));
    } finally { clearTimeout(timeout); }
  }
}
const LEASE_SQL = `INSERT INTO morning_price_runs (source_id,local_date,state,lease_token,lease_until,started_at,attempts)
  VALUES (?,?,'running',?,?,?,1)
  ON CONFLICT(source_id,local_date) DO UPDATE SET state='running',lease_token=excluded.lease_token,lease_until=excluded.lease_until,started_at=excluded.started_at,completed_at=NULL,attempts=morning_price_runs.attempts+1,accepted_count=0,failure_count=0,error_code=NULL
  WHERE morning_price_runs.state!='succeeded' AND morning_price_runs.attempts<3 AND (morning_price_runs.state!='running' OR morning_price_runs.lease_until<=excluded.started_at)
  RETURNING lease_token,attempts`;
async function acquireLease(db, sourceId, localDate, now, token) {
  const health = await db.prepare('SELECT backoff_until FROM morning_price_source_health WHERE source_id=?').bind(sourceId).first();
  if (health?.backoff_until && Date.parse(health.backoff_until) > now) return { state: 'backoff' };
  const start = nowISO(now), lease = await db.prepare(LEASE_SQL).bind(sourceId, localDate, token, nowISO(now + MORNING_POLICY.leaseMs), start).first();
  if (!lease || lease.lease_token !== token) {
    const row = await db.prepare('SELECT state,attempts FROM morning_price_runs WHERE source_id=? AND local_date=?').bind(sourceId, localDate).first();
    return { state: row?.state === 'succeeded' ? 'already_checked' : row?.attempts >= MORNING_POLICY.maxDailyAttempts ? 'retry_limit' : 'leased' };
  }
  await db.prepare(`INSERT INTO morning_price_source_health (source_id,state,last_attempt_at)
    SELECT ?,'running',? WHERE EXISTS (SELECT 1 FROM morning_price_runs WHERE source_id=? AND local_date=? AND lease_token=? AND state='running' AND lease_until>?)
    ON CONFLICT(source_id) DO UPDATE SET state='running',last_attempt_at=excluded.last_attempt_at`).bind(sourceId, start, sourceId, localDate, token, start).run();
  return { state: 'acquired', token, attempts: lease.attempts };
}
async function persistRun(db, source, localDate, lease, observations, errors, now) {
  const completed = nowISO(now), status = !errors.length ? 'succeeded' : observations.length ? 'partial' : 'failed', code = errors[0]?.code || null;
  const current = await db.prepare('SELECT consecutive_failures FROM morning_price_source_health WHERE source_id=?').bind(source.id).first();
  const failures = status === 'succeeded' ? 0 : (current?.consecutive_failures || 0) + 1;
  const backoff = status === 'succeeded' ? null : nowISO(now + Math.min(360, 15 * 2 ** Math.min(failures - 1, 5)) * 60000);
  const statements = observations.map(observation => {
    const checked = Date.parse(observation.checkedAt), id = source.id + ':' + localDate + ':' + observation.productId + ':' + observation.checkedAt;
    return db.prepare(`INSERT INTO morning_price_observations (observation_id,source_id,local_date,product_id,retailer_sku,region,currency,checked_at,expires_at,retained_until,observation_json)
      SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM morning_price_runs WHERE source_id=? AND local_date=? AND lease_token=? AND state='running' AND lease_until>?)
      ON CONFLICT(observation_id) DO NOTHING`).bind(id, source.id, localDate, observation.productId, observation.retailerSku, observation.region, observation.currency, observation.checkedAt, observation.expiresAt, nowISO(checked + source.permission.retentionHours * 3600000 - MORNING_POLICY.retentionHeadroomMs), JSON.stringify(observation), source.id, localDate, lease.token, completed);
  });
  statements.push(db.prepare(`UPDATE morning_price_runs SET state=?,completed_at=?,accepted_count=?,failure_count=?,error_code=? WHERE source_id=? AND local_date=? AND lease_token=? AND state='running' AND lease_until>?`).bind(status, completed, observations.length, errors.length, code, source.id, localDate, lease.token, completed));
  statements.push(db.prepare(`INSERT INTO morning_price_source_health (source_id,state,last_attempt_at,last_successful_at,consecutive_failures,backoff_until,accepted_count,failure_count,error_code)
    SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM morning_price_runs WHERE source_id=? AND local_date=? AND lease_token=? AND state=? AND completed_at=?)
    ON CONFLICT(source_id) DO UPDATE SET state=excluded.state,last_attempt_at=excluded.last_attempt_at,last_successful_at=COALESCE(excluded.last_successful_at,morning_price_source_health.last_successful_at),consecutive_failures=excluded.consecutive_failures,backoff_until=excluded.backoff_until,accepted_count=excluded.accepted_count,failure_count=excluded.failure_count,error_code=excluded.error_code`).bind(source.id, status === 'succeeded' ? 'healthy' : status, completed, status === 'succeeded' ? completed : null, failures, backoff, observations.length, errors.length, code, source.id, localDate, lease.token, status, completed));
  await db.batch(statements);
  const committed = await db.prepare('SELECT state,lease_token,completed_at FROM morning_price_runs WHERE source_id=? AND local_date=?').bind(source.id, localDate).first();
  const ownsCompletion = committed?.lease_token === lease.token && committed.completed_at === completed;
  return { sourceId: source.id, state: ownsCompletion ? status : 'lease_lost', accepted: ownsCompletion ? observations.length : 0, failed: ownsCompletion ? errors.length : 0, errorCode: ownsCompletion ? code : null };
}
function queryIds(url) {
  if ([...url.searchParams.keys()].some(key => !['ids', 'region'].includes(key)) || url.searchParams.getAll('ids').length !== 1 || url.searchParams.getAll('region').length > 1) failure('invalid_query');
  const raw = url.searchParams.get('ids'); if (!raw || raw.length > MORNING_POLICY.maxIds * 121) failure('invalid_ids');
  const ids = raw.split(','); if (ids.length > MORNING_POLICY.maxIds || ids.some(id => !ID.test(id))) failure('invalid_ids');
  const region = url.searchParams.get('region') || 'CA'; if (!['CA', 'US'].includes(region)) failure('invalid_region');
  return { ids: [...new Set(ids)].sort(), region };
}
function response(payload, status = 200, ttl = 0, method = 'GET') {
  return new Response(method === 'HEAD' ? null : JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': ttl > 0 ? 'public, max-age=' + Math.floor(ttl / 1000) : 'no-store', 'X-Robots-Tag': 'noindex, follow', 'X-Content-Type-Options': 'nosniff', ...(status === 405 ? { Allow: 'GET, HEAD' } : {}) } });
}
function basePayload(now) {
  return { schema: 1, policy: 'daily-checked-snapshot', timezone: MORNING_POLICY.timezone, localDate: torontoDateParts(now).localDate, generatedAt: nowISO(now), currentOfferPolicy: 'separate-15-minute-policy', snapshotMaxAgeHours: 24, comparisonBasis: 'lowest-eligible-item-price-among-checked-stores', excludedCharges: ['tax', 'shipping'] };
}
function publicHealth(row, source) {
  return { sourceId: source.id, publisher: source.publisher, logoUrl: source.brandLogoUrl, region: source.region, currency: source.currency, state: row?.state || 'not_checked', lastAttemptAt: row?.last_attempt_at || null, lastSuccessfulAt: row?.last_successful_at || null, accepted: row?.accepted_count || 0, failed: row?.failure_count || 0, errorCode: row?.error_code || null, backoffUntil: row?.backoff_until || null };
}
function storedOffer(row, target, source, region, now) {
  let offer; try { offer = JSON.parse(row.observation_json); } catch { return null; }
  if (offer.schema !== 1 || offer.policy !== 'daily-checked-snapshot' || offer.productId !== target.productId || offer.retailerSku !== target.retailerSku || offer.modelNumber !== target.modelNumber || offer.seller !== target.seller || offer.region !== region || offer.currency !== source.currency || offer.condition !== target.condition || offer.exactVariant !== true || offer.variant !== target.variant || offer.memoryVariant !== target.memoryVariant || offer.revision !== target.revision || offer.checkedAt !== row.checked_at || offer.expiresAt !== row.expires_at || !validTime(offer.checkedAt, now) || !validTime(offer.expiresAt) || !validTime(row.retained_until) || Date.parse(offer.expiresAt) <= Date.parse(offer.checkedAt) || Date.parse(offer.expiresAt) - Date.parse(offer.checkedAt) > Math.min(MORNING_POLICY.snapshotTtlMs, source.snapshotTtlHours * 3600000) || typeof offer.price !== 'number' || !Number.isFinite(offer.price) || offer.price <= 0 || offer.price > 1000000 || !exactListing(offer.url, target.retailerSku)) return null;
  if (!['in-stock', 'out-of-stock', 'unknown'].includes(offer.availability) || offer.inStock !== (offer.availability === 'in-stock' ? true : offer.availability === 'out-of-stock' ? false : null)) return null;
  const stale = Date.parse(offer.expiresAt) <= now;
  // Select public fields explicitly: configuration approvals, credentials and stored extras stay private.
  return {
    schema: 1, policy: 'daily-checked-snapshot', productId: target.productId, sku: target.modelNumber, retailerSku: target.retailerSku,
    name: target.name, modelNumber: target.modelNumber, variant: target.variant, memoryVariant: target.memoryVariant, revision: target.revision, exactVariant: true,
    merchantId: source.merchantId, merchant: source.publisher, seller: target.seller, url: offer.url, region, currency: source.currency,
    price: offer.price, condition: target.condition, availability: offer.availability, inStock: offer.inStock, availabilityBasis: 'online-purchasable-not-store-inventory',
    checkedAt: offer.checkedAt, availabilityCheckedAt: offer.checkedAt, expiresAt: offer.expiresAt,
    charges: { tax: 'excluded', shipping: 'excluded' },
    source: { id: source.id, kind: 'authorized-retailer-api', publisher: source.publisher, url: offer.url, attribution: 'Best Buy', logoUrl: source.brandLogoUrl },
    stale, eligible: !stale && offer.inStock === true && offer.availability === 'in-stock'
  };
}
export function createMorningPriceService({ configuration = defaultConfiguration, fetchImpl = globalThis.fetch, clock = Date.now, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), timeoutMs = MORNING_POLICY.timeoutMs, token = () => crypto.randomUUID() } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MORNING_POLICY.timeoutMs) failure('invalid_timeout');
  const dbCaches = new WeakMap();
  function checkedConfig() { return validateConfiguration(configuration, clock()); }
  function memory(db) { if (!dbCaches.has(db)) dbCaches.set(db, { values: new Map(), pending: new Map() }); return dbCaches.get(db); }
  function invalidate(db) { dbCaches.delete(db); }
  async function cachedRead(db, key, read) {
    const cache = memory(db), now = clock(), hit = cache.values.get(key);
    if (hit && hit.until > now) return hit;
    if (cache.pending.has(key)) return cache.pending.get(key);
    const pending = read().then(result => {
      const entry = { ...result, until: clock() + result.ttl };
      if (cache.values.size >= 256) cache.values.delete(cache.values.keys().next().value);
      if (result.ttl > 0) cache.values.set(key, entry);
      return entry;
    }).finally(() => cache.pending.delete(key));
    cache.pending.set(key, pending); return pending;
  }
  async function health(db, sources) {
    const rows = await db.prepare('SELECT * FROM morning_price_source_health').all();
    const index = new Map((rows.results || []).map(row => [row.source_id, row]));
    return sources.map(source => publicHealth(index.get(source.id), source));
  }
  async function fetchRequest(request, env) {
    const url = new URL(request.url), statusRoute = url.pathname === '/api/v1/morning-prices/status';
    if (!statusRoute && url.pathname !== '/api/v1/morning-prices') return null;
    if (!['GET', 'HEAD'].includes(request.method)) return response({ status: 'method_not_allowed' }, 405);
    let query;
    try {
      if (statusRoute) { if ([...url.searchParams.keys()].length) failure('invalid_query'); }
      else query = queryIds(url);
    } catch (error) { return response({ status: 'invalid_request', errorCode: safeCode(error) }, 400, 0, request.method); }
    let config;
    try { config = checkedConfig(); } catch { return response({ ...basePayload(clock()), status: 'not_configured', blockers: ['reviewed_configuration'], offers: [] }, 200, 0, request.method); }
    const state = configurationState(env, config), now = clock(), base = basePayload(now);
    if (state.status !== 'configured') return response({ ...base, ...state, region: query?.region || null, currency: query ? query.region === 'CA' ? 'CAD' : 'USD' : null, offers: [], sources: [], unconfiguredAdapters: UNCONFIGURED_ADAPTERS }, 200, 0, request.method);
    if (query && !config.sources.some(source => source.region === query.region)) return response({ ...base, status: 'not_configured', blockers: ['reviewed_regional_source_access'], region: query.region, currency: query.region === 'CA' ? 'CAD' : 'USD', offers: [], sources: [], missingIds: query.ids, unconfiguredAdapters: UNCONFIGURED_ADAPTERS }, 200, 0, request.method);
    const db = env.MORNING_PRICES_DB, configKey = JSON.stringify(config), key = configKey + ':' + (statusRoute ? 'status:' + base.localDate : 'offers:' + base.localDate + ':' + query.region + ':' + query.ids.join(','));
    try {
      const read = await cachedRead(db, key, async () => {
        const currentNow = clock(), sources = await health(db, config.sources);
        if (statusRoute) return { payload: { ...basePayload(currentNow), status: 'configured', active: true, sources, configuredTargets: config.targets.length, unconfiguredAdapters: UNCONFIGURED_ADAPTERS }, ttl: MORNING_POLICY.responseCacheMs };
        const marks = query.ids.map(() => '?').join(','), sourceMarks = config.sources.map(() => '?').join(',');
        const data = await db.prepare(`SELECT observation_json,source_id,product_id,checked_at,expires_at,retained_until FROM (
          SELECT observation_json,source_id,product_id,checked_at,expires_at,retained_until,ROW_NUMBER() OVER (PARTITION BY source_id,product_id ORDER BY checked_at DESC,observation_id DESC) AS latest
          FROM morning_price_observations WHERE region=? AND product_id IN (${marks}) AND source_id IN (${sourceMarks}) AND retained_until>?
          ) WHERE latest=1`).bind(query.region, ...query.ids, ...config.sources.map(source => source.id), nowISO(currentNow)).all();
        const allowed = new Map(config.targets.map(target => [target.sourceId + ':' + target.productId, target])), sourceIndex = new Map(config.sources.map(source => [source.id, source]));
        const latest = new Map(); let retentionExpiry = MORNING_POLICY.responseCacheMs;
        for (const row of data.results || []) {
          const pair = row.source_id + ':' + row.product_id, target = allowed.get(pair), source = sourceIndex.get(row.source_id);
          if (!target || !source || latest.has(pair)) continue;
          const offer = storedOffer(row, target, source, query.region, currentNow);
          if (offer) { latest.set(pair, offer); retentionExpiry = Math.min(retentionExpiry, Date.parse(row.retained_until) - currentNow); }
        }
        const offers = [...latest.values()], qualifying = offers.filter(offer => offer.eligible).sort((a, b) => a.price - b.price || a.merchant.localeCompare(b.merchant)), lowest = Object.create(null);
        for (const offer of qualifying) if (!lowest[offer.productId]) lowest[offer.productId] = offer;
        const missingIds = query.ids.filter(id => !offers.some(offer => offer.productId === id));
        const expiry = offers.filter(offer => !offer.stale).reduce((value, offer) => Math.min(value, Date.parse(offer.expiresAt) - currentNow), MORNING_POLICY.responseCacheMs);
        return { payload: { ...basePayload(currentNow), status: !offers.length ? 'not_checked' : offers.some(offer => !offer.stale) ? 'daily_checked' : 'stale', region: query.region, currency: query.region === 'CA' ? 'CAD' : 'USD', offers, lowestByProduct: lowest, missingIds, sources }, ttl: Math.max(0, Math.min(MORNING_POLICY.responseCacheMs, expiry, retentionExpiry)) };
      });
      return response(read.payload, 200, Math.max(0, read.until - clock()), request.method);
    } catch { return response({ ...base, status: 'not_configured', blockers: ['datastore_unavailable'], offers: [] }, 503, 0, request.method); }
  }
  async function refresh(env, { scheduledTime } = {}) {
    const initial = clock(); let config;
    // Retention cleanup continues after collection is disabled or access is removed.
    const db = env.MORNING_PRICES_DB;
    if (db && typeof db.prepare === 'function') {
      try { await db.prepare('DELETE FROM morning_price_observations WHERE retained_until<=?').bind(nowISO(initial)).run(); }
      catch { return { status: 'not_configured', blockers: ['datastore_unavailable'], runs: [] }; }
    }
    try { config = checkedConfig(); } catch { return { status: 'not_configured', blockers: ['reviewed_configuration'], runs: [] }; }
    const state = configurationState(env, config); if (state.status !== 'configured') return { ...state, runs: [] };
    const local = torontoDateParts(initial), scheduled = scheduledTime === undefined ? local : torontoDateParts(scheduledTime);
    if (local.hour !== MORNING_POLICY.localHour || scheduled.hour !== MORNING_POLICY.localHour || local.localDate !== scheduled.localDate) return { status: 'outside_window', localDate: local.localDate, runs: [] };
    const runs = [];
    for (const source of config.sources) {
      const targets = config.targets.filter(target => target.sourceId === source.id);
      if (!targets.length) { runs.push({ sourceId: source.id, state: 'not_configured', accepted: 0, failed: 0 }); continue; }
      let lease;
      try { lease = await acquireLease(db, source.id, local.localDate, clock(), token()); }
      catch { runs.push({ sourceId: source.id, state: 'storage_failure', accepted: 0, failed: 0 }); continue; }
      if (lease.state !== 'acquired') { runs.push({ sourceId: source.id, state: lease.state, accepted: 0, failed: 0 }); continue; }
      const observations = [], errors = [];
      for (let start = 0; start < targets.length; start += MORNING_POLICY.batchSize) {
        const batch = targets.slice(start, start + MORNING_POLICY.batchSize);
        try {
          const products = await fetchBestBuyBatch(batch, env.BESTBUY_API_KEY, { fetchImpl, sleep, timeoutMs }), bySku = new Map(products.map(product => [String(product.sku), product]));
          const checkedAt = nowISO(clock());
          for (const target of batch) {
            try { if (!bySku.has(target.retailerSku)) failure('provider_product_missing'); observations.push(validateBestBuyProduct(bySku.get(target.retailerSku), target, source, checkedAt)); }
            catch (error) { errors.push({ productId: target.productId, code: safeCode(error) }); }
          }
        } catch (error) { for (const target of batch) errors.push({ productId: target.productId, code: safeCode(error) }); }
        if (start + MORNING_POLICY.batchSize < targets.length) await sleep(1000);
      }
      try { runs.push(await persistRun(db, source, local.localDate, lease, observations, errors, clock())); }
      catch { runs.push({ sourceId: source.id, state: 'storage_failure', accepted: 0, failed: targets.length }); }
    }
    invalidate(db);
    return { status: runs.some(run => ['failed', 'partial', 'storage_failure', 'lease_lost', 'retry_limit'].includes(run.state)) ? 'incomplete' : runs.some(run => ['backoff', 'leased'].includes(run.state)) ? 'deferred' : 'complete', localDate: local.localDate, runs };
  }
  function dryRun(env) {
    let config; try { config = checkedConfig(); } catch { return { status: 'not_configured', blockers: ['reviewed_configuration'], networkRequests: 0 }; }
    const state = configurationState(env, config), batches = config.sources.reduce((total, source) => total + Math.ceil(config.targets.filter(target => target.sourceId === source.id).length / MORNING_POLICY.batchSize), 0);
    return { ...state, networkRequests: 0, writes: 0, configuredSources: config.sources.length, exactTargets: config.targets.length, estimatedDailyRequests: batches, boundedRequestsWithRetries: batches * (MORNING_POLICY.maxRetries + 1), utcScheduleCandidates: ['0 11 * * *', '0 12 * * *'], requiresTorontoHourGuard: true, activated: false };
  }
  return { fetchRequest, refresh, scheduled: (controller, env) => refresh(env, { scheduledTime: controller.scheduledTime }), dryRun };
}
const service = createMorningPriceService();
export const handleMorningPriceRequest = (request, env) => service.fetchRequest(request, env);
export const scheduledMorningPrices = (controller, env) => service.scheduled(controller, env);
export const dryRunMorningPrices = env => service.dryRun(env);
