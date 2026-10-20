# PerpGuard v14 — read-only evidence and submission clarity

## Added
- Public Somnia Hideki transaction receipt lookup (`GET /api/somnia/receipt?hash=0x…`) with strict hash validation and bounded upstream request.
- Wallet Watch receipt verification panel with loading/error/confirmed/not-found states.
- Distinguishes blockchain receipt success from an actual perpetual order or fill.
- Dedicated compliance gap checklist and source review.

## Not implemented
- No leveraged order execution, wallet signing, trade placement, position management, or claims of on-chain order fills.
- No fabricated evidence, issues, X posts, approvals or deployment.

## Verification
Run `npm.cmd install`, `npm.cmd test`, `npm.cmd run verify`, and `npm.cmd run build`. Public RPC calls require network access and may fail if the endpoint is unavailable. Do not treat passing tests as a substitute for a real browser or live API check.
