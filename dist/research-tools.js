/* Local arithmetic only. No requests, cookies, tracking or third-party dependencies. */
(()=>{'use strict';
 document.querySelectorAll('[data-calculator]').forEach(form=>form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form),n=key=>Number(data.get(key)),out=form.querySelector('output');
  if(form.dataset.calculator==='ram'){
   const a=n('clA')*2000/n('rateA'),b=n('clB')*2000/n('rateB');
   out.textContent=`Profile A: ${a.toFixed(2)} ns. Profile B: ${b.toFixed(2)} ns. Difference: ${Math.abs(a-b).toFixed(2)} ns. Calculated first-word CAS interval, not measured system latency.`;
  }else{
   const raw=n('tb')*1e12/(2**30),planned=n('apps')+n('games')+n('files'),balance=raw*(1-n('reserve')/100)-planned;
   out.textContent=`${n('tb')} TB = ${raw.toFixed(2)} GiB before formatting. Planned: ${planned.toFixed(2)} GiB. After a ${n('reserve')}% allowance: ${balance>=0?'remaining':'over budget by'} ${Math.abs(balance).toFixed(2)} GiB. Partition and filesystem overhead are not included.`;
  }
 }));
})();
