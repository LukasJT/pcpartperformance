/* Loaded only if the main appearance controller failed. */
(()=>{'use strict';if(window.PCP_THEME)return;const button=document.querySelector('.theme-toggle');if(!button)return;
 function paint(){const dark=document.documentElement.dataset.theme==='dark';button.setAttribute('aria-label','Switch to '+(dark?'light':'dark')+' mode');const label=button.querySelector('.theme-label');if(label)label.textContent=dark?'Light mode':'Dark mode';}
 button.addEventListener('click',()=>{const mode=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=mode;try{localStorage.setItem('pcp-theme',mode);}catch{}paint();});paint();
})();
