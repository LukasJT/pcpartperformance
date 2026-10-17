import fs from 'node:fs';
import assert from 'node:assert/strict';
import {PUBLIC_SNAPSHOT_TARGETS} from './public-price-snapshot.mjs';
import {priceHistoryPayload} from './completion-price-history.mjs';
const source=fs.readFileSync(new URL('./completion-price-history.js',import.meta.url),'utf8'),{validatedHistory}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const history=JSON.parse(fs.readFileSync('data/public-price-history.json')),now=Date.now(),id='9800x3d',region='CA',payload=priceHistoryPayload(history,{id,region,now});
const valid=()=>structuredClone(payload),options={id,region,targets:PUBLIC_SNAPSHOT_TARGETS,now};
assert(payload.observations.length>1,'Actual seeded history should retain multiple observations.');assert.equal(validatedHistory(valid(),options).length,payload.observations.length);
for(const mutate of [p=>p.policy='current-offers',p=>p.region='US',p=>p.currency='USD',p=>p.productId='other',p=>p.observations[0].price='123',p=>p.observations[0].price=NaN,p=>p.observations[0].price=-1,p=>p.observations[0].sku='other',p=>p.observations[0].url='javascript:alert(1)',p=>p.observations[0].merchant='Wrong',p=>p.observations[0].inStock='true',p=>p.observations[0].checkedAt=new Date(now+100000).toISOString()]){const value=valid();mutate(value);assert.throws(()=>validatedHistory(value,options),/invalid/);}
const rows=validatedHistory(valid(),options);assert(rows.every((row,i)=>i===0||Date.parse(rows[i-1].checkedAt)>=Date.parse(row.checkedAt)));
assert(!source.includes('innerHTML'),'Remote historical data should be rendered through text/DOM setters.');assert(source.includes('if(!details.open)return'),'No historical request before intentional expansion.');
console.log('16 historical client integrity, safe rendering and opt-in loading assertions passed against original retained observations.');
