'use strict';
// Ordinary public metadata + the public Objaverse object index. No viewer
// extraction, session cookies, proxies or protected download endpoints.
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'docs/master-completion/models');
const publicPaths = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'tmp/model-batch-2026-10-11/object-paths.json.gz'))));
const registry = [...require('./sketchfab-models.json'), ...Object.values(require('./phone-models.json'))];
const installed = new Set(registry.map(item => item.sourceUid || item.sourceUrl?.match(/([a-f0-9]{32})(?:\?|$)/)?.[1]).filter(Boolean));
const queries = ['Noctua NH-D15', 'Noctua NH-U12A', 'Noctua NH-L9a', 'Noctua NH-D15 G2', 'Thermalright Phantom Spirit', 'Thermalright Peerless Assassin', 'Arctic Liquid Freezer III', 'Corsair Nautilus', 'AMD Wraith Stealth', 'Lian Li O11 Air Mini', 'Lian Li O11 Dynamic', 'Fractal North', 'Fractal Torrent', 'Fractal Meshify 2', 'NZXT H510', 'NZXT H7 Flow', 'MSI B650 Tomahawk', 'MSI B850 Tomahawk', 'ASUS X670 motherboard', 'ASUS B550 F motherboard', 'MSI RTX 3060 Ventus', 'ASUS RTX 3060 TUF', 'Gigabyte RTX 3060', 'RTX 4060 Ti', 'Samsung 990 PRO', 'Samsung 970 EVO Plus', 'WD SN850X', 'Crucial P5', 'Samsung Galaxy S24', 'Google Pixel 9', 'Google Pixel 8', 'iPhone 16', 'iPhone 15', 'ASRock motherboard', 'Gigabyte motherboard', 'Corsair RM850x'];
const file = path.join(out, 'public-model-research.json');
const report = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema: 1, method: 'Public Sketchfab metadata and public Objaverse file index; search matches are unverified candidates, not coverage.', objectIndex: 'https://huggingface.co/datasets/allenai/objaverse', searches: {}, models: {} };
fs.mkdirSync(out, { recursive: true });
const write = () => fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if ([401, 403, 429].includes(response.status)) { const error = Error('Public endpoint unavailable: HTTP ' + response.status); error.stop = true; throw error; }
  if (!response.ok) throw Error('HTTP ' + response.status);
  return response.json();
}
function summarize(model) {
  return { uid: model.uid, name: model.name, description: model.description || null, sourceUrl: model.viewerUrl || 'https://sketchfab.com/3d-models/' + model.uid,
    creator: model.user?.displayName || model.user?.username || null, creatorUrl: model.user?.profileUrl || null, license: model.license || null, downloadable: model.isDownloadable === true,
    triangles: model.faceCount ?? null, vertices: model.vertexCount ?? null, thumbnail: model.thumbnails?.images?.find(image => image.width === 1024)?.url || model.thumbnails?.images?.[0]?.url || null,
    publicObjectPath: publicPaths[model.uid] || null, alreadyInstalled: installed.has(model.uid), checkedAt: new Date().toISOString() };
}
async function main() {
  const mode = process.argv[2] || 'search';
  if (mode === 'search') {
    for (const query of queries) {
      if (report.searches[query]?.status === 200) continue;
      const url = 'https://api.sketchfab.com/v3/search?' + new URLSearchParams({ type: 'models', q: query, downloadable: 'true', count: '24' });
      try {
        const data = await get(url), results = (data.results || []).map(summarize);
        report.searches[query] = { status: 200, url, checkedAt: new Date().toISOString(), hasFurtherResults: !!data.next, results };
        console.log(query + ': ' + results.length + ' results; ' + results.filter(item => item.publicObjectPath && !item.alreadyInstalled && item.license?.label === 'CC Attribution').length + ' uninstalled public CC BY candidates');
      } catch (error) { report.searches[query] = { url, checkedAt: new Date().toISOString(), error: error.message }; if (error.stop) { write(); throw error; } }
      write();await new Promise(resolve => setTimeout(resolve, 250));
    }
  } else if (mode === 'metadata') {
    for (const uid of (process.argv[3] || '').split(',').filter(Boolean)) {
      if (!/^[a-f0-9]{32}$/.test(uid)) throw Error('Use an exact public model UID.');
      const data = await get('https://api.sketchfab.com/v3/models/' + uid);
      report.models[uid] = summarize(data);write();console.log(uid, data.name, data.license?.slug, publicPaths[uid] ? 'public distribution' : 'no public indexed copy');
    }
  } else throw Error('Usage: search | metadata UID,UID');
  write();
}
main().catch(error => { write(); console.error(error.message); process.exitCode = 1; });
