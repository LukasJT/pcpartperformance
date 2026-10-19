'use strict';
// These views change delivery, not the researched source records. Product HTML,
// program-parts and the model manifest retain their complete source data.
function displayPart(part) {
  const keys=['id','name','brand','cat','year','architecture','summary','specs','source','sku','model','note','builderEligible','indexable','aliases'];
  return Object.fromEntries(keys.filter(key=>part[key]!==undefined).map(key=>[key,part[key]]));
}
function builderPart({note,cooler,manufacturerImage,catalogOrigin,physical,provenance,identity,sourceStatus,verifiedAt,usageScope,segment,compatibilityIntake,...part}) {
  // Compatibility uses the source-linked evidence fields, not the duplicate
  // editor-facing cooler description or intake audit/hash packet. Exact IDs,
  // SKU, source URL, specifications and source-linked decision fields survive.
  // Product HTML and the provenance endpoint retain the full identity packet.
  return {...part,...(physical?{physical:Object.fromEntries(Object.entries(physical).filter(([key])=>['mounts','psuFormats','connector','reverse','swappable'].includes(key)))}:{})};
}
module.exports={displayPart,builderPart};
