'use strict';

// Bounded primary-source intake. Every tuple is an inspected, fixed manufacturer
// SKU. A family selector is never expanded into an invented Cartesian product.
const fs = require('node:fs'), path = require('node:path');
const directory = path.resolve(__dirname, '../data/prebuilt-intake/2026-10-19');
const sources = {}, records = [];
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const at = '2026-10-19';
function add(brand, model, mpn, url, facts, scope, region = 'US') {
  const sourceId = slug(brand + '-' + mpn);
  sources[sourceId] = { publisher: brand, url, inspectedAt: at, confidence: 'manufacturer-verified', inspection: 'Original SKU specification inspected. AI-assisted transcription and consistency review; no first-party system testing.', scope, identity: { model, manufacturerPartNumber: mpn }, facts };
  records.push({ id: 'total-' + region.toLowerCase() + '-' + sourceId, brand, model, manufacturerPartNumber: mpn, region, currency: region==='CA'?'CAD':'USD', sourceId, status: 'evidence-checked', configurationKind: 'fixed-manufacturer-sku' });
}
const msiScope = 'Exact named US SKU specification PDF. Published component specifications are not measurements or a current offer. RAM module count, exact PSU model and board model remain unknown unless stated. Warranty is the published duration; confirm applicable terms with MSI.';
function msi(model, mpn, cpu, gpu, ram, storage, chipset, cooling, psu, wifi, warranty = 1, extras = {}) {
  const facts = { cpu, gpu, ramGB: ram, ddr: 'DDR5', storageGB: storage, storageInterface: 'NVMe', storageGeneration: 4, chipset, cooling, psuW: psu, psuEfficiency: '80 PLUS Gold', network: wifi, os: 'Windows 11 Home', warrantyYears: warranty, ...extras };
  add('MSI', model, mpn, 'https://storage-asset.msi.com/excelSku/us/desktop/' + encodeURIComponent(model) + '.pdf', facts, msiScope);
}
// Different A/B/C prefixes are retained as real SKU identities. Coverage reports
// separately count shared CPU/GPU/RAM/storage signatures to prevent inflation.
msi('Aegis R2 AI C2NVR9-1452US','AeR2AIC2NVR1452','Core Ultra 9 285','GeForce RTX 5070 Ti',32,2000,'Intel B860','Air cooler',750,'5 Gb Ethernet; Wi-Fi 7');
msi('Aegis R2 AI A2NVR7-1451US','AeR2AIA2NVR71451','Core Ultra 7 265','GeForce RTX 5070 Ti',32,2000,'Intel B860','360 mm liquid CPU cooler',750,'5 Gb Ethernet; Wi-Fi 7');
msi('Aegis R2 AI B2NVV9-1411US','AeR2AIB2NVV91411','Core Ultra 9 285','GeForce RTX 5080',64,2000,'Intel B860','360 mm liquid CPU cooler',850,'5 Gb Ethernet; Wi-Fi 7');
msi('Aegis R2 AI B2NVR9-1450US','AeR2AIB2NVR91450','Core Ultra 9 285','GeForce RTX 5070 Ti',32,2000,'Intel B860','Air cooler',750,'5 Gb Ethernet; Wi-Fi 7');
msi('Aegis R2 AI C2NVP9-2069US','AegisRsAIC2NVP92069','Core Ultra 9 285','GeForce RTX 5070',32,2000,'Intel B860','Air cooler',750,'5 Gb Ethernet; Wi-Fi 6E',1,{ identityNote: 'The manufacturer PDF prints AegisRsAIC2NVP92069 as the part code. It is retained literally, not corrected to match the family name.' });
msi('Aegis R2 AI C2NVP7-2070US','AegisR2AIC2NVP72070','Core Ultra 7 265','GeForce RTX 5070',32,2000,'Intel H810','Air cooler',750,'2.5 Gb Ethernet; Wi-Fi 6E');
msi('Aegis R2 A14NVP9-2058US','AeR2A14NVP92058','Core i9-14900F','GeForce RTX 5070',32,1000,'Intel B760','Air cooler',750,'2.5 Gb Ethernet; Wi-Fi 6E');
msi('Aegis R2 AI A2NVV9-2218US','AeR2A2NVV92218','Core Ultra 9 285','GeForce RTX 5080',32,1000,'Intel B860','360 mm liquid CPU cooler',850,'1 Gb Ethernet; Wi-Fi 6E');
msi('Aegis R2 AI A2NVR7-2221US','AeR2A2NVR72221','Core Ultra 7 265','GeForce RTX 5070 Ti',24,1000,'Intel B860','Air cooler',750,'1 Gb Ethernet; Wi-Fi 6E');
const codex = [
  ['B14NUC5-091US','CodR2B14NUC5091','Core i5-14400F','GeForce RTX 4060',16,2000,'B760',3,650,1],
  ['B14NUD7-092US','CodR2B14NUD7092','Core i7-14700F','GeForce RTX 4060 Ti',32,2000,'B760',3,650,1],
  ['B14NUD7-093US','CodR2B14NUD7093','Core i7-14700F','GeForce RTX 4060 Ti',16,1000,'B760',3,650,1],
  ['B14NUC7-095US','CodR2B14NUC7095','Core i7-14700F','GeForce RTX 4060',32,2000,'B760',3,650,1],
  ['B14NUC5-216US','CodR2B14NUC5216','Core i5-14400F','GeForce RTX 4060',16,1000,'B760',3,650,1],
  ['A14NUD5-213US','CodR2A14NUD5213','Core i5-14400F','GeForce RTX 4060 Ti',16,1000,'B760',4,650,null],
  ['C14NUD7-214US','CodR2C14NUD7214','Core i7-14700F','GeForce RTX 4060 Ti',16,1000,'B760',3,650,null],
  ['B14NUC5-212US','CodR2B14NUC5212','Core i5-14400F','GeForce RTX 4060',32,2000,'B760',3,650,null],
  ['C14NUC7-215US','CodR2C14NUC7215','Core i7-14700F','GeForce RTX 4060',32,1000,'B760',3,650,1,{os:'Windows 11 Pro',board:'MSI PRO B760-VC WIFI'}],
  ['A13NUC7-217US','CodR2A13NUC7217','Core i7-13700F','GeForce RTX 4060',16,1000,'B760',4,650,1],
  ['C13NUC5-218US','CodR2C13NUC5218','Core i5-13400F','GeForce RTX 4060',16,1000,'B760',4,650,1],
  ['A12TA-219US','CodR2A12TA219','Core i5-12400F','GeForce RTX 3050',16,500,'H610',null,650,1,{storageInterface:null}],
  ['C12TA-220US','CodR2C12TA220','Core i5-12400F','GeForce RTX 3050',16,500,'H610',null,650,1,{storageInterface:null}],
  ['C14NUC7-226US','CodR2C14NUC7226','Core i7-14700F','GeForce RTX 4060',32,1000,'B760',4,650,3,{os:'Windows 11 Pro'}],
  ['C14NUE7-228US','CodR2C14NUE7228','Core i7-14700F','GeForce RTX 4070 SUPER',32,1000,'B760',4,750,3,{os:'Windows 11 Pro'}],
  ['C14NUC5-229US','CodR2C14NUC5229','Core i5-14400F','GeForce RTX 4060',32,1000,'B760',4,650,3,{os:'Windows 11 Pro'}],
  ['A14NUC5-232US','CodR2A14NUC5232','Core i5-14400F','GeForce RTX 4060',16,1000,'H610',4,650,1],
  ['A12TA-237US','CodR2A12TA237','Core i5-12400F','GeForce RTX 3050',16,500,'H610',null,750,1,{storageInterface:null,network:'Wi-Fi 6E; Ethernet rate withheld because the PDF gives inconsistent controller/rate text'}],
  ['B14NUC7-240US','CodR2B14NUC7240','Core i7-14700F','GeForce RTX 4060',32,2000,'H610',4,650,1],
  ['B14NVM7-438US','CodR2B14NVM7438','Core i7-14700F','GeForce RTX 5060 Ti',32,2000,'B760',4,650,1,{vramGB:8}],
  ['B14NVL5-447US','CodR2B14NVL5447','Core i5-14400F','GeForce RTX 5060',16,1000,'H610',4,650,1],
  ['D14NVL5-474US','CodR2D14NVL5474','Core i5-14400F','GeForce RTX 5060',16,1000,'H610',4,650,1],
  ['C14NVL5-473US','CodR2C14NVL5473','Core i5-14400F','GeForce RTX 5060',16,1000,'H610',4,650,1],
  ['B14NVL5-449US','CodR2B14NVL5449','Core i5-14400F','GeForce RTX 5060',32,2000,'H610',4,650,1],
  ['D14NVK5-605US','CodR2D14NVK5605','Core i5-14400F','GeForce RTX 5050',16,1000,'H610',4,650,1],
  ['C13NVL7-487US','CodR2C13NVL7487','Core i7-13700F','GeForce RTX 5060',32,1000,'H610',4,650,1],
  ['D14NVP5-613US','CodR2D14NVP5613','Core i5-14400F','GeForce RTX 5070',32,1000,'H610',4,750,1],
];
for (const [suffix,mpn,cpu,gpu,ram,storage,chipset,generation,psu,warranty,extras] of codex) {
  msi('Codex R2 ' + suffix,mpn,cpu,gpu,ram,storage,'Intel '+chipset,'Air cooler',psu,chipset==='H610'?'Wi-Fi 6E':'Wi-Fi 7',warranty,{storageGeneration:generation,...extras});
}
const corsairRoot = 'https://www.corsair.com/us/en/p/gaming-computers/';
function corsair(code, model, route, cpu, gpu, ram, storage, chipset, psu, extras = {}) {
  const facts = {cpu,gpu,ramGB:ram,ddr:'DDR5',ramModules:2,ramModuleGB:ram/2,storageGB:storage,storageInterface:'NVMe',chipset,psuW:psu,psuEfficiency:'80 PLUS Gold',cooling:'NAUTILUS 240 RS ARGB liquid CPU cooler; air-cooled GPU',case:'CORSAIR 3500X',network:'Wi-Fi 7; Bluetooth 5.4',os:'Windows 11 Home',warrantyYears:2,...extras};
  add('CORSAIR',model,code,corsairRoot+code.toLowerCase()+'/'+route,facts,'Selected exact SKU key specifications and technical table only. Alternative configuration cards are not merged into this SKU. Storage includes explicitly disclosed secondary drive capacity. Chipset is not an exact motherboard model. No retail-price or photo-redistribution rights asserted.');
}
corsair('CS-9050131-NA','VENGEANCE i7600','vengeance-i7600-gaming-pc-intel-core-ultra-7-265kf-geforce-rtx-5070-32gb-ddr5-1tb-ssd-win11-home-1','Core Ultra 7 265KF','GeForce RTX 5070',32,1000,'Intel B860',850,{network:'5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',ean:'0840440401681'});
corsair('CS-9050158-NA','VENGEANCE a7500','vengeance-a7500-gaming-pc-amd-ryzen-7-9800x3d-geforce-rtx-5070-32gb-ddr5-1tb-m2-ssd-win11-home-cs-9050158-na','Ryzen 7 9800X3D','GeForce RTX 5070',32,1000,'AMD X870',850,{network:'2.5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',ean:'0840440427520'});
corsair('CS-9050121-NA','VENGEANCE a7500','vengeance-a7500-gaming-pc-amd-ryzen-7-9800x3d-geforce-rtx-5080-32gb-ddr5-2tb-ssd-win11-home-cs-9050121-na','Ryzen 7 9800X3D','GeForce RTX 5080',32,2000,'AMD X870',1000,{network:'5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4'});
corsair('CS-9050138-NA','VENGEANCE i7600','vengeance-i7600-gaming-pc-intel-core-ultra-7-265kf-geforce-rtx-5080-32gb-ddr5-2tb-m2-ssd-win11-home-cs-9050138-na','Core Ultra 7 265KF','GeForce RTX 5080',32,2000,'Intel Z890',1000,{network:'5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',ean:'0840440403692'});
corsair('CS-9050146-NA','VENGEANCE i7600 AIR','vengeance-i7600-air-gaming-pc-intel-ultra-9-285k-geforce-rtx-5080-32gb-ddr5-2tb-m2-ssd-win11-home-cs-9050146-na','Core Ultra 9 285K','GeForce RTX 5080',32,2000,'Intel Z890',1000,{cooling:'iCUE LINK TITAN RX 240 mm liquid CPU cooler; air-cooled GPU',case:'CORSAIR FRAME 4000D',network:'5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',ean:'0840440408161'});
corsair('CS-9060028-NA','VENGEANCE i8200','vengeance-i8200-gaming-pc-intel-core-i9-14900kf-geforce-rtx-5080-64gb-ddr5-4tb-2tb-2tb-m2-ssd-win11-pro-cs-9060028-na','Core i9-14900KF','GeForce RTX 5080',64,4000,'Intel Z790',1200,{ramMTs:6000,storageLayout:'2 × 2 TB NVMe SSD',cooling:'iCUE LINK TITAN RX 360 mm liquid CPU cooler; air-cooled GPU',case:'CORSAIR 5000T',network:'2.5 Gb Ethernet; Wi-Fi 6; Bluetooth 5.2',os:'Windows 11 Pro',ean:'0840440411727'});
corsair('CS-9060029-NA','VENGEANCE a8200','vengeance-a8200-gaming-pc-amd-ryzen-9-9950x3d-geforce-rtx-5080-64gb-ddr5-4tb-2tb-2tb-m2-ssd-win11-pro-cs-9060029-na','Ryzen 9 9950X3D','GeForce RTX 5080',64,4000,'AMD X870',1200,{storageLayout:'2 × 2 TB NVMe SSD',cooling:'iCUE LINK TITAN RX liquid CPU cooler; air-cooled GPU',case:'CORSAIR 5000T',network:'2.5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',os:'Windows 11 Pro',ean:'0840440411734'});
corsair('CS-9060021-NA','VENGEANCE i8300','vengeance-i8300-gaming-pc-intel-core-ultra-9-285k-geforce-rtx-5080-64gb-ddr5-4tb-nvme-ssd-win11-pro-cs-9060021-na','Core Ultra 9 285K','GeForce RTX 5080',64,4000,'Intel Z890',1200,{storageLayout:'2 × 2 TB NVMe SSD',cooling:'iCUE LINK TITAN RX 360 mm liquid CPU cooler; air-cooled GPU',case:'CORSAIR 5000T',network:'5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',os:'Windows 11 Pro',ean:'0840440498087'});
corsair('CS-9050157-NA','VENGEANCE a7500','vengeance-a7500-gaming-pc-amd-ryzen-5-9600x-geforce-rtx-5060-16gb-ddr5-1tb-m2-ssd-win11-home-cs-9050157-na','Ryzen 5 9600X','GeForce RTX 5060',16,1000,'AMD B850',750,{network:'5 Gb Ethernet; Wi-Fi 7; Bluetooth 5.4',ean:'0840440427513'});

// Rendered PSREF Models table inspected after selecting USA and Canada. Columns
// were transposed by exact model link, never by combining family options.
// The two first inspected detail pages corroborated 90UX0006US and 90UX0012US.
const lenovo = [
 ['90UX0017US','US','Ryzen 5 7600','Radeon RX 7600',8,16,1000,0,500,'Home'],
 ['90UX0018US','US','Ryzen 5 7600','GeForce RTX 4060',8,32,1000,0,500,'Home'],
 ['90UX0019US','US','Ryzen 7 7700X','GeForce RTX 4060',8,32,1000,0,500,'Home'],
 ['90UX0012US','US','Ryzen 7 7700','GeForce RTX 4070 SUPER',12,16,1000,0,850,'Home'],
 ['90UX0013US','US','Ryzen 7 7700','GeForce RTX 4070 Ti SUPER',16,32,1000,0,850,'Home'],
 ['90UX0014US','US','Ryzen 5 7600','Radeon RX 7600',8,16,512,0,500,'Home'],
 ['90UX000YCF','CA','Ryzen 7 7700','GeForce RTX 4060',8,32,1000,0,500,'Pro'],
 ['90UX0011FZ','CA','Ryzen 5 7600','GeForce RTX 4060',8,16,1000,0,500,'Home'],
 ['90UX0015US','US','Ryzen 7 7700','GeForce RTX 4060',8,32,1000,0,500,'Pro'],
 ['90UX0010CF','CA','Ryzen 5 7600','GeForce RTX 4060',8,16,512,1000,500,'Home'],
 ['90UX000XUS','US','Ryzen 7 7700','Radeon RX 7600',8,16,1000,0,500,'Home'],
 ['90UX0016US','US','Ryzen 7 7700','Radeon RX 7600',8,16,512,0,500,'Pro'],
 ['90UX000QUS','US','Ryzen 7 7700','GeForce RTX 4060',8,16,1000,0,500,'Pro'],
 ['90UX000RUS','US','Ryzen 5 7600','GeForce RTX 4060',8,16,512,0,500,'Home'],
 ['90UX000SUS','US','Ryzen 5 7600','GeForce RTX 4060',8,16,512,1000,500,'Home'],
 ['90UX000TUS','US','Ryzen 7 7700','GeForce RTX 4060',8,16,1000,0,500,'Home'],
 ['90UX000UUS','US','Ryzen 7 7700','GeForce RTX 4060 Ti',8,16,1000,0,500,'Home'],
 ['90UX000VUS','US','Ryzen 7 7700X','GeForce RTX 4060 Ti',8,16,1000,0,500,'Home'],
 ['90UX000WUS','US','Ryzen 7 7700','GeForce RTX 4060 Ti',8,16,512,0,500,'Home'],
 ['90UX0009US','US','Ryzen 7 7700X','GeForce RTX 4070',12,16,512,1000,500,'Home'],
 ['90UX000AUS','US','Ryzen 7 7700X','GeForce RTX 4070',12,32,1000,1000,500,'Home'],
 ['90UX000BUS','US','Ryzen 7 7700','GeForce RTX 4070',12,16,1000,0,500,'Home'],
 ['90UX000CUS','US','Ryzen 7 7700','GeForce RTX 4070',12,16,512,0,500,'Home'],
 ['90UX000GUS','US','Ryzen 7 7700','GeForce RTX 4070',12,32,512,1000,500,'Home'],
 ['90UX000HFZ','CA','Ryzen 7 7700','GeForce RTX 4070',12,32,512,1000,500,'Home'],
 ['90UX000LCF','CA','Ryzen 7 7700','GeForce RTX 4070',12,16,512,1000,500,'Home'],
 ['90UX000MFZ','CA','Ryzen 7 7700','GeForce RTX 4070',12,16,512,1000,500,'Home'],
 ['90UX000PFZ','CA','Ryzen 7 7700','GeForce RTX 4070',12,16,512,1000,500,'Home'],
 ['90UX000NFZ','CA','Ryzen 5 7600','GeForce RTX 3060',12,16,512,0,500,'Home'],
 ['90UX0000US','US','Ryzen 7 7700X','GeForce RTX 4070 Ti',12,16,1000,0,850,'Home'],
 ['90UX0006US','US','Ryzen 5 7600','GeForce RTX 3050',8,16,512,0,500,'Home'],
];
for(const [mpn,region,cpu,gpu,vram,ram,ssd,hdd,psu,edition] of lenovo){
  const facts={cpu,gpu,vramGB:vram,ramGB:ram,ddr:'DDR5',ramModules:2,ramModuleGB:ram/2,ramMTs:5600,storageGB:ssd+hdd,storageInterface:hdd?null:'NVMe',storageGeneration:hdd?null:4,chipset:'AMD B650',psuW:psu,psuEfficiency:'Manufacturer reports '+(psu===850?'90%':'85%')+' efficiency; certification not asserted',network:'Wi-Fi 6E; Bluetooth 5.3; Ethernet rate not asserted',os:'Windows 11 '+edition,warrantyYears:1,withdrawn:true,identityNote:'Withdrawn manufacturer configuration. Published DDR5 module rating does not guarantee the operating data rate. Exact motherboard and PSU models remain undisclosed. PSREF gives inconsistent Ethernet rate/port text, so no Ethernet rate is asserted.'};
  if(hdd)facts.storageLayout=ssd+' GB NVMe SSD + '+hdd+' GB HDD';
  add('Lenovo','Legion T5 26ARA8 '+mpn,mpn,'https://psref.lenovo.com/Detail/Legion_T5_26ARA8?M='+mpn,facts,'Exact fixed-SKU column in the rendered PSREF model table (USA/Canada filters), or exact model detail page. Nominal memory rating, not a guaranteed runtime speed. Archived/withdrawn configuration; current stock, seller and prices not asserted.',region);
  const source=sources[slug('Lenovo-'+mpn)];source.inspection='Rendered manufacturer Models comparison table inspected; columns bound to exact model hyperlinks and transposed without mixing sibling configurations. Two source detail pages corroborated. AI-assisted factual consistency review; no first-party testing.';source.tableUrl='https://psref.lenovo.com/product/Legion_T5_26ARA8?tab=model';
  if(['90UX0006US','90UX0012US'].includes(mpn))source.detailCorroborated=true;
}
const lenovoT7 = [
 ['90V60015US','US','Core i7-14700KF','GeForce RTX 4080 SUPER',16,2,16,5600,2000,0,1,'Pro'],
 ['90V6000XUT','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,4,16,5600,2000,0,1,'Home'],
 ['90V6000TUS','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,1000,0,2,'Pro'],
 ['90V6000WUS','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,1000,0,2,'Pro'],
 ['90V6000LUS','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000MUS','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,2000,0,1,'Home'],
 ['90V6000NUS','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,2000,0,1,'Pro'],
 ['90V6000RCF','CA','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000UUS','US','Core i9-14900KF','GeForce RTX 4080 SUPER',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000VUS','US','Core i9-14900KF','GeForce RTX 4070 Ti SUPER',16,2,16,5600,2000,0,1,'Pro'],
 ['90V6000KUS','US','Core i9-14900KF','GeForce RTX 4070 Ti SUPER',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000SCF','CA','Core i7-14700KF','GeForce RTX 4070 Ti SUPER',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000PUS','US','Core i9-14900KF','GeForce RTX 4070 Ti',12,2,16,5600,1000,0,1,'Home'],
 ['90V6000QUS','US','Core i9-14900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Home'],
 ['90V7003JUS','US','Core i7-13700KF','GeForce RTX 4070 Ti',12,2,8,5600,1000,0,1,'Home'],
 ['90V6000AUS','US','Core i7-13700KF','GeForce RTX 4070 Ti',12,2,16,5600,1000,0,1,'Home'],
 ['90V6000HUS','US','Core i7-13700KF','GeForce RTX 4070 Ti',12,2,16,5600,1000,0,1,'Pro'],
 ['90V6000EUT','US','Core i7-13700KF','GeForce RTX 4070',12,4,16,4800,2000,0,1,'Pro'],
 ['90V6000GFZ','CA','Core i7-13700KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000DUS','US','Core i7-13700KF','GeForce RTX 4070 Ti',12,2,16,5600,1000,0,1,'Pro'],
 ['90V70051US','US','Core i9-13900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Home'],
 ['90V6000CUS','US','Core i9-13900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Pro'],
 ['90V6000BUS','US','Core i9-13900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Home'],
 ['90V7004LUS','US','Core i9-13900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Home'],
 ['90V7003NUS','US','Core i7-13700KF','GeForce RTX 4080',16,2,8,5600,512,0,1,'Home'],
 ['90V7003PUS','US','Core i7-13700KF','GeForce RTX 4080',16,2,8,5600,1000,1000,1,'Home'],
 ['90V60009US','US','Core i7-13700KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Pro'],
 ['90V7003HUS','US','Core i7-13700KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Home'],
 ['90V60008US','US','Core i9-13900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Pro'],
 ['90V7003AUS','US','Core i9-13900KF','GeForce RTX 4080',16,2,16,5600,1000,0,1,'Pro'],
];
for(const [mpn,region,cpu,gpu,vram,modules,moduleGB,speed,ssd,hdd,drives,edition] of lenovoT7){
 const facts={cpu,gpu,vramGB:vram,ramGB:modules*moduleGB,ddr:'DDR5',ramModules:modules,ramModuleGB:moduleGB,ramMTs:speed,storageGB:ssd*drives+hdd,storageInterface:hdd?null:'NVMe',storageGeneration:hdd?null:4,chipset:'Intel Z790',psuW:850,psuEfficiency:'Manufacturer reports 90% efficiency; certification not asserted',network:'Wi-Fi 6E; Bluetooth 5.3',os:'Windows 11 '+edition,warrantyYears:1,withdrawn:true,identityNote:'Withdrawn manufacturer configuration. Published memory module rating does not guarantee its operating rate. Exact motherboard, PSU and cooler models are not asserted.'};
 if(hdd)facts.storageLayout=ssd+' GB NVMe SSD + '+hdd+' GB HDD';else if(drives>1)facts.storageLayout=drives+' × '+ssd/1000+' TB NVMe SSD';
 add('Lenovo','Legion T7 34IRZ8 '+mpn,mpn,'https://psref.lenovo.com/l/Detail/Legion_T7_34IRZ8?M='+mpn,facts,'Exact fixed-SKU column in the rendered withdrawn PSREF model table, filtered to USA/Canada. Nominal memory module rating; operating data rate depends on platform configuration. No currently available retail offer or image licence asserted.',region);
 const source=sources[slug('Lenovo-'+mpn)];source.inspection='Rendered manufacturer Models comparison table inspected; exact model hyperlinks and matching columns transposed. No family-option combinations or sibling substitutions. AI-assisted factual consistency review; no first-party testing.';source.tableUrl='https://psref.lenovo.com/WDProduct/Legion_T7_34IRZ8?tab=model';
}
// Current generation. 90Y6006HCF is already in the inherited retailer catalog:
// its manufacturer column was checked but is not counted as a new identity.
const lenovoModern = [
 ['90Y50001US','US','Core Ultra 9 285K','GeForce RTX 5080',16,16,5600,1000,1,850,'Home',null,'UDIMM'],
 ['90Y50000US','US','Core Ultra 7 270K Plus','GeForce RTX 5080',16,16,6400,1000,2,850,'Home',null,'CUDIMM'],
 ['90Y600BAUS','US','Core Ultra 7 270K Plus','GeForce RTX 5080',16,16,5600,1000,1,850,'Pro',3,'UDIMM'],
 ['90Y600BDUS','US','Core Ultra 7 270K Plus','GeForce RTX 5070 Ti',16,16,5600,1000,1,850,'Home',null,'UDIMM'],
 ['90Y600BEUS','US','Core Ultra 7 270K Plus','GeForce RTX 5080',16,16,5600,1000,1,850,'Home',null,'UDIMM'],
 ['90Y80004US','US','Core Ultra 9 285K','GeForce RTX 5090',32,32,5600,2000,1,1200,'Pro',3,'UDIMM'],
 ['90Y80003US','US','Core Ultra 9 285K','GeForce RTX 5090',32,32,5600,2000,1,1200,'Pro',3,'UDIMM'],
 ['90Y80000US','US','Core Ultra 9 285K','GeForce RTX 5090',32,32,5600,2000,1,1200,'Pro',null,'UDIMM'],
 ['90Y80002CF','CA','Core Ultra 9 285K','GeForce RTX 5090',32,32,5600,2000,1,1200,'Pro',null,'UDIMM'],
 ['90Y6007MUS','US','Core Ultra 9 285K','GeForce RTX 5080',16,16,5600,1000,2,850,'Pro',null,'UDIMM'],
 ['90Y6007NCF','CA','Core Ultra 9 285K','GeForce RTX 5080',16,16,5600,1000,2,850,'Pro',null,'UDIMM'],
 ['90Y6000PUS','US','Core Ultra 9 285K','GeForce RTX 4080 SUPER',16,16,6400,2000,1,850,'Home',null,'CUDIMM'],
 ['90Y6003HUS','US','Core Ultra 9 285K','GeForce RTX 5070 Ti',16,16,5600,1000,1,850,'Home',null,'UDIMM'],
 ['90Y6006JCF','CA','Core Ultra 9 285K','GeForce RTX 5070 Ti',16,16,5600,1000,1,850,'Home',null,'UDIMM'],
 ['90Y6006KCF','CA','Core Ultra 9 285K','GeForce RTX 5080',16,16,5600,1000,2,850,'Home',1,'UDIMM'],
 ['90Y60001US','US','Core Ultra 9 285K','GeForce RTX 4080 SUPER',16,16,5600,2000,1,850,'Home',null,'UDIMM'],
 ['90Y6000QUS','US','Core Ultra 9 285K','GeForce RTX 4080 SUPER',16,16,5600,2000,1,850,'Home',1,'UDIMM'],
 ['90Y6000YUS','US','Core Ultra 9 285K','No discrete graphics supplied',null,32,5600,2000,1,1200,null,3,'UDIMM'],
 ['90Y60010US','US','Core Ultra 9 285K','No discrete graphics supplied',null,32,5600,1000,1,1200,null,1,'UDIMM'],
 ['90Y60015US','US','Core Ultra 9 285K','GeForce RTX 4080 SUPER',16,32,5600,2000,1,1200,null,3,'UDIMM'],
 ['90Y60016US','US','Core Ultra 9 285K','GeForce RTX 4080 SUPER',16,32,5600,2000,1,1200,'Home',1,'UDIMM'],
 ['90Y6001JUS','US','Core Ultra 7 265K','GeForce RTX 5080',16,16,5600,1000,2,850,'Home',null,'UDIMM'],
 ['90Y60032US','US','Core Ultra 7 265KF','GeForce RTX 5080',16,16,5600,2000,1,850,'Pro',null,'UDIMM'],
 ['90Y6003JUS','US','Core Ultra 9 285K','GeForce RTX 5080',16,32,5600,1000,2,1200,'Pro',3,'UDIMM'],
 ['90Y6003KUS','US','Core Ultra 7 265KF','GeForce RTX 5080',16,16,5600,1000,1,850,'Pro',3,'UDIMM'],
 ['90Y6003RUS','US','Core Ultra 9 285K','GeForce RTX 5080',16,32,5600,1000,2,850,'Home',null,'UDIMM'],
 ['90Y6003WUS','US','Core Ultra 9 285K','GeForce RTX 5080',16,16,5600,1000,2,850,'Home',1,'UDIMM'],
 ['90Y6004FUS','US','Core Ultra 9 285K','No discrete graphics supplied',null,32,5600,1000,2,1200,null,null,'UDIMM'],
 ['90Y6004GUS','US','Core Ultra 9 285K','GeForce RTX 5080',16,32,5600,1000,2,1200,'Pro',null,'UDIMM'],
];
for(const [mpn,region,cpu,gpu,vram,moduleGB,speed,ssd,drives,psu,edition,upgrade,ramClass] of lenovoModern){
 const facts={cpu,gpu,vramGB:vram,ramGB:2*moduleGB,ddr:'DDR5',ramModules:2,ramModuleGB:moduleGB,ramMTs:speed,ramClass,storageGB:ssd*drives,storageInterface:'NVMe',storageGeneration:4,chipset:'Intel Z890',psuW:psu,psuEfficiency:'Manufacturer reports 90% efficiency; certification not asserted',cooling:'Liquid CPU cooler with 3 × 120 mm fans; exact cooler model not disclosed',os:edition?'Windows 11 '+edition:'No operating system supplied',warrantyYears:1,identityNote:'Exact current-generation manufacturer SKU. Memory module rating is nominal; its operating rate can depend on CPU/firmware support. No exact motherboard, PSU or discrete-card board partner is asserted.'};
 if(drives>1)facts.storageLayout=drives+' × '+ssd/1000+' TB NVMe SSD';
 if(upgrade)facts.warrantyUpgrade=upgrade+'Y Legion Ultimate Support with Onsite';
 if(mpn==='90Y6003KUS')facts.network='Wi-Fi 6E; Bluetooth 5.3';
 add('Lenovo','Legion T7 34IAS10 '+mpn,mpn,'https://psref.lenovo.com/Detail/Legion_T7_34IAS10?M='+mpn,facts,'Exact fixed-SKU column in rendered current PSREF Models table, filtered to USA/Canada. None in Graphics or Operating System is recorded as an explicitly omitted component/software, not an unknown price or invented integrated GPU. Warranty base and listed service upgrade remain separate.',region);
 const source=sources[slug('Lenovo-'+mpn)];source.inspection='Rendered manufacturer Models comparison table inspected; exact model hyperlinks and matching columns transposed. One exact detail page corroborated. No family-option combinations or sibling substitutions. AI-assisted factual consistency review; no first-party testing.';source.tableUrl='https://psref.lenovo.com/product/Legion_T7_34IAS10?tab=model';if(mpn==='90Y6003KUS')source.detailCorroborated=true;
}

const candidates = [
  {model:'Codex R2 B14NUD7-096US',url:'https://storage-asset.msi.com/excelSku/us/desktop/Codex%20R2%20B14NUD7-096US.pdf',reason:'Title says NUD; manufacturer part code says CodR2B14NUC7096. Exact identity requires clarification.',status:'review-required'},
  {model:'Codex R2 B14NVN7-440US',url:'https://storage-asset.msi.com/excelSku/us/desktop/Codex%20R2%20B14NVN7-440US.pdf',reason:'Title says NVN; manufacturer part code says CodR2B14NVB7440. Exact identity requires clarification.',status:'review-required'},
  {model:'Codex R2 C14NUB7-227US',url:'https://storage-asset.msi.com/excelSku/us/desktop/Codex%20R2%20C14NUB7-227US.pdf',reason:'Exact PDF could not be retrieved in this review. Search snippets are not a completed specification record.',status:'source-unavailable'},
  {model:'Codex R2 B14NVK5-604US',url:'https://storage-asset.msi.com/excelSku/us/desktop/Codex%20R2%20B14NVK5-604US.pdf',reason:'Exact PDF request failed; no sibling-SKU specifications inherited.',status:'source-unavailable'},
  {model:'Codex R2 A14NUD5-258US',url:'https://storage-asset.msi.com/excelSku/us/desktop/Codex%20R2%20A14NUD5-258US.pdf',reason:'Source opened but extraction did not expose enough specification text for this bounded batch.',status:'review-required'},
  {model:'CORSAIR ONE CS-9020069-NA',url:'https://www.corsair.com/us/en/p/gaming-computers/cs-9020069-na/corsair-one-a600-pc-metal-dark-liquid-cooled-amd-ryzen-7-9800x3d-geforce-rtx-5080-32gb-ddr5-2tb-m2-ssd-win11-home-cs-9020069-na',reason:'Product heading prints 9800X35 while selected specification says 9800X3D. Held for editorial identity review; selector contains other SKUs.',status:'review-required'},
  {model:'VENGEANCE CS-9050136-NA',url:'https://www.corsair.com/us/en/p/gaming-computers/cs-9050136-na/vengeance-a7500-gaming-pc-amd-ryzen-9-9900x3d-geforce-rtx-5080-32gb-ddr5-2tb-ssd-win11-home-cs-9050136-na',reason:'Exact selected page could not be retrieved; comparison-card-only facts not published as a completed record.',status:'source-unavailable'},
  {model:'Legion T7 34IAS10 90Y6006HCF',url:'https://psref.lenovo.com/Detail/Legion_T7_34IAS10?M=90Y6006HCF',reason:'Exact model already exists in the inherited Canadian retailer cohort. Manufacturer column inspected but not counted or imported as a new configuration.',status:'already-indexed'},
];
const reviewedExports=require('./total-prebuilts-psref-import.cjs').augment({sources,records});
fs.mkdirSync(directory,{recursive:true});
for (const [file, value] of Object.entries({'sources.json':sources,'batch.json':records,'candidates.json':candidates})) fs.writeFileSync(path.join(directory,file),JSON.stringify(value,null,2)+'\n');
console.log(`Authored ${records.length} exact prebuilt SKU packets; ${candidates.length} excluded candidates. Reviewed export rows: ${reviewedExports.map(r=>r.reviewedRows).join('+')}.`);
