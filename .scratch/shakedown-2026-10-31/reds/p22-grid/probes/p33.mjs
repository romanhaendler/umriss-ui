import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const w = (ms=300) => p.waitForTimeout(ms);
await p.evaluate(() => window.__t.setGrouping(["dept", "when"])); await w();
const info = async (l) => console.log(l, await p.st(), (await p.locator("nav").first().innerText()).replace(/\n/g, " | ").slice(0, 70), "rows:", await p.locator("tbody tr").count(), "headers:", await p.locator("tbody tr[data-group], tbody tr[class*=group]").count());
await info("grouped 2 levels");
await p.screenshot({ path: "shots/grouped.png" });
await p.getByRole("button", { name: "Next page" }).click(); await w(); await info("p2");
await p.getByRole("button", { name: "Last page" }).click(); await w(); await info("last");
const first = (await p.locator("tbody tr").first().innerText()).replace(/\n/g, " | "); console.log("first row on last page:", first);
// search within groups
await p.getByPlaceholder("Search").fill("Item 17"); await w(600); await info("search");
// selecting a group header's checkbox
await p.getByPlaceholder("Search").fill(""); await w(600);
const gcb = p.locator("tbody tr").first().locator("input[type=checkbox]"); console.log("group checkbox", await gcb.count());
if (await gcb.count()) { await gcb.click(); await w(); console.log("sel after group click", await p.evaluate(()=>window.__t.selection.count)); }
// aria
console.log(await p.evaluate(()=>[...document.querySelectorAll("tbody tr")].slice(0,3).map(r=>[r.getAttribute("aria-level"),r.getAttribute("aria-expanded"),r.getAttribute("aria-rowindex"),r.getAttribute("aria-posinset"),r.getAttribute("aria-setsize")].join("/"))));
console.log(p.errs); await p.b.close();
