'use strict';
// Development-only minification. The host validates and copies these committed outputs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function prepare(){
 const {minify}=require('../tools/quality/node_modules/terser');
 const directory=path.join(__dirname,'prepared-ui');fs.mkdirSync(directory,{recursive:true});
 const digest=value=>crypto.createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex');
 const manifest={schema:1,generator:'Terser 5.51.2',files:{}};
 for(const name of ['continuation-ui.js','builder-selectors.js','select-ui.js']){
  const source=fs.readFileSync(path.join(__dirname,name),'utf8').replace(/\r\n/g,'\n');
  const result=await minify(source,{compress:true,mangle:true,format:{comments:false}});if(!result.code)throw Error('Empty UI controller: '+name);
  const output=result.code+'\n';fs.writeFileSync(path.join(directory,name),output);
  manifest.files[name]={sourceHash:digest(source),outputHash:digest(output)};
 }
 fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('Prepared and fingerprinted three compact UI controllers.');
}
module.exports=prepare;
if(require.main===module)prepare().catch(error=>{console.error(error);process.exitCode=1;});
