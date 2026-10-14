'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),generate=require('./guide-directory.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-guide-directory-'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{
 for(const [id,title,marker] of [['ram','Choose RAM',''],['laptop','Laptop GPU vs desktop',''],['build','Build your first PC',''],['draft','Draft secret','data-program-draft'],['moved','Moved guide','data-legacy-redirect']]){const dir=path.join(root,'blog',id);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),'<html><head><meta name="description" content="A useful first sentence. More detail belongs in the article."></head><body '+marker+'><h1>'+title+'</h1></body></html>');}
 let result;const counts=generate({root,esc,shell:(title,active,body)=>'<html><head></head><body><main>'+body+'</main></body></html>',write:(route,html)=>{result=html;}});
 assert.equal(counts.guides,3);assert(!result.includes('Draft secret'));assert(!result.includes('Moved guide'));console.log('PASS actual directory writer excludes drafts and retired aliases');
 for(const id of ['ram','laptop','build'])assert.equal((result.match(new RegExp('href="/blog/'+id+'/"','g'))||[]).length,1);assert(!result.includes('More detail belongs'));console.log('PASS every real guide appears once with a concise description');
 assert(result.includes('data-guide-query'));assert(result.includes('data-guide-topic="laptop"'));assert(result.includes('/news/'));assert(result.includes('/build-school/'));console.log('PASS search, topics and distinct news/build-school destinations are usable');
 assert.equal(generate.category('mux-switch','MUX vs Optimus'),'laptop');assert.equal(generate.category('can-my-pc-run-baldurs-gate-3','Game requirements'),'games');assert.equal(generate.category('ssd-transfer-time','SSD copy speed'),'memory');console.log('PASS laptop, game and storage intents map to useful topic groups');
}finally{const checked=path.resolve(root),parent=path.resolve(os.tmpdir());if(!checked.startsWith(parent+path.sep)||!path.basename(checked).startsWith('pcp-guide-directory-'))throw Error('Unsafe temporary path');fs.rmSync(checked,{recursive:true,force:true});}
