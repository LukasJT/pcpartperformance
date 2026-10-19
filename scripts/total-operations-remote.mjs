/* Public read-only status, no account tokens and no workflow dispatch/push. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT,secureTransport,atomicJSON} from './total-operations.mjs';
const repository='LukasJT/pcpartperformance',base='https://api.github.com/repos/'+repository;
async function get(suffix){const response=await secureTransport(new URL(base+suffix),{accept:'github-json'});if(response.status!==200)return {status:response.status,available:false};try{return {status:200,available:true,data:JSON.parse(response.body)};}catch{return {status:200,available:false,error:'invalid_json'};}}
const workflow=await get('/actions/workflows/daily-public-prices.yml');
const runs=await get('/actions/workflows/daily-public-prices.yml/runs?per_page=5');
const definition=await get('/contents/.github/workflows/daily-public-prices.yml?ref=main');
const normalize=value=>value.replace(/\r\n/g,'\n').trim();
const localDefinition=await fs.readFile(path.join(ROOT,'.github/workflows/daily-public-prices.yml'),'utf8');
const definitionMatches=definition.available&&definition.data.encoding==='base64'&&typeof definition.data.content==='string'?normalize(Buffer.from(definition.data.content,'base64').toString('utf8'))===normalize(localDefinition):null;
const report={checkedAt:new Date().toISOString(),repository,access:'public-read-only-no-token',workflow:workflow.available?{state:workflow.data.state,path:workflow.data.path,url:workflow.data.html_url}:workflow,runs:runs.available?runs.data.workflow_runs.map(run=>({id:run.id,event:run.event,status:run.status,conclusion:run.conclusion,createdAt:run.created_at,updatedAt:run.updated_at,headSha:run.head_sha,headBranch:run.head_branch,url:run.html_url})):runs,localChangesActivated:definitionMatches,definitionBlob:definition.available?definition.data.sha:null,scope:'Default-branch definition compared with local reviewed workflow. Run states are observed facts; an older scheduled success does not verify newer code, the resulting website deploy, or a future daily run.'};
await fs.mkdir(path.join(ROOT,'docs/total-refinement/operations'),{recursive:true});await atomicJSON(path.join(ROOT,'docs/total-refinement/operations/github-remote-status.json'),report);console.log(JSON.stringify(report,null,2));
