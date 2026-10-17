'use strict';

// Build-time integration only. Importing this module does not mutate files or
// fetch remote assets. Existing identities, licenses and selected IDs survive.
const data = require('./completion-models-data.cjs');
const clone = value => JSON.parse(JSON.stringify(value));

function prepareCatalog(records) {
  if (!Array.isArray(records)) throw Error('Expected the existing catalog array.');
  for (const addition of data.CATALOG_ADDITIONS) {
    const existing = records.find(part => part.id === addition.id);
    if (existing) {
      if (existing.cat !== addition.cat || existing.name !== addition.name) throw Error('Catalog identity conflict for ' + addition.id);
      Object.assign(existing,clone(addition));
    } else records.push(clone(addition));
  }
  for (const [id, changes] of Object.entries(data.CATALOG_OVERRIDES)) {
    const item = records.find(part => part.id === id);
    if (!item) continue;
    const oldEvidence = item.evidence || {}, newEvidence = changes.evidence;
    Object.assign(item, clone(changes));
    if (newEvidence) item.evidence = { ...oldEvidence, ...clone(newEvidence), sourceIds: [...new Set([...(oldEvidence.sourceIds || []), ...newEvidence.sourceIds])], fields: { ...(oldEvidence.fields || {}), ...clone(newEvidence.fields) } };
  }
  return records;
}

function registry(existing = require('./sketchfab-models.json')) {
  const problems = data.validatePacket();if (problems.length) throw Error(problems.join('\n'));
  const records = existing.map(clone), ids = new Set(records.map(record => record.id));
  for (const addition of data.MODEL_ADDITIONS) {
    if (ids.has(addition.id)) throw Error('Refusing to replace an existing downloaded model: ' + addition.id);
    const bytes = require('node:fs').readFileSync(require('node:path').resolve(__dirname, '../dist/assets/models', addition.asset));
    if (require('node:crypto').createHash('sha256').update(bytes).digest('hex') !== addition.sha256) throw Error('Prepared asset changed after validation: ' + addition.id);
    ids.add(addition.id);records.push(clone(addition));
  }
  return records;
}

function browserSource(records) {
  const additions = new Set(data.CATALOG_ADDITIONS.map(part => part.id));
  const display=require('./completion-catalog-delivery.cjs').displayPart;
  const updates = [...records.filter(part => additions.has(part.id)).map(display), ...Object.entries(data.CATALOG_OVERRIDES).filter(([id]) => records.some(part => part.id === id)).map(([id, changes]) => display({ id, ...clone(changes) }))];
  const payload = JSON.stringify(updates).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  // Existing products receive only scoped patches. A prior generated payload
  // must not freeze unrelated specifications from an older catalog snapshot.
  return '/* Public researched model additions; private saved builds are never included. */\nwindow.PCP_COMPLETION_CATALOG=' + payload + ';\nif(typeof catalog!=="undefined"&&!window.PCP_BUILDER_CATALOG){for(const part of window.PCP_COMPLETION_CATALOG){const existing=catalog.find(item=>item.id===part.id);if(existing){const previous=existing.evidence,next=part.evidence;Object.assign(existing,part);if(next)existing.evidence={...previous,...next,sourceIds:[...new Set([...(previous?.sourceIds||[]),...(next.sourceIds||[])])],fields:{...previous?.fields,...next.fields}};}else if(part.cat&&part.name)catalog.push(part);}}\n';
}

function writeBrowserCatalog(records, output = require('node:path').resolve(__dirname, '../dist/completion-catalog.js')) {
  require('node:fs').writeFileSync(output, browserSource(records));
  return output;
}

module.exports = { prepareCatalog, registry, additions: () => data.MODEL_ADDITIONS.map(clone), browserSource, writeBrowserCatalog };
