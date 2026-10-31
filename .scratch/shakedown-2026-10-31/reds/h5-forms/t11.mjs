import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",timezoneId:"Europe/Berlin"})).newPage();
await pg.goto("http://localhost:4330/?lang=en");
const dt=pg.locator("button[name=dt]");
for (const start of ["08:00:00Z","08:15:00Z"]) for (const seq of ["30","45","12:30"]) {
  await pg.evaluate(s=>window.set.dt(new Date("2025-06-10T"+s)),start);
  await dt.click(); await pg.waitForTimeout(200);
  const ins=pg.locator("[role=dialog] input");
  await ins.nth(1).click(); await pg.keyboard.press("Meta+A"); await pg.keyboard.insertText(seq);
  console.log("start",start,"paste",seq,"-> m",await ins.nth(1).inputValue(),"h",await ins.nth(0).inputValue());
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(100);
}
await b.close();
