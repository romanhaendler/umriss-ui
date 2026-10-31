import { openRec } from "./lib.mjs";
const s = await openRec("fit", { q: "&h=360px", h: 700 }); const p = s.page;
const info = (l) => p.evaluate((l) => { const g = document.querySelector("[role=grid]"); const f = document.querySelector("main > div"); const sel = document.querySelector("nav select"); return `${l}: frame=${f.getBoundingClientRect().height} grid=${g.getBoundingClientRect().height} rows=${g.querySelectorAll("tbody tr").length} select=${sel.value}/${[...sel.options].map(o=>o.value+":"+o.text)} nav="${document.querySelector("nav").innerText.split("\n")[0]}"`; }, l);
console.log(await info("load"));
for (const h of ["220px", "620px", "120px", "360px"]) { await p.evaluate((h) => { document.querySelector("main > div").style.height = h; }, h); await p.waitForTimeout(700); console.log(await info(h)); }
await p.locator("nav select").selectOption("5"); await p.waitForTimeout(300); console.log(await info("select 5"));
await p.locator("nav select").selectOption({ label: "Fit" }); await p.waitForTimeout(500); console.log(await info("select Fit"));
await p.evaluate(() => { document.querySelector("main > div").style.height = "200px"; }); await p.waitForTimeout(700); console.log(await info("200px after Fit"));
await s.close();
