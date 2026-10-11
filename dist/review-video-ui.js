(()=>{'use strict';
 const cards=[...document.querySelectorAll('[data-video-id]')];if(!cards.length)return;
 for(const card of cards){const play=card.querySelector('[data-review-play]'),close=card.querySelector('[data-review-close]'),frame=card.querySelector('[data-review-frame]');
  function stop(){frame.replaceChildren();play.hidden=false;close.hidden=true}
  play.addEventListener('click',()=>{const id=card.dataset.videoId;if(!/^[a-zA-Z0-9_-]{11}$/.test(id))return;const iframe=document.createElement('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?rel=0';iframe.title=card.querySelector('h3').textContent;iframe.width=1280;iframe.height=720;iframe.allow='encrypted-media; picture-in-picture; fullscreen';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;frame.replaceChildren(iframe);play.hidden=true;close.hidden=false;close.focus({preventScroll:true})});
  close.addEventListener('click',()=>{stop();play.focus({preventScroll:true})});card.addEventListener('pcp:stop-video',stop);
 }
 function phonePair(){const form=document.querySelector('[data-phone-size]');if(!form)return;const ids=[form.elements.a.value,form.elements.b.value].sort().join(',');let visible=0;for(const card of cards.filter(c=>c.dataset.reviewPhones)){const match=card.dataset.reviewPhones.split(',').sort().join(',')===ids;card.hidden=!match;if(match)visible++;else card.dispatchEvent(new Event('pcp:stop-video'))}document.querySelector('[data-phone-review-panel]').hidden=!visible}
 document.addEventListener('pcp:phone-selection',phonePair);document.querySelector('[data-phone-size]')?.addEventListener('change',phonePair);phonePair();
})();
