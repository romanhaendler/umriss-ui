import { open } from "./lib.mjs";
const p = await open("s=auto", { width: 1100, height: 900 });
const w = () => p.evaluate(() => JSON.stringify([...document.querySelectorAll("thead th")].map(x => x.textContent.trim().slice(0,8)+":"+Math.round(x.getBoundingClientRect().width))));
console.log("start", await w());
await p.evaluate(()=>window.__t.autoSizeColumns()); await p.waitForTimeout(300);
console.log("autoSize", await w(), JSON.stringify(await p.evaluate(()=>window.__t.widths)));
await p.screenshot({ path: "shots/auto.png" });
await p.evaluate(()=>window.__t.setWidth("dept", undefined)); await p.waitForTimeout(200); console.log("reset dept", await w());
console.log(p.errs); await p.b.close();
