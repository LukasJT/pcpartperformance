const fs=require('fs'),path=require('path');let research={};for(let i=1;i<=7;i++)Object.assign(research,JSON.parse(fs.readFileSync(path.join(__dirname,'board-extra-research-'+i+'.json'))));
const file=path.join(__dirname,'board-extra-candidates.json'),c=JSON.parse(fs.readFileSync(file));
const picks={
'x-board-asus-maximus-viii-hero':[3],
'x-board-asus-rog-maximus-x-hero':[1],
'x-board-asus-rog-maximus-xii-hero':[6],
'x-board-gigabyte-ga-z68x-ud3h-b3':[10],
'x-board-gigabyte-ga-z170x-gaming-7':[5],
'x-board-gigabyte-x299-aorus-gaming-9':[2],
'c-board-gigabyte-x870-aorus-elite-wifi7':[2],
'c-board-gigabyte-b650-aorus-elite-ax':[6,'b650aorus'],
'c-board-gigabyte-b760m-ds3h-ddr4':[1],
'c-board-gigabyte-mz73-lm0':[9]
};
for(const[id,[index,other]]of Object.entries(picks)){let h=research[other||id].hits[index];c[id]={...c[id],...h,index,attribution:research[id].record.brand+' product media via '+new URL(h.sourceUrl).hostname,official:h.sourceUrl.includes('asus.com/')};}
c['x-board-asus-rog-maximus-xii-hero'].picturedModel='ASUS ROG Maximus XII Hero (Wi-Fi)';
c['c-board-gigabyte-mz73-lm0'].picturedModel='GIGABYTE MZ73-LM0 (rev. 2.0)';
delete c.b650aorus;
fs.writeFileSync(file,JSON.stringify(c,null,2));
