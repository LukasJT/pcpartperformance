// Manufacturer facts checked 2026-10-11. No artist mesh measurement is a specification.
// Only the inspected fields below are known; every other field carries explicit null provenance.
const batch=require('./licensed-phone-batch-2026-10-11.json');
const checked='2026-10-11';
const fields=['height','width','depth','weight','diagonal','resolution','soc','ram','storage','batteryTypical','usbData','regionalModelNumber','launchDate','launchOS','currentOS','supportEndDate','displayBrightnessMeasured','batteryLifeMeasured','chargingPowerMeasured','cameraTest','repairabilityScore','priceCAD','priceUSD','stock','simConfiguration','ipRating','wifi','bluetooth','usbVideo','wirelessCharging','chargerIncluded','modem','storageTechnology','frontCamera','rearCamera','sustainedPerformance'];
const unknown=()=>({value:null,source:null,checked:null,confidence:'not verified'});
// [mass g, marketed display diagonal inches, display pixel resolution, SoC, published storage options]
const inspected={
 'iphone-13-pro':[204,6.1,'2532 × 1170','Apple A15 Bionic','128 / 256 / 512 GB / 1 TB'],
 'iphone-13-pro-max':[240,6.7,'2778 × 1284','Apple A15 Bionic','128 / 256 / 512 GB / 1 TB'],
 'galaxy-s22':[168,6.1,null,null,null],
 'galaxy-s22-ultra':[228,6.8,'3088 × 1440',null,null],
 'galaxy-s20-ultra':[220,6.9,null,null,null],
 'galaxy-s21-fe':[177,6.4,null,null,null],
 'iphone-11':[194,6.1,'1792 × 828','Apple A13 Bionic','64 / 128 / 256 GB'],
 'iphone-11-pro':[188,5.8,'2436 × 1125','Apple A13 Bionic','64 / 256 / 512 GB'],
 'iphone-11-pro-max':[226,6.5,'2688 × 1242','Apple A13 Bionic','64 / 256 / 512 GB'],
 'iphone-6':[129,4.7,'1334 × 750','Apple A8','16 / 32 / 64 / 128 GB'],
 'iphone-8':[148,4.7,'1334 × 750','Apple A11 Bionic','64 / 128 / 256 GB'],
 'iphone-8-plus':[202,5.5,'1920 × 1080','Apple A11 Bionic','64 / 128 / 256 GB'],
 'iphone-12-mini':[135,5.4,'2340 × 1080','Apple A14 Bionic','64 / 128 / 256 GB'],
 'iphone-xr':[194,6.1,'1792 × 828','Apple A12 Bionic','64 / 128 / 256 GB'],
 'iphone-xs':[177,5.8,'2436 × 1125','Apple A12 Bionic','64 / 256 / 512 GB'],
 'galaxy-s10':[157,6.1,'3040 × 1440','Samsung Exynos 9820','128 / 512 GB'],
 'galaxy-s8':[155,5.8,'2960 × 1440',null,null],
 'iphone-15-pro-max':[221,6.7,'2796 × 1290','Apple A17 Pro','256 / 512 GB / 1 TB'],
 'iphone-17-pro':[206,6.3,'2622 × 1206','Apple A19 Pro','256 / 512 GB / 1 TB'],
 'iphone-17-pro-max':[233,6.9,'2868 × 1320','Apple A19 Pro','256 / 512 GB / 1 / 2 TB']
};
const regions={
 'galaxy-s22':'Samsung India published body/display cohort; radio, SIM and chipset variants not indexed',
 'galaxy-s22-ultra':'Samsung Mexico SM-S908EZGMLTM body/display cohort; other regional variants not indexed',
 'galaxy-s20-ultra':'Samsung Canada launch specification cohort; other regional variants not indexed',
 'galaxy-s21-fe':'Samsung Mexico launch specification cohort; other regional variants not indexed',
 'galaxy-s10':'Samsung UK support body/display cohort; radio, SIM and chipset variants not indexed',
 'galaxy-s8':'Samsung US unlocked launch specification cohort; other regional variants not indexed'
};
module.exports=batch.map(model=>{
 const details=inspected[model.id];if(!details)throw Error('Missing inspected phone facts: '+model.id);
 const [width,height,depth]=model.dimensionsMm;
 const [weight,diagonal,resolution,soc,storage]=details;
 const values={height,width,depth,weight,diagonal,resolution,soc,storage};
 const record={id:model.id,name:model.name,region:regions[model.id]||'Apple published body/display/storage specifications; regional radio and SIM variants not indexed',fields:Object.fromEntries(fields.map(field=>[field,unknown()])),support:{commitment:null,anchor:null,endDate:null,source:null,checked:null},verified:checked};
 for(const [field,value]of Object.entries(values))if(value!==null)record.fields[field]={value,source:model.dimensionSource,checked,confidence:'manufacturer specification'};
 return record;
});
