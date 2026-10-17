const ELIGIBLE = new Set(['home', 'guide', 'hardware', 'learn', 'catalog-page']);

export function addAdPlacements(html) {
  const page = html.match(/<body\b[^>]*data-page="([^"]+)"/)?.[1];
  if (!ELIGIBLE.has(page) || !html.includes('</main>')) return html;

  const slot = type => `<div class="pcp-ad-slot" data-pcp-ad="${type}" aria-label="Advertisement"></div>`;
  html = html.replace('</head>', '<link rel="stylesheet" href="/ads.css"><script defer src="/ads.js"></script></head>');
  if (page === 'home') {
    html = html.replace(/(<section class="tech-intro"[\s\S]*?<\/section>)/, `$1${slot('responsive')}`);
    html = html.replace('</main>', `${slot('native')}</main>`);
  } else {
    html = html.replace('</main>', `${slot(page === 'guide' ? 'rectangle' : 'responsive')}</main>`);
  }
  return html.replace('</footer>', '<button class="pcp-ad-choices" type="button">Ad choices</button></footer>');
}
