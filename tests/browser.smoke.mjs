// Optional browser smoke tests. Requires: npm install -D playwright && npx playwright install chromium
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const url=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const browser=await chromium.launch({headless:true});
try {
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.locator('body').waitFor();
  assert.match(await page.locator('body').innerText(),/PerpGuard/i);
  await page.screenshot({path:`browser-${viewport.width}.png`,fullPage:true});
  assert.deepEqual(errors,[],'no uncaught browser errors');
  await page.close();
 }
 console.log('Desktop and mobile browser smoke checks passed.');
}finally{await browser.close()}
