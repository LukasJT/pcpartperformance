(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const games=window.performanceGames||[],consoles=window.consolePerformanceGames||[];
const params=new URLSearchParams(location.search),gpuSelect=$('#fps-gpu'),cpuSelect=$('#fps-cpu'),gameSelect=$('#fps-game');
const gpus=catalog.filter(p=>p.cat==='gpu'&&(p.specs['PassMark G3D']||p.specs['Memory bandwidth'])).sort((a,b)=>(b.year||0)-(a.year||0)||(b.specs['PassMark G3D']||0)-(a.specs['PassMark G3D']||0));
const cpus=catalog.filter(p=>p.cat==='cpu'&&p.specs['CPU cores']).sort((a,b)=>(b.year||0)-(a.year||0)||a.name.localeCompare(b.name));
const option=p=>`<option value="${esc(p.id)}">${esc(p.name)}${p.year?' · '+p.year:''}</option>`;
const gameStatus=game=>game.pcReleaseConfirmed===false?'PC release not announced':game.year;
gpuSelect.innerHTML=gpus.map(option).join('');cpuSelect.innerHTML=cpus.map(option).join('');gameSelect.innerHTML=games.map(g=>`<option value="${esc(g.id)}">${esc(g.name)} · ${esc(gameStatus(g))}</option>`).join('');
const choose=(select,wanted,fallback)=>select.value=[...select.options].some(o=>o.value===wanted)?wanted:([...select.options].some(o=>o.value===fallback)?fallback:select.options[0]?.value||'');
choose(gpuSelect,params.get('gpu'),'rtx5070');choose(cpuSelect,params.get('cpu'),'9800x3d');choose(gameSelect,params.get('game'),'fortnite');

let gameQuery='',gameGenre='all',libraryLimit=12,consoleFamily='all',platform='pc',consoleLimit=24,releaseRequest=null;
const consoleModels=new Set();
const systemRules={ps5:/^PlayStation 5 \/ PS5 Slim$/,ps5pro:/^PlayStation 5 Pro$/, 'series-x':/^Xbox Series X(?: \/ Series S)?$/, 'series-s':/^Xbox Series S$|^Xbox Series X \/ Series S$/,switch2:/^Nintendo Switch 2$/,switch:/^Nintendo Switch(?: \/ Switch Lite)?$/};
const genreOrder=['all',...new Set(games.map(g=>g.genre).sort())];
const resolutionLabel=v=>v==='2160'?'4K':v+'p';
const image=(game,cls='')=>game.art?`<img class="${/\.svg(?:\?|$)|Special:FilePath/i.test(game.art)?'logo-art ':''}${cls}" src="${esc(game.art)}" alt="${esc(game.artStatus==='original-category-illustration'?'Game library illustration':game.name+' artwork')}" loading="lazy" decoding="async">`:'';
function bindImageFallbacks(root=document){root.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('.game-art,.result-game-art,.console-art')?.classList.add('missing');img.alt='Game library illustration';img.src='/assets/game-library-illustration.svg'},{once:true}))}

function renderLibrary(gpu,cpu){
 const q=gameQuery.trim().toLowerCase();let rows=games.filter(g=>(gameGenre==='all'||g.genre===gameGenre)&&(!q||`${g.name} ${g.series} ${g.genre}`.toLowerCase().includes(q)));
 rows.sort((a,b)=>(Number(Boolean(b.featured))-Number(Boolean(a.featured)))||((b.year||0)-(a.year||0))||a.name.localeCompare(b.name));
 const total=rows.length;rows=rows.slice(0,libraryLimit);
 $('#game-library-grid').innerHTML=rows.map(g=>{const selected=g.id===gameSelect.value;return `<button class="game-tile${selected?' selected':''}" type="button" data-game-id="${esc(g.id)}" aria-pressed="${selected}"><span class="game-art">${image(g)}</span><span class="game-tile-copy"><small>${esc(gameStatus(g))}</small><strong>${esc(g.name)}</strong><span>${esc(g.genre)}<i>Open evidence for this game</i></span></span></button>`}).join('')||'<p class="console-empty">No games match those filters.</p>';
 $('#game-library-count').textContent=`${total} game${total===1?'':'s'}${total>rows.length?' · showing '+rows.length:''}`;
 const more=$('#game-show-all');more.hidden=rows.length>=total;more.textContent='Show more games';
 $$('.game-tile').forEach(button=>button.addEventListener('click',()=>{gameSelect.value=button.dataset.gameId;gameSelect.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.fps-workbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}));
 bindImageFallbacks($('#game-library-grid'));
}

function calculate(){
 const gpu=gpus.find(p=>p.id===gpuSelect.value),cpu=cpus.find(p=>p.id===cpuSelect.value),game=games.find(g=>g.id===gameSelect.value);if(!gpu||!cpu||!game)return;
 const resolution=$('#fps-resolution').value,quality=$('#fps-quality').value,upscale=$('#fps-upscale').value;
 $('#fps-result').innerHTML=`<div class="result-game-art">${image(game)}<div><span>${esc(gameStatus(game))}</span><h2>${esc(game.name)}</h2></div></div><div class="fps-result-body"><h3>No matching benchmark yet</h3><p>${game.pcReleaseConfirmed===false?'A PC release is not confirmed by the linked official source.':'No verified benchmark is available for this exact setup.'}</p><div class="total-result-links"><a href="/performance/evidence/">Check evidence coverage</a><a href="/tools/frame-time-budget/">Explore a display target</a></div><details class="total-result-details"><summary>Selected setup and sources</summary><p class="fps-combo">${resolutionLabel(resolution)} · ${esc(quality)} · ${esc(upscale==='native'?'native rendering':upscale+' upscaling')}</p><div class="fps-hardware"><span>Graphics card<strong>${esc(gpu.name)}</strong></span><span>Processor<strong>${esc(cpu.name)}</strong></span></div>${game.sourceUrl?`<p><a href="${esc(game.sourceUrl)}">Official game information</a></p>`:''}${game.releaseNote?`<p>${esc(game.releaseNote)}</p>`:''}<p><a href="/troubleshooting/?symptom=low-fps">Troubleshoot low FPS</a></p></details></div>`;
 const url=new URL(location.href);url.searchParams.set('gpu',gpu.id);url.searchParams.set('cpu',cpu.id);url.searchParams.set('game',game.id);history.replaceState(null,'',url);$$('.game-tile').forEach(b=>{const active=b.dataset.gameId===game.id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});bindImageFallbacks($('#fps-result'));
}

$('#fps-controls').addEventListener('change',calculate);
$('#game-search').addEventListener('input',event=>{gameQuery=event.target.value;libraryLimit=48;renderLibrary()});
$('#game-reset').addEventListener('click',()=>{gameQuery='';gameGenre='all';libraryLimit=12;$('#game-search').value='';$$('[data-game-genre]').forEach(b=>{const active=b.dataset.gameGenre==='all';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});renderLibrary()});
$('#game-show-all').addEventListener('click',()=>{libraryLimit+=24;renderLibrary()});
$('#game-genres').innerHTML=genreOrder.map((g,i)=>`<button type="button" class="${i===0?'active':''}" aria-pressed="${i===0}" data-game-genre="${esc(g)}">${g==='all'?'All games':esc(g)}</button>`).join('');
$$('[data-game-genre]').forEach(button=>button.addEventListener('click',()=>{gameGenre=button.dataset.gameGenre;libraryLimit=12;$$('[data-game-genre]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderLibrary()}));

$$('[data-fps-view]').forEach(button=>button.addEventListener('click',()=>{const view=button.dataset.fpsView;$$('[data-fps-view]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));$('#pc-fps-view').hidden=view!=='pc';$('#console-fps-view').hidden=view!=='console';const url=new URL(location.href);url.searchParams.set('view',view);history.replaceState(null,'',url)}));
function consoleArt(x){const game=games.find(g=>g.id===x.gameId);return x.art||game?.art||''}
function consoleIcon(x){
 const s=x.system;let shape;
 if(/Switch/.test(s))shape='<rect x="6" y="16" width="52" height="30" rx="7"/><rect x="17" y="20" width="30" height="22" rx="2"/><path d="M11 23v8m-4-4h8"/><circle cx="53" cy="28" r="2"/>';
 else if(/Wii U/.test(s))shape='<rect x="5" y="18" width="54" height="29" rx="8"/><rect x="16" y="22" width="32" height="19" rx="2"/><circle cx="11" cy="29" r="2"/><circle cx="53" cy="29" r="2"/>';
 else if(/Wii/.test(s))shape='<path d="M20 9h23v44H20zM25 48h13M29 18v20"/><circle cx="37" cy="15" r="1"/>';
 else if(/PlayStation 5/.test(s))shape='<path d="M20 8q5 20 0 46l10-3h5l10 3q-5-26 0-46l-10 5h-5zM30 14v37m5-37v37"/>';
 else if(/PlayStation/.test(s))shape='<path d="m12 22 37-6 5 11-38 6zm4 11 38-6v12l-38 7zM17 39l30-5"/>';
 else if(/Series S/.test(s)&&!/Series X/.test(s))shape='<rect x="18" y="8" width="28" height="47" rx="3"/><circle cx="32" cy="25" r="10"/><circle cx="39" cy="49" r="1"/>';
 else if(/Series X/.test(s))shape='<path d="m20 12 20-5 8 7v39l-21 4-7-6zm0 0 7 7 21-5M27 19v38"/><circle cx="41" cy="24" r="2"/>';
 else shape='<rect x="9" y="19" width="46" height="28" rx="3"/><path d="M12 33h40M16 39h20"/><circle cx="47" cy="40" r="2"/>';
 return '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">'+shape+'</svg>';
}
function renderModels(){
 const systems=[...new Set(consoles.filter(x=>consoleFamily==='all'||x.family===consoleFamily).map(x=>x.system))];
 for(const model of consoleModels)if(!systems.includes(model))consoleModels.delete(model);
 $('#console-models').innerHTML=systems.map(s=>'<label><input type="checkbox" value="'+esc(s)+'" '+(consoleModels.has(s)?'checked':'')+'><span>'+esc(s)+'</span></label>').join('');
 $('#console-models').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{input.checked?consoleModels.add(input.value):consoleModels.delete(input.value);markCustomPlatform();renderConsoles()}));
}
function renderConsoles(){
 const q=$('#console-search').value.trim().toLowerCase(),high=$('#console-high-fps').checked;
 const evidence=x=>(!x.catalogOnly&&window.PCP_CONSOLE_EVIDENCE?.lookup(x.gameId,x.system))||{status:'unverified',modes:[],sourceIds:[],limitations:['Evidence is unavailable for this exact edition and console.']};
 const matches=consoles.filter(x=>(consoleFamily==='all'||x.family===consoleFamily)&&(!consoleModels.size||consoleModels.has(x.system))&&(!high||evidence(x).modes.some(m=>m.fps>=60&&m.metric!=='approximate-target'&&!window.PCP_CONSOLE_EVIDENCE.formatFps(m).startsWith('FPS not verified')))&&`${x.system} ${x.game}`.toLowerCase().includes(q));
 const rows=matches.slice(0,consoleLimit);$('#console-count').textContent=matches.length+(matches.length===1?' game and console combination':' game and console combinations')+(rows.length<matches.length?' · showing '+rows.length:'');
 const more=$('#console-show-more');if(more)more.hidden=rows.length>=matches.length;
 $('#console-results').innerHTML=rows.map(x=>{const art=consoleArt(x),record=evidence(x);return `<article class="console-card"><header class="console-platform" data-platform="${esc(x.family)}">${consoleIcon(x)}<div><strong>${esc(x.system)}</strong></div></header><div class="console-art">${art?`<img src="${esc(art)}" alt="${esc(x.artStatus==='original-category-illustration'?'Game library illustration':x.game+' artwork')}" width="460" height="260" loading="lazy" decoding="async">`:''}</div><div class="console-card-body"><h3>${esc(x.game)}</h3>${x.listingSource?.releaseDateStatus==='announced-not-confirmed'?`<p class="console-edition">Announced release · ${esc(x.listingSource.releaseDate)}</p>`:record.edition?`<p class="console-edition">${esc(record.edition)}</p>`:''}<div class="console-modes">${record.modes.map(m=>`<div><span><strong>${esc(m.name)}</strong><small>${esc(m.resolution||'Exact resolution not verified')}</small>${x.system.includes('/')?`<small>Evidence applies to ${esc(m.appliesTo.join(', '))}</small>`:''}<small><a href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.publisher)} source</a></small></span><strong>${esc(window.PCP_CONSOLE_EVIDENCE.formatFps(m))}</strong></div>`).join('')||'<p>No verified FPS for this edition and console.</p>'}</div>${x.listingSource?`<a href="${esc(x.listingSource.url)}" target="_blank" rel="noopener noreferrer">Official ${esc(x.listingSource.publisher)} listing</a>`:''}<details class="console-evidence"><summary>Evidence and conditions${record.status==='partial'?' · partial coverage':''}</summary>${record.modes.map(m=>`<p><strong>${esc(m.name)}:</strong> ${esc(m.measurementStatus.replaceAll('-',' '))}. Applies to ${esc(m.appliesTo.join(', '))}. ${esc(m.conditions.join(' '))} ${esc(m.limitations.join(' '))}</p>`).join('')}${record.limitations.map(s=>`<p>${esc(s)}</p>`).join('')}${x.listingSource?`<p>Release listing checked ${esc(x.listingSource.verifiedAt.slice(0,10))}. ${esc(x.listingSource.scope)}</p>${x.listingSource.announcementUrl?`<p><a href="${esc(x.listingSource.announcementUrl)}" target="_blank" rel="noopener noreferrer">Original Xbox platform announcement</a></p>`:''}`:''}${record.sourceIds.map(id=>{const s=window.PCP_CONSOLE_EVIDENCE?.getSource(id);return s?`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)}: ${esc(s.title)}</a> · checked ${esc(s.checkedAt)}${s.publishedAt?' · source '+esc(s.publishedAt):s.revision?' · '+esc(s.revision):''}</p>`:''}).join('')}</details></div></article>`}).join('')||'<p class="console-empty">No games match. Try another console or clear your filters.</p>';
 bindImageFallbacks($('#console-results'));
}
$$('[data-console-family]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.consoleFamily==='all'));button.addEventListener('click',()=>{consoleFamily=button.dataset.consoleFamily;markCustomPlatform();$$('[data-console-family]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderModels();renderConsoles()})});
$('#console-show-more')?.addEventListener('click',()=>{consoleLimit+=24;renderConsoles()});
$('#console-high-fps').addEventListener('change',()=>{consoleLimit=24;renderConsoles()});
$('#console-reset').addEventListener('click',()=>{consoleModels.clear();$('#console-search').value='';$('#console-high-fps').checked=false;$('[data-console-family="all"]').click()});
function selectPlatform(id){
 platform=id;consoleModels.clear();consoleLimit=24;
 const family=id.startsWith('ps5')?'playstation':id.startsWith('series-')?'xbox':id.startsWith('switch')?'nintendo':'all';
 $('[data-console-family="'+family+'"]').click();
 platform=id;$('#console-fps-view').dataset.totalPlatform=id;
 if(systemRules[id])consoles.forEach(x=>{if(systemRules[id].test(x.system))consoleModels.add(x.system)});
 renderModels();renderConsoles();
 const view=id==='pc'?'pc':'console';$('[data-fps-view="'+view+'"]').click();
 $$('[data-total-platform]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.totalPlatform===platform)));
 const url=new URL(location.href);url.searchParams.set('platform',id);if(id==='pc')url.searchParams.delete('view');history.replaceState(null,'',url);
 if(id!=='pc')loadReleaseListings();
}
function markCustomPlatform(){platform='other';$('#console-fps-view').dataset.totalPlatform='other';$$('[data-total-platform]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.totalPlatform==='other')));}
function loadReleaseListings(){
 if(releaseRequest||typeof fetch!=='function')return;
 releaseRequest=fetch('/data/console-release-evidence.json').then(response=>{if(!response.ok)throw Error('Release listings unavailable');return response.json()}).then(data=>{
  const existing=new Set(consoles.map(x=>x.gameId+'|'+x.system));
  for(const r of data.records||[]){
   const supported={ps5:{system:'PlayStation 5 / PS5 Slim',family:'playstation',publisher:'PlayStation',source:/^https:\/\/www\.playstation\.com\/en-us\/games\/[^/?]+\/$/},switch:{system:'Nintendo Switch / Switch Lite',family:'nintendo',publisher:'Nintendo',source:/^https:\/\/www\.nintendo\.com\/us\/store\/products\/[^/?]+\/$/},switch2:{system:'Nintendo Switch 2',family:'nintendo',publisher:'Nintendo',source:/^https:\/\/www\.nintendo\.com\/us\/store\/products\/[^/?]+\/$/},'xbox-series':{system:'Xbox Series X / Series S',family:'xbox',publisher:'Xbox',source:/^https:\/\/www\.xbox\.com\/en-US\/games\/store\/-\/[A-Z\d]{12}$/}}[r.platform];
   if(!supported||!['official-platform-product-page','official-platform-release-announcement'].includes(r.evidenceType)||r.performanceStatus!=='not-verified'||typeof r.name!=='string'||r.name.length>300||typeof r.canonicalGameId!=='string'||!supported.source.test(r.sourceUrl)||typeof r.verifiedAt!=='string')continue;
   if(r.evidenceType==='official-platform-release-announcement'&&(!/^https:\/\/news\.xbox\.com\/en-us\/\d{4}\/\d{2}\/\d{2}\/next-week-on-xbox-[^/]+\/$/.test(r.metadataSourceUrl||'')||!/Optimized for (?:Xbox|XBOX) Series X\|S/.test(r.platformStatement||'')||r.releaseDateStatus!=='announced-not-confirmed'))continue;
   const key=r.id+'|'+supported.system;if(existing.has(key))continue;existing.add(key);
   const row={gameId:r.id,canonicalGameId:r.canonicalGameId,game:r.name,system:supported.system,family:supported.family,catalogOnly:true,art:'/assets/game-library-illustration.svg',artStatus:'original-category-illustration',listingSource:{url:r.sourceUrl,publisher:supported.publisher,verifiedAt:r.verifiedAt,scope:r.sourceScope,releaseDate:r.releaseDate,releaseDateStatus:r.releaseDateStatus,announcementUrl:r.evidenceType==='official-platform-release-announcement'?r.metadataSourceUrl:null}};
   consoles.push(row);if(systemRules[platform]?.test(row.system))consoleModels.add(row.system);
  }
  renderModels();renderConsoles();
 }).catch(()=>{releaseRequest=null;});
}
$$('[data-total-platform]').forEach(button=>button.addEventListener('click',()=>selectPlatform(button.dataset.totalPlatform)));
renderModels();
$('#console-search').value=params.get('consoleSearch')?.slice(0,300)||'';
$('#console-search').addEventListener('input',()=>{consoleLimit=24;renderConsoles()});renderConsoles();calculate();renderLibrary();
const requested=params.get('platform');if($$('[data-total-platform]').some(b=>b.dataset.totalPlatform===requested))selectPlatform(requested);else if(params.get('view')==='console')selectPlatform('other');
})();
