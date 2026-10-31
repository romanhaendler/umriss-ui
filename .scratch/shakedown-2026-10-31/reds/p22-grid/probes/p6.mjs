import { open } from "./lib.mjs";
const p = await open("s=auto", { width: 1100, height: 900 });
console.log(await p.evaluate(() => document.querySelectorAll("thead th")[1].outerHTML));
await p.b.close();
