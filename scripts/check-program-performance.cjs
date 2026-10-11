'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('node:assert/strict');
// Ceilings based on final normal-build measurements; see qa-and-performance.md.
const budgets=[['/',9700,142000],['/hardware/graphics-cards/',98000,138000],['/learn/rtx5070.html',13100,133000],['/compare/rtx-5070-vs-rx-9070/',10100,125000],['/builder/',122000,224000],['/performance/',40000,169000],['/blog/how-to-choose-a-graphics-card/',10100,125000]];
const results=[];
for(const[route,scriptLimit,styleLimit]of budgets){
 const html=fs.readFileSync(path.join('dist',route,route.endsWith('/')?'index.html':''),'utf8');
 const scripts=[...html.matchAll(/<script[^>]* src="(\/[^"?]+)(?:\?[^"<]*)?"/g)].map(m=>m[1]);
 const styles=[...html.matchAll(/<link rel="stylesheet" href="(\/[^"?]+)"/g)].map(m=>m[1]);
 assert(!scripts.some(url=>/three(?:\.module)?|\.glb/.test(url)),route+' must not eagerly load optional 3D');
 const scriptGzip=scripts.reduce((n,url)=>n+zlib.gzipSync(fs.readFileSync(path.join('dist',url))).length,0),styleBytes=styles.reduce((n,url)=>n+fs.statSync(path.join('dist',url)).size,0);
 assert(scriptGzip<=scriptLimit,`${route} JS ${scriptGzip} exceeds ${scriptLimit}; investigate before changing a budget`);
 assert(styleBytes<=styleLimit,`${route} CSS ${styleBytes} exceeds ${styleLimit}`);
 results.push({route,scriptGzip,scriptLimit,styleBytes,styleLimit});
}
fs.writeFileSync('docs/program-2026-10-09/performance-budget-results.json',JSON.stringify({checkedAt:new Date().toISOString(),passed:true,scope:'Static route regression budgets, not real-user performance',results},null,2));
console.log('Seven measured route budgets and deferred initial 3D gates passed.');
