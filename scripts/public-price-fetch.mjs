import { PUBLIC_PRICE_POLICY, fetchPublicTarget } from './oct14-price-sources.mjs';
import { fetchNeweggPublicTarget } from './oct14-price-sources-newegg.mjs';
import { fetchCorsairPublicTarget } from './completion-price-expansion.mjs';
import { PUBLIC_SNAPSHOT_TARGETS } from './public-price-snapshot.mjs';

const key = row => [row.merchantId,row.region,row.productId].join(':');
export function fetchRegisteredPublicPrice(target, options = {}) {
  const pinned = PUBLIC_SNAPSHOT_TARGETS.find(row => key(row) === key(target || {}));
  if (!pinned || Object.keys(pinned).some(field => target[field] !== pinned[field])) return Promise.reject(Object.assign(new Error('target_not_registered'),{code:'target_not_registered'}));
  return target.adapter === 'corsair-product-jsonld' ? fetchCorsairPublicTarget(target,options) : target.adapter === 'newegg-original-product-state' ? fetchNeweggPublicTarget(target,options) : fetchPublicTarget(target,options);
}
// A separate cache entry and in-flight request for each exact merchant listing.
export function createFixedPublicPriceCollector({ fetchImpl = (input,init) => globalThis.fetch(input,init), clock = Date.now } = {}) {
  const cache = new Map(), flights = new Map();
  async function listing(target) {
    const id = key(target), existing = cache.get(id), time = clock();
    if (existing && time < existing.until) return existing.result;
    if (flights.has(id)) return flights.get(id);
    const pending = (async () => {
      let result;
      try { result = { productId:target.productId, merchantId:target.merchantId, state:'checked', offer:await fetchRegisteredPublicPrice(target,{fetchImpl,now:clock()}) }; }
      catch (error) { result = { productId:target.productId,merchantId:target.merchantId,state:'unavailable',error:typeof error.code === 'string' ? error.code : 'source_network_error',offer:null }; }
      cache.set(id,{result,until:clock()+(result.offer ? PUBLIC_PRICE_POLICY.cacheMs : PUBLIC_PRICE_POLICY.negativeCacheMs)});
      return result;
    })();
    flights.set(id,pending);
    try { return await pending; } finally { flights.delete(id); }
  }
  return { async collect(ids,{region='CA'}={}) {
    if (!Array.isArray(ids) || ids.length > PUBLIC_PRICE_POLICY.maxIds || !['CA','US'].includes(region)) throw new TypeError('invalid_price_request');
    const offers = [], results = [];
    for (const productId of [...new Set(ids)]) {
      const targets = PUBLIC_SNAPSHOT_TARGETS.filter(row => row.productId === productId && row.region === region);
      if (!targets.length) { results.push({productId,state:'not_covered'}); continue; }
      const outcomes = [];
      // At most two merchant reads run for a product; the fixed registry bounds work.
      for (let start=0; start<targets.length; start+=2) outcomes.push(...await Promise.all(targets.slice(start,start+2).map(listing)));
      for (const row of outcomes) if (row.offer) offers.push(row.offer);
      results.push({productId,state:outcomes.some(row=>row.offer)?'checked':'unavailable',...(outcomes.every(row=>!row.offer)?{error:outcomes[0].error}:{}),sources:outcomes.map(({offer:_,...row})=>row)});
    }
    return {offers,results};
  }};
}
