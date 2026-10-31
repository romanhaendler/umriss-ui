import {chromium} from "playwright";
const b=await chromium.launch();
const ctxTz=process.argv[2]||"Europe/Berlin", fmtTz=process.argv[3]||"";
const pg=await (await b.newContext({locale:"en",timezoneId:ctxTz,viewport:{width:900,height:1400}})).newPage();
const errs=[]; pg.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())}); pg.on("pageerror",e=>errs.push("PE "+e.message));
await pg.goto("http://localhost:4330/?lang=en"+(fmtTz?"&tz="+fmtTz:""));
const d=pg.locator("button[name=d]");
const lg=k=>pg.evaluate(k=>JSON.stringify(window.log.filter(x=>x[0]==k).slice(-3)),k);
// Feb 29 -> change year
await pg.evaluate(()=>window.set.d(new Date(2024,1,29)));
await d.click(); await pg.waitForTimeout(200);
await pg.locator("[role=dialog] select").nth(1).selectOption("2023");
await pg.waitForTimeout(100);
console.log("feb29 year->2023: field",await d.innerText(),"log",await lg("d"));
await pg.keyboard.press("Escape");
// DST day click
await pg.evaluate(()=>window.set.d(new Date(2025,2,15)));
await pg.evaluate(()=>window.log.length=0);
await d.click(); await pg.waitForTimeout(200);
await pg.getByRole("gridcell",{name:/30/}).first().click().catch(async()=>{ await pg.locator("[role=dialog] button",{hasText:/^30$/}).first().click()});
await pg.waitForTimeout(100); console.log("DST Mar30 click:",await d.innerText(),await lg("d"));
await pg.evaluate(()=>window.set.d(new Date(2025,9,15)));
await d.click(); await pg.waitForTimeout(200);
await pg.locator("[role=dialog] button",{hasText:/^26$/}).first().click();
console.log("DST Oct26 click:",await d.innerText(),await lg("d"));
// Range end before start
const r=pg.locator("button[name=r]");
await pg.evaluate(()=>window.log.length=0);
await r.click(); await pg.waitForTimeout(200);
await pg.locator("[role=dialog] button",{hasText:/^20$/}).first().click();
await pg.locator("[role=dialog] button",{hasText:/^10$/}).first().click();
await pg.waitForTimeout(100); console.log("range 20 then 10:",await r.innerText(),await lg("r"));
console.log(errs); await b.close();
