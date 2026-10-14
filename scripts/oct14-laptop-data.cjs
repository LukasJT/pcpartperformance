'use strict';
const register = require('../docs/oct14/catalog-research/laptop-source-records.json');
const photographs = require('../docs/oct14/catalog-research/product-image-sources.json');
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const brands = ['ASUS', 'Lenovo', 'Acer', 'MSI', 'Alienware', 'GIGABYTE', 'HP', 'Razer'];

function fieldsFromTitle(title) {
  const normalized = title.replace(/\bi([3579])\s+(\d{4,5}[A-Z]*)\b/gi, 'i$1-$2').replace(/Ryzen\s+Al\b/g, 'Ryzen AI');
  const cpu = normalized.match(/(?:Intel\s+)?Core\s+Ultra\s+[579]\s*-?\s*\d{3}[A-Z]*(?:\s+Plus)?|(?:Intel\s+)?Core\s+[3579]\s*-?\s*\d{3}[A-Z]*|(?:Intel\s+)?(?:Core\s+)?i[3579]-\d{4,5}[A-Z]*|(?:AMD\s+)?Ryzen\s+AI\s+[579]\s*(?:HX\s*-?\s*)?\d{3}|(?:AMD\s+)?Ryzen\s+[3579]\s*-?\s*\d{3,5}[A-Z0-9]*|AMD\s+R9\s+\d{4}[A-Z]*/i)?.[0]?.replace(/^Intel\s+|^AMD\s+/i, '').replace(/(Core(?:\s+Ultra)?\s+[3579])\s*-\s*/, '$1 ') || null;
  const gpu = normalized.match(/RTX\s*\d{4}(?:\s*Ti)?/i)?.[0]?.replace(/RTX\s*(\d{4})\s*Ti/i, 'RTX $1 Ti') || null;
  const ram = normalized.match(/\b(\d+)\s*GB\s*(LPDDR5X|DDR[45])\b/i) || normalized.match(/\b(\d+)\s*GB\s*(?:RAM|Memory)\b/i);
  const storage = normalized.match(/\b(\d+(?:\.\d+)?)\s*(TB|GB)\s*(?:PCIe\s*)?(SSD|Storage)\b/i) || normalized.match(/\b(\d+(?:\.\d+)?)\s*(TB)\b/i);
  const screen = normalized.match(/\b(\d{2}(?:\.\d+)?)\s*["″]/)?.[1] || null;
  const hz = normalized.match(/\b(\d{2,3})\s*Hz\b/i)?.[1] || null;
  return {
    cpu: cpu || (/Core\s+Ultra\s+9/i.test(normalized) ? 'Core Ultra 9; exact model not disclosed' : null),
    gpu: gpu ? 'GeForce ' + gpu + ' Laptop GPU' : null,
    ram: ram ? ram[1] + ' GB' + (ram[2] ? ' ' + ram[2].toUpperCase() : '') : null,
    storage: storage ? storage[1] + ' ' + storage[2].toUpperCase() + (storage[3]?.toUpperCase() === 'SSD' ? ' SSD' : '; drive type not confirmed') : null,
    screenInches: screen ? Number(screen) : null, refreshHz: hz ? Number(hz) : null,
    panel: /OLED/i.test(normalized) ? 'OLED' : /\bIPS\b/i.test(normalized) ? 'IPS LCD' : null,
  };
}

function make(record) {
  const brand = brands.find(value => record.title.toLowerCase().includes(value.toLowerCase())) || null;
  const fields = fieldsFromTitle(record.title);
  const title = record.title.replace(/\s*-\s*Best Buy$/, '');
  const family = title.match(/^(.*?)(?:\s+\d{2}(?:\.\d+)?["″]|\s+Gaming Laptop)/)?.[1]?.replace(/\s+-\s+/g, ' ') || record.model || title;
  return {
    id: slug([record.region, brand, record.model || record.sku].join('-')),
    brand, name: family, model: record.model, sku: record.sku, skuKind: 'retailer-product-id',
    region: record.region, currency: record.region === 'CA' ? 'CAD' : 'USD',
    merchant: record.region === 'CA' ? 'Best Buy Canada' : 'Best Buy',
    url: record.url, checkedAt: '2026-10-14', ...fields,
    gpuPowerW: null, vram: null, measuredFps: null, batteryWh: null, batteryLifeHours: null,
    weightKg: null, ramLayout: null, upgradeableRam: null, resolution: null,
    price: null, stock: null, imageSource: photographs.laptops[record.sku] || null,
    imageWidth: 600, imageHeight: 450,
    source: { publisher: record.region === 'CA' ? 'Best Buy Canada' : 'Best Buy', url: record.url, inspectedAt: '2026-10-14', scope: 'Exact regional product listing; unknown power, thermal and benchmark evidence preserved' },
  };
}

const razer = [
  { id: 'us-razer-blade16-rz09-05817en3-r3u1', sku: 'RZ09-05817EN3-R3U1', gpu: 'GeForce RTX 5070 Ti Laptop GPU', vram: '12 GB GDDR7', ram: '32 GB 9600 MHz; type not confirmed', url: 'https://www.razer.com/gaming-laptops/razer-blade-16/RZ09-05817EN3-R3U1' },
  { id: 'us-razer-blade16-rz09-05818en4-r3u1', sku: 'RZ09-05818EN4-R3U1', gpu: 'GeForce RTX 5080 Laptop GPU', vram: '16 GB GDDR7', ram: '64 GB 9600 MHz; type not confirmed', url: 'https://www.razer.com/gaming-laptops/razer-blade-16/RZ09-05818EN4-R3U1' },
].map(config => ({
  brand: 'Razer', name: 'Razer Blade 16', model: config.sku, skuKind: 'manufacturer-part-number',
  region: 'US', currency: 'USD', merchant: 'Razer', checkedAt: '2026-10-14',
  cpu: 'Core Ultra 9 386H', storage: '1 TB SSD', screenInches: 16, refreshHz: 240, panel: 'OLED',
  resolution: 'QHD+; exact pixel dimensions not verified',
  gpuPowerW: null, measuredFps: null, batteryWh: null, batteryLifeHours: null,
  weightKg: null, ramLayout: null, upgradeableRam: null, price: null, stock: null,
  imageSource: photographs.razer, imageWidth: 600, imageHeight: 400,
  ...config, source: { publisher: 'Razer', url: config.url, inspectedAt: '2026-10-14', scope: 'Selected exact manufacturer SKU/configuration; the two configurations share the manufacturer chassis photograph' },
}));

module.exports = [...register.records.map(make), ...razer];
module.exports.fieldsFromTitle = fieldsFromTitle;
