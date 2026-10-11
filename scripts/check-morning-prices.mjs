import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createMorningPriceService, validateConfiguration, validateBestBuyProduct, torontoDateParts, MORNING_POLICY, dryRunMorningPrices } from './morning-price-service.mjs';

if (process.argv.includes('--dry-run')) { console.log(JSON.stringify(dryRunMorningPrices({}), null, 2)); process.exit(0); }

// All approvals, products and prices below are SYNTHETIC TEST FIXTURES.
// They exercise documented provider fields and grant no production source access.
const FIXTURE_LABEL = 'Synthetic test fixture; no actual account, license, review or observation';
const initialTime = Date.parse('2026-10-11T11:00:00.000Z');
const iso = time => new Date(time).toISOString();
const review = { status: 'approved', kind: 'human', reviewer: FIXTURE_LABEL, checkedAt: '2025-01-01T00:00:00.000Z', authorizationRef: 'SYNTHETIC-ONLY' };
function configuration(count = 1) {
  return {
    schema: 1,
    sources: [{ id: 'synthetic-bestbuy-us', adapter: 'bestbuy-us-products', region: 'US', currency: 'USD', merchantId: 'bestbuy-us', publisher: 'Best Buy', seller: 'Best Buy', brandLogoUrl: 'https://developer.bestbuy.com/images/bestbuy-logo.png', brandAssetAuthorization: 'SYNTHETIC-ASSET-REVIEW-ONLY', snapshotTtlHours: 24, review: { ...review }, permission: { apiAccess: true, display: true, temporaryStorage: true, firstPartyOnlyConfirmed: true, retentionHours: 72, datastoreBackupStorageConfirmed: true, datastoreBackupAuthorizationRef: 'SYNTHETIC-BACKUP-PERMISSION-ONLY' } }],
    targets: Array.from({ length: count }, (_, index) => ({ productId: 'synthetic-model-' + (index + 1), sourceId: 'synthetic-bestbuy-us', retailerSku: String(1000001 + index), modelNumber: 'SYNTHETIC-MODEL-' + (index + 1), name: 'Synthetic exact model ' + (index + 1), exactVariant: true, region: 'US', currency: 'USD', condition: 'new', seller: 'Best Buy', variant: 'Synthetic variant', memoryVariant: '16GB synthetic', revision: null, listingUrl: 'https://www.bestbuy.com/site/synthetic/' + (1000001 + index) + '.p?skuId=' + (1000001 + index), review: { ...review } }))
  };
}
function product(target, overrides = {}) {
  return { sku: Number(target.retailerSku), modelNumber: target.modelNumber, name: target.name, url: target.listingUrl, salePrice: 249.99, condition: 'New', preowned: false, onlineAvailability: true, priceUpdateDate: '2025-01-01T00:00:00Z', onlineAvailabilityUpdateDate: '2025-01-01T00:00:00Z', priceRestriction: null, ...overrides };
}
const providerResponse = products => Response.json({ products, totalPages: 1, partial: false });
class D1TestDouble {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(fs.readFileSync(new URL('../migrations/0001_morning_prices.sql', import.meta.url), 'utf8'));
    this.calls = [];
    this.beforeRead = null;
  }
  prepare(sql) {
    const db = this;
    function bound(args) {
      return {
        bind: (...values) => bound(values),
        async first(column) { db.calls.push({ kind: 'first', sql }); if (db.beforeRead && /^SELECT/i.test(sql)) await db.beforeRead(sql); const row = db.sqlite.prepare(sql).get(...args); return column ? row?.[column] ?? null : row ? { ...row } : null; },
        async all() { db.calls.push({ kind: 'all', sql }); if (db.beforeRead) await db.beforeRead(sql); return { success: true, results: db.sqlite.prepare(sql).all(...args).map(row => ({ ...row })) }; },
        async run() { db.calls.push({ kind: 'run', sql }); const result = db.sqlite.prepare(sql).run(...args); return { success: true, meta: { changes: Number(result.changes) } }; },
        _sync() { const result = db.sqlite.prepare(sql).run(...args); return { success: true, meta: { changes: Number(result.changes) } }; }
      };
    }
    return bound([]);
  }
  async batch(statements) {
    this.calls.push({ kind: 'batch', count: statements.length });
    this.sqlite.exec('BEGIN TRANSACTION');
    try { const result = statements.map(statement => statement._sync()); this.sqlite.exec('COMMIT'); return result; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
  row(sql, ...args) { const row = this.sqlite.prepare(sql).get(...args); return row ? { ...row } : null; }
  count(table) { return this.row('SELECT count(*) AS total FROM ' + table).total; }
  close() { this.sqlite.close(); }
}
function harness(count = 1, overrides = {}) {
  const config = configuration(count), db = new D1TestDouble(); let time = initialTime, requests = 0, token = 0;
  let provider = async () => providerResponse(config.targets.map(target => product(target)));
  const sleeps = [];
  const service = createMorningPriceService({ configuration: config, clock: () => time, token: () => 'test-lease-' + (++token), fetchImpl: async (url, options) => { requests++; return provider(url, options); }, sleep: async ms => { sleeps.push(ms); }, ...overrides });
  const env = { MORNING_PRICES_ENABLED: 'true', MORNING_PRICES_DB: db, BESTBUY_API_KEY: 'SYNTHETIC-PRIVATE-KEY' };
  return { config, db, env, service, sleeps, now: () => time, advance: ms => { time += ms; }, setTime: value => { time = Date.parse(value); }, requests: () => requests, setProvider: value => { provider = value; }, api: (query = 'ids=synthetic-model-1&region=US', method = 'GET') => service.fetchRequest(new Request('https://example.invalid/api/v1/morning-prices?' + query, { method }), env), status: () => service.fetchRequest(new Request('https://example.invalid/api/v1/morning-prices/status'), env) };
}
let checks = 0;
async function test(name, execute) { await execute(); checks++; console.log('PASS ' + name); }

await test('empty reviewed registry cannot request data or activate a schedule', async () => {
  let requests = 0;
  const service = createMorningPriceService({ clock: () => initialTime, fetchImpl: async () => { requests++; throw new Error('No network allowed'); } });
  const result = await service.refresh({ MORNING_PRICES_ENABLED: 'true' });
  assert.equal(result.status, 'not_configured'); assert.equal(requests, 0);
  const response = await service.fetchRequest(new Request('https://example.invalid/api/v1/morning-prices?ids=rx_9070&region=CA'), {});
  const payload = await response.json(); assert.equal(payload.status, 'not_configured'); assert.deepEqual(payload.offers, []); assert(payload.blockers.includes('datastore'));
  const dry = service.dryRun({}); assert.equal(dry.networkRequests, 0); assert.equal(dry.activated, false); assert.equal(dry.estimatedDailyRequests, 0);
});
await test('human source and exact target approvals, retention and credentials gate collection', async () => {
  const cases = [config => { config.sources[0].review.status = 'pending'; }, config => { config.sources[0].permission.firstPartyOnlyConfirmed = false; }, config => { config.targets[0].exactVariant = false; }, config => { config.targets[0].retailerSku = 'https://evil.invalid'; }, config => { config.targets[0].memoryVariant = undefined; }, config => { config.sources[0].permission.retentionHours = 73; }, config => { config.sources[0].snapshotTtlHours = 25; }, config => { config.sources[0].adapter = 'amazon-us'; }, config => { config.targets[0].listingUrl = 'https://www.bestbuy.com@evil.invalid/1000001.p'; }, config => { config.targets[0].listingUrl += '&token=private'; }];
  for (const change of cases) { const config = configuration(); change(config); assert.throws(() => validateConfiguration(config, initialTime)); }
  const extended = configuration(); extended.sources[0].permission = { ...extended.sources[0].permission, retentionHours: 8760, extendedHistory: true, extendedHistoryAuthorizationRef: 'SYNTHETIC-EXPLICIT-EXTENDED-LICENSE' }; assert.equal(validateConfiguration(extended, initialTime).sources[0].permission.retentionHours, 8760);
  const noBackupPermission = configuration(); noBackupPermission.sources[0].permission.datastoreBackupStorageConfirmed = false; assert.throws(() => validateConfiguration(noBackupPermission, initialTime));
  const noBackupReference = configuration(); delete noBackupReference.sources[0].permission.datastoreBackupAuthorizationRef; assert.throws(() => validateConfiguration(noBackupReference, initialTime));
  const h = harness(); delete h.env.BESTBUY_API_KEY; assert.equal((await h.service.refresh(h.env)).status, 'not_configured'); assert.equal(h.requests(), 0); h.db.close();
});
await test('feature disabled by default, dry run bounds provider request counts and exposes no secret', async () => {
  const h = harness(100); delete h.env.MORNING_PRICES_ENABLED;
  assert.equal((await h.service.refresh(h.env)).status, 'disabled'); assert.equal(h.requests(), 0); assert.equal(h.db.count('morning_price_runs'), 0);
  h.env.MORNING_PRICES_ENABLED = 'true'; const result = h.service.dryRun(h.env); assert.equal(result.estimatedDailyRequests, 4); assert.equal(result.boundedRequestsWithRetries, 8); assert.equal(result.writes, 0); assert(!JSON.stringify(result).includes(h.env.BESTBUY_API_KEY)); h.db.close();
});
await test('approved logo is mandatory and restricted to the documented official asset or approved repository path', async () => {
  for (const value of [undefined, 'https://evil.invalid/logo.png', 'https://developer.bestbuy.com.evil.invalid/images/bestbuy-logo.png', 'https://developer.bestbuy.com/images/other.png', 'https://developer.bestbuy.com/images/bestbuy-logo.png?key=secret', '/assets/retailers/../logo.svg', 'data:image/png;base64,anything']) {
    const config = configuration(); config.sources[0].brandLogoUrl = value; assert.throws(() => validateConfiguration(config, initialTime));
  }
  const missingReview = configuration(); delete missingReview.sources[0].brandAssetAuthorization; assert.throws(() => validateConfiguration(missingReview, initialTime));
  const h = harness(); h.config.sources[0].brandLogoUrl = '/assets/retailers/bestbuy-approved.svg'; await h.service.refresh(h.env);
  const payload = await (await h.api()).json(); assert.equal(payload.offers[0].source.logoUrl, '/assets/retailers/bestbuy-approved.svg'); assert(!JSON.stringify(payload).includes('SYNTHETIC-ASSET-REVIEW-ONLY')); h.db.close();
});
await test('Toronto date and seven oclock guard choose one DST candidate, including transitions', async () => {
  const dates = [['2026-01-15T12:00:00Z', 7], ['2026-01-15T11:00:00Z', 6], ['2026-07-15T11:00:00Z', 7], ['2026-07-15T12:00:00Z', 8], ['2026-03-08T11:00:00Z', 7], ['2026-11-01T12:00:00Z', 7]];
  for (const [date, hour] of dates) assert.equal(torontoDateParts(Date.parse(date)).hour, hour);
  assert.equal(torontoDateParts(Date.parse('2026-10-12T03:00:00Z')).localDate, '2026-10-11');
  const h = harness(); h.setTime('2026-10-11T12:00:00Z'); assert.equal((await h.service.refresh(h.env)).status, 'outside_window'); assert.equal(h.requests(), 0);
  h.setTime('2026-10-11T11:00:00Z'); assert.equal((await h.service.refresh(h.env, { scheduledTime: Date.parse('2026-10-11T12:00:00Z') })).status, 'outside_window'); assert.equal(h.requests(), 0); h.db.close();
});
await test('provider validation rejects wrong model, SKU, currency, seller, condition, stock and timestamps', async () => {
  const config = configuration(), target = config.targets[0], source = config.sources[0];
  const cases = [{ sku: 1000002 }, { modelNumber: 'ADJACENT-MODEL' }, { salePrice: '249.99' }, { salePrice: 0.001 }, { salePrice: -1 }, { salePrice: Infinity }, { currency: 'CAD' }, { region: 'CA' }, { seller: 'Marketplace seller' }, { condition: 'Refurbished' }, { preowned: true }, { onlineAvailability: 'yes' }, { priceUpdateDate: '2026-10-11T11:01:00Z' }, { onlineAvailabilityUpdateDate: '2026-02-30T00:00:00Z' }, { priceRestriction: 'MAP' }, { url: 'https://www.bestbuy.com/site/1000002.p' }];
  for (const change of cases) assert.throws(() => validateBestBuyProduct(product(target, change), target, source, iso(initialTime)));
  const unknown = validateBestBuyProduct(product(target, { onlineAvailability: null }), target, source, iso(initialTime)); assert.equal(unknown.availability, 'unknown'); assert.equal(unknown.inStock, null); assert.equal(Date.parse(unknown.expiresAt) - Date.parse(unknown.checkedAt), MORNING_POLICY.snapshotTtlMs);
  const click = 'https://api.bestbuy.com/click/syntheticPublicLink/1000001/pdp'; assert.equal(validateBestBuyProduct(product(target, { url: click }), target, source, iso(initialTime)).url, click);
  for (const url of ['https://api.bestbuy.com/click/-/1000002/pdp', 'https://api.bestbuy.com/v1/products/1000001.json?apiKey=secret', 'https://api.bestbuy.com/click/-/1000001/cart', 'https://www.bestbuy.com/site/1000001.p?skuId=1000002']) assert.throws(() => validateBestBuyProduct(product(target, { url }), target, source, iso(initialTime)));
});
await test('successful run stores durable history and truthful daily checked response and health', async () => {
  const h = harness(); const result = await h.service.refresh(h.env); assert.equal(result.runs[0].state, 'succeeded'); assert.equal(result.runs[0].accepted, 1);
  assert.equal(h.db.count('morning_price_observations'), 1); assert.equal(h.db.count('morning_price_runs'), 1);
  const response = await h.api(), payload = await response.json(); assert.equal(payload.status, 'daily_checked'); assert.equal(payload.offers[0].policy, 'daily-checked-snapshot'); assert.equal(payload.offers[0].eligible, true); assert.equal(payload.lowestByProduct['synthetic-model-1'].price, 249.99); assert.equal(payload.currentOfferPolicy, 'separate-15-minute-policy'); assert.equal(payload.currency, 'USD'); assert.equal(response.headers.get('Cache-Control'), 'public, max-age=900');
  assert.equal(payload.sources[0].lastSuccessfulAt, iso(initialTime)); assert(!JSON.stringify(payload).includes('SYNTHETIC-PRIVATE-KEY')); assert(!JSON.stringify(payload).includes('authorizationRef'));
  const status = await (await h.status()).json(); assert.equal(status.configuredTargets, 1); assert.equal(status.sources[0].state, 'healthy'); h.db.close();
});
await test('parallel scheduled triggers lease the same date/source once, successful reruns are idempotent', async () => {
  const h = harness(); let release; const held = new Promise(resolve => { release = resolve; });
  h.setProvider(async () => { await held; return providerResponse(h.config.targets.map(target => product(target))); });
  const first = h.service.refresh(h.env), second = h.service.refresh(h.env);
  await new Promise(resolve => setTimeout(resolve, 5)); release(); const results = await Promise.all([first, second]);
  assert.equal(h.requests(), 1); assert.deepEqual(results.map(result => result.runs[0].state).sort(), ['leased', 'succeeded']);
  const rerun = await h.service.refresh(h.env); assert.equal(rerun.runs[0].state, 'already_checked'); assert.equal(h.requests(), 1); assert.equal(h.db.count('morning_price_observations'), 1); assert.equal(h.db.row('SELECT attempts FROM morning_price_runs').attempts, 1); h.db.close();
});
await test('partial and failed checks never advance last successful timestamp, and backoff bounds retries', async () => {
  const h = harness(2); await h.service.refresh(h.env); const old = iso(h.now()); h.advance(86400000);
  h.setProvider(async () => providerResponse([product(h.config.targets[0]), product(h.config.targets[1], { modelNumber: 'WRONG' })]));
  const partial = await h.service.refresh(h.env); assert.equal(partial.runs[0].state, 'partial'); assert.equal(partial.runs[0].accepted, 1); assert.equal(partial.runs[0].failed, 1);
  const health = h.db.row('SELECT * FROM morning_price_source_health'); assert.equal(health.last_successful_at, old); assert.equal(health.consecutive_failures, 1); assert.equal(health.backoff_until, iso(h.now() + 900000));
  const calls = h.requests(); assert.equal((await h.service.refresh(h.env)).runs[0].state, 'backoff'); assert.equal(h.requests(), calls);
  h.advance(900000); h.setProvider(async () => new Response('Forbidden', { status: 403 }));
  const failed = await h.service.refresh(h.env); assert.equal(failed.runs[0].state, 'failed'); assert.equal(h.db.row('SELECT last_successful_at FROM morning_price_source_health').last_successful_at, old); assert.equal(h.requests(), calls + 1); assert.equal(h.db.count('morning_price_observations'), 3); h.db.close();
});
await test('failed daily runs can recover under their lease, with at most three attempts per date', async () => {
  const h = harness(); h.setProvider(async () => new Response('No', { status: 403 })); await h.service.refresh(h.env); h.advance(900000); await h.service.refresh(h.env); h.advance(1800000); await h.service.refresh(h.env);
  assert.equal(h.db.row('SELECT attempts FROM morning_price_runs').attempts, 3);
  h.db.sqlite.prepare('UPDATE morning_price_source_health SET backoff_until=NULL').run(); assert.equal((await h.service.refresh(h.env)).runs[0].state, 'retry_limit'); assert.equal(h.requests(), 3); h.db.close();
  const recovered = harness(); recovered.setProvider(async () => new Response('No', { status: 403 })); await recovered.service.refresh(recovered.env); recovered.advance(900000); recovered.setProvider(async () => providerResponse([product(recovered.config.targets[0])])); assert.equal((await recovered.service.refresh(recovered.env)).runs[0].state, 'succeeded'); assert.equal(recovered.db.row('SELECT consecutive_failures FROM morning_price_source_health').consecutive_failures, 0); recovered.db.close();
});
await test('expired run cannot overwrite a replacement lease, observations or source health', async () => {
  const h = harness(); let release, calls = 0; const held = new Promise(resolve => { release = resolve; });
  h.setProvider(async () => { const call = ++calls; if (call === 1) await held; return providerResponse([product(h.config.targets[0], { salePrice: call === 1 ? 100 : 200 })]); });
  const oldRun = h.service.refresh(h.env); await new Promise(resolve => setTimeout(resolve, 5)); h.advance(MORNING_POLICY.leaseMs + 1);
  const replacement = await h.service.refresh(h.env); assert.equal(replacement.runs[0].state, 'succeeded'); const success = h.db.row('SELECT last_successful_at FROM morning_price_source_health').last_successful_at;
  release(); const old = await oldRun; assert.equal(old.runs[0].state, 'lease_lost'); assert.equal(old.runs[0].accepted, 0); assert.equal(h.db.count('morning_price_observations'), 1); assert.equal(h.db.row('SELECT last_successful_at FROM morning_price_source_health').last_successful_at, success); assert.equal((await (await h.api()).json()).offers[0].price, 200); h.db.close();
});
await test('D1 batch failure rolls back observations and never records a successful check', async () => {
  const h = harness(); h.db.sqlite.exec("CREATE TEMP TRIGGER synthetic_abort BEFORE UPDATE ON morning_price_runs BEGIN SELECT RAISE(ABORT, 'Synthetic transaction failure'); END");
  const failed = await h.service.refresh(h.env); assert.equal(failed.runs[0].state, 'storage_failure'); assert.equal(h.db.count('morning_price_observations'), 0); assert.equal(h.db.row('SELECT state FROM morning_price_runs').state, 'running'); assert.equal(h.db.row('SELECT last_successful_at FROM morning_price_source_health').last_successful_at, null);
  h.db.sqlite.exec('DROP TRIGGER synthetic_abort'); h.advance(MORNING_POLICY.leaseMs + 1); assert.equal((await h.service.refresh(h.env)).runs[0].state, 'succeeded'); assert.equal(h.db.count('morning_price_observations'), 1); h.db.close();
});
await test('upstream transient failures have exactly one retry and only the fixed official endpoint', async () => {
  const h = harness(); let calls = 0;
  h.setProvider(async (value, options) => {
    const url = new URL(value); assert.equal(url.origin, 'https://api.bestbuy.com'); assert.equal(url.searchParams.get('apiKey'), h.env.BESTBUY_API_KEY); assert.equal(options.redirect, 'error'); assert.equal(options.method, 'GET'); assert(url.pathname.includes('1000001'));
    return ++calls === 1 ? new Response('Rate limit', { status: 429 }) : providerResponse([product(h.config.targets[0])]);
  });
  assert.equal((await h.service.refresh(h.env)).runs[0].state, 'succeeded'); assert.equal(calls, 2); assert.deepEqual(h.sleeps, [1000]); h.db.close();
});
await test('timeout is bounded to eight seconds in production and retries once with sanitized health', async () => {
  assert.equal(MORNING_POLICY.timeoutMs, 8000); assert.throws(() => createMorningPriceService({ timeoutMs: 8001 }));
  const h = harness(1, { timeoutMs: 8 });
  h.setProvider(async (url, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('Synthetic timeout with secret https://private.invalid')), { once: true })));
  const result = await h.service.refresh(h.env); assert.equal(result.runs[0].errorCode, 'provider_timeout'); assert.equal(h.requests(), 2); assert.equal(h.db.row('SELECT error_code FROM morning_price_source_health').error_code, 'provider_timeout'); assert(!JSON.stringify(result).includes('private.invalid')); h.db.close();
});
await test('oversized, malformed, redirected, partial and duplicate provider payloads fail closed', async () => {
  const h = harness();
  const responses = [() => new Response('tiny', { headers: { 'Content-Type': 'application/json', 'Content-Length': String(MORNING_POLICY.maxResponseBytes + 1) } }), () => new Response('x'.repeat(MORNING_POLICY.maxResponseBytes + 1), { headers: { 'Content-Type': 'application/json' } }), () => new Response('{broken', { headers: { 'Content-Type': 'application/json' } }), () => new Response('<html>Changed</html>', { headers: { 'Content-Type': 'text/html' } }), () => Response.json({ products: [product(h.config.targets[0])], partial: true }), () => providerResponse([product(h.config.targets[0]), product(h.config.targets[0])])];
  for (const build of responses) { h.setProvider(async () => build()); const result = await h.service.refresh(h.env); assert.equal(result.runs[0].state, 'failed'); assert.equal(h.db.count('morning_price_observations'), 0); h.advance(86400000); }
  assert.equal(h.requests(), responses.length); h.db.close();
});
await test('stable IDs are bounded to fifty and request fields cannot become upstream URLs', async () => {
  const h = harness();
  const queries = ['ids=https%3A%2F%2Fevil.invalid&region=US', 'ids=good&url=https%3A%2F%2Fevil.invalid', 'ids=one,,two&region=US', 'ids=one&region=GB', 'ids=one&ids=two', 'ids=one&region=US&region=CA', 'ids=' + Array.from({ length: 51 }, (_, index) => 'id' + index).join(',')];
  for (const query of queries) assert.equal((await h.api(query)).status, 400);
  assert.equal((await h.api('ids=' + Array.from({ length: 50 }, (_, index) => 'id_' + index).join(',') + '&region=US')).status, 200);
  const post = await h.api('ids=one', 'POST'); assert.equal(post.status, 405); assert.equal(post.headers.get('Allow'), 'GET, HEAD');
  const head = await h.api('ids=one', 'HEAD'); assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.equal(await h.service.fetchRequest(new Request('https://example.invalid/api/v1/other'), h.env), null); assert.equal(h.requests(), 0); assert.equal(h.db.count('morning_price_runs'), 0); h.db.close();
});
await test('memory response cache deduplicates concurrent reads, lasts fifteen minutes and stays read only', async () => {
  const h = harness(); await h.service.refresh(h.env); h.db.calls = [];
  let release; const held = new Promise(resolve => { release = resolve; }); h.db.beforeRead = async () => held;
  const reads = [h.api(), h.api()]; await new Promise(resolve => setTimeout(resolve, 5)); release(); await Promise.all(reads); h.db.beforeRead = null;
  assert.equal(h.db.calls.filter(call => call.kind === 'all').length, 2); // One health read and one offers read.
  await h.api(); assert.equal(h.db.calls.filter(call => call.kind === 'all').length, 2);
  h.advance(MORNING_POLICY.responseCacheMs); await h.api(); assert.equal(h.db.calls.filter(call => call.kind === 'all').length, 4); assert(h.db.calls.every(call => ['all', 'first'].includes(call.kind))); h.db.close();
});
await test('snapshot expiry caps both memory and HTTP cache even inside the fifteen minute window', async () => {
  const h = harness(); await h.service.refresh(h.env); h.advance(MORNING_POLICY.snapshotTtlMs - 5000);
  const response = await h.api(); assert.equal(response.headers.get('Cache-Control'), 'public, max-age=5'); assert.equal((await response.json()).offers[0].eligible, true);
  h.advance(5000); const payload = await (await h.api()).json(); assert.equal(payload.status, 'stale'); assert.equal(payload.offers[0].eligible, false); assert.deepEqual(payload.lowestByProduct, {}); h.db.close();
});
await test('newest stock unknown observation suppresses older in stock prices and CA never receives US offers', async () => {
  const h = harness(); await h.service.refresh(h.env); h.advance(86400000);
  h.setProvider(async () => providerResponse([product(h.config.targets[0], { onlineAvailability: null, salePrice: 199.99 })])); await h.service.refresh(h.env);
  const payload = await (await h.api()).json(); assert.equal(payload.offers.length, 1); assert.equal(payload.offers[0].inStock, null); assert.equal(payload.offers[0].eligible, false); assert.deepEqual(payload.lowestByProduct, {}); assert.equal(h.db.count('morning_price_observations'), 2);
  const ca = await (await h.api('ids=synthetic-model-1&region=CA')).json(); assert.equal(ca.currency, 'CAD'); assert.deepEqual(ca.offers, []); assert.deepEqual(ca.missingIds, ['synthetic-model-1']); h.db.close();
});
await test('retention cleanup leaves one day of headroom before the licensed limit, even when disabled', async () => {
  const h = harness(); await h.service.refresh(h.env); h.advance(86400000); await h.service.refresh(h.env); assert.equal(h.db.count('morning_price_observations'), 2);
  h.advance(86400000); delete h.env.MORNING_PRICES_ENABLED; const requests = h.requests(); assert.equal((await h.service.refresh(h.env)).status, 'disabled'); assert.equal(h.db.count('morning_price_observations'), 1); assert.equal(h.requests(), requests); assert.equal(h.db.count('morning_price_runs'), 2); h.db.close();
});
await test('cached stale content cannot remain visible after its retained deadline', async () => {
  const h = harness(); await h.service.refresh(h.env); h.advance(2 * 86400000 - 1000);
  const response = await h.api(); assert.equal(response.headers.get('Cache-Control'), 'public, max-age=1'); assert.equal((await response.json()).offers.length, 1);
  h.advance(1000); const payload = await (await h.api()).json(); assert.equal(payload.offers.length, 0); h.db.close();
});
await test('changed approval invalidates cache and public rows cannot disclose injected fields', async () => {
  const h = harness(); await h.service.refresh(h.env);
  const stored = JSON.parse(h.db.row('SELECT observation_json FROM morning_price_observations').observation_json); stored.privateCredential = 'DO-NOT-EXPOSE'; stored.review = { authorizationRef: 'PRIVATE-REVIEW' };
  h.db.sqlite.prepare('UPDATE morning_price_observations SET observation_json=?').run(JSON.stringify(stored));
  const first = await (await h.api()).json(); assert(!JSON.stringify(first).includes('DO-NOT-EXPOSE')); assert(!JSON.stringify(first).includes('PRIVATE-REVIEW'));
  h.config.targets[0].modelNumber = 'CHANGED-IDENTITY'; const second = await (await h.api()).json(); assert.equal(second.offers.length, 0);
  h.config.sources[0].review.status = 'pending'; const third = await (await h.api()).json(); assert.equal(third.status, 'not_configured'); assert.equal(third.offers.length, 0); h.db.close();
});
console.log(checks + ' morning price service checks passed. Provider fixtures and approval records are synthetic.');
