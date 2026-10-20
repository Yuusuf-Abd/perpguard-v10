# PerpGuard v15 — market intelligence release

- Replaced the basic SVG history line with a responsive, interactive Recharts area chart, labeled axes, observed high/low and hover values.
- Chart values are sourced from the existing CoinGecko and Frankfurter backend routes. No artificial candles or synthetic price series are presented as real data.
- Existing automatic market refresh remains 90 seconds and pauses when the browser tab is hidden; history refreshes after a successful market snapshot.
- Corrected the unused legacy `market-chart.tsx` demo so it does not fabricate a price series.
- Updated hosted AI instructions to focus on sourced market interpretation, explain uncertainty, and avoid executing leveraged trades or generating order instructions.
- No execution of leveraged orders, no verified fills, and no claim of full competition eligibility.
- CoinGecko is a periodically refreshed snapshot, **not tick-by-tick streaming**. Frankfurter is daily reference data, **not live forex trading quotes**.
