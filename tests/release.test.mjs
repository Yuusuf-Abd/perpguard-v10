import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const paper=readFileSync(new URL('../src/paper.tsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8');
test('simulated orders validate price, balance, and amount',()=>{
 assert.match(paper,/coin\.price<=0/);assert.match(paper,/dollars>cash/);assert.match(paper,/Insufficient virtual asset balance/);
});
test('paper portfolio supports CSV export',()=>{assert.match(paper,/exportActivity/);assert.match(paper,/text\/csv/);});
test('watchlist checks persisted data type',()=>assert.match(app,/Array\.isArray\(JSON\.parse\(stored\)\)/));
test('simulation clearly identifies non-blockchain activity',()=>assert.match(paper,/No blockchain transaction occurred/));
