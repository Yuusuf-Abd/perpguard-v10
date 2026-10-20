# Live verification (not mocked)

Run `npm.cmd install`, `npm.cmd run build`, then `npm.cmd run server` in one terminal. In another terminal run `npm.cmd run test:live` to exercise the real CoinGecko and Frankfurter services. These checks require internet access. They fail with a nonzero exit code if providers are unavailable or data is malformed.

To test real hosted AI, set `OPENAI_API_KEY` in the **server environment**, restart the server, and run `npm.cmd run test:live`. A FAQ fallback is not counted as a passing hosted AI test. Never commit the key. Provider charges may apply.

For browser verification, run `npm.cmd run dev` and `npm.cmd run test:browser` after installing Playwright (`npm.cmd install -D playwright` and `npx.cmd playwright install chromium`). These browser checks test two viewport sizes and uncaught errors, but do not constitute comprehensive accessibility or interaction testing.

**Limitations:** An offline environment cannot validate external APIs or hosted AI. Tests passing against local mocks are useful but do not establish provider availability. A live market data source may rate-limit or fail at any time. The product does not execute cryptocurrency transfers or leveraged trades.
