import assert from 'node:assert/strict';
import {validateObservation} from './public-price-client.js';
import {PUBLIC_PRICE_TARGETS} from './oct14-price-sources.mjs';
const target=PUBLIC_PRICE_TARGETS[0],now=Date.now(),offer={...target,price:619.99,inStock:true,checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+86400000).toISOString(),url:target.listingUrl,source:{kind:'public-retailer-structured-data',publisher:target.merchant,url:target.listingUrl},charges:{tax:'excluded',shipping:'excluded'}};
assert(validateObservation(offer,target,now));
for(const patch of [{sku:'wrong'},{retailerMpn:'wrong'},{merchant:'Amazon'},{currency:'USD'},{region:'US'},{variant:'another version'},{price:1.001},{price:NaN},{inStock:'true'},{charges:{tax:'included',shipping:'excluded'}},{checkedAt:new Date(now+1).toISOString()},{expiresAt:new Date(now-1).toISOString()},{expiresAt:new Date(now+86400001).toISOString()},{url:'https://evil.invalid'},{source:{kind:'unknown',url:target.listingUrl}}])assert(!validateObservation({...offer,...patch},target,now),JSON.stringify(patch));
assert(validateObservation({...offer,inStock:null},target,now));
assert(!validateObservation({...offer,condition:'unknown'},target,now));
console.log('18 browser-price identity, freshness, charge and availability assertions passed.');
