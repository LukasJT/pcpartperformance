const fs=require('node:fs'),path=require('node:path'),models=require('./phone-models.json'),phones=require('./phone-data.cjs');
module.exports=({root,images,esc})=>{
 const data=Object.values(models);fs.writeFileSync(path.join(root,'data/phone-models.json'),JSON.stringify(data));
 fs.copyFileSync(path.join(__dirname,'phone-clarity.css'),path.join(root,'phone-clarity.css'));
 const photo=p=>{const m=models[p.id],a=images[(m?.ids||[p.id,...(p.id==='pixel-9-pro'?['pixel9pro']:[])]).find(id=>images[id])];return a?`<figure class="phone-artwork"><img src="${esc(require('./program-image-delivery.cjs').source(p.id,a,root))}" alt="${esc(a.picturedModel||p.name)}" width="${a.width||800}" height="${a.height||500}" loading="lazy" decoding="async"></figure>`:`<figure class="phone-artwork"><svg viewBox="0 0 75 155" role="img" aria-label="${esc(p.name)} body outline"><rect x="2" y="2" width="71" height="151" rx="9" fill="none" stroke="currentColor" stroke-width="2"/></svg></figure>`};
 const cards=ids=>`<section class="phone-comparison-views${ids.length===1?' phone-single-view':''}" aria-label="Phone viewing angles">${ids.map(id=>{const p=phones.find(p=>p.id===id);return `<article class="phone-comparison-item" aria-label="${esc(p.name)} preview">${ids.length>1?`<h2>${esc(p.name)}</h2>`:''}<div data-phone-preview="${esc(id)}">${photo(p)}</div></article>`}).join('')}</section>`;
 const phoneOptions=html=>html.replace(/<option value="([^"]+)"/g,(match,id)=>{const p=phones.find(p=>p.id===id);if(!p)return match;const brand=id.startsWith('iphone-')?'Apple':id.startsWith('pixel-')?'Google':id.startsWith('galaxy-')?'Samsung':'OnePlus';const m=models[id],a=images[(m?.ids||[id,...(id==='pixel-9-pro'?['pixel9pro']:[])]).find(alias=>images[alias])];return `${match} data-has-model="${Boolean(m)}" data-brand="${brand}"${a?` data-image="${esc(a.src)}"`:''}`});
 const scripts='<link rel="stylesheet" href="/phone-preview.css"><script src="/phone-preview.js?v=20261004d" defer></script>';
 const edit=(route,fn)=>{const file=path.join(root,route,'index.html');let html=fs.readFileSync(file,'utf8');html=fn(html).replace('</head>',scripts+'</head>');fs.writeFileSync(file,html)};
 for(const p of phones)edit('phones/'+p.id,html=>html.replace(/<div class="phone-preview">[\s\S]*?<\/div>/,'').replace('<article class="publication-copy">',cards([p.id])+'<article class="publication-copy">'));
 for(const [a,b]of[['iphone-16','iphone-16-pro'],['iphone-16','pixel-9']])edit('phones/compare/'+a+'-vs-'+b,html=>html.replace('<article class="publication-copy">',cards([a,b])+'<article class="publication-copy">'));
 edit('phones/size-compare',html=>phoneOptions(html).replace(/<div id="phone-design-view" data-phone-design(?: hidden)?><\/div>/,`<div id="phone-design-view" data-phone-design hidden><div data-phone-comparison>${cards(['iphone-16','pixel-9'])}</div></div><template data-phone-view-templates>${cards(phones.map(p=>p.id))}</template>`).replace('</head>','<link rel="stylesheet" href="/builder-refresh.css"><script src="/select-ui.js?v=20261004f" defer></script><script src="/phone-compare-ui.js?v=20261004d" defer></script></head>'));
 const creditFile=path.join(root,'builder/model-credits/index.html');let credit=fs.readFileSync(creditFile,'utf8');credit=credit.replace('<p class="data-note">Preview geometry',`<section id="phone-models"><h2>Phone models</h2>${data.map(m=>`<article id="phone-${esc(m.ids[0])}" class="source-details" style="padding:1.5rem;margin:1rem 0"><h3>${esc(m.name)}</h3><p><a href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.title)}</a> by ${m.creatorUrl?'<a href="'+esc(m.creatorUrl)+'" target="_blank" rel="noopener">'+esc(m.creator)+'</a>':esc(m.creator)} · <a href="${esc(m.licenseUrl||'https://creativecommons.org/licenses/by/4.0/')}">${esc(m.license)}</a>.</p><p>Changes: ${esc(m.changes||'Deduplicated geometry, pruned unused nodes and Meshopt compression.')}${m.name==='Galaxy S25'?' One phone extracted from the two-instance scene.':''} ${esc(m.note||'Appearance preview; not a manufacturer-certified dimensional model.')}</p><a href="/phones/${Object.keys(models).find(k=>models[k]===m)}/">View phone</a></article>`).join('')}</section><p class="data-note">Preview geometry`);fs.writeFileSync(creditFile,credit);
};

const phoneIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M10 18h4"/></svg>';
const cubeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Z M3 7l9 5 9-5 M12 12v10"/></svg>';
const scaleIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 20V4h16v16Z M4 8h4 M4 12h6 M4 16h4 M8 4v4 M12 4v6 M16 4v4"/></svg>';
const specsIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 5h14v14H5Z M5 10h14 M11 10v9"/></svg>';
function comparisonUrl(phone,view='size'){
 return '/phones/size-compare/'+(phone?'?a='+encodeURIComponent(phone.id)+'&b='+(phone.id==='iphone-16'?'pixel-9':'iphone-16')+'&view='+view:'?view='+view);
}
function phoneNavigation(phone,esc){
 return `<nav class="phone-section-nav" aria-label="Phone tools" data-phone-clarity><a class="phone-home-link" href="/phones/">${phoneIcon}<span>Phones</span></a><a href="${esc(comparisonUrl(phone,'size'))}">${scaleIcon}<span>Compare size</span></a><a href="${esc(comparisonUrl(phone,'design'))}">${cubeIcon}<span>3D views</span></a><a href="${esc(comparisonUrl(phone,'specs'))}">${specsIcon}<span>Compare specs</span></a></nav>`;
}
function decorateHtml(html,{route,phone=null,esc}){
 if(html.includes('data-phone-clarity'))return html;
 // This is a presentation pass after the hub and optional video writers. The
 // exact-model source data and creator/license registry remain unchanged.
 html=html.replace(/<section class="review-panel"[^>]*data-phone-review-panel[\s\S]*?<\/section>/,'');
 html=html.replace(/<details class="phone-method">[\s\S]*?<\/details>/,'');
 if(!html.includes('data-video-id'))html=html.replace(/<script src="\/review-video-ui\.js" defer><\/script>/,'');
 const navigation=route==='/phones/'?'<div data-phone-clarity hidden></div>':route==='/phones/size-compare/'?`<nav class="phone-section-nav" aria-label="Phone tools" data-phone-clarity><a class="phone-home-link" href="/phones/">${phoneIcon}<span>Phones</span></a><a href="/phones/#phone-catalog">Browse models</a><a href="/phones/software-support/">Software support</a></nav>`:phoneNavigation(phone,esc);
 html=html.replace('<main id="main" tabindex="-1">','<main id="main" tabindex="-1">'+navigation);
 html=html.replace('</head>','<link rel="stylesheet" href="/phone-clarity.css"></head>').replace(/src="\/phone-preview\.js(?:\?[^\"]*)?"/g,'src="/phone-preview.js?v=20261014clarity"').replace('src="/phone-comparison.js"','src="/phone-comparison.js?v=20261014clarity"');
 html=html.replace('<body ','<body data-phone-page ');
 if(route==='/phones/'){
  html=html.replace('<h1>Find a phone that fits you.</h1>','<h1>Compare phones.</h1>').replace('Compare the body size, useful specifications and viewing angles of real phones. Start with two models, then explore the differences.','See the size. Explore the design. Compare the details.');
  html=html.replace(/<section class="program-panel"><h2>Choose with better context<\/h2>[\s\S]*?<\/section>/,`<section class="phone-related-guides" aria-labelledby="phone-guide-title"><h2 id="phone-guide-title">Before you choose</h2><div><a href="/blog/phone-software-support-commitment-vs-end-date/">Software updates and support</a><a href="/blog/usb-c-speed-charging-display-checklist/">USB-C speed and charging</a><a href="/phones/compare/iphone-16-vs-pixel-9/">iPhone 16 vs Pixel 9: size and support</a></div></section>`);
  html=html.replace('See height, width, thickness and weight at the same scale.','See two phones at the same scale.').replace('Rotate supported models and switch between front, back and side.','Turn a phone around and inspect the details.').replace('Compare sourced hardware and software-support commitments.','Screen, processor, storage and updates.').replace(/3D model available/g,'3D');
  html=html.replace(/<a class="button secondary" href="(\/phones\/size-compare\/\?a=([^&"]+)&b=[^&"]+)&view=size">Compare size<\/a>/g,(match,url,id)=>`<a class="button secondary" href="${url}&view=size">Compare</a>${models[id]?`<a class="phone-card-3d" href="${url}&view=design">${cubeIcon}3D view</a>`:''}`);
  for(const p of phones){const start=`<a href="/phones/${p.id}/"><h3>`,height=p.fields.height?.value,width=p.fields.width?.value;if(html.includes(start)&&Number.isFinite(height)&&Number.isFinite(width))html=html.replace(start,`<a href="/phones/${p.id}/"><svg class="phone-card-outline" viewBox="0 0 160 200" role="img" aria-label="${esc(p.name)} body dimensions"><rect x="${80-width/2}" y="${(180-height)/2}" width="${width}" height="${height}" rx="9" fill="none" stroke="currentColor" stroke-width="2"/></svg><h3>`)}
 }
 if(route==='/phones/size-compare/'){
  html=html.replace('Explore the design. Find the size that fits you.','Choose two phones. Switch between size, 3D and specifications.').replace('>3D & angles</button>','>'+cubeIcon+'<span>3D views</span></button>').replace('>Size</button>','>'+scaleIcon+'<span>Size</span></button>').replace('>Specifications</button>','>'+specsIcon+'<span>Specs</span></button>').replace('data-phone-mode-help>','data-phone-mode-help class="phone-accessible-help">').replace('>Copy comparison link</button>','>Share comparison</button>');
 }
 if(phone&&route.startsWith('/phones/')&&!route.startsWith('/phones/compare/')){
  html=html.replace(/(<h2>Software support<\/h2><p>)([\s\S]*?)(?: First availability[\s\S]*?)(<\/p>)/,'$1$2. Check the update policy for verified dates.$3');
  html=html.replace('Published hardware facts, with unknowns kept explicit.','Dimensions, specifications and 3D views.').replace('<caption>Verified fields</caption>','<caption>Specifications</caption>');
  html=html.replace(/<article class="publication-copy"><p>[\s\S]*?<\/p>/,`<article class="publication-copy"><p class="phone-specification-region">${esc(phone.region)} · checked ${esc(phone.verified)}</p>`);
  html=html.replace(/<h2>What these specifications cannot tell you<\/h2>[\s\S]*?(?=<h2>Software support<\/h2>)/,'<details class="phone-buying-notes"><summary>Before buying</summary><p>Check the exact regional model, storage, SIM support and accessories. Dimensions exclude added cases; 3D previews show appearance, not certified fit. Camera quality, battery life and current retailer stock have not been tested here.</p></details>');
  html=html.replace(/<section id="sources"><h2>Evidence and updates<\/h2>[\s\S]*?<\/section>/,match=>`<details class="phone-source-notes"><summary>Specifications and sources</summary>${match}</details>`);
 }
 return html;
}
module.exports.decorate=({root,records=[],esc})=>{
 fs.copyFileSync(path.join(__dirname,'phone-clarity.css'),path.join(root,'phone-clarity.css'));
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue}if(entry.name!=='index.html')continue;const route='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');const phone=phones.find(p=>route==='/phones/'+p.id+'/');const html=fs.readFileSync(file,'utf8');fs.writeFileSync(file,decorateHtml(html,{route,phone,esc}));}}
 walk(path.join(root,'phones'));
 for(const record of records.filter(record=>record.cat==='phone')){
  const file=path.join(root,'learn',record.id+'.html');if(!fs.existsSync(file))continue;
  const phone=phones.find(p=>p.id===record.id||models[p.id]?.ids.includes(record.id));
  fs.writeFileSync(file,decorateHtml(fs.readFileSync(file,'utf8'),{route:'/learn/'+record.id+'.html',phone,esc}));
 }
};
module.exports.decorateHtml=decorateHtml;
module.exports.comparisonUrl=comparisonUrl;
