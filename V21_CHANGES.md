# PerpGuard v21 — market infrastructure repair

This release is based on the original v19 project and includes the v20 Render homepage routing fix.

## Implemented
- Authenticated CoinGecko Demo API requests using server-side `COINGECKO_DEMO_KEY` (never sent to browsers).
- Read-only market ingestion module with 3-minute price cache, 5-minute chart cache, in-flight request deduplication, 429 cooldown, and stale-last-good-data fallback (up to 24 hours).
- Market endpoint now returns up to 25 assets with price, change, cap, volume, rank, and image URL.
- History endpoint supports CoinGecko asset IDs from the market list (validated).
- `/api/market/status` exposes configuration presence and aggregate cache/error diagnostics without secrets.
- UI footer corrected to v21.
- New automated unit tests for caching, authentication, deduplication, stale fallback and normalization.

## Limitations / deployment requirements
- The app DOES NOT operate an independent price feed or database. CoinGecko remains the upstream source. In-memory cache is per Render instance and resets on restart. This is not yet a durable historical-data service.
- On cold start with no valid upstream response, market data may remain unavailable. No prices are fabricated.
- Demo API rate limits and plan entitlements still apply. Request volume must remain within the provider's rules.
- Set `COINGECKO_DEMO_KEY` on Render. Revoke any key exposed in screenshots, logs, or chat first.
- No real leveraged trades, custody, or order execution are implemented.
- Unit/integration tests run offline against mocked providers; production data and browser behavior require verification after deployment.

## Verification
- `npm test` — 25/25 tests passed in this workspace.
- `npm run build` — NOT verified in this workspace because dependencies were unavailable and npm install timed out. Render should run `npm install && npm run build`; inspect deployment logs for actual result.
- After deployment check `/api/health`, `/api/market/status`, `/api/crypto`, `/api/crypto/history?id=bitcoin&days=7`, and the Markets page.
