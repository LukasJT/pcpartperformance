import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {appendPriceHistory,validatePriceHistory} from './completion-price-history.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const priceHistoryPath=path.join(root,'data/public-price-history.json');
export async function readPriceHistory(file=priceHistoryPath){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}}
export async function writePriceHistoryAtomic(history,file=priceHistoryPath,{now=Date.now()}={}){
 if(!validatePriceHistory(history,{now}).valid)throw new TypeError('refuse_invalid_history');
 const destination=path.resolve(file),directory=path.dirname(destination);await fs.mkdir(directory,{recursive:true});const temporary=path.join(directory,'.price-history-'+crypto.randomUUID()+'.tmp');let handle;
 try{handle=await fs.open(temporary,'wx',0o644);await handle.writeFile(JSON.stringify(history,null,2)+'\n','utf8');await handle.sync();await handle.close();handle=null;await fs.rename(temporary,destination);}catch(error){if(handle)await handle.close();await fs.unlink(temporary).catch(()=>{});throw error;}return destination;
}
export async function recordPriceHistory(snapshot,{file=priceHistoryPath,now=Date.now()}={}){const previous=await readPriceHistory(file),next=appendPriceHistory(previous,snapshot,{now});await writePriceHistoryAtomic(next,file,{now});return next;}
async function seed(){
 const commits=execFileSync('git',['log','--all','--format=%H','--','data/public-price-snapshot.json'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(x=>/^[a-f0-9]{40}$/.test(x)).reverse();
 const now=Date.now(),sources=[],skipped=[];let history=await readPriceHistory();
 for(const commit of [...new Set(commits)]){try{const snapshot=JSON.parse(execFileSync('git',['show',commit+':data/public-price-snapshot.json'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024}));history=appendPriceHistory(history,snapshot,{now});sources.push({commit,generatedAt:snapshot.generatedAt,observations:snapshot.observations.length});}catch{skipped.push(commit);}}
 if(!history)throw Error('no_valid_historical_snapshots');await writePriceHistoryAtomic(history,priceHistoryPath,{now});
 await fs.mkdir(path.join(root,'docs/master-completion/prices'),{recursive:true});await fs.writeFile(path.join(root,'docs/master-completion/prices/history-provenance.json'),JSON.stringify({checkedAt:new Date(now).toISOString(),sources,skipped,scope:'Original committed public snapshots validated at their actual observation times; no reconstructed or interpolated prices.'},null,2)+'\n');console.log(JSON.stringify({observations:history.observations.length,snapshots:sources.length,skipped:skipped.length}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.length!==3||process.argv[2]!=='--seed-from-git')throw Error('Pass --seed-from-git to import actual existing snapshot commits.');await seed();}
