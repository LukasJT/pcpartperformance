'use strict';
// Local, disposable browser QA. No personal browser profile or external URLs.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),rows=require('./total-models.cjs').records();
const pause=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const safe=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function page(row,dark){
 return `<!doctype html><html lang="en" data-motion="reduced"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Loading</title><script type="importmap">{"imports":{"three":"/vendor/three/build/three.module.min.js"}}</script><style>*{box-sizing:border-box}html{background:${dark?'#101922':'#edf2f6'};color:${dark?'#e5eef5':'#172c40'};font:16px/1.5 system-ui}body{margin:0;padding:clamp(16px,3vw,32px)}main{max-width:960px;margin:auto}h1{font-size:clamp(20px,3vw,30px);line-height:1.2;margin:6px 0 10px}.label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${dark?'#b6d5e6':'#35576a'}}#host{height:clamp(240px,48vh,440px);border-radius:20px;background:${dark?'#172833':'#fff'};margin:20px 0;overflow:hidden}canvas{display:block;width:100%;height:100%}.dimensions{display:flex;flex-wrap:wrap;gap:12px 24px}strong{font-size:22px}.axis{display:grid;gap:2px}.note{max-width:65ch;color:${dark?'#b6c8d5':'#425c6e'};font-size:14px}a{color:inherit}#result{font-size:12px;overflow-wrap:anywhere}</style><main><span class="label">Original dimension envelope · approximate appearance</span><h1>${safe(row.name)}</h1><p class="note">A visual reference for published outer dimensions. Fans, connectors and mounting positions are not represented.</p><div id="host"></div><div class="dimensions">${row.dimensionsMm.map((value,index)=>`<div class="axis"><span>${['Length','Thickness','Height'][index]}</span><strong>${value}<small> mm</small></strong></div>`).join('')}</div><p class="note">This is not a clearance check or a manufacturer CAD model. <a href="${safe(row.source)}">Manufacturer specification</a></p><output id="result">Loading</output></main><script type="module">import {createBuildScene} from '/build-scene.js';const host=document.getElementById('host'),record=${JSON.stringify({...row,model:'/assets/models/'+row.asset}).replaceAll('<','\\u003c')};window.reviewScene=createBuildScene(host,()=>{});try{const result=await window.reviewScene.update([{id:record.id,slot:'gpu',index:0,name:record.name,record}]);window.reviewScene.view('angled');document.getElementById('result').textContent=JSON.stringify(result);document.title=result.failed.length?'FAILED':'REVIEW_READY';}catch(error){document.title='FAILED';document.getElementById('result').textContent=error.message;}</script></html>`;
}
async function main(){
 const directory=path.join(ROOT,'docs/total-refinement/models');fs.mkdirSync(directory,{recursive:true});
 const temporaryRoot=path.join(ROOT,'tmp');fs.mkdirSync(temporaryRoot,{recursive:true});
 const profile=fs.mkdtempSync(path.join(temporaryRoot,'total-models-edge-'));
 const allowed=new Map(rows.map(row=>['/assets/models/'+row.asset,path.join(ROOT,'scripts/assets/total-models',row.asset)]));
 for(const file of ['build-scene.js','evolution-scene-motion.js'])allowed.set('/'+file,path.join(ROOT,'dist',file));
 const server=http.createServer((request,response)=>{
  try{
   const url=new URL(request.url,'http://127.0.0.1');
   if(url.pathname==='/review/'){const row=rows.find(item=>item.id===url.searchParams.get('id'));if(!row){response.writeHead(404).end();return;}response.setHeader('Content-Type','text/html');response.end(page(row,url.searchParams.has('dark')));return;}
   let file=allowed.get(url.pathname);
   if(!file&&/^\/vendor\/[a-zA-Z0-9_./-]+\.js$/.test(url.pathname)){const vendor=path.resolve(ROOT,'dist/vendor'),candidate=path.resolve(ROOT,'dist',url.pathname.slice(1));if(candidate.startsWith(vendor+path.sep))file=candidate;}
   if(!file||!fs.existsSync(file)){response.writeHead(404).end();return;}
   response.setHeader('Content-Type',file.endsWith('.glb')?'model/gltf-binary':'text/javascript');response.end(fs.readFileSync(file));
  }catch{response.writeHead(500).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port,edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--inprivate','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let socket,rpc;const report={checkedAt:new Date().toISOString(),engine:'Actual generated build-scene.js and vendored glTF loader; disposable InPrivate Edge, software WebGL',externalURLsRequested:[],scenarios:[]};
 try{
  let debugPort;for(let attempt=0;attempt<80;attempt++){try{debugPort=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);if(debugPort)break;}catch{}await pause(150);}
  if(!debugPort)throw Error('Disposable review browser failed to start.');
  const target=await(await fetch('http://127.0.0.1:'+debugPort+'/json/new?about:blank',{method:'PUT'})).json();
  socket=new globalThis.WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let sequence=0;const pending=new Map();socket.onmessage=event=>{const value=JSON.parse(event.data);if(value.method==='Network.requestWillBeSent'&&/^https?:/.test(value.params.request.url)&&new URL(value.params.request.url).origin!=='http://127.0.0.1:'+port)report.externalURLsRequested.push(value.params.request.url);if(pending.has(value.id)){const call=pending.get(value.id);pending.delete(value.id);value.error?call.reject(Error(value.error.message)):call.resolve(value.result);}};
  rpc=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>(await rpc('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
  await rpc('Page.enable');await rpc('Runtime.enable');await rpc('Network.enable');await rpc('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const scenarios=rows.map(row=>({id:row.id,width:1024,height:720,dark:false}));
  scenarios.push({id:'total-gpu-asrock-a310-lp-4g',width:320,height:740,dark:false},{id:'total-gpu-msi-geforce-gtx-1080-ti-gaming-x-11g',width:390,height:844,dark:true},{id:'total-gpu-gigabyte-gv-n75toc-2gi',width:768,height:800,dark:false});
  for(const scenario of scenarios){
   await rpc('Emulation.setDeviceMetricsOverride',{width:scenario.width,height:scenario.height,deviceScaleFactor:1,mobile:scenario.width<500});
   await rpc('Page.navigate',{url:'http://127.0.0.1:'+port+'/review/?id='+scenario.id+(scenario.dark?'&dark':'')});
   let state;for(let attempt=0;attempt<80;attempt++){await pause(100);state=await evaluate('({title:document.title,result:document.querySelector("#result")?.textContent,canvas:document.querySelector("canvas")?.dataset&&{...document.querySelector("canvas").dataset},overflow:document.documentElement.scrollWidth>innerWidth})');if(['REVIEW_READY','FAILED'].includes(state?.title))break;}
   await pause(160);const name=scenario.id+'-'+scenario.width+(scenario.dark?'-dark':'')+'.png',shot=await rpc('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(directory,name),Buffer.from(shot.data,'base64'));
   report.scenarios.push({...scenario,...state,screenshot:name});if(state?.title!=='REVIEW_READY'||state.overflow)throw Error('Rendered model QA failed: '+JSON.stringify(report.scenarios.at(-1)));
  }
  if(report.externalURLsRequested.length)throw Error('Unexpected remote request in local model review.');
  fs.writeFileSync(path.join(directory,'rendered-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({rendered:report.scenarios.length,failed:0,output:directory},null,2));
 }finally{if(rpc)try{await rpc('Browser.close');}catch{}socket?.close();edge.kill();server.close();}
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={page};
