import { open } from "./lib.mjs";
const p = await open("s=rows", { width: 1100, height: 900 });
await p.screenshot({ path: "shots/rows.png" });
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
console.log("tbody rows", await p.locator("tbody tr").count(), (await p.locator("tbody tr").nth(0).innerText()).replace(/\n/g, " | "));
console.log("buttons", await p.$$eval("button", e => e.map(b => b.getAttribute("aria-label") || b.textContent.trim()).filter(Boolean).slice(0, 25)));
await p.b.close();
