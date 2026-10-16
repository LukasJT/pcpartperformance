'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function prepareCooling(root){
 const {COOLERS,validateCatalog}=require('./oct16-cooling-data.cjs');
 const validation=validateCatalog(COOLERS);if(validation.valid===false||Array.isArray(validation)&&validation.length)throw Error('Invalid sourced cooler catalog');
 const code='window.PCP_COOLERS='+JSON.stringify(COOLERS).replace(/</g,'\\u003c')+';\nfor(const p of window.PCP_COOLERS)if(!catalog.some(x=>x.id===p.id))catalog.push(p);\nif(!categories.some(x=>x[0]==="cooler"))categories.push(["cooler","CPU coolers"]);if(!buildSlotDefs.some(x=>x.id==="cooler"))buildSlotDefs.push({id:"cooler",label:"CPU cooler",required:false});icons.cooler=\'<rect x="5" y="4" width="14" height="16" rx="2"/><circle cx="12" cy="12" r="5"/><path d="M3 8h2m14 0h2M3 16h2m14 0h2"/>\';\n';
 fs.writeFileSync(path.join(root,'cooling-data.js'),code);
 return {records:COOLERS.length,source:'manufacturer-documented-models'};
};
