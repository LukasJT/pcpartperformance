'use strict';
const fs = require('node:fs');
const path = require('node:path');

module.exports = function prepare({ root, enabled = false }) {
  const routes = ['', 'builder', 'search', 'my-pc'], decorated = [];
  fs.copyFileSync(path.join(__dirname, 'completion-measurement.js'), path.join(root, 'completion-measurement.js'));
  for (const route of routes) {
    const file = path.join(root, route, 'index.html'); if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (enabled !== true) {
      html = html.replace(/<script\b[^>]*\bsrc="\/completion-measurement\.js(?:\?[^"<>]*)?"[^>]*><\/script>/g, '').replace(/ data-measure-home-action="(?:build|upgrade|compare)"/g, '');
      fs.writeFileSync(file, html); continue;
    }
    if (!route) html = html.replace(/(<section\b[^>]*class="tech-intro"[^>]*>)([\s\S]*?)(<\/section>)/, (_, start, body, end) => start + body.replace(/<a\b([^>]*\bhref="\/(builder|upgrade|compare)\/"[^>]*)>/g, (anchor, attributes, destination) => anchor.includes('data-measure-home-action') ? anchor : '<a' + attributes + ' data-measure-home-action="' + ({ builder: 'build', upgrade: 'upgrade', compare: 'compare' })[destination] + '">') + end);
    if (!html.includes('src="/completion-measurement.js"')) {
      const dependency = route === 'builder' ? /<script\b[^>]*\bsrc="\/builder-v2\.js(?:\?[^"<>]*)?"[^>]*><\/script>/ : route === 'search' ? /<script\b[^>]*\bsrc="\/growth-search\.js(?:\?[^"<>]*)?"[^>]*><\/script>/ : route === 'my-pc' ? /<script\b[^>]*\bsrc="\/oct16-workspace\.js(?:\?[^"<>]*)?"[^>]*><\/script>/ : null;
      if (dependency && dependency.test(html)) html = html.replace(dependency, '<script src="/completion-measurement.js" defer></script>$&');
      else if (route === 'builder') throw Error('Measurement needs to register before the retained builder-v2 controller.');
      else html = html.replace('</head>', '<script src="/completion-measurement.js" defer></script></head>');
    }
    fs.writeFileSync(file, html); decorated.push(route ? '/' + route + '/' : '/');
  }
  return { enabled: enabled === true, decorated, adapter: 'Existing disabled-until-consent PCP_EVENTS only', defaultScriptRequests: 0 };
};
