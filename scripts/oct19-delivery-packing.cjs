'use strict';
// Lossless transport only: decoded catalog objects retain every JSON field.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const digest=value=>crypto.createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex');
function script(value,target,{minLength=64,minCount=2}={}){
 value=JSON.parse(JSON.stringify(value));const counts=new Map(),keys=new Map();
 function scan(v){if(typeof v==='string')counts.set(v,(counts.get(v)||0)+1);else if(Array.isArray(v))v.forEach(scan);else if(v&&typeof v==='object')for(const[k,item]of Object.entries(v)){keys.set(k,(keys.get(k)||0)+1);scan(item);}}
 scan(value);const K=[...keys].sort((a,b)=>b[1]-a[1]).map(r=>r[0]),S=[...counts].filter(([v,n])=>v.length>=minLength&&n>=minCount).sort((a,b)=>b[1]-a[1]).map(r=>r[0]),ki=new Map(K.map((k,i)=>[k,i])),si=new Map(S.map((s,i)=>[s,i]));
 function encode(v){if(typeof v==='string'&&si.has(v))return[2,si.get(v)];if(Array.isArray(v))return[1,...v.map(encode)];if(v&&typeof v==='object')return[0,...Object.entries(v).flatMap(([k,item])=>[ki.get(k),encode(item)])];return v;}
 return target+'=(()=>{const k='+json(K)+',s='+json(S)+';function d(v){if(!Array.isArray(v))return v;if(v[0]===2)return s[v[1]];if(v[0]===1)return v.slice(1).map(d);const o={};for(let i=1;i<v.length;i+=2)Object.defineProperty(o,k[v[i]],{value:d(v[i+1]),writable:true,enumerable:true,configurable:true});return o;}return d('+json(encode(value))+');})();';
}
function builderScript(value,target='window.PCP_BUILDER_CATALOG',options={}){
 const data=JSON.parse(JSON.stringify(value));
 for(const part of data)for(const holder of [part,part.evidence].filter(Boolean)){
  const fields=holder.fields;if(!fields||Array.isArray(fields)||Object.keys(fields).length<2)continue;const defaults={};
  for(const key of ['source','publisher','checked','model','status','exact','condition','unit']){
   const counts=new Map();for(const field of Object.values(fields))if(field&&Object.hasOwn(field,key)){const text=JSON.stringify(field[key]);counts.set(text,(counts.get(text)||0)+1);}
   const best=[...counts].sort((a,b)=>b[1]-a[1])[0];if(best?.[1]>=2)defaults[key]=JSON.parse(best[0]);
  }
  const keys=Object.keys(defaults);if(!keys.length)continue;
  holder.fields=[defaults,Object.entries(fields).map(([name,field])=>{let mask=0;keys.forEach((key,i)=>{if(Object.hasOwn(field,key)&&JSON.stringify(field[key])===JSON.stringify(defaults[key])){mask|=1<<i;delete field[key];}});return[name,mask,field];})];
 }
 return target+'=(()=>{'+script(data,'const a',options)+'for(const p of a)for(const h of [p,p.evidence]){if(!h||!Array.isArray(h.fields))continue;const[b,rows]=h.fields,k=Object.keys(b);h.fields=Object.fromEntries(rows.map(([n,m,f])=>{k.forEach((key,j)=>{if(m&(1<<j))f[key]=b[key];});return[n,f];}));}return a;})();';
}
const COMPACT_FILES=['core.js','interface.js','assembly-3d.js'];
async function prepareRuntime({root=path.resolve('dist')}={}){
 const {minify}=require('../tools/quality/node_modules/terser'),directory=path.join(__dirname,'prepared-oct19-delivery');fs.mkdirSync(directory,{recursive:true});const manifest={schema:1,generator:'Terser 5.51.2',options:{compress:{toplevel:false,unused:false},mangle:{toplevel:false}},files:{}};
 for(const name of COMPACT_FILES){const source=fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n'),result=await minify(source,{...manifest.options,format:{comments:false}});if(!result.code)throw Error('Empty compact runtime '+name);const output=result.code+'\n';fs.writeFileSync(path.join(directory,name),output);manifest.files[name]={sourceHash:digest(source),outputHash:digest(output)};}
 fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
}
function runtimeArtifacts(root){
 const directory=path.join(__dirname,'prepared-oct19-delivery'),manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
 return COMPACT_FILES.map(name=>{const source=fs.readFileSync(path.join(root,name),'utf8'),output=fs.readFileSync(path.join(directory,name),'utf8'),row=manifest.files[name];if(row?.sourceHash!==digest(source)||row.outputHash!==digest(output))throw Error('Stale compact delivery artifact: '+name+'; run node scripts/oct19-delivery-packing.cjs --prepare');return{name,output};});
}
function finalize({root}){
 const artifacts=runtimeArtifacts(root),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context,{timeout:2000});if(!Array.isArray(context.window.PCP_EXTRA))throw Error('Missing legacy data payload');
 fs.writeFileSync(path.join(root,'data-compact.js'),script(context.window.PCP_EXTRA,'window.PCP_EXTRA'));
 for(const{name,output}of artifacts)fs.writeFileSync(path.join(root,name.replace('.js','-compact.js')),output);
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.name.endsWith('.html')){let html=fs.readFileSync(file,'utf8');html=html.replace(/(<script\b[^>]*\bsrc="\/)(data|core|interface|assembly-3d)(\.js)([?"])/g,'$1$2-compact$3$4');fs.writeFileSync(file,html);}}}walk(root);
}
module.exports={script,builderScript,digest,prepareRuntime,runtimeArtifacts,finalize,COMPACT_FILES};
if(require.main===module&&process.argv.includes('--prepare'))prepareRuntime().catch(error=>{console.error(error);process.exitCode=1;});
