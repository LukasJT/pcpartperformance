import test from 'node:test';
import assert from 'node:assert/strict';
import {addAdPlacements} from './ads-injection.mjs';

const page=kind=>'<html><head></head><body data-page="'+kind+'"><main><section class="tech-intro"><h1>Planning</h1></section><button type="button">Continue</button></main><footer></footer></body></html>';
function slots(html){return [...html.matchAll(/<([a-z]+)\b([^>]*\bclass="pcp-ad-slot"[^>]*)><\/\1>/g)].map(match=>({tag:match[1],attributes:match[2]}));}

test('eligible ad placements expose a valid named semantic container instead of a named generic div',()=>{
 for(const kind of ['home','guide','hardware','learn','catalog-page']){
  const html=addAdPlacements(page(kind)),placements=slots(html);assert.equal(placements.length,kind==='home'?2:1);
  for(const slot of placements){
   const role=slot.attributes.match(/\brole="([^"]+)"/)?.[1];
   assert.ok(slot.tag==='aside'||['complementary','region','group'].includes(role),'An aria-label on a generic div is prohibited: '+slot.tag+' '+slot.attributes);
   assert.match(slot.attributes,/\baria-label="Advertisement"/);assert.match(slot.attributes,/\bdata-pcp-ad="(?:responsive|native|rectangle)"/);
  }
 }
});

test('semantic ad fix preserves existing placement identity, assets, controls and consent access',()=>{
 const html=addAdPlacements(page('home')),placements=slots(html);
 assert.equal(placements.filter(slot=>/data-pcp-ad="responsive"/.test(slot.attributes)).length,1);
 assert.equal(placements.filter(slot=>/data-pcp-ad="native"/.test(slot.attributes)).length,1);
 assert.equal((html.match(/src="\/ads.js"/g)||[]).length,1);assert.equal((html.match(/href="\/ads.css"/g)||[]).length,1);
 assert.ok(html.includes('<button type="button">Continue</button>'));assert.match(html,/<button class="pcp-ad-choices" type="button">Ad choices<\/button>/);
 assert.equal(html.match(/<main>/g)?.length,1);assert.equal(html.match(/<\/main>/g)?.length,1);
});

test('builder, performance and other ineligible workflows remain free of ad insertion',()=>{
 for(const kind of ['builder','resource','performance','workspace','unknown'])assert.equal(addAdPlacements(page(kind)),page(kind));
 const missingMain='<html><head></head><body data-page="guide"><footer></footer></body></html>';assert.equal(addAdPlacements(missingMain),missingMain);
});
