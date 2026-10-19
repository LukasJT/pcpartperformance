'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test'),{INTENTS,CORRECTION,polish,esc}=require('./total-seo.cjs'),{strictTimestamp,inspectHTML,inspectNews}=require('./total-seo-audit.cjs');
const domain='https://www.pcpartperformance.com',now=Date.parse('2026-10-19T20:00:00Z');
function page(route,text='Visible tool content'){return '<!doctype html><html><head><title>Old title</title><meta name="description" content="Old description"><meta property="og:title" content="Old title"><meta property="og:description" content="Old description"><meta name="twitter:title" content="Old title"><meta name="twitter:description" content="Old description"><link rel="canonical" href="'+domain+route+'"><meta name="robots" content="index,follow"><script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:'Old title',description:'Old description',url:domain+route})+'</script></head><body><main><h1>Existing page heading</h1>'+text+'</main></body></html>';}
test('all five existing intent destinations receive accurate, consistent metadata without adding new pages',()=>{
 for(const [route,intent]of Object.entries(INTENTS)){const html=polish(page(route,'<p><a href="/tools/">All planning tools</a></p>'),route),audit=inspectHTML(html,route,{intentsApplied:true});assert.equal(audit.issues.length,0,JSON.stringify(audit.issues));assert.equal(audit.title,intent.title);assert.equal(audit.description,intent.description);assert.equal(audit.schemas[0].name,intent.title);assert.equal(audit.schemas[0].description,intent.description);assert(html.includes('<h1>Existing page heading</h1>'));}
});
test('metadata matching handles reordered and single-quoted attributes without duplicating tags',()=>{
 const route='/blog/',html=page(route).replace('<meta name="description" content="Old description">',"<meta content='Old description' name='description'>"),output=polish(html,route);assert.equal(inspectHTML(output,route,{intentsApplied:true}).issues.length,0);assert.equal((output.match(/name=['"]description['"]/g)||[]).length,1);
});
test('metadata does not promise universal FPS, live offers, exhaustive catalogs or ranking gains',()=>{
 for(const value of Object.values(INTENTS))assert.doesNotMatch(value.title+' '+value.description,/guarantee|100%|best price|continuously live|all hardware|exact FPS prediction|rank #1/i);
});
test('the exact stale article claim is replaced with a crawlable evidence-tool link',()=>{
 const route=CORRECTION.route,html=polish(page(route,'<p>'+CORRECTION.before+'</p>'),route);assert(!html.includes(CORRECTION.before));assert(html.includes(CORRECTION.after));assert.equal(inspectHTML(html,route).issues.length,0);
});
test('a different article is not silently rewritten merely because it contains similar words',()=>{
 const html=page('/blog/another-guide/','<p>'+CORRECTION.before+'</p>');assert.equal(polish(html,'/blog/another-guide/'),html);
});
test('monitor tool gains one contextual game-performance next step while retaining existing links',()=>{
 const route='/tools/monitor-pixel-density/',html=page(route,'<p><a href="/tools/">All planning tools</a> · <a href="/editorial-policy/#corrections">Report an error</a></p>'),output=polish(html,route);assert.equal((output.match(/>Check game performance</g)||[]).length,1);assert(output.includes('>All planning tools</a>'));assert(output.includes('>Report an error</a>'));assert.equal(polish(output,route),output);
});
test('changes preserve canonical, robots, article dates, source citations and unrelated structured claims',()=>{
 const route='/performance/',block='<script type="application/ld+json">{"@type":"Article","headline":"Original","datePublished":"2026-10-01","dateModified":"2026-10-02","citation":"https://example.org/original"}</script>',html=page(route,'Actual evidence').replace('</head>',block+'</head>'),output=polish(html,route);for(const value of ['content="index,follow"','href="'+domain+route+'"','"datePublished":"2026-10-01"','"dateModified":"2026-10-02"','"citation":"https://example.org/original"'])assert(output.includes(value));
});
test('intent correction is idempotent across repeated build passes',()=>{
 for(const route of Object.keys(INTENTS)){const output=polish(page(route),route);assert.equal(polish(output,route),output);}
});
test('raw obsolete FPS marketing fails the final-output guard',()=>{
 const route='/performance/',html=page(route).replace('Old title','Game FPS calculator').replace('Old description','Estimate PC gaming FPS across more than 100 game profiles');assert(inspectHTML(html,route).issues.some(row=>row.code==='obsolete_fps_marketing'));
});
test('news dates require genuine UTC timestamps and reject impossible calendar dates',()=>{
 assert.equal(strictTimestamp('2026-10-19T12:00:00.000Z'),Date.parse('2026-10-19T12:00:00Z'));for(const value of ['2026-02-30T12:00:00Z','2026-10-19','yesterday','2026-10-19T12:00:00-04:00',null])assert.equal(strictTimestamp(value),null);
});
const row=(extra={})=>({route:'news/real-event',title:'A real event',status:'published',editorApproved:true,confirmedDeployment:true,sourceIds:['official'],datePublished:'2026-10-19T12:00:00Z',...extra});
const xml=value=>'<urlset><url><loc>'+domain+'/'+value.route+'/</loc><news:publication_date>'+value.datePublished+'</news:publication_date></url></urlset>';
test('a reviewed, deployed recent item matches its original publication date',()=>{
 const value=row(),report=inspectNews({rows:[value],xml:xml(value),now,pages:new Map([['/'+value.route+'/',{schemas:[{'@type':'NewsArticle',datePublished:value.datePublished}]}]])});assert.equal(report.issues.length,0);assert.equal(report.recentEligible,1);
});
test('old published news leaves an intentionally empty news sitemap',()=>{
 const report=inspectNews({rows:[row({datePublished:'2026-10-11T12:00:00Z'})],xml:'<urlset/>',now});assert.equal(report.recentEligible,0);assert.equal(report.issues.length,0);
});
test('unreviewed leads, future dates, stale entries and duplicate news identities fail',()=>{
 for(const value of [row({status:'draft',editorApproved:false}),row({confirmedDeployment:false}),row({datePublished:'2027-01-01T00:00:00Z'}),row({datePublished:'2026-10-01T00:00:00Z'})])assert(inspectNews({rows:[value],xml:xml(value),now}).issues.length>0);
 assert(inspectNews({rows:[row(),row()],xml:xml(row()),now}).issues.some(issue=>issue.code==='duplicate_news_identity'));
});
test('a news schema without the matching publication ledger cannot pass',()=>{
 const report=inspectNews({rows:[],xml:'<urlset/>',now,pages:new Map([['/news/imaginary/',{schemas:[{'@type':'NewsArticle',datePublished:'2026-10-19T12:00:00Z'}]}]])});assert(report.issues.some(issue=>issue.code==='news_schema_not_supported_by_publication_record'));
});
test('social metadata inconsistency is a failure, not an assumed CTR improvement',()=>{
 const html=page('/blog/').replace('property="og:title" content="Old title"','property="og:title" content="Different title"');assert(inspectHTML(html,'/blog/').issues.some(row=>row.code==='social_metadata_mismatch_og:title'));assert.equal(esc('<a&"'), '&lt;a&amp;&quot;');
});
