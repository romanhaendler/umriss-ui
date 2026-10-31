import { open, focused } from "./lib.mjs";
const s = await open("core");
const hint = await s.page.evaluate(() => { const e = document.querySelector('[id$="-message"]'); const c = getComputedStyle(e); return e.outerHTML.slice(0,200)+" "+c.color+" "+c.opacity; });
console.log(hint);
await s.close();
// grid snapshot
const g = await open("grid");
const snap = await g.page.locator("table, [role=grid]").first().ariaSnapshot();
console.log(snap.slice(0, 3500));
await g.close();
