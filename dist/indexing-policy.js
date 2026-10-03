/* Static-host fallback. Query response headers still require the host policy in docs. */
(()=>{'use strict';
 const url=new URL(location.href),stateKeys=['q','category','era','sort','parts','build'],isState=stateKeys.some(k=>url.searchParams.has(k));
 if(!isState)return;
 const robots=document.querySelector('meta[name="robots"]');if(robots)robots.content='noindex,follow';
 const comparisons={
  'rtx5060ti16,rtx5070':'/compare/rtx-5070-vs-rtx-5060-ti-16gb/',
  'rtx5070,rx9070':'/compare/rtx-5070-vs-rx-9070/',
  '7800x3d,9800x3d':'/compare/ryzen-7-9800x3d-vs-7800x3d/'
 };
 if(url.pathname==='/compare/'&&url.searchParams.has('parts')){
  const key=[...new Set(url.searchParams.get('parts').split(',').filter(Boolean))].sort().join(','),target=comparisons[key];
  if(target){const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href='https://www.pcpartperformance.com'+target;}
 }
})();
