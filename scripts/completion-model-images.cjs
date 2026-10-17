'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), reportFile = path.join(root, 'docs/master-completion/models/image-research.json');
const targets = {
  'cooler-amd-wraith-stealth': { name: 'AMD Wraith Stealth', manufacturer: 'AMD', page: 'https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html' },
  'retail-msi-geforce-gtx-1660-gaming-x-6g': { name: 'GeForce GTX 1660 GAMING X 6G', manufacturer: 'MSI', page: 'https://www.msi.com/Graphics-Card/GeForce-GTX-1660-GAMING-X-6G' },
  'retail-msi-meg-z590-ace-gold-edition': { name: 'MEG Z590 ACE GOLD EDITION', manufacturer: 'MSI', page: 'https://www.msi.com/Motherboard/MEG-Z590-ACE-GOLD-EDITION' },
  'retail-asus-z170-p': { name: 'Z170-P', manufacturer: 'ASUS', page: 'https://www.asus.com/us/supportonly/Z170-P/HelpDesk_Download/' },
  'retail-gigabyte-trx40-aorus-xtreme-rev-1-0': { name: 'TRX40 AORUS XTREME rev. 1.0', manufacturer: 'GIGABYTE', page: 'https://www.gigabyte.com/Motherboard/TRX40-AORUS-XTREME-rev-10' },
  'retail-corsair-carbide-200r-black': { name: 'Carbide Series 200R', manufacturer: 'CORSAIR', page: 'https://www.corsair.com/us/en/p/pc-cases/cc-9011023-ww/carbide-series-200r-compact-atx-case-cc-9011023-ww' },
  'retail-cooler-master-masterbox-lite-5': { name: 'MasterBox Lite 5', manufacturer: 'Cooler Master', page: 'https://www.coolermaster.com/en-global/products/masterbox-lite-5.html' },
  'completion-cpu-intel-core-i5-661': { name: 'Core i5-661', manufacturer: 'Intel', page: 'https://www.intel.com/content/www/us/en/products/sku/43553/intel-core-i5-661-processor-4m-cache-3-33-ghz/specifications.html' }
};
const decode = value => value.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/').replace(/\\\//g, '/');
const modelName = target => target.name.toLowerCase().startsWith(target.manufacturer.toLowerCase() + ' ') ? target.name : target.manufacturer + ' ' + target.name;

function validate(images, { files = true } = {}) {
  const errors = [], models = require('./completion-models-data.cjs').MODEL_ADDITIONS, sources = require('./completion-model-images-sources.json'), rejected = require('../docs/master-completion/models/rejected-image-placeholder.json').image, hashes = new Set();
  for (const id of Object.keys(targets)) if (!images[id]) errors.push('Required completion image is absent: ' + id);
  for (const [id, image] of Object.entries(images)) {
    if (!targets[id]) { errors.push('Unreviewed image identity: ' + id);continue; }
    if (image.visualReviewed !== true) errors.push('Image still needs a visual identity review: ' + id);
    if (image.src !== '/assets/hardware/completion/' + id + '.webp') { errors.push('Unsafe or mismatched completion image path: ' + id);continue; }
    if (image.catalogName !== targets[id].name || image.picturedModel !== modelName(targets[id]) + (image.kind === 'model-render' ? ' — 3D model render' : '') || !image.sourceUrl || !image.license || !image.licenseUrl || !/^\d{4}-\d{2}-\d{2}$/.test(image.checked || '') || !image.reviewedAt) errors.push('Incomplete identity/provenance: ' + id);
    if (image.sha256 === rejected.sha256 || image.sourceSha256 && image.sourceSha256 === rejected.sourceSha256) errors.push('Rejected generic placeholder: ' + id);
    if (!/^[a-f0-9]{64}$/.test(image.sha256 || '') || hashes.has(image.sha256)) errors.push('Missing or duplicate image hash: ' + id);hashes.add(image.sha256);
    if (!Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width < 200 || image.height < 200 || !Number.isInteger(image.bytes) || image.bytes <= 0) errors.push('Invalid image dimensions/length: ' + id);
    if (image.kind === 'exact') {
      if (!sources[id] || image.official !== true || image.imageUrl !== sources[id].imageUrl || image.sourceUrl !== sources[id].sourceUrl || image.licenseUrl !== sources[id].sourceUrl || image.attribution !== targets[id].manufacturer || !image.identityEvidence || !/^[a-f0-9]{64}$/.test(image.sourceSha256 || '') || /CC BY/i.test(image.license)) errors.push('Unsupported manufacturer-photo claim: ' + id);
    } else if (image.kind === 'model-render') {
      const model = models.find(item => item.id === id);
      if (image.official !== false || !model || image.sourceAssetSha256 !== model.sha256 || image.sourceAsset !== '/assets/models/' + model.asset || image.sourceUrl !== model.sourceUrl || image.creator !== model.creator || image.creatorUrl !== model.creatorUrl || image.license !== model.license || image.licenseUrl !== model.licenseUrl || !image.caption) errors.push('Unsupported render/source attribution: ' + id);
      const c = image.cropPixels, size = image.screenshotSize;
      if (!c || !size || ![c.left, c.top, c.width, c.height].every(Number.isInteger) || c.left < 0 || c.top < 0 || c.width <= 0 || c.height <= 0 || c.left + c.width > size.width || c.top + c.height > size.height) errors.push('Invalid actual-canvas render crop: ' + id);
      const b = image.canvasBounds, v = image.viewport;
      if (!b || !v || !size || !c || ![b.x, b.y, b.width, b.height, v.width, v.height].every(Number.isFinite) || v.width <= 0 || v.height <= 0 || c.left !== Math.floor(b.x * size.width / v.width) || c.top !== Math.floor(b.y * size.height / v.height) || c.width !== Math.ceil((b.x + b.width) * size.width / v.width) - c.left || c.height !== Math.ceil((b.y + b.height) * size.height / v.height) - c.top) errors.push('Render crop does not match recorded DOM bounds: ' + id);
      if (!/^docs\/master-completion\/qa\/[a-z0-9-]+-model-render-full\.png$/.test(image.originalScreenshot || '') || !/^[a-f0-9]{64}$/.test(image.screenshotSha256 || '')) errors.push('Render screenshot provenance is absent: ' + id);
    } else errors.push('Family/reference substitution is not allowed: ' + id);
    if (files) {
      try { const bytes = fs.readFileSync(path.join(root, 'dist', image.src));if (bytes.length !== image.bytes || crypto.createHash('sha256').update(bytes).digest('hex') !== image.sha256) errors.push('Completion image changed after review: ' + id); }
      catch { errors.push('Completion image file is absent: ' + id); }
    }
  }
  return errors;
}
function overrides() {
  const file = path.join(__dirname, 'completion-model-images.json'), images = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}, errors = validate(images);
  if (errors.length) throw Error(errors.join('\n'));
  return images;
}

async function research() {
  const output = { schema: 1, checkedAt: new Date().toISOString(), method: 'Ordinary public manufacturer pages. Found images are candidates until visual identity inspection; no generic/family photo is accepted automatically.', targets: {} };
  await Promise.all(Object.entries(targets).map(async ([id, target]) => {
    const result = { ...target, checkedAt: new Date().toISOString() };output.targets[id] = result;
    try {
      const response = await fetch(target.page, { signal: AbortSignal.timeout(25000) });result.status = response.status;result.finalUrl = response.url;
      if (!response.ok) return;
      const html = await response.text();if (html.length > 4000000) throw Error('Page exceeds bounded research size.');
      const directory = path.join(root, 'tmp/completion-model-images/pages');fs.mkdirSync(directory, { recursive: true });fs.writeFileSync(path.join(directory, id + '.html'), html);
      result.images = [...new Set([...html.matchAll(/(?:https?:)?(?:\\\/|\/){2}[^\s"'<>]+?\.(?:png|jpg|jpeg|webp|avif)(?:\?[^\s"'<>]*)?/gi)].map(match => decode(match[0])).map(url => url.startsWith('//') ? 'https:' + url : url))].slice(0, 180);
      result.ogImage = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] || null;
    } catch (error) { result.error = error.message; }
  }));
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });fs.writeFileSync(reportFile, JSON.stringify(output, null, 2) + '\n');
  for (const [id, result] of Object.entries(output.targets)) console.log(id, result.status || result.error, result.ogImage || '', (result.images || []).length + ' image candidates');
}
async function download() {
  const sources = require('./completion-model-images-sources.json'), { default: sharp } = await import('../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.mjs');
  const outputFile = path.join(__dirname, 'completion-model-images.json'), images = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : {}, failures = [];
  const directory = path.join(root, 'dist/assets/hardware/completion'), rawDirectory = path.join(root, 'tmp/completion-model-images/source');fs.mkdirSync(directory, { recursive: true });fs.mkdirSync(rawDirectory, { recursive: true });
  const selected = new Set((process.argv[3] || '').split(',').filter(Boolean));
  for (const [id, source] of Object.entries(sources)) {
    if (selected.size && !selected.has(id)) continue;
    try {
      const response = await fetch(source.imageUrl, { signal: AbortSignal.timeout(30000) });if (!response.ok) throw Error('Public manufacturer image HTTP ' + response.status);
      const chunks = [];let length = 0;for await (const chunk of response.body) { length += chunk.length;if (length > 10000000) throw Error('Manufacturer image exceeds ten megabytes.');chunks.push(chunk); }
      const bytes = Buffer.concat(chunks), metadata = await sharp(bytes, { limitInputPixels: 25000000 }).metadata();
      if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 200) throw Error('Manufacturer candidate is too small or not a complete image.');
      fs.writeFileSync(path.join(rawDirectory, id + '.source'), bytes);
      const asset = id + '.webp', file = path.join(directory, asset), prepared = await sharp(bytes).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 92, effort: 5 }).toBuffer();
      fs.writeFileSync(file, prepared);const decoded = await sharp(prepared).metadata(), target = targets[id];
      images[id] = { src: '/assets/hardware/completion/' + asset, picturedModel: modelName(target), catalogName: target.name, sourceUrl: source.sourceUrl, imageUrl: source.imageUrl, attribution: target.manufacturer, license: 'Manufacturer product media; not an open license', licenseUrl: source.sourceUrl, official: true, kind: 'exact', width: decoded.width, height: decoded.height, bytes: prepared.length, checked: '2026-10-16', sourceSha256: crypto.createHash('sha256').update(bytes).digest('hex'), sha256: crypto.createHash('sha256').update(prepared).digest('hex'), identityEvidence: source.identityEvidence, modifications: 'Proportions preserved; resized within 1200px and encoded WebP. No background replacement, recoloring, crop or generated hardware.', visualReviewed: false };
      console.log(id, decoded.width + 'x' + decoded.height, prepared.length, 'bytes; awaiting visual identity review');
    } catch (error) { failures.push({ id, ...source, error: error.message });console.error(id + ': ' + error.message); }
  }
  fs.writeFileSync(outputFile, JSON.stringify(images, null, 2) + '\n');fs.writeFileSync(path.join(root, 'docs/master-completion/models/image-downloads.json'), JSON.stringify({ checkedAt: new Date().toISOString(), images, failures, visualReview: 'Not automatic; inspect downloaded candidates before using overrides.' }, null, 2) + '\n');
  if (failures.length) process.exitCode = 1;
}
async function registerRenders() {
  const { default: sharp } = await import('../../model-tools/node_modules/.pnpm/sharp@0.35.4/node_modules/sharp/dist/index.mjs');
  const data = require('./completion-models-data.cjs'), outputFile = path.join(__dirname, 'completion-model-images.json'), images = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, 'utf8')) : {};
  const renderTargets = {
    'completion-cpu-intel-core-i5-661': { base: 'i5-661', description: 'Creator visualization of the named Core i5-661; not a manufacturer photograph.' },
    'retail-cooler-master-masterbox-lite-5': { base: 'masterbox-lite5', description: 'Creator low-detail, untextured MasterBox Lite 5 visualization. White is the source material; it does not confirm retail color, exact SKU or installed fit.' },
    'retail-asus-z170-p': { base: 'asus-z170p', description: 'Render of the creator scan of a used Z170-P described as broken. Not a pristine manufacturer photograph or proof of condition.' }
  };
  const selected = new Set((process.argv[3] || '').split(',').filter(Boolean));
  for (const [id, entry] of Object.entries(renderTargets)) {
    if (selected.size && !selected.has(id)) continue;
    const original = path.join(root, 'docs/master-completion/qa', entry.base + '-model-render-full.png'), boundsFile = path.join(root, 'docs/master-completion/qa', entry.base + '-model-render-bounds.json');
    if (!fs.existsSync(original) || !fs.existsSync(boundsFile)) { console.log(id + ': original render/bounds not yet available');continue; }
    const screenshot = fs.readFileSync(original), imageSize = await sharp(screenshot).metadata(), bounds = JSON.parse(fs.readFileSync(boundsFile, 'utf8'));
    // Root confirmed the i5/CM captures use a 1440×900 CSS viewport; Cua may
    // slightly resize the screenshot. ASUS records its viewport explicitly.
    const viewport = bounds.viewport || { width: 1440, height: 900 }, scaleX = imageSize.width / viewport.width, scaleY = imageSize.height / viewport.height;
    const left = Math.floor(bounds.x * scaleX), top = Math.floor(bounds.y * scaleY), right = Math.ceil((bounds.x + bounds.width) * scaleX), bottom = Math.ceil((bounds.y + bounds.height) * scaleY), crop = { left, top, width: right - left, height: bottom - top };
    if (![left, top, crop.width, crop.height].every(Number.isFinite) || left < 0 || top < 0 || crop.width <= 0 || crop.height <= 0 || right > imageSize.width || bottom > imageSize.height) throw Error('Render crop is outside its original screenshot: ' + id);
    const prepared = await sharp(screenshot).extract(crop).resize({ width: 1200, height: 700, fit: 'inside', withoutEnlargement: true }).webp({ quality: 92, effort: 5 }).toBuffer(), metadata = await sharp(prepared).metadata();
    const asset = id + '.webp', destination = path.join(root, 'dist/assets/hardware/completion', asset);fs.mkdirSync(path.dirname(destination), { recursive: true });fs.writeFileSync(destination, prepared);
    const model = data.MODEL_ADDITIONS.find(item => item.id === id), target = targets[id];
    images[id] = { src: '/assets/hardware/completion/' + asset, picturedModel: target.manufacturer + ' ' + target.name + ' — 3D model render', catalogName: target.name, kind: 'model-render', caption: entry.description, official: false, sourceUrl: model.sourceUrl, creator: model.creator, creatorUrl: model.creatorUrl, attribution: model.creator, originalAttribution: model.originalAttribution, license: model.license, licenseUrl: model.licenseUrl, checked: '2026-10-16', sourceAsset: '/assets/models/' + model.asset, sourceAssetSha256: model.sha256, width: metadata.width, height: metadata.height, bytes: prepared.length, sha256: crypto.createHash('sha256').update(prepared).digest('hex'), originalScreenshot: path.relative(root, original).replace(/\\/g, '/'), screenshotSha256: crypto.createHash('sha256').update(screenshot).digest('hex'), viewport, screenshotSize: { width: imageSize.width, height: imageSize.height }, canvasBounds: bounds, cropPixels: crop, modifications: 'Actual licensed GLB rendered by the local product viewer. Full screenshot cropped to recorded canvas bounds with CSS-to-screenshot scaling, then encoded WebP. Source geometry, materials, colors and textures were not replaced.', visualReviewed: false };
    console.log(id, metadata.width + 'x' + metadata.height, prepared.length, 'bytes; crop', JSON.stringify(crop));
  }
  fs.writeFileSync(outputFile, JSON.stringify(images, null, 2) + '\n');
}
if (require.main === module) {
  if (process.argv[2] === 'research') research().catch(error => { console.error(error);process.exitCode = 1; });
  else if (process.argv[2] === 'download') download().catch(error => { console.error(error);process.exitCode = 1; });
  else if (process.argv[2] === 'renders') registerRenders().catch(error => { console.error(error);process.exitCode = 1; });
  else console.log(Object.keys(overrides()).length + ' reviewed image overrides');
}
module.exports = { targets, overrides, validate };
