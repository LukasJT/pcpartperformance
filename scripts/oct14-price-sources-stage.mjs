import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicPriceCollector, PUBLIC_PRICE_TARGETS } from './oct14-price-sources.mjs';
import { NEWEGG_PUBLIC_TARGET, fetchNeweggPublicTarget } from './oct14-price-sources-newegg.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const collector = createPublicPriceCollector();
const us = process.argv.includes('--us-only');
let result;
if (us) {
  const offer = await fetchNeweggPublicTarget(NEWEGG_PUBLIC_TARGET);
  result = { schema: 1, status: 'checked', policy: 'daily-checked-snapshot', region: 'US', currency: 'USD', checkedAt: offer.checkedAt, offers: [offer], lowestByProduct: offer.eligibleForNewPurchaseMinimum ? { [offer.productId]: offer } : {}, results: [{ productId: offer.productId, state: offer.eligibleForNewPurchaseMinimum ? 'checked' : 'condition_requires_verification' }] };
} else result = await collector.collect(PUBLIC_PRICE_TARGETS.map(target => target.productId));
await fs.mkdir(path.join(root, 'docs/clarity-oct14'), { recursive: true });
await fs.writeFile(path.join(root, 'docs/clarity-oct14/' + (us ? 'public-price-observations-us.json' : 'public-price-observations.json')), JSON.stringify({ ...result, deployment: 'not_activated_by_this_command', attribution: 'Public retailer observations; source terms and owner authorization are recorded separately.' }, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, requested: result.results.length, observed: result.offers.length, eligibleInStock: Object.keys(result.lowestByProduct).length, results: result.results, offers: result.offers.map(offer => ({ productId: offer.productId, retailerMpn: offer.retailerMpn, price: offer.price, currency: offer.currency, inStock: offer.inStock, checkedAt: offer.checkedAt })) }, null, 2));
if (!result.offers.length) process.exitCode = 1;
