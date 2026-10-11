'use strict';

// Every approval used below applies to synthetic fixtures only. These records
// are never written to the decision file and cannot approve the 40 real items.
const assert=require('node:assert/strict');
const review=require('./program-editorial-review.cjs');
const copy=value=>JSON.parse(JSON.stringify(value));
const now='2026-10-09T12:00:00Z';
const fixtureSource={fixture:{id:'fixture',publisher:'Synthetic test source',url:'https://example.org/fixture',checked:'2026-10-07',access:'inspected',scope:'Synthetic fixture; no hardware fact or review claim.'}};
const context={asOf:now,sources:fixtureSource};
function article(id='fixture-guide'){
  return{id,route:'/synthetic/'+id+'/',title:'Synthetic test guide',summary:'This fixture tests the gate only.',description:'No real content is approved by this fixture.',intent:'Test gate consistency',audience:'Automated test runner',evidenceDate:'2026-10-07',sourceIds:['fixture'],sections:[1,2,3].map(number=>({title:'Fixture section '+number,paragraphs:['A complete synthetic paragraph used only for deterministic review tests.']})),blockingDependencies:['human_editorial_review'],status:'evidence_checked',reviewStatus:'needs_human_review',humanReview:null,publishable:false,published:false,indexable:false,datePublished:null,dateModified:null};
}
function evidence(){return{recordId:'repo:fixtures/editorial-evidence.json',description:'Synthetic fixture record; not actual inspected hardware or offers.',checkedAt:'2026-10-08',verifiedByHuman:true};}
function decision(a){
  return{articleId:a.id,decision:'approve',origin:'human_entered',...review.contentFingerprint(a,fixtureSource),reviewedAt:'2026-10-09',reviewer:{kind:'human',name:'Fixture Human Reviewer',personallyReviewed:true,attestation:review.HUMAN_ATTESTATION},byline:{type:'organization',name:'Synthetic Fixture Publication',attribution:'Synthetic test-only attribution; not a staff member or real editorial approval.',attestation:review.BYLINE_ATTESTATION},resolvedBlockers:[]};
}
function populatedBudget(){
  const a=article('02');
  a.region='CA';a.currency='CAD';a.blockingDependencies.push('verified_bom_revision','exact_regional_offers');
  a.bom=['cpu','motherboard','ram','storage','case','psu','cooling','graphics'].map(role=>({productId:'fixture-'+role,model:'Synthetic '+role,partNumber:'fixture-sku-'+role,quantity:1,owned:false,required:true,components:[role],evidence:[evidence()]}));
  a.bomRevision={id:'fixture-revision-1',verifiedAt:'2026-10-08',compatibilityEvidence:[evidence()]};
  a.offers=a.bom.map((row,i)=>({id:'fixture-offer-'+i,productId:row.productId,partNumber:row.partNumber,seller:'Synthetic fixture store',productUrl:'https://example.org/fixture/'+i,price:100+i,region:'CA',currency:'CAD',condition:'new',excludedCharges:['tax','shipping'],observedAt:'2026-10-09T10:00:00Z',expiresAt:'2026-10-10T12:00:00Z',availability:'in_stock',verification:'verified_manual_listing',evidence:evidence()}));
  return a;
}
function runTests(){
  const outcomes=[],run=(name,fn)=>{fn();outcomes.push(name)};
  run('Matching explicit human fixture decision is eligible without publishing',()=>{
    const a=article(),before=copy(a),d=decision(a),result=review.resolveReview(a,d,context);
    assert.equal(result.publishable,true);assert.equal(result.published,false);assert.equal(result.indexable,false);assert.equal(result.datePublished,null);assert.deepEqual(a,before);
    const eligible=review.eligibleCopy(a,d,context);assert.equal(eligible.publishable,true);assert.equal(eligible.dateModified,null);assert.deepEqual(a,before);
  });
  run('Missing decision keeps the draft and source route intact',()=>{const a=article(),r=review.resolveReview(a,null,context);assert.equal(r.publishable,false);assert.equal(r.review,null);assert.equal(r.reviewStatus,'needs_human_review')});
  run('Edited body invalidates the content hash',()=>{const a=article(),d=decision(a);a.sections[0].paragraphs[0]+=' Changed.';const r=review.resolveReview(a,d,context);assert(!r.publishable);assert(r.issues.some(i=>i.code==='stale_content'))});
  run('Changed source applicability invalidates prior review',()=>{const a=article(),d=decision(a),sources=copy(fixtureSource);sources.fixture.scope+=' Changed.';assert(!review.resolveReview(a,d,{asOf:now,sources}).publishable)});
  run('Stale editorial version stays a draft',()=>{const a=article(),d=decision(a);d.contentVersion='old';const r=review.resolveReview(a,d,context);assert(!r.publishable);assert(r.issues.some(i=>i.code==='stale_version'))});
  run('Missing named human reviewer cannot approve',()=>{const a=article(),d=decision(a);d.reviewer.name='';assert(!review.resolveReview(a,d,context).publishable)});
  run('Automated decision and reviewer declarations cannot approve',()=>{
    const a=article();for(const mutate of [d=>d.origin='automated',d=>d.reviewer.kind='automated',d=>d.reviewer.name='Codex',d=>d.reviewer.automated=true]){const d=decision(a);mutate(d);assert(!review.resolveReview(a,d,context).publishable)}
  });
  run('Missing truthful byline decision cannot approve',()=>{const a=article(),d=decision(a);d.byline.attestation='';assert(!review.resolveReview(a,d,context).publishable)});
  run('Future, impossible and before-evidence dates cannot approve',()=>{
    const a=article();for(const date of ['2026-10-10','2026-02-30','2026-10-06']){const d=decision(a);d.reviewedAt=date;assert(!review.resolveReview(a,d,context).publishable)}
  });
  run('Pure resolver requires an explicit clock context',()=>{const a=article();assert(!review.resolveReview(a,decision(a),{sources:fixtureSource}).publishable)});
  run('Bare resolved flags cannot approve empty priced-BOM arrays',()=>{
    const a=article('02');a.bom=[];a.offers=[];const d=decision(a);d.resolvedBlockers=review.blockersFor(a).map(blocker=>({blocker,status:'resolved',evidence:[evidence()]}));const r=review.resolveReview(a,d,context);assert(!r.publishable);assert(r.issues.some(i=>i.code==='bom_missing'));assert(r.issues.some(i=>i.code==='offers_missing'));
  });
  run('Pinned price blockers cannot be deleted from article flags',()=>{const a=article('02'),d=decision(a);assert(!review.resolveReview(a,d,context).publishable);assert.equal(review.blockersFor(a).length,2)});
  run('Populated exact synthetic BOM/offer evidence is structurally usable',()=>{
    const a=populatedBudget(),d=decision(a);d.resolvedBlockers=review.blockersFor(a).map(blocker=>({blocker,status:'resolved',evidence:[evidence()]}));const r=review.resolveReview(a,d,context);assert.deepEqual(r.issues,[]);assert(r.publishable);
  });
  run('Expired, wrong-currency and wrong-variant offers remain blocked',()=>{
    for(const mutate of [a=>a.offers[0].expiresAt='2026-10-09T11:00:00Z',a=>a.offers[0].currency='USD',a=>a.offers[0].partNumber='wrong-part',a=>a.offers[0].availability='unknown']){const a=populatedBudget();mutate(a);const d=decision(a);d.resolvedBlockers=review.blockersFor(a).map(blocker=>({blocker,status:'resolved',evidence:[evidence()]}));assert(!review.resolveReview(a,d,context).publishable)}
  });
  run('Reject and revision decisions do not publish',()=>{const a=article();for(const value of ['reject','needs_revision']){const d=decision(a);d.decision=value;const r=review.resolveReview(a,d,context);assert(!r.publishable);assert(r.review);assert.equal(r.byline,null)}});
  run('Ambiguous duplicate/unknown registry decisions fail closed',()=>{
    const a=article(),d=decision(a);for(const registry of [{schemaVersion:1,decisions:[d,copy(d)]},{schemaVersion:1,decisions:[{...d,articleId:'unknown'}]},{schemaVersion:2,decisions:[d]}]){const r=review.resolveReviews([a],registry,context);assert(!r.registryValid);assert.equal(r.eligibleArticles.length,0);assert(r.preserveExistingRoutes.includes(a.route))}
  });
  run('Stable hash ignores object key order and workflow status',()=>{const a=article(),hash=review.contentFingerprint(a,fixtureSource);const reordered=Object.fromEntries(Object.entries(a).reverse());reordered.status='another-workflow-label';assert.deepEqual(review.contentFingerprint(reordered,fixtureSource),hash)});
  run('Forged publishable resolution is not an approval input',()=>{const a=article();assert.equal(review.eligibleCopy(a,{publishable:true,articleId:a.id},context),null)});
  run('Approved revision renderer is explicit, undated and avoids withheld links',()=>{
    const editorial=require('./program-editorial.cjs'),a=article();a.relatedArticleIds=['02'];a.relatedTools=['/builder/'];a.relatedProducts=[{url:'/learn/withheld.html',label:'Unavailable synthetic product'}];a.nextAction={url:'/builder/',label:'Build'};a.limitations=['Synthetic evidence only. Human editorial review is pending.'];
    const d=decision(a),revision=editorial.renderApprovedRevision(a,d,context,{availableRoutes:['/blog/']});
    assert(revision.html);assert(revision.html.includes('Human-reviewed revision'));assert(revision.html.includes('Fixture Human Reviewer'));assert(revision.html.includes('no publication date assigned'));assert(!revision.html.includes('href="/builder/"'));assert(!revision.html.includes('/learn/withheld.html'));assert(!revision.html.includes('/blog/gaming-pc-1000-cad/'));assert(revision.html.includes('Browse hardware guides'));assert.equal(revision.published,false);assert.equal(revision.datePublished,null);assert(!revision.html.includes('application/ld+json'));
    assert.equal(editorial.renderApprovedRevision(a,d,context).html,null);
    assert.equal(editorial.renderApprovedRevision(a,{...d,contentHash:'stale'},context,{availableRoutes:['/blog/']}).html,null);
    const plain=editorial.renderArticle({...review.eligibleCopy(a,d,context),sourceIds:[]});assert(plain.includes('awaiting human editorial review'));assert(!plain.includes('Fixture Human Reviewer'));
  });
  run('Actual default registry approves zero real articles',()=>{
    const editorial=require('./program-editorial.cjs'),registry=review.readDecisionFile(),before=copy(editorial.articles),r=review.resolveReviews(editorial.articles,registry,{asOf:now,sources:editorial.sources});assert.equal(registry.decisions.length,0);assert.equal(r.eligibleArticles.length,0);assert.equal(r.withheld.length,40);assert.deepEqual(editorial.articles,before);
  });
  console.log(JSON.stringify({passed:true,tests:outcomes.length,scope:'Synthetic fixtures only; no real human approval or publication',outcomes},null,2));return{passed:true,tests:outcomes.length};
}
module.exports={runTests};
if(require.main===module)runTests();
