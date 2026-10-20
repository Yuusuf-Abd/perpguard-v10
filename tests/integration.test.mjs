import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {once} from 'node:events';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
const mock=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://mock');
 res.setHeader('Content-Type','application/json');
 if(url.pathname.endsWith('/coins/markets'))return res.end(JSON.stringify([{id:'bitcoin',name:'Bitcoin',symbol:'btc',current_price:77777,price_change_percentage_24h:2.5,market_cap:1500000000}]));
 if(url.pathname.endsWith('/market_chart'))return res.end(JSON.stringify({prices:[[1760000000000,70000],[1760003600000,77777]]}));
 if(url.pathname.endsWith('/rate/USD/EUR'))return res.end(JSON.stringify({date:'2026-10-19',rate:0.86}));
 if(url.pathname.endsWith('/rates'))return res.end(JSON.stringify([{date:'2026-10-18',base:'USD',quote:'EUR',rate:0.85},{date:'2026-10-19',base:'USD',quote:'EUR',rate:0.86}]));
 if(url.pathname.endsWith('/responses'))return res.end(JSON.stringify({output:[{content:[{type:'output_text',text:'Verified mock AI answer'}]}]}));
 res.statusCode=404;res.end('{}');
});

test('real HTTP API integration using deterministic mock market, FX and hosted AI providers',async(t)=>{
 mock.listen(0,'127.0.0.1');await once(mock,'listening');
 const upstream=`http://127.0.0.1:${mock.address().port}`;
 const port=18000+Math.floor(Math.random()*30000);
 const proc=spawn(process.execPath,['server/index.mjs'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',COINGECKO_BASE_URL:upstream,FRANKFURTER_BASE_URL:upstream,AI_RESPONSES_URL:upstream+'/responses',OPENAI_API_KEY:'mock-key'},stdio:'ignore'});
 t.after(async()=>{proc.kill();mock.close();});
 const base=`http://127.0.0.1:${port}`;
 let ready=false;
 for(let i=0;i<35;i++){try{const r=await fetch(base+'/api/health');if(r.ok){ready=true;break}}catch{}await wait(100)}
 assert.equal(ready,true,'backend starts');
 const get=async path=>{const r=await fetch(base+path);return [r.status,await r.json()]};
 let [status,data]=await get('/api/health');assert.equal(status,200);assert.equal(data.aiConfigured,true);
 [status,data]=await get('/api/crypto');assert.equal(status,200);assert.equal(data.items[0].price,77777);assert.equal(data.source,'CoinGecko');assert.ok(data.fetchedAt);
 [status,data]=await get('/api/crypto/history?id=bitcoin&days=7');assert.equal(status,200);assert.equal(data.points.length,2);
 [status,data]=await get('/api/crypto/history?id=unknown&days=7');assert.equal(status,400);
 [status,data]=await get('/api/forex?base=USD&quote=EUR');assert.equal(status,200);assert.equal(data.rate,0.86);
 [status,data]=await get('/api/forex/history?base=USD&quote=EUR');assert.equal(status,200);assert.equal(data.points.length,2);
 const chat=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'What is the latest Bitcoin price?',assetId:'bitcoin'})});assert.equal(chat.status,200);const answer=await chat.json();assert.equal(answer.mode,'hosted-AI');assert.equal(answer.answer,'Verified mock AI answer');assert.equal(answer.sources[0].name,'CoinGecko');
 const bad=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:''})});assert.equal(bad.status,400);
});
