// Real external-provider smoke checks: no mocks. Run with backend active.
const base=process.env.TEST_API_BASE_URL||'http://127.0.0.1:8787';
const failures=[];
async function check(name,path,validate){
 try {const r=await fetch(base+path,{signal:AbortSignal.timeout(16000)});const d=await r.json();if(!r.ok)throw Error(`${r.status}: ${JSON.stringify(d).slice(0,160)}`);validate(d);console.log(`PASS ${name}`);}catch(e){console.error(`FAIL ${name}: ${e.message}`);failures.push(name);}
}
await check('Backend health','/api/health',d=>{if(d.ok!==true)throw Error('Not healthy')});
await check('Real CoinGecko market prices','/api/crypto',d=>{if(d.source!=='CoinGecko'||!Array.isArray(d.items)||!d.items.some(x=>Number.isFinite(x.price)&&x.price>0))throw Error('Invalid market data')});
await check('Real CoinGecko history','/api/crypto/history?id=bitcoin&days=7',d=>{if(!Array.isArray(d.points)||d.points.length<2||!d.points.every(p=>Number.isFinite(p.price)))throw Error('Invalid historical data')});
await check('Real Frankfurter exchange rate','/api/forex?base=USD&quote=EUR',d=>{if(!Number.isFinite(d.rate)||d.rate<=0||!d.date)throw Error('Invalid forex quote')});
await check('Real Frankfurter history','/api/forex/history?base=USD&quote=EUR',d=>{if(!Array.isArray(d.points)||d.points.length<2)throw Error('Invalid forex history')});
const health=await fetch(base+'/api/health').then(r=>r.json()).catch(()=>({}));
if(health.aiConfigured){
 try {const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Explain what PerpGuard does.'}),signal:AbortSignal.timeout(24000)});const d=await r.json();if(!r.ok||d.mode!=='hosted-AI'||typeof d.answer!=='string'||d.answer.length<10)throw Error(`AI not responding in hosted mode: ${d.mode||r.status}`);console.log('PASS Real hosted AI response');}catch(e){console.error(`FAIL Hosted AI: ${e.message}`);failures.push('Hosted AI');}
}else console.log('SKIP Hosted AI (OPENAI_API_KEY not configured on server)');
if(failures.length){console.error(`Live checks failed: ${failures.join(', ')}`);process.exitCode=1}else console.log('All available live provider checks passed.');
