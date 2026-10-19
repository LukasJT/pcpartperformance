'use strict';
/* Development-only minification; release builds validate committed fingerprints. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
async function prepare() {
  const { minify } = require('../tools/quality/node_modules/terser');
  const directory = path.join(__dirname, 'prepared-evolution'); fs.mkdirSync(directory, { recursive: true });
  const hash = value => crypto.createHash('sha256').update(value.replace(/\r\n/g, '\n')).digest('hex');
  const manifest = { schema: 1, generator: 'Terser 5.51.2', files: {} };
  for (const name of ['evolution-builder.js', 'builder-workspace.js', 'oct16-builder-journey.js']) {
    const source = fs.readFileSync(path.join(__dirname, name), 'utf8').replace(/\r\n/g, '\n');
    const result = await minify(source, { compress: true, mangle: true, format: { comments: false } });
    if (!result.code) throw Error('Empty prepared builder runtime: ' + name);
    const output = result.code + '\n'; fs.writeFileSync(path.join(directory, name), output);
    manifest.files[name] = { sourceHash: hash(source), outputHash: hash(output) };
  }
  fs.writeFileSync(path.join(directory, 'builder-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log('Prepared three fingerprinted builder controllers without changing source behavior.');
}
module.exports = prepare;
if (require.main === module) prepare().catch(error => { console.error(error); process.exitCode = 1; });
