import test from 'node:test';
import assert from 'node:assert/strict';
import {createMarketEngine,normalizeMarkets,normalizeHistory} from '../server/market-engine.mjs';
const ok=data=>({ok:true,json:async()=>data});
test('authenticated requests are cached and deduplicated',async()=>{
 let calls=0;const engine=createMarketEngine({apiKey:'test-only',minIntervalMs:0,fetchImpl:async(_url,opts)=>{calls++;assert.equal(opts.headers['x-cg-demo-api-key'],'test-only');return ok([{id:'bitcoin',current_price:5}]);}});
 const [a,b]=await Promise.all([engine.read('markets','/coins/markets'),engine.read('markets','/coins/markets')]);assert.equal(calls,1);assert.deepEqual(a,b);assert.equal((await engine.read('markets','/coins/markets')).cache,'hit');
});
test('429 preserves last known good snapshot and signals stale',async()=>{
 let time=100000;let calls=0;const engine=createMarketEngine({now:()=>time,minIntervalMs:0,fetchImpl:async()=>{calls++;return calls===1?ok({prices:[[1,2]]}):{ok:false,status:429,headers:{get:()=> '60'}};}});
 await engine.read('history','/history',{ttl:1000});time+=2000;const stale=await engine.read('history','/history',{ttl:1000});assert.equal(stale.stale,true);assert.equal(stale.data.prices[0][1],2);assert.equal(engine.diagnostics().rateLimited,true);
});
test('normalizers reject malformed data and retain numeric prices',()=>{
 assert.equal(normalizeMarkets([{id:'btc',current_price:10,symbol:'btc'},{id:'bad',current_price:'no'}]).length,1);
 assert.deepEqual(normalizeHistory({prices:[[123,10],['bad',12]]}),[{at:123,price:10}]);
});
