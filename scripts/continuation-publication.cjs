'use strict';
// Explicit owner publication instructions are distinct from personal review attestations.
// Release authorization permits a build; only observed production pages confirm deployment.
const fs=require('node:fs'),path=require('node:path');
const gate=require('./program-editorial-review.cjs');
const {articles,sources}=require('./continuation-editorial-content.cjs');
const DOMAIN='https://www.pcpartperformance.com';
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8'));
const day=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\d$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const instant=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,19)===s.slice(0,19);
const torontoDay=time=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
function resolve(registry=read('continuation-editorial-publications.json'),{authorization=read('continuation-editorial-owner-authorization.json'),now=Date.now()}={}){
  if(registry?.schemaVersion!==2||!Array.isArray(registry.publications))throw Error('Owner release registry schema 2 is required');
  if(authorization?.schemaVersion!==1||authorization.origin!=='direct_owner_instruction'||authorization.humanReviewClaimed!==false||!authorization.statement?.trim()||!instant(authorization.recordedAt)||Date.parse(authorization.recordedAt)>now||!Array.isArray(authorization.articles))throw Error('Missing explicit, truthful owner publication authorization');
  const byline=authorization.byline;
  if(byline?.type!=='organization'||byline.name!=='PC Part Performance'||!byline.attribution?.includes('AI'))throw Error('Missing the owner-selected organization author and assistance disclosure');
  const approvals=new Map();
  for(const item of authorization.articles){
    const article=articles.find(a=>a.id===item.articleId),fingerprint=article&&gate.contentFingerprint(article,sources);
    if(!article||approvals.has(item.articleId)||item.contentHash!==fingerprint.contentHash||item.contentVersion!==fingerprint.contentVersion)throw Error('Unknown, duplicate or changed authorized article');
    approvals.set(item.articleId,item);
  }
  const seen=new Set();
  return registry.publications.map(p=>{
    const article=articles.find(a=>a.id===p.articleId),approval=approvals.get(p.articleId);
    if(!article||!approval||seen.has(p.articleId)||p.contentHash!==approval.contentHash)throw Error('Publication is not authorized for this exact article version');
    seen.add(p.articleId);
    if(!day(p.releaseDate)||p.releaseDate<article.evidenceDate||p.releaseDate<torontoDay(authorization.recordedAt)||p.releaseDate>torontoDay(now))throw Error('Invalid release calendar date');
    if(!['release_authorized','published'].includes(p.status))throw Error('Invalid publication state');
    if(p.status==='release_authorized'){
      if(p.confirmedDeployment!==false||p.deploymentEvidence!=null||p.datePublished!=null||p.dateModified!=null)throw Error('An authorized build cannot claim observed publication');
    }else{
      const evidence=p.deploymentEvidence;
      if(p.confirmedDeployment!==true||!instant(p.datePublished)||Date.parse(p.datePublished)>now||torontoDay(p.datePublished)!==p.releaseDate||evidence?.url!==DOMAIN+article.route||evidence.access!=='inspected'||!instant(evidence.checkedAt)||Date.parse(evidence.checkedAt)<Date.parse(p.datePublished)||Date.parse(evidence.checkedAt)>now||! /^[a-f0-9]{40}$/.test(evidence.commit||''))throw Error('Missing exact, actually inspected production publication evidence');
      if(p.dateModified&&(!instant(p.dateModified)||Date.parse(p.dateModified)<Date.parse(p.datePublished)||Date.parse(p.dateModified)>now))throw Error('Invalid material modification date');
    }
    return {...article,route:article.route.slice(1,-1),status:p.status,publicationAuthorized:true,editorApproved:true,humanReviewClaimed:false,confirmedDeployment:p.confirmedDeployment,datePublished:p.datePublished||p.releaseDate,dateModified:p.dateModified||null,byline:{...byline},contentHash:p.contentHash};
  });
}
module.exports={resolve,torontoDay,read};
