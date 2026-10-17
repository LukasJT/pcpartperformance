'use strict';
// One-off official media intake. Build uses committed assets and never fetches these URLs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.PCP_SHARP_PATH||'sharp');
const sources={
 ddr5:{name:'VENGEANCE DDR5-6000 CL30',picturedModel:'CORSAIR VENGEANCE 32 GB (2 × 16 GB) DDR5-6000 CL30 Black',brand:'CORSAIR',sourceUrl:'https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c30/vengeance-32gb-2x16gb-ddr5-dram-6000mt-s-c30-memory-kit-black-cmk32gx5m2b6000c30',imageUrl:'https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Memory/vengeance-ddr5-blk-config/Gallery/VENGEANCE_DDR5_BLK_01_2up.webp',identityEvidence:'Official page selects SKU CMK32GX5M2B6000C30, black 32 GB (2 × 16 GB), 6000 MT/s CL30.'},
 rm850x:{name:'RM850x (2021)',picturedModel:'CORSAIR RM850x (2021) CP-9020200-NA',brand:'CORSAIR',sourceUrl:'https://www.corsair.com/us/en/p/psu/cp-9020200-na/rmx-series-rm850x-850-watt-80-plus-gold-fully-modular-atx-psu-cp-9020200-na',imageUrl:'https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Power-Supply-Units/base-rmx-2021-config/Gallery/RM850x_01.webp',identityEvidence:'Exact 2021 850 W page: CP-9020200-NA / RPS0124, not a CX600M or later RMx revision.'},
 'cooler-noctua-nh-u12a':{name:'NH-U12A',picturedModel:'Noctua NH-U12A',brand:'Noctua',sourceUrl:'https://www.noctua.at/en/products/nh-u12a',imageUrl:'https://cdn.noctua.at/media/noctua_nh_u12a_1.jpg',identityEvidence:'Hero image from the brown NH-U12A product page, not the chromax.black variant.'},
 'retail-lian-li-o11-air-mini-black':{name:'O11 Air Mini Black',picturedModel:'Lian Li O11 Air Mini Black',brand:'Lian Li',sourceUrl:'https://lian-li.com/product/o11-air-mini/',imageUrl:'https://lian-li.com/wp-content/uploads/2021/09/O11-Air-MINI-Black-13.jpg',identityEvidence:'Official O11 AIR MINI gallery explicitly identifies this image as Black; not O11 Dynamic Mini or white.'},
 'retail-lian-li-uni-fan-tl-120-wireless-black':{name:'UNI FAN TL 120 Wireless Black',picturedModel:'Lian Li UNI FAN TL 120 Wireless Black',brand:'Lian Li',sourceUrl:'https://lian-li.com/product/uni-fan-tl-wireless/',imageUrl:'https://lian-li.com/wp-content/uploads/2024/12/TL_Wireless_pg_009.jpg',identityEvidence:'Official package contents image immediately precedes 12TL1W1B: black, single, standard 120 mm non-LCD Wireless TL fan. Not reverse blade, LCD or 140 mm.'}
};
async function main(){
 const registryFile='scripts/builder-photo-repairs.json',registry=fs.existsSync(registryFile)?JSON.parse(fs.readFileSync(registryFile,'utf8')):{};
 const results=await Promise.allSettled(Object.entries(sources).filter(([id])=>!process.argv[2]||id===process.argv[2]).map(async([id,s])=>{
  const response=await fetch(s.imageUrl,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw Error(id+': HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer()),input=await sharp(bytes).metadata();if(!input.width||input.width<200)throw Error('Undersized photo '+id);
  const hash=crypto.createHash('sha256').update(bytes).digest('hex'),src='/assets/hardware/repaired/'+id+'-'+hash.slice(0,10)+'.webp';fs.mkdirSync(path.dirname('dist'+src),{recursive:true});
  const output=await sharp(bytes).rotate().resize({width:800,height:800,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toBuffer();fs.writeFileSync('dist'+src,output);const metadata=await sharp(output).metadata();
  registry[id]={src,catalogName:s.name,picturedModel:s.picturedModel,sourceUrl:s.sourceUrl,imageUrl:s.imageUrl,identityEvidence:s.identityEvidence,attribution:s.brand,official:true,kind:'exact',license:'Manufacturer product media; not an open license',licenseUrl:s.sourceUrl,checked:'2026-10-17',width:metadata.width,height:metadata.height,bytes:output.length,sourceSha256:hash,sha256:crypto.createHash('sha256').update(output).digest('hex'),visualReviewed:false,modifications:'Proportions preserved; resized within 800 × 800 and encoded WebP. No recoloring, generated geometry or background replacement.'};
  const thumb=await sharp(bytes).rotate().resize({width:320,height:320,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer(),thumbSrc=src.replace('.webp','-320.webp');fs.writeFileSync('dist'+thumbSrc,thumb);registry[id].thumbnailSrc=thumbSrc;
  return{id,src,bytes:output.length,thumbnailBytes:thumb.length};
 }));fs.writeFileSync(registryFile,JSON.stringify(registry,null,2)+'\n');for(const r of results)console.log(r.status==='fulfilled'?r.value:String(r.reason));if(results.some(r=>r.status==='rejected'))process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
