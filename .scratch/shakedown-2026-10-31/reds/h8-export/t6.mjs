import { open, csv, sel, clickExport, ROWS } from "./lib.mjs";
const h = await open();
const run = async (f) => { await h.page.evaluate(f); await h.page.waitForTimeout(200); return h.page.evaluate(() => window.t.filtered.map((r) => r.id + "=" + r.qty).join(" ")); };
console.log("from 0:", (await run(() => window.t.setFilter("qty", { from: 0 }))).includes("R031=Infinity"));
console.log("from 0 to 1e30:", (await run(() => window.t.setFilter("qty", { from: 0, to: 1e30 }))).includes("R031=Infinity"));
console.log("from 1e21 (R003):", await run(() => window.t.setFilter("qty", { from: 1e21 })));
console.log("to -1:", await run(() => window.t.setFilter("qty", { to: -1 })));
console.log(h.logs);
await h.close();
