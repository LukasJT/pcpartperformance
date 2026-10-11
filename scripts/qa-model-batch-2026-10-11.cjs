// Uses a disposable headless Edge profile, never the user's browser session.
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),work=path.join(root,'tmp/model-batch-2026-10-11');
const out=path.join(root,'docs/program-2026-10-11/models');
const port=8852;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
  try{await fetch(`http://127.0.0.1:${port}/json/version`,{signal:AbortSignal.timeout(500)});throw Error('Review debugger port already in use');}catch(error){if(error.message==='Review debugger port already in use')throw error;}
  const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
    '--headless=new','--inprivate','--no-first-run','--no-default-browser-check','--disable-extensions',
    '--disable-background-networking','--use-angle=swiftshader','--enable-unsafe-swiftshader',
    '--window-size=1000,720',`--remote-debugging-port=${port}`,
    `--user-data-dir=${path.join(work,'edge-review-cdp')}`,'about:blank'
  ],{windowsHide:true,stdio:'ignore'});
  let page;
  for(let i=0;i<50;i++){try{page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{await delay(200);}}
  if(!page){edge.kill();throw Error('Isolated review browser did not start');}
  const ws=new WebSocket(page.webSocketDebuggerUrl),pending=new Map();let seq=0;
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}};
  const rpc=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>(await rpc('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
  const scenarios=process.argv[2]?JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8')):[
    {name:'msi-5070-trio',file:'/tmp/model-batch-2026-10-11/msi-5070-trio.glb',rotation:[Math.PI/2,Math.PI/2,0],size:[338,50,140],slot:'gpu',view:'angled',turns:0},
    {name:'iphone-13-pro-front',file:'/tmp/model-batch-2026-10-11/iphone-13-pro.glb',rotation:[0,-Math.PI/2,0],size:[71.5,146.7,7.65],slot:'cpu',view:'side',turns:0},
    {name:'iphone-13-pro-back',file:'/tmp/model-batch-2026-10-11/iphone-13-pro.glb',rotation:[0,-Math.PI/2,0],size:[71.5,146.7,7.65],slot:'cpu',view:'side',turns:13},
  ];
  const engines=[...new Set(scenarios.map(s=>s.phone?'dist/phone-scene.js':'dist/build-scene.js'))];
  const report={checkedAt:new Date().toISOString(),method:'Actual '+engines.join(' and ')+' and bundled glTF loader in an isolated headless InPrivate Edge profile with software WebGL. Screenshots are visual review, not certified fit.',scenarios:[]};
  try{
    await rpc('Page.enable');await rpc('Runtime.enable');
    for(const scenario of scenarios){
      await rpc('Emulation.setDeviceMetricsOverride',scenario.viewport||{width:1000,height:720,deviceScaleFactor:1,mobile:false});
      const query=new URLSearchParams({file:scenario.file,rotation:JSON.stringify(scenario.rotation),size:JSON.stringify(scenario.size),slot:scenario.slot,view:scenario.view,turns:String(scenario.turns)});
      await rpc('Page.navigate',{url:'http://127.0.0.1:8851/scripts/model-review-2026-10-11/'+(scenario.phone?'phone-viewer.html':'viewer.html')+'?'+query});
      let state;
      for(let i=0;i<80;i++){await delay(500);state=await evaluate('({title:document.title,result:document.getElementById("result")?.textContent,canvas:document.querySelector("canvas")?.dataset&&Object.assign({},document.querySelector("canvas").dataset)})');if(state.title==='REVIEW_READY'||state.title==='FAILED')break;}
      await delay(600);
      state=await evaluate('({title:document.title,result:document.getElementById("result")?.textContent,canvas:document.querySelector("canvas")?.dataset&&Object.assign({},document.querySelector("canvas").dataset)})');
      const shot=await rpc('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      const screenshot=scenario.name+'.png';fs.writeFileSync(path.join(out,screenshot),Buffer.from(shot.data,'base64'));
      report.scenarios.push({...scenario,state,screenshot});console.log(scenario.name,state.title,state.result);
    }
    fs.writeFileSync(path.join(out,process.argv[3]||'viewer-review.json'),JSON.stringify(report,null,2)+'\n');
  }finally{try{await rpc('Browser.close');}catch{}ws.close();edge.kill();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
