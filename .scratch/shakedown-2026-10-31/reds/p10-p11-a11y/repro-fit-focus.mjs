// Fitted page (Pagination, no pageSize) in a frame; with focus inside the grid the frame shrinks and the page does not refit.
import { openRec } from "./lib.mjs";
const s = await openRec("fit", { q: "&h=360px", h: 700 }); const p = s.page;
const m = () => p.evaluate(() => { const g = document.querySelector("[role=grid]"); const f = document.querySelector("main > div"); const nav = document.querySelector("nav"); return `frame=${f.getBoundingClientRect().height} grid=${Math.round(g.getBoundingClientRect().height)} navBottom=${Math.round(nav.getBoundingClientRect().bottom - f.getBoundingClientRect().top)} rows=${g.querySelectorAll("tbody tr").length}`; });
await p.locator("tbody th").first().focus();
await p.evaluate(() => { document.querySelector("main > div").style.height = "220px"; }); await p.waitForTimeout(800);
console.log("focus inside, frame 220:", await m()); await p.screenshot({ path: "shots/fit-focus-overflow.png" });
await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(800);
console.log("after blur:", await m());
await s.close();
