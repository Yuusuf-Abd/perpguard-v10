// Public, read-only Somnia Hideki protocol evidence inspection.
export const RPC_DEFAULT='https://api.hideki2.infra.testnet.somnia.network';
export const isHash=x=>/^0x[0-9a-fA-F]{64}$/.test(x);
export const isAddress=x=>/^0x[0-9a-fA-F]{40}$/.test(x);
export async function rpcCall(method,params=[],rpc=process.env.SOMNIA_HIDEKI_RPC||RPC_DEFAULT){
 const response=await fetch(rpc,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(9000)});
 if(!response.ok)throw Error(`RPC HTTP ${response.status}`);
 const body=await response.json();if(body.error)throw Error('RPC rejected request');return body.result;
}
export async function chainStatus(call=rpcCall){const [chainId,block]=await Promise.all([call('eth_chainId'),call('eth_blockNumber')]);if(chainId!=='0xc4cf'){
 // Validate against decimal 50383 rather than relying on a hardcoded hex string.
 if(typeof chainId!=='string'||Number(BigInt(chainId))!==50383)throw Error('RPC network mismatch: expected Somnia Hideki chain 50383');
 }
 return {network:'Somnia Hideki',chainId:50383,blockNumber:Number(BigInt(block)),checkedAt:new Date().toISOString(),source:'Somnia JSON-RPC',mode:'read-only'};}
export async function inspectTransaction(hash,call=rpcCall){if(!isHash(hash))throw Error('Invalid public transaction hash');
 const [receipt,transaction]=await Promise.all([call('eth_getTransactionReceipt',[hash]),call('eth_getTransactionByHash',[hash])]);
 if(!receipt)return {found:false,hash,fillVerification:'not-established',note:'No confirmed receipt found.'};
 if(typeof receipt.transactionHash!=='string'||receipt.transactionHash.toLowerCase()!==hash.toLowerCase())throw Error('RPC returned mismatched transaction');
 const logs=Array.isArray(receipt.logs)?receipt.logs:[];
 return {found:true,hash,blockNumber:receipt.blockNumber?Number(BigInt(receipt.blockNumber)):null,status:receipt.status==='0x1'?'success':receipt.status==='0x0'?'reverted':'unknown',from:receipt.from||null,to:receipt.to||null,transactionInputBytes:typeof transaction?.input==='string'?Math.max(0,(transaction.input.length-2)/2):null,logCount:logs.length,logs:logs.slice(0,100).map((log)=>({address:log.address||null,topics:Array.isArray(log.topics)?log.topics.slice(0,4):[],logIndex:log.logIndex||null,removed:log.removed===true})),logsTruncated:logs.length>100,fillVerification:'not-established',note:'Raw emitted logs are authentic RPC data but not decoded protocol fills. Only a verified contract ABI and known deployment can establish fill semantics.',checkedAt:new Date().toISOString()};
}
export async function inspectContract(address,call=rpcCall){if(!isAddress(address))throw Error('Invalid public contract address');const code=await call('eth_getCode',[address,'latest']);if(typeof code!=='string'||!/^0x[0-9a-fA-F]*$/.test(code))throw Error('Invalid RPC bytecode');return {address,hasCode:code!=='0x',bytecodeBytes:(code.length-2)/2,verifiedDreamdexContract:false,note:'Deployed bytecode does not establish that this address is an official dreamDEX contract.',checkedAt:new Date().toISOString()};}
