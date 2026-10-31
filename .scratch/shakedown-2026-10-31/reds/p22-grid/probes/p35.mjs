import { open } from "./lib.mjs";
let p = await open("s=main", { width: 1100, height: 900 });
await p.evaluate(() => { window.__vc = 0; const o = window.__t; });
// count onViewChange via setter wrapper
await p.evaluate(() => { let n = 0; Object.defineProperty(window, "__view", { set(v) { n++; window.__vn = n; window.__vv = v; }, get() { return window.__vv; } }); });
const setH = (h) => p.evaluate((h) => { document.getElementById("frame").style.height = h + "px"; }, h);
await setH(400); await p.waitForTimeout(900); await setH(520); await p.waitForTimeout(900);
console.log("view changes on resize", await p.evaluate(() => window.__vn ?? 0));
await p.evaluate(() => window.__t.setDensity?.("compact")); 
await p.getByPlaceholder("Search").fill("Item 1"); await p.waitForTimeout(500);
console.log("view changes after search", await p.evaluate(() => window.__vn), JSON.stringify(await p.evaluate(() => window.__vv)));
await p.getByRole("button", { name: "Reset" }).click(); await p.waitForTimeout(300);
console.log("after reset", await p.evaluate(() => [window.__vn, JSON.stringify(window.__vv)]), await p.st());
await p.b.close();
// server: debounce + selection
p = await open("s=server&h=500", { width: 1100, height: 900 });
await p.waitForTimeout(500);
const n0 = await p.evaluate(() => window.__reqs.length);
await p.getByPlaceholder("Search").pressSequentially("Item 1", { delay: 60 }); await p.waitForTimeout(900);
console.log("typed 6 chars -> requests", (await p.evaluate(() => window.__reqs.length)) - n0);
await p.locator("tbody input[type=checkbox]").nth(0).click(); await p.locator("thead input[type=checkbox]").click(); await p.waitForTimeout(200);
console.log("select page", await p.evaluate(() => [window.__t.selection.count, window.__t.selection.allMatching]), (await p.locator("[class*=toolbar]").first().innerText()).replace(/\n/g, " | "));
await p.screenshot({ path: "shots/server-sel.png" });
await p.b.close();
