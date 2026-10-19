'use strict';

// Writes local review evidence only. Does not generate public pages or approvals.
const fs = require('node:fs');
const path = require('node:path');
const { articles, sources, evidenceDate } = require('./evolution-editorial-data.cjs');
const root = path.resolve(__dirname,'..');
const directory=path.join(root,'docs/evolution-oct18/editorial');
const oldModules=['program-editorial','completion-editorial-data','completion-editorial-extra-data','oct16-editorial-data','master-editorial-content','continuation-editorial-content','growth-editorial-content','oct14-editorial-content'];
const clean=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();
function existingInventory() {
  const byRoute=new Map();
  for(const name of oldModules)for(const a of require(`./${name}.cjs`).articles||[]) {
    const route=a.canonicalRoute||a.route||`/blog/${a.slug}/`;
    const item=byRoute.get(route)||{route,records:[]};
    item.records.push({module:`scripts/${name}.cjs`,id:a.id,title:a.title,intent:a.intent||null,sourceState:a.status||null});byRoute.set(route,item);
  }
  const blog=path.join(root,'dist/blog');
  if(fs.existsSync(blog))for(const entry of fs.readdirSync(blog,{withFileTypes:true}).filter(e=>e.isDirectory())) {
    const file=path.join(blog,entry.name,'index.html');if(!fs.existsSync(file))continue;
    const html=fs.readFileSync(file,'utf8'),route=`/blog/${entry.name}/`;
    const item=byRoute.get(route)||{route,records:[]};
    item.publicTitle=clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
    item.description=clean(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]);
    item.publicHtmlPresent=true;
    item.indexable=!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
    item.mainIntent=item.records.filter(r=>r.intent).at(-1)?.intent||item.description||item.publicTitle;
    byRoute.set(route,item);
  }
  return [...byRoute.values()].sort((a,b)=>a.route.localeCompare(b.route));
}
const tokens=s=>new Set(clean(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(x=>x.length>2&&!['the','and','for','your','how','with','from','what','before','that','this','does','into','when','without','check'].includes(x)));
function similarity(a,b){const x=tokens(a),y=tokens(b);const common=[...x].filter(t=>y.has(t)).length;return common/(new Set([...x,...y]).size||1);}
function markdown(a) {
  let out=`# ${a.title}\n\n**${a.id} · Unpublished research draft · No human editorial review**\n\nProposed byline: PC Part Performance; requires truthful attribution confirmation.\n\nIntent: ${a.intent}\n\nDescription: ${a.description}\n\nResearch date: ${a.evidenceDate}. This is not a publication or modification date.\n\n## Short answer\n\n${a.answer}\n\n![${a.visual.alt}](../../../../${a.visual.path})\n\n${a.visual.evidence}\n\n`;
  for(const s of a.sections) {
    out+=`## ${s.heading}\n\n${s.paragraphs.join('\n\n')}\n\n`;
    if(s.table){out+=`${s.table.caption}\n\n| ${s.table.headers.join(' | ')} |\n| ${s.table.headers.map(()=>'---').join(' | ')} |\n${s.table.rows.map(r=>'| '+r.join(' | ')+' |').join('\n')}\n\n`;}
    if(s.checklist)out+=s.checklist.map(c=>`- ${c}`).join('\n')+'\n\n';
    if(s.sourceIds.length)out+='Applicable sources: '+s.sourceIds.map(id=>`[${sources[id].publisher}: ${sources[id].title}](${sources[id].url})`).join('; ')+'.\n\n';
  }
  out+='## Apply this to your PC\n\n'+a.relatedTools.map(t=>`- [${t.label}](${t.href})`).join('\n')+'\n\n';
  out+='## Research evidence and limitations\n\n';
  for(const id of a.sourceIds){const s=sources[id];out+=`### ${s.publisher}: ${s.title}\n\n[Original source](${s.url}) · Inspected ${s.inspected}\n\n${s.claims.join(' ')}\n\nScope limitation: ${s.limitations}\n\n${s.rights}\n\n`;}
  out+=`## Editorial decision still required\n\n${a.editorialDisclosure}\n\nHuman review: not performed. Publication approval: not granted. No public Article schema, feed, sitemap or blog entry is authorized by this file.\n\nCheck the source-linked claims, diagram, safety conditions, search-intent fit and all internal links before deciding. A person must record a truthful complete-article review and byline; automated tests are not that review.\n\nContent fingerprint: \`${a.contentHash}\`\n`;
  return out;
}
function writeDocs() {
  fs.mkdirSync(path.join(directory,'drafts'),{recursive:true});
  const inventory=existingInventory();
  const queryMap=articles.map(a=>({id:a.id,proposedRoute:a.route,previewRoute:a.previewRoute,title:a.title,queryIntent:a.intent,
    demandBasis:'Qualitative intent hypothesis from a concrete PC-owner task. No private Search Console or keyword-volume evidence is claimed.',
    audience:a.id==='LE-36'?'Windows PC owners preparing a handover':'PC builders or existing-PC owners performing the named task',
    region:'Canada/US and other markets; no unverified regional price claims',
    relatedExistingRoute:a.relation.related,distinctContribution:a.relation.difference,
    evidenceNeededForPublication:'Human verification of the applicable primary-source claims, scope, original diagram and current destination links',
    relatedTools:a.relatedTools,nextStep:a.relatedTools[0],status:'complete_unpublished_research_draft',
    candidateOverlapChecks:inventory.map(old=>({route:old.route,title:old.publicTitle||old.records.at(-1)?.title||'',score:similarity(a.title+' '+a.intent,(old.publicTitle||'')+' '+(old.mainIntent||'')+' '+old.records.map(r=>r.title).join(' '))})).sort((x,y)=>y.score-x.score).slice(0,3),
    contentHash:a.contentHash
  }));
  fs.writeFileSync(path.join(directory,'existing-intent-inventory.json'),JSON.stringify({generated:evidenceDate,publicBlogHtmlCount:inventory.filter(i=>i.publicHtmlPresent).length,distinctExistingRoutes:inventory.length,modulesInspected:oldModules.map(m=>`scripts/${m}.cjs`),limitation:'Public HTML and maintained editorial modules inspected locally. This is not an index count, Google ranking baseline, search-volume measurement or human assessment of every existing claim.',items:inventory},null,2)+'\n');
  fs.writeFileSync(path.join(directory,'query-intent-map.json'),JSON.stringify({evidenceDate,items:queryMap},null,2)+'\n');
  fs.writeFileSync(path.join(directory,'source-register.json'),JSON.stringify({evidenceDate,sourceCount:Object.keys(sources).length,sources},null,2)+'\n');
  fs.writeFileSync(path.join(directory,'draft-status.json'),JSON.stringify({evidenceDate,researchDrafts:articles.length,publishable:0,published:0,humanReviewed:0,articles:articles.map(a=>({id:a.id,slug:a.slug,title:a.title,status:a.status,evidenceStatus:a.evidenceStatus,contentHash:a.contentHash,publicationBlockers:a.publicationBlockers}))},null,2)+'\n');
  for(const a of articles)fs.writeFileSync(path.join(directory,'drafts',a.id+'-'+a.slug+'.md'),markdown(a),'utf8');
  let packet=`# Liquid Hardware Lab: editorial review packet\n\nResearch completed ${evidenceDate}.\n\n**36 complete specialist research drafts. 0 human-reviewed, 0 approved, 0 published.**\n\nThese are original short practical guides, not product reviews or first-party benchmarks. They contain 10,944 words of answer/body prose plus tables, checklists and 36 topic-specific original SVGs. Length is reported for audit only, not a quality or ranking target. Each draft has its own decision task, caveats, source record and next action.\n\n## What changed from the proposed topics\n\nThe existing public blog has ${inventory.filter(i=>i.publicHtmlPresent).length} article HTML pages. ${inventory.length} distinct existing editorial routes were inspected across the maintained source modules and public blog HTML. Existing RAM-QVL, editing-PC, generic SSD-speed, prebuilt-internals and FPS explanations are retained. Overlapping candidate briefs were replaced by ECC scope, SSD endurance, Quick Sync path, riser diagnosis, cache-state testing and practical capture subjects. Related broad parent guides remain linked without claiming that shorter wording creates a new intent.\n\nThe query map states qualitative task intent; it does not invent search volume, rankings or traffic. Closest lexical matches are included to help human intent review, not as proof that search engines consider two pages different.\n\n## Review sequence\n\n1. Open the complete draft, illustration and primary sources.\n2. Check the exact scope, consequential facts, safety conditions and whether the task deserves its own page. Merge or reject if it does not.\n3. Inspect its rendered preview at mobile and desktop sizes. All essential diagram information is also in prose.\n4. Make any revisions before recording approval; a changed fingerprint invalidates an earlier decision.\n5. Record a truthful reviewer identity, byline and actual review date. The proposed organizational byline is not a claim of human authorship.\n6. Publish only the approved exact revision through the existing publication adapter. Assign a first-publication date only when publication occurs. Never treat research date as publication date.\n7. Check canonical, noindex removal only on the approved route, eligible schema, feeds, internal links and sitemap at release. Preserve drafts outside normal production discovery.\n\nPrevious approval for a different twelve-item batch does not authorize these thirty-six drafts.\n\n## Drafts\n\n| ID | Complete draft | Specific useful contribution |\n| --- | --- | --- |\n`;
  packet+=articles.map(a=>`| ${a.id} | [${a.title}](drafts/${a.id}-${a.slug}.md) | ${a.relation.difference} |`).join('\n');
  packet+='\n\n## Integration contract\n\n- `scripts/evolution-editorial-data.cjs` exports `{ evidenceDate, sources, articles, bodyFor }`.\n- Each article provides `slug/title/description/intent/answer/sections/body/relatedTools/sourceIds/sources/visual` and immutable-intent draft flags. `body` is escaped, controlled HTML; it contains no scripts or event handlers.\n- `visual.path` is the source SVG; `visual.src` is the proposed asset path. Copy assets only into an authorized build/preview; the data module does not write `dist`.\n- `previewRoute` is the local-review route proposal. `route` is a future canonical proposal, not a publication instruction.\n- Drafts must stay noindex and absent from public navigation, search, RSS and sitemaps. Do not output Article schema or invented publication dates for them.\n- No approvals, prices, offers, measured FPS, human reviewers or first-party tests are fabricated.\n\n## Limitations\n\nPrimary sources were opened and their applicable text inspected by the agent; that is not human editorial review. A named-board PDF was inspected through extracted text; later screenshot retrieval failed, so no uninspected graphic pinout was copied. English ASUS lighting endpoints failed, so the current Traditional Chinese primary page was inspected and its locale is recorded. Source availability can change; recheck consequential claims before release. No private analytics or Search Console was available to this editorial task.\n';
  fs.writeFileSync(path.join(directory,'REVIEW-PACKET.md'),packet,'utf8');
  return {articles:articles.length,existingRoutes:inventory.length,publicBlogHtml:inventory.filter(i=>i.publicHtmlPresent).length,sources:Object.keys(sources).length};
}
if(require.main===module)console.log(JSON.stringify(writeDocs(),null,2));
module.exports={writeDocs,existingInventory,markdown};
