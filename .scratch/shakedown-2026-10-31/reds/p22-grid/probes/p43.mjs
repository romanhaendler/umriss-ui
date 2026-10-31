import { open } from "./lib.mjs";
const p = await open("s=bools", { width: 1100, height: 700 });
await p.screenshot({ path: "shots/bools.png" });
console.log((await p.locator("tbody tr").first().innerText()).replace(/\n/g, " | "));
console.log("row height", await p.evaluate(() => Math.round(document.querySelector("tbody tr").getBoundingClientRect().height)), "text cell", await p.evaluate(() => { const c = document.querySelector("tbody tr").cells[3]; return [c.scrollWidth, c.clientWidth, getComputedStyle(c.firstElementChild).textOverflow, getComputedStyle(c.firstElementChild).whiteSpace]; }));
console.log(p.errs.slice(0,4)); await p.b.close();
