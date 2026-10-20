import { spawnSync } from 'node:child_process';
const tasks = [
  ['Backend syntax', process.execPath, ['--check','server/index.mjs']],
  ['Automated tests', process.execPath, ['--test','tests/risk.test.mjs','tests/server.test.mjs']],
  ['TypeScript and Vite production build', process.platform==='win32'?'npm.cmd':'npm', ['run','build']]
];
let failures=0;
for(const [name,cmd,args] of tasks){
  console.log(`\n=== ${name} ===`);
  const result=spawnSync(cmd,args,{stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0){failures++;console.error(`FAILED: ${name}. ${name.includes('build')?'Run npm install first and retry.':''}`)}
  else console.log(`PASSED: ${name}`);
}
process.exitCode=failures?1:0;
