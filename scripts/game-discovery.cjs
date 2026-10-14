'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function catalog(){const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/game-library.js'),'utf8'),context);return context.window.performanceGames.map(g=>({id:g.id,name:g.name,series:g.series,genre:g.genre,art:g.art,official:g.art.match(/steam\/apps\/(\d+)\//)?'https://store.steampowered.com/app/'+g.art.match(/steam\/apps\/(\d+)\//)[1]+'/':g.sourceUrl||null}));}
const card=(g,esc)=>'<article class="game-discovery-card"><img src="'+esc(g.art)+'" alt="'+esc(g.name)+' game artwork" width="460" height="215" loading="lazy" decoding="async"><div><h2>'+esc(g.name)+'</h2><p>'+esc(g.genre)+'</p><a class="button secondary" href="/performance/?game='+encodeURIComponent(g.id)+'">Check performance coverage</a>'+(g.official?'<a class="game-original" href="'+esc(g.official)+'" target="_blank" rel="noopener">Official game listing</a>':'')+'</div></article>';
module.exports=({root,shell,write,esc})=>{
 const games=catalog(),perPage=24,pages=Math.ceil(games.length/perPage);
 fs.writeFileSync(path.join(root,'data/game-discovery.json'),JSON.stringify(games));
 for(const asset of ['game-discovery.css','game-discovery.js'])fs.copyFileSync(path.join(__dirname,asset),path.join(root,asset));
 for(let page=1;page<=pages;page++){
  const route='performance/games'+(page===1?'':'/page/'+page);
  const pagination='<nav class="game-pages" aria-label="Game library pages">'+Array.from({length:pages},(_,i)=>'<a '+(i+1===page?'aria-current="page" ':'')+'href="/performance/games/'+(i?'page/'+(i+1)+'/':'')+'">'+(i+1)+'</a>').join('')+'</nav>';
  write(route,shell('Game library'+(page===1?'':' — Page '+page),'games','<header class="page-heading"><div><h1>Explore games</h1><p>Find a game, then check its available performance evidence.</p></div><a class="button secondary" href="/performance/">Open Game FPS</a></header><label class="search-field game-discovery-search"><span>Search games</span><input type="search" data-game-discovery-search placeholder="Game title or series"></label><p data-game-discovery-count>'+games.length+' games · page '+page+' of '+pages+'</p><section class="game-discovery-grid" data-game-discovery-results>'+games.slice((page-1)*perPage,page*perPage).map(g=>card(g,esc)).join('')+'</section>'+pagination+'<p class="game-discovery-note">Being listed does not mean a matching measured PC benchmark is available. Official requirements and measured FPS answer different questions.</p>',{description:'Browse PC games by title and series. Open Game FPS to check benchmark coverage; follow official game listings for requirements and release information.'}).replace('</head>','<link rel="stylesheet" href="/game-discovery.css"><script src="/game-discovery.js" defer></script></head>'));
 }
 return {games:games.length,pages};
};
module.exports.catalog=catalog;
