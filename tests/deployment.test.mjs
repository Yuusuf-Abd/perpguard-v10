import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Render service serves the Node backend and checks health',()=>{const text=readFileSync('render.yaml','utf8');assert.match(text,/type: web/);assert.match(text,/npm run server/);assert.match(text,/healthCheckPath: \/api\/health/);assert.match(text,/0\.0\.0\.0/)});
test('Receipt history is explicitly browser-local and exportable',()=>{const text=readFileSync('src/main.tsx','utf8');assert.match(text,/perpguard\.receiptEvidence\.v1/);assert.match(text,/Export CSV evidence/);assert.match(text,/not proof of a perpetual order or fill/)});
