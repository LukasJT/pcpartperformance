'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function prepare(){
 const {minify}=require('../tools/quality/node_modules/terser'),directory=path.join(__dirname,'prepared-evolution');fs.mkdirSync(directory,{recursive:true});
 const hash=value=>crypto.createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex'),manifest={schema:1,generator:'Terser 5.51.2',files:{}};
 for(const name of ['evolution-theme.js','evolution-motion.js']){const source=fs.readFileSync(path.join(__dirname,name),'utf8').replace(/\r\n/g,'\n'),result=await minify(source,{compress:true,mangle:true,format:{comments:false}});if(!result.code)throw Error('Empty runtime '+name);const output=result.code+'\n';fs.writeFileSync(path.join(directory,name),output);manifest.files[name]={sourceHash:hash(source),outputHash:hash(output)};}
 fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log('Prepared two fingerprinted evolution controllers.');
}
module.exports=prepare;if(require.main===module)prepare().catch(error=>{console.error(error);process.exitCode=1;});
