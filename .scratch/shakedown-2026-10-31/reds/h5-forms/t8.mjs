import {chromium} from "playwright";
const b=await chromium.launch();
const ctxTz=process.argv[2]||"Europe/Berlin", fmtTz=process.argv[3]||"";
const pg=await (await b.newContext({locale:"en",timezoneId:ctxTz,viewport:{width:900,height:1400}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/?lang=en"+(fmtTz?"&tz="+fmtTz:""));
const lg=()=>pg.evaluate(()=>JSON.stringify(window.log.filter(x=>x[0]=="dt").slice(-3)));
const dt=pg.locator("button[name=dt]");
async function t(iso,hour,min){
  await pg.evaluate(i=>window.set.dt(new Date(i)),iso); await pg.waitForTimeout(100);
  const before=await dt.innerText();
  await pg.evaluate(()=>window.log.length=0);
  await dt.click(); await pg.waitForTimeout(200);
  const hh=pg.locator("[role=dialog] input").nth(0), mm=pg.locator("[role=dialog] input").nth(1);
  await hh.fill(String(hour)); await mm.fill(String(min)); await mm.press("Tab");
  await pg.getByRole("button",{name:"Apply"}).click(); await pg.waitForTimeout(150);
  console.log(iso,"shown",before,"-> set",hour+":"+min,"| shows",await dt.innerText(),"| emitted",await lg());
}
await t("2025-03-29T23:30:00Z",2,30);  // Mar 30 00:30 Berlin(CET)=23:30Z of 29th... Berlin is 00:30 on 30th
await t("2025-03-30T00:30:00Z",2,30);
await t("2025-10-25T23:30:00Z",2,30);
await t("2025-10-26T04:00:00Z",2,30);
await t("2024-02-28T10:00:00Z",11,0);
console.log(errs); await b.close();
