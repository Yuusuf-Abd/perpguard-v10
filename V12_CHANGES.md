# PerpGuard v12 — Verified-scope ecosystem update

## Implemented
- Public dreamDEX REST market discovery through `/api/dreamdex/markets` (official staging endpoint, Shannon 50312). Returns source data or a visible error. No invented market results.
- Somnia Hideki RPC account inspection `/api/somnia/account?address=0x…` (50383): public gas balance and account nonce. No private keys, wallet signatures or transactions initiated.
- New Ecosystem page with official dreamDEX X profile, docs, Somnia docs and GitHub link.
- Updated Wallet Watch for actual public RPC reads.
- Existing v11 UI, simulations, markets, forex, AI, QA, risk lab retained.

## Important differences
The dreamDEX REST staging API documents Somnia Shannon (50312), whereas the perps SDK developer page documents Hideki (50383). These are different networks. The new discovery panel is **not** the perps SDK and does **not** demonstrate perps order execution. Do not conflate them in a whitelist request.

## Remaining Track B requirements
Actual Hideki testnet perpetual-order integration and verified order transaction evidence, deployed app, demo video, social posts, whitelist approval and DoraHacks submission remain outstanding. No fabricated transaction hashes or claims.

## External links
- https://app.dreamdex.io/docs/developers/http-api
- https://app.dreamdex.io/docs/developers/perps-testnet
- https://x.com/dreamDEXSomnia

## Verification
Run `npm.cmd install`, `npm.cmd run verify`, `npm.cmd run build`, then browser/live API checks. Provider calls require internet access and may be rate limited.
