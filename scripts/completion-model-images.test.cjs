'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const images = require('./completion-model-images.json'), photos = require('./completion-model-images.cjs'), sources = require('./completion-model-images-sources.json'), models = require('./completion-models-data.cjs').MODEL_ADDITIONS;
const root = path.resolve(__dirname, '..'), clone = () => structuredClone(images), sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sharp = Promise.resolve(require(process.env.PCP_SHARP_PATH || '../tools/quality/node_modules/sharp'));

test('all eight new identities have reviewed local images, with five exact official images and three licensed model renders', () => {
  assert.equal(Object.keys(photos.targets).length, 8);assert.deepEqual(Object.keys(images).sort(), Object.keys(photos.targets).sort());
  assert.equal(Object.values(images).filter(image => image.kind === 'exact').length, 5);assert.equal(Object.values(images).filter(image => image.kind === 'model-render').length, 3);
  assert.deepEqual(photos.validate(images), []);assert.deepEqual(photos.overrides(), images);
  assert.equal(images['cooler-amd-wraith-stealth'].picturedModel, 'AMD Wraith Stealth');
});

test('every published WebP decodes actual pixels and agrees with its identity, dimensions, length and hash', async () => {
  const decode = await sharp, seen = new Set();
  for (const [id, image] of Object.entries(images)) {
    const bytes = fs.readFileSync(path.join(root, 'dist', image.src)), metadata = await decode(bytes).metadata(), raw = await decode(bytes).raw().toBuffer({ resolveWithObject: true });
    assert.equal(metadata.format, 'webp', id);assert.equal(metadata.width, image.width, id);assert.equal(metadata.height, image.height, id);assert.equal(bytes.length, image.bytes, id);assert.equal(sha(bytes), image.sha256, id);
    assert.ok(raw.data.length >= image.width * image.height * 3, id);assert.equal(seen.has(image.sha256), false, id);seen.add(image.sha256);
    assert.equal(image.catalogName, photos.targets[id].name);assert.ok(image.width >= 200 && image.height >= 200);assert.ok(image.bytes < 250000);
  }
});

test('official imagery is tied to the reviewed exact-model manufacturer media rather than another product or family photo', () => {
  for (const [id, source] of Object.entries(sources)) {
    const image = images[id];assert.equal(image.sourceUrl, source.sourceUrl);assert.equal(image.imageUrl, source.imageUrl);assert.equal(image.official, true);
    assert.equal(image.license, 'Manufacturer product media; not an open license');assert.equal(image.kind, 'exact');assert.match(image.identityEvidence, /individual|exact|explicitly/i);
  }
  assert.match(images['retail-msi-geforce-gtx-1660-gaming-x-6g'].sourceUrl, /GTX-1660-GAMING-X-6G\/Gallery$/);
  assert.match(images['retail-msi-meg-z590-ace-gold-edition'].sourceUrl, /ACE-GOLD-EDITION\/Gallery$/);
  assert.match(images['retail-gigabyte-trx40-aorus-xtreme-rev-1-0'].sourceUrl, /rev-10\/sp$/);
  assert.match(images['retail-corsair-carbide-200r-black'].sourceUrl, /cc-9011023-ww/);
});

test('model-render images retain original author, source, license and GLB identity without claiming manufacturer photography', () => {
  for (const [id, image] of Object.entries(images)) if (image.kind === 'model-render') {
    const model = models.find(record => record.id === id);assert.ok(model, id);
    for (const field of ['creator', 'creatorUrl', 'sourceUrl', 'license', 'licenseUrl']) assert.equal(image[field], model[field], id + ':' + field);
    assert.equal(image.sourceAssetSha256, model.sha256);assert.equal(sha(fs.readFileSync(path.join(root, 'dist', image.sourceAsset))), model.sha256);assert.equal(image.official, false);
    assert.match(image.picturedModel, /3D model render$/);assert.ok(image.caption);assert.match(image.modifications, /Source geometry, materials, colors and textures were not replaced/);
  }
  assert.match(images['retail-cooler-master-masterbox-lite-5'].caption, /untextured/);assert.match(images['retail-asus-z170-p'].caption, /used.*broken/);
});

test('render crops use actual full screenshots, recorded viewport scaling and canvas bounds, with no old ignored clip', async () => {
  const decode = await sharp;
  for (const [id, image] of Object.entries(images)) if (image.kind === 'model-render') {
    const screenshot = fs.readFileSync(path.join(root, image.originalScreenshot)), size = await decode(screenshot).metadata(), b = image.canvasBounds, v = image.viewport;
    assert.match(image.originalScreenshot, /-model-render-full\.png$/);assert.equal(sha(screenshot), image.screenshotSha256);assert.equal(size.width, image.screenshotSize.width);assert.equal(size.height, image.screenshotSize.height);
    const left = Math.floor(b.x * size.width / v.width), top = Math.floor(b.y * size.height / v.height);
    assert.deepEqual(image.cropPixels, { left, top, width: Math.ceil((b.x + b.width) * size.width / v.width) - left, height: Math.ceil((b.y + b.height) * size.height / v.height) - top }, id);
    assert.ok(image.cropPixels.left + image.cropPixels.width <= size.width);assert.ok(image.cropPixels.top + image.cropPixels.height <= size.height);
  }
});

test('missing images, unchecked identities, family photos and copied image hashes fail closed', () => {
  const id = 'cooler-amd-wraith-stealth';
  let value = clone();delete value[id];assert.match(photos.validate(value, { files: false }).join('\n'), /Required completion image is absent/);
  value = clone();value[id].visualReviewed = false;assert.match(photos.validate(value, { files: false }).join('\n'), /visual identity review/);
  value = clone();value[id].kind = 'family';assert.match(photos.validate(value, { files: false }).join('\n'), /Family\/reference substitution/);
  value = clone();value[id].sha256 = value['retail-corsair-carbide-200r-black'].sha256;assert.match(photos.validate(value, { files: false }).join('\n'), /duplicate image hash/);
  value = clone();value[id].catalogName = 'Wraith Prism';assert.match(photos.validate(value, { files: false }).join('\n'), /identity\/provenance/);
});

test('a placeholder glyph, unrelated gallery source and unsafe local path cannot become a reviewed photo', () => {
  const rejected = require('../docs/master-completion/models/rejected-image-placeholder.json').image, id = 'retail-asus-z170-p';
  let value = clone();value[id] = { ...rejected, visualReviewed: true, reviewedAt: new Date().toISOString() };assert.match(photos.validate(value, { files: false }).join('\n'), /Rejected generic placeholder/);
  value = clone();value['cooler-amd-wraith-stealth'].imageUrl = 'https://www.amd.com/other-product.png';assert.match(photos.validate(value, { files: false }).join('\n'), /Unsupported manufacturer-photo claim/);
  value = clone();value[id].src = '/assets/hardware/completion/../../wrong.webp';assert.match(photos.validate(value, { files: false }).join('\n'), /Unsafe or mismatched completion image path/);
});

test('render license, model identity and actual screenshot crop cannot be silently changed', () => {
  const id = 'completion-cpu-intel-core-i5-661';
  let value = clone();value[id].official = true;assert.match(photos.validate(value, { files: false }).join('\n'), /Unsupported render\/source attribution/);
  value = clone();value[id].sourceAssetSha256 = '0'.repeat(64);assert.match(photos.validate(value, { files: false }).join('\n'), /Unsupported render\/source attribution/);
  value = clone();value[id].licenseUrl = 'https://unrelated.invalid/license';assert.match(photos.validate(value, { files: false }).join('\n'), /Unsupported render\/source attribution/);
  value = clone();value[id].cropPixels.left++;assert.match(photos.validate(value, { files: false }).join('\n'), /Render crop does not match/);
  value = clone();value[id].cropPixels.width = 100000;assert.match(photos.validate(value, { files: false }).join('\n'), /Invalid actual-canvas render crop/);
  value = clone();value[id].originalScreenshot = 'docs/master-completion/qa/i5-661-model-render.png';assert.match(photos.validate(value, { files: false }).join('\n'), /screenshot provenance is absent/);
});
