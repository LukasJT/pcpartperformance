// Deployment adapter: call before sending HTML from a Node/edge request handler.
// Not installed on the current static Sites host. Never report it as live middleware.
const curated={
 'rtx5060ti16,rtx5070':'/compare/rtx-5070-vs-rtx-5060-ti-16gb/',
 'rtx5070,rx9070':'/compare/rtx-5070-vs-rx-9070/',
 '7800x3d,9800x3d':'/compare/ryzen-7-9800x3d-vs-7800x3d/'
};
module.exports=(input,validIds)=>{
 const url=new URL(input,'https://www.pcpartperformance.com'),headers={};
 const state=['q','category','era','sort','parts','build'].some(k=>url.searchParams.has(k));
 if(state)headers['X-Robots-Tag']='noindex, follow';
 if(url.pathname==='/compare/'&&url.searchParams.has('parts')){
  const ids=url.searchParams.get('parts').split(',').filter(Boolean);
  if(!ids.length||ids.length>4||ids.some(id=>!validIds.has(id)))return {status:404,headers};
  const key=[...new Set(ids)].sort().join(',');
  if(curated[key])return {status:301,headers:{Location:curated[key]}};
 }
 if(url.hostname==='pcpartperformance.com')return{status:301,headers:{Location:'https://www.pcpartperformance.com'+url.pathname+url.search}};
 return{status:200,headers};
};
