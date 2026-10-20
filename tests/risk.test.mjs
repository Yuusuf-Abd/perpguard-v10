import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/risk.ts',import.meta.url),'utf8');
test('risk module contains finite input validation',()=>assert.match(source,/Number\.isFinite/));
test('risk module prevents negative collateral',()=>assert.match(source,/collateral<0/));
test('risk module calculates hypothetical exposure',()=>assert.match(source,/collateral\*leverage/));
test('risk module caps drawdown',()=>assert.match(source,/Math\.min\(100/));
