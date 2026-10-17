const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../..');
const url='https://api.imgur.com/oembed.json?url=https://imgur.com/a/O4VIaWq';
(async()=>{const out={url};try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});out.status=r.status;console.log(r.status);if(r.ok){const t=await r.text();out.body=t;console.log(t.slice(0,6000));}}catch(e){out.error=e.message;console.log(e.message);}fs.writeFileSync(path.join(__dirname,'remaining-special-oembed.json'),JSON.stringify(out,null,2));})();
