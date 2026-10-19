/* Validate this run's JSON artifact; never execute or publish editorial content. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT,readJSON,atomicJSON,validateSourceState,validateQueue} from './total-operations.mjs';
import {validatePublicPriceSnapshot} from './public-price-snapshot.mjs';
import {validatePriceHistory,MAX_PER_LISTING} from './completion-price-history.mjs';
export const PUBLISH_FILES=Object.freeze(['data/public-price-snapshot.json','data/public-price-history.json','data/operations-source-state.json','data/operations-review-queue.json','data/operations-status.json']);
export function validatePublication(input,{now=Date.now(),currentSnapshot=null,currentHistory=null}={}){
 const snapshot=validatePublicPriceSnapshot(input.snapshot,{now}),history=validatePriceHistory(input.history,{now});
 if(!snapshot.envelopeValid||snapshot.rejected.some(row=>row.issues.some(issue=>issue!=='observation_expired'))||!history.valid)throw Error('publication_price_invalid');
 const state=validateSourceState(input.state,{now}),queue=validateQueue(input.queue,{now}),raw=input.status;
 if(!raw||raw.schema!==1||!['completed','degraded'].includes(raw.status)||!Number.isFinite(Date.parse(raw.lastAttemptAt))||Date.parse(raw.lastAttemptAt)>now||now-Date.parse(raw.lastAttemptAt)>3600000||raw.invalidRecords!==0||raw.deploymentVerified!==false)throw Error('publication_status_invalid');
 for(const field of ['catalogRecords','offersUpdated','currentObservations','invalidRecords','retailerFailures','sourceFailures','reviewQueue'])if(!Number.isInteger(raw[field])||raw[field]<0||raw[field]>100000)throw Error('publication_status_invalid');
 for(const field of ['lastSuccessfulRunAt','lastFailedRunAt'])if(raw[field]!==null&&(!Number.isFinite(Date.parse(raw[field]))||Date.parse(raw[field])>now))throw Error('publication_status_invalid');
 const current=currentSnapshot?validatePublicPriceSnapshot(currentSnapshot,{now}):null;
 if(current&&(!current.envelopeValid||current.rejected.some(row=>row.issues.some(issue=>issue!=='observation_expired'))))throw Error('publication_existing_snapshot_invalid');
 const listing=row=>[row.merchantId,row.region,row.productId].join(':'),offers=new Map();
 for(const row of [...(current?.observations||[]),...snapshot.observations]){const previous=offers.get(listing(row));if(previous&&previous.checkedAt===row.checkedAt&&(previous.price!==row.price||previous.condition!==row.condition||previous.inStock!==row.inStock))throw Error('publication_observation_conflict');if(!previous||Date.parse(row.checkedAt)>Date.parse(previous.checkedAt))offers.set(listing(row),row);}
 const merged=validatePriceHistory({schema:1,policy:'recorded-exact-listing-observations',updatedAt:new Date(now).toISOString(),observations:[...(currentHistory?validatePriceHistory(currentHistory,{now}).observations:[]),...history.observations]},{now});
 if(currentHistory&&!validatePriceHistory(currentHistory,{now}).valid||!merged.valid)throw Error('publication_existing_history_invalid');
 const perListing=new Map();for(const row of [...merged.observations].reverse()){const group=perListing.get(listing(row))||[];if(group.length<MAX_PER_LISTING)group.push(row);perListing.set(listing(row),group);}
 const observations=[...offers.values()].sort((a,b)=>listing(a).localeCompare(listing(b))),historical=[...perListing.values()].flat().sort((a,b)=>Date.parse(a.checkedAt)-Date.parse(b.checkedAt)||listing(a).localeCompare(listing(b)));
 const status={schema:1,lastAttemptAt:raw.lastAttemptAt,lastSuccessfulRunAt:raw.lastSuccessfulRunAt,lastFailedRunAt:raw.lastFailedRunAt,status:raw.status,catalogRecords:raw.catalogRecords,offersUpdated:raw.offersUpdated,currentObservations:observations.length,invalidRecords:0,retailerFailures:raw.retailerFailures,sourceFailures:raw.sourceFailures,reviewQueue:queue.length,deploymentVerified:false};
 return {
  'data/public-price-snapshot.json':{schema:1,policy:'daily-checked-snapshot',generatedAt:new Date(Math.max(Date.parse(input.snapshot.generatedAt),Date.parse(currentSnapshot?.generatedAt)||0)).toISOString(),observations},
  'data/public-price-history.json':{schema:1,policy:'recorded-exact-listing-observations',updatedAt:new Date(now).toISOString(),maxObservationsPerListing:MAX_PER_LISTING,observations:historical},
  'data/operations-source-state.json':state,'data/operations-review-queue.json':queue,'data/operations-status.json':status
 };
}
export async function preparePublication({root=ROOT,inputDirectory=path.join(root,'.operations-artifact'),now=Date.now()}={}){
 const names=['public-price-snapshot.json','public-price-history.json','source-state.json','review-queue.json','operations-status.json'];
 for(const name of names){const stat=await fs.lstat(path.join(inputDirectory,name));if(!stat.isFile()||stat.isSymbolicLink())throw Error('publication_file_invalid');}
 const [snapshot,history,state,queue,status]=await Promise.all(names.map(name=>readJSON(path.join(inputDirectory,name))));
 const currentSnapshot=await readJSON(path.join(root,'data/public-price-snapshot.json')),currentHistory=await readJSON(path.join(root,'data/public-price-history.json'));
 const files=validatePublication({snapshot,history,state,queue,status},{now,currentSnapshot,currentHistory});
 // Validate the complete artifact before writing. The fixed-file Git commit is
 // the publication unit; a failed step must never make a partial data commit.
 for(const [name,value] of Object.entries(files))await atomicJSON(path.join(root,name),value);
 return {files:PUBLISH_FILES,observations:files['data/public-price-snapshot.json'].observations.length,reviewLeads:files['data/operations-review-queue.json'].length,articlesPublished:0};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==2)throw Error('Only the fixed .operations-artifact input directory is accepted.');
 console.log(JSON.stringify(await preparePublication(),null,2));
}
