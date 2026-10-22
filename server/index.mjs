import {chainStatus,inspectTransaction,inspectContract,isHash,isAddress} from './protocol.mjs';
import http from 'node:http';
import {URL} from 'node:url';
import {readFile,stat} from 'node:fs/promises';
import {join,extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const PORT=Number(process.env.PORT||8787);
const COINGECKO_BASE=process.env.COINGECKO_BASE_URL||'https://api.coingecko.com/api/v3';
const FRANKFURTER_BASE=process.env.FRANKFURTER_BASE_URL||'https://api.frankfurter.dev/v2';
const AI_RESPONSES_URL=process.env.AI_RESPONSES_URL||'https://api.openai.com/v1/responses';
const DIST=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
async function serveStatic(pathname,res){
  let decoded;try{decoded=decodeURIComponent(pathname)}catch{return false}
  const requested=resolve(DIST,'.'+decoded);
  if(requested!==DIST&&!requested.startsWith(DIST+sep))return false;
  let target=decoded==='/'?join(DIST,'index.html'):requested;
  try{if(!(await stat(target)).isFile())return false}catch{if(extname(decoded))return false;target=join(DIST,'index.html')}
  try{const data=await readFile(target);res.writeHead(200,{'Content-Type':MIME[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':target.endsWith('index.html')?'no-cache':'public, max-age=3600'});res.end(data);return true}catch{return false}
}
const ASSETS=new Map([['bitcoin','Bitcoin'],['ethereum','Ethereum'],['solana','Solana'],['chainlink','Chainlink'],['polygon-ecosystem-token','POL']]);
const cache=new Map();const requests=new Map();
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Access-Control-Allow-Origin':'http://127.0.0.1:5173'});res.end(JSON.stringify(data));}
async function cached(key,ttl,fn){const old=cache.get(key);if(old&&Date.now()-old.at<ttl)return old.data;const data=await fn();cache.set(key,{at:Date.now(),data});return data;}
async function getJSON(url,headers={}){const response=await fetch(url,{headers,signal:AbortSignal.timeout(9000)});if(!response.ok)throw new Error(`Upstream HTTP ${response.status}`);return response.json();}
const sectionGuide=`Welcome to PerpGuard! Here is how to use every section:
1. Overview: read the product tour and data-source status; open a feature from the navigation.
2. Markets: search assets, compare sourced quotes, select a coin and time range to view historical charts; check the fetched timestamp.
3. Forex: select base and quote currencies to view dated Frankfurter reference rates and history; these are not live execution quotes.
4. Risk Lab: change hypothetical collateral, leverage and market movement to understand scenario sensitivity; nothing is traded.
5. Reliability: check backend connectivity, response latency and simulated outage behavior.
6. Wallet Watch: inspect a public compatible address and check existing Somnia transaction hashes; this does not connect a wallet or transfer assets.
7. Paper Portfolio: experiment with simulated positions and results; all trades are fictional.
8. QA Center: document reproducible issues and export Markdown drafts; never publish security vulnerabilities.
9. Help & Support: ask questions here; hosted AI needs a server key, otherwise documented FAQ mode responds.
10. Ecosystem: find official dreamDEX documentation, bot kit and community links.
11. About: review data sources, methodology and limitations.`;
const walletGuide=`Wallets and transactions in PerpGuard:
• Receiving: PerpGuard is not a wallet or custodian. Use an external wallet you control to obtain the receiving address for the correct asset and network. The funds arrive in that wallet, not in PerpGuard.
• Sending/withdrawing: PerpGuard cannot initiate a transfer. Use your external wallet's own interface and review the recipient address, network, asset, amount and network fee before any approval. Blockchain transfers are generally irreversible.
• Different coins and networks: a similar-looking address does not mean that every token or blockchain is compatible. PerpGuard does not perform swaps, bridges or cross-chain transfers.
• Tracking: Wallet Watch can inspect supported public account information and look up an existing Somnia transaction hash. Check the network, hash, receipt status, block and explorer independently. A successful receipt does not prove a token transfer or a perpetual fill.
• Privacy: Never share a seed phrase, private key or wallet password with PerpGuard, its AI or anyone else. Public address activity may be visible to others.
• Recovery: If PerpGuard is unavailable, assets in your external wallet remain accessible using that wallet's normal recovery and access process.`;
const knowledge=[['wallet',walletGuide],['receive',walletGuide],['send',walletGuide],['withdraw',walletGuide],['transfer',walletGuide],['transaction',walletGuide],['coin',walletGuide],['network',walletGuide],['deposit',walletGuide],['address',walletGuide],['seed',walletGuide],['forex','Forex uses dated Frankfurter reference rates, not real-time executable quotes. Choose the base and quote currencies and inspect the source date.'],['market','Markets retrieves CoinGecko data when available; search, sort, select a chart asset and compare historical ranges. Check timestamps and upstream errors.'],['chart','Open Markets, choose an asset and history range, then inspect the sourced chart and tooltip. Historical trends do not predict future prices.'],['risk','Risk Lab models hypothetical collateral, leverage and price changes. It never opens a position or submits an order.'],['qa','QA Center exports Markdown issue drafts. Confirm steps, expected versus actual behavior, environment and evidence before reporting. Security findings must go privately to security@dreamdex.io.'],['security',walletGuide],['portfolio','Paper Portfolio contains simulated positions only, not actual holdings or orders.'],['reliability','Reliability checks backend health and demonstrates fault handling. A simulated outage is not a real upstream outage.'],['ecosystem','Ecosystem provides links to official dreamDEX and Somnia documentation, Perps Arena, bot resources and community channels.']];
function docsAnswer(question){const q=question.toLowerCase();if(/\b(hello|hi|hey|welcome|start|guide|tour|all sections|every section|how to use|operate|features|overview|help me)\b/.test(q))return sectionGuide+'\n\n'+walletGuide;const hits=knowledge.filter(([word])=>q.includes(word));return hits.length?[...new Set(hits.map(([,answer])=>answer))].join('\n\n'):'Welcome to PerpGuard! Ask “Give me a tour of every section” or “How do I use Wallet Watch?” for step-by-step help. I can also explain market charts, forex, risk simulations, transaction receipts, QA and the ecosystem.';}
const server=http.createServer(async(req,res)=>{if(!req.url)return json(res,404,{error:'Not found'});const url=new URL(req.url,`http://localhost:${PORT}`);const ip=req.socket.remoteAddress||'unknown';const recent=(requests.get(ip)||[]).filter(t=>Date.now()-t<60000);if(recent.length>=60)return json(res,429,{error:'Too many requests; retry later.'});recent.push(Date.now());requests.set(ip,recent);
try{
// Dedicated read-only protocol diagnostics and evidence endpoints.
if(req.method==='GET'&&url.pathname==='/api/protocol/status')return json(res,200,await chainStatus());
if(req.method==='GET'&&url.pathname==='/api/protocol/transaction'){
 const hash=url.searchParams.get('hash')||'';
 if(!isHash(hash))return json(res,400,{error:'Enter a 0x-prefixed 32-byte public transaction hash.'});
 return json(res,200,await inspectTransaction(hash));
}
if(req.method==='GET'&&url.pathname==='/api/protocol/contract'){
 const address=url.searchParams.get('address')||'';
 if(!isAddress(address))return json(res,400,{error:'Enter a 0x-prefixed 20-byte public contract address.'});
 return json(res,200,await inspectContract(address));
}
// Public dreamDEX REST market discovery; no authentication or trading.
if(req.method==='GET'&&url.pathname==='/api/dreamdex/markets'){
 const endpoint='https://stg.api.dreamdex.io/v0/markets';
 const data=await cached('dreamdex-markets',60000,()=>getJSON(endpoint));
 return json(res,200,{source:'dreamDEX public REST API',network:'Somnia Shannon testnet',chainId:50312,endpoint,fetchedAt:new Date(cache.get('dreamdex-markets').at).toISOString(),data});
}
// Somnia Hideki public account state. Never receives keys or signs transactions.
if(req.method==='GET'&&url.pathname==='/api/somnia/account'){
 const address=url.searchParams.get('address')||'';
 if(!/^0x[a-fA-F0-9]{40}$/.test(address))return json(res,400,{error:'A public 20-byte EVM address is required.'});
 const rpc=process.env.SOMNIA_HIDEKI_RPC||'https://api.hideki2.infra.testnet.somnia.network';
 async function rpcRead(method){const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params:[address,'latest']}),signal:AbortSignal.timeout(9000)});if(!response.ok)throw Error('Somnia RPC unavailable');const data=await response.json();if(data.error||typeof data.result!=='string'||!/^0x[0-9a-fA-F]+$/.test(data.result))throw Error('Invalid RPC response');return data.result;}
 const [balance,nonce]=await Promise.all([rpcRead('eth_getBalance'),rpcRead('eth_getTransactionCount')]);
 return json(res,200,{source:'Somnia Hideki JSON-RPC',network:'Hideki testnet',chainId:50383,address,gasBalanceSTT:(Number(BigInt(balance)/1000000000000000n)/1000).toFixed(6),transactionCount:Number(BigInt(nonce)),checkedAt:new Date().toISOString()});
}
// Read-only transaction receipt verification. Does not submit transactions or infer trading fills.
if(req.method==='GET'&&url.pathname==='/api/somnia/receipt'){
 const hash=url.searchParams.get('hash')||'';
 if(!/^0x[0-9a-fA-F]{64}$/.test(hash))return json(res,400,{error:'A 32-byte public transaction hash is required.'});
 const rpc=process.env.SOMNIA_HIDEKI_RPC||'https://api.hideki2.infra.testnet.somnia.network';
 const response=await fetch(rpc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_getTransactionReceipt',params:[hash]}),signal:AbortSignal.timeout(9000)});
 if(!response.ok)throw Error('Somnia RPC unavailable');
 const payload=await response.json();
 if(payload.error)throw Error('RPC returned an error');
 const receipt=payload.result;
 if(receipt===null)return json(res,200,{found:false,hash,network:'Somnia Hideki testnet',chainId:50383,checkedAt:new Date().toISOString(),note:'No confirmed receipt found. This does not prove failure or success.'});
 if(!receipt||typeof receipt!=='object'||typeof receipt.transactionHash!=='string'||receipt.transactionHash.toLowerCase()!==hash.toLowerCase()||!/^0x[0-9a-fA-F]+$/.test(receipt.blockNumber||'')||!/^0x[0-9a-fA-F]+$/.test(receipt.status||''))throw Error('Invalid RPC receipt');
 return json(res,200,{found:true,hash,network:'Somnia Hideki testnet',chainId:50383,blockNumber:Number(BigInt(receipt.blockNumber)),status:receipt.status==='0x1'?'confirmed-success':'confirmed-reverted',from:typeof receipt.from==='string'?receipt.from:null,to:typeof receipt.to==='string'?receipt.to:null,checkedAt:new Date().toISOString(),note:'This is a blockchain receipt only. It does not prove a perpetual order was placed or filled.'});
}
if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,aiConfigured:!!process.env.OPENAI_API_KEY,cryptoConfigured:!!process.env.COINGECKO_DEMO_KEY,now:new Date().toISOString()});
if(req.method==='GET'&&url.pathname==='/api/crypto'){
const ids='bitcoin,ethereum,solana,chainlink,polygon-ecosystem-token';const headers=process.env.COINGECKO_DEMO_KEY?{'x-cg-demo-api-key':process.env.COINGECKO_DEMO_KEY}:{};
const result=await cached('crypto',65000,()=>getJSON(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h`,headers));
return json(res,200,{source:'CoinGecko',fetchedAt:new Date(cache.get('crypto').at).toISOString(),items:result.map(x=>({id:String(x.id),name:String(x.name),symbol:String(x.symbol).toUpperCase(),price:Number(x.current_price),change:Number(x.price_change_percentage_24h),cap:Number(x.market_cap)}))});}
if(req.method==='GET'&&url.pathname==='/api/crypto/history'){
const allowed=new Set(['bitcoin','ethereum','solana','chainlink','polygon-ecosystem-token']);const id=url.searchParams.get('id')||'bitcoin';const days=url.searchParams.get('days')||'7';if(!allowed.has(id)||!['1','7','30'].includes(days))return json(res,400,{error:'Unsupported asset or time range.'});
const headers=process.env.COINGECKO_DEMO_KEY?{'x-cg-demo-api-key':process.env.COINGECKO_DEMO_KEY}:{};
const key=`history:${id}:${days}`;const data=await cached(key,120000,()=>getJSON(`${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,headers));
if(!Array.isArray(data.prices))throw Error('Unexpected upstream response');return json(res,200,{source:'CoinGecko',fetchedAt:new Date(cache.get(key).at).toISOString(),points:data.prices.filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1])).map(p=>({at:p[0],price:p[1]}))});}
if(req.method==='GET'&&url.pathname==='/api/forex/history'){
const base=(url.searchParams.get('base')||'USD').toUpperCase();const quote=(url.searchParams.get('quote')||'EUR').toUpperCase();const currencies=new Set(['USD','EUR','GBP','NGN','JPY','CAD','CHF','AUD']);if(!currencies.has(base)||!currencies.has(quote))return json(res,400,{error:'Unsupported currency.'});
const end=new Date(),start=new Date(end.getTime()-30*86400000);const startDate=start.toISOString().slice(0,10);const endDate=end.toISOString().slice(0,10);
if(base===quote)return json(res,200,{source:'Identity conversion',points:[{date:startDate,rate:1},{date:endDate,rate:1}]});
const key=`fxhist:${base}:${quote}:${endDate}`;const data=await cached(key,3600000,()=>getJSON(`${FRANKFURTER_BASE}/rates?from=${startDate}&to=${endDate}&base=${base}&quotes=${quote}`));
if(!Array.isArray(data))throw Error('Unexpected forex history response');return json(res,200,{source:'Frankfurter',points:data.filter(x=>x.quote===quote&&Number.isFinite(Number(x.rate))).map(x=>({date:String(x.date),rate:Number(x.rate)})).sort((a,b)=>a.date.localeCompare(b.date))});}
if(req.method==='GET'&&url.pathname==='/api/forex'){
const base=(url.searchParams.get('base')||'USD').toUpperCase();const quote=(url.searchParams.get('quote')||'EUR').toUpperCase();if(!/^[A-Z]{3}$/.test(base)||!/^[A-Z]{3}$/.test(quote))return json(res,400,{error:'Use ISO 3-letter currency codes.'});if(base===quote)return json(res,200,{base,quote,rate:1,date:new Date().toISOString().slice(0,10),source:'Identity conversion'});
const data=await cached(`fx:${base}:${quote}`,3600000,()=>getJSON(`${FRANKFURTER_BASE}/rate/${base}/${quote}`));return json(res,200,{base,quote,rate:Number(data.rate),date:String(data.date),source:'Frankfurter daily reference rate'});}
if(req.method==='POST'&&url.pathname==='/api/chat'){
let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8000)return json(res,413,{error:'Message too large'});}let body;try{body=JSON.parse(raw);}catch{return json(res,400,{error:'Invalid JSON'});}const question=String(body.question||'').trim();if(!question||question.length>700)return json(res,400,{error:'Question must be 1–700 characters.'});
const assetId=ASSETS.has(body.assetId)?body.assetId:'bitcoin';let marketContext='Market data unavailable; do not invent prices.';let marketSnapshot=null;
if(/\b(price|market|bitcoin|btc|ethereum|eth|solana|sol|chainlink|link|pol|trend|change|24.hours|snapshot|fresh)\b/i.test(question)){try{const headers=process.env.COINGECKO_DEMO_KEY?{'x-cg-demo-api-key':process.env.COINGECKO_DEMO_KEY}:{};const key='assistant:'+assetId;const m=await cached(key,90000,()=>getJSON(`${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${assetId}&sparkline=false&price_change_percentage=24h`,headers));const coin=Array.isArray(m)?m[0]:null;if(coin&&Number.isFinite(Number(coin.current_price))){marketSnapshot={asset:ASSETS.get(assetId),symbol:String(coin.symbol).toUpperCase(),priceUSD:Number(coin.current_price),change24hPercent:Number(coin.price_change_percentage_24h),source:'CoinGecko',fetchedAt:new Date(cache.get(key).at).toISOString()};marketContext=JSON.stringify(marketSnapshot)}}catch{}}
const contextQuestion=/\b(price|market|bitcoin|btc|ethereum|eth|solana|sol|chainlink|link|pol|trend|change|24.hours|snapshot|fresh)\b/i.test(question);
const fallback=()=>json(res,200,{answer:(contextQuestion?(marketSnapshot?`${marketSnapshot.asset} (${marketSnapshot.symbol}): $${marketSnapshot.priceUSD.toLocaleString('en-US')} USD; 24-hour change ${Number.isFinite(marketSnapshot.change24hPercent)?marketSnapshot.change24hPercent.toFixed(2)+'%':'unavailable'}. Source: CoinGecko; fetched ${marketSnapshot.fetchedAt}. This is a historical 24-hour change, not a forecast.\n\n`:'Live market snapshot could not be retrieved. No prices will be fabricated.\n\n'):'')+docsAnswer(question),mode:'market-aware-FAQ',sources:marketSnapshot?[{name:'CoinGecko',fetchedAt:marketSnapshot.fetchedAt}]:['README.md','QA.md']});
if(!process.env.OPENAI_API_KEY)return fallback();
try{const response=await fetch(AI_RESPONSES_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',max_output_tokens:350,instructions:'You are PerpGuard support. Begin greetings with Welcome to PerpGuard. When asked for a tour, explain every site section: Overview, Markets, Forex, Risk Lab, Reliability, Wallet Watch, Paper Portfolio, QA Center, Help & Support, Ecosystem and About. Explain that assets belong to external wallets, not PerpGuard; receiving uses a compatible external wallet address, and withdrawals are performed in that external wallet, never inside PerpGuard. Explain that network, recipient, token and fee must be checked, that confirmed transfers are generally irreversible, and that public transaction receipts do not prove a token transfer or order fill. Never request secrets. Answer interactively with concise follow-up explanations and the provided timestamped market context when relevant. Only answer questions about the documented features: read-only sourced CoinGecko market quotes, Frankfurter daily FX reference rates, educational risk simulation, reliability demos, QA draft export, read-only public wallet monitoring and Somnia transaction receipt checks. Never claim transactions, custody, live trading, real-time forex quotes, or AI market predictions. Never solicit wallet secrets. Do not provide financial recommendations, leveraged trading instructions, automated order execution, or position recommendations. Provide general educational explanations of market mechanics and risk instead. If unsure, say so. Be concise.',input:[...((Array.isArray(body.history)?body.history:[]).slice(-6).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,800)}))),{role:'user',content:`Current question: ${question}\nVerified market context: ${marketContext}\nOnly use verified context for current prices; explain data timestamps and uncertainty. No financial advice.`}]}),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`AI provider HTTP ${response.status}`);const data=await response.json();const answer=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');if(!answer)throw Error('No answer');return json(res,200,{answer,mode:'hosted-AI',sources:marketSnapshot?[{name:'CoinGecko',fetchedAt:marketSnapshot.fetchedAt}]:['PerpGuard documentation']});}catch{return fallback();}}
if(req.method==='GET'&&!url.pathname.startsWith('/api/')&&await serveStatic(url.pathname,res))return;
return json(res,404,{error:'Not found'});
}catch(err){return json(res,503,{error:'Data source temporarily unavailable',detail:String(err.message||'Unknown error').slice(0,120)});}});
server.listen(PORT,process.env.HOST||'127.0.0.1',()=>console.log(`PerpGuard: http://127.0.0.1:${PORT}`));
