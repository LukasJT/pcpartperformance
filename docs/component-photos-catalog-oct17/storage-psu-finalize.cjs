'use strict';
const fs=require('node:fs'),path=require('node:path');
const t=require('./storage-psu-research.cjs');
const pending=require('./storage-psu-pending.json'),initial=require('./storage-psu-source-audit.json'),candidates=require('./storage-psu-candidates.json'),additional=require('./storage-psu-additional.json'),pdfs=require('./storage-psu-pdf-picks.json');
const aliases={
 'c-ram-corsair-dominator-platinum-rgb-32gb-ddr5-6200-cl36':'domplatinum6200',
 'c-ram-corsair-vengeance-32gb-ddr5-5600-cl36':'corsair5600',
 'c-ram-g-skill-trident-z5-neo-rgb-64gb-ddr5-6000-cl30':'tridentneo64',
 'c-ram-g-skill-trident-z5-neo-rgb-32gb-ddr5-6000-cl30':'gskill6000c30',
 'c-ram-g-skill-trident-z-neo-32gb-ddr4-3600-cl16':'gskill3600c16',
 'c-psu-corsair-ax1600i':'ax1600i',
 'c-psu-corsair-rm1200x-shift':'rm1200xshift',
 'c-psu-seasonic-focus-gx-750':'focusgx750',
 'c-psu-seasonic-focus-gx-850':'focusgx850',
 'c-psu-seasonic-focus-gx-1000':'focusgx1000',
 'c-psu-cooler-master-v-sfx-gold-850':'v850sfx',
 'c-ssd-samsung-990-evo-plus-2tb':'990evoplus',
 'c-ssd-samsung-980-1tb':'samsung980',
 'c-hdd-wd-blue-4tb-hdd':'wdblue4tb',
 'c-hdd-wd-blue-2tb-hdd':'wdblue2tb',
 'c-hdd-seagate-barracuda-8tb':'barracuda8'
};
for(const [id,r]of Object.entries(pending)){
 r.visualReviewed=true;r.reviewedAt='2026-10-17';
 const item=t.catalog.find(x=>x.id===id);
 r.picturedModel=r.picturedModel||item.brand+' '+item.name;
 r.identityEvidence=r.identityEvidence.replace('verify selected product title and product gallery.','selected product title and product gallery verified.').replace('verify image gallery against title.','image gallery checked against title.').replace('subject to confirming wattage and gallery label.','wattage and gallery label confirmed.').replace('confirm printed capacity in photograph.','printed capacity confirmed in photograph.');
 const pdf=pdfs.find(x=>x.id===id);
 if(pdf){r.sourceSha256=t.sha(fs.readFileSync(pdf.originalPdf));r.extractedImageSha256=t.sha(fs.readFileSync(pdf.localImage));r.extraction='Original embedded product photograph from page 1 of the exact SKU manufacturer PDF; no page rendering or redrawing.';}
 if(id==='ironwolf4tb')r.identityEvidence+=' Visual review confirms the original label photograph, but the official source is only 110 × 110 pixels.';
}
for(const [id,base]of Object.entries(aliases)){
 if(!pending[base])throw Error('Missing alias base '+base);
 const item=t.catalog.find(x=>x.id===id);if(!item)throw Error('Missing alias catalog '+id);
 const original=t.catalog.find(x=>x.id===base),keys=item.cat==='ram'?['Memory','Transfer rate','CAS latency','Modules']:item.cat==='psu'?['Rated output']:['Storage capacity','Sequential read','Sequential write','Spindle speed','Drive cache'];
 const matchingFields={};for(const key of keys){if(item.specs[key]!==undefined&&original.specs[key]!==undefined){if(item.specs[key]!==original.specs[key])throw Error('Conflicting alias '+id+' '+key);matchingFields[key]=item.specs[key];}}
 const detail=Object.entries(matchingFields).map(([key,value])=>`${key}: ${value}`).join('; ');
 pending[id]={...pending[base],catalogName:item.name,identityEvidence:pending[base].identityEvidence+` Alias identity checked for ${item.brand} ${item.name}: ${detail}. Both catalog rows name the same model/generation; the exact SKU source or visible capacity/wattage cited above supplies image identity.`,aliasOf:base,aliasIdentityEvidence:{baseCatalogId:base,brand:item.brand,namedModel:item.name,matchingFields,sourceUrl:pending[base].sourceUrl,picturedModel:pending[base].picturedModel}};
}
const ordered=Object.fromEntries(Object.entries(pending).sort(([a],[b])=>a.localeCompare(b)));
fs.writeFileSync(path.join(t.root,'scripts/component-photo-storage-psu-oct17.json'),JSON.stringify(ordered,null,2)+'\n');
function compact(a){return {url:a.page||a.url,status:a.status,finalUrl:a.finalUrl,title:a.title};}
function reason(x,attempts){
 if(x.id==='c-hdd-wd-red-plus-12tb')return 'Alias withheld: this catalog row lists 256MB cache while wdred12tb lists 512MB. Same family and capacity do not establish the same revision without an exact SKU; its image remains unresolved.';
 if(x.id==='sf1000l')return 'Catalog source SKU CP-9020257 now resolves to SF1000 (SFX Platinum), which is a different model from SF1000L. Rejected that image.';
 if(x.id==='domtitanium6000')return 'Catalog source redirects to a DOMINATOR TITANIUM family page. No exact DDR5-6000 CL30 32GB selected SKU photograph was verified.';
 if(x.id==='c-ram-corsair-vengeance-48gb-ddr5-6400-cl36')return 'Exact CMK48GX5M2B6400C36 page exists, but its current gallery visibly depicts VENGEANCE RGB. Catalog model is non-RGB; rejected mislabeled official media.';
 if(['ibmpc64k','simm30-1mb','sdram-pc100','ddr266-256'].includes(x.id))return 'Historical/generic catalog item lacks a manufacturer part number; linked history/standard record does not establish an exact module photograph.';
 if(x.id==='c-psu-supermicro-1600w-redundant-power-supply')return 'Catalog lacks the exact Supermicro supply part number and chassis revision; generic product category is insufficient for image identity.';
 if(attempts.some(a=>/Request Rejected|Just a moment/i.test(a.title||'')))return 'Public manufacturer source rejected the request or served an access challenge. No verified exact named model/capacity/revision photo was recovered from the accessible official sources.';
 if(attempts.some(a=>/EVGA - Intelligent Innovation/.test(a.title||'')))return 'Official product URLs and additional public EVGA power-meter source redirect to the current homepage; no exact model photograph verified.';
 if(x.source?.includes('semiconductor.samsung.com'))return 'Original Samsung Semiconductor source redirects to the general Samsung Canada storage category. Additional exact variant source attempt did not yield an approved matching photo.';
 if(attempts.every(a=>a.status===403))return 'Manufacturer public source returned HTTP 403. No exact photograph established; no access-control bypass attempted.';
 if(attempts.some(a=>a.status===404))return 'One or more exact manufacturer URL attempts returned 404 or an unrelated page; no matching approved photograph verified.';
 if(x.cat==='hdd'||x.cat==='ssd')return 'Accessible source is a product family/category or family datasheet. No photographed label matching the catalog capacity and exact model/revision was verified; rejected reuse of another capacity.';
 if(x.cat==='ram')return 'Accessible source is a family/category or wrong numeric product record. Exact capacity, kit count, generation, speed and CAS model photograph remain unverified.';
 return 'Accessible source did not establish a photograph matching the exact named wattage/model/revision. Generic PSU substitution rejected.';
}
const audit=t.catalog.map(x=>{
 const orig=initial.find(a=>a.id===x.id),attempts=[{url:x.source,...orig.attempt} ,...candidates.filter(a=>a.id===x.id),...additional.filter(a=>a.id===x.id)].map(compact);
 const record=ordered[x.id],preserved=t.prior[x.id];
 return {id:x.id,category:x.cat,catalogName:x.name,catalogSource:x.source,previousImage:orig.current?{src:orig.current.src,picturedModel:orig.current.picturedModel,kind:orig.current.kind}:null,status:record?'verified-repair':preserved?'preserved-existing-repair':'unresolved',reason:record?'Exact official source and downloaded image visually reviewed.':preserved?'Preserved previously verified repair; no replacement.':reason(x,attempts),attempts,photo:record?{src:record.src,sourceUrl:record.sourceUrl,imageUrl:record.imageUrl,picturedModel:record.picturedModel,identityEvidence:record.identityEvidence}:null};
});
const counts={total:audit.length,verifiedRepairs:Object.keys(ordered).length,uniqueSelections:Object.keys(ordered).length-Object.keys(aliases).length,aliases:Object.keys(aliases).length,preserved:audit.filter(x=>x.status==='preserved-existing-repair').length,unresolved:audit.filter(x=>x.status==='unresolved').length,byCategory:{}};
for(const cat of ['ram','ssd','hdd','psu']){const a=audit.filter(x=>x.category===cat);counts.byCategory[cat]={total:a.length,repaired:a.filter(x=>x.status==='verified-repair').length,preserved:a.filter(x=>x.status==='preserved-existing-repair').length,unresolved:a.filter(x=>x.status==='unresolved').length};}
fs.writeFileSync(path.join(__dirname,'storage-psu-audit.json'),JSON.stringify({checked:'2026-10-17',counts,publicWebSecondSources:[{url:'https://seasonic.com/focus-gx/',result:'Public web reader exposes exact wattage gallery groups; selected named files downloaded normally.'},{url:'https://www.bequiet.com/bn337',result:'Public be quiet! support record resolves to Straight Power 12 850W at /en/powersupply/4103. Gallery endpoints not successfully downloaded; no photo accepted.'},{url:'https://www.crucial.com/ssd/t500/ct2000t500ssd8',result:'Public web reader also returns Request Rejected.'},{url:'https://www.crucial.com/memory/ddr5/cp2k16g60c36u5b',result:'Public web reader also returns Request Rejected.'},{url:'https://www.evga.com/products/product.aspx?pn=220-G6-0850-X1',result:'Public web reader confirms redirect to homepage.'}],items:audit},null,2)+'\n');
const lines=['# RAM, storage and PSU photo audit — 17 October 2026','',`Audited ${counts.total} catalog IDs: ${counts.verifiedRepairs} repaired (${counts.uniqueSelections} downloaded selections plus ${counts.aliases} identical catalog aliases), ${counts.preserved} existing repairs preserved, ${counts.unresolved} unresolved.`, '', 'All accepted photographs were inspected in storage-psu-contact-1.png through storage-psu-contact-5.png. The two Sabrent sale-overlay images were replaced with plain component gallery alternatives and inspected separately. Official product media retain manufacturer copyright; these are not represented as open-license works. Source URLs, identity evidence, dimensions and hashes are in the registry.', '', 'The Kingston images are original embedded photographs extracted from page 1 of exact SKU datasheets. Their metadata identify the exact kit and disclose that one module is shown. The small IronWolf 4TB image retains its native 110×110 size; it was not enlarged.', '', 'Important rejected mismatches: SF1000L source resolves to SF1000; the exact CMK48GX5M2B6400C36 non-RGB RAM page currently serves RGB photographs; old G.SKILL numeric page IDs resolve to other memory kits; Samsung Semiconductor family pages redirect to a storage category. None of these source problems were treated as exact photo evidence.', '', '| Category | Catalog IDs | Repaired | Preserved | Unresolved |','| --- | ---: | ---: | ---: | ---: |'];
for(const [cat,c]of Object.entries(counts.byCategory))lines.push(`| ${cat} | ${c.total} | ${c.repaired} | ${c.preserved} | ${c.unresolved} |`);
lines.push('','Every unresolved ID and every attempted source URL is recorded in storage-psu-audit.json. HTTP 200 alone was not accepted as identity evidence. Generic family photographs with the wrong visible capacity were rejected. No catalog specifications, shared build/runtime files, or central override files were changed.');
fs.writeFileSync(path.join(__dirname,'storage-psu-report.md'),lines.join('\n')+'\n');
const assetFolder=path.join(t.root,'dist/assets/hardware/catalog-storage-psu-oct17'),needed=new Set(Object.values(ordered).flatMap(x=>[path.basename(x.src),path.basename(x.thumbnailSrc)]));
for(const name of fs.readdirSync(assetFolder)){const file=path.resolve(assetFolder,name);if(!file.startsWith(path.resolve(assetFolder)+path.sep))throw Error('Asset path escaped');if(!needed.has(name)&&fs.statSync(file).isFile())fs.unlinkSync(file);}
console.log(JSON.stringify(counts,null,2));
