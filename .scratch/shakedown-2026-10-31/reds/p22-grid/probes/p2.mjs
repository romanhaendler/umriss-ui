import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; p.on("console", m => { if (["error","warning"].includes(m.type())) errs.push(m.type()+": "+m.text()); }); p.on("pageerror", e => errs.push("PAGEERR "+e.message));
await p.goto("http://localhost:4370/?s=main"); await p.waitForSelector("table, [role=grid]");
console.log(await p.$$eval("th button", e => e.map(x => x.getAttribute("aria-label")+"|"+x.textContent)));
await p.locator("th", { hasText: "Name" }).locator("button").nth(1).click();
await p.screenshot({ path: "shots/textfilter-open.png" });
console.log(errs);
await b.close();
