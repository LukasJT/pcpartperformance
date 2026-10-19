'use strict';
const checkedAt = '2026-10-19';
const sources = {
 switch2: { publisher:'Nintendo',title:'Nintendo Switch 2 technical specifications',url:'https://www.nintendo.com/us/gaming-systems/switch-2/tech-specs/',checkedAt },
 switch: { publisher:'Nintendo',title:'Nintendo Switch technical specifications',url:'https://www.nintendo.com/us/gaming-systems/switch/tech-specs/',checkedAt },
 ps5: { publisher:'Sony Interactive Entertainment',title:'PS5: The Ultimate FAQ — launch hardware',url:'https://blog.playstation.com/2020/11/09/ps5-the-ultimate-faq/',checkedAt },
 ps5pro: { publisher:'Sony Interactive Entertainment',title:'PlayStation 5 Pro',url:'https://www.playstation.com/en-us/ps5/ps5-pro/',checkedAt },
 seriesx: { publisher:'Microsoft Xbox',title:'Xbox Series X technical specifications',url:'https://www.xbox.com/en-US/consoles/xbox-series-x',checkedAt },
 seriess: { publisher:'Microsoft Xbox',title:'Xbox Series S technical specifications',url:'https://www.xbox.com/en-US/consoles/xbox-series-s',checkedAt },
 nintendoHistory: { publisher:'Nintendo',title:'Corporate company history',url:'https://www.nintendo.co.jp/corporate/en/history/index.html',checkedAt },
 psHistory: { publisher:'Sony Interactive Entertainment',title:'PlayStation history: original PlayStation',url:'https://www.playstation.com/en-us/playstation-history/1994-ps-one/',checkedAt },
 ps2History: { publisher:'Sony Interactive Entertainment',title:'PlayStation history: PS2 and PSP',url:'https://www.playstation.com/en-us/playstation-history/2000-ps2-psp/',checkedAt },
 ps3History: { publisher:'Sony Interactive Entertainment',title:'PlayStation history: PS3 and PS Vita',url:'https://www.playstation.com/en-us/playstation-history/2007-ps3-ps-vita/',checkedAt },
 xboxHistory: { publisher:'Microsoft',title:'Xbox Erupts on the Scene — North American launch',url:'https://news.microsoft.com/source/2001/11/15/xbox-erupts-on-the-scene',checkedAt },
 segaHistory: { publisher:'SEGA',title:'SEGA corporate history',url:'https://www.sega.co.jp/en/company/history/index.html',checkedAt }
};
const fact = (label,value,source) => ({label,value,source,status:'manufacturer-specified'});
const modern = [
 {id:'switch2',name:'Nintendo Switch 2',kind:'switch2',partId:'switch2',platform:'switch2',scope:'Nintendo Switch 2 system',summary:'Handheld and TV play',facts:[fact('Processor','Custom NVIDIA processor','switch2'),fact('Storage','256 GB UFS; system software uses part of it','switch2'),fact('Built-in display','7.9-inch LCD, 1920 × 1080, HDR10','switch2'),fact('Display capability','Up to 120 Hz on the built-in screen; game support varies','switch2'),fact('TV output','Up to 4K at 60 Hz; 1080p/1440p output can support 120 Hz','switch2'),fact('Game storage expansion','microSD Express required for game storage','switch2')],unknown:['Exact CPU core configuration and clocks are not disclosed in the cited Nintendo specification.'],source:'switch2'},
 {id:'switch-hac001-01',name:'Nintendo Switch',kind:'switch',partId:null,platform:'switch',scope:'HAC-001(-01), not OLED or Lite',summary:'The revised LCD model',facts:[fact('Processor','Custom NVIDIA Tegra processor','switch'),fact('Storage','32 GB internal; some space is reserved','switch'),fact('Built-in display','6.2-inch LCD, 1280 × 720','switch'),fact('TV output','Up to 1080p through the dock','switch'),fact('Expansion','microSD, microSDHC and microSDXC','switch')],unknown:['OLED and Lite have different screens and other model-specific characteristics.'],source:'switch'},
 {id:'ps5-original',name:'PlayStation 5',kind:'ps5',partId:'ps5',platform:'ps5',scope:'Original 2020 launch hardware; not a Slim specification',summary:'Custom AMD platform',facts:[fact('CPU','8-core/16-thread AMD Zen 2','ps5'),fact('Graphics','Custom AMD RDNA 2-based graphics engine','ps5'),fact('Memory','16 GB GDDR6','ps5'),fact('CPU frequency','Variable, up to 3.5 GHz in the launch specification','ps5')],unknown:['Storage capacity and enclosure details vary by revision; this panel does not apply the launch dimensions to Slim models.'],source:'ps5'},
 {id:'ps5-pro',name:'PlayStation 5 Pro',kind:'ps5pro',partId:'ps5pro',platform:'ps5pro',scope:'PS5 Pro features disclosed on the US product page',summary:'Game-specific enhancements',facts:[fact('Storage','2 TB built-in SSD; system-reserved space applies','ps5pro'),fact('Reconstruction','PSSR on supported titles','ps5pro'),fact('Networking','Wi-Fi 7 compatible; a compatible router is needed','ps5pro')],unknown:['This source does not establish a desktop-equivalent GPU, exact CPU clocks or a universal FPS result.'],source:'ps5pro'},
 {id:'series-x-1tb',name:'Xbox Series X',kind:'seriesx',partId:'seriesx',platform:'series-x',scope:'1 TB Carbon Black model',summary:'Disc-equipped Series X',facts:[fact('CPU','8-core custom AMD Zen 2','seriesx'),fact('Graphics','52 compute units, custom AMD RDNA 2','seriesx'),fact('Memory','16 GB GDDR6','seriesx'),fact('Storage','1 TB custom NVMe SSD','seriesx'),fact('Disc drive','4K UHD Blu-ray','seriesx')],unknown:['The 1 TB Digital Edition and 2 TB Galaxy Black are separate variants. The output specification does not establish game FPS.'],source:'seriesx'},
 {id:'series-s',name:'Xbox Series S',kind:'seriess',partId:'seriess',platform:'series-s',scope:'Series S family; verify the exact storage variant',summary:'All-digital Xbox',facts:[fact('CPU architecture','8-core custom AMD Zen 2','seriess'),fact('Graphics','20 compute units, custom AMD RDNA 2','seriess'),fact('Memory','10 GB GDDR6','seriess'),fact('Storage variants','512 GB or 1 TB custom NVMe SSD','seriess'),fact('Disc drive','No optical disc drive','seriess')],unknown:['The current product page has a CPU-clock entry that warrants comparison with model-specific launch documentation; no clock value is promoted here.'],source:'seriess'}
];
const historical = [
 ['famicom','Family Computer / Famicom',1983,'Nintendo corporate timeline','x-console-nintendo-entertainment-system','nes','nintendoHistory','Known as the NES outside Japan; regional launch dates differ.'],
 ['gameboy','Game Boy',1989,'Nintendo corporate timeline','x-console-game-boy','gameboy','nintendoHistory','Nintendo’s original Game Boy launch year.'],
 ['super-famicom','Super Famicom',1990,'Nintendo corporate timeline','x-console-super-nintendo-entertainment-system','snes','nintendoHistory','The SNES name and launch year differ by region.'],
 ['playstation','PlayStation',1994,'Japan; North America followed in 1995','x-console-playstation','ps1','psHistory','R3000 CPU and CD-ROM game media are described by Sony.'],
 ['n64','Nintendo 64',1996,'Nintendo corporate timeline','x-console-nintendo-64','n64','nintendoHistory','A hardware-history year, not a claim that every region launched together.'],
 ['dreamcast','Dreamcast',1998,'SEGA corporate timeline','x-console-sega-dreamcast','disc','segaHistory','SEGA’s history records the platform’s 1998 release.'],
 ['ps2','PlayStation 2',2000,'Japan; March 4, 2000','ps2','ps2','ps2History','Sony identifies the Emotion Engine CPU and DVD media.'],
 ['gamecube','Nintendo GameCube',2001,'Nintendo corporate timeline','x-console-nintendo-gamecube','cube','nintendoHistory','Linked to the existing hardware record.'],
 ['gba','Game Boy Advance',2001,'Nintendo corporate timeline','x-console-game-boy-advance','handheld','nintendoHistory','A distinct platform from the original Game Boy.'],
 ['xbox','Xbox',2001,'North America; November 15, 2001','xboxoriginal','xbox','xboxHistory','The original Xbox launch, not the Xbox One or Series family.'],
 ['ds','Nintendo DS',2004,'Nintendo corporate timeline','x-console-nintendo-ds','ds','nintendoHistory','The original DS, not DSi or 3DS.'],
 ['psp','PlayStation Portable',2004,'Japan; North America followed in 2005','x-console-psp-1000','handheld','ps2History','Sony documents the UMD format. Exact regional days are not normalized here.'],
 ['wii','Wii',2006,'Nintendo corporate timeline','wii','wii','nintendoHistory','Original Wii platform; this does not establish Wii U game support.'],
 ['ps3','PlayStation 3',2006,'Japan and North America; Europe followed in 2007','ps3','ps3','ps3History','Sony’s history distinguishes the regional launch years.'],
 ['3ds','Nintendo 3DS',2011,'Nintendo corporate timeline','x-console-nintendo-3ds','ds','nintendoHistory','A distinct platform from DS and DSi.'],
 ['wiiu','Wii U',2012,'Nintendo corporate timeline','wiiu','wiiu','nintendoHistory','Game editions and controller requirements need their own documentation.']
].map(([id,name,year,region,partId,kind,source,note])=>({id,name,year,region,partId,kind,source,note,evidenceType:'manufacturer-history',datePrecision:'year'}));
module.exports={checkedAt,sources,modern,historical};
