'use strict';
const fs=require('node:fs'),path=require('node:path');
function injectPriceHistory(html,id){
 if(!/^[A-Za-z0-9_-]{1,120}$/.test(id))throw Error('Invalid history product');
 if(html.includes('data-price-history'))return html;
 const details='<details id="price-history" class="source-details" data-price-history data-product-id="'+id+'"><summary>Price history</summary><div data-history-content aria-live="polite"></div></details>';
 const note=/<p\b[^>]*\bclass=["'][^"']*\bbuy-note\b[^"']*["'][^>]*>/i.exec(html);
 if(note)html=html.slice(0,note.index)+details+html.slice(note.index);
 else{
  const section=/<section\b[^>]*\bid=["']buy["'][^>]*>/i.exec(html),end=section?html.indexOf('</section>',section.index):-1;
  if(end<0)throw Error('Price history buying section missing for '+id);
  html=html.slice(0,end)+details+html.slice(end);
 }
 if(!html.includes('src="/completion-price-history.js"'))html=html.replace('</head>','<link rel="stylesheet" href="/completion-pricing.css"><script type="module" src="/completion-price-history.js"></script></head>');
 return html;
}
module.exports=({root})=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/public-price-history.json'),'utf8')),ids=[...new Set(data.observations.map(row=>row.productId))];
 fs.copyFileSync(path.join(__dirname,'../data/public-price-history.json'),path.join(root,'data/public-price-history.json'));
 fs.copyFileSync(path.join(__dirname,'completion-price-history.js'),path.join(root,'completion-price-history.js'));
 fs.writeFileSync(path.join(root,'completion-pricing.css'),'.price-history-chart{display:block;width:100%;max-height:180px;margin:20px 0}.price-history-chart circle{transition:r .16s}.price-history-chart circle:hover{r:7px}#price-history table{width:100%;border-collapse:collapse}#price-history th,#price-history td{padding:14px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);font-size:1rem;line-height:1.55}#price-history caption{text-align:left;margin:12px;font-size:1rem}#price-history .table-scroll:focus-visible{outline:2px solid var(--accent);outline-offset:3px}@media(prefers-reduced-motion:reduce){.price-history-chart circle{transition:none}}');
 let decorated=0;for(const id of ids){if(!/^[A-Za-z0-9_-]{1,120}$/.test(id))throw Error('Invalid history product');const file=path.join(root,'learn',id+'.html');if(!fs.existsSync(file))continue;fs.writeFileSync(file,injectPriceHistory(fs.readFileSync(file,'utf8'),id));decorated++;}return{productsWithHistory:decorated};
};
module.exports.injectPriceHistory=injectPriceHistory;
