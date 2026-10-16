'use strict';

const crypto = require('node:crypto');
const previousCost = require('./continuation-editorial-content.cjs');
const previousFit = require('./growth-editorial-content.cjs');
const evidenceDate = '2026-10-16';
const source = (publisher, title, url, scope, limitations) => ({
  publisher, title, url, checked: evidenceDate, access: 'Official public source inspected',
  scope, limitations, rights: 'Source citation and original factual explanation; no copied photographs, diagrams or benchmark datasets.'
});
const sources = {
  ...Object.fromEntries(['intelBuild', 'windowsActivation'].map(id => [id, { ...previousCost.sources[id], checked: evidenceDate }])),
  ...Object.fromEntries(['msi-5070', 'asus-5070', 'north-sheet'].map(id => [id, { ...previousFit.sources[id], inspected: evidenceDate }])),
  'amd-9800x3d-cooling': source('AMD', 'Ryzen 7 9800X3D desktop processor specifications',
    'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800X3d.html',
    'Exact boxed part 100-100001084WOF has no included thermal solution; AMD recommends liquid cooling for optimal performance.',
    'A manufacturer recommendation is not a measured result for every cooler, a requirement for a particular radiator size or proof of thermal adequacy.'),
  'noctua-g2-specs': source('Noctua', 'NH-D15 G2 specifications',
    'https://www.noctua.at/en/products/nh-d15-g2/specifications',
    'Standard NH-D15 G2: 168 mm published height with and without fans; supplied mounting system and thermal compound.',
    'Do not substitute NH-D15, HBC, LBC or a different mounting revision. Listed socket support does not certify the complete installed layout.'),
  'noctua-ram': source('Noctua', 'CPU cooler RAM clearance',
    'https://www.noctua.at/en/support/faqs/what-is-the-ram-clearance-of-my-noctua-cpu-cooler',
    'NH-D15 G2 standard dual-fan RAM clearance is 32 mm; raising an overhanging front fan increases the required case clearance.',
    'The worked arithmetic here uses that documented configuration. It is not a universal formula for all coolers or a measurement of the reader’s case.'),
  'arctic-lf3-manual': source('ARCTIC', 'Liquid Freezer III 360 installation manual',
    'https://support.arctic.de/liquid-freezer-iii-360',
    'Exact cooler socket-specific mounting paths, motherboard compatibility link, all-in-one or individual PWM wiring and radiator installation guidance.',
    'Do not transfer instructions to Liquid Freezer III Pro, another size or another revision. The exact motherboard manual still governs header ratings and controls.'),
  'arctic-lf3-drawing': source('ARCTIC', 'Liquid Freezer III 360 two-dimensional drawing',
    'https://support.arctic.de/products/liquid-freezer-iii-360/techdocs/Liquid%20Freezer%20III%20360%20-%202D%20Drawing.pdf',
    'ACFRE00136A drawing labels radiator thickness 38 mm and radiator/fan assembly envelope 66 mm. Drawing revision January 31, 2024.',
    'An occupied envelope is more useful than a nominal radiator class. Drawing length and a separate specification sheet differ; no disputed length is used to certify fit.'),
  'north-radiator': source('Fractal Design', 'Original North radiator compatibility',
    'https://fractaldesign.freshdesk.com/support/solutions/articles/4000189453-north-radiator-compatibility',
    'Original North: top radiator width limit 122 mm, front width limit 151 mm and conditional 35 mm motherboard-component height for a top radiator.',
    'Not North XL, North XL RC or every radiator stack. These conditional dimensions do not prove complete compatibility of a named cooler.'),
  'msi-cooler-guide': source('MSI', 'How to choose a CPU cooler',
    'https://www.msi.com/blog/how-to-choose-a-cpu-cooler',
    'Manufacturer explanation separating socket mounting, case height, RAM clearance, radiator fit and workload-related thermal needs.',
    'Published September 23, 2026. Manufacturer marketing recommendations and generic radiator-thickness ranges are not adopted as universal limits or benchmark results.')
};

const section = (title, paragraphs, sourceIds = [], extra = {}) => ({ title, paragraphs, sourceIds, ...extra });
const table = (caption, headers, rows) => ({ caption, headers, rows });
const normalizeTools = tools => tools.map(t => ({ href: t.href, label: t.label || t.title }));
const base = (id, route, title, summary, intent, sections, tools, extra = {}) => ({
  id, route, canonicalRoute: route, title, description: summary, summary, intent,
  audience: 'PC builders and existing-PC owners checking a complete purchase before ordering',
  evidenceDate, contentVersion: '2026-10-16.cooling-and-purchase.1', type: 'guide',
  status: 'evidence_checked', humanReview: null, humanReviewClaimed: false,
  evidenceType: 'Research-based practical guide, manufacturer specifications and explicitly identified calculation examples; no hands-on test claimed',
  proposedAuthor: { type: 'Organization', name: 'PC Part Performance' },
  lifecycle: { draftComplete: true, evidenceChecked: true, humanEditorialReview: false, ownerPublicationInstruction: true, confirmedDeployment: false },
  sections, sourceIds: [...new Set(sections.flatMap(s => s.sourceIds))], tools: normalizeTools(tools),
  ...extra
});

const cooler = base('T16-C01', '/blog/how-to-choose-a-cpu-cooler-that-fits/',
  'How to choose a CPU cooler that fits your case and RAM',
  'Check the exact mounting kit, installed cooler height, RAM clearance and radiator position before buying. Socket support is one check; it does not prove the cooler fits the complete PC or can meet your workload.',
  'Choose and document an air cooler or AIO that can mount and physically fit the planned configuration', [
    section('First check whether the CPU includes a cooler', [
      'Read the exact boxed CPU specification and the seller’s package contents. A processor photograph is not evidence that a cooler is included. AMD’s Ryzen 7 9800X3D, boxed part 100-100001084WOF, lists no included thermal solution. It needs a separately planned cooler; AMD also recommends liquid cooling for optimal performance.',
      'That example is not a rule for every Ryzen processor. Keep the CPU, cooler and any mounting kit as separate items in the purchase plan. If you already own a cooler, record its exact model, brackets and condition before counting it as a reusable part.'
    ], ['amd-9800x3d-cooling']),
    section('Match the socket and the actual mounting hardware', [
      'Find the cooler manufacturer’s support for the selected socket and motherboard. Then check whether the needed brackets are included in the box you will receive or require a separate kit. A compatible socket name does not establish that a used cooler still has the correct screws, backplate or spacers.',
      'Follow the exact cooler manual rather than borrowing an installation sequence from a similar model. ARCTIC, for example, provides different socket paths and wiring choices for the Liquid Freezer III 360. Its motherboard-compatibility link is another check, not permission to assume every board fits. Do not alter mounting hardware or improvise missing pieces.'
    ], ['arctic-lf3-manual']),
    section('For an air cooler, use its installed height', [
      'Compare the manufacturer’s installed height with the case’s documented CPU-cooler allowance. Include the fans in the intended position. The standard Noctua NH-D15 G2 is specified at 168 mm with its fans; it is also 168 mm without them. Removing a fan therefore does not make this model’s heatsink shorter.',
      'Now check the memory underneath an overhanging fan. Noctua specifies 32 mm RAM clearance for the standard dual-fan arrangement. Raising that front fan can clear taller memory but also increases the case space needed. A different cooler, orientation or fan can require a different calculation.'
    ], ['noctua-g2-specs', 'noctua-ram']),
    section('A worked example: taller RAM changes the answer', [
      'Suppose your exact RAM documentation lists 40 mm height and you are considering the NH-D15 G2 in that standard dual-fan arrangement. Raising the fan by the 8 mm difference gives an illustrative required height of 176 mm: 168 + (40 − 32). If your case’s documented allowance is 175 mm for that layout, this example fails that height comparison.',
      'The RAM and case values in this example are hypothetical inputs, not specifications for a hidden product recommendation. This is not a universal formula for other coolers. A result below the case limit would pass only this height calculation; motherboard layout and installation access still need checking. Do not add an invented universal safety margin or use a realistic-looking 3D scene as the measurement.'
    ], ['noctua-ram'], { table: table('Illustrative NH-D15 G2 height calculation; not a complete fit verdict', ['Input', 'Value', 'Evidence status'], [
      ['Standard cooler height', '168 mm', 'Noctua specification'],
      ['Standard dual-fan RAM clearance', '32 mm', 'Noctua documentation'],
      ['Example RAM height', '40 mm', 'Hypothetical reader input'],
      ['Fan rise', '8 mm', '40 − 32; calculated'],
      ['Example required height', '176 mm', '168 + 8; calculated'],
      ['Example case allowance', '175 mm', 'Hypothetical reader input']
    ]) }),
    section('For an AIO, check the full radiator and fan assembly', [
      '“360 mm” identifies a radiator class, not every outside dimension. ARCTIC’s Liquid Freezer III 360 drawing identifies a 38 mm radiator thickness and a 66 mm radiator-and-fan assembly envelope. Use the full drawing and mounting position instead of assuming the radiator label describes the space the complete assembly occupies.',
      'The case’s top and front mounts can have different restrictions. Fractal’s original North support page, for example, lists a 122 mm top-radiator width limit and a conditional 35 mm motherboard-component height for top mounting. Those are original-North conditions, not a verdict for North XL or an arbitrary 360 mm cooler.',
      'Record the radiator location and the components near it: RAM, motherboard heatsinks, GPU, cables and drive mounts. Confirm the block, tubes and access for connectors as well. If the source gives only a radiator class, leave the remaining dimensions unresolved and consult the exact manuals.'
    ], ['arctic-lf3-drawing', 'north-radiator']),
    section('Keep physical fit separate from cooling performance', [
      'A cooler can mount correctly and still be the wrong choice for your workload or noise preference. Look for testing that identifies the same CPU, cooler configuration, power settings and test conditions. Do not turn a matching socket or a cooler’s marketing wattage into a promise of a particular temperature.',
      'MSI’s buying guide separates mounting and clearance from thermal requirements. Use that distinction without treating its broad product classes as measured recommendations for your build. This guide provides no temperature, noise or FPS comparison between the example products. Choose between air and liquid cooling only after the fit checks and relevant workload evidence are understood.'
    ], ['msi-cooler-guide']),
    section('Save the cooling decision with the rest of the build', [
      'Keep one record containing CPU model, cooler model/revision, socket kit, RAM height, installed height or radiator envelope, case location, required headers and source links. Add separate tasks for unanswered dimensions and missing hardware. A new case, RAM kit or radiator position should trigger another check.',
      'Before ordering, include cooling, any separately required mounting kit and the actual delivery cost in the purchase plan. Check the manufacturer’s package list before buying duplicate fans or thermal compound. When evidence remains missing, keep a visible “needs verification” task rather than calling the PC fully compatible.'
    ], [], { checklist: [
      'Exact CPU and cooler identities recorded', 'Correct socket mounting kit present or separately budgeted',
      'Installed height and RAM clearance checked together, or full AIO envelope and location checked',
      'Exact motherboard and case documentation saved', 'Headers, cables and included accessories checked',
      'Cooling suitability and remaining unknowns kept separate from fit'] })
  ], [{ href: '/builder/', label: 'Add cooling to your PC plan' }, { href: '/compatibility/', label: 'Record a manual fit check' },
    { href: '/blog/will-a-graphics-card-fit-my-case/', label: 'Check the GPU and radiator layout' }],
  { change: 'new', keywords: ['cpu cooler compatibility', 'will this CPU cooler fit my case', 'CPU cooler RAM clearance', 'AIO radiator thickness'],
    originalContribution: 'A source-linked conditional height calculation, explicit illustrative inputs and a complete cooling evidence record.' });

const oldCost = previousCost.articles.find(a => a.id === 'C03');
const costSections = structuredClone(oldCost.sections);
costSections.splice(1, 0,
  section('Make the purchase list complete before comparing totals', [
    'Mark every row as buy, already owned, included in another item, not needed or still unknown. “Included” requires the exact package description; “owned” requires a usable part and a compatibility check. Neither status means that a retailer quoted a zero price. Keep the prebuilt’s disclosed parts beside the DIY list so an unspecified PSU or cooler is a question to resolve rather than an assumed equivalent.',
    'Cooling is an easy omission. The Ryzen 7 9800X3D boxed specification lists no included cooler, so a DIY quote for that CPU needs a separate cooling plan. The fact that a prebuilt names the same CPU does not tell you which cooler the system includes. Ask for the full configuration when cooling, networking or power-supply details could change your purchase.'
  ], ['amd-9800x3d-cooling'], { table: table('A complete purchase checklist for your actual setup', ['Row', 'What to record', 'When not to buy another'], [
    ['Core platform', 'CPU, supported motherboard, correct memory and boot storage', 'A verified compatible part is already owned'],
    ['Graphics', 'Exact card, or a deliberately supported integrated-graphics plan', 'Your existing graphics meet the intended job'],
    ['CPU cooling', 'Exact cooler, mounting kit and any necessary separately supplied hardware', 'An appropriate included or owned cooler is confirmed'],
    ['Enclosure and power', 'Case, PSU and approved cables for that PSU', 'Condition, fit and exact connectors are verified'],
    ['Case airflow', 'Included fans, additional needed fans and supported connections', 'The intended layout already has the required equipment'],
    ['Networking and display', 'Needed network connection, monitor and compatible display cable', 'Your setup already provides them'],
    ['Input and setup', 'Keyboard, mouse, installation media and necessary tools', 'Available equipment is suitable'],
    ['Software', 'Chosen OS and licence or verified entitlement', 'No new purchase is needed under the actual terms'],
    ['Order costs', 'Known delivery, applicable taxes and required service charges', 'A quoted amount explicitly includes the charge']
  ]) }),
  section('An incomplete subtotal is still incomplete', [
    'A checked hardware subtotal is the sum of eligible observed prices, not the value of the whole computer. Keep missing new-item prices in a separate count. Keep manual quotes separate from observed offers, and distinguish sold-out listings from items you can currently order. An expired observation must not make an old sale look current.',
    'When a required row is unresolved, compare complete scenarios rather than declaring the partial list cheaper. You can enter your own quote in the cost worksheet, clearly marked with its source and date, or wait for a supported offer. Retain a version of both lists so a substituted component or a later quote does not erase the basis of your earlier decision.'
  ])
);
const cost = base('T16-C02', oldCost.route,
  'Build vs buy a gaming PC: compare the complete purchase cost',
  'Compare the exact prebuilt with a complete DIY purchase plan. Include cooling, software, missing accessories and delivery; keep owned parts, checked offers and unknown prices separate.',
  oldCost.intent, costSections,
  [...oldCost.tools, { href: cooler.route, label: 'Check the cooler before buying' }, { href: '/tools/platform-upgrade-cost/', label: 'Record complete purchase costs' }],
  { change: 'material_revision', revises: { sourceModule: 'continuation-editorial-content.cjs', sourceId: 'C03', previousCanonical: oldCost.route },
    keywords: ['build vs buy gaming PC', 'complete PC build cost', 'what else do I need to build a PC'],
    originalContribution: 'A complete-state purchase checklist and explicit separation of owned, included, unknown, observed and manual-quote costs.' });

const oldFit = previousFit.articles.find(a => a.id === 'G06');
const fitSections = structuredClone(oldFit.sections);
fitSections.splice(2, 0, section('A radiator size label is not the occupied space', [
  'Check the cooler drawing as well as the case’s radiator-class list. ARCTIC’s Liquid Freezer III 360 drawing identifies a 38 mm radiator and a 66 mm radiator-and-fan envelope. Those are manufacturer-documented dimensions of that exact model. Do not treat a general “360 mm supported” case label as proof of thickness clearance or subtract the nominal radiator class from a GPU allowance.',
  'A top radiator also needs the documented space above motherboard components. For the original North, Fractal lists a 122 mm top-radiator width limit and a conditional 35 mm motherboard-component height. A front or top position can therefore change different checks. Keep the actual fan/radiator arrangement attached to the case record; do not transfer a passed result from another mount.',
  'When two documents disagree, save both source versions and ask the manufacturer about the exact configuration. Do not average dimensions or select the more convenient number. The Liquid Freezer III 360 drawing and a separate specification sheet, for example, do not give the same overall radiator length. This guide uses neither disputed length as a fit verdict.'
], ['arctic-lf3-drawing', 'north-radiator']));
const fit = base('T16-C03', oldFit.canonicalRoute,
  'Will a graphics card fit your case? Check the card and cooling layout',
  'Match the exact graphics-card model to the case as you will install it. Check length, thickness, cable room and radiator placement separately; a passed length check or realistic 3D preview cannot certify the whole fit.',
  oldFit.intent, fitSections,
  [...oldFit.tools, { href: cooler.route, label: 'Check CPU cooling and RAM clearance' }],
  { change: 'material_revision', revises: { sourceModule: 'growth-editorial-content.cjs', sourceId: 'G06', previousCanonical: oldFit.canonicalRoute },
    keywords: ['will my GPU fit in my case', 'graphics card radiator clearance', 'GPU case compatibility'],
    originalContribution: 'Connect exact card dimensions to documented cooling layouts, occupied radiator envelopes and a source-conflict policy.' });

const articles = [cooler, cost, fit];
const wordCount = a => [a.title, a.summary, ...a.sections.flatMap(s => [s.title, ...s.paragraphs, ...(s.checklist || []), ...(s.table ? [s.table.caption, ...s.table.headers, ...s.table.rows.flat()] : [])])].join(' ').trim().split(/\s+/).length;
const fingerprint = a => crypto.createHash('sha256').update(JSON.stringify({ article: a, sources: Object.fromEntries(a.sourceIds.map(id => [id, sources[id]])) })).digest('hex');
function validate(rows = articles, evidence = sources) {
  const errors = [], routes = new Set(), intents = new Set();
  for (const a of rows) {
    if (!/^\/blog\/[a-z0-9-]+\/$/.test(a.route) || a.route !== a.canonicalRoute || routes.has(a.route)) errors.push('Invalid or duplicate route ' + a.id);
    routes.add(a.route);
    if (!a.intent || intents.has(a.intent) || a.sections.length < 5 || wordCount(a) < 600) errors.push('Incomplete or duplicate intent ' + a.id);
    intents.add(a.intent);
    if (a.humanReview !== null || a.humanReviewClaimed !== false || a.lifecycle.humanEditorialReview || a.lifecycle.confirmedDeployment) errors.push('False review/deployment claim ' + a.id);
    for (const s of a.sections) {
      if (!s.paragraphs.length || s.paragraphs.some(p => typeof p !== 'string' || !p.trim())) errors.push('Empty section ' + a.id);
      if (s.table && s.table.rows.some(row => row.length !== s.table.headers.length)) errors.push('Malformed table ' + a.id);
      for (const id of s.sourceIds) if (!evidence[id] || !a.sourceIds.includes(id)) errors.push('Missing source ' + a.id + ' ' + id);
    }
    for (const id of a.sourceIds) { const record = evidence[id]; if (!record || !/^https:\/\//.test(record.url) || !record.scope || !record.limitations) errors.push('Invalid evidence ' + id); }
    for (const t of a.tools) if (!/^\/[a-z0-9/#-]+(?:\/[a-z0-9#-]+)*\/?$/.test(t.href) || !t.label) errors.push('Invalid tool link ' + a.id);
    if (a.change === 'material_revision' && a.revises?.previousCanonical !== a.route) errors.push('Revision moved an existing intent ' + a.id);
  }
  return { valid: errors.length === 0, errors, articles: rows.length, newArticles: rows.filter(a => a.change === 'new').length, revisedArticles: rows.filter(a => a.change === 'material_revision').length, words: rows.reduce((sum, a) => sum + wordCount(a), 0), humanReviewClaimed: false };
}
module.exports = { evidenceDate, sources, articles, section, table, wordCount, fingerprint, validate };
if (require.main === module) { const result = validate(); console.log(JSON.stringify(result, null, 2)); if (!result.valid) process.exitCode = 1; }
