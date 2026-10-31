import { open } from "./lib.mjs";
const p = await open("s=auto", { width: 1100, height: 600 });
console.log(await p.evaluate(() => document.querySelector("tbody tr").cells[1].outerHTML.slice(0, 300)));
console.log(await p.evaluate(() => { const c = document.querySelector("tbody tr").cells[1]; const v = c.querySelector("[class*=_value_]"); return [v?.style.cssText, getComputedStyle(v).maxWidth, getComputedStyle(v).width]; }));
await p.b.close();
