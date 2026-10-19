'use strict';
const fs=require('node:fs'),path=require('node:path'),{replaceElement}=require('./clarity-site.cjs'),app=require('./total-display.js');
function polish(html,route){if(route!=='/tools/monitor-pixel-density/'||html.includes('data-total-display'))return html;
 html=replaceElement(html,/<form class="planning-form"[^>]*data-planning="display"[^>]*>/,'form',form=>'<section class="total-display" data-total-display aria-label="Monitor geometry calculator"><div class="total-display-presets" role="group" aria-label="Common monitor presets">'+app.PRESETS.map((p,i)=>'<button type="button" data-display-preset="'+i+'" aria-pressed="'+(i===1)+'">'+p[0]+'</button>').join('')+'</div>'+form.replace('data-planning="display"','data-display-inputs').replace('<h2>Enter your inputs</h2>','<h2>Your display</h2>').replace('<output aria-live="polite">Enter your inputs, then calculate.</output>','').replace('<button class="button primary" type="submit">Calculate</button>','<button class="button secondary" type="submit">Update dimensions</button>')+'<div class="total-display-result"><output aria-live="polite"></output><figure data-display-graphic>'+app.illustration({x:2560,y:1440,diagonal:27})+'</figure><p>Active screen area · bezel and stand are illustrative.</p><p data-display-status role="status"></p></div></section>');
 html=html.replace(/<img\b[^>]*class="publication-hero"[^>]*src="\/assets\/publication\/monitor-pixel-density\.png"[^>]*>/,'');
 return html.replace('</head>','<link rel="stylesheet" href="/total-display.css"><script src="/total-display.js" defer></script></head>');
}
function prepare({root}){for(const name of ['total-display.js','total-display.css'])fs.copyFileSync(path.join(__dirname,name),path.join(root,name));}
module.exports={polish,prepare};
