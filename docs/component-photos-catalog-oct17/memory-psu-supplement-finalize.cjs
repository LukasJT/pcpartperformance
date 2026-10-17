const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require('C:/Users/slowf/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),date='2026-10-17',file=path.join(root,'scripts/component-photo-memory-psu-supplement-oct17.json');
const scope=require('./memory-psu-supplement-scope.json'),registry=JSON.parse(fs.readFileSync(file)),index=require('./memory-psu-supplement-contact-index.json');
let research={};for(let i=1;i<=7;i++)Object.assign(research,require('./memory-psu-supplement-research-'+i+'.json'));
const previous=require('./storage-psu-audit.json').items;
const models={
 crucialpro6000:'Crucial Pro Overclocking 32GB (2x16GB) DDR5-6000 CL36 Black CP2K16G60C36U5B',
 crucial3200:'Crucial Pro 32GB (2x16GB) DDR4-3200 CL22 Black CP2K16G4DFRA32A',
 ballistix3600:'Crucial Ballistix 32GB (2x16GB) DDR4-3600 CL16 Black BL2K16G36C16U4B',
 vipersteel4400:'Patriot Viper Steel 16GB (2x8GB) DDR4-4400 CL19 Gray PVS416G440C9K',
 crucialpro6400:'Crucial Pro Overclocking 32GB (2x16GB) DDR5-6400 CL38 Black CP2K16G64C38U5B',
 'c-ram-corsair-vengeance-48gb-ddr5-6400-cl36':'CORSAIR Vengeance 48GB (2x24GB) DDR5-6400 CL36 Black CMK48GX5M2B6400C36',
 'c-ram-g-skill-trident-z5-rgb-32gb-ddr5-7200-cl34':'G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5-7200 CL34 Black F5-7200J3445G16GX2-TZ5RK',
 'c-ram-g-skill-ripjaws-s5-96gb-ddr5-5600-cl40':'G.SKILL Ripjaws S5 96GB (2x48GB) DDR5-5600 CL40 Matte Black F5-5600J4040D48GX2-RS5K',
 'c-ram-g-skill-trident-z-royal-elite-32gb-ddr4-4000-cl16':'G.SKILL Trident Z Royal Elite 32GB (2x16GB) DDR4-4000 CL16 Silver F4-4000C16D-32GTES',
 'c-ram-g-skill-ripjaws-v-16gb-ddr4-3200-cl16':'G.SKILL Ripjaws V 16GB (2x8GB) DDR4-3200 CL16 Black F4-3200C16D-16GVKB',
 'c-ram-crucial-pro-64gb-ddr5-5600-cl46':'Crucial Pro 64GB (2x32GB) DDR5-5600 CL46 Black CP2K32G56C46U5',
 'c-ram-crucial-32gb-ddr5-4800-cl40':'Crucial 32GB (2x16GB) DDR5-4800 CL40 Black PCB CT2K16G48C40U5',
 'c-ram-crucial-pro-64gb-ddr4-3200-cl22':'Crucial Pro 64GB (2x32GB) DDR4-3200 CL22 Black CP2K32G4DFRA32A',
 'c-ram-crucial-ballistix-max-32gb-ddr4-4000-cl18':'Crucial Ballistix MAX 32GB (2x16GB) DDR4-4000 CL18 Black, non-RGB BLM2K16G40C18U4B',
 'c-ram-crucial-16gb-ddr4-3200-cl22':'Crucial 16GB (2x8GB) DDR4-3200 CL22 Green PCB CT2K8G4DFRA32A',
 'c-ram-teamgroup-t-force-xtreem-48gb-ddr5-8200-cl38':'TEAMGROUP T-Force XTREEM Narvic Black 48GB (2x24GB) DDR5-8200 CL38 FFXD548G8200HC38EDC01',
 'c-ram-teamgroup-t-force-delta-rgb-64gb-ddr5-6400-cl40':'TEAMGROUP T-Force Delta RGB 64GB (2x32GB) DDR5-6400 CL40 Black FF3D564G6400HC40BDC01',
 'c-ram-teamgroup-t-create-classic-32gb-ddr5-5600-cl46':'TEAMGROUP T-Create Classic 32GB (2x16GB) DDR5-5600 CL46 Black',
 'c-ram-teamgroup-t-force-xtreem-argb-32gb-ddr4-3600-cl14':'TEAMGROUP T-Force Xtreem ARGB 32GB (2x16GB) DDR4-3600 CL14 Black',
 'c-ram-teamgroup-t-force-vulcan-z-16gb-ddr4-3200-cl16':'TEAMGROUP T-Force Vulcan Z 16GB (2x8GB) DDR4-3200 C16 Gray',
 primetx1000:'Seasonic PRIME TX-1000 1000W 80 PLUS Titanium SSR-1000TR',
 primetx1300:'Seasonic PRIME TX-1300 1300W 80 PLUS Titanium ATX 3.0 SSR-1300TR2',
 straightpower850:'be quiet! Straight Power 12 850W ATX 3.0 BN337',
 straightpower1000:'be quiet! Straight Power 12 1000W ATX 3.0 BN338',
 sf1000l:'CORSAIR SF1000L 1000W 80 PLUS Gold SFX-L CP-9020246',
 darkpower1000:'be quiet! Dark Power 13 1000W ATX 3.0 BN335',
 darkpower1600:'be quiet! Dark Power Pro 13 1600W ATX 3.0 BN332',
 purepower850:'be quiet! Pure Power 12 M 850W ATX 3.0 BN344',
 evgag6850:'EVGA SuperNOVA 850 G6 850W 80 PLUS Gold 220-G6-0850',
 evgag6750:'EVGA SuperNOVA 750 G6 750W 80 PLUS Gold 220-G6-0750',
 vertexgx1000:'Seasonic VERTEX GX-1000 1000W 80 PLUS Gold ATX 3.0 Black',
 coregx650:'Seasonic CORE GX-650 650W 80 PLUS Gold SSR-650LX, original fully modular model',
 'c-psu-seasonic-prime-tx-1600-noctua-edition':'Seasonic PRIME TX-1600 Noctua Edition 1600W ATX 3.1',
 'c-psu-seasonic-prime-px-1600':'Seasonic PRIME PX-1600 1600W 80 PLUS Platinum SSR-1600PD, original model',
 'c-psu-seasonic-vertex-px-1200':'Seasonic VERTEX PX-1200 1200W 80 PLUS Platinum Black',
 'c-psu-seasonic-vertex-gx-850':'Seasonic VERTEX GX-850 850W 80 PLUS Gold ATX 3.0 Black',
 'c-psu-evga-supernova-1600-p':'EVGA SuperNOVA 1600 P+ 1600W 80 PLUS Platinum 220-PP-1600-X3',
 'c-psu-evga-supernova-1300-g':'EVGA SuperNOVA 1300 G+ 1300W 80 PLUS Gold 220-GP-1300-X1',
 'c-psu-evga-supernova-1000-g7':'EVGA SuperNOVA 1000 G7 1000W 80 PLUS Gold 220-G7-1000-X1',
 'c-psu-evga-supernova-850-g7':'EVGA SuperNOVA 850 G7 850W 80 PLUS Gold 220-G7-0850-X1',
 'c-psu-evga-supernova-750-g7':'EVGA SuperNOVA 750 G7 750W 80 PLUS Gold 220-G7-0750-X1',
 'c-psu-evga-supernova-650-g6':'EVGA SuperNOVA 650 G6 650W 80 PLUS Gold 220-G6-0650',
 'c-psu-evga-600-br':'EVGA 600 BR 600W 80 PLUS Bronze 100-BR-0600-K1',
 'c-psu-evga-500-w1':'EVGA 500 W1 500W 80 PLUS White 100-W1-0500-KR',
 'c-psu-be-quiet-pure-power-12-m-1000w':'be quiet! Pure Power 12 M 1000W ATX 3.0 BN345',
 'c-psu-be-quiet-pure-power-12-m-750w':'be quiet! Pure Power 12 M 750W ATX 3.0 BN343',
 'c-psu-be-quiet-system-power-10-650w':'be quiet! System Power 10 650W 80 PLUS Bronze BN328',
 'c-psu-cooler-master-v-platinum-v2-1300':'Cooler Master V Platinum 1300 V2 1300W 80 PLUS Platinum MPZ-D002-AFAP-BWO',
 'retail-seasonic-m12ii-evo-620w':'Seasonic M12II EVO 620W 80 PLUS Bronze SS-620GM2, fully modular EVO Edition'
};
const unresolved={
 ibmpc64k:'IBM PC 64 KB Memory Expansion Option has no exact IBM board/option part number in the catalog. Search results include IBM and third-party memory adapters; no arbitrary card selected.',
 'simm30-1mb':'Generic industry-standard 30-pin 1 MB SIMM record has no exact manufacturer or module part number. Research found named Samsung/IBM/NEC modules, but those would be historical examples rather than an exact catalog identity.',
 'sdram-pc100':'Generic PC100 SDRAM 128 MB DIMM record has no manufacturer or module part number. Named 128 MB PC100 modules exist; no manufacturer example was silently promoted to an exact catalog image.',
 'ddr266-256':'Generic DDR-266 256 MB DIMM record has no manufacturer or module part number. Kingston/Micron/Crucial examples were researched but withheld because the catalog does not identify one.',
 'c-ram-crucial-pro-overclocking-64gb-ddr5-6000-cl36':'No exact 64GB (2x32GB) DDR5-6000 CL36 Crucial Pro Overclocking SKU established. Accessible retail evidence identifies CP2K32G60C40U5B (CL40) or the 32GB CL36 kit. Different capacity/timing images rejected; catalog identity needs verification.',
 'c-ram-teamgroup-t-create-expert-96gb-ddr5-6000-cl34':'No exact 96GB (2x48GB) DDR5-6000 CL34 T-Create Expert SKU established. Sources instead identify 64GB 6000 CL34 or 96GB 6400 CL32 / 6000 CL30 models. No capacity/timing substitution.',
 'c-psu-cooler-master-v-gold-i-multi-1050':'No exact V Gold i Multi 1050W product identity established. Accessible launch/product evidence identifies V Gold i 750/850W and MWE Gold V2 1050W, which is a different series. No MWE photo substituted.',
 'c-psu-supermicro-1600w-redundant-power-supply':'Catalog lacks an exact Supermicro supply part number/chassis revision. Research finds different PWS-1K68A-1R, PWS-1K62A-1R, PWS-1K69P-1R and PWS-1K66P-1R 1600W supplies; wattage alone does not establish identity.'
};
const notes={
 sf1000l:'Correct SF1000L is CP-9020246, SFX-L and 80 PLUS Gold. The catalog source CP-9020257 resolves to a different SF1000 SFX Platinum product; that product was not used.',
 crucial3200:'Umart Product JSON-LD explicitly identifies CP2K16G4DFRA32A, 32GB (2x16GB), DDR4 Pro 3200 MT/s and CAS22. Selected its actual main photo, replacing a long promotional graphic.',
 crucialpro6400:'PCByte Product JSON-LD explicitly identifies CP2K16G64C38U5B; page specifies 32GB (2x16GB), 6400 MT/s, CL38 and matte-black heatspreaders. Selected actual main product photo, not unrelated Crucial CUDIMM CL52 search images.',
 coregx650:'Close-up confirms GX-650 and 650 WATTS on packaging, and original SSR-650LX chassis. Larger clearer retailer image retained; original small Newegg image was also confirmed 650W after zooming.',
 'c-ram-teamgroup-t-force-xtreem-48gb-ddr5-8200-cl38':'Actual modules from PC Gamer review gallery, not the packaging-only image. Review and official TEAMGROUP spec-sheet identify 48GB (2x24GB), DDR5-8200, CL38-49-49-84 at 1.4V and FFXD548G8200HC38EDC01. Gallery credits Future.',
 'c-ram-teamgroup-t-force-delta-rgb-64gb-ddr5-6400-cl40':'Beach Audio Product JSON-LD explicitly assigns this product image to FF3D564G6400HC40BDC01, 64GB (2x32GB). Exact SKU CL40 timing and black color corroborated by CCL, Newegg indexed product detail and official TEAMGROUP specification sheet. Rejected sources redirected to a 32GB white kit.',
 'c-psu-evga-supernova-750-g7':'Goto Direct Product JSON-LD names 220-G7-0750-X1 and assigns this exact product image. Actual PSU 750 G7 model lettering visually confirmed. Current EVGA product pages redirect and gallery downloads failed; independent retailer used.',
 'c-ram-teamgroup-t-force-vulcan-z-16gb-ddr4-3200-cl16':'Exact selected retailer product URL identifies 16GB (8GBx2), DDR4-3200 C16. Two gray Vulcan Z modules visible through retail package; no 1x16GB or different-speed kit selected.',
 'c-ram-teamgroup-t-create-classic-32gb-ddr5-5600-cl46':'PChome exact product page and selected product image identify T-Create Classic DDR5-5600 32GB (16GBx2) CL46. Two black non-RGB Classic modules shown; unrelated recommended products were not selected.',
 'c-psu-seasonic-prime-px-1600':'Selected original SSR-1600PD product from Vuugo, matching original named 2022 catalog model; did not substitute an ATX3 SSR-1600PD2 photo.',
 'c-ram-crucial-ballistix-max-32gb-ddr4-4000-cl18':'Selected non-RGB Ballistix MAX 32GB (2x16GB) 4000 CL18 product, not 16GB, MAX RGB or 5100 CL19 search results.'
};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 for(const[id,p]of Object.entries(registry)){
  const record=scope.find(x=>x.id===id);if(!record)throw Error('Out of scope '+id);
  const cell=index.find(x=>x.id===id&&x.src===p.src);if(!cell)throw Error('Uninspected asset version '+id);
  const b=fs.readFileSync(path.join(root,'dist',p.src)),t=fs.readFileSync(path.join(root,'dist',p.thumbnailSrc)),bm=await sharp(b).metadata(),tm=await sharp(t).metadata();
  if(hash(b)!==p.sha256||hash(t)!==p.thumbnailSha256)throw Error('Hash mismatch '+id);
  if(bm.format!=='webp'||tm.format!=='webp'||bm.width!==p.width||bm.height!==p.height||Math.max(bm.width,bm.height)>800||Math.max(tm.width,tm.height)>320)throw Error('Bad image '+id);
  const model=models[id]||models[p.aliasOf];if(!model)throw Error('No exact model '+id);
  const u=new URL(p.sourceUrl);u.searchParams.delete('srsltid');p.sourceUrl=u.href;p.licenseUrl=p.sourceUrl;p.catalogName=record.name;p.picturedModel=model;
  const ownNote=notes[id]||notes[p.aliasOf];const pub='Named publication: '+p.title+'. Exact pictured product: '+model+'. ';
  p.identityEvidence=pub+(ownNote||'The selected source assigns the photo to the named product and matching capacity/module-count/timing/color or PSU wattage/version. ')+'Actual image visually inspected for the matching product body, color, kit/module count, packaging and model/wattage labels where visible. No unrelated recommendation, logo, diagram or different named variant accepted.';
  p.attribution=p.official?'Official product media published by '+u.hostname:'Product photograph published by '+u.hostname+'; original copyright retained';
  p.license='Copyright retained by original image owner; no open reuse license or permission established';
  if(id==='c-ram-teamgroup-t-force-xtreem-48gb-ddr5-8200-cl38'){p.attribution='Future, explicitly credited by PC Gamer';p.license='Copyright Future; no open reuse license or permission established';p.specificationSourceUrl='https://images.teamgroupinc.com/products/memory/u-dimm/ddr5/xtreem/spec-sheet/xtreem-en.pdf';}
  if(id==='c-ram-teamgroup-t-force-delta-rgb-64gb-ddr5-6400-cl40')p.specificationSourceUrl='https://images.teamgroupinc.com/products/memory/u-dimm/ddr5/delta-rgb/spec-sheet/delta-rgb-en.pdf';
  if(id==='vipersteel4400')p.attribution='COMP-WARE Computer Agency product media, with retailer branding visible';
  p.rightsStatus='Publicly published product media. Publication source recorded; no open-license or permission grant inferred.';p.licenseNote='licenseUrl identifies the publication source, not an asserted open-license grant.';
  p.visualReviewed=true;p.reviewedAt=date;p.checked=date;p.downloadedAt=date;p.thumbnailWidth=tm.width;p.thumbnailHeight=tm.height;p.thumbnailBytes=t.length;
  p.visualReview={date,method:'Actual final contact-sheet inspection and close-up inspection where needed',sheet:'docs/component-photos-catalog-oct17/memory-psu-supplement-contact-'+(Math.floor((cell.number-1)/20)+1)+'.jpg',note:ownNote||'Named product, color and configuration visually checked against its exact source publication.'};
  p.catalogSpecifications=record.record.specs;
  delete p.index;delete p.score;
  for(const k of ['catalogName','picturedModel','sourceUrl','imageUrl','identityEvidence','license','licenseUrl','attribution','sourceSha256','sha256','thumbnailSha256'])if(!p[k])throw Error('Missing '+k+' '+id);
 }
 const rows=scope.map(x=>{const p=registry[x.id],r=research[x.id]||Object.values(research).find(y=>y.aliases.includes(x.id));return {id:x.id,catalogName:x.name,category:x.category,catalogSourceUrl:x.sourceUrl,status:p?'repaired-reviewed':'unresolved-identity',attempted:true,researchedCandidates:r?.hits.length||0,previousAttempts:previous.find(y=>y.id===x.id)?.attempts||[],reason:p?(notes[x.id]||notes[p.aliasOf]||'Exact named product with matching specifications accepted after actual image inspection.'):unresolved[x.id],picturedModel:p?.picturedModel||null,sourceUrl:p?.sourceUrl||null,imageUrl:p?.imageUrl||null,src:p?.src||null,thumbnailSrc:p?.thumbnailSrc||null,sha256:p?.sha256||null,thumbnailSha256:p?.thumbnailSha256||null,visualReviewed:!!p};});
 if(rows.some(x=>!x.reason))throw Error('Missing per-ID outcome');
 const byCategory={};for(const cat of ['ram','psu'])byCategory[cat]={total:rows.filter(x=>x.category===cat).length,repaired:rows.filter(x=>x.category===cat&&x.visualReviewed).length,unresolved:rows.filter(x=>x.category===cat&&!x.visualReviewed).length};
 fs.writeFileSync(file,JSON.stringify(registry,null,2));
 const assetDir=path.resolve(root,'dist/assets/hardware/catalog-memory-psu-supplement-oct17');if(assetDir!==path.join(root,'dist','assets','hardware','catalog-memory-psu-supplement-oct17'))throw Error('Wrong asset cleanup root');
 const keep=new Set(Object.values(registry).flatMap(p=>[path.basename(p.src),path.basename(p.thumbnailSrc)]));let removed=0;for(const f of fs.readdirSync(assetDir)){let p=path.join(assetDir,f);if(fs.statSync(p).isFile()&&!keep.has(f)){fs.unlinkSync(p);removed++;}}
 const bytes=[...keep].reduce((n,f)=>n+fs.statSync(path.join(assetDir,f)).size,0);
 const audit={checkedAt:new Date().toISOString(),scope:'64 missing RAM/PSU IDs frozen from final-coverage.json at delegation start; only supplemental registry/assets/docs edited.',counts:{total:rows.length,repaired:Object.keys(registry).length,unresolved:rows.length-Object.keys(registry).length,byCategory,assetFiles:keep.size,assetBytes:bytes},rights:'Publicly published product photos, original copyright retained. No open reuse license or permission grant established. Future editorial photo explicitly attributed.',researchFiles:'memory-psu-supplement-research-1.json through -8.json',structuredSourceEvidence:['memory-psu-supplement-page-media.json','memory-psu-supplement-extra-pages.json','memory-psu-supplement-identity-check.json'],rows,limitations:['Four historical generic RAM records and a generic Supermicro PSU require a real manufacturer/part number; no example-image class introduced.','Two RAM capacity/timing combinations and a V Gold i Multi 1050W PSU lack a verified exact SKU.','Some manufacturer and retail pages returned access challenges/403/405, 404, or failed media fetches. Independently accessible publication sources were used; no bypass or 429 retry.','Visible exterior product renders may be shared by a retailer among variants, but only media expressly assigned by an exact named specification/SKU publication was accepted; no family/category-page media inferred as exact.']};
 fs.writeFileSync(path.join(__dirname,'memory-psu-supplement-audit.json'),JSON.stringify(audit,null,2));
 const summary='# RAM and PSU photograph supplement — '+date+'\n\n64 missing records researched; '+audit.counts.repaired+' reviewed repairs accepted. RAM: '+byCategory.ram.repaired+'/'+byCategory.ram.total+'. PSU: '+byCategory.psu.repaired+'/'+byCategory.psu.total+'. '+audit.counts.unresolved+' identity gaps remain.\n\n## Deliverables\n\n- Registry: scripts/component-photo-memory-psu-supplement-oct17.json\n- Assets: dist/assets/hardware/catalog-memory-psu-supplement-oct17/ ('+keep.size+' WebP files, '+(bytes/1024/1024).toFixed(2)+' MiB)\n- Per-ID outcomes: memory-psu-supplement-audit.json\n- All accepted images visually reviewed on three contact sheets; final source/full/thumbnail hashes and dimensions validated.\n\n## Unresolved\n\n'+Object.entries(unresolved).map(([id,s])=>'- '+id+': '+s).join('\n')+'\n\n## Matching and source notes\n\nThe wrong SF1000 source CP-9020257 was rejected; the photo is SF1000L CP-9020246. Original CORE GX-650 SSR-650LX and original PRIME PX-1600 SSR-1600PD are distinguished from later ATX3/V2 products. Exact RAM capacity, two-module configuration, speed, CAS latency and pictured color are recorded. Promotional strips, packaging-only Xtreem imagery, and cropped PSU banners were replaced by clear product photos. CORE GX-650 packaging was confirmed 650W after zooming; an initially ambiguous small preview was not treated as wrong wattage evidence.\n\n## Rights and validation\n\nProduct media was recovered from publicly accessible exact retailer, distributor or manufacturer publications when official sources failed. Public availability is not an open reuse license; no permission grant was inferred. Per-record attribution, publication URLs, original SHA-256, resized SHA-256, thumbnail SHA-256, dimensions and dates are recorded. The Xtreem editorial photo explicitly credits Future / PC Gamer. No image was generated or recolored, and resizing preserved proportions. Only supplemental owned files were edited; no shared runtime, full build, commit or deployment performed.\n';
 fs.writeFileSync(path.join(__dirname,'memory-psu-supplement-summary.md'),summary);
 console.log(JSON.stringify({...audit.counts,unusedAssetsRemoved:removed},null,2));
})();
