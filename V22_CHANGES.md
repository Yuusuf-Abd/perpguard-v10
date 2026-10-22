# PerpGuard v22 — screenshot-driven upgrades (phase 1)

- Builds on v21 market infrastructure and Render homepage fix.
- Adds 90-day and 365-day cryptocurrency historical chart ranges.
- Adds interactive 7-day, 30-day, 90-day and 1-year Forex historical ranges.
- Validates supported history ranges server-side; preserves sourced observations and error states.
- Market API still depends on CoinGecko. Set COINGECKO_DEMO_KEY in Render environment and redeploy; no market values are fabricated.

## Not yet implemented
Persistent market storage, token-by-token wallet valuations, full cross-chain wallet history, extended provider redundancy, historical health telemetry, and real perps order execution.

## Deployment
Replace the project contents with this release, preserving the existing Git repository metadata. Commit/push and verify Render deployment. Run npm install, npm test, npm run build locally first.
