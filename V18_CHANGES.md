# PerpGuard v18 — Protocol Inspector

New dedicated **read-only Somnia Hideki protocol inspection**:
- `GET /api/protocol/status`: verifies RPC-reported chain ID 50383 and block height.
- `GET /api/protocol/transaction?hash=0x...`: retrieves a genuine existing receipt, transaction metadata, and raw emitted event topics; exports a JSON evidence record.
- `GET /api/protocol/contract?address=0x...`: checks on-chain bytecode existence without misrepresenting official contract provenance.
- New **Protocol Inspector** navigation page and six deterministic unit tests.
- Strict identifier validation and bounded log outputs.

## Honest limitations

No signed order submission, leverage execution, authenticated SDK integration, ABI-based fill decoding, or independently established order fill. Raw log topics **must not** be represented as proven order fills. RPC results depend on the configured upstream endpoint and availability. The original market dashboard remains separate from Hideki protocol data.
