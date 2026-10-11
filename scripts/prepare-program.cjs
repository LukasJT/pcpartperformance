'use strict';
// Remove only this program's generated draft HTML before rebuilding the original routes.
const fs=require('fs'),path=require('path');
module.exports=root=>{const registry=path.join(root,'program-draft-routes.json');if(!fs.existsSync(registry))return;for(const route of JSON.parse(fs.readFileSync(registry,'utf8'))){if(typeof route!=='string'||!/^\/[a-z0-9/-]+\/$/.test(route))throw Error('Invalid draft route');const file=path.resolve(root,'.'+route,'index.html');if(!file.startsWith(path.resolve(root)+path.sep))throw Error('Draft path escaped build root');if(fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes('data-program-draft'))fs.unlinkSync(file)}const queue=path.join(root,'program-review/index.html');if(fs.existsSync(queue))fs.unlinkSync(queue)};
