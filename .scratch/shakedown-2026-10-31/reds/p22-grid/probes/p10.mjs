import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
console.log(await p.evaluate(() => { const t = document.querySelector("table,[role=grid]"); return [t.tagName, t.getAttribute("role"), t.getAttribute("aria-colcount"), t.getAttribute("aria-rowcount"), t.getAttribute("class")?.slice(0,30)]; }));
console.log(await p.evaluate(() => [...document.querySelectorAll("thead tr")].map(r => [r.getAttribute("role"), r.getAttribute("aria-rowindex"), [...r.children].map(c => c.tagName + "/" + c.getAttribute("role") + "/" + c.getAttribute("aria-colindex") + "/" + c.getAttribute("colspan") + "/" + c.getAttribute("aria-colspan") + "/" + (c.getAttribute("style")||"").slice(0,60)+"/"+c.textContent.trim().slice(0,6)).join("  ")])));
await p.b.close();
