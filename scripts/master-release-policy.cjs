// @ts-check
'use strict';
/** @typedef {{id:string,hash:string}} PinnedVersion */
/** @typedef {{schema:1,origin:'direct_owner_instruction',statement:string,recordedAt:string,releaseDate:string,author:'PC Part Performance',humanReviewClaimed:false,articles:PinnedVersion[],products:PinnedVersion[]}} OwnerAuthorization */
/** Validate data before a release. This verifies consistency, not personal review.
 * @param {unknown} value
 * @param {number} [now]
 * @returns {OwnerAuthorization}
 */
function validateAuthorization(value,now=Date.now()){
 if(!value||typeof value!=='object')throw Error('Release authorization must be an object');
 const a=/** @type {Record<string,unknown>} */(value);
 if(a.schema!==1||a.origin!=='direct_owner_instruction'||a.author!=='PC Part Performance'||a.humanReviewClaimed!==false||typeof a.statement!=='string'||!a.statement.trim())throw Error('Truthful owner authorization required');
 if(typeof a.recordedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(a.recordedAt)||!Number.isFinite(Date.parse(a.recordedAt))||Date.parse(a.recordedAt)>now)throw Error('Invalid authorization date');
 if(typeof a.releaseDate!=='string'||!/^\d{4}-\d\d-\d\d$/.test(a.releaseDate)||!Number.isFinite(Date.parse(a.releaseDate))||new Date(a.releaseDate).toISOString().slice(0,10)!==a.releaseDate)throw Error('Invalid release day');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto'}).format(new Date(now));
 if(a.releaseDate>today)throw Error('Future release date');
 for(const key of ['articles','products']){
  const rows=a[key];if(!Array.isArray(rows)||!rows.length)throw Error('Missing pinned versions');
  const ids=new Set();
  for(const row of rows){
   if(!row||typeof row!=='object'||typeof row.id!=='string'||!/^[-a-zA-Z0-9_]+$/.test(row.id)||typeof row.hash!=='string'||!/^[a-f0-9]{64}$/.test(row.hash)||ids.has(row.id))throw Error('Invalid or duplicate pinned version');
   ids.add(row.id);
  }
 }
 return /** @type {OwnerAuthorization} */(value);
}
/** @param {string} route */
function articleRoute(route){
 if(!/^\/(?:blog|compare)\/[a-z0-9-]+\/$/.test(route))throw Error('Invalid canonical article route');return route;
}
module.exports={validateAuthorization,articleRoute};
