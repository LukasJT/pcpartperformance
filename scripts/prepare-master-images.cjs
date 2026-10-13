'use strict';
const fs=require('node:fs'),path=require('node:path');
const sharp=require('sharp');
const {candidates}=require('./master-publication.cjs');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lines(text,max=36){const rows=[''];for(const w of text.split(/\s+/)){const i=rows.length-1;if(rows[i]&&(rows[i]+' '+w).length>max)rows.push(w);else rows[i]+=(rows[i]?' ':'')+w;}return rows;}
async function main(){
 const target=path.resolve(__dirname,'../data/editorial-master/assets');fs.mkdirSync(target,{recursive:true});
 for(const a of candidates().articles){
  const title=lines(a.title,48),steps=a.sections.slice(0,3);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#101a28"/><path d="M64 58h1072" stroke="#45617e"/><text x="64" y="102" fill="#9bb9dd" font-family="Arial" font-size="24">PC PART PERFORMANCE · DECISION GUIDE</text>${title.map((t,i)=>'<text x="64" y="'+(166+i*48)+'" fill="#f0f5fd" font-family="Arial" font-weight="700" font-size="38">'+esc(t)+'</text>').join('')}<path d="M240 395h730" stroke="#81aff0" stroke-width="3"/>${steps.map((s,i)=>{const x=64+i*366;return'<rect x="'+x+'" y="326" width="340" height="224" rx="16" fill="#1c2c41" stroke="#45617e"/><circle cx="'+(x+36)+'" cy="367" r="18" fill="#81aff0"/><text x="'+(x+30)+'" y="373" fill="#101a28" font-family="Arial" font-size="19" font-weight="700">'+(i+1)+'</text>'+lines(s.title,26).slice(0,4).map((l,k)=>'<text x="'+(x+26)+'" y="'+(418+k*28)+'" fill="#edf4ff" font-family="Arial" font-size="22">'+esc(l)+'</text>').join('');}).join('')}<text x="64" y="617" fill="#b8cbe3" font-family="Arial" font-size="22">Read the exact evidence. Compare the complete plan. Verify the unknowns.</text></svg>`;
  fs.writeFileSync(path.join(target,a.id+'.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(target,a.id+'.png'));
 }
 console.log('Prepared '+candidates().articles.length+' original 1200 × 675 decision diagrams.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
