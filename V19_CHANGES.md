# PerpGuard v19 — Order Workbench

Added a validated, interactive long/short market/limit order preview to the Protocol Inspector. Calculates notional exposure, hypothetical slippage-adjusted price, quantity, assumed fee, and +/-5% price-movement outcomes. Inputs are editable; previews can be copied as explicitly non-executable JSON. Added three automated tests.

This is NOT real order submission, a verified fill, or an official SDK integration. Prices and fee assumptions are user-provided, not live dreamDEX executable quotes. Never use these estimates as trade confirmations.
