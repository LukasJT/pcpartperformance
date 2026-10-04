const sources=require('./publication-sources.cjs');
const optional=['regionalModelNumber','launchDate','launchOS','currentOS','supportEndDate','displayBrightnessMeasured','batteryLifeMeasured','chargingPowerMeasured','cameraTest','repairabilityScore','priceCAD','priceUSD','stock','simConfiguration','ipRating','wifi','bluetooth','usbVideo','wirelessCharging','chargerIncluded','modem','storageTechnology','frontCamera','rearCamera','sustainedPerformance'];
const make=(id,name,source,core,policy=null)=>({id,name,region:source==='pixel'?'UK specification cohort':source==='s25'?'Canada specification cohort':'Apple published specifications; regional features not indexed',fields:{...Object.fromEntries(optional.map(k=>[k,{value:null,source:null,checked:null,confidence:'not verified'}])),...Object.fromEntries(Object.entries(core).map(([k,value])=>[k,{value,source:sources[source].url,checked:'2026-10-04',confidence:'manufacturer specification'}]))},support:policy||{commitment:null,anchor:null,endDate:null,source:null,checked:null},verified:'2026-10-04'});
const pixelPolicy={commitment:'7 years of OS and security updates',anchor:'First availability on the US Google Store; date not verified in this dataset',endDate:null,source:sources.pixelupdates.url,checked:'2026-10-04'};
module.exports=[
make('iphone-16','iPhone 16','apple16',{height:147.6,width:71.6,depth:7.8,weight:170,diagonal:6.1,resolution:'2556 × 1179',soc:'Apple A18',storage:'128 / 256 / 512 GB',usbData:'USB 2, up to 480 Mb/s'}),
make('iphone-16-pro','iPhone 16 Pro','apple16pro',{height:149.6,width:71.5,depth:8.25,weight:199,diagonal:6.3,resolution:'2622 × 1206',soc:'Apple A18 Pro',storage:'128 / 256 / 512 GB / 1 TB',usbData:'USB 3, up to 10 Gb/s with a compatible cable'}),
make('pixel-9','Pixel 9','pixel',{height:152.8,width:72,depth:8.5,weight:198,diagonal:6.3,resolution:'2424 × 1080',soc:'Google Tensor G4',ram:12,storage:'128 / 256 GB',batteryTypical:4700},pixelPolicy),
make('pixel-9-pro','Pixel 9 Pro','pixel',{height:152.8,width:72,depth:8.5,weight:199,diagonal:6.3,resolution:'2856 × 1280',soc:'Google Tensor G4',ram:16,storage:'128 / 256 / 512 GB / 1 TB',batteryTypical:4700},pixelPolicy),
make('galaxy-s25','Galaxy S25','s25',{height:146.9,width:70.5,depth:7.2,weight:162,soc:'Snapdragon 8 Elite for Galaxy',ram:12,storage:'128 / 256 / 512 GB',batteryTypical:4000}),
make('iphone-14-pro','iPhone 14 Pro','apple14pro',{height:147.5,width:71.5,depth:7.85,weight:206,diagonal:6.1,resolution:'2556 × 1179',storage:'128 / 256 / 512 GB / 1 TB'}),
make('iphone-12-pro','iPhone 12 Pro','apple12pro',{height:146.7,width:71.5,depth:7.4,weight:189,diagonal:6.1,resolution:'2532 × 1170',storage:'128 / 256 / 512 GB'}),
make('iphone-x','iPhone X','applex',{height:143.6,width:70.9,depth:7.7,weight:174,diagonal:5.8,resolution:'2436 × 1125',soc:'Apple A11 Bionic',storage:'64 / 256 GB'}),
make('iphone-7','iPhone 7','apple7',{height:138.3,width:67.1,depth:7.1,weight:138,diagonal:4.7,resolution:'1334 × 750',storage:'32 / 128 / 256 GB'}),
make('iphone-13','iPhone 13','apple13',{height:146.7,width:71.5,depth:7.65,weight:173,diagonal:6.1,resolution:'2532 × 1170',soc:'Apple A15 Bionic',storage:'128 / 256 / 512 GB'})
];
for(const [id,name,source,core,region,confidence]of require('./phone-expansion-data.cjs')){
 const phone=make(id,name,source,Object.fromEntries(Object.entries(core).filter(([,v])=>v!==null)));
 if(core.weight===null)phone.fields.weight={value:null,source:null,checked:null,confidence:'not verified'};
 phone.region=region;if(confidence)for(const field of Object.values(phone.fields))if(field.value!==null)field.confidence=confidence;
 module.exports.push(phone);
}
