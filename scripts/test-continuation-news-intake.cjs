'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const intake=require('./continuation-news-intake.cjs');
async function main(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pcp-intake-test-')),source=intake.sources[0];
  try{
    let requests=0;
    const offline=await intake.run({offline:true,stateDir:dir,now:'2026-10-11T12:00:00Z',fetchImpl:async()=>{requests++;throw Error('Offline must not fetch');}});
    assert.equal(requests,0);assert.equal(offline.queued,4);assert.equal(offline.published,0);
    const again=await intake.run({offline:true,stateDir:dir,now:'2026-10-11T12:01:00Z'});assert.equal(again.queued,4);
    const rows=JSON.parse(fs.readFileSync(path.join(dir,'queue.json'),'utf8'));
    for(const r of rows){assert.equal(r.status,'needs-review');assert.equal(r.editorApproved,false);assert.equal(r.confirmedDeployment,false);assert.equal(r.datePublished,null);assert.equal(r.sourcePublishedAt,null);assert.ok(r.affectedArticles.length);assert.match(r.sourceAnnouncementDate,/^2026-\d\d-\d\d$/);}
    assert.equal(intake.bodyFingerprint('<p>same   text</p>'),intake.bodyFingerprint('<div>same text</div><script>noise</script>'));
    const candidates=intake.discoverPixelBulletins(intake.discoverySources[0],'<a href="/docs/security/bulletin/pixel/2026/2026-11-01">November</a><a href="https://evil.example/docs/security/bulletin/pixel/2026/2026-12-01">Fake</a><a href="/docs/security/bulletin/pixel/2026/2026-10-01">Known October</a>','2026-10-11T12:00:00Z');
    assert.equal(candidates.length,1);assert.equal(candidates[0].sourceAnnouncementDate,null);assert.equal(candidates[0].datePublished,null);assert.equal(candidates[0].requiresSourceReinspection,true);
    await assert.rejects(()=>intake.boundedGet(source,{fetchImpl:async()=>new Response('',{status:302,headers:{location:'https://example.com/elsewhere'}})}),/inspected HTTPS host/);
    await assert.rejects(()=>intake.boundedGet(source,{fetchImpl:async()=>new Response('{}',{headers:{'content-type':'application/json'}})}),/content type/);
    await assert.rejects(()=>intake.boundedGet(source,{fetchImpl:async()=>new Response('x'.repeat(intake.MAX_BYTES+1),{headers:{'content-type':'text/html'}})}),/1 MiB/);
    const first=await intake.run({stateDir:dir,now:'2026-10-11T13:00:00Z',fetchImpl:async()=>new Response('<html>first snapshot</html>',{headers:{'content-type':'text/html','etag':'v1'}})});assert.equal(first.queued,8);
    const cached=await intake.run({stateDir:dir,now:'2026-10-11T13:01:00Z',fetchImpl:async()=>{throw Error('Cache must not fetch');}});assert.ok(cached.report.every(r=>r.status==='15-minute cache'));
    const revision=await intake.run({stateDir:dir,now:'2026-10-11T14:00:00Z',fetchImpl:async()=>new Response('<html>material or navigation change</html>',{headers:{'content-type':'text/html'}})});assert.equal(revision.queued,12);
    const changed=JSON.parse(fs.readFileSync(path.join(dir,'queue.json'),'utf8')).filter(r=>r.kind==='source_revision');assert.equal(changed.length,4);assert.ok(changed.every(r=>r.requiresSourceReinspection));
    console.log(JSON.stringify({passed:10,networkRequests:0,productionDecisionsWritten:0,published:0,notice:'All online cases used synthetic Response fixtures.'},null,2));
  }finally{
    const resolved=path.resolve(dir),intended=path.resolve(os.tmpdir())+path.sep+'pcp-intake-test-';if(!resolved.startsWith(intended))throw Error('Unexpected fixture cleanup target');fs.rmSync(resolved,{recursive:true,force:true});
  }
}
main().catch(error=>{console.error(error);process.exitCode=1});
