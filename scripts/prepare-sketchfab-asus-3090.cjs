// Preserve the creator's GPU mesh while removing one detached object far outside it.
// Source: Marcseus / 506b1c68d24f4a9088ea0eaef41f7dd9, CC BY 4.0.
const fs = require('fs');
const source = process.argv[2];
if (!source) throw new Error('Pass the downloaded Sketchfab GLB path.');
const input = fs.readFileSync(source);
if (input.readUInt32LE(0) !== 0x46546c67) throw new Error('Expected a GLB.');
const jsonEnd = 20 + input.readUInt32LE(12);
const doc = JSON.parse(input.subarray(20, jsonEnd));
const detached = doc.nodes.findIndex(node => node.name === 'Cube.281');
if (detached < 0) throw new Error('Expected source object was not found.');
for (const node of doc.nodes) if (node.children) node.children = node.children.filter(i => i !== detached);
const raw = Buffer.from(JSON.stringify(doc));
const json = Buffer.alloc(Math.ceil(raw.length / 4) * 4, 0x20);
raw.copy(json);
const rest = input.subarray(jsonEnd);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + json.length + rest.length, 8);
header.writeUInt32LE(json.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
fs.writeFileSync('dist/assets/models/sketchfab-asus-rtx3090-strix-white.glb', Buffer.concat([header, json, rest]));
console.log('Removed detached Cube.281; GPU geometry and materials preserved.');
