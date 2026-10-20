# PerpGuard v4 — Market Intelligence Workspace

An independent educational research interface. No custody, wallet signatures, cryptocurrency transfers or trade execution.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```powershell
npm.cmd install
npm.cmd run server
```

Open a second terminal:

```powershell
npm.cmd run dev
```

Visit http://localhost:5173/. Production checks: `npm.cmd test` and `npm.cmd run build`.

## What's new in v4

- A proper Overview with product introduction, source-health indicators, user journeys, market pulse and interactive shortcuts.
- Markets: auto-refresh every 90 seconds, search, sorting, asset selector and CoinGecko historical chart for 24h / 7d / 30d.
- Forex: currency conversion and historical 30-day Frankfurter reference-rate chart.
- Reliability: real local API health and latency checks, separate from fault simulations.
- About: full explanation, methodology, source links and limits.
- Existing risk simulation, QA Markdown draft export, wallet-address format checker, and optional hosted AI with FAQ fallback.

## Sources and operational limitations

CoinGecko public API: https://docs.coingecko.com/ ; price history can be limited or rate-limited without a demo key. Frankfurter reference rates: https://frankfurter.dev/ ; these are daily reference rates, not live forex trading prices. Upstream failures are displayed, not replaced with fake quotes. Refresh is 90 seconds on the market page, with server-side caching; historical charts refresh when a market snapshot is successfully updated. History charts require upstream connectivity. The assistant uses a selected asset’s timestamped CoinGecko quote when market context is relevant; a configured hosted model can provide contextual explanations, but no news verification or guaranteed predictions.

## Optional server configuration

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` and/or `COINGECKO_DEMO_KEY` if needed. The server reads environment variables from its process environment; **Node does not automatically load `.env` with the current command**. For Node 22, run `node --env-file=.env server/index.mjs` after creating the file, or configure environment variables in the shell. Never commit secrets. Without `OPENAI_API_KEY`, a market-aware FAQ fallback is used. Never expose the AI key in frontend code.

## Security and status

The backend binds to `127.0.0.1` for local development and has basic request limits. This is not production hardened. For public deployment, configure secure hosting, restricted CORS, proxy trust policy, logging, monitoring, secret management, and independent security testing. The wallet tool checks only Ethereum-style public-address formatting and cannot prove network compatibility or account ownership. QA reports are drafts and must be independently verified. Track B organizer-required trading functions are not implemented.

## Release 4 enhancements

- Click any market table asset to open its sourced price history. Select 24H, 7D or 30D and change assets.
- Automatic quote refresh at 90-second intervals, manual refresh, source timestamps and explicit provider errors.
- Contextual AI assistant with asset selection, prompt suggestions, a limited conversation history and source-timestamped market data.
- Source-aware FAQ fallback when no hosted AI key is configured.
- No synthetic market chart is displayed as if it were historical data.

## Verification

`npm.cmd test` exercises the risk module. `node --check server/index.mjs` checks backend syntax. Run `npm.cmd run build` and manually test in Chrome/Firefox before deployment. A successful build cannot be claimed until dependencies are installed in your environment.

## Deployment and verification status (2026-10-20)

This archive is a **source-code release**, not a certified production deployment. Automated Node tests and backend syntax checks passed in the packaging environment. The full `npm run build` could not be completed because npm dependency installation timed out; do not deploy until it passes on your machine or CI. Live CoinGecko, Frankfurter and hosted AI requests were not end-to-end verified.

### Single-service hosting

After `npm install && npm run build`, run `HOST=0.0.0.0 PORT=8787 npm run server` on Linux hosting. The Node server now serves the generated `dist/` frontend and `/api/*` from the same origin. Configure your hosting platform's build command as `npm install && npm run build` and start command as `npm run server`; set `HOST=0.0.0.0` and use the provider-supplied `PORT`.

Do not expose `.env`, API keys or wallet secrets. The hosted AI endpoint requires `OPENAI_API_KEY` set **on the server only**. CoinGecko may rate-limit public traffic; a provider key can be supplied as `COINGECKO_DEMO_KEY`. For local development run the backend and Vite separately.

This application provides market data, educational simulations and read-only wallet address format checks. It does **not** execute perpetual orders, transfer cryptocurrency, custody assets, or demonstrate the dreamDEX Track B order requirement.


## Verification additions (2026-10-20)

`npm.cmd run test` runs unit and backend integration tests, including deterministic mock upstreams for cryptocurrency prices, historical charts, forex and hosted AI. `npm.cmd run test:browser` runs optional desktop/mobile smoke checks after installing Playwright. The browser smoke test saves screenshots and checks for uncaught browser exceptions; it is not a complete usability or security audit. See `TEST_RESULTS.md` for which checks were actually executed.

**Live service verification:** Start backend and frontend, inspect `/api/crypto`, `/api/crypto/history?id=bitcoin&days=7`, `/api/forex?base=USD&quote=EUR`, and `/api/health`. External API availability, rate limits, and keys depend on the deployment environment. Configure `OPENAI_API_KEY` on the server only, then test `/api/chat`. Never commit `.env` or private credentials.


## Competition status
See `COMPETITION_CHECKLIST.md` for an honest requirement-by-requirement assessment. This version does not execute dreamDEX testnet perpetual orders.

## Exporting practice activity
Open Paper Portfolio and select **Export CSV**. This exports locally simulated transactions only.
