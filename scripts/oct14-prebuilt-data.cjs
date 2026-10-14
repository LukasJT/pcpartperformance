'use strict';

// Exact regional listing configurations. This catalog is not an offer feed.
const baseline = require('./prebuilt-data.cjs');
const register = require('../docs/oct14/catalog-research/prebuilt-source-records.json');
const photographs = require('../docs/oct14/catalog-research/product-image-sources.json').prebuilts;
const checkedAt = '2026-10-14';
const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const brands = ['iBUYPOWER', 'CyberPowerPC', 'Thermaltake', 'Quoted Tech', 'Alienware', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'HP', 'NZXT', 'ABS', 'ZOTAC', 'Skytech Gaming'];

function fieldsFromTitle(title) {
  const normalized = title.replace(/\bi([3579])\s+(\d{4,5}[A-Z]*)\b/gi, 'i$1-$2').replace(/RTX\s*(\d{4})\s*Ti/gi, 'RTX $1 Ti').replace(/RX\s*(\d{4})\s*XT/gi, 'RX $1 XT');
  const cpu = normalized.match(/(?:Intel\s+)?(?:Core\s+)?Ultra\s+[579]\s*-?\s*\d{3}[A-Z]*(?:\s+Plus)?|(?:Intel\s+)?(?:Core\s+)?i[3579]-\d{4,5}[A-Z]*|(?:AMD\s+)?Ryzen\s+[3579]\s*-?\s*\d{4,5}[A-Z0-9]*/i)?.[0]?.replace(/^Intel\s+|^AMD\s+/i, '').replace(/(Ultra\s+[579]|Ryzen\s+[3579])\s*-\s*/, '$1 ') || null;
  const chip = normalized.match(/RTX\s*\d{4}(?:\s*Ti)?|RX\s*\d{4}(?:\s*XT)?|Arc\s*[AB]\d{3}/i)?.[0] || null;
  const gpu = chip ? (chip.startsWith('RTX') ? 'GeForce ' : chip.startsWith('RX') ? 'Radeon ' : 'Intel ') + chip : null;
  const vram = chip ? normalized.slice(normalized.indexOf(chip) + chip.length).match(/^\s*(\d+)\s*GB\b/i)?.[1] : null;
  const ramMatch = normalized.match(/\b(\d+)\s*GB\s*(DDR[45])?\s*(?:Non[ -]RGB\s*|RGB\s*)?(?:RAM|Memory)\b/i) || normalized.match(/\b(\d+)\s*GB\s*(DDR[45])\b/i) || normalized.match(/\/(\d+)\s*GB\s*RAM\b/i);
  const ram = ramMatch ? ramMatch[1] + ' GB' + (ramMatch[2] ? ' ' + ramMatch[2].toUpperCase() : '') : null;
  const storageMatch = normalized.match(/\b(\d+(?:\.\d+)?)\s*(TB|GB)\s*(?:PCIe\s*[\d.]+\s*)?(?:NVMe\s*)?(SSD|HDD|Storage)(?=[\s_,/]|$)/i) || normalized.match(/\b(\d+(?:\.\d+)?)\s*(TB|GB)\s*(NVMe)\b/i);
  const storage = storageMatch ? storageMatch[1] + ' ' + storageMatch[2].toUpperCase() + ' ' + (storageMatch[3].toUpperCase() === 'STORAGE' ? 'storage; interface not disclosed' : storageMatch[3].toUpperCase()) : null;
  return { cpu, gpu, vram: vram ? vram + ' GB' : null, ram, storage };
}

function make(record) {
  const brand = brands.find(candidate => record.title.toLowerCase().includes(candidate.toLowerCase())) || null;
  const facts = fieldsFromTitle(record.title);
  const sellerText = record.disclosedFacts.find(line => /Sold and shipped by|Sold by/.test(line));
  const seller = sellerText?.replace(/^Sold and shipped by\s*|^Sold by\s*/, '').replace(/\s*\|.*$/, '') || null;
  const conflict = record.sku === '19396815' ? ['The retailer overview states 32 GB / 2 TB, while the exact title and feature list state 16 GB / 1 TB. Confirm the shipped configuration.'] : record.sku === '20012906' ? ['The retailer description gives conflicting 8 GB and 12 GB video-memory text. Confirm the exact shipped graphics card.'] : [];
  if (record.sku === '19396815') { facts.ram = null; facts.storage = null; }
  if (record.sku === '20012906') facts.vram = null;
  const displayName = record.title.split(/\s+Gaming\s+(?:PC|Desktop|Tower)/i)[0].split(/\s+Desktop\b/i)[0].replace(/^Dell\s+/, '').replace(/\s*-\s*Best Buy$/, '');
  return {
    id: slug(`${record.region}-${brand}-${record.model}`), name: displayName, brand,
    region: record.region, currency: record.region === 'CA' ? 'CAD' : 'USD',
    merchant: record.region === 'CA' ? 'Best Buy Canada' : 'Best Buy', seller,
    model: record.model, sku: record.sku, skuKind: 'retailer-product-id',
    url: record.url.replace(/\?.*$/, ''), checkedAt,
    status: 'researched exact listing configuration', condition: 'New listing; confirm before ordering',
    price: null, stock: null, ...facts,
    ramLayout: null, board: null, psu: null, cooling: null, dimensions: null,
    network: null, os: /Windows\s*11|Win\s*11/i.test(record.title) ? 'Windows 11; edition not confirmed' : null,
    warranty: null, returns: null,
    source: { publisher: record.region === 'CA' ? 'Best Buy Canada' : 'Best Buy', url: record.url.replace(/\?.*$/, ''), inspectedAt: checkedAt, scope: 'Exact product title, model and disclosed listing fields' },
    imageSource: photographs[record.sku] || record.imageSource || null,
    imageRights: photographs[record.sku] || record.imageSource ? 'Retailer product image; no open redistribution licence claimed' : null,
    imageWidth: 500, imageHeight: 500,
    sourceConflicts: conflict,
    question: conflict[0] || 'Confirm the motherboard, power supply and memory layout for the unit you will receive.',
  };
}

const nzxt = [
  { id: 'us-nzxt-player-one-14400f-5060', name: 'NZXT Player One', model: 'Player One', cpu: 'Core i5-14400F', gpu: 'GeForce RTX 5060', vram: '8 GB', ram: '16 GB DDR5-5200', ramLayout: '2 × 8 GB', storage: '1 TB NVMe M.2 SSD', url: 'https://nzxt.com/products/player-one' },
  { id: 'us-nzxt-player-two-270k-plus-5070', name: 'NZXT Player Two', model: 'Player Two', cpu: 'Core Ultra 7 270K Plus', gpu: 'GeForce RTX 5070', vram: '12 GB', ram: '32 GB DDR5-6000', ramLayout: '2 × 16 GB', storage: '2 TB NVMe M.2 SSD', url: 'https://nzxt.com/products/player-two' },
  { id: 'us-nzxt-player-three-9800x3d-5080', name: 'NZXT Player Three', model: 'Player Three', cpu: 'Ryzen 7 9800X3D', gpu: 'GeForce RTX 5080', vram: '16 GB', ram: '32 GB DDR5-6000', ramLayout: '2 × 16 GB', storage: '4 TB NVMe M.2 SSD', url: 'https://nzxt.com/products/player-three', board: 'B850 ATX; exact manufacturer/model varies', psu: '850 W 80 Plus Gold ATX; exact model varies', cooling: 'NZXT Kraken Elite 360 RGB V2', dimensions: '17.1 × 11.3 × 16.3 in; H6 Flow chassis', warranty: 'Manufacturer page states 2-year parts and labour' },
  { id: 'us-nzxt-player-three-prime-9950x3d-5090', name: 'NZXT Player Three Prime', model: 'Player Three Prime', cpu: 'Ryzen 9 9950X3D', gpu: 'GeForce RTX 5090', vram: '32 GB', ram: '64 GB DDR5-6000', ramLayout: '2 × 32 GB', storage: '4 TB NVMe M.2 SSD', url: 'https://nzxt.com/products/player-three-prime' },
].map(config => ({
  brand: 'NZXT', region: 'US', currency: 'USD', merchant: 'NZXT', seller: 'NZXT',
  checkedAt, status: 'manufacturer configuration inspected', condition: 'New; confirm the selected configuration',
  price: null, stock: null, ramLayout: null, board: null, psu: null, cooling: null,
  dimensions: null, network: null, os: 'Windows 11 Home', warranty: null, returns: null,
  imageSource: null, imageRights: null, imageWidth: 600, imageHeight: 600, sourceConflicts: [],
  question: 'Match this CPU, GPU, memory and storage configuration at checkout. Component brands and colour options can vary.',
  ...config,
  sku: [config.model, config.cpu, config.gpu, config.ram, config.storage].join(' / '),
  skuKind: 'manufacturer-configuration-signature; factory part number not disclosed',
  source: { publisher: 'NZXT', url: config.url, inspectedAt: checkedAt, scope: 'Exact fixed CPU/GPU/RAM/storage configuration in the manufacturer specifications; chassis colour not fixed' },
}));

const systems = [...baseline.map(system => ({ ...system, brand: brands.find(brand => system.name.includes(brand)) || (system.name.startsWith('MEPC') ? 'Memory Express' : null) })), ...register.records.map(make), ...nzxt];
module.exports = systems;
module.exports.fieldsFromTitle = fieldsFromTitle;
module.exports.newSources = [...register.records, ...nzxt.map(record => ({ region: record.region, title: record.name, model: record.model, sku: record.sku, url: record.url, imageSource: null }))];
