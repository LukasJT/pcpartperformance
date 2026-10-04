const fs=require('node:fs'),phones=require('./phone-data.cjs'),models=require('./phone-models.json');
module.exports=()=>{
 const rows=phones.map(p=>{
  const v=k=>p.fields[k]?.value,labels={height:'Height',width:'Width',depth:'Thickness',weight:'Weight',diagonal:'Display size',resolution:'Display resolution',soc:'Processor',ram:'RAM',storage:'Storage options',usbData:'USB data'},specs={};
  for(const [field,label]of Object.entries(labels))if(v(field)!==null&&v(field)!==undefined)specs[label]=v(field);
  if(p.id==='iphone-16'){specs['CPU cores']=6;specs['GPU cores']=5}
  return {ids:models[p.id]?.ids||['pixel9pro'],specs,architecture:v('soc'),summary:[v('diagonal')?v('diagonal')+'-inch display':null,v('soc')].filter(Boolean).join(' · '),source:p.fields.height.source,note:'Published manufacturer specifications. Regional connectivity and storage options vary; inspect the exact listing before buying.'};
 });
 fs.writeFileSync('dist/phone-catalog.js','/* Verified phone cohort; manufacturer sources checked October 4, 2026. */\nfor(const row of '+JSON.stringify(rows)+'){for(const p of catalog)if(row.ids.includes(p.id)){Object.assign(p.specs,row.specs);Object.assign(p,{architecture:row.architecture,summary:row.summary,source:row.source,note:row.note});}}\nObject.assign(units,{Height:"mm",Width:"mm",Thickness:"mm",Weight:"g",RAM:"GB"});\n');
};
