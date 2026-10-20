# Release QA checklist

- [ ] Run `npm.cmd install`, `npm.cmd test`, `npm.cmd run build`.
- [ ] Run backend and frontend in separate terminals.
- [ ] Check health at `http://127.0.0.1:8787/api/health`.
- [ ] Markets: verify source timestamp or truthful API error.
- [ ] Forex: verify date and source; test invalid code errors.
- [ ] Risk Lab: test 0, 250, negative collateral; 1×, 3×, 26× leverage; ±100% moves.
- [ ] Reliability: toggle outage, stale, reset.
- [ ] Wallet Watch: reject invalid input; accept 0x + 40 hex characters without asserting safety.
- [ ] QA Center: export Markdown and inspect contents.
- [ ] Help & Support: ask about documentation; check FAQ fallback and AI mode labeling.
- [ ] Check 375px, 768px, desktop, keyboard navigation.
- [ ] Confirm no real transactions, private keys, or invented Track A findings.
- [ ] Confirm API secrets are not present in bundled `dist/` files.

A build is not a substitute for these checks.
