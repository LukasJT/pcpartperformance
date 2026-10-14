'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {minify}=require('../tools/quality/node_modules/terser');
async function main(){
 const source=fs.readFileSync(path.join(__dirname,'compatibility-evidence.cjs'),'utf8').replace(/\r\n/g,'\n');
 const result=await minify(source,{compress:true,mangle:true,format:{comments:false}});
 if(!result.code)throw Error('Compatibility minification produced no code');
 fs.writeFileSync(path.join(__dirname,'compatibility-evidence.browser.cjs'),result.code+'\n');
 fs.writeFileSync(path.join(__dirname,'compatibility-evidence.browser.json'),JSON.stringify({sourceHash:crypto.createHash('sha256').update(source).digest('hex'),generator:'Terser 5.51.2',minified:true},null,2)+'\n');
 const builderSource=fs.readFileSync(path.join(__dirname,'builder-program.js'),'utf8').replace(/\r\n/g,'\n');
 const builder=await minify(builderSource,{compress:true,mangle:true,format:{comments:false}});
 if(!builder.code)throw Error('Builder minification produced no code');
 fs.writeFileSync(path.join(__dirname,'builder-program.browser.js'),builder.code+'\n');
 fs.writeFileSync(path.join(__dirname,'builder-program.browser.json'),JSON.stringify({sourceHash:crypto.createHash('sha256').update(builderSource).digest('hex'),generator:'Terser 5.51.2',minified:true},null,2)+'\n');
 const shoppingSource=fs.readFileSync(path.join(__dirname,'shopping.js'),'utf8').replace(/\r\n/g,'\n');const shopping=await minify(shoppingSource,{compress:true,mangle:true,format:{comments:false}});if(!shopping.code)throw Error('Shopping output empty');fs.writeFileSync(path.join(__dirname,'shopping.browser.js'),shopping.code+'\n');fs.writeFileSync(path.join(__dirname,'shopping.browser.json'),JSON.stringify({sourceHash:crypto.createHash('sha256').update(shoppingSource).digest('hex'),generator:'Terser 5.51.2',minified:true},null,2)+'\n');
 console.log('Prepared compact compatibility engine without removing evidence or checks.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
