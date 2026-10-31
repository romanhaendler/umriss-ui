import {chromium} from "playwright";
const b=await chromium.launch();
const pg=await (await b.newContext({locale:"en",timezoneId:"Europe/Berlin"})).newPage();
await pg.goto("http://localhost:4330/?lang=en");
const dt=pg.locator("button[name=dt]");
await pg.evaluate(()=>window.set.dt(new Date("2025-06-10T08:00:00Z")));
for (const seq of ["30","3","45","7","0730","5","99","2"]) {
  await dt.click(); await pg.waitForTimeout(200);
  const ins=pg.locator("[role=dialog] input");
  await ins.nth(1).click(); await pg.keyboard.press("Meta+A"); await pg.keyboard.type(seq);
  const mid=await ins.nth(1).inputValue(); const hmid=await ins.nth(0).inputValue();
  await pg.keyboard.press("Tab"); 
  console.log("typed in minutes",JSON.stringify(seq),"-> h",hmid,"m",mid,"after tab: h",await ins.nth(0).inputValue(),"m",await ins.nth(1).inputValue(),"focus",await pg.evaluate(()=>document.activeElement.tagName+"|"+(document.activeElement.getAttribute("aria-label")||document.activeElement.textContent)));
  await pg.getByRole("button",{name:"Apply"}).click(); await pg.waitForTimeout(100);
  console.log("   shows",await dt.innerText());
}
await b.close();
