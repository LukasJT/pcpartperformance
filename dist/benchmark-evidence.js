/* Shared validation contract. An empty dataset does not imply that hardware is slow. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PCP_BENCHMARKS=factory()})(typeof window==='object'?window:globalThis,()=>{
  'use strict';
  const conditions=['gameId','gameVersion','gpuId','cpuId','ramConfiguration','resolution','quality','driver','rayTracing','upscaling','frameGeneration','testScene'];
  const recordFields=[...conditions,'id','sourceUrl','publisher','measuredAt','metricDefinition','redistributionRights'];
  function validate(record,{now=Date.now()}={}){
    const errors=[];
    for(const field of recordFields)if(typeof record?.[field]!=='string'||!record[field].trim())errors.push('Missing '+field);
    if(record?.measurementStatus!=='measured')errors.push('Not a measured record');
    if(!['site_owned','permission_recorded','open_license_recorded'].includes(record?.redistributionRights))errors.push('Redistribution permission missing');
    if(!/^https:\/\//.test(record?.sourceUrl||''))errors.push('HTTPS source required');
    if(!Number.isFinite(record?.averageFps)||record.averageFps<=0)errors.push('Invalid average FPS');
    if(record?.onePercentLow!==null&&record?.onePercentLow!==undefined&&(!Number.isFinite(record.onePercentLow)||record.onePercentLow<0))errors.push('Invalid measured 1% low');
    const time=Date.parse(record?.measuredAt||'');
    if(!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(record?.measuredAt||'')||!Number.isFinite(time)||time>now||new Date(time).toISOString().slice(0,10)!==record?.measuredAt?.slice(0,10))errors.push('Valid non-future measurement date required');
    return {valid:errors.length===0,errors};
  }
  function match(records,selection){
    // All conditions are explicit. No substitution of GPUs, patches or generated frames.
    if(conditions.some(k=>typeof selection?.[k]!=='string'||!selection[k]))return {status:'insufficient_evidence',records:[],reason:'Exact test conditions are not fully specified.'};
    const found=records.filter(r=>validate(r).valid&&conditions.every(k=>r[k]===selection[k]));
    return {status:found.length?'measured':'insufficient_evidence',records:found,reason:found.length?'Same-condition records; displayed individually, never blended automatically.':'No permitted same-condition benchmark is available.'};
  }
  return {version:'2026-10-09.1',conditions,validate,match};
});
