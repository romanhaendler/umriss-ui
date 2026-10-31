import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",timezoneId:"Europe/Berlin"})).newPage();
await pg.goto("http://localhost:4330/?lang=en");
const dt=pg.locator("button[name=dt]");
for (const [iso,h,m] of [["2025-10-26T04:00:00Z",2,30],["2025-10-26T04:00:00Z",3,30],["2025-10-27T04:00:00Z",2,30],["2025-10-26T04:00:00Z",1,30]]) {
  await pg.evaluate(i=>window.set.dt(new Date(i)),iso); await pg.waitForTimeout(100);
  await pg.evaluate(()=>window.log.length=0);
  await dt.click(); await pg.waitForTimeout(200);
  const ins=pg.locator("[role=dialog] input");
  await ins.nth(0).fill(String(h)); await ins.nth(1).fill(String(m));
  console.log("fields",await ins.nth(0).inputValue(),await ins.nth(1).inputValue());
  await pg.getByRole("button",{name:"Apply"}).click(); await pg.waitForTimeout(150);
  console.log(iso,h,m,"->",await dt.innerText(),JSON.stringify(await pg.evaluate(()=>window.log)));
}
await b.close();
