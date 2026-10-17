'use strict';
const fs = require('fs');
const path = require('path');

// Active Adsterra units for pcpartperformance.com, verified in the publisher dashboard.
const banners = {
  '728x90': ['0a369c475876b633cedf6fd23554af2d', 728, 90],
  '468x60': ['6caa56df40fdaa7cc119479dd7d90f11', 468, 60],
  '320x50': ['e1d552b1def88ad7ec53b6f4ae60f0e3', 320, 50],
  '300x250': ['c6efab34c1cc7608299334af263891c0', 300, 250],
};

module.exports = function buildAdAssets(root) {
  const directory = path.join(root, 'ads');
  fs.mkdirSync(directory, { recursive: true });
  for (const [name, [key, width, height]] of Object.entries(banners)) {
    fs.writeFileSync(path.join(directory, `${name}.html`), `<!doctype html><html><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:transparent}</style></head><body><script>atOptions={key:'${key}',format:'iframe',height:${height},width:${width},params:{}};</script><script src="https://bauval.org/22/${key}"></script></body></html>`);
  }
  const native = '64c6692f89dc61438be0463da3e0afa7';
  fs.writeFileSync(path.join(directory, 'native.html'), `<!doctype html><html><head><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:transparent}</style></head><body><script async data-cfasync="false" src="https://bauval.org/21/${native}"></script><div id="container-${native}"></div></body></html>`);
  fs.writeFileSync(path.join(root, 'ads.css'), `.pcp-ad-slot{margin:36px auto;max-width:100%;text-align:center;contain:layout}.pcp-ad-label{display:block;margin-bottom:7px;color:var(--muted,#6b7280);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase}.pcp-ad-frame{display:block;margin:auto;max-width:100%;border:0;background:transparent}.pcp-ad-consent{position:fixed;z-index:1000;right:16px;bottom:16px;width:min(420px,calc(100% - 32px));padding:18px;border:1px solid var(--line,#ccc);border-radius:14px;background:var(--surface,#fff);color:var(--ink,#111);box-shadow:0 12px 48px #0004}.pcp-ad-consent p{margin:8px 0 14px}.pcp-ad-actions{display:flex;gap:8px;flex-wrap:wrap}.pcp-ad-actions button{min-height:42px;padding:8px 14px;border:1px solid var(--line,#bbb);border-radius:8px;background:var(--surface,#fff);color:var(--ink,#111);font:inherit;cursor:pointer}.pcp-ad-actions .accept{background:var(--accent,#bcf266);color:#18200d;font-weight:700}.pcp-ad-choices{display:block;margin:10px 0 0 auto;border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer}@media(max-width:700px){.pcp-ad-slot{margin:26px auto}.pcp-ad-consent{right:10px;bottom:10px;width:calc(100% - 20px)}}`);
  fs.writeFileSync(path.join(root, 'ads.js'), `(() => {
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
      const frame=document.createElement('iframe');frame.className='pcp-ad-frame';frame.title='Advertisement';frame.src='https://pcpartperformance-live.lukastadros06.workers.dev/ads/'+name+'.html';frame.width=String(width);frame.height=String(height);frame.loading='lazy';frame.referrerPolicy='no-referrer';frame.sandbox='allow-scripts allow-same-origin allow-forms';frame.setAttribute('allow','');
      slot.append(label,frame);slot.dataset.loaded='true';return true;
    }
    function unload(){observer?.disconnect();for(const slot of slots){slot.replaceChildren();delete slot.dataset.loaded}}
    function activate(){if(!allowed())return;observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&mount(entry.target))observer.unobserve(entry.target)},{rootMargin:'300px'}):null;for(const slot of slots)observer?observer.observe(slot):mount(slot)}
    function choose(value){consent=value;try{localStorage.setItem(key,value)}catch{};document.querySelector('.pcp-ad-consent')?.remove();if(value==='accepted')activate();else unload()}
    function banner(){if(consent||gpc)return;const box=document.createElement('section');box.className='pcp-ad-consent';box.setAttribute('role','dialog');box.setAttribute('aria-label','Advertising preferences');box.innerHTML='<strong>Advertising preferences</strong><p>With your permission, this site loads ads from Adsterra on selected pages. You can decline and still use every feature.</p><div class="pcp-ad-actions"><button type="button" class="accept" data-choice="accepted">Accept ads</button><button type="button" data-choice="declined">Decline</button><a href="/privacy/">Privacy details</a></div>';box.addEventListener('click',event=>{const value=event.target.dataset?.choice;if(value)choose(value)});document.body.append(box)}
    document.addEventListener('click',event=>{if(event.target.closest('.pcp-ad-choices')){event.preventDefault();try{localStorage.removeItem(key)}catch{};consent=null;unload();banner()}});
    banner();activate();
  })();`);
  const privacyPath = path.join(root, 'privacy', 'index.html');
  if (fs.existsSync(privacyPath)) {
    const before = 'This publication release adds no active advertising script or analytics destination. Future activation requires the actual publisher account, consent implementation and an updated policy that identifies the applicable business and services. The default-off code gate is not a full consent-management platform.';
    const after = 'Selected pages offer optional Adsterra display ads. Ad requests begin only after you choose Accept ads; Decline keeps those ad requests off. Your choice is stored locally in this browser as pcp-ad-consent and can be changed through Ad choices on pages with ads. Global Privacy Control also keeps ads off. Adsterra may process information under its own privacy policy. The site does not load an analytics destination through this ad feature.';
    const html = fs.readFileSync(privacyPath, 'utf8');
    if (!html.includes(before) && !html.includes(after)) throw new Error('Privacy advertising disclosure changed; review before enabling ads.');
    if (html.includes(before)) fs.writeFileSync(privacyPath, html.replace(before, after));
  }
};
