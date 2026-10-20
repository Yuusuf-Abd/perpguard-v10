import {useEffect,useMemo,useState} from 'react';

type Asset={id:string;name:string;symbol:string;price:number};
type Trade={id:string;at:string;asset:string;symbol:string;side:'buy'|'sell';quantity:number;price:number};
const START=10000;
const STORE='perpguard.paper.v1';
function read():Trade[]{try{const v=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(v)?v.filter(t=>typeof t.id==='string'&&typeof t.asset==='string'&&['buy','sell'].includes(t.side)&&Number.isFinite(t.quantity)&&t.quantity>0&&Number.isFinite(t.price)&&t.price>0).slice(0,500):[]}catch{return []}}
const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
export function PaperPortfolio({coins}:{coins:Asset[]}){
 const [trades,setTrades]=useState<Trade[]>(read);
 const [selected,setSelected]=useState('bitcoin');
 const [amount,setAmount]=useState('100');
 const [notice,setNotice]=useState('');
 const [confirmReset,setConfirmReset]=useState(false);
 useEffect(()=>{try{localStorage.setItem(STORE,JSON.stringify(trades))}catch{setNotice('Browser storage is unavailable; activity may not persist.')}},[trades]);
 const holdings=useMemo(()=>{const h:Record<string,number>={};for(const t of trades)h[t.asset]=(h[t.asset]||0)+(t.side==='buy'?1:-1)*t.quantity;return h},[trades]);
 const cash=START+trades.reduce((v,t)=>v+(t.side==='buy'?-1:1)*t.quantity*t.price,0);
 const value=cash+coins.reduce((v,c)=>v+(holdings[c.id]||0)*c.price,0);
 const coin=coins.find(c=>c.id===selected);
 function exportActivity(){
  const rows=[['date_utc','side','asset','symbol','quantity','price_usd','notional_usd'],...trades.map(t=>[t.at,t.side,t.asset,t.symbol,String(t.quantity),String(t.price),String(t.quantity*t.price)])];
  const csv=rows.map(row=>row.map(cell=>'"'+String(cell).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='perpguard-paper-activity.csv';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  setNotice('Simulated activity exported as CSV.');
 }

 function execute(side:'buy'|'sell'){
  setNotice('');if(!coin||!Number.isFinite(coin.price)||coin.price<=0){setNotice('Current sourced quote unavailable. No simulated order recorded.');return}
  const dollars=Number(amount);if(!Number.isFinite(dollars)||dollars<=0||dollars>1000000){setNotice('Enter a positive USD amount no greater than $1,000,000.');return}
  const quantity=dollars/coin.price;
  if(side==='buy'&&dollars>cash+0.000001){setNotice('Insufficient virtual cash.');return}
  if(side==='sell'&&quantity>(holdings[coin.id]||0)+1e-9){setNotice('Insufficient virtual asset balance.');return}
  setTrades(v=>[...v,{id:crypto.randomUUID(),at:new Date().toISOString(),asset:coin.id,symbol:coin.symbol,side,quantity,price:coin.price}]);setNotice(`Simulated ${side} recorded at ${usd(coin.price)}. No blockchain transaction occurred.`)
 }
 return <section className="section"><div className="section-heading"><div><p className="eyebrow">PERPGUARD / PRACTICE</p><h1>Paper Portfolio</h1><p className="muted">Build and rebalance a virtual portfolio with current sourced quotes. Trades are simulations, not transfers or orders.</p></div></div><div className="stat-grid"><article className="card stat"><p className="eyebrow">VIRTUAL PORTFOLIO</p><strong>{usd(value)}</strong><span>Valued using available current quotes</span></article><article className="card stat"><p className="eyebrow">AVAILABLE VIRTUAL USD</p><strong>{usd(cash)}</strong><span>Starting balance {usd(START)}</span></article><article className="card stat"><p className="eyebrow">SIMULATED TRADES</p><strong>{trades.length}</strong><span>Saved locally in this browser</span></article></div><div className="two-col"><article className="card"><h2>Practice a spot transaction</h2><label>Asset<select value={selected} onChange={e=>setSelected(e.target.value)}>{coins.map(c=><option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}</select></label><label>Virtual amount (USD)<input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/></label><p className="muted small">{coin?`Latest sourced quote: ${usd(coin.price)} · Approx. ${Number(amount)>0?(Number(amount)/coin.price).toFixed(8):'0'} ${coin.symbol.toUpperCase()}`:'Waiting for market data. Start the backend and refresh Markets.'}</p><div className="hero-actions"><button className="primary" type="button" disabled={!coin} onClick={()=>execute('buy')}>Practice buy</button><button className="secondary" type="button" disabled={!coin} onClick={()=>execute('sell')}>Practice sell</button></div>{notice&&<p className="notice" role="status">{notice}</p>}<p className="muted small">No wallet connection, deposit, withdrawal, leverage, or blockchain broadcast. Prices may be delayed.</p></article><article className="card"><h2>Virtual holdings</h2>{coins.filter(c=>(holdings[c.id]||0)>1e-9).length===0?<p className="muted">No assets held. Practice a buy to begin.</p>:coins.filter(c=>(holdings[c.id]||0)>1e-9).map(c=><div className="coin-row" key={c.id}><b>{c.symbol.toUpperCase()}</b><span>{holdings[c.id].toFixed(6)}</span><span>{usd(holdings[c.id]*c.price)}</span></div>)}<div className="hero-actions">{confirmReset?<><button className="secondary" onClick={()=>{setTrades([]);setConfirmReset(false);setNotice('Virtual portfolio reset.')}}>Confirm reset</button><button className="secondary" onClick={()=>setConfirmReset(false)}>Cancel</button></>:<button className="secondary" onClick={()=>setConfirmReset(true)}>Reset virtual portfolio</button>}</div></article></div><article className="card"><div className="card-title"><h2>Activity log</h2><button type="button" className="secondary" onClick={exportActivity}>Export CSV</button></div>{trades.length===0?<p className="muted">Your simulated transactions will appear here.</p>:<div className="coin-list">{[...trades].reverse().slice(0,30).map(t=><div className="coin-row" key={t.id}><b>{t.side.toUpperCase()} {t.symbol.toUpperCase()}</b><span>{usd(t.quantity*t.price)}</span><span>{new Date(t.at).toLocaleString()}</span></div>)}</div>}</article></section>
}
