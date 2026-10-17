import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PUBLIC_SNAPSHOT_TARGETS, validatePublicPriceObservation, validatePublicPriceSnapshot } from './public-price-snapshot.mjs';
import { fetchRegisteredPublicPrice } from './public-price-fetch.mjs';
import {recordPriceHistory} from './completion-price-history-store.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = path.join(root, 'data/public-price-snapshot.json');
const key = row => [row.merchantId, row.region, row.productId].join(':');
const safeCode = error => typeof error?.code === 'string' && /^[a-z0-9_]{1,100}$/.test(error.code) ? error.code : 'source_read_failed';

export async function collectDailyPublicPrices({ previous = null, fetchImpl = (input, init) => globalThis.fetch(input, init), clock = Date.now } = {}) {
  const started = clock(); if (!Number.isFinite(started)) throw new TypeError('invalid_clock');
  const prior = validatePublicPriceSnapshot(previous, { now: started });
  const preserved = new Map(prior.observations.map(row => [key(row), row]));
  const queue = PUBLIC_SNAPSHOT_TARGETS.map((target, index) => ({ target, index }));
  const results = new Array(queue.length), observations = [];
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (queue.length) {
      const { target, index } = queue.shift(), attempted = clock();
      try {
        const raw = await fetchRegisteredPublicPrice(target, { fetchImpl, now: attempted });
        const validation = validatePublicPriceObservation(raw, { now: clock() });
        if (!validation.valid) throw Object.assign(new Error('snapshot_validation_failed'), { code: 'snapshot_validation_failed' });
        observations.push(validation.observation);
        results[index] = { productId: target.productId, merchantId: target.merchantId, region: target.region, state: 'refreshed', attemptedAt: new Date(attempted).toISOString() };
      } catch (error) {
        const earlier = preserved.get(key(target)), retained = earlier ? validatePublicPriceObservation(earlier, { now: clock() }) : null;
        if (retained?.valid) observations.push(retained.observation);
        results[index] = { productId: target.productId, merchantId: target.merchantId, region: target.region, state: retained?.valid ? 'retained_previous_observation' : 'unavailable', errorCode: safeCode(error), attemptedAt: new Date(attempted).toISOString() };
      }
    }
  }));
  const completed = clock();
  const stillFresh = observations.map(raw => validatePublicPriceObservation(raw, { now: completed })).filter(result => result.valid).map(result => result.observation).sort((a, b) => key(a).localeCompare(key(b)));
  return { schema: 1, policy: 'daily-checked-snapshot', generatedAt: new Date(completed).toISOString(), observations: stillFresh, runs: results,
    collection: { requested: PUBLIC_SNAPSHOT_TARGETS.length, refreshed: results.filter(row => row.state === 'refreshed').length, retained: results.filter(row => row.state === 'retained_previous_observation').length, failed: results.filter(row => row.state !== 'refreshed').length, accessMode: 'ordinary-public-get-no-proxy-no-cookies-no-challenge-bypass' } };
}

export async function writePublicPriceSnapshotAtomic(snapshot, outputPath = snapshotPath, { now = Date.now() } = {}) {
  const validated = validatePublicPriceSnapshot(snapshot, { now });
  if (!validated.valid) throw new TypeError('refuse_invalid_snapshot');
  const destination = path.resolve(outputPath), directory = path.dirname(destination);
  await fs.mkdir(directory, { recursive: true });
  const temporary = path.join(directory, '.public-price-snapshot-' + crypto.randomUUID() + '.tmp');
  let handle;
  try {
    handle = await fs.open(temporary, 'wx', 0o644);
    await handle.writeFile(JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
    await handle.sync(); await handle.close(); handle = null;
    await fs.rename(temporary, destination);
  } catch (error) { if (handle) await handle.close(); await fs.unlink(temporary).catch(() => {}); throw error; }
  return destination;
}

async function main() {
  if (process.argv.slice(2).some(argument => argument !== '--dry-run')) throw new TypeError('unsupported_argument');
  let previous = null;
  try { previous = JSON.parse(await fs.readFile(snapshotPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
  const snapshot = await collectDailyPublicPrices({ previous });
  if (!process.argv.includes('--dry-run')) { await writePublicPriceSnapshotAtomic(snapshot); await recordPriceHistory(snapshot); }
  console.log(JSON.stringify({ dryRun: process.argv.includes('--dry-run'), output: 'data/public-price-snapshot.json', ...snapshot.collection, observations: snapshot.observations.map(row => ({ productId: row.productId, region: row.region, price: row.price, currency: row.currency, inStock: row.inStock, condition: row.condition, checkedAt: row.checkedAt })), runs: snapshot.runs }, null, 2));
  if (!snapshot.collection.refreshed) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
