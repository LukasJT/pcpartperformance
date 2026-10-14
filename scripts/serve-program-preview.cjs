'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=path.resolve(process.env.PROGRAM_DIST_ROOT||'dist'),manifest=JSON.parse(fs.readFileSync(path.join(root,'route-policy.json'),'utf8')),routing=require('./program-routing.cjs');
const port=Number(process.env.PROGRAM_PORT||4185),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.glb':'model/gltf-binary','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://127.0.0.1:'+port);if(url.pathname==='/robots.txt'){res.writeHead(200,{'Content-Type':'text/plain','X-Robots-Tag':'noindex, nofollow'});res.end('User-agent: *\nDisallow: /\n');return}
 if(url.pathname.startsWith('/api/v1/morning-prices')){const service=await import('./morning-price-service.mjs');const result=await service.handleMorningPriceRequest(new Request(url,{method:req.method}),{});if(result){res.writeHead(result.status,Object.fromEntries(result.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await result.arrayBuffer()));return}}
 if(url.pathname.startsWith('/api/v1/public-prices')){const service=await import('./public-price-service.mjs');const result=await service.handlePublicPriceRequest(new Request(url,{method:req.method}));if(result){res.writeHead(result.status,Object.fromEntries(result.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await result.arrayBuffer()));return}}
 if(url.pathname==='/qa-metrics.js'){let data=fs.readFileSync(path.join(__dirname,'program-qa-metrics.js'));const headers={'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff'};if(/gzip/.test(req.headers['accept-encoding']||'')){data=zlib.gzipSync(data);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding'}headers['Content-Length']=data.length;res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:data);return}
 const decision=routing.policy(url.href,manifest,{local:true,staging:true});
 if(decision.status===301){res.writeHead(301,decision.headers);res.end();return}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return}
 const pathname=decodeURIComponent(url.pathname),requested=path.resolve(root,'.'+pathname);
 if(requested!==root&&!requested.startsWith(root+path.sep))throw Error('Invalid path');
 let file=requested;if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 const exists=fs.existsSync(file)&&fs.statSync(file).isFile(),asset=exists&&!/\.html$/.test(file);
 let status=asset?200:decision.status;if(!exists||(!asset&&status>=400))file=path.join(root,'404.html');
 const type=types[path.extname(file)]||'application/octet-stream',headers={'Content-Type':type,'X-Robots-Tag':'noindex, follow','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 let data=fs.readFileSync(file);if(type.startsWith('text/html'))data=Buffer.from(data.toString().replace('</head>','<script src="/qa-metrics.js" defer></script></head>'));
 if(/gzip/.test(req.headers['accept-encoding']||'')&&/text|json|xml|svg/.test(type)){data=zlib.gzipSync(data);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding'}
 headers['Content-Length']=data.length;res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(400,{'X-Robots-Tag':'noindex, follow'});res.end('Invalid request')}
}).listen(port,'127.0.0.1',()=>console.log('Private local program staging: http://127.0.0.1:'+port));
