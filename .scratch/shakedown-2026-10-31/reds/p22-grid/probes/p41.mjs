import { open } from "./lib.mjs";
const p = await open("s=narrow", { width: 1100, height: 600 });
await p.screenshot({ path: "shots/narrow-group.png", clip: { x: 0, y: 0, width: 500, height: 200 } });
console.log(await p.evaluate(() => [...document.querySelectorAll("th[scope=colgroup]")].map(t => [t.textContent, Math.round(t.getBoundingClientRect().width), t.scrollWidth, t.clientWidth, t.title || t.querySelector("[title]")?.getAttribute("title")])));
await p.evaluate(() => window.__t.autoSizeColumns()); await p.waitForTimeout(300);
console.log("after fit-all", JSON.stringify(await p.evaluate(() => window.__t.widths)), await p.evaluate(() => [...document.querySelectorAll("th[scope=colgroup]")].map(t => [t.textContent, Math.round(t.getBoundingClientRect().width), t.scrollWidth > t.clientWidth])));
console.log(p.errs); await p.b.close();
