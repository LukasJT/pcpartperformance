'use strict';
// Synthetic declarations below test consistency checks. They are not human review records.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const editorial=require('./continuation-editorial.cjs'),gate=require('./program-editorial-review.cjs'),policy=require('./news-policy.cjs');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-editorial-test-'));
const file=route=>path.join(fixture,route.split(/[?#]/)[0].replace(/^\//,'').replace(/\/$/,''),'index.html');
const write=(route,html)=>{const target=file('/'+route+'/');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html)};
const shell=(title,kind,body,{description}={})=>`<!doctype html><html lang="en"><head><title>${esc(title)}</title><meta name="description" content="${esc(description)}"></head><body><main>${body}</main></body></html>`;
const now=Date.parse('2026-10-11T23:59:59Z');
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
function decision(a){return{articleId:a.id,decision:'approve',origin:'human_entered',...gate.contentFingerprint(a,editorial.sources),reviewedAt:'2026-10-11',reviewer:{kind:'human',name:'Synthetic Test Person',role:'Unit-test fixture; no real approval',personallyReviewed:true,attestation:gate.HUMAN_ATTESTATION},byline:{type:'research_workflow',name:'PC Part Performance',attribution:'Test fixture for research-workflow attribution only.',attestation:gate.BYLINE_ATTESTATION},resolvedBlockers:[],notes:'Synthetic consistency fixture. This is not a production human decision.'};}
const executed=[];
function test(name,run){run();executed.push(name);}
try{
  test('Complete distinct batch and original image dimensions',()=>{
    assert.equal(editorial.validate().valid,true);assert.equal(editorial.articles.length,12);
    assert.equal(editorial.articles.filter(a=>a.type==='news').length,4);
    assert.equal(new Set(editorial.articles.map(a=>a.route)).size,12);
    for(const a of editorial.articles){
      assert.ok(a.sections.length>=5);assert.ok(editorial.wordCount(a)>=(a.type==='news'?500:650));
      const image=fs.readFileSync(path.join(__dirname,'../data/editorial-oct11/assets',a.slug+'.png'));
      assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),675);assert.ok(a.image.alt.length>30);
      for(const id of a.sourceIds)assert.equal(editorial.sources[id].access,'inspected');
    }
    assert.ok(editorial.articles.find(a=>a.id==='C01').sections.some(s=>s.table?.rows.length===5));
    assert.ok(editorial.articles.find(a=>a.id==='C02').sections.some(s=>s.table?.rows.length===4));
  });
  for(const route of ['/prebuilts/','/shop/','/builder/','/phones/','/phones/size-compare/','/upgrade/','/compatibility/','/builder/model-coverage/','/builder/model-credits/','/hardware/','/editorial-policy/','/about/','/blog/memory-market-watch-ai-is-not-a-retail-price/','/blog/local-ai-memory-weights-kv-cache/','/blog/phone-software-support-commitment-vs-end-date/','/blog/graphics-driver-update-rollback-checklist/'])write(route.slice(1,-1),'<html><body id="build-vs-buy">Fixture available route</body></html>');
  fs.mkdirSync(path.join(fixture,'data'),{recursive:true});fs.writeFileSync(path.join(fixture,'data/search-index.json'),'[]');fs.writeFileSync(path.join(fixture,'program-draft-routes.json'),'["/existing-draft/"]');
  test('Preview contains full noindex drafts without publication or Article claims',()=>{
    process.env.PROGRAM_PREVIEW='1';
    const report=editorial({root:fixture,records:[],images:{},shell,write,esc});
    assert.equal(report.published,0);assert.equal(report.publishable,0);assert.equal(report.draftRoutes.length,13);
    for(const a of editorial.articles){
      const html=fs.readFileSync(file(a.route),'utf8');
      assert.match(html,/data-program-draft/);assert.match(html,/name="robots" content="noindex,follow,max-image-preview:large"/);
      assert.match(html,/No publication date is assigned/);assert.match(html,/width="1200" height="675"/);
      assert.doesNotMatch(html,/"@type"\s*:\s*"(?:Article|NewsArticle|VideoObject)"/);
      assert.equal((html.match(/<h1>/g)||[]).length,1);
      const internal=[...html.matchAll(/<a\s[^>]*href="(\/[^"#]*)(#[^"]*)?"/g)].map(m=>m[1]);
      for(const route of internal)assert.ok(fs.existsSync(file(route)),'Missing internal tool/policy route '+route+' in '+a.id);
      const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
      for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(match[1]),'Missing contents target '+match[1]);
    }
    assert.equal(json(path.join(fixture,'data/search-index.json')).length,12);
    assert.ok(json(path.join(fixture,'program-draft-routes.json')).includes('/existing-draft/'));
    assert.equal((fs.readFileSync(file('/news/'),'utf8').match(/Review draft · source announcement/g)||[]).length,4);
  });
  test('Normal generation removes own drafts and search entries while keeping independent routes',()=>{
    delete process.env.PROGRAM_PREVIEW;
    const unrelated='/blog/an-existing-article/';write(unrelated.slice(1,-1),'<p>Keep published article.</p>');
    const report=editorial({root:fixture,records:[],images:{},shell,write,esc});
    assert.equal(report.draftRoutes.length,0);assert.equal(report.withheldRoutes.length,12);
    assert.ok(!fs.existsSync(file('/editorial-review/oct11/')));
    for(const a of editorial.articles)assert.ok(!fs.existsSync(file(a.route)),a.id+' leaked to normal output');
    assert.match(fs.readFileSync(file(unrelated),'utf8'),/Keep published/);
    assert.equal(json(path.join(fixture,'data/search-index.json')).length,0);
    assert.deepEqual(json(path.join(fixture,'program-draft-routes.json')),['/existing-draft/']);
    assert.doesNotMatch(fs.readFileSync(path.join(fixture,'news/feed.xml'),'utf8'),/<item>/);
    assert.doesNotMatch(fs.readFileSync(path.join(fixture,'news-sitemap.xml'),'utf8'),/<url>/);
    assert.doesNotMatch(fs.readFileSync(file('/news/'),'utf8'),/href="\/news\/(?:micron|nvidia|amd|pixel)/);
  });
  test('A decision can establish eligibility only; changed content and evidence invalidate it',()=>{
    const a=editorial.articles.find(a=>a.id==='C10'),d=decision(a),r=gate.resolveReview(a,d,{asOf:'2026-10-11',sources:editorial.sources});
    assert.equal(r.publishable,true);assert.equal(r.published,false);assert.equal(r.indexable,false);assert.equal(r.datePublished,null);
    assert.equal(gate.resolveReview({...a,title:a.title+' changed'},d,{asOf:'2026-10-11',sources:editorial.sources}).publishable,false);
    const altered=structuredClone(editorial.sources);altered.rtxSpark.scope+=' Changed inspected scope.';
    assert.equal(gate.resolveReview(a,d,{asOf:'2026-10-11',sources:altered}).publishable,false);
    assert.equal(gate.resolveReview(a,{...d,origin:'automated'}, {asOf:'2026-10-11',sources:editorial.sources}).publishable,false);
  });
  test('News needs current human review and exact confirmed deployed-page evidence',()=>{
    const a=editorial.articles.find(a=>a.id==='C12'),d=decision(a),p={articleId:a.id,status:'published',contentHash:d.contentHash,datePublished:'2026-10-11T15:00:00Z',dateModified:null,confirmedDeployment:true,deploymentEvidence:{url:'https://www.pcpartperformance.com'+a.route,access:'inspected',checkedAt:'2026-10-11T16:00:00Z'}},options={decisions:{schemaVersion:1,decisions:[d]},now};
    const make=row=>({schemaVersion:1,publications:[row]});
    const rows=editorial.publishedNews(make(p),options);assert.equal(rows.length,1);assert.equal(rows[0].datePublished,p.datePublished);
    const previousClock=Date.now;Date.now=()=>now;
    try{const schema=editorial.newsSchema(rows[0]);assert.equal(schema['@type'],'NewsArticle');assert.equal(schema.datePublished,p.datePublished);assert.deepEqual(schema.image,['https://www.pcpartperformance.com'+a.image.src]);assert.equal(schema.author.name,d.byline.name);assert.throws(()=>editorial.newsSchema({...rows[0],editorApproved:false}));}finally{Date.now=previousClock;}
    for(const bad of [{...p,confirmedDeployment:false},{...p,datePublished:'2026-10-06T15:00:00Z'},{...p,datePublished:'2026-10-12T15:00:00Z'},{...p,contentHash:'0'.repeat(64)},{...p,deploymentEvidence:{...p.deploymentEvidence,url:'https://example.com/'}},{...p,dateModified:'2026-10-10T15:00:00Z'}])assert.throws(()=>editorial.publishedNews(make(bad),options));
    assert.throws(()=>editorial.publishedNews(make(p),{decisions:{schemaVersion:1,decisions:[]},now}));
  });
  test('RSS retains legitimate archives; news sitemap includes only the latest 48 hours and caps at 1000',()=>{
    const a={...editorial.articles.find(a=>a.id==='C09'),route:'news/example',status:'published',editorApproved:true,confirmedDeployment:true,byline:{name:'PC Part Performance'},datePublished:'2026-10-11T15:00:00Z'};
    assert.match(editorial.rss([a],Date.parse('2026-10-16T15:00:00Z')),/<item>/);
    assert.doesNotMatch(policy.newsSitemap([a],Date.parse('2026-10-16T15:00:00Z')),/<url>/);
    assert.doesNotMatch(editorial.rss(editorial.articles,now),/<item>/);
    const many=Array.from({length:1005},(_,i)=>({...a,route:'news/example-'+i}));
    assert.equal((policy.newsSitemap(many,now).match(/<url>/g)||[]).length,1000);
    assert.doesNotMatch(policy.newsSitemap([{...a,datePublished:'2026-10-12T15:00:00Z'}],now),/<url>/);
    assert.match(editorial.rss([{...a,title:'CPU & GPU <report>'}],now),/CPU &amp; GPU &lt;report&gt;/);
  });
  test('Review packet hashes reproduce the current articles and inspected sources',()=>{
    const target=path.join(fixture,'review-packet');editorial.writeDocumentation(target);
    const manifest=json(path.join(target,'manifest.json'));assert.equal(manifest.published,0);assert.equal(manifest.humanApprovals,0);
    for(const a of editorial.articles)assert.equal(manifest.items.find(r=>r.id===a.id).contentHash,gate.contentFingerprint(a,editorial.sources).contentHash);
    const full=fs.readFileSync(path.join(target,'REVIEW-PACKET.md'),'utf8');
    for(const a of editorial.articles)assert.ok(full.includes(a.sections.at(-1).paragraphs.at(-1)),'Incomplete review article '+a.id);
  });
  console.log(JSON.stringify({passed:executed.length,checks:executed,words:editorial.validate().wordCount,publicationDecisionsWritten:0,fullBuildRun:false},null,2));
}finally{
  delete process.env.PROGRAM_PREVIEW;
  const absolute=path.resolve(fixture),intended=path.resolve(os.tmpdir())+path.sep+'pcp-editorial-test-';
  if(!absolute.startsWith(intended))throw Error('Refusing to remove an unexpected fixture directory');
  fs.rmSync(absolute,{recursive:true,force:true});
}
