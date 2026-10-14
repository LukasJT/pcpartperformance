'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const owned={dataset:{programOwned:'9800x3d'},checked:false},summary={innerHTML:''},rows=['cpu','ram'].map(slot=>({dataset:{builderRow:slot},boxes:[],querySelector(){return this.boxes[0]?{remove:()=>this.boxes=[]}:null;},append(box){this.boxes.push(box);}}));
const handlers=new Map(),buttons=['CA','US'].map(region=>({dataset:{region},setAttribute(){},addEventListener(type,fn){this.click=fn;}}));
const document={documentElement:{dataset:{}},body:{dataset:{page:'builder'}},hidden:false,
 querySelector(selector){if(selector==='#build-shopping-summary')return summary;if(selector==='[data-product-buy],#builder,#shop-results')return {};return null;},
 querySelectorAll(selector){if(selector.includes('.builder-row'))return rows;if(selector==='[data-program-owned]')return [owned];if(selector.includes('[data-region]'))return buttons;return [];},
 createElement(){return {className:'',innerHTML:''};},addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);}};
const parts={cpu:[{part:{id:'9800x3d',brand:'AMD',name:'Ryzen 7 9800X3D',cat:'cpu'}}],ram:[{part:{id:'ddr5',brand:'CORSAIR',name:'VENGEANCE DDR5-6000 CL30',cat:'ram'}},{part:{id:'ddr5',brand:'CORSAIR',name:'VENGEANCE DDR5-6000 CL30',cat:'ram'}}]};
const quotes={ '9800x3d':619.99,ddr5:739.99 },window={PCP_PUBLIC_PRICES:{offersFor(id,region){return region==='CA'?[{productId:id,price:quotes[id],store:'Canada Computers',model:id,url:'https://www.canadacomputers.com/',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()}]:[];},observationsFor(){return [];}}};
const scope={document,window,buildInstances:slot=>parts[slot],location:{search:'',href:'https://www.pcpartperformance.com/builder/'},localStorage:{getItem(){return 'CA';},setItem(){}},history:{replaceState(){}},URL,URLSearchParams,Intl,Date,console,setTimeout,setInterval(){},fetch:async()=>({ok:true,json:async()=>({observations:[],products:[]})})};
vm.runInNewContext(fs.readFileSync('scripts/shopping.browser.js','utf8'),scope);
const emit=type=>(handlers.get(type)||[]).forEach(fn=>fn({target:{matches:selector=>selector==='[data-program-owned]'}}));
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
(async()=>{
 await settle();assert(summary.innerHTML.includes('2,099.97'));assert(summary.innerHTML.includes('3 of 3'));console.log('PASS actual prepared controller counts repeated selected purchases');
 owned.checked=true;emit('change');await settle();assert(summary.innerHTML.includes('1,479.98'));assert(summary.innerHTML.includes('2 of 2'));assert(summary.innerHTML.includes('1 already owned; excluded'));console.log('PASS changing ownership immediately removes that product from spending');
 buttons[1].click();await settle();assert(summary.innerHTML.includes('United States'));assert(summary.innerHTML.includes('No current total'));assert(!summary.innerHTML.includes('1,479.98'));console.log('PASS switching country clears Canadian prices without currency conversion');
 assert(!summary.innerHTML.includes('globally cheapest'));assert(rows.every(row=>row.boxes.length===1));console.log('PASS price rerenders do not duplicate component buying panels');
})().catch(error=>{console.error(error);process.exitCode=1;});
