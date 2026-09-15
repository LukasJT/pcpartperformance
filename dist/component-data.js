(()=>{
const rows=[],slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),brand=n=>n.match(/^(Fractal Design|Lian Li|Cooler Master|Western Digital|be quiet!|G\.SKILL|ASUS|MSI|GIGABYTE|ASRock|Biostar|CORSAIR|Kingston|Crucial|TEAMGROUP|Samsung|WD|Solidigm|Seagate|Sabrent|Toshiba|Seasonic|EVGA|Thermaltake|Phanteks|HYTE)/i)?.[0]||n.split(' ')[0];
const add=(cat,source,name,year,architecture,summary,specs={})=>rows.push({id:`c-${cat}-${slug(name)}`,name,brand:brand(name),cat,year,architecture,summary,specs,source,note:'Manufacturer-family record. Capacity, color, revision and regional SKU variants may differ.'});
const lines=(text,fn)=>text.trim().split('\n').map(s=>s.split('|')).forEach(fn);
const boards=(source,text)=>lines(text,a=>add('board',source,a[0],+a[1],`${a[2]} · ${a[3]} · ${a[4]}`,'Desktop motherboard',{'DIMM slots':+a[5],'M.2 slots':+a[6],'SATA ports':+a[7],'Max RAM':+a[8],'CPU sockets':1,'Multi CPU support':0}));
boards('https://us-store.msi.com/Motherboards?limit=48',`
MSI MEG X870E GODLIKE|2024|AM5|DDR5|E-ATX|4|5|4|256
MSI MPG X870E CARBON WIFI|2024|AM5|DDR5|ATX|4|4|4|256
MSI MAG X870 TOMAHAWK WIFI|2024|AM5|DDR5|ATX|4|4|4|256
MSI MPG B850 EDGE TI WIFI|2025|AM5|DDR5|ATX|4|4|4|256
MSI MAG B850 TOMAHAWK MAX WIFI|2025|AM5|DDR5|ATX|4|4|4|256
MSI MAG B650 TOMAHAWK WIFI|2022|AM5|DDR5|ATX|4|3|6|192
MSI MPG B650I EDGE WIFI|2022|AM5|DDR5|Mini-ITX|2|2|4|96
MSI MEG Z890 GODLIKE|2024|LGA1851|DDR5|E-ATX|4|6|4|256
MSI MPG Z890 CARBON WIFI|2024|LGA1851|DDR5|ATX|4|5|4|256
MSI MAG Z890 TOMAHAWK WIFI|2024|LGA1851|DDR5|ATX|4|4|4|256
MSI MPG Z790 CARBON WIFI|2022|LGA1700|DDR5|ATX|4|5|6|192
MSI MAG Z790 TOMAHAWK WIFI|2022|LGA1700|DDR5|ATX|4|4|7|192
MSI MAG B760M MORTAR WIFI II|2023|LGA1700|DDR5|Micro-ATX|4|3|4|192
MSI PRO H610M-G DDR4|2022|LGA1700|DDR4|Micro-ATX|2|1|4|64`);
boards('https://www.asrock.com/mb/',`
ASRock X870E Taichi|2024|AM5|DDR5|E-ATX|4|4|6|256
ASRock X870E Nova WiFi|2024|AM5|DDR5|ATX|4|5|4|256
ASRock X870 Steel Legend WiFi|2024|AM5|DDR5|ATX|4|4|4|256
ASRock B850 LiveMixer WiFi|2025|AM5|DDR5|ATX|4|4|4|256
ASRock B850 Steel Legend WiFi|2025|AM5|DDR5|ATX|4|4|4|256
ASRock B650E Taichi Lite|2023|AM5|DDR5|E-ATX|4|4|8|192
ASRock B650M Pro RS WiFi|2022|AM5|DDR5|Micro-ATX|4|3|4|192
ASRock A620I Lightning WiFi|2023|AM5|DDR5|Mini-ITX|2|2|2|96
ASRock Z890 Taichi OCF|2024|LGA1851|DDR5|E-ATX|2|6|4|128
ASRock Z890 Nova WiFi|2024|LGA1851|DDR5|ATX|4|6|4|256
ASRock Z790 Taichi Carrara|2022|LGA1700|DDR5|E-ATX|4|5|8|192
ASRock Z790 PG-ITX/TB4|2022|LGA1700|DDR5|Mini-ITX|2|3|3|96
ASRock B760M Steel Legend WiFi|2023|LGA1700|DDR5|Micro-ATX|4|3|4|192
ASRock B550 Taichi|2020|AM4|DDR4|ATX|4|2|8|128
ASRock B450M Steel Legend|2018|AM4|DDR4|Micro-ATX|4|2|4|128`);
boards('https://www.gigabyte.com/Motherboard',`
GIGABYTE X870E AORUS XTREME AI TOP|2024|AM5|DDR5|E-ATX|4|5|4|256
GIGABYTE X870E AORUS MASTER|2024|AM5|DDR5|E-ATX|4|5|4|256
GIGABYTE X870 AORUS ELITE WIFI7|2024|AM5|DDR5|ATX|4|4|4|256
GIGABYTE B850 AORUS ELITE WIFI7|2025|AM5|DDR5|ATX|4|4|4|256
GIGABYTE B650 AORUS ELITE AX|2022|AM5|DDR5|ATX|4|3|4|192
GIGABYTE B650I AORUS ULTRA|2022|AM5|DDR5|Mini-ITX|2|3|2|96
GIGABYTE Z890 AORUS XTREME AI TOP|2024|LGA1851|DDR5|E-ATX|4|5|4|256
GIGABYTE Z790 AORUS MASTER X|2023|LGA1700|DDR5|E-ATX|4|5|4|192
GIGABYTE Z790I AORUS ULTRA|2022|LGA1700|DDR5|Mini-ITX|2|2|2|96
GIGABYTE B760M DS3H DDR4|2023|LGA1700|DDR4|Micro-ATX|4|2|4|128`);
boards('https://www.biostar.com.tw/app/en/mb/',`
Biostar X870E VALKYRIE|2024|AM5|DDR5|ATX|4|4|4|256
Biostar B650MP-E PRO|2023|AM5|DDR5|Micro-ATX|4|2|4|192
Biostar B550MH|2020|AM4|DDR4|Micro-ATX|2|1|4|64
Biostar Z890 VALKYRIE|2024|LGA1851|DDR5|ATX|4|5|4|256
Biostar Z790A-SILVER|2022|LGA1700|DDR5|ATX|4|3|4|192
Biostar B760MX2-E D4|2023|LGA1700|DDR4|Micro-ATX|2|2|4|64`);
const ram=(source,text)=>lines(text,a=>add('ram',source,a[0],+a[1],`${a[2]} UDIMM`,`${a[3]} GB · ${a[6]} modules`,{Memory:+a[3],'Transfer rate':+a[4],'CAS latency':+a[5],Modules:+a[6]}));
ram('https://www.corsair.com/us/en/c/memory',`
CORSAIR Dominator Titanium RGB 64GB DDR5-6600 CL32|2023|DDR5|64|6600|32|2
CORSAIR Dominator Platinum RGB 32GB DDR5-6200 CL36|2022|DDR5|32|6200|36|2
CORSAIR Vengeance RGB 96GB DDR5-6000 CL30|2024|DDR5|96|6000|30|2
CORSAIR Vengeance 64GB DDR5-6000 CL30|2022|DDR5|64|6000|30|2
CORSAIR Vengeance 48GB DDR5-6400 CL36|2023|DDR5|48|6400|36|2
CORSAIR Vengeance 32GB DDR5-5600 CL36|2021|DDR5|32|5600|36|2
CORSAIR Vengeance LPX 64GB DDR4-3600 CL18|2020|DDR4|64|3600|18|2
CORSAIR Vengeance RGB Pro 32GB DDR4-3600 CL18|2018|DDR4|32|3600|18|2
CORSAIR Vengeance LPX 16GB DDR4-3200 CL16|2015|DDR4|16|3200|16|2`);
ram('https://www.gskill.com/products/1/165/377/Trident-Z5-RGB-DDR5-Intel-XMP',`
G.SKILL Trident Z5 RGB 48GB DDR5-8400 CL40|2024|DDR5|48|8400|40|2
G.SKILL Trident Z5 RGB 32GB DDR5-7200 CL34|2022|DDR5|32|7200|34|2
G.SKILL Trident Z5 Neo RGB 64GB DDR5-6000 CL30|2022|DDR5|64|6000|30|2
G.SKILL Trident Z5 Neo RGB 32GB DDR5-6000 CL30|2022|DDR5|32|6000|30|2
G.SKILL Ripjaws S5 96GB DDR5-5600 CL40|2023|DDR5|96|5600|40|2
G.SKILL Ripjaws S5 32GB DDR5-6000 CL30|2022|DDR5|32|6000|30|2
G.SKILL Trident Z Royal Elite 32GB DDR4-4000 CL16|2021|DDR4|32|4000|16|2
G.SKILL Trident Z Neo 32GB DDR4-3600 CL16|2019|DDR4|32|3600|16|2
G.SKILL Ripjaws V 16GB DDR4-3200 CL16|2015|DDR4|16|3200|16|2`);
ram('https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory',`
Kingston FURY Renegade RGB 96GB DDR5-6400 CL32|2024|DDR5|96|6400|32|2
Kingston FURY Renegade 48GB DDR5-7200 CL38|2023|DDR5|48|7200|38|2
Kingston FURY Beast RGB 64GB DDR5-6000 CL36|2022|DDR5|64|6000|36|2
Kingston FURY Beast 32GB DDR5-5600 CL36|2021|DDR5|32|5600|36|2
Kingston FURY Renegade RGB 32GB DDR4-3600 CL16|2021|DDR4|32|3600|16|2
Kingston FURY Beast 16GB DDR4-3200 CL16|2021|DDR4|16|3200|16|2`);
ram('https://www.crucial.com/catalog/memory/ddr5-desktop',`
Crucial Pro Overclocking 64GB DDR5-6000 CL36|2024|DDR5|64|6000|36|2
Crucial Pro Overclocking 32GB DDR5-6000 CL36|2024|DDR5|32|6000|36|2
Crucial Pro 64GB DDR5-5600 CL46|2023|DDR5|64|5600|46|2
Crucial 32GB DDR5-4800 CL40|2021|DDR5|32|4800|40|2
Crucial Pro 64GB DDR4-3200 CL22|2023|DDR4|64|3200|22|2
Crucial Ballistix MAX 32GB DDR4-4000 CL18|2020|DDR4|32|4000|18|2
Crucial 16GB DDR4-3200 CL22|2020|DDR4|16|3200|22|2`);
ram('https://www.teamgroupinc.com/en/product-category/memory/',`
TEAMGROUP T-Force Xtreem 48GB DDR5-8200 CL38|2024|DDR5|48|8200|38|2
TEAMGROUP T-Force Delta RGB 64GB DDR5-6400 CL40|2023|DDR5|64|6400|40|2
TEAMGROUP T-Create Expert 96GB DDR5-6000 CL34|2024|DDR5|96|6000|34|2
TEAMGROUP T-Create Classic 32GB DDR5-5600 CL46|2022|DDR5|32|5600|46|2
TEAMGROUP T-Force Xtreem ARGB 32GB DDR4-3600 CL14|2020|DDR4|32|3600|14|2
TEAMGROUP T-Force Vulcan Z 16GB DDR4-3200 CL16|2019|DDR4|16|3200|16|2`);
const ssds=(source,text)=>lines(text,a=>add('ssd',source,a[0],+a[1],a[2],`${a[3]} GB solid-state drive`,{'Storage capacity':+a[3],'Sequential read':+a[4],'Sequential write':+a[5]}));
ssds('https://semiconductor.samsung.com/consumer-storage/support/documents/',`
Samsung 9100 PRO 4TB|2025|PCIe 5.0 NVMe M.2|4000|14800|13400
Samsung 990 EVO Plus 2TB|2024|PCIe 4.0 NVMe M.2|2000|7250|6300
Samsung 990 EVO 2TB|2024|PCIe 4.0 NVMe M.2|2000|5000|4200
Samsung 980 PRO 2TB|2020|PCIe 4.0 NVMe M.2|2000|7000|5100
Samsung 980 1TB|2021|PCIe 3.0 NVMe M.2|1000|3500|3000
Samsung 970 EVO Plus 2TB|2019|PCIe 3.0 NVMe M.2|2000|3500|3300
Samsung 970 PRO 1TB|2018|PCIe 3.0 NVMe M.2|1000|3500|2700
Samsung 960 EVO 1TB|2016|PCIe 3.0 NVMe M.2|1000|3200|1900
Samsung 870 EVO 4TB|2021|SATA 6 Gb/s|4000|560|530
Samsung 870 QVO 8TB|2020|SATA 6 Gb/s|8000|560|530
Samsung 860 EVO 4TB|2018|SATA 6 Gb/s|4000|550|520
Samsung 850 EVO 1TB|2014|SATA 6 Gb/s|1000|540|520`);
ssds('https://www.westerndigital.com/en-ca/products/internal-drives',`
WD_BLACK SN850X 4TB|2022|PCIe 4.0 NVMe M.2|4000|7300|6600
WD_BLACK SN850X 2TB|2022|PCIe 4.0 NVMe M.2|2000|7300|6600
WD_BLACK SN770 2TB|2022|PCIe 4.0 NVMe M.2|2000|5150|4850
WD Blue SN580 2TB|2023|PCIe 4.0 NVMe M.2|2000|4150|4150
WD Blue SN570 1TB|2021|PCIe 3.0 NVMe M.2|1000|3500|3000
WD Green SN350 1TB|2021|PCIe 3.0 NVMe M.2|1000|3200|3000
WD Blue SA510 4TB|2022|SATA 6 Gb/s|4000|560|520`);
ssds('https://www.crucial.com/catalog/ssd',`
Crucial T705 4TB|2024|PCIe 5.0 NVMe M.2|4000|14100|12600
Crucial T700 4TB|2023|PCIe 5.0 NVMe M.2|4000|12400|11800
Crucial T500 2TB|2023|PCIe 4.0 NVMe M.2|2000|7400|7000
Crucial P5 Plus 2TB|2021|PCIe 4.0 NVMe M.2|2000|6600|5000
Crucial P3 Plus 4TB|2022|PCIe 4.0 NVMe M.2|4000|4800|4100
Crucial P3 4TB|2022|PCIe 3.0 NVMe M.2|4000|3500|3000
Crucial MX500 4TB|2018|SATA 6 Gb/s|4000|560|510
Crucial BX500 2TB|2018|SATA 6 Gb/s|2000|540|500`);
ssds('https://www.kingston.com/en/ssd',`
Kingston FURY Renegade G5 4TB|2025|PCIe 5.0 NVMe M.2|4000|14800|14000
Kingston FURY Renegade 4TB|2021|PCIe 4.0 NVMe M.2|4000|7300|7000
Kingston KC3000 4TB|2021|PCIe 4.0 NVMe M.2|4000|7000|7000
Kingston NV3 4TB|2024|PCIe 4.0 NVMe M.2|4000|6000|5000
Kingston NV2 2TB|2022|PCIe 4.0 NVMe M.2|2000|3500|2800
Kingston A400 1.92TB|2017|SATA 6 Gb/s|1920|500|450`);
ssds('https://www.seagate.com/products/gaming-drives/pc-gaming/firecuda-ssd/',`
Seagate FireCuda 540 4TB|2023|PCIe 5.0 NVMe M.2|4000|10000|10000
Seagate FireCuda 530R 4TB|2024|PCIe 4.0 NVMe M.2|4000|7400|6900
Seagate FireCuda 530 4TB|2021|PCIe 4.0 NVMe M.2|4000|7300|6900
Seagate FireCuda 520 2TB|2019|PCIe 4.0 NVMe M.2|2000|5000|4400
Seagate BarraCuda Q5 2TB|2020|PCIe 3.0 NVMe M.2|2000|2400|1800`);
ssds('https://sabrent.com/collections/internal-memory',`
Sabrent Rocket 5 4TB|2024|PCIe 5.0 NVMe M.2|4000|14000|12000
Sabrent Rocket 4 Plus-G 4TB|2022|PCIe 4.0 NVMe M.2|4000|7000|6850
Sabrent Rocket Q4 4TB|2020|PCIe 4.0 NVMe M.2|4000|4900|3500
Sabrent Rocket Q 8TB|2020|PCIe 3.0 NVMe M.2|8000|3300|2900`);
const hdds=(source,text)=>lines(text,a=>add('hdd',source,a[0],+a[1],'SATA 6 Gb/s',`${a[2]} GB hard disk drive`,{'Storage capacity':+a[2],'Spindle speed':+a[3],'Drive cache':+a[4]}));
hdds('https://www.seagate.com/products/hard-drives/',`
Seagate BarraCuda 8TB|2020|8000|5400|256
Seagate BarraCuda 4TB|2016|4000|5400|256
Seagate FireCuda 8TB HDD|2023|8000|7200|256
Seagate IronWolf 24TB|2024|24000|7200|512
Seagate IronWolf Pro 24TB|2024|24000|7200|512
Seagate Exos X24 24TB|2023|24000|7200|512
Seagate SkyHawk AI 24TB|2024|24000|7200|512`);
hdds('https://www.westerndigital.com/en-ca/products/internal-drives',`
WD Blue 8TB HDD|2024|8000|5640|256
WD Blue 4TB HDD|2021|4000|5400|256
WD Blue 2TB HDD|2015|2000|7200|256
WD_BLACK 10TB HDD|2021|10000|7200|512
WD Red Plus 12TB|2021|12000|7200|256
WD Red Pro 24TB|2024|24000|7200|512
WD Gold 24TB|2024|24000|7200|512
WD Purple Pro 24TB|2024|24000|7200|512`);
hdds('https://storage.toshiba.com/consumer-hdd',`
Toshiba X300 Pro 22TB|2024|22000|7200|512
Toshiba X300 18TB|2023|18000|7200|512
Toshiba N300 Pro 22TB|2024|22000|7200|512
Toshiba N300 18TB|2023|18000|7200|512
Toshiba P300 6TB|2022|6000|5400|128
Toshiba S300 Pro 10TB|2023|10000|7200|256
Toshiba MG10 22TB|2023|22000|7200|512`);
const psus=(source,text)=>lines(text,a=>add('psu',source,a[0],+a[1],'ATX power supply',`${a[2]} W power supply`,{'Rated output':+a[2]}));
psus('https://www.corsair.com/us/en/c/psu',`
CORSAIR AX1600i|2018|1600
CORSAIR HX1500i|2022|1500
CORSAIR HX1200i|2022|1200
CORSAIR RM1200x SHIFT|2023|1200
CORSAIR RM1000x SHIFT|2023|1000
CORSAIR RM850x SHIFT|2023|850
CORSAIR RM750x SHIFT|2023|750
CORSAIR SF1000|2024|1000
CORSAIR SF850|2024|850
CORSAIR SF750|2024|750`);
psus('https://seasonic.com/power-supplies/',`
Seasonic PRIME TX-1600 Noctua Edition|2024|1600
Seasonic PRIME TX-1300|2023|1300
Seasonic PRIME PX-1600|2022|1600
Seasonic VERTEX PX-1200|2023|1200
Seasonic VERTEX GX-1000|2023|1000
Seasonic VERTEX GX-850|2023|850
Seasonic FOCUS GX-1000|2024|1000
Seasonic FOCUS GX-850|2024|850
Seasonic FOCUS GX-750|2024|750
Seasonic CORE GX-650|2025|650`);
psus('https://www.evga.com/products/productlist.aspx?type=10',`
EVGA SuperNOVA 1600 P+|2021|1600
EVGA SuperNOVA 1300 G+|2018|1300
EVGA SuperNOVA 1000 G7|2022|1000
EVGA SuperNOVA 850 G7|2022|850
EVGA SuperNOVA 750 G7|2022|750
EVGA SuperNOVA 650 G6|2021|650
EVGA 600 BR|2018|600
EVGA 500 W1|2014|500`);
psus('https://www.bequiet.com/en/powersupply',`
be quiet! Dark Power Pro 13 1600W|2023|1600
be quiet! Dark Power 13 1000W|2023|1000
be quiet! Straight Power 12 1200W|2023|1200
be quiet! Straight Power 12 850W|2023|850
be quiet! Pure Power 12 M 1000W|2023|1000
be quiet! Pure Power 12 M 750W|2023|750
be quiet! System Power 10 650W|2022|650`);
psus('https://www.coolermaster.com/en-global/catalog/power-supplies/',`
Cooler Master X Silent Edge Platinum 1100|2024|1100
Cooler Master V Platinum V2 1300|2021|1300
Cooler Master V Gold i Multi 1050|2023|1050
Cooler Master MWE Gold 1050 V2|2021|1050
Cooler Master GX III Gold 850|2023|850
Cooler Master V SFX Platinum 1100|2024|1100
Cooler Master V SFX Gold 850|2021|850`);
const cases=(source,text)=>lines(text,a=>add('case',source,a[0],+a[1],a[2],'Desktop PC case'));
cases('https://phanteks.com/collections/cases',`
Phanteks Enthoo Elite|2017|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks Enthoo Pro 2|2020|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks Evolv X|2018|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks NV9|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks NV7|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks NV5|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks Eclipse G500A|2022|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks Eclipse G360A|2022|ATX / Micro-ATX / Mini-ITX
Phanteks XT Pro Ultra|2024|E-ATX / ATX / Micro-ATX / Mini-ITX
Phanteks Evolv Shift XT|2022|Mini-ITX`);
cases('https://www.coolermaster.com/en-global/catalog/cases/',`
Cooler Master Cosmos C700M|2018|E-ATX / ATX / Micro-ATX / Mini-ITX
Cooler Master HAF 700 EVO|2022|E-ATX / ATX / Micro-ATX / Mini-ITX
Cooler Master HAF 500|2022|E-ATX / ATX / Micro-ATX / Mini-ITX
Cooler Master MasterBox TD500 Mesh V2|2023|ATX / Micro-ATX / Mini-ITX
Cooler Master MasterBox NR600|2019|ATX / Micro-ATX / Mini-ITX
Cooler Master MasterBox Q300L|2018|Micro-ATX / Mini-ITX
Cooler Master NR200P V2|2024|Mini-ITX
Cooler Master NCORE 100 MAX|2024|Mini-ITX`);
cases('https://www.bequiet.com/en/case',`
be quiet! Dark Base Pro 901|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
be quiet! Dark Base 701|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
be quiet! Light Base 900 FX|2024|E-ATX / ATX / Micro-ATX / Mini-ITX
be quiet! Light Base 600 LX|2024|ATX / Micro-ATX / Mini-ITX
be quiet! Shadow Base 800 FX|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
be quiet! Pure Base 500DX|2020|ATX / Micro-ATX / Mini-ITX
be quiet! Pure Base 501 Airflow|2024|ATX / Micro-ATX / Mini-ITX`);
cases('https://hyte.com/store/pc-cases',`
HYTE Y70 Touch Infinite|2024|E-ATX / ATX / Micro-ATX / Mini-ITX
HYTE Y70|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
HYTE Y60|2022|E-ATX / ATX / Micro-ATX / Mini-ITX
HYTE Y40|2023|ATX / Micro-ATX / Mini-ITX
HYTE Revolt 3|2021|Mini-ITX`);
cases('https://thermaltakeusa.com/collections/chassis',`
Thermaltake The Tower 900|2016|E-ATX / ATX / Micro-ATX / Mini-ITX
Thermaltake The Tower 600|2024|ATX / Micro-ATX / Mini-ITX
Thermaltake The Tower 300|2024|Micro-ATX / Mini-ITX
Thermaltake CTE C750 Air|2023|E-ATX / ATX / Micro-ATX / Mini-ITX
Thermaltake Core P8 TG|2020|E-ATX / ATX / Micro-ATX / Mini-ITX
Thermaltake View 380 TG ARGB|2024|ATX / Micro-ATX / Mini-ITX
Thermaltake S100 TG|2020|Micro-ATX / Mini-ITX
Thermaltake Core V1|2014|Mini-ITX`);
add('board','https://www.supermicro.com/QuickRefs/motherboard/X13/QRG-2509.pdf','Supermicro X13DEI-T',2023,'LGA4677 · DDR5 · E-ATX','Dual-socket Xeon Scalable motherboard',{'DIMM slots':16,'M.2 slots':2,'SATA ports':8,'Max RAM':4096,'CPU sockets':2,'Multi CPU support':1,'CPU family':'4th Gen Xeon Scalable','PCIe x16 slots':4,'Usable GPU slots':4,'Expansion slots':8,'CPU matching rule':'Same processor model recommended'});
add('cpu','https://www.intel.com/content/www/us/en/products/sku/231737/intel-xeon-gold-6430-processor-60m-cache-2-10-ghz/specifications.html','Intel Xeon Gold 6430',2023,'Sapphire Rapids · LGA4677','32 cores / 64 threads · 2S capable',{'CPU cores':32,'CPU threads':64,'Base clock':2.1,'Boost clock':3.4,'L3 cache':60,'CPU TDP':270,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
const serverCpu=(source,name,year,architecture,summary,specs)=>add('cpu',source,name,year,architecture,summary,specs);
serverCpu('https://www.intel.com/content/www/us/en/products/sku/231733/intel-xeon-gold-6454s-processor-60m-cache-2-20-ghz/specifications.html','Intel Xeon Gold 6454S',2023,'Sapphire Rapids · LGA4677','32 cores / 64 threads · 2S capable',{'CPU cores':32,'CPU threads':64,'Base clock':2.2,'Boost clock':3.4,'L3 cache':60,'CPU TDP':270,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
serverCpu('https://www.intel.com/content/www/us/en/ark/products/series/228622/4th-gen-intel-xeon-scalable-processors.html','Intel Xeon Gold 6448Y',2023,'Sapphire Rapids · LGA4677','32 cores / 64 threads · 2S capable',{'CPU cores':32,'CPU threads':64,'Base clock':2.1,'Boost clock':4.1,'L3 cache':60,'CPU TDP':225,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
serverCpu('https://www.intel.com/content/www/us/en/products/sku/231735/intel-xeon-platinum-8468-processor-105m-cache-2-10-ghz/specifications.html','Intel Xeon Platinum 8468',2023,'Sapphire Rapids · LGA4677','48 cores / 96 threads · multi-socket capable',{'CPU cores':48,'CPU threads':96,'Base clock':2.1,'Boost clock':3.8,'L3 cache':105,'CPU TDP':350,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
serverCpu('https://www.intel.com/content/www/us/en/ark/products/series/228622/4th-gen-intel-xeon-scalable-processors.html','Intel Xeon Platinum 8470',2023,'Sapphire Rapids · LGA4677','52 cores / 104 threads · multi-socket capable',{'CPU cores':52,'CPU threads':104,'Base clock':2,'Boost clock':3.8,'L3 cache':105,'CPU TDP':350,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
serverCpu('https://www.intel.com/content/www/us/en/products/sku/231746/intel-xeon-platinum-8480-processor-105m-cache-2-00-ghz/specifications.html','Intel Xeon Platinum 8480+',2023,'Sapphire Rapids · LGA4677','56 cores / 112 threads · multi-socket capable',{'CPU cores':56,'CPU threads':112,'Base clock':2,'Boost clock':3.8,'L3 cache':105,'CPU TDP':350,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
serverCpu('https://www.intel.com/content/www/us/en/ark/products/series/228622/4th-gen-intel-xeon-scalable-processors.html','Intel Xeon Platinum 8490H',2023,'Sapphire Rapids · LGA4677','60 cores / 120 threads · multi-socket capable',{'CPU cores':60,'CPU threads':120,'Base clock':1.9,'Boost clock':3.5,'L3 cache':112.5,'CPU TDP':350,'Scalable sockets':2,'CPU family':'4th Gen Xeon Scalable'});
serverCpu('https://www.amd.com/en/products/processors/server/epyc/4th-generation-9004-and-8004-series/amd-epyc-9754.html','AMD EPYC 9754',2023,'Zen 4c · SP5','128 cores / 256 threads · 1P / 2P',{'CPU cores':128,'CPU threads':256,'Base clock':2.25,'Boost clock':3.1,'L3 cache':256,'CPU TDP':360,'Scalable sockets':2,'CPU family':'AMD EPYC 9004'});
serverCpu('https://www.amd.com/en/products/processors/server/epyc/4th-generation-9004-and-8004-series.html','AMD EPYC 9734',2023,'Zen 4c · SP5','112 cores / 224 threads · 1P / 2P',{'CPU cores':112,'CPU threads':224,'Base clock':2.2,'Boost clock':3,'L3 cache':256,'CPU TDP':340,'Scalable sockets':2,'CPU family':'AMD EPYC 9004'});
serverCpu('https://www.amd.com/en/products/processors/server/epyc/4th-generation-9004-and-8004-series/amd-epyc-9654.html','AMD EPYC 9654',2022,'Zen 4 · SP5','96 cores / 192 threads · 1P / 2P',{'CPU cores':96,'CPU threads':192,'Base clock':2.4,'Boost clock':3.7,'L3 cache':384,'CPU TDP':360,'Scalable sockets':2,'CPU family':'AMD EPYC 9004'});
serverCpu('https://www.amd.com/en/products/processors/server/epyc/4th-generation-9004-and-8004-series.html','AMD EPYC 9634',2022,'Zen 4 · SP5','84 cores / 168 threads · 1P / 2P',{'CPU cores':84,'CPU threads':168,'Base clock':2.25,'Boost clock':3.7,'L3 cache':384,'CPU TDP':290,'Scalable sockets':2,'CPU family':'AMD EPYC 9004'});
serverCpu('https://www.amd.com/content/dam/amd/en/documents/products/epyc/epyc-9004-series-processors-data-sheet.pdf','AMD EPYC 9554',2022,'Zen 4 · SP5','64 cores / 128 threads · 1P / 2P',{'CPU cores':64,'CPU threads':128,'Base clock':3.1,'Boost clock':3.75,'L3 cache':256,'CPU TDP':360,'Scalable sockets':2,'CPU family':'AMD EPYC 9004'});
serverCpu('https://www.amd.com/content/dam/amd/en/documents/products/epyc/epyc-9004-series-processors-data-sheet.pdf','AMD EPYC 9454',2022,'Zen 4 · SP5','48 cores / 96 threads · 1P / 2P',{'CPU cores':48,'CPU threads':96,'Base clock':2.75,'Boost clock':3.8,'L3 cache':256,'CPU TDP':290,'Scalable sockets':2,'CPU family':'AMD EPYC 9004'});
add('board','https://www.gigabyte.com/Enterprise/Server-Motherboard/MZ73-LM0-rev-2x','GIGABYTE MZ73-LM0',2024,'SP5 · DDR5 · E-ATX','Dual-socket AMD EPYC 9004/9005 server motherboard',{'DIMM slots':24,'M.2 slots':1,'SATA ports':20,'Max RAM':6144,'CPU sockets':2,'Multi CPU support':1,'CPU family':'AMD EPYC 9004','PCIe x16 slots':4,'Usable GPU slots':4,'Expansion slots':8,'CPU matching rule':'Matching processor models are required for this indexed configuration'});
add('board','https://www.supermicro.com/en/products/motherboard/h13dsh','Supermicro H13DSH',2024,'SP5 · DDR5 · Proprietary','Dual-socket AMD EPYC 9004/9005 server motherboard',{'DIMM slots':24,'M.2 slots':2,'SATA ports':32,'Max RAM':6144,'CPU sockets':2,'Multi CPU support':1,'CPU family':'AMD EPYC 9004','PCIe x16 slots':2,'Usable GPU slots':2,'Expansion slots':4,'CPU matching rule':'Matching processor models are required for this indexed configuration'});
add('board','https://www.asus.com/us/motherboards-components/motherboards/workstation/pro-ws-wrx90e-sage-se/techspec/','ASUS Pro WS WRX90E-SAGE SE',2023,'sTR5 · DDR5 · E-ATX','Single-socket workstation motherboard',{'DIMM slots':8,'M.2 slots':4,'SATA ports':4,'Max RAM':2048,'CPU sockets':1,'Multi CPU support':0,'CPU family':'Threadripper Pro 7000/9000 WX','PCIe x16 slots':7,'Usable GPU slots':7,'Expansion slots':7});
add('case','https://www.supermicro.com/en/products/chassis/4U','Supermicro 4U Workstation Chassis',2023,'E-ATX / ATX / Micro-ATX','4U chassis with eight expansion positions',{'Expansion slots':8,'3.5-inch bays':8,'2.5-inch bays':2});
add('psu','https://www.supermicro.com/en/products/power-supplies','Supermicro 1600W Redundant Power Supply',2023,'Server redundant power supply','1600 W redundant power system',{'Rated output':1600});
window.PCP_COMPONENTS=rows;
})();
