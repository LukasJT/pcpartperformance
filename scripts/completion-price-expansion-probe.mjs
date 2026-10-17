// Research-only fixed public pages. Does not alter a price registry or live feed.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProductJSONLD } from './oct14-price-sources.mjs';

const primaryUrls = [
  'https://www.canadacomputers.com/en/amd-desktop-processors/216441/amd-ryzen-5-5600-6-core-12-thread-7nm-zen-3-processor-with-cooler-65w-100-100000927box.html',
  'https://www.canadacomputers.com/en/amd-desktop-processors/233960/amd-ryzen-5-7600-6-core-12thread-5nm-with-wraith-stealth-cooler-100-100001015box.html',
  'https://www.canadacomputers.com/en/desktop-memory/183957/corsair-vengeance-lpx-32gb-2x16gb-ddr4-3200mhz-cl16-udimm-cmk32gx4m2e3200c16.html',
  'https://www.canadacomputers.com/en/desktop-memory/96846/corsair-vengeance-lpx-16gb-2x8gb-ddr4-3200mhz-cl16-udimm-cmk16gx4m2b3200c16.html',
  'https://www.canadacomputers.com/en/small-form-factor-mini-itx-cases/137092/cooler-master-masterbox-q300l-matx-case-w-magnetic-design-dust-filter-mcb-q300l-kann-s00.html',
  'https://www.canadacomputers.com/en/amd-motherboards/169637/msi-b550m-pro-vdh-wifi-amd-am4-b550-ddr4-b550m-pro-vdh-wifi.html',
  'https://www.canadacomputers.com/en/powered-by-nvidia/273692/asus-dual-geforce-rtx-5060-8gb-gddr7-oc-edition-dual-rtx5060-o8g.html',
  'https://www.bestbuy.com/robots.txt',
  'https://www.bestbuy.com/product/amd-ryzen-5-5600-3-5-ghz-six-core-am4-processor-black/JXKQHH5CTQ',
  'https://www.bestbuy.com/site/corsair-rmx-series-rm650x-80-plus-gold-fully-modular-atx-power-supply-black/6492019.p',
  'https://www.bestbuy.ca/robots.txt',
  'https://www.bestbuy.ca/en-ca/product/corsair-vengeance-lpx-32gb-2-x-16gb-ddr4-3200mhz-desktop-memory-cmk32gx4m2e3200c16/15300640',
  'https://www.newegg.com/amd-ryzen-5-5000-series-ryzen-5-5600-vermeer-socket-am4-desktop-cpu-processor/p/N82E16819113736',
  'https://www.newegg.com/corsair-rmx-series-rm650x-atx12v-eps12v-650-w-80-plus-gold-certified-power-supply-cp-9020198-na/p/N82E16817139270'
];
const additionalUrls = [
  'https://www.canadacomputers.com/en/amd-desktop-processors/216442/amd-ryzen-5-5500-6-core-12-thread-7nm-processor-with-cooler-65w-100-100000457box.html',
  'https://www.canadacomputers.com/en/power-supplies/242335/be-quiet-pure-power-12-m-850w-gold-atx-power-supply-black-bn505.html',
  'https://www.canadacomputers.com/en/desktop-laptop-internal-ssds/265360/samsung-990-evo-plus-1tb-m-2-nvme-pcie-4-0-solid-state-drive-mz-v9s1t0b-am.html',
  'https://www.canadacomputers.com/en/desktop-laptop-internal-ssds/261114/kingston-nv3-1tb-nvme-pcie-4x4-ssd-snv3s-1000g.html',
  'https://www.corsair.com/robots.txt',
  'https://www.corsair.com/us/en/p/memory/cmk32gx4m2e3200c16/vengeance-lpx-32gb-2-x-16gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk32gx4m2e3200c16',
  'https://www.samsung.com/robots.txt',
  'https://www.samsung.com/us/memory-storage/nvme-ssd/990-evo-plus-gen4-nvme-ssd-1tb-sku-mz-v9s1t0b-am/'
];
export const EXPANSION_PROBE_URLS = Object.freeze([...primaryUrls, ...additionalUrls]);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxBytes = 1048576;
export async function probeExpansionUrl(url, fetchImpl = globalThis.fetch) {
  if (!EXPANSION_PROBE_URLS.includes(url)) throw new Error('unapproved_probe_url');
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetchImpl(url, { redirect: 'manual', headers: { Accept: 'text/html,text/plain', 'User-Agent': 'PCPartPerformance/1.0 (+https://www.pcpartperformance.com/methodology/)' }, signal: AbortSignal.timeout(15000) });
    const record = { url, checkedAt, status: response.status, location: response.headers.get('location'), contentType: response.headers.get('content-type') };
    if (!response.ok) { await response.body?.cancel(); return { ...record, reason: response.status === 403 || response.status === 429 ? 'source_access_restricted' : response.status >= 300 && response.status < 400 ? 'redirect_not_followed' : 'source_http_error' }; }
    const reader = response.body.getReader(), chunks = []; let bytes = 0;
    try { while (true) { const next = await reader.read(); if (next.done) break; bytes += next.value.byteLength; if (bytes > maxBytes) { await reader.cancel(); return { ...record, bytes, reason: 'response_oversize' }; } chunks.push(next.value); } } finally { reader.releaseLock(); }
    const html = Buffer.concat(chunks).toString('utf8');
    if (url.endsWith('/robots.txt')) return { ...record, bytes, rules: html.split(/\r?\n/).filter(line => /^(User-agent|Allow|Disallow):/i.test(line)) };
    let products = [], parseError = null;
    try { products = parseProductJSONLD(html).map(node => ({ name: node.name, sku: node.sku, mpn: node.mpn, offers: node.offers && { '@type': node.offers['@type'], price: node.offers.price, priceCurrency: node.offers.priceCurrency, availability: node.offers.availability, itemCondition: node.offers.itemCondition, url: node.offers.url, seller: node.offers.seller, priceValidUntil: node.offers.priceValidUntil } })); } catch (error) { parseError = error.code || error.message; }
    let originalState = null;
    const matched = html.match(/window\.__initialState__\s*=\s*([\s\S]*?)<\/script>/);
    if (matched) { try { const item = JSON.parse(matched[1].trim().replace(/;$/, '')).ItemDetail; if (item) originalState = Object.fromEntries(['Item','Model','CountryCode','CurrencyCode','Seller','FinalPrice','Instock','IsActivated','PriceHideMark','Condition','ItemCondition'].map(key => [key,item[key]])); } catch { originalState = { error: 'unparseable_original_state' }; } }
    return { ...record, bytes, title: html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1], canonical: html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1], products, parseError, originalState };
  } catch (error) { return { url, checkedAt, reason: 'request_failed', error: error.name + ': ' + error.message }; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rows = [];
  const selected = process.argv.includes('--additional') ? additionalUrls : primaryUrls;
  for (let i = 0; i < selected.length; i += 2) {
    const pair = await Promise.all(selected.slice(i, i + 2).map(url => probeExpansionUrl(url)));
    for (const row of pair) { rows.push(row); console.log(JSON.stringify({ ...row, ...(row.rules ? { rules: row.rules.slice(0, 8), ruleCount: row.rules.length } : {}) })); }
  }
  const output = path.join(root, 'docs/clarity-oct16');
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, 'completion-price-expansion-' + (process.argv.includes('--additional') ? 'additional-' : '') + 'probes.json'), JSON.stringify({ researchOnly: true, collectedAt: new Date().toISOString(), observations: rows }, null, 2) + '\n');
}
