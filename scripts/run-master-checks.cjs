'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const pkg=require('../package.json'),tasks=['check:program','check:continuation','check:growth'].flatMap(key=>pkg.scripts[key].split(' && '));
tasks.push('node scripts/test-master-publication.cjs','node scripts/test-master-evidence.cjs','node scripts/test-master-model-assets.mjs','node scripts/check-master-decisions.cjs','node scripts/check-master-generated.cjs','node scripts/check-seo.cjs','node scripts/check-stage2.cjs','node scripts/check-program-performance.cjs','node scripts/release-preflight.cjs');
tasks.push('node scripts/test-clarity-site.cjs','node scripts/test-phone-clarity.cjs','node scripts/oct14-catalog.test.cjs','node scripts/oct14-editorial-content.test.cjs','node scripts/oct14-price-sources.test.mjs','node scripts/oct14-price-sources-newegg.test.mjs','node scripts/public-price-service.test.mjs','node scripts/test-shopping-price-ui.cjs','node scripts/public-price-client.test.mjs','node scripts/test-guide-directory.cjs');
const results=[];
tasks.push('node scripts/public-price-snapshot.test.mjs','node scripts/public-price-assets.test.mjs');
tasks.push('node scripts/oct16-cooling-data.test.cjs','node scripts/oct16-engine.test.cjs','node scripts/oct16-workspace.test.cjs','node scripts/oct16-editorial.test.cjs','node scripts/oct16-upgrade.test.cjs','node scripts/oct16-scene.test.cjs','node scripts/test-growth-search-client.cjs','node scripts/oct16-delivery.test.cjs');
for(const task of tasks){const args=task.split(' ');if(args.shift()!=='node')throw Error('Unexpected test command');const r=cp.spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:12*1024*1024});results.push({command:task,exitCode:r.status,passed:r.status===0});console.log((r.status===0?'PASS ':'FAIL ')+task);if(r.status!==0)console.log(((r.stdout||'')+(r.stderr||'')).slice(-3500));}
fs.mkdirSync('docs/master/qa',{recursive:true});fs.writeFileSync(path.join('docs/master/qa','test-commands.json'),JSON.stringify({checkedAt:new Date().toISOString(),commands:results.length,passed:results.filter(x=>x.passed).length,results},null,2));
if(results.some(r=>!r.passed))process.exitCode=1;
