import { open } from "./lib.mjs";
const p = await open("s=server&h=420", { width: 1100, height: 900 });
const reqs = () => p.evaluate(() => window.__reqs.map(r => `${r.page}/${r.pageSize}/${JSON.stringify(r.sort)}/${r.search}`));
await p.waitForTimeout(800);
console.log("mount reqs", await reqs(), await p.st(), (await p.names()).length);
await p.screenshot({ path: "shots/server.png" });
const setH = (h) => p.evaluate((h) => { document.getElementById("frame").style.height = h + "px"; }, h);
await setH(600); await p.waitForTimeout(900);
console.log("after resize", await reqs(), await p.st(), (await p.names()).length);
// rapid resize jitter
for (let h of [560, 540, 620, 580, 640]) { await setH(h); await p.waitForTimeout(80); }
await p.waitForTimeout(900);
console.log("jitter", (await reqs()).length, (await reqs()).slice(-2), await p.st(), (await p.names()).length);
// goto last page, then resize
await p.getByRole("button", { name: "Last page" }).click(); await p.waitForTimeout(600);
console.log("last", await reqs().then(r=>r.slice(-1)), await p.st(), (await p.names()).slice(0,2));
await setH(300); await p.waitForTimeout(900);
console.log("resize at last", (await reqs()).slice(-2), await p.st(), (await p.names()).slice(0,2));
// slow server + stale: set delay 800, click next twice quickly
await p.evaluate(()=>{window.__delay=800;});
await p.getByRole("button", { name: "First page" }).click();
await p.waitForTimeout(100);
await p.screenshot({ path: "shots/server-loading.png" });
await p.getByRole("button", { name: "Next page" }).click({ force: true });
await p.waitForTimeout(1600);
console.log("after quick", (await reqs()).slice(-3), await p.st(), (await p.names()).slice(0,2), await p.locator("nav").innerText());
// select on page, go to next page, selection
await p.evaluate(()=>{window.__delay=50;});
await p.locator("tbody input[type=checkbox]").first().click();
await p.getByRole("button", { name: "Next page" }).click(); await p.waitForTimeout(500);
console.log("sel across", await p.st(), await p.locator("[role=status]").allTextContents());
await p.getByPlaceholder("Search").fill("Item 2"); await p.waitForTimeout(900);
console.log("search", (await reqs()).slice(-1), await p.st());
console.log(p.errs);
await p.b.close();
