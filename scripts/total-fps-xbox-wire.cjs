'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),file=path.join(root,'data/total-console-releases.json');
const sources=[
 'https://news.xbox.com/en-us/2026/06/05/next-week-on-xbox-new-games-for-june-8-to-12/',
 'https://news.xbox.com/en-us/2026/06/12/next-week-on-xbox-new-games-for-june-15-to-19/',
 'https://news.xbox.com/en-us/2026/06/19/next-week-on-xbox-new-games-for-june-22-to-26/',
 'https://news.xbox.com/en-us/2026/07/03/next-week-on-xbox-new-games-for-july-6-to-10/',
 'https://news.xbox.com/en-us/2026/07/31/next-week-on-xbox-new-games-for-august-3-to-7/',
 'https://news.xbox.com/en-us/2026/08/14/next-week-on-xbox-new-games-for-august-17-to-21/',
 'https://news.xbox.com/en-us/2026/08/21/next-week-on-xbox-new-games-for-august-24-to-28/'
];
const clean=require('./total-fps-platforms.cjs').text;
const normalize=s=>clean(s).replace(/[™®©]/g,'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g,'');
function parse(html,sourceUrl,verifiedAt){
 if(!/^https:\/\/news\.xbox\.com\/en-us\/\d{4}\/\d{2}\/\d{2}\/next-week-on-xbox-[^/]+\/$/.test(sourceUrl))throw Error('Unapproved announcement source');
 const publishedAt=html.match(/property="article:published_time"\s+content="([^"]+)"/)?.[1];
 if(!publishedAt||!Number.isFinite(Date.parse(publishedAt))||Date.parse(publishedAt)>Date.parse(verifiedAt))throw Error('Missing or future publication date');
 const year=sourceUrl.match(/\/en-us\/(\d{4})\//)[1],rows=[];
 for(const match of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)){
  const paragraph=match[1];if(!/Optimized for (?:Xbox|XBOX) Series X\|S/.test(clean(paragraph)))continue;
  const link=paragraph.match(/<a\b[^>]*href="(https:\/\/www\.xbox\.com\/en-[uU][sS]\/games\/store\/[^"?#]+\/([A-Z\d]{12}))"[^>]*>([\s\S]*?)<\/a>/);if(!link)continue;
  const label=clean(link[3]),parts=label.match(/^(.*?)\s+[–—-]\s+([A-Za-z]+\s+\d{1,2})$/);if(!parts)continue;
  const name=parts[1].trim();if(!name||/\b(?:DLC|bundle|upgrade|season pass|premium|deluxe|ultimate|vault|pre-order|demo)\b/i.test(name))continue;
  const announced=new Date(parts[2]+' '+year+' 00:00:00 GMT');if(!Number.isFinite(announced.getTime()))continue;
  const productId=link[2],statement=clean(paragraph).slice(label.length).trim();
  rows.push({id:'xbox-'+productId.toLowerCase(),canonicalGameId:'game-'+normalize(name),productId,name,platform:'xbox-series',system:'Xbox Series X / Series S',family:'xbox',edition:name,publisher:null,developer:null,releaseDate:announced.toISOString().slice(0,10),releaseDateText:parts[2]+' '+year,releaseDateStatus:'announced-not-confirmed',sourceUrl:'https://www.xbox.com/en-US/games/store/-/'+productId,storeSourceUrl:link[1],metadataSourceUrl:sourceUrl,sourcePublishedAt:publishedAt,platformStatement:statement,verifiedAt,evidenceType:'official-platform-release-announcement',evidenceHash:crypto.createHash('sha256').update(JSON.stringify({name,productId,label,statement,publishedAt})).digest('hex'),sourceScope:'Xbox Wire explicitly announced this exact linked store SKU as Optimized for Xbox Series X|S. The listed date is an announcement and may have changed; current availability, subscription inclusion, separate console FPS and artwork rights are not inferred.',performanceStatus:'not-verified',artworkStatus:'original-category-illustration'});
 }
 return rows;
}
async function fetchOfficial(){
 const current=JSON.parse(fs.readFileSync(file,'utf8')),baseline={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/game-library.js'),'utf8'),baseline);
 const names=new Set([...baseline.window.consolePerformanceGames.filter(r=>r.family==='xbox').map(r=>normalize(r.game)),...current.records.filter(r=>r.platform==='xbox-series').map(r=>normalize(r.name))]),ids=new Set(current.records.map(r=>r.id));
 const known=new Map([...baseline.window.performanceGames,...require('./total-fps-games.cjs').profiles()].map(r=>[normalize(r.name),r.canonicalGameId||r.id])),accepted=[],rejected=[],observed=[];
 for(const url of sources){
  const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok){rejected.push({url,reason:'HTTP '+response.status});continue;}
  const verifiedAt=new Date().toISOString(),rows=parse(await response.text(),url,verifiedAt);observed.push({url,verifiedAt,candidateRecords:rows.length});
  for(const r of rows){if(ids.has(r.id)||names.has(normalize(r.name))){rejected.push({id:r.id,name:r.name,reason:'already-indexed-exact-SKU-or-game-family'});continue;}
   const errors=require('./total-fps-platforms.cjs').validate(r);if(errors.length){rejected.push({id:r.id,reason:errors.join('; ')});continue;}
   r.canonicalGameId=known.get(normalize(r.name))||r.canonicalGameId;accepted.push(r);ids.add(r.id);names.add(normalize(r.name));
  }
  if(current.records.filter(r=>r.platform==='xbox-series').length+accepted.length>=100)break;
 }
 current.records.push(...accepted);current.generatedAt=new Date().toISOString();fs.writeFileSync(file,JSON.stringify(current,null,2)+'\n');
 const report={checkedAt:current.generatedAt,observed,accepted:accepted.length,xboxTotal:current.records.filter(r=>r.platform==='xbox-series').length,rejected,scope:'Exact game-specific store SKU plus explicit optimized Series X|S statement in the same Xbox Wire announcement paragraph. Announcement dates are retained as announcements, not proof of current release or availability. No descriptions, images, prices or FPS imported.'};fs.writeFileSync(path.join(root,'docs/total-refinement/games/xbox-wire-import-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
if(require.main===module&&process.argv.includes('--fetch'))fetchOfficial().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={parse,sources,fetchOfficial};
