export type PreviewInput={symbol:string;side:'long'|'short';type:'market'|'limit';collateral:number;leverage:number;referencePrice:number;limitPrice?:number;slippagePercent:number;feeRatePercent:number};
export function previewOrder(x:PreviewInput){
 const numeric=[x.collateral,x.leverage,x.referencePrice,x.slippagePercent,x.feeRatePercent,...(x.type==='limit'?[x.limitPrice??NaN]:[])];
 if(!numeric.every(Number.isFinite)||x.collateral<=0||x.collateral>1e7||x.leverage<1||x.leverage>25||x.referencePrice<=0||x.referencePrice>1e12||x.slippagePercent<0||x.slippagePercent>10||x.feeRatePercent<0||x.feeRatePercent>5||x.type==='limit'&&(x.limitPrice??0)<=0)throw Error('Enter valid positive amounts and supported limits.');
 if(!/^[A-Z0-9_-]{2,20}$/.test(x.symbol))throw Error('Choose a valid market symbol.');
 const notional=x.collateral*x.leverage;
 const reference=x.type==='limit'?x.limitPrice!:x.referencePrice;
 const worstPrice=reference*(1+(x.side==='long'?1:-1)*x.slippagePercent/100);
 if(worstPrice<=0)throw Error('Invalid estimated execution price.');
 const quantity=notional/worstPrice;
 const estimatedFee=notional*x.feeRatePercent/100;
 const exposureToCollateral=notional/x.collateral;
 const scenario=(percent:number)=>({movePercent:percent,pnl:notional*percent/100*(x.side==='long'?1:-1),equityBeforeFunding:Math.max(0,x.collateral+notional*percent/100*(x.side==='long'?1:-1)-estimatedFee)});
 return {symbol:x.symbol,side:x.side,type:x.type,notional,worstPrice,quantity,estimatedFee,exposureToCollateral,scenarios:[scenario(-5),scenario(5)],note:'Educational estimate only. No order is transmitted; fees, funding, maintenance margin and actual fills may differ.'};
}
