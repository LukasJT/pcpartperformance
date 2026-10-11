import manifest from './route-manifest.mjs';
/* Local policy is bundled as ESM from the tested CommonJS policy at build time. */
import { policy } from './worker-policy.mjs';
import { handleMorningPriceRequest, scheduledMorningPrices } from './morning-price-service.mjs';
export default{async fetch(request,env){
 const morning=await handleMorningPriceRequest(request,env);if(morning)return morning;
 const decision=policy(request.url,manifest,{staging:manifest.staging});
 if(decision.status===301)return new Response(null,{status:301,headers:decision.headers});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD','X-Robots-Tag':'noindex, follow'}});
 // The Worker owns URL formatting. Disabling automatic asset HTML redirects
 // avoids an .html -> clean URL -> .html loop for existing product URLs.
 const file=decision.status>=400?'/404.html':decision.route.endsWith('/')?decision.route+'index.html':decision.route;
 const assetRequest=new Request(new URL(file,request.url),{method:request.method,headers:request.headers});
 const response=await env.ASSETS.fetch(assetRequest),headers=new Headers(response.headers);
 for(const [key,value]of Object.entries(decision.headers))headers.set(key,value);
 headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 headers.set('Cache-Control',manifest.staging||decision.headers['X-Robots-Tag']?'no-store':/\/assets\/css\/site-[a-f0-9]+\.css$/.test(file)?'public, max-age=31536000, immutable':/\.(?:html|json|xml|js|css)$/.test(file)?'public, max-age=0, must-revalidate':'public, max-age=300');
 return new Response(response.body,{status:decision.status>=400?decision.status:response.status,headers});
},scheduled(controller,env,ctx){ctx.waitUntil(scheduledMorningPrices(controller,env));}};
