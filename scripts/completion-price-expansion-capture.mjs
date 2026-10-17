import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { COMPLETION_PRICE_TARGETS, fetchCompletionPriceTarget } from './completion-price-expansion.mjs';
import { PUBLIC_PRICE_POLICY, parseProductJSONLD } from './oct14-price-sources.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function collectCompletionPriceExpansion({ fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  const observations = [], failures = [], fixtures = [];
  for (let index = 0; index < COMPLETION_PRICE_TARGETS.length; index += 2) {
    await Promise.all(COMPLETION_PRICE_TARGETS.slice(index,index + 2).map(async target => {
      const checkedAt = now();
      try {
        const observation = await fetchCompletionPriceTarget(target, { now: checkedAt, fetchImpl: async (url, init) => {
          const response = await fetchImpl(url, init);
          if (!response.ok || !(response.headers.get('content-type') || '').includes('text/html')) return response;
          // Bounded capture of the public HTML before parsing, with only factual fields persisted.
          if (Number(response.headers.get('content-length')) > PUBLIC_PRICE_POLICY.maxBytes) return response;
          const reader = response.body.getReader(), chunks = []; let bytes = 0;
          try { while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.byteLength; if (bytes > PUBLIC_PRICE_POLICY.maxBytes) { await reader.cancel(); const error = new Error('response_oversize'); error.code = error.message; throw error; } chunks.push(next.value); } } finally { reader.releaseLock(); }
          const html = Buffer.concat(chunks).toString('utf8');
          const products = parseProductJSONLD(html).filter(row => row.sku === target.retailerSku).map(row => ({ '@context': 'https://schema.org', '@type': row['@type'], name: row.name, sku: row.sku, ...(row.mpn ? { mpn: row.mpn } : {}), offers: row.offers && { '@type': row.offers['@type'], price: row.offers.price, priceCurrency: row.offers.priceCurrency, availability: row.offers.availability, itemCondition: row.offers.itemCondition, url: row.offers.url, seller: row.offers.seller, priceValidUntil: row.offers.priceValidUntil } }));
          fixtures.push({ productId: target.productId, region: target.region, merchantId: target.merchantId, checkedAt: new Date(checkedAt).toISOString(), sourceUrl: target.listingUrl, responseStatus: response.status, responseBytes: bytes, responseSHA256: createHash('sha256').update(html).digest('hex'), fixtureKind: 'selected-original-structured-factual-fields', products });
          return new Response(html, { status: response.status, headers: { 'content-type': 'text/html; charset=utf-8' } });
        }});
        observations.push(observation);
      } catch (error) { failures.push({ productId: target.productId, merchantId: target.merchantId, region: target.region, url: target.listingUrl, attemptedAt: new Date(checkedAt).toISOString(), reason: error.code || 'source_network_error' }); }
    }));
  }
  return { schema: 1, researchOnly: true, generatedAt: new Date(now()).toISOString(), observations, failures, fixtures };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await collectCompletionPriceExpansion();
  const fixtureDir = path.join(root, 'scripts/fixtures/completion-price-expansion');
  await fs.mkdir(fixtureDir, { recursive: true });
  for (const fixture of result.fixtures) await fs.writeFile(path.join(fixtureDir, fixture.productId + '-' + fixture.region + '-' + fixture.merchantId + '.json'), JSON.stringify(fixture, null, 2) + '\n');
  const { fixtures, ...snapshot } = result;
  await fs.writeFile(path.join(root, 'data/completion-price-expansion-observations.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(JSON.stringify({ generatedAt: result.generatedAt, observations: result.observations.map(row => ({ productId: row.productId, merchant: row.merchant, region: row.region, currency: row.currency, price: row.price, inStock: row.inStock, checkedAt: row.checkedAt })), failures: result.failures, fixtures: fixtures.length }, null, 2));
}
