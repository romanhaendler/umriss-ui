import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
await cell(2, 3).click(); await p.keyboard.type("7");
await p.keyboard.press("Tab"); await p.waitForTimeout(300);
console.log(p.errs);
console.log(await p.evaluate(() => document.getElementById("root").innerHTML.slice(0, 300)));
await p.screenshot({ path: "shots/tab-crash.png" });
await p.b.close();
