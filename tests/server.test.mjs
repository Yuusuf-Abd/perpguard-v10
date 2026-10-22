import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('local API health, validation and safe failures',async()=>{
 const port=18947;const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
 try{
  let response;for(let i=0;i<30;i++){try{response=await fetch(`http://127.0.0.1:${port}/api/health`);break}catch{await sleep(100)}}
  assert.ok(response,'API server should start');assert.equal(response.status,200);
  const health=await response.json();assert.equal(health.ok,true);
  const bad=await fetch(`http://127.0.0.1:${port}/api/crypto/history?id=bitcoin&days=366`);assert.equal(bad.status,400);
  const badFx=await fetch(`http://127.0.0.1:${port}/api/forex/history?base=INVALID&quote=USD`);assert.equal(badFx.status,400);
  const badChat=await fetch(`http://127.0.0.1:${port}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:'not-json'});assert.equal(badChat.status,400);
  const faq=await fetch(`http://127.0.0.1:${port}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'wallet'})});assert.equal(faq.status,200);const data=await faq.json();assert.equal(data.mode,'market-aware-FAQ');
 }finally{child.kill()}
});
