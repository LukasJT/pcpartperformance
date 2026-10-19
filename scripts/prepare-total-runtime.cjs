'use strict';
// Development-only compilation. Production only validates/copies this artifact.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const digest=value=>crypto.createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex');
async function prepare(){
 const source=fs.readFileSync(path.join(__dirname,'builder-v2.js'),'utf8').replace(/\r\n/g,'\n');
 const result=await require('../tools/quality/node_modules/terser').minify(source,{compress:{toplevel:false,unused:false},mangle:{toplevel:false},format:{comments:false}});
 if(!result.code)throw Error('Empty builder runtime');
 const output=result.code+'\n',directory=path.join(__dirname,'prepared-total');fs.mkdirSync(directory,{recursive:true});
 fs.writeFileSync(path.join(directory,'builder-v2.js'),output);fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify({schema:1,sourceHash:digest(source),outputHash:digest(output)},null,2)+'\n');
}
module.exports={prepare,digest};if(require.main===module)prepare().catch(error=>{console.error(error);process.exitCode=1;});
