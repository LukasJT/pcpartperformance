import manifest from './route-manifest.mjs';
/* Local policy is bundled as ESM from the tested CommonJS policy at build time. */
import { policy } from './worker-policy.mjs';
import { handleMorningPriceRequest, scheduledMorningPrices } from './morning-price-service.mjs';
import publishedNews from './news-publications.mjs';
import { renderRecentNews } from './news-sitemap-response.mjs';
import { handlePublicPriceRequest, scheduledPublicPrices } from './public-price-service.mjs';
import { secureResponse } from './completion-security.mjs';
import { addAdPlacements } from './ads-injection.mjs';
async function respond(request,env){
 const url=new URL(request.url);
 if(/^\/ads\/(?:728x90|468x60|320x50|300x250|native)\.html$/.test(url.pathname)){
  if(url.hostname==='www.pcpartperformance.com'||url.hostname==='pcpartperformance.com')return Response.redirect('https://pcpartperformance-live.lukastadros06.workers.dev'+url.pathname,302);
  if(url.hostname==='pcpartperformance-live.lukastadros06.workers.dev'){
   if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
   const ad=await env.ASSETS.fetch(new Request(url,{method:request.method,headers:request.headers}));
   return new Response(ad.body,{status:ad.status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate','X-Robots-Tag':'noindex, follow'}});
  }
 }
 const publicPrice=await handlePublicPriceRequest(request,env);if(publicPrice)return publicPrice;
 const morning=await handleMorningPriceRequest(request,env);if(morning)return morning;
 const decision=policy(request.url,manifest,{staging:manifest.staging});
 if(decision.status===301)return new Response(null,{status:301,headers:decision.headers});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD','X-Robots-Tag':'noindex, follow'}});
 if(decision.status===200&&decision.route==='/news-sitemap.xml')return new Response(request.method==='HEAD'?null:renderRecentNews(publishedNews),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':manifest.staging||decision.headers['X-Robots-Tag']?'no-store':'public, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff',...decision.headers}});
 // The Worker owns URL formatting. Disabling automatic asset HTML redirects
 // avoids an .html -> clean URL -> .html loop for existing product URLs.
 const file=decision.status>=400?'/404.html':decision.route.endsWith('/')?decision.route+'index.html':decision.route;
 const assetRequest=new Request(new URL(file,request.url),{method:request.method,headers:request.headers});
 const response=await env.ASSETS.fetch(assetRequest),headers=new Headers(response.headers);
 for(const [key,value]of Object.entries(decision.headers))headers.set(key,value);
 headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 headers.set('Cache-Control',manifest.staging||decision.headers['X-Robots-Tag']?'no-store':/\/assets\/(?:css\/site-[a-f0-9]+\.css|fonts\/(?:dm-sans|space-grotesk)-[a-z-]+-v\d+\.woff2)$/.test(file)?'public, max-age=31536000, immutable':/\.(?:html|json|xml|js|css)$/.test(file)?'public, max-age=0, must-revalidate':'public, max-age=300');
 if(request.method==='GET'&&decision.status===200&&response.ok&&headers.get('content-type')?.includes('text/html')&&!file.startsWith('/ads/')){
  const html=addAdPlacements(await response.text());
  headers.delete('content-length');headers.delete('content-encoding');headers.delete('etag');
  return new Response(html,{status:response.status,headers});
 }
 return new Response(response.body,{status:decision.status>=400?decision.status:response.status,headers});
}
export default{async fetch(request,env){return secureResponse(await respond(request,env),request);},scheduled(controller,env,ctx){ctx.waitUntil(Promise.allSettled([scheduledMorningPrices(controller,env),scheduledPublicPrices(controller,env)]));}};
