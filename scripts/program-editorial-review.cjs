'use strict';

// Eligibility only: this module never publishes, assigns publication dates,
// writes decisions, fetches sources or changes the source articles.
const crypto=require('node:crypto');
const CONTENT_VERSION='editorial-program-2026-10-09.v1';
const SCHEMA_VERSION=1;
const HUMAN_ATTESTATION='I personally reviewed the complete article, its applicable sources and recommendation conditions. This is a human editorial decision.';
const BYLINE_ATTESTATION='I confirm that this byline and attribution accurately describe the authorship and research assistance.';
const ALLOWED_DECISIONS=new Set(['approve','needs_revision','reject']);
const EXCLUDED_HASH_KEYS=new Set(['status','reviewStatus','humanReview','published','publishable','indexable','datePublished','dateModified']);
const PINNED_BLOCKERS={
  '02':['verified_bom_revision','exact_regional_offers'],
  '03':['verified_bom_revision','exact_regional_offers'],
  '04':['verified_bom_revision','exact_regional_offers'],
  '05':['verified_bom_revision','exact_regional_offers'],
  '14':['verified_same_budget_offers'],
  '39':['application_specific_benchmark_coverage','verified_bom_revision','exact_regional_offers']
};
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'&&value.trim().length>0&&value.length<=4000&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
const https=value=>typeof value==='string'&&/^https:\/\/[^\s]+$/.test(value);
const placeholder=value=>/^(?:tbd|todo|pending|unknown|your name|reviewer|editor|owner|name|placeholder|n\/a)$/i.test(String(value).trim());
const automatedName=value=>/\b(?:chatgpt|codex|automated reviewer|ai reviewer|agent reviewer|review bot|gpt[- ]?\d)\b/i.test(String(value));
const clone=value=>JSON.parse(JSON.stringify(value));
const issue=(code,path,message)=>({code,path,message});

function stable(value){
  if(Array.isArray(value))return'['+value.map(stable).join(',')+']';
  if(isObject(value))return'{'+Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>JSON.stringify(key)+':'+stable(value[key])).join(',')+'}';
  return JSON.stringify(value);
}
function day(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const instant=new Date(value+'T00:00:00.000Z');
  return Number.isFinite(instant.getTime())&&instant.toISOString().slice(0,10)===value?value:null;
}
function moment(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)||!day(value.slice(0,10)))return null;
  const time=Date.parse(value);
  if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,19)!==value.slice(0,19))return null;
  return time;
}
function asOfContext(value){
  if(day(value))return{day:value,time:Date.parse(value+'T23:59:59.999Z')};
  const time=moment(value);
  return time===null?null:{day:value.slice(0,10),time};
}
function contentFingerprint(article,sources={}){
  if(!isObject(article))throw new TypeError('An editorial article object is required');
  const content=Object.fromEntries(Object.entries(article).filter(([key])=>!EXCLUDED_HASH_KEYS.has(key)));
  const evidence=Object.fromEntries([...new Set(article.sourceIds||[])].sort().map(id=>[id,sources[id]||null]));
  const contentVersion=article.editorialContentVersion||CONTENT_VERSION;
  return{contentVersion,contentHash:crypto.createHash('sha256').update(stable({contentVersion,content,evidence}),'utf8').digest('hex')};
}
function blockersFor(article){
  return[...new Set([...(article.blockingDependencies||[]),...(PINNED_BLOCKERS[article.id]||[])])].filter(id=>id!=='human_editorial_review');
}
function evidenceIssues(ref,context,path){
  const issues=[];
  if(!isObject(ref))return[issue('evidence_missing',path,'A source URL or a documented repository record is required.')];
  if(!https(ref.url)&&!(typeof ref.recordId==='string'&&/^repo:[A-Za-z0-9._\/-]+$/.test(ref.recordId)&&!ref.recordId.includes('..')))issues.push(issue('evidence_reference',path,'Use an HTTPS source URL or a repo: record without parent traversal.'));
  if(!text(ref.description))issues.push(issue('evidence_description',path+'.description','Describe what this evidence establishes.'));
  if(!day(ref.checkedAt)||ref.checkedAt>context.day)issues.push(issue('evidence_date',path+'.checkedAt','Evidence needs a real, nonfuture inspection date.'));
  if(ref.checkedAt>context.reviewDay)issues.push(issue('evidence_after_review',path+'.checkedAt','A decision cannot precede inspection of its evidence.'));
  if(ref.verifiedByHuman!==true)issues.push(issue('evidence_human_check',path+'.verifiedByHuman','The human reviewer must explicitly confirm this evidence.'));
  return issues;
}
function bomIssues(article,context){
  const issues=[],rows=article.bom;
  if(!Array.isArray(rows)||!rows.length)return[issue('bom_missing','article.bom','An empty planning worksheet is not a verified bill of materials.')];
  const revision=article.bomRevision;
  if(!isObject(revision)||!text(revision.id)||!day(revision.verifiedAt)||revision.verifiedAt>context.reviewDay)issues.push(issue('bom_revision','article.bomRevision','A named exact BOM revision with a nonfuture verification date is required.'));
  if(!Array.isArray(revision?.compatibilityEvidence)||!revision.compatibilityEvidence.length)issues.push(issue('bom_compatibility','article.bomRevision.compatibilityEvidence','The exact revision needs sourced compatibility checks and remaining limitations.'));
  else revision.compatibilityEvidence.forEach((ref,i)=>issues.push(...evidenceIssues(ref,context,'article.bomRevision.compatibilityEvidence.'+i)));
  const covered=new Set();
  rows.forEach((row,i)=>{
    const path='article.bom.'+i;
    if(!isObject(row)||!text(row.productId)||!text(row.model)||!text(row.partNumber)||!Number.isInteger(row.quantity)||row.quantity<1||typeof row.owned!=='boolean'||typeof row.required!=='boolean')issues.push(issue('bom_item',path,'Each item needs stable product ID, exact model/part number, positive quantity, owned flag and required flag.'));
    if(!Array.isArray(row?.components)||!row.components.length)issues.push(issue('bom_component_role',path+'.components','List the component role(s) this exact product supplies.'));
    else row.components.forEach(role=>covered.add(role));
    if(!Array.isArray(row?.evidence)||!row.evidence.length)issues.push(issue('bom_item_evidence',path+'.evidence','Document exact identity and any included cooling/graphics role.'));
    else row.evidence.forEach((ref,j)=>issues.push(...evidenceIssues(ref,context,path+'.evidence.'+j)));
  });
  const required=[...new Set(['cpu','motherboard','ram','storage','case','psu','cooling','graphics',...(Array.isArray(article.requiredComponentRoles)?article.requiredComponentRoles:[])])];
  required.forEach(role=>{if(!covered.has(role))issues.push(issue('bom_required_role','article.bom','The complete purchase plan does not cover '+role+'.'))});
  return issues;
}
function offerIssues(article,context,{standalone=false}={}){
  const issues=[],offers=article.offers;
  if(!Array.isArray(offers)||!offers.length)return[issue('offers_missing','article.offers','Real exact-variant offer observations are required; search links and zero placeholders are insufficient.')];
  if(!['CA','US'].includes(article.region)||({CA:'CAD',US:'USD'})[article.region]!==article.currency)issues.push(issue('offer_region','article.region','Select explicit Canada/CAD or United States/USD; no implicit conversion.'));
  const ids=new Set();
  offers.forEach((offer,i)=>{
    const path='article.offers.'+i;
    if(!isObject(offer))return issues.push(issue('offer_shape',path,'An exact observed offer object is required.'));
    if(!text(offer.id)||ids.has(offer.id))issues.push(issue('offer_identity',path+'.id','Offer IDs must be named and unique.'));
    ids.add(offer.id);
    if(!text(offer.productId)||!text(offer.partNumber)||!text(offer.seller)||!https(offer.productUrl))issues.push(issue('offer_variant',path,'Record exact product/part number, seller and actual product URL.'));
    if(!Number.isFinite(offer.price)||offer.price<=0)issues.push(issue('offer_amount',path+'.price','A positive observed price is required; unknown is not zero.'));
    if(!['new','used','refurbished'].includes(offer.condition)||!Array.isArray(offer.excludedCharges)||offer.excludedCharges.some(charge=>!text(charge)))issues.push(issue('offer_disclosure',path,'Record condition and an explicit excluded-charges list; do not hide tax/shipping assumptions.'));
    if(offer.region!==article.region||offer.currency!==article.currency)issues.push(issue('offer_currency',path,'Every offer must match the explicit article region/currency.'));
    const observed=moment(offer.observedAt),expires=moment(offer.expiresAt);
    if(observed===null||expires===null||observed>context.time||expires<=context.time||expires<=observed)issues.push(issue('offer_freshness',path,'Record an observed time and unexpired expiry; future observations are invalid.'));
    if(observed!==null&&offer.observedAt.slice(0,10)>context.reviewDay)issues.push(issue('offer_after_review',path+'.observedAt','The price must have been observed by the human review date.'));
    if(offer.availability!=='in_stock'||!['authorized_feed','verified_manual_listing'].includes(offer.verification))issues.push(issue('offer_availability',path,'Availability needs an exact feed/manual listing observation, not a search link.'));
    issues.push(...evidenceIssues(offer.evidence,context,path+'.evidence'));
  });
  if(!standalone){
    if(!Array.isArray(article.bom)||!article.bom.length)issues.push(issue('offer_without_bom','article.bom','Offer coverage must match a complete exact BOM.'));
    else article.bom.filter(row=>row.required&&!row.owned).forEach(row=>{
      if(!offers.some(offer=>offer.productId===row.productId&&offer.partNumber===row.partNumber))issues.push(issue('offer_coverage','article.offers','A required new BOM item lacks an exact matching offer: '+row.productId+'.'));
    });
  }
  return issues;
}
function sameBudgetIssues(article,context){
  const issues=offerIssues(article,context,{standalone:true}),pair=article.sameBudgetComparison;
  if(!isObject(pair)||!Array.isArray(pair.offerIds)||pair.offerIds.length!==2||new Set(pair.offerIds).size!==2||!Number.isFinite(pair.maxPriceDifference)||pair.maxPriceDifference<0||!text(pair.explanation))return[...issues,issue('same_budget_basis','article.sameBudgetComparison','Name two exact offer IDs, an explicit maximum price difference and the decision basis.')];
  const pairOffers=pair.offerIds.map(id=>(article.offers||[]).find(offer=>offer.id===id));
  if(pairOffers.some(offer=>!offer)||pairOffers[0]?.productId===pairOffers[1]?.productId)issues.push(issue('same_budget_pair','article.sameBudgetComparison','The selected offers must reference two distinct exact products.'));
  else if(Math.abs(pairOffers[0].price-pairOffers[1].price)>pair.maxPriceDifference)issues.push(issue('same_budget_difference','article.sameBudgetComparison','The observed prices exceed the declared comparison condition.'));
  return issues;
}
function applicationIssues(article,context){
  const issues=[];
  if(!Array.isArray(article.applicationEvidence)||!article.applicationEvidence.length)return[issue('application_evidence','article.applicationEvidence','A finished application recommendation needs relevant original measurement records.')];
  article.applicationEvidence.forEach((row,i)=>{
    const path='article.applicationEvidence.'+i;
    if(!isObject(row)||!text(row.software)||!text(row.version)||!text(row.workload)||!text(row.testConditions)||!text(row.metric)||row.status!=='measured')issues.push(issue('application_measurement',path,'Identify the application/version, workload, test conditions, metric and measured status.'));
    if(!isObject(row?.rights)||row.rights.use!=='citation_only'||!text(row.rights.basis))issues.push(issue('application_rights',path+'.rights','Use cited original evidence and document the rights basis; do not import an unlicensed dataset.'));
    issues.push(...evidenceIssues(row?.evidence,context,path+'.evidence'));
  });
  return issues;
}
function resolveReview(article,decision,{asOf,sources={}}={}){
  const fingerprint=contentFingerprint(article,sources),expected=blockersFor(article),clock=asOfContext(asOf);
  const result={articleId:article.id,route:article.route,...fingerprint,decisionPresent:decision!==undefined&&decision!==null,publishable:false,published:false,indexable:false,datePublished:null,dateModified:null,reviewStatus:'needs_human_review',review:null,byline:null,unresolvedBlockers:[...expected],issues:[]};
  if(!clock){result.issues.push(issue('as_of_required','context.asOf','Supply a real ISO date or UTC timestamp; the pure resolver does not read the clock.'));return result;}
  if(!result.decisionPresent)return result;
  if(!isObject(decision)){result.issues.push(issue('decision_shape','decision','An owner-entered decision object is required.'));return result;}
  if(!text(article.title)||!text(article.summary)||!text(article.intent)||!text(article.audience)||!/^\/(?!\/)[^\s]*\/$/.test(article.route||'')||!Array.isArray(article.sections)||article.sections.length<3||article.sections.some(section=>!text(section.title)||!Array.isArray(section.paragraphs)||!section.paragraphs.length||section.paragraphs.some(paragraph=>!text(paragraph))))result.issues.push(issue('article_structure','article','The current article must have an exact route, clear intent/audience and complete readable sections.'));
  const allowed=new Set(['articleId','decision','origin','contentVersion','contentHash','reviewedAt','reviewer','byline','resolvedBlockers','notes']);
  Object.keys(decision).forEach(key=>{if(!allowed.has(key))result.issues.push(issue('decision_field','decision.'+key,'Unrecognized decision fields must be reviewed instead of silently trusted.'))});
  if(decision.articleId!==article.id)result.issues.push(issue('article_identity','decision.articleId','The review must name this exact article identity.'));
  if(!ALLOWED_DECISIONS.has(decision.decision))result.issues.push(issue('decision_type','decision.decision','Choose approve, needs_revision or reject.'));
  if(decision.notes!==undefined&&decision.notes!==null&&!text(decision.notes))result.issues.push(issue('decision_notes','decision.notes','Notes must be bounded plain text or null.'));
  if(decision.origin!=='human_entered')result.issues.push(issue('automated_decision','decision.origin','Automated or unspecified-origin decisions cannot approve publication.'));
  if(decision.contentVersion!==fingerprint.contentVersion)result.issues.push(issue('stale_version','decision.contentVersion','The reviewed version differs from this content version.'));
  if(decision.contentHash!==fingerprint.contentHash)result.issues.push(issue('stale_content','decision.contentHash','Article or applicable source content changed after this decision. Review the current fingerprint.'));
  if(!day(decision.reviewedAt)||decision.reviewedAt>clock.day)result.issues.push(issue('review_date','decision.reviewedAt','Review date must be real and not in the future.'));
  const checked=[article.evidenceDate,...(article.sourceIds||[]).map(id=>sources[id]?.checked)].filter(value=>day(value));
  if(checked.some(value=>value>decision.reviewedAt))result.issues.push(issue('review_before_evidence','decision.reviewedAt','A review cannot precede inspection of the article/source version.'));
  if((article.sourceIds||[]).some(id=>!sources[id]))result.issues.push(issue('missing_source','article.sourceIds','Applicable registered evidence is missing.'));
  if(!Array.isArray(article.sourceIds)||!article.sourceIds.length||(article.sourceIds||[]).some(id=>sources[id]?.access!=='inspected'||!day(sources[id]?.checked)))result.issues.push(issue('source_inspection','article.sourceIds','Applicable sources require actual inspection records, not links alone.'));
  const reviewer=decision.reviewer;
  if(!isObject(reviewer)||reviewer.kind!=='human'||!text(reviewer.name)||placeholder(reviewer.name)||automatedName(reviewer.name)||reviewer.personallyReviewed!==true||reviewer.attestation!==HUMAN_ATTESTATION)result.issues.push(issue('human_reviewer','decision.reviewer','A named human must attest to personally reviewing the complete article and applicable evidence.'));
  if(isObject(reviewer))Object.keys(reviewer).forEach(key=>{if(!['kind','name','role','personallyReviewed','attestation'].includes(key))result.issues.push(issue('reviewer_field','decision.reviewer.'+key,'Do not accept unrecognized or automated reviewer flags.'))});
  if(decision.decision==='approve'){
    const byline=decision.byline;
    if(!isObject(byline)||!['person','organization','research_workflow'].includes(byline.type)||!text(byline.name)||placeholder(byline.name)||!text(byline.attribution)||byline.attestation!==BYLINE_ATTESTATION)result.issues.push(issue('truthful_byline','decision.byline','Choose and personally confirm truthful visible authorship/research attribution; do not invent staff or credentials.'));
    if(byline?.type==='person'&&automatedName(byline.name))result.issues.push(issue('byline_person','decision.byline.name','An automated tool cannot be represented as a human author.'));
    if(isObject(byline))Object.keys(byline).forEach(key=>{if(!['type','name','attribution','attestation'].includes(key))result.issues.push(issue('byline_field','decision.byline.'+key,'Unrecognized byline fields cannot imply unverified credentials or ratings.'))});
    const context={...clock,reviewDay:day(decision.reviewedAt)||'0000-00-00'},resolutions=decision.resolvedBlockers;
    if(!Array.isArray(resolutions))result.issues.push(issue('blocker_resolution_shape','decision.resolvedBlockers','Provide evidence-backed blocker resolutions; an empty array is valid only when no data blockers exist.'));
    else{
      const ids=new Set();
      resolutions.forEach((entry,i)=>{
        const path='decision.resolvedBlockers.'+i;
        if(!isObject(entry)||!expected.includes(entry.blocker)||ids.has(entry.blocker)||entry.status!=='resolved'){result.issues.push(issue('blocker_resolution',path,'Resolve each required data blocker once, using its exact identity.'));return;}
        ids.add(entry.blocker);
        const local=Array.isArray(entry.evidence)&&entry.evidence.length?entry.evidence.flatMap((ref,j)=>evidenceIssues(ref,context,path+'.evidence.'+j)):[issue('blocker_evidence',path+'.evidence','Resolution requires inspected evidence, not a bare resolved flag.')];
        result.issues.push(...local);
        if(!local.length)result.unresolvedBlockers=result.unresolvedBlockers.filter(id=>id!==entry.blocker);
      });
    }
    result.unresolvedBlockers.forEach(id=>result.issues.push(issue('unresolved_blocker','decision.resolvedBlockers','Evidence is still required for '+id+'.')));
    const validators={verified_bom_revision:bomIssues,exact_regional_offers:offerIssues,verified_same_budget_offers:sameBudgetIssues,application_specific_benchmark_coverage:applicationIssues};
    expected.forEach(id=>{const issues=validators[id]?.(article,context)||[];result.issues.push(...issues);if(issues.length&&!result.unresolvedBlockers.includes(id))result.unresolvedBlockers.push(id)});
  }
  if(!result.issues.length){
    result.review={reviewer:clone(reviewer),reviewedAt:decision.reviewedAt,decision:decision.decision,notes:decision.notes||null,identityBasis:'Owner-entered human declaration; software checks consistency, not the person’s identity.'};
    result.reviewStatus=decision.decision==='approve'?'approved_for_publication':decision.decision==='reject'?'rejected':'revision_requested';
    result.byline=decision.decision==='approve'?clone(decision.byline):null;
    result.publishable=decision.decision==='approve';
  }else result.reviewStatus='invalid_or_stale_decision';
  return result;
}
function resolveReviews(articles,registry,{asOf,sources={}}={}){
  const registryIssues=[];
  if(!Array.isArray(articles))throw new TypeError('Article records are required');
  if(!isObject(registry)||registry.schemaVersion!==SCHEMA_VERSION||!Array.isArray(registry.decisions))registryIssues.push(issue('registry_schema','registry','Use schemaVersion 1 and a decisions array.'));
  else{
    Object.keys(registry).forEach(key=>{if(!['schemaVersion','decisions'].includes(key))registryIssues.push(issue('registry_field','registry.'+key,'Unrecognized review-registry field.'))});
    const ids=new Set();
    registry.decisions.forEach((decision,i)=>{
      if(!isObject(decision)||!articles.some(a=>a.id===decision.articleId))registryIssues.push(issue('registry_article','registry.decisions.'+i,'Decision names an unknown article identity.'));
      if(ids.has(decision?.articleId))registryIssues.push(issue('registry_duplicate','registry.decisions.'+i,'Duplicate decisions are ambiguous; keep one current decision per article.'));
      ids.add(decision?.articleId);
    });
  }
  const items=articles.map(article=>{
    const decision=registryIssues.length?undefined:registry.decisions.find(d=>d.articleId===article.id),result=resolveReview(article,decision,{asOf,sources});
    if(registryIssues.length){result.issues.push(...registryIssues);result.reviewStatus='invalid_registry';result.publishable=false;}
    return result;
  });
  const eligibleArticles=items.filter(item=>item.publishable).map(result=>copyEligible(articles.find(article=>article.id===result.articleId),result));
  return{schemaVersion:SCHEMA_VERSION,asOf,registryValid:!registryIssues.length,registryIssues,items,publishable:items.filter(item=>item.publishable),eligibleArticles,withheld:items.filter(item=>!item.publishable),invalidDecisions:items.filter(item=>item.decisionPresent&&item.issues.length),preserveExistingRoutes:items.filter(item=>!item.publishable).map(item=>item.route)};
}
function copyEligible(article,resolution){
  if(!resolution?.publishable||resolution.articleId!==article.id)return null;
  return{...clone(article),status:'human_reviewed',reviewStatus:resolution.reviewStatus,humanReview:clone(resolution.review),byline:clone(resolution.byline),reviewedContentHash:resolution.contentHash,reviewedContentVersion:resolution.contentVersion,blockingDependencies:[],publishable:true,published:false,indexable:false,datePublished:null,dateModified:null};
}
function eligibleCopy(article,decision,context){return copyEligible(article,resolveReview(article,decision,context));}
function readDecisionFile(file){
  const fs=require('node:fs'),path=require('node:path'),target=file||path.join(__dirname,'program-editorial-review-decisions.json');
  const size=fs.statSync(target).size;
  if(size>1024*1024)throw new Error('Review file exceeds the 1 MiB limit');
  return JSON.parse(fs.readFileSync(target,'utf8').replace(/^\uFEFF/,''));
}
function checklist(article,sources){
  return{articleId:article.id,route:article.route,title:article.title,...contentFingerprint(article,sources),sourceCount:(article.sourceIds||[]).length,requiredDataBlockers:blockersFor(article),humanRequirements:['Named actual human reviewer','Personal full-content/source review attestation','Truthful author/research-assistance byline decision','Nonfuture date after inspected evidence','Exact current content/source hash and version','Evidence-backed resolution of every data blocker'],reviewNote:'Automated validation cannot establish a real person’s identity, factual truth or publication. Owner must enter truthful decisions.'};
}
function main(args){
  const editorial=require('./program-editorial.cjs');
  const command=args[0]||'list',option=name=>{const index=args.indexOf(name);return index<0?null:args[index+1]};
  if(command==='self-test')return require('./program-editorial-review.test.cjs').runTests();
  if(command==='help'||args.includes('--help')){
    console.log('Read-only editorial review CLI\n  list [--id 30] [--json]\n  check [--file path.json] [--as-of YYYY-MM-DD or UTC timestamp]\n  template --id 30\n  self-test\nNo command writes decisions, publishes content or contacts external services.');return;
  }
  if(!['list','check','template'].includes(command))throw new Error('Unknown command; use help');
  for(let i=1;i<args.length;i++){
    if(args[i]==='--json')continue;
    if(!['--id','--file','--as-of'].includes(args[i]))throw new Error('Unknown option '+args[i]);
    if(!args[i+1]||args[i+1].startsWith('--'))throw new Error('A value is required for '+args[i]);
    i++;
  }
  const asOf=option('--as-of')||new Date().toISOString();
  if(!asOfContext(asOf))throw new Error('Invalid --as-of date or UTC timestamp');
  const all=editorial.articles,id=option('--id'),selected=id?all.filter(a=>a.id===id):all;
  if(id&&!selected.length)throw new Error('Unknown article ID; use a two-digit ID from 01 to 40');
  if(command==='template'){
    if(selected.length!==1)throw new Error('template requires --id');
    const article=selected[0];
    console.log(JSON.stringify({articleId:article.id,decision:null,origin:'human_entered',...contentFingerprint(article,editorial.sources),reviewedAt:null,reviewer:{kind:'human',name:'',personallyReviewed:false,attestation:''},byline:{type:null,name:'',attribution:'',attestation:''},resolvedBlockers:blockersFor(article).map(blocker=>({blocker,status:'unresolved',evidence:[]})),notes:'Complete only after actual human review. An unfilled template cannot approve an item.'},null,2));return;
  }
  const registry=readDecisionFile(option('--file')),resolution=resolveReviews(all,registry,{asOf,sources:editorial.sources});
  if(command==='check'){
    console.log(JSON.stringify({asOf,registryValid:resolution.registryValid,recordedDecisions:registry?.decisions?.length||0,publishable:resolution.publishable.length,withheld:resolution.withheld.length,registryIssues:resolution.registryIssues,invalidDecisions:resolution.invalidDecisions.map(item=>({articleId:item.articleId,issues:item.issues})),notice:'Eligibility only. No article was published, human-reviewed or modified by this command.'},null,2));
    if(!resolution.registryValid||resolution.invalidDecisions.length)process.exitCode=1;return;
  }
  const needs=selected.map(article=>({...checklist(article,editorial.sources),resolution:resolution.items.find(item=>item.articleId===article.id)}));
  if(args.includes('--json'))console.log(JSON.stringify({asOf,items:needs},null,2));
  else{
    console.log('Editorial review needs — no publishing\n');
    needs.forEach(item=>console.log(item.articleId+' · '+item.title+'\n  '+item.resolution.reviewStatus+' · '+item.contentVersion+'\n  SHA-256 '+item.contentHash+'\n  Data blockers: '+(item.requiredDataBlockers.join(', ')||'none')+'\n  Required: actual human review, truthful byline, current hash and review date\n'));
  }
}
module.exports={CONTENT_VERSION,SCHEMA_VERSION,HUMAN_ATTESTATION,BYLINE_ATTESTATION,contentFingerprint,blockersFor,resolveReview,resolveReviews,eligibleCopy,readDecisionFile,checklist};
if(require.main===module){try{main(process.argv.slice(2))}catch(error){console.error('Editorial review check failed: '+error.message);process.exitCode=1;}}
