/* One response policy for HTML, assets, redirects and APIs. No credentials or reporting endpoint. */
export const CONTENT_SECURITY_POLICY=[
 "default-src 'self'",
 "script-src 'self' 'wasm-unsafe-eval'",
 "script-src-attr 'none'",
 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
 "font-src 'self' https://fonts.gstatic.com",
 "img-src 'self' data: blob: https:",
 "connect-src 'self' blob:",
 "worker-src 'self' blob:",
 "media-src 'self' blob:",
 "frame-src 'self' https://www.youtube-nocookie.com https://pcpartperformance-live.lukastadros06.workers.dev",
 "object-src 'none'",
 "base-uri 'self'",
 "form-action 'self'",
 "frame-ancestors 'self'"
].join('; ');
export function secureResponse(response,request){
 const headers=new Headers(response.headers),url=new URL(request.url);
 const adDocument=/^\/ads\/(?:728x90|468x60|320x50|300x250|native)\.html$/.test(url.pathname);
 headers.set('Content-Security-Policy',adDocument?
  "default-src 'none'; script-src 'unsafe-inline' https:; style-src 'unsafe-inline' https:; img-src https: data:; connect-src https:; frame-src https:; form-action https:; object-src 'none'; base-uri 'none'; frame-ancestors https://www.pcpartperformance.com":CONTENT_SECURITY_POLICY);
 headers.set('X-Content-Type-Options','nosniff');
 if(adDocument)headers.delete('X-Frame-Options');else headers.set('X-Frame-Options','SAMEORIGIN');
 headers.set('Referrer-Policy',adDocument?'no-referrer':'strict-origin-when-cross-origin');
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
 if(url.protocol==='https:'&&['www.pcpartperformance.com','pcpartperformance.com'].includes(url.hostname))headers.set('Strict-Transport-Security','max-age=31536000');
 return new Response(request.method==='HEAD'?null:response.body,{status:response.status,statusText:response.statusText,headers});
}
