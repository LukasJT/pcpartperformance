'use strict';

// Build-time publisher checks. This module does not install an ad network,
// contact an analytics service, read private account data, or assert approval.
const fs = require('node:fs');
const path = require('node:path');

const CHECKED = '2026-10-19';
const ROUTE = '/resources/publisher-readiness/';
const SOURCES = Object.freeze({
  minimum: { title: 'Journey minimum requirements', url: 'https://journeymv.zendesk.com/hc/en-us/articles/24633185741723-Journey-Minimum-Requirements' },
  application: { title: 'Journey application and launch', url: 'https://journeymv.zendesk.com/hc/en-us/articles/23745987278363-Journey-From-Application-to-Launch' },
  markets: { title: 'Mediavine and Journey requirements', url: 'https://www.mediavine.com/application-requirements/' },
  layout: { title: 'Journey guidance for custom layouts', url: 'https://journeymv.zendesk.com/hc/en-us/articles/54691462571419-Why-SPAs-flexbox-grid-layouts-and-utility-class-frameworks-can-cause-ad-targeting-issues' },
  selectors: { title: 'Ad placement selector guidance', url: 'https://journeymv.zendesk.com/hc/en-us/articles/55300174276763-How-to-Use-Ad-Placement-Selectors-to-Retarget-Your-Ads' },
  remove: { title: 'Moving from an existing ad network', url: 'https://journeymv.zendesk.com/hc/en-us/articles/24209919201563-How-To-Remove-Your-Existing-Ads-From-A-Previous-Network' },
  wrapper: { title: 'Journey script on a custom-built site', url: 'https://journeymv.zendesk.com/hc/en-us/articles/55037817279771-Installing-the-Journey-Script-Wrapper-on-a-Custom-Built-Site' },
  adsTxt: { title: 'Journey ads.txt for custom sites', url: 'https://journeymv.zendesk.com/hc/en-us/articles/24703689013403-How-To-Install-Ads-txt-For-Custom-Sites-Not-On-Wordpress-Squarespace-Shopify-or-Blogger' },
  ga4: { title: 'Create and connect a GA4 web stream', url: 'https://support.google.com/analytics/answer/14183469?hl=en' },
  consent: { title: 'Google consent-mode implementation', url: 'https://developers.google.com/tag-platform/security/guides/consent' }
});
const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle']);
const ARTICLE_CLASSES = new Set(['master-article', 'oct11-article', 'article-copy', 'publication-copy', 'evolution-article']);
const DEFAULT_ANALYTICS = Object.freeze({ schema: 1, enabled: false, measurementId: null, consentMode: 'basic', ownerAuthorized: false });

function attributes(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = m[2] ?? m[3];
  return out;
}
function classTokens(tag) { return (attributes(tag).class || '').split(/\s+/).filter(Boolean); }
function jsonArticle(html) {
  let found = false;
  const walk = value => {
    if (!value || typeof value !== 'object') return;
    const types = [].concat(value['@type'] || []);
    if (types.some(type => ARTICLE_TYPES.has(type))) found = true;
    for (const item of Object.values(value)) if (item && typeof item === 'object') {
      if (Array.isArray(item)) item.forEach(walk); else walk(item);
    }
  };
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attributes(m[1]).type !== 'application/ld+json') continue;
    try { walk(JSON.parse(m[2])); } catch { /* Existing SEO checks report invalid JSON. */ }
  }
  return found;
}
function editorialState(html, route) {
  if (!/^\/(?:blog|news)\/[^/?#]+\/$/.test(route)) return 'not-editorial-route';
  const excluded = [...html.matchAll(/<meta\b[^>]*>/gi)].some(m => {
    const a = attributes(m[0]);
    return a.name?.toLowerCase() === 'robots' && /(?:^|[\s,])noindex(?:$|[\s,])/i.test(a.content || '');
  });
  if (/data-(?:program-draft|stage2-noindex|legacy-redirect)\b/.test(html) || excluded) return 'draft-or-excluded';
  if (!jsonArticle(html)) return 'missing-article-schema';
  return 'editorial';
}
function articleCandidates(html) {
  return [...html.matchAll(/<article\b[^>]*>/gi)].filter(m => classTokens(m[0]).some(token => ARTICLE_CLASSES.has(token) || token === 'journey-content'));
}
function polishHTML(html, route) {
  if (editorialState(html, route) !== 'editorial') return html;
  const existing = [...html.matchAll(/<[a-z][^>]*>/gi)].filter(m => classTokens(m[0]).includes('journey-content') || attributes(m[0]).id === 'journey-content');
  // Ambiguous or externally prepared markup needs explicit inspection, not guessing.
  if (existing.length) return html;
  const candidates = articleCandidates(html);
  if (candidates.length !== 1) return html;
  const m = candidates[0], tag = m[0];
  const replaced = /\bclass\s*=\s*(["'])/.test(tag)
    ? tag.replace(/\bclass\s*=\s*(["'])(.*?)\1/i, (_, quote, value) => `class=${quote}${value} journey-content${quote}`)
    : tag.replace(/>$/, ' class="journey-content">');
  return html.slice(0, m.index) + replaced + html.slice(m.index + tag.length);
}
function walkHTML(root) {
  const files = [];
  const walk = directory => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) { if (directory === root && item.name === 'ads') continue; walk(file); }
      else if (item.name.endsWith('.html')) files.push(file);
    }
  };
  walk(root);
  return files.sort();
}
function routeFor(root, file) { return '/' + path.relative(root, file).replaceAll('\\', '/').replace(/index\.html$/, ''); }
function validateAnalyticsConfig(value = DEFAULT_ANALYTICS) {
  const issues = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid: false, requestedEnabled: false, activationAllowed: false, issues: ['Expected an analytics configuration object.'] };
  if (value.schema !== 1 || typeof value.enabled !== 'boolean') issues.push('A versioned, explicit enabled state is required.');
  if (value.measurementId !== null && value.measurementId !== undefined && (typeof value.measurementId !== 'string' || !/^G-[A-Z0-9]{6,20}$/.test(value.measurementId))) issues.push('The measurement ID must be the owner-provided GA4 web-stream ID.');
  if (value.consentMode !== 'basic') issues.push('This preparation supports a basic, no-request-before-consent design only.');
  if (value.enabled === true) {
    if (!value.measurementId) issues.push('The owner has not supplied a web-stream measurement ID.');
    if (value.ownerAuthorized !== true) issues.push('Owner authorization is missing.');
    if (value.consentReviewed !== true) issues.push('Analytics consent and withdrawal require review.');
    if (value.privacyReviewed !== true) issues.push('The applicable privacy disclosure requires review.');
  }
  return { valid: issues.length === 0, requestedEnabled: value.enabled === true, activationAllowed: false, state: 'prepared_only_no_runtime_adapter', issues };
}
function inspectHTML(html, route) {
  const state = editorialState(html, route);
  const landmarks = [...html.matchAll(/<([a-z][\w-]*)\b[^>]*>/gi)]
    .filter(m => classTokens(m[0]).includes('journey-content') || attributes(m[0]).id === 'journey-content');
  const externalScripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(m => attributes(m[0]).src).filter(Boolean);
  const issues = [];
  if (state === 'editorial' && landmarks.length !== 1) issues.push('An editorial body needs exactly one content landmark.');
  if (landmarks.some(m => m[1].toLowerCase() !== 'article')) issues.push('The content landmark must identify the article body, not a surrounding layout.');
  if (state !== 'editorial' && landmarks.length) issues.push('A content landmark appears outside a qualifying public article.');
  return {
    route, state, landmarks: landmarks.length,
    analyticsScriptCount: externalScripts.filter(src => /(?:googletagmanager\.com\/(?:gtag\/js|gtm\.js)|google-analytics\.com)/i.test(src)).length,
    journeyScriptCount: externalScripts.filter(src => /(?:scriptwrapper\.com|scripts\.journeymv\.com)/i.test(src)).length,
    localAdBootstrap: externalScripts.some(src => /^\/ads\.js(?:[?#]|$)/.test(src)), issues
  };
}
function audit({ root, analyticsConfig = DEFAULT_ANALYTICS } = {}) {
  if (!root || !fs.statSync(root).isDirectory()) throw Error('An existing generated site root is required.');
  const routes = walkHTML(root).map(file => inspectHTML(fs.readFileSync(file, 'utf8'), routeFor(root, file)));
  const editorial = routes.filter(item => item.state === 'editorial');
  const adAssets = path.join(root, 'ads.js');
  const adClient = fs.existsSync(adAssets) ? fs.readFileSync(adAssets, 'utf8') : '';
  const adSource = path.join(__dirname, 'ads-injection.mjs');
  const legacyGeneratorPresent = fs.existsSync(adSource) && fs.readFileSync(adSource, 'utf8').includes('addAdPlacements');
  const privacy = path.join(root, 'privacy/index.html');
  const privacyText = fs.existsSync(privacy) ? fs.readFileSync(privacy, 'utf8') : '';
  return {
    schema: 1, generatedAt: new Date().toISOString(), guidanceChecked: CHECKED, basis: 'Generated-file inspection, not a provider decision or private analytics audit',
    eligibility: { state: 'unverified', qualifyingSessions30Days: null, ga4AccountConnected: null, providerApproval: null },
    analytics: { ...validateAnalyticsConfig(analyticsConfig), pagesWithStaticGoogleTag: routes.filter(r => r.analyticsScriptCount).length, networkBehaviorVerified: false },
    advertising: {
      journeyPages: routes.filter(r => r.journeyScriptCount).length,
      existingAdsterra: /Adsterra|pcp-ad-consent|pcpartperformance-live.*\/ads\//.test(adClient) || legacyGeneratorPresent,
      existingProviderPreserved: true,
      journeyTransition: 'Owner-approved removal of existing programmatic ad code is required before Journey launch.',
      consentCodeObserved: /pcp-ad-consent/.test(adClient), globalPrivacyControlCodeObserved: /globalPrivacyControl/.test(adClient),
      networkBehaviorVerified: false
    },
    articles: { checked: editorial.length, semanticLandmarks: editorial.filter(r => r.landmarks === 1).length, issues: routes.flatMap(r => r.issues.map(message => ({ route: r.route, message }))) },
    policy: { aboutPresent: fs.existsSync(path.join(root, 'about/index.html')), editorialPolicyPresent: fs.existsSync(path.join(root, 'editorial-policy/index.html')), privacyPresent: fs.existsSync(privacy), ownerSpecificLegalReviewRequired: true, operationalPolicyDisclaimerPresent: /not a substitute for an owner-specific legal privacy policy/.test(privacyText) },
    selectors: { content: '.journey-content', sidebar: null, footer: 'footer', placementState: 'Prepared landmarks only; verify actual selectors and provider placeholders after approval.' },
    sources: Object.fromEntries(Object.entries(SOURCES).map(([id, source]) => [id, { ...source, checked: CHECKED }]))
  };
}
function polish({ root } = {}) {
  let changed = 0;
  for (const file of walkHTML(root)) {
    const before = fs.readFileSync(file, 'utf8');
    const after = polishHTML(before, routeFor(root, file));
    if (after !== before) { fs.writeFileSync(file, after); changed++; }
  }
  return { changed, ...audit({ root }) };
}
function bodyFor(report, esc) {
  const cite = key => `<a href="${SOURCES[key].url}">${esc(SOURCES[key].title)}</a>`;
  return `<header class="page-heading"><div><h1>Publisher readiness</h1><p>Setup checks for the site owner. Journey approval and traffic eligibility are not yet verified.</p></div></header>
<section class="evolution-publisher-summary" aria-label="Current setup"><dl><div><dt>Eligibility</dt><dd>Not verified</dd></div><div><dt>Analytics</dt><dd>No connected GA4 evidence</dd></div><div><dt>Article landmarks</dt><dd>${report.articles.semanticLandmarks} of ${report.articles.checked}</dd></div></dl><p>This checks generated files; it does not read a private analytics or publisher account. Source guidance checked <time datetime="${CHECKED}">October 19, 2026</time>.</p></section>
<section class="article-copy evolution-publisher-checklist"><h2>Owner checklist</h2><ol>
<li><strong>Connect the correct GA4 property.</strong> In Analytics, open Admin → Data streams → Web for this domain. Confirm its measurement ID and account access. A new tag needs a reviewed analytics consent choice, withdrawal control and privacy disclosure. ${cite('ga4')} · ${cite('consent')}</li>
<li><strong>Verify the audience.</strong> Use a real 30-day GA4 report. Journey lists 1,000 premium-market sessions, with the US, Canada, UK and Australia among the qualifying countries. Visitors, pageviews and sessions are different metrics; the provider makes the eligibility decision. ${cite('minimum')} · ${cite('markets')}</li>
<li><strong>Review the publication.</strong> Check article originality, sources, image permissions, About, contact/corrections and the owner-specific privacy policy. Automated checks cannot establish editorial quality or legal compliance.</li>
<li><strong>Apply through the publisher portal.</strong> The owner connects GA4 and submits site details at <a href="https://publishers.mediavine.com/join">Mediavine’s official portal</a>. No application has been submitted by this tool. ${cite('application')}</li>
<li><strong>Plan the ad-network transition.</strong> Current Adsterra code is preserved. Journey requires exclusive programmatic inventory; remove the old provider’s scripts and placements in an approved transition before launch. Affiliate links and properly disclosed direct sponsorship are separate. ${cite('remove')}</li>
<li><strong>Complete owner onboarding.</strong> Review the agreement, confirm site details, install only the account-issued wrapper and ads.txt, and complete required Stripe identity verification personally. Nothing here accepts terms or supplies identity. ${cite('application')} · ${cite('wrapper')} · ${cite('adsTxt')}</li>
<li><strong>Test before launch.</strong> Confirm consent, mobile reading, keyboard access, page speed and stable ad space. On an approved installation, use the provider’s <code>?test=placeholders</code> procedure and inspect real article placements. Leave placement selectors at their defaults unless a verified targeting problem calls for a change. ${cite('selectors')}</li>
</ol><h2>Custom article layout</h2><p>Public long-form blog and news bodies use one <code>.journey-content</code> landmark. Navigation, related-page layouts and interactive tools are outside that target. This is a targeting aid, not proof that ads work. No sidebar selector is supplied because this release has not verified a static ad-safe sidebar.</p><p>Keep ad slots outside animated, transformed or clipped surfaces. Do not insert ads inside component pickers, forms, diagrams or 3D controls. ${cite('layout')}</p><h2>Keep the measurement honest</h2><p>Record qualifying sessions, source countries, date range and property separately from reader engagement and revenue. Never publish private notes, build tokens or search text as event parameters. This report contains no traffic, ranking or revenue estimate.</p><p><a class="button secondary" href="/data/publisher-readiness.json">Open the generated audit</a> <a class="button secondary" href="/editorial-policy/">Editorial policy</a> <a class="button secondary" href="/privacy/">Privacy details</a></p></section>`;
}
function prepare(context) {
  const { root, shell, write, esc } = context || {};
  if (!root || typeof shell !== 'function' || typeof write !== 'function' || typeof esc !== 'function') throw Error('The existing site build context is required.');
  const report = polish({ root });
  const html = shell('Publisher Readiness: Journey Setup Checklist | PC Part Performance', 'resource', bodyFor(report, esc), { description: 'Owner checklist for analytics, article layout and Journey onboarding. No traffic eligibility or approval claim.', active: 'learn' })
    .replace(/<body\b/, '<body data-stage2-noindex data-publisher-readiness')
    .replace('</head>', '<meta name="robots" content="noindex, follow"></head>');
  write('resources/publisher-readiness', html);
  fs.mkdirSync(path.join(root, 'data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/publisher-readiness.json'), JSON.stringify(report));
  return report;
}

module.exports = { CHECKED, ROUTE, SOURCES, DEFAULT_ANALYTICS, validateAnalyticsConfig, editorialState, polishHTML, inspectHTML, audit, polish, prepare };

if (require.main === module) {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '../dist'));
  const report = audit({ root });
  const target = path.join(__dirname, '../docs/evolution-oct18/publisher-audit.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ articles: report.articles, analytics: report.analytics, advertising: report.advertising, eligibility: report.eligibility }, null, 2));
  if (report.articles.issues.length) process.exitCode = 1;
}
