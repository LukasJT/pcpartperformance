'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {articles,sources,evidenceDate,bodyFor}=require('./evolution-editorial-data.cjs');
const {renderVisual}=require('./evolution-editorial-visuals.cjs');
const {existingInventory,markdown}=require('./evolution-editorial-docs.cjs');
const root=path.resolve(__dirname,'..');
const words=a=>(a.answer+' '+a.sections.flatMap(s=>s.paragraphs).join(' ')).split(/\s+/).length;
const present=route=>fs.existsSync(path.join(root,'dist',route.replace(/^\//,''),'index.html'));

test('36 distinct complete drafts do not replace existing public or maintained editorial routes',()=>{
  const old=new Set(existingInventory().map(a=>a.route));
  assert.equal(articles.length,36);
  for(const field of ['id','slug','route','title','intent'])assert.equal(new Set(articles.map(a=>a[field].toLowerCase())).size,36,field);
  for(const a of articles){assert(!old.has(a.route),a.route);assert(!present(a.route),a.route);assert.match(a.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.match(a.previewRoute,/^\/review\/evolution\/[a-z0-9-]+\/$/);}
});

test('draft and human review states cannot be mistaken for publication',()=>{
  for(const a of articles){
    assert.equal(a.status,'draft');assert.equal(a.humanReview,null);assert.equal(a.humanReviewClaimed,false);
    assert.equal(a.publishable,false);assert.equal(a.published,false);assert.equal(a.indexable,false);assert.equal(a.datePublished,null);
    assert.equal(a.lifecycle.humanEditorialReview,false);assert.equal(a.lifecycle.approved,false);assert.equal(a.lifecycle.released,false);
    assert(a.publicationBlockers.includes('human_editorial_review'));assert.match(a.editorialDisclosure,/AI/);
    assert(!/@type|application\/ld\+json|datePublished/.test(a.body));
  }
});

test('each specialist task has substantive prose, a direct answer, a practical action and its own visual',()=>{
  const paragraphSet=new Set();
  for(const a of articles){
    assert(a.answer.length>80);assert.equal(a.sections.length,3);
    // This is a completeness smoke check for these submitted drafts, not a publishing word-count rule.
    assert(words(a)>250,a.id);assert(a.body.length>1800,a.id);
    assert(a.sections.some(s=>s.checklist||s.table),a.id);assert(a.relatedTools.length>=2);
    for(const p of a.sections.flatMap(s=>s.paragraphs)){assert(p.length>90,a.id);assert(!paragraphSet.has(p),`Repeated paragraph in ${a.id}`);paragraphSet.add(p);}
    assert(a.relation.difference.length>50);assert(present(a.relation.related),a.relation.related);
    assert(a.visual.original);assert(a.visual.alt.length>60);assert.match(a.visual.src,/^\/assets\/evolution-editorial\/.+\.svg$/);
  }
});

test('sources are real scoped primary references, nonfuture and used by the submitted drafts',()=>{
  assert.equal(Object.keys(sources).length,42);assert.match(evidenceDate,/^\d{4}-\d{2}-\d{2}$/);
  assert(evidenceDate<=new Date().toISOString().slice(0,10));
  const used=new Set();
  for(const a of articles){
    assert(a.sourceIds.length>=1);assert.equal(a.sourceIds.length,a.sources.length);
    for(const s of a.sections)for(const id of s.sourceIds){used.add(id);assert(sources[id],id);}
    for(const id of a.sourceIds){const s=sources[id];const url=new URL(s.url);assert.equal(url.protocol,'https:');assert(!/example\.(com|org)|localhost|127\.0\.0\.1/.test(url.hostname));assert(s.claims.length>0);assert(s.limitations.length>45);assert.equal(s.inspected,evidenceDate);assert.match(s.access,/opened|inspected/);assert.match(s.rights,/no source images|no source|no.*reproduced/i);}
  }
  assert.deepEqual([...used].sort(),Object.keys(sources).sort());
});

test('all suggested next actions point to current ordinary site routes',()=>{
  for(const a of articles)for(const t of a.relatedTools){assert(t.label.length>5);assert.match(t.href,/^\/[a-z0-9/-]+\/$/);assert(present(t.href),`${a.id}: ${t.href}`);}
});

test('controlled article renderer escapes text and table content rather than executing it',()=>{
  const html=bodyFor([{heading:'<script>alert(1)</script>',paragraphs:['<img src=x onerror=alert(1)>'],table:{caption:'<svg>',headers:['<b>'],rows:[['<iframe>']]},checklist:['<button onclick=x>']}]);
  assert(!/<script|<img|<svg|<iframe|onclick=/.test(html.replace(/&lt;[^&]*&gt;/g,'')));
  assert(html.includes('&lt;script&gt;'));assert(html.includes('&lt;img'));assert(html.includes('&lt;iframe&gt;'));
});

test('36 distinct original SVG files match the deterministic generator and contain no executable/external resources',()=>{
  const hashes=new Set();
  for(const a of articles){const file=path.resolve(root,a.visual.path);assert(file.startsWith(path.join(root,'scripts/assets/evolution-editorial')+path.sep));const svg=fs.readFileSync(file,'utf8');assert.equal(svg,renderVisual(a));
    assert(svg.includes('<title id="title">'));assert(svg.includes('<desc id="desc">'));assert.match(svg,/viewBox="0 0 960 520"/);
    assert(!/<script|<foreignObject|<image|<animate|<use|\bon[a-z]+\s*=|\bhref\s*=|url\s*\(/i.test(svg));
    assert(Buffer.byteLength(svg)<20000);hashes.add(crypto.createHash('sha256').update(svg).digest('hex'));
  }
  assert.equal(hashes.size,36);
});

test('real physical dimensions and synthetic teaching data are labelled correctly',()=>{
  const m2=articles.find(a=>a.visual.kind==='m2');assert.deepEqual(m2.visual.values,[30,42,60,80,110]);assert.match(m2.visual.alt,/22 mm/);
  const psu=articles.find(a=>a.visual.kind==='dimensions');assert.deepEqual(psu.visual.values,[100,130]);assert.match(psu.body,/63\.5/);
  const frame=articles.find(a=>a.visual.kind==='frame');assert.match(frame.body,/constructed teaching values/);assert.match(frame.visual.notes.join(' '),/not a GPU benchmark/);
  assert.match(articles.find(a=>a.id==='LE-16').answer,/does not make every DDR5/);
  assert.match(articles.find(a=>a.id==='LE-10').body,/not measured overclocking outcomes/);
});

test('human review packet links to real local illustrations without publishing or inventing dates',()=>{
  for(const a of articles){const md=markdown(a);assert.match(md,/No human editorial review/);assert(md.includes(a.contentHash));assert(md.includes('../../../../'+a.visual.path));assert(!/datePublished: 2026/.test(md));}
  const status=JSON.parse(fs.readFileSync(path.join(root,'docs/evolution-oct18/editorial/draft-status.json'),'utf8'));assert.equal(status.published,0);assert.equal(status.humanReviewed,0);
});

test('drafts contain no placeholder prose or unsupported first-party measurements',()=>{
  for(const a of articles){
    assert(!/\bTODO\b|\bTBD\b|lorem ipsum|insert (?:source|image)|coming soon|we (?:tested|measured)|100% compatible|guaranteed FPS|guaranteed ranking/i.test(a.body),a.id);
    assert.equal(a.body,bodyFor(a.sections));
    const copy={...a};delete copy.contentHash;assert.equal(a.contentHash,crypto.createHash('sha256').update(JSON.stringify(copy)).digest('hex'));
  }
});
