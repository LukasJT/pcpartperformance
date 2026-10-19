/* Small native motion layer. No animation framework, hidden paragraphs or layout loop. */
(()=>{'use strict';
 const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const enabled=()=>!reduced.matches&&root.dataset.motion!=='reduced';
 const ambient=[...document.querySelectorAll('[data-lab-ambient],.lab-ambient')];
 let ambientObserver;
 if('IntersectionObserver'in window){ambientObserver=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-visible',e.isIntersecting)),{rootMargin:'60px'});ambient.forEach(e=>ambientObserver.observe(e));}else ambient.forEach(e=>e.classList.add('is-visible'));
 const visibility=()=>{root.dataset.pageVisibility=document.hidden?'hidden':'visible';};document.addEventListener('visibilitychange',visibility);visibility();
 const stop=()=>{if(!enabled())document.getAnimations().forEach(a=>{if(a.effect?.target?.closest?.('[data-pcp-ad],.pcp-ad-consent'))return;try{a.finish();}catch{a.cancel();}});};
 window.addEventListener('pcp:appearance',stop);reduced.addEventListener('change',stop);
 if('IntersectionObserver'in window){const entrances=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){entrances.unobserve(e.target);if(enabled())e.target.animate([{opacity:.4,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:330,easing:'cubic-bezier(.16,1,.3,1)'});}},{threshold:.08});document.querySelectorAll('main .ui-feature-grid,main .guide-group,main .lab-reveal').forEach(e=>entrances.observe(e));}
 const magnetic=[...document.querySelectorAll('.lab-home-hero .button.primary')];
 for(const button of magnetic){button.classList.add('lab-magnetic');let frame=0;const reset=()=>{cancelAnimationFrame(frame);button.style.removeProperty('--lab-mx');button.style.removeProperty('--lab-my');};button.addEventListener('pointermove',event=>{if(!fine.matches||!enabled())return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const b=button.getBoundingClientRect();button.style.setProperty('--lab-mx',Math.max(-2.5,Math.min(2.5,(event.clientX-b.left-b.width/2)*.025))+'px');button.style.setProperty('--lab-my',Math.max(-2,Math.min(2,(event.clientY-b.top-b.height/2)*.04))+'px');});},{passive:true});button.addEventListener('pointerleave',reset);window.addEventListener('pcp:appearance',reset);}
 document.addEventListener('toggle',event=>{const d=event.target;if(d.tagName!=='DETAILS'||!d.open||!enabled()||d.closest('[data-pcp-ad]'))return;for(const child of d.children)if(child.tagName!=='SUMMARY')child.animate([{opacity:.5,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});},true);
 document.addEventListener('pcp:render',event=>{if(event.detail?.scope!=='comparison'||!enabled())return;document.querySelectorAll('.product-card').forEach((card,i)=>card.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,delay:Math.min(i*35,100),easing:'ease-out'}));});
 const revealHash=()=>{let node;try{node=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}if(node)for(let p=node.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;};window.addEventListener('hashchange',revealHash);revealHash();
 const article=document.querySelector('[data-lab-article]'),bar=document.querySelector('[data-reading-progress]');
 if(article&&bar){let pending=false;const draw=()=>{pending=false;const rect=article.getBoundingClientRect(),range=Math.max(1,rect.height-innerHeight);bar.style.transform='scaleX('+Math.max(0,Math.min(1,-rect.top/range))+')';};addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(draw);}},{passive:true});addEventListener('resize',draw,{passive:true});draw();}
 for(const b of document.querySelectorAll('[data-motion-pause]'))b.hidden=false;
})();
