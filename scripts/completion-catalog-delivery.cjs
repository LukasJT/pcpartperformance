'use strict';
// These views change delivery, not the researched source records. Product HTML,
// program-parts and the model manifest retain their complete source data.
function displayPart(part) {
  const keys=['id','name','brand','cat','year','architecture','summary','specs','source','sku','model','note','builderEligible','indexable','aliases'];
  return Object.fromEntries(keys.filter(key=>part[key]!==undefined).map(key=>[key,part[key]]));
}
function builderPart({note,cooler,manufacturerImage,catalogOrigin,physical,...part}) {
  // Compatibility uses the source-linked evidence fields, not the duplicate
  // editor-facing cooler description. Fan placement still needs these fields.
  return {...part,...(physical?{physical:Object.fromEntries(Object.entries(physical).filter(([key])=>['mounts','psuFormats','connector','reverse','swappable'].includes(key)))}:{})};
}
module.exports={displayPart,builderPart};
