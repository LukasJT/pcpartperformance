'use strict';
/* Explicit release helper: update only the existing scheduled workflow on the
 * default branch. Never merge the website over that branch's other projects. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const workflow='.github/workflows/daily-public-prices.yml',production='origin/codex/stage2-publication-2026-10-04';
const git=(args,options={})=>cp.execFileSync('git',args,{encoding:'utf8',stdio:['pipe','pipe','pipe'],...options}).trim();
const normalize=value=>value.replace(/\r\n/g,'\n').trim();
function main(){
 const push=process.argv[2]==='--push';if(process.argv.slice(2).some(v=>v!=='--push'))throw Error('Use no arguments to inspect or --push for the authorized release.');
 const source=fs.readFileSync(workflow,'utf8');git(['fetch','origin','main','codex/stage2-publication-2026-10-04']);
 const parent=git(['rev-parse','origin/main']);
 if(normalize(git(['show','origin/main:'+workflow]))===normalize(source)){console.log(JSON.stringify({state:'already_current',defaultBranchCommit:parent,changedFiles:[]}));return;}
 if(normalize(git(['show',production+':'+workflow]))!==normalize(source))throw Error('Deploy and push the tested production workflow before activating its default-branch schedule.');
 git(['cat-file','-e',production+':scripts/completion-price-history.test.mjs']);
 for(const required of ['scripts/total-operations.mjs','scripts/total-operations-sources.mjs','scripts/total-operations-publish.mjs','scripts/total-operations.test.mjs']){
  if(normalize(git(['show',production+':'+required]))!==normalize(fs.readFileSync(required,'utf8')))throw Error('Deploy the tested daily-operations source before activating its default-branch workflow: '+required);
 }
 if(!push){console.log(JSON.stringify({state:'ready_for_explicit_push',base:parent,changedFiles:[workflow]}));return;}
 const dir=path.resolve('tmp');fs.mkdirSync(dir,{recursive:true});const index=path.join(dir,'workflow-index-'+crypto.randomUUID()),env={...process.env,GIT_INDEX_FILE:index};
 let commit;
 try{git(['read-tree',parent],{env});const blob=git(['hash-object','-w','--stdin'],{input:source.replace(/\r\n/g,'\n')});git(['update-index','--add','--cacheinfo','100644',blob,workflow],{env});const tree=git(['write-tree'],{env});commit=git(['commit-tree',tree,'-p',parent],{input:'Preserve daily retailer price observation history\n'});
  const paths=git(['diff-tree','--no-commit-id','--name-only','-r',commit]).split('\n').filter(Boolean);if(paths.length!==1||paths[0]!==workflow)throw Error('Refusing a non-workflow change on the default branch.');
  if(normalize(git(['show',commit+':'+workflow]))!==normalize(source))throw Error('Prepared workflow differs from the tested file.');
  git(['push','origin',commit+':refs/heads/main']);
 }finally{if(fs.existsSync(index))fs.unlinkSync(index);if(fs.existsSync(index+'.lock'))fs.unlinkSync(index+'.lock');}
 const receipt={checkedAt:new Date().toISOString(),state:'pushed',defaultBranchCommit:commit,parent,changedFiles:[workflow],productionBranch:'codex/stage2-publication-2026-10-04',scope:'File-only normal fast-forward; scheduled run success and live deployment require separate verification.'};fs.mkdirSync('docs/master-completion/qa',{recursive:true});fs.writeFileSync('docs/master-completion/qa/workflow-release.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}
try{main();}catch(error){console.error(error.message);process.exitCode=1;}
