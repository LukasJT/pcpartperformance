import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  'https://www.canadacomputers.com/robots.txt',
  'https://www.memoryexpress.com/robots.txt',
  'https://nzxt.com/robots.txt',
  'https://nzxt.com/products/player-one.js',
  'https://nzxt.com/products/player-one',
  'https://nzxt.com/en-US/products/player-one.js',
  'https://nzxt.com/en-US/products/player-one',
  'https://www.canadacomputers.com/en/amd-motherboards/229128/msi-mag-b650-tomahawk-wifi-amd-atx-am5-motherboard-mag-b650-tomahawk-wifi.html',
  'https://www.canadacomputers.com/en/powered-by-nvidia/269805/msi-geforce-rtx-5070-ventus-3x-oc-gddr7-triple-fans-rtx-5070-12g-ventus-3x-oc.html',
  'https://www.memoryexpress.com/Products/MX00123889',
  'https://www.newegg.com/robots.txt',
  'https://www.newegg.com/amd-ryzen-7-9000-series-ryzen-7-9800x3d-granite-ridge-zen-5-socket-am5-desktop-cpu-processor/p/N82E16819113877',
  'https://www.newegg.com/samsung-1tb-990-pro-nvme-2-0/p/N82E16820147860'
];
const results = [];
for (const url of targets.filter(url => !process.argv.includes('--newegg-only') || url.includes('newegg.com'))) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'PCPartPerformance/1.0 (+https://www.pcpartperformance.com/methodology/)' }, signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    let originalProductState;
    const stateMatch = html.match(/window\.__initialState__\s*=\s*([\s\S]*?)<\/script>/);
    if (stateMatch) { try { const item = JSON.parse(stateMatch[1].trim().replace(/;$/, '')).ItemDetail; if (item) originalProductState = { ...Object.fromEntries(['Item', 'ItemNumber', 'Model', 'CountryCode', 'CurrencyCode', 'FinalPrice', 'Instock', 'IsActivated', 'PriceHideMark', 'Condition', 'ItemCondition', 'Seller', 'Currency', 'NewEggItemNumber'].map(key => [key, item[key]])), Description: { Title: item.Description?.Title, ProductName: item.Description?.ProductName }, conditionFields: Object.fromEntries(Object.entries(item).filter(([key]) => /condition|currency|status|refurb|openbox/i.test(key))) }; } catch { originalProductState = { error: 'unparseable-original-state' }; } }
    const result = { url, checkedAt, status: response.status, location: response.headers.get('location'), contentType: response.headers.get('content-type'), bytes: Buffer.byteLength(html), originalProductState,
      robotRules: url.endsWith('robots.txt') ? html.split(/\r?\n/).filter(line => /^(User-agent|Allow|Disallow):/.test(line)) : undefined,
      structuredProductRecords: [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match => { try { const node = JSON.parse(match[1]); return node?.['@type'] === 'Product' ? [{ name: node.name, sku: node.sku, mpn: node.mpn, offers: node.offers ? { price: node.offers.price, priceCurrency: node.offers.priceCurrency, availability: node.offers.availability, itemCondition: node.offers.itemCondition, url: node.offers.url, seller: node.offers.seller } : null }] : []; } catch { return []; } }),
      conditionMarkerCount: url.includes('newegg.com/') && !url.endsWith('robots.txt') ? [...html.matchAll(/(?:itemCondition|NewCondition|Condition:|Condition<|condition-label)/gi)].length : undefined
    };
    results.push(result);
    console.log(JSON.stringify(result));
  } catch (error) { const result = { url, checkedAt, error: error.name + ': ' + error.message }; results.push(result); console.log(JSON.stringify(result)); }
}
const out = path.join(root, 'docs/clarity-oct14');
await fs.mkdir(out, { recursive: true });
const name = process.argv.includes('--newegg-only') ? 'newegg-price-source-probes.json' : 'price-source-probes.json';
await fs.writeFile(path.join(out, name), JSON.stringify({ researchOnly: true, collectedAt: new Date().toISOString(), observations: results }, null, 2) + '\n');
