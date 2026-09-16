'use strict';
const themeButton=document.querySelector('.theme-toggle');
function updateThemeLabel(){
  if(!themeButton)return;
  const dark=document.documentElement.dataset.theme==='dark';
  themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);
  themeButton.title=`Switch to ${dark?'light':'dark'} mode`;
  const label=themeButton.querySelector('.theme-label');
  if(label)label.textContent=dark?'Light mode':'Dark mode';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#101319':'#f7f8fa');
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
/* Text arrows can render as emoji on iOS. Use the same vector icon everywhere. */
(()=>{
const paths={'↗':'M7 17 17 7M7 7h10v10','→':'M4 12h16m-6-6 6 6-6 6','←':'M20 12H4m6-6-6 6 6 6'};
function replace(root){if(!root||!root.isConnected)return;const texts=[];if(root.nodeType===3)texts.push(root);else{const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode())texts.push(walk.currentNode)}for(const node of texts){if(!/[↗→←]/.test(node.textContent)||node.parentElement?.closest('script,style,textarea,option,svg'))continue;const frag=document.createDocumentFragment();for(const str of node.textContent.split(/([↗→←])/)){if(!paths[str])frag.append(document.createTextNode(str));else{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','link-icon');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[str]);svg.append(path);frag.append(svg)}}node.replaceWith(frag)}}
replace(document.body);new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')replace(r.target);else for(const node of r.addedNodes)if(node.nodeType===3||node.nodeType===1&&!node.closest('svg'))replace(node)}}).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
