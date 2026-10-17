(() => {
    'use strict';
    const key='pcp-ad-consent';
    const slots=[...document.querySelectorAll('[data-pcp-ad]')];
    const gpc=navigator.globalPrivacyControl===true;
    let consent;try{consent=localStorage.getItem(key)}catch{}
    let observer;
    const allowed=()=>consent==='accepted'&&!gpc;
    function size(slot){
      if(slot.dataset.pcpAd==='rectangle')return ['300x250',300,250];
      if(slot.dataset.pcpAd==='native')return ['native',Math.min(728,slot.clientWidth),280];
      const width=slot.clientWidth;
      return width>=728?['728x90',728,90]:width>=468?['468x60',468,60]:width>=320?['320x50',320,50]:null;
    }
    function mount(slot){
      if(!allowed()||slot.dataset.loaded==='true'||slot.getClientRects().length===0)return false;
      const format=size(slot);if(!format)return false;
      const [name,width,height]=format;
      const label=document.createElement('span');label.className='pcp-ad-label';label.textContent='Advertisement';
      const frame=document.createElement('iframe');frame.className='pcp-ad-frame';frame.title='Advertisement';frame.src='/ads/'+name+'.html';frame.width=String(width);frame.height=String(height);frame.loading='lazy';frame.referrerPolicy='no-referrer';frame.sandbox='allow-scripts allow-forms';frame.setAttribute('allow','');
      slot.append(label,frame);slot.dataset.loaded='true';return true;
    }
    function unload(){observer?.disconnect();for(const slot of slots){slot.replaceChildren();delete slot.dataset.loaded}}
    function activate(){if(!allowed())return;observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&mount(entry.target))observer.unobserve(entry.target)},{rootMargin:'300px'}):null;for(const slot of slots)observer?observer.observe(slot):mount(slot)}
    function choose(value){consent=value;try{localStorage.setItem(key,value)}catch{};document.querySelector('.pcp-ad-consent')?.remove();if(value==='accepted')activate();else unload()}
    function banner(){if(consent||gpc)return;const box=document.createElement('section');box.className='pcp-ad-consent';box.setAttribute('role','dialog');box.setAttribute('aria-label','Advertising preferences');box.innerHTML='<strong>Advertising preferences</strong><p>With your permission, this site loads ads from Adsterra on selected pages. You can decline and still use every feature.</p><div class="pcp-ad-actions"><button type="button" class="accept" data-choice="accepted">Accept ads</button><button type="button" data-choice="declined">Decline</button><a href="/privacy/">Privacy details</a></div>';box.addEventListener('click',event=>{const value=event.target.dataset?.choice;if(value)choose(value)});document.body.append(box)}
    document.addEventListener('click',event=>{if(event.target.closest('.pcp-ad-choices')){event.preventDefault();try{localStorage.removeItem(key)}catch{};consent=null;unload();banner()}});
    banner();activate();
  })();