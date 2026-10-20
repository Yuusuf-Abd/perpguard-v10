import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/order-preview.ts',import.meta.url),'utf8');
test('order preview is a deterministic calculation without transaction calls',()=>{assert.match(source,/export function previewOrder/);assert.doesNotMatch(source,/eth_sendTransaction|sendTransaction|signTransaction|fetch\(/)});
test('order preview validates leverage and prices',()=>{assert.match(source,/x\.leverage>25/);assert.match(source,/x\.referencePrice<=0/);assert.match(source,/x\.collateral<=0/)});
test('order workbench visibly marks non-executable previews',()=>{const ui=readFileSync(new URL('../src/order-workbench.tsx',import.meta.url),'utf8');assert.match(ui,/does not sign or submit trades/);assert.match(ui,/non-executable-order-preview/)});
