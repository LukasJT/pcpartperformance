'use strict';

// Original schematic artwork. No manufacturer artwork or photographs imported.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { articles } = require('./evolution-editorial-data.cjs');
const root = path.resolve(__dirname, '..');
const palette = { ink:'#152c45', muted:'#47627e', blue:'#215edb', teal:'#007c87', amber:'#9c5405', line:'#a9c0d9', light:'#edf4fd', white:'#ffffff', red:'#ad334b' };
const e = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function lines(value, max = 24) {
  const out = []; let current = '';
  for(const word of String(value).split(/\s+/)) {
    if(current && current.length + word.length + 1 > max) { out.push(current); current=word; }
    else current += (current?' ':'') + word;
  }
  if(current)out.push(current);
  return out;
}
function text(x,y,value,{size=23,fill=palette.ink,anchor='start',weight=500,max=25,line=29}={}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${lines(value,max).map((t,i)=>`<tspan x="${x}" dy="${i?line:0}">${e(t)}</tspan>`).join('')}</text>`;
}
const rect=(x,y,w,h,{fill=palette.white,stroke=palette.line,rx=16,dash=''}={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const line=(x1,y1,x2,y2,color=palette.blue,width=4,dash='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const arrow=(x1,y1,x2,y2,color=palette.blue)=>`${line(x1,y1,x2,y2,color)}<path d="M${x2-9} ${y2-7}L${x2} ${y2}L${x2-9} ${y2+7}" fill="none" stroke="${color}" stroke-width="4"/>`;
const circle=(x,y,r,fill=palette.light,stroke=palette.blue)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
function block(x,y,w,h,label,note='',color=palette.blue){
  return rect(x,y,w,h)+`<rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="${color}"/>`+text(x+20,y+39,label,{size:24,weight:650,max:Math.floor((w-40)/13)})+(note?text(x+20,y+h-30,note,{size:19,fill:palette.muted,max:Math.floor((w-40)/10),line:24}):'');
}
function genericFlow(v, vertical=false) {
  let s=''; const n=v.labels.length;
  if(vertical || n>3) {
    const width=390,height=124;
    v.labels.forEach((label,i)=>{const x=55+(i%2)*460,y=132+Math.floor(i/2)*150;s+=block(x,y,width,height,label,v.notes[i]||'');if(i%2===0&&i+1<n)s+=arrow(x+width+10,y+56,x+450,y+56);});
  } else {
    const width=250;
    v.labels.forEach((label,i)=>{const x=45+i*310;s+=block(x,162,width,175,label,v.notes[i]||'');if(i<n-1)s+=arrow(x+width+14,246,x+294,246);});
  }
  return s;
}
function draw(v) {
  let s=''; const k=v.kind;
  if(k==='lanes'||k==='vram') {
    const n=v.labels.length,h=n===4?61:79;
    v.labels.forEach((label,i)=>{const y=126+i*(h+13);s+=rect(48,y,864,h,{fill:i%2?palette.white:palette.light});s+=`<circle cx="77" cy="${y+h/2}" r="9" fill="${i%2?palette.teal:palette.blue}"/>`;s+=text(102,y+h/2+8,label,{size:24,weight:650,max:32});s+=text(904,y+h/2+7,v.notes[i]||'',{size:21,fill:palette.muted,anchor:'end',max:31});});
  } else if(k==='connector') {
    s+=genericFlow(v);
  } else if(k==='signal') {
    s+=text(48,145,'DC control',{size:27,weight:650});s+=text(48,268,'PWM control',{size:27,weight:650});
    s+=`<path d="M255 179 L330 179 L330 157 L405 157 L405 135 L480 135 L480 113 L555 113" fill="none" stroke="${palette.blue}" stroke-width="5"/>`;
    s+=`<path d="M255 300 L280 300 L280 246 L310 246 L310 300 L370 300 L370 246 L430 246 L430 300 L460 300 L460 246 L550 246 L550 300" fill="none" stroke="${palette.teal}" stroke-width="5"/>`;
    s+=block(625,150,280,174,'Fan response','Observe actual RPM');s+=arrow(570,189,615,219);s+=arrow(570,271,615,250,palette.teal);
    s+=text(48,370,'Conceptual signals; not a wiring or calibration diagram',{size:23,max:65});
  } else if(k==='rgb') {
    ['5 V addressable','12 V RGB'].forEach((label,i)=>{const x=55+i*460;s+=rect(x,140,390,226);s+=text(x+195,184,label,{anchor:'middle',weight:700,size:28,max:24});for(let p=0;p<4;p++){if(i===0&&p===2){s+=text(x+55+p*70,265,'gap',{size:21,anchor:'middle',fill:palette.muted});continue;}s+=circle(x+55+p*70,245,18,palette.light,i?palette.amber:palette.blue);}s+=text(x+195,326,i?'Four-position example':'Three contacts + key gap',{anchor:'middle',size:22,max:29});});
    s+=text(480,414,'Identification only — use the exact manual for wiring',{anchor:'middle',size:25,fill:palette.red,max:62});
  } else if(k==='quadrants') {
    v.labels.forEach((label,i)=>{const x=55+(i%2)*460,y=130+Math.floor(i/2)*150;s+=block(x,y,390,118,label,v.notes[i]);s+=circle(x+342,y+57,18,palette.light,i<2?palette.blue:palette.teal);});
  } else if(k==='dimensions') {
    // Side profiles use one scale for length AND 63.5 mm height.
    v.values.forEach((n,i)=>{const x=65+i*440,y=178,w=n*3,h=63.5*3;s+=rect(x,y,w,h,{fill:i?palette.light:palette.white});for(let f=0;f<8;f++)s+=line(x+18,y+18+f*21,x+w-18,y+18+f*21,palette.line,2);s+=text(x,y-32,v.labels[i],{max:29,size:26,weight:650});s+=line(x,y+h+23,x+w,y+h+23,palette.blue,3);s+=line(x,y+h+14,x,y+h+32,palette.blue,3);s+=line(x+w,y+h+14,x+w,y+h+32,palette.blue,3);});
  } else if(k==='clearance') {
    s+=rect(70,190,570,130,{fill:palette.light});s+=text(280,260,'GPU body',{anchor:'middle',weight:650,size:30});s+=circle(160,254,40,palette.white);s+=circle(400,254,40,palette.white);s+=rect(608,211,75,84,{fill:palette.white,stroke:palette.blue});s+=`<path d="M683 250C745 250 740 345 815 345" fill="none" stroke="${palette.teal}" stroke-width="13"/>`;s+=line(870,130,870,390,palette.red,5,'10 8');s+=text(680,156,'Connector + cable',{anchor:'middle',size:24});s+=text(848,422,'Panel boundary',{anchor:'end',size:25,fill:palette.red});s+=text(70,375,'Do not force the panel against the cable',{size:25,max:46});
  } else if(k==='memory') {
    ['A','B'].forEach((channel,c)=>{const x=80+c*440;s+=rect(x,130,360,250,{fill:palette.light});s+=text(x+180,171,`Channel ${channel}`,{anchor:'middle',size:29,weight:700});for(let d=0;d<2;d++){s+=rect(x+50+d*150,200,110,136);s+=text(x+105+d*150,276,`${channel}${d+1}`,{anchor:'middle',size:30,weight:700});s+=line(x+61+d*150,316,x+147+d*150,316,palette.teal,7);}});s+=text(480,418,'Conceptual grouping, not universal slot order',{anchor:'middle',size:25,max:55});
  } else if(k==='capacity') {
    v.values.forEach((value,i)=>{const y=141+i*89;s+=text(50,y+23,v.labels[i],{size:24,weight:650,max:24});s+=rect(390,y-4,value*4.8,42,{fill:i===2?palette.light:palette.blue,stroke:palette.blue,rx:9});});s+=text(480,423,'Same total ≠ same supported arrangement',{anchor:'middle',size:26,max:54});
  } else if(k==='m2') {
    // Both axes are 3 px/mm: 22 mm board width and the documented length.
    v.values.forEach((length,i)=>{const x=65+i*172,y=127,w=22*3,h=length*3;s+=text(x+w/2,105,v.labels[i],{size:24,weight:650,anchor:'middle'});s+=rect(x,y,w,h,{fill:palette.light,stroke:palette.teal,rx:6});s+=circle(x+w/2,y+h-12,5,palette.white,palette.teal);s+=line(x+9,y,x+w-9,y,palette.amber,6);s+=line(x+w+18,y,x+w+18,y+h,palette.line,2);s+=text(x+w+18,y+h+25,`${length} mm`,{size:20,anchor:'middle'});});
  } else if(k==='tracks') {
    v.labels.forEach((label,i)=>{const y=145+i*90;s+=text(48,y,label,{size:24,weight:650,max:27});s+=line(380,y-7,900,y-7,palette.line,3);for(let p=0;p<6;p++)s+=circle(398+p*92,y-7,i===1?7:5,i===1?palette.teal:palette.blue,i===1?palette.teal:palette.blue);});
    s+=line(670,125,670,358,palette.amber,2,'8 8');s+=text(480,420,'Aligned observations help test a hypothesis',{anchor:'middle',size:25,max:58});
  } else if(k==='ecc') {
    s+=rect(50,155,300,200,{fill:palette.light});s+=text(200,196,'DRAM chip',{anchor:'middle',size:28,weight:700});s+=rect(89,222,222,90,{stroke:palette.teal});s+=text(200,257,'On-die ECC',{anchor:'middle',size:25,weight:650});s+=text(200,291,'Inside this boundary',{anchor:'middle',size:19});s+=arrow(370,253,610,253);s+=block(630,155,280,200,'CPU + board','System ECC support');s+=text(490,321,'External path',{anchor:'middle',size:23});s+=text(480,415,'On-die ECC alone does not protect this whole path',{anchor:'middle',size:25,max:61});
  } else if(k==='timing') {
    const tracks=[[0,90,170,290,360,470],[0,80,160,240,320,400,480],[0,90,170,290,360,470]];
    v.labels.forEach((label,i)=>{const y=153+i*90;s+=text(50,y+6,label,{size:24,weight:650,max:20});s+=line(350,y,895,y,palette.line,3);for(const offset of tracks[i])s+=line(370+offset,y-22,370+offset,y+22,i===2?palette.teal:palette.blue,5);});
  } else if(k==='frame') {
    s+=line(90,355,900,355,palette.line,3);s+=line(90,135,90,355,palette.line,3);
    v.values.forEach((value,i)=>{const h=value*5;s+=rect(115+i*75,355-h,45,h,{fill:value>20?palette.amber:palette.blue,stroke:value>20?palette.amber:palette.blue,rx:4});});
    s+=text(90,125,'Longer interval',{size:25,fill:palette.amber});s+=text(480,408,'Constructed frame sequence — not measured hardware',{anchor:'middle',size:25,max:62});
  } else if(k==='monitors') {
    s+=block(55,219,220,106,'GPU','Exact output list');
    v.labels.slice(1).forEach((label,i)=>{const x=430+i*160;s+=rect(x,151+i*53,135,82,{fill:palette.light});s+=text(x+67,181+i*53,label,{anchor:'middle',size:22,max:10});s+=line(x+67,234+i*53,x+67,255+i*53,palette.muted,3);s+=line(x+35,255+i*53,x+100,255+i*53,palette.muted,3);s+=`<path d="M285 268L340 268L340 ${192+i*53}L${x} ${192+i*53}" fill="none" stroke="${i%2?palette.teal:palette.blue}" stroke-width="3"/>`;});
    s+=text(480,424,'Verify the combination, not just individual ports',{anchor:'middle',size:25,max:62});
  } else if(k==='media') {
    s+=genericFlow(v,true);
    s+=line(250,256,250,282,palette.teal,3,'6 5');s+=line(710,256,710,282,palette.teal,3,'6 5');
  } else if(k==='airflow') {
    s+=rect(230,120,530,280,{fill:palette.white});s+=rect(405,173,220,74,{fill:palette.light});s+=text(515,218,'CPU zone',{anchor:'middle',size:25,weight:650});s+=rect(405,278,220,54,{fill:palette.light});s+=text(515,313,'GPU zone',{anchor:'middle',size:25,weight:650});
    [190,285].forEach(y=>{s+=circle(260,y,30,palette.light,palette.teal);s+=arrow(85,y,220,y,palette.teal);s+=arrow(300,y,365,y,palette.teal);});s+=circle(730,190,29);s+=arrow(650,190,900,190);s+=text(80,360,'Intake',{size:25,fill:palette.teal});s+=text(797,270,'Exhaust',{size:25});
  } else if(k==='radiator') {
    s+=rect(140,120,670,280,{fill:palette.white});s+=rect(225,140,470,48,{fill:palette.light,stroke:palette.teal});for(let i=0;i<12;i++)s+=line(240+i*38,150,240+i*38,178,palette.teal,2);s+=circle(470,290,49,palette.light,palette.blue);s+=text(470,298,'Pump',{anchor:'middle',size:24,weight:650});s+=`<path d="M430 269C340 250 350 211 255 187M510 269C600 250 600 211 665 187" fill="none" stroke="${palette.blue}" stroke-width="8"/>`;s+=text(480,105,'Radiator high point',{anchor:'middle',size:24,weight:650});s+=text(480,445,'Conventional CPU-block pump example only',{anchor:'middle',size:25,max:58});
  } else if(k==='noise') {
    s+=rect(85,175,205,186,{fill:palette.light});s+=text(187,273,'PC',{anchor:'middle',size:35,weight:700});s+=circle(695,245,34,palette.white,palette.teal);s+=line(695,279,695,354,palette.teal,5);s+=line(654,354,736,354,palette.teal,5);s+=line(315,310,640,310,palette.blue,3,'8 6');s+=text(480,290,'Fixed position',{anchor:'middle',size:26});s+=text(695,155,'Microphone',{anchor:'middle',size:26});s+=text(480,423,'Record the room before comparing the PC',{anchor:'middle',size:26,max:59});
  } else if(k==='support') {
    s+=line(130,130,130,390,palette.muted,7);s+=rect(130,187,650,130,{fill:palette.light});s+=circle(310,250,42,palette.white);s+=circle(500,250,42,palette.white);s+=line(130,209,176,209,palette.blue,8);s+=rect(684,317,35,61,{fill:palette.teal,stroke:palette.teal,rx:5});s+=rect(650,378,105,15,{fill:palette.teal,stroke:palette.teal,rx:5});s+=text(693,149,'Approved contact',{anchor:'middle',size:25,max:25});s+=`<path d="M820 163H850V319H721" fill="none" stroke="${palette.teal}" stroke-width="3"/>`;s+=text(420,365,'Keep fans clear',{anchor:'middle',size:25});s+=text(60,425,'Primary mounting remains required',{size:25,max:53});
  } else if(k==='desk') {
    s+=`<path d="M95 395V120H860V395M95 120H860" fill="none" stroke="${palette.muted}" stroke-width="8"/>`;s+=rect(340,185,255,205,{fill:palette.light});s+=text(467,295,'PC',{anchor:'middle',size:33,weight:700});s+=arrow(145,310,325,310,palette.teal);s+=arrow(610,240,820,240,palette.blue);s+=text(150,269,'Intake',{size:25,fill:palette.teal});s+=text(650,194,'Exit route',{size:25});s+=text(480,437,'Inspect the final furniture position',{anchor:'middle',size:26,max:54});
  } else if(k==='fanstate') {
    ['Stopped','Running','Check symptoms'].forEach((label,i)=>{const x=170+i*310;s+=circle(x,220,64,palette.light,i===2?palette.amber:palette.blue);if(i<2){s+=circle(x,220,13,palette.white);for(let b=0;b<4;b++)s+=`<path d="M${x} 207C${x+48} 165 ${x+67} 228 ${x+12} 232Z" fill="${i?palette.teal:palette.line}" transform="rotate(${b*90} ${x} 220)"/>`;}else{s+=text(x,237,'?',{anchor:'middle',size:55,fill:palette.amber,weight:700});}s+=text(x,326,label,{anchor:'middle',size:26,weight:650,max:20});});s+=text(480,405,'Interpret with the exact PSU manual',{anchor:'middle',size:26,max:55});
  } else if(k==='decision') {
    s+=genericFlow(v,true);s+=line(250,256,250,282,palette.teal,3,'7 6');s+=line(710,256,710,282,palette.teal,3,'7 6');
  } else {
    s+=genericFlow(v);
  }
  return s;
}
function renderVisual(article) {
  const v=article.visual;
  const notes = ['dimensions','capacity','m2','signal','clearance','memory','tracks','ecc','frame','monitors','airflow','radiator','noise','support','desk','fanstate'].includes(v.kind) ? (v.kind==='m2'?'22 mm wide modules • Physical size does not establish interface support':(v.notes||[]).slice(0,1).join('')) : 'Original schematic • Read the exact product instructions';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" viewBox="0 0 960 520" role="img" aria-labelledby="title desc"><title id="title">${e(v.title)}</title><desc id="desc">${e(v.alt)} ${e(v.evidence)}</desc><rect width="960" height="520" rx="24" fill="#f6f9fe"/><g font-family="system-ui,Segoe UI,sans-serif">${text(45,55,v.title,{size:31,weight:750,max:58,line:36})}${draw(v)}${text(45,488,notes,{size:19,fill:palette.muted,max:88,line:23})}</g></svg>\n`;
}
function buildVisuals() {
  const manifest=[];
  for(const item of articles) {
    const filename=path.join(root,item.visual.path);
    const svg=renderVisual(item);
    fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,svg,'utf8');
    manifest.push({id:item.id,slug:item.slug,path:item.visual.path,src:item.visual.src,width:960,height:520,bytes:Buffer.byteLength(svg),sha256:crypto.createHash('sha256').update(svg).digest('hex'),original:true,kind:item.visual.kind,alt:item.visual.alt});
  }
  const directory=path.join(root,'docs/evolution-oct18/editorial');fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'visual-manifest.json'),JSON.stringify({created:'2026-10-19',count:manifest.length,rights:'Original PC Part Performance schematic SVG artwork. Source citations establish technical context; source illustrations were not copied.',visuals:manifest},null,2)+'\n');
  return manifest;
}
if(require.main===module)console.log(`Created ${buildVisuals().length} original editorial SVG diagrams.`);
module.exports={renderVisual,buildVisuals};
