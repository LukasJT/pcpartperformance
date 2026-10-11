'use strict';
// Local release gate. Reports file names and counts, never credential contents.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const git=args=>cp.execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split(/\r?\n/).filter(Boolean);
const candidates=[...new Set([...git(['diff','--name-only','HEAD']),...git(['ls-files','--others','--exclude-standard'])])].filter(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
const syntaxFiles=candidates.filter(f=>/\.(?:cjs|mjs|js)$/.test(f)),syntaxFailures=[];
for(const file of syntaxFiles){const result=cp.spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)syntaxFailures.push(file);}
const secretCandidates=[],unwantedTrackedCandidates=[];
const credentialPattern=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{70,}|AKIA[A-Z0-9]{16}|sk_live_[A-Za-z0-9]{24,})\b/;
for(const file of candidates){
 if(/^(?:tmp|node_modules|\.wrangler)\//.test(file)||/(?:^|\/)(?:\.env(?:\..+)?|credentials|id_rsa|id_ed25519)$/.test(file))unwantedTrackedCandidates.push(file);
 if(/\.(?:cjs|mjs|js|json|jsonc|md|html|txt|yml|yaml|toml|sql|xml|css)$/.test(file)&&fs.statSync(file).size<20_000_000&&credentialPattern.test(fs.readFileSync(file,'utf8')))secretCandidates.push(file);
}
const assets=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.isFile())assets.push({file:file.replaceAll('\\','/'),bytes:fs.statSync(file).size});}}
walk('dist');
const release=JSON.parse(fs.readFileSync('dist/data/release.json','utf8')),routes=JSON.parse(fs.readFileSync('dist/route-policy.json','utf8'));
const report={checkedAt:new Date().toISOString(),changedOrNewFiles:candidates.length,syntaxFiles:syntaxFiles.length,syntaxFailures,secretCandidates,unwantedTrackedCandidates,distFiles:assets.length,distBytes:assets.reduce((n,a)=>n+a.bytes,0),filesOver25MiB:assets.filter(a=>a.bytes>25*1024*1024),staging:routes.staging,releaseStaging:release.staging,scope:'Changed/new JavaScript syntax, recognizable credential patterns, ignored-file leakage, asset upload sizes and normal production build. Not a complete security audit.'};
fs.writeFileSync('docs/program-2026-10-11/release-preflight.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(syntaxFailures.length||secretCandidates.length||unwantedTrackedCandidates.length||report.filesOver25MiB.length||routes.staging||release.staging)process.exitCode=1;
