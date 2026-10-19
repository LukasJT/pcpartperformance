'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),api=require('./total-catalog.cjs');
test('cooler socket arrays preserve exact named sockets and reject unsafe or duplicate identifiers',()=>{
 assert.deepEqual(api.normalizeUnit('coolerSockets',{value:['AM5','LGA1700','AM3+'],unit:''}).value,['AM5','LGA1700','AM3+']);
 for(const value of [[],['AM5','AM5'],['<script>'],['https://example.com'],['AM5',1]])assert.throws(()=>api.normalizeUnit('coolerSockets',{value,unit:''}));
 assert.throws(()=>api.normalizeUnit('coolerSockets',{value:['AM5'],unit:'mm'}));
});
test('radiator dimensions have explicit units, unknown measurements stay unknown, and no mounting guarantee is implied',()=>{
 assert.equal(api.normalizeUnit('radiatorLengthMm',{value:39.4,unit:'cm'}).value,394);
 assert.equal(api.normalizeUnit('radiatorSizeMm',{value:null,unit:'mm'}).status,'unknown');
 assert.throws(()=>api.normalizeUnit('radiatorWidthMm',{value:120,unit:'in'}));
 assert.throws(()=>api.normalizeUnit('coolerType',{value:'universal-fit',unit:''}));
 for(const value of [1.5,20])assert.throws(()=>api.normalizeUnit('fanCount',{value,unit:''}));
});
