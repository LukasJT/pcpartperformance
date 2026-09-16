'use strict';
const themeButton=document.querySelector('.theme-toggle');
function updateThemeLabel(){
  if(!themeButton)return;
  const dark=document.documentElement.dataset.theme==='dark';
  themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);
  themeButton.title=`Switch to ${dark?'light':'dark'} mode`;
  const label=themeButton.querySelector('.theme-label');
  if(label)label.textContent=dark?'Light mode':'Dark mode';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#101310':'#f5f6f3');
}
themeButton?.addEventListener('click',event=>{
  const apply=()=>{
    document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('pcp-theme',document.documentElement.dataset.theme)}catch{}
    updateThemeLabel();
  };
  if(!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches){apply();return;}
  const rect=themeButton.getBoundingClientRect(),x=event.clientX||rect.left+rect.width/2,y=event.clientY||rect.top+rect.height/2;
  document.documentElement.classList.add('theme-transition');
  const transition=document.startViewTransition(apply);
  transition.ready.then(()=>document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))}px at ${x}px ${y}px)`]},{duration:520,easing:'cubic-bezier(.2,.8,.2,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{});
  transition.finished.finally(()=>document.documentElement.classList.remove('theme-transition')).catch(()=>{});
});
updateThemeLabel();
