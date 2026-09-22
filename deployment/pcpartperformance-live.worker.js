// Public-domain proxy. Keep the current redesign origin; add the ad assets
// published separately without replacing FPS, blog, or shopping functionality.
const CONTENT_ORIGIN = 'https://pcpartperformance-redesign.ktfkyd72bv.chatgpt.site';
const ADS_ORIGIN = 'https://pc-part-performance.lukajt.chatgpt.site';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'pcpartperformance.com') {
      return Response.redirect('https://www.pcpartperformance.com' + url.pathname + url.search, 301);
    }
    const adAsset = /^\/ads\/(?:728x90|468x60|320x50|300x250|160x600|160x300|native)(?:\.html)?$/.test(url.pathname)
      || ['/ads.js', '/ads.css', '/privacy/'].includes(url.pathname);
    const upstream = new URL(url.pathname + url.search, adAsset ? ADS_ORIGIN : CONTENT_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete('host');
    const response = await fetch(upstream, { method: request.method, headers });
    if (adAsset && response.ok && url.pathname === '/ads.js') {
      const js = (await response.text()).replace('https://pc-part-performance.lukajt.chatgpt.site', 'https://pcpartperformance-live.lukastadros06.workers.dev');
      return new Response(js, {headers: {'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-cache'}});
    }
    if (adAsset && response.ok && url.pathname.startsWith('/ads/')) {
      let doc = await response.text();
      doc = doc.replace('</style><script', '</style><body><script') + '</body>';
      doc = doc.replace('frame-src https:;', 'connect-src https://www.highrevenueformat.com https://protrafficinspector.com https://kettledroopingcontinuation.com; frame-src https:;');
      return new Response(doc, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache'}});
    }
    if (adAsset || request.method !== 'GET' || response.status !== 200
      || !response.headers.get('content-type')?.includes('text/html')) return response;
    let html = await response.text();
    if (html.includes('src="/ads.js"')) return new Response(html, response);
    const page = html.match(/<body[^>]*data-page="([^"]+)"/)?.[1];
    if (!['home', 'hardware', 'record', 'guide', 'learn', 'compare', 'builder', 'article'].includes(page)) {
      return new Response(html, response);
    }
    html = html.replace('</head>', '<link rel="stylesheet" href="/ads.css"><script defer src="/ads.js?v=20260922b"></script></head>');
    html = html.replace(/(<main\b[^>]*>)/, '$1<div class="ad-slot" data-ad-slot="responsive" aria-label="Advertisement"></div>');
    if (page === 'home') html = html.replace('</main>', '<div class="ad-slot" data-ad-slot="native" aria-label="Advertisement"></div></main>');
    if (page === 'record' || page === 'article') html = html.replace('</main>', '<div class="ad-slot" data-ad-slot="rectangle" aria-label="Advertisement"></div></main>');
    html = html.replace('</footer>', '<button class="manage-ads" type="button">Ad choices</button></footer>');
    const resultHeaders = new Headers(response.headers);
    resultHeaders.delete('content-length');
    resultHeaders.delete('content-encoding');
    resultHeaders.delete('etag');
    resultHeaders.set('cache-control', 'no-cache');
    return new Response(html, { status: response.status, statusText: response.statusText, headers: resultHeaders });
  }
};

