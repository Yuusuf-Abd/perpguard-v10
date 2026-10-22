/** PerpGuard read-only market ingestion. No browser secrets, no trading. */
export class UpstreamError extends Error {
  constructor(status, retryAfter=0){super(`Upstream HTTP ${status}`);this.status=status;this.retryAfter=retryAfter;}
}
export function createMarketEngine({fetchImpl=fetch,now=()=>Date.now(),baseUrl='https://api.coingecko.com/api/v3',apiKey='',minIntervalMs=1200}={}){
  const entries=new Map();const inflight=new Map();let blockedUntil=0;let lastRequestAt=0;
  const stats={requests:0,successes:0,rateLimits:0,errors:0,cacheHits:0,staleHits:0};
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function load(path){
    if(now()<blockedUntil)throw new UpstreamError(429,Math.ceil((blockedUntil-now())/1000));
    const delay=Math.max(0,lastRequestAt+minIntervalMs-now());if(delay)await wait(delay);
    lastRequestAt=now();stats.requests++;
    let response;
    try{response=await fetchImpl(baseUrl+path,{headers:apiKey?{'x-cg-demo-api-key':apiKey}:{},signal:AbortSignal.timeout(12000)});}catch(e){stats.errors++;throw e;}
    if(!response.ok){
      if(response.status===429){stats.rateLimits++;const retry=Number(response.headers?.get?.('retry-after'));const seconds=Number.isFinite(retry)&&retry>0?Math.min(retry,300):75;blockedUntil=now()+seconds*1000;throw new UpstreamError(429,seconds);}
      stats.errors++;throw new UpstreamError(response.status);
    }
    let data;try{data=await response.json();}catch{stats.errors++;throw new Error('Invalid market data JSON');}
    stats.successes++;return data;
  }
  async function read(key,path,{ttl=180000,staleTtl=86400000}={}){
    const entry=entries.get(key);const age=entry?now()-entry.at:Infinity;
    if(age<ttl){stats.cacheHits++;return {data:entry.data,fetchedAt:new Date(entry.at).toISOString(),stale:false,cache:'hit'};}
    if(inflight.has(key))return inflight.get(key);
    const task=(async()=>{
      try{const data=await load(path);const at=now();entries.set(key,{data,at});return {data,fetchedAt:new Date(at).toISOString(),stale:false,cache:'miss'};}
      catch(e){if(entry&&age<staleTtl){stats.staleHits++;return {data:entry.data,fetchedAt:new Date(entry.at).toISOString(),stale:true,cache:'stale',warning:e.message};}throw e;}
    })();inflight.set(key,task);try{return await task;}finally{inflight.delete(key);}
  }
  function diagnostics(){return {configured:!!apiKey,provider:'CoinGecko Demo API',cachedKeys:entries.size,inFlight:inflight.size,rateLimited:now()<blockedUntil,retryAfterSeconds:Math.max(0,Math.ceil((blockedUntil-now())/1000)),...stats};}
  return {read,diagnostics};
}
export function normalizeMarkets(items){if(!Array.isArray(items))throw new Error('Invalid markets response');return items.filter(x=>x&&typeof x.id==='string'&&Number.isFinite(Number(x.current_price))).map(x=>({id:x.id,name:String(x.name||x.id),symbol:String(x.symbol||'').toUpperCase(),price:Number(x.current_price),change:Number(x.price_change_percentage_24h)||0,cap:Number(x.market_cap)||0,volume:Number(x.total_volume)||0,rank:Number(x.market_cap_rank)||null,image:typeof x.image==='string'?x.image:null}));}
export function normalizeHistory(data){if(!Array.isArray(data?.prices))throw new Error('Invalid history response');return data.prices.filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1])).map(p=>({at:p[0],price:p[1]}));}
