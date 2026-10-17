import manifest from './route-manifest.mjs';
/* Local policy is bundled as ESM from the tested CommonJS policy at build time. */
import { policy } from './worker-policy.mjs';
import { handleMorningPriceRequest, scheduledMorningPrices } from './morning-price-service.mjs';
import publishedNews from './news-publications.mjs';
import { renderRecentNews } from './news-sitemap-response.mjs';
import { handlePublicPriceRequest, scheduledPublicPrices } from './public-price-service.mjs';
import { secureResponse } from './completion-security.mjs';
async function respond(request,env){
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
 headers.set('Cache-Control',manifest.staging||decision.headers['X-Robots-Tag']?'no-store':/\/assets\/css\/site-[a-f0-9]+\.css$/.test(file)?'public, max-age=31536000, immutable':/\.(?:html|json|xml|js|css)$/.test(file)?'public, max-age=0, must-revalidate':'public, max-age=300');
 return new Response(response.body,{status:decision.status>=400?decision.status:response.status,headers});
}
export default{async fetch(request,env){return secureResponse(await respond(request,env),request);},scheduled(controller,env,ctx){ctx.waitUntil(Promise.allSettled([scheduledMorningPrices(controller,env),scheduledPublicPrices(controller,env)]));}};
