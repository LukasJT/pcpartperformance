/* Exact retailer SKU matches only. Run before publishing; never infer a price. */
const fs = require('node:fs');
const slugs={
N82E16819113877:'amd-ryzen-7-9000-series-ryzen-7-9800x3d-granite-ridge-zen-5-socket-am5-desktop-cpu-processor',
N82E16819113793:'amd-ryzen-7-7800x3d-ryzen-7-7000-series',
N82E16820982007:'corsair-vengeance-32gb-ddr5-6000-cas-latency-30-desktop-memory-black',
N82E16813144557:'msi-mag-b650-tomahawk-wifi-atx-motherboard-amd-b650-am5',
N82E16822184773:'seagate-barracuda-st2000dm008-2tb',
N82E16820147860:'samsung-1tb-990-pro-nvme-2-0',
N82E16814126760:'asus-prime-rtx5070-o12g-geforce-rtx-5070-12gb-graphics-card-triple-fans',
N82E16814126798:'asus-dual-rtx5060ti-o16g-geforce-rtx-5060-ti-16gb-graphics-card-double-fans'};
const listings = [
 ['9800x3d','N82E16819113877','100-100001084WOF'],
 ['7800x3d','N82E16819113793','100-100000910WOF'],
 ['ddr5','N82E16820982007','CMK32GX5M2B6000C30'],
 ['b650','N82E16813144557','MAG B650 TOMAHAWK WIFI'],
 ['barracuda2','N82E16822184773','ST2000DM008'],
 ['990pro','N82E16820147860','MZ-V9P1T0B/AM'],
 ['rtx5070','N82E16814126760','PRIME-RTX5070-O12G'],
 ['rtx5060ti16','N82E16814126798','DUAL-RTX5060TI-O16G']
];
function parse(html, expected, country) {
 const match=html.match(/window\.__initialState__\s*=\s*([\s\S]*?)<\/script>/);
 if(!match) throw Error('No retailer product data');
 const p=JSON.parse(match[1].trim().replace(/;$/,'')).ItemDetail;
 const normalize=s=>String(s).replace(/[^a-z0-9]/gi,'').toUpperCase();
 if(normalize(p.Model)!==normalize(expected)) throw Error('Model mismatch: '+p.Model);
 if(p.CountryCode!==({CA:'CAN',US:'USA'})[country]) throw Error('Country mismatch: '+p.CountryCode);
 if(!p.Instock || !p.IsActivated || p.PriceHideMark!=='0') throw Error('Unavailable');
 if(p.Seller?.SellerId || /refurbished|open box|used/i.test(p.Description?.Title||'')) throw Error('Not a direct new retail listing');
 if(!Number.isFinite(p.FinalPrice)||p.FinalPrice<=0) throw Error('Invalid price');
 return {price:p.FinalPrice,model:p.Model,title:p.Description.ProductName||p.Description.Title};
}
module.exports={parse,listings};
if(require.main===module)(async()=>{
 const previous=fs.existsSync('dist/prices.json')?JSON.parse(fs.readFileSync('dist/prices.json','utf8')):{offers:[]};
 const feed={checkedAt:new Date().toISOString(),offers:previous.offers};let checked=0;
 const queue=listings.flatMap(([id,item,mpn])=>(process.argv.includes('--us-only')?['US']:['CA','US']).map(region=>({id,item,mpn,region})));
 await Promise.all(Array.from({length:3},async()=>{while(queue.length){const p=queue.shift(),url=`https://www.newegg.${p.region==='CA'?'ca':'com'}/${slugs[p.item]}/p/${p.item}`;try{
 const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('HTTP '+r.status);
 const value=parse(await r.text(),p.mpn,p.region);
 checked++;feed.offers=feed.offers.filter(o=>!(o.id===p.id&&o.region===p.region&&o.store==='Newegg'));
 feed.offers.push({id:p.id,region:p.region,currency:p.region==='CA'?'CAD':'USD',store:'Newegg',url,...value,checkedAt:new Date().toISOString()});
 console.log(p.id,p.region,value.price);
 }catch(e){console.log(p.id,p.region,'not priced:',e.message)}}}));
 fs.writeFileSync('dist/prices.json',JSON.stringify(feed));
 console.log('Refreshed '+checked+' offers; failed checks keep their original timestamps.');if(!checked)process.exitCode=1;
})();
