import test from 'node:test';import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
test('read-only receipt endpoint rejects malformed hashes without upstream access',async()=>{
 const port=18977;const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1'},stdio:'ignore'});
 try{let ready=false;for(let i=0;i<35;i++){try{const r=await fetch(`http://127.0.0.1:${port}/api/health`);if(r.ok){ready=true;break}}catch{}await delay(100)}assert.ok(ready,'server did not start');const r=await fetch(`http://127.0.0.1:${port}/api/somnia/receipt?hash=invalid`);assert.equal(r.status,400);const data=await r.json();assert.match(data.error,/transaction hash/i)}finally{child.kill()}
});
