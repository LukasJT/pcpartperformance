'use strict';

// Decorate the retained planners after their route generators have run.
// This module does not supply new offers, benchmark data or compatibility rules.
const fs = require('node:fs');
const path = require('node:path');
const systems = require('./oct14-prebuilt-data.cjs');

const slotNames = { cpu: 'Processor', board: 'Motherboard', gpu: 'Graphics card', ram: 'Memory', ssd: 'SSD', hdd: 'Hard drive', psu: 'Power supply', case: 'Case' };
const prebuiltChecks = [
  ['identity', 'Exact model, SKU, seller and condition', 'Confirm the listing matches the configuration you will receive, including the seller on a marketplace.'],
  ['internals', 'Motherboard, PSU and upgrade connections', 'Ask for exact models, standard or proprietary connectors, spare slots and the PSU cables supplied.'],
  ['memory', 'Memory modules and storage configuration', 'Confirm module count, exact memory specification, drive model and free slots or bays.'],
  ['cooling', 'Cooling, case clearance and required hardware', 'Check the installed cooler, mounting, case dimensions, fans and clearance for any planned change.'],
  ['software', 'Operating system and connections', 'Confirm the licence, networking and display ports your setup requires.'],
  ['service', 'Warranty and returns for this seller', 'Read the applicable regional terms, exclusions, shipping responsibilities and what a later upgrade changes.'],
  ['quote', 'Current delivered price and availability', 'Get a current quote for this exact configuration, with tax and shipping. An accessible listing alone does not prove stock.']
];

function upgradePanel(esc) {
  return `<section class="md-panel" data-master-upgrade hidden aria-labelledby="md-upgrade-title"><div class="md-section-heading"><div><h2 id="md-upgrade-title">Choose what to keep and what to price</h2><p>Your choices define a purchase scenario. They do not demonstrate a performance gain or certify reuse.</p></div><a href="#change">Check a specific replacement</a></div><div data-master-goal class="md-goal" aria-live="polite"></div><fieldset class="md-scenarios"><legend>Start with a scenario</legend><div class="md-scenario-grid"><button type="button" data-master-scenario="diagnose"><strong>Keep this PC</strong><span>Investigate settings and symptoms before buying.</span></button><button type="button" data-master-scenario="single"><strong>Change one part</strong><span>Select a category below; include its dependencies.</span></button><button type="button" data-master-scenario="platform"><strong>Change the platform</strong><span>Price CPU, motherboard and RAM together.</span></button></div></fieldset><form data-master-reuse><div class="md-part-decisions" data-master-part-decisions></div><div class="md-actions"><a class="button primary" href="/tools/budget-build-lab/" data-master-upgrade-cost>Use these choices in the cost worksheet</a><a class="button secondary" href="/prebuilts/" data-master-upgrade-prebuilt>Consider a prebuilt alternative</a></div></form><p class="md-note">Keep means you intend to reuse an owned part. Verify leaves its purchase cost unresolved. Cooling, fans, accessories, operating system, tax and shipping still need explicit choices in the worksheet.</p><p role="status" data-master-upgrade-status></p><noscript><p>Use the <a href="/tools/budget-build-lab/">complete cost worksheet</a> to record reuse decisions and quotes manually.</p></noscript></section>`;
}

function prebuiltPanel(esc, selected) {
  const payload = { schema: 1, systems: (selected ? systems.filter(p => p.id === selected) : systems).map(p=>Object.fromEntries(["id","name","model","sku","region","currency","merchant","url","checkedAt","cpu","gpu","ram","storage","board","psu","ramLayout","cooling","warranty","returns","seller"].map(key=>[key,p[key]??null]))) };
  const picker = selected ? `<p class="md-system-fixed">Checklist for this exact retailer configuration.</p>` : `<label class="md-system-picker">Choose the exact system<select data-master-system><option value="">Choose a configuration</option>${['CA', 'US'].map(region => `<optgroup label="${region === 'CA' ? 'Canada · CAD' : 'United States · USD'}">${systems.filter(p => p.region === region).map(p => `<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.model || p.sku)}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
  return `<section class="md-panel" data-master-prebuilt${selected ? ` data-master-system-id="${esc(selected)}"` : ''} aria-labelledby="md-prebuilt-title"><div class="md-section-heading"><div><h2 id="md-prebuilt-title">Check the system, then compare the full cost</h2><p>A CPU and GPU name do not describe every part or the service you are buying.</p></div><a href="/upgrade/">Review parts you can reuse</a></div>${picker}<div data-master-system-evidence aria-live="polite">${selected ? 'The researched configuration is listed above. Use the questions below alongside the exact retailer listing.' : 'Choose a configuration to see its disclosed parts and the questions that remain.'}</div><fieldset class="md-checklist"><legend>Your before-ordering checklist</legend>${prebuiltChecks.map(([id, title, detail]) => `<label><input type="checkbox" data-master-prebuilt-check="${id}"><span><strong>${esc(title)}</strong><span>${esc(detail)}</span></span></label>`).join('')}</fieldset><p role="status" data-master-check-status>No checks marked. This records your confirmations, not an automated certification.</p><div class="md-actions"><a class="button primary" href="/prebuilts/#build-vs-buy" data-master-use-system>Use this system in Build vs Buy</a><a class="button secondary" href="/tools/budget-build-lab/" data-master-prebuilt-cost>Price a complete DIY alternative</a></div><p role="status" data-master-prebuilt-status></p><p class="md-note">Checklist progress stays in this open page. You can print it. Specifications are researched listing summaries, not a new stock check or independent system test.</p><script type="application/json" data-master-system-data>${JSON.stringify(payload).replace(/</g, '\\u003c')}</script></section>`;
}

const labPanel = `<section class="md-panel md-context" data-master-lab-context hidden aria-labelledby="md-lab-title"><h2 id="md-lab-title">Continue your purchase decision</h2><div data-master-lab-summary></div><p>Applying this context starts a new worksheet and clears both columns of old quotes. Exact known parts you chose to keep are marked owned where the cost category matches. Combined storage, case fans, cooling and extras remain for you to confirm.</p><div class="md-actions"><button class="button primary" type="button" data-master-lab-apply>Start a new comparison from these choices</button><button class="button secondary" type="button" data-master-context-dismiss>Dismiss this context</button></div><p role="status" data-master-lab-status></p></section>`;
const buyPanel = `<section class="md-context md-buy-context" data-master-buy-context hidden aria-labelledby="md-buy-context-title"><h3 id="md-buy-context-title">Your selected comparison</h3><div data-master-buy-summary></div><div class="md-actions"><button type="button" class="button secondary" data-master-buy-apply>Apply to this worksheet</button><button type="button" class="button secondary" data-master-context-dismiss>Dismiss this context</button></div><p role="status" data-master-buy-status></p></section>`;
const transferPanel = `<section class="md-panel" data-master-lab-transfer aria-labelledby="md-transfer-title"><h2 id="md-transfer-title">Compare a complete DIY quote with a prebuilt</h2><p>Finish every required cost in a column first. Then carry its parts, operating system, tax and shipping into the existing Build vs Buy worksheet. Assembly or support still needs its own quote.</p><div class="md-actions"><a class="button secondary" href="/prebuilts/#build-vs-buy" data-master-quote-side="a">Use Plan A as the DIY quote</a><a class="button secondary" href="/prebuilts/#build-vs-buy" data-master-quote-side="b">Use Plan B as the DIY quote</a></div><p role="status" data-master-transfer-status></p></section>`;

module.exports = ({ root, esc }) => {
  for (const file of ['master-decisions.js', 'master-decisions.css']) fs.copyFileSync(path.join(__dirname, file), path.join(root, file));
  const routes = ['upgrade', 'prebuilts', 'tools/budget-build-lab', ...systems.map(p => 'prebuilts/' + p.id)];
  let decorated = 0;
  for (const route of routes) {
    const file = path.join(root, route, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (html.includes('data-master-decisions-page')) continue;
    if (route === 'upgrade') {
      html = html.replace(/<form class="program-form" data-upgrade-form>([\s\S]*?)(<label>Country and currency[\s\S]*?)<\/form>/,
        (_, inventory, plan) => `<form class="program-form md-upgrade-form" data-upgrade-form><fieldset class="md-inventory"><legend>Your current parts</legend><div class="program-form">${inventory}</div></fieldset><fieldset class="md-planning"><legend>Your goal and budget</legend><div class="program-form">${plan}</div></fieldset></form>`);
      html = html.replace(/<section class="program-panel"><h2>1\. Record your existing PC/, '<section class="program-panel" id="inventory"><h2>1. Record your existing PC')
        .replace(/<section class="program-panel"><h2>2\. Compare a specific change/, upgradePanel(esc) + '<section class="program-panel" id="change"><h2>2. Compare a specific change')
        .replace(/<section class="program-panel"><h2>3\. Compare the full platform cost/, '<section class="program-panel" id="costs"><h2>3. Compare the full platform cost');
      html = html.replace(/(<header class="program-intro"[\s\S]*?<\/header>)/, '$1<nav class="md-steps" aria-label="Upgrade planning steps"><a href="#inventory">Record your PC</a><a href="#change">Check a change</a><a href="#costs">Compare cost</a></nav>');
    } else if (route === 'tools/budget-build-lab') {
      html = html.replace('<section class="program-panel" data-budget-lab>', labPanel + '<section class="program-panel" data-budget-lab>');
      html = html.replace('</main>', transferPanel + '</main>');
    } else if (route === 'prebuilts') {
      html = html.replace('<section class="buy-worksheet" id="build-vs-buy">', prebuiltPanel(esc) + '<section class="buy-worksheet" id="build-vs-buy">' + buyPanel);
    } else {
      html = html.replace('</main>', prebuiltPanel(esc, route.slice('prebuilts/'.length)) + '</main>');
    }
    const expected = route === 'upgrade' ? 'data-master-upgrade' : route === 'tools/budget-build-lab' ? 'data-master-lab-context' : 'data-master-prebuilt';
    if (!html.includes(expected)) throw Error('Decision integration could not find the retained route markup: ' + route);
    html = html.replace('<body', `<body data-master-decisions-page="${route === 'upgrade' ? 'upgrade' : route === 'tools/budget-build-lab' ? 'lab' : 'prebuilt'}"`)
      .replace('</head>', '<link rel="stylesheet" href="/master-decisions.css"><script src="/master-decisions.js" defer></script></head>');
    fs.writeFileSync(file, html);
    decorated++;
  }
  return { decorated, systems: systems.length, routes };
};
