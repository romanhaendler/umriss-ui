import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; p.on("console", m => { if (["error","warning"].includes(m.type())) errs.push(m.type()+": "+m.text()); }); p.on("pageerror", e => errs.push("PAGEERR "+e.message));
await p.goto("http://localhost:4370/?s=main"); await p.waitForSelector("[role=grid], table");
await p.screenshot({ path: "shots/main.png" });
console.log("fitted pageSize", await p.evaluate(() => [window.__t.pageSize, window.__t.framed, window.__t.pageCount]));
console.log("headers", await p.$$eval("th", e => e.map(x => x.textContent + "|" + x.getAttribute("scope")+"|"+Math.round(x.getBoundingClientRect().width))));
console.log(errs);
await b.close();
