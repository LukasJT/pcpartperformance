'use strict';
/* SVG geometry inspection only. This is not a substitute for browser layout QA. */
const fs = require('node:fs'), path = require('node:path');
const sharp = require('C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const { TOPICS } = require('./evolution-diagrams.cjs'), { artwork } = require('./evolution-diagrams.js');
(async () => {
  const output = path.resolve(__dirname, '../docs/evolution-oct18/qa'); fs.mkdirSync(output, { recursive: true });
  const style = '<style>svg{color:#9baac2;background:#0c1525}rect{fill:#182235;stroke:#46556d}.hd-case{fill:#111d30;stroke:#94a9c5}.hd-accent{fill:#143764;stroke:#79c7ff}.hd-selected{fill:#164773;stroke:#96e0ff;stroke-width:3}.hd-muted{stroke:#8193ac;fill:none;stroke-dasharray:5 5;opacity:.6}.hd-energy{stroke:#79c7ff;stroke-width:3}text{fill:#eff5ff;stroke:none;font:20px sans-serif}</style>';
  const images = [];
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const svg = artwork(topic.id, topic.values).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, '$1' + style);
    const file = path.join(output, 'diagram-vector-' + topic.id + '.png');
    const bytes = await sharp(Buffer.from(svg)).png().toBuffer(); fs.writeFileSync(file, bytes);
    images.push({ input: bytes, top: Math.floor(i / 2) * 335, left: (i % 2) * 580 });
  }
  await sharp({ create: { width: 1140, height: 1320, channels: 4, background: '#0c1525' } }).composite(images).png().toFile(path.join(output, 'diagram-vector-contact-sheet.png'));
  console.log('Rendered eight original SVG geometry previews. Browser layout remains a separate release gate.');
})().catch(error => { console.error(error); process.exitCode = 1; });
