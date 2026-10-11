// Local review files only. This does not expose the review server beyond localhost.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.js':'text/javascript','.html':'text/html','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
http.createServer((req,res)=>{
 let file;try{const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+(/^(?:\/vendor\/|\/assets\/)/.test(url)?'/dist'+url:url));}catch{res.writeHead(400).end();return;}
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});
}).listen(8851,'127.0.0.1',()=>console.log('Model review server on 127.0.0.1:8851'));
