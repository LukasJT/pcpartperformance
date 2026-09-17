(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const games=window.performanceGames||[],consoles=window.consolePerformanceGames||[];
const params=new URLSearchParams(location.search),gpuSelect=$('#fps-gpu'),cpuSelect=$('#fps-cpu'),gameSelect=$('#fps-game');
const gpus=catalog.filter(p=>p.cat==='gpu'&&(p.specs['PassMark G3D']||p.specs['Memory bandwidth'])).sort((a,b)=>(b.year||0)-(a.year||0)||(b.specs['PassMark G3D']||0)-(a.specs['PassMark G3D']||0));
const cpus=catalog.filter(p=>p.cat==='cpu'&&p.specs['CPU cores']).sort((a,b)=>(b.year||0)-(a.year||0)||a.name.localeCompare(b.name));
const option=p=>`<option value="${esc(p.id)}">${esc(p.name)}${p.year?' · '+p.year:''}</option>`;
gpuSelect.innerHTML=gpus.map(option).join('');cpuSelect.innerHTML=cpus.map(option).join('');gameSelect.innerHTML=games.map(g=>`<option value="${esc(g.id)}">${esc(g.name)} · ${esc(g.year)}</option>`).join('');
const choose=(select,wanted,fallback)=>select.value=[...select.options].some(o=>o.value===wanted)?wanted:([...select.options].some(o=>o.value===fallback)?fallback:select.options[0]?.value||'');
choose(gpuSelect,params.get('gpu'),'rtx5070');choose(cpuSelect,params.get('cpu'),'9800x3d');choose(gameSelect,params.get('game'),'fortnite');

let gameQuery='',gameGenre='all',showAll=false,consoleFamily='all';
const genreOrder=['all','Esports','Shooter','Battle royale','Open world','RPG','Action RPG','Survival','Simulation','Sandbox'];
const resolutionLabel=v=>v==='2160'?'4K':v+'p';
function estimate(game,gpu,cpu){
 const resolution=$('#fps-resolution').value,quality=$('#fps-quality').value,upscale=$('#fps-upscale').value;
 const score=gpu.specs['PassMark G3D']||gpu.specs['Memory bandwidth']*38,resolutionScale={1080:1,1440:.71,2160:.46}[resolution],qualityScale={medium:1.2,high:1,ultra:.84}[quality],upscaleScale={native:1,quality:1.21,balanced:1.38}[upscale],vram=gpu.specs.Memory||0,vramScale=vram&&vram<game.vram?Math.max(.7,vram/game.vram):1;
 const gpuFps=game.base*Math.pow(score/30000,.82)*resolutionScale*qualityScale*upscaleScale*vramScale,cores=cpu.specs['CPU cores']||4,boost=cpu.specs['Boost clock']||cpu.specs['Base clock']||3,cpuIndex=Math.max(.48,Math.min(1.32,cores*.055+boost*.13)),cpuCeiling=game.cpuCap*cpuIndex,average=Math.max(12,Math.min(gpuFps,cpuCeiling));
 return {average,low:Math.max(10,Math.round(average*.87)),high:Math.round(average*1.12),oneLow:Math.round(average*(gpuFps>cpuCeiling?.8:.85)),limited:gpuFps>cpuCeiling?'Processor':'Graphics card',frame:(1000/average).toFixed(1),vram,warn:vram&&vram<game.vram?`${vram} GB VRAM is below this game profile’s ${game.vram} GB target.`:''};
}
const rating=n=>n>=180?'Competitive':n>=110?'Very smooth':n>=58?'Smooth':n>=30?'Playable':'Demanding';
const image=(game,cls='')=>game.art?`<img class="${/\.svg(?:\?|$)|Special:FilePath/i.test(game.art)?'logo-art ':''}${cls}" src="${esc(game.art)}" alt="${esc(game.name)} artwork" loading="lazy" decoding="async">`:'';
function bindImageFallbacks(root=document){root.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.closest('.game-art,.result-game-art,.console-art')?.classList.add('missing');img.remove()},{once:true}))}

function renderLibrary(gpu,cpu){
 const q=gameQuery.trim().toLowerCase();let rows=games.filter(g=>(gameGenre==='all'||g.genre===gameGenre)&&(!q||`${g.name} ${g.series} ${g.genre}`.toLowerCase().includes(q)));
 rows.sort((a,b)=>(b.featured-a.featured)||(b.year-a.year)||a.name.localeCompare(b.name));
 const total=rows.length;if(!showAll&&!q)rows=rows.slice(0,32);
 $('#game-library-grid').innerHTML=rows.map(g=>{const e=estimate(g,gpu,cpu),selected=g.id===gameSelect.value;return `<button class="game-tile${selected?' selected':''}" type="button" data-game-id="${esc(g.id)}" aria-pressed="${selected}"><span class="game-art">${image(g)}<span class="game-fps-chip">${Math.round(e.average)} <small>FPS</small></span></span><span class="game-tile-copy"><small>${esc(g.series)} · ${g.year}</small><strong>${esc(g.name)}</strong><span>${esc(g.genre)}<i>${resolutionLabel($('#fps-resolution').value)} / ${$('#fps-quality').value}</i></span></span></button>`}).join('')||'<p class="console-empty">No games match those filters.</p>';
 $('#game-library-count').textContent=`${total} game${total===1?'':'s'} for this setup`;
 const more=$('#game-show-all');more.hidden=showAll||q||total<=32;more.textContent=`Show all ${total} games`;
 $$('.game-tile').forEach(button=>button.addEventListener('click',()=>{gameSelect.value=button.dataset.gameId;gameSelect.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.fps-workbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}));
 bindImageFallbacks($('#game-library-grid'));
}

function calculate(){
 const gpu=gpus.find(p=>p.id===gpuSelect.value),cpu=cpus.find(p=>p.id===cpuSelect.value),game=games.find(g=>g.id===gameSelect.value);if(!gpu||!cpu||!game)return;
 const e=estimate(game,gpu,cpu),resolution=$('#fps-resolution').value,quality=$('#fps-quality').value,upscale=$('#fps-upscale').value,width=Math.min(100,e.average/240*100);
 $('#fps-result').innerHTML=`<div class="result-game-art">${image(game)}<span class="result-art-shade"></span><div><small>${esc(game.series)} · ${game.year}</small><h2>${esc(game.name)}</h2><span>${esc(game.genre)}</span></div></div><div class="fps-result-body"><div class="fps-result-top"><span class="eyebrow">LIVE MODEL / SELECTED HARDWARE</span><span class="fps-rating">${rating(e.average)}</span></div><div class="fps-number"><strong>${e.low}–${e.high}</strong><span>FPS</span></div><p class="fps-combo">${resolutionLabel(resolution)} · ${quality[0].toUpperCase()+quality.slice(1)} · ${upscale==='native'?'Native':upscale+' upscaling'}</p><div class="fps-meter"><i style="width:${width}%"></i><span style="left:25%">60</span><span style="left:50%">120</span><span style="left:100%">240</span></div><div class="fps-stats"><div><span>Average</span><strong>${Math.round(e.average)} FPS</strong></div><div><span>1% low</span><strong>${e.oneLow} FPS</strong></div><div><span>Frame time</span><strong>${e.frame} ms</strong></div><div><span>Likely limit</span><strong>${e.limited}</strong></div></div>${e.warn?`<p class="fps-warning">${esc(e.warn)}</p>`:''}<div class="fps-hardware"><span><small>GPU</small><strong>${esc(gpu.name)}</strong></span><span><small>CPU</small><strong>${esc(cpu.name)}</strong></span></div><p class="fps-disclaimer">Calculated performance range. Drivers, game patches, memory and exact scenes can change real results.</p></div>`;
 const url=new URL(location.href);url.searchParams.set('gpu',gpu.id);url.searchParams.set('cpu',cpu.id);url.searchParams.set('game',game.id);history.replaceState(null,'',url);renderLibrary(gpu,cpu);bindImageFallbacks($('#fps-result'));
}

$('#fps-controls').addEventListener('change',calculate);
$('#game-search').addEventListener('input',event=>{gameQuery=event.target.value;showAll=true;calculate()});
$('#game-show-all').addEventListener('click',()=>{showAll=true;calculate()});
$('#game-genres').innerHTML=genreOrder.map((g,i)=>`<button type="button" class="${i===0?'active':''}" data-game-genre="${esc(g)}">${g==='all'?'All games':esc(g)}</button>`).join('');
$$('[data-game-genre]').forEach(button=>button.addEventListener('click',()=>{gameGenre=button.dataset.gameGenre;showAll=true;$$('[data-game-genre]').forEach(b=>b.classList.toggle('active',b===button));calculate()}));

$$('[data-fps-view]').forEach(button=>button.addEventListener('click',()=>{const view=button.dataset.fpsView;$$('[data-fps-view]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));$('#pc-fps-view').hidden=view!=='pc';$('#console-fps-view').hidden=view!=='console';const url=new URL(location.href);url.searchParams.set('view',view);history.replaceState(null,'',url)}));
function consoleArt(x){const game=games.find(g=>g.id===x.gameId);return x.art||game?.art||''}
function renderConsoles(){
 const q=$('#console-search').value.trim().toLowerCase(),rows=consoles.filter(x=>(consoleFamily==='all'||x.family===consoleFamily)&&`${x.system} ${x.game}`.toLowerCase().includes(q));
 $('#console-count').textContent=`${rows.length} documented platform mode${rows.length===1?'':'s'}`;
 $('#console-results').innerHTML=rows.map(x=>{const art=consoleArt(x);return `<article class="console-card"><div class="console-art">${art?`<img src="${esc(art)}" alt="${esc(x.game)} artwork" loading="lazy" decoding="async">`:''}<span>${esc(x.family)}</span></div><div class="console-card-body"><div class="console-card-head"><div><h3>${esc(x.game)}</h3><p>${esc(x.system)}</p></div><span class="console-badge">${esc(x.badge)}</span></div><div class="console-modes">${x.modes.map(m=>`<div><span><strong>${esc(m[0])}</strong><small>${esc(m[1])}</small></span><strong>${esc(m[2])}</strong></div>`).join('')}</div><a href="${esc(x.source)}" target="_blank" rel="noopener noreferrer">Source details</a></div></article>`}).join('')||'<p class="console-empty">No matching console game. Try another search.</p>';bindImageFallbacks($('#console-results'));
}
$$('[data-console-family]').forEach(button=>button.addEventListener('click',()=>{consoleFamily=button.dataset.consoleFamily;$$('[data-console-family]').forEach(b=>b.classList.toggle('active',b===button));renderConsoles()}));
$('#console-search').addEventListener('input',renderConsoles);renderConsoles();calculate();
if(params.get('view')==='console')$('[data-fps-view="console"]').click();
})();
