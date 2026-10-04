const fs=require('node:fs'),phones=require('./phone-data.cjs'),models=require('./phone-models.json');
module.exports=()=>{
 const rows=phones.map(p=>{
  const v=k=>p.fields[k]?.value,labels={height:'Height',width:'Width',depth:'Thickness',weight:'Weight',diagonal:'Display size',resolution:'Display resolution',soc:'Processor',ram:'RAM',storage:'Storage options',usbData:'USB data'},specs={};
  for(const [field,label]of Object.entries(labels))if(v(field)!==null&&v(field)!==undefined)specs[label]=v(field);
  if(p.id==='iphone-16'){specs['CPU cores']=6;specs['GPU cores']=5}
  return {ids:models[p.id]?.ids||[p.id,...(p.id==='pixel-9-pro'?['pixel9pro']:[])],specs,...(v('soc')?{architecture:v('soc')}:{}),summary:[v('diagonal')?v('diagonal')+'-inch display':null,v('soc')].filter(Boolean).join(' · '),source:p.fields.height.source,note:'Published source specifications. Regional connectivity and storage options vary; inspect the exact listing before buying.'};
 });
 const newParts=phones.map(p=>({id:models[p.id]?.ids[0]||p.id,name:p.name,brand:p.id.startsWith('iphone')?'Apple':p.id.startsWith('pixel')?'Google':p.id.startsWith('oneplus')?'OnePlus':'Samsung',cat:'phone',specs:{}}));
 fs.writeFileSync('dist/phone-catalog.js','/* Sourced phone specifications checked October 4, 2026. */\n(()=>{const rows='+JSON.stringify(rows)+';for(const part of '+JSON.stringify(newParts)+'){const row=rows.find(r=>r.ids.includes(part.id));if(!catalog.some(p=>row.ids.includes(p.id)))catalog.push(part);}\nfor(const row of rows){for(const p of catalog)if(row.ids.includes(p.id)){Object.assign(p.specs,row.specs);if(row.architecture)p.architecture=row.architecture;Object.assign(p,{summary:row.summary,source:row.source,note:row.note});}}})();\nObject.assign(units,{Height:"mm",Width:"mm",Thickness:"mm",Weight:"g",RAM:"GB"});\n');
};
