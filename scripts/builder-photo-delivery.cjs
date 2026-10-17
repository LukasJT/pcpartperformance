'use strict';
// Bind reviewed caption aliases at build time. No fuzzy partner/capacity matching.
const selectors=require('./builder-selectors.js'),delivery=require('./program-image-delivery.cjs');
const aliases={
 '990pro':['990 PRO 1 TB','Samsung 990 PRO 1TB MZ-V9P1T0BW'],
 'rocket4plus':['Rocket 4 Plus 2 TB','Sabrent Rocket 4 Plus 2TB SB-RKT4P-2TB'],
 'intel660p':['SSD 660p 1 TB','Intel SSD 660p 1TB SSDPEKNW010T8'],
 'p44pro':['P44 Pro 2 TB','Solidigm P44 Pro 2TB SSDPFKKW020X7X1'],
 'c-ssd-crucial-t705-4tb':['Crucial T705 4TB','Crucial T705 4TB CT4000T705SSD3'],
 'c-ssd-kingston-kc3000-4tb':['Kingston KC3000 4TB','Kingston KC3000 4TB SKC3000D/4096GB'],
 'c-hdd-wd-red-pro-24tb':['WD Red Pro 24TB','WD Red Pro 24TB (WD241KFGX)'],
 '5800x3d':['Ryzen 7 5800X3D','AMD Ryzen 7 5800X3D packaging'],
 'gtx1080ti':['GeForce GTX 1080 Ti','NVIDIA GeForce GTX 1080 Ti Founders Edition'],
 'arcb580':['Arc B580','Intel Arc B580 Limited Edition'],
 'c-case-cooler-master-nr200p-v2':['Cooler Master NR200P V2','Cooler Master MasterBox NR200P V2 (black)'],
 'retail-asus-rog-strix-geforce-rtx-4090-white-oc-24gb':['ROG Strix GeForce RTX 4090 White OC 24GB','ASUS ROG Strix RTX 4090 White OC Edition']
};
function entry(part,image,root){
 if(!image?.src)return null;
 const identity=selectors.normalize(image.catalogName),names=[part.name,[part.brand,part.name].filter(Boolean).join(' ')].map(selectors.normalize);
 const alias=aliases[part.id],reviewedAlias=image.kind==='exact'&&alias?.[0]===part.name&&alias?.[1]===image.picturedModel;
 const bound=['exact','model-render'].includes(image.kind)&&identity&&names.includes(identity);
 const sameChip=image.kind==='same-chip-variant'&&part.cat==='gpu'&&!part.id.startsWith('retail-')&&image.visualReviewed===true&&image.gpuModel===part.name&&image.memoryGB===Number(part.specs?.Memory)&&!!image.representedVariant&&identity&&names.includes(identity);
 if(!bound&&!sameChip&&!reviewedAlias&&!selectors.imageFor(part,{[part.id]:image}))return null;
 const src=image.thumbnailSrc||delivery.source(part.id,image,root);
 if(!/^(?:\/[^/]|https:\/\/)/.test(src))return null;
 return{src,picturedModel:image.picturedModel,...(bound||sameChip||reviewedAlias?{productId:part.id}:{})};
}
function index(parts,images,root){return Object.fromEntries(parts.map(part=>[part.id,entry(part,images[part.id],root)]).filter(([,image])=>image));}
module.exports={entry,index,aliases};
