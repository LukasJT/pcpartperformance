import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {secureResponse,CONTENT_SECURITY_POLICY} from './completion-security.mjs';
import worker from './worker.mjs';
const require=createRequire(import.meta.url),{audit}=require('./completion-resource-audit.cjs');
const request=(path='/',method='GET')=>new Request('https://www.pcpartperformance.com'+path,{method});
let count=0;
async function test(name,fn){await fn();count++;console.log('PASS '+name);}
await test('security policy refuses executable inline handlers, external scripts and arbitrary network fetches',()=>{
 assert(CONTENT_SECURITY_POLICY.includes("script-src 'self' 'wasm-unsafe-eval'"));
 assert(CONTENT_SECURITY_POLICY.includes("script-src-attr 'none'"));
 assert(CONTENT_SECURITY_POLICY.includes("connect-src 'self' blob:"));
 assert(!/script-src[^;]*(?:'unsafe-inline'|'unsafe-eval'|https:)/.test(CONTENT_SECURITY_POLICY));
 assert(CONTENT_SECURITY_POLICY.includes("object-src 'none'"));
});
await test('published templates satisfy the enforced script policy',()=>{
 const report=audit();assert(report.pages>1000);assert.equal(report.inlineExecutableCount,0);assert.deepEqual(report.handlerPages,[]);assert.deepEqual(report.externalScripts,[]);assert.deepEqual(report.frames,[]);
});
await test('local 3D WebAssembly, fonts and opt-in private YouTube player remain supported',()=>{
 for(const item of ["'wasm-unsafe-eval'","worker-src 'self' blob:",'https://fonts.googleapis.com','https://fonts.gstatic.com',"frame-src 'self' https://www.youtube-nocookie.com"])assert(CONTENT_SECURITY_POLICY.includes(item));
});
await test('ad documents are isolated from the parent page policy',async()=>{
 const page=secureResponse(new Response('page'),request('/'));
 const ad=secureResponse(new Response('ad'),request('/ads/728x90.html'));
 assert.equal(page.headers.get('Content-Security-Policy'),CONTENT_SECURITY_POLICY);
 assert.match(ad.headers.get('Content-Security-Policy'),/script-src 'unsafe-inline' https:/);
 assert.equal(ad.headers.get('Referrer-Policy'),'no-referrer');
});
await test('responses retain cache, status, robots and content while adding headers',async()=>{
 const r=secureResponse(new Response('test',{status:404,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, follow'}}),request('/missing/'));
 assert.equal(r.status,404);assert.equal(await r.text(),'test');assert.equal(r.headers.get('Cache-Control'),'no-store');assert.match(r.headers.get('X-Robots-Tag'),/noindex/);assert.equal(r.headers.get('X-Frame-Options'),'SAMEORIGIN');assert.equal(r.headers.get('Strict-Transport-Security'),'max-age=31536000');
});
await test('localhost does not inherit a production transport policy and HEAD has no body',async()=>{
 const r=secureResponse(new Response('discard'),new Request('http://127.0.0.1:4197/',{method:'HEAD'}));assert.equal(r.headers.get('Strict-Transport-Security'),null);assert.equal(await r.text(),'');
});
await test('real Worker applies the same protections to pages, redirects, errors, API and refused methods',async()=>{
 const env={ASSETS:{fetch:async()=>new Response('fixture', {headers:{'Content-Type':'text/html'}})}};
 for(const [route,method,status]of [['/','GET',200],['/builder','GET',301],['/not-a-real-component/','GET',404],['/','POST',405],['/api/v1/public-prices/offers?ids=x&url=http://127.0.0.1','GET',400],['/api/v1/public-prices/status','GET',200]]){
  const r=await worker.fetch(request(route,method),env);assert.equal(r.status,status,route);assert.equal(r.headers.get('Content-Security-Policy'),CONTENT_SECURITY_POLICY,route);assert.match(r.headers.get('Permissions-Policy'),/camera=\(\)/);assert.equal(r.headers.get('X-Content-Type-Options'),'nosniff');
 }
});
console.log(count+' enforced security policy and real Worker checks passed. This is targeted regression coverage, not a penetration-test certificate.');
