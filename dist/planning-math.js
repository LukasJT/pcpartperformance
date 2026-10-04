(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PCPPlanning=api})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const number=(v,name,min=0,max=1e12)=>{if(v===''||v===null||v===undefined||typeof v==='boolean')throw Error('Enter '+name+'.');const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw Error(name+' is outside the supported range.');return n};
 return {
 electricity(v){const watts=number(v.watts,'measured watts',0,100000),hours=number(v.hours,'hours per day',0,24),rate=number(v.rate,'price per kWh',0,100);const kWh=watts*hours/1000;return{kWh,daily:kWh*rate,monthly:kWh*rate*30,annual:kWh*rate*365}},
 platform(v){const sum=key=>['cpu','board','ram','cooler','other'].reduce((n,f)=>n+number(v[key+f],key+' '+f,0,1e7),0),a=sum('a'),b=sum('b');return{a,b,difference:b-a}},
 display(v){const x=number(v.x,'horizontal pixels',1,100000),y=number(v.y,'vertical pixels',1,100000),diagonal=number(v.diagonal,'diagonal in inches',.1,1000),d=Math.hypot(x,y);return{ppi:d/diagonal,width:diagonal*x/d,height:diagonal*y/d}},
 recording(v){const bitrate=number(v.bitrate,'combined bitrate',.001,100000),hours=number(v.hours,'recording hours',0,100000),overhead=number(v.overhead,'allowance percent',0,1000),bytes=bitrate*1e6*hours*3600/8*(1+overhead/100);return{gb:bytes/1e9,gib:bytes/2**30}},
 ai(v){const parameters=number(v.parameters,'billions of parameters',.001,10000),bits=number(v.bits,'average bits per parameter',1,64),runtime=number(v.runtime,'runtime allowance in GiB',0,100000),kv=number(v.kv,'KV-cache budget in GiB',0,100000),weights=parameters*1e9*bits/8/2**30;return{weights,total:weights+runtime+kv}},
 frametime(v){return{frame:1000/number(v.fps,'FPS',.1,10000),refresh:1000/number(v.hz,'refresh rate',.1,10000)}},
 lanes(v){return{m2_3:v.m2&&v.slot?'PCIe 4.0 ×2':v.m2?'PCIe 4.0 ×4':'Not occupied',pci_e2:v.slot?'PCIe 4.0 ×2':'Not occupied',m2_2:v.cpu==='8500-8300'?'Unavailable with this CPU group':'Listed as available; check exact CPU and BIOS'}},
 phoneDifference(a,b){for(const p of[a,b])for(const k of['height','width','depth','weight'])number(p[k],k,.01,10000);return Object.fromEntries(['height','width','depth','weight'].map(k=>[k,b[k]-a[k]]))}
 };
});
