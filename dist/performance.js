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

let gameQuery='',gameGenre='all',showAll=false,consoleFamily='all';
const consoleModels=new Set();
const genreOrder=['all',...new Set(games.map(g=>g.genre).sort())];
const resolutionLabel=v=>v==='2160'?'4K':v+'p';
function estimate(game,gpu,cpu){
 const resolution=$('#fps-resolution').value,quality=$('#fps-quality').value,upscale=$('#fps-upscale').value;
 const score=gpu.specs['PassMark G3D']||gpu.specs['Memory bandwidth']*38,resolutionScale={1080:1,1440:.71,2160:.46}[resolution],qualityScale={medium:1.2,high:1,ultra:.84}[quality],upscaleScale={native:1,quality:1.21,balanced:1.38}[upscale],vram=gpu.specs.Memory||0,vramScale=vram&&vram<game.vram?Math.max(.7,vram/game.vram):1;
 const gpuFps=game.base*Math.pow(score/30000,.82)*resolutionScale*qualityScale*upscaleScale*vramScale,cores=cpu.specs['CPU cores']||4,boost=cpu.specs['Boost clock']||cpu.specs['Base clock']||3,cpuIndex=Math.max(.48,Math.min(1.32,cores*.055+boost*.13)),cpuCeiling=game.cpuCap*cpuIndex,average=Math.max(12,Math.min(gpuFps,cpuCeiling));
 return {average,frame:(1000/average).toFixed(1)};
}
const image=(game,cls='')=>game.art?`<img class="${/\.svg(?:\?|$)|Special:FilePath/i.test(game.art)?'logo-art ':''}${cls}" src="${esc(game.art)}" alt="${esc(game.name)} artwork" loading="lazy" decoding="async">`:'';
function bindImageFallbacks(root=document){root.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('.game-art,.result-game-art,.console-art')?.classList.add('missing');img.remove()},{once:true}))}

function renderLibrary(gpu,cpu){
 const q=gameQuery.trim().toLowerCase();let rows=games.filter(g=>(gameGenre==='all'||g.genre===gameGenre)&&(!q||`${g.name} ${g.series} ${g.genre}`.toLowerCase().includes(q)));
 rows.sort((a,b)=>(b.featured-a.featured)||(b.year-a.year)||a.name.localeCompare(b.name));
 const total=rows.length;if(!showAll&&!q)rows=rows.slice(0,32);
 $('#game-library-grid').innerHTML=rows.map(g=>{const selected=g.id===gameSelect.value;return `<button class="game-tile${selected?' selected':''}" type="button" data-game-id="${esc(g.id)}" aria-pressed="${selected}"><span class="game-art">${image(g)}</span><span class="game-tile-copy"><small>${esc(gameStatus(g))}</small><strong>${esc(g.name)}</strong><span>${esc(g.genre)}<i>Open evidence for this game</i></span></span></button>`}).join('')||'<p class="console-empty">No games match those filters.</p>';
 $('#game-library-count').textContent=`${total} game profile${total===1?'':'s'} in this library`;
 const more=$('#game-show-all');more.hidden=showAll||q||total<=32;more.textContent=`Show all ${total} games`;
 $$('.game-tile').forEach(button=>button.addEventListener('click',()=>{gameSelect.value=button.dataset.gameId;gameSelect.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.fps-workbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}));
 bindImageFallbacks($('#game-library-grid'));
}

function calculate(){
 const gpu=gpus.find(p=>p.id===gpuSelect.value),cpu=cpus.find(p=>p.id===cpuSelect.value),game=games.find(g=>g.id===gameSelect.value);if(!gpu||!cpu||!game)return;
 const e=estimate(game,gpu,cpu),resolution=$('#fps-resolution').value,quality=$('#fps-quality').value,upscale=$('#fps-upscale').value,experimental=$('#fps-experimental')?.checked&&game.pcReleaseConfirmed!==false;
 $('#fps-result').innerHTML=`<div class="result-game-art">${image(game)}<span class="result-art-shade"></span><div><span>${esc(game.series)} · ${esc(gameStatus(game))}</span><h2>${esc(game.name)}</h2></div></div><div class="fps-result-body"><h3>${experimental?'Unvalidated experimental calculation':'Insufficient benchmark evidence'}</h3>${experimental?`<div class="fps-number"><strong>~${Math.round(e.average)}</strong><span>assumed FPS</span></div><p>This synthetic-score calculation has no measured calibration or error model. It cannot establish actual FPS, frame-time percentiles, a bottleneck or an upgrade gain.</p>`:'<p>No permitted, documented benchmark matches these exact components and game settings in our dataset. We cannot provide measured average FPS or 1% lows for this selection.</p>'}${game.releaseNote?`<p>${esc(game.releaseNote)} <a href="${esc(game.sourceUrl)}">Official release information</a></p>`:''}<p class="fps-combo">${resolutionLabel(resolution)} · ${esc(quality)} · ${esc(upscale)} upscaling</p><div class="fps-hardware"><span>GPU<strong>${esc(gpu.name)}</strong></span><span>CPU<strong>${esc(cpu.name)}</strong></span></div><p><a href="/performance/evidence/">How we verify performance</a> · <a href="/tools/frame-time-budget/">Compare a display target</a> · <a href="/troubleshooting/?symptom=low-fps">Investigate low FPS</a></p></div>`;
 const url=new URL(location.href);url.searchParams.set('gpu',gpu.id);url.searchParams.set('cpu',cpu.id);url.searchParams.set('game',game.id);history.replaceState(null,'',url);renderLibrary(gpu,cpu);bindImageFallbacks($('#fps-result'));
}

$('#fps-controls').addEventListener('change',calculate);
$('#fps-experimental')?.addEventListener('change',calculate);
$('#game-search').addEventListener('input',event=>{gameQuery=event.target.value;showAll=true;calculate()});
$('#game-reset').addEventListener('click',()=>{gameQuery='';gameGenre='all';showAll=false;$('#game-search').value='';$$('[data-game-genre]').forEach(b=>{const active=b.dataset.gameGenre==='all';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});calculate()});
$('#game-show-all').addEventListener('click',()=>{showAll=true;calculate()});
$('#game-genres').innerHTML=genreOrder.map((g,i)=>`<button type="button" class="${i===0?'active':''}" aria-pressed="${i===0}" data-game-genre="${esc(g)}">${g==='all'?'All games':esc(g)}</button>`).join('');
$$('[data-game-genre]').forEach(button=>button.addEventListener('click',()=>{gameGenre=button.dataset.gameGenre;showAll=true;$$('[data-game-genre]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});calculate()}));

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
 $('#console-models').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{input.checked?consoleModels.add(input.value):consoleModels.delete(input.value);renderConsoles()}));
}
function renderConsoles(){
 const q=$('#console-search').value.trim().toLowerCase(),high=$('#console-high-fps').checked;
 const evidence=x=>window.PCP_CONSOLE_EVIDENCE?.lookup(x.gameId,x.system)||{status:'unverified',modes:[],sourceIds:[],limitations:['Evidence is unavailable for this exact edition and console.']};
 const rows=consoles.filter(x=>(consoleFamily==='all'||x.family===consoleFamily)&&(!consoleModels.size||consoleModels.has(x.system))&&(!high||evidence(x).modes.some(m=>m.fps>=60&&m.metric!=='approximate-target'&&!window.PCP_CONSOLE_EVIDENCE.formatFps(m).startsWith('FPS not verified')))&&`${x.system} ${x.game}`.toLowerCase().includes(q));
 $('#console-count').textContent=rows.length+' game and console combinations';
 $('#console-results').innerHTML=rows.map(x=>{const art=consoleArt(x),record=evidence(x);return `<article class="console-card"><header class="console-platform" data-platform="${esc(x.family)}">${consoleIcon(x)}<div><strong>${esc(x.system)}</strong></div></header><div class="console-art">${art?`<img src="${esc(art)}" alt="${esc(x.game)} artwork" width="460" height="260" loading="lazy" decoding="async">`:''}</div><div class="console-card-body"><h3>${esc(x.game)}</h3>${record.edition?`<p class="console-edition">${esc(record.edition)}</p>`:''}<div class="console-modes">${record.modes.map(m=>`<div><span><strong>${esc(m.name)}</strong><small>${esc(m.resolution||'Exact resolution not verified')}</small>${x.system.includes('/')?`<small>Evidence applies to ${esc(m.appliesTo.join(', '))}</small>`:''}<small><a href="${esc(m.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(m.publisher)} source</a></small></span><strong>${esc(window.PCP_CONSOLE_EVIDENCE.formatFps(m))}</strong></div>`).join('')||'<p>Performance evidence not verified for this exact edition and console.</p>'}</div><details class="console-evidence"><summary>Evidence and conditions${record.status==='partial'?' · partial coverage':''}</summary>${record.modes.map(m=>`<p><strong>${esc(m.name)}:</strong> ${esc(m.measurementStatus.replaceAll('-',' '))}. Applies to ${esc(m.appliesTo.join(', '))}. ${esc(m.conditions.join(' '))} ${esc(m.limitations.join(' '))}</p>`).join('')}${record.limitations.map(s=>`<p>${esc(s)}</p>`).join('')}${record.sourceIds.map(id=>{const s=window.PCP_CONSOLE_EVIDENCE?.getSource(id);return s?`<p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.publisher)}: ${esc(s.title)}</a> · checked ${esc(s.checkedAt)}${s.publishedAt?' · source '+esc(s.publishedAt):s.revision?' · '+esc(s.revision):''}</p>`:''}).join('')}</details></div></article>`}).join('')||'<p class="console-empty">No games match. Try another console or clear your filters.</p>';
 bindImageFallbacks($('#console-results'));
}
$$('[data-console-family]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.consoleFamily==='all'));button.addEventListener('click',()=>{consoleFamily=button.dataset.consoleFamily;$$('[data-console-family]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderModels();renderConsoles()})});
$('#console-high-fps').addEventListener('change',renderConsoles);
$('#console-reset').addEventListener('click',()=>{consoleModels.clear();$('#console-search').value='';$('#console-high-fps').checked=false;$('[data-console-family="all"]').click()});
renderModels();
$('#console-search').addEventListener('input',renderConsoles);renderConsoles();calculate();
if(params.get('view')==='console')$('[data-fps-view="console"]').click();
})();
