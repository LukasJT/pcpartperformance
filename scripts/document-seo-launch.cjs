const fs=require('fs'),path=require('path');
const {pages,sources}=require('./seo-launch-content.cjs');
const dir=path.resolve('docs/seo-launch'),date='2026-10-03';fs.mkdirSync(dir,{recursive:true});
const write=(file,text)=>{const full=path.join(dir,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,text.trim()+'\n')};
const csv=(file,rows)=>{const keys=Object.keys(rows[0]);write(file,keys.join(',')+'\n'+rows.map(r=>keys.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(',')).join('\n'))};
const live=JSON.parse(fs.readFileSync(path.join(dir,'live-audit.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync('docs/seo-validation.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('docs/seo-launch-manifest.json','utf8'));
write('README.md',`# PC Part Performance SEO launch — ${date}

Local implementation on branch codex/seo-launch-2026-10-03. The live website has not received this release. Review deployment blockers in 15-status-and-blockers.md.

## Deliverables

1. [Executive audit](01-executive-audit.md)
2. [Technical backlog](02-technical-backlog.csv)
3. [Keyword opportunities](03-keyword-opportunities.csv)
4. [Information architecture](04-information-architecture.md) and [internal links](04-internal-link-map.csv)
5. [Implementation map](05-implementation/change-map.md)
6. [Page templates](06-page-templates.md)
7. [24-page launch backlog](07-launch-backlog.csv)
8. [Ten complete content drafts](08-content/) — also integrated into the static build
9. [90-day editorial calendar](09-editorial-calendar.csv)
10. [Structured-data rules](10-structured-data/README.md) and generated schema examples
11. [Analytics plan](11-analytics-plan.md) and [event specification](11-event-spec.csv)
12. [Distribution plan](12-distribution-plan.md)
13. [QA report](13-qa-report.md), [live HTTP evidence](live-audit.json), [launch checks](launch-validation.json)
14. [Source register](14-source-register.csv)
15. [Status and blockers](15-status-and-blockers.md)

## Reproduce

From the repository, run node scripts/build-pages.cjs, node scripts/check-seo.cjs, node scripts/check-seo-launch.cjs, node scripts/check-blog-models.cjs and node scripts/check-cooling.cjs. Regenerate these documents with node scripts/document-seo-launch.cjs after validation. The preview command is node scripts/serve-seo-preview.cjs. All new editorial pages are plain HTML before JavaScript runs.

Do not infer traffic growth, rich-result eligibility, verified fit, live prices or a successful deployment from passing local checks.`);
write('01-executive-audit.md',`# Executive audit

Snapshot: ${date}. Evidence is the public response crawl in live-audit.json, the repository and current primary-source research. No Search Console, analytics, field performance or server-log access was available.

## Main finding

The live hardware catalog and its four main categories return empty table bodies. The shop returns a loading message and no product cards. The selected comparison query returns generic initial content. Product pages exist, but discovery and comparison value depend heavily on JavaScript. Making useful initial HTML and permanent researched comparison URLs is a stronger first intervention than adding more metadata to empty templates.

## Priorities selected

First serve product rows, product links and pagination in HTML. Then publish three carefully researched comparisons, four expanded guides, an AM5 checklist and two original calculators. Keep the approved homepage design and add useful links rather than redesigning it again. Treat budget builds and game-specific performance hubs as evidence-dependent follow-up work.

## Live baseline

The audit checked ${live.results.length} URL responses. The canonical www homepage returned 200. HTTP and HTTPS apex URLs returned 301 to https://www.pcpartperformance.com/. A deliberately nonexistent path returned 404. /hardware/ssds/ also returned 404; the existing SSD path is /hardware/solid-state-drives/. The misspelled domain request failed; ownership and defensive registration are unknown. Do not purchase a domain based on this failure.

The query catalog response and selected comparison response had no X-Robots-Tag exclusion in this audit. Current client-generated filter states need host-level indexing control. Source-backed pages added in this release use stable paths rather than indexing every component pair.

## What is not measured

Search impressions, clicks, CTR, average position, indexed status, new human users, engaged sessions, returning users, conversions and revenue are unavailable. No search volume or keyword difficulty data was obtained. Search-result visibility and repeated community questions are demand proxies, not traffic estimates. This release makes no ranking or visitor-growth guarantee.

## Audience order

Prioritize buyers comparing two identifiable GPUs or CPUs and owners planning an upgrade. The current catalog, builder and observed search questions directly serve these needs. Next serve memory/storage planning and compatibility checks. Delay broad news expansion and price-led budget recommendations until the site can maintain the evidence they require.`);
const backlog=[
 ['P0','Empty initial catalog HTML','implemented local','scripts/seo-launch.cjs','24 seed rows plus 18 category paths and 88 pagination pages; every product linked','low','Run no-JS discovery and control checks'],
 ['P0','Shop loading-only initial HTML','implemented local','scripts/shopping-pages.cjs','24 product cards and buying links before JS; prevent early price fetch from clearing them','low','Disable catalog request and confirm fallback links'],
 ['P0','Selected comparisons have generic initial content','implemented local for 3 curated pairs','scripts/seo-launch-content.cjs','Stable researched paths, actual specs, sources and builder links','medium','Other arbitrary pairs remain interactive tool states'],
 ['P0','Query indexing and impossible selections','adapter ready; host blocked','scripts/seo-http-policy.cjs','301 selected curated pairs; X-Robots-Tag for state queries; 404 invalid product IDs','medium','Install at request layer; client meta fallback alone is insufficient'],
 ['P0','Duplicate Product schema','implemented local','scripts/seo-pass.cjs','One Product per canonical product; no fabricated Offer/rating/review','low','Check representative pages in Google Rich Results Test after publish'],
 ['P0','Unsupported calibrated FPS wording','implemented local','scripts/seo-launch.cjs','Assumed workload baseline; no calibration claimed','low','Obtain a documented evaluation set before making accuracy claims'],
 ['P1','Incomplete catalog indexing','existing policy preserved','scripts/seo-pass.cjs','Thin records noindex; alternate records canonicalized; sitemap excludes them','medium','Manually review low-spec records before enabling indexing'],
 ['P1','Paginated discovery vs duplicate search landings','implemented local','scripts/seo-launch.cjs','Plain anchors; page 2+ self-canonical noindex/follow; not in sitemap','low','All products found through HTML; monitor discovery in Search Console'],
 ['P1','Guides too short to support decisions','implemented local','scripts/seo-launch-content.cjs','Four substantive pillars, source notes, revised dates and checklists','low','Quarterly source review; no automatic fresh-date changes'],
 ['P1','Image exactness claims','partial','scripts/seo-pass.cjs','Product schema image requires identity match; prominent comparison names pictured partner card','medium','Audit remaining reference/family inventory; rights not established by a manufacturer URL alone'],
 ['P1','Editorial accountability','implemented local','dist/editorial-policy/index.html','Organizational authorship, disclosures, corrections, update/retirement rules','low','Enable and monitor repository issue submission'],
 ['P1','Navigation and related-page anchors','implemented local','scripts/seo-launch.cjs','Homepage to stable pair; guides to categories/tools; product category query links to paths','low','Crawl local links after build'],
 ['P1','Analytics baseline and conversion events','specified; property unavailable','docs/seo-launch/11-analytics-plan.md','Consent-respecting event definitions; no tracking or identifying data added','medium','Connect property and implement adapter after privacy choices'],
 ['P1','Core Web Vitals field data','blocked by access','docs/seo-launch/13-qa-report.md','Lab and field measures separated; bundle audit saved','medium','Use Search Console/CrUX and 75th-percentile field data'],
 ['P1','Exact model verification','not solved by SEO release','dist/model-library.json','58 community models; zero verified clearance models; no fit guarantee','high','Verify dimensions and mount points before exact-fit claims'],
 ['P1','Live retailer offers','provider unavailable','dist/shopping.js','15-minute expiry; unavailable offers excluded; searches not offers','high','Authorized feed and exact SKU matching needed for price-led pages'],
 ['P2','Game benchmarks and hubs','data acquisition','07-launch-backlog.csv','Official requirements can support guides; FPS requires documented inputs and tests','medium','Build a reproducible game/version/settings dataset'],
 ['P2','Custom domain deployment','blocked by unavailable Sites tools','.openai/hosting.json','Existing domain works; new release not deployed','medium','Native Sites save/deploy/status and then repeat live crawl'],
 ['P2','Misspelled domain','unresolved ownership','live-audit.json','Request failed; no ownership inference','low','Owner checks registrar; redirect if already owned']
];
csv('02-technical-backlog.csv',backlog.map(([priority,issue,status,file,acceptance,risk,next])=>({priority,issue,status,file,acceptance,risk,next})));
const planned=[
 ['compare/rtx-5070-ti-vs-rx-9070-xt','RTX 5070 Ti vs RX 9070 XT','comparison','Exact official specs; independent matching-settings tests','Current original GPU face-offs suggest adjacent comparison intent; exact pair demand still needs measurement'],
 ['compare/rtx-5060-ti-16gb-vs-rtx-5060-ti-8gb','RTX 5060 Ti 16 GB vs 8 GB','comparison','Exact capacity variants; identical game/settings original testing','NVIDIA explicitly lists both variants; repeated capacity-choice questions'],
 ['compare/rtx-5070-vs-rtx-4070-super','RTX 5070 vs RTX 4070 Super upgrade','comparison','Official specs; current exact listings; matched game suite','Current price-watch coverage discusses the upgrade; current demand not quantified'],
 ['compare/ryzen-5-7600-vs-ryzen-5-9600x','Ryzen 5 7600 vs Ryzen 5 9600X','comparison','Official specs; exact BIOS support; matched workload tests','Adjacent CPU platform intent; provisional until query/property evidence'],
 ['compare/ddr5-6000-cl30-vs-cl36','DDR5 6000 CL30 vs CL36','comparison','Kit SKUs; timing calculation; workload tests before FPS claims','Multiple current SERP entries and recurring community questions'],
 ['blog/b650-tomahawk-9800x3d-bios','B650 Tomahawk 9800X3D BIOS support','compatibility','Current CPU support table and exact minimum BIOS','Relevant listed board and selected CPU; support table extraction blocked'],
 ['blog/north-gpu-radiator-clearance','Fractal North GPU radiator clearance','compatibility','Exact enclosure manual; GPU SKUs; radiator/fan measurements','Existing fit guide documents configuration-specific need'],
 ['blog/b650-tomahawk-m2-slot-sharing','B650 Tomahawk M.2 slot sharing','compatibility','Board revision/manual; CPU-specific slot notes','MSI specification explicitly documents M2_3 and PCI_E2 sharing'],
 ['games/fortnite-pc-performance','Fortnite PC requirements and FPS planning','game','Current Epic requirements; versioned test/estimate methodology; licensed art','Current official requirements page found; no popularity ranking established'],
 ['games/valorant-pc-performance','Valorant PC requirements and frame-rate targets','game','Current Riot requirements; target-vs-measured distinction; tests','Official Riot specs found; current search demand still unquantified'],
 ['games/counter-strike-2-pc-performance','Counter-Strike 2 PC performance planning','game','Current Valve requirements; patch/settings/test evidence','Site game catalog relevance; provisional until requirements and demand verified'],
 ['builds/canada-1440p-gaming-pc','Canada 1440p gaming PC build','build','All required components; exact verified CAD offers; BIOS/cable/fit checks','Canadian retailer/context advantage; current exact prices unavailable'],
 ['builds/usa-1440p-gaming-pc','USA 1440p gaming PC build','build','All required components; exact verified USD offers; total-cost notes','US buying intent; no verified current price coverage'],
 ['builds/quiet-gaming-pc','Quiet gaming PC build and airflow plan','build','Complete sourced build; acoustic original testing; fan/mount checks','Relevant indexed fans/cases; acoustics not measured']
];
const completed=pages.map(p=>({route:p.route,query:p.type==='pillar'?p.title:p.title.split(':')[0],type:p.type,requirements:p.ids?'Published reference specifications and exact variant checks':p.tool?'Transparent formula and supported input units':'Primary documentation and actionable checklist',evidence:p.sources.map(s=>sources[s][1]).join(' | '),status:'implemented local; deployment pending',confidence:p.type==='comparison'?'medium: observed queries and direct specifications':'medium: documented utility; volume unknown'}));
const launches=[...completed,...planned.map(([route,query,type,requirements,evidence])=>({route,query,type,requirements,evidence,status:'planned; not generated or indexed',confidence:'provisional: validate demand and required data before publication'}))];
csv('03-keyword-opportunities.csv',launches.map((p,i)=>({priority:i<10?'launch':'evidence-dependent',query_cluster:p.query,intent:p.type==='comparison'?'compare exact alternatives':p.type==='build'?'plan and buy a complete PC':p.type==='tool'?'perform a calculation':p.type==='game'?'understand requirements and performance':'learn or verify compatibility',audience:'PC builders and upgrade buyers',proposed_url:'/'+p.route+'/',country:'CA and US unless meaningful locale-specific data',search_volume:'unavailable',difficulty:'unavailable',current_site_impressions:'unavailable',evidence_date:date,evidence:p.evidence,confidence:p.confidence,original_value:p.type==='tool'?'Local transparent arithmetic':p.type==='comparison'?'Exact variants plus purchase/fit checklist':'Sources linked to relevant tools and decision checks'})));
write('04-information-architecture.md',`# Information architecture and index policy

Home → Hardware / Comparisons / Builder / FPS / Blog / Shop. Planning calculators are linked from the homepage, relevant guides and the footer. Do not add a navigation item for every content subtype.

## Stable searchable resources

/hardware/ and 18 category paths have initial HTML tables. /learn/{product-id}.html retains existing product URLs; changing every slug would create migration risk. Three /compare/{specific-pair}/ paths have unique titles, specifications, decisions and sources. /blog/ contains four expanded pillars and existing explainers. /tools/ links two calculators. /editorial-policy/ and /about/ document accountability.

## Tool states

Arbitrary /compare/?parts=, /hardware/?q=, category/era/sort combinations and /builder/?build= are user tool states, not automatically approved landing pages. Client metadata marks state requests noindex/follow and maps known pairs to their permanent canonical. The request-layer adapter in scripts/seo-http-policy.cjs supplies actual headers, redirects and invalid-ID 404s; it is not installed on the live static host. Do not call the client fallback complete server-side control.

Pagination has normal anchor links and self-canonicals; pages 2+ are noindex/follow and omitted from the sitemap. Products remain linked even without JavaScript. Thin products retain the existing noindex quality gate. Duplicate identities canonicalize to the most complete record. Canonical does not prove that Google has accepted the preferred URL.

## Locale

CA/US is a user-selected preference on the same URL, stored locally. Do not make currency-only pages or hreflang variants. Separate Canadian/US complete-build pages are in the backlog only when verified retailer lists and purchase context make them substantially different.

## Navigation and links

Homepage → featured researched comparison and calculators. Pillar → exact category, comparison/checklist and builder. Comparison → product specifications, relevant pillar, manual checks and a builder prefilled with only that CPU/GPU. Product → stable category, buying section and interactive comparison. Blog → pillars, upgrade checklist and calculators. All new pages link the correction policy.

## Quality gate

Require a distinct question, exact identity, source access date, useful answer/checklist or formula, honest missing-data notes, conversion path, valid metadata and a rendering/link check. Do not publish pair permutations, unsupported budget totals or template-only game hubs. Planned rows in the launch backlog have no generated URLs and are not in the sitemap.`);
csv('04-internal-link-map.csv',pages.flatMap(p=>p.links.map(target=>({source:'/'+p.route+'/',target,placement:'related resource / next action',purpose:target.startsWith('/builder/')?'use builder':target.startsWith('/hardware/')?'browse exact products':target.startsWith('/tools/')?'calculate':'continue decision research'}))));
write('05-implementation/change-map.md',`# Implementation map

- scripts/seo-launch-content.cjs: ten complete editorial/tool page definitions and source registry.
- scripts/seo-launch.cjs: static category tables, pagination, articles, comparisons, tools, policy and internal links.
- scripts/build-pages.cjs: deterministic build hook, navigation override, lightweight calculator script and shared styles.
- scripts/shopping-pages.cjs: 24 initial shop cards, source-aware product buying sections; duplicate Product declaration removed; expiry wording corrected.
- scripts/seo-pass.cjs: pagination noindex policy, stable category links, one Product declaration, strict image identity check, visible ItemList schema and RSS additions.
- dist/interface.js: empty-result text inserted only when the filtered catalog is actually empty.
- dist/shopping.js: an early price response cannot erase the initial catalog while the shopping catalog is loading.
- dist/builder-v2.js: “No conflict found in indexed checks” replaces the broader compatibility verdict.
- dist/research-tools.js: local arithmetic with no dependency or network request.
- dist/indexing-policy.js: client fallback for parameterized tool states.
- scripts/seo-http-policy.cjs: tested but undeployed HTTP adapter.
- .github/ISSUE_TEMPLATE/data-correction.yml: correction intake without a fabricated email address.
- scripts/check-seo-launch.cjs: content, discovery, schema, actual calculator behavior and adapter checks.

## Build and rollback

The branch began at 04ce692, with a clean working tree. Generated files are reproducible through scripts/build-pages.cjs. Product HTML is intentionally ignored by Git and regenerated during a build. Retain the prior production deployment for rollback when the hosting connector is available. Do not overwrite production with an untested deployment or delete prior versions.

## Validation commands

node scripts/build-pages.cjs
node scripts/check-seo.cjs
node scripts/check-seo-launch.cjs
node scripts/check-blog-models.cjs
node scripts/check-cooling.cjs

These checks do not replace production HTTP verification or Google Rich Results Test.`);
write('06-page-templates.md',`# Page templates and release gates

## Exact comparison

Unique query/title/H1 → answer → exact pictured variants → manufacturer specification table → interpretation and decision conditions → measured-test links with context → fit/BIOS/cable caveats → current-price availability statement → product/build links → source date → corrections. Use Article and BreadcrumbList for the authored explainer. Never infer game FPS from specifications or call a launch MSRP a current price.

## Product reference

Breadcrumb → exact identity and pictured model alt text → summary/specifications with units → buying section with exact-offer or search distinction → variant notes and primary source → image source. Use one Product, with image only when identity matches. No Offer/review/rating without genuine visible evidence. Thin entries remain noindex. Review GPU physical dimensions, CPU BIOS/cooling, board lane behavior, RAM kit/profile, SSD capacity/interface/endurance, PSU connectors and case clearances individually.

## Compatibility guide

Short answer → exact scope/configuration → source/manual table → checked/unresolved/not-applicable checklist → installation/firmware notes → limitations → builder link. Unknown is not pass. A socket or slot count alone cannot certify the system. Exact minimum BIOS remains missing until the CPU-support table is checked.

## Game hub (not generated)

Exact edition/platform/patch → official requirements → settings/resolution/native/upscaled/generated distinction → measured results only with test system and methodology → clearly labeled model estimates where supported → CPU/GPU/RAM interpretation → console modes with separate sources → update date and change log. A trailer and a generic FPS range are not sufficient.

## Complete build (not generated)

Purpose → country/date → every required part and exact SKU → honest checked price coverage and subtotal → compatibility checks/unresolved items → cooler/connector/fit justification → alternatives → prefilled builder → maintenance schedule. Do not index an incomplete bill of materials or a budget claim based on missing prices.

## Pillar

Clear purpose → decision-first summary → five readable sections → relevant specifications with limitations → actionable checklist → sources → dated material revision → category/tool/comparison links. No word-count quota or filler FAQ. Organizational byline is honest; unknown first-publication date stays unknown.

## Calculator / report

Inputs and units → immediate usable result → formula → examples → assumptions/unsupported cases → source date → error reporting → related purchase/compatibility resources. Show math when JavaScript is unavailable. A theoretical CAS interval is not total system latency; a storage budget is not a fit certificate.

## Editorial review

Verify claims against primary sources, distinguish independent testing from manufacturer benchmarks, identify the exact SKU and source date, check rights for new images, check all units/links and approve indexing only after the page has distinct value. Use a real reviewer only when that review actually happens.`);
csv('07-launch-backlog.csv',launches.map((p,i)=>({order:i+1,url:'/'+p.route+'/',type:p.type,target_query:p.query,title:pages.find(a=>a.route===p.route)?.title||p.query,meta_description:pages.find(a=>a.route===p.route)?.description||'To be written after evidence gate',h1:pages.find(a=>a.route===p.route)?.title||p.query,audience:'PC upgrade buyers and builders',outline:pages.find(a=>a.route===p.route)?.sections.map(s=>s[0]).join(' | ')||'Answer; exact identities; evidence; checklist; limitations; next action',data_requirements:p.requirements,sources:p.evidence,original_value:p.type==='tool'?'Transparent working formula':p.type==='comparison'?'Variant-specific decision and build path':p.type==='game'?'Requirements and settings connected to evidence':p.type==='build'?'Complete regional bill of materials and documented checks':'Practical sourced decision checklist',internal_links:pages.find(a=>a.route===p.route)?.links.join(' | ')||'Relevant category, pillar, product and builder',conversion:'Use builder or compare exact products',schema:p.type==='tool'?'WebPage; BreadcrumbList':p.type==='game'||p.type==='build'?'Choose only after visible data established':'Article; BreadcrumbList',images:p.type==='comparison'?'Named actual partner card / exact CPU with source':p.type==='game'?'Rights-cleared exact game/platform artwork':'Text first; do not add decoration',freshness:p.type==='build'?'Recheck each offer; expire prices after 15 min':p.type==='game'?'Review major patch / requirements change':'Quarterly; earlier on relevant launch/source change',qa_status:p.status,confidence:p.confidence})));
for(const p of pages)write('08-content/'+p.route.replaceAll('/','--')+'.md',`# ${p.title}

URL: /${p.route}/
Meta description: ${p.description}
By PC Part Performance. ${p.type==='pillar'?'Materially revised':'Draft created'} October 3, 2026. ${p.type==='pillar'?'Original publication date not recorded.':'First publication remains pending deployment.'}

${p.answer}

${p.rows?'## Manufacturer specifications\n\n| Specification | '+p.ids.join(' | ')+' |\n| --- | --- | --- |\n'+p.rows.map(r=>'| '+r.join(' | ')+' |').join('\n')+'\n\n':''}${p.sections.map(([title,...paras])=>'## '+title+'\n\n'+paras.join('\n\n')).join('\n\n')}

## Sources

Checked ${date}.

${p.sources.map(s=>'- ['+sources[s][0]+']('+sources[s][1]+')').join('\n')}

## Related resources

${p.links.map(l=>'- '+l).join('\n')}

Corrections: /editorial-policy/#corrections. Interactive calculators and their visible examples are implemented in scripts/seo-launch.cjs and dist/research-tools.js.`);
const calendar=[
 ['Days 1–7','Publish tested release; validate HTTP and source discovery','Deploy, repeat raw crawl, inspect representative URLs in Search Console, validate sitemap and query rules','Sites tools; Search Console owner access','Do not measure growth before establishing a baseline'],
 ['Days 8–14','Measure visitor intent and event quality','Connect privacy-respecting analytics; QA events, compare source groups and bot filtering','Analytics property; consent decision','No content quota; resolve tracking/crawl defects first'],
 ['Days 15–21','Promote calculators with demonstrations','Produce one RAM and one storage walkthrough, source notes and a screenshot; prepare outreach drafts','Final published URLs; accurate demo','No unsolicited posts or messages sent by this task'],
 ['Days 22–30','Validate next comparison demand','Export non-branded queries; select two comparison opportunities with complete primary-source coverage','Search Console export or measured query research','Review first 30-day indexing and tool engagement; no ranking guarantee'],
 ['Days 31–45','Publish exact compatibility resources','Finish board BIOS/slot-sharing checks; review with manuals and explicit unknowns','CPU support list; exact firmware and board revision','Do not publish minimum BIOS without verified entry'],
 ['Days 46–60','Develop game performance evidence','Version the test/estimate dataset; draft Fortnite/Valorant/CS2 only after method and requirements verified','Original tests or validated estimate input set; image rights','60-day review of non-branded engaged users and tool completions'],
 ['Days 61–75','Complete regional build resources','Connect authorized exact-SKU offers; prepare complete CA/US bills of materials and unresolved checks','Reliable offers; stock timestamps; all parts and fit data','No unsupported budget claim or inferred exchange-rate price'],
 ['Days 76–90','Refresh, distribute and prune','Review sources, fix errors, update winning resources; retire unsupported drafts; produce one citation-ready report if data permits','Measured usage and reproducible public data','90-day cohort review; prioritize evidence over page volume']
];
csv('09-editorial-calendar.csv',calendar.map(([window,theme,actions,dependencies,checkpoint])=>({window,theme,actions,dependencies,checkpoint,owner:'Site owner / editorial maintainer',success_definition:'Useful published evidence and qualified tool engagement; numeric target set after baseline'})));
write('10-structured-data/README.md',`# Structured-data policy

Generated HTML is the source of truth; examples below are extracted from the tested build. Article/WebPage + BreadcrumbList for researched resources, ItemList for the products visibly listed on each catalog page, Product once for canonical product records, Organization + WebSite on home. Existing articles retain their actual legacy dates established by repository commit history (September 18, 2026); new drafts use the release date and expanded pillars omit an unknown first-publication date.

Product identity and visible content must match. This release adds no Offers, AggregateRating or Review. A bare Product with specifications need not qualify for a Google product rich result; do not fabricate required commercial data to gain eligibility. Strict identity matching excludes unrelated partner images from generic Product schema. Schema image rights are a separate editorial check.

No FAQPage, NewsArticle, HowTo or VideoObject was added solely for visibility. A YouTube link is not evidence that the site owns or embeds a video. JSON parsing and semantic invariants pass locally; Google Rich Results Test and Search Console enhancement checks remain post-deployment tasks. Passing JSON validation is not equivalent to Google eligibility.

Official guidance: https://developers.google.com/search/docs/appearance/structured-data/article, https://developers.google.com/search/docs/appearance/structured-data/product and https://developers.google.com/search/docs/appearance/structured-data/breadcrumb (checked ${date}).`);
for(const [label,file]of [['comparison','dist/compare/rtx-5070-vs-rtx-5060-ti-16gb/index.html'],['product','dist/learn/9800x3d.html'],['catalog','dist/hardware/graphics-cards/index.html'],['organization','dist/index.html']]){const h=fs.readFileSync(file,'utf8');write('10-structured-data/'+label+'.json',JSON.stringify([...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1])),null,2))}
const events=[
 ['page_view','One per committed navigation, after consent','canonical_path,page_type,country','Exclude preview traffic, admin/testing and crawlers'],
 ['catalog_search','Debounced user input that returns results','category,result_count,query_length','Never send raw query text or URL query'],
 ['filter_change','User changes a facet, once per settled state','group,selection_count,category','OR within group; no text from search field'],
 ['comparison_start','User explicitly chooses first comparison item','category,part_count','Default example render is not a start'],
 ['comparison_updated','User adds/removes/replaces a part','category,part_count,action','Do not count redraws as changes'],
 ['builder_start','Empty→one user-selected component','country,component_category','Loading a shared build is separate from an organic start'],
 ['part_added','User-selected component added to a build','category,part_id,component_count','Include fan instances; deduplicate repeated rendering'],
 ['build_ready','Required selected categories complete','country,component_count,unresolved_checks','Means selected parts, not certified compatibility; not a purchase'],
 ['retailer_click','User opens retailer listing/search','store,country,part_id,link_type','Distinguish verified exact offer from search; no destination query text'],
 ['share_build','Confirmed copy/share action succeeds','country,component_count,method','A button click that fails is not success'],
 ['article_engaged','Visible reading ≥30 seconds and ≥50% article progress','canonical_path,article_category','Pause timer when hidden; exclude bots; proxy, not proof of reading'],
 ['calculator_used','Valid form submit returns a result','tool_id','Do not send entered workload amounts or personal data'],
 ['rss_click','Explicit RSS link click','canonical_path','Click is not a confirmed subscription'],
 ['correction_click','Explicit correction intake link','canonical_path','Do not track issue content or identifying information']
];
csv('11-event-spec.csv',events.map(([event,trigger,fields,guard])=>({event,trigger,allowed_parameters:fields,privacy_and_quality_guard:guard,status:'specified; analytics adapter not installed'})));
write('11-analytics-plan.md',`# Analytics and baseline plan

No analytics property, Search Console data or logs were connected. No tracker was installed and no visitor statistics were invented. The event specification is implementation-ready; an owner must choose/connect the property and consent policy before transmission is enabled.

## Baseline export

Search Console: preceding 28 and 90 days, country, device, page and query; impressions, clicks, CTR and average position. Classify brand variants including PC Part Performance and domain spellings, then report non-branded queries separately. Preserve aggregation/privacy limitations. Record sitemap status, indexed/excluded URLs and representative URL inspection results.

Analytics: new active users, returning active users, engaged sessions, source/medium, country/device, tool starts and successful actions. “Unique” users are a measurement estimate, not a count of known distinct people. Compare date-aligned periods and distinguish release traffic from ordinary usage. Do not use fingerprinting, persistent cross-site identifiers or raw search/build URLs.

Logs: aggregate status codes, user-agent bot signatures and abusive request rates. Do not identify humans solely by IP or send private logs to a third party. Apply consent and privacy requirements for the chosen analytics setup. Filter development/preview hosts and staff testing.

## Event adapter contract

Accept only the event names and enumerated fields in 11-event-spec.csv after consent. Use canonical_path without query/hash. Keep country CA/US, known category/store enums and catalog part IDs; reject free-text fields. Queue only in memory if the destination is unavailable; discard on consent withdrawal. No analytics call may block a picker, calculator or navigation. Do not infer conversions from render events or default comparisons.

Validate with real interactions and a debug property: one event per semantic action; no duplicate event after redraw; no network before consent; no payload PII; no event on bot/test traffic. Build_ready is a selected-list milestone, not fit certification. Retailer clicks do not establish a purchase.

## 30/60/90-day decisions

Day 30: verify indexing/discovery and event accuracy; compare non-branded engaged users and comparison/builder starts against a valid prior baseline. Day 60: inspect query→page→tool paths and repeat use; improve resources with evidence of unmet intent. Day 90: compare returning-user cohorts, qualified tool completions and legitimate referrals; discontinue pages that lack utility. Set numerical targets only after the baseline and tracking reliability are known.

## Performance monitoring

Use field Core Web Vitals at the 75th percentile by mobile/desktop where sufficient data exists: LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1. Keep lab runs, connection/device settings and field data separate. A fast local result does not prove field performance.`);
write('12-distribution-plan.md',`# Legitimate distribution plan

The useful assets are the transparent RAM/storage calculators, sourced comparison tables and compatibility checklist. First publish and validate their final URLs. No outreach messages, social posts, paid placements or account creation were performed.

## Prepare useful demonstrations

Create a short screen recording showing two RAM profiles with the same calculated CAS interval, and a storage plan that exceeds its capacity. Describe the formulas and limits. Link the relevant guide and methodology. Do not title the RAM demonstration as a guaranteed FPS boost.

## Community use

When a real builder asks the corresponding question, answer it in place and cite manufacturer evidence. Offer the calculator only when it helps that question, disclose site ownership and follow community rules. Avoid repeated link drops, copied comments and vote manipulation. Owner approval is required before this agent sends messages or posts.

## Citation-ready assets

Offer the source date, formula, examples and a plain-text methodology so a writer can verify the resource. A future case-clearance or connector report needs a documented dataset, sampling method, rights and missing-data coverage before outreach. Do not market the current 3D manifest as exact fit verification.

## Search and retention

Link relevant resources from product pages and pillars; keep RSS useful by adding substantive revisions/new guides. Search visibility comes from accessible distinct answers and evidence, not a special AI-search tag. Do not create answer-engine-only duplicate pages or promise inclusion in Google news/AI results.

## Measure

Track qualified referral engagement and successful tool use after analytics is connected. Record outreach channel, exact helpful context and the linked asset without collecting private messages. Revise the plan at 30/60/90 days based on actual engagement, not backlink-count quotas.`);
write('13-qa-report.md',`# QA report

Local static build validation: ${seo.pages} HTML pages, ${seo.indexablePages} canonical indexable pages and ${seo.localLinks} local references checked at the time this document was generated. Refresh docs/seo-validation.json after the final build for authoritative counts.

## Automated checks

check-seo.cjs checks one H1/title/description/canonical/robots/social title, unique indexable titles, local references, JSON parsing and sitemap alignment. check-seo-launch.cjs verifies ten substantive resources, all 1,186 products discoverable in HTML, initial catalog/shop content, one Product declaration, actual calculator arithmetic (including equal CAS intervals and storage over-budget), and undeployed request-adapter behavior. check-blog-models.cjs validates existing blog sources/links and GLBs. check-cooling.cjs checks supported, unsupported, mixed and unknown fan configurations.

## Browser inspection

Inspection is recorded in browser-qa.json and the final handoff. Tests cover desktop/mobile layouts, light/dark modes, actual calculator forms, catalog search/pagination, shop facets/country choice and conversion links. Screenshots are visual evidence; raw HTML discovery tests supply the no-JavaScript evidence. No screen-reader assistive-technology session was performed; semantic names, labels and keyboard-operable native forms were reviewed.

## Performance limits

New calculators use local arithmetic and no third-party dependency. Research pages avoid the full interactive catalog script stack. Existing builder/3D and FPS dependencies were preserved. Styles remain content-addressed. Page/script sizes are in performance-budget.json. No field CWV, Lighthouse score or global speed guarantee is claimed. Network/font/image and production caching measurements remain necessary.

## Production limitations

Live query exclusion headers and old-guide HTTP redirect behavior require hosting verification. The adapter tests do not establish production behavior. Google Rich Results Test was not run and JSON/schema invariants do not guarantee rich-result eligibility. No live deployment was completed. Compare live-audit.json with the release after deployment to confirm actual initial HTML and status changes.`);
const google=[['Google helpful content','https://developers.google.com/search/docs/fundamentals/creating-helpful-content'],['Google JavaScript SEO','https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics'],['Google AI features','https://developers.google.com/search/docs/appearance/ai-features'],['Google faceted navigation','https://developers.google.com/crawling/docs/faceted-navigation'],['Google spam policies','https://developers.google.com/search/docs/essentials/spam-policies'],['Google Core Web Vitals','https://developers.google.com/search/docs/appearance/core-web-vitals'],['Google Product','https://developers.google.com/search/docs/appearance/structured-data/product'],['Google Article','https://developers.google.com/search/docs/appearance/structured-data/article'],['Google Breadcrumb','https://developers.google.com/search/docs/appearance/structured-data/breadcrumb']];
const demand=[['Community exact RTX capacity question','https://www.reddit.com/r/buildapc/comments/1uog4l4/for_close_to_the_same_price_5060_ti_16gb_or_5070/'],['Community DDR5 CL30 vs CL36 question','https://www.reddit.com/r/PcBuildHelp/comments/1ub5nmi/cl30_vs_cl36/'],['Competing RAM calculator','https://specscalc.com/ram-latency-calculator/'],['Fortnite official requirements','https://www.epicgames.com/help/c-34254770/c-37371353/a16548002'],['Valorant official requirements','https://playvalorant.com/en-us/specs/']];
csv('14-source-register.csv',[...Object.entries(sources).map(([id,[name,url]])=>({id,title:name,url,access_date:date,type:id.startsWith('test')?'independent original testing':'manufacturer documentation',used_for:pages.filter(p=>p.sources.includes(id)).map(p=>p.route).join(' | '),status:id==='board'?'PDF extraction failed; equivalent slot claim verified on MSI US specification; linked as further reading':'reviewed through browser/search extraction',limitations:id.startsWith('test')?'No measurements imported; date/settings remain those of the source':id==='board'?'CPU support table/minimum BIOS still unresolved':'Specification or explanation; not a hands-on test or proof of image license'})),...google.map(([title,url],i)=>({id:'google-'+i,title,url,access_date:date,type:'official search guidance',used_for:'Technical/index/schema/content policy',status:'reviewed',limitations:'No guarantee of indexing, rank or rich results'})),...demand.map(([title,url],i)=>({id:'demand-'+i,title,url,access_date:date,type:i<3?'SERP/community demand proxy':'official game requirements discovered',used_for:'Launch shortlist / evidence-dependent backlog',status:'search results reviewed',limitations:'No search volume/popularity claim; game hubs not yet drafted'}))]);
write('15-status-and-blockers.md',`# Status and blockers

## Completed locally

Ten complete resources (four expanded pillars, three comparisons, one upgrade checklist, two calculators); 18 static category paths; 88 noindex/follow pagination pages; initial shop cards; structured-data deduplication and identity checks; indexing fallback and tested host adapter; editorial/correction process; all fifteen requested deliverable groups. Existing working tools and historical product URLs are preserved.

## Still blocked or not yet completed

- Production publish: native Sites tools are absent from the callable tool inventory. No deployment or live-domain update can be truthfully claimed. The existing project manifest is retained. Publishing must use the Sites workflow/native deploy and then verify deployment status and live responses.
- Search Console, analytics and server logs: no connected property or exports. Baseline, search volumes, actual visitors, ranking changes and field CWV are unavailable. Analytics is specified; no tracker was activated.
- Request layer: parameter exclusion/known-pair redirects/invalid-ID 404 policy is implemented as an adapter, not installed on the static host. Client metadata is only a fallback.
- Reliable retailer prices: no new live provider or exact offers obtained. Existing prices expire after 15 minutes; no fabricated price or Offer schema added. Three regional/purpose build pages remain ungenerated.
- Original game tests and validated estimate calibration: unavailable. Three game hubs remain ungenerated; official requirements are acquisition leads, not measured FPS.
- Exact motherboard BIOS: support table extraction unavailable; checklist identifies the unresolved check. No minimum BIOS invented.
- Image/3D verification: all metadata can be inventoried, but manufacturer media links do not prove reuse rights. Many reference/family photos remain. Current models have zero clearance-verified records. This release does not claim all parts have exact models.
- Misspelled-domain ownership is unknown. Do not treat a failed fetch as evidence the domain is unregistered.

## Next concrete actions

Publish this recoverable branch with native Sites tools. Install or map the HTTP indexing policy to a supported request-layer capability. Repeat the live response crawl and inspect ten launch URLs plus representative products/categories in Search Console. Connect a privacy-respecting analytics property, establish the baseline and validate semantic events. Then select the next comparison/compatibility pages using actual query evidence and acquire exact offers/tests before budget/game pages.

## Guarantees intentionally not made

No promise of traffic, Google rank, Discover/news inclusion, rich results, measured FPS, exact fit or complete live prices. The release improves accessible content and decision usefulness; outcomes require production deployment and observation.`);
console.log('Wrote 15 SEO deliverable groups and ten complete content drafts.');
