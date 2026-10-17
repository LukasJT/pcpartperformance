'use strict';
/* Local adapter around the actual Worker, with isolated on-page QA instrumentation. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve('dist'),port=Number(process.env.PROGRAM_PORT||4198),origin='http://127.0.0.1:'+port;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.xml':'application/xml; charset=utf-8','.woff2':'font/woff2'};
const files={'/__completion/axe.min.js':path.resolve('tools/quality/vendor/axe-core/4.14.0/axe.min.js'),'/__completion/a11y.js':path.join(__dirname,'completion-a11y.js'),'/qa-metrics.js':path.join(__dirname,'program-qa-metrics.js')};
const assets={async fetch(request){const pathname=decodeURIComponent(new URL(request.url).pathname),file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return new Response(null,{status:404});return new Response(request.method==='HEAD'?null:fs.readFileSync(file),{headers:{'Content-Type':types[path.extname(file)]||'application/octet-stream'}});}};
const worker=import('./worker.mjs');
http.createServer(async(req,res)=>{
 try{
  const local=new URL(req.url,origin);let result;
  if(local.pathname==='/robots.txt')result=new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
  else if(files[local.pathname])result=new Response(req.method==='HEAD'?null:fs.readFileSync(files[local.pathname]),{headers:{'Content-Type':'text/javascript; charset=utf-8'}});
  else result=await (await worker).default.fetch(new Request('https://www.pcpartperformance.com'+local.pathname+local.search,{method:req.method}),{ASSETS:assets});
  const headers=Object.fromEntries(result.headers);headers['x-robots-tag']='noindex, nofollow';headers['cache-control']='no-store';delete headers['strict-transport-security'];if(headers.location?.startsWith('https://www.pcpartperformance.com/'))headers.location=origin+headers.location.slice('https://www.pcpartperformance.com'.length);
  let bytes=Buffer.from(await result.arrayBuffer());if((headers['content-type']||'').startsWith('text/html')&&req.method!=='HEAD')bytes=Buffer.from(bytes.toString().replace('</head>','<script src="/qa-metrics.js" defer></script>'+(local.searchParams.get('__qa')==='performance'?'':'<script src="/__completion/axe.min.js" defer></script><script src="/__completion/a11y.js" defer></script>')+'</head>'));
  if(/gzip/.test(req.headers['accept-encoding']||'')&&/text|json|xml|svg/.test(headers['content-type']||'')){bytes=zlib.gzipSync(bytes);headers['content-encoding']='gzip';headers.vary='Accept-Encoding';}headers['content-length']=bytes.length;res.writeHead(result.status,headers);res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(400,{'Content-Type':'text/plain','X-Robots-Tag':'noindex, nofollow'});res.end('Invalid preview request');}
}).listen(port,'127.0.0.1',()=>console.log('Local Worker and accessibility QA: '+origin));
