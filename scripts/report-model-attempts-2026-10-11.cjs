const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'docs/program-2026-10-11/models');
const research=require('../docs/program-2026-10-11/models/research.json');
const distribution=require('../docs/program-2026-10-11/models/public-distribution-research.json');
const inventory=require('../docs/program-2026-10-11/models/integrated-model-batch.json');
const accepted=new Map(inventory.additions.map(m=>[m.sourceUid,m]));
const sf=uid=>'https://sketchfab.com/3d-models/'+uid;
const rejected=[
 {uid:'a35156d91cf44e70a2fdfeade54ae0b2',name:'(FREE) iPhone 13 Pro 2021',method:'Unused user-downloaded local archive; actual renderer review',reason:'Published 2021-09-13 before the announcement; visible wide notch and small camera arrangement do not establish the released iPhone 13 Pro identity. No mapping was assigned.'},
 {uid:'bb14ee2eadb144c69d6267a36ea19a17',name:'Iphone 11',method:'Public Objaverse download and actual front/back/side rendering',reason:'Title says iPhone 11 but the rear has three cameras. Rejected the exact identity and replaced it with the separately downloaded, dual-camera atomle iPhone 11 (558b8e99bbd4483b9bb2182d8dc72de2).'},
 {uid:'c212720789d14bfd9d98aaffe1461d1c',name:'Iphone 6s',method:'Public Objaverse download and actual front/back/side rendering',reason:'Authored bright blue finish is not an official iPhone 6s finish. Withheld rather than presenting it as an exact retail appearance.'},
 {uid:'37aa7a8851be4f86b0d2be6a22837d4c',name:'OnePlus 6',method:'Public Objaverse download and actual front/back/side rendering',reason:'Opaque/undefined exported glass materials obscure the front and rear camera/marking detail. The usable appearance could not be established; not registered.'},
 {name:'Apple iPhone XS Max candidate',method:'Public search/metadata and downloaded source inspection',reason:'Candidate description referred to iPhone XS; exact XS versus XS Max variant identity was not established. Not mapped to either by a family guess.'},
 {uid:'fff4a783d9824800a912c3c7a79c1ac0',name:'amd ryzen 9',method:'Unused user-downloaded local source; texture and renderer review',reason:'A Ryzen 9 family title and unreadable/mirrored package lettering do not establish an exact 5900X/5950X or other retail SKU. No same-family CPU substitution.'},
 {uid:'04e5d962c897434fb8e2294e6bb13366',name:'Lian Li',method:'Unused user-downloaded local source; geometry and renderer review',reason:'No exact case model/SKU in source metadata. Visual resemblance alone is insufficient for an O11 Dynamic mapping.'},
 {uid:'27f023b65e814d1c946460fcc0cb8250',name:'Corsair Fan',method:'Unused user-downloaded local archive/source review',reason:'Generic fan title does not establish the exact fan SKU, dimensions or single versus multi-pack catalog variant.'},
 {uid:'faa8f55407404fd2870e35ab6a8f03bb',name:'Corsair H150i Elitie CPU Liquid Cooler',method:'Unused user-downloaded local archive/source review',reason:'Exact Elite/CAPELLIX/LCD retail SKU was not established. No broader H150i family mapping.'},
 {name:'Samsung Galaxy S25 Ultra GLB in phone-mockup-studio',sourceUrl:'https://github.com/quentin-pla/phone-mockup-studio/blob/main/source/samsung_galaxy_s25_ultra.glb',method:'Public repository source download and GLB metadata review',reason:'Repository CREDITS does not credit or license this Samsung asset; GLB has no embedded creator/source/license. Application MIT licence was not treated as model rights.'},
 {name:'Noctua additional manufacturer models',sourceUrl:'https://www.noctua.at/en/3d-cad-models',method:'Public manufacturer download-page request and local model inventory; raw fetch outcome preserved in noctua-download-attempt.json',status:429,reason:'Manufacturer page returned Vercel checkpoint. No circumvention. The 21 already installed local Noctua fan models were not new mappings.'},
 {name:'Lian Li O11 Dynamic manufacturer STEP',sourceUrl:'https://lian-li.com/product/pc-o11-dynamic/',method:'Inspected public product page and its manufacturer-linked STEP download',reason:'A public STEP link was found, but no explicit redistribution licence was inspected. It was not downloaded/published as a cleared model.'},
 {name:'Other iPhone 11 / 11 Pro alternative sources',method:'Public Objaverse downloads and source inspection',reason:'Alternatives were investigated but not selected; accepted exact-phone sources already passed the actual renderer review. Downloaded alternatives do not count as integrations.'}
];
for(const r of rejected){r.checked='2026-10-11';r.integrated=false;if(r.uid&&!r.sourceUrl)r.sourceUrl=sf(r.uid);}
// Use the actual stored UIDs for the extra downloaded variants, rather than inventing identifiers.
for(const r of rejected){
 if(r.name==='Apple iPhone XS Max candidate'){
  const match=Object.values(distribution.downloads).find(m=>m.creatorUrl?.includes('sriniwasj'));
  if(!match)throw Error('Missing downloaded XS Max attempt');r.uid=match.uid;r.sourceUrl=match.sourceUrl;r.downloadUrl=match.downloadUrl;r.bytes=match.bytes;
 }
 if(r.name==='Other iPhone 11 / 11 Pro alternative sources'){
  const alternatives=Object.values(distribution.downloads).filter(m=>!accepted.has(m.uid)&&['hirairmak','KendeMrena'].some(name=>m.creatorUrl?.toLowerCase().includes(name.toLowerCase())));
  r.uids=alternatives.map(m=>m.uid);r.sources=alternatives.map(m=>({uid:m.uid,name:m.name,sourceUrl:m.sourceUrl,downloadUrl:m.downloadUrl,bytes:m.bytes}));
 }
 const actual=r.uid&&distribution.downloads[r.uid];if(actual){r.downloadUrl=actual.downloadUrl;r.bytes=actual.bytes;}
}
const endpointAttempts=Object.entries(research.downloads).map(([uid,attempt])=>{
 const model=research.models[uid],resolved=accepted.get(uid);
 const noise=model&&(/scan|sleeping cat|WAGARA|Begonia|insect|Valve/i.test(model.name)||!/iphone|rtx|ssd|corsair|crosair|h510|samsung/i.test(model.name));
 return{uid,name:model?.name||null,modelSourceUrl:model?.url||null,endpointUrl:attempt.sourceUrl,status:attempt.status,checkedAt:attempt.checkedAt,classification:noise?'Unrelated search noise; not an exact-model candidate':/concept|front panel|4000d x/i.test(model?.name||'')?'Concept, partial or combined source; not a complete exact-model candidate':'Product candidate; exact identity still requires visual review',outcome:resolved?'Download endpoint required authentication; accepted licensed asset obtained independently from its listed public distribution.':'Authentication was required; no session/token/viewer extraction or bypass used. This attempt is not an integration.',integrated:Boolean(resolved),resolvedDistributionUrl:resolved?.distributionUrl||null};
});
const report={checked:'2026-10-11',searchCounts:{currentQueries:Object.keys(research.searches).length,olderPhoneComponentQueries:Object.keys(distribution.searches).length},queries:Object.entries(research.searches).map(([query,entry])=>({query,sourceUrl:entry.sourceUrl,status:entry.status,resultCount:entry.results?.length||0,reason:(entry.results?.length||0)?'Metadata candidates found; identities/downloads reviewed separately.':'No matching downloadable result in this public query.'})),olderQueries:Object.entries(distribution.searches).map(([query,entry])=>({query,sourceUrl:entry.url,resultCount:entry.results?.length||0,publicIndexedCandidates:entry.results?.filter(m=>m.objaversePath&&m.license?.label==='CC Attribution'&&!m.alreadyInstalled).length||0})),endpointAttempts,rejected,completedMappings:inventory.completedMappings,uniqueNewAssets:inventory.uniqueNewAssets};
fs.writeFileSync(path.join(folder,'rejected-and-unavailable.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({searchCounts:report.searchCounts,endpointAttempts:endpointAttempts.length,rejectedOrUnavailable:rejected.length,completedMappings:report.completedMappings},null,2));
