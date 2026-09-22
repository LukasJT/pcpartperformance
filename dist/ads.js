(() => {
  'use strict';
  // Load every ad document from the site's alternate origin. The cross-origin
  // boundary prevents vendor code from changing the parent iframe's sandbox.
  const adOrigin=location.hostname.endsWith('.chatgpt.site')
    ? 'https://www.pcpartperformance.com'
    : 'https://pc-part-performance.lukajt.chatgpt.site';
  const KEY='pcp-ad-consent';
  const allowed=new Set(['home','hardware','record','guide','learn','compare','builder','article']);
  let consent=null;
  try{consent=localStorage.getItem(KEY)}catch{}
  const slots=[...document.querySelectorAll('[data-ad-slot]')];
  const canShow=()=>consent==='accepted'&&allowed.has(document.body.dataset.page||'');
  function sizeFor(slot){
    const type=slot.dataset.adSlot;
    if(type==='rectangle')return ['300x250',300,250];
    if(type==='rail')return slot.clientHeight>=600?['160x600',160,600]:['160x300',160,300];
    if(type==='native')return ['native',Math.min(728,slot.clientWidth),280];
    const width=slot.clientWidth;
    if(width>=728)return ['728x90',728,90];
    if(width>=468)return ['468x60',468,60];
    if(width>=320)return ['320x50',320,50];
    return null;
  }
  function unload(){observer?.disconnect();for(const slot of slots){slot.replaceChildren();delete slot.dataset.loaded;}}
  function mount(slot){
    if(slot.dataset.loaded==='true'||!canShow()||slot.offsetParent===null)return;
    const size=sizeFor(slot);if(!size)return;
    const [name,width,height]=size;
    const label=document.createElement('span');label.className='ad-label';label.textContent='Advertisement';
    const frame=document.createElement('iframe');frame.className='ad-frame';frame.title='Advertisement';frame.src=`${adOrigin}/ads/${name}.html`;frame.width=String(width);frame.height=String(height);frame.loading='lazy';frame.referrerPolicy='no-referrer';frame.sandbox='allow-scripts allow-same-origin';frame.setAttribute('allow','');
    slot.append(label,frame);slot.dataset.loaded='true';return true;
  }
  const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&mount(entry.target))observer.unobserve(entry.target)},{rootMargin:'300px'}):null;
  function activate(){for(const slot of slots)observer?observer.observe(slot):mount(slot)}
  function choose(value){consent=value;try{localStorage.setItem(KEY,value)}catch{};document.cookie=`pcp_ad_consent=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;document.querySelector('.consent-banner')?.remove();if(value==='accepted')activate();else unload()}
  function banner(){if(consent)return;const box=document.createElement('section');box.className='consent-banner';box.setAttribute('role','dialog');box.setAttribute('aria-label','Advertising preferences');box.innerHTML='<h2>Advertising preferences</h2><p>With your permission, selected pages load advertising from a third-party partner. You can decline and keep using every feature.</p><div class="consent-actions"><button class="accept" data-choice="accepted">Accept ads</button><button data-choice="declined">Decline</button><a class="button secondary" href="/privacy/">Privacy details</a></div>';box.addEventListener('click',event=>{const value=event.target.dataset?.choice;if(value)choose(value)});document.body.append(box)}
  document.addEventListener('click',event=>{if(event.target.closest('.manage-ads')){event.preventDefault();try{localStorage.removeItem(KEY)}catch{};consent=null;unload();for(const slot of slots)delete slot.dataset.loaded;banner()}});
  banner();if(canShow())activate();
})();
