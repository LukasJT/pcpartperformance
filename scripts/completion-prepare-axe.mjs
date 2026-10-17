/* Development-only, integrity-pinned accessibility tool. Never copied to dist. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const version='4.14.0',integrity='sha512-9WTZxEjsZ7b13TH8JPmbV2z8CHbl80/2hm3XPEG4JgNdQLK81IBRXmSxHfMAOkSqQeRxT/0dwNDz2GOm3zzpcQ==';
const base=path.resolve('tools/quality/vendor/axe-core',version),archive=path.resolve('tmp','axe-core-'+version+'.tgz');
if(!base.startsWith(path.resolve('tools/quality')+path.sep)||!archive.startsWith(path.resolve('tmp')+path.sep))throw Error('Invalid development tool path');
await fs.mkdir(base,{recursive:true});await fs.mkdir(path.dirname(archive),{recursive:true});
const response=await fetch('https://registry.npmjs.org/axe-core/-/axe-core-'+version+'.tgz',{redirect:'error',signal:AbortSignal.timeout(20000)});
if(!response.ok||Number(response.headers.get('Content-Length'))>8*1024*1024)throw Error('Tool download failed');const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>8*1024*1024||'sha512-'+crypto.createHash('sha512').update(bytes).digest('base64')!==integrity)throw Error('Tool integrity mismatch');
await fs.writeFile(archive,bytes);execFileSync('tar',['-xf',archive,'-C',base,'--strip-components=1','package/axe.min.js','package/LICENSE'],{stdio:'pipe'});
const script=await fs.readFile(path.join(base,'axe.min.js'));await fs.writeFile(path.join(base,'provenance.json'),JSON.stringify({package:'axe-core',version,source:'https://registry.npmjs.org/axe-core/-/axe-core-'+version+'.tgz',integrity,scriptSha256:crypto.createHash('sha256').update(script).digest('hex'),license:'MPL-2.0',use:'Local development accessibility QA only; no production dependency'},null,2)+'\n');console.log(JSON.stringify({version,bytes:script.length,developmentOnly:true}));
