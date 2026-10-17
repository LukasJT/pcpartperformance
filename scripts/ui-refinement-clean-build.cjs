'use strict';
// Reproduce the host's tracked-file build without local ignored dependencies.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=process.cwd(),temporaryRoot=path.resolve(root,'tmp');fs.mkdirSync(temporaryRoot,{recursive:true});
const directory=fs.mkdtempSync(path.join(temporaryRoot,'ui-clean-')),started=Date.now();
assert(directory.startsWith(temporaryRoot+path.sep));
const commit=cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const files=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8',maxBuffer:8*1024*1024}).split('\0').filter(Boolean);
let linkedModels=0;
for(const relative of files){
 const source=path.resolve(root,relative),target=path.resolve(directory,relative);
 assert(source.startsWith(root+path.sep)&&target.startsWith(directory+path.sep));
 fs.mkdirSync(path.dirname(target),{recursive:true});
 if(/^dist\/assets\/models\/.+\.glb$/.test(relative)){fs.linkSync(source,target);linkedModels++;}
 else fs.copyFileSync(source,target);
}
assert(!fs.existsSync(path.join(directory,'tools/quality/node_modules')));
const commands=['scripts/build-pages.cjs','scripts/ui-refinement.test.cjs','scripts/check-program-performance.cjs'],results=[],logs=[];
for(const command of commands){const result=cp.spawnSync(process.execPath,[command],{cwd:directory,env:{...process.env,CI:'true',WORKERS_CI_COMMIT_SHA:commit},encoding:'utf8',maxBuffer:16*1024*1024});logs.push(command+'\n'+result.stdout+'\n'+result.stderr);results.push({command,exitCode:result.status,passed:result.status===0});console.log((result.status===0?'PASS ':'FAIL ')+command);if(result.status!==0)break;}
const styles=dir=>fs.readdirSync(path.join(dir,'dist/assets/css')).filter(name=>/^site-[a-f0-9]+\.css$/.test(name)).sort();
const passed=results.length===commands.length&&results.every(result=>result.passed);if(passed)assert.deepEqual(styles(directory),styles(root),'Tracked-file build must reproduce current stylesheet fingerprints');
const report={checkedAt:new Date().toISOString(),commit,temporaryDirectory:directory,trackedFiles:files.length,hardLinkedImmutableModels:linkedModels,ignoredDependencies:false,results,styleBundles:passed?styles(directory).length:null,elapsedMs:Date.now()-started,passed,scope:'Windows Node24, tracked sources only. Immutable GLBs are hard-linked input assets; generated HTML/CSS/controllers are rebuilt. Not a Linux or live deployment test.'};
fs.writeFileSync('docs/ui-refinement-oct17/clean-build.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync('docs/ui-refinement-oct17/clean-build.log',logs.join('\n'));
if(!passed)process.exitCode=1;
