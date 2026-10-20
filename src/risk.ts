export type RiskInput={collateral:number;leverage:number;priceMovePercent:number};
export function simulateRisk({collateral,leverage,priceMovePercent}:RiskInput){
if(![collateral,leverage,priceMovePercent].every(Number.isFinite)||collateral<0||leverage<1||leverage>25||Math.abs(priceMovePercent)>100)throw new Error('Values outside educational simulator limits');
const exposure=collateral*leverage;const hypotheticalPnl=exposure*priceMovePercent/100;
return {exposure,hypotheticalPnl,remainingEquity:Math.max(0,collateral+hypotheticalPnl),drawdown:collateral===0?0:Math.min(100,Math.max(0,-hypotheticalPnl/collateral*100))};}
export const scenarios=[{name:'Calm market',move:-1},{name:'Volatile session',move:-5},{name:'Market shock',move:-12},{name:'Recovery',move:3}];
