# PerpGuard v9 test results — 2026-10-20

- `node --check server/index.mjs`: PASS
- `node --test tests/*.test.mjs`: PASS, 10/10 tests
- Integration test uses deterministic mock upstream services, not production market endpoints.
- Full TypeScript/Vite build: NOT VERIFIED (dependencies unavailable in this environment).
- Live external APIs, browser rendering, hosted AI and deployment: NOT VERIFIED.
- On-chain perpetual trading: NOT IMPLEMENTED.
