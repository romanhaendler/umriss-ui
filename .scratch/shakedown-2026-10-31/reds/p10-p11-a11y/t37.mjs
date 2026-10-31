import { openRec } from "./lib.mjs";
const pre = process.argv[2];
const s = await openRec("fit", { q: "&h=360px", h: 700 }); const p = s.page;
const info = (l) => p.evaluate((l) => { const g = document.querySelector("[role=grid]"); const f = document.querySelector("main > div"); return `${l}: frame=${f.getBoundingClientRect().height} grid=${Math.round(g.getBoundingClientRect().height)} rows=${g.querySelectorAll("tbody tr").length} nav="${document.querySelector("nav").innerText.split("\n")[0]}" active=${document.activeElement.tagName}`; }, l);
if (pre === "focus") await p.locator("tbody th").first().focus();
if (pre === "pagedown") { await p.locator("tbody th").first().focus(); await p.keyboard.press("PageDown"); await p.waitForTimeout(300); }
if (pre === "arrow") { await p.locator("tbody th").first().focus(); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(300); }
console.log(await info("before"));
await p.evaluate(() => { document.querySelector("main > div").style.height = "220px"; }); await p.waitForTimeout(800); console.log(await info("220px"));
await s.close();
